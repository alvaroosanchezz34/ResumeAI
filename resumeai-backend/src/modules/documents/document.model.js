const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        title: String,
        originalText: { type: String, required: true },
        generated: {
            summary: String,
            test: [
                {
                    question: String,
                    options: [String],
                    correctAnswer: Number
                }
            ],
            development: [String],
            flashcards: [
                {
                    front: String,
                    back: String
                }
            ]
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model('Document', documentSchema);
