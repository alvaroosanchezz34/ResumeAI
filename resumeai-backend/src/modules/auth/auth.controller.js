const authService = require('./auth.service');

const register = async (req, res, next) => {
    try {
        const user = await authService.register(req.body);
        res.status(201).json({ success: true, userId: user._id });
    } catch (err) {
        next(err);
    }
};

const login = async (req, res, next) => {
    try {
        const data = await authService.login(req.body);
        res.json({ success: true, ...data });
    } catch (err) {
        next(err);
    }
};

module.exports = { register, login };
