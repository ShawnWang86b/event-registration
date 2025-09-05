// This is a simple script to generate placeholder icons for PWA
// You should replace these with actual icons designed for your app

const fs = require('fs');
const path = require('path');

// Create a simple SVG icon template
const createSVGIcon = (size, text = 'ER') => {
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#0f172a"/>
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-weight="bold" font-size="${size * 0.4}">${text}</text>
</svg>`;
};

// Icon sizes needed for PWA
const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];

const publicDir = path.join(__dirname, '..', 'public');

// Generate placeholder icons
iconSizes.forEach(size => {
  const svgContent = createSVGIcon(size);
  const filename = `icon-${size}x${size}.png`;
  
  console.log(`Note: You should generate actual PNG icons for ${filename}`);
  console.log(`SVG template for ${size}x${size}:`);
  console.log(svgContent);
  console.log('---');
});

// Also generate smaller favicon sizes
const faviconSizes = [16, 32];
faviconSizes.forEach(size => {
  const svgContent = createSVGIcon(size);
  const filename = `icon-${size}x${size}.png`;
  
  console.log(`Note: You should generate actual PNG icons for ${filename}`);
  console.log(`SVG template for ${size}x${size}:`);
  console.log(svgContent);
  console.log('---');
});

console.log('\n📱 PWA Icons Setup Instructions:');
console.log('1. Use the SVG templates above to create PNG icons');
console.log('2. Use an online SVG to PNG converter or design tool');
console.log('3. Place all generated PNG files in the /public directory');
console.log('4. Recommended tools: Figma, Canva, or online SVG converters');
console.log('5. Make sure icons are square and optimized for different backgrounds');

module.exports = { createSVGIcon };
