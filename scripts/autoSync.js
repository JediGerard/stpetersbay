require('dotenv').config();
const cron = require('node-cron');
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const { syncGoogleSheetToJSON } = require('./googleSheetsSync');

// Configuration
const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const SERVICE_ACCOUNT_PATH = process.env.SERVICE_ACCOUNT_PATH;
const CACHE_FILE = path.join(__dirname, '../data/.sync-cache.json');

// Load or create cache
function loadCache() {
  if (fs.existsSync(CACHE_FILE)) {
    try {
      const content = fs.readFileSync(CACHE_FILE, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      console.warn('Failed to load cache, creating new:', error.message);
      return { lastModified: null, lastSync: null };
    }
  }
  return { lastModified: null, lastSync: null };
}

function saveCache(cache) {
  try {
    fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2), 'utf8');
  } catch (error) {
    console.error('Failed to save cache:', error.message);
  }
}

// Check if sheet has been modified
async function getSheetLastModified() {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: SERVICE_ACCOUNT_PATH,
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    });

    const client = await auth.getClient();
    const drive = google.drive({ version: 'v3', auth: client });

    const response = await drive.files.get({
      fileId: SHEET_ID,
      fields: 'modifiedTime',
    });

    return response.data.modifiedTime;
  } catch (error) {
    console.error('Failed to get sheet modified time:', error.message);
    throw error;
  }
}

// Check for changes and sync if needed
async function checkForChanges() {
  const timestamp = new Date().toISOString();
  console.log(`\n[${ timestamp}] Checking for Sheet updates...`);

  try {
    // Load cached timestamp
    const cache = loadCache();

    // Get current sheet modified time
    const currentModifiedTime = await getSheetLastModified();
    console.log(`  Sheet last modified: ${currentModifiedTime}`);

    if (cache.lastModified) {
      console.log(`  Cached modified time: ${cache.lastModified}`);
    } else {
      console.log('  No cached timestamp (first run)');
    }

    // Compare timestamps
    if (cache.lastModified === currentModifiedTime) {
      console.log('  ✅ No changes detected. Skipping sync.');
      return;
    }

    // Sheet has changed, trigger sync
    console.log('  🔄 Changes detected! Starting sync...');
    console.log('');

    const result = await syncGoogleSheetToJSON();

    if (result.success) {
      // Update cache
      cache.lastModified = currentModifiedTime;
      cache.lastSync = timestamp;
      saveCache(cache);
      console.log(`  ✅ Sync completed successfully. ${result.itemCount} items synced.`);
    } else {
      console.error(`  ❌ Sync failed: ${result.error}`);
    }

  } catch (error) {
    console.error(`  ❌ Error checking for changes: ${error.message}`);

    if (error.code === 'ENOENT' && error.path && error.path.includes('service-account-key')) {
      console.error('  Service account key file not found.');
      console.error('  Please ensure service-account-key.json exists in the project root.');
    }
  }
}

// Main function
async function startAutoSync() {
  console.log('='.repeat(60));
  console.log('Google Sheets Auto-Sync Worker');
  console.log('='.repeat(60));
  console.log(`Started: ${new Date().toISOString()}`);
  console.log(`Sheet ID: ${SHEET_ID}`);
  console.log('Schedule: Every 5 minutes (*/5 * * * *)');
  console.log('');
  console.log('Press Ctrl+C to stop');
  console.log('='.repeat(60));

  // Run immediately on startup
  console.log('\nRunning initial sync check...');
  await checkForChanges();

  // Schedule to run every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    await checkForChanges();
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('\n\nReceived SIGTERM. Shutting down gracefully...');
    process.exit(0);
  });

  process.on('SIGINT', () => {
    console.log('\n\nReceived SIGINT. Shutting down gracefully...');
    process.exit(0);
  });
}

// Start the worker
if (require.main === module) {
  startAutoSync().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { checkForChanges, startAutoSync };
