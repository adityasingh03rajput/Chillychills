import express from 'express';
import MonthlyBalance from '../models/MonthlyBalance.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// GET /api/balance/current - Get current month's balance (Manager only)
router.get('/current', authenticate, authorize('manager'), async (req, res) => {
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

// GET /api/balance/:year/:month - Get specific month's balance (Manager only)
router.get('/:year/:month', authenticate, authorize('manager'), async (req, res) => {
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

// GET /api/balance/range - Get balance for date range (Manager only)
router.get('/range', authenticate, authorize('manager'), async (req, res) => {
    try {
        const { startYear, startMonth, endYear, endMonth } = req.query;

        // Validate inputs
        const sYear = parseInt(startYear);
        const sMonth = parseInt(startMonth);
        const eYear = parseInt(endYear);
        const eMonth = parseInt(endMonth);

        if (isNaN(sYear) || isNaN(sMonth) || isNaN(eYear) || isNaN(eMonth)) {
            return res.status(400).json({ error: 'Invalid year or month parameters' });
        }

        if (sMonth < 1 || sMonth > 12 || eMonth < 1 || eMonth > 12) {
            return res.status(400).json({ error: 'Month must be between 1 and 12' });
        }

        // Prevent excessive range queries (max 24 months)
        const startDate = new Date(sYear, sMonth - 1);
        const endDate = new Date(eYear, eMonth - 1);

        if (startDate > endDate) {
            return res.status(400).json({ error: 'Start date must be before end date' });
        }

        const monthsDiff = (eYear - sYear) * 12 + (eMonth - sMonth);
        if (monthsDiff > 24) {
            return res.status(400).json({ error: 'Maximum range is 24 months' });
        }

        const query = {
            $or: []
        };

        // Build query for year-month range with iteration limit
        let iterations = 0;
        const maxIterations = 25; // Safety limit

        for (let d = new Date(startDate); d <= endDate && iterations < maxIterations; d.setMonth(d.getMonth() + 1)) {
            query.$or.push({
                year: d.getFullYear(),
                month: d.getMonth() + 1
            });
            iterations++;
        }

        const balances = await MonthlyBalance.find(query).sort({ year: 1, month: 1 });
        res.json(balances);
    } catch (error) {
        console.error('GET /balance/range error:', error);
        res.status(500).json({ error: 'Failed to fetch balance range' });
    }
});

//GET /api/balance/summary - Get summary statistics (Manager only)
router.get('/summary', authenticate, authorize('manager'), async (req, res) => {
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
