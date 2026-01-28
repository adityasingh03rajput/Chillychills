import express from 'express';
import GiftCard from '../models/GiftCard.js';
import User from '../models/User.js';
import crypto from 'crypto';

const router = express.Router();

// Helper to generate a unique code
const generateCode = () => {
    return 'CHILL-' + crypto.randomBytes(4).toString('hex').toUpperCase();
};

// POST /api/giftcards/purchase - Generate a redeemable code for a specific target user
router.post('/purchase', async (req, res) => {
    try {
        const { purchaserId, targetUserId, amount, bonus } = req.body;

        if (!targetUserId) {
            return res.status(400).json({ error: 'Recipient ID is mandatory' });
        }

        const code = generateCode();
        const giftCard = new GiftCard({
            code,
            amount,
            bonus,
            targetUserId,
            purchasedBy: purchaserId
        });

        await giftCard.save();

        res.json({ success: true, code, targetUserId, amount, bonus });
    } catch (error) {
        console.error('POST /giftcards/purchase error:', error);
        res.status(500).json({ error: 'Failed to generate gift code' });
    }
});

// POST /api/giftcards/redeem - Redeem a code (Must match targetUserId)
router.post('/redeem', async (req, res) => {
    try {
        const { code, userId } = req.body;

        const giftCard = await GiftCard.findOne({ code, isRedeemed: false });

        if (!giftCard) {
            return res.status(404).json({ error: 'Invalid or already redeemed code' });
        }

        // Security Check: Only target user can redeem
        if (giftCard.targetUserId !== userId) {
            return res.status(403).json({ error: 'This transmission is locked to a different sector/user.' });
        }

        giftCard.isRedeemed = true;
        giftCard.redeemedBy = userId;
        giftCard.redeemedAt = new Date();
        await giftCard.save();

        const user = await User.findOneAndUpdate(
            { id: userId },
            { $inc: { balance: giftCard.amount + giftCard.bonus } },
            { new: true }
        );

        res.json({ success: true, amount: giftCard.amount, bonus: giftCard.bonus, user });
    } catch (error) {
        console.error('POST /giftcards/redeem error:', error);
        res.status(500).json({ error: 'Failed to redeem gift card' });
    }
});

// GET /api/giftcards/all - Fetch all gift cards for Manager Dashboard
router.get('/all', async (req, res) => {
    try {
        const giftCards = await GiftCard.find().sort({ createdAt: -1 });
        res.json(giftCards);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch registry' });
    }
});

export default router;
