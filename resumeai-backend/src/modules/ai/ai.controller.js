const aiService = require('./ai.service');
const usageService = require('../usage/usage.service');
const User = require('../auth/user.model');
const Generation = require('../generation/generation.model');
const plans = require('../../config/plans');

const generate = async (req, res, next) => {
    try {
        const { text, language } = req.body;  // language es opcional

        if (!text || text.trim().length === 0) {
            return res.status(400).json({ message: 'Text is required' });
        }
        if (text.length > 8000) {
            return res.status(400).json({ message: 'Text is too long. Maximum 8000 characters.' });
        }

        const user = await User.findById(req.user.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const planConfig = plans[user.plan];
        if (!planConfig) return res.status(403).json({ message: 'Invalid plan' });

        await usageService.checkAndIncrementUsage(user);

        // Pasar idioma forzado (o null para auto-detect)
        const raw = await aiService.generateContent(text, language || null);

        const normalized = {
            summary: raw?.summary || '',
            test: Array.isArray(raw?.test)
                ? raw.test.map(q => {
                    const options = Array.isArray(q?.options) ? q.options : [];
                    let correctIndex = 0;
                    if (typeof q?.correctAnswer === 'number') {
                        correctIndex = q.correctAnswer;
                    } else if (q?.answer && options.length > 0) {
                        const index = options.indexOf(q.answer);
                        correctIndex = index >= 0 ? index : 0;
                    }
                    return { question: q?.question || '', options, correctAnswer: correctIndex };
                })
                : [],
            development: Array.isArray(raw?.development) ? raw.development : [],
            flashcards: Array.isArray(raw?.flashcards)
                ? raw.flashcards.map(card => ({
                    front: card?.front || card?.term || '',
                    back: card?.back || card?.definition || ''
                }))
                : []
        };

        if (user.plan === 'free') {
            normalized.test = [];
            normalized.development = [];
        }

        const generation = await Generation.create({
            user: user._id,
            type: 'full',
            title: raw?.title || null,
            language: raw?.detectedLanguage || null,
            originalText: text,
            result: normalized
        });

        return res.json({
            success: true,
            data: {
                ...normalized,
                _id: generation._id,
                title: generation.title,
                language: generation.language
            }
        });

    } catch (err) {
        next(err);
    }
};

module.exports = { generate };