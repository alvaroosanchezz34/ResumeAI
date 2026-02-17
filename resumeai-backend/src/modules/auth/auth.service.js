const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./user.model');

const register = async ({ email, password }) => {
    const exists = await User.findOne({ email });
    if (exists) {
        const err = new Error('User already exists');
        err.statusCode = 409;
        throw err;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
        email,
        passwordHash
    });

    return user;
};

const login = async ({ email, password }) => {
    const user = await User.findOne({ email });
    if (!user) {
        const err = new Error('Invalid credentials');
        err.statusCode = 401;
        throw err;
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (user.status === 'banned') {
        const err = new Error('Account suspended');
        err.statusCode = 403;
        throw err;
    }
    if (!match) {
        const err = new Error('Invalid credentials');
        err.statusCode = 401;
        throw err;
    }

    const token = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );

    user.lastLogin = new Date();
    await user.save();

    return { token };
};

module.exports = { register, login };
