import { projectId, publicAnonKey } from './supabase/info';
import { MenuItem, Order, User } from './types';

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-c5be6db3`;

const headers = {
  'Authorization': `Bearer ${publicAnonKey}`,
  'Content-Type': 'application/json',
};

// Enhanced fetch with timeout and retry logic
const fetchWithTimeout = async (url: string, options: RequestInit = {}, timeout = 15000, retries = 2): Promise<Response> => {
  const controller = new AbortController();
  let didTimeout = false;

  const timeoutId = setTimeout(() => {
    didTimeout = true;
    controller.abort();
  }, timeout);

  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timeoutId);
    return response;
  } catch (error: any) {
    clearTimeout(timeoutId);

    // Only retry on timeout or network errors, not on manual aborts
    const shouldRetry = retries > 0 && (
      didTimeout ||
      error.message?.includes('fetch') ||
      error.message?.includes('network') ||
      error.name === 'NetworkError'
    );

    if (shouldRetry) {
      console.warn(`Retrying request to ${url}, retries left: ${retries} (reason: ${didTimeout ? 'timeout' : error.message})`);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s before retry
      return fetchWithTimeout(url, options, timeout, retries - 1);
    }

    throw error;
  }
};

export const api = {
  // --- Menu ---
  getMenu: async (): Promise<MenuItem[]> => {
    try {
      const res = await fetchWithTimeout(`${BASE_URL}/menu`, { headers });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch menu');
      }
      return res.json();
    } catch (error: any) {
      console.error('getMenu error:', error);
      throw new Error(error.message || 'Network error while fetching menu');
    }
  },

  seedMenu: async (items: MenuItem[]) => {
    try {
      const res = await fetchWithTimeout(`${BASE_URL}/menu/seed`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ items }),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to seed menu');
      }
      return res.json();
    } catch (error: any) {
      console.error('seedMenu error:', error);
      throw new Error(error.message || 'Network error while seeding menu');
    }
  },

  addMenuItem: async (item: MenuItem): Promise<MenuItem> => {
    try {
      const res = await fetchWithTimeout(`${BASE_URL}/menu/add`, {
        method: 'POST',
        headers,
        body: JSON.stringify(item),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to add menu item');
      }
      return res.json();
    } catch (error: any) {
      console.error('addMenuItem error:', error);
      throw new Error(error.message || 'Network error while adding menu item');
    }
  },

  updateMenuItem: async (id: string, updates: Partial<MenuItem>): Promise<MenuItem> => {
    try {
      const res = await fetchWithTimeout(`${BASE_URL}/menu/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(updates),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to update menu item');
      }
      return res.json();
    } catch (error: any) {
      console.error('updateMenuItem error:', error);
      throw new Error(error.message || 'Network error while updating menu item');
    }
  },

  // --- Orders ---
  getOrders: async (): Promise<Order[]> => {
    try {
      const res = await fetchWithTimeout(`${BASE_URL}/orders`, { headers }, 15000);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch orders');
      }
      return res.json();
    } catch (error: any) {
      console.error('getOrders error:', error);
      throw new Error(error.message || 'Network error while fetching orders');
    }
  },

  createOrder: async (order: Partial<Order>): Promise<Order> => {
    try {
      const res = await fetchWithTimeout(`${BASE_URL}/orders`, {
        method: 'POST',
        headers,
        body: JSON.stringify(order),
      }, 15000);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to create order');
      }
      return res.json();
    } catch (error: any) {
      console.error('createOrder error:', error);
      throw new Error(error.message || 'Network error while creating order');
    }
  },

  updateOrder: async (id: string, updates: Partial<Order>): Promise<Order> => {
    try {
      const res = await fetchWithTimeout(`${BASE_URL}/orders/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(updates),
      }, 15000);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to update order');
      }
      return res.json();
    } catch (error: any) {
      console.error('updateOrder error:', error);
      throw new Error(error.message || 'Network error while updating order');
    }
  },

  // --- Friend Recommendations ---
  getRecommendations: async (userId: string): Promise<any[]> => {
    try {
      const res = await fetchWithTimeout(`${BASE_URL}/recommendations/${userId}`, { headers });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch recommendations');
      }
      return res.json();
    } catch (error: any) {
      console.error('getRecommendations error:', error);
      // Return empty array on error to prevent UI breaks
      return [];
    }
  },

  recommendToFriend: async (recommendation: any): Promise<any> => {
    try {
      const res = await fetchWithTimeout(`${BASE_URL}/recommendations/send`, {
        method: 'POST',
        headers,
        body: JSON.stringify(recommendation),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to send recommendation');
      }
      return res.json();
    } catch (error: any) {
      console.error('recommendToFriend error:', error);
      throw new Error(error.message || 'Network error while sending recommendation');
    }
  },

  // --- Gift Cards ---
  purchaseGiftCard: async (userId: string, amount: number, bonus: number): Promise<any> => {
    try {
      const res = await fetchWithTimeout(`${BASE_URL}/gift-cards/purchase`, {
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
    } catch (error: any) {
      console.error('purchaseGiftCard error:', error);
      throw new Error(error.message || 'Network error while purchasing gift card');
    }
  },

  claimGiftCard: async (code: string, userId: string): Promise<any> => {
    try {
      const res = await fetchWithTimeout(`${BASE_URL}/gift-cards/claim`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ code, userId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to claim gift card');
      return data;
    } catch (error: any) {
      console.error('claimGiftCard error:', error);
      throw new Error(error.message || 'Network error while claiming gift card');
    }
  },

  // --- Feedback ---
  submitFeedback: async (feedback: any): Promise<any> => {
    try {
      const res = await fetchWithTimeout(`${BASE_URL}/feedback`, {
        method: 'POST',
        headers,
        body: JSON.stringify(feedback),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to submit feedback');
      }
      return res.json();
    } catch (error: any) {
      console.error('submitFeedback error:', error);
      throw new Error(error.message || 'Network error while submitting feedback');
    }
  },

  // --- User Collection ---
  getUserCollection: async (userId: string): Promise<any> => {
    try {
      const res = await fetchWithTimeout(`${BASE_URL}/collection/${userId}`, { headers });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch collection');
      }
      return res.json();
    } catch (error: any) {
      console.error('getUserCollection error:', error);
      // Return empty collection on error
      return { badges: [], achievements: [] };
    }
  },

  // --- Users ---
  getUserPoints: async (userId: string): Promise<number> => {
    // Mocking for MVP
    return 120;
  }
};