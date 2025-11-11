/**
 * Export current menu JSON to CSV format for Google Sheets import
 *
 * Usage: node scripts/exportSheetCSV.js
 * Output: data/menu_import.csv
 *
 * This script converts sample_menu.json to a CSV file that can be imported
 * into Google Sheets to populate your master menu sheet.
 */

const fs = require('fs');
const path = require('path');

const MENU_FILE = path.join(__dirname, '../data/sample_menu.json');
const OUTPUT_FILE = path.join(__dirname, '../data/menu_import.csv');

// CSV header row (must match Google Sheet structure exactly)
const CSV_HEADER = 'Type,Category,Item Name,Price,Available,Modifiers (comma-separated),Image Path';

/**
 * Escape CSV values (handle commas, quotes, newlines)
 */
function escapeCSV(value) {
  if (value === null || value === undefined) {
    return '';
  }

  const str = String(value);

  // If contains comma, quote, or newline - wrap in quotes and escape internal quotes
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }

  return str;
}

/**
 * Convert menu item object to CSV row
 */
function itemToCSVRow(item) {
  const type = item.type || '';
  const category = item.category || '';
  const itemName = item.itemName || '';
  const price = item.price || 0;
  const available = item.available ? 'TRUE' : 'FALSE';

  // Join modifiers with semicolon (safer than comma for CSV)
  // Google Sheets users can see the full list; sync script will handle parsing
  const modifiers = Array.isArray(item.modifiers)
    ? item.modifiers.join('; ')
    : '';

  const imagePath = item.image || 'images/placeholder.png';

  // Build CSV row with proper escaping
  const row = [
    escapeCSV(type),
    escapeCSV(category),
    escapeCSV(itemName),
    escapeCSV(price),
    escapeCSV(available),
    escapeCSV(modifiers),
    escapeCSV(imagePath)
  ].join(',');

  return row;
}

/**
 * Main export function
 */
function exportMenuToCSV() {
  console.log('Starting menu export to CSV...\n');

  // 1. Read menu JSON
  if (!fs.existsSync(MENU_FILE)) {
    console.error(`Error: Menu file not found at ${MENU_FILE}`);
    process.exit(1);
  }

  const menuData = JSON.parse(fs.readFileSync(MENU_FILE, 'utf8'));

  // 2. Collect all items from both menu types
  const allItems = [];

  if (menuData.beachDrinks && Array.isArray(menuData.beachDrinks)) {
    allItems.push(...menuData.beachDrinks);
    console.log(`Found ${menuData.beachDrinks.length} beach drinks items`);
  }

  if (menuData.roomService && Array.isArray(menuData.roomService)) {
    allItems.push(...menuData.roomService);
    console.log(`Found ${menuData.roomService.length} room service items`);
  }

  if (allItems.length === 0) {
    console.error('Error: No menu items found in JSON file');
    process.exit(1);
  }

  console.log(`\nTotal items to export: ${allItems.length}\n`);

  // 3. Convert to CSV rows
  const csvRows = [CSV_HEADER];

  allItems.forEach((item, index) => {
    try {
      const row = itemToCSVRow(item);
      csvRows.push(row);
    } catch (error) {
      console.warn(`Warning: Failed to convert item ${index + 1}: ${error.message}`);
    }
  });

  // 4. Write CSV file
  const csvContent = csvRows.join('\n');
  fs.writeFileSync(OUTPUT_FILE, csvContent, 'utf8');

  console.log(`✅ Export complete!`);
  console.log(`📄 Output file: ${OUTPUT_FILE}`);
  console.log(`📊 Rows exported: ${csvRows.length - 1} (plus header row)`);
  console.log(`\nNext steps:`);
  console.log(`1. Open your Google Sheet: SPB Menu Master`);
  console.log(`2. File → Import → Upload`);
  console.log(`3. Select: ${OUTPUT_FILE}`);
  console.log(`4. Import location: "Replace current sheet" or "Append to current sheet"`);
  console.log(`5. Separator type: Comma`);
  console.log(`6. Click "Import data"`);
  console.log(`\nNote: Modifiers are separated by semicolons (;) for readability.`);
  console.log(`The sync script will handle converting them back to arrays.`);
}

// Run export
try {
  exportMenuToCSV();
} catch (error) {
  console.error('Fatal error during export:');
  console.error(error);
  process.exit(1);
}
