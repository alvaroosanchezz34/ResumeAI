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
        default: null   // Generado automáticamente por la IA
    },
    language: {
        type: String,
        default: null   // Idioma detectado ('es', 'en', 'fr', etc.)
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