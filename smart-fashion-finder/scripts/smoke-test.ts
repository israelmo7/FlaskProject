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
import { garmentHang } from '../src/constants/garmentLayout';
import type { OutfitPiece } from '../src/types';

assert(heightScale(140, 'woman') < heightScale(165, 'woman'), '140cm doll shorter than 165cm');
assert(heightScale(178, 'man') > heightScale(165, 'woman'), '1.78m man taller than 1.65m woman');
assert(heightScale(190, 'man') > heightScale(178, 'man'), '190cm taller than 178cm');
assert(sizeFitScale('S') < sizeFitScale('M'), 'S garment smaller than M');
assert(sizeFitScale('L') > sizeFitScale('M'), 'L garment larger than M');
assert(
  sizeRelativeToHeight('S', 178) < sizeRelativeToHeight('M', 178),
  'S on 178cm looks smaller than M',
);
assert(garmentFitOnBody('L', 165) > garmentFitOnBody('S', 165), 'L fits larger than S on body');
assert(parseHeightInput('1.78', 'man') === 178, '1.78 meters parses to 178cm');
assert(parseHeightInput('178', 'man') === 178, '178 cm parses as 178');

const hangShortL = garmentHang('L', 140, 'top');
const hangTallS = garmentHang('S', 178, 'top');
assert(hangShortL.translateY > hangTallS.translateY, 'L on short body hangs lower');
assert(hangShortL.scaleY > hangTallS.scaleY, 'L on short body is longer');

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
