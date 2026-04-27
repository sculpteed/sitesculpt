import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { generateFluxImage } from '../lib/providers/fal-image';

const PROMPT = [
  'Modern boutique real estate brokerage website listings page, full webpage screenshot view, vertical page composition.',
  'TOP NAV BAR: cream-colored navigation bar with a small serif wordmark "Thornhill" on the left, four short text nav links spelled clearly ("Buy", "Sell", "Agents", "Contact"), and a small dark cognac rounded "Find a home" button on the right.',
  'BELOW NAV: a horizontal search bar across the page width, containing three small chip-style dropdown filters with placeholder labels ("Location", "Price", "Beds") and a small dark cognac "Search" button at the right end.',
  'BELOW SEARCH: a strict three-column property-listing grid with exactly six identical-style property cards arranged in two rows of three. EVERY card has the SAME structure: top half is a stylized illustration of a different brick-and-stone townhouse / brownstone facade with a green tree, bottom half of the card has a single cream content area with a placeholder address line, a placeholder price line in dark cognac, and a small horizontal row of three tiny stat icons. NO icon-only cards. NO empty cards. NO mixed card layouts — every card looks the same structurally.',
  'Style: editorial real-estate website aesthetic similar to Compass or Sotheby\'s. Color palette: warm cream background (#f5f1ea), deep cognac (#5a3a23), soft sage accents.',
  'CRITICAL: every property card must have a fully-rendered illustrated house — no abstract icon-only cards. Realistic web layout proportions. NO real brand logos. NO actual readable address text. 16:9 aspect ratio.',
].join(' ');

async function main(): Promise<void> {
  console.log('regenerating real-estate-site with sharper card-grid prompt...');
  const pngBytes = await generateFluxImage({ prompt: PROMPT, aspect: '16:9' });
  const jpegPath = path.join(process.cwd(), 'public', 'templates', 'real-estate-site.jpg');
  const jpegBytes = await sharp(pngBytes).jpeg({ quality: 92 }).toBuffer();
  await fs.writeFile(jpegPath, jpegBytes);
  console.log(`saved -> ${jpegPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
