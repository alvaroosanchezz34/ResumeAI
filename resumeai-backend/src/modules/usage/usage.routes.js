const express = require('express');
const router = express.Router();
const auth = require('../../middlewares/auth.middleware');
const Usage = require('./usage.model');
const User = require('../auth/user.model');

const DAILY_LIMITS = {
    free: 5,
    premium: 50,
    premium_plus: 200,
    custom: 999999
};

router.get('/today', auth, async (req, res) => {
    const today = new Date().toISOString().slice(0, 10);

    const user = await User.findById(req.user.userId);

    // Admin ilimitado
    if (user.role === 'admin') {
        return res.json({
            requestsUsed: 0,
            limit: null,
            unlimited: true
        });
    }

    const usage = await Usage.findOne({
        userId: req.user.userId,
        date: today
    });

    res.json({
        requestsUsed: usage?.requestsUsed || 0,
        limit: DAILY_LIMITS[user.plan],
        unlimited: user.plan === 'custom'
    });
});

module.exports = router;
