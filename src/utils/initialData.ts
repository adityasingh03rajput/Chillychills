import { MenuItem } from './types';

export const INITIAL_MENU: MenuItem[] = [
  {
    id: 'm1',
    name: 'Classic Cheese Burger',
    price: 120,
    category: 'Burgers',
    image: 'https://images.unsplash.com/photo-1634737119182-4d09e1305ba7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZWxpY2lvdXMlMjBidXJnZXIlMjBwcm9mZXNzaW9uYWwlMjBmb29kJTIwcGhvdG9ncmFwaHl8ZW58MXx8fHwxNzY4ODA3Mzc3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    available: true,
    isDailySpecial: true,
    description: 'Juicy beef patty with cheddar cheese and fresh lettuce.',
    isRefundable: false // Prepared fresh, non-refundable
  },
  {
    id: 'm2',
    name: 'Butter Croissant',
    price: 85,
    category: 'Croissants',
    image: 'https://images.unsplash.com/photo-1709798289100-7b46217e0325?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVzaCUyMGNyb2lzc2FudCUyMGJha2VyeXxlbnwxfHx8fDE3Njg4MDczNzd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    available: true,
    isDailySpecial: false,
    description: 'Flaky, buttery, and freshly baked every morning.',
    isRefundable: false // Baked fresh, non-refundable
  },
  {
    id: 'm3',
    name: 'Crispy Fries',
    price: 60,
    category: 'Snacks',
    image: 'https://images.unsplash.com/photo-1734774797087-b6435057a15e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVuY2glMjBmcmllcyUyMHNuYWNrfGVufDF8fHx8MTc2ODc2MDk3Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    available: true,
    isDailySpecial: false,
    description: 'Golden salted fries, perfect for sharing.',
    isRefundable: false // Prepared fresh, non-refundable
  },
  {
    id: 'm4',
    name: 'Chilled Cola',
    price: 40,
    category: 'Drinks',
    image: 'https://images.unsplash.com/photo-1648569893937-b03f4980c50d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZWZyZXNoaW5nJTIwY29sZCUyMHNvZGElMjBkcmluayUyMGdsYXNzfGVufDF8fHx8MTc2ODgwNzM3N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    available: true,
    isDailySpecial: false,
    description: 'Ice cold refreshing cola.',
    isRefundable: true // Packaged drink, refundable
  },
  {
    id: 'm5',
    name: 'Rich Chocolate Cake',
    price: 150,
    category: 'Desserts',
    image: 'https://images.unsplash.com/photo-1622558634804-8234e7e36b9b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaG9jb2xhdGUlMjBjYWtlJTIwZGVzc2VydCUyMHBsYXRlfGVufDF8fHx8MTc2ODgwNzM3N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    available: true,
    isDailySpecial: false,
    description: 'Decadent chocolate layer cake.',
    isRefundable: true // Pre-made dessert, refundable
  }
];