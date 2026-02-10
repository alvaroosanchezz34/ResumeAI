const mongoose = require('mongoose');

const usageSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        date: { type: String }, // YYYY-MM-DD
        requestsUsed: { type: Number, default: 0 }
    },
    { timestamps: true }
);

usageSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Usage', usageSchema);
