# Admin Panel Frontend Enhancement Guide

## Quick Start

This guide shows how to integrate the new backend features into the existing admin panel.

## 1. Enhanced Dashboard Stats

Add to `dashboard.js` in the `loadOverview()` function:

```javascript
async function loadOverview() {
    try {
        // Use enhanced stats endpoint
        const stats = await fetchWithAuth('/admin-enhanced/dashboard/stats');
        
        // Update UI with comprehensive data
        document.querySelector('.stat-card:nth-child(1) .value').textContent = 
            `₹${stats.revenue.total.toLocaleString()}`;
        document.querySelector('.stat-card:nth-child(2) .value').textContent = 
            stats.orders.active;
        document.querySelector('.stat-card:nth-child(3) .value').textContent = 
            `${stats.users.total.toLocaleString()}`;
        document.querySelector('.stat-card:nth-child(4) .value').textContent = 
            stats.pending.utr;
    } catch (error) {
        console.error('Failed to load dashboard stats:', error);
        showNotification('Failed to load dashboard data', 'error');
    }
}
```

## 2. Enhanced Staff Management with Search

Update `loadStaff()` function:

```javascript
async function loadStaff() {
    try {
        // Add search input to HTML first
        const searchQuery = document.getElementById('staffSearch')?.value || '';
        const roleFilter = document.getElementById('staffRoleFilter')?.value || '';
        
        // Build query string
        const params = new URLSearchParams();
        if (searchQuery) params.append('search', searchQuery);
        if (roleFilter) params.append('role', roleFilter);
        
        const staff = await fetchWithAuth(`/admin-enhanced/staff?${params}`);
        const tbody = document.querySelector('.staff-table tbody');
        tbody.innerHTML = '';

        staff.forEach(person => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${person.name}</td>
                <td>${person.id}</td>
                <td>${person.role.toUpperCase()}</td>
                <td>${person.branch || 'ALL'}</td>
                <td><span class="efficiency high">Active</span></td>
                <td>
                    <button class="btn-small" onclick="editStaff('${person.id}')">Edit</button>
                    <button class="btn-small delete" onclick="removeStaff('${person.id}')">Remove</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Failed to load staff:', error);
        showNotification('Failed to load staff', 'error');
    }
}

// Add edit function
window.editStaff = async (id) => {
    const staff = await fetchWithAuth(`/users/${id}`);
    const newName = prompt(`Update name for ${staff.name}:`, staff.name);
    
    if (newName && newName !== staff.name) {
        try {
            await fetchWithAuth(`/admin-enhanced/staff/${id}`, {
                method: 'PUT',
                body: JSON.stringify({ name: newName })
            });
            showNotification('Staff updated successfully', 'success');
            loadStaff();
        } catch (err) {
            showNotification('Failed to update staff', 'error');
        }
    }
};
```

## 3. Data Export Buttons

Add export buttons to HTML:

```html
<!-- In staff view -->
<div class="view-header">
    <h1>Staff Recruitment</h1>
    <div style="display: flex; gap: 12px;">
        <button class="btn-secondary" onclick="exportStaff()">📥 Export CSV</button>
        <button class="btn-primary" id="openRecruitBtn">+ Recruit Staff</button>
    </div>
</div>

<!-- In orders view -->
<div class="view-header">
    <h1>All Orders</h1>
    <button class="btn-secondary" onclick="exportOrders()">📥 Export CSV</button>
</div>
```

Add export functions to `dashboard.js`:

```javascript
window.exportStaff = () => {
    const role = document.getElementById('staffRoleFilter')?.value || '';
    const url = `${API_BASE}/admin-enhanced/export/users?role=${role}`;
    window.open(url, '_blank');
    showNotification('Exporting staff data...', 'info');
};

window.exportOrders = () => {
    const status = document.getElementById('orderStatusFilter')?.value || '';
    const branch = document.getElementById('activeBranch')?.value || 'all';
    const url = `${API_BASE}/admin-enhanced/export/orders?status=${status}&branch=${branch}`;
    window.open(url, '_blank');
    showNotification('Exporting orders...', 'info');
};
```

## 4. Audit Log Viewer

Add new view to `dashboard.html`:

```html
<!-- Add to navigation -->
<button class="nav-item" data-view="audit">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
        <polyline points="10 9 9 9 8 9"></polyline>
    </svg>
    <span>Audit Logs</span>
</button>

<!-- Add view container -->
<div id="audit-view" class="view">
    <div class="view-header">
        <h1>Audit Logs</h1>
        <div style="display: flex; gap: 12px;">
            <select id="auditActionFilter" onchange="loadAuditLogs()">
                <option value="">All Actions</option>
                <option value="login">Login</option>
                <option value="menu_create">Menu Create</option>
                <option value="menu_update">Menu Update</option>
                <option value="menu_delete">Menu Delete</option>
                <option value="staff_recruit">Staff Recruit</option>
                <option value="utr_verify">UTR Verify</option>
            </select>
            <button class="btn-secondary" onclick="exportAuditLogs()">📥 Export</button>
        </div>
    </div>
    <div class="audit-table-container glass" style="margin-top: 24px;">
        <table class="staff-table" id="auditTable">
            <thead>
                <tr>
                    <th>Timestamp</th>
                    <th>User</th>
                    <th>Action</th>
                    <th>Resource</th>
                    <th>Status</th>
                    <th>IP Address</th>
                </tr>
            </thead>
            <tbody></tbody>
        </table>
        <div class="pagination" id="auditPagination"></div>
    </div>
</div>
```

Add functions to `dashboard.js`:

```javascript
let currentAuditPage = 1;

async function loadAuditLogs(page = 1) {
    try {
        const action = document.getElementById('auditActionFilter')?.value || '';
        const params = new URLSearchParams({ page, limit: 50 });
        if (action) params.append('action', action);
        
        const data = await fetchWithAuth(`/audit-logs?${params}`);
        const tbody = document.querySelector('#auditTable tbody');
        tbody.innerHTML = '';

        data.logs.forEach(log => {
            const tr = document.createElement('tr');
            const timestamp = new Date(log.timestamp).toLocaleString();
            tr.innerHTML = `
                <td>${timestamp}</td>
                <td>${log.userName || log.userId}</td>
                <td><span class="badge">${log.action}</span></td>
                <td>${log.resource || '-'}</td>
                <td><span class="status ${log.status}">${log.status}</span></td>
                <td>${log.ipAddress || '-'}</td>
            `;
            tbody.appendChild(tr);
        });

        // Update pagination
        updateAuditPagination(data.pagination);
        currentAuditPage = page;
    } catch (error) {
        console.error('Failed to load audit logs:', error);
        showNotification('Failed to load audit logs', 'error');
    }
}

function updateAuditPagination(pagination) {
    const container = document.getElementById('auditPagination');
    container.innerHTML = '';
    
    for (let i = 1; i <= pagination.pages; i++) {
        const btn = document.createElement('button');
        btn.className = `pagination-btn ${i === pagination.page ? 'active' : ''}`;
        btn.textContent = i;
        btn.onclick = () => loadAuditLogs(i);
        container.appendChild(btn);
    }
}

window.exportAuditLogs = () => {
    const action = document.getElementById('auditActionFilter')?.value || '';
    const url = `${API_BASE}/audit-logs/export?action=${action}&format=csv`;
    window.open(url, '_blank');
    showNotification('Exporting audit logs...', 'info');
};
```

## 5. Bulk User Import

Add to HTML:

```html
<!-- In users view -->
<div class="view-header">
    <h1>Student Database</h1>
    <div style="display: flex; gap: 12px;">
        <button class="btn-secondary" onclick="showBulkImport()">📤 Bulk Import</button>
        <button class="btn-secondary" onclick="exportUsers()">📥 Export CSV</button>
    </div>
</div>

<!-- Add modal -->
<div id="bulkImportModal" class="modal">
    <div class="modal-content glass">
        <div class="modal-header">
            <h2>Bulk Import Users</h2>
            <button class="close-modal">&times;</button>
        </div>
        <div style="padding: 20px;">
            <p style="margin-bottom: 16px;">Upload CSV with columns: id, name, role, balance</p>
            <textarea id="bulkImportData" 
                      placeholder="23cs001,Alice,student,500&#10;23cs002,Bob,student,300"
                      style="width: 100%; height: 200px; padding: 12px; border-radius: 8px; background: rgba(0,0,0,0.3); border: 1px solid var(--border); color: white; font-family: monospace;"></textarea>
            <button class="btn-primary w-100" onclick="processBulkImport()" style="margin-top: 16px;">Import Users</button>
        </div>
    </div>
</div>
```

Add functions:

```javascript
window.showBulkImport = () => {
    document.getElementById('bulkImportModal').classList.add('active');
};

window.processBulkImport = async () => {
    const data = document.getElementById('bulkImportData').value;
    const lines = data.trim().split('\n');
    
    const users = lines.map(line => {
        const [id, name, role, balance] = line.split(',');
        return { id: id.trim(), name: name.trim(), role: role.trim(), balance: Number(balance) || 0 };
    });

    try {
        const result = await fetchWithAuth('/admin-enhanced/bulk/users/import', {
            method: 'POST',
            body: JSON.stringify({ users })
        });

        showNotification(result.message, 'success');
        document.getElementById('bulkImportModal').classList.remove('active');
        loadUsers();
    } catch (error) {
        showNotification('Bulk import failed', 'error');
    }
};

window.exportUsers = () => {
    const role = document.getElementById('userRoleFilter')?.value || '';
    const url = `${API_BASE}/admin-enhanced/export/users?role=${role}`;
    window.open(url, '_blank');
    showNotification('Exporting users...', 'info');
};
```

## 6. Real-time Updates with Socket.io

Add to `dashboard.js`:

```javascript
// Connect to Socket.io
const socket = io(API_BASE.replace('/api', ''));

socket.on('connect', () => {
    console.log('✅ Connected to real-time server');
    socket.emit('joinRole', userSession.role);
});

// Listen for balance updates
socket.on('balanceUpdate', (data) => {
    showNotification(`Balance updated: ₹${data.balance}`, 'info');
    loadOverview(); // Refresh dashboard
});

// Listen for announcement updates
socket.on('announcementUpdate', (data) => {
    showNotification(`New announcement for ${data.branch}`, 'info');
    if (document.getElementById('comms-view').classList.contains('active')) {
        loadComms(); // Refresh if on comms view
    }
});

// Listen for order updates
socket.on('orderUpdate', (data) => {
    if (document.getElementById('kitchen-view').classList.contains('active')) {
        loadKitchen(); // Refresh kitchen view
    }
    if (document.getElementById('orders-view').classList.contains('active')) {
        loadOrders(); // Refresh orders view
    }
});
```

## 7. Enhanced UTR Management

Update `loadFinance()`:

```javascript
async function loadFinance() {
    try {
        const pendingUTR = await fetchWithAuth('/admin-enhanced/utr/pending');
        const utrList = document.getElementById('utrList');
        utrList.innerHTML = '';

        if (pendingUTR && pendingUTR.length > 0) {
            pendingUTR.forEach(txn => {
                const item = document.createElement('div');
                item.className = 'utr-item glass-flat';
                item.innerHTML = `
                    <div class="utr-info">
                        <strong>${txn.utr}</strong>
                        <span>₹${txn.amount} - User: ${txn.userId}</span>
                        <small style="color: var(--text-muted);">
                            ${new Date(txn.createdAt).toLocaleString()}
                        </small>
                    </div>
                    <div class="utr-actions">
                        <button class="btn-small success" onclick="verifyUTREnhanced('${txn.utr}')">
                            ✓ Approve
                        </button>
                        <button class="btn-small error" onclick="rejectUTREnhanced('${txn.utr}')">
                            ✗ Reject
                        </button>
                    </div>
                `;
                utrList.appendChild(item);
            });
        } else {
            utrList.innerHTML = '<div class="empty-state">No pending verifications</div>';
        }
    } catch (error) {
        console.warn('Finance data unreachable');
    }
}

window.verifyUTREnhanced = async (utr) => {
    try {
        const result = await fetchWithAuth('/admin-enhanced/utr/verify', {
            method: 'POST',
            body: JSON.stringify({ utr })
        });
        showNotification(`UTR verified! New balance: ₹${result.newBalance}`, 'success');
        loadFinance();
    } catch (error) {
        showNotification('Verification failed', 'error');
    }
};

window.rejectUTREnhanced = async (utr) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;
    
    try {
        await fetchWithAuth('/admin-enhanced/utr/reject', {
            method: 'POST',
            body: JSON.stringify({ utr, reason })
        });
        showNotification('UTR rejected', 'success');
        loadFinance();
    } catch (error) {
        showNotification('Rejection failed', 'error');
    }
};
```

## 8. Add CSS for New Elements

Add to `dashboard-styles.css`:

```css
/* Pagination */
.pagination {
    display: flex;
    gap: 8px;
    justify-content: center;
    margin-top: 20px;
}

.pagination-btn {
    padding: 8px 12px;
    background: var(--glass);
    border: 1px solid var(--border);
    border-radius: 8px;
    color: var(--text);
    cursor: pointer;
    transition: all 0.2s;
}

.pagination-btn:hover {
    background: var(--primary);
    border-color: var(--primary);
}

.pagination-btn.active {
    background: var(--primary);
    border-color: var(--primary);
    font-weight: 700;
}

/* Status badges */
.status {
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
}

.status.success {
    background: rgba(16, 185, 129, 0.2);
    color: #10b981;
}

.status.failure {
    background: rgba(239, 68, 68, 0.2);
    color: #ef4444;
}

/* Badge */
.badge {
    padding: 4px 8px;
    background: var(--primary);
    border-radius: 6px;
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
}

/* Secondary button */
.btn-secondary {
    padding: 10px 20px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid var(--border);
    border-radius: 10px;
    color: var(--text);
    cursor: pointer;
    font-weight: 600;
    transition: all 0.2s;
}

.btn-secondary:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: var(--primary);
}
```

## 9. Update Navigation

Add audit logs to navigation in `dashboard.js`:

```javascript
navItems.forEach(item => {
    item.addEventListener('click', () => {
        const targetView = item.getAttribute('data-view');
        
        // ... existing code ...
        
        if (targetView === 'audit') loadAuditLogs();
    });
});
```

## 10. Testing Checklist

- [ ] Dashboard stats load correctly
- [ ] Staff search and filter work
- [ ] Export buttons download CSV files
- [ ] Audit logs display with pagination
- [ ] Bulk import processes CSV data
- [ ] Real-time updates work (Socket.io)
- [ ] UTR verification updates balance
- [ ] All modals open and close properly
- [ ] Error notifications display correctly
- [ ] Rate limiting prevents abuse

## Summary

These enhancements provide:
- ✅ Real-time dashboard statistics
- ✅ Advanced search and filtering
- ✅ Data export capabilities
- ✅ Audit log viewer with pagination
- ✅ Bulk operations
- ✅ Real-time updates via Socket.io
- ✅ Enhanced UTR management
- ✅ Better error handling and notifications

The admin panel is now production-ready with enterprise-grade features!
