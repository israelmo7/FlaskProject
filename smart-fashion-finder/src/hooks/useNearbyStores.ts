import { useMemo } from 'react';
import inventoryData from '@/data/inventory.json';
import type {
  GarmentAnalysis,
  InventoryItem,
  SearchFilters,
  Store,
  StoreMatch,
} from '@/types';
import { haversineKm, type Coordinates } from '@/utils/distance';

const stores = inventoryData.stores as Store[];
const inventory = inventoryData.inventory as InventoryItem[];

function matchesAnalysis(item: InventoryItem, analysis: GarmentAnalysis): boolean {
  const categoryOk = item.category === analysis.category;
  const colorOk =
    item.color.toLowerCase().includes(analysis.color.toLowerCase().split(' ')[0]) ||
    analysis.color.toLowerCase().includes(item.color.toLowerCase().split(' ')[0]);
  const genderOk =
    item.gender === 'Unisex' ||
    analysis.gender === 'Unisex' ||
    item.gender === analysis.gender;
  return categoryOk && colorOk && genderOk;
}

function matchesFilters(item: InventoryItem, filters: SearchFilters): boolean {
  const categoryOk =
    filters.category === 'All' || item.category === filters.category;
  const genderOk =
    filters.gender === 'All' ||
    item.gender === 'Unisex' ||
    item.gender === filters.gender;
  return categoryOk && genderOk;
}

function hasSize(item: InventoryItem, preferredSize: string): boolean {
  if (!preferredSize || preferredSize === 'All') return true;
  return item.sizes.includes(preferredSize);
}

export function useNearbyStores(
  userCoords: Coordinates,
  options: {
    analysis?: GarmentAnalysis | null;
    filters?: SearchFilters;
    /** כשפועל — מציגים רק חנויות שיש בהן את המידה */
    onlyMySize?: boolean;
  } = {},
): StoreMatch[] {
  const { analysis, filters, onlyMySize = false } = options;

  return useMemo(() => {
    const matches: StoreMatch[] = [];
    const preferredSize = filters?.preferredSize ?? 'All';

    for (const item of inventory) {
      if (analysis && !matchesAnalysis(item, analysis)) continue;
      if (filters && !matchesFilters(item, filters)) continue;

      const store = stores.find((s) => s.id === item.storeId);
      if (!store) continue;

      const distanceKm = haversineKm(userCoords, {
        latitude: store.latitude,
        longitude: store.longitude,
      });

      if (filters && distanceKm > filters.distanceKm) continue;

      const sizeMatch = hasSize(item, preferredSize);
      if (onlyMySize && preferredSize !== 'All' && !sizeMatch) continue;

      matches.push({
        store,
        item,
        distanceKm,
        hasPreferredSize: preferredSize === 'All' ? true : sizeMatch,
      });
    }

    return matches.sort((a, b) => {
      if (a.hasPreferredSize !== b.hasPreferredSize) {
        return a.hasPreferredSize ? -1 : 1;
      }
      const boutiqueBoost =
        Number(Boolean(b.store.isBoutique)) - Number(Boolean(a.store.isBoutique));
      if (boutiqueBoost !== 0 && a.item.stockStatus !== 'out_of_stock') {
        return boutiqueBoost > 0 ? 1 : -1;
      }
      const stockRank = (s: string) =>
        s === 'in_stock' ? 0 : s === 'low_stock' ? 1 : 2;
      const byStock = stockRank(a.item.stockStatus) - stockRank(b.item.stockStatus);
      if (byStock !== 0) return byStock;
      return a.distanceKm - b.distanceKm;
    });
  }, [userCoords, analysis, filters, onlyMySize]);
}

export function getStoreById(id: string): Store | undefined {
  return stores.find((s) => s.id === id);
}
