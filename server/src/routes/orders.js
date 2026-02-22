import express from 'express';
import Order from '../models/Order.js';
import MonthlyBalance from '../models/MonthlyBalance.js';
import User from '../models/User.js';
import FlashSale from '../models/FlashSale.js';
import MenuItem from '../models/MenuItem.js';
import xss from 'xss';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

const SIMULATION_MODE = process.env.PAYMENT_SIMULATION_MODE === 'true' || process.env.NODE_ENV !== 'production';

// Apply authentication to all order routes
router.use(authenticate);

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

// GET /api/orders/flash-sales - Get active flash sales
router.get('/flash-sales', async (req, res) => {
    try {
        // TTL is 30 minutes, but MongoDB TTL deletion is asynchronous
        // So we manually filter items older than 30 minutes
        const thirtyMinutesAgo = Date.now() - (30 * 60 * 1000);

        const sales = await FlashSale.find({
            status: 'active',
            createdAt: { $gte: thirtyMinutesAgo }
        }).sort({ createdAt: -1 });

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

        // Validate order has items
        if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
            return res.status(400).json({ error: 'Order must contain at least one item' });
        }

        // [SECURITY] Server-side price validation - Prevent price manipulation
        if (!orderData.flashSaleId) {  // Skip for flash sales (different pricing)
            const itemIds = orderData.items.map(i => i.id);
            const menuItems = await MenuItem.find({ id: { $in: itemIds } });

            // Calculate expected total from menu prices
            let calculatedTotal = 0;
            for (const orderItem of orderData.items) {
                const menuItem = menuItems.find(m => m.id === orderItem.id);

                if (!menuItem) {
                    return res.status(400).json({ error: `Invalid item: ${orderItem.id}` });
                }

                if (!menuItem.available) {
                    return res.status(400).json({ error: `Item unavailable: ${menuItem.name}` });
                }

                // Normalize client payload (prevent stale price data in dev)
                orderItem.price = menuItem.price;
                calculatedTotal += menuItem.price * orderItem.quantity;
            }

            // Verify client-sent total matches server calculation
            if (Math.abs(calculatedTotal - orderData.totalAmount) > 0.01) {
                console.error(`⚠️ PRICE MISMATCH! User ${orderData.userId} - Expected: ₹${calculatedTotal}, Sent: ₹${orderData.totalAmount}`);
                if (process.env.NODE_ENV === 'production') {
                    return res.status(400).json({
                        error: 'Total amount mismatch. Items might have changed prices.',
                        expected: calculatedTotal,
                        received: orderData.totalAmount
                    });
                }

                // In dev, auto-heal by trusting server prices
                orderData.totalAmount = calculatedTotal;
            }

            // [SECURITY] Calculate loyalty points server-side (5% of total)
            orderData.loyaltyPointsEarned = Math.floor(calculatedTotal * 0.05);
        }

        // Validate total amount
        if (!orderData.totalAmount || orderData.totalAmount <= 0) {
            return res.status(400).json({ error: 'Invalid total amount' });
        }

        // [IDEMPOTENCY] Check for duplicate order submission
        if (orderData.idempotencyKey) {
            const existingOrder = await Order.findOne({
                idempotencyKey: orderData.idempotencyKey
            });
            if (existingOrder) {
                console.log(`⚠️ Duplicate order detected. Returning existing order: ${existingOrder.id}`);
                return res.status(200).json(existingOrder); // Return existing order
            }
        }

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

            // 3. Update Original Order Status and record refund
            const originalOrder = await Order.findByIdAndUpdate(
                flashItem.originalOrderId,
                {
                    status: 'rescued',
                    rescueRefundAmount: flashItem.refundAmount
                },
                { new: true }
            );

            if (originalOrder) {
                await MonthlyBalance.updateAfterOrder(originalOrder.toObject(), 'rescued');
            }

            // Emit event to update User A's UI
            io.emit('orderUpdate', { id: flashItem.originalOrderId, status: 'rescued' });
        }

        // Sanitize item notes to prevent XSS
        if (orderData.items && Array.isArray(orderData.items)) {
            orderData.items = orderData.items.map(item => ({
                ...item,
                notes: item.notes ? xss(item.notes.trim()) : undefined
            }));
        }

        // [SECURITY] Handle payment BEFORE creating order
        console.log(`[OrderDebug] Processing payment: Method=${orderData.paymentMethod}, User=${orderData.userId}, Amount=${orderData.totalAmount}`);

        const method = orderData.paymentMethod || 'wallet';
        orderData.paymentMethod = method;

        if (method === 'wallet') {
            const updatedUser = await User.findOneAndUpdate(
                {
                    id: orderData.userId,
                    balance: { $gte: orderData.totalAmount }
                },
                {
                    $inc: {
                        balance: -Number(orderData.totalAmount),
                        points: Number(orderData.loyaltyPointsEarned || 0)
                    },
                    $push: {
                        transactions: {
                            type: 'payment',
                            amount: Number(orderData.totalAmount),
                            method: 'wallet',
                            orderId: orderData.id || 'N/A',
                            timestamp: new Date()
                        }
                    }
                },
                { new: true }
            );

            if (!updatedUser) {
                console.error(`❌ PAYMENT FAILED! User ${orderData.userId} - Insufficient balance or user not found`);
                return res.status(400).json({
                    error: 'Insufficient wallet balance. Please add funds to continue.',
                    required: orderData.totalAmount,
                    hint: 'Visit the campus office to top up your wallet.'
                });
            }

            console.log(`💳 Deducted ₹${orderData.totalAmount} from user ${orderData.userId}. New Balance: ₹${updatedUser.balance}`);
        } else if (method === 'upi') {
            if (!SIMULATION_MODE) {
                return res.status(400).json({
                    error: 'UPI payments are not enabled on this server.',
                    hint: 'Enable PAYMENT_SIMULATION_MODE=true to simulate UPI payments.'
                });
            }

            await new Promise(resolve => setTimeout(resolve, 1200));

            const txId = `SIMUPI${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
            orderData.paymentTransactionId = txId;

            await User.findOneAndUpdate(
                { id: orderData.userId },
                {
                    $inc: { points: Number(orderData.loyaltyPointsEarned || 0) },
                    $push: {
                        transactions: {
                            type: 'payment',
                            amount: Number(orderData.totalAmount),
                            method: 'simulated_upi',
                            transactionId: txId,
                            orderId: orderData.id || 'N/A',
                            timestamp: new Date()
                        }
                    }
                },
                { new: true }
            );
        } else {
            return res.status(400).json({ error: 'Invalid payment method' });
        }

        // Create order AFTER successful payment
        const order = new Order(orderData);
        await order.save();

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

        // [SECURITY] Validate status transitions based on role
        if (req.body.status && req.body.status !== previousOrder.status) {
            const newStatus = req.body.status;
            const oldStatus = previousOrder.status;
            const userRole = req.user?.role || 'student';  // Default to student if no auth

            if (userRole === 'student' && newStatus === 'cancelled' && (oldStatus === 'accepted' || oldStatus === 'preparing')) {
                const hasNonRefundable = Array.isArray(previousOrder.items) && previousOrder.items.some(i => !i.isRefundable);
                if (hasNonRefundable) {
                    return res.status(403).json({
                        error: 'Forbidden: Non-refundable items cannot be cancelled once accepted/preparing.'
                    });
                }
            }

            // Define allowed status transitions per role
            const allowedTransitions = {
                student: {
                    placed: ['cancelled'],
                    accepted: ['cancelled'],
                    preparing: ['cancelled'],
                    ready: ['picked_up']
                },
                cook: {
                    placed: ['preparing', 'rejected'],
                    preparing: ['ready'],
                    awaiting_rescue: ['ready'],
                    ready: ['picked_up']
                },
                manager: {
                    // Managers can do any transition
                    '*': true
                }
            };

            console.log(`[TransitionDebug] Order=${req.params.id}, Role=${userRole}, Transition: ${oldStatus} -> ${newStatus}`);

            // Check if transition is allowed
            if (userRole !== 'manager') {
                const allowed = allowedTransitions[userRole]?.[oldStatus];

                if (!allowed || !allowed.includes(newStatus)) {
                    console.error(`⚠️ UNAUTHORIZED STATUS CHANGE! User role: ${userRole}, ID=${req.params.id}, ${oldStatus} → ${newStatus}`);
                    return res.status(403).json({
                        error: `Forbidden: As a ${userRole}, you cannot move order from ${oldStatus} to ${newStatus}`,
                        details: {
                            role: userRole,
                            from: oldStatus,
                            to: newStatus,
                            allowed: allowed || []
                        }
                    });
                }
            }

            console.log(`✅ Status transition allowed: ${oldStatus} → ${newStatus} (role: ${userRole})`);
        }

        // Sanitize rejection reason if provided
        if (req.body.rejectionReason) {
            req.body.rejectionReason = xss(req.body.rejectionReason.trim());
        }

        const order = await Order.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).lean();

        // [FLASH SALE LOGIC] Intercept Cancellation of Preparing Items
        if (req.body.status === 'cancelled' && previousOrder.status === 'preparing') {
            // [SECURITY] Prevent refund loop - Block cancellation of rescued orders
            if (previousOrder.status === 'rescued') {
                return res.status(400).json({
                    error: 'Cannot cancel already rescued orders'
                });
            }

            // [SECURITY] Prevent cancelling flash sale purchases (rescue orders)
            if (previousOrder.flashSaleId) {
                return res.status(400).json({
                    error: 'Cannot cancel rescue/flash sale purchases'
                });
            }

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
