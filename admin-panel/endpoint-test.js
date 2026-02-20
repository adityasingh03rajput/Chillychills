// Endpoint Test Script for ChillyChills Admin Panel
// Run this in the browser console after logging in

async function testAllEndpoints() {
    const API_BASE = 'http://localhost:3001/api';
    const sessionData = JSON.parse(localStorage.getItem('chillyAdmin'));

    if (!sessionData || !sessionData.token) {
        console.error('❌ Not logged in! Please login first.');
        return;
    }

    const headers = {
        'Authorization': `Bearer ${sessionData.token}`,
        'Content-Type': 'application/json'
    };

    const tests = [
        { name: 'Analytics - Real-time Stats', url: '/analytics/real-time-stats' },
        { name: 'Orders - Get All', url: '/orders' },
        { name: 'Balance - Current', url: '/balance/current' },
        { name: 'Menu - Get All', url: '/menu' },
        { name: 'Staff - Get All', url: '/admin/staff' },
        { name: 'Finance - Pending UTR', url: '/admin/utr/pending' },
        { name: 'Social - Pending Selfies', url: '/selfies/pending' },
        { name: 'Comms - Announcements', url: '/admin/announcements' },
        { name: 'Users - Get All', url: '/users' },
        { name: 'Gift Cards - Get All', url: '/giftcards/all' },
        { name: 'Feedback - Get All', url: '/feedback' },
        { name: 'Analytics - Popular Items', url: '/analytics/popular-items?limit=5' },
        { name: 'Analytics - Customer Behavior', url: '/analytics/customer-behavior' },
        { name: 'Analytics - Trends', url: '/analytics/trends?period=week' }
    ];

    console.log('🧪 Starting Endpoint Tests...\n');

    let passed = 0;
    let failed = 0;
    const results = [];

    for (const test of tests) {
        try {
            const response = await fetch(`${API_BASE}${test.url}`, { headers });
            const data = await response.json();

            if (response.ok) {
                console.log(`✅ ${test.name}: OK`);
                results.push({ test: test.name, status: 'PASS', code: response.status });
                passed++;
            } else {
                console.error(`❌ ${test.name}: ${response.status} - ${data.error || 'Unknown error'}`);
                results.push({ test: test.name, status: 'FAIL', code: response.status, error: data.error });
                failed++;
            }
        } catch (error) {
            console.error(`❌ ${test.name}: Network Error - ${error.message}`);
            results.push({ test: test.name, status: 'ERROR', error: error.message });
            failed++;
        }
    }

    console.log('\n📊 Test Summary:');
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📈 Success Rate: ${Math.round((passed / tests.length) * 100)}%`);

    console.log('\n📋 Detailed Results:');
    console.table(results);

    return results;
}

// Run the test
console.log('🚀 ChillyChills Endpoint Test Suite');
console.log('====================================\n');
testAllEndpoints();
