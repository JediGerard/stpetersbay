# Owner/Admin Manual
## St. Peter's Bay Food Ordering System

---

## Table of Contents
1. [Quick Start Guide](#quick-start-guide)
2. [Admin Panel Access](#admin-panel-access)
3. [Publishing Menu Changes](#publishing-menu-changes)
4. [Deploying to Live Site](#deploying-to-live-site)
5. [Backup Management](#backup-management)
6. [User Management](#user-management)
7. [Auto-Sync Worker](#auto-sync-worker)
8. [Security & Access Control](#security--access-control)
9. [Analytics & Monitoring](#analytics--monitoring)
10. [Troubleshooting](#troubleshooting)

---

## Quick Start Guide
**Essential admin tasks in 10 minutes!**

### 1. Access Admin Panel (2 minutes)
- Start admin server: `npm run start-server`
- Open: **http://localhost:3000/admin.html**
- Sign in with your whitelisted Google account

### 2. Review Menu Changes (3 minutes)
- Check "Last Sync" time - should be recent
- Look for yellow warning if preview differs from production
- Compare Preview vs Production item counts
- Review what changed (prices, availability, new items)

### 3. Publish and Deploy (5 minutes)
- Click **"Publish Menu"** (creates automatic backup)
- Wait for success message
- Click **"Deploy to Live Site"**
- Watch deployment log (30-60 seconds)
- Verify changes are live on website

**💡 Pro Tip:** Check the admin panel daily to ensure staff's Google Sheet edits are published promptly. The auto-sync worker handles the detection automatically!

---

## Admin Panel Access

### Prerequisites

**What You Need:**
- Admin server must be running on your computer
- Whitelisted Google account (your email must be in the approved list)
- Access to the computer/server where the system is hosted
- Node.js installed (if running locally)

### Starting the Admin Server

**Step 1: Open Terminal/Command Prompt**

Navigate to your project folder:
```
cd /path/to/SPB food ordering
```

**Step 2: Start the Server**
```
npm run start-server
```

**Step 3: Wait for Confirmation**

You should see:
```
Admin server running on http://localhost:3000
```

### Logging Into Admin Panel

1. **Open the Admin URL:** http://localhost:3000/admin.html

2. **Click "Sign in with Google"** button

3. **Choose your whitelisted Google account** from the Google sign-in popup

4. **Allow permissions** if prompted

5. **Access granted!** You'll see the admin dashboard

**🚫 Access Denied?**

If you see "Access Denied," your email is not whitelisted. To add yourself:

1. Open the `.env` file in your project
2. Find the `ADMIN_EMAILS` line
3. Add your email: `ADMIN_EMAILS=existing@email.com,your@email.com`
4. Save the file and restart the server

### Admin Dashboard Overview

#### 📊 Status Cards (Top Section)
- **Production Items:** Total items currently live on website
- **Preview Items:** Total items in staging (from Google Sheets)
- **Last Sync:** When Google Sheet was last synced to preview
- **Last Publish:** When preview was last published to production

#### 📋 Menu Comparison (Middle Section)
- Side-by-side view: Staging (left) vs Production (right)
- Item counts by service type
- Yellow warning if differences detected
- "View Full JSON" buttons for detailed inspection

#### 🕒 Recent Activity (Bottom Section)
- Last 10 menu publications
- Backup file names with timestamps
- File sizes
- Publication history log

#### 🔘 Action Buttons
- **"Publish Menu":** Move preview to production (always enabled)
- **"Deploy to Live Site":** Push to website (enabled after publishing)
- **"Sign Out":** Log out of admin panel

---

## Publishing Menu Changes

### Understanding the Publishing Workflow

**The Three-Stage System:**

1. **Google Sheet (Master):** Staff edit menu here - this is the source of truth
2. **Preview/Staging (sample_menu.preview.json):** Auto-synced from Google Sheet every 5 minutes
3. **Production (sample_menu.json):** Live menu on website - only you can publish to this

### Step-by-Step Publishing Process

#### Step 1: Review Changes

Before publishing, always check:

**Last Sync Time**
Ensure it's recent (within the last 5-10 minutes). If it's old, the auto-sync worker might not be running.

**Change Warning**
Look for the yellow warning banner that says "Preview menu differs from production." If you don't see this, there are no changes to publish.

**Item Counts**
Compare the number of Beach Drinks and Room Service items between Preview and Production.

#### Step 2: Inspect Changes (Optional but Recommended)

For detailed review:
1. Click **"View Full JSON"** under Preview menu
2. Click **"View Full JSON"** under Production menu
3. Compare the two to see exactly what changed:
   - New items added
   - Items removed
   - Price changes
   - Availability changes (TRUE/FALSE)
   - Modifier updates

**💡 Why Review?** Catch mistakes before they go live. For example, if you see a price of $100 instead of $10, you know there's a typo to fix in the Google Sheet.

#### Step 3: Publish the Menu

1. Click the **"Publish Menu"** button
2. A confirmation popup appears asking "Are you sure you want to publish the menu changes?"
3. Click **"OK"** to confirm or **"Cancel"** to abort
4. Wait 1-2 seconds for processing

**✅ What Happens When You Publish:**
- Current production menu is automatically backed up with timestamp
- Backup saved to: `data/backups/sample_menu_YYYY-MM-DDTHH-MM-SS.json`
- Preview menu copied to production: `sample_menu.preview.json → sample_menu.json`
- Action logged with your email and timestamp
- "Deploy to Live Site" button becomes enabled

#### Step 4: Verify Publication

After publishing, check:
- Success message appears: "Menu published successfully!"
- Yellow warning disappears (Preview and Production now match)
- Production item counts updated to match Preview
- "Last Publish" timestamp shows current time
- New backup appears in Recent Activity log
- "Deploy to Live Site" button is now clickable (not grayed out)

**⚠️ Important Notes:**
- **Publishing doesn't update the live website yet!** It only updates the local production file.
- You must complete the deployment step to make changes visible to guests.
- Backups are created automatically - you never lose previous menus.
- Publishing can be done as many times as needed - each publish creates a new backup.

---

## Deploying to Live Website

**📝 Note:** This step pushes your published menu changes to the live website (spbgazebo.com) where guests will see them. Only do this after you've published and reviewed the changes.

### Prerequisites for Deployment

- ✓ You've already published the menu
- ✓ "Deploy to Live Site" button is enabled (not grayed out)
- ✓ You have git access to the repository
- ✓ Vercel is connected to your git repository

### How Deployment Works

**The Deployment Process:**

1. You click "Deploy to Live Site" in admin panel
2. System creates a git commit with your menu changes
3. Commit message: "Update menu via admin panel"
4. Changes are pushed to your remote git repository (GitHub/GitLab)
5. Vercel detects the push automatically
6. Vercel builds and deploys the new version
7. Live website (spbgazebo.com) updates within 30-60 seconds

### Step-by-Step Deployment

#### Step 1: Initiate Deployment

1. Locate the **"Deploy to Live Site"** button (should be enabled/clickable)
2. Click the button
3. A confirmation popup appears: "Are you sure you want to deploy to the live site?"
4. Click **"OK"** to proceed

#### Step 2: Watch Deployment Log

A deployment log window appears showing real-time progress:

```
🚀 Starting deployment...
📝 Creating git commit...
✅ Commit created successfully
📤 Pushing to remote repository...
✅ Push successful
🌐 Vercel will auto-deploy from this push
✅ Deployment complete!
```

This typically takes 30-60 seconds.

#### Step 3: Verify Deployment Success

- Look for **"✅ Deployment complete!"** message
- Success banner appears: "Changes deployed to live site!"
- Log shows no errors

**🎉 Success!** Your menu changes are now live on spbgazebo.com. Guests will see the updated menu immediately.

#### Step 4: Test the Live Site

1. Open a new browser tab (or use your phone)
2. Go to **spbgazebo.com**
3. Click on Beach Drinks or Room Service
4. Verify your changes appear:
   - New items are visible
   - Prices are correct
   - Unavailable items don't show
   - Modifiers are accurate
5. If something looks wrong, you can make corrections and redeploy

**💡 Troubleshooting Tip:** If you don't see changes immediately, try hard-refreshing the page (Ctrl+Shift+R on Windows, Cmd+Shift+R on Mac) to clear your browser cache.

**⚠️ What If Deployment Fails?**

If you see errors in the deployment log:

1. Note the error message
2. Common issues:
   - **Git not configured:** Set up git credentials
   - **No push access:** Verify git remote access
   - **Merge conflicts:** Pull latest changes first
   - **Vercel connection issue:** Check Vercel dashboard
3. Try deploying again after fixing the issue
4. If problems persist, see Troubleshooting section

**🔄 Manual Deployment Alternative**

If the admin panel deployment fails, you can deploy manually:
```
git add data/sample_menu.json
git commit -m "Update menu"
git push
```

Vercel will still auto-deploy from the push.

---

## Backup Management

**✅ Automatic Backups:** Every time you publish a menu, the system creates an automatic backup. You never lose previous menu versions!

### How Backups Work

**Backup Trigger:**

When you click "Publish Menu," the system automatically:

1. Takes the current production menu (sample_menu.json)
2. Creates a timestamp (e.g., 2025-01-13T14-30-00)
3. Saves a copy: `sample_menu_2025-01-13T14-30-00.json`
4. Stores in: `data/backups/` folder
5. Then replaces production with preview

### Backup File Naming

**Format:** `sample_menu_YYYY-MM-DDTHH-MM-SS.json`

**Example:** `sample_menu_2025-01-13T14-30-00.json`

This means: Menu backup from January 13, 2025 at 2:30 PM

### Viewing Backup History

The admin panel shows your 10 most recent backups in the "Recent Activity" section.

### Restoring from a Backup

**⚠️ Advanced Task:** Restoring backups requires accessing the server files. Proceed carefully!

1. **Identify Which Backup to Restore**
   Look at the timestamps in Recent Activity or browse the `data/backups/` folder

2. **Navigate to Backups Folder**
   ```
   cd data/backups/
   ```

3. **Copy Backup to Production**
   ```
   cp sample_menu_2025-01-13T14-30-00.json ../sample_menu.json
   ```
   Replace the timestamp with your desired backup

4. **Publish and Deploy**
   Return to admin panel, publish, and deploy to make the restored menu live

**🚨 Important Restore Notes:**
- Restoring a backup overwrites the current production menu
- A new backup of the current menu is created when you publish after restore
- Test the restored menu before deploying to live site
- If unsure, contact IT support

### Backup Cleanup

Backups accumulate over time. Periodically clean up old backups to save disk space:

**Recommended Retention:**
- **Keep last 30 days:** For recent changes
- **Keep monthly snapshots:** For long-term history
- **Delete older daily backups:** To save space

**To delete old backups:**
1. Navigate to `data/backups/`
2. Review file timestamps
3. Delete files older than your retention policy
4. Keep at least a few recent backups for safety

---

## User Management (Firebase Console)

**📝 Note:** User management is done through the Firebase Console, not the admin panel. This includes guest accounts and order data.

### Accessing Firebase Console

1. Go to https://console.firebase.google.com/
2. Sign in with your Google account
3. Select your project: **st-peters-bay-food-ordering**

### Managing Guest Accounts

**Navigate to:** Authentication → Users tab

**What You'll See:**
- **User Identifier (UID):** Unique ID for each user
- **Email:** Guest's email address
- **Created:** Account creation date
- **Last Sign-In:** When they last logged in
- **User UID:** Internal Firebase ID

### Common User Management Tasks

#### Viewing User Details
1. Click on any user in the list
2. View full profile: email, UID, creation date, sign-in methods
3. See metadata: last sign-in, token issued times

#### Disabling a User Account
1. Click on the user
2. Click "Disable account" button
3. User cannot log in until re-enabled
4. Their data and orders remain intact

**Use case:** Temporarily prevent access for suspicious accounts without deleting data

#### Deleting a User Account
1. Click on the user
2. Click "Delete account" button
3. Confirm deletion
4. User is permanently removed from authentication

**⚠️ Warning:** This only deletes the authentication account. User's orders and profile data in Firestore remain.

#### Resetting User Password
1. Click on the user
2. Click "Send password reset email"
3. User receives reset link at their email
4. They can create a new password

### Managing User Data (Firestore)

**Navigate to:** Firestore Database

#### 📂 /users Collection
Stores guest profile information:
- `email` - User's email
- `displayName` - Full name
- `roomNumber` - Resort room number
- `createdAt` - Account creation timestamp

#### 📂 /orders Collection
Stores all orders (guest and non-guest):
- `userId` - Links to user (null for guest orders)
- `userEmail` - User's email if logged in
- `menuType` - "beachDrinks" or "roomService"
- `items` - Array of ordered items
- `status` - "new", "preparing", "ready", "delivered"
- `timestamp` - When order was placed

### Viewing User's Orders

1. Go to Firestore Database → orders collection
2. Click "Filter" button
3. Add filter: `userId == [user's UID]`
4. Apply filter
5. See all orders from that user

**💡 Privacy & Data Protection:**
- Only access user data when necessary for support/troubleshooting
- Never share user information with third parties
- Delete user data upon request (GDPR compliance)
- Regularly review and clean up old data

---

## Auto-Sync Worker Management

**✅ What It Does:** The auto-sync worker automatically checks Google Sheets every 5 minutes for changes and syncs them to the preview menu.

### How Auto-Sync Works

1. **Worker runs in background** (continuously)
2. **Every 5 minutes,** checks Google Sheet's modification time using Drive API
3. **If Sheet changed,** downloads new data from Google Sheets API
4. **Updates preview:** Writes to `sample_menu.preview.json`
5. **Logs activity** to console
6. **If Sheet unchanged,** skips sync (efficient!)
7. **Repeat** every 5 minutes

### Starting the Auto-Sync Worker

**Open terminal** and navigate to your project:
```
cd /path/to/SPB food ordering
```

**Start the worker:**
```
npm run auto-sync
```

You'll see output like:
```
🔄 Auto-sync worker started
📡 Checking Google Sheets every 5 minutes...
✓ First sync complete
⏰ Next check in 5 minutes
```

**💡 Keep Terminal Open:** The worker runs as long as this terminal window stays open. Closing it stops the worker.

### Monitoring Auto-Sync Activity

#### In Terminal (Real-Time)
Watch the terminal running the worker. You'll see:
- ✓ No changes detected - Sheet unchanged
- 🔄 Changes detected, syncing... - Sheet was edited
- ✅ Sync complete - Preview updated
- ❌ Error - Something went wrong

#### In Admin Panel
Check the "Last Sync" timestamp:
- Should update every 5 minutes (even if no changes)
- If timestamp is old (>10 min), worker might be stopped
- Recent timestamp = worker is running normally

### Stopping the Auto-Sync Worker

- **Method 1:** Press `Ctrl+C` in the terminal running the worker
- **Method 2:** Close the terminal window
- **Result:** Worker stops immediately, no more automatic syncing

**⚠️ When Worker is Stopped:**
- Staff can still edit Google Sheet
- Changes won't sync to preview automatically
- You'll need to manually sync or restart worker
- "Last Sync" timestamp won't update

### Manual Sync (Alternative)

If the worker is stopped, you can manually sync one time:
```
node scripts/googleSheetsSync.js
```

This syncs Google Sheet to preview once, then exits. Use this for:
- Testing sync functionality
- Getting immediate changes without waiting 5 minutes
- Troubleshooting sync issues

### Running Worker as Background Service (Advanced)

**💡 For Production Deployments:** Use a process manager like PM2 to keep the worker running even after terminal closes or server restarts.

**Install PM2 (one-time):**
```
npm install -g pm2
```

**Start worker with PM2:**
```
pm2 start npm --name "menu-auto-sync" -- run auto-sync
```

**Check status:**
```
pm2 status
```

**View logs:**
```
pm2 logs menu-auto-sync
```

**Stop worker:**
```
pm2 stop menu-auto-sync
```

**Restart worker:**
```
pm2 restart menu-auto-sync
```

**Auto-start on server reboot:**
```
pm2 startup
pm2 save
```

**✅ Benefits of PM2:**
- Worker keeps running after terminal closes
- Automatically restarts if it crashes
- Starts automatically on server reboot
- Easy log viewing and monitoring
- Professional production setup

---

## Security & Access Control

### Admin Email Whitelist

**How Admin Access Works:** Only email addresses listed in the `ADMIN_EMAILS` environment variable can access the admin panel.

#### Adding Admin Users

**Step 1:** Open the `.env` file in your project root

**Step 2:** Find the ADMIN_EMAILS line:
```
ADMIN_EMAILS=John.vujicic68@gmail.com,timnye2020@gmail.com
```

**Step 3:** Add new email with comma separator:
```
ADMIN_EMAILS=John.vujicic68@gmail.com,timnye2020@gmail.com,newadmin@example.com
```

**Step 4:** Save the file

**Step 5:** Restart the admin server:
```
npm run start-server
```

**⚠️ Important Security Notes:**
- Email matching is case-insensitive
- No spaces around emails or commas
- Only add trusted individuals
- Never commit `.env` file to git

### Credential Security

#### 🔐 Files to NEVER Share or Commit:
- `.env` - Environment variables including admin emails
- `service-account-key.json` - Google Sheets API credentials
- `firebase-admin-key.json` - Firebase Admin SDK credentials
- `client_secret_*.json` - Google OAuth credentials

#### ✅ Best Practices:
- Store credential files securely (password manager or encrypted storage)
- Create backups of credential files in secure location
- Rotate secrets quarterly or after team member departures
- Use environment variables instead of hardcoding credentials
- Limit access to production credentials to essential personnel only

#### 🔄 Rotating Credentials:
If credentials are compromised:
1. Generate new service account key in Google Cloud Console
2. Generate new Firebase Admin key in Firebase Console
3. Update `.env` with new credentials
4. Restart all services (admin server, auto-sync worker)
5. Delete old credentials from Google/Firebase consoles

---

## Analytics & Monitoring

### Order Analytics (Firebase Console)

Track order metrics through the Firebase Console:

- **Total Orders:** Firestore Database → orders collection → Document count
- **Orders by Menu Type:** Filter by `menuType == "beachDrinks"` or `menuType == "roomService"`
- **Orders by Status:** Filter by `status == "new"`, `"confirmed"`, or `"delivered"`
- **Orders by Date Range:** Filter by `timestamp >= [date]` and `timestamp <= [date]`

### System Health Monitoring

#### 📊 Firebase Usage Limits
Free Spark Plan limits:
- **Firestore Reads:** 50,000 per day
- **Firestore Writes:** 20,000 per day
- **Firestore Deletes:** 20,000 per day
- **Storage:** 1 GB total

Check usage: Firebase Console → Usage tab

#### 🌐 Vercel Deployment Status
Monitor at: Vercel Dashboard → Your Project
- Recent deployments list
- Build logs for each deployment
- Deployment duration
- Error notifications

#### 📡 Google Sheets API Quota
Limits (per project):
- **Read requests:** 100 per 100 seconds per user
- **Write requests:** 100 per 100 seconds per user

Check: Google Cloud Console → APIs & Services → Quotas

### Error Monitoring

#### Browser Console Errors
To check for JavaScript errors on live site:
1. Open spbgazebo.com
2. Press F12 (opens Developer Tools)
3. Click "Console" tab
4. Look for red error messages
5. Screenshot and report to IT if found

#### Server Logs
Admin server logs (terminal running `npm run start-server`):
- Shows all publish/deploy actions
- Records who performed each action
- Displays error messages
- Helpful for troubleshooting

**💡 Recommended Monitoring Schedule:**
- **Daily:** Check admin panel for pending changes to publish
- **Daily:** Verify auto-sync worker is running (check Last Sync timestamp)
- **Weekly:** Review Firebase usage to ensure within limits
- **Weekly:** Test guest ordering flow end-to-end
- **Monthly:** Review and clean up old backups
- **Monthly:** Review and clean up old order data in Firestore

---

## Troubleshooting Common Issues

### 🚫 Cannot access admin panel (Access Denied)

**Solutions:**
1. Check `.env` file for ADMIN_EMAILS
2. Add your email if missing
3. Restart server: `npm run start-server`
4. Sign out of admin panel and sign in again
5. Try in incognito/private browser window

### ⏰ "Last Sync" timestamp is old (not updating)

**Diagnosis:** Auto-sync worker is not running

**Solutions:**
1. Start the auto-sync worker: `npm run auto-sync`
2. If using PM2, restart: `pm2 restart menu-auto-sync`
3. Check terminal for error messages
4. Verify Google Sheets credentials are valid
5. Try manual sync: `node scripts/googleSheetsSync.js`

### 📋 Preview menu not found (error message)

**Solutions:**
1. Run manual sync to recreate: `node scripts/googleSheetsSync.js`
2. Check that `data/sample_menu.preview.json` exists
3. Verify Google Sheet ID in `.env` is correct
4. Check service account has access to Google Sheet

### 🚀 Deployment fails (git errors)

**Solutions:**
1. Ensure you're in a git repository: `git status`
2. Configure git credentials if needed
3. Pull latest changes: `git pull`
4. Try manual deployment
5. Check git remote: `git remote -v`

### 🌐 Changes deployed but not showing on live site

**Solutions:**
1. Hard refresh browser: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
2. Try incognito/private browsing window
3. Check Vercel dashboard for deployment status
4. Wait 2-3 minutes and try again
5. Check Vercel build logs for errors

### ❌ Menu items showing as "undefined" or missing prices

**Solutions:**
1. Open Google Sheet and check for:
   - Empty cells in required columns
   - Incorrect Type values (must be "beachdrinks" or "roomservice")
   - Invalid Price values (must be numbers only)
   - Invalid Available values (must be TRUE or FALSE)
2. Fix the errors in Google Sheet
3. Wait for auto-sync or run manual sync
4. Publish and deploy corrected menu

### 🔑 "Invalid credentials" or API errors

**Solutions:**
1. Verify credential files exist:
   - `service-account-key.json`
   - `firebase-admin-key.json`
2. Check `.env` paths point to correct files
3. Generate new service account keys if needed
4. Verify APIs are enabled in Google Cloud Console
5. Check service account permissions

### 💻 Admin server won't start

**Solutions:**
1. Kill process on port 3000: `lsof -ti:3000 | xargs kill`
2. Install dependencies: `npm install`
3. Verify `.env` file exists and is complete
4. Check Node.js version (requires Node 14+)
5. Review terminal error message for specific issue

**🆘 When to Seek Technical Support:**
- Persistent errors after trying all solutions
- Data corruption or loss
- Security concerns or unauthorized access
- Firebase quota exceeded
- Need to rotate credentials after breach
- Major configuration changes required

---

## Admin Support & Resources

### 📚 Technical Documentation
- ADMIN_PANEL_GUIDE.md
- GOOGLE_SHEETS_SETUP.md
- PROJECT_PROGRESS.md
- IMPLEMENTATION_NOTES.md

### 🔗 External Resources
- Firebase Console: https://console.firebase.google.com/
- Google Cloud Console: https://console.cloud.google.com/
- Vercel Dashboard: https://vercel.com/dashboard
- GitHub Repository: (your repository URL)

---

**Thank you for managing the St. Peter's Bay ordering system!**

---

*© 2025 St. Peter's Bay Food Ordering System - Version 5.0*
*Owner/Admin Manual*