// ====================================
// ST. PETER'S BAY - PREVIEW LOGIC
// Preview page for staging menu verification
// ====================================

// Import Firebase
import { db } from './firebase-config.js';
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";
import { getCurrentUser, getUserData } from './auth.js';

// Global state
let menuData = {};
let currentMenuType = '';
let cart = [];
let currentItem = null;
let currentQuantity = 1;

// ====================================
// INITIALIZATION
// ====================================

// Load menu data when page loads
window.addEventListener('DOMContentLoaded', async () => {
    try {
        // PREVIEW MODE: Fetch from preview endpoint (Firestore source of truth)
        const response = await fetch('/api/menu/preview');

        if (!response.ok) {
            throw new Error(`Preview API returned ${response.status}: ${response.statusText}`);
        }

        menuData = await response.json();
        console.log('Preview menu loaded from Firestore:', menuData);

        // Validate menu data
        if (!menuData.beachDrinks && !menuData.roomService) {
            throw new Error('Preview menu data is empty');
        }

        // Update item count in banner
        updateItemCount();
    } catch (error) {
        console.error('Error loading preview menu:', error);
        document.getElementById('item-count-display').textContent = 'Error loading menu';

        // Show user-friendly error message
        document.body.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; padding: 20px; text-align: center; background: linear-gradient(to bottom right, #fef3c7, #fde68a);">
                <div style="background: white; padding: 40px; border-radius: 16px; box-shadow: 0 10px 40px rgba(0,0,0,0.1); max-width: 500px;">
                    <svg style="width: 80px; height: 80px; margin: 0 auto 20px; color: #f59e0b;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                    </svg>
                    <h2 style="font-size: 24px; font-weight: bold; color: #1f2937; margin-bottom: 12px;">Preview Menu Unavailable</h2>
                    <p style="color: #6b7280; margin-bottom: 24px;">Unable to load the preview menu from Firestore. This may mean the staging menu hasn't been synced yet.</p>
                    <button onclick="location.reload()" style="background: linear-gradient(to right, #f59e0b, #d97706); color: white; font-weight: 600; padding: 12px 32px; border-radius: 8px; border: none; cursor: pointer; font-size: 16px; box-shadow: 0 4px 12px rgba(245,158,11,0.3);">
                        Try Again
                    </button>
                    <a href="admin.html" style="display: inline-block; margin-top: 16px; color: #6b7280; text-decoration: none; font-size: 14px;">← Back to Admin Panel</a>
                </div>
            </div>
        `;
        return; // Stop execution
    }

    // Update character count in modal
    const noteField = document.getElementById('modal-custom-note');
    if (noteField) {
        noteField.addEventListener('input', (e) => {
            document.getElementById('note-count').textContent = e.target.value.length;
        });
    }

    // Check for reorder data
    checkForReorder();
});

// ====================================
// ITEM COUNT UPDATE (Preview Feature)
// ====================================

function updateItemCount() {
    let totalItems = 0;

    // Count items in both menu types
    if (menuData.beachDrinks && Array.isArray(menuData.beachDrinks)) {
        totalItems += menuData.beachDrinks.length;
    }
    if (menuData.roomService && Array.isArray(menuData.roomService)) {
        totalItems += menuData.roomService.length;
    }

    const displayElement = document.getElementById('item-count-display');
    if (displayElement) {
        displayElement.textContent = `Total Items: ${totalItems}`;
    }
}

// ====================================
// MENU SELECTION
// ====================================

function selectMenuType(type) {
    currentMenuType = type;

    // Update header
    const subtitle = document.getElementById('header-subtitle');
    subtitle.textContent = type === 'beachDrinks' ? 'Beach Drinks' : 'Room Service';

    // Show/hide screens
    document.getElementById('landing-screen').classList.add('hidden');
    document.getElementById('menu-screen').classList.remove('hidden');

    // Show cart button
    document.getElementById('cart-button').classList.remove('hidden');

    // Load and display menu items
    displayMenu(type);
}

function backToLanding() {
    // Clear cart and reset
    if (cart.length > 0) {
        if (!confirm('This will clear your cart. Are you sure?')) {
            return;
        }
        cart = [];
        updateCartCount();
    }

    currentMenuType = '';
    document.getElementById('menu-screen').classList.add('hidden');
    document.getElementById('landing-screen').classList.remove('hidden');
    document.getElementById('cart-button').classList.add('hidden');
}

// ====================================
// MENU DISPLAY
// ====================================

function displayMenu(type) {
    const container = document.getElementById('menu-container');
    const items = menuData[type] || [];

    if (items.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-500">No items available</p>';
        return;
    }

    // Group items by category
    const categorized = {};
    items.forEach(item => {
        if (!categorized[item.category]) {
            categorized[item.category] = [];
        }
        categorized[item.category].push(item);
    });

    // Build HTML
    let html = '';
    for (const [category, categoryItems] of Object.entries(categorized)) {
        html += `
            <div class="mb-8">
                <h3 class="text-2xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-blue-200">${category}</h3>
                <div class="grid md:grid-cols-2 gap-4">
        `;

        categoryItems.forEach(item => {
            if (item.available) {
                html += createMenuItem(item);
            }
        });

        html += `
                </div>
            </div>
        `;
    }

    container.innerHTML = html;
}

function createMenuItem(item) {
    return `
        <div class="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-4 cursor-pointer border-2 border-transparent hover:border-blue-300"
             onclick='openItemModal(${JSON.stringify(item)})'>
            <div class="flex justify-between items-start">
                <div class="flex-1">
                    <h4 class="font-bold text-gray-800 text-lg mb-1">${item.name}</h4>
                    <p class="text-blue-600 font-semibold text-lg">$${item.price.toFixed(2)}</p>
                </div>
                <button class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-all">
                    Add +
                </button>
            </div>
        </div>
    `;
}

// ====================================
// ITEM MODAL (Customization)
// ====================================

function openItemModal(item) {
    currentItem = item;
    currentQuantity = 1;

    // Set item details
    document.getElementById('modal-item-name').textContent = item.name;
    document.getElementById('modal-item-price').textContent = `$${item.price.toFixed(2)}`;
    document.getElementById('modal-quantity').textContent = '1';

    // Clear and populate modifiers
    const modifiersList = document.getElementById('modifiers-list');
    modifiersList.innerHTML = '';

    if (item.modifiers && item.modifiers.length > 0) {
        item.modifiers.forEach((modifier, index) => {
            const checkboxId = `modifier-${index}`;
            modifiersList.innerHTML += `
                <label class="flex items-center space-x-3 cursor-pointer bg-gray-50 hover:bg-gray-100 p-3 rounded-lg transition-all">
                    <input type="checkbox" id="${checkboxId}" value="${modifier}"
                           class="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500">
                    <span class="text-gray-700">${modifier}</span>
                </label>
            `;
        });
        document.getElementById('modifiers-section').classList.remove('hidden');
    } else {
        document.getElementById('modifiers-section').classList.add('hidden');
    }

    // Clear custom note
    document.getElementById('modal-custom-note').value = '';
    document.getElementById('note-count').textContent = '0';

    // Show modal
    document.getElementById('item-modal').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('item-modal').classList.add('hidden');
    currentItem = null;
    currentQuantity = 1;
}

function increaseQuantity() {
    currentQuantity++;
    document.getElementById('modal-quantity').textContent = currentQuantity;
}

function decreaseQuantity() {
    if (currentQuantity > 1) {
        currentQuantity--;
        document.getElementById('modal-quantity').textContent = currentQuantity;
    }
}

// ====================================
// CART MANAGEMENT
// ====================================

function addToCart() {
    if (!currentItem) return;

    // Get selected modifiers
    const selectedModifiers = [];
    const checkboxes = document.querySelectorAll('#modifiers-list input[type="checkbox"]:checked');
    checkboxes.forEach(cb => selectedModifiers.push(cb.value));

    // Get custom note
    const customNote = document.getElementById('modal-custom-note').value.trim();

    // Create cart item
    const cartItem = {
        itemName: currentItem.name,
        price: currentItem.price,
        quantity: currentQuantity,
        modifiers: selectedModifiers,
        customNote: customNote,
        category: currentItem.category
    };

    cart.push(cartItem);
    updateCartCount();
    closeModal();

    // Show feedback
    console.log('Added to cart:', cartItem);
}

function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cart-count').textContent = totalItems;
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartCount();
    displayCart();
}

// ====================================
// CART/CHECKOUT SCREEN
// ====================================

document.getElementById('cart-button').addEventListener('click', async () => {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }

    // Get current user
    const currentUser = getCurrentUser();
    const guestNameField = document.getElementById('guest-name');
    const deliveryChoiceField = document.getElementById('delivery-choice-field');
    const roomField = document.getElementById('room-field');
    const locationField = document.getElementById('location-field');

    // Pre-fill name if logged in
    if (currentUser) {
        guestNameField.value = currentUser.displayName || '';
    } else {
        guestNameField.value = '';
    }

    // Show appropriate fields based on menu type and login status
    if (currentMenuType === 'beachDrinks') {
        // Beach drinks: always show location field
        locationField.classList.remove('hidden');
        roomField.classList.add('hidden');
        deliveryChoiceField.classList.add('hidden');
    } else {
        // Room service
        if (currentUser) {
            // Logged in: show delivery choice
            try {
                const userData = await getUserData(currentUser.uid);
                if (userData.success && userData.data.roomNumber) {
                    const userRoom = userData.data.roomNumber;

                    // Show delivery choice
                    deliveryChoiceField.classList.remove('hidden');

                    // Update the label to show their room number
                    document.getElementById('room-delivery-label').textContent = `Deliver to my room (Room ${userRoom})`;

                    // Set up radio button listeners
                    setupDeliveryChoiceListeners(userRoom);

                    // Default: deliver to room (pre-filled)
                    document.getElementById('deliver-to-room').checked = true;
                    roomField.classList.remove('hidden');
                    locationField.classList.add('hidden');
                    document.getElementById('room-number').value = userRoom;
                    document.getElementById('room-number').readOnly = true;
                } else {
                    // User doesn't have room number, show room field normally
                    deliveryChoiceField.classList.add('hidden');
                    roomField.classList.remove('hidden');
                    locationField.classList.add('hidden');
                    document.getElementById('room-number').readOnly = false;
                }
            } catch (error) {
                console.error('Error getting user data:', error);
                // Fallback: show room field
                deliveryChoiceField.classList.add('hidden');
                roomField.classList.remove('hidden');
                locationField.classList.add('hidden');
            }
        } else {
            // Not logged in: show room field
            deliveryChoiceField.classList.add('hidden');
            roomField.classList.remove('hidden');
            locationField.classList.add('hidden');
            document.getElementById('room-number').readOnly = false;
        }
    }

    // Switch screens
    document.getElementById('menu-screen').classList.add('hidden');
    document.getElementById('cart-screen').classList.remove('hidden');

    displayCart();
});

function backToMenu() {
    document.getElementById('cart-screen').classList.add('hidden');
    document.getElementById('menu-screen').classList.remove('hidden');
}

function setupDeliveryChoiceListeners(userRoom) {
    const deliverToRoom = document.getElementById('deliver-to-room');
    const deliverToBeach = document.getElementById('deliver-to-beach');
    const roomField = document.getElementById('room-field');
    const locationField = document.getElementById('location-field');
    const roomNumberInput = document.getElementById('room-number');

    // Remove old listeners by cloning and replacing
    const newDeliverToRoom = deliverToRoom.cloneNode(true);
    const newDeliverToBeach = deliverToBeach.cloneNode(true);
    deliverToRoom.parentNode.replaceChild(newDeliverToRoom, deliverToRoom);
    deliverToBeach.parentNode.replaceChild(newDeliverToBeach, deliverToBeach);

    // Add new listeners
    newDeliverToRoom.addEventListener('change', () => {
        if (newDeliverToRoom.checked) {
            roomField.classList.remove('hidden');
            locationField.classList.add('hidden');
            roomNumberInput.value = userRoom;
            roomNumberInput.readOnly = true;
        }
    });

    newDeliverToBeach.addEventListener('change', () => {
        if (newDeliverToBeach.checked) {
            roomField.classList.add('hidden');
            locationField.classList.remove('hidden');
            document.getElementById('beach-location').value = '';
        }
    });
}

function displayCart() {
    const container = document.getElementById('cart-items');

    if (cart.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-500 py-8">Your cart is empty</p>';
        return;
    }

    let html = '';
    let total = 0;

    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;

        html += `
            <div class="bg-white rounded-xl shadow-md p-4 mb-4">
                <div class="flex justify-between items-start mb-2">
                    <div class="flex-1">
                        <h4 class="font-bold text-gray-800 text-lg">${item.itemName}</h4>
                        <p class="text-gray-600">Quantity: ${item.quantity} × $${item.price.toFixed(2)} = $${itemTotal.toFixed(2)}</p>
                    </div>
                    <button onclick="removeFromCart(${index})"
                            class="text-red-500 hover:text-red-700 font-bold text-xl ml-2">×</button>
                </div>
                ${item.modifiers.length > 0 ? `
                    <div class="mb-2">
                        <p class="text-sm font-semibold text-gray-700 mb-1">Modifiers:</p>
                        <div class="flex flex-wrap gap-2">
                            ${item.modifiers.map(m => `<span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">${m}</span>`).join('')}
                        </div>
                    </div>
                ` : ''}
                ${item.customNote ? `
                    <div class="bg-gray-50 p-2 rounded text-sm text-gray-700 italic">
                        <strong>Note:</strong> ${item.customNote}
                    </div>
                ` : ''}
            </div>
        `;
    });

    html += `
        <div class="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
            <div class="flex justify-between items-center text-xl font-bold">
                <span>Total:</span>
                <span class="text-blue-600">$${total.toFixed(2)}</span>
            </div>
        </div>
    `;

    container.innerHTML = html;
}

// ====================================
// ORDER SUBMISSION
// ====================================

async function submitOrder() {
    // Validate form
    const guestName = document.getElementById('guest-name').value.trim();

    if (!guestName) {
        alert('Please enter your name');
        return;
    }

    let location = '';
    let deliveryType = ''; // 'beach' or 'room'

    if (currentMenuType === 'beachDrinks') {
        location = document.getElementById('beach-location').value;
        if (!location) {
            alert('Please select your beach location');
            return;
        }
        deliveryType = 'beach';
    } else {
        // Room service - check if delivery choice is shown
        const deliveryChoiceField = document.getElementById('delivery-choice-field');
        if (!deliveryChoiceField.classList.contains('hidden')) {
            // Logged-in user with delivery choice
            const deliverToRoom = document.getElementById('deliver-to-room');
            const deliverToBeach = document.getElementById('deliver-to-beach');

            if (deliverToRoom.checked) {
                location = document.getElementById('room-number').value.trim();
                if (!location) {
                    alert('Please enter your room number');
                    return;
                }
                deliveryType = 'room';
            } else if (deliverToBeach.checked) {
                location = document.getElementById('beach-location').value;
                if (!location) {
                    alert('Please select your beach location');
                    return;
                }
                deliveryType = 'beach';
            }
        } else {
            // Guest or logged-in user without room number
            location = document.getElementById('room-number').value.trim();
            if (!location) {
                alert('Please enter your room number');
                return;
            }
            deliveryType = 'room';
        }
    }

    const orderNotes = document.getElementById('order-notes').value.trim();

    // Get current user if logged in
    const currentUser = getCurrentUser();

    // Create order object
    const order = {
        id: 'ORD-' + Date.now(),
        menuType: currentMenuType,
        name: guestName,
        location: location,
        deliveryType: deliveryType, // 'beach' or 'room'
        items: cart,
        orderNotes: orderNotes,
        status: 'new',
        timestamp: new Date().toISOString(),
        // Link to user if logged in
        userId: currentUser ? currentUser.uid : null,
        userEmail: currentUser ? currentUser.email : null
    };

    try {
        // Save to Firestore
        const orderId = await saveOrder(order);
        order.id = orderId; // Update with Firestore-generated ID

        // Show confirmation
        showConfirmation(order);

        console.log('Order submitted:', order);
    } catch (error) {
        // Error already handled in saveOrder
        console.error('Failed to submit order:', error);
    }
}

async function saveOrder(order) {
    try {
        // Save order to Firestore
        const ordersCollection = collection(db, 'orders');

        // Remove the locally-generated id since Firestore will create one
        const { id, ...orderData } = order;

        // Add server timestamp
        orderData.timestamp = serverTimestamp();

        const docRef = await addDoc(ordersCollection, orderData);
        console.log('Order saved to Firestore with ID:', docRef.id);
        return docRef.id;
    } catch (error) {
        console.error('Error saving order to Firestore:', error);
        alert('Error submitting order. Please try again.');
        throw error;
    }
}

function showConfirmation(order) {
    // Calculate total
    const total = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Determine location label
    let locationLabel = 'Location';
    if (order.menuType === 'roomService') {
        locationLabel = order.deliveryType === 'beach' ? 'Beach Location' : 'Room Number';
    } else {
        locationLabel = 'Beach Location';
    }

    // Build summary
    let summaryHtml = `
        <div class="space-y-2">
            <p><strong>Order #:</strong> ${order.id}</p>
            <p><strong>Name:</strong> ${order.name}</p>
            <p><strong>${locationLabel}:</strong> ${order.location}</p>
            <p><strong>Items:</strong></p>
            <ul class="ml-4 space-y-1">
    `;

    order.items.forEach(item => {
        summaryHtml += `<li>${item.quantity}× ${item.itemName}`;
        if (item.modifiers.length > 0) {
            summaryHtml += ` <span class="text-sm text-gray-600">(${item.modifiers.join(', ')})</span>`;
        }
        summaryHtml += `</li>`;
    });

    summaryHtml += `
            </ul>
            <p class="text-xl font-bold text-blue-600 pt-2">Total: $${total.toFixed(2)}</p>
        </div>
    `;

    document.getElementById('order-summary').innerHTML = summaryHtml;

    // Switch to confirmation screen
    document.getElementById('cart-screen').classList.add('hidden');
    document.getElementById('confirmation-screen').classList.remove('hidden');
}

// ====================================
// REORDER FUNCTIONALITY
// ====================================

function checkForReorder() {
    const reorderData = sessionStorage.getItem('reorderData');
    if (reorderData) {
        try {
            const data = JSON.parse(reorderData);

            // Clear the session storage
            sessionStorage.removeItem('reorderData');

            // Restore the cart
            cart = data.items;
            currentMenuType = data.menuType;

            // Update UI
            updateCartCount();

            // Auto-navigate to the menu
            selectMenuType(data.menuType);

            // Show a message
            setTimeout(() => {
                const notification = document.createElement('div');
                notification.className = 'fixed top-20 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-bounce';
                notification.textContent = '✓ Items added to cart! Review and place your order.';
                document.body.appendChild(notification);

                setTimeout(() => {
                    notification.remove();
                }, 3000);
            }, 500);

        } catch (error) {
            console.error('Error processing reorder:', error);
            sessionStorage.removeItem('reorderData');
        }
    }
}

// ====================================
// EXPOSE FUNCTIONS TO GLOBAL SCOPE
// (Required for onclick handlers in HTML)
// ====================================
window.selectMenuType = selectMenuType;
window.backToLanding = backToLanding;
window.openItemModal = openItemModal;
window.closeModal = closeModal;
window.increaseQuantity = increaseQuantity;
window.decreaseQuantity = decreaseQuantity;
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.backToMenu = backToMenu;
window.submitOrder = submitOrder;
