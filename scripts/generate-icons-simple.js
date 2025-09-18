const fs = require('fs');
const path = require('path');

// Create icons directory if it doesn't exist
const iconsDir = path.join(__dirname, '../public/icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Create a simple SVG icon
const createSvgIcon = (size, text) => `
  <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="#0ea5e9"/>
    <text 
      x="50%" 
      y="50%" 
      font-family="Arial" 
      font-size="${size / 4}" 
      font-weight="bold" 
      fill="white" 
      text-anchor="middle" 
      dominant-baseline="middle"
    >
      ${text}
    </text>
  </svg>
`;

// Sizes needed for PWA
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Generate all icons
sizes.forEach(size => {
  const svg = createSvgIcon(size, `${size}x${size}`);
  fs.writeFileSync(path.join(iconsDir, `icon-${size}x${size}.png`), svg);
  console.log(`Generated icon: /icons/icon-${size}x${size}.png`);
});

// Create a simple favicon
const favicon = createSvgIcon(32, 'DS');
fs.writeFileSync(path.join(__dirname, '../public/favicon.ico'), favicon);
console.log('Generated favicon.ico');

console.log('\nAll icons have been generated in the /public/icons directory.');
