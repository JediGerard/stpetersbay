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
const deployBtn = document.getElementById('deploy-btn');
const statusMessage = document.getElementById('status-message');
const deploymentLogContainer = document.getElementById('deployment-log-container');
const deploymentLog = document.getElementById('deployment-log');

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

    if (menuData.beachDrinks) {
        menuData.beachDrinks.forEach(category => {
            beachDrinksCount += category.items ? category.items.length : 0;
        });
    }

    if (menuData.roomService) {
        menuData.roomService.forEach(category => {
            roomServiceCount += category.items ? category.items.length : 0;
        });
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

// Publish Menu
publishBtn?.addEventListener('click', async () => {
    const confirmed = confirm(
        'Publish staging menu to production?\n\n' +
        'This will:\n' +
        '- Create a timestamped backup of current production menu\n' +
        '- Update sample_menu.json with preview changes\n' +
        '- Require deployment to go live on website\n\n' +
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
            showSuccess('✅ Menu published successfully! Ready to deploy to live site.');
            deployBtn.disabled = false;
            await loadDashboard(); // Refresh data
        } else {
            showError('❌ Error: ' + result.error);
        }
    } catch (error) {
        showError('❌ Error publishing menu: ' + error.message);
    } finally {
        publishBtn.disabled = false;
        publishBtn.textContent = 'Publish Menu';
    }
});

// Deploy to Live Site
deployBtn?.addEventListener('click', async () => {
    const confirmed = confirm(
        'Deploy to live site?\n\n' +
        'This will:\n' +
        '- Commit menu changes to git\n' +
        '- Push to remote repository\n' +
        '- Trigger Vercel auto-deployment\n' +
        '- Take ~30-60 seconds\n' +
        '- Update live ordering system\n\n' +
        'Continue?'
    );

    if (!confirmed) return;

    // Disable buttons and show loading
    deployBtn.disabled = true;
    deployBtn.textContent = 'Deploying...';
    hideStatus();
    deploymentLogContainer.classList.remove('hidden');
    deploymentLog.textContent = '';

    try {
        const response = await fetch(`${API_BASE_URL}/api/deploy`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ deployedBy: currentUser.email })
        });

        // Stream deployment output
        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            deploymentLog.textContent += chunk;

            // Auto-scroll to bottom
            deploymentLog.scrollTop = deploymentLog.scrollHeight;
        }

        showSuccess('✅ Deployment complete! Changes are now live.');
        deployBtn.disabled = true; // Disable until next publish
        await loadDashboard(); // Refresh data

    } catch (error) {
        showError('❌ Error deploying: ' + error.message);
        deploymentLog.textContent += '\n\n❌ Deployment error: ' + error.message;
    } finally {
        deployBtn.textContent = 'Deploy to Live';
    }
});

// View Full JSON Buttons
document.getElementById('view-preview-btn')?.addEventListener('click', async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/menu/preview`);
        const data = await response.json();
        showJsonModal('Preview Menu (Staging)', data);
    } catch (error) {
        showError('Error loading preview menu');
    }
});

document.getElementById('view-production-btn')?.addEventListener('click', async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/menu/production`);
        const data = await response.json();
        showJsonModal('Production Menu (Live)', data);
    } catch (error) {
        showError('Error loading production menu');
    }
});

// JSON Modal
function showJsonModal(title, data) {
    const modal = document.getElementById('json-modal');
    document.getElementById('json-modal-title').textContent = title;
    document.getElementById('json-modal-content').textContent = JSON.stringify(data, null, 2);
    modal.classList.remove('hidden');
}

document.getElementById('close-modal-btn')?.addEventListener('click', () => {
    document.getElementById('json-modal').classList.add('hidden');
});

// Close modal on background click
document.getElementById('json-modal')?.addEventListener('click', (e) => {
    if (e.target.id === 'json-modal') {
        document.getElementById('json-modal').classList.add('hidden');
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
window.addEventListener('load', () => {
    console.log('Admin dashboard loaded');
    // Google Sign-In will auto-initialize from HTML
});
