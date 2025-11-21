// Admin Dashboard Logic for St. Peter's Bay Food Ordering System
// Handles Google OAuth authentication, menu management, and deployment

const API_BASE_URL = window.location.origin;

let currentUser = null;
let authToken = null;

// Elements
const loginSection = document.getElementById('login-section');
const adminDashboard = document.getElementById('admin-dashboard');
const userInfo = document.getElementById('user-info');
const notLoggedIn = document.getElementById('not-logged-in');
const loginError = document.getElementById('login-error');
const loginErrorMessage = document.getElementById('login-error-message');

const publishBtn = document.getElementById('publish-btn');
const statusMessage = document.getElementById('status-message');

const signoutBtn = document.getElementById('signout-btn');

// Google Sign-In Callback (must be in global scope)
async function handleCredentialResponse(response) {
    authToken = response.credential;

    // Show loading state
    loginSection.querySelector('.g_id_signin').innerHTML = '<p class="text-gray-600">Verifying credentials...</p>';

    try {
        // Verify with backend
        const res = await fetch(`${API_BASE_URL}/api/verify-auth`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: authToken })
        });

        const data = await res.json();

        if (data.authorized) {
            currentUser = data.user;

            // Store auth data in sessionStorage for persistence
            sessionStorage.setItem('adminAuthToken', authToken);
            sessionStorage.setItem('adminUser', JSON.stringify(currentUser));

            showAdminDashboard();
        } else {
            showAccessDenied(data.error || 'Access denied');
        }
    } catch (error) {
        showAccessDenied('Error verifying credentials: ' + error.message);
    }
}

// Expose to global scope for Google Sign-In
window.handleCredentialResponse = handleCredentialResponse;

// Show Admin Dashboard
function showAdminDashboard() {
    loginSection.classList.add('hidden');
    adminDashboard.classList.remove('hidden');
    notLoggedIn.classList.add('hidden');
    userInfo.classList.remove('hidden');

    // Display user info
    document.getElementById('user-name').textContent = currentUser.name;
    document.getElementById('user-email').textContent = currentUser.email;
    document.getElementById('user-picture').src = currentUser.picture;

    // Load dashboard data
    loadDashboard();
}

// Show Access Denied
function showAccessDenied(message) {
    loginError.classList.remove('hidden');
    loginErrorMessage.textContent = message;

    // Reset Google Sign-In button
    setTimeout(() => {
        window.location.reload();
    }, 3000);
}

// Sign Out
signoutBtn?.addEventListener('click', () => {
    currentUser = null;
    authToken = null;

    // Clear sessionStorage
    sessionStorage.removeItem('adminAuthToken');
    sessionStorage.removeItem('adminUser');

    window.location.reload();
});

// Load Dashboard Data
async function loadDashboard() {
    try {
        // Load stats
        await loadStats();

        // Load menu comparison
        await loadMenuComparison();

        // Load activity history
        await loadActivityHistory();
    } catch (error) {
        console.error('Error loading dashboard:', error);
        showError('Error loading dashboard data');
    }
}

// Load Stats
async function loadStats() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/stats`);
        const stats = await response.json();

        document.getElementById('total-items').textContent = stats.totalItems || '0';
        document.getElementById('preview-items').textContent = stats.previewItems || '0';
        document.getElementById('last-sync').textContent = formatTimestamp(stats.lastSync);
        document.getElementById('last-publish').textContent = formatTimestamp(stats.lastPublish);

        // Show changes indicator if there are differences
        const changesIndicator = document.getElementById('changes-indicator');
        if (stats.hasChanges) {
            changesIndicator.classList.remove('hidden');
        } else {
            changesIndicator.classList.add('hidden');
        }
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Load Menu Comparison
async function loadMenuComparison() {
    try {
        // Load preview menu
        const previewResponse = await fetch(`${API_BASE_URL}/api/menu/preview`);
        const previewData = await previewResponse.json();

        // Load production menu
        const productionResponse = await fetch(`${API_BASE_URL}/api/menu/production`);
        const productionData = await productionResponse.json();

        // Display summaries
        displayMenuSummary('preview-summary', previewData);
        displayMenuSummary('production-summary', productionData);

    } catch (error) {
        console.error('Error loading menu comparison:', error);
    }
}

// Display Menu Summary
function displayMenuSummary(elementId, menuData) {
    const element = document.getElementById(elementId);

    let beachDrinksCount = 0;
    let roomServiceCount = 0;

    // Menu data is stored as flat arrays of items
    if (menuData.beachDrinks && Array.isArray(menuData.beachDrinks)) {
        beachDrinksCount = menuData.beachDrinks.length;
    }

    if (menuData.roomService && Array.isArray(menuData.roomService)) {
        roomServiceCount = menuData.roomService.length;
    }

    element.innerHTML = `
        <div class="space-y-2 text-sm">
            <div class="flex justify-between">
                <span class="text-gray-600">Beach Drinks:</span>
                <span class="font-medium">${beachDrinksCount} items</span>
            </div>
            <div class="flex justify-between">
                <span class="text-gray-600">Room Service:</span>
                <span class="font-medium">${roomServiceCount} items</span>
            </div>
            <div class="flex justify-between pt-2 border-t">
                <span class="text-gray-900 font-medium">Total:</span>
                <span class="font-bold">${beachDrinksCount + roomServiceCount} items</span>
            </div>
        </div>
    `;
}

// Load Activity History
async function loadActivityHistory() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/history`);
        const history = await response.json();

        const activityLog = document.getElementById('activity-log');

        if (history.length === 0) {
            activityLog.innerHTML = '<p class="p-6 text-gray-600 text-sm">No publish history yet.</p>';
            return;
        }

        activityLog.innerHTML = history.map(item => `
            <div class="p-4 hover:bg-gray-50">
                <div class="flex justify-between items-center">
                    <div>
                        <p class="font-medium text-gray-900">${item.filename}</p>
                        <p class="text-xs text-gray-600">${formatTimestamp(item.timestamp)}</p>
                    </div>
                    <div class="text-sm text-gray-600">
                        ${formatFileSize(item.size)}
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading activity history:', error);
    }
}

// Publish Menu to Live Site
publishBtn?.addEventListener('click', async () => {
    const confirmed = confirm(
        'Publish staging menu to live site?\n\n' +
        'This will:\n' +
        '- Create a timestamped backup of current production menu\n' +
        '- Update production menu in Firestore database\n' +
        '- Changes will be LIVE IMMEDIATELY on the website\n\n' +
        'Continue?'
    );

    if (!confirmed) return;

    // Disable button and show loading
    publishBtn.disabled = true;
    publishBtn.textContent = 'Publishing...';
    hideStatus();

    try {
        const response = await fetch(`${API_BASE_URL}/api/publish`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ publishedBy: currentUser.email })
        });

        const result = await response.json();

        if (result.success) {
            showSuccess('✅ Menu published successfully! Changes are now LIVE on the website.');
            await loadDashboard(); // Refresh data
        } else {
            showError('❌ Error: ' + result.error);
        }
    } catch (error) {
        showError('❌ Error publishing menu: ' + error.message);
    } finally {
        publishBtn.disabled = false;
        publishBtn.textContent = 'Publish to Live Site';
    }
});

// Utility Functions
function showSuccess(message) {
    statusMessage.textContent = message;
    statusMessage.className = 'mt-4 p-3 rounded-lg text-sm bg-green-100 text-green-700';
    statusMessage.classList.remove('hidden');
}

function showError(message) {
    statusMessage.textContent = message;
    statusMessage.className = 'mt-4 p-3 rounded-lg text-sm bg-red-100 text-red-700';
    statusMessage.classList.remove('hidden');
}

function hideStatus() {
    statusMessage.classList.add('hidden');
}

function formatTimestamp(timestamp) {
    if (!timestamp || timestamp === 'Never') return 'Never';

    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
}

function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
}

// Initialize on page load
window.addEventListener('load', async () => {
    console.log('Admin dashboard loaded');

    // Check for existing session
    const savedToken = sessionStorage.getItem('adminAuthToken');
    const savedUser = sessionStorage.getItem('adminUser');

    if (savedToken && savedUser) {
        console.log('Found existing session, verifying...');

        try {
            // Verify token is still valid
            const res = await fetch(`${API_BASE_URL}/api/verify-auth`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: savedToken })
            });

            const data = await res.json();

            if (data.authorized) {
                // Restore session
                authToken = savedToken;
                currentUser = JSON.parse(savedUser);
                showAdminDashboard();
                console.log('Session restored successfully');
            } else {
                // Token expired or invalid, clear storage
                console.log('Session expired, clearing...');
                sessionStorage.removeItem('adminAuthToken');
                sessionStorage.removeItem('adminUser');
            }
        } catch (error) {
            console.error('Error verifying session:', error);
            // Clear invalid session
            sessionStorage.removeItem('adminAuthToken');
            sessionStorage.removeItem('adminUser');
        }
    } else {
        console.log('No existing session found');
    }

    // Google Sign-In will auto-initialize from HTML
});
