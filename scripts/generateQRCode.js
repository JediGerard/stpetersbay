const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

// URL for your food ordering system
const orderingURL = 'https://spbgazebo.com/orderingsystem.html';

// Output file path
const outputPath = path.join(__dirname, '..', 'SPB-QRCode.png');

// QR Code options for high resolution
const options = {
  errorCorrectionLevel: 'H',  // High error correction (can still work if partially damaged)
  type: 'png',
  quality: 1,
  margin: 4,                   // White border around QR code
  width: 2000,                 // 2000x2000 pixels - high resolution for printing
  color: {
    dark: '#000000',           // Black QR code
    light: '#FFFFFF'           // White background
  }
};

console.log('Generating QR Code...');
console.log(`URL: ${orderingURL}`);
console.log(`Output: ${outputPath}`);
console.log('Resolution: 2000x2000 pixels');

QRCode.toFile(outputPath, orderingURL, options, function (err) {
  if (err) {
    console.error('Error generating QR code:', err);
    process.exit(1);
  }

  console.log('\n✅ QR Code generated successfully!');
  console.log(`📁 Saved to: ${outputPath}`);
  console.log('\n📱 This QR code points to:');
  console.log(`   ${orderingURL}`);
  console.log('\n🖨️  Print recommendations:');
  console.log('   - Minimum size: 2" x 2" (5cm x 5cm)');
  console.log('   - Recommended: 4" x 4" (10cm x 10cm) or larger');
  console.log('   - Print on white paper/card for best results');
  console.log('   - Test scanning before mass printing');
  console.log('\n💡 Make sure orderingsystem.html is uploaded to your website!');
});
