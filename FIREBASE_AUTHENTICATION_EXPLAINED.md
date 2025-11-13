# Firebase Authentication Methods - Detailed Explanation

**Project:** St. Peter's Bay Food Ordering System
**Date:** 2025-11-13

---

## Overview: Two Ways to Access Firebase

Your project uses **TWO different methods** to access Firebase, depending on where the code runs:

1. **Client SDK** - For browser/frontend code (orders, users, dashboard)
2. **Admin SDK** - For server/backend code (menu management)

---

## Method 1: Firebase Client SDK

### What It Is
- JavaScript library that runs **in the browser**
- Used by customers and staff accessing the website
- Controlled by Firestore security rules

### Configuration File
**File:** `scripts/firebase-config.js`

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyAYv_LqT4tO8oAbhsiKjPJTdW6fUPGqzRA",
  authDomain: "st-peters-bay-food-ordering.firebaseapp.com",
  projectId: "st-peters-bay-food-ordering",
  storageBucket: "st-peters-bay-food-ordering.firebasestorage.app",
  messagingSenderId: "313320899615",
  appId: "1:313320899615:web:863545b190d18ae440812a"
};
```

**Note:** These credentials are **PUBLIC and SAFE** to expose in browser code. They identify your Firebase project but don't grant access - security rules control access.

### What Uses It
1. **`ordering_logic.js`** - Creates orders in `/orders` collection
2. **`auth.js`** - User authentication (login, signup)
3. **`dashboard_logic.js`** - Staff view and update orders
4. **`order-history.js`** - Users view their past orders

### Security
- Access is controlled by **`firestore.rules`**
- Example: Anyone can create orders, only authenticated users can read them
- Rules are enforced by Firebase servers, not your code

### How It Works
```javascript
// Example: Creating an order (from ordering_logic.js)
import { db } from './firebase-config.js';
import { collection, addDoc } from "firebase/firestore";

await addDoc(collection(db, 'orders'), {
  items: cart,
  name: guestName,
  status: 'new',
  timestamp: serverTimestamp()
});
// ✅ This works because firestore.rules allows: allow create: if true
```

---

## Method 2: Firebase Admin SDK

### What It Is
- Node.js library that runs **on the server**
- Has **full admin access** - bypasses all security rules
- Uses a private service account key (must be kept secret)

### Configuration File
**File:** `firebase-admin-key.json` (gitignored)

```json
{
  "type": "service_account",
  "project_id": "st-peters-bay-food-ordering",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...",
  "client_email": "firebase-adminsdk-xxxxx@st-peters-bay-food-ordering.iam.gserviceaccount.com",
  // ... etc
}
```

**CRITICAL:** This file contains a **private key** and must **NEVER** be committed to git or exposed publicly. It grants full admin access to your Firebase project.

### What Uses It
1. **`googleSheetsSync.js`** - Writes menu to Firestore `/menus/staging`
2. **`publishMenu.js`** - Copies menu from staging to production
3. **`migrateMenuToFirestore.js`** - Initial menu migration
4. **`server.js`** - Local admin server endpoints
5. **`api/*.js`** - Vercel serverless functions (admin panel)

### Security
- **No security rules apply** - Admin SDK has full access
- Must be used only in **trusted server environments**
- Never expose the service account key in client code
- Only admin users can trigger these operations (via Google OAuth)

### How It Works
```javascript
// Example: Writing menu (from googleSheetsSync.js)
const admin = require('firebase-admin');
const firebaseServiceAccount = require('../firebase-admin-key.json');

admin.initializeApp({
  credential: admin.credential.cert(firebaseServiceAccount),
  projectId: 'st-peters-bay-food-ordering'
});

const db = admin.firestore();

await db.collection('menus').doc('staging').set({
  beachDrinks: menuData.beachDrinks,
  roomService: menuData.roomService
});
// ✅ This works because Admin SDK bypasses all rules
```

---

## Why You Didn't Need Admin Key Before

### The Timeline

**Phase 1-3 (Before Menu Management):**
- ✅ Ordering system worked perfectly
- ✅ Users could create orders
- ✅ Staff could view/update orders via dashboard
- ✅ Authentication worked
- **Used:** Client SDK only
- **Why it worked:** Firestore rules allowed these operations

**Phase 4 (Menu Management Added):**
- ❌ Needed server-side menu updates
- ❌ Client SDK can't be used in Node.js scripts
- ❌ Can't run Google Sheets sync in browser
- **Solution:** Added Admin SDK with service account key

### Why Server-Side Access?

You can't use Client SDK for menu management because:

1. **Google Sheets API** requires server-side authentication
2. **Cron jobs** (auto-sync every 5 min) need to run on server
3. **Security** - Menu changes should require admin authentication
4. **Firestore rules** would need to allow anyone to write menus (bad!)

---

## The Third Key: Google Sheets Service Account

### File: `service-account-key.json`

**Different purpose** from Firebase Admin key:

| Aspect | Firebase Admin Key | Google Sheets Key |
|--------|-------------------|-------------------|
| **Purpose** | Access Firestore database | Read Google Sheets |
| **Project** | st-peters-bay-food-ordering | st-peters-bay-menu-system |
| **Used by** | Menu sync, publish, API | Google Sheets API calls |
| **SDK** | Firebase Admin SDK | Google Sheets API |

### Why Two Service Accounts?

You have **two separate Google Cloud projects**:

1. **st-peters-bay-food-ordering** (Firebase project)
   - Has: Firestore, Authentication
   - Key: `firebase-admin-key.json`
   - For: Menu storage, orders, users

2. **st-peters-bay-menu-system** (Google Sheets project)
   - Has: Google Sheets API enabled
   - Key: `service-account-key.json`
   - For: Reading the master menu spreadsheet

---

## Current Setup Summary

### Files in Your Project

```
firebase-admin-key.json        # Firebase Admin access (gitignored)
service-account-key.json       # Google Sheets API access (gitignored)
scripts/firebase-config.js     # Public Firebase client config (committed to git)
.gitignore                     # Both keys are listed here
```

### Data Flow

```
Google Sheets (master menu)
    ↓ [service-account-key.json]
googleSheetsSync.js reads sheet
    ↓ [firebase-admin-key.json]
Writes to Firestore /menus/staging
    ↓
Admin reviews in admin panel
    ↓ [firebase-admin-key.json]
publishMenu.js copies to /menus/production
    ↓
Ordering system reads from /menus/production
    ↓ [Public client SDK]
Customers see updated menu
```

### Collections in Firestore

**Firebase Project:** `st-peters-bay-food-ordering`

```
/orders          # Customer orders (Client SDK writes, rules enforce)
/users           # User profiles (Client SDK via Auth)
/menus           # Menu data (Admin SDK only)
  /production    # Live menu (80 items: 55 beach + 25 room service)
  /staging       # Preview menu (from Google Sheets)
```

---

## Security Best Practices

### ✅ DO:
- Keep both service account keys in `.gitignore`
- Only use Admin SDK in server environments
- Use environment variables for production deployments
- Rotate service account keys periodically
- Monitor Firebase logs for suspicious activity

### ❌ DON'T:
- Commit service account keys to git
- Use Admin SDK in client/browser code
- Share service account keys via email/Slack
- Hardcode keys in deployed frontend code
- Give service accounts more permissions than needed

---

## For Vercel Deployment

When deploying to Vercel, you need to provide the **Firebase Admin key** as an environment variable:

### Option 1: As JSON String
```
Variable: FIREBASE_ADMIN_KEY
Value: {entire contents of firebase-admin-key.json as one line}
```

### Option 2: Individual Fields
```
Variable: FIREBASE_PROJECT_ID
Value: st-peters-bay-food-ordering

Variable: FIREBASE_PRIVATE_KEY
Value: -----BEGIN PRIVATE KEY-----\n...

Variable: FIREBASE_CLIENT_EMAIL
Value: firebase-adminsdk-xxxxx@st-peters-bay-food-ordering.iam.gserviceaccount.com
```

The Google Sheets key (`service-account-key.json`) is also needed for auto-sync to work on Vercel.

---

## Troubleshooting

### "Permission Denied" Errors

**Client SDK:**
- Check `firestore.rules` - does the rule allow this operation?
- Is user authenticated (if rule requires auth)?

**Admin SDK:**
- Is service account key file present?
- Is the key for the correct Firebase project?
- Is Firebase Admin SDK initialized correctly?

### "Project Not Found" Errors

- Check `projectId` matches your Firebase project
- For Admin SDK: `'st-peters-bay-food-ordering'`
- For Client SDK: Already set in `firebaseConfig`

### "Invalid Credentials" Errors

- Service account key file corrupted or invalid
- Wrong key file being used
- Key has been revoked in Firebase Console

---

## Reference Links

- **Firebase Console (your project):**
  https://console.firebase.google.com/project/st-peters-bay-food-ordering

- **Generate new Firebase Admin key:**
  https://console.firebase.google.com/project/st-peters-bay-food-ordering/settings/serviceaccounts/adminsdk

- **Firebase Client SDK docs:**
  https://firebase.google.com/docs/web/setup

- **Firebase Admin SDK docs:**
  https://firebase.google.com/docs/admin/setup

- **Firestore Security Rules:**
  https://firebase.google.com/docs/firestore/security/get-started

---

## Quick Reference

### When to Use Client SDK
- Running in browser
- User-facing operations
- Need Firestore rules to enforce security
- Examples: Creating orders, user login, dashboard

### When to Use Admin SDK
- Running on server (Node.js)
- Backend automation
- Need to bypass security rules
- Examples: Menu sync, admin operations, scheduled tasks

---

**Last Updated:** 2025-11-13
**Status:** Both methods configured and working correctly
