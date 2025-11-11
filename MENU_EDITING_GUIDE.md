# Menu Editing Guide for Staff

This guide explains how to easily edit the restaurant menu using Excel.

## Quick Start

### Step 1: Export Menu to Excel
Run this command in Terminal:
```bash
npm run export-menu
```

This creates a file called `menu_editor.xlsx` in the `data` folder.

### Step 2: Edit the Excel File
1. Open `data/menu_editor.xlsx` in Excel or any spreadsheet program
2. Make your changes (see details below)
3. Save the file

### Step 3: Import Changes Back
Run this command in Terminal:
```bash
npm run import-menu
```

Your changes are now live!

## Excel File Structure

The Excel file has these columns:

| Column | Description | Example |
|--------|-------------|---------|
| **Type** | Must be either `beachdrinks` or `roomservice` | beachdrinks |
| **Category** | Group items belong to | Rum, Beer, Cocktails, Salads |
| **Item Name** | Name of the menu item | Malibu, Caesar Salad |
| **Price** | Price as a number (no dollar sign) | 18, 24.50 |
| **Available** | TRUE or FALSE | TRUE |
| **Modifiers** | Options for the item, separated by commas | With Coke, With Lime, Extra Ice |
| **Image Path** | Path to the item's image | images/placeholder.png |

## How to Make Changes

### Edit an Existing Item
1. Find the row with the item you want to edit
2. Change any values in the columns
3. Save the file
4. Run `npm run import-menu`

### Add a New Item
1. Go to the bottom of the spreadsheet
2. Add a new row with all columns filled in
3. Make sure Type is either `beachdrinks` or `roomservice`
4. Save the file
5. Run `npm run import-menu`

### Delete an Item
1. Find the row with the item to delete
2. Delete the entire row
3. Save the file
4. Run `npm run import-menu`

### Mark Item as Unavailable
1. Find the item's row
2. Change the Available column to `FALSE`
3. Save and run `npm run import-menu`

### Change a Price
1. Find the item's row
2. Update the Price column (just the number, no $ symbol)
3. Save and run `npm run import-menu`

### Add or Edit Modifiers
1. Find the item's row
2. In the Modifiers column, list options separated by commas
   - Example: `With Ice, No Ice, Extra Ice, With Lime`
3. Save and run `npm run import-menu`

## Important Rules

1. **DO NOT** change the header row (first row)
2. **DO NOT** delete columns
3. Type must be exactly `beachdrinks` or `roomservice` (lowercase)
4. Available must be exactly `TRUE` or `FALSE` (uppercase)
5. Price must be a number (decimals are OK)
6. Modifiers must be separated by commas
7. Always save the Excel file before running import

## Safety Features

- Every time you import, a backup is created automatically
- The backup is saved as `sample_menu.backup.json`
- If something goes wrong, you can restore from the backup

## Troubleshooting

**Problem:** "Excel file not found" error
**Solution:** Run `npm run export-menu` first

**Problem:** Changes aren't showing up
**Solution:** Make sure you saved the Excel file before importing

**Problem:** Getting warnings about missing fields
**Solution:** Make sure every row has Type, Category, and Item Name filled in

**Problem:** Item disappeared after import
**Solution:** Check the row has valid Type (beachdrinks or roomservice)

## Example Workflow

Let's say you want to:
- Raise the price of Malibu from $18 to $20
- Mark Heineken as unavailable
- Add a new cocktail called "Bahama Mama"

**Step 1:** Export menu
```bash
npm run export-menu
```

**Step 2:** Open `data/menu_editor.xlsx`

**Step 3:** Make changes:
- Find "Malibu" row, change Price from 18 to 20
- Find "Heineken" row, change Available from TRUE to FALSE
- Add new row at bottom:
  - Type: beachdrinks
  - Category: Cocktails
  - Item Name: Bahama Mama
  - Price: 26
  - Available: TRUE
  - Modifiers: Frozen, On the Rocks, Extra Rum
  - Image Path: images/placeholder.png

**Step 4:** Save the Excel file

**Step 5:** Import changes
```bash
npm run import-menu
```

Done! Your menu is updated.

## Need Help?

If you encounter any issues or have questions, contact your technical administrator.
