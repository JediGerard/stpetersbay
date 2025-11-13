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

    if (!fs.existsSync(previewPath)) {
      return res.status(404).json({ error: 'Preview menu not found. Run sync first.' });
    }

    const previewData = JSON.parse(fs.readFileSync(previewPath, 'utf8'));
    res.status(200).json(previewData);
  } catch (error) {
    console.error('Preview menu error:', error);
    res.status(500).json({ error: error.message });
  }
};
