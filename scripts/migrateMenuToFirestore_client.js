// Migrate menu from JSON files to Firestore using Firebase client SDK
// Uses the existing Firebase project (st-peters-bay-food-ordering)

const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, serverTimestamp } = require('firebase/firestore');
const fs = require('fs');
const path = require('path');

// Firebase configuration (same as in firebase-config.js)
const firebaseConfig = {
  apiKey: "AIzaSyAYv_LqT4tO8oAbhsiKjPJTdW6fUPGqzRA",
  authDomain: "st-peters-bay-food-ordering.firebaseapp.com",
  projectId: "st-peters-bay-food-ordering",
  storageBucket: "st-peters-bay-food-ordering.firebasestorage.app",
  messagingSenderId: "313320899615",
  appId: "1:313320899615:web:863545b190d18ae440812a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function migrateMenu() {
  console.log('🚀 Starting menu migration to Firestore...');
  console.log('📦 Using Firebase project: st-peters-bay-food-ordering\n');

  try {
    // Read production menu
    const productionPath = path.join(__dirname, '..', 'data', 'sample_menu.json');
    const productionMenu = JSON.parse(fs.readFileSync(productionPath, 'utf8'));

    console.log('📖 Read production menu from file');
    console.log(`   - Beach Drinks categories: ${productionMenu.beachDrinks?.length || 0}`);
    console.log(`   - Room Service categories: ${productionMenu.roomService?.length || 0}`);

    // Upload production menu to Firestore
    const productionRef = doc(db, 'menus', 'production');
    await setDoc(productionRef, {
      beachDrinks: productionMenu.beachDrinks || [],
      roomService: productionMenu.roomService || [],
      lastUpdated: serverTimestamp(),
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
      const stagingRef = doc(db, 'menus', 'staging');
      await setDoc(stagingRef, {
        beachDrinks: stagingMenu.beachDrinks || [],
        roomService: stagingMenu.roomService || [],
        lastUpdated: serverTimestamp(),
        updatedBy: 'migration-script'
      });

      console.log('✅ Uploaded staging menu to Firestore: /menus/staging\n');
    } else {
      console.log('ℹ️  No staging menu found, copying production to staging...');

      // Copy production to staging
      const stagingRef = doc(db, 'menus', 'staging');
      await setDoc(stagingRef, {
        beachDrinks: productionMenu.beachDrinks || [],
        roomService: productionMenu.roomService || [],
        lastUpdated: serverTimestamp(),
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
