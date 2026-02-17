// usage.service.js — versión corregida
const Usage = require('./usage.model');
const plans = require('../../config/plans');

const checkAndIncrementUsage = async (user) => {
    if (user.plan === 'admin') return;

    const planConfig = plans[user.plan];
    if (!planConfig) throw Object.assign(new Error('Invalid plan'), { statusCode: 403 });

    const today = new Date().toISOString().split('T')[0];

    const usage = await Usage.findOneAndUpdate(
        { userId: user._id, date: today },
        { $inc: { requestsUsed: 1 } },
        { upsert: true, new: true }
    );

    // Comprobamos DESPUÉS de incrementar
    if (usage.requestsUsed > planConfig.dailyLimit) {
        // Revertir el incremento
        await Usage.findOneAndUpdate(
            { userId: user._id, date: today },
            { $inc: { requestsUsed: -1 } }
        );
        throw Object.assign(new Error('Daily limit reached'), { statusCode: 429 });
    }
};

module.exports = { checkAndIncrementUsage };