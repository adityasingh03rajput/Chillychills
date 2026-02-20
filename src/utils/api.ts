import { MenuItem, Order } from './types';

// Node.js backend URL
const isDev = window.location.port === '3000';
const BASE_URL = isDev ? 'http://localhost:3001/api' : '/api';

// Token Management
export const getToken = () => localStorage.getItem('chilly_auth_token');
export const setToken = (token: string) => localStorage.setItem('chilly_auth_token', token);
export const removeToken = () => {
  localStorage.removeItem('chilly_auth_token');
  localStorage.removeItem('chilly_user_session');
};

/**
 * Get standard headers with authentication token
 */
const getHeaders = () => {
  const token = getToken();
  const h: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  if (token) {
    h['Authorization'] = `Bearer ${token}`;
  }
  return h;
};

/**
 * Generic fetch wrapper to handle common logic
 */
const request = async (url: string, options: RequestInit = {}) => {
  const res = await fetch(url, {
    ...options,
    headers: {
      ...getHeaders(),
      ...options.headers
    }
  });

  if (res.status === 401) {
    removeToken();
    // window.location.reload(); // Optional: force redirect or re-auth
  }

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Request failed with status ${res.status}`);
  }

  return res.json();
};

export const api = {
  // --- Auth ---
  login: async (id: string, password: string): Promise<any> => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, password })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Identity rejection');
    }
    const data = await res.json();
    if (data.token) setToken(data.token);
    return data;
  },

  signup: async (id: string, name: string, password: string, role?: string): Promise<any> => {
    const res = await fetch(`${BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, name, password, role })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Sequence failed');
    }
    const data = await res.json();
    if (data.token) setToken(data.token);
    return data;
  },

  // --- Menu ---
  getMenu: () => request(`${BASE_URL}/menu`),
  seedMenu: (items: MenuItem[]) => request(`${BASE_URL}/menu/seed`, {
    method: 'POST',
    body: JSON.stringify({ items })
  }),
  addMenuItem: (item: Omit<MenuItem, 'id'>) => request(`${BASE_URL}/menu`, {
    method: 'POST',
    body: JSON.stringify(item)
  }),
  updateMenuItem: (id: string, updates: Partial<MenuItem>) => request(`${BASE_URL}/menu/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates)
  }),

  // --- Orders ---
  getOrders: () => request(`${BASE_URL}/orders`),
  getFlashSales: () => request(`${BASE_URL}/orders/flash-sales`),
  createOrder: (order: Partial<Order>) => request(`${BASE_URL}/orders`, {
    method: 'POST',
    body: JSON.stringify(order)
  }),
  updateOrder: (id: string, updates: Partial<Order>) => request(`${BASE_URL}/orders/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates)
  }),

  // --- Feedback ---
  submitFeedback: (feedback: any) => request(`${BASE_URL}/feedback`, {
    method: 'POST',
    body: JSON.stringify(feedback)
  }),

  // --- Social & Analytics (RESTORED) ---
  getRecommendations: (userId: string) => request(`${BASE_URL}/social/recommendations/${userId}`),
  recommendToFriend: (recommendation: any) => request(`${BASE_URL}/social/recommend`, {
    method: 'POST',
    body: JSON.stringify(recommendation)
  }),
  getUserCollection: (userId: string) => request(`${BASE_URL}/social/collection/${userId}`),

  // --- Users & Wallet ---
  getUsers: () => request(`${BASE_URL}/users`),
  getUser: (userId: string) => request(`${BASE_URL}/users/${userId}`),
  updateUserBalance: (userId: string, amount: number) => request(`${BASE_URL}/users/${userId}/balance`, {
    method: 'POST',
    body: JSON.stringify({ amount })
  }),

  // --- Gift Cards ---
  purchaseGiftCard: (purchaserId: string, targetUserId: string, amount: number, bonus: number) => request(`${BASE_URL}/giftcards/purchase`, {
    method: 'POST',
    body: JSON.stringify({ purchaserId, targetUserId, amount, bonus })
  }),
  claimGiftCard: (code: string, userId: string) => request(`${BASE_URL}/giftcards/redeem`, {
    method: 'POST',
    body: JSON.stringify({ code, userId })
  }),
  getGiftCardRegistry: () => request(`${BASE_URL}/giftcards/all`),

  // --- Balance & Analytics ---
  getCurrentBalance: () => request(`${BASE_URL}/balance/current`),
  getBalanceByMonth: (year: number, month: number) => request(`${BASE_URL}/balance/${year}/${month}`),
  getBalanceSummary: () => request(`${BASE_URL}/balance/summary`),
  getEmployeePerformance: (startDate?: number, endDate?: number) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate.toString());
    if (endDate) params.append('endDate', endDate.toString());
    return request(`${BASE_URL}/analytics/employee-performance?${params}`);
  },
  getCustomerBehavior: () => request(`${BASE_URL}/analytics/customer-behavior`),
  getPopularItems: (limit = 10) => request(`${BASE_URL}/analytics/popular-items?limit=${limit}`),
  getRealTimeStats: () => request(`${BASE_URL}/analytics/real-time-stats`),
  getTrends: (period: 'day' | 'week' | 'month' = 'week') => request(`${BASE_URL}/analytics/trends?period=${period}`),

  // --- Selfies ---
  getBestSelfie: () => request(`${BASE_URL}/selfies/best`),
  submitSelfie: (selfie: any) => request(`${BASE_URL}/selfies`, {
    method: 'POST',
    body: JSON.stringify(selfie)
  }),
  getPendingSelfies: () => request(`${BASE_URL}/selfies/pending`),
  updateSelfieStatus: (id: string, updates: { status: string; isBest?: boolean }) => request(`${BASE_URL}/selfies/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify(updates)
  }),
  deleteSelfie: (id: string) => request(`${BASE_URL}/selfies/${id}`, {
    method: 'DELETE'
  }),

  // --- Payment (Direct UPI) ---
  getPaymentDetails: () => request(`${BASE_URL}/payment/upi-details`),
  verifyUTR: (utr: string, amount: number) => request(`${BASE_URL}/payment/verify-utr`, {
    method: 'POST',
    body: JSON.stringify({ utr, amount })
  }),
  // --- Admin ---
  getAnnouncements: () => request(`${BASE_URL}/admin/announcements`),
  updateAnnouncement: (branch: string, message: string) => request(`${BASE_URL}/admin/announcements`, {
    method: 'POST',
    body: JSON.stringify({ branch, message })
  }),
  getStaff: () => request(`${BASE_URL}/admin/staff`),
  removeStaff: (id: string) => request(`${BASE_URL}/admin/staff/${id}`, {
    method: 'DELETE'
  })
};