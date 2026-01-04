import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, '..', 'public');
const sourceIcon = path.join(publicDir, 'images', 'logo-veterans-orden.png');

// Icon sizes to generate
const icons = [
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'favicon-48x48.png', size: 48 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'android-chrome-192x192.png', size: 192 },
  { name: 'android-chrome-512x512.png', size: 512 },
  { name: 'mstile-70x70.png', size: 70 },
  { name: 'mstile-144x144.png', size: 144 },
  { name: 'mstile-150x150.png', size: 150 },
  { name: 'mstile-310x310.png', size: 310 },
];

// Wide tile (special aspect ratio)
const wideTile = { name: 'mstile-310x150.png', width: 310, height: 150 };

async function generateIcons() {
  console.log('Reading source icon:', sourceIcon);

  // Read the source ico file
  const sourceBuffer = fs.readFileSync(sourceIcon);

  // Generate square icons
  for (const icon of icons) {
    const outputPath = path.join(publicDir, icon.name);
    console.log(`Generating ${icon.name} (${icon.size}x${icon.size})...`);

    await sharp(sourceBuffer)
      .resize(icon.size, icon.size, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toFile(outputPath);
  }

  // Generate wide tile (centered with padding)
  console.log(`Generating ${wideTile.name} (${wideTile.width}x${wideTile.height})...`);
  await sharp(sourceBuffer)
    .resize(wideTile.height, wideTile.height, { // Use height as the square size
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .extend({
      top: 0,
      bottom: 0,
      left: Math.floor((wideTile.width - wideTile.height) / 2),
      right: Math.ceil((wideTile.width - wideTile.height) / 2),
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .png()
    .toFile(path.join(publicDir, wideTile.name));

  // For favicon.ico, we'll use the 32x32 PNG as source
  // (ICO generation would require additional tools - the existing favico.ico can be kept)
  console.log('Note: favicon.ico should be created from favicon-32x32.png using an ICO converter');
  console.log('Keeping existing favico.ico and copying to favicon.ico...');
  const existingIco = path.join(publicDir, 'favico.ico');
  const faviconPath = path.join(publicDir, 'favicon.ico');
  if (fs.existsSync(existingIco)) {
    fs.copyFileSync(existingIco, faviconPath);
  }

  console.log('\nAll icons generated successfully!');
  console.log('Generated files:');
  icons.forEach(i => console.log(`  - ${i.name}`));
  console.log(`  - ${wideTile.name}`);
  console.log('  - favicon.ico');
}

generateIcons().catch(console.error);
