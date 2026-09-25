import { ImageSourcePropType } from 'react-native';
import type { GarmentCategory } from '@/types';

export type ProductCard = {
  id: string;
  title: string;
  price?: number;
  image: ImageSourcePropType;
  category: GarmentCategory;
  color: string;
  subcategory: string;
  badge?: string;
  /** מזהה שכבה להלבשת הבובה (אופציונלי) */
  layerId?: string;
  brand?: string;
  storeName?: string;
};

/** ~10 פריטים להלבשה דרך קטגוריות */
export const PRODUCTS: ProductCard[] = [
  {
    id: 'p-tshirt',
    title: 'טי שירט שחורה',
    price: 89,
    image: require('../../assets/images/product-tshirt.png'),
    category: 'Shirts',
    color: 'Black',
    subcategory: 'טי שירט',
    brand: 'Zara',
    storeName: 'Zara גרנד קניון',
    layerId: 'w-black-shirt',
  },
  {
    id: 'p-hoodie',
    title: 'קפוצ׳ון אוברסייז',
    price: 179,
    image: require('../../assets/images/product-hoodie.png'),
    category: 'Shirts',
    color: 'Beige',
    subcategory: 'אוברסייז',
    brand: 'Castro',
    storeName: 'Castro גרנד קניון',
  },
  {
    id: 'p-oxford',
    title: 'אוקספורד לבן',
    price: 149,
    image: require('../../assets/images/layers/white-shirt-v2.png'),
    category: 'Shirts',
    color: 'White',
    subcategory: 'אוקספורד',
    brand: 'H&M',
    storeName: 'H&M לב המפרץ',
    layerId: 'w-white-oxford',
  },
  {
    id: 'p-turtleneck',
    title: 'חולצת גולף',
    price: 129,
    image: require('../../assets/images/product-turtleneck.png'),
    category: 'Shirts',
    color: 'Navy',
    subcategory: 'גולף',
    brand: 'Golf',
    storeName: 'Golf & Co',
  },
  {
    id: 'p-jeans',
    title: 'ג׳ינס כחול',
    price: 219,
    image: require('../../assets/images/product-jeans.png'),
    category: 'Pants',
    color: 'Blue',
    subcategory: 'ג׳ינס',
    brand: 'Zara',
    storeName: 'Zara גרנד קניון',
    layerId: 'w-blue-jeans',
  },
  {
    id: 'p-shorts',
    title: 'ג׳ינס קצר',
    price: 159,
    image: require('../../assets/images/product-denim-shorts.png'),
    category: 'Pants',
    color: 'Light Wash',
    subcategory: 'ג׳ינס קצר',
    brand: 'Pull&Bear',
    storeName: 'Pull&Bear',
  },
  {
    id: 'p-cargo',
    title: 'קרגו זית',
    price: 199,
    image: require('../../assets/images/product-cargo.png'),
    category: 'Pants',
    color: 'Olive Green',
    subcategory: 'קרגו',
    brand: 'Terminal X',
    storeName: 'Terminal X',
    layerId: 'w-olive-cargo',
  },
  {
    id: 'p-sport',
    title: 'מכנס ספורט',
    price: 139,
    image: require('../../assets/images/product-sport-pants.png'),
    category: 'Pants',
    color: 'Navy',
    subcategory: 'מכנס ספורט',
    brand: 'Adidas',
    storeName: 'Adidas',
  },
  {
    id: 'p-denim-jkt',
    title: 'ג׳קט ג׳ינס',
    price: 279,
    image: require('../../assets/images/product-denim-jacket.png'),
    category: 'Outerwear',
    color: 'Light Wash',
    subcategory: 'ג׳קט ג׳ינס',
    brand: 'Castro',
    storeName: 'Castro גרנד קניון',
    layerId: 'w-denim-jacket',
  },
  {
    id: 'p-leather',
    title: 'ז׳קט עור',
    price: 350,
    image: require('../../assets/images/product-leather.png'),
    category: 'Outerwear',
    color: 'Brown',
    subcategory: 'ז׳קט עור',
    brand: 'Atelier Carmel',
    storeName: 'Atelier Carmel',
  },
  {
    id: 'p-dress',
    title: 'שמלה חומה',
    price: 199,
    image: require('../../assets/images/product-dress.png'),
    category: 'Dresses',
    color: 'Brown',
    subcategory: 'שמלה',
    brand: 'Victoria',
    storeName: 'Victoria',
  },
  {
    id: 'p-sneakers',
    title: 'סניקרס לבנות',
    price: 329,
    image: require('../../assets/images/product-sneakers.png'),
    category: 'Shoes',
    color: 'White',
    subcategory: 'סניקרס',
    brand: 'Nike',
    storeName: 'Foot Locker',
    layerId: 'w-sneakers',
  },
  {
    id: 'p-hat',
    title: 'כובע שחור',
    price: 79,
    image: require('../../assets/images/product-hat.png'),
    category: 'Hats',
    color: 'Black',
    subcategory: 'כובע',
    brand: 'Zara',
    storeName: 'Zara גרנד קניון',
    layerId: 'w-hat',
  },
];

export type MenuCategory = {
  id: GarmentCategory;
  label: string;
  subs: string[];
};

export const MENU_CATEGORIES: MenuCategory[] = [
  {
    id: 'Shirts',
    label: 'חולצות',
    subs: ['טי שירט', 'אוברסייז', 'גולף', 'אוקספורד'],
  },
  {
    id: 'Pants',
    label: 'מכנסיים',
    subs: ['ג׳ינס', 'ג׳ינס קצר', 'בגד ים', 'מכנס ספורט', 'קרגו'],
  },
  {
    id: 'Outerwear',
    label: 'עליוניות',
    subs: ['ג׳קט ג׳ינס', 'ז׳קט עור'],
  },
  {
    id: 'Underwear',
    label: 'הלבשה תחתונה',
    subs: ['הלבשה תחתונה'],
  },
  {
    id: 'Dresses',
    label: 'שמלות',
    subs: ['שמלה'],
  },
  {
    id: 'Shoes',
    label: 'נעליים',
    subs: ['סניקרס'],
  },
  {
    id: 'Hats',
    label: 'כובעים',
    subs: ['כובע'],
  },
  {
    id: 'Socks',
    label: 'גרביים',
    subs: ['גרביים'],
  },
];

export type BrandCircle = {
  id: string;
  name: string;
  color: string;
  initials: string;
};

export const BRANDS: BrandCircle[] = [
  { id: 'zara', name: 'Zara', color: '#1A1A1A', initials: 'ZA' },
  { id: 'castro', name: 'Castro', color: '#C45C26', initials: 'CA' },
  { id: 'adidas', name: 'Adidas', color: '#000000', initials: 'AD' },
  { id: 'nike', name: 'Nike', color: '#111111', initials: 'NK' },
  { id: 'footlocker', name: 'Foot Locker', color: '#E31837', initials: 'FL' },
  { id: 'victoria', name: 'Victoria', color: '#8B4557', initials: 'VI' },
  { id: 'eli-gadi', name: 'אלי וגדי', color: '#2E5A3C', initials: 'אג' },
  { id: 'rami', name: 'רמי', color: '#1E3A5F', initials: 'רמ' },
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

export function filterProducts(opts: {
  category?: GarmentCategory | 'All' | null;
  subcategory?: string | null;
}): ProductCard[] {
  const { category, subcategory } = opts;
  return PRODUCTS.filter((p) => {
    if (category && category !== 'All' && p.category !== category) return false;
    if (subcategory && p.subcategory !== subcategory) return false;
    return true;
  });
}
