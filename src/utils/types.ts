export type Role = 'student' | 'cook' | 'manager';

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  available: boolean;
  isDailySpecial?: boolean;
  isBestSeller?: boolean;
  description: string;
  isPackaged?: boolean; // Determines if auto-refundable
  isRefundable?: boolean; // Manager sets this - if item is refundable when user cancels
}

export interface CartItem extends MenuItem {
  quantity: number;
  notes?: string;
}

export type OrderStatus = 'placed' | 'accepted' | 'preparing' | 'ready' | 'completed' | 'picked_up' | 'cancelled' | 'rejected';

export interface Feedback {
  rating: number;
  comment: string;
  createdAt: number;
}

export interface RefundRequest {
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: number;
  refundAmount?: number; // Calculated based on refundable items
  cancelledBy?: 'user' | 'staff'; // Who cancelled the order
}

export interface Order {
  id: string;
  userId: string;
  userName?: string;
  items: CartItem[];
  totalAmount: number;
  status: OrderStatus;
  token: string;
  branch: string;
  createdAt: number;
  paymentMethod: 'upi' | 'wallet';
  scheduledTime?: string; // HH:MM format
  loyaltyPointsEarned?: number;
  feedback?: Feedback;
  refundRequest?: RefundRequest;
  rejectionReason?: string;
}

export interface User {
  id: string;
  name: string;
  role: Role;
  balance: number; // For wallet
  points: number; // For loyalty
  email?: string;
}