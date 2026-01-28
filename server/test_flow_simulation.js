import mongoose from 'mongoose';
import User from './src/models/User.js';
import Order from './src/models/Order.js';
import dotenv from 'dotenv';
dotenv.config();

async function runTestFlow() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('--- 🧪 FLOW INTEGRITY TEST INITIATED ---');

        const userId = 'student_test';

        // Reset balance for clean test
        await User.findOneAndUpdate({ id: userId }, { balance: 500 });

        let student = await User.findOne({ id: userId });
        console.log(`[NODE SYNC] User: ${student.name}`);
        console.log(`[RESERVE CAPITAL INITIAL] ₹${student.balance}`);

        const totalAmount = 200; // 5 x ₹40

        // 1. PLACE ORDER
        console.log(`\n[ACTION] Placing order (Total: ₹${totalAmount})...`);
        const order = new Order({
            token: 'FLOW-' + Date.now(),
            userId: userId,
            items: [{ id: 'm4', name: 'Cola', price: 40, quantity: 5, isRefundable: true }],
            totalAmount: totalAmount,
            paymentMethod: 'wallet',
            status: 'placed'
        });
        await order.save();
        await User.findOneAndUpdate({ id: userId }, { $inc: { balance: -totalAmount } });

        student = await User.findOne({ id: userId });
        console.log(`[RESERVE CAPITAL POST-ORDER] ₹${student.balance}`);

        // 2. CANCEL ORDER (Triggers Auto-Refund in logic)
        console.log(`\n[ACTION] Student cancels order...`);
        const previousOrderState = await Order.findById(order._id);
        const cancelledOrder = await Order.findByIdAndUpdate(order._id, { status: 'cancelled' }, { new: true });

        // Logic Re-Check (Case 2: Auto-Refund)
        if (cancelledOrder.status === 'cancelled' && previousOrderState.status !== 'cancelled') {
            const refundableAmount = cancelledOrder.items.reduce((s, i) => s + (i.isRefundable ? i.price * i.quantity : 0), 0);
            if (refundableAmount > 0) {
                await User.findOneAndUpdate({ id: userId }, { $inc: { balance: refundableAmount } });
                console.log(`[SYSTEM] Auto-Refund Processed: ₹${refundableAmount}`);
            }
        }

        student = await User.findOne({ id: userId });
        console.log(`[RESERVE CAPITAL POST-CANCEL] ₹${student.balance}`);

        // 3. MANAGER ATTEMPTS TO "GRANT" REFUND MANUALLY
        console.log(`\n[ACTION] Manager attempts to 'Grant Refund' via Dashboard...`);
        const preApprovalOrder = await Order.findById(order._id);
        const approvedOrder = await Order.findByIdAndUpdate(order._id, { 'refundRequest.status': 'approved' }, { new: true });

        // Logic Re-Check (Case 3: Fixed Manual Refund)
        if (approvedOrder.refundRequest?.status === 'approved' && preApprovalOrder.refundRequest?.status !== 'approved') {
            // THE FIX:
            const wasAutoRefunded = ['cancelled', 'rejected'].includes(preApprovalOrder.status);

            if (!wasAutoRefunded) {
                const manualRefundAmount = approvedOrder.totalAmount;
                await User.findOneAndUpdate({ id: userId }, { $inc: { balance: manualRefundAmount } });
                console.log(`[SYSTEM] Manual Refund Granted: ₹${manualRefundAmount}`);
            } else {
                console.log(`[SHIELD] Manual Refund BLOCKED: User already auto-refunded upon cancellation.`);
            }
        }

        student = await User.findOne({ id: userId });
        console.log(`[RESERVE CAPITAL FINAL] ₹${student.balance}`);

        console.log('\n--- 🧪 FLOW INTEGRITY TEST COMPLETED ---');
    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

runTestFlow();
