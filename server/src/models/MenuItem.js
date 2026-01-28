import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema({
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
    description: String,
    price: {
        type: Number,
        required: true
    },
    sizes: [{
        name: String,
        price: Number
    }],
    category: {
        type: String,
        required: true,
        index: true
    },
    image: String,
    vegetarian: Boolean,
    available: {
        type: Boolean,
        default: true
    },
    isRefundable: {
        type: Boolean,
        default: false
    },
    preparationTime: Number,
    calories: Number,
    allergens: [String],
    spicyLevel: Number,
    popular: Boolean,
    branch: {
        type: String,
        default: 'All',
        index: true
    }
}, {
    timestamps: false,
    versionKey: false
});

// Index for filtering by category and availability
menuItemSchema.index({ category: 1, available: 1 });

export default mongoose.model('MenuItem', menuItemSchema);
