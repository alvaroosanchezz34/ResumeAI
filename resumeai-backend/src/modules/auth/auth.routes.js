const express = require('express');
const router = express.Router();
const controller = require('./auth.controller');
const authMiddleware = require('../../middlewares/auth.middleware')
const User = require('./user.model');

router.post('/register', controller.register);
router.post('/login', controller.login);
router.get('/me', authMiddleware, async (req, res) => {
    const user = await User.findById(req.user.userId).select('-passwordHash');
    res.json({ user });
});


module.exports = router;
