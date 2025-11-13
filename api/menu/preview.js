const { getFirestore } = require('../_firebase');

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
    const stagingDoc = await db.collection('menus').doc('staging').get();

    if (!stagingDoc.exists) {
      return res.status(404).json({ error: 'Preview menu not found. Run sync first.' });
    }

    const data = stagingDoc.data();
    res.status(200).json({
      beachDrinks: data.beachDrinks || [],
      roomService: data.roomService || []
    });
  } catch (error) {
    console.error('Preview menu error:', error);
    res.status(500).json({ error: error.message });
  }
};
