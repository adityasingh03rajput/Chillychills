# 📲 Direct UPI Wallet Top-Up (Zero KYC)

This system allows students to top-up their wallet by paying you directly via UPI and entering the 12-digit Transaction ID (UTR).

---

## 🛠️ Step 1: Set your UPI ID
Update your `server/.env` with your actual UPI ID:
```bash
MERCHANT_UPI_ID=yourname@okaxis
MERCHANT_NAME=Campus_Canteen
```

---

## 💻 Step 2: Implementation in React

### 1. Generating the QR Code
You can use a library like `react-qr-code` to show the payment QR. The UPI link format is:
`upi://pay?pa={MERCHANT_UPI_ID}&pn={MERCHANT_NAME}&am={AMOUNT}&cu=INR&tn=Wallet_Topup`

### 2. Frontend Flow
Create a component where students enter the amount and the UTR.

```typescript
// src/components/DirectUpiTopUp.tsx
import React, { useState } from 'react';
import { toast } from 'sonner';

export const DirectUpiTopUp = () => {
  const [amount, setAmount] = useState(100);
  const [utr, setUtr] = useState('');
  const [step, setStep] = useState(1); // 1: Pay, 2: Verify

  const handleVerify = async () => {
    try {
      const response = await fetch('/api/payment/verify-utr', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({ amount, utr })
      });

      const result = await response.json();
      if (result.success) {
        toast.success(result.message);
        // Refresh balance...
      } else {
        toast.error(result.error);
      }
    } catch (err) {
      toast.error("Verification failed");
    }
  };

  return (
    <div className="p-6 bg-white rounded-3xl shadow-lg max-w-md mx-auto">
      {step === 1 ? (
        <>
          <h2 className="text-2xl font-bold text-rose-600 mb-4">Step 1: Pay</h2>
          <input 
            type="number" 
            value={amount} 
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full p-4 mb-4 border-2 border-rose-100 rounded-2xl focus:border-rose-500 outline-none"
            placeholder="Amount to add"
          />
          <div className="bg-rose-50 p-4 rounded-2xl mb-6">
            <p className="text-sm text-gray-600 mb-2">Scan & Pay ₹{amount} to:</p>
            <p className="font-mono font-bold text-rose-700">yourname@okaxis</p>
          </div>
          <button 
            onClick={() => setStep(2)}
            className="w-full py-4 bg-rose-500 text-white rounded-2xl font-bold shadow-lg shadow-rose-200"
          >
            I have paid
          </button>
        </>
      ) : (
        <>
          <h2 className="text-2xl font-bold text-blue-600 mb-4">Step 2: Verify</h2>
          <p className="text-gray-500 mb-4">Enter the 12-digit Transaction ID (UTR) from your GPay/PhonePe screen.</p>
          <input 
            type="text" 
            maxLength={12}
            value={utr}
            onChange={(e) => setUtr(e.target.value)}
            className="w-full p-4 mb-4 border-2 border-blue-100 rounded-2xl focus:border-blue-500 outline-none font-mono tracking-widest"
            placeholder="123456789012"
          />
          <button 
            onClick={handleVerify}
            className="w-full py-4 bg-blue-500 text-white rounded-2xl font-bold shadow-lg shadow-blue-200"
          >
            Submit for Verification
          </button>
          <button onClick={() => setStep(1)} className="w-full mt-4 text-gray-400">Back</button>
        </>
      )}
    </div>
  );
};
```

---

## 🔎 Manager Tip: How to Audit
If a student claims they paid but the system says "UTR used", or if you want to spot-check:
1. Open your Bank App / UPI App history.
2. Search for the **12-digit UTR** the student entered.
3. If the amount matches the UTR in your bank history, they are telling the truth.
4. The system **automatically blocks** anyone trying to guess UTRs or reuse old ones.
