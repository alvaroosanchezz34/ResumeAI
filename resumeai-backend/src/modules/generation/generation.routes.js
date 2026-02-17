const express = require('express');
const router = express.Router();
const Generation = require('./generation.model');
const authMiddleware = require('../../middlewares/auth.middleware');
const { getStats } = require('./generation.stats');

router.get('/stats', authMiddleware, getStats);

// Listar generaciones con título, idioma y preview
router.get('/', authMiddleware, async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [generations, total] = await Promise.all([
        Generation.find({ user: req.user.userId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .select('_id type title language createdAt originalText'),
        Generation.countDocuments({ user: req.user.userId })
    ]);

    const data = generations.map(g => ({
        _id: g._id,
        type: g.type,
        title: g.title || null,
        language: g.language || null,
        createdAt: g.createdAt,
        preview: g.originalText
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
});

// Detalle de una generación
router.get('/:id', authMiddleware, async (req, res) => {
    const generation = await Generation.findOne({
        _id: req.params.id,
        user: req.user.userId
    });

    if (!generation) {
        return res.status(404).json({ message: 'Not found' });
    }

    res.json({ success: true, data: generation });
});

// Eliminar una generación
router.delete('/:id', authMiddleware, async (req, res) => {
    const generation = await Generation.findOneAndDelete({
        _id: req.params.id,
        user: req.user.userId
    });

    if (!generation) {
        return res.status(404).json({ message: 'Not found' });
    }

    res.json({ success: true, message: 'Deleted' });
});

module.exports = router;