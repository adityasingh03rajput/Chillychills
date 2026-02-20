import express from 'express';
import AuditLog from '../models/AuditLog.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// GET /api/audit-logs - Get audit logs with filtering and pagination
router.get('/', authenticate, authorize('manager'), async (req, res) => {
    try {
        const {
            page = 1,
            limit = 50,
            userId,
            action,
            resource,
            startDate,
            endDate,
            status
        } = req.query;

        // Build query
        const query = {};
        
        if (userId) query.userId = userId;
        if (action) query.action = action;
        if (resource) query.resource = resource;
        if (status) query.status = status;
        
        if (startDate || endDate) {
            query.timestamp = {};
            if (startDate) query.timestamp.$gte = new Date(startDate);
            if (endDate) query.timestamp.$lte = new Date(endDate);
        }

        // Execute query with pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const [logs, total] = await Promise.all([
            AuditLog.find(query)
                .sort({ timestamp: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .lean(),
            AuditLog.countDocuments(query)
        ]);

        res.json({
            logs,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Error fetching audit logs:', error);
        res.status(500).json({ error: 'Failed to fetch audit logs' });
    }
});

// GET /api/audit-logs/stats - Get audit statistics
router.get('/stats', authenticate, authorize('manager'), async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        
        const matchStage = {};
        if (startDate || endDate) {
            matchStage.timestamp = {};
            if (startDate) matchStage.timestamp.$gte = new Date(startDate);
            if (endDate) matchStage.timestamp.$lte = new Date(endDate);
        }

        const stats = await AuditLog.aggregate([
            { $match: matchStage },
            {
                $facet: {
                    byAction: [
                        { $group: { _id: '$action', count: { $sum: 1 } } },
                        { $sort: { count: -1 } }
                    ],
                    byUser: [
                        { $group: { _id: '$userId', userName: { $first: '$userName' }, count: { $sum: 1 } } },
                        { $sort: { count: -1 } },
                        { $limit: 10 }
                    ],
                    byStatus: [
                        { $group: { _id: '$status', count: { $sum: 1 } } }
                    ],
                    total: [
                        { $count: 'count' }
                    ]
                }
            }
        ]);

        res.json({
            byAction: stats[0].byAction,
            byUser: stats[0].byUser,
            byStatus: stats[0].byStatus,
            total: stats[0].total[0]?.count || 0
        });
    } catch (error) {
        console.error('Error fetching audit stats:', error);
        res.status(500).json({ error: 'Failed to fetch audit statistics' });
    }
});

// GET /api/audit-logs/export - Export audit logs as CSV
router.get('/export', authenticate, authorize('manager'), async (req, res) => {
    try {
        const { startDate, endDate, format = 'csv' } = req.query;
        
        const query = {};
        if (startDate || endDate) {
            query.timestamp = {};
            if (startDate) query.timestamp.$gte = new Date(startDate);
            if (endDate) query.timestamp.$lte = new Date(endDate);
        }

        const logs = await AuditLog.find(query)
            .sort({ timestamp: -1 })
            .limit(10000) // Limit to prevent memory issues
            .lean();

        if (format === 'csv') {
            const csv = convertToCSV(logs);
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename=audit-logs-${Date.now()}.csv`);
            res.send(csv);
        } else {
            res.json(logs);
        }
    } catch (error) {
        console.error('Error exporting audit logs:', error);
        res.status(500).json({ error: 'Failed to export audit logs' });
    }
});

// Helper function to convert logs to CSV
function convertToCSV(logs) {
    if (logs.length === 0) return '';
    
    const headers = ['Timestamp', 'User ID', 'User Name', 'Role', 'Action', 'Resource', 'Resource ID', 'Status', 'IP Address'];
    const rows = logs.map(log => [
        new Date(log.timestamp).toISOString(),
        log.userId,
        log.userName || '',
        log.userRole || '',
        log.action,
        log.resource || '',
        log.resourceId || '',
        log.status,
        log.ipAddress || ''
    ]);
    
    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    return csvContent;
}

export default router;
