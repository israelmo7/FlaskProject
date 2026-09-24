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

const sizeM = oliveCargos.filter((i) => i.sizes.includes('M'));
assert(sizeM.length >= 1, 'at least one olive cargo with size M');

const missingSizeXL = oliveCargos.filter((i) => !i.sizes.includes('XL'));
assert(missingSizeXL.length >= 1, 'some stores lack XL (size-gap demo)');

if (failed > 0) {
  console.error(`\n${failed} assertion(s) failed`);
  process.exit(1);
}
console.log('\nAll smoke tests passed.');
