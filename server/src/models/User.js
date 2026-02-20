import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    name: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['student', 'cook', 'manager'],
        required: true
    },
    balance: {
        type: Number,
        default: 0
    },
    points: {
        type: Number,
        default: 0
    },
    email: String,
    password: {
        type: String,
        required: true
    },
    transactions: [{
        type: {
            type: String,
            enum: ['topup', 'payment', 'refund', 'gift_received', 'gift_sent']
        },
        amount: Number,
        method: String,  // 'upi', 'cash', 'wallet'
        razorpayPaymentId: String,
        razorpayOrderId: String,
        orderId: String,
        timestamp: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true,
    versionKey: false
});

export default mongoose.model('User', userSchema);
