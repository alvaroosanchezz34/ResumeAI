const mongoose = require('mongoose');

const generationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['full'],
        required: true
    },
    title: {
        type: String,
        default: null
    },
    language: {
        type: String,
        default: null
    },
    originalText: {
        type: String,
        required: true
    },
    result: {
        type: Object,
        required: true
    },
    // ── Compartir ──────────────────────────────────────────────
    isPublic: {
        type: Boolean,
        default: false
    },
    shareId: {
        type: String,
        default: null,
        unique: true,
        sparse: true
    }
}, {
    timestamps: true
});

generationSchema.index({ shareId: 1 });

module.exports = mongoose.model('Generation', generationSchema);