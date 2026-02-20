# ChillyChills Admin Panel

A comprehensive, production-ready admin panel for managing the ChillyChills campus food ordering system.

## Features

### 🎯 Core Management
- **Dashboard Overview**: Real-time statistics, revenue tracking, and active orders
- **Menu Management**: Add, edit, delete, and toggle availability of menu items
- **Order Management**: View all orders, update statuses, and track order flow
- **Staff Recruitment**: Add and manage cook and manager accounts
- **User Database**: View all users and manage their wallets

### 💰 Financial Control
- **UTR Verification**: Approve or reject manual UPI top-up requests
- **Manual Wallet Top-up**: Directly add funds to user wallets
- **Revenue Analytics**: Track daily, weekly, and monthly revenue trends

### 📢 Communication
- **Live Announcements**: Broadcast messages to specific branches or all users
- **Real-time Updates**: Socket.io integration for instant notifications

### 📊 Analytics & Insights
- **Popular Items**: Track best-selling menu items
- **Customer Behavior**: Analyze ordering patterns and retention
- **Revenue Trends**: Visualize financial performance over time
- **Employee Performance**: Monitor order preparation efficiency

### 🎁 Gift Card System
- **Registry View**: Monitor all gift card purchases and redemptions
- **Transaction Tracking**: View purchaser, recipient, and redemption status

### 📸 Social Features
- **Selfie Moderation**: Approve or reject student selfie submissions
- **Campus Social Hub**: Manage user-generated content

### 👨‍🍳 Kitchen Operations (Chef Mode)
- **Live Order Queue**: Real-time order display for kitchen staff
- **Status Updates**: Mark orders as preparing, ready, or completed
- **Branch Filtering**: View orders specific to assigned branch

### 🛒 Student Portal (Integrated)
- **Menu Browsing**: View available items as a student
- **Order Placement**: Test the ordering flow from admin panel
- **Cart Management**: Add items and checkout using admin wallet

## Technology Stack

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Backend**: Node.js + Express
- **Database**: MongoDB
- **Real-time**: Socket.io
- **Authentication**: JWT with bcrypt
- **Security**: XSS protection, role-based access control

## Getting Started

### Prerequisites
- Node.js 16+ installed
- MongoDB Atlas account or local MongoDB
- Backend server running on port 3001

### Installation

1. **Configure Server URL** (if not using localhost):
   Edit `config.json`:
   ```json
   {
     "SERVER_URL": "http://your-server-url:3001"
   }
   ```

2. **Open the Admin Panel**:
   - **Web**: Navigate to `http://localhost:3001/admin` (if served by backend)
   - **Desktop App**: Run the Electron app from `admin-desktop-app`
   - **Standalone**: Open `index.html` in a browser

### Default Credentials

**Manager Account**:
- ID: `admin_jack`
- Password: `chilly123`

**Cook Account**:
- ID: `cook_sarah`
- Password: `chilly123`

## User Guide

### Navigation

The sidebar contains all major sections:

**Management Hub**:
- Overview: Dashboard with key metrics
- Finance & UTR: Verify payments and manage wallets
- User Database: View and manage all users

**Kitchen Ops (Chef)**:
- Prep Station: Live order queue for cooks
- Menu Control: Manage menu items

**Student Portal**:
- Order Food: Test student ordering experience
- Campus Social: Moderate selfies

**System**:
- Recruitment: Add new staff members
- Live Alerts: Broadcast announcements
- Reviews: View customer feedback
- Insights: Advanced analytics
- Gift Cards: Monitor gift card registry

### Common Tasks

#### Adding a Menu Item
1. Navigate to "Menu Control"
2. Click "+ Add Item"
3. Fill in item details (ID, name, price, category)
4. Click "Publish to Menu"

#### Recruiting Staff
1. Navigate to "Recruitment"
2. Click "+ Recruit Staff"
3. Enter staff details (ID, name, password, role, branch)
4. Click "Confirm Recruitment"

#### Verifying UTR Payments
1. Navigate to "Finance & UTR"
2. View pending UTR verifications
3. Click "Approve" to credit user wallet or "Reject" to deny

#### Broadcasting Announcements
1. Navigate to "Live Alerts"
2. Click "+ New Broadcast"
3. Select target branch
4. Enter message content
5. Click "Send Live Alert"

#### Managing Orders (Kitchen)
1. Navigate to "Prep Station"
2. View active orders in queue
3. Click "Start Prep" → "Mark Ready" → "Serve" to update status

## API Endpoints Used

### Authentication
- `POST /api/auth/login` - Admin login

### Admin Operations
- `GET /api/admin/staff` - Fetch all staff
- `POST /api/admin/staff/recruit` - Add new staff
- `DELETE /api/admin/staff/:id` - Remove staff
- `GET /api/admin/announcements` - Get announcements
- `POST /api/admin/announcements` - Create announcement
- `DELETE /api/admin/announcements/:branch` - Remove announcement
- `GET /api/admin/utr/pending` - Get pending UTR verifications
- `POST /api/admin/utr/verify` - Approve UTR
- `POST /api/admin/utr/reject` - Reject UTR

### Menu Management
- `GET /api/menu` - Fetch all menu items
- `POST /api/menu` - Create menu item
- `PUT /api/menu/:id` - Update menu item
- `DELETE /api/menu/:id` - Delete menu item

### Orders
- `GET /api/orders` - Fetch all orders
- `PUT /api/orders/:id` - Update order status

### Users
- `GET /api/users` - Fetch all users
- `POST /api/users/:id/balance` - Update user balance

### Analytics
- `GET /api/analytics/real-time-stats` - Current statistics
- `GET /api/analytics/popular-items` - Best-selling items
- `GET /api/analytics/customer-behavior` - User patterns
- `GET /api/analytics/trends` - Revenue trends

### Gift Cards
- `GET /api/giftcards/all` - Fetch gift card registry

### Selfies
- `GET /api/selfies/pending` - Pending selfie moderation
- `PUT /api/selfies/:id/status` - Approve/reject selfie

### Payment
- `POST /api/payment/manual-topup` - Manual wallet top-up

## Security Features

- **JWT Authentication**: All API requests require valid JWT token
- **Role-Based Access**: Manager-only routes protected with authorization middleware
- **Password Hashing**: bcrypt with 10 salt rounds
- **XSS Protection**: Input sanitization on all user-submitted data
- **Session Management**: Automatic logout on token expiration
- **CORS Configuration**: Controlled origin access

## Real-time Features

The admin panel uses Socket.io for real-time updates:

- **New Orders**: Instant notification when orders are placed
- **Announcement Updates**: Live broadcast to all connected clients
- **Selfie Submissions**: Real-time moderation queue updates
- **Order Status Changes**: Kitchen updates reflected immediately

## Customization

### Changing Colors
Edit CSS variables in `dashboard-styles.css`:
```css
:root {
    --primary: #667eea;
    --secondary: #764ba2;
    --accent: #ed6ea0;
    /* ... */
}
```

### Adding New Views
1. Add navigation button in `dashboard.html`
2. Create view container with `id="your-view-name-view"`
3. Add load function in `dashboard.js`
4. Update navigation event listener

### Modifying API Base URL
The panel automatically uses:
- Stored URL from `localStorage.getItem('CHILLY_PROD_URL')`
- Falls back to `http://localhost:3001/api`

## Troubleshooting

### Cannot Login
- Verify backend server is running on port 3001
- Check MongoDB connection
- Ensure user exists in database with correct role

### Data Not Loading
- Open browser console (F12) to check for errors
- Verify API endpoints are accessible
- Check JWT token is valid (not expired)

### Real-time Updates Not Working
- Ensure Socket.io connection is established
- Check CORS configuration in backend
- Verify firewall allows WebSocket connections

## Desktop App (Electron)

The admin panel can be packaged as a desktop application:

### Building
```bash
cd admin-desktop-app
npm install
npm run build
```

### Running
```bash
npm start
```

The desktop app automatically injects the server URL from `config.json`.

## Performance Optimization

- **Lazy Loading**: Views load data only when accessed
- **Caching**: Menu data cached globally to reduce API calls
- **Debouncing**: Search and filter operations debounced
- **Pagination**: Large datasets paginated (orders, users)

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

Proprietary - ChillyChills Campus Food System

## Support

For issues or questions, contact the development team.

---

**Version**: 2.0.0  
**Last Updated**: 2026-02-13  
**Status**: Production Ready ✅
