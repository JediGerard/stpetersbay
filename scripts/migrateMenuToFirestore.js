// Migrate menu from JSON files to Firestore
// Run once to set up the Firestore menu collection

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin (for server-side operations)
const serviceAccount = require('../service-account-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function migrateMenu() {
  console.log('🚀 Starting menu migration to Firestore...\n');

  try {
    // Read production menu
    const productionPath = path.join(__dirname, '..', 'data', 'sample_menu.json');
    const productionMenu = JSON.parse(fs.readFileSync(productionPath, 'utf8'));

    console.log('📖 Read production menu from file');
    console.log(`   - Beach Drinks categories: ${productionMenu.beachDrinks?.length || 0}`);
    console.log(`   - Room Service categories: ${productionMenu.roomService?.length || 0}`);

    // Upload production menu to Firestore
    await db.collection('menus').doc('production').set({
      ...productionMenu,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      updatedBy: 'migration-script'
    });

    console.log('✅ Uploaded production menu to Firestore: /menus/production\n');

    // Read staging menu (if exists)
    const stagingPath = path.join(__dirname, '..', 'data', 'sample_menu.preview.json');

    if (fs.existsSync(stagingPath)) {
      const stagingMenu = JSON.parse(fs.readFileSync(stagingPath, 'utf8'));

      console.log('📖 Read staging menu from file');
      console.log(`   - Beach Drinks categories: ${stagingMenu.beachDrinks?.length || 0}`);
      console.log(`   - Room Service categories: ${stagingMenu.roomService?.length || 0}`);

      // Upload staging menu to Firestore
      await db.collection('menus').doc('staging').set({
        ...stagingMenu,
        lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
        updatedBy: 'migration-script'
      });

      console.log('✅ Uploaded staging menu to Firestore: /menus/staging\n');
    } else {
      console.log('ℹ️  No staging menu found, copying production to staging...');

      // Copy production to staging
      await db.collection('menus').doc('staging').set({
        ...productionMenu,
        lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
        updatedBy: 'migration-script'
      });

      console.log('✅ Created staging menu from production\n');
    }

    console.log('🎉 Migration complete!\n');
    console.log('Firestore structure:');
    console.log('  /menus/production - Live menu (used by ordering system)');
    console.log('  /menus/staging    - Preview menu (from Google Sheets sync)\n');

    process.exit(0);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migrateMenu();
