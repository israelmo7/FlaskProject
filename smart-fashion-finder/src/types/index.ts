export type GarmentCategory =
  | 'Pants'
  | 'Shirts'
  | 'Outerwear'
  | 'Dresses'
  | 'Shoes'
  | 'Underwear'
  | 'Hats'
  | 'Socks';
export type GenderFilter = 'Men' | 'Women' | 'Unisex';
export type DistanceRadius = 1 | 5 | 10;
export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';
/** @deprecated השתמשו ב־BodyBuild */
export type BodyType = 'slim' | 'regular' | 'athletic' | 'plus';

/** קבוצות גיל + מין לבובה */
export type AvatarPersona =
  | 'boy'
  | 'girl'
  | 'teenBoy'
  | 'teenGirl'
  | 'man'
  | 'woman';

/** מבנה גוף — ניסוח עדין */
export type BodyBuild = 'slim' | 'average' | 'full' | 'plus';

export type OutfitSlot = 'top' | 'bottom' | 'outer' | 'shoes' | 'dress';

/** מצב חיפוש לפי מיקום בדף הבית */
export type LocationSearchMode = 'nearby' | 'other' | 'onTheWay';

export interface OutfitPiece {
  id: string;
  label: string;
  category: GarmentCategory;
  subcategory: string;
  color: string;
  size: string;
  slot: OutfitSlot;
}

export interface OutfitLayers {
  top?: OutfitPiece;
  bottom?: OutfitPiece;
  outer?: OutfitPiece;
  shoes?: OutfitPiece;
  dress?: OutfitPiece;
}

export interface AvatarProfile {
  persona: AvatarPersona;
  /** גובה בס״מ */
  heightCm: number;
  build: BodyBuild;
}

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
  source: 'upload' | 'camera' | 'avatar' | 'manual';
  size?: string;
  /** האם התוצאה עברה תיוג ידני */
  manuallyTagged?: boolean;
}

export interface StoreHours {
  /** 0=ראשון … 6=שבת */
  day: number;
  open: string;
  close: string;
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
  isBoutique?: boolean;
  phone?: string;
  whatsapp?: string;
  hours?: StoreHours[];
}

export interface SizeStock {
  size: string;
  qty: number;
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
  /** מלאי לפי מידה */
  sizeStock: SizeStock[];
  price: number;
  stockStatus: StockStatus;
  stockCount: number;
}

export interface StoreMatch {
  store: Store;
  item: InventoryItem;
  distanceKm: number;
  hasPreferredSize: boolean;
}

export interface SearchFilters {
  category: GarmentCategory | 'All';
  distanceKm: DistanceRadius;
  gender: GenderFilter | 'All';
  preferredSize: string;
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
