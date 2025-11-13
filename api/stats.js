const { getFirestore, admin } = require('./_firebase');

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
    const db = getFirestore();

    // Get production menu
    const productionDoc = await db.collection('menus').doc('production').get();
    const stagingDoc = await db.collection('menus').doc('staging').get();

    let totalItems = 0;
    let previewItems = 0;
    let lastPublish = 'Never';
    let lastSync = 'Never';
    let hasChanges = false;

    if (productionDoc.exists) {
      const productionData = productionDoc.data();
      // Count items - they're stored as flat arrays
      const beachCount = Array.isArray(productionData.beachDrinks) ? productionData.beachDrinks.length : 0;
      const roomCount = Array.isArray(productionData.roomService) ? productionData.roomService.length : 0;
      totalItems = beachCount + roomCount;

      if (productionData.lastUpdated) {
        lastPublish = productionData.lastUpdated.toDate().toISOString();
      }
    }

    if (stagingDoc.exists) {
      const stagingData = stagingDoc.data();
      // Count items - they're stored as flat arrays
      const beachCount = Array.isArray(stagingData.beachDrinks) ? stagingData.beachDrinks.length : 0;
      const roomCount = Array.isArray(stagingData.roomService) ? stagingData.roomService.length : 0;
      previewItems = beachCount + roomCount;

      if (stagingData.lastUpdated) {
        lastSync = stagingData.lastUpdated.toDate().toISOString();
      }

      // Check if staging is different from production
      if (productionDoc.exists) {
        const productionData = productionDoc.data();
        hasChanges = JSON.stringify(stagingData.beachDrinks) !== JSON.stringify(productionData.beachDrinks) ||
                     JSON.stringify(stagingData.roomService) !== JSON.stringify(productionData.roomService);
      }
    }

    res.status(200).json({
      totalItems,
      previewItems,
      hasChanges,
      lastSync,
      lastPublish
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: error.message });
  }
};
