import express from 'express';
import Order from '../models/Order.js';
import MonthlyBalance from '../models/MonthlyBalance.js';
import User from '../models/User.js';
import FlashSale from '../models/FlashSale.js';

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

// GET /api/orders/flash-sales - Fetch active rescue orders
router.get('/flash-sales', async (req, res) => {
    try {
        const sales = await FlashSale.find({ status: 'active' }).sort({ createdAt: -1 });
        res.json(sales);
    } catch (e) {
        console.error('GET /flash-sales error:', e);
        res.status(500).json([]);
    }
});

// POST /api/orders - Create new order
router.post('/', async (req, res) => {
    try {
        const orderData = req.body;
        const io = req.app.get('io');

        // [FLASH SALE LOGIC] pre-validation
        if (orderData.flashSaleId) {
            const flashItem = await FlashSale.findById(orderData.flashSaleId);

            if (!flashItem || flashItem.status !== 'active') {
                return res.status(400).json({ error: 'Item already rescued by someone else.' });
            }

            // 1. Mark Flash Sale as Sold IMMEDIATELY (Atomic lock)
            flashItem.status = 'sold';
            await flashItem.save();

            // 2. Refund User A (Original Buyer) - 50%
            await User.findOneAndUpdate(
                { id: flashItem.originalUserId },
                { $inc: { balance: flashItem.refundAmount } }
            );
            console.log(`⚡ Rescue Success! Refunded ₹${flashItem.refundAmount} to User A (${flashItem.originalUserId})`);

            // 3. Update Original Order Status
            await Order.findByIdAndUpdate(flashItem.originalOrderId, { status: 'rescued' });

            // Emit event to update User A's UI
            io.emit('orderUpdate', { id: flashItem.originalOrderId, status: 'rescued' });
        }

        const order = new Order(orderData);
        await order.save(); // Only save if validation passed

        // Handle wallet payment deduction and loyalty points
        console.log(`[OrderDebug] Processing payment: Method=${orderData.paymentMethod}, User=${orderData.userId}, Amount=${orderData.totalAmount}`);

        if (orderData.paymentMethod === 'wallet') {
            const updatedUser = await User.findOneAndUpdate(
                { id: orderData.userId },
                {
                    $inc: {
                        balance: -Number(orderData.totalAmount),
                        points: Number(orderData.loyaltyPointsEarned || 0)
                    }
                },
                { new: true } // Return updated doc
            );

            if (updatedUser) {
                console.log(`💳 Deducted ₹${orderData.totalAmount} from user ${orderData.userId}. New Balance: ${updatedUser.balance}`);
            } else {
                console.error(`❌ Failed to deduct wallet balance! User ${orderData.userId} not found.`);
            }
        } else if (orderData.paymentMethod === 'upi') {
            // Even for UPI, increment energy points
            await User.findOneAndUpdate(
                { id: orderData.userId },
                { $inc: { points: Number(orderData.loyaltyPointsEarned || 0) } }
            );
        }

        // Update monthly balance sheet
        await MonthlyBalance.updateAfterOrder(order.toObject(), 'new');

        // Emit Socket.io event to all connected clients
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
        if (!previousOrder) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const order = await Order.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).lean();

        // [FLASH SALE LOGIC] Intercept Cancellation of Preparing Items
        if (req.body.status === 'cancelled' && previousOrder.status === 'preparing') {
            // Calculate non-refundable part
            const nonRefundableItems = previousOrder.items.filter(i => !i.isRefundable);

            if (nonRefundableItems.length > 0) {
                const totalNonRefundableValue = nonRefundableItems.reduce((acc, i) => acc + (i.price * i.quantity), 0);

                // Create Flash Sale Entry
                const flashSale = new FlashSale({
                    originalOrderId: previousOrder._id,
                    originalUserId: previousOrder.userId,
                    itemName: nonRefundableItems.map(i => i.name).join(' + '), // e.g. "Maggie + Burger"
                    originalPrice: totalNonRefundableValue,
                    discountedPrice: Math.ceil(totalNonRefundableValue * 0.7), // 30% off
                    refundAmount: Math.ceil(totalNonRefundableValue * 0.5)     // 50% refund to A
                });
                await flashSale.save();

                // Override status to 'awaiting_rescue'
                order.status = 'awaiting_rescue';
                await Order.findByIdAndUpdate(order._id, { status: 'awaiting_rescue' });

                console.log(`⚡ Flash Sale Created! ID: ${flashSale._id} for Order #${previousOrder.token}`);
            }
        }

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

                    // Track this in MonthlyBalance as well using the model's logic
                    const orderDate = new Date(order.createdAt);
                    const balance = await MonthlyBalance.getOrCreateForMonth(orderDate.getFullYear(), orderDate.getMonth() + 1);
                    balance.refundedAmount += refundableAmount;
                    await balance.save();
                }
            }

            if (order.refundRequest?.status === 'approved' && previousOrder.refundRequest?.status !== 'approved') {
                await MonthlyBalance.updateAfterOrder(order, 'refunded');

                const manualRefundAmount = order.refundRequest.refundAmount || order.totalAmount;

                console.log(`[RefundDebug] Manager Approved. ID=${order.id}, Amount=${manualRefundAmount}`);

                const updatedUser = await User.findOneAndUpdate(
                    { id: order.userId },
                    { $inc: { balance: Number(manualRefundAmount) } },
                    { new: true }
                );

                if (updatedUser) {
                    console.log(`💰 Manager manual refund granted: ₹${manualRefundAmount} to user ${order.userId}. New Balance: ${updatedUser.balance}`);
                } else {
                    console.error(`❌ Failed to refund user ${order.userId}: User not found.`);
                }
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
