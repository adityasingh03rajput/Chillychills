import express from 'express';
import Selfie from '../models/Selfie.js';
import { v2 as cloudinary } from 'cloudinary';

// Cloudinary Configuration
cloudinary.config({
    cloud_name: 'do4hohdv9',
    api_key: '212559828871492',
    api_secret: 'yXEguKc8NiFXJ8ghsbMQrMmczi8'
});

const router = express.Router();

// Get the current best selfie (approved for the day)
// Get the active approved selfies (max 6)
router.get('/best', async (req, res) => {
    try {
        // Return active approved selfies up to 6
        // TTL index handles expiry, so we just get approved ones
        const activeSnaps = await Selfie.find({ status: 'approved' })
            .sort({ approvedAt: -1, createdAt: -1 })
            .limit(6);

        res.json(activeSnaps);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Submit a new selfie
router.post('/', async (req, res) => {
    try {
        const { userId, userName, imageUrl, caption } = req.body;

        let finalImageUrl = imageUrl;

        // If it's a base64 string, upload to Cloudinary
        if (imageUrl && imageUrl.startsWith('data:image')) {
            try {
                const uploadResult = await cloudinary.uploader.upload(imageUrl, {
                    folder: 'canteen-selfies',
                });
                finalImageUrl = uploadResult.secure_url;
            } catch (uploadError) {
                console.error('Cloudinary upload failed:', uploadError);
                return res.status(500).json({ error: 'Image upload failed' });
            }
        }

        const newSelfie = new Selfie({
            userId,
            userName,
            imageUrl: finalImageUrl,
            caption
        });

        await newSelfie.save();

        // Notify managers via socket
        const io = req.app.get('io');
        if (io) {
            io.to('manager').emit('newSelfie', newSelfie);
        }

        res.status(201).json(newSelfie);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Manager: Get all pending selfies
router.get('/pending', async (req, res) => {
    try {
        const pending = await Selfie.find({ status: 'pending' }).sort({ createdAt: -1 });
        res.json(pending);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Manager: Approve/Reject selfie
router.put('/:id/status', async (req, res) => {
    try {
        const { status, isBest } = req.body;
        const selfie = await Selfie.findById(req.params.id);

        if (!selfie) {
            return res.status(404).json({ error: 'Selfie not found' });
        }

        selfie.status = status;
        if (status === 'approved') {
            selfie.approvedAt = new Date();
            if (isBest) {
                selfie.isBest = true;
            }
        }

        await selfie.save();

        if (status === 'approved' && isBest) {
            const io = req.app.get('io');
            if (io) {
                io.emit('bestSelfieUpdated', selfie);
            }
        }

        res.json(selfie);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Manager: Delete selfie (Junk)
router.delete('/:id', async (req, res) => {
    try {
        const selfie = await Selfie.findByIdAndDelete(req.params.id);
        if (!selfie) {
            return res.status(404).json({ error: 'Selfie not found' });
        }
        res.json({ message: 'Selfie deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
