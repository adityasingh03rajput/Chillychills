import express from 'express';
import MonthlyBalance from '../models/MonthlyBalance.js';

const router = express.Router();

// GET /api/balance/current - Get current month's balance
router.get('/current', async (req, res) => {
    try {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;

        const balance = await MonthlyBalance.getOrCreateForMonth(year, month);
        res.json(balance);
    } catch (error) {
        console.error('GET /balance/current error:', error);
        res.status(500).json({ error: 'Failed to fetch current balance' });
    }
});

// GET /api/balance/:year/:month - Get specific month's balance
router.get('/:year/:month', async (req, res) => {
    try {
        const year = parseInt(req.params.year);
        const month = parseInt(req.params.month);

        if (month < 1 || month > 12) {
            return res.status(400).json({ error: 'Invalid month. Must be 1-12' });
        }

        const balance = await MonthlyBalance.getOrCreateForMonth(year, month);
        res.json(balance);
    } catch (error) {
        console.error('GET /balance/:year/:month error:', error);
        res.status(500).json({ error: 'Failed to fetch balance' });
    }
});

// GET /api/balance/range - Get balance for date range
router.get('/range', async (req, res) => {
    try {
        const { startYear, startMonth, endYear, endMonth } = req.query;

        const query = {
            $or: []
        };

        // Build query for year-month range
        const start = new Date(startYear, startMonth - 1);
        const end = new Date(endYear, endMonth - 1);

        for (let d = new Date(start); d <= end; d.setMonth(d.getMonth() + 1)) {
            query.$or.push({
                year: d.getFullYear(),
                month: d.getMonth() + 1
            });
        }

        const balances = await MonthlyBalance.find(query).sort({ year: 1, month: 1 });
        res.json(balances);
    } catch (error) {
        console.error('GET /balance/range error:', error);
        res.status(500).json({ error: 'Failed to fetch balance range' });
    }
});

// GET /api/balance/summary - Get summary statistics
router.get('/summary', async (req, res) => {
    try {
        const balances = await MonthlyBalance.find().sort({ year: -1, month: -1 }).limit(12);

        const summary = {
            last12Months: balances,
            totals: {
                revenue: balances.reduce((sum, b) => sum + b.totalRevenue, 0),
                orders: balances.reduce((sum, b) => sum + b.totalOrders, 0),
                completedOrders: balances.reduce((sum, b) => sum + b.completedOrders, 0),
                cancelledOrders: balances.reduce((sum, b) => sum + b.cancelledOrders, 0),
                refundedAmount: balances.reduce((sum, b) => sum + b.refundedAmount, 0),
            },
            averages: {
                monthlyRevenue: balances.length > 0
                    ? Math.round(balances.reduce((sum, b) => sum + b.totalRevenue, 0) / balances.length)
                    : 0,
                monthlyOrders: balances.length > 0
                    ? Math.round(balances.reduce((sum, b) => sum + b.totalOrders, 0) / balances.length)
                    : 0,
            }
        };

        res.json(summary);
    } catch (error) {
        console.error('GET /balance/summary error:', error);
        res.status(500).json({ error: 'Failed to fetch summary' });
    }
});

export default router;
