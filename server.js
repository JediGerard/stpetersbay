require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { OAuth2Client } = require('google-auth-library');
const { exec } = require('child_process');
const { publishMenu } = require('./scripts/publishMenu');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const ADMIN_EMAILS = process.env.ADMIN_EMAILS.split(',').map(e => e.trim().toLowerCase());

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Verify Google OAuth token
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

// Verify user is admin
function isAdmin(email) {
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

// POST /api/verify-auth - Verify OAuth token and check admin status
app.post('/api/verify-auth', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ authorized: false, error: 'No token provided' });
    }

    const payload = await verifyToken(token);

    if (isAdmin(payload.email)) {
      res.json({
        authorized: true,
        user: {
          email: payload.email,
          name: payload.name,
          picture: payload.picture
        }
      });
    } else {
      res.json({
        authorized: false,
        error: 'Access denied. Your email is not in the admin whitelist.'
      });
    }
  } catch (error) {
    res.status(401).json({ authorized: false, error: error.message });
  }
});

// GET /api/stats - Get menu statistics
app.get('/api/stats', (req, res) => {
  try {
    const previewPath = './data/sample_menu.preview.json';
    const productionPath = './data/sample_menu.json';

    let previewStats = null;
    let productionStats = null;
    let totalItems = 0;
    let previewItems = 0;
    let hasChanges = false;

    // Get production stats
    if (fs.existsSync(productionPath)) {
      productionStats = fs.statSync(productionPath);
      const productionData = JSON.parse(fs.readFileSync(productionPath, 'utf8'));

      // Count items in each category
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

    res.json({
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
});

// POST /api/publish - Publish staging menu to production
app.post('/api/publish', async (req, res) => {
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

    res.json({
      success: true,
      message: 'Menu published successfully',
      publishedBy: payload.email,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Publish error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/deploy - Deploy to live site (Vercel)
app.post('/api/deploy', async (req, res) => {
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

    // Set response headers for streaming
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Transfer-Encoding', 'chunked');

    res.write(`Starting deployment to Vercel...\nDeployed by: ${payload.email}\n\n`);

    // Check if git has changes to commit
    const gitStatus = await new Promise((resolve) => {
      exec('git status --porcelain', (error, stdout) => {
        resolve(stdout.trim());
      });
    });

    if (gitStatus) {
      res.write('Committing menu changes to git...\n');

      // Commit changes
      await new Promise((resolve, reject) => {
        exec('git add data/sample_menu.json', (error) => {
          if (error) {
            res.write(`Error adding files: ${error.message}\n`);
            reject(error);
            return;
          }

          const commitMsg = `Update menu - Published by ${payload.email}`;
          exec(`git commit -m "${commitMsg}"`, (error, stdout, stderr) => {
            if (error && !error.message.includes('nothing to commit')) {
              res.write(`Error committing: ${error.message}\n`);
              reject(error);
              return;
            }
            res.write(stdout || 'No changes to commit\n');
            resolve();
          });
        });
      });
    } else {
      res.write('No changes to commit.\n');
    }

    // Push to remote (Vercel auto-deploys on push)
    res.write('\nPushing to remote repository...\n');
    const pushProcess = exec('git push origin main');

    pushProcess.stdout.on('data', (data) => {
      res.write(data);
    });

    pushProcess.stderr.on('data', (data) => {
      res.write(data); // Git outputs to stderr even for normal messages
    });

    pushProcess.on('close', (code) => {
      if (code === 0) {
        res.write('\n\n✅ Deployment triggered! Vercel will auto-deploy from git.\n');
        res.write('Check deployment status at: https://vercel.com/dashboard\n');
      } else {
        res.write(`\n\n❌ Push failed with code ${code}\n`);
      }
      res.end();
    });

  } catch (error) {
    console.error('Deploy error:', error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, error: error.message });
    } else {
      res.write(`\n\n❌ Deployment error: ${error.message}\n`);
      res.end();
    }
  }
});

// GET /api/history - Get publish history
app.get('/api/history', (req, res) => {
  try {
    const backupDir = './data/backups';

    if (!fs.existsSync(backupDir)) {
      return res.json([]);
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

    res.json(history);
  } catch (error) {
    console.error('History error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/menu/preview - Get preview menu
app.get('/api/menu/preview', (req, res) => {
  try {
    const previewPath = './data/sample_menu.preview.json';

    if (!fs.existsSync(previewPath)) {
      return res.status(404).json({ error: 'Preview menu not found. Run sync first.' });
    }

    const previewData = JSON.parse(fs.readFileSync(previewPath, 'utf8'));
    res.json(previewData);
  } catch (error) {
    console.error('Preview menu error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/menu/production - Get production menu
app.get('/api/menu/production', (req, res) => {
  try {
    const productionPath = './data/sample_menu.json';

    if (!fs.existsSync(productionPath)) {
      return res.status(404).json({ error: 'Production menu not found.' });
    }

    const productionData = JSON.parse(fs.readFileSync(productionPath, 'utf8'));
    res.json(productionData);
  } catch (error) {
    console.error('Production menu error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.listen(PORT, () => {
  console.log(`\n🚀 Admin API Server Running`);
  console.log(`================================`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Server: http://localhost:${PORT}`);
  console.log(`Admin Panel: http://localhost:${PORT}/admin.html`);
  console.log(`Health Check: http://localhost:${PORT}/api/health`);
  console.log(`================================\n`);
  console.log(`Authorized Admins: ${ADMIN_EMAILS.join(', ')}`);
  console.log(`\nPress Ctrl+C to stop the server\n`);
});
