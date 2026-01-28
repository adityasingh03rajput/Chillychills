import mongoose from 'mongoose';

const giftCardSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    amount: {
        type: Number,
        required: true
    },
    bonus: {
        type: Number,
        default: 0
    },
    targetUserId: {
        type: String, // The user who is allowed to redeem this
        required: true,
        index: true
    },
    purchasedBy: {
        type: String, // The purchaser's user ID
        required: true
    },
    isRedeemed: {
        type: Boolean,
        default: false
    },
    redeemedBy: {
        type: String, // Should match targetUserId eventually
        default: null
    },
    redeemedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true,
    versionKey: false
});

export default mongoose.model('GiftCard', giftCardSchema);
