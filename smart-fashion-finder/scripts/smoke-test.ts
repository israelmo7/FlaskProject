/**
 * Lightweight smoke tests for inventory matching + distance helpers.
 * Run: npx tsx scripts/smoke-test.ts
 */
import inventoryData from '../src/data/inventory.json';
import { haversineKm } from '../src/utils/distance';
import type { GarmentAnalysis, InventoryItem, Store } from '../src/types';

const stores = inventoryData.stores as Store[];
const inventory = inventoryData.inventory as InventoryItem[];
const user = inventoryData.userDefaultLocation;

let failed = 0;

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error('FAIL:', message);
    failed += 1;
  } else {
    console.log('PASS:', message);
  }
}

const analysis: GarmentAnalysis = {
  id: 't1',
  category: 'Pants',
  subcategory: 'Cargo Pants',
  color: 'Olive Green',
  pattern: 'Solid',
  fit: 'Relaxed',
  gender: 'Unisex',
  estimatedPriceMin: 150,
  estimatedPriceMax: 300,
  confidence: 0.9,
  boundingBoxes: [],
  source: 'upload',
};

const oliveCargos = inventory.filter(
  (i) => i.category === 'Pants' && i.color.includes('Olive'),
);
assert(oliveCargos.length >= 5, `expected >=5 olive cargo inventory rows, got ${oliveCargos.length}`);

const withStores = oliveCargos.map((item) => {
  const store = stores.find((s) => s.id === item.storeId)!;
  const distanceKm = haversineKm(user, {
    latitude: store.latitude,
    longitude: store.longitude,
  });
  return { item, store, distanceKm };
});

assert(
  withStores.every((m) => m.distanceKm >= 0 && m.distanceKm < 20),
  'all Haifa demo stores within 20km of default user location',
);

const within5 = withStores.filter((m) => m.distanceKm <= 5);
assert(within5.length >= 3, `expected >=3 matches within 5km, got ${within5.length}`);

const inStock = withStores.filter((m) => m.item.stockStatus === 'in_stock');
assert(inStock.length >= 1, 'at least one in-stock olive cargo match');

assert(analysis.category === 'Pants', 'analysis fixture category is Pants');

const boutiques = stores.filter((s) => s.isBoutique);
assert(boutiques.length >= 2, `expected >=2 boutiques, got ${boutiques.length}`);

const sizeM = oliveCargos.filter((i) =>
  (i.sizeStock || []).some((s) => s.size === 'M' && s.qty > 0),
);
assert(sizeM.length >= 1, 'at least one olive cargo with size M in stock');

const missingSizeXL = oliveCargos.filter(
  (i) => !(i.sizeStock || []).some((s) => s.size === 'XL' && s.qty > 0),
);
assert(missingSizeXL.length >= 1, 'some stores lack XL (size-gap demo)');

const withPhone = stores.filter((s) => Boolean(s.phone));
assert(withPhone.length >= 3, 'stores have phone numbers for pilot');

const withHours = stores.filter((s) => Array.isArray(s.hours) && s.hours.length > 0);
assert(withHours.length >= 3, 'stores have opening hours');

// Size / height fit helpers
import {
  heightScale,
  sizeFitScale,
  sizeRelativeToHeight,
} from '../src/constants/avatar';
import { extractIntent, colorMatches } from '../src/services/fashionChatIntent';

import {
  categoryToSlot,
  garmentFitOnBody,
  parseHeightInput,
  wearPiece,
} from '../src/constants/avatar';
import { garmentHang, garmentFitTransform } from '../src/constants/garmentLayout';
import {
  CANONICAL_ANCHORS,
  overlayLayoutFor,
  SLOT_ANCHOR,
  SLOT_Z_INDEX,
  STANDARD_FIT,
} from '../src/constants/overlayAnchors';
import { outfitPresentationMode } from '../src/constants/outfitPresentation';
import type { OutfitPiece } from '../src/types';

// Standard Fit — גובה/מידה לא משנים סקייל ויזואלי
assert(heightScale(140, 'woman') === 1, 'standard fit: heightScale always 1');
assert(heightScale(190, 'man') === 1, 'standard fit: tall heightScale still 1');
assert(sizeFitScale('S') === 1 && sizeFitScale('XL') === 1, 'standard fit: sizeFitScale always 1');
assert(sizeRelativeToHeight('S', 178) === 1, 'standard fit: sizeRelativeToHeight always 1');
assert(garmentFitOnBody('L', 165) === 1, 'standard fit: garmentFitOnBody always 1');
assert(parseHeightInput('1.78', 'man') === 178, '1.78 meters parses to 178cm');
assert(parseHeightInput('178', 'man') === 178, '178 cm parses as 178');

const hangL = garmentHang('L', 140, 'top');
const hangS = garmentHang('S', 178, 'top');
assert(hangL.scaleY === hangS.scaleY, 'standard fit: hang scaleY ignores size');
assert(hangL.translateY === hangS.translateY, 'standard fit: hang ignore size/height');

const fitS = garmentFitTransform('S', 170, 'top', { bodyScale: 1, y: 0, x: 0 });
const fitL = garmentFitTransform('L', 190, 'top', { bodyScale: 1, y: 0, x: 0 });
assert(fitL.scaleX === fitS.scaleX && fitL.scaleY === fitS.scaleY, 'standard fit: L == S visually');
assert(fitL.translateY === fitS.translateY, 'standard fit: no hem shift by size');
assert(fitS.zIndex === SLOT_Z_INDEX.top, 'anchor: top zIndex');
assert(fitS.anchor === 'shoulders', 'anchor: top → shoulders');

// Anchor Points — רשת 480×900 + מיפוי סלוטים
assert(STANDARD_FIT.width === 480 && STANDARD_FIT.height === 900, 'standard fit canvas 480×900');
assert(SLOT_ANCHOR.hat === 'head', 'anchor: hat → head');
assert(SLOT_ANCHOR.top === 'shoulders' && SLOT_ANCHOR.outer === 'shoulders', 'anchor: tops/outer → shoulders');
assert(SLOT_ANCHOR.bottom === 'hips', 'anchor: bottom → hips');
assert(SLOT_ANCHOR.shoes === 'feet', 'anchor: shoes → feet');
assert(
  SLOT_Z_INDEX.bottom < SLOT_Z_INDEX.top &&
    SLOT_Z_INDEX.top < SLOT_Z_INDEX.outer &&
    SLOT_Z_INDEX.outer < SLOT_Z_INDEX.hat,
  'anchor: zIndex bottom < top < outer < hat',
);
assert(CANONICAL_ANCHORS.hips.y > CANONICAL_ANCHORS.shoulders.y, 'anchor: hips below shoulders');

const bottomBaked = overlayLayoutFor('man', 'bottom', 'baked');
assert(bottomBaked.translateY < 0, 'anchor: bottoms shift up to cover boxers');
assert(bottomBaked.scaleY > 1, 'anchor: bottoms slightly enlarged for waist cover');
const outerCut = overlayLayoutFor('man', 'outer', 'cutout');
assert(outerCut.translateY >= 0.07, 'anchor: outer cutout shifted down off face');
assert(outerCut.scaleY === 1, 'anchor: outer cutout no vertical scale (keeps neck clear)');
const hatLayout = overlayLayoutFor('woman', 'hat', 'cutout');
assert(hatLayout.anchor === 'head' && hatLayout.zIndex === SLOT_Z_INDEX.hat, 'anchor: woman hat → head');

// Fitted Look key coverage — parse avatarAssets.ts (avoid require() of PNGs in Node)
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const CATALOG_IDS = [
  'p-tshirt',
  'p-hoodie',
  'p-oxford',
  'p-turtleneck',
  'p-polo',
  'p-linen',
  'p-jeans',
  'p-shorts',
  'p-cargo',
  'p-sport',
  'p-chinos',
  'p-swim',
  'p-denim-jkt',
  'p-leather',
  'p-bomber',
  'p-dress',
  'p-sneakers',
  'p-boots',
  'p-hat',
  'p-underwear',
  'p-socks',
  'p-tshirt-white',
  'p-tshirt-navy',
  'p-hoodie-black',
  'p-tee-stripe',
  'p-cardigan',
  'p-jeans-black',
  'p-jeans-light',
  'p-joggers',
  'p-suit',
  'p-blazer',
  'p-coat',
  'p-skirt',
  'p-cap',
  'p-sandals',
] as const;

const avatarAssetsSrc = readFileSync(
  join(process.cwd(), 'src/constants/avatarAssets.ts'),
  'utf8',
);
const manBlock = avatarAssetsSrc.slice(
  avatarAssetsSrc.indexOf('export const FITTED_LOOKS_MAN'),
  avatarAssetsSrc.indexOf('export const FITTED_LOOKS_WOMAN'),
);
const womanBlock = avatarAssetsSrc.slice(
  avatarAssetsSrc.indexOf('export const FITTED_LOOKS_WOMAN'),
  avatarAssetsSrc.indexOf('export const FITTED_COMBOS'),
);
for (const id of CATALOG_IDS) {
  const inMan = manBlock.includes(`'${id}'`);
  const inWoman = womanBlock.includes(`'${id}'`);
  assert(inMan || inWoman, `Fitted Look key/placeholder for ${id}`);
  assert(inWoman, `woman Fitted Look key/placeholder for ${id}`);
}

const shirtA: OutfitPiece = {
  id: 'p-tshirt-M',
  label: 'טי א',
  category: 'Shirts',
  subcategory: 'טי שירט',
  color: 'Black',
  size: 'M',
  slot: categoryToSlot('Shirts'),
};
const shirtB: OutfitPiece = {
  id: 'p-hoodie-L',
  label: 'קפוצ׳ון',
  category: 'Shirts',
  subcategory: 'אוברסייז',
  color: 'Beige',
  size: 'L',
  slot: categoryToSlot('Shirts'),
};
const jeans: OutfitPiece = {
  id: 'p-jeans-M',
  label: 'ג׳ינס',
  category: 'Pants',
  subcategory: 'ג׳ינס',
  color: 'Blue',
  size: 'M',
  slot: categoryToSlot('Pants'),
};
const jeans2: OutfitPiece = {
  id: 'p-jeans-black-M',
  label: 'ג׳ינס שחור',
  category: 'Pants',
  subcategory: 'ג׳ינס',
  color: 'Black',
  size: 'M',
  slot: categoryToSlot('Pants'),
};
let outfit = wearPiece({}, shirtA);
outfit = wearPiece(outfit, jeans);
assert(Boolean(outfit.top && outfit.bottom), 'shirt + jeans both stay');
outfit = wearPiece(outfit, shirtB);
assert(outfit.top?.id === shirtB.id && outfit.bottom?.id === jeans.id, 'new shirt replaces old; jeans stay');
outfit = wearPiece(outfit, jeans2);
assert(outfit.bottom?.id === jeans2.id && outfit.top?.id === shirtB.id, 'new jeans replace old; shirt stays');

const outer: OutfitPiece = {
  id: 'p-bomber-M',
  label: 'בומבר',
  category: 'Outerwear',
  subcategory: 'ג׳קט',
  color: 'Black',
  size: 'M',
  slot: categoryToSlot('Outerwear'),
};
outfit = wearPiece(outfit, outer);
assert(
  Boolean(outfit.top && outfit.bottom && outfit.outer),
  'A1 wearPiece: top+bottom+outer all stay',
);

// A1 presentation — בלי טעינת PNGs
const comboKeys = new Set(['p-tshirt|p-jeans', 'p-bomber|p-jeans']);
const hasCombo = (a: string, b: string) => comboKeys.has(`${a}|${b}`);
assert(
  outfitPresentationMode(
    { topId: 'p-tshirt', bottomId: 'p-jeans', outerId: null, dressId: null },
    hasCombo,
  ) === 'combo',
  'A1: top+bottom with combo → combo',
);
assert(
  outfitPresentationMode(
    {
      topId: 'p-hoodie',
      bottomId: 'p-jeans',
      outerId: 'p-bomber',
      dressId: null,
    },
    hasCombo,
  ) === 'overlay',
  'A1: top+bottom+outer → overlay (all visible)',
);
assert(
  outfitPresentationMode(
    {
      topId: 'p-hoodie',
      bottomId: 'p-jeans',
      outerId: null,
      dressId: null,
    },
    hasCombo,
  ) === 'overlay',
  'A1: top+bottom without combo → overlay',
);
assert(
  outfitPresentationMode(
    {
      topId: null,
      bottomId: 'p-jeans',
      outerId: 'p-bomber',
      dressId: null,
    },
    hasCombo,
  ) === 'combo',
  'A1: outer+bottom with combo (no top) → combo',
);
assert(
  outfitPresentationMode(
    {
      topId: 'p-tshirt',
      bottomId: 'p-underwear',
      outerId: null,
      dressId: null,
    },
    hasCombo,
  ) === 'single',
  'A1: top only (underwear bottom) → single',
);

// Phase D search intent — שפה חופשית
const buttonDown = extractIntent('חולצה לבנה מכופתרת');
assert(buttonDown.category === 'Shirts', 'chat: מכופתרת → Shirts');
assert(buttonDown.color === 'White', 'chat: מכופתרת → White');
assert(
  buttonDown.subcategoryHint === 'אוקספורד',
  'chat: מכופתרת → hint אוקספורד',
);
const coatIntent = extractIntent('מעיל חורף שחור');
assert(coatIntent.category === 'Outerwear', 'chat: מעיל → Outerwear');
assert(coatIntent.color === 'Black', 'chat: מעיל → Black');

const blackShirtIntent = extractIntent('חולצה שחורה עד 150');
assert(blackShirtIntent.category === 'Shirts', 'chat intent category Shirts');
assert(blackShirtIntent.color === 'Black', 'chat intent color Black');
assert(blackShirtIntent.maxPrice === 150, 'chat intent maxPrice 150');

const jeansIntent = extractIntent('ג׳ינס כחול');
assert(jeansIntent.category === 'Pants', 'chat intent jeans → Pants');
assert(jeansIntent.color === 'Blue', 'chat intent jeans color Blue');

assert(colorMatches('Black', 'Black'), 'exact black matches');
assert(!colorMatches('Charcoal', 'Black'), 'charcoal is not black');
assert(!colorMatches('Beige', 'Black'), 'beige is not black');
assert(colorMatches('Blue', 'Blue'), 'exact blue matches');
assert(!colorMatches('Light Wash', 'Blue'), 'light wash is not blue');

// סימולציית match קשיח (בלי טעינת תמונות מהקטלוג)
const demoCatalog = [
  { id: 'p-tshirt', category: 'Shirts', color: 'Black', price: 89 },
  { id: 'p-hoodie', category: 'Shirts', color: 'Beige', price: 179 },
  { id: 'p-bomber', category: 'Outerwear', color: 'Black', price: 299 },
  { id: 'p-jeans', category: 'Pants', color: 'Blue', price: 219 },
  { id: 'p-shorts', category: 'Pants', color: 'Light Wash', price: 159 },
];
const hardMatch = demoCatalog.filter(
  (p) =>
    (!blackShirtIntent.category || p.category === blackShirtIntent.category) &&
    (!blackShirtIntent.color || colorMatches(p.color, blackShirtIntent.color)) &&
    (typeof blackShirtIntent.maxPrice !== 'number' ||
      p.price <= blackShirtIntent.maxPrice),
);
assert(hardMatch.length === 1 && hardMatch[0].id === 'p-tshirt', 'hard match only black shirt');

const jeansHard = demoCatalog.filter(
  (p) =>
    (!jeansIntent.category || p.category === jeansIntent.category) &&
    (!jeansIntent.color || colorMatches(p.color, jeansIntent.color)),
);
assert(jeansHard.length === 1 && jeansHard[0].id === 'p-jeans', 'hard match only blue jeans');

if (failed > 0) {
  console.error(`\n${failed} assertion(s) failed`);
  process.exit(1);
}
console.log('\nAll smoke tests passed.');
