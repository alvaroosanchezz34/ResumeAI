const Generation = require('./generation.model');
const Usage = require('../usage/usage.model');
const User = require('../auth/user.model');
const plans = require('../../config/plans');

const getStats = async (req, res) => {
    const userId = req.user.userId;
    const today = new Date().toISOString().split('T')[0];

    const [totalGenerations, lastGeneration, user, usageToday] = await Promise.all([
        Generation.countDocuments({ user: userId }),
        Generation.findOne({ user: userId }).sort({ createdAt: -1 }),
        User.findById(userId),
        Usage.findOne({ userId, date: today })
    ]);

    const limit = plans[user.plan]?.dailyLimit ?? 0;
    const usedToday = usageToday?.requestsUsed || 0;

    // ── Estadísticas de la última semana ──
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentGenerations = await Generation.find({
        user: userId,
        createdAt: { $gte: sevenDaysAgo }
    }).select('createdAt result language');

    // Actividad diaria (últimos 7 días)
    const dailyActivity = {};
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        dailyActivity[d.toISOString().split('T')[0]] = 0;
    }
    recentGenerations.forEach(g => {
        const day = g.createdAt.toISOString().split('T')[0];
        if (dailyActivity[day] !== undefined) dailyActivity[day]++;
    });

    // Idiomas más usados
    const langCount = {};
    recentGenerations.forEach(g => {
        if (g.language) langCount[g.language] = (langCount[g.language] || 0) + 1;
    });

    // Total de flashcards y preguntas generadas (toda la historia)
    const allGenerations = await Generation.find({ user: userId }).select('result');
    let totalFlashcards = 0;
    let totalQuestions = 0;
    allGenerations.forEach(g => {
        totalFlashcards += g.result?.flashcards?.length || 0;
        totalQuestions += g.result?.test?.length || 0;
    });

    res.json({
        success: true,
        data: {
            // Stats base
            totalGenerations,
            lastGeneration: lastGeneration?.createdAt || null,
            usedToday,
            plan: user.plan,
            limit,
            remaining: Math.max(0, limit - usedToday),
            // Stats de aprendizaje
            totalFlashcards,
            totalQuestions,
            dailyActivity,     // { "2026-02-10": 3, "2026-02-11": 1, ... }
            topLanguages: langCount
        }
    });
};

module.exports = { getStats };