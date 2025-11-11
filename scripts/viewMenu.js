#!/usr/bin/env node

/**
 * Menu Viewer
 * Quick view of menu contents for verification
 */

const fs = require('fs');
const path = require('path');

const JSON_FILE = path.join(__dirname, '../data/sample_menu.json');

if (!fs.existsSync(JSON_FILE)) {
  console.error('❌ Menu file not found!');
  process.exit(1);
}

const menuData = JSON.parse(fs.readFileSync(JSON_FILE, 'utf8'));

console.log('\n=== MENU OVERVIEW ===\n');

// Beach Drinks
if (menuData.beachDrinks) {
  console.log(`\n🍹 BEACH DRINKS (${menuData.beachDrinks.length} items)`);
  console.log('━'.repeat(60));

  const categories = {};
  menuData.beachDrinks.forEach(item => {
    if (!categories[item.category]) {
      categories[item.category] = [];
    }
    categories[item.category].push(item);
  });

  Object.keys(categories).sort().forEach(category => {
    console.log(`\n${category}:`);
    categories[category].forEach(item => {
      const status = item.available ? '✓' : '✗';
      console.log(`  ${status} ${item.itemName} - $${item.price}`);
    });
  });
}

// Room Service
if (menuData.roomService) {
  console.log(`\n\n🍽️  ROOM SERVICE (${menuData.roomService.length} items)`);
  console.log('━'.repeat(60));

  const categories = {};
  menuData.roomService.forEach(item => {
    if (!categories[item.category]) {
      categories[item.category] = [];
    }
    categories[item.category].push(item);
  });

  Object.keys(categories).sort().forEach(category => {
    console.log(`\n${category}:`);
    categories[category].forEach(item => {
      const status = item.available ? '✓' : '✗';
      console.log(`  ${status} ${item.itemName} - $${item.price}`);
    });
  });
}

// Summary
const totalItems = (menuData.beachDrinks?.length || 0) + (menuData.roomService?.length || 0);
const availableItems = [
  ...(menuData.beachDrinks || []),
  ...(menuData.roomService || [])
].filter(item => item.available).length;

console.log('\n' + '━'.repeat(60));
console.log('\n📊 SUMMARY:');
console.log(`  Total items: ${totalItems}`);
console.log(`  Available: ${availableItems}`);
console.log(`  Unavailable: ${totalItems - availableItems}`);
console.log('');
