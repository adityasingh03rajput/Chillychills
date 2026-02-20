import express from 'express';
import User from '../models/User.js';
import MenuItem from '../models/MenuItem.js';
import Order from '../models/Order.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { logAuditAction } from '../middleware/auditLogger.js';
import xss from 'xss';
import bcrypt from 'bcrypt';
import UpiTransaction from '../models/UpiTransaction.js';

const router = express.Router();

// Announcement storage (consider moving to MongoDB for persistence)
let announcements = {
    'all': '📢 Welcome to ChillyChills Admin Panel!',
    'medical': '📢 New healthy salads coming to Medical Canteen!',
    'engineering': '📢 Mid-exam snacks now available!',
    'hospital': '📢 24/7 Hot Beverages for Staff'
};

// ==================== STAFF MANAGEMENT ====================

// POST /api/admin/staff/recruit - Recruit new staff
router.post('/staff/recruit', 
    authenticate, 
    authorize('manager'), 
    logAuditAction('staff_recruit', 'user'),
    async (req, res) => {
        try {
            const { id, name, password, role, branch, email } = req.body;

            if (!id || !name || !password || !role) {
                return res.status(400).json({ error: 'All fields are required' });
            }

            // Validate role
            if (!['manager', 'cook'].includes(role)) {
                return res.status(400).json({ error: 'Invalid staff role' });
            }

            // Check if user exists
            const existing = await User.findOne({ id });
            if (existing) {
                return res.status(400).json({ error: 'Identity ID already registered' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const newStaff = new User({
                id: xss(id),
                name: xss(name),
                password: hashedPassword,
                role,
                branch: xss(branch || 'ALL'),
                email: email ? xss(email) : undefined,
                balance: 0,
                points: 0
            });

            await newStaff.save();
            
            res.status(201).json({ 
                success: true, 
                message: 'New staff member recruited',
                staff: {
                    id: newStaff.id,
                    name: newStaff.name,
                    role: newStaff.role,
                    branch: newStaff.branch
                }
            });
        } catch (error) {
            console.error('Staff recruitment failed:', error);
            res.status(500).json({ error: 'Failed to recruit staff' });
        }
    }
);

// GET /api/admin/staff - Get all staff members with filtering
router.get('/staff', authenticate, authorize('manager'), async (req, res) => {
    try {
        const { role, branch, search } = req.query;
        
        const query = { role: { $in: ['manager', 'cook'] } };
        
        if (role) query.role = role;
        if (branch && branch !== 'ALL') query.branch = branch;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { id: { $regex: search, $options: 'i' } }
            ];
        }

        const staff = await User.find(query)
            .select('-password')
            .sort({ role: 1, name: 1 });
            
        res.json(staff);
    } catch (error) {
        console.error('GET /admin/staff error:', error);
        res.status(500).json({ error: 'Failed to fetch staff' });
    }
});

// PUT /api/admin/staff/:id - Update staff member
router.put('/staff/:id', 
    authenticate, 
    authorize('manager'),
    logAuditAction('staff_update', 'user'),
    async (req, res) => {
        try {
            const { id } = req.params;
            const { name, role, branch, email } = req.body;

            const updateData = {};
            if (name) updateData.name = xss(name);
            if (role && ['manager', 'cook'].includes(role)) updateData.role = role;
            if (branch) updateData.branch = xss(branch);
            if (email) updateData.email = xss(email);

            const staff = await User.findOneAndUpdate(
                { id, role: { $in: ['manager', 'cook'] } },
                updateData,
                { new: true }
            ).select('-password');

            if (!staff) {
                return res.status(404).json({ error: 'Staff member not found' });
            }

            res.json({ success: true, staff });
        } catch (error) {
            console.error('PUT /admin/staff/:id error:', error);
            res.status(500).json({ error: 'Failed to update staff' });
        }
    }
);

// DELETE /api/admin/staff/:id - Remove staff member
router.delete('/staff/:id', 
    authenticate, 
    authorize('manager'),
    logAuditAction('staff_delete', 'user'),
    async (req, res) => {
        try {
            const { id } = req.params;
            
            // Don't allow deleting self
            if (req.user.id === id) {
                return res.status(400).json({ error: 'Cannot delete own account' });
            }

            const staff = await User.findOne({ id });
            
            if (!staff) {
                return res.status(404).json({ error: 'Staff member not found' });
            }

            if (staff.role === 'student') {
                return res.status(400).json({ error: 'Cannot remove students via staff endpoint' });
            }

            await User.deleteOne({ id });
            res.json({ success: true, message: 'Staff member removed' });
        } catch (error) {
            console.error('DELETE /admin/staff/:id error:', error);
            res.status(500).json({ error: 'Failed to remove staff' });
        }
    }
);

// ==================== ANNOUNCEMENTS ====================

// GET /api/admin/announcements
router.get('/announcements', authenticate, async (req, res) => {
    res.json(announcements);
});

// POST /api/admin/announcements
router.post('/announcements', 
    authenticate, 
    authorize('manager'),
    logAuditAction('announcement_create', 'announcement'),
    async (req, res) => {
        try {
            const { branch, message } = req.body;
            if (!branch || !message) {
                return res.status(400).json({ error: 'Branch and message are required' });
            }

            announcements[branch] = xss(message);

            // Emit to all users
            const io = req.app.get('io');
            io.emit('announcementUpdate', { branch, message: announcements[branch] });

            res.json({ success: true, message: 'Announcement updated' });
        } catch (error) {
            res.status(500).json({ error: 'Failed to update announcement' });
        }
    }
);

// DELETE /api/admin/announcements/:branch
router.delete('/announcements/:branch', 
    authenticate, 
    authorize('manager'),
    logAuditAction('announcement_update', 'announcement'),
    async (req, res) => {
        try {
            const { branch } = req.params;
            if (announcements[branch]) {
                delete announcements[branch];
                const io = req.app.get('io');
                io.emit('announcementUpdate', { branch, message: null });
                res.json({ success: true, message: 'Announcement removed' });
            } else {
                res.status(404).json({ error: 'Announcement not found' });
            }
        } catch (error) {
            res.status(500).json({ error: 'Failed to remove announcement' });
        }
    }
);

// ==================== UTR VERIFICATION ====================

// GET /api/admin/utr/pending
router.get('/utr/pending', authenticate, authorize('manager'), async (req, res) => {
    try {
        const pending = await UpiTransaction.find({ status: 'pending' }).sort({ createdAt: -1 });
        res.json(pending);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch pending UTR' });
    }
});

// GET /api/admin/utr/all - Get all UTR transactions with filtering
router.get('/utr/all', authenticate, authorize('manager'), async (req, res) => {
    try {
        const { status, userId, startDate, endDate, page = 1, limit = 50 } = req.query;
        
        const query = {};
        if (status) query.status = status;
        if (userId) query.userId = userId;
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const [transactions, total] = await Promise.all([
            UpiTransaction.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            UpiTransaction.countDocuments(query)
        ]);

        res.json({
            transactions,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch UTR transactions' });
    }
});

// POST /api/admin/utr/verify
router.post('/utr/verify', 
    authenticate, 
    authorize('manager'),
    logAuditAction('utr_verify', 'upi_transaction'),
    async (req, res) => {
        try {
            const { utr } = req.body;
            const tx = await UpiTransaction.findOne({ utr, status: 'pending' });
            if (!tx) return res.status(404).json({ error: 'Transaction not found or already processed' });

            // Credit User
            const user = await User.findOneAndUpdate(
                { id: tx.userId },
                {
                    $inc: { balance: tx.amount },
                    $push: {
                        transactions: {
                            type: 'topup',
                            amount: tx.amount,
                            method: 'upi_manual',
                            orderId: `UTR-${utr}`,
                            timestamp: new Date()
                        }
                    }
                },
                { new: true }
            );

            if (!user) return res.status(404).json({ error: 'User not found' });

            tx.status = 'verified';
            tx.verifiedBy = req.user.id;
            tx.verifiedAt = new Date();
            await tx.save();

            // Emit real-time update
            const io = req.app.get('io');
            io.to(tx.userId).emit('balanceUpdate', { balance: user.balance });

            res.json({ success: true, message: 'UTR verified and balance credited', newBalance: user.balance });
        } catch (error) {
            console.error('UTR verification error:', error);
            res.status(500).json({ error: 'Verification failed' });
        }
    }
);

// POST /api/admin/utr/reject
router.post('/utr/reject', 
    authenticate, 
    authorize('manager'),
    logAuditAction('utr_reject', 'upi_transaction'),
    async (req, res) => {
        try {
            const { utr, reason } = req.body;
            const tx = await UpiTransaction.findOne({ utr, status: 'pending' });
            if (!tx) return res.status(404).json({ error: 'Transaction not found' });

            tx.status = 'rejected';
            tx.rejectedBy = req.user.id;
            tx.rejectedAt = new Date();
            tx.rejectionReason = reason ? xss(reason) : 'No reason provided';
            await tx.save();

            res.json({ success: true, message: 'UTR rejected' });
        } catch (error) {
            res.status(500).json({ error: 'Rejection failed' });
        }
    }
);

// ==================== DASHBOARD STATS ====================

// GET /api/admin/dashboard/stats - Get comprehensive dashboard statistics
router.get('/dashboard/stats', authenticate, authorize('manager'), async (req, res) => {
    try {
        const { branch, startDate, endDate } = req.query;
        
        // Build date filter
        const dateFilter = {};
        if (startDate || endDate) {
            dateFilter.createdAt = {};
            if (startDate) dateFilter.createdAt.$gte = parseInt(startDate);
            if (endDate) dateFilter.createdAt.$lte = parseInt(endDate);
        }

        // Build branch filter
        const branchFilter = branch && branch !== 'all' ? { branch } : {};

        // Parallel queries for better performance
        const [
            totalUsers,
            totalStaff,
            totalOrders,
            activeOrders,
            completedOrders,
            totalRevenue,
            pendingUTR,
            menuItems
        ] = await Promise.all([
            User.countDocuments({ role: 'student' }),
            User.countDocuments({ role: { $in: ['manager', 'cook'] } }),
            Order.countDocuments({ ...dateFilter, ...branchFilter }),
            Order.countDocuments({ status: { $in: ['placed', 'preparing'] }, ...branchFilter }),
            Order.countDocuments({ status: 'completed', ...dateFilter, ...branchFilter }),
            Order.aggregate([
                { $match: { status: 'completed', ...dateFilter, ...branchFilter } },
                { $group: { _id: null, total: { $sum: '$totalAmount' } } }
            ]),
            UpiTransaction.countDocuments({ status: 'pending' }),
            MenuItem.countDocuments({ available: true })
        ]);

        res.json({
            users: {
                total: totalUsers,
                staff: totalStaff
            },
            orders: {
                total: totalOrders,
                active: activeOrders,
                completed: completedOrders
            },
            revenue: {
                total: totalRevenue[0]?.total || 0
            },
            pending: {
                utr: pendingUTR
            },
            menu: {
                activeItems: menuItems
            }
        });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
    }
});

// ==================== BULK OPERATIONS ====================

// POST /api/admin/bulk/users/import - Bulk import users (CSV)
router.post('/bulk/users/import',
    authenticate,
    authorize('manager'),
    logAuditAction('bulk_operation', 'user'),
    async (req, res) => {
        try {
            const { users } = req.body; // Array of user objects
            
            if (!Array.isArray(users) || users.length === 0) {
                return res.status(400).json({ error: 'Invalid users data' });
            }

            const results = {
                success: 0,
                failed: 0,
                errors: []
            };

            for (const userData of users) {
                try {
                    const { id, name, role, balance = 0 } = userData;
                    
                    // Check if user exists
                    const existing = await User.findOne({ id });
                    if (existing) {
                        results.failed++;
                        results.errors.push({ id, error: 'User already exists' });
                        continue;
                    }

                    // Create user with default password
                    const hashedPassword = await bcrypt.hash('chilly123', 10);
                    await User.create({
                        id: xss(id),
                        name: xss(name),
                        role: role || 'student',
                        balance: Number(balance) || 0,
                        password: hashedPassword
                    });

                    results.success++;
                } catch (error) {
                    results.failed++;
                    results.errors.push({ id: userData.id, error: error.message });
                }
            }

            res.json({
                success: true,
                message: `Imported ${results.success} users, ${results.failed} failed`,
                results
            });
        } catch (error) {
            console.error('Bulk import error:', error);
            res.status(500).json({ error: 'Bulk import failed' });
        }
    }
);

// POST /api/admin/bulk/menu/update - Bulk update menu items
router.post('/bulk/menu/update',
    authenticate,
    authorize('manager'),
    logAuditAction('bulk_operation', 'menu_item'),
    async (req, res) => {
        try {
            const { updates } = req.body; // Array of { id, updates }
            
            if (!Array.isArray(updates) || updates.length === 0) {
                return res.status(400).json({ error: 'Invalid updates data' });
            }

            const results = {
                success: 0,
                failed: 0,
                errors: []
            };

            for (const { id, ...updateData } of updates) {
                try {
                    const item = await MenuItem.findOneAndUpdate(
                        { id },
                        updateData,
                        { new: true }
                    );

                    if (item) {
                        results.success++;
                    } else {
                        results.failed++;
                        results.errors.push({ id, error: 'Item not found' });
                    }
                } catch (error) {
                    results.failed++;
                    results.errors.push({ id, error: error.message });
                }
            }

            res.json({
                success: true,
                message: `Updated ${results.success} items, ${results.failed} failed`,
                results
            });
        } catch (error) {
            console.error('Bulk update error:', error);
            res.status(500).json({ error: 'Bulk update failed' });
        }
    }
);

// ==================== DATA EXPORT ====================

// GET /api/admin/export/users - Export all users as CSV
router.get('/export/users',
    authenticate,
    authorize('manager'),
    logAuditAction('data_export', 'user'),
    async (req, res) => {
        try {
            const { role, branch } = req.query;
            
            const query = {};
            if (role) query.role = role;
            if (branch && branch !== 'ALL') query.branch = branch;

            const users = await User.find(query)
                .select('-password')
                .lean();

            const csv = convertUsersToCSV(users);
            
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename=users-${Date.now()}.csv`);
            res.send(csv);
        } catch (error) {
            console.error('Export users error:', error);
            res.status(500).json({ error: 'Failed to export users' });
        }
    }
);

// GET /api/admin/export/orders - Export orders as CSV
router.get('/export/orders',
    authenticate,
    authorize('manager'),
    logAuditAction('data_export', 'order'),
    async (req, res) => {
        try {
            const { status, branch, startDate, endDate } = req.query;
            
            const query = {};
            if (status) query.status = status;
            if (branch && branch !== 'all') query.branch = branch;
            if (startDate || endDate) {
                query.createdAt = {};
                if (startDate) query.createdAt.$gte = parseInt(startDate);
                if (endDate) query.createdAt.$lte = parseInt(endDate);
            }

            const orders = await Order.find(query)
                .sort({ createdAt: -1 })
                .limit(10000)
                .lean();

            const csv = convertOrdersToCSV(orders);
            
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename=orders-${Date.now()}.csv`);
            res.send(csv);
        } catch (error) {
            console.error('Export orders error:', error);
            res.status(500).json({ error: 'Failed to export orders' });
        }
    }
);

// ==================== HELPER FUNCTIONS ====================

function convertUsersToCSV(users) {
    if (users.length === 0) return '';
    
    const headers = ['ID', 'Name', 'Role', 'Balance', 'Points', 'Email', 'Branch'];
    const rows = users.map(user => [
        user.id,
        user.name,
        user.role,
        user.balance || 0,
        user.points || 0,
        user.email || '',
        user.branch || ''
    ]);
    
    return [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
}

function convertOrdersToCSV(orders) {
    if (orders.length === 0) return '';
    
    const headers = ['Token', 'User ID', 'Status', 'Total Amount', 'Branch', 'Items', 'Created At'];
    const rows = orders.map(order => [
        order.token,
        order.userId,
        order.status,
        order.totalAmount,
        order.branch,
        order.items.map(i => `${i.quantity}x ${i.name}`).join('; '),
        new Date(order.createdAt).toISOString()
    ]);
    
    return [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
}

export default router;
