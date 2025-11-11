// ====================================
// ST. PETER'S BAY - AUTHENTICATION
// User authentication and management
// ====================================

import { auth, db } from './firebase-config.js';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";
import {
    doc,
    setDoc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

// ====================================
// USER STATE
// ====================================

let currentUser = null;

// Listen for auth state changes
onAuthStateChanged(auth, async (user) => {
    currentUser = user;

    if (user) {
        console.log('User logged in:', user.email);
        // Store user info for easy access
        localStorage.setItem('userId', user.uid);
        localStorage.setItem('userEmail', user.email);

        // Update UI if on main ordering page
        updateAuthUI(user);
    } else {
        console.log('User logged out');
        localStorage.removeItem('userId');
        localStorage.removeItem('userEmail');
        updateAuthUI(null);
    }
});

// ====================================
// SIGN UP
// ====================================

export async function signUp(email, password, displayName, roomNumber) {
    try {
        // Create user account
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Update display name
        await updateProfile(user, {
            displayName: displayName
        });

        // Create user document in Firestore
        await setDoc(doc(db, 'users', user.uid), {
            email: email,
            displayName: displayName,
            roomNumber: roomNumber,
            createdAt: new Date().toISOString()
        });

        console.log('User created successfully:', user.uid);
        return { success: true, user };
    } catch (error) {
        console.error('Sign up error:', error);
        return { success: false, error: getErrorMessage(error) };
    }
}

// ====================================
// SIGN IN
// ====================================

export async function signIn(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        console.log('User signed in successfully:', user.uid);
        return { success: true, user };
    } catch (error) {
        console.error('Sign in error:', error);
        return { success: false, error: getErrorMessage(error) };
    }
}

// ====================================
// SIGN OUT
// ====================================

export async function logOut() {
    try {
        await signOut(auth);
        console.log('User signed out successfully');
        return { success: true };
    } catch (error) {
        console.error('Sign out error:', error);
        return { success: false, error: error.message };
    }
}

// ====================================
// GET CURRENT USER
// ====================================

export function getCurrentUser() {
    return currentUser;
}

export function isLoggedIn() {
    return currentUser !== null;
}

// ====================================
// GET USER DATA
// ====================================

export async function getUserData(userId) {
    try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
            return { success: true, data: userDoc.data() };
        } else {
            return { success: false, error: 'User not found' };
        }
    } catch (error) {
        console.error('Error getting user data:', error);
        return { success: false, error: error.message };
    }
}

// ====================================
// UI UPDATES
// ====================================

function updateAuthUI(user) {
    // Update header on ordering page
    const authButton = document.getElementById('auth-button');

    if (!authButton) return; // Not on ordering page

    if (user) {
        authButton.innerHTML = `
            <div class="flex items-center gap-2 text-sm">
                <a href="order-history.html" class="bg-white text-blue-600 px-3 py-2 rounded-full font-semibold shadow hover:shadow-lg transition-all">
                    📋 My Orders
                </a>
                <span class="text-white hidden sm:inline">${user.displayName || user.email.split('@')[0]}</span>
                <button onclick="handleLogout()" class="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-full font-semibold shadow transition-all">
                    Logout
                </button>
            </div>
        `;
    } else {
        authButton.innerHTML = `
            <a href="login.html" class="bg-white text-blue-600 px-4 py-2 rounded-full font-semibold shadow hover:shadow-lg transition-all">
                Login / Sign Up
            </a>
        `;
    }
}

// ====================================
// ERROR MESSAGES
// ====================================

function getErrorMessage(error) {
    switch (error.code) {
        case 'auth/email-already-in-use':
            return 'This email is already registered. Please sign in instead.';
        case 'auth/weak-password':
            return 'Password should be at least 6 characters.';
        case 'auth/invalid-email':
            return 'Invalid email address.';
        case 'auth/user-not-found':
            return 'No account found with this email.';
        case 'auth/wrong-password':
            return 'Incorrect password.';
        case 'auth/too-many-requests':
            return 'Too many failed attempts. Please try again later.';
        default:
            return error.message || 'An error occurred. Please try again.';
    }
}

// ====================================
// EXPOSE TO WINDOW FOR HTML
// ====================================

window.handleLogout = async function() {
    const result = await logOut();
    if (result.success) {
        window.location.href = 'orderingsystem.html';
    }
};

// Export auth for use in other modules
export { auth };
