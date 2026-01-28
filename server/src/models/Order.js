import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    userId: {
        type: String,
        required: true,
        index: true
    },
    items: [{
        id: String,
        name: String,
        price: Number,
        quantity: Number,
        selectedSize: String,
        notes: String,
        image: String,
        isRefundable: Boolean
    }],
    status: {
        type: String,
        enum: ['placed', 'preparing', 'ready', 'picked_up', 'completed', 'cancelled', 'rejected'],
        default: 'placed',
        index: true
    },
    totalAmount: {
        type: Number,
        required: true
    },
    branch: {
        type: String,
        required: true,
        default: 'A'
    },
    scheduledTime: String,
    createdAt: {
        type: Number,
        default: () => Date.now(),
        index: true
    },
    feedback: {
        rating: Number,
        comment: String,
        submittedAt: Number
    },
    refundRequest: {
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected']
        },
        reason: String,
        requestedAt: Number,
        refundAmount: Number,
        cancelledBy: String,
        resolvedAt: Number
    },
    rejectionReason: String
}, {
    timestamps: false,
    versionKey: false,
    toJSON: {
        transform: function (doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
        }
    },
    toObject: {
        transform: function (doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
        }
    }
});

// Indexes for fast queries
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model('Order', orderSchema);
