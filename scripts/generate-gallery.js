/**
 * generate-gallery.js
 *
 * GitHub Pages is static hosting — it cannot list a folder's contents
 * for the browser. So instead of hand-editing content/gallery.json every
 * time you add a photo, run this small script locally before you deploy.
 *
 * It scans assets/images/gallery/ and rebuilds content/gallery.json,
 * keeping any caption you already wrote for a photo that's still there.
 *
 * USAGE:
 *   node scripts/generate-gallery.js
 *
 * Requires only Node.js (no npm install needed).
 */

const fs = require('fs');
const path = require('path');

const GALLERY_DIR = path.join(__dirname, '..', 'assets', 'images', 'gallery');
const OUTPUT_FILE = path.join(__dirname, '..', 'content', 'gallery.json');
const VALID_EXT = ['.jpg', '.jpeg', '.png', '.webp'];

function main() {
  if (!fs.existsSync(GALLERY_DIR)) {
    console.error(`Gallery folder not found: ${GALLERY_DIR}`);
    process.exit(1);
  }

  const files = fs.readdirSync(GALLERY_DIR)
    .filter((f) => VALID_EXT.includes(path.extname(f).toLowerCase()))
    .sort();

  let existing = [];
  if (fs.existsSync(OUTPUT_FILE)) {
    try {
      existing = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf8'));
    } catch (e) {
      console.warn('Existing gallery.json could not be parsed, starting fresh.');
    }
  }

  const existingByImage = Object.fromEntries(existing.map((item) => [item.image, item]));

  const gallery = files.map((file) => ({
    image: file,
    caption: existingByImage[file]?.caption || ''
  }));

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(gallery, null, 2) + '\n');
  console.log(`✔ content/gallery.json updated with ${gallery.length} photo(s).`);
}

main();
