import { MenuItem, Order } from './types';

// Node.js backend URL
const isDev = window.location.port === '3000';
const BASE_URL = isDev ? 'http://localhost:3001/api' : '/api';

const headers = {
  'Content-Type': 'application/json',

};

export const api = {
  // --- Auth ---
  login: async (id: string, password: string): Promise<any> => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ id, password })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Identity rejection');
    }
    return res.json();
  },

  signup: async (id: string, name: string, password: string, role?: string): Promise<any> => {
    const res = await fetch(`${BASE_URL}/auth/signup`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ id, name, password, role })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Sequence failed');
    }
    return res.json();
  },

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

  addMenuItem: async (item: Omit<MenuItem, 'id'>): Promise<MenuItem> => {
    const res = await fetch(`${BASE_URL}/menu`, {
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

  getFlashSales: async (): Promise<any[]> => {
    const res = await fetch(`${BASE_URL}/orders/flash-sales`, { headers });
    if (!res.ok) throw new Error('Failed to fetch flash sales');
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

  // --- Social ---
  getRecommendations: async (userId: string): Promise<any[]> => {
    const res = await fetch(`${BASE_URL}/social/recommendations/${userId}`, { headers });
    if (!res.ok) throw new Error('Failed to fetch recommendations');
    return res.json();
  },

  recommendToFriend: async (recommendation: any): Promise<any> => {
    const res = await fetch(`${BASE_URL}/social/recommend`, {
      method: 'POST',
      headers,
      body: JSON.stringify(recommendation),
    });
    if (!res.ok) throw new Error('Failed to recommend');
    return res.json();
  },

  getUserCollection: async (userId: string): Promise<any> => {
    const res = await fetch(`${BASE_URL}/social/collection/${userId}`, { headers });
    if (!res.ok) throw new Error('Failed to fetch collection');
    return res.json();
  },

  // --- Gift Cards ---
  purchaseGiftCard: async (purchaserId: string, targetUserId: string, amount: number, bonus: number): Promise<any> => {
    const res = await fetch(`${BASE_URL}/giftcards/purchase`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ purchaserId, targetUserId, amount, bonus }),
    });
    if (!res.ok) throw new Error('Failed to purchase gift card');
    return res.json();
  },

  claimGiftCard: async (code: string, userId: string): Promise<any> => {
    const res = await fetch(`${BASE_URL}/giftcards/redeem`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ code, userId }),
    });
    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || 'Failed to redeem');
    }
    return res.json();
  },

  getGiftCardRegistry: async (): Promise<any[]> => {
    const res = await fetch(`${BASE_URL}/giftcards/all`, { headers });
    if (!res.ok) throw new Error('Failed to fetch registry');
    return res.json();
  },

  // --- Users & Wallet ---
  getUsers: async (): Promise<any[]> => {
    const res = await fetch(`${BASE_URL}/users`, { headers });
    if (!res.ok) throw new Error('Failed to fetch users');
    return res.json();
  },

  getUser: async (userId: string): Promise<any> => {
    const res = await fetch(`${BASE_URL}/users/${userId}`, { headers });
    if (!res.ok) throw new Error('Failed to fetch user');
    return res.json();
  },

  updateUserBalance: async (userId: string, amount: number): Promise<any> => {
    const res = await fetch(`${BASE_URL}/users/${userId}/balance`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ amount }),
    });
    if (!res.ok) throw new Error('Failed to update balance');
    return res.json();
  },

  // --- Balance Sheet ---
  getCurrentBalance: async (): Promise<any> => {
    const res = await fetch(`${BASE_URL}/balance/current`, { headers });
    if (!res.ok) throw new Error('Failed to fetch current balance');
    return res.json();
  },

  getBalanceByMonth: async (year: number, month: number): Promise<any> => {
    const res = await fetch(`${BASE_URL}/balance/${year}/${month}`, { headers });
    if (!res.ok) throw new Error('Failed to fetch balance');
    return res.json();
  },

  getBalanceSummary: async (): Promise<any> => {
    const res = await fetch(`${BASE_URL}/balance/summary`, { headers });
    if (!res.ok) throw new Error('Failed to fetch balance summary');
    return res.json();
  },

  // --- Analytics ---
  getEmployeePerformance: async (startDate?: number, endDate?: number): Promise<any> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate.toString());
    if (endDate) params.append('endDate', endDate.toString());

    const res = await fetch(`${BASE_URL}/analytics/employee-performance?${params}`, { headers });
    if (!res.ok) throw new Error('Failed to fetch employee performance');
    return res.json();
  },

  getCustomerBehavior: async (): Promise<any> => {
    const res = await fetch(`${BASE_URL}/analytics/customer-behavior`, { headers });
    if (!res.ok) throw new Error('Failed to fetch customer behavior');
    return res.json();
  },

  getPopularItems: async (limit = 10): Promise<any> => {
    const res = await fetch(`${BASE_URL}/analytics/popular-items?limit=${limit}`, { headers });
    if (!res.ok) throw new Error('Failed to fetch popular items');
    return res.json();
  },

  getRealTimeStats: async (): Promise<any> => {
    const res = await fetch(`${BASE_URL}/analytics/real-time-stats`, { headers });
    if (!res.ok) throw new Error('Failed to fetch real-time stats');
    return res.json();
  },

  getTrends: async (period: 'day' | 'week' | 'month' = 'week'): Promise<any> => {
    const res = await fetch(`${BASE_URL}/analytics/trends?period=${period}`, { headers });
    if (!res.ok) throw new Error('Failed to fetch trends');
    return res.json();
  },

  // --- Selfies ---
  getBestSelfie: async (): Promise<any> => {
    const res = await fetch(`${BASE_URL}/selfies/best`, { headers });
    if (!res.ok) throw new Error('Failed to fetch best selfie');
    return res.json();
  },

  submitSelfie: async (selfie: any): Promise<any> => {
    const res = await fetch(`${BASE_URL}/selfies`, {
      method: 'POST',
      headers,
      body: JSON.stringify(selfie),
    });
    if (!res.ok) throw new Error('Failed to submit selfie');
    return res.json();
  },

  getPendingSelfies: async (): Promise<any[]> => {
    const res = await fetch(`${BASE_URL}/selfies/pending`, { headers });
    if (!res.ok) throw new Error('Failed to fetch pending selfies');
    return res.json();
  },

  updateSelfieStatus: async (id: string, updates: { status: string; isBest?: boolean }): Promise<any> => {
    const res = await fetch(`${BASE_URL}/selfies/${id}/status`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update selfie status');
    return res.json();
  },

  deleteSelfie: async (id: string): Promise<any> => {
    const res = await fetch(`${BASE_URL}/selfies/${id}`, {
      method: 'DELETE',
      headers,
    });
    if (!res.ok) throw new Error('Failed to delete selfie');
    return res.json();
  }
};