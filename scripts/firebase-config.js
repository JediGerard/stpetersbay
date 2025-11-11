// Firebase Configuration for St. Peter's Bay Ordering System
// Version: 12.5.0

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAYv_LqT4tO8oAbhsiKjPJTdW6fUPGqzRA",
  authDomain: "st-peters-bay-food-ordering.firebaseapp.com",
  projectId: "st-peters-bay-food-ordering",
  storageBucket: "st-peters-bay-food-ordering.firebasestorage.app",
  messagingSenderId: "313320899615",
  appId: "1:313320899615:web:863545b190d18ae440812a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Initialize Authentication
const auth = getAuth(app);

// Export for use in other modules
export { app, db, auth };
