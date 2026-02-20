import mongoose from 'mongoose';

const upiTransactionSchema = new mongoose.Schema({
    utr: {
        type: String,
        required: true,
        unique: true, // Crucial: No one can use the same UTR twice
        trim: true,
        minLength: 12,
        maxLength: 12
    },
    userId: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'verified', 'rejected', 'flagged'],
        default: 'pending'
    }
}, { timestamps: true });

export default mongoose.model('UpiTransaction', upiTransactionSchema);
