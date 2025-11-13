const { OAuth2Client } = require('google-auth-library');

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

    // Note: In Vercel serverless functions, we can't do git operations
    // The deployment happens automatically when you push to git
    // This endpoint just validates auth and returns instructions

    const message = `
Deployment Instructions for Serverless Environment:

Since the admin panel is running on Vercel serverless functions,
automatic git deployment is not available.

To deploy your menu changes:

1. The menu has already been published to data/sample_menu.json
2. Commit and push the changes manually:

   git add data/sample_menu.json
   git commit -m "Update menu - Published by ${payload.email}"
   git push origin main

3. Vercel will automatically deploy the changes in ~30-60 seconds

Alternatively, use Vercel CLI:
   vercel deploy --prod

Check deployment status at: https://vercel.com/dashboard
    `.trim();

    // Return success with instructions
    res.status(200).send(message);

  } catch (error) {
    console.error('Deploy error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
