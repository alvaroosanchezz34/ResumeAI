const express = require('express');
const router = express.Router();
const User = require('../auth/user.model');
const Generation = require('../generation/generation.model');
const Usage = require('../usage/usage.model');
const authMiddleware = require('../../middlewares/auth.middleware');
const adminMiddleware = require('../../middlewares/admin.middleware');

// Todos los endpoints requieren auth + rol admin
router.use(authMiddleware, adminMiddleware);

// ── GET /admin/stats ─────────────────────────────────────────────────────────
// Métricas globales de la plataforma
router.get('/stats', async (req, res, next) => {
    try {
        const today = new Date().toISOString().split('T')[0];

        const [
            totalUsers,
            totalGenerations,
            newUsersToday,
            generationsToday,
            planCounts
        ] = await Promise.all([
            User.countDocuments(),
            Generation.countDocuments(),
            User.countDocuments({
                createdAt: { $gte: new Date(today) }
            }),
            Generation.countDocuments({
                createdAt: { $gte: new Date(today) }
            }),
            User.aggregate([
                { $group: { _id: '$plan', count: { $sum: 1 } } }
            ])
        ]);

        const plans = { free: 0, premium: 0, pro: 0, admin: 0, custom: 0 };
        planCounts.forEach(({ _id, count }) => {
            if (_id in plans) plans[_id] = count;
        });

        res.json({
            success: true,
            data: {
                totalUsers,
                totalGenerations,
                newUsersToday,
                generationsToday,
                plans
            }
        });
    } catch (err) {
        next(err);
    }
});

// ── GET /admin/users ──────────────────────────────────────────────────────────
// Lista de usuarios con paginación y búsqueda
router.get('/users', async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const search = req.query.search || '';
        const skip = (page - 1) * limit;

        const query = search
            ? { email: { $regex: search, $options: 'i' } }
            : {};

        const [users, total] = await Promise.all([
            User.find(query)
                .select('-passwordHash')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            User.countDocuments(query)
        ]);

        // Añadir conteo de generaciones por usuario
        const userIds = users.map(u => u._id);
        const genCounts = await Generation.aggregate([
            { $match: { user: { $in: userIds } } },
            { $group: { _id: '$user', count: { $sum: 1 } } }
        ]);
        const genMap = {};
        genCounts.forEach(({ _id, count }) => { genMap[_id.toString()] = count; });

        // Uso de hoy
        const today = new Date().toISOString().split('T')[0];
        const usageToday = await Usage.find({ userId: { $in: userIds }, date: today });
        const usageMap = {};
        usageToday.forEach(u => { usageMap[u.userId.toString()] = u.requestsUsed; });

        const data = users.map(u => ({
            _id: u._id,
            email: u.email,
            role: u.role,
            plan: u.plan,
            status: u.status,
            createdAt: u.createdAt,
            lastLogin: u.lastLogin || null,
            generations: genMap[u._id.toString()] || 0,
            usedToday: usageMap[u._id.toString()] || 0,
            stripeCustomerId: u.stripeCustomerId || null
        }));

        res.json({
            success: true,
            data,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page
        });
    } catch (err) {
        next(err);
    }
});

// ── PATCH /admin/users/:id/plan ───────────────────────────────────────────────
// Cambiar el plan de un usuario
router.patch('/users/:id/plan', async (req, res, next) => {
    try {
        const { plan } = req.body;
        const validPlans = ['free', 'premium', 'pro', 'custom', 'admin'];

        if (!validPlans.includes(plan)) {
            return res.status(400).json({ message: 'Invalid plan' });
        }

        // No permitir modificarse a uno mismo
        if (req.params.id === req.user.userId) {
            return res.status(400).json({ message: 'Cannot modify your own plan' });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { plan },
            { new: true }
        ).select('-passwordHash');

        if (!user) return res.status(404).json({ message: 'User not found' });

        res.json({ success: true, data: user });
    } catch (err) {
        next(err);
    }
});

// ── PATCH /admin/users/:id/status ─────────────────────────────────────────────
// Banear o desbanear un usuario
router.patch('/users/:id/status', async (req, res, next) => {
    try {
        const { status } = req.body;
        const validStatuses = ['active', 'banned'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        if (req.params.id === req.user.userId) {
            return res.status(400).json({ message: 'Cannot modify your own status' });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        ).select('-passwordHash');

        if (!user) return res.status(404).json({ message: 'User not found' });

        res.json({ success: true, data: user });
    } catch (err) {
        next(err);
    }
});

// ── DELETE /admin/users/:id ───────────────────────────────────────────────────
// Eliminar usuario y todos sus datos
router.delete('/users/:id', async (req, res, next) => {
    try {
        if (req.params.id === req.user.userId) {
            return res.status(400).json({ message: 'Cannot delete your own account' });
        }

        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Borrar todos sus datos en paralelo
        await Promise.all([
            Generation.deleteMany({ user: req.params.id }),
            Usage.deleteMany({ userId: req.params.id }),
            User.findByIdAndDelete(req.params.id)
        ]);

        res.json({ success: true, message: 'User and all data deleted' });
    } catch (err) {
        next(err);
    }
});

module.exports = router;