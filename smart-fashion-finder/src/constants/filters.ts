import type { SearchFilters } from '@/types';

export const DEFAULT_FILTERS: SearchFilters = {
  category: 'All',
  distanceKm: 5,
  gender: 'All',
};

export const CATEGORY_OPTIONS = ['All', 'Pants', 'Shirts', 'Outerwear'] as const;
export const DISTANCE_OPTIONS = [1, 5, 10] as const;
export const GENDER_OPTIONS = ['All', 'Men', 'Women', 'Unisex'] as const;

export const BRAND_NAME = 'StyleNear';
export const BRAND_TAGLINE = 'Find the piece. Walk to the store.';
