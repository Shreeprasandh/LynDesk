const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Light theme background (#FFFFFF) with dark theme logo mark (#191919)
const iconSvg = `<svg width="500" height="500" viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="500" height="500" fill="#FFFFFF" />
  <g transform="translate(-155, -100) scale(1.64)">
    <path d="M235.5 254.499C235.5 254.499 188.497 296.002 180.998 299.001C173.5 302 167 295.5 169.5 285.5L210 139.999L348.5 299.001L209.5 299.001" stroke="#191919" stroke-width="14" stroke-linecap="square" stroke-linejoin="round"/>
    <path d="M272.792 231.101L263.871 221.192C260.791 217.772 255.522 217.496 252.102 220.576L242.193 229.497C238.773 232.577 238.497 237.846 241.576 241.266L250.498 251.175C253.578 254.595 258.847 254.871 262.267 251.792L272.175 242.87C275.596 239.79 275.872 234.521 272.792 231.101Z" fill="none" stroke="#191919" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M263.295 234.4L259.457 230.138L257.553 228.007L255.272 230.047L250.74 234.128L249.007 235.702L254.886 242.232L256.695 244.241L258.415 242.652L262.947 238.571L265.241 236.546L263.295 234.4Z" fill="#191919" stroke="#191919" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M286.124 203.419L281.544 207.295L289.295 216.455L293.876 212.58L290 208L286.124 203.419ZM306.876 201.58C309.405 199.439 309.721 195.653 307.58 193.124C305.44 190.594 301.654 190.279 299.124 192.419L303 197L306.876 201.58ZM290 208L293.876 212.58L306.876 201.58L303 197L299.124 192.419L286.124 203.419L290 208Z" fill="#191919"/>
    <path d="M281.295 187.994L313.354 188.448L308.912 220.201L281.295 187.994Z" fill="#191919"/>
    <path d="M192.5 293L199.928 305H177L192.5 293Z" fill="#191919"/>
  </g>
</svg>`;

async function generateFavicons() {
  const svgBuffer = Buffer.from(iconSvg);

  // Generate 512x512 PNG icon
  const png512 = await sharp(svgBuffer).resize(512, 512).png().toBuffer();
  // Generate 180x180 Apple touch icon
  const png180 = await sharp(svgBuffer).resize(180, 180).png().toBuffer();
  // Generate 32x32 Favicon PNG
  const png32 = await sharp(svgBuffer).resize(32, 32).png().toBuffer();
  // Generate JPEG fallback
  const jpg512 = await sharp(svgBuffer).resize(512, 512).jpeg({ quality: 95 }).toBuffer();

  // Save to src/app/
  fs.writeFileSync(path.join(__dirname, '../src/app/icon.png'), png512);
  fs.writeFileSync(path.join(__dirname, '../src/app/icon.jpg'), jpg512);
  fs.writeFileSync(path.join(__dirname, '../src/app/apple-icon.png'), png180);
  fs.writeFileSync(path.join(__dirname, '../src/app/favicon.ico'), png32);

  // Save to public/
  fs.writeFileSync(path.join(__dirname, '../public/icon.png'), png512);
  fs.writeFileSync(path.join(__dirname, '../public/apple-icon.png'), png180);
  fs.writeFileSync(path.join(__dirname, '../public/favicon.ico'), png32);

  console.log('✅ Light theme background PNG icons generated successfully!');
}

generateFavicons().catch(console.error);
