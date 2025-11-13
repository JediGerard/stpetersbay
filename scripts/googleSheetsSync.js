require('dotenv').config();
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

// Configuration
const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const SERVICE_ACCOUNT_PATH = process.env.SERVICE_ACCOUNT_PATH;
const PREVIEW_FILE = path.join(__dirname, '../data/sample_menu.preview.json');

// Validation helpers
function validateType(type) {
  const normalized = type.toLowerCase().trim();
  if (normalized !== 'beachdrinks' && normalized !== 'roomservice') {
    throw new Error(`Invalid type: ${type}. Must be "beachdrinks" or "roomservice"`);
  }
  return normalized;
}

function validatePrice(price) {
  // Remove dollar signs, commas, and other currency symbols
  const cleanPrice = price.toString().replace(/[$,]/g, '').trim();
  const numPrice = parseFloat(cleanPrice);
  if (isNaN(numPrice) || numPrice <= 0) {
    throw new Error(`Invalid price: ${price}. Must be a number greater than 0`);
  }
  return numPrice;
}

function validateAvailable(available) {
  const normalized = available.toString().toUpperCase().trim();
  if (normalized !== 'TRUE' && normalized !== 'FALSE') {
    throw new Error(`Invalid available value: ${available}. Must be TRUE or FALSE`);
  }
  return normalized === 'TRUE';
}

function parseModifiers(modifiersString) {
  if (!modifiersString || modifiersString.trim() === '') {
    return [];
  }
  return modifiersString.split(',').map(m => m.trim()).filter(m => m.length > 0);
}

// Transform row to menu item
function rowToMenuItem(row, rowNumber) {
  try {
    // Row format: [type, category, itemName, price, available, modifiers, imagePath]
    if (!row[0] || !row[1] || !row[2] || !row[3]) {
      throw new Error('Missing required fields (type, category, itemName, or price)');
    }

    const item = {
      name: row[2].trim(),
      price: validatePrice(row[3]),
      image: row[6] ? row[6].trim() : 'images/placeholder.png',
      available: validateAvailable(row[4]),
      modifiers: parseModifiers(row[5]),
      category: row[1].trim()
    };

    const type = validateType(row[0]);

    return { type, item };
  } catch (error) {
    throw new Error(`Row ${rowNumber}: ${error.message}`);
  }
}

// Main sync function
async function syncGoogleSheetToJSON() {
  console.log('='.repeat(60));
  console.log('Google Sheets Menu Sync');
  console.log('='.repeat(60));
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log(`Sheet ID: ${SHEET_ID}`);
  console.log('');

  try {
    // 1. Authenticate with Service Account
    console.log('Authenticating with Google Sheets API...');
    const auth = new google.auth.GoogleAuth({
      keyFile: SERVICE_ACCOUNT_PATH,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });

    // 2. Fetch sheet data
    console.log('Fetching menu data from Google Sheet...');
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Menu Items', // Read all data from Menu Items tab
    });

    const rows = response.data.values;

    if (!rows || rows.length === 0) {
      throw new Error('No data found in spreadsheet');
    }

    console.log(`Found ${rows.length} rows (including header)`);
    console.log('');

    // 3. Parse rows (skip header row)
    console.log('Parsing and validating menu items...');
    const beachDrinksItems = [];
    const roomServiceItems = [];
    const errors = [];
    let successCount = 0;
    let skippedCount = 0;

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const rowNumber = i + 1;

      // Skip empty rows
      if (!row || row.length === 0 || !row[0]) {
        skippedCount++;
        continue;
      }

      try {
        const { type, item } = rowToMenuItem(row, rowNumber);

        if (type === 'beachdrinks') {
          beachDrinksItems.push(item);
        } else {
          roomServiceItems.push(item);
        }

        successCount++;
      } catch (error) {
        errors.push(error.message);
        console.warn(`⚠️  ${error.message}`);
      }
    }

    console.log('');
    console.log(`✅ Successfully parsed: ${successCount} items`);
    console.log(`⚠️  Skipped: ${skippedCount} rows (empty)`);
    console.log(`❌ Errors: ${errors.length} rows`);
    console.log('');

    // 4. Group by category within each type
    function groupByCategory(items) {
      const grouped = {};
      items.forEach(item => {
        const category = item.category;
        if (!grouped[category]) {
          grouped[category] = [];
        }
        grouped[category].push(item);
      });
      return grouped;
    }

    const beachDrinksGrouped = groupByCategory(beachDrinksItems);
    const roomServiceGrouped = groupByCategory(roomServiceItems);

    // 5. Build final menu structure
    const menuData = {
      beachDrinks: beachDrinksItems,
      roomService: roomServiceItems
    };

    // 6. Write to preview file
    console.log(`Writing to preview file: ${PREVIEW_FILE}`);
    fs.writeFileSync(PREVIEW_FILE, JSON.stringify(menuData, null, 2), 'utf8');

    console.log('');
    console.log('='.repeat(60));
    console.log('✅ SYNC COMPLETE');
    console.log('='.repeat(60));
    console.log(`Beach Drinks: ${beachDrinksItems.length} items`);
    console.log(`Room Service: ${roomServiceItems.length} items`);
    console.log(`Total: ${successCount} items`);
    console.log('');
    console.log('Beach Drinks Categories:');
    Object.keys(beachDrinksGrouped).forEach(cat => {
      console.log(`  - ${cat}: ${beachDrinksGrouped[cat].length} items`);
    });
    console.log('');
    console.log('Room Service Categories:');
    Object.keys(roomServiceGrouped).forEach(cat => {
      console.log(`  - ${cat}: ${roomServiceGrouped[cat].length} items`);
    });
    console.log('');
    console.log('Preview file ready for review.');
    console.log('Run "npm run publish-menu" to publish to production.');
    console.log('='.repeat(60));

    return {
      success: true,
      itemCount: successCount,
      errors: errors.length,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('');
    console.error('='.repeat(60));
    console.error('❌ SYNC FAILED');
    console.error('='.repeat(60));
    console.error(`Error: ${error.message}`);
    console.error('');

    if (error.code === 'ENOENT' && error.path && error.path.includes('service-account-key')) {
      console.error('Service account key file not found.');
      console.error('Please ensure service-account-key.json exists in the project root.');
    }

    console.error('='.repeat(60));

    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

// Allow CLI usage
if (require.main === module) {
  syncGoogleSheetToJSON().then(result => {
    process.exit(result.success ? 0 : 1);
  });
}

module.exports = { syncGoogleSheetToJSON };
