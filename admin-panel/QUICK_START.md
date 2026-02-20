# Quick Start Guide - ChillyChills Admin Panel

## 🚀 Getting Started in 5 Minutes

### Step 1: Start the Backend Server

```bash
cd server
npm install
npm start
```

The server should start on `http://localhost:3001`

### Step 2: Access the Admin Panel

Choose one of these methods:

#### Option A: Web Browser (Recommended)
1. Open your browser
2. Navigate to `http://localhost:3001/admin`
3. You'll see the login screen

#### Option B: Desktop App
```bash
cd admin-desktop-app
npm install
npm start
```

#### Option C: Standalone
1. Open `admin-panel/index.html` directly in your browser
2. Make sure the backend is running

### Step 3: Login

Use these default credentials:

**Manager (Full Access)**:
- ID: `admin_jack`
- Password: `chilly123`

**Cook (Kitchen Access)**:
- ID: `cook_sarah`
- Password: `chilly123`

### Step 4: Explore Features

After login, you'll see the dashboard with:

1. **Overview** - Real-time statistics
2. **Finance & UTR** - Payment verification
3. **User Database** - All users
4. **Prep Station** - Kitchen orders
5. **Menu Control** - Manage items
6. **Order Food** - Student view
7. **Campus Social** - Selfie moderation
8. **Recruitment** - Add staff
9. **Live Alerts** - Announcements
10. **Reviews** - Customer feedback
11. **Insights** - Analytics
12. **Gift Cards** - Registry

## 📋 Common Tasks

### Add a Menu Item
1. Click "Menu Control" in sidebar
2. Click "+ Add Item" button
3. Fill in:
   - Internal ID (e.g., `burger_01`)
   - Item Name (e.g., `Cheese Burger`)
   - Price (e.g., `120`)
   - Category (select from dropdown)
4. Click "Publish to Menu"

### Recruit Staff
1. Click "Recruitment" in sidebar
2. Click "+ Recruit Staff"
3. Fill in:
   - Identity ID (e.g., `cook_john`)
   - Full Name
   - Password
   - Role (Cook or Manager)
   - Branch
4. Click "Confirm Recruitment"

### Verify UTR Payment
1. Click "Finance & UTR"
2. See pending verifications
3. Click "Approve" to credit wallet
4. Or click "Reject" to deny

### Broadcast Announcement
1. Click "Live Alerts"
2. Click "+ New Broadcast"
3. Select target branch
4. Type message
5. Click "Send Live Alert"

### Manage Kitchen Orders
1. Click "Prep Station"
2. See active orders
3. Click "Start Prep" when beginning
4. Click "Mark Ready" when done
5. Click "Serve" when delivered

## 🔧 Configuration

### Change Server URL

Edit `admin-panel/config.json` or `admin-desktop-app/config.json`:

```json
{
  "SERVER_URL": "http://your-server:3001"
}
```

### Environment Variables

Create `server/.env`:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=7d
PORT=3001
```

## 🐛 Troubleshooting

### Can't Login
- ✅ Check backend is running: `http://localhost:3001/api/health`
- ✅ Verify MongoDB is connected
- ✅ Check browser console for errors (F12)

### Data Not Loading
- ✅ Open browser console (F12)
- ✅ Check for 401 errors (token expired - re-login)
- ✅ Verify API endpoints are accessible

### Real-time Updates Not Working
- ✅ Check Socket.io connection in console
- ✅ Verify CORS settings in backend
- ✅ Ensure WebSocket ports are open

## 📱 Keyboard Shortcuts

- `Ctrl/Cmd + K` - Focus search bar
- `Esc` - Close modals
- `Tab` - Navigate between fields
- `Enter` - Submit forms

## 🎯 Tips & Tricks

1. **Quick Access Buttons**: Use the quick login buttons on login screen for fast testing
2. **Branch Selector**: Change active branch in top bar to filter data
3. **Live Indicator**: Red "LIVE" badge shows real-time data
4. **Status Colors**: Green = success, Red = error, Orange = warning
5. **Empty States**: Helpful messages guide you when no data exists

## 📊 Understanding the Dashboard

### Overview Stats
- **Total Revenue**: Today's earnings
- **Active Orders**: Currently being prepared
- **User Satisfaction**: Average rating
- **Refund Requests**: Pending approvals

### Branch Revenue Split
- Visual bar chart showing performance by branch
- Medical, Engineering, Hospital canteens

### Live Order Stream
- Most recent 5 orders
- Real-time status updates
- Click "View all orders" for complete list

## 🔐 Security Best Practices

1. **Change Default Passwords**: Update admin credentials immediately
2. **Use Strong Passwords**: Minimum 8 characters with mix of types
3. **Logout When Done**: Don't leave sessions open
4. **Monitor Activity**: Check audit logs regularly
5. **Limit Access**: Only give manager role to trusted staff

## 📞 Support

### Need Help?
- Check the full README: `admin-panel/README.md`
- Review API docs: `ADMIN_PANEL_ENHANCEMENTS.md`
- Contact development team

### Reporting Issues
Include:
1. What you were trying to do
2. What happened instead
3. Browser console errors (F12)
4. Steps to reproduce

## ✅ Checklist for First Use

- [ ] Backend server running
- [ ] MongoDB connected
- [ ] Logged in successfully
- [ ] Can see dashboard overview
- [ ] Menu items loading
- [ ] Orders displaying
- [ ] Can add new menu item
- [ ] Can recruit staff
- [ ] Announcements working
- [ ] Real-time updates functioning

## 🎉 You're Ready!

The admin panel is now fully operational. Explore all features and customize as needed for your campus food system.

---

**Happy Managing! 🍔**
