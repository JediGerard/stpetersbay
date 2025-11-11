// ====================================
// ST. PETER'S BAY - PAST ORDERS LOGIC
// Kitchen/Bar Staff Past Orders View
// ====================================

// Import Firebase
import { db } from './firebase-config.js';
import {
    collection,
    query,
    where,
    orderBy,
    getDocs,
    Timestamp
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

let allOrders = [];
let currentFilter = 'today';

// ====================================
// INITIALIZATION
// ====================================

window.addEventListener('DOMContentLoaded', () => {
    // Load today's orders by default
    filterByDate('today');
});

// ====================================
// FILTER BY DATE
// ====================================

async function filterByDate(filter) {
    currentFilter = filter;

    // Update button styles
    const todayBtn = document.getElementById('filter-today');
    const last7DaysBtn = document.getElementById('filter-last7days');

    if (filter === 'today') {
        todayBtn.classList.add('bg-blue-600');
        todayBtn.classList.remove('bg-slate-600', 'hover:bg-slate-700');
        last7DaysBtn.classList.remove('bg-blue-600');
        last7DaysBtn.classList.add('bg-slate-600', 'hover:bg-slate-700');
    } else {
        last7DaysBtn.classList.add('bg-blue-600');
        last7DaysBtn.classList.remove('bg-slate-600', 'hover:bg-slate-700');
        todayBtn.classList.remove('bg-blue-600');
        todayBtn.classList.add('bg-slate-600', 'hover:bg-slate-700');
    }

    // Calculate date range
    const now = new Date();
    let startDate;

    if (filter === 'today') {
        // Start of today
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    } else {
        // 7 days ago
        startDate = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
    }

    await loadOrders(startDate);
}

// ====================================
// LOAD ORDERS FROM FIRESTORE
// ====================================

async function loadOrders(startDate) {
    try {
        // Show loading state
        document.getElementById('loading').classList.remove('hidden');
        document.getElementById('empty-state').classList.add('hidden');
        document.getElementById('orders-container').classList.add('hidden');
        document.getElementById('stats-summary').classList.add('hidden');

        const ordersRef = collection(db, 'orders');
        const q = query(
            ordersRef,
            where('status', '==', 'completed'),
            where('completedAt', '>=', Timestamp.fromDate(startDate)),
            orderBy('completedAt', 'desc')
        );

        const querySnapshot = await getDocs(q);

        // Hide loading
        document.getElementById('loading').classList.add('hidden');

        allOrders = [];
        querySnapshot.forEach((doc) => {
            const orderData = doc.data();
            // Convert Firestore Timestamp to JavaScript Date
            if (orderData.timestamp) {
                orderData.timestamp = orderData.timestamp.toDate();
            }
            if (orderData.completedAt) {
                orderData.completedAt = orderData.completedAt.toDate();
            }
            allOrders.push({
                id: doc.id,
                ...orderData
            });
        });

        if (allOrders.length === 0) {
            document.getElementById('empty-state').classList.remove('hidden');
            return;
        }

        // Update statistics
        updateStats();

        // Display orders
        displayOrders();

    } catch (error) {
        console.error('Error loading orders:', error);
        document.getElementById('loading').innerHTML = `
            <div class="text-center text-red-600">
                <p class="font-semibold">Error loading orders</p>
                <p class="text-sm mt-2">${error.message}</p>
            </div>
        `;
    }
}

// ====================================
// UPDATE STATISTICS
// ====================================

function updateStats() {
    const totalOrders = allOrders.length;
    const beachOrders = allOrders.filter(o => o.menuType === 'beachDrinks').length;
    const roomOrders = allOrders.filter(o => o.menuType === 'roomService').length;

    const totalRevenue = allOrders.reduce((sum, order) => {
        const orderTotal = order.items.reduce((itemSum, item) =>
            itemSum + (item.price * item.quantity), 0);
        return sum + orderTotal;
    }, 0);

    document.getElementById('stat-total').textContent = totalOrders;
    document.getElementById('stat-beach').textContent = beachOrders;
    document.getElementById('stat-room').textContent = roomOrders;
    document.getElementById('stat-revenue').textContent = `$${totalRevenue.toFixed(2)}`;

    document.getElementById('stats-summary').classList.remove('hidden');
}

// ====================================
// DISPLAY ORDERS
// ====================================

function displayOrders() {
    const container = document.getElementById('orders-container');
    container.classList.remove('hidden');

    let html = '';
    allOrders.forEach(order => {
        html += createOrderCard(order);
    });

    container.innerHTML = html;
}

function createOrderCard(order) {
    const orderTime = order.timestamp.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });

    const orderDate = order.timestamp.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });

    const completedTime = order.completedAt ? order.completedAt.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    }) : 'N/A';

    // Calculate total
    const total = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Menu type icon
    const menuIcon = order.menuType === 'beachDrinks' ? '🍹' : '🍽️';
    const menuLabel = order.menuType === 'beachDrinks' ? 'Beach Drinks' : 'Room Service';

    return `
        <div class="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-6 border-l-4 border-gray-400">
            <!-- Header Row -->
            <div class="flex flex-wrap justify-between items-start gap-4 mb-4 pb-4 border-b border-gray-200">
                <div class="flex-1 min-w-[200px]">
                    <div class="flex items-center space-x-3 mb-2">
                        <h3 class="text-xl font-bold text-gray-800">${order.name}</h3>
                        <span class="bg-gray-100 text-gray-800 text-xs font-semibold px-3 py-1 rounded-full">✓ COMPLETED</span>
                    </div>
                    <div class="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600">
                        <span class="font-semibold">${menuIcon} ${menuLabel}</span>
                        <span>📍 ${order.location}</span>
                        <span>🕐 Ordered: ${orderTime}</span>
                        <span>✅ Completed: ${completedTime}</span>
                    </div>
                    <div class="mt-1 text-xs text-gray-500">${orderDate}</div>
                </div>
                <div class="text-right">
                    <div class="text-2xl font-bold text-gray-600">$${total.toFixed(2)}</div>
                </div>
            </div>

            <!-- Items Summary -->
            <div class="mb-4">
                <div class="flex flex-wrap gap-2">
                    ${order.items.map(item => `
                        <span class="bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full">
                            ${item.quantity}× ${item.itemName}
                        </span>
                    `).join('')}
                </div>
            </div>

            <!-- View Details Button -->
            <button onclick="viewOrderDetails('${order.id}')"
                    class="w-full sm:w-auto bg-slate-600 hover:bg-slate-700 text-white font-semibold py-2 px-6 rounded-lg transition-all">
                View Full Details
            </button>
        </div>
    `;
}

// ====================================
// VIEW ORDER DETAILS
// ====================================

function viewOrderDetails(orderId) {
    const order = allOrders.find(o => o.id === orderId);
    if (!order) return;

    const orderTime = order.timestamp.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    const completedTime = order.completedAt ? order.completedAt.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }) : 'N/A';

    const total = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const menuLabel = order.menuType === 'beachDrinks' ? 'Beach Drinks' : 'Room Service';

    let html = `
        <div class="space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
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
                    <p class="text-gray-600">Completed Time</p>
                    <p class="font-semibold">${completedTime}</p>
                </div>
                <div>
                    <p class="text-gray-600">Status</p>
                    <p class="font-semibold text-green-600">Completed</p>
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
                    <span class="font-bold text-2xl text-gray-600">$${total.toFixed(2)}</span>
                </div>
            </div>
        </div>
    `;

    document.getElementById('modal-order-content').innerHTML = html;
    document.getElementById('order-modal').classList.remove('hidden');
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

    // Display modifiers
    if (item.modifiers && item.modifiers.length > 0) {
        html += '<div class="flex flex-wrap gap-2 mb-2">';
        item.modifiers.forEach(modifier => {
            html += `<span class="text-xs px-2 py-1 rounded bg-gray-200 text-gray-700">${modifier}</span>`;
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

function closeOrderModal() {
    document.getElementById('order-modal').classList.add('hidden');
}

// ====================================
// EXPOSE FUNCTIONS TO GLOBAL SCOPE
// ====================================
window.filterByDate = filterByDate;
window.viewOrderDetails = viewOrderDetails;
window.closeOrderModal = closeOrderModal;
