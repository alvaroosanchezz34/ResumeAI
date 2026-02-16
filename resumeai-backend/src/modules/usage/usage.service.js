const plans = require('../../config/plans');

const checkAndIncrementUsage = async (user) => {
    const planConfig = plans[user.plan];

    if (!planConfig) {
        throw new Error('Invalid plan');
    }

    // Admin ilimitado
    if (user.plan === 'admin') return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!user.usageDate || user.usageDate < today) {
        user.usageToday = 0;
        user.usageDate = new Date();
    }

    if (user.usageToday >= planConfig.dailyLimit) {
        const error = new Error('Daily limit reached');
        error.statusCode = 429;
        throw error;
    }

    user.usageToday += 1;
    await user.save();
};

module.exports = { checkAndIncrementUsage };
