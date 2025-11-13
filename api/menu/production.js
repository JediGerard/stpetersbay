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
    const productionPath = path.join(process.cwd(), 'data', 'sample_menu.json');

    if (!fs.existsSync(productionPath)) {
      return res.status(404).json({ error: 'Production menu not found.' });
    }

    const productionData = JSON.parse(fs.readFileSync(productionPath, 'utf8'));
    res.status(200).json(productionData);
  } catch (error) {
    console.error('Production menu error:', error);
    res.status(500).json({ error: error.message });
  }
};
