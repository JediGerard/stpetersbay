const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const ADMIN_EMAILS = process.env.ADMIN_EMAILS ?
  process.env.ADMIN_EMAILS.split(',').map(e => e.trim().toLowerCase()) :
  [];

async function verifyToken(token) {
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    return ticket.getPayload();
  } catch (error) {
    console.error('Token verification error:', error);
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
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check for required environment variables
  if (!process.env.GOOGLE_CLIENT_ID) {
    console.error('Missing GOOGLE_CLIENT_ID environment variable');
    return res.status(500).json({ authorized: false, error: 'Server configuration error: Missing Google Client ID' });
  }

  if (!process.env.ADMIN_EMAILS) {
    console.error('Missing ADMIN_EMAILS environment variable');
    return res.status(500).json({ authorized: false, error: 'Server configuration error: Missing admin emails' });
  }

  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ authorized: false, error: 'No token provided' });
    }

    const payload = await verifyToken(token);

    if (isAdmin(payload.email)) {
      res.status(200).json({
        authorized: true,
        user: {
          email: payload.email,
          name: payload.name,
          picture: payload.picture
        }
      });
    } else {
      res.status(200).json({
        authorized: false,
        error: 'Access denied. Your email is not in the admin whitelist.'
      });
    }
  } catch (error) {
    res.status(401).json({ authorized: false, error: error.message });
  }
};
