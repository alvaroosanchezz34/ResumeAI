const Usage = require('./usage.model');

const DAILY_LIMITS = {
    free: 5,
    premium: 50,
    premium_plus: 200,
    custom: 999999
};

const checkAndIncrementUsage = async (user) => {
    // 🔥 ADMIN NO TIENE LÍMITES
    if (user.role === 'admin') {
        return;
    }

    const today = new Date().toISOString().slice(0, 10);
    const limit = DAILY_LIMITS[user.plan];

    let usage = await Usage.findOne({ userId: user._id, date: today });

    if (!usage) {
        usage = await Usage.create({
            userId: user._id,
            date: today,
            requestsUsed: 0
        });
    }

    if (usage.requestsUsed >= limit) {
        const err = new Error('Daily limit reached');
        err.statusCode = 429;
        throw err;
    }

    usage.requestsUsed += 1;
    await usage.save();
};


module.exports = { checkAndIncrementUsage };
