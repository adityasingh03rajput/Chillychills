import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import * as kv from "./kv_store.tsx";

const app = new Hono();

app.use("/*", cors({
  origin: "*",
  allowHeaders: ["Content-Type", "Authorization"],
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  maxAge: 600,
}));

const BASE = "/make-server-c5be6db3";

app.get(BASE + "/health", (c) => c.json({ status: "ok" }));

app.get(BASE + "/menu", async (c) => {
  const menu = await kv.get('menu').catch(() => []);
  return c.json(menu || []);
});

app.post(BASE + "/menu/seed", async (c) => {
  const { items } = await c.req.json();
  await kv.set('menu', items).catch(() => {});
  return c.json({ success: true });
});

app.put(BASE + "/menu/:id", async (c) => {
  const id = c.req.param('id');
  const updates = await c.req.json();
  const menu = await kv.get('menu').catch(() => []) || [];
  const updated = menu.map((i: any) => i.id === id ? { ...i, ...updates } : i);
  await kv.set('menu', updated).catch(() => {});
  return c.json(updated.find((i: any) => i.id === id) || {});
});

app.post(BASE + "/menu/add", async (c) => {
  const item = await c.req.json();
  const menu = await kv.get('menu').catch(() => []) || [];
  await kv.set('menu', [...menu, item]).catch(() => {});
  return c.json(item);
});

app.get(BASE + "/orders", async (c) => {
  const orders = await kv.getByPrefix('order_').catch(() => []);
  return c.json(orders || []);
});

app.post(BASE + "/orders", async (c) => {
  const data = await c.req.json();
  const id = `order_${Date.now()}`;
  const order = { ...data, id, createdAt: Date.now(), status: 'placed' };
  await kv.set(id, order).catch(() => {});
  return c.json(order);
});

app.put(BASE + "/orders/:id", async (c) => {
  const id = c.req.param('id');
  const update = await c.req.json();
  const existing = await kv.get(id).catch(() => null);
  if (!existing) return c.json({ error: "Not found" }, 404);
  const updated = { ...existing, ...update };
  await kv.set(id, updated).catch(() => {});
  return c.json(updated);
});

app.get(BASE + "/recommendations/:userId", async (c) => {
  const userId = c.req.param('userId');
  let recs = await kv.get(`recommendations_${userId}`).catch(() => null);
  if (!recs) {
    recs = [{ friendName: 'Sarah', item: 'Burger', time: Date.now() }];
  }
  return c.json(recs);
});

app.post(BASE + "/recommendations/send", async (c) => {
  await c.req.json();
  return c.json({ success: true });
});

app.post(BASE + "/gift-cards/purchase", async (c) => {
  const { userId, amount, bonus } = await c.req.json();
  const code = `CHILL-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  const card = { code, amount, bonus, totalValue: amount + bonus, claimed: false };
  await kv.set(`giftcard_${code}`, card).catch(() => {});
  return c.json(card);
});

app.post(BASE + "/gift-cards/claim", async (c) => {
  const { code } = await c.req.json();
  const card = await kv.get(`giftcard_${code}`).catch(() => null);
  if (!card) return c.json({ error: "Invalid" }, 404);
  if (card.claimed) return c.json({ error: "Claimed" }, 400);
  card.claimed = true;
  await kv.set(`giftcard_${code}`, card).catch(() => {});
  return c.json({ success: true, totalValue: card.totalValue });
});

app.post(BASE + "/feedback", async (c) => {
  await c.req.json();
  return c.json({ success: true });
});

app.get(BASE + "/collection/:userId", async (c) => {
  const col = { badges: [{ name: 'Burger King', icon: '🍔', unlocked: true }] };
  return c.json(col);
});

app.all("*", (c) => c.json({ error: 'Not Found' }, 404));

Deno.serve(async (req) => {
  try {
    return await app.fetch(req);
  } catch (error) {
    console.error("Request error:", error);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
