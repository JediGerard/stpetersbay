const fs = require('fs');
const path = require('path');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const previewPath = path.join(process.cwd(), 'data', 'sample_menu.preview.json');
    const productionPath = path.join(process.cwd(), 'data', 'sample_menu.json');

    let previewStats = null;
    let productionStats = null;
    let totalItems = 0;
    let previewItems = 0;
    let hasChanges = false;

    // Get production stats
    if (fs.existsSync(productionPath)) {
      productionStats = fs.statSync(productionPath);
      const productionData = JSON.parse(fs.readFileSync(productionPath, 'utf8'));

      let beachCount = 0;
      let roomCount = 0;

      if (productionData.beachDrinks) {
        productionData.beachDrinks.forEach(category => {
          beachCount += category.items ? category.items.length : 0;
        });
      }

      if (productionData.roomService) {
        productionData.roomService.forEach(category => {
          roomCount += category.items ? category.items.length : 0;
        });
      }

      totalItems = beachCount + roomCount;
    }

    // Get preview stats
    if (fs.existsSync(previewPath)) {
      previewStats = fs.statSync(previewPath);
      const previewData = JSON.parse(fs.readFileSync(previewPath, 'utf8'));

      let beachCount = 0;
      let roomCount = 0;

      if (previewData.beachDrinks) {
        previewData.beachDrinks.forEach(category => {
          beachCount += category.items ? category.items.length : 0;
        });
      }

      if (previewData.roomService) {
        previewData.roomService.forEach(category => {
          roomCount += category.items ? category.items.length : 0;
        });
      }

      previewItems = beachCount + roomCount;

      // Check if files are different
      if (productionStats) {
        const previewContent = fs.readFileSync(previewPath, 'utf8');
        const productionContent = fs.readFileSync(productionPath, 'utf8');
        hasChanges = previewContent !== productionContent;
      }
    }

    res.status(200).json({
      totalItems,
      previewItems,
      hasChanges,
      lastSync: previewStats ? previewStats.mtime.toISOString() : 'Never',
      lastPublish: productionStats ? productionStats.mtime.toISOString() : 'Never'
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: error.message });
  }
};
