// ====================================
// ST. PETER'S BAY - DASHBOARD LOGIC
// Kitchen/Bar Staff Order Dashboard
// ====================================

// Import Firebase
import { db } from './firebase-config.js';
import {
    collection,
    query,
    where,
    onSnapshot,
    doc,
    updateDoc,
    Timestamp
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

let allOrders = [];
let currentFilter = 'all';
let lastOrderCount = 0;
let unsubscribe = null; // Store the unsubscribe function for cleanup

// ====================================
// INITIALIZATION
// ====================================

window.addEventListener('DOMContentLoaded', () => {
    setupRealtimeListener();
});

// ====================================
// REAL-TIME FIRESTORE LISTENER
// ====================================

function setupRealtimeListener() {
    try {
        // Query for all orders that are NOT completed
        const ordersCollection = collection(db, 'orders');
        const q = query(ordersCollection, where('status', '!=', 'completed'));

        // Set up real-time listener
        unsubscribe = onSnapshot(q, (snapshot) => {
            allOrders = [];

            snapshot.forEach((doc) => {
                const orderData = doc.data();
                // Convert Firestore Timestamp to JavaScript Date
                if (orderData.timestamp) {
                    orderData.timestamp = orderData.timestamp.toDate().toISOString();
                }
                allOrders.push({
                    id: doc.id,
                    ...orderData
                });
            });

            // Check for new orders
            if (allOrders.length > lastOrderCount) {
                console.log('New order detected!');
                // Could play a sound here in future
            }
            lastOrderCount = allOrders.length;

            // Update display
            displayOrders();
            updateOrderCount();

            console.log('Orders updated from Firestore:', allOrders.length);
        }, (error) => {
            console.error('Error listening to orders:', error);
            alert('Error connecting to database. Please refresh the page.');
        });

        console.log('Real-time listener setup complete');
    } catch (error) {
        console.error('Error setting up Firestore listener:', error);
        alert('Error connecting to database. Please refresh the page.');
    }
}

// Clean up listener when page unloads
window.addEventListener('beforeunload', () => {
    if (unsubscribe) {
        unsubscribe();
    }
});

function updateOrderCount() {
    const activeOrders = allOrders.filter(o => o.status !== 'completed');
    document.getElementById('order-count').textContent = activeOrders.length;
}

// ====================================
// DISPLAY ORDERS
// ====================================

function displayOrders() {
    const container = document.getElementById('orders-container');
    const emptyState = document.getElementById('empty-state');

    // Filter orders based on current filter
    let filteredOrders = allOrders;

    if (currentFilter === 'new') {
        filteredOrders = allOrders.filter(o => o.status === 'new');
    } else if (currentFilter === 'confirmed') {
        filteredOrders = allOrders.filter(o => o.status === 'confirmed');
    } else if (currentFilter === 'beachDrinks' || currentFilter === 'roomService') {
        filteredOrders = allOrders.filter(o => o.menuType === currentFilter);
    }

    // Show/hide empty state
    if (filteredOrders.length === 0) {
        container.innerHTML = '';
        emptyState.classList.remove('hidden');
        return;
    }

    emptyState.classList.add('hidden');

    // Sort by timestamp (newest first)
    filteredOrders.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Build HTML
    let html = '<div class="space-y-4">';

    filteredOrders.forEach(order => {
        html += createOrderCard(order);
    });

    html += '</div>';
    container.innerHTML = html;
}

function createOrderCard(order) {
    const orderTime = new Date(order.timestamp).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });

    const orderDate = new Date(order.timestamp).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
    });

    // Calculate total
    const total = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Status styling
    let statusBadge = '';
    let cardBorder = '';

    if (order.status === 'new') {
        statusBadge = '<span class="bg-yellow-100 text-yellow-800 text-xs font-semibold px-3 py-1 rounded-full">🔔 NEW</span>';
        cardBorder = 'border-l-4 border-yellow-400';
    } else if (order.status === 'confirmed') {
        statusBadge = '<span class="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">✓ CONFIRMED</span>';
        cardBorder = 'border-l-4 border-green-400';
    }

    // Menu type icon
    const menuIcon = order.menuType === 'beachDrinks' ? '🍹' : '🍽️';
    const menuLabel = order.menuType === 'beachDrinks' ? 'Beach Drinks' : 'Room Service';

    return `
        <div class="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-6 ${cardBorder}">
            <!-- Header Row -->
            <div class="flex justify-between items-start mb-4 pb-4 border-b border-gray-200">
                <div>
                    <div class="flex items-center space-x-3 mb-2">
                        <h3 class="text-2xl font-bold text-gray-800">${order.name}</h3>
                        ${statusBadge}
                    </div>
                    <div class="flex items-center space-x-4 text-sm text-gray-600">
                        <span class="font-semibold">${menuIcon} ${menuLabel}</span>
                        <span>📍 ${order.location}</span>
                        <span>🕐 ${orderTime}</span>
                        <span class="text-xs text-gray-400">${orderDate}</span>
                    </div>
                    <div class="mt-1 text-xs text-gray-500">Order ID: ${order.id}</div>
                </div>
                <div class="text-right">
                    <div class="text-2xl font-bold text-blue-600">$${total.toFixed(2)}</div>
                </div>
            </div>

            <!-- Items List -->
            <div class="mb-4">
                <h4 class="font-semibold text-gray-700 mb-3">Items:</h4>
                <div class="space-y-3">
                    ${order.items.map(item => createItemDisplay(item)).join('')}
                </div>
            </div>

            <!-- Order Notes -->
            ${order.orderNotes ? `
                <div class="mb-4 bg-blue-50 border-l-4 border-blue-400 p-3 rounded">
                    <p class="text-sm font-semibold text-gray-700 mb-1">📝 Order Notes:</p>
                    <p class="text-sm text-gray-800 italic">${order.orderNotes}</p>
                </div>
            ` : ''}

            <!-- Action Buttons -->
            <div class="flex space-x-3">
                ${order.status === 'new' ? `
                    <button onclick="confirmOrder('${order.id}')"
                            class="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg transition-all shadow-md hover:shadow-lg">
                        ✅ Confirm Received
                    </button>
                ` : ''}
                <button onclick="completeOrder('${order.id}')"
                        class="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-4 rounded-lg transition-all shadow-md hover:shadow-lg">
                    🗑️ Mark Completed
                </button>
                <button onclick="viewOrderDetails('${order.id}')"
                        class="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-all">
                    View
                </button>
            </div>
        </div>
    `;
}

function createItemDisplay(item) {
    let html = `
        <div class="bg-gray-50 rounded-lg p-3">
            <div class="flex justify-between items-start mb-2">
                <div>
                    <span class="font-semibold text-gray-800">${item.quantity}×</span>
                    <span class="font-semibold text-gray-800 ml-2">${item.itemName}</span>
                </div>
                <span class="text-gray-600 font-semibold">$${(item.price * item.quantity).toFixed(2)}</span>
            </div>
    `;

    // Display modifiers with color coding
    if (item.modifiers && item.modifiers.length > 0) {
        html += '<div class="flex flex-wrap gap-2 mb-2">';
        item.modifiers.forEach(modifier => {
            const isAddition = modifier.toLowerCase().includes('add') ||
                              modifier.toLowerCase().includes('extra');
            const isRemoval = modifier.toLowerCase().includes('no ') ||
                             modifier.toLowerCase().includes('without') ||
                             modifier.toLowerCase().includes('light');

            let modifierClass = 'bg-gray-200 text-gray-700';
            if (isAddition) {
                modifierClass = 'bg-green-100 text-green-800 modifier-add';
            } else if (isRemoval) {
                modifierClass = 'bg-red-100 text-red-800 modifier-remove';
            }

            html += `<span class="text-xs px-2 py-1 rounded ${modifierClass}">${modifier}</span>`;
        });
        html += '</div>';
    }

    // Display custom note
    if (item.customNote) {
        html += `
            <div class="bg-yellow-50 border-l-2 border-yellow-400 pl-2 py-1 text-sm text-gray-700 italic">
                💬 ${item.customNote}
            </div>
        `;
    }

    html += '</div>';
    return html;
}

// ====================================
// FILTER ORDERS
// ====================================

function filterOrders(filter) {
    currentFilter = filter;

    // Update button styles
    const buttons = ['all', 'new', 'confirmed', 'beachDrinks', 'roomService'];
    buttons.forEach(btn => {
        const element = document.getElementById(`filter-${btn}`);
        if (btn === filter) {
            element.classList.add('bg-blue-600', 'text-white');
            element.classList.remove('hover:bg-gray-100');
        } else {
            element.classList.remove('bg-blue-600', 'text-white');
            element.classList.add('hover:bg-gray-100');
        }
    });

    displayOrders();
}

// ====================================
// ORDER ACTIONS
// ====================================

async function confirmOrder(orderId) {
    try {
        // Update order status in Firestore
        const orderRef = doc(db, 'orders', orderId);
        await updateDoc(orderRef, {
            status: 'confirmed',
            confirmedAt: Timestamp.now()
        });

        console.log(`Order ${orderId} confirmed`);
    } catch (error) {
        console.error('Error confirming order:', error);
        alert('Error confirming order. Please try again.');
    }
}

async function completeOrder(orderId) {
    if (!confirm('Mark this order as completed? It will be removed from the dashboard.')) {
        return;
    }

    try {
        // Update order status in Firestore
        const orderRef = doc(db, 'orders', orderId);
        await updateDoc(orderRef, {
            status: 'completed',
            completedAt: Timestamp.now()
        });

        console.log(`Order ${orderId} completed`);
    } catch (error) {
        console.error('Error completing order:', error);
        alert('Error completing order. Please try again.');
    }
}

function viewOrderDetails(orderId) {
    const order = allOrders.find(o => o.id === orderId);
    if (!order) return;

    const orderTime = new Date(order.timestamp).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    const total = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const menuLabel = order.menuType === 'beachDrinks' ? 'Beach Drinks' : 'Room Service';

    let html = `
        <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4 text-sm">
                <div>
                    <p class="text-gray-600">Customer Name</p>
                    <p class="font-semibold">${order.name}</p>
                </div>
                <div>
                    <p class="text-gray-600">Location</p>
                    <p class="font-semibold">${order.location}</p>
                </div>
                <div>
                    <p class="text-gray-600">Service Type</p>
                    <p class="font-semibold">${menuLabel}</p>
                </div>
                <div>
                    <p class="text-gray-600">Order Time</p>
                    <p class="font-semibold">${orderTime}</p>
                </div>
                <div>
                    <p class="text-gray-600">Order ID</p>
                    <p class="font-semibold text-xs">${order.id}</p>
                </div>
                <div>
                    <p class="text-gray-600">Status</p>
                    <p class="font-semibold capitalize">${order.status}</p>
                </div>
            </div>

            <hr>

            <div>
                <h4 class="font-bold text-gray-800 mb-3">Items Ordered:</h4>
                <div class="space-y-3">
                    ${order.items.map(item => createItemDisplay(item)).join('')}
                </div>
            </div>

            ${order.orderNotes ? `
                <div class="bg-blue-50 border-l-4 border-blue-400 p-3 rounded">
                    <p class="font-semibold text-gray-700 mb-1">Order Notes:</p>
                    <p class="text-gray-800 italic">${order.orderNotes}</p>
                </div>
            ` : ''}

            <div class="bg-gray-100 p-4 rounded-lg">
                <div class="flex justify-between items-center">
                    <span class="font-bold text-lg">Total:</span>
                    <span class="font-bold text-2xl text-blue-600">$${total.toFixed(2)}</span>
                </div>
            </div>

            <div class="flex space-x-3">
                ${order.status === 'new' ? `
                    <button onclick="confirmOrder('${order.id}'); closeOrderModal();"
                            class="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg transition-all">
                        ✅ Confirm Received
                    </button>
                ` : ''}
                <button onclick="completeOrder('${order.id}'); closeOrderModal();"
                        class="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-4 rounded-lg transition-all">
                    🗑️ Mark Completed
                </button>
            </div>
        </div>
    `;

    document.getElementById('modal-order-content').innerHTML = html;
    document.getElementById('order-modal').classList.remove('hidden');
}

function closeOrderModal() {
    document.getElementById('order-modal').classList.add('hidden');
}

// ====================================
// UTILITY FUNCTIONS
// ====================================

async function clearAllOrders() {
    if (!confirm('Are you sure you want to clear ALL orders? This is for testing only.')) {
        return;
    }

    try {
        // Mark all active orders as completed
        const updates = allOrders.map(order => {
            const orderRef = doc(db, 'orders', order.id);
            return updateDoc(orderRef, {
                status: 'completed',
                completedAt: Timestamp.now()
            });
        });

        await Promise.all(updates);
        console.log('All orders cleared');
    } catch (error) {
        console.error('Error clearing orders:', error);
        alert('Error clearing orders. Please try again.');
    }
}

// ====================================
// EXPOSE FUNCTIONS TO GLOBAL SCOPE
// (Required for onclick handlers in HTML)
// ====================================
window.filterOrders = filterOrders;
window.confirmOrder = confirmOrder;
window.completeOrder = completeOrder;
window.viewOrderDetails = viewOrderDetails;
window.closeOrderModal = closeOrderModal;
window.clearAllOrders = clearAllOrders;
