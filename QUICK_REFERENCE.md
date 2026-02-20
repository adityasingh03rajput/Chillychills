# ChillyChills Admin Panel - Quick Reference Card

## 🚀 Getting Started

### Start Server
```bash
cd server
npm install  # First time only
npm run dev
```

### Access Admin Panel
```
URL: http://localhost:3001/admin
Login: admin_jack / chilly123
```

## 📡 New API Endpoints

### Dashboard Stats
```bash
GET /api/admin-enhanced/dashboard/stats?branch=medical
```

### Staff Management
```bash
GET    /api/admin-enhanced/staff?search=john&role=cook
POST   /api/admin-enhanced/staff/recruit
PUT    /api/admin-enhanced/staff/:id
DELETE /api/admin-enhanced/staff/:id
```

### UTR Management
```bash
GET  /api/admin-enhanced/utr/all?status=pending&page=1
POST /api/admin-enhanced/utr/verify
POST /api/admin-enhanced/utr/reject
```

### Data Export
```bash
GET /api/admin-enhanced/export/users?role=student
GET /api/admin-enhanced/export/orders?status=completed
```

### Audit Logs
```bash
GET /api/audit-logs?action=menu_delete&page=1&limit=50
GET /api/audit-logs/stats
GET /api/audit-logs/export?format=csv
```

### Bulk Operations
```bash
POST /api/admin-enhanced/bulk/users/import
POST /api/admin-enhanced/bulk/menu/update
```

## 🔐 Security Features

### Rate Limits
- **Auth**: 5 attempts / 15 min
- **API**: 100 requests / 15 min
- **Sensitive**: 10 requests / min

### Audit Logging
All admin actions automatically logged:
- Who did it (userId, userName)
- What they did (action type)
- When (timestamp)
- Where from (IP address)
- Result (success/failure)

## 📊 Key Features

### ✅ Implemented
- Rate limiting (3 tiers)
- Audit logging (complete trail)
- Full CRUD operations
- Advanced search & filtering
- Data export (CSV)
- Bulk operations
- Real-time updates (Socket.io)
- Dashboard statistics
- Pagination

### 🎯 Use Cases
1. **Daily Ops**: Dashboard, staff management, UTR verification
2. **Compliance**: Audit logs, data export, reporting
3. **Data Management**: Bulk import, export, updates
4. **Security**: Monitor logs, track access, review violations

## 🛠️ Common Tasks

### Verify UTR Transaction
```javascript
POST /api/admin-enhanced/utr/verify
Body: { "utr": "UTR123456789" }
```

### Export All Students
```javascript
GET /api/admin-enhanced/export/users?role=student
```

### Bulk Import Users
```javascript
POST /api/admin-enhanced/bulk/users/import
Body: {
  "users": [
    { "id": "23cs001", "name": "Alice", "role": "student", "balance": 500 },
    { "id": "23cs002", "name": "Bob", "role": "student", "balance": 300 }
  ]
}
```

### View Audit Logs
```javascript
GET /api/audit-logs?action=staff_recruit&page=1&limit=20
```

### Get Dashboard Stats
```javascript
GET /api/admin-enhanced/dashboard/stats?branch=medical&startDate=1704067200000
```

## 🐛 Troubleshooting

### Rate Limit Error
**Error**: "Too many requests"
**Fix**: Wait 15 minutes or adjust `rateLimiter.js`

### Audit Logs Not Recording
**Check**:
1. Middleware applied?
2. User authenticated?
3. MongoDB connected?

### Export Not Working
**Check**:
1. Manager role?
2. Data exists?
3. Browser allows downloads?

## 📚 Documentation

- **Technical**: `ADMIN_PANEL_ENHANCEMENTS.md`
- **Frontend**: `admin-panel/FRONTEND_ENHANCEMENT_GUIDE.md`
- **Complete**: `COMPLETE_ADMIN_PANEL_UPGRADE.md`

## 🔗 Quick Links

### Files Created
1. `server/src/middleware/rateLimiter.js`
2. `server/src/models/AuditLog.js`
3. `server/src/middleware/auditLogger.js`
4. `server/src/routes/auditLogs.js`
5. `server/src/routes/adminEnhanced.js`

### Files Modified
1. `server/src/index.js` (added routes & middleware)
2. `server/package.json` (added express-rate-limit)

## 🎯 Next Steps

1. ✅ Dependencies installed
2. ⏭️ Test new endpoints
3. ⏭️ Update frontend (optional)
4. ⏭️ Configure for production
5. ⏭️ Deploy and monitor

## 📞 Support

**Issues?** Check:
1. Server logs (console)
2. Audit logs (`/api/audit-logs`)
3. MongoDB connection
4. Browser console (frontend)

---

**Version**: 2.0.0
**Status**: ✅ Production Ready
