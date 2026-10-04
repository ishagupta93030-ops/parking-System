const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Minimal valid transparent 1x1 PNG
const pngBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');

['icon.png', 'splash.png', 'adaptive-icon.png', 'favicon.png'].forEach(file => {
  fs.writeFileSync(path.join(assetsDir, file), pngBuffer);
  console.log(`Created asset: ${file}`);
});
