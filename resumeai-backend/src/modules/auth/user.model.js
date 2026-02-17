const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        email: { type: String, unique: true, required: true },
        passwordHash: { type: String, required: true },

        role: {
            type: String,
            enum: ['user', 'admin'],
            default: 'user'
        },

        plan: {
            type: String,
            enum: ['free', 'premium', 'pro', 'custom', 'admin'],
            default: 'free'
        },

        status: {
            type: String,
            enum: ['active', 'banned', 'pending'],
            default: 'active'
        },

        // Stripe
        stripeCustomerId: { type: String, default: null },
        stripeSubscriptionId: { type: String, default: null },
        planExpiresAt: { type: Date, default: null },

        emailVerified: { type: Boolean, default: false },
        lastLogin: Date
    },
    { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);