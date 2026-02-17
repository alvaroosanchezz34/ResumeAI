const Usage = require('./usage.model');
const plans = require('../../config/plans');

const checkAndIncrementUsage = async (user) => {
    if (user.plan === 'admin') return;

    const planConfig = plans[user.plan];
    if (!planConfig) throw Object.assign(new Error('Invalid plan'), { statusCode: 403 });

    const today = new Date().toISOString().split('T')[0];
    const limit = planConfig.dailyLimit;

    // Primero aseguramos que existe el documento para hoy (upsert sin incrementar)
    await Usage.findOneAndUpdate(
        { userId: user._id, date: today },
        { $setOnInsert: { requestsUsed: 0 } },
        { upsert: true, new: true }
    );

    // Incremento atómico SOLO si no se ha superado el límite
    // Esta operación es atómica en MongoDB — no hay race condition
    const updated = await Usage.findOneAndUpdate(
        {
            userId: user._id,
            date: today,
            requestsUsed: { $lt: limit }   // condición: solo si aún queda cuota
        },
        { $inc: { requestsUsed: 1 } },
        { new: true }
    );

    // Si updated es null, la condición no se cumplió → límite alcanzado
    if (!updated) {
        throw Object.assign(new Error('Daily limit reached'), { statusCode: 429 });
    }
};

module.exports = { checkAndIncrementUsage };