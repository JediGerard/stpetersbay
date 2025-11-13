# Staff Operations Manual
## St. Peter's Bay Food Ordering System

---

## Table of Contents
1. [Quick Start Guide](#quick-start-guide)
2. [Initial Setup](#initial-setup)
3. [Using the Dashboard](#using-the-dashboard)
4. [Managing Orders](#managing-orders)
5. [Editing Menu (Google Sheets)](#editing-menu-google-sheets)
6. [Editing Menu (Excel Alternative)](#editing-menu-excel-alternative)
7. [Daily Operations](#daily-operations)
8. [Troubleshooting](#troubleshooting)

---

## Quick Start Guide
**Get up and running in 15 minutes!**

### 1. Access the Dashboard (2 minutes)
- Open **spbgazebo.com/dashboard.html** on any computer or tablet
- Bookmark this page for quick access
- The dashboard displays in real-time - no login needed
- Auto-refreshes every 5 seconds

### 2. Process Your First Order (3 minutes)
- When a new order arrives, it appears with a yellow "New" badge
- Review the order details: items, location, customer name
- Click "Confirm Received" to acknowledge the order
- After delivery, click "Mark Completed"

### 3. Make a Simple Menu Change (10 minutes)
- Open the Google Sheet menu (link provided during setup)
- Find the item you want to change
- Update price, availability, or other details
- Save changes (auto-saves in Google Sheets)
- Wait for admin to publish (changes go live after approval)

**💡 Pro Tip:** Keep the dashboard open on a tablet in the kitchen or bar area so you can see orders as they come in!

---

## Initial Setup
**For new restaurants implementing the system**

**📝 Note:** If your system is already set up, skip to "Using the Dashboard"

### What You Need

#### 🖥️ Hardware & Internet
- One computer or tablet for viewing the dashboard (staff area)
- Reliable Wi-Fi throughout your facility (for guests to access ordering)
- Printer for QR codes (optional but recommended)

#### 📱 Technical Setup (Done by IT/Owner)
- Firebase account for database
- Google Cloud account for menu management
- Domain name or hosting setup
- Google Sheet for menu editing
- Service account credentials

*Your IT administrator or owner will handle these technical details.*

#### 👥 Staff Training
- Plan 30-60 minutes for initial staff training
- All staff who will process orders need dashboard training
- Staff who will edit menus need Google Sheets training
- Print this manual for reference

### Implementation Checklist

- [ ] Complete technical setup (IT/Owner)
- [ ] Populate Google Sheet with initial menu items
- [ ] Publish initial menu through admin panel
- [ ] Test ordering system from guest perspective
- [ ] Test dashboard order reception and management
- [ ] Train staff on dashboard usage
- [ ] Train staff on menu editing
- [ ] Generate and print QR codes for tables/rooms
- [ ] Place QR codes throughout facility
- [ ] Soft launch with test customers
- [ ] Full launch and guest communications

---

## Using the Dashboard

### Accessing the Dashboard

**Dashboard URL:** Open this page in your browser:

**spbgazebo.com/dashboard.html**

*(Replace "spbgazebo.com" with your actual website address)*

**Best Practices:**
- Bookmark the dashboard for quick access
- Keep it open on a dedicated device (tablet or computer)
- Place the device where staff can easily see new orders
- The page auto-refreshes every 5 seconds
- No login required - anyone can view the dashboard

### Dashboard Layout

#### Header Section
- **Title:** "Staff Dashboard" with logo
- **Order Count:** Badge showing total active orders
- **Filter Buttons:** All Orders, New Orders, Confirmed Orders, Beach Drinks, Room Service
- **Clear All Button:** Testing utility (use with caution)

#### Order Cards
Each order is displayed as a card showing:
- **Customer Name** - Who placed the order
- **Service Type** - 🍹 Beach Drinks or 🍽️ Room Service
- **Location** - Room number or beach area
- **Order Time** - When the order was placed
- **Items List** - All ordered items with quantities
- **Modifiers** - Special options (color-coded)
- **Custom Notes** - Per-item instructions
- **Order Notes** - General instructions
- **Total Amount** - Order total
- **Status Badge** - Current order status
- **Action Buttons** - Confirm or complete order

#### Color Coding
- **New (Yellow badge/border)** - Order just received
- **Confirmed (Green badge/border)** - Order confirmed and being prepared
- **Green modifier** - Addition to item (e.g., "With Ice", "Extra Rum")
- **Red modifier** - Removal from item (e.g., "No Ice", "No Onions")

### Filter Options

- **All Orders (Default)** - Shows all active orders (New and Confirmed)
- **New Orders Only** - Shows only orders that haven't been confirmed yet
- **Confirmed Orders Only** - Shows only orders currently being prepared
- **Beach Drinks Only** - Shows only beverage orders
- **Room Service Only** - Shows only food orders

---

## Managing Orders

### Order Workflow

#### Step 1: New Order Arrives
- When a guest submits an order, it appears on the dashboard automatically
- The order has a yellow "New" badge
- The order count in the header increases
- Review all order details carefully

**What to Check:**
- All items and quantities
- Modifiers and special instructions
- Delivery location (room number or beach area)
- Any order-level notes
- Contact the guest if anything is unclear

#### Step 2: Confirm the Order
1. Click the **"Confirm Received"** button on the order card
2. The badge changes from yellow "New" to green "Confirmed"
3. The border color changes from yellow to green
4. A confirmation timestamp is recorded
5. Now begin preparing the order

**💡 Why Confirm Orders?** Confirming lets you track which orders are being worked on vs. which just arrived. It helps prevent duplicate preparation if multiple staff are working.

#### Step 3: Prepare the Order
- Gather all items listed in the order
- Apply all modifiers (e.g., "With Ice", "Extra Rum")
- Follow all custom notes for each item
- Follow any general order notes
- Prepare items according to your restaurant's standards
- Double-check you have everything before delivery

**Reading Modifiers:**
- **Green text:** Add this to the item
- **Red text:** Remove or don't include this

#### Step 4: Deliver the Order
Check the delivery location carefully:

**For Room Service:**
- Check the room number on the order
- Some orders may request beach delivery instead
- Knock and hand-deliver to guest

**For Beach Drinks:**
- Note the beach location (Main Beach Left/Center/Right, Pool Area, Cabanas)
- Bring to the specified area
- Confirm guest's name if needed

#### Step 5: Mark as Completed
1. Return to the dashboard
2. Find the delivered order
3. Click **"Mark Completed"**
4. The order disappears from the dashboard
5. A completion timestamp is recorded

**⚠️ Important:** Only mark orders as completed after successful delivery. If there's an issue, leave it active and communicate with management.

### Handling Special Situations

#### 🔄 Guest Wants to Modify Order
If a guest contacts you to change their order:
- If you haven't started preparing: note the changes manually and proceed
- If already prepared: discuss options with guest
- The dashboard doesn't support editing orders - handle changes manually

#### ❌ Guest Wants to Cancel
If a guest asks to cancel:
- If not yet prepared: mark as completed to remove from dashboard
- If already prepared: discuss with management about policy
- Note the cancellation for billing purposes

#### 🚫 Out of Stock Items
If an ordered item is unavailable:
- Contact the guest immediately (call room or find them)
- Offer an alternative or remove item
- Update the menu to mark item unavailable (see Menu Editing section)
- Adjust total amount for billing if needed

#### ⏰ High Order Volume
During busy times:
- Prioritize orders by time received (oldest first)
- Confirm all new orders to show they're being worked on
- Communicate realistic wait times if guests inquire
- Consider calling in additional staff if needed

---

## Editing Menu (Google Sheets Method)

**✅ Recommended Method:** This is the easiest way to edit your menu. Changes are automatically synced and published by an administrator.

### How It Works

1. **You edit** the Google Sheet menu (your master menu)
2. **Auto-sync** detects changes every 5 minutes
3. **Changes sync** to a staging/preview version
4. **Admin reviews** and publishes to live site
5. **Guests see** updated menu

### Accessing the Google Sheet

Your administrator will provide you with a link to the Google Sheet. Bookmark this link for easy access.

You'll need a Google account with edit permission to make changes.

### Understanding the Columns

#### Type (Required)
What kind of order this belongs to. Must be exactly one of:
- **beachdrinks** - For beverages
- **roomservice** - For food

⚠️ Must be lowercase, no spaces, exactly as shown

#### Category (Required)
How items are grouped on the menu. Examples:
- Beach Drinks: Rum, Beer, Cocktails, Wine, Soft Drinks
- Room Service: Salads, Pasta, Gazebo Specialties

You can create new categories by typing a new name.

#### Item Name (Required)
The display name guests will see. Examples:
- "Piña Colada"
- "Caesar Salad"
- "Gazebo Burger"

#### Price (Required)
The item price as a number only (no $ symbol).
- ✅ Correct: `12.50`
- ❌ Wrong: `$12.50`
- ✅ Correct: `8` or `8.00`

#### Available (Required)
Whether the item can currently be ordered. Must be exactly:
- **TRUE** - Item is available
- **FALSE** - Item is unavailable

⚠️ Must be uppercase: TRUE or FALSE

#### Modifiers (Optional)
Customization options guests can choose. Separate with commas.

Examples:
- `With Ice, Extra Rum, Frozen`
- `No Onions, Extra Cheese, Well Done`
- `Dressing on Side, No Croutons`

Leave blank if item has no modifiers.

#### Image Path (Optional)
Path to item image. Usually managed by IT/admin.
Example: `images/placeholder.png`

Contact admin if you need to add item images.

### Common Menu Editing Tasks

#### Adding a New Item
1. Scroll to the bottom of the sheet
2. Add a new row
3. Fill in all required columns: Type, Category, Item Name, Price, Available
4. Add Modifiers if applicable
5. Leave Image Path blank (or ask admin for image)
6. Save (auto-saves in Google Sheets)

#### Changing a Price
1. Find the item you want to update
2. Click on the Price cell
3. Enter the new price (number only, no $)
4. Press Enter
5. Sheet auto-saves

#### Marking an Item Unavailable
1. Find the item that's out of stock
2. Click on the Available cell
3. Change from TRUE to FALSE (or use dropdown)
4. Press Enter
5. Guests will no longer be able to order this item
6. Remember to change back to TRUE when it's back in stock!

**💡 Best Practice:** At the start of each day, review the Available column and mark FALSE for any items you're out of. Update to TRUE as items become available.

#### Deleting an Item
1. Find the item to remove
2. Right-click on the row number
3. Select "Delete row"
4. Confirm deletion

**⚠️ Caution:** Deleted items cannot be recovered. If you just want to temporarily remove an item, set Available to FALSE instead of deleting.

#### Updating Modifiers
1. Find the item
2. Click on the Modifiers cell
3. Edit the comma-separated list
4. Press Enter to save

Examples:
- Add an option: `With Ice, Extra Rum, Frozen`
- Remove an option: Delete that word and its comma
- Rename an option: Change the text

### Important Rules & Tips

#### ❌ Common Mistakes to Avoid:
- Typing "beach drinks" instead of "beachdrinks" (no space!)
- Putting $ in the price field
- Typing "true" instead of "TRUE" (must be uppercase)
- Adding extra spaces before or after values
- Deleting the header row

#### ✅ Best Practices:
- Make small changes and test rather than many changes at once
- Keep item names clear and concise
- Use consistent category names (don't mix "Beer" and "Beers")
- Review your changes before asking admin to publish
- Communicate menu changes to staff before they go live

#### ⏰ Publishing Timeline:
- Changes save immediately in Google Sheets
- Auto-sync detects changes within 5 minutes
- Changes sync to staging/preview
- Admin must review and publish to make live
- Total time: 10-30 minutes from edit to live

---

## Editing Menu (Excel Method - Alternative)

**⚠️ Alternative Method:** This method is less common and requires command-line access. Most restaurants use the Google Sheets method instead.

### When to Use This Method

- Your restaurant doesn't use Google Sheets integration
- You prefer working in Microsoft Excel
- You have access to the server/computer running the system
- Your IT person sets this up for you

### Excel Method Workflow

1. **Export current menu to Excel**
   - Command: `npm run export-menu`
   - This creates a file: `data/menu_editor.xlsx`

2. **Open and edit the Excel file**
   - Use Microsoft Excel, Google Sheets, or any spreadsheet software
   - Column structure is identical to Google Sheets method

3. **Save the Excel file**
   - Save as `menu_editor.xlsx` in the `data/` folder

4. **Import changes back to system**
   - Command: `npm run import-menu`
   - This validates and publishes changes immediately

5. **Changes are live immediately**
   - No admin approval needed - goes straight to production

**⚠️ Important Differences from Google Sheets Method:**
- **No staging/preview:** Changes go live immediately
- **No automatic backups:** Make your own backup copies
- **No admin review:** You're responsible for accuracy
- **Requires server access:** Can't do it remotely
- **Manual process:** More steps than Google Sheets

### Viewing Current Menu (Command Line)

You can view the current live menu in a formatted way:

```
npm run view-menu
```

This displays the menu in your terminal with all items, prices, and availability.

---

## Daily Operations Checklist

### 🌅 Opening Procedures (Morning)

- [ ] Open dashboard on staff device
- [ ] Check internet connection is working
- [ ] Test place an order from guest perspective
- [ ] Verify test order appears on dashboard
- [ ] Mark test order as completed
- [ ] Review menu - mark unavailable items as FALSE in Google Sheet
- [ ] Update any prices that changed
- [ ] Brief staff on any menu changes or specials
- [ ] Ensure QR codes are visible and accessible

### ⏰ During Service Hours

- [ ] Monitor dashboard continuously for new orders
- [ ] Confirm new orders within 2-3 minutes
- [ ] Prepare and deliver orders promptly
- [ ] Mark orders completed after delivery
- [ ] Update menu if items run out (set Available to FALSE)
- [ ] Keep dashboard device charged and accessible

### 🌙 Closing Procedures (Evening)

- [ ] Complete all pending orders
- [ ] Verify dashboard shows zero active orders
- [ ] Note which items ran out today for tomorrow's prep
- [ ] Report any technical issues to management
- [ ] Leave dashboard open for any late orders (if applicable)

### 💡 Pro Tips for Smooth Operations:
- Assign one person to monitor dashboard during busy times
- Use the filter buttons to separate Beach Drinks from Room Service
- Communicate with kitchen/bar staff about order volume
- Update menu availability in real-time to prevent disappointment
- Keep a notepad near dashboard for special notes/issues

---

## Troubleshooting Common Issues

### 🚫 Dashboard shows no orders but guest says they ordered

**Possible causes:**
- Dashboard needs refreshing - press F5 or pull to refresh
- Internet connection issue - check Wi-Fi
- Guest's order didn't submit - ask them to check for confirmation
- Filter is hiding the order - click "All Orders"

**Solution:** Refresh dashboard, check all filters, verify internet. If still not showing, take order manually.

### 📱 Guest says ordering page won't load

**Troubleshooting steps:**
1. Check their Wi-Fi connection
2. Try opening in a different browser
3. Clear browser cache/cookies
4. Try on a different device
5. If all fails, take order manually and report to IT

### 💰 Prices showing incorrectly on menu

**Solution:**
1. Check Google Sheet for correct prices
2. Edit prices in sheet if needed
3. Wait for auto-sync (5 minutes)
4. Ask admin to publish changes
5. Verify prices updated on live site

### ❌ Item showing as available but it's out of stock

**Immediate fix:**
1. Open Google Sheet
2. Find the item
3. Change Available to FALSE
4. Ask admin to publish immediately
5. Meanwhile, contact any guests who ordered it

### 🔄 Dashboard keeps refreshing or acting strange

**Try these fixes:**
- Close and reopen the browser
- Clear browser cache
- Try a different browser (Chrome, Firefox, Safari)
- Restart the device
- Check for browser updates
- Contact IT if problem persists

### 📝 Order has confusing or contradictory instructions

**Best practice:** Call the guest (room number) or find them (beach location) to clarify. It's better to ask than to prepare it wrong!

### 🌐 Entire website is down

**Emergency procedure:**
1. Contact IT/management immediately
2. Switch to manual order taking temporarily
3. Put up signs notifying guests of the issue
4. Provide alternative contact method (phone, in-person)

### 🔐 Can't access Google Sheet menu

**Solutions:**
- Make sure you're signed into the correct Google account
- Check with admin that you have edit permission
- Request access if you see "Request Access" button
- Contact admin to add your email to the sheet

---

## Need Additional Support?

### 🛠️ Technical Issues
- Website problems
- Dashboard errors
- Menu sync issues
- Access permissions

### 📚 Training & Questions
- Additional staff training
- Process clarifications
- New feature requests
- Feedback and suggestions

**Contact your system administrator or management for assistance.**

---

**Thank you for providing excellent service!**

---

*© 2025 St. Peter's Bay Food Ordering System - Version 5.0*
*Staff Operations Manual*