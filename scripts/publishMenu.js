const fs = require('fs');
const path = require('path');

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
function publishMenu(publishedBy = 'CLI') {
  console.log('='.repeat(60));
  console.log('Menu Publishing');
  console.log('='.repeat(60));
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log(`Published by: ${publishedBy}`);
  console.log('');

  try {
    // 1. Verify preview file exists
    if (!fs.existsSync(PREVIEW_FILE)) {
      console.error('❌ Preview file not found.');
      console.error('Please run sync first: node scripts/googleSheetsSync.js');
      process.exit(1);
    }

    // 2. Validate preview JSON
    console.log('Validating preview file...');
    let previewData;
    try {
      const previewContent = fs.readFileSync(PREVIEW_FILE, 'utf8');
      previewData = JSON.parse(previewContent);

      if (!previewData.beachDrinks || !previewData.roomService) {
        throw new Error('Invalid menu structure: missing beachDrinks or roomService');
      }

      const totalItems = previewData.beachDrinks.length + previewData.roomService.length;
      console.log(`✅ Preview file valid: ${totalItems} items`);
      console.log(`   - Beach Drinks: ${previewData.beachDrinks.length} items`);
      console.log(`   - Room Service: ${previewData.roomService.length} items`);
      console.log('');
    } catch (error) {
      console.error('❌ Invalid preview file:', error.message);
      process.exit(1);
    }

    // 3. Create backup directory if needed
    ensureBackupDir();

    // 4. Create backup of current production file
    console.log('Creating backup...');
    const backupPath = createBackup();
    console.log('');

    // 5. Copy preview to production
    console.log('Publishing menu...');
    fs.copyFileSync(PREVIEW_FILE, PRODUCTION_FILE);
    console.log(`✅ Menu published to: ${PRODUCTION_FILE}`);
    console.log('');

    // 6. Log publish event
    const logEntry = {
      timestamp: new Date().toISOString(),
      publishedBy,
      backupPath,
      previewFile: PREVIEW_FILE,
      productionFile: PRODUCTION_FILE,
      itemCount: previewData.beachDrinks.length + previewData.roomService.length
    };

    console.log('='.repeat(60));
    console.log('✅ PUBLISH COMPLETE');
    console.log('='.repeat(60));
    console.log(`Total items: ${logEntry.itemCount}`);
    if (backupPath) {
      console.log(`Backup: ${path.basename(backupPath)}`);
    }
    console.log('');
    console.log('Next steps:');
    console.log('1. Test the menu on your local ordering page');
    console.log('2. Deploy to live site when ready');
    console.log('='.repeat(60));

    return {
      success: true,
      ...logEntry
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
  const result = publishMenu(publishedBy);
  process.exit(result.success ? 0 : 1);
}

module.exports = { publishMenu };
