import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Middleware
app.use('*', logger(console.log));
app.use("/*", cors({
  origin: "*",
  allowHeaders: ["Content-Type", "Authorization"],
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  exposeHeaders: ["Content-Length"],
  maxAge: 600,
}));

const BASE = "/make-server-c5be6db3";

// Health check
app.get(BASE + "/health", (c) => c.json({ status: "ok" }));

// Menu Routes
app.get(BASE + "/menu", async (c) => {
  try {
    const menu = await kv.get('menu');
    return c.json(menu || []);
  } catch (e: any) {
    console.error('Menu error:', e.message);
    return c.json([]);
  }
});

app.post(BASE + "/menu/seed", async (c) => {
  try {
    const { items } = await c.req.json();
    await kv.set('menu', items);
    return c.json({ success: true, count: items.length });
  } catch (e: any) {
    console.error('Seed error:', e.message);
    return c.json({ error: e.message }, 500);
  }
});

app.put(BASE + "/menu/:id", async (c) => {
  try {
    const id = c.req.param('id');
    const updates = await c.req.json();
    const menu = (await kv.get('menu')) || [];
    const updatedMenu = menu.map((item: any) => 
      item.id === id ? { ...item, ...updates } : item
    );
    await kv.set('menu', updatedMenu);
    const item = updatedMenu.find((i: any) => i.id === id);
    return c.json(item || { error: 'Not found' });
  } catch (e: any) {
    console.error('Update error:', e.message);
    return c.json({ error: e.message }, 500);
  }
});

app.post(BASE + "/menu/add", async (c) => {
  try {
    const newItem = await c.req.json();
    const menu = (await kv.get('menu')) || [];
    await kv.set('menu', [...menu, newItem]);
    return c.json(newItem);
  } catch (e: any) {
    console.error('Add error:', e.message);
    return c.json({ error: e.message }, 500);
  }
});

// Orders
app.get(BASE + "/orders", async (c) => {
  try {
    const orders = await kv.getByPrefix('order_');
    return c.json(orders || []);
  } catch (e: any) {
    console.error('Orders error:', e.message);
    return c.json([]);
  }
});

app.post(BASE + "/orders", async (c) => {
  try {
    const data = await c.req.json();
    const id = `order_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const order = { ...data, id, createdAt: Date.now(), status: 'placed' };
    await kv.set(id, order);
    return c.json(order);
  } catch (e: any) {
    console.error('Create order error:', e.message);
    return c.json({ error: e.message }, 500);
  }
});

app.put(BASE + "/orders/:id", async (c) => {
  try {
    const id = c.req.param('id');
    const update = await c.req.json();
    const existing = await kv.get(id);
    if (!existing) return c.json({ error: "Not found" }, 404);
    const updated = { ...existing, ...update };
    await kv.set(id, updated);
    return c.json(updated);
  } catch (e: any) {
    console.error('Update order error:', e.message);
    return c.json({ error: e.message }, 500);
  }
});

// Recommendations
app.get(BASE + "/recommendations/:userId", async (c) => {
  try {
    const userId = c.req.param('userId');
    let recs = await kv.get(`recommendations_${userId}`);
    if (!recs) {
      recs = [
        { friendName: 'Sarah', item: 'Spicy Paneer Burger', time: Date.now() - 120000 },
        { friendName: 'Mike', item: 'Mint Mojito', time: Date.now() - 900000 },
      ];
      await kv.set(`recommendations_${userId}`, recs);
    }
    return c.json(recs);
  } catch (e: any) {
    console.error('Recs error:', e.message);
    return c.json([]);
  }
});

app.post(BASE + "/recommendations/send", async (c) => {
  try {
    await c.req.json(); // Consume body
    return c.json({ success: true });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

// Gift Cards
app.post(BASE + "/gift-cards/purchase", async (c) => {
  try {
    const { userId, amount, bonus } = await c.req.json();
    const code = `CHILL-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    const card = { code, amount, bonus, totalValue: amount + bonus, purchasedBy: userId, purchasedAt: Date.now(), claimed: false };
    await kv.set(`giftcard_${code}`, card);
    return c.json(card);
  } catch (e: any) {
    console.error('Purchase error:', e.message);
    return c.json({ error: e.message }, 500);
  }
});

app.post(BASE + "/gift-cards/claim", async (c) => {
  try {
    const { code, userId } = await c.req.json();
    const card = await kv.get(`giftcard_${code}`);
    if (!card) return c.json({ error: "Invalid code" }, 404);
    if (card.claimed) return c.json({ error: "Already claimed" }, 400);
    card.claimed = true;
    card.claimedBy = userId;
    await kv.set(`giftcard_${code}`, card);
    const wallet = (await kv.get(`wallet_${userId}`)) || { balance: 0 };
    wallet.balance += card.totalValue;
    await kv.set(`wallet_${userId}`, wallet);
    return c.json({ success: true, totalValue: card.totalValue, newBalance: wallet.balance });
  } catch (e: any) {
    console.error('Claim error:', e.message);
    return c.json({ error: e.message }, 500);
  }
});

// Feedback
app.post(BASE + "/feedback", async (c) => {
  try {
    const data = await c.req.json();
    const id = `feedback_${Date.now()}`;
    await kv.set(id, { ...data, id, createdAt: Date.now() });
    return c.json({ success: true });
  } catch (e: any) {
    console.error('Feedback error:', e.message);
    return c.json({ error: e.message }, 500);
  }
});

// Collection
app.get(BASE + "/collection/:userId", async (c) => {
  try {
    const userId = c.req.param('userId');
    let collection = await kv.get(`collection_${userId}`);
    if (!collection) {
      collection = {
        badges: [
          { name: 'Burger King', icon: '🍔', desc: 'Ordered 50 Burgers', unlocked: true },
          { name: 'Caffeine Addict', icon: '☕', desc: 'Ordered 20 Coffees', unlocked: true },
        ]
      };
      await kv.set(`collection_${userId}`, collection);
    }
    return c.json(collection);
  } catch (e: any) {
    console.error('Collection error:', e.message);
    return c.json({ badges: [] });
  }
});

// 404
app.notFound((c) => c.json({ error: 'Not Found' }, 404));

// Error handler
app.onError((err, c) => {
  console.error('Error:', err);
  return c.json({ error: err.message }, 500);
});

export default { fetch: app.fetch };
