import express from 'express';
import Order from '../models/Order.js';
import MonthlyBalance from '../models/MonthlyBalance.js';
import User from '../models/User.js';

const router = express.Router();

// GET /api/orders - Fetch all orders
router.get('/', async (req, res) => {
    try {
        const { userId, status, branch } = req.query;

        // Build query based on filters
        const query = {};
        if (userId) query.userId = userId;
        if (status) query.status = status;
        if (branch) query.branch = branch;

        const orders = await Order.find(query)
            .sort({ createdAt: -1 })
            .lean(); // .lean() for faster JSON conversion

        // Manually map _id to id since .lean() bypasses schema transforms
        const formattedOrders = orders.map(order => ({
            ...order,
            id: order._id
        }));

        res.json(formattedOrders);
    } catch (error) {
        console.error('GET /orders error:', error);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

// POST /api/orders - Create new order
router.post('/', async (req, res) => {
    try {
        const orderData = req.body;
        const order = new Order(orderData);
        await order.save();

        // Handle wallet payment deduction and loyalty points
        if (orderData.paymentMethod === 'wallet') {
            await User.findOneAndUpdate(
                { id: orderData.userId },
                {
                    $inc: {
                        balance: -orderData.totalAmount,
                        points: orderData.loyaltyPointsEarned || 0
                    }
                }
            );
            console.log(`💳 Deducted ₹${orderData.totalAmount} from user ${orderData.userId} (Wallet Payment)`);
        } else if (orderData.paymentMethod === 'upi') {
            // Even for UPI, increment energy points
            await User.findOneAndUpdate(
                { id: orderData.userId },
                { $inc: { points: orderData.loyaltyPointsEarned || 0 } }
            );
        }

        // Update monthly balance sheet
        await MonthlyBalance.updateAfterOrder(order.toObject(), 'new');

        // Emit Socket.io event to all connected clients
        const io = req.app.get('io');
        io.emit('newOrder', order.toObject());

        res.status(201).json(order);
    } catch (error) {
        console.error('POST /orders error:', error);
        res.status(500).json({ error: 'Failed to create order' });
    }
});

// PUT /api/orders/:id - Update order
router.put('/:id', async (req, res) => {
    try {
        const previousOrder = await Order.findById(req.params.id);

        const order = await Order.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).lean();

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Update monthly balance and handle wallet refunds based on status change
        if (previousOrder) {
            // Case 1: Order completed
            if (order.status === 'completed' && previousOrder.status !== 'completed') {
                await MonthlyBalance.updateAfterOrder(order, 'completed');
            }

            // Case 2: Order cancelled or rejected
            const isNewlyCancelled = order.status === 'cancelled' && previousOrder.status !== 'cancelled';
            const isNewlyRejected = order.status === 'rejected' && previousOrder.status !== 'rejected';

            if (isNewlyCancelled || isNewlyRejected) {
                await MonthlyBalance.updateAfterOrder(order, 'cancelled');

                // Automatic refund logic for refundable items
                const refundableAmount = order.items.reduce((sum, item) => {
                    return sum + (item.isRefundable ? (item.price * item.quantity) : 0);
                }, 0);

                if (refundableAmount > 0) {
                    await User.findOneAndUpdate(
                        { id: order.userId },
                        { $inc: { balance: refundableAmount } }
                    );
                    console.log(`💰 Automatically refunded ₹${refundableAmount} to user ${order.userId}`);

                    // Track this in MonthlyBalance as well
                    const balance = await MonthlyBalance.getOrCreateForMonth(
                        new Date(order.createdAt).getFullYear(),
                        new Date(order.createdAt).getMonth() + 1
                    );
                    balance.refundedAmount += refundableAmount;
                    await balance.save();
                }
            }

            // Case 3: Manual refund approved by manager
            if (order.refundRequest?.status === 'approved' && previousOrder.refundRequest?.status !== 'approved') {
                const manualRefundAmount = order.refundRequest.refundAmount || order.totalAmount;
                await MonthlyBalance.updateAfterOrder(order, 'refunded');

                await User.findOneAndUpdate(
                    { id: order.userId },
                    { $inc: { balance: manualRefundAmount } }
                );
            }
        }

        // Emit Socket.io event for order update
        const io = req.app.get('io');

        // Map _id to id for frontend compatibility
        const formattedOrder = { ...order, id: order._id };
        io.emit('orderUpdate', formattedOrder);

        res.json(formattedOrder);
    } catch (error) {
        console.error('PUT /orders/:id error:', error);
        res.status(500).json({ error: 'Failed to update order' });
    }
});

export default router;
