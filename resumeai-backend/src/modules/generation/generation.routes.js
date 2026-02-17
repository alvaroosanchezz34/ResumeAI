const express = require('express');
const router = express.Router();
const Generation = require('./generation.model');
const authMiddleware = require('../../middlewares/auth.middleware');
const { getStats } = require('./generation.stats');
const { randomUUID } = require('crypto');

router.get('/stats', authMiddleware, getStats);

// ── GET /generation/public/:shareId ───────────────────────────────────────────
// ⚠️ DEBE ir antes de /:id para que Express no lo confunda con un ID
router.get('/public/:shareId', async (req, res, next) => {
    try {
        const generation = await Generation.findOne({
            shareId: req.params.shareId,
            isPublic: true
        }).populate('user', 'email');

        if (!generation) {
            return res.status(404).json({ message: 'This link is no longer active.' });
        }

        res.json({
            success: true,
            data: {
                _id:       generation._id,
                title:     generation.title,
                language:  generation.language,
                result:    generation.result,
                createdAt: generation.createdAt,
                author:    generation.user?.email?.split('@')[0]
            }
        });
    } catch (err) {
        next(err);
    }
});

// Listar generaciones
router.get('/', authMiddleware, async (req, res, next) => {
    try {
        const page  = parseInt(req.query.page)  || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip  = (page - 1) * limit;

        const [generations, total] = await Promise.all([
            Generation.find({ user: req.user.userId })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .select('_id type title language createdAt originalText'),
            Generation.countDocuments({ user: req.user.userId })
        ]);

        const data = generations.map(g => ({
            _id:      g._id,
            type:     g.type,
            title:    g.title || null,
            language: g.language || null,
            createdAt: g.createdAt,
            preview:  g.originalText
                ? g.originalText.trim().slice(0, 120) + (g.originalText.length > 120 ? '…' : '')
                : null
        }));

        res.json({
            success: true,
            data,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (err) {
        next(err);
    }
});

// Detalle de una generación
router.get('/:id', authMiddleware, async (req, res, next) => {
    try {
        const generation = await Generation.findOne({
            _id: req.params.id,
            user: req.user.userId
        });

        if (!generation) {
            return res.status(404).json({ message: 'Not found' });
        }

        res.json({ success: true, data: generation });
    } catch (err) {
        next(err);
    }
});

// Eliminar una generación
router.delete('/:id', authMiddleware, async (req, res, next) => {
    try {
        const generation = await Generation.findOneAndDelete({
            _id: req.params.id,
            user: req.user.userId
        });

        if (!generation) {
            return res.status(404).json({ message: 'Not found' });
        }

        res.json({ success: true, message: 'Deleted' });
    } catch (err) {
        next(err);
    }
});

// ── POST /generation/:id/share ────────────────────────────────────────────────
router.post('/:id/share', authMiddleware, async (req, res, next) => {
    try {
        const generation = await Generation.findOne({
            _id: req.params.id,
            user: req.user.userId
        });

        if (!generation) {
            return res.status(404).json({ message: 'Not found' });
        }

        if (!generation.shareId) {
            generation.shareId = randomUUID();
        }
        generation.isPublic = true;
        await generation.save();

        res.json({ success: true, shareId: generation.shareId });
    } catch (err) {
        next(err);
    }
});

// ── DELETE /generation/:id/share ──────────────────────────────────────────────
router.delete('/:id/share', authMiddleware, async (req, res, next) => {
    try {
        const generation = await Generation.findOneAndUpdate(
            { _id: req.params.id, user: req.user.userId },
            { isPublic: false },
            { new: true }
        );

        if (!generation) {
            return res.status(404).json({ message: 'Not found' });
        }

        res.json({ success: true });
    } catch (err) {
        next(err);
    }
});

module.exports = router;