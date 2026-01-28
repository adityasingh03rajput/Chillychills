import mongoose from 'mongoose';

const monthlyBalanceSchema = new mongoose.Schema({
    year: {
        type: Number,
        required: true,
        index: true
    },
    month: {
        type: Number,
        required: true,
        min: 1,
        max: 12,
        index: true
    },
    totalRevenue: {
        type: Number,
        default: 0
    },
    totalOrders: {
        type: Number,
        default: 0
    },
    completedOrders: {
        type: Number,
        default: 0
    },
    cancelledOrders: {
        type: Number,
        default: 0
    },
    refundedAmount: {
        type: Number,
        default: 0
    },
    averageOrderValue: {
        type: Number,
        default: 0
    },
    ordersByBranch: {
        type: Map,
        of: Number,
        default: {}
    },
    revenueByCategory: {
        type: Map,
        of: Number,
        default: {}
    },
    peakHours: {
        type: Map,
        of: Number,
        default: {}
    },
    lastUpdated: {
        type: Number,
        default: () => Date.now()
    }
}, {
    timestamps: false,
    versionKey: false
});

// Compound index for unique year-month combination
monthlyBalanceSchema.index({ year: 1, month: 1 }, { unique: true });

// Helper method to get or create balance for a specific month
monthlyBalanceSchema.statics.getOrCreateForMonth = async function (year, month) {
    let balance = await this.findOne({ year, month });

    if (!balance) {
        balance = await this.create({
            year,
            month,
            totalRevenue: 0,
            totalOrders: 0,
            completedOrders: 0,
            cancelledOrders: 0,
            refundedAmount: 0,
            averageOrderValue: 0,
            ordersByBranch: {},
            revenueByCategory: {},
            peakHours: {}
        });
    }

    return balance;
};

// Helper method to update balance after order
monthlyBalanceSchema.statics.updateAfterOrder = async function (order, action = 'new') {
    const orderDate = new Date(order.createdAt);
    const year = orderDate.getFullYear();
    const month = orderDate.getMonth() + 1; // 1-12
    const hour = orderDate.getHours();

    const balance = await this.getOrCreateForMonth(year, month);

    if (action === 'new') {
        // New order placed
        balance.totalOrders += 1;
        balance.totalRevenue += order.totalAmount;

        // Track branch
        const branchCount = balance.ordersByBranch.get(order.branch) || 0;
        balance.ordersByBranch.set(order.branch, branchCount + 1);

        // Track peak hours
        const hourKey = `${hour}:00`;
        const hourCount = balance.peakHours.get(hourKey) || 0;
        balance.peakHours.set(hourKey, hourCount + 1);

        // Track revenue by category (from items)
        if (order.items && Array.isArray(order.items)) {
            order.items.forEach(item => {
                const category = item.category || 'Other';
                const revenue = balance.revenueByCategory.get(category) || 0;
                balance.revenueByCategory.set(category, revenue + (item.price * item.quantity));
            });
        }
    }

    if (action === 'completed' && order.status === 'completed') {
        balance.completedOrders += 1;
    }

    if (action === 'cancelled' && order.status === 'cancelled') {
        balance.cancelledOrders += 1;
        balance.totalRevenue -= order.totalAmount; // Deduct from revenue
    }

    if (action === 'refunded' && order.refundRequest?.status === 'approved') {
        const refundAmount = order.refundRequest.refundAmount || order.totalAmount;
        balance.refundedAmount += refundAmount;
        balance.totalRevenue -= refundAmount;
    }

    // Calculate average order value
    if (balance.totalOrders > 0) {
        balance.averageOrderValue = Math.round(balance.totalRevenue / balance.totalOrders);
    }

    balance.lastUpdated = Date.now();
    await balance.save();

    return balance;
};

export default mongoose.model('MonthlyBalance', monthlyBalanceSchema);
