# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

St. Peter's Bay Food Ordering System - A complete cloud-based food ordering system for resort guests and staff. The system allows guests to order Beach Drinks and Room Service from their phones, staff to manage orders in real-time, and managers to edit menus using Excel without coding.

**Status**: Production Ready (Version 4.0)
**Tech Stack**: Vanilla JavaScript (ES6 modules), Firebase (Firestore + Auth), Tailwind CSS, XLSX for menu management

## Essential Commands

```bash
# Development
npm run build:css          # Compile Tailwind CSS (run after CSS changes)
npm run watch:css          # Watch mode for CSS development

# Menu Management
npm run export-menu        # Export menu JSON to Excel for editing
npm run import-menu        # Import edited Excel back to JSON (auto-creates backup)
npm run view-menu          # View current menu in terminal

# Utilities
npm run generate-qr        # Generate QR code for ordering system
```

## Architecture Overview

### Data Flow Architecture

**Guest Ordering Flow**:
1. User visits `orderingsystem.html` → chooses Beach Drinks or Room Service
2. `scripts/ordering_logic.js` loads menu from `data/sample_menu.json`
3. User adds items to cart (stored in memory)
4. On checkout, order submitted to Firestore `/orders` collection
5. If logged in, order linked to user via `userId` field

**Staff Dashboard Flow**:
1. Staff opens `dashboard.html`
2. `scripts/dashboard_logic.js` queries Firestore `/orders` collection
3. Real-time display of orders filtered by menu type and status
4. Status updates written directly to Firestore

**Menu Management Flow**:
1. `jsonToExcel.js` reads `sample_menu.json` → creates `menu_editor.xlsx`
2. Staff edits Excel file (prices, availability, items)
3. `excelToJson.js` validates and writes back to `sample_menu.json`
4. Automatic backup created as `sample_menu.backup.json`

### Firebase Architecture

**Collections**:
- `/orders`: All orders with structure:
  ```javascript
  {
    menuType: 'beachDrinks' | 'roomService',
    items: [{itemName, price, quantity, modifiers, customNote}],
    name: 'guest name',
    location: 'room/beach location',
    status: 'new' | 'preparing' | 'ready' | 'delivered' | 'cancelled',
    timestamp: Firestore.Timestamp,
    userId: 'firebase-user-id' (if logged in),
    userEmail: 'email' (if logged in)
  }
  ```
- `/users`: User profiles (managed by Firebase Auth)

**Authentication**:
- Firebase Authentication with email/password
- Guest mode still available (no login required)
- Auth state managed by `scripts/auth.js`
- Protected pages check auth state on load

### Page Relationships

```
orderingsystem.html (main entry)
├── login.html (auth, accessible from header)
├── order-history.html (requires auth, reorder functionality)
└── dashboard.html (staff only, separate from guest flow)
```

### Module Structure

All JavaScript files use ES6 modules:
- `scripts/firebase-config.js`: Exports `db` and `auth` instances
- `scripts/auth.js`: Manages authentication state, exports auth functions
- `scripts/ordering_logic.js`: Guest ordering logic (cart, checkout)
- `scripts/dashboard_logic.js`: Staff dashboard (order viewing/updating)
- Node scripts (`jsonToExcel.js`, `excelToJson.js`, `viewMenu.js`): CommonJS for CLI tools

## Key Implementation Details

### Menu Data Structure
Menu stored as JSON with two types (`beachDrinks`, `roomService`), each containing categories with items. Each item has: name, price, available (boolean), modifiers (array), imagePath, category.

### Authentication Pattern
- Optional authentication: Users can order as guest or logged in
- `userId` field in orders enables order history
- Reorder functionality uses `sessionStorage` to pass order data between pages
- Auth state persists via Firebase SDK (localStorage-based)

### Real-time Updates
Dashboard uses snapshot-style loading (not live listeners). Staff must refresh to see new orders. This is intentional for simplicity and Firebase read cost optimization.

### Security Model
- Firestore rules (see `firestore.rules`) currently allow:
  - Anyone can create orders (guest ordering)
  - Anyone can read/update orders (dashboard access)
  - No deletions allowed
- **Production TODO**: Add authentication requirements for dashboard access

## Common Development Tasks

### Adding a New Menu Item
1. Run `npm run export-menu`
2. Edit `data/menu_editor.xlsx` in Excel
3. Add row with: Type (beachdrinks/roomservice), Category, Item Name, Price, Available (TRUE/FALSE), Modifiers (comma-separated), Image Path
4. Run `npm run import-menu`

### Modifying Order Statuses
Edit the status flow in `scripts/dashboard_logic.js`. Status buttons are generated dynamically based on current status. Allowed transitions are defined in the status update logic.

### Adding New Firebase Collections
1. Import required Firestore functions from firebase SDK in relevant script
2. Update `firestore.rules` with appropriate security rules
3. Test rules in Firebase Console before deployment

### Styling Changes
- Source CSS: `css/input.css` (Tailwind directives)
- Output CSS: `css/output.css` (compiled)
- Run `npm run build:css` after changes or use `npm run watch:css` during development
- Tailwind config: `tailwind.config.js`

## Firebase Configuration

**Project**: st-peters-bay-food-ordering
**Console**: https://console.firebase.google.com/
**Services**: Firestore Database, Authentication (Email/Password)
**Config**: Stored in `scripts/firebase-config.js` (API keys are safe to expose for web apps)

## Google Sheets Integration (In Progress)

**Status**: Phase 1 - Google Cloud setup partially complete. Migrating from Excel to Google Sheets for menu management.

**Google Cloud Project**: st-peters-bay-menu-system
**Google Sheet ID**: 1GNMaBxwdfh-swkwHb7hKqgxEFpsdx8cJ
**Service Account Email**: menu-sync-service@st-peters-bay-menu-system.iam.gserviceaccount.com
**Service Account Key**: `service-account-key.json` (in project root, gitignored)
**OAuth Credentials**: `data/client_secret_61610908293-qne996f7iqqo4121jp626mqov2s3cj1s.apps.googleusercontent.com.json`

**Implementation Tracking**: See `IMPLEMENTATION_NOTES.md` for detailed phase-by-phase progress
**Setup Guide**: See `GOOGLE_SHEETS_SETUP.md` for complete Google Cloud setup instructions

**Future Workflow** (once complete):
1. Staff edit menu in Google Sheets (master copy)
2. Auto-sync worker polls Sheet every 5 minutes for changes
3. Changes synced to `data/sample_menu.preview.json` (staging)
4. Admin reviews changes in admin panel
5. Admin publishes to `data/sample_menu.json` (production)
6. Admin deploys to live site

## IMPORTANT RESTRICTIONS

**File Deletion**:
- NEVER delete any files in this project
- ESPECIALLY never delete files or data in Firebase (Firestore collections, Authentication users, etc.)
- If cleanup is needed, always ask the user first

**Firebase Rules**:
- DO NOT deploy or change Firebase security rules on your own
- You MAY modify the local `firestore.rules` file
- ALWAYS ask the user to deploy rule changes via Firebase Console or CLI
- The user must manually run: `firebase deploy --only firestore:rules`

**Rationale**: Firebase changes affect production data and user access. All Firebase deployments require explicit user approval.

## Important Files

- `data/sample_menu.json`: Active menu (80 items total)
- `firestore.rules`: Database security rules
- `scripts/firebase-config.js`: Firebase initialization
- `MENU_EDITING_GUIDE.md`: Staff guide for Excel-based menu editing
- `AUTH_SYSTEM_GUIDE.md`: Authentication system documentation
- `PROJECT_PROGRESS.md`: Complete project documentation and feature list

## Deployment Notes

**Current Hosting**: Vercel (https://spbgazebo.com)

The project is deployed on Vercel with configuration in `vercel.json`. Vercel automatically deploys from the connected Git repository.

**Deployment**:
```bash
# Vercel CLI (optional - Git auto-deploy is configured)
npm install -g vercel
vercel login
vercel deploy
```

**Alternative**: Firebase Hosting (not currently used)
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

**Before Production**:
1. Review and update `firestore.rules` to restrict dashboard access
2. Test all flows (guest ordering, logged-in ordering, dashboard, menu editing)
3. Add actual food/drink images to replace placeholders
4. Consider adding environment-specific Firebase configs

## Testing Approach

No formal test framework. Manual testing recommended:
- Test guest ordering flow (both menu types)
- Test authenticated user flow (login, order, view history, reorder)
- Test dashboard (view orders, update status, filter by type/status)
- Test menu export/import cycle
- Test on mobile devices (all pages are responsive)
