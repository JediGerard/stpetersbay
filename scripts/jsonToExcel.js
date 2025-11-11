#!/usr/bin/env node

/**
 * JSON to Excel Converter
 * Converts menu JSON to Excel spreadsheet for easy editing by staff
 */

const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// File paths
const JSON_FILE = path.join(__dirname, '../data/sample_menu.json');
const EXCEL_FILE = path.join(__dirname, '../data/menu_editor.xlsx');

console.log('Converting JSON to Excel...\n');

// Read the JSON file
const menuData = JSON.parse(fs.readFileSync(JSON_FILE, 'utf8'));

// Prepare data for Excel
const excelData = [];

// Add header row
excelData.push([
  'Type',
  'Category',
  'Item Name',
  'Price',
  'Available',
  'Modifiers (comma-separated)',
  'Image Path'
]);

// Process beachDrinks
if (menuData.beachDrinks && Array.isArray(menuData.beachDrinks)) {
  menuData.beachDrinks.forEach(item => {
    excelData.push([
      item.type || 'beachdrinks',
      item.category || '',
      item.itemName || '',
      item.price || 0,
      item.available ? 'TRUE' : 'FALSE',
      (item.modifiers || []).join(', '),
      item.image || 'images/placeholder.png'
    ]);
  });
}

// Process roomService
if (menuData.roomService && Array.isArray(menuData.roomService)) {
  menuData.roomService.forEach(item => {
    excelData.push([
      item.type || 'roomservice',
      item.category || '',
      item.itemName || '',
      item.price || 0,
      item.available ? 'TRUE' : 'FALSE',
      (item.modifiers || []).join(', '),
      item.image || 'images/placeholder.png'
    ]);
  });
}

// Create workbook and worksheet
const wb = XLSX.utils.book_new();
const ws = XLSX.utils.aoa_to_sheet(excelData);

// Set column widths for better readability
ws['!cols'] = [
  { wch: 15 },  // Type
  { wch: 25 },  // Category
  { wch: 40 },  // Item Name
  { wch: 10 },  // Price
  { wch: 10 },  // Available
  { wch: 60 },  // Modifiers
  { wch: 30 }   // Image Path
];

// Add worksheet to workbook
XLSX.utils.book_append_sheet(wb, ws, 'Menu Items');

// Write to file
XLSX.writeFile(wb, EXCEL_FILE);

console.log('✓ Successfully created Excel file!');
console.log(`  Location: ${EXCEL_FILE}`);
console.log(`  Total items: ${excelData.length - 1}\n`);
console.log('Instructions for staff:');
console.log('  1. Open the Excel file');
console.log('  2. Edit items, prices, or availability');
console.log('  3. To add new items: add a new row with all columns filled');
console.log('  4. To delete items: delete the entire row');
console.log('  5. Modifiers should be comma-separated');
console.log('  6. Available should be TRUE or FALSE');
console.log('  7. Save the file when done');
console.log('  8. Run: npm run import-menu\n');
