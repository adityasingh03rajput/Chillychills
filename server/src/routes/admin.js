import express from 'express';
import User from '../models/User.js';
import { authenticate, authorize } from '../middleware/auth.js';
import xss from 'xss';
import bcrypt from 'bcrypt';
import UpiTransaction from '../models/UpiTransaction.js';

const router = express.Router();

// Mock store for announcements for now (could be moved to MongoDB)
let announcements = {
    'all': '📢 Welcome to ChillyChills Admin Panel!',
    'medical': '📢 New healthy salads coming to Medical Canteen!',
    'engineering': '📢 Mid-exam snacks now available!',
    'hospital': '📢 24/7 Hot Beverages for Staff'
};

// POST /api/admin/staff/recruit
router.post('/staff/recruit', authenticate, authorize('manager'), async (req, res) => {
    try {
        const { id, name, password, role, branch } = req.body;

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
            balance: 0
        });

        await newStaff.save();
        console.log(`✅ New staff recruited: ${id} (${role})`);
        res.status(201).json({ success: true, message: 'New staff member recruited' });
    } catch (error) {
        console.error('Staff recruitment failed:', error);
        res.status(500).json({ error: 'Failed to recruit staff' });
    }
});

// GET /api/admin/staff - Get all staff members
router.get('/staff', authenticate, authorize('manager'), async (req, res) => {
    try {
        const staff = await User.find({ role: { $in: ['manager', 'cook'] } })
            .select('-password')
            .sort({ role: 1, name: 1 });
        res.json(staff);
    } catch (error) {
        console.error('GET /admin/staff error:', error);
        res.status(500).json({ error: 'Failed to fetch staff' });
    }
});

// DELETE /api/admin/staff/:id - Remove staff member
router.delete('/staff/:id', authenticate, authorize('manager'), async (req, res) => {
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
        console.log(`❌ Staff removed: ${id}`);
        res.json({ success: true, message: 'Staff member removed' });
    } catch (error) {
        console.error('DELETE /admin/staff/:id error:', error);
        res.status(500).json({ error: 'Failed to remove staff' });
    }
});

// GET /api/admin/announcements
router.get('/announcements', authenticate, async (req, res) => {
    res.json(announcements);
});

// POST /api/admin/announcements
router.post('/announcements', authenticate, authorize('manager'), async (req, res) => {
    try {
        const { branch, message } = req.body;
        if (!branch || !message) {
            return res.status(400).json({ error: 'Branch and message are required' });
        }

        announcements[branch] = xss(message);

        // Emit to all users
        const io = req.app.get('io');
        if (io) {
            io.emit('announcementUpdate', { branch, message: announcements[branch] });
        }

        console.log(`📢 Announcement updated for ${branch}`);
        res.json({ success: true, message: 'Announcement updated' });
    } catch (error) {
        console.error('POST /admin/announcements error:', error);
        res.status(500).json({ error: 'Failed to update announcement' });
    }
});

// DELETE /api/admin/announcements/:branch
router.delete('/announcements/:branch', authenticate, authorize('manager'), async (req, res) => {
    try {
        const { branch } = req.params;
        if (announcements[branch]) {
            delete announcements[branch];
            const io = req.app.get('io');
            if (io) {
                io.emit('announcementUpdate', { branch, message: null });
            }
            console.log(`🗑️ Announcement removed for ${branch}`);
            res.json({ success: true, message: `Announcement for ${branch} removed` });
        } else {
            res.status(404).json({ error: 'Announcement not found' });
        }
    } catch (error) {
        console.error('DELETE /admin/announcements/:branch error:', error);
        res.status(500).json({ error: 'Failed to remove announcement' });
    }
});

// GET /api/admin/utr/pending - Get pending UTR verifications
router.get('/utr/pending', authenticate, authorize('manager'), async (req, res) => {
    try {
        const pending = await UpiTransaction.find({ status: 'pending' }).sort({ createdAt: -1 });
        res.json(pending);
    } catch (error) {
        console.error('GET /admin/utr/pending error:', error);
        res.status(500).json({ error: 'Failed to fetch pending UTR' });
    }
});

// POST /api/admin/utr/verify - Verify and approve UTR
router.post('/utr/verify', authenticate, authorize('manager'), async (req, res) => {
    try {
        const { utr } = req.body;
        const tx = await UpiTransaction.findOne({ utr, status: 'pending' });
        
        if (!tx) {
            return res.status(404).json({ error: 'Transaction not found or already processed' });
        }

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

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        tx.status = 'verified';
        await tx.save();

        console.log(`✅ UTR verified: ${utr} for user ${tx.userId} - ₹${tx.amount}`);
        res.json({ success: true, message: 'UTR verified and balance credited', newBalance: user.balance });
    } catch (error) {
        console.error('POST /admin/utr/verify error:', error);
        res.status(500).json({ error: 'Verification failed' });
    }
});

// POST /api/admin/utr/reject - Reject UTR
router.post('/utr/reject', authenticate, authorize('manager'), async (req, res) => {
    try {
        const { utr } = req.body;
        const tx = await UpiTransaction.findOne({ utr, status: 'pending' });
        
        if (!tx) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        tx.status = 'rejected';
        await tx.save();

        console.log(`❌ UTR rejected: ${utr}`);
        res.json({ success: true, message: 'UTR rejected' });
    } catch (error) {
        console.error('POST /admin/utr/reject error:', error);
        res.status(500).json({ error: 'Rejection failed' });
    }
});

export default router;
