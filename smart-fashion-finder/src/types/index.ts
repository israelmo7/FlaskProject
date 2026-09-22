export type GarmentCategory = 'Pants' | 'Shirts' | 'Outerwear' | 'Dresses' | 'Shoes';
export type GenderFilter = 'Men' | 'Women' | 'Unisex';
export type DistanceRadius = 1 | 5 | 10;
export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';
export type BodyType = 'slim' | 'regular' | 'athletic' | 'plus';

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
}

export interface GarmentAnalysis {
  id: string;
  category: GarmentCategory;
  subcategory: string;
  color: string;
  pattern: string;
  fit: string;
  gender: GenderFilter;
  estimatedPriceMin: number;
  estimatedPriceMax: number;
  confidence: number;
  boundingBoxes: BoundingBox[];
  imageUri?: string;
  source: 'upload' | 'camera' | 'avatar';
}

export interface Store {
  id: string;
  name: string;
  brand: string;
  logoColor: string;
  mall: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
}

export interface InventoryItem {
  id: string;
  storeId: string;
  name: string;
  category: GarmentCategory;
  subcategory: string;
  color: string;
  pattern: string;
  gender: GenderFilter;
  sizes: string[];
  price: number;
  stockStatus: StockStatus;
  stockCount: number;
}

export interface StoreMatch {
  store: Store;
  item: InventoryItem;
  distanceKm: number;
}

export interface SearchFilters {
  category: GarmentCategory | 'All';
  distanceKm: DistanceRadius;
  gender: GenderFilter | 'All';
}

export interface RecentSearch {
  id: string;
  label: string;
  category: GarmentCategory;
  color: string;
  timestamp: string;
}

export interface TrendingStyle {
  id: string;
  title: string;
  category: GarmentCategory;
  color: string;
  tag: string;
}
