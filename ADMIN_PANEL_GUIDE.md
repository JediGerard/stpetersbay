# Admin Panel Usage Guide

**St. Peter's Bay Food Ordering System - Menu Management Admin Panel**

Version 5.0 - Phase 4 Complete

---

## Overview

The Admin Panel is a web-based interface for managing menu updates from Google Sheets to your live ordering system. It provides:

- **Google OAuth authentication** (whitelisted admins only)
- **Real-time menu comparison** (staging vs production)
- **One-click menu publishing** (with automatic backups)
- **Automated deployment** to live site via Vercel
- **Activity history** and audit logs

---

## Getting Started

### 1. Start the Admin Server

```bash
npm run start-server
```

The server will start on http://localhost:3000

### 2. Access the Admin Panel

Open your browser and navigate to:

```
http://localhost:3000/admin.html
```

### 3. Sign In with Google

Click the "Sign in with Google" button and authenticate with one of the whitelisted admin emails:

- John.vujicic68@gmail.com
- timnye2020@gmail.com
- Jimmymarshall432@gmail.com

**Note**: Only whitelisted emails can access the admin panel. If your email is not in the list, contact the system administrator.

---

## Using the Admin Dashboard

### Dashboard Overview

Once authenticated, you'll see:

1. **Menu Status Cards**
   - Production Items: Total items currently live
   - Preview Items: Total items in staging (from Google Sheets)
   - Last Sync: When Google Sheets was last synced
   - Last Publish: When menu was last published to production

2. **Change Indicator**
   - Yellow warning appears if preview differs from production
   - Indicates unpublished changes are waiting

3. **Action Buttons**
   - Step 1: Publish Menu (JSON update)
   - Step 2: Deploy to Live Site (git push + Vercel deploy)

4. **Menu Comparison**
   - Side-by-side view of staging vs production
   - Shows item counts by category
   - View full JSON option

5. **Recent Activity**
   - History of last 10 menu publications
   - Backup files with timestamps

---

## Publishing Workflow

### Step 1: Edit Menu in Google Sheets

1. Open the master Google Sheet: [Menu Sheet](https://docs.google.com/spreadsheets/d/1mXk0Wab86mlnptJ8yTebDNvdttTs_DOLfPqVZExx4m0)
2. Edit items, prices, categories, etc.
3. Save changes (auto-sync will detect changes within 5 minutes)

**Note**: You can manually sync by running: `node scripts/googleSheetsSync.js`

### Step 2: Review Changes in Admin Panel

1. Open admin panel: http://localhost:3000/admin.html
2. Check "Last Sync" timestamp (should be recent)
3. Look for yellow "Unpublished Changes" warning
4. Review "Menu Comparison" section
5. Click "View Full JSON" to see detailed changes

### Step 3: Publish Menu

1. Click **"Publish Menu"** button
2. Confirm the action in the popup
3. Wait for success message: "✅ Menu published successfully!"
4. A timestamped backup is automatically created in `data/backups/`

**What happens:**
- Creates backup: `data/backups/sample_menu_YYYY-MM-DDTHH-MM-SS.json`
- Copies preview to production: `data/sample_menu.preview.json` → `data/sample_menu.json`
- Logs action with admin email and timestamp

### Step 4: Deploy to Live Site

1. Click **"Deploy to Live Site"** button (now enabled)
2. Confirm the action in the popup
3. Watch the real-time deployment log
4. Wait for success message: "✅ Deployment complete!"

**What happens:**
- Commits `data/sample_menu.json` to git
- Pushes to remote repository (main branch)
- Vercel automatically detects push and deploys
- Live site updates within ~30-60 seconds

---

## Auto-Sync Worker

For automatic Google Sheets monitoring, run the auto-sync worker in the background:

```bash
npm run auto-sync
```

**Features:**
- Polls Google Sheets every 5 minutes
- Only syncs when Sheet's lastModifiedTime changes
- Efficient (minimal API calls)
- Logs all sync activity

**To stop:**
- Press `Ctrl+C` if running in terminal
- Or: `pm2 stop menu-auto-sync` if using PM2

---

## API Endpoints

The admin server exposes these endpoints:

### Authentication
- `POST /api/verify-auth` - Verify Google OAuth token

### Menu Management
- `GET /api/stats` - Get menu statistics
- `GET /api/menu/preview` - Get staging menu JSON
- `GET /api/menu/production` - Get production menu JSON
- `POST /api/publish` - Publish staging to production (requires auth)
- `POST /api/deploy` - Deploy to live site (requires auth)

### Utility
- `GET /api/history` - Get publish history
- `GET /api/health` - Health check

---

## Security

### Authentication
- Google OAuth 2.0 with email whitelist
- Tokens verified server-side
- Unauthorized users see "Access Denied"

### Authorization
- Only whitelisted admins can publish/deploy
- All admin actions require valid OAuth token
- Tokens expire after 1 hour (Google default)

### Audit Logging
- All publish/deploy actions are logged
- Logs include: timestamp, admin email, action, result
- Backups created before every publish

### Whitelist Management

To add/remove admin emails, edit `.env`:

```bash
ADMIN_EMAILS=email1@gmail.com,email2@gmail.com,email3@gmail.com
```

Restart server after changing `.env`.

---

## Troubleshooting

### Cannot Sign In

**Problem:** Google Sign-In button doesn't work or shows error

**Solutions:**
1. Check that Google Client ID matches in `.env` and `admin.html`
2. Verify OAuth redirect URI includes http://localhost:3000
3. Try clearing browser cookies and cache
4. Check browser console for errors

### Access Denied

**Problem:** "Access denied" message after signing in

**Solution:**
1. Verify your email is in `.env` under `ADMIN_EMAILS`
2. Check email is lowercase (case-sensitive comparison)
3. Restart server after changing `.env`

### Preview Menu Not Found

**Problem:** Admin panel shows "Preview menu not found"

**Solution:**
1. Run manual sync: `node scripts/googleSheetsSync.js`
2. Check that Google Sheet ID is correct in `.env`
3. Verify service account has access to Google Sheet
4. Check that `data/sample_menu.preview.json` exists

### Deployment Failed

**Problem:** "Deploy to Live Site" fails or shows errors

**Solutions:**
1. Check git status: `git status`
2. Verify you're on main branch: `git branch`
3. Ensure you have push access to remote repo
4. Check Vercel deployment logs at vercel.com/dashboard
5. Verify Vercel project is connected to git repo

### Server Won't Start

**Problem:** `npm run start-server` fails

**Solutions:**
1. Check port 3000 is not in use: `lsof -i :3000`
2. Verify all dependencies installed: `npm install`
3. Check `.env` file exists and has all required variables
4. Review server logs for specific error messages

---

## Production Deployment

### Option 1: Local Server (Current)

Run the admin server on a local machine or VPS:

```bash
npm run start-server
```

Access from local network only (security).

### Option 2: Firebase Cloud Functions (Recommended for Production)

Deploy admin API as Firebase Cloud Functions:

1. Create `functions/` directory
2. Move `server.js` logic to Cloud Functions
3. Deploy: `firebase deploy --only functions`
4. Update `admin.html` API_BASE_URL to Functions URL

### Option 3: Vercel Serverless Functions

Deploy admin API as Vercel serverless functions:

1. Create `api/` directory
2. Convert Express routes to Vercel functions
3. Deploy: `vercel deploy`
4. Update `admin.html` API_BASE_URL

---

## Best Practices

### Menu Updates

1. **Always review changes** in admin panel before publishing
2. **Test thoroughly** after deployment (order a few items)
3. **Keep backups** (don't delete `data/backups/` directory)
4. **Communicate updates** to staff before deploying

### Safety

1. **Never commit `.env`** or `service-account-key.json` to git
2. **Rotate OAuth secrets** quarterly
3. **Review admin whitelist** regularly
4. **Monitor auto-sync logs** for errors
5. **Test restore from backup** periodically

### Performance

1. **Run auto-sync worker** in background (PM2 recommended)
2. **Keep Google Sheet organized** (clean up old rows)
3. **Monitor API usage** (Google Cloud Console)
4. **Optimize images** (use pngquant or similar)

---

## Support

For issues or questions:

1. Check this guide first
2. Review `IMPLEMENTATION_NOTES.md` for technical details
3. Check `GOOGLE_SHEETS_SETUP.md` for Google Cloud setup
4. Contact system administrator

---

## File Structure

```
admin.html                     # Admin panel UI
scripts/admin_logic.js         # Admin panel frontend logic
server.js                      # Express API server
.env                           # Environment variables (secrets)
service-account-key.json       # Google Service Account key
data/
  ├── sample_menu.json         # Production menu (live)
  ├── sample_menu.preview.json # Staging menu (from Google Sheets)
  └── backups/                 # Timestamped backups
scripts/
  ├── googleSheetsSync.js      # Google Sheets sync logic
  ├── autoSync.js              # Background worker
  └── publishMenu.js           # Publish script
```

---

## Change Log

### Version 5.0 (Phase 4 - Current)
- ✅ Admin web interface with Google OAuth
- ✅ Real-time menu comparison
- ✅ One-click publish and deploy
- ✅ Activity history and logging
- ✅ Auto-sync worker integration

### Version 4.5 (Phase 3)
- ✅ Google Sheets integration
- ✅ CLI-based sync and publish
- ✅ Automatic backups

### Version 4.0 (Phase 2)
- ✅ Dependencies and configuration
- ✅ Environment variables setup

### Version 3.0 (Phase 1)
- ✅ Google Cloud Project setup
- ✅ OAuth and Service Account credentials

---

**Last Updated:** 2025-11-13
**Phase:** 4 Complete
**Status:** Production Ready
