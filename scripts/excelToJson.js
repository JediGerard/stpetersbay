#!/usr/bin/env node

/**
 * Excel to JSON Converter
 * Converts staff-edited Excel spreadsheet back to menu JSON
 */

const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// File paths
const EXCEL_FILE = path.join(__dirname, '../data/menu_editor.xlsx');
const JSON_FILE = path.join(__dirname, '../data/sample_menu.json');
const BACKUP_FILE = path.join(__dirname, '../data/sample_menu.backup.json');

console.log('Converting Excel to JSON...\n');

// Check if Excel file exists
if (!fs.existsSync(EXCEL_FILE)) {
  console.error('❌ Error: Excel file not found!');
  console.error(`   Expected location: ${EXCEL_FILE}`);
  console.error('   Please run: npm run export-menu first\n');
  process.exit(1);
}

// Create backup of current JSON
if (fs.existsSync(JSON_FILE)) {
  fs.copyFileSync(JSON_FILE, BACKUP_FILE);
  console.log(`✓ Backup created: ${BACKUP_FILE}`);
}

// Read Excel file
const workbook = XLSX.readFile(EXCEL_FILE);
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

// Convert to array of arrays
const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

// Remove header row
const headers = data.shift();

// Validate headers
const expectedHeaders = ['Type', 'Category', 'Item Name', 'Price', 'Available', 'Modifiers (comma-separated)', 'Image Path'];
const headersMatch = headers.every((h, i) => h === expectedHeaders[i]);

if (!headersMatch) {
  console.error('❌ Error: Excel headers do not match expected format!');
  console.error('   Expected:', expectedHeaders);
  console.error('   Found:', headers);
  console.error('   Please do not modify the header row.\n');
  process.exit(1);
}

// Process rows into menu items
const beachDrinks = [];
const roomService = [];
let rowNumber = 2; // Start at 2 (1 is header)

for (const row of data) {
  // Skip empty rows
  if (!row || row.length === 0 || !row[0]) {
    rowNumber++;
    continue;
  }

  const [type, category, itemName, price, available, modifiers, image] = row;

  // Validate required fields
  if (!type || !category || !itemName) {
    console.warn(`⚠ Warning: Row ${rowNumber} is missing required fields, skipping...`);
    rowNumber++;
    continue;
  }

  // Parse modifiers (comma-separated string to array)
  const modifierArray = modifiers
    ? modifiers.split(',').map(m => m.trim()).filter(m => m.length > 0)
    : [];

  // Create item object
  const item = {
    type: type.toString().trim().toLowerCase(),
    category: category.toString().trim(),
    itemName: itemName.toString().trim(),
    price: typeof price === 'number' ? price : parseFloat(price) || 0,
    image: image ? image.toString().trim() : 'images/placeholder.png',
    available: available === 'TRUE' || available === true || available === 'true',
    modifiers: modifierArray
  };

  // Add to appropriate array
  if (item.type === 'beachdrinks') {
    beachDrinks.push(item);
  } else if (item.type === 'roomservice') {
    roomService.push(item);
  } else {
    console.warn(`⚠ Warning: Row ${rowNumber} has invalid type "${item.type}", skipping...`);
  }

  rowNumber++;
}

// Create final menu object
const menuData = {
  beachDrinks: beachDrinks,
  roomService: roomService
};

// Write to JSON file
fs.writeFileSync(JSON_FILE, JSON.stringify(menuData, null, 2));

console.log('\n✓ Successfully converted Excel to JSON!');
console.log(`  Location: ${JSON_FILE}`);
console.log(`  Beach Drinks: ${beachDrinks.length} items`);
console.log(`  Room Service: ${roomService.length} items`);
console.log(`  Total: ${beachDrinks.length + roomService.length} items\n`);
console.log('Changes have been applied to your menu!');
console.log('The backup is saved at:', BACKUP_FILE, '\n');
