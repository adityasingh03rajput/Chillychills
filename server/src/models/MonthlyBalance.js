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

    if (action === 'completed' && (order.status === 'completed' || order.status === 'picked_up')) {
        balance.completedOrders += 1;
    }

    if (action === 'cancelled' && (order.status === 'cancelled' || order.status === 'rejected')) {
        balance.cancelledOrders += 1;
        balance.totalRevenue -= order.totalAmount;

        // Deduct from category revenue to keep in sync
        if (order.items && Array.isArray(order.items)) {
            order.items.forEach(item => {
                const category = item.category || 'Other';
                const revenue = balance.revenueByCategory.get(category) || 0;
                balance.revenueByCategory.set(category, Math.max(0, revenue - (item.price * item.quantity)));
            });
        }
    }

    if (action === 'refunded' && order.refundRequest?.status === 'approved') {
        const refundAmount = order.refundRequest.refundAmount || order.totalAmount;
        balance.refundedAmount += refundAmount;
        balance.totalRevenue -= refundAmount;

        // Best effort category deduction for refunds
        // If it's a full refund, deduct everything
        if (refundAmount === order.totalAmount && order.items) {
            order.items.forEach(item => {
                const category = item.category || 'Other';
                const revenue = balance.revenueByCategory.get(category) || 0;
                balance.revenueByCategory.set(category, Math.max(0, revenue - (item.price * item.quantity)));
            });
        }
    }

    // Calculate average order value
    if (balance.totalOrders > 0) {
        balance.averageOrderValue = Math.round(balance.totalRevenue / balance.totalOrders);
    }

    balance.lastUpdated = Date.now();
    await balance.save();

    return balance;
};

// Recalculate everything from scratch for a specific month
monthlyBalanceSchema.statics.recalculateForMonth = async function (year, month) {
    const Order = mongoose.model('Order');

    // Calculate start and end range for the month
    const startOfMonth = new Date(year, month - 1, 1).getTime();
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999).getTime();

    const orders = await Order.find({
        createdAt: { $gte: startOfMonth, $lte: endOfMonth }
    });

    let totalRevenue = 0;
    let totalOrders = 0;
    let completedOrders = 0;
    let cancelledOrders = 0;
    let refundedAmount = 0;
    const ordersByBranch = new Map();
    const revenueByCategory = new Map();
    const peakHours = new Map();

    orders.forEach(order => {
        const orderDate = new Date(order.createdAt);
        const hour = orderDate.getHours();
        const hourKey = `${hour}:00`;

        totalOrders++;

        // Count statuses
        if (order.status === 'completed' || order.status === 'picked_up') {
            completedOrders++;
        } else if (order.status === 'cancelled' || order.status === 'rejected') {
            cancelledOrders++;
        }

        // Branch tracking
        const branch = order.branch || 'A';
        ordersByBranch.set(branch, (ordersByBranch.get(branch) || 0) + 1);

        // Peak hour tracking
        peakHours.set(hourKey, (peakHours.get(hourKey) || 0) + 1);

        // Revenue logic (matches updateAfterOrder)
        let orderYield = order.totalAmount;

        // Deduct if cancelled
        if (order.status === 'cancelled' || order.status === 'rejected') {
            orderYield = 0;
        }

        // Deduct manual refunds
        if (order.refundRequest?.status === 'approved') {
            const manualRefund = order.refundRequest.refundAmount || order.totalAmount;
            refundedAmount += manualRefund;
            orderYield -= manualRefund;
        }

        totalRevenue += Math.max(0, orderYield);

        // Category Revenue (Only for non-cancelled/rejected portions)
        if (order.status !== 'cancelled' && order.status !== 'rejected') {
            order.items.forEach(item => {
                const category = item.category || 'Other';
                const itemRevenue = item.price * item.quantity;
                revenueByCategory.set(category, (revenueByCategory.get(category) || 0) + itemRevenue);
            });

            // If there's a partial refund approved, we can't easily attribute it to a category
            // but for simplicity in recalculation, we usually attribute totalAmount
            if (order.refundRequest?.status === 'approved') {
                const manualRefund = order.refundRequest.refundAmount || order.totalAmount;
                // proportional deduction could be done here, but let's stick to total for now
                if (manualRefund >= order.totalAmount) {
                    order.items.forEach(item => {
                        const category = item.category || 'Other';
                        const itemRevenue = item.price * item.quantity;
                        revenueByCategory.set(category, Math.max(0, (revenueByCategory.get(category) || 0) - itemRevenue));
                    });
                }
            }
        }
    });

    const averageOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    const balance = await this.findOneAndUpdate(
        { year, month },
        {
            totalRevenue,
            totalOrders,
            completedOrders,
            cancelledOrders,
            refundedAmount,
            averageOrderValue,
            ordersByBranch,
            revenueByCategory,
            peakHours,
            lastUpdated: Date.now()
        },
        { upsert: true, new: true }
    );

    return balance;
};

export default mongoose.model('MonthlyBalance', monthlyBalanceSchema);
