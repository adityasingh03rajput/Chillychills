import express from 'express';
import mongoose from 'mongoose';
import MenuItem from '../models/MenuItem.js';

const router = express.Router();

// GET /api/menu - Fetch all menu items
router.get('/', async (req, res) => {
    try {
        const { category, available } = req.query;

        const query = {};
        if (category) query.category = category;
        if (available !== undefined) query.available = available === 'true';

        const menu = await MenuItem.find(query)
            .sort({ category: 1, name: 1 })
            .lean();

        // Manually map _id to id since .lean() bypasses schema transforms
        const formattedMenu = menu.map(item => ({
            ...item,
            id: item.id || item._id // Use existing id field, fallback to _id
        }));

        res.json(formattedMenu);
    } catch (error) {
        console.error('GET /menu error:', error);
        res.status(500).json({ error: 'Failed to fetch menu' });
    }
});

// POST /api/menu/seed - Seed menu with initial data
router.post('/seed', async (req, res) => {
    try {
        const { items } = req.body;

        // Delete existing menu items
        await MenuItem.deleteMany({});

        // Insert new items
        const inserted = await MenuItem.insertMany(items);

        res.json({ message: 'Menu seeded successfully', count: inserted.length });
    } catch (error) {
        console.error('POST /menu/seed error:', error);
        res.status(500).json({ error: 'Failed to seed menu' });
    }
});

// POST /api/menu - Add new menu item
router.post('/', async (req, res) => {
    try {
        const itemData = req.body;

        // Generate ID if missing
        if (!itemData.id) {
            // Import mongoose dynamically or assume it's available? 
            // Better to use a simple random string or require mongoose.
            // Since this is a module, I should add import. 
            // For now, I'll use a simple random string + timestamp to match the style of other IDs if they are not ObjectIds.
            // But verify schema says "String". 
            // Using a crypto randomUUID or similar is better, but let's use a safe fallback.
            itemData.id = 'menu_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        }

        // Handle price mapping if frontend sends something else (just in case)
        if (itemData.basePrice && !itemData.price) itemData.price = itemData.basePrice;

        const menuItem = new MenuItem(itemData);
        await menuItem.save();

        // Emit Socket.io event for menu update
        const io = req.app.get('io');
        io.emit('menuUpdate', { action: 'add', item: menuItem.toObject() });

        res.status(201).json(menuItem);
    } catch (error) {
        console.error('POST /menu error:', error);
        res.status(500).json({ error: 'Failed to add menu item' });
    }
});

// PUT /api/menu/:id - Update menu item
router.put('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const query = {
            $or: [
                { id: id }
            ]
        };

        if (mongoose.Types.ObjectId.isValid(id)) {
            query.$or.push({ _id: id });
        }

        const menuItem = await MenuItem.findOneAndUpdate(
            query,
            req.body,
            { new: true, runValidators: true }
        ).lean();

        if (!menuItem) {
            return res.status(404).json({ error: 'Menu item not found' });
        }

        // Emit Socket.io event for menu update
        const io = req.app.get('io');

        // Ensure id field is set
        const formattedItem = { ...menuItem, id: menuItem.id || menuItem._id };
        io.emit('menuUpdate', { action: 'update', item: formattedItem });

        res.json(formattedItem);
    } catch (error) {
        console.error('PUT /menu/:id error:', error);
        res.status(500).json({ error: 'Failed to update menu item' });
    }
});

export default router;
