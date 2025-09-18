const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

// Create icons directory if it doesn't exist
const iconsDir = path.join(__dirname, '../public/icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Sizes needed for PWA
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Create a simple icon with text
const createIcon = (size, text) => {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Fill background
  ctx.fillStyle = '#0ea5e9';
  ctx.fillRect(0, 0, size, size);
  
  // Add text
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Calculate font size based on icon size
  const fontSize = Math.floor(size / 4);
  ctx.font = `bold ${fontSize}px Arial`;
  
  // Draw text
  ctx.fillText(text, size / 2, size / 2);
  
  return canvas;
};

// Generate all icons
sizes.forEach(size => {
  const canvas = createIcon(size, `${size}x${size}`);
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(iconsDir, `icon-${size}x${size}.png`), buffer);
  console.log(`Generated icon: /icons/icon-${size}x${size}.png`);
});

// Also create a favicon.ico
const favicon = createIcon(32, 'DS');
fs.writeFileSync(path.join(__dirname, '../public/favicon.ico'), favicon.toBuffer('image/x-icon'));
console.log('Generated favicon.ico');

console.log('\nAll icons have been generated in the /public/icons directory.');
