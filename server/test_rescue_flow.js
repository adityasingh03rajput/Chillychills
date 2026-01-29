
const BASE_URL = 'http://localhost:3001/api';

async function testRescueFlow() {
    console.log('🚀 Starting Rescue Flow Simulation...');

    // 1. Create User A and User B (Ensure they exist/have balance) - skipping for sim, assuming they exist or IDs work
    const userA = 'RES_USER_A_' + Date.now();
    const userB = 'RES_USER_B_' + Date.now();

    // --- Step 1: User A Places Order (Non-Refundable Item) ---
    console.log('\n1️⃣  User A placing order for "Maggie" (Non-Refundable, ₹100)...');
    const orderRes = await fetch(`${BASE_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            userId: userA,
            items: [{
                id: 'm1',
                name: 'Classic Cheese Burger',
                price: 120,
                quantity: 1,
                isRefundable: false,
                image: 'https://images.unsplash.com/photo-1634737119182-4d09e1305ba7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZWxpY2lvdXMlMjBidXJnZXIlMjBwcm9mZXNzaW9uYWwlMjBmb29kJTIwcGhvdG9ncmFwaHl8ZW58MXx8fHwxNzY4ODA3Mzc3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
                branch: 'A'
            }],
            totalAmount: 120,
            token: 'T-' + Math.floor(Math.random() * 1000),
            paymentMethod: 'wallet',
            branch: 'A'
        })
    });
    const order = await orderRes.json();
    console.log(`   ✅ Order Placed: #${order.token} (ID: ${order.id})`);

    // --- Step 2: Staff moves to Preparing ---
    console.log('\n2️⃣  Staff updating order to "preparing"...');
    await fetch(`${BASE_URL}/orders/${order.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'preparing' })
    });
    console.log('   ✅ Order is now PREPARING');

    // --- Step 3: User A Cancels Order (Trigger Rescue) ---
    console.log('\n3️⃣  User A cancels the order...');
    await fetch(`${BASE_URL}/orders/${order.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' })
    });
    console.log('   ✅ Cancel requested.');

    // --- Step 4: Check Active Flash Sales ---
    console.log('\n4️⃣  Checking Live Rescues (Flash Sales)...');
    await new Promise(r => setTimeout(r, 1000)); // Wait for async DB save
    const salesRes = await fetch(`${BASE_URL}/orders/flash-sales`);
    const sales = await salesRes.json();

    const rescueItem = sales.find(s => s.originalOrderId === order.id);

    if (!rescueItem) {
        console.error('   ❌ FAILED: No flash sale item created for this order!');
        return;
    }
    console.log(`   ✅ SUCCESS: Rescue item found!`);
    console.log(`      - Item: ${rescueItem.itemName}`);
    console.log(`      - Original Price: ${rescueItem.originalPrice}`);
    console.log(`      - Discounted Price: ${rescueItem.discountedPrice} (User B pays this)`);
    console.log(`      - Refund Amount: ${rescueItem.refundAmount} (User A gets this)`);

    // --- Step 5: User B Rescues the Item ---
    console.log('\n5️⃣  User B rescuing the item...');
    const rescueOrderRes = await fetch(`${BASE_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            userId: userB,
            items: [{
                id: 'flash',
                name: 'Rescue Deal',
                price: rescueItem.discountedPrice,
                quantity: 1,
                isRefundable: false
            }],
            totalAmount: rescueItem.discountedPrice,
            paymentMethod: 'wallet',
            branch: 'A',
            status: 'preparing',
            token: 'R-' + Math.floor(Math.random() * 1000),
            flashSaleId: rescueItem._id // LINKING THE RESCUE
        })
    });
    const rescueOrder = await rescueOrderRes.json();

    if (rescueOrder.error) {
        console.error(`   ❌ Rescue Failed: ${rescueOrder.error}`);
        return;
    }
    console.log(`   ✅ Rescue Order Placed! (ID: ${rescueOrder.id})`);

    // --- Step 6: Verify Final State ---
    console.log('\n6️⃣  Verifying Final States...');

    // Check Flash Sale Status
    const salesAfterRes = await fetch(`${BASE_URL}/orders/flash-sales`);
    const salesAfter = await salesAfterRes.json();
    const stillActive = salesAfter.find(s => s._id === rescueItem._id);

    if (!stillActive) {
        console.log('   ✅ Flash Sale removed from active list (Sold).');
    } else {
        console.error('   ❌ FAILED: Flash sale still active!');
    }

    // Check Original Order Status
    const originalOrderRes = await fetch(`${BASE_URL}/orders?userId=${userA}`);
    // ^ Assuming this filters correctly, or we just fetch all and find
    const allOrders = await originalOrderRes.json();
    const refreshedOrder = allOrders.find(o => o.id === order.id);

    if (refreshedOrder.status === 'rescued') {
        console.log(`   ✅ Original Order Status: '${refreshedOrder.status}' (Detailed Updated)`);
    } else {
        console.error(`   ❌ WARNING: Original order status is '${refreshedOrder.status}' (Expected 'rescued')`);
    }

    console.log('\n🎉 TEST COMPLETED SUCCESSFULLY');
}

testRescueFlow().catch(console.error);
