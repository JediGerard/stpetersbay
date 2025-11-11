# Google Sheets Menu Management - Implementation Tracking

**Project**: St. Peter's Bay Food Ordering System - Menu Management Migration
**Started**: 2025-01-11
**Status**: 🟡 In Progress

---

## Implementation Progress

### Phase 1: Google Cloud Setup (2-3 hours)
**Status**: 🟡 In Progress - Setup guide created, awaiting user completion

**Tasks**:
- [ ] Create Google Cloud Project at console.cloud.google.com
- [ ] Enable Google Sheets API v4
- [ ] Enable Google Drive API (for lastModified timestamp)
- [ ] Create OAuth 2.0 credentials (Web Application type)
- [ ] Configure authorized redirect URIs (production domain + http://localhost:3000 for testing)
- [ ] Create Service Account for backend API access
- [ ] Download Service Account JSON credentials
- [ ] Create master Google Sheet with structure below
- [ ] Populate Sheet with current 80 menu items from sample_menu.json (use `node scripts/exportSheetCSV.js` helper)
- [ ] Add data validation rules to Sheet
- [ ] Share Sheet with authorized editor email accounts

**Helper Resources Created**:
- ✅ `GOOGLE_SHEETS_SETUP.md` - Complete step-by-step setup guide (88 sections)
- ✅ `scripts/exportSheetCSV.js` - Helper script to export existing menu to CSV for easy Sheet import

**Google Sheet Structure**:
```
Row 1 (Headers): Type | Category | Item Name | Price | Available | Modifiers (comma-separated) | Image Path

Data Validation Rules:
- Type column: Dropdown = ["beachdrinks", "roomservice"]
- Available column: Dropdown = ["TRUE", "FALSE"]
- Price column: Number format, > 0
```

**Deliverables**:
- Google Sheet ID: `[TO BE FILLED]`
- OAuth Client ID: `[TO BE FILLED]`
- OAuth Client Secret: `[TO BE FILLED]`
- Service Account JSON file saved to project root (gitignored)

---

### Phase 2: Dependencies & Configuration (1 hour)
**Status**: ⬜ Not Started

**Tasks**:
- [ ] Remove old dependencies: `npm uninstall xlsx`
- [ ] Install new dependencies: `npm install googleapis google-auth-library node-cron dotenv express cors`
- [ ] Create `.env` file with credentials (gitignored)
- [ ] Create `.env.example` template
- [ ] Create `data/backups/` directory
- [ ] Update `.gitignore` with new entries
- [ ] Update `package.json` scripts section

**New Dependencies**:
```json
{
  "googleapis": "^134.0.0",
  "google-auth-library": "^9.0.0",
  "node-cron": "^3.0.3",
  "dotenv": "^16.4.0",
  "express": "^4.18.2",
  "cors": "^2.8.5"
}
```

**Environment Variables** (`.env`):
```
# Google Cloud Credentials
GOOGLE_SHEET_ID=your_sheet_id_here
GOOGLE_CLIENT_ID=your_oauth_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_oauth_secret
SERVICE_ACCOUNT_PATH=./service-account-key.json

# Admin Access
ADMIN_EMAILS=email1@gmail.com,email2@gmail.com,email3@gmail.com

# Server Config
PORT=3000
NODE_ENV=development
```

**Updated `.gitignore`**:
```
node_modules/
.env
service-account-key.json
data/backups/
data/menu_editor.xlsx
data/sample_menu.preview.json
```

**Updated `package.json` scripts**:
```json
{
  "scripts": {
    "build:css": "npx tailwindcss -i css/input.css -o css/output.css",
    "watch:css": "npx tailwindcss -i css/input.css -o css/output.css --watch",
    "auto-sync": "node scripts/autoSync.js",
    "publish-menu": "node scripts/publishMenu.js",
    "view-menu": "node scripts/viewMenu.js",
    "generate-qr": "node scripts/generateQRCode.js",
    "start-server": "node server.js",
    "dev-server": "nodemon server.js"
  }
}
```

---

### Phase 3: Backend Sync System (4-5 hours)
**Status**: ⬜ Not Started

**Tasks**:
- [ ] Create `scripts/googleSheetsSync.js`
- [ ] Create `scripts/autoSync.js`
- [ ] Create `scripts/publishMenu.js`
- [ ] Test sync functionality manually
- [ ] Test auto-sync worker
- [ ] Test publish with backup creation

#### File: `scripts/googleSheetsSync.js`

**Purpose**: Core logic to read Google Sheet and convert to JSON

**Functionality**:
1. Authenticate using Service Account credentials
2. Read all rows from Sheet (skip header row)
3. Transform each row to menu item object
4. Validate data (required fields, type validation, price format)
5. Group items by type (beachDrinks vs roomService)
6. Write to `data/sample_menu.preview.json`
7. Return success/error with details

**Key Functions**:
```javascript
async function syncGoogleSheetToJSON() {
  // 1. Authenticate with Google Sheets API
  // 2. Fetch sheet data: sheets.spreadsheets.values.get()
  // 3. Parse rows starting from row 2
  // 4. Validate each row
  // 5. Transform to JSON structure
  // 6. Write to preview file
  // 7. Log sync timestamp
}
```

**Data Transformation Logic**:
```javascript
// Row format: [type, category, itemName, price, available, modifiers, imagePath]
const item = {
  type: row[0].toLowerCase().trim(),
  category: row[1].trim(),
  itemName: row[2].trim(),
  price: parseFloat(row[3]),
  image: row[6] || 'images/placeholder.png',
  available: row[4].toUpperCase() === 'TRUE',
  modifiers: row[5] ? row[5].split(',').map(m => m.trim()) : []
};
```

**Validation Rules**:
- Type must be "beachdrinks" or "roomservice" (case-insensitive)
- Category, itemName must be non-empty strings
- Price must be valid number > 0
- Available must parse to boolean (TRUE/FALSE, case-insensitive)
- Skip rows with missing required fields (log warning)

**Error Handling**:
- API authentication failures → exit with error
- Invalid rows → log row number + error, skip row, continue
- File write failures → exit with error
- Network timeouts → retry 3 times, then exit

---

#### File: `scripts/autoSync.js`

**Purpose**: Background worker that polls Google Sheets every 5 minutes

**Functionality**:
1. Load environment variables
2. Set up cron job: `*/5 * * * *` (every 5 minutes)
3. On each run:
   - Check Sheet's lastModifiedTime via Drive API
   - Compare with cached timestamp
   - If changed: run syncGoogleSheetToJSON()
   - Update cached timestamp
   - Log sync event
4. Keep process running indefinitely

**Key Functions**:
```javascript
const cron = require('node-cron');
const fs = require('fs');

const CACHE_FILE = './data/.sync-cache.json';

async function checkForChanges() {
  // 1. Read cached lastModified timestamp
  // 2. Query Drive API for Sheet's current lastModified
  // 3. If different: trigger sync
  // 4. Update cache
}

cron.schedule('*/5 * * * *', async () => {
  console.log(`[${new Date().toISOString()}] Checking for Sheet updates...`);
  await checkForChanges();
});
```

**Logging**:
- Log every check (with timestamp)
- Log sync triggers (Sheet changed)
- Log sync results (success/failure, item counts)
- Log errors with full stack trace

**Process Management**:
- Can be run directly: `npm run auto-sync`
- Or with PM2: `pm2 start scripts/autoSync.js --name menu-auto-sync`
- Graceful shutdown on SIGTERM/SIGINT

---

#### File: `scripts/publishMenu.js`

**Purpose**: Copy staging menu to production with backup

**Functionality**:
1. Check if `sample_menu.preview.json` exists
2. Create timestamped backup of current `sample_menu.json`
3. Copy preview to production
4. Log publish event
5. Exit with success code

**Implementation**:
```javascript
const fs = require('fs');
const path = require('path');

const PREVIEW_FILE = './data/sample_menu.preview.json';
const PRODUCTION_FILE = './data/sample_menu.json';
const BACKUP_DIR = './data/backups';

function publishMenu(publishedBy = 'CLI') {
  // 1. Verify preview file exists
  if (!fs.existsSync(PREVIEW_FILE)) {
    console.error('Preview file not found. Run sync first.');
    process.exit(1);
  }

  // 2. Create backup
  const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
  const backupPath = path.join(BACKUP_DIR, `sample_menu_${timestamp}.json`);

  if (fs.existsSync(PRODUCTION_FILE)) {
    fs.copyFileSync(PRODUCTION_FILE, backupPath);
    console.log(`Backup created: ${backupPath}`);
  }

  // 3. Copy preview to production
  fs.copyFileSync(PREVIEW_FILE, PRODUCTION_FILE);

  // 4. Log event
  const logEntry = {
    timestamp: new Date().toISOString(),
    publishedBy,
    backupPath,
    previewFile: PREVIEW_FILE,
    productionFile: PRODUCTION_FILE
  };

  console.log('Menu published successfully!');
  console.log(JSON.stringify(logEntry, null, 2));

  process.exit(0);
}

// Allow CLI usage
if (require.main === module) {
  const publishedBy = process.argv[2] || 'CLI';
  publishMenu(publishedBy);
}

module.exports = { publishMenu };
```

**CLI Usage**:
```bash
npm run publish-menu
# Or with user info:
node scripts/publishMenu.js "admin@example.com"
```

---

### Phase 4: Admin Web Interface (5-6 hours)
**Status**: ⬜ Not Started

**Tasks**:
- [ ] Create `admin.html` with Google Sign-In UI
- [ ] Create `scripts/admin_logic.js` for frontend logic
- [ ] Create `server.js` Express API server
- [ ] Implement `/api/publish` endpoint
- [ ] Implement `/api/deploy` endpoint
- [ ] Implement `/api/stats` endpoint
- [ ] Test OAuth flow end-to-end
- [ ] Test publish button (verify backup creation)
- [ ] Test deploy button (verify Firebase deploy runs)

#### File: `admin.html`

**Page Structure**:
```html
<!DOCTYPE html>
<html>
<head>
  <title>Menu Admin - St. Peter's Bay</title>
  <link rel="stylesheet" href="css/output.css">
  <script src="https://accounts.google.com/gsi/client" async defer></script>
</head>
<body>
  <!-- Header -->
  <header>
    <h1>Menu Management Admin</h1>
    <div id="auth-status">Not logged in</div>
  </header>

  <!-- Login Section (shown if not authenticated) -->
  <div id="login-section">
    <h2>Admin Access Required</h2>
    <div id="g_id_onload"
         data-client_id="YOUR_CLIENT_ID"
         data-callback="handleCredentialResponse">
    </div>
    <div class="g_id_signin" data-type="standard"></div>
  </div>

  <!-- Admin Dashboard (shown if authenticated) -->
  <div id="admin-dashboard" style="display: none;">

    <!-- Menu Stats -->
    <section id="stats">
      <h2>Current Menu Status</h2>
      <div class="stats-grid">
        <div class="stat-card">
          <h3>Total Items</h3>
          <p id="total-items">--</p>
        </div>
        <div class="stat-card">
          <h3>Last Sync</h3>
          <p id="last-sync">--</p>
        </div>
        <div class="stat-card">
          <h3>Last Publish</h3>
          <p id="last-publish">--</p>
        </div>
      </div>
    </section>

    <!-- Preview vs Production Comparison -->
    <section id="comparison">
      <h2>Menu Changes</h2>
      <div class="comparison-grid">
        <div>
          <h3>Staging (Preview)</h3>
          <pre id="preview-json"></pre>
        </div>
        <div>
          <h3>Production (Live)</h3>
          <pre id="production-json"></pre>
        </div>
      </div>
    </section>

    <!-- Action Buttons -->
    <section id="actions">
      <button id="publish-btn" class="btn-primary">
        1. Publish Menu (Update JSON)
      </button>
      <button id="deploy-btn" class="btn-secondary" disabled>
        2. Deploy to Live Site
      </button>
      <div id="status-message"></div>
      <div id="deployment-log"></div>
    </section>

    <!-- Sync History Log -->
    <section id="history">
      <h2>Recent Activity</h2>
      <ul id="activity-log"></ul>
    </section>

  </div>

  <script type="module" src="scripts/admin_logic.js"></script>
</body>
</html>
```

**UI Flow**:
1. Page loads → check if user signed in (via Google OAuth)
2. If not signed in → show login section
3. User clicks "Sign in with Google"
4. After sign-in → verify email against whitelist
5. If whitelisted → show admin dashboard
6. If not whitelisted → show "Access Denied" message
7. Dashboard loads stats, comparison, and history
8. Admin reviews changes → clicks "Publish Menu"
9. Success → "Deploy to Live Site" button enables
10. Admin clicks "Deploy to Live Site" → see real-time log

---

#### File: `scripts/admin_logic.js`

**Purpose**: Frontend logic for admin page

**Key Functions**:

```javascript
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';

let currentUser = null;
let authToken = null;

// 1. Handle Google Sign-In
function handleCredentialResponse(response) {
  authToken = response.credential;

  // Verify with backend
  fetch('/api/verify-auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: authToken })
  })
  .then(res => res.json())
  .then(data => {
    if (data.authorized) {
      currentUser = data.user;
      showAdminDashboard();
    } else {
      showAccessDenied();
    }
  });
}

// 2. Load Dashboard Data
async function loadDashboard() {
  // Fetch stats
  const stats = await fetch('/api/stats').then(r => r.json());
  document.getElementById('total-items').textContent = stats.totalItems;
  document.getElementById('last-sync').textContent = stats.lastSync;
  document.getElementById('last-publish').textContent = stats.lastPublish;

  // Fetch and display preview vs production
  const preview = await fetch('/data/sample_menu.preview.json').then(r => r.json());
  const production = await fetch('/data/sample_menu.json').then(r => r.json());

  displayComparison(preview, production);

  // Fetch activity log
  const history = await fetch('/api/history').then(r => r.json());
  displayHistory(history);
}

// 3. Publish Menu
async function publishMenu() {
  const confirmMsg = 'Publish staging menu to production JSON?\n\nThis will:\n- Create a timestamped backup\n- Update sample_menu.json\n- Require deployment to go live';

  if (!confirm(confirmMsg)) return;

  document.getElementById('status-message').textContent = 'Publishing...';

  const response = await fetch('/api/publish', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ publishedBy: currentUser.email })
  });

  const result = await response.json();

  if (result.success) {
    document.getElementById('status-message').textContent = '✅ Menu published! Ready to deploy.';
    document.getElementById('deploy-btn').disabled = false;
    loadDashboard(); // Refresh
  } else {
    document.getElementById('status-message').textContent = '❌ Error: ' + result.error;
  }
}

// 4. Deploy to Live Site
async function deployToLive() {
  const confirmMsg = 'Deploy to live site?\n\nThis will:\n- Run firebase deploy --only hosting\n- Take ~30-60 seconds\n- Update live ordering system';

  if (!confirm(confirmMsg)) return;

  document.getElementById('status-message').textContent = 'Deploying...';
  document.getElementById('deployment-log').textContent = '';

  const response = await fetch('/api/deploy', {
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
    document.getElementById('deployment-log').textContent += chunk;
  }

  document.getElementById('status-message').textContent = '✅ Deployment complete!';
  document.getElementById('deploy-btn').disabled = true;
  loadDashboard(); // Refresh
}

// Event listeners
document.getElementById('publish-btn').addEventListener('click', publishMenu);
document.getElementById('deploy-btn').addEventListener('click', deployToLive);

// Initialize on load
window.addEventListener('load', () => {
  // Google Sign-In will auto-initialize from HTML
});
```

---

#### File: `server.js`

**Purpose**: Express API server for admin operations

**Implementation**:

```javascript
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { OAuth2Client } = require('google-auth-library');
const { exec } = require('child_process');
const { publishMenu } = require('./scripts/publishMenu');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const ADMIN_EMAILS = process.env.ADMIN_EMAILS.split(',').map(e => e.trim());

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Verify Google OAuth token
async function verifyToken(token) {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  return ticket.getPayload();
}

// Verify user is admin
function isAdmin(email) {
  return ADMIN_EMAILS.includes(email);
}

// POST /api/verify-auth
app.post('/api/verify-auth', async (req, res) => {
  try {
    const { token } = req.body;
    const payload = await verifyToken(token);

    if (isAdmin(payload.email)) {
      res.json({
        authorized: true,
        user: {
          email: payload.email,
          name: payload.name,
          picture: payload.picture
        }
      });
    } else {
      res.json({ authorized: false, error: 'Not authorized' });
    }
  } catch (error) {
    res.status(401).json({ authorized: false, error: error.message });
  }
});

// GET /api/stats
app.get('/api/stats', (req, res) => {
  try {
    const previewPath = './data/sample_menu.preview.json';
    const productionPath = './data/sample_menu.json';

    const previewStats = fs.existsSync(previewPath)
      ? fs.statSync(previewPath)
      : null;
    const productionStats = fs.existsSync(productionPath)
      ? fs.statSync(productionPath)
      : null;

    const productionData = JSON.parse(fs.readFileSync(productionPath));
    const totalItems = productionData.beachDrinks.length + productionData.roomService.length;

    res.json({
      totalItems,
      lastSync: previewStats ? previewStats.mtime.toISOString() : 'Never',
      lastPublish: productionStats ? productionStats.mtime.toISOString() : 'Never'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/publish
app.post('/api/publish', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split('Bearer ')[1];

    if (!token) {
      return res.status(401).json({ success: false, error: 'No token provided' });
    }

    const payload = await verifyToken(token);

    if (!isAdmin(payload.email)) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    // Run publish script
    publishMenu(payload.email);

    res.json({
      success: true,
      message: 'Menu published successfully',
      publishedBy: payload.email,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/deploy
app.post('/api/deploy', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split('Bearer ')[1];

    if (!token) {
      return res.status(401).json({ success: false, error: 'No token provided' });
    }

    const payload = await verifyToken(token);

    if (!isAdmin(payload.email)) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    // Set response headers for streaming
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Transfer-Encoding', 'chunked');

    // Run Firebase deploy and stream output
    const deployProcess = exec('firebase deploy --only hosting');

    deployProcess.stdout.on('data', (data) => {
      res.write(data);
    });

    deployProcess.stderr.on('data', (data) => {
      res.write(`ERROR: ${data}`);
    });

    deployProcess.on('close', (code) => {
      if (code === 0) {
        res.write('\n\n✅ Deployment successful!');
      } else {
        res.write(`\n\n❌ Deployment failed with code ${code}`);
      }
      res.end();
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/history
app.get('/api/history', (req, res) => {
  try {
    const backupDir = './data/backups';
    const files = fs.readdirSync(backupDir)
      .filter(f => f.startsWith('sample_menu_'))
      .sort()
      .reverse()
      .slice(0, 10);

    const history = files.map(file => {
      const stats = fs.statSync(path.join(backupDir, file));
      return {
        filename: file,
        timestamp: stats.mtime.toISOString(),
        size: stats.size
      };
    });

    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Admin API server running on http://localhost:${PORT}`);
  console.log(`Admin page: http://localhost:${PORT}/admin.html`);
});
```

---

### Phase 5: Security & Validation (2-3 hours)
**Status**: ⬜ Not Started

**Tasks**:
- [ ] Implement rate limiting middleware
- [ ] Add request logging with Winston
- [ ] Create audit log file for admin actions
- [ ] Test OAuth token validation
- [ ] Test email whitelist enforcement
- [ ] Test rate limiting (attempt rapid publishes)
- [ ] Add input sanitization for all user inputs
- [ ] Review all error messages (no sensitive data leaked)

**Security Checklist**:

1. **OAuth Token Validation**:
   - Every admin API call verifies token
   - Tokens expire after 1 hour (Google default)
   - Invalid tokens return 401 Unauthorized

2. **Email Whitelist**:
   - Checked server-side (never trust client)
   - Case-insensitive comparison
   - Non-whitelisted users get 403 Forbidden

3. **Rate Limiting**:
   ```javascript
   const rateLimit = require('express-rate-limit');

   const publishLimiter = rateLimit({
     windowMs: 5 * 60 * 1000, // 5 minutes
     max: 1,
     message: 'Max 1 publish per 5 minutes'
   });

   app.post('/api/publish', publishLimiter, ...);
   ```

4. **Audit Logging**:
   - Log all admin actions to `logs/admin-audit.log`
   - Include: timestamp, user email, action, result
   - Never log passwords or tokens

5. **Input Validation**:
   - Sheet data validation in sync script
   - Sanitize all user inputs (email, etc.)
   - Use parameterized queries if adding database

6. **HTTPS Only (Production)**:
   - Firebase Hosting auto-provides HTTPS
   - Ensure OAuth redirect URIs use https://

7. **Environment Secrets**:
   - Never commit .env file
   - Rotate OAuth secrets quarterly
   - Use Firebase Functions config for production secrets

---

### Phase 6: Testing & Documentation (2-3 hours)
**Status**: ⬜ Not Started

**Tasks**:
- [ ] Complete full testing checklist (see below)
- [ ] Create GOOGLE_SHEETS_SETUP.md guide
- [ ] Create ADMIN_GUIDE.md with screenshots
- [ ] Update CLAUDE.md with new workflow
- [ ] Update README.md with installation steps
- [ ] Create deployment runbook
- [ ] Test on mobile devices (admin page responsive)

**Testing Checklist**:

**Google Sheets Integration**:
- [ ] Manual sync works: `node scripts/googleSheetsSync.js`
- [ ] Preview JSON created correctly
- [ ] Auto-sync detects changes within 5 minutes
- [ ] Auto-sync ignores unchanged sheets
- [ ] Invalid rows are skipped with warnings
- [ ] Empty rows are ignored
- [ ] Modifiers parse correctly (comma-separated to array)
- [ ] Price validation rejects negative/zero values
- [ ] Type validation rejects invalid types
- [ ] Available field parses TRUE/FALSE correctly

**Publish Workflow**:
- [ ] Publish creates timestamped backup
- [ ] Backup filename format: sample_menu_YYYY-MM-DDTHH-MM-SS.json
- [ ] Production JSON updated correctly
- [ ] Backup directory created if missing
- [ ] CLI publish works: `npm run publish-menu`
- [ ] API publish works from admin page

**Admin Page**:
- [ ] Google Sign-In button appears
- [ ] OAuth flow completes successfully
- [ ] Whitelisted user sees dashboard
- [ ] Non-whitelisted user sees "Access Denied"
- [ ] Stats display correctly (item count, timestamps)
- [ ] Preview vs Production comparison shows differences
- [ ] Publish button works
- [ ] Deploy button works
- [ ] Deployment log streams in real-time
- [ ] Activity history shows last 10 events
- [ ] Page is responsive on mobile
- [ ] Error messages display clearly

**Security**:
- [ ] Invalid OAuth token returns 401
- [ ] Non-whitelisted email returns 403
- [ ] Rate limiting blocks rapid publishes
- [ ] Admin actions logged to audit file
- [ ] No sensitive data in error messages
- [ ] HTTPS works in production

**Frontend Ordering System**:
- [ ] Ordering page still loads after menu update
- [ ] Updated prices display correctly
- [ ] New items appear in menu
- [ ] Removed items don't appear
- [ ] Modifiers display correctly
- [ ] Images load (or placeholder if missing)

**Error Handling**:
- [ ] Graceful failure if Google Sheets API down
- [ ] Graceful failure if Firebase deploy fails
- [ ] Clear error messages for network issues
- [ ] Auto-sync recovers from temporary failures

---

## Documentation Deliverables

### 1. GOOGLE_SHEETS_SETUP.md

**Contents**:
- Step-by-step Google Cloud Project setup
- How to enable APIs
- How to create OAuth credentials
- How to create Service Account
- How to set up master Google Sheet
- How to configure data validation
- How to populate initial data
- How to share Sheet with editors

### 2. ADMIN_GUIDE.md

**Contents**:
- How to access admin page
- How to sign in with Google
- Dashboard overview (with screenshots)
- How to interpret preview vs production differences
- How to publish menu
- How to deploy to live site
- What to do if deployment fails
- How to restore from backup
- Troubleshooting common issues

### 3. Updated CLAUDE.md

**New sections**:
- Google Sheets workflow (replace Excel instructions)
- Admin page usage
- Auto-sync worker management
- New npm scripts
- Updated file structure

### 4. Updated README.md

**New sections**:
- Installation with new dependencies
- Environment setup (.env configuration)
- How to start auto-sync worker
- How to start admin server
- Deployment steps

---

## File Structure Summary

**New Files**:
```
scripts/
  ├── googleSheetsSync.js       # Core sync logic (Google Sheets → JSON)
  ├── autoSync.js               # Background worker (5-min polling)
  ├── publishMenu.js            # Staging → Production copy with backup
  └── admin_logic.js            # Admin page frontend logic

server.js                        # Express API server
admin.html                       # Admin interface
.env                             # Secrets (gitignored)
.env.example                     # Template
service-account-key.json         # Google Service Account (gitignored)

data/
  ├── sample_menu.preview.json  # Staging menu (auto-updated)
  ├── .sync-cache.json           # Last sync timestamp cache
  └── backups/                   # Timestamped backups
      └── sample_menu_*.json

logs/
  └── admin-audit.log            # Admin action audit trail
```

**Removed Files**:
```
scripts/
  ├── jsonToExcel.js            # Deleted (Excel workflow removed)
  └── excelToJson.js            # Deleted (Excel workflow removed)

data/
  └── menu_editor.xlsx           # Deleted (replaced by Google Sheets)
```

**Modified Files**:
```
package.json                    # Updated dependencies and scripts
.gitignore                      # Added .env, backups, service account
CLAUDE.md                       # Updated workflow
README.md                       # Updated setup instructions
```

**Unchanged Files**:
```
scripts/
  ├── firebase-config.js        # No changes
  ├── auth.js                   # No changes
  ├── ordering_logic.js         # No changes (still reads sample_menu.json)
  ├── dashboard_logic.js        # No changes
  └── viewMenu.js               # No changes (still works)

data/
  └── sample_menu.json          # Still used (updated by publish script)

firestore.rules                 # No changes
All HTML pages (except admin)   # No changes
```

---

## Rollback Plan

If critical issues arise after deployment:

1. **Stop Auto-Sync**:
   ```bash
   # If running directly:
   Ctrl+C

   # If using PM2:
   pm2 stop menu-auto-sync
   ```

2. **Restore From Backup**:
   ```bash
   # List backups:
   ls -lt data/backups/

   # Restore latest good backup:
   cp data/backups/sample_menu_2025-01-11T14-30-22.json data/sample_menu.json
   ```

3. **Deploy Restored Menu**:
   ```bash
   firebase deploy --only hosting
   ```

4. **Investigate Issue**:
   - Check logs in `logs/admin-audit.log`
   - Check auto-sync console output
   - Check Firebase deploy output
   - Verify Google Sheets data integrity

5. **Fix and Resume**:
   - Fix identified issue
   - Test thoroughly
   - Restart auto-sync: `npm run auto-sync`

---

## Cost Analysis

**Google APIs** (Free Tier):
- Sheets API: 100 requests/100 seconds = 36,000/hour
- Auto-sync uses ~12 requests/hour (well within free tier)
- Drive API: Same limits, used for lastModified check
- OAuth: Free, unlimited
- **Cost: $0/month**

**Firebase Hosting**:
- Current plan unchanged
- Deploy frequency doesn't affect cost (unlimited deploys)
- **Cost: $0/month**

**Server Hosting**:
- Option 1: Run on existing infrastructure (local server, VPS)
- Option 2: Firebase Cloud Functions (~$0.01 per publish/deploy)
- **Estimated Cost: $0-5/month**

**Total Estimated Cost: $0-5/month**

---

## Future Enhancements (Out of Scope)

Ideas for future iterations:

1. **Automatic Deployment**:
   - Remove deploy button, auto-deploy after publish
   - Or: auto-deploy on schedule (daily at 3am)

2. **Multi-Environment Support**:
   - Separate staging and production sites
   - Preview changes before going live

3. **Menu Versioning**:
   - Keep full history of menu changes
   - Ability to rollback to any previous version
   - Compare any two versions

4. **Email Notifications**:
   - Email staff when menu published
   - Email on sync errors
   - Daily summary of menu changes

5. **Image Upload**:
   - Upload images via admin page
   - Auto-optimize and resize
   - Store in Firebase Storage

6. **Menu Analytics**:
   - Track which items are ordered most
   - Suggest removing low-performing items
   - Price optimization suggestions

7. **Mobile Admin App**:
   - Native iOS/Android app
   - Push notifications for orders
   - Quick menu edits on-the-go

---

## Next Steps

**After Phase 1 completes, you will say**: "Continue with next phase"

**I will**:
1. Read this IMPLEMENTATION_NOTES.md file
2. Find the next incomplete phase
3. Execute all tasks in that phase
4. Mark tasks as completed with ✅
5. Update phase status
6. Tell you when phase is complete

**Workflow**:
```
You: "Continue with next phase"
Me: [Reads notes, executes Phase X, updates file]
Me: "Phase X complete. Run /clear then say 'Continue with next phase' for Phase Y."
You: /clear
You: "Continue with next phase"
[Repeat until all 6 phases done]
```

---

**Current Status**: Ready to begin Phase 1
**Next Action**: Admin should set up Google Cloud Project and credentials
