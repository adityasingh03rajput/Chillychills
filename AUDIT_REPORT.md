# 🔍 ChillyChills Codebase Audit Report

## 🚨 CRITICAL ISSUES (HIGH PRIORITY)

### 1. **Race Condition: Double Payment Deduction**
**Location:** `server/src/routes/orders.js:97-120`
**Severity:** ⚠️ CRITICAL - Users can lose money

**Problem:**
When a user places an order, the wallet balance is deducted AFTER the order is saved to the database. If the user quickly places multiple orders, the balance check happens before the deduction is saved, allowing them to overdraw.

**Current Flow:**
```javascript
// 1. Order saved first
const order = new Order(orderData);
await order.save();

// 2. Balance deducted AFTER (race condition window)
if (orderData.paymentMethod === 'wallet') {
    await User.findOneAndUpdate(
        { id: orderData.userId },
        { $inc: { balance: -Number(orderData.totalAmount) } }
    );
}
```

**Fix Required:**
```javascript
// Check balance FIRST, then deduct atomically
const user = await User.findOne({ id: orderData.userId });
if (orderData.paymentMethod === 'wallet') {
    if (user.balance < orderData.totalAmount) {
        return res.status(400).json({ error: 'Insufficient balance' });
    }
    
    // Atomic operation - deduct first
    const updatedUser = await User.findOneAndUpdate(
        { id: orderData.userId, balance: { $gte: orderData.totalAmount } },
        { $inc: { balance: -Number(orderData.totalAmount) } },
        { new: true }
    );
    
    if (!updatedUser) {
        return res.status(400).json({ error: 'Insufficient balance' });
    }
}

// Then save order
const order = new Order(orderData);
await order.save();
```

---

### 2. **Missing Balance Validation in Frontend**
**Location:** `src/screens/CartScreen.tsx:18-36`
**Severity:** ⚠️ HIGH - Poor UX, users can attempt invalid orders

**Problem:**
The frontend checks balance ONLY for wallet payment, but doesn't prevent the order if balance becomes insufficient between check and submission (e.g., if another window/tab places an order).

**Fix Required:**
Add real-time balance checking before submission and handle backend error properly.

---

### 3. **Flash Sale Race Condition**
**Location:** `server/src/routes/orders.js:54-64`
**Severity:** ⚠️ HIGH - Multiple users can "rescue" the same item

**Problem:**
When checking if a flash sale is active and marking it as sold, there's no atomic lock. Two users clicking "rescue" simultaneously can both pass the `status === 'active'` check.

**Current Code:**
```javascript
const flashItem = await FlashSale.findById(orderData.flashSaleId);
if (!flashItem || flashItem.status !== 'active') {
    return res.status(400).json({ error: 'Item already rescued by someone else.' });
}
flashItem.status = 'sold';
await flashItem.save();
```

**Fix Required:**
```javascript
// Use atomic findOneAndUpdate with condition
const flashItem = await FlashSale.findOneAndUpdate(
    { _id: orderData.flashSaleId, status: 'active' },
    { $set: { status: 'sold' } },
    { new: true }
);

if (!flashItem) {
    return res.status(400).json({ error: 'Item already rescued by someone else.' });
}
```

---

### 4. **No Transaction Rollback on Flash Sale Failure**
**Location:** `server/src/routes/orders.js:49-92`
**Severity:** ⚠️ HIGH - Money can be deducted without order creation

**Problem:**
If the flash sale logic succeeds (marks item as sold, refunds User A) but then the order creation fails, User B loses money and User A gets an undeserved refund.

**Fix Required:**
Wrap the entire flash sale flow in a MongoDB transaction or use a saga pattern.

---

## ⚠️ IMPORTANT ISSUES (MEDIUM PRIORITY)

### 5. **Optimistic UI Update Without Proper Error Handling**
**Location:** `src/App.tsx:211-272`
**Severity:** MEDIUM - Can confuse users

**Problem:**
Cart is cleared and user sees "Order Placed!" toast BEFORE the backend confirms success. If the backend fails, the cart is restored, but the user has already seen a success message.

**Impact:** User confusion, especially with poor network.

**Recommendation:**
- Show "Submitting..." state instead of immediate success
- Only show success after backend confirmation
- Keep cart visible with a loading overlay

---

### 6. **No Idempotency for Order Creation**
**Location:** `server/src/routes/orders.js:48-132`
**Severity:** MEDIUM - Duplicate orders possible

**Problem:**
If a user's request times out on the frontend but succeeds on the backend, they might retry and create a duplicate order.

**Fix Required:**
Add an idempotency key (e.g., client-generated UUID) to prevent duplicate orders:
```javascript
const existingOrder = await Order.findOne({ 
    userId: orderData.userId, 
    idempotencyKey: orderData.idempotencyKey 
});
if (existingOrder) {
    return res.status(200).json(existingOrder); // Return existing
}
```

---

### 7. **Token Collision Possible**
**Location:** `src/App.tsx:216`
**Severity:** MEDIUM - Orders could have duplicate tokens

**Code:**
```javascript
const token = `${branch || 'A'}${Math.floor(Math.random() * 900) + 100}`;
```

**Problem:**
Only 900 possible tokens per branch. High collision chance in busy cafes.

**Fix Required:**
```javascript
// Include timestamp for uniqueness
const token = `${branch || 'A'}${Date.now().toString().slice(-4)}${Math.floor(Math.random() * 100)}`;
```

---

### 8. **Refund Logic Doesn't Consider Mixed Orders**
**Location:** `server/src/routes/orders.js:195-211`
**Severity:** MEDIUM - Partial refunds may be incorrect

**Problem:**
When calculating refundable amount, it iterates through items, but if an order has both refundable and non-refundable items and is cancelled during 'preparing', the logic may double-process.

**Review Required:** Test with mixed cart items.

---

## 📋 MINOR ISSUES (LOW PRIORITY)

### 9. **Hardcoded User ID in App.tsx**
**Location:** `src/App.tsx:30`
**Code:**
```javascript
const [userId, setUserId] = useState<string>('user_123');
```

**Impact:** Default user for development. Not a bug, but could be confusing in production.

---

### 10. **No Input Sanitization**
**Location:** Multiple locations (user inputs)
**Severity:** LOW - XSS risk

**Problem:**
User inputs (order notes, refund reasons) are not sanitized before display.

**Fix Required:**
Use DOMPurify or escape HTML in all user-generated content.

---

### 11. **Wallet Balance Can Go Negative**
**Location:** `server/src/routes/users.js:45-49`
**Severity:** MEDIUM

**Problem:**
The balance update endpoint has no validation:
```javascript
{ $inc: { balance: amount } }
```

Anyone can send a negative amount and drain the wallet.

**Fix Required:**
```javascript
if (amount < 0) {
    return res.status(400).json({ error: 'Invalid amount' });
}
```

---

### 12. **No Retry Logic for Failed Refunds**
**Location:** `server/src/routes/orders.js:200-211`
**Severity:** MEDIUM

**Problem:**
If the refund update fails, there's no retry or logging for manual reconciliation.

**Fix Required:**
Add a refund queue or at least detailed error logging.

---

## 🎯 FLOW ISSUES

### 13. **User Can Cancel Order After 'Ready' Status**
**Location:** `src/screens/OrdersScreen.tsx:112`
**Severity:** LOW - UX issue

**Current Logic:**
Only orders in 'placed' status can be cancelled on frontend, but backend doesn't enforce this strictly.

**Fix Required:**
Add backend validation to prevent cancellation after 'preparing'.

---

### 14. **Flash Sale Expiry Not Visible to Users**
**Location:** Flash sale has 30-min TTL but no countdown
**Severity:** LOW - UX issue

Users don't know how long they have to rescue an item.

**Recommendation:**
Add a countdown timer in the UI.

---

## ✅ SECURITY REVIEW

### 15. **No Authentication/Authorization**
**Severity:** CRITICAL for production

All endpoints are public. Anyone can:
- Update any user's balance
- Cancel any order
- See all orders

**Fix Required:**
Implement JWT authentication and role-based access control.

---

### 16. **Cloudinary Credentials in .env**
**Status:** ✅ PROPERLY HANDLED
The credentials are in .env (not committed) and .gitignore is configured correctly.

---

## 📊 SUMMARY

### Critical (Fix Immediately):
1. ✅ Race condition in wallet deduction
2. ✅ Flash sale race condition
3. ✅ Transaction rollback for flash sales

### High Priority:
4. Frontend balance validation
5. Idempotency for orders
6. Token collision prevention

### Medium Priority:
7. Optimistic UI improvements
8. Refund logic review
9. Wallet balance can go negative
10. No retry for failed refunds

### Low Priority:
11. Input sanitization
12. UX improvements (countdown, better error messages)

---

## 🔧 RECOMMENDED ACTION PLAN

**Week 1:**
- Fix wallet deduction race condition
- Fix flash sale race condition
- Add transaction support

**Week 2:**
- Add idempotency keys
- Fix token generation
- Add authentication

**Week 3:**
- Improve error handling
- Add input validation
- UX polish
