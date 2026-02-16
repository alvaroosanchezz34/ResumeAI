const express = require('express');
const router = express.Router();
const Generation = require('./generation.model');
const authMiddleware = require('../../middlewares/auth.middleware');
const { getStats } = require('./generation.stats');


router.get('/stats', authMiddleware, getStats);

router.get('/', authMiddleware, async (req, res) => {
    const generations = await Generation
        .find({ user: req.user.userId })
        .sort({ createdAt: -1 })
        .select('_id createdAt');

    res.json({ success: true, data: generations });
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
