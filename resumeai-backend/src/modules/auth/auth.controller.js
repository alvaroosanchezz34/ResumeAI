const authService = require('./auth.service');

const register = async (req, res, next) => {
    try {
        const user = await authService.register(req.body);
        res.status(201).json({ success: true, userId: user._id });
    } catch (err) { next(err); }
};

const login = async (req, res, next) => {
    try {
        const data = await authService.login(req.body);
        res.json({ success: true, ...data });
    } catch (err) { next(err); }
};

const refresh = async (req, res, next) => {
    try {
        const data = await authService.refresh(req.user.userId);
        res.json({ success: true, ...data });
    } catch (err) { next(err); }
};

const updateEmail = async (req, res, next) => {
    try {
        const data = await authService.updateEmail(req.user.userId, req.body);
        res.json({ success: true, ...data });
    } catch (err) { next(err); }
};

const updatePassword = async (req, res, next) => {
    try {
        const data = await authService.updatePassword(req.user.userId, req.body);
        res.json({ success: true, ...data });
    } catch (err) { next(err); }
};

const completeOnboarding = async (req, res, next) => {
    try {
        const User = require('./user.model');
        await User.findByIdAndUpdate(req.user.userId, { onboardingCompleted: true });
        res.json({ success: true });
    } catch (err) { next(err); }
};

module.exports = { register, login, refresh, updateEmail, updatePassword, completeOnboarding };