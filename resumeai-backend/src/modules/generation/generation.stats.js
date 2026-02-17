const Generation = require('./generation.model');
const Usage = require('../usage/usage.model');
const User = require('../auth/user.model');
const plans = require('../../config/plans');

const getStats = async (req, res) => {
    const userId = req.user.userId;

    const totalGenerations = await Generation.countDocuments({ user: userId });

    const lastGeneration = await Generation
        .findOne({ user: userId })
        .sort({ createdAt: -1 });

    const today = new Date().toISOString().split('T')[0];

    const usageToday = await Usage.findOne({
        user: userId,
        date: today
    });

    const user = await User.findById(userId);

    const limit = plans[user.plan]?.dailyLimit ?? 0;

    res.json({
        success: true,
        data: {
            totalGenerations,
            lastGeneration: lastGeneration?.createdAt || null,
            usedToday: usageToday?.count || 0,
            plan: user.plan,
            limit,
            remaining: limit - (usageToday?.count || 0)
        }
    });

};

module.exports = { getStats };
