import { projectId, publicAnonKey } from './supabase/info';
import { MenuItem, Order, User } from './types';

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-c5be6db3`;

const headers = {
  'Authorization': `Bearer ${publicAnonKey}`,
  'Content-Type': 'application/json',
};

export const api = {
  // --- Menu ---
  getMenu: async (): Promise<MenuItem[]> => {
    const res = await fetch(`${BASE_URL}/menu`, { headers });
    if (!res.ok) throw new Error('Failed to fetch menu');
    return res.json();
  },

  seedMenu: async (items: MenuItem[]) => {
    const res = await fetch(`${BASE_URL}/menu/seed`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ items }),
    });
    if (!res.ok) throw new Error('Failed to seed menu');
    return res.json();
  },

  addMenuItem: async (item: MenuItem): Promise<MenuItem> => {
    const res = await fetch(`${BASE_URL}/menu/add`, {
      method: 'POST',
      headers,
      body: JSON.stringify(item),
    });
    if (!res.ok) throw new Error('Failed to add menu item');
    return res.json();
  },

  updateMenuItem: async (id: string, updates: Partial<MenuItem>): Promise<MenuItem> => {
    const res = await fetch(`${BASE_URL}/menu/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update menu item');
    return res.json();
  },

  // --- Orders ---
  getOrders: async (): Promise<Order[]> => {
    const res = await fetch(`${BASE_URL}/orders`, { headers });
    if (!res.ok) throw new Error('Failed to fetch orders');
    return res.json();
  },

  createOrder: async (order: Partial<Order>): Promise<Order> => {
    const res = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers,
      body: JSON.stringify(order),
    });
    if (!res.ok) throw new Error('Failed to create order');
    return res.json();
  },

  updateOrder: async (id: string, updates: Partial<Order>): Promise<Order> => {
    const res = await fetch(`${BASE_URL}/orders/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update order');
    return res.json();
  },

  // --- Friend Recommendations ---
  getRecommendations: async (userId: string): Promise<any[]> => {
    const res = await fetch(`${BASE_URL}/recommendations/${userId}`, { headers });
    if (!res.ok) throw new Error('Failed to fetch recommendations');
    return res.json();
  },

  recommendToFriend: async (recommendation: any): Promise<any> => {
    const res = await fetch(`${BASE_URL}/recommendations/send`, {
      method: 'POST',
      headers,
      body: JSON.stringify(recommendation),
    });
    if (!res.ok) throw new Error('Failed to send recommendation');
    return res.json();
  },

  // --- Gift Cards ---
  purchaseGiftCard: async (userId: string, amount: number, bonus: number): Promise<any> => {
    const res = await fetch(`${BASE_URL}/gift-cards/purchase`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ userId, amount, bonus }),
    });
    const data = await res.json();
    if (!res.ok) {
      console.error('Gift card purchase API error:', data);
      throw new Error(data.error || 'Failed to purchase gift card');
    }
    return data;
  },

  claimGiftCard: async (code: string, userId: string): Promise<any> => {
    const res = await fetch(`${BASE_URL}/gift-cards/claim`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ code, userId }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to claim gift card');
    return data;
  },

  // --- Feedback ---
  submitFeedback: async (feedback: any): Promise<any> => {
    const res = await fetch(`${BASE_URL}/feedback`, {
      method: 'POST',
      headers,
      body: JSON.stringify(feedback),
    });
    if (!res.ok) throw new Error('Failed to submit feedback');
    return res.json();
  },

  // --- User Collection ---
  getUserCollection: async (userId: string): Promise<any> => {
    const res = await fetch(`${BASE_URL}/collection/${userId}`, { headers });
    if (!res.ok) throw new Error('Failed to fetch collection');
    return res.json();
  },

  // --- Users (Mocked via KV for now since we don't have a separate User table in the provided backend code) ---
  // In a real app, this would be a separate endpoint or Supabase Auth metadata
  getUserPoints: async (userId: string): Promise<number> => {
     // Mocking for MVP: return random points or store in localStorage/session if backend doesn't support
     // For this MVP, we will simulate it on the client side or add a simple KV endpoint if needed.
     // Let's assume we return a mock value for now to avoid complexity without backend changes.
     return 120; // 120 points default
  }
};