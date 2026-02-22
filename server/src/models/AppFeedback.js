import mongoose from 'mongoose';

const appFeedbackSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        default: ''
    },
    createdAt: {
        type: Number,
        default: () => Date.now(),
        index: true
    }
});

export default mongoose.model('AppFeedback', appFeedbackSchema);
