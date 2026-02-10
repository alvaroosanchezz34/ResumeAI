const aiService = require('./ai.service');
const usageService = require('../usage/usage.service');
const User = require('../auth/user.model');

const generate = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.userId);

        await usageService.checkAndIncrementUsage(user);

        const result = await aiService.generateContent(req.body.text);

        res.json({ success: true, data: result });
    } catch (err) {
        next(err);
    }
};

module.exports = { generate };
