require('dotenv').config();
const { google } = require('googleapis');

const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const SERVICE_ACCOUNT_PATH = process.env.SERVICE_ACCOUNT_PATH;

async function testAccess() {
  console.log('Testing Google Sheets access...');
  console.log('Sheet ID:', SHEET_ID);
  console.log('Service Account Path:', SERVICE_ACCOUNT_PATH);
  console.log('');

  try {
    // Authenticate
    const auth = new google.auth.GoogleAuth({
      keyFile: SERVICE_ACCOUNT_PATH,
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets.readonly',
        'https://www.googleapis.com/auth/drive.readonly'
      ],
    });

    const client = await auth.getClient();
    console.log('✅ Authentication successful');
    console.log('');

    // Try to get spreadsheet metadata first
    const sheets = google.sheets({ version: 'v4', auth: client });

    console.log('Attempting to get spreadsheet metadata...');
    const metadata = await sheets.spreadsheets.get({
      spreadsheetId: SHEET_ID,
    });

    console.log('✅ Spreadsheet metadata retrieved:');
    console.log('  Title:', metadata.data.properties.title);
    console.log('  Sheets:');
    metadata.data.sheets.forEach(sheet => {
      console.log(`    - ${sheet.properties.title} (${sheet.properties.sheetId})`);
    });
    console.log('');

    // Try to read data
    console.log('Attempting to read data from "Menu Items" tab...');
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Menu Items',
    });

    console.log('✅ Data retrieved successfully!');
    console.log('  Rows:', response.data.values ? response.data.values.length : 0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('');
    console.error('Full error details:');
    console.error(JSON.stringify(error, null, 2));
  }
}

testAccess();
