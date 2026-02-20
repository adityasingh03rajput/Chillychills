# 🔍 ChillyChills - Deep Scan Report #2

## 🚨 **NEW CRITICAL SECURITY ISSUES**

### 1. **PLAINTEXT PASSWORD STORAGE** ⚠️⚠️⚠️
**Severity:** 🔴 **CRITICAL - IMMEDIATE FIX REQUIRED**
**Location:** `server/src/routes/auth.js`, `server/src/models/User.js`

**Problem:**
Passwords are stored in **PLAIN TEXT** in the database!

```javascript
// auth.js:19
password, // In a real app, hash this!

// auth.js:38
if (!user || user.password !== password) {
```

**Impact:**
- Anyone with database access can see all passwords
- If database is compromised, all accounts are exposed
- Users who reuse passwords are at risk across platforms

**Fix Required:**
```javascript
import bcrypt from 'bcrypt';

// Signup
const hashedPassword = await bcrypt.hash(password, 10);
const user = new User({
    id,
    name,
    password: hashedPassword,
    ...
});

// Login
const isValid = await bcrypt.compare(password, user.password);
if (!isValid) {
    return res.status(401).json({ error: 'Invalid credentials' });
}
```

---

### 2. **NO INPUT SANITIZATION - XSS VULNERABILITY** ⚠️
**Severity:** 🔴 HIGH
**Location:** Multiple endpoints

**Problem:**
User inputs are stored and displayed without sanitization.

**Vulnerable Fields:**
- Feedback comments (`feedback.js:9`)
- Order notes (displayed in kitchen)
- User names
- Rejection reasons

**Example Attack:**
```javascript
// User submits feedback:
{
    comment: "<script>alert('XSS')</script>"
}

// This gets stored and displayed to staff, executing the script
```

**Fix Required:**
```javascript
import xss from 'xss';

const sanitizedComment = xss(comment);
```

---

### 3. **GIFT CARD REDEMPTION RACE CONDITION** ⚠️
**Severity:** 🔴 HIGH
**Location:** `server/src/routes/giftcards.js:41-71`

**Problem:**
Two users can redeem the same gift card if they submit simultaneously.

```javascript
// Line 45: Check if redeemed
const giftCard = await GiftCard.findOne({ code, isRedeemed: false });

// Line 56-58: Mark as redeemed (separate operation)
giftCard.isRedeemed = true;
await giftCard.save();

// Race condition window between check and save
```

**Fix Required:**
```javascript
// Use atomic findOneAndUpdate
const giftCard = await GiftCard.findOneAndUpdate(
    { code, isRedeemed: false, targetUserId: userId },
    { $set: { isRedeemed: true, redeemedBy: userId, redeemedAt: new Date() } },
    { new: true }
);

if (!giftCard) {
    return res.status(404).json({ error: 'Invalid or already redeemed code' });
}
```

---

### 4. **UNLIMITED GIFT CARD PURCHASES** ⚠️
**Severity:** 🔴 MEDIUM-HIGH
**Location:** `server/src/routes/giftcards.js:14-37`

**Problem:**
No validation on gift card purchase:
- No balance check (can buy without money)
- No amount limits
- No deduction from purchaser's wallet

```javascript
// User can create $1,000,000 gift card for free!
POST /api/giftcards/purchase
{
    "amount": 1000000,
    "bonus": 500000,
    "targetUserId": "myself"
}
```

**Fix Required:**
```javascript
// Validate amount
if (amount < 10 || amount > 10000) {
    return res.status(400).json({ error: 'Amount must be between ₹10-₹10,000' });
}

// Deduct from purchaser's balance
const purchaser = await User.findOne({ id: purchaserId });
if (!purchaser || purchaser.balance < amount + bonus) {
    return res.status(400).json({ error: 'Insufficient balance' });
}

await User.findOneAndUpdate(
    { id: purchaserId },
    { $inc: { balance: -(amount + bonus) } }
);
```

---

### 5. **MENU SEED ENDPOINT IS PUBLIC** ⚠️
**Severity:** 🔴 MEDIUM
**Location:** `server/src/routes/menu.js:34-48`

**Problem:**
Anyone can DELETE ALL MENU ITEMS and replace with their own!

```javascript
// Line 39: Deletes everything!
await MenuItem.deleteMany({});
```

**Fix Required:**
Add authentication and role check (manager only).

---

## ⚠️ **DATA INTEGRITY ISSUES**

### 6. **FEEDBACK CAN BE SUBMITTED MULTIPLE TIMES**
**Location:** `server/src/routes/feedback.js:7-31`

**Problem:**
No check if feedback already exists. Users can spam ratings.

**Fix Required:**
```javascript
const order = await Order.findById(id);
if (order.feedback) {
    return res.status(400).json({ error: 'Feedback already submitted' });
}
```

---

### 7. **NO RATING VALIDATION**
**Location:** `server/src/routes/feedback.js:9-17`

**Problem:**
Rating could be anything (negative, > 5, non-numeric).

**Fix Required:**
```javascript
if (typeof rating !== 'number' || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be 1-5' });
}
```

---

### 8. **MENU ITEM PRICE MANIPULATION**
**Location:** `server/src/routes/menu.js:84-120`

**Problem:**
Anyone can update menu item prices (no auth).

```javascript
PUT /api/menu/m1
{
    "price": 0.01
}
// Now burgers cost 1 paisa!
```

---

### 9. **BALANCE ROUTE QUERY INJECTION**
**Location:** `server/src/routes/balance.js:40-64`

**Problem:**
No validation on query parameters. Could cause infinite loop.

```javascript
GET /api/balance/range?startYear=2000&endYear=3000
// Generates 12,000 queries!
```

**Fix Required:**
```javascript
const startYear = parseInt(req.query.startYear);
const endYear = parseInt(req.query.endYear);

if (endYear - startYear > 24) {
    return res.status(400).json({ error: 'Maximum 24 months range' });
}
```

---

## 🐛 **LOGIC BUGS**

### 10. **FLASH SALE TTL NOT ENFORCED IN QUERY**
**Location:** `server/src/routes/orders.js:40`

**Problem:**
Flash sales are queried only by `status: 'active'`, but MongoDB TTL deletion is asynchronous. Expired items may still appear.

**Fix Required:**
```javascript
const sales = await FlashSale.find({ 
    status: 'active',
    createdAt: { $gte: Date.now() - 30*60*1000 } 
}).sort({ createdAt: -1 });
```

---

### 11. **MONTHLY BALANCE LOOP VULNERABILITY**
**Location:** `server/src/routes/balance.js:52-56`

**Problem:**
Date loop does not handle invalid dates or year boundaries correctly.

```javascript
for (let d = new Date(start); d <= end; d.setMonth(d.getMonth() + 1)) {
    // If start > end, infinite loop!
}
```

**Fix Required:**
Add boundary checks and max iteration limit.

---

### 12. **NO VALIDATION ON ORDER ITEMS ARRAY**
**Location:** `server/src/routes/orders.js:103`

**Problem:**
Order can be created with empty items array.

```javascript
{
    "items": [],
    "totalAmount": 0
}
// Creates ghost order
```

**Fix Required:**
```javascript
if (!orderData.items || orderData.items.length === 0) {
    return res.status(400).json({ error: 'Order must contain at least one item' });
}
```

---

## 🔒 **MISSING AUTHENTICATION**

### 13. **ALL ENDPOINTS ARE PUBLIC**
**Severity:** 🔴 CRITICAL for production

No authentication on:
- ✅ `/api/users/:id/balance` - Anyone can add money
- ✅ `/api/menu` - Anyone can modify menu
- ✅ `/api/orders` - Anyone can see all orders
- ✅ `/api/giftcards/all` - Anyone can see gift card codes
- ✅ `/api/balance` - Anyone can see revenue data

**Fix Required:**
Implement JWT middleware for all protected routes.

---

## 📊 **PRIORITY MATRIX**

| Issue | Severity | Exploitability | Fix Complexity |
|-------|----------|----------------|----------------|
| Plaintext Passwords | CRITICAL | Easy | Medium |
| Gift Card Race | HIGH | Medium | Easy |
| Gift Card Free Money | HIGH | Easy | Easy |
| XSS Injection | HIGH | Easy | Easy |
| Public Menu Seed | MEDIUM | Easy | Easy |
| No Authentication | CRITICAL | Easy | High |
| Flash Sale TTL | MEDIUM | Medium | Easy |

---

## 🚀 **IMMEDIATE ACTION ITEMS**

### Priority 1 (This Week):
1. ✅ Add password hashing (bcrypt)
2. ✅ Fix gift card race condition
3. ✅ Add gift card payment validation
4. ✅ Add input sanitization (XSS protection)

### Priority 2 (Next Week):
5. ✅ Add authentication middleware
6. ✅ Add role-based access control
7. ✅ Add request rate limiting
8. ✅ Fix flash sale TTL query

### Priority 3 (Later):
9. ✅ Add comprehensive input validation
10. ✅ Add audit logging
11. ✅ Add CSRF protection
12. ✅ Security headers (helmet.js)

---

## 💡 **RECOMMENDATIONS**

1. **Use Environment-Based Security:**
   ```javascript
   if (process.env.NODE_ENV === 'production') {
       // Enforce HTTPS
       // Require strong passwords
       // Enable rate limiting
   }
   ```

2. **Add Request Validation Layer:**
   ```javascript
   import { body, validationResult } from 'express-validator';
   
   router.post('/feedback', [
       body('rating').isInt({ min: 1, max: 5 }),
       body('comment').trim().escape().isLength({ max: 500 })
   ], async (req, res) => { ... });
   ```

3. **Implement Audit Trail:**
   - Log all balance changes
   - Log all gift card redemptions
   - Log all admin actions

---

## 📝 **TESTING SCRIPT**

Create `server/security_test.js`:

```javascript
// Test 1: Gift Card Double Redemption
async function testGiftCardRace() {
    const code = 'CHILL-TESTCODE';
    const promises = Array(10).fill().map(() => 
        fetch('/api/giftcards/redeem', {
            method: 'POST',
            body: JSON.stringify({ code, userId: 'test' })
        })
    );
    const results = await Promise.all(promises);
    const successful = results.filter(r => r.ok).length;
    console.log(`✅ Only ${successful} redemptions succeeded (should be 1)`);
}

// Test 2: XSS in Feedback
async function testXSS() {
    await fetch('/api/feedback', {
        method: 'POST',
        body: JSON.stringify({
            id: 'test',
            rating: 5,
            comment: '<script>alert("XSS")</script>'
        })
    });
    // Check if script is escaped in response
}
```

---

## 🎯 **SUMMARY**

**Total Issues Found:** 13 new issues  
**Critical:** 3 (Passwords, Auth, Gift Cards)  
**High:** 4 (XSS, Race Conditions, Validation)  
**Medium:** 6 (Menu Security, Data Integrity)

**Estimated Fix Time:** 2-3 days for critical issues
