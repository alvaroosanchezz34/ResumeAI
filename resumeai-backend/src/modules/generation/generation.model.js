const mongoose = require('mongoose');

const generationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['full'],   // 👈 SOLO full ahora
        required: true
    },
    originalText: {
        type: String,
        required: true
    },
    result: {
        type: Object,
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Generation', generationSchema);
