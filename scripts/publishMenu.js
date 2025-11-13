const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('../service-account-key.json');
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}
const db = admin.firestore();

// File paths
const PREVIEW_FILE = path.join(__dirname, '../data/sample_menu.preview.json');
const PRODUCTION_FILE = path.join(__dirname, '../data/sample_menu.json');
const BACKUP_DIR = path.join(__dirname, '../data/backups');

// Ensure backup directory exists
function ensureBackupDir() {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
    console.log(`Created backup directory: ${BACKUP_DIR}`);
  }
}

// Create timestamped backup
function createBackup() {
  if (!fs.existsSync(PRODUCTION_FILE)) {
    console.log('No existing production file to backup.');
    return null;
  }

  const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
  const backupPath = path.join(BACKUP_DIR, `sample_menu_${timestamp}.json`);

  fs.copyFileSync(PRODUCTION_FILE, backupPath);
  console.log(`✅ Backup created: ${backupPath}`);

  return backupPath;
}

// Publish menu from preview to production
async function publishMenu(publishedBy = 'CLI') {
  console.log('='.repeat(60));
  console.log('Menu Publishing');
  console.log('='.repeat(60));
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log(`Published by: ${publishedBy}`);
  console.log('');

  try {
    // 1. Get staging menu from Firestore
    console.log('Fetching staging menu from Firestore...');
    const stagingDoc = await db.collection('menus').doc('staging').get();

    if (!stagingDoc.exists) {
      console.error('❌ Staging menu not found in Firestore.');
      console.error('Please run sync first: node scripts/googleSheetsSync.js');
      process.exit(1);
    }

    const stagingData = stagingDoc.data();

    // 2. Validate staging data
    if (!stagingData.beachDrinks || !stagingData.roomService) {
      throw new Error('Invalid menu structure: missing beachDrinks or roomService');
    }

    const totalItems = stagingData.beachDrinks.length + stagingData.roomService.length;
    console.log(`✅ Staging menu valid: ${totalItems} items`);
    console.log(`   - Beach Drinks: ${stagingData.beachDrinks.length} items`);
    console.log(`   - Room Service: ${stagingData.roomService.length} items`);
    console.log('');

    // 3. Get current production menu for backup
    console.log('Creating Firestore backup...');
    const productionDoc = await db.collection('menus').doc('production').get();

    if (productionDoc.exists) {
      // Create backup directory if needed
      ensureBackupDir();

      // Save backup to file
      const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
      const backupPath = path.join(BACKUP_DIR, `sample_menu_${timestamp}.json`);
      const productionData = productionDoc.data();

      fs.writeFileSync(backupPath, JSON.stringify({
        beachDrinks: productionData.beachDrinks,
        roomService: productionData.roomService
      }, null, 2), 'utf8');

      console.log(`✅ Backup created: ${backupPath}`);
    } else {
      console.log('No existing production menu to backup.');
    }
    console.log('');

    // 4. Copy staging to production in Firestore
    console.log('Publishing menu to Firestore...');
    await db.collection('menus').doc('production').set({
      beachDrinks: stagingData.beachDrinks,
      roomService: stagingData.roomService,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      updatedBy: publishedBy,
      itemCount: totalItems
    });
    console.log('✅ Menu published to Firestore: /menus/production');

    // 5. Also update JSON file as fallback
    console.log('Updating JSON file fallback...');
    fs.writeFileSync(PRODUCTION_FILE, JSON.stringify({
      beachDrinks: stagingData.beachDrinks,
      roomService: stagingData.roomService
    }, null, 2), 'utf8');
    console.log(`✅ JSON file updated: ${PRODUCTION_FILE}`);
    console.log('');

    console.log('='.repeat(60));
    console.log('✅ PUBLISH COMPLETE');
    console.log('='.repeat(60));
    console.log(`Total items: ${totalItems}`);
    console.log('');
    console.log('Next steps:');
    console.log('1. Test the menu on your local ordering page');
    console.log('2. Deploy to live site when ready');
    console.log('='.repeat(60));

    return {
      success: true,
      timestamp: new Date().toISOString(),
      publishedBy,
      itemCount: totalItems
    };

  } catch (error) {
    console.error('');
    console.error('='.repeat(60));
    console.error('❌ PUBLISH FAILED');
    console.error('='.repeat(60));
    console.error(`Error: ${error.message}`);
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
  const publishedBy = process.argv[2] || 'CLI';
  publishMenu(publishedBy).then(result => {
    process.exit(result.success ? 0 : 1);
  });
}

module.exports = { publishMenu };
