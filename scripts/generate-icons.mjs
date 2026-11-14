// Genereert de PNG-iconen in public/ uit scripts/icon.svg. Draaien met: npm run icons
import sharp from 'sharp';
import { readFile, writeFile } from 'node:fs/promises';

const svg = await readFile(new URL('./icon.svg', import.meta.url));
const out = (name) => new URL(`../public/${name}`, import.meta.url).pathname;

// Volledig vlak (iOS rondt zelf af)
for (const [name, size] of [['apple-touch-icon.png', 180], ['icon-192.png', 192], ['icon-512.png', 512]]) {
  await sharp(svg, { density: 300 }).resize(size, size).png().toFile(out(name));
}
// Maskable: dezelfde tekening, ring past ruim binnen de veilige zone
await sharp(svg, { density: 300 }).resize(512, 512).png().toFile(out('icon-512-maskable.png'));

// Favicon: afgeronde variant
const rounded = svg.toString().replace('<rect width="1024" height="1024"', '<rect width="1024" height="1024" rx="230"');
await writeFile(out('favicon.svg'), rounded);
console.log('Iconen gegenereerd');
