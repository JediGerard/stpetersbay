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
    const backupDir = path.join(process.cwd(), 'data', 'backups');

    if (!fs.existsSync(backupDir)) {
      return res.status(200).json([]);
    }

    const files = fs.readdirSync(backupDir)
      .filter(f => f.startsWith('sample_menu_') && f.endsWith('.json'))
      .sort()
      .reverse()
      .slice(0, 10);

    const history = files.map(file => {
      const stats = fs.statSync(path.join(backupDir, file));
      return {
        filename: file,
        timestamp: stats.mtime.toISOString(),
        size: stats.size
      };
    });

    res.status(200).json(history);
  } catch (error) {
    console.error('History error:', error);
    res.status(500).json({ error: error.message });
  }
};
