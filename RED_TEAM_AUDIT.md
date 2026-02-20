# 🔴 RED TEAM SECURITY AUDIT - Advanced Vulnerabilities

## 🚨 CRITICAL EXPLOITS FOUND (7)

### **ATTACK 1: Price Manipulation** ⚠️⚠️⚠️
**Severity:** CRITICAL  
**Location:** `server/src/routes/orders.js:129-140`

**The Exploit:**
```javascript
// User sends:
POST /api/orders
{
  "items": [
    { "id": "burger1", "name": "Burger", "price": 200, "quantity": 1 }
  ],
  "totalAmount": 1  // ⚠️ USER CONTROLS THIS!
}

// Backend trusts client:
balance: -Number(orderData.totalAmount)  // Deducts ₹1 instead of ₹200!
```

**Impact:** 
- User orders ₹200 burger for ₹1
- Massive revenue loss
- Kitchen makes food, gets ₹1

**Fix Required:** Server must recalculate total from menu prices.

---

### **ATTACK 2: Negative Balance Allowed** ⚠️⚠️⚠️
**Severity:** CRITICAL  
**Location:** `server/src/routes/orders.js:136-145`

**The Exploit:**
```javascript
// User has ₹0 balance
// Backend does:
balance: -Number(orderData.totalAmount)  // No validation!
// User now has -₹200 balance (debt)
```

**Impact:**
- Users can overdraw wallet
- Infinite debt
- No payment recovery

**Fix Required:** Atomic balance check before deduction.

---

### **ATTACK 3: Loyalty Points Fraud** ⚠️⚠️
**Severity:** HIGH  
**Location:** `server/src/routes/orders.js:141,156`

**The Exploit:**
```javascript
// User orders ₹10 item but sends:
{
  "totalAmount": 10,
  "loyaltyPointsEarned": 99999  // ⚠️ USER CONTROLS THIS!
}

// Backend blindly adds:
points: Number(orderData.loyaltyPointsEarned || 0)
```

**Impact:**
- Infinite loyalty points
- Points can be used for discounts/rewards
- Breaks loyalty system

**Fix Required:** Calculate points server-side (5% of actual total).

---

### **ATTACK 4: Payment Method Switch** ⚠️⚠️
**Severity:** CRITICAL  
**Location:** `server/src/routes/orders.js:135-158`

**The Exploit:**
```javascript
// User has ₹0 in wallet
// Sends:
{
  "paymentMethod": "upi",  // Claims paid via UPI
  "totalAmount": 500
}

// Backend:
// - Doesn't deduct wallet (UPI selected)
// - Doesn't verify UPI payment
// - Still gives loyalty points!
```

**Impact:**
- Free orders by claiming UPI payment
- No actual payment verification
- Kitchen makes food, receives ₹0

**Fix Required:** UPI payment gateway integration or remove UPI option.

---

### **ATTACK 5: Order Status Manipulation** ⚠️⚠️
**Severity:** HIGH  
**Location:** `server/src/routes/orders.js:173-293`

**The Exploit:**
```javascript
// Student sends:
PUT /api/orders/xyz123
{
  "status": "ready"  // Skip 'preparing' stage
}

// Or even worse:
{
  "status": "completed"  // Mark as completed without pickup
}
```

**Impact:**
- Skip food preparation
- Mark as ready/completed without staff
- Confuse kitchen workflow
- False completion analytics

**Fix Required:** Role-based status transitions.

---

### **ATTACK 6: Refund Double-Dip** ⚠️⚠️
**Severity:** HIGH  
**Location:** `server/src/routes/orders.js:220-250`

**The Exploit:**
```javascript
// Cancel order → Get refund
// Order status: 'cancelled'
// Flash sale created

// User immediately places rescue order
// Gets food at 70% discount

// Then cancels THAT order too
// Gets another refund!

// Infinite cycle of refunds
```

**Impact:**
- Repeated refunds
- Free food via rescue loop
- Revenue manipulation

**Fix Required:** Prevent cancelling rescued orders.

---

### **ATTACK 7: Token Replay Attack** ⚠️
**Severity:** MEDIUM  
**Location:** Order token generation

**The Exploit:**
```javascript
// Token: "A123"
// User sees token on screen
// Picks up order

// Attacker sees same token "A123"
// Claims "I ordered A123"
// Gets free food
```

**Impact:**
- Token collision
- Impersonation
- Free food pickup

**Fix Required:** Add user verification on pickup.

---

## 🎯 EXPLOITATION SCENARIOS

### Scenario 1: The ₹1 Scammer
```javascript
// Attack flow:
1. Add ₹1000 burger to cart
2. Intercept POST /api/orders request
3. Change totalAmount: 1000 → totalAmount: 1
4. Submit order
5. Kitchen sees order, makes burger
6. User pays ₹1, gets ₹1000 burger
```

### Scenario 2: The Infinite Points Hacker
```javascript
// Attack flow:
1. Order ₹10 item
2. Change loyaltyPointsEarned: 5 → 999999
3. Accumulate millions of points
4. Use points for massive discounts
5. Free food forever
```

### Scenario 3: The UPI Phantom
```javascript
// Attack flow:
1. Empty wallet (₹0)
2. Order ₹500 meal
3. Select paymentMethod: "upi"
4. Never actually pay
5. Kitchen makes food
6. Pick up order
7. Campus gets ₹0
```

### Scenario 4: The Status Hacker
```javascript
// Attack flow:
1. Place order (status: 'placed')
2. Immediately PUT /api/orders/xyz
3. Change status to 'ready'
4. Pick up food before it's made
5. Kitchen confused
```

### Scenario 5: The Refund Cycler
```javascript
// Attack flow:
1. Order non-refundable item (₹200)
2. Cancel → Flash sale created
3. Buy own flash sale (₹140)
4. Get refund (₹100) to original wallet
5. Cancel flash sale order
6. Get another refund
7. Repeat → Infinite money
```

---

## 🛡️ FIXES REQUIRED

### Fix 1: Server-Side Price Calculation
```javascript
// Calculate total from menu prices
const menuItems = await MenuItem.find({ 
  id: { $in: orderData.items.map(i => i.id) } 
});

const calculatedTotal = orderData.items.reduce((sum, item) => {
  const menuItem = menuItems.find(m => m.id === item.id);
  if (!menuItem) throw new Error('Invalid item');
  return sum + (menuItem.price * item.quantity);
}, 0);

if (calculatedTotal !== orderData.totalAmount) {
  return res.status(400).json({ error: 'Price mismatch detected' });
}
```

### Fix 2: Atomic Balance Validation
```javascript
// Check balance BEFORE creating order
if (orderData.paymentMethod === 'wallet') {
  const user = await User.findOne({ id: orderData.userId });
  if (!user || user.balance < calculatedTotal) {
    return res.status(400).json({ error: 'Insufficient balance' });
  }
  
  // Atomic deduction with balance check
  const updated = await User.findOneAndUpdate(
    { id: orderData.userId, balance: { $gte: calculatedTotal } },
    { $inc: { balance: -calculatedTotal } },
    { new: true }
  );
  
  if (!updated) {
    return res.status(400).json({ error: 'Payment failed' });
  }
}
```

### Fix 3: Server-Side Loyalty Calculation
```javascript
// Calculate points (5% of total)
const calculatedPoints = Math.floor(calculatedTotal * 0.05);
orderData.loyaltyPointsEarned = calculatedPoints;
```

### Fix 4: UPI Payment Verification
```javascript
if (orderData.paymentMethod === 'upi') {
  // Option 1: Remove UPI (wallet only)
  return res.status(400).json({ 
    error: 'UPI not supported. Use wallet payment.' 
  });
  
  // Option 2: Require payment proof
  if (!orderData.upiTransactionId) {
    return res.status(400).json({ error: 'UPI transaction ID required' });
  }
  // Verify with payment gateway
}
```

### Fix 5: Role-Based Status Updates
```javascript
// Only allow specific transitions per role
const allowedTransitions = {
  student: {
    placed: ['cancelled'],  // Can only cancel
    ready: ['picked_up']    // Can only pick up
  },
  cook: {
    placed: ['preparing', 'rejected'],
    preparing: ['ready']
  },
  manager: {
    '*': ['*']  // Can do anything
  }
};

// Validate transition
const userRole = req.user?.role || 'student';
const allowed = allowedTransitions[userRole][previousStatus];
if (!allowed || !allowed.includes(newStatus)) {
  return res.status(403).json({ error: 'Invalid status transition' });
}
```

### Fix 6: Prevent Rescue Cancellation
```javascript
// Check if order was rescued
if (order.status === 'rescued') {
  return res.status(400).json({ 
    error: 'Cannot cancel rescued orders' 
  });
}

// Check if order IS a rescue order
if (order.flashSaleId) {
  return res.status(400).json({ 
    error: 'Cannot cancel rescue purchases' 
  });
}
```

### Fix 7: User-Specific Tokens
```javascript
// Include userId in token
const token = `${branch}${Date.now().toString().slice(-4)}${userId.slice(-2)}`;

// Verify on pickup
if (order.userId !== req.user.id) {
  return res.status(403).json({ error: 'This is not your order' });
}
```

---

## 📊 ATTACK IMPACT ANALYSIS

| Attack | Revenue Loss | Data Integrity | User Impact |
|--------|-------------|----------------|-------------|
| Price Manipulation | CRITICAL | HIGH | Users get cheap food |
| Negative Balance | HIGH | CRITICAL | Infinite debt |
| Points Fraud | MEDIUM | HIGH | Free discounts |
| Payment Switch | CRITICAL | MEDIUM | Free orders |
| Status Manipulation | MEDIUM | HIGH | Kitchen chaos |
| Refund Cycling | HIGH | CRITICAL | Infinite money |
| Token Replay | MEDIUM | LOW | Food theft |

**Total Risk Score:** 9.5/10 (CRITICAL)

---

## 🔧 PRIORITY ORDER

1. **IMMEDIATE (Today)**
   - Price validation
   - Balance check before deduction
   - Remove UPI or add verification

2. **HIGH (This Week)**
   - Points calculation
   - Status transition validation
   - Refund loop prevention

3. **MEDIUM (This Month)**
   - Token uniqueness
   - Pickup verification
   - Audit logging

---

## 🧪 EXPLOITATION TEST SCRIPT

```javascript
// test_exploits.js

// Exploit 1: Price Manipulation
async function testPriceHack() {
  const response = await fetch('/api/orders', {
    method: 'POST',
    body: JSON.stringify({
      items: [{ id: 'burger', price: 200, quantity: 1 }],
      totalAmount: 1  // ⚠️ Fake price
    })
  });
  // Should FAIL but currently SUCCEEDS
}

// Exploit 2: Negative Balance
async function testOverdraft() {
  // User has ₹0
  const response = await fetch('/api/orders', {
    method: 'POST',
    body: JSON.stringify({
      totalAmount: 500,
      paymentMethod: 'wallet'
    })
  });
  // Should FAIL but currently allows negative balance
}

// Exploit 3: Points Fraud
async function testPointsHack() {
  const response = await fetch('/api/orders', {
    method: 'POST',
    body: JSON.stringify({
      totalAmount: 10,
      loyaltyPointsEarned: 999999  // ⚠️ Fake points
    })
  });
  // Should recalculate but currently trusts client
}
```

---

**CONCLUSION:** Your app has 7 critical payment/fraud vulnerabilities. These must be fixed before production!
