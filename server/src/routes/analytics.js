import express from 'express';
import Order from '../models/Order.js';
import MenuItem from '../models/MenuItem.js';

const router = express.Router();

// GET /api/analytics/employee-performance
// Track cook/employee performance by order preparation
router.get('/employee-performance', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        const query = {};
        if (startDate && endDate) {
            query.createdAt = {
                $gte: parseInt(startDate),
                $lte: parseInt(endDate)
            };
        }

        const orders = await Order.find(query);

        // Group by status transitions and calculate metrics
        const employeeStats = {
            totalOrders: orders.length,
            completedOrders: orders.filter(o => o.status === 'completed').length,
            averagePreparationTime: 0,
            statusBreakdown: {
                placed: orders.filter(o => o.status === 'placed').length,
                preparing: orders.filter(o => o.status === 'preparing').length,
                ready: orders.filter(o => o.status === 'ready').length,
                completed: orders.filter(o => o.status === 'completed').length,
                cancelled: orders.filter(o => o.status === 'cancelled').length,
            },
            efficiency: orders.length > 0
                ? Math.round((orders.filter(o => o.status === 'completed').length / orders.length) * 100)
                : 0
        };

        res.json(employeeStats);
    } catch (error) {
        console.error('GET /analytics/employee-performance error:', error);
        res.status(500).json({ error: 'Failed to fetch employee performance' });
    }
});

// GET /api/analytics/customer-behavior
// Analyze customer ordering patterns
router.get('/customer-behavior', async (req, res) => {
    try {
        const orders = await Order.find().lean();

        // Group by userId to find repeat customers
        const customerMap = new Map();
        orders.forEach(order => {
            const userId = order.userId;
            if (!customerMap.has(userId)) {
                customerMap.set(userId, {
                    userId,
                    orderCount: 0,
                    totalSpent: 0,
                    averageOrderValue: 0,
                    firstOrder: order.createdAt,
                    lastOrder: order.createdAt,
                    favoriteItems: new Map()
                });
            }

            const customer = customerMap.get(userId);
            customer.orderCount++;
            customer.totalSpent += order.totalAmount;
            customer.lastOrder = Math.max(customer.lastOrder, order.createdAt);

            // Track favorite items
            order.items?.forEach(item => {
                const count = customer.favoriteItems.get(item.id) || 0;
                customer.favoriteItems.set(item.id, count + item.quantity);
            });
        });

        // Calculate metrics
        const customers = Array.from(customerMap.values()).map(customer => ({
            ...customer,
            averageOrderValue: Math.round(customer.totalSpent / customer.orderCount),
            favoriteItems: Array.from(customer.favoriteItems.entries())
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3)
                .map(([id, count]) => ({ id, count }))
        }));

        const analytics = {
            totalCustomers: customers.length,
            repeatCustomers: customers.filter(c => c.orderCount > 1).length,
            averageOrdersPerCustomer: customers.length > 0
                ? (orders.length / customers.length).toFixed(1)
                : 0,
            topCustomers: customers
                .sort((a, b) => b.totalSpent - a.totalSpent)
                .slice(0, 10)
                .map(c => ({
                    userId: c.userId,
                    orderCount: c.orderCount,
                    totalSpent: c.totalSpent,
                    averageOrderValue: c.averageOrderValue
                })),
            customerRetentionRate: customers.length > 0
                ? Math.round((customers.filter(c => c.orderCount > 1).length / customers.length) * 100)
                : 0
        };

        res.json(analytics);
    } catch (error) {
        console.error('GET /analytics/customer-behavior error:', error);
        res.status(500).json({ error: 'Failed to fetch customer behavior' });
    }
});

// GET /api/analytics/popular-items
// Find most popular menu items
router.get('/popular-items', async (req, res) => {
    try {
        const { limit = 10 } = req.query;
        const orders = await Order.find().lean();

        const itemStats = new Map();

        orders.forEach(order => {
            order.items?.forEach(item => {
                if (!itemStats.has(item.id)) {
                    itemStats.set(item.id, {
                        id: item.id,
                        name: item.name,
                        category: item.category,
                        image: item.image,
                        totalOrders: 0,
                        totalQuantity: 0,
                        totalRevenue: 0
                    });
                }

                const stats = itemStats.get(item.id);
                stats.totalOrders++;
                stats.totalQuantity += item.quantity;
                stats.totalRevenue += item.price * item.quantity;
            });
        });

        const popularItems = Array.from(itemStats.values())
            .sort((a, b) => b.totalQuantity - a.totalQuantity)
            .slice(0, parseInt(limit))
            .map((item, index) => ({
                ...item,
                rank: index + 1,
                averageOrderValue: Math.round(item.totalRevenue / item.totalOrders)
            }));

        res.json(popularItems);
    } catch (error) {
        console.error('GET /analytics/popular-items error:', error);
        res.status(500).json({ error: 'Failed to fetch popular items' });
    }
});

// GET /api/analytics/real-time-stats
// Get current real-time statistics
router.get('/real-time-stats', async (req, res) => {
    try {
        const now = Date.now();
        const todayStart = new Date().setHours(0, 0, 0, 0);

        const [todayOrders, activeOrders, totalOrders] = await Promise.all([
            Order.find({ createdAt: { $gte: todayStart } }).lean(),
            Order.find({ status: { $in: ['placed', 'preparing', 'ready'] } }).lean(),
            Order.countDocuments()
        ]);

        const todayRevenue = todayOrders.reduce((sum, o) => sum + o.totalAmount, 0);
        const activeOrdersCount = activeOrders.length;

        const stats = {
            todayOrders: todayOrders.length,
            todayRevenue,
            activeOrders: activeOrdersCount,
            totalOrders,
            averageOrderValue: todayOrders.length > 0
                ? Math.round(todayRevenue / todayOrders.length)
                : 0,
            recentOrders: todayOrders
                .sort((a, b) => b.createdAt - a.createdAt)
                .slice(0, 5)
                .map(o => ({
                    token: o.token,
                    status: o.status,
                    totalAmount: o.totalAmount,
                    createdAt: o.createdAt
                }))
        };

        res.json(stats);
    } catch (error) {
        console.error('GET /analytics/real-time-stats error:', error);
        res.status(500).json({ error: 'Failed to fetch real-time stats' });
    }
});

// GET /api/analytics/trends
// Daily/weekly/monthly trends
router.get('/trends', async (req, res) => {
    try {
        const { period = 'week' } = req.query; // day, week, month

        const now = Date.now();
        let startTime;

        switch (period) {
            case 'day':
                startTime = now - (24 * 60 * 60 * 1000);
                break;
            case 'week':
                startTime = now - (7 * 24 * 60 * 60 * 1000);
                break;
            case 'month':
                startTime = now - (30 * 24 * 60 * 60 * 1000);
                break;
            default:
                startTime = now - (7 * 24 * 60 * 60 * 1000);
        }

        const orders = await Order.find({
            createdAt: { $gte: startTime }
        }).lean();

        // Group by day
        const dailyStats = new Map();
        orders.forEach(order => {
            const date = new Date(order.createdAt).toISOString().split('T')[0];

            if (!dailyStats.has(date)) {
                dailyStats.set(date, {
                    date,
                    orders: 0,
                    revenue: 0,
                    completed: 0
                });
            }

            const stats = dailyStats.get(date);
            stats.orders++;
            stats.revenue += order.totalAmount;
            if (order.status === 'completed') stats.completed++;
        });

        const trends = Array.from(dailyStats.values()).sort((a, b) =>
            new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        res.json({
            period,
            trends,
            summary: {
                totalOrders: orders.length,
                totalRevenue: orders.reduce((sum, o) => sum + o.totalAmount, 0),
                averageDaily: trends.length > 0
                    ? Math.round(orders.length / trends.length)
                    : 0
            }
        });
    } catch (error) {
        console.error('GET /analytics/trends error:', error);
        res.status(500).json({ error: 'Failed to fetch trends' });
    }
});

export default router;
