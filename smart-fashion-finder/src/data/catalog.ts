import { ImageSourcePropType } from 'react-native';
import type { GarmentCategory } from '@/types';

export type ShopGender = 'women' | 'men' | 'accessories' | 'sale';

export type ProductCard = {
  id: string;
  title: string;
  price?: number;
  image: ImageSourcePropType;
  category: GarmentCategory;
  color: string;
  subcategory: string;
  badge?: string;
};

/** מוצרים אמיתיים בלבד — בלי כרטיסי קולאז׳ / close-up דקורטיביים */
export const PRODUCTS: ProductCard[] = [
  {
    id: 'p1',
    title: 'ז׳קט עור',
    price: 350,
    image: require('../../assets/images/product-leather.png'),
    category: 'Outerwear',
    color: 'Brown',
    subcategory: 'Leather Jacket',
  },
  {
    id: 'p2',
    title: 'שמלה חומה',
    price: 199,
    image: require('../../assets/images/product-dress.png'),
    category: 'Dresses',
    color: 'Brown',
    subcategory: 'Midi Dress',
  },
  {
    id: 'p5',
    title: 'חולצת גולף',
    price: 199,
    image: require('../../assets/images/product-turtleneck.png'),
    category: 'Shirts',
    color: 'Navy',
    subcategory: 'Turtleneck',
  },
];

export const PILOT_AREAS = [
  { id: 'grand-canyon', label: 'גרנד קניון', subtitle: 'חיפה · קניון' },
  { id: 'neot-peres', label: 'נאות פרס', subtitle: 'חיפה · שכונה' },
  { id: 'hadar', label: 'הדר', subtitle: 'חיפה · מרכז' },
  { id: 'all-haifa', label: 'כל חיפה', subtitle: 'פיילוט מלא' },
] as const;

export type PilotAreaId = (typeof PILOT_AREAS)[number]['id'];

export function areaLabelForId(id: string | undefined): string {
  const found = PILOT_AREAS.find((a) => a.id === id);
  return found?.label ?? 'אזור';
}
