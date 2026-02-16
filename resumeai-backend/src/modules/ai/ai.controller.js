const aiService = require('./ai.service');
const usageService = require('../usage/usage.service');
const User = require('../auth/user.model');
const Generation = require('../generation/generation.model');
const plans = require('../../config/plans');

const generate = async (req, res, next) => {
    try {
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({
                message: 'Text is required'
            });
        }

        const user = await User.findById(req.user.userId);

        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        const planConfig = plans[user.plan];

        if (!planConfig) {
            return res.status(403).json({
                message: 'Invalid plan'
            });
        }

        // 🔢 Validar límite diario
        await usageService.checkAndIncrementUsage(user);

        // 🤖 Generar contenido IA
        const raw = await aiService.generateContent(text);

        // 🧠 Normalizar respuesta
        let normalized = {
            summary: raw?.summary || "",

            test: Array.isArray(raw?.test)
                ? raw.test.map(q => {
                    const options = Array.isArray(q?.options) ? q.options : [];

                    let correctIndex = 0;

                    if (typeof q?.correctAnswer === "number") {
                        correctIndex = q.correctAnswer;
                    } else if (q?.answer && options.length > 0) {
                        const index = options.indexOf(q.answer);
                        correctIndex = index >= 0 ? index : 0;
                    }

                    return {
                        question: q?.question || "",
                        options,
                        correctAnswer: correctIndex
                    };
                })
                : [],

            development: Array.isArray(raw?.development)
                ? raw.development
                : [],

            flashcards: Array.isArray(raw?.flashcards)
                ? raw.flashcards.map(card => ({
                    front: card?.front || card?.term || "",
                    back: card?.back || card?.definition || ""
                }))
                : []
        };

        // 🔒 FILTRAR SEGÚN PLAN
        if (user.plan === 'free') {
            normalized.test = [];
            normalized.development = [];
        }

        if (user.plan === 'premium') {
            normalized.flashcards = [];
        }

        // 💾 Guardar historial completo (no filtrado)
        await Generation.create({
            user: user._id,
            type: 'full',
            originalText: text,
            result: normalized
        });

        console.log("AI RESULT:", normalized);

        return res.json({
            success: true,
            data: normalized
        });

    } catch (err) {
        next(err);
    }
};

module.exports = { generate };
