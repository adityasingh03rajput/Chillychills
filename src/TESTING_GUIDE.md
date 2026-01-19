# Chilly Chills Smart Canteen - Testing Guide

## 🎯 What's New

After student login, you'll see a **completely redesigned home screen** with:

## 🔐 Test Credentials

If you encounter any auth errors (like "Email not confirmed"), use these test credentials:

### Student Login:
- **ID**: `student_test` or `demo`
- **Password**: `student123`

### Staff Login (Cook):
- **ID**: `cook_test_001`
- **Password**: `cook123`

### Staff Login (Manager):
- **ID**: `manager_test_001`
- **Password**: `manager123`

## 🏠 Main Changes

### 1. **Branch Selection** 🏢
Instead of going directly to the menu, students now:
- See three beautiful canteen branch cards (North, South, East Campus)
- Each card shows the branch type, location, and status
- Click any branch to proceed to that branch's menu
- Can return to home from the menu using the back button

### 2. **Quick Access Features** ✨

Five interactive feature buttons that open modals:

#### 👫 Friend Picks
- View what your friends are currently recommending
- See real-time activity with timestamps
- Sample friends already seeded for testing

#### 🎁 Gift Cards
- **Buy gift cards** in ₹100, ₹500, or ₹1000 denominations
- Some cards include bonus credit (e.g., ₹500 + ₹50 bonus)
- **Claim gift cards** using a code
- **Test code available**: `CHILL-TEST123` (₹500 + ₹50 bonus)
- Purchased codes are automatically copied to clipboard

#### 💬 Feedback
- Submit feedback about food quality, app experience, or staff
- Choose from predefined topics
- All submissions are saved to the backend

#### 🏆 Your Collection
- View achievement badges and unlocked rewards
- See locked badges and what's needed to unlock them
- Badges include: Burger King, Caffeine Addict, Spice Master, etc.

#### 👤 Profile
- View user information
- See membership level (Gold Member)
- Account details and settings

## 🧪 How to Test

### Student Login Flow:
1. **Login** as a student (use test credentials)
2. **Home Screen**: You'll see three branch cards + feature buttons
3. **Select a branch** (e.g., North Campus) → Goes to menu
4. **Back button** in menu → Returns to home
5. **Try features**:
   - Click "Friend Picks" to see recommendations
   - Click "Gift Cards" to buy/claim cards
   - Use code `CHILL-TEST123` to test claiming
   - Click "Feedback" to submit feedback
   - Click "Collection" to see badges
   - Click "Profile" to view user info

### Backend Features:
All features are **fully functional** and connected to Supabase:
- Friend recommendations are auto-seeded on first load
- Gift cards are generated with unique codes
- Feedback is stored in the database
- Collections are personalized per user

## 🎨 Design Highlights

### Visual Improvements:
- **Dark gradient background** with decorative glows
- **Animated branch cards** with hover effects and shine animations
- **Beautiful modals** that slide up from the bottom
- **Consistent branding** with Chilly Chills orange (#FF7A2F)
- **Smooth transitions** between all screens
- **Touch-friendly** buttons and inputs for mobile

### Image Integration:
- All food images use the `ImageWithFallback` component
- Images have smooth transitions and hover effects
- Cards have gradient overlays for better text readability
- The UI maintains the "Fun 2D Interactive" aesthetic

## 🚀 Key Features

✅ **No more "monster and coke burger" on initial screen**
✅ **Branch selection first** - choose location before ordering
✅ **All 5 student features** are working and backend-connected
✅ **Back navigation** from menu to home
✅ **Beautiful, polished UI** with smooth animations
✅ **Mobile-first design** with touch-friendly controls
✅ **Chilly Chills branding** throughout

## 📝 Notes

- The menu is still accessible through branch selection
- Cart and Orders functionality remains unchanged
- All existing features (cart, orders, refunds) still work
- Staff and Manager dashboards are unaffected
- Test gift card code: `CHILL-TEST123`