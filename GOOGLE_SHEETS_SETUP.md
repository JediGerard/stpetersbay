# Google Sheets Setup Guide

**Project**: St. Peter's Bay Food Ordering System - Menu Management Migration
**Phase**: Phase 1 - Google Cloud Setup
**Estimated Time**: 2-3 hours

---

## Overview

This guide walks you through setting up Google Cloud Project, APIs, credentials, and the master Google Sheet for menu management. After completing this guide, your staff will be able to edit the menu in Google Sheets and changes will automatically sync to your live ordering system.

---

## Prerequisites

- Google account with admin privileges
- Access to your current menu data (`data/sample_menu.json`)
- Credit card for Google Cloud (required for account creation, but you'll stay in free tier)

---

## Step 1: Create Google Cloud Project (15 minutes)

### 1.1 Access Google Cloud Console

1. Go to https://console.cloud.google.com/
2. Sign in with your Google account
3. If this is your first time, you'll see a welcome screen - click "Select a project" at the top

### 1.2 Create New Project

1. Click "New Project" button (top right)
2. Fill in project details:
   - **Project name**: `st-peters-bay-menu-system`
   - **Organization**: Leave as default (or select your organization if you have one)
   - **Location**: Leave as default
3. Click "Create"
4. Wait for project creation (15-30 seconds)
5. Select your new project from the dropdown at the top

### 1.3 Note Your Project ID

- At the top of the page, you'll see your project name and ID
- **Project ID format**: `st-peters-bay-menu-system-######`
- Write this down - you'll need it later

**Checkpoint**: You should now see the Google Cloud Console dashboard for your new project.

---

## Step 2: Enable Required APIs (10 minutes)

### 2.1 Enable Google Sheets API

1. In the Cloud Console, open the navigation menu (☰ top left)
2. Go to **APIs & Services** → **Library**
3. In the search box, type: `Google Sheets API`
4. Click on "Google Sheets API" from results
5. Click the blue "Enable" button
6. Wait for confirmation (10-20 seconds)

**Checkpoint**: You should see "API enabled" with a green checkmark.

### 2.2 Enable Google Drive API

1. Click "Library" in the left sidebar (or back button → Library)
2. In the search box, type: `Google Drive API`
3. Click on "Google Drive API" from results
4. Click the blue "Enable" button
5. Wait for confirmation

**Checkpoint**: Both APIs should now show as "Enabled" under **APIs & Services** → **Enabled APIs & services**.

---

## Step 3: Create OAuth 2.0 Credentials (20 minutes)

OAuth credentials allow your admin users to sign in via Google.

### 3.1 Configure OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. Select **External** (unless you have a Google Workspace organization)
3. Click "Create"

**Fill in App Information**:
- **App name**: `SPB Menu Admin`
- **User support email**: Your email address
- **App logo**: (Optional - skip for now)
- **Application home page**: Leave blank for now (or use your website)
- **Authorized domains**: Enter your domain (e.g., `stpetersbayvillas.com`)
- **Developer contact email**: Your email address

4. Click "Save and Continue"

**Scopes**:
5. Click "Add or Remove Scopes"
6. Filter for and select:
   - `userinfo.email`
   - `userinfo.profile`
   - `openid`
7. Click "Update" → "Save and Continue"

**Test Users** (Important!):
8. Click "Add Users"
9. Enter email addresses of authorized admin users (comma-separated):
   - Your email
   - Any other staff who should access admin panel
10. Click "Add" → "Save and Continue"

**Summary**:
11. Review your settings
12. Click "Back to Dashboard"

### 3.2 Create OAuth Client ID

1. Go to **APIs & Services** → **Credentials**
2. Click "+ Create Credentials" → "OAuth client ID"
3. If prompted to configure consent screen, you've already done this - continue
4. Select Application type: **Web application**

**Configure Web Application**:
- **Name**: `SPB Menu Admin Web Client`
- **Authorized JavaScript origins**: Add these URIs:
  - `http://localhost:3000`
  - `https://yourdomain.com` (your production domain)
- **Authorized redirect URIs**: Add these URIs:
  - `http://localhost:3000/admin.html`
  - `https://yourdomain.com/admin.html`

5. Click "Create"

### 3.3 Save OAuth Credentials

A popup will show your credentials:
- **Client ID**: Looks like `123456789-abcdefg.apps.googleusercontent.com`
- **Client Secret**: Looks like `GOCSPX-abcdefghijklmnop`

**IMPORTANT**:
- Click "Download JSON" and save as `oauth-credentials.json` (temporary - for your reference)
- Copy these values to a text file - you'll need them for `.env` file later

**Write these down**:
```
GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret_here
```

**Checkpoint**: You should have OAuth Client ID and Secret saved.

---

## Step 4: Create Service Account (15 minutes)

Service Account allows automated scripts to access Google Sheets without user interaction.

### 4.1 Create Service Account

1. Go to **APIs & Services** → **Credentials**
2. Click "+ Create Credentials" → "Service account"
3. Fill in details:
   - **Service account name**: `menu-sync-service`
   - **Service account ID**: Auto-generated (leave as is)
   - **Description**: `Service account for automated menu synchronization`
4. Click "Create and Continue"

**Grant Permissions**:
5. Click "Select a role"
6. Search for and select: **Editor** (or use custom role if you prefer limited access)
7. Click "Continue"
8. Skip "Grant users access" section
9. Click "Done"

### 4.2 Create Service Account Key

1. In the Credentials page, find your new service account under "Service Accounts"
2. Click on the service account email (menu-sync-service@...)
3. Go to the "Keys" tab
4. Click "Add Key" → "Create new key"
5. Select "JSON" format
6. Click "Create"

**IMPORTANT**:
- A JSON file will download automatically
- **Rename this file to**: `service-account-key.json`
- **Move it to your project root**: `/Users/timnyem1mac/Desktop/SPB food ordering/`
- **Never commit this file to git** (it's already in .gitignore)

### 4.3 Note Service Account Email

- Copy the service account email (looks like: `menu-sync-service@st-peters-bay-menu-system-####.iam.gserviceaccount.com`)
- You'll need this when sharing your Google Sheet

**Checkpoint**: You should have `service-account-key.json` in your project root.

---

## Step 5: Create Master Google Sheet (30 minutes)

### 5.1 Create New Google Sheet

1. Go to https://sheets.google.com
2. Click "+ Blank" to create new spreadsheet
3. Rename it: **SPB Menu Master** (click "Untitled spreadsheet" at top)

### 5.2 Set Up Column Headers

In Row 1, create these headers (exact spelling matters):

| A | B | C | D | E | F | G |
|---|---|---|---|---|---|---|
| **Type** | **Category** | **Item Name** | **Price** | **Available** | **Modifiers (comma-separated)** | **Image Path** |

**Format the header row**:
- Select Row 1
- Bold text
- Background color: Light blue or gray
- Freeze row: View → Freeze → 1 row

### 5.3 Add Data Validation

This ensures data integrity when staff edits the menu.

**Column A - Type Validation**:
1. Select column A (starting from A2 - skip header)
2. Click Data → Data validation
3. Add rule:
   - Criteria: **List of items**
   - Items: `beachdrinks,roomservice` (comma-separated)
   - Display: **Dropdown**
   - Invalid data: **Reject input**
   - Appearance: **Show dropdown list in cell**
4. Click "Done"

**Column D - Price Validation**:
1. Select column D (starting from D2)
2. Click Data → Data validation
3. Add rule:
   - Criteria: **Number** → **Greater than** → `0`
   - Invalid data: **Reject input**
   - Appearance: (leave unchecked)
4. Click "Done"

**Column E - Available Validation**:
1. Select column E (starting from E2)
2. Click Data → Data validation
3. Add rule:
   - Criteria: **List of items**
   - Items: `TRUE,FALSE` (comma-separated)
   - Display: **Dropdown**
   - Invalid data: **Reject input**
   - Appearance: **Show dropdown list in cell**
4. Click "Done"

### 5.4 Format Columns

- **Column D (Price)**: Format → Number → Currency → USD
- **All columns**: Auto-resize (double-click column dividers)

**Checkpoint**: Your sheet should have headers, validation rules, and proper formatting.

---

## Step 6: Populate Sheet with Current Menu (30 minutes)

You have two options to populate your sheet with the current 80 menu items:

### Option A: Manual Entry (Recommended for learning the structure)

Use this if you want to understand the data format. Add a few items manually:

**Beach Drinks Example**:
| Type | Category | Item Name | Price | Available | Modifiers | Image Path |
|---|---|---|---|---|---|---|
| beachdrinks | Soft Drinks | Coke | 2.50 | TRUE | Ice, Lemon | images/coke.png |
| beachdrinks | Cocktails | Mojito | 12.00 | TRUE | Extra Rum, No Mint | images/mojito.png |

**Room Service Example**:
| Type | Category | Item Name | Price | Available | Modifiers | Image Path |
|---|---|---|---|---|---|---|
| roomservice | Breakfast | Pancakes | 15.00 | TRUE | Extra Syrup, Add Bacon | images/pancakes.png |
| roomservice | Dinner | Grilled Fish | 28.00 | TRUE | No Vegetables, Extra Sauce | images/fish.png |

### Option B: Import from JSON (Faster for all 80 items)

I'll create a Node script that converts your existing `sample_menu.json` to a CSV you can import:

**Steps**:
1. After completing this setup guide, tell me: "Create menu import script"
2. I'll create `scripts/exportSheetCSV.js` that generates a CSV from your current menu
3. Run: `node scripts/exportSheetCSV.js` → creates `data/menu_import.csv`
4. In Google Sheets: File → Import → Upload → Select `menu_import.csv`
5. Import location: **Replace current sheet**
6. Separator type: **Comma**
7. Click "Import data"

**For now, add at least 5-10 items manually so you can test the system.**

### 6.1 Sample Data to Get Started

Copy this sample data to test (paste into Row 2 onwards):

```
beachdrinks,Soft Drinks,Coke,2.50,TRUE,Ice,images/placeholder.png
beachdrinks,Soft Drinks,Sprite,2.50,TRUE,Ice,images/placeholder.png
beachdrinks,Cocktails,Mojito,12.00,TRUE,Extra Rum,images/placeholder.png
beachdrinks,Beer,Red Stripe,5.00,TRUE,,images/placeholder.png
roomservice,Breakfast,Pancakes,15.00,TRUE,Syrup,images/placeholder.png
roomservice,Lunch,Caesar Salad,14.00,TRUE,No Croutons,images/placeholder.png
roomservice,Dinner,Grilled Fish,28.00,TRUE,Extra Sauce,images/placeholder.png
```

**Checkpoint**: Your sheet should have headers, validation, and sample menu data.

---

## Step 7: Configure Sheet Permissions (10 minutes)

### 7.1 Share with Service Account

1. Click the blue "Share" button (top right of Google Sheet)
2. In "Add people and groups", paste your **Service Account email** (from Step 4.3)
3. Permission level: **Editor**
4. Uncheck "Notify people" (it's a robot, no need to email)
5. Click "Share"

**IMPORTANT**: If you skip this step, the automated sync scripts cannot access your sheet.

### 7.2 Share with Human Editors

1. Click "Share" again
2. Add email addresses of staff who should edit the menu
3. Permission level: **Editor**
4. Click "Send" (they'll receive email invitations)

### 7.3 Get Sheet ID

1. Look at the URL of your Google Sheet
2. It looks like: `https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit`
3. Copy the **SHEET_ID_HERE** part (long alphanumeric string)
4. Example: `1aB2cD3eF4gH5iJ6kL7mN8oP9qR0sT1uV2wX3yZ`

**Write this down**:
```
GOOGLE_SHEET_ID=your_sheet_id_here
```

**Checkpoint**: Service account has Editor access, and you've saved the Sheet ID.

---

## Step 8: Configure Admin Email Whitelist (5 minutes)

Decide which email addresses should have access to the admin panel.

**Write down authorized admin emails** (comma-separated):
```
ADMIN_EMAILS=admin1@gmail.com,admin2@gmail.com,admin3@gmail.com
```

**Rules**:
- Only these emails can access `/admin.html`
- Must be valid Google accounts (Gmail or Workspace)
- Case-insensitive matching
- At least one email required (your own)

**Checkpoint**: You have a list of authorized admin emails.

---

## Step 9: Verify Setup (10 minutes)

### 9.1 Check Files

Verify you have these files in your project root:
- [ ] `service-account-key.json` (downloaded in Step 4.2)
- [ ] OAuth credentials noted down (from Step 3.3)

### 9.2 Check Google Cloud

In https://console.cloud.google.com/, verify:
- [ ] Project created: `st-peters-bay-menu-system`
- [ ] Google Sheets API enabled
- [ ] Google Drive API enabled
- [ ] OAuth 2.0 Client ID created
- [ ] Service Account created with key

### 9.3 Check Google Sheet

In your sheet (https://sheets.google.com), verify:
- [ ] Named "SPB Menu Master"
- [ ] Has 7 columns with correct headers
- [ ] Has data validation on Type, Price, Available columns
- [ ] Has at least 5-10 sample menu items
- [ ] Service account has Editor access
- [ ] Human editors added

### 9.4 Check Notes

You should have written down:
- [ ] `GOOGLE_CLIENT_ID=...`
- [ ] `GOOGLE_CLIENT_SECRET=...`
- [ ] `GOOGLE_SHEET_ID=...`
- [ ] `ADMIN_EMAILS=...`

---

## Step 10: Next Steps

**Congratulations!** You've completed Phase 1: Google Cloud Setup.

### What You've Accomplished

- ✅ Created Google Cloud Project
- ✅ Enabled Google Sheets API and Drive API
- ✅ Created OAuth credentials for admin sign-in
- ✅ Created Service Account for automated access
- ✅ Set up master Google Sheet with proper structure
- ✅ Configured permissions and validation
- ✅ Populated sheet with sample data

### Ready for Phase 2

Now that you have all credentials and the sheet set up, return to Claude Code and say:

```
Phase 1 complete. Continue with Phase 2.
```

I'll then:
1. Install required Node dependencies
2. Create `.env` file with your credentials
3. Set up the backend sync system
4. Create the auto-sync worker
5. Test the connection to your Google Sheet

### Keep These Secure

Store these files/credentials securely:
- `service-account-key.json` - Never share or commit to git
- OAuth Client ID & Secret - Store in password manager
- Google Sheet ID - Can be shared with developers
- Admin emails - Document who has access

---

## Troubleshooting

### Issue: "API not enabled" error

**Solution**: Go back to APIs & Services → Library, search for the API, and click Enable.

### Issue: Service account cannot access sheet

**Solution**:
1. Open Google Sheet
2. Click Share
3. Verify service account email is listed with Editor access
4. Check for typos in service account email

### Issue: OAuth consent screen shows warning

**Solution**: This is normal for "External" apps in testing mode. Only whitelisted test users can sign in. To remove warning, you need to verify your app (complex process) - stick with test mode for now.

### Issue: Can't find Sheet ID

**Solution**:
1. Open your Google Sheet
2. Look at the URL bar
3. Copy the part between `/d/` and `/edit`
4. It's a long string like: `1aB2cD3eF4gH5iJ6kL7mN8oP9qR0sT1uV2wX3yZ`

### Issue: Downloaded wrong key format

**Solution**: When creating service account key, make sure to select **JSON** (not P12).

---

## Reference: File Locations

After Phase 1, you should have:

```
/Users/timnyem1mac/Desktop/SPB food ordering/
├── service-account-key.json          ← Downloaded from Google Cloud
├── GOOGLE_SHEETS_SETUP.md            ← This guide
└── implementation_notes.md           ← Overall project tracking
```

After Phase 2 (next), you'll have:

```
├── .env                               ← Created with your credentials
├── .env.example                       ← Template
└── data/
    └── backups/                       ← Auto-created for menu backups
```

---

## Cost Information

**Everything you set up in Phase 1 is FREE:**
- Google Cloud Project: Free
- Google Sheets API: 36,000 requests/hour free (we use ~12/hour)
- Google Drive API: Same free tier
- OAuth: Free, unlimited
- Service Account: Free
- Google Sheet storage: Free (within 15GB Google Drive quota)

**No credit card charges will occur** as long as you stay within free tier limits (which you will for this use case).

---

## Security Notes

**Service Account Key** (`service-account-key.json`):
- Grants full access to your Google Sheet
- Never share this file
- Never commit to version control (already in `.gitignore`)
- If compromised, revoke it in Google Cloud Console and create a new one

**OAuth Credentials**:
- OAuth Client Secret should be kept confidential
- Store in `.env` file (gitignored)
- Only authorize trusted staff emails

**Google Sheet**:
- Only share with staff who need to edit menu
- Service account needs Editor (not Viewer) access
- Consider using "Protected ranges" in Google Sheets to protect header row

---

**Ready?** Once you've completed all steps above, return to Claude Code and say: **"Phase 1 complete. Continue with Phase 2."**
