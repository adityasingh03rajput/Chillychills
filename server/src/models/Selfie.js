import mongoose from 'mongoose';

const selfieSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        ref: 'User'
    },
    userName: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    caption: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    isBest: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: { expires: 86400 } // Auto-delete after 24 hours (86400 seconds)
    },
    approvedAt: {
        type: Date
    }
});

// Index to quickly find the best selfie for a specific day
selfieSchema.index({ createdAt: -1, isBest: 1 });

const Selfie = mongoose.model('Selfie', selfieSchema);
export default Selfie;
