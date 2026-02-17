const express = require('express');
const router = express.Router();
const Generation = require('./generation.model');
const authMiddleware = require('../../middlewares/auth.middleware');
const { getStats } = require('./generation.stats');


router.get('/stats', authMiddleware, getStats);

router.get('/', authMiddleware, async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [generations, total] = await Promise.all([
        Generation.find({ user: req.user.userId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .select('_id type createdAt'),
        Generation.countDocuments({ user: req.user.userId })
    ]);

    res.json({
        success: true,
        data: generations,
        totalPages: Math.ceil(total / limit),
        currentPage: page
    });
});

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

module.exports = router;
