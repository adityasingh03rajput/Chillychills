document.addEventListener('DOMContentLoaded', () => {
    // Check Authentication
    const sessionData = localStorage.getItem('chillyAdmin');
    if (!sessionData) {
        window.location.href = 'index.html';
        return;
    }
    const userSession = JSON.parse(sessionData);

    const savedUrl = localStorage.getItem('CHILLY_PROD_URL');
    const API_BASE = savedUrl ? `${savedUrl}/api` : 'http://localhost:3001/api';

    // Helper for authorized requests
    async function fetchWithAuth(endpoint, options = {}) {
        const headers = {
            'Authorization': `Bearer ${userSession.token}`,
            'Content-Type': 'application/json',
            ...options.headers
        };

        const response = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
        if (response.status === 401) {
            localStorage.removeItem('chillyAdmin');
            window.location.href = 'index.html';
            return;
        }
        return response.json();
    }

    // Update Profile Info
    document.getElementById('userName').textContent = userSession.name || userSession.id.toUpperCase();
    document.getElementById('userRoleBadge').textContent = userSession.role === 'manager' ? 'Super Admin' : 'Staff Member';
    document.getElementById('userAvatar').textContent = (userSession.name || userSession.id).charAt(0).toUpperCase();

    // View Management
    const navItems = document.querySelectorAll('.nav-item');
    const views = document.querySelectorAll('.view');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetView = item.getAttribute('data-view');

            // Switch Menu
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            // Switch View
            views.forEach(v => v.classList.remove('active'));
            document.getElementById(`${targetView}-view`).classList.add('active');

            // Load view specific data
            if (targetView === 'menu') loadMenu();
            if (targetView === 'orders') loadOrders();
            if (targetView === 'staff') loadStaff();
            if (targetView === 'finance') loadFinance();
            if (targetView === 'social') loadSocial();
            if (targetView === 'comms') loadComms();
            if (targetView === 'users') loadUsers();
            if (targetView === 'giftcards') loadGiftCards();
            if (targetView === 'feedback') loadFeedback();
            if (targetView === 'kitchen') loadKitchen();
            if (targetView === 'student-order') loadStudentOrder();
            if (targetView === 'analytics') loadAnalytics();
        });
    });

    let studentCart = [];
    let menuData = [];

    // Load Initial Data
    async function loadOverview() {
        try {
            const [stats, orders, balance] = await Promise.all([
                fetchWithAuth('/analytics/real-time-stats'),
                fetchWithAuth('/orders'),
                fetchWithAuth('/balance/current')
            ]);

            // Update Stats Grid
            if (stats) {
                document.querySelector('.stat-card:nth-child(1) .value').textContent = `₹${stats.todayRevenue.toLocaleString()}`;
                document.querySelector('.stat-card:nth-child(2) .value').textContent = stats.activeOrders;
            }

            if (balance) {
                // Example: using total revenue if todayRevenue is not enough
                // document.querySelector('.stat-card:nth-child(1) .value').textContent = `₹${balance.totalRevenue.toLocaleString()}`;
            }

            // Update Recent Orders table
            if (orders) {
                const orderList = document.querySelector('.order-list');
                orderList.innerHTML = '';
                orders.slice(0, 5).forEach(order => {
                    const item = document.createElement('div');
                    item.className = 'order-item';
                    item.innerHTML = `
                        <div class="order-id">#${(order.token || order.id.slice(-4)).toUpperCase()}</div>
                        <div class="order-desc">${order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}</div>
                        <div class="order-branch">${order.branch || 'A'}</div>
                        <div class="order-status ${order.status}">${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</div>
                    `;
                    orderList.appendChild(item);
                });
            }
        } catch (error) {
            console.error('Failed to load overview:', error);
        }
    }

    async function loadMenu() {
        try {
            const menu = await fetchWithAuth('/menu');
            menuData = menu; // Store globally for edit function
            const menuGrid = document.querySelector('.menu-grid');
            menuGrid.innerHTML = '';

            menu.forEach(item => {
                const card = document.createElement('div');
                card.className = 'menu-item-card';
                card.innerHTML = `
                    <div class="menu-img">🍔</div>
                    <div class="menu-details">
                        <h4>${item.name}</h4>
                        <p>₹${item.price}</p>
                        <div class="menu-actions">
                            <button class="btn-small" onclick="promptEditMenu('${item.id}')">Edit</button>
                            <button class="btn-small delete" onclick="removeMenuItem('${item.id}')">Delete</button>
                        </div>
                    </div>
                    <div class="menu-toggle">
                        <span>${item.available ? 'Available' : 'Sold Out'}</span>
                        <label class="switch">
                            <input type="checkbox" ${item.available ? 'checked' : ''} onchange="toggleAvailability('${item.id}', this.checked)">
                            <span class="slider round"></span>
                        </label>
                    </div>
                `;
                menuGrid.appendChild(card);
            });
        } catch (error) {
            console.error('Failed to load menu:', error);
        }
    }

    window.promptEditMenu = async (id) => {
        const item = menuData.find(m => m.id === id) || { name: '', price: 0 };
        const newPrice = prompt(`Update price for ${item.name}:`, item.price);
        if (newPrice && !isNaN(newPrice)) {
            await fetchWithAuth(`/menu/${id}`, {
                method: 'PUT',
                body: JSON.stringify({ price: Number(newPrice) })
            });
            loadMenu();
        }
    };

    window.removeMenuItem = async (id) => {
        if (confirm('Delete this item from the campus catalog?')) {
            await fetchWithAuth(`/menu/${id}`, { method: 'DELETE' });
            loadMenu();
        }
    };

    async function loadStaff() {
        try {
            const staff = await fetchWithAuth('/admin/staff');
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
                    <td><button class="btn-small delete" onclick="removeStaff('${person.id}')">Remove</button></td>
                `;
                tbody.appendChild(tr);
            });
        } catch (error) {
            console.error('Failed to load staff:', error);
        }
    }

    // Initialize
    loadOverview();

    // Navigation Helper
    window.navigateToOrders = () => {
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        document.getElementById('orders-view').classList.add('active');
        loadOrders();
    };

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('chillyAdmin');
        window.location.href = 'index.html';
    });

    // Unified Modal Trigger Logic
    const modals = document.querySelectorAll('.modal');
    const closeBtns = document.querySelectorAll('.close-modal');

    document.getElementById('openRecruitBtn').addEventListener('click', () => {
        document.getElementById('recruitModal').classList.add('active');
    });

    document.getElementById('openCommsBtn')?.addEventListener('click', () => {
        document.getElementById('announcementModal').classList.add('active');
    });

    document.getElementById('openMenuCreatorBtn')?.addEventListener('click', () => {
        document.getElementById('menuModal').classList.add('active');
    });

    closeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            modals.forEach(m => m.classList.remove('active'));
        });
    });

    // Handle Forms
    if (recruitForm) {
        recruitForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = recruitForm.querySelector('button[type="submit"]');
            submitBtn.textContent = 'Processing...';
            submitBtn.disabled = true;

            const staffData = {
                id: document.getElementById('staffId').value,
                name: document.getElementById('staffName').value,
                password: document.getElementById('staffPass').value,
                role: document.getElementById('staffRole').value,
                branch: document.getElementById('staffBranch').value
            };

            try {
                const response = await fetchWithAuth('/admin/staff/recruit', {
                    method: 'POST',
                    body: JSON.stringify(staffData)
                });

                if (response.success) {
                    alert('Staff recruited successfully!');
                    document.getElementById('recruitModal').classList.remove('active');
                    recruitForm.reset();
                    loadStaff();
                } else {
                    alert(response.error || 'Recruitment failed');
                }
            } catch (error) {
                alert('Connection to recruitment office failed');
            } finally {
                submitBtn.textContent = 'Confirm Recruitment';
                submitBtn.disabled = false;
            }
        });
    }

    const menuForm = document.getElementById('menuForm');
    if (menuForm) {
        menuForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const itemData = {
                id: document.getElementById('menuId').value,
                name: document.getElementById('menuName').value,
                price: Number(document.getElementById('menuPrice').value),
                category: document.getElementById('menuCategory').value,
                branch: 'All'
            };

            try {
                await fetchWithAuth('/menu', {
                    method: 'POST',
                    body: JSON.stringify(itemData)
                });
                alert('Menu Item Created!');
                document.getElementById('menuModal').classList.remove('active');
                menuForm.reset();
                loadMenu();
            } catch (err) {
                alert('Creation failed');
            }
        });
    }

    // --- Module Specific Loaders ---

    async function loadFinance() {
        try {
            const pendingUTR = await fetchWithAuth('/admin/utr/pending');
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
                        </div>
                        <div class="utr-actions">
                            <button class="btn-small success" onclick="verifyUTR('${txn.utr}', true)">Approve</button>
                            <button class="btn-small error" onclick="verifyUTR('${txn.utr}', false)">Reject</button>
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

    async function loadSocial() {
        try {
            const pendingSelfies = await fetchWithAuth('/selfies/pending');
            const grid = document.getElementById('selfieModerationGrid');
            grid.innerHTML = '';

            if (pendingSelfies && pendingSelfies.length > 0) {
                pendingSelfies.forEach(selfie => {
                    const card = document.createElement('div');
                    card.className = 'selfie-moderate-card glass';
                    card.innerHTML = `
                        <img src="${selfie.imageUrl}" alt="Selfie" style="width: 100%; border-radius: 12px; margin-bottom: 12px;">
                        <div class="selfie-info" style="margin-bottom: 12px;">
                            <strong style="display: block; margin-bottom: 4px;">${selfie.userName}</strong>
                            <span style="color: var(--text-muted); font-size: 12px;">User ID: ${selfie.userId}</span>
                            ${selfie.caption ? `<p style="margin-top: 8px; font-size: 14px; font-style: italic;">"${selfie.caption}"</p>` : ''}
                        </div>
                        <div class="selfie-actions" style="display: flex; gap: 8px;">
                            <button class="btn-small success" onclick="moderateSelfie('${selfie.id}', 'approve')" style="flex: 1;">✓ Approve</button>
                            <button class="btn-small error" onclick="moderateSelfie('${selfie.id}', 'reject')" style="flex: 1;">✗ Reject</button>
                        </div>
                    `;
                    grid.appendChild(card);
                });
            } else {
                grid.innerHTML = '<div class="empty-state">No pending selfies for moderation</div>';
            }
        } catch (error) {
            console.warn('Social hub unreachable');
        }
    }

    async function loadComms() {
        try {
            const announcements = await fetchWithAuth('/admin/announcements');
            const list = document.getElementById('announcementsList');
            list.innerHTML = '';

            Object.entries(announcements).forEach(([branch, msg]) => {
                const card = document.createElement('div');
                card.className = 'announcement-card glass';
                card.style.marginBottom = '12px';
                card.style.padding = '16px';
                card.innerHTML = `
                    <span class="branch-badge ${branch}">${branch.toUpperCase()}</span>
                    <p style="margin: 12px 0;">${msg}</p>
                    <button class="btn-small error" onclick="removeAnnouncement('${branch}')">Remove</button>
                `;
                list.appendChild(card);
            });
        } catch (error) {
            console.error('Failed to load comms:', error);
        }
    }

    async function loadUsers() {
        try {
            const users = await fetchWithAuth('/users');
            const tbody = document.querySelector('#userTable tbody');
            tbody.innerHTML = '';

            users.forEach(user => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${user.id}</td>
                    <td>${user.name}</td>
                    <td>${user.role}</td>
                    <td><span style="opacity: 0.3;">●●●●●</span></td>
                    <td>
                        <button class="btn-small" onclick="topupSpecificUser('${user.id}')">Add Funds</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        } catch (err) {
            console.error('Failed to load users');
        }
    }

    async function loadGiftCards() {
        try {
            const registry = await fetchWithAuth('/giftcards/all');
            const grid = document.getElementById('giftCardRegistry');
            grid.innerHTML = '';

            registry.forEach(card => {
                const item = document.createElement('div');
                item.className = 'giftcard-item glass-flat';
                item.innerHTML = `
                    <div class="gc-info">
                        <strong>Code: ${card.code}</strong>
                        <span>Value: ₹${card.amount} (+₹${card.bonus} bonus)</span>
                        <span class="status ${card.isRedeemed ? 'used' : 'valid'}">${card.isRedeemed ? 'Redeemed' : 'Active'}</span>
                    </div>
                `;
                grid.appendChild(item);
            });
        } catch (err) {
            console.error('Failed to load gift cards');
        }
    }

    async function loadFeedback() {
        try {
            const feedback = await fetchWithAuth('/feedback');
            const list = document.getElementById('feedbackList');
            list.innerHTML = '';

            feedback.reverse().forEach(fb => {
                const item = document.createElement('div');
                item.className = 'feedback-item glass-flat';
                item.innerHTML = `
                    <div class="fb-header">
                        <strong>User: ${fb.userId}</strong>
                        <span>Rating: ${'★'.repeat(fb.rating)}</span>
                    </div>
                    <p>${fb.comment}</p>
                `;
                list.appendChild(item);
            });
        } catch (err) {
            console.error('Failed to load feedback');
        }
    }

    // --- Orders Management ---
    async function loadOrders() {
        try {
            const orders = await fetchWithAuth('/orders');
            const list = document.getElementById('allOrdersList');
            list.innerHTML = '';

            if (orders.length === 0) {
                list.innerHTML = '<div class="empty-state">No orders found</div>';
                return;
            }

            orders.forEach(order => {
                const item = document.createElement('div');
                item.className = 'order-item';
                item.innerHTML = `
                    <div class="order-id">#${(order.token || order.id.slice(-4)).toUpperCase()}</div>
                    <div class="order-desc">${order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}</div>
                    <div class="order-branch">${order.branch || 'A'}</div>
                    <div class="order-status ${order.status}">${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</div>
                    <div style="color: var(--text-muted); font-size: 12px;">₹${order.totalAmount}</div>
                `;
                list.appendChild(item);
            });
        } catch (err) {
            console.error('Failed to load orders');
        }
    }

    // --- Analytics ---
    async function loadAnalytics() {
        try {
            const [popular, behavior, trends] = await Promise.all([
                fetchWithAuth('/analytics/popular-items?limit=5'),
                fetchWithAuth('/analytics/customer-behavior'),
                fetchWithAuth('/analytics/trends?period=week')
            ]);

            // Popular Items
            const popularDiv = document.getElementById('popularItemsChart');
            popularDiv.innerHTML = popular.map(item => `
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--border);">
                    <span>${item.rank}. ${item.name}</span>
                    <span style="color: var(--primary);">${item.totalQuantity} orders</span>
                </div>
            `).join('');

            // Customer Behavior
            const behaviorDiv = document.getElementById('customerBehaviorChart');
            behaviorDiv.innerHTML = `
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;">
                    <div>
                        <div style="font-size: 24px; font-weight: 700; color: var(--primary);">${behavior.totalCustomers}</div>
                        <div style="color: var(--text-muted); font-size: 12px;">Total Customers</div>
                    </div>
                    <div>
                        <div style="font-size: 24px; font-weight: 700; color: var(--success);">${behavior.repeatCustomers}</div>
                        <div style="color: var(--text-muted); font-size: 12px;">Repeat Customers</div>
                    </div>
                    <div>
                        <div style="font-size: 24px; font-weight: 700; color: var(--warning);">${behavior.averageOrdersPerCustomer}</div>
                        <div style="color: var(--text-muted); font-size: 12px;">Avg Orders/Customer</div>
                    </div>
                    <div>
                        <div style="font-size: 24px; font-weight: 700; color: var(--info);">${behavior.customerRetentionRate}%</div>
                        <div style="color: var(--text-muted); font-size: 12px;">Retention Rate</div>
                    </div>
                </div>
            `;

            // Revenue Trends
            const trendsDiv = document.getElementById('revenueTrendsChart');
            trendsDiv.innerHTML = `
                <div style="margin-bottom: 16px;">
                    <div style="font-size: 20px; font-weight: 700;">₹${trends.summary.totalRevenue.toLocaleString()}</div>
                    <div style="color: var(--text-muted); font-size: 12px;">Total Revenue (${trends.period})</div>
                </div>
                ${trends.trends.map(day => `
                    <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid var(--border);">
                        <span style="font-size: 12px;">${new Date(day.date).toLocaleDateString()}</span>
                        <span style="color: var(--success); font-size: 12px;">₹${day.revenue}</span>
                    </div>
                `).join('')}
            `;
        } catch (err) {
            console.error('Failed to load analytics');
        }
    }

    // --- Kitchen Ops (Chef Mode) ---
    async function loadKitchen() {
        try {
            const orders = await fetchWithAuth('/orders');
            const grid = document.getElementById('kitchenOrderGrid');
            grid.innerHTML = '';

            // Filter only active orders for kitchen (not completed/cancelled)
            const activeOrders = orders.filter(o => ['placed', 'preparing', 'ready'].includes(o.status));

            if (activeOrders.length === 0) {
                grid.innerHTML = '<div class="empty-state">Kitchen clear! 🥘</div>';
                return;
            }

            activeOrders.forEach(order => {
                const card = document.createElement('div');
                card.className = `kitchen-card glass-flat status-${order.status}`;
                card.innerHTML = `
                    <div class="k-header">
                        <strong>TOKEN: ${order.token || 'N/A'}</strong>
                        <span class="badge">${order.branch?.toUpperCase() || 'A'}</span>
                    </div>
                    <div class="k-items">
                        ${order.items.map(i => `<div class="k-item">${i.quantity}x ${i.name}</div>`).join('')}
                    </div>
                    <div class="k-actions">
                        ${order.status === 'placed' ? `<button class="btn-small success" onclick="updateKitchenStatus('${order.id}', 'preparing')">Start Prep</button>` : ''}
                        ${order.status === 'preparing' ? `<button class="btn-small success" onclick="updateKitchenStatus('${order.id}', 'ready')">Mark Ready</button>` : ''}
                        ${order.status === 'ready' ? `<button class="btn-small success" onclick="updateKitchenStatus('${order.id}', 'completed')">Serve</button>` : ''}
                    </div>
                `;
                grid.appendChild(card);
            });
        } catch (err) {
            console.error('Kitchen station offline');
        }
    }

    window.updateKitchenStatus = async (id, status) => {
        try {
            await fetchWithAuth(`/orders/${id}`, {
                method: 'PUT',
                body: JSON.stringify({ status })
            });
            loadKitchen();
        } catch (err) {
            alert('Failed to update kitchen status');
        }
    };

    // --- Student Portal (Student Mode) ---
    async function loadStudentOrder() {
        try {
            menuData = await fetchWithAuth('/menu');
            const grid = document.getElementById('studentMenuGrid');
            grid.innerHTML = '';

            menuData.filter(i => i.available).forEach(item => {
                const card = document.createElement('div');
                card.className = 'menu-item-card glass';
                card.innerHTML = `
                    <div class="menu-img">🍱</div>
                    <div class="menu-details">
                        <h4>${item.name}</h4>
                        <p>₹${item.price}</p>
                        <button class="btn-primary btn-small w-100" onclick="addToStudentCart('${item.id}')">Add to Cart</button>
                    </div>
                `;
                grid.appendChild(card);
            });
            updateCartUI();
        } catch (err) {
            console.error('Portal connection failed');
        }
    }

    window.addToStudentCart = (id) => {
        const item = menuData.find(m => m.id === id);
        const existing = studentCart.find(c => c.id === id);
        if (existing) {
            existing.quantity++;
        } else {
            studentCart.push({ ...item, quantity: 1 });
        }
        updateCartUI();
    };

    function updateCartUI() {
        const cartDiv = document.getElementById('studentCartItems');
        const totalSpan = document.getElementById('cartTotal');
        cartDiv.innerHTML = '';
        let total = 0;

        studentCart.forEach(item => {
            total += item.price * item.quantity;
            const row = document.createElement('div');
            row.className = 'cart-row';
            row.innerHTML = `
                <span>${item.name} x${item.quantity}</span>
                <span>₹${item.price * item.quantity}</span>
            `;
            cartDiv.appendChild(row);
        });
        totalSpan.textContent = total;
    }

    window.placeStudentOrder = async () => {
        if (studentCart.length === 0) return alert('Your tray is empty!');
        const total = Number(document.getElementById('cartTotal').textContent);

        try {
            const orderPayload = {
                items: studentCart,
                total: total,
                userId: userSession.id,
                branch: document.getElementById('activeBranch').value,
                status: 'placed',
                timestamp: Date.now()
            };

            const res = await fetchWithAuth('/orders', {
                method: 'POST',
                body: JSON.stringify(orderPayload)
            });

            if (res.id) {
                alert(`Order Placed! Token: ${res.token || res.id.slice(-4)}`);
                studentCart = [];
                updateCartUI();
                loadKitchen(); // Immediate kitchen update
            }
        } catch (err) {
            alert('Ordering system error');
        }
    };

    // --- Communication Logic ---
    const announcementModal = document.getElementById('announcementModal');
    const annForm = document.getElementById('announcementForm');

    if (annForm) {
        annForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const branch = document.getElementById('msgBranch').value;
            const message = document.getElementById('msgContent').value;

            try {
                await fetchWithAuth('/admin/announcements', {
                    method: 'POST',
                    body: JSON.stringify({ branch, message })
                });
                alert('Broadcast Sent!');
                announcementModal.classList.remove('active');
                loadComms();
            } catch (err) {
                alert('Broadcast failed');
            }
        });
    }

    // --- Wallet Topup ---
    const topupForm = document.getElementById('walletTopupForm');
    if (topupForm) {
        topupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const userId = document.getElementById('topupUserId').value;
            const amount = document.getElementById('topupAmount').value;

            try {
                const res = await fetchWithAuth('/payment/manual-topup', {
                    method: 'POST',
                    body: JSON.stringify({ userId, amount })
                });
                if (res.success) {
                    alert('Wallet Updated!');
                    topupForm.reset();
                } else {
                    alert(res.error || 'Update failed');
                }
            } catch (err) {
                alert('Failed to connect to financial server');
            }
        });
    }

    // --- Utilities ---
    window.verifyUTR = async (utr, approve) => {
        const action = approve ? 'verify' : 'reject';
        await fetchWithAuth(`/admin/utr/${action}`, {
            method: 'POST',
            body: JSON.stringify({ utr })
        });
        loadFinance();
    };

    window.moderateSelfie = async (id, action) => {
        const status = action === 'approve' ? 'approved' : 'rejected';
        await fetchWithAuth(`/selfies/${id}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        });
        loadSocial();
    };

    window.removeAnnouncement = async (branch) => {
        await fetchWithAuth(`/admin/announcements/${branch}`, {
            method: 'DELETE'
        });
        loadComms();
    };

    window.topupSpecificUser = async (id) => {
        const amount = prompt(`Enter amount to add to wallet for ${id}:`);
        if (amount && !isNaN(amount)) {
            try {
                const res = await fetchWithAuth('/payment/manual-topup', {
                    method: 'POST',
                    body: JSON.stringify({ userId: id, amount: Number(amount) })
                });
                if (res.success) {
                    alert('Wallet Updated!');
                    loadUsers();
                } else {
                    alert(res.error || 'Update failed');
                }
            } catch (err) {
                alert('Connection error');
            }
        }
    };

    // Expose functions to global scope for inline onclicks
    window.toggleAvailability = async (id, available) => {
        await fetchWithAuth(`/menu/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ available })
        });
        loadMenu();
    };

    window.removeStaff = async (id) => {
        if (confirm('Are you sure you want to remove this staff member?')) {
            await fetchWithAuth(`/admin/staff/${id}`, {
                method: 'DELETE'
            });
            loadStaff();
        }
    };
});
