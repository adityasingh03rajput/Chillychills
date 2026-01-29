import mongoose from 'mongoose';

const flashSaleSchema = new mongoose.Schema({
    originalOrderId: {
        type: String,
        required: true,
        ref: 'Order'
    },
    originalUserId: {
        type: String,
        required: true
    },
    itemName: {
        type: String,
        required: true
    },
    itemImage: String,
    originalPrice: Number,
    discountedPrice: Number, // 70% of original
    refundAmount: Number,    // 50% of original
    status: {
        type: String,
        enum: ['active', 'sold', 'expired'],
        default: 'active'
    },
    createdAt: {
        type: Number,
        default: () => Date.now(),
        expires: 1800 // TTL: 30 minutes expiry
    }
});

export default mongoose.model('FlashSale', flashSaleSchema);
