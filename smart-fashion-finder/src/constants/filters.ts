import type { SearchFilters } from '@/types';
import { he } from '@/i18n/he';

export const DEFAULT_FILTERS: SearchFilters = {
  category: 'All',
  distanceKm: 5,
  gender: 'All',
  preferredSize: 'All',
};

export const CATEGORY_OPTIONS = ['All', 'Pants', 'Shirts', 'Outerwear'] as const;
export const DISTANCE_OPTIONS = [1, 5, 10] as const;
export const GENDER_OPTIONS = ['All', 'Men', 'Women', 'Unisex'] as const;

/** מידות נפוצות לפיילוט — המשתמש בוחר אחת כדי לסנן חנויות */
export const SIZE_OPTIONS = [
  'All',
  'XS',
  'S',
  'M',
  'L',
  'XL',
  '30',
  '32',
  '34',
] as const;

export const BRAND_NAME = he.brand;
export const BRAND_TAGLINE = he.tagline;
export const PILOT_FOCUS_MALL = 'Grand Canyon Haifa';
