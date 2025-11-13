const { OAuth2Client } = require('google-auth-library');
const { publishMenu } = require('../scripts/publishMenu');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const ADMIN_EMAILS = process.env.ADMIN_EMAILS.split(',').map(e => e.trim().toLowerCase());

async function verifyToken(token) {
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    return ticket.getPayload();
  } catch (error) {
    throw new Error('Invalid token');
  }
}

function isAdmin(email) {
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split('Bearer ')[1];

    if (!token) {
      return res.status(401).json({ success: false, error: 'No token provided' });
    }

    const payload = await verifyToken(token);

    if (!isAdmin(payload.email)) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    // Run publish script
    publishMenu(payload.email);

    res.status(200).json({
      success: true,
      message: 'Menu published successfully',
      publishedBy: payload.email,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Publish error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
