const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./user.model');

const generateToken = (user) => {
    return jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
};

const register = async ({ email, password }) => {
    const exists = await User.findOne({ email });
    if (exists) {
        const err = new Error('User already exists');
        err.statusCode = 409;
        throw err;
    }
    const passwordHash = await bcrypt.hash(password, 10);
    return await User.create({ email, passwordHash });
};

const login = async ({ email, password }) => {
    const user = await User.findOne({ email });
    if (!user) {
        const err = new Error('Invalid credentials');
        err.statusCode = 401;
        throw err;
    }
    if (user.status === 'banned') {
        const err = new Error('Account suspended');
        err.statusCode = 403;
        throw err;
    }
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
        const err = new Error('Invalid credentials');
        err.statusCode = 401;
        throw err;
    }
    const token = generateToken(user);
    user.lastLogin = new Date();
    await user.save();
    return { token };
};

const refresh = async (userId) => {
    const user = await User.findById(userId);
    if (!user) {
        const err = new Error('User not found');
        err.statusCode = 404;
        throw err;
    }
    if (user.status === 'banned') {
        const err = new Error('Account suspended');
        err.statusCode = 403;
        throw err;
    }
    return { token: generateToken(user) };
};

const updateEmail = async (userId, { newEmail, password }) => {
    const user = await User.findById(userId);
    if (!user) {
        const err = new Error('User not found');
        err.statusCode = 404;
        throw err;
    }

    // Verificar contraseña actual
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
        const err = new Error('Incorrect password');
        err.statusCode = 401;
        throw err;
    }

    // Comprobar que el nuevo email no está en uso
    const exists = await User.findOne({ email: newEmail, _id: { $ne: userId } });
    if (exists) {
        const err = new Error('Email already in use');
        err.statusCode = 409;
        throw err;
    }

    user.email = newEmail;
    await user.save();

    // Devolver nuevo token con el email actualizado
    return { token: generateToken(user) };
};

const updatePassword = async (userId, { currentPassword, newPassword }) => {
    const user = await User.findById(userId);
    if (!user) {
        const err = new Error('User not found');
        err.statusCode = 404;
        throw err;
    }

    const match = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!match) {
        const err = new Error('Incorrect current password');
        err.statusCode = 401;
        throw err;
    }

    if (newPassword.length < 6) {
        const err = new Error('New password must be at least 6 characters');
        err.statusCode = 400;
        throw err;
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    return { token: generateToken(user) };
};

module.exports = { register, login, refresh, updateEmail, updatePassword };