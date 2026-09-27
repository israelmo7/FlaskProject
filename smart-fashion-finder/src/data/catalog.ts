import { ImageSourcePropType } from 'react-native';
import type { GarmentCategory } from '@/types';
import inventoryData from '@/data/inventory.json';

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
  storeId?: string;
  /** כתובת חנות לתצוגה */
  storeAddress?: string;
  storeArea?: string;
  latitude?: number;
  longitude?: number;
};

type InvStore = {
  id: string;
  name: string;
  mall: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
};

const INV_STORES = inventoryData.stores as InvStore[];

function storeFields(storeId: string): Pick<
  ProductCard,
  'storeId' | 'storeName' | 'storeAddress' | 'storeArea' | 'latitude' | 'longitude'
> {
  const s = INV_STORES.find((x) => x.id === storeId);
  if (!s) {
    return {
      storeId,
      storeName: 'חנות',
      storeAddress: 'חיפה',
      storeArea: 'חיפה',
      latitude: 32.794,
      longitude: 34.9896,
    };
  }
  return {
    storeId: s.id,
    storeName: `${s.name} · ${s.mall}`,
    storeAddress: `${s.address}, ${s.city}`,
    storeArea: s.mall,
    latitude: s.latitude,
    longitude: s.longitude,
  };
}

/** קטלוג הלבשה — לכל פריט חנות + קואורדינטות מפוזרות בחיפה */
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
    layerId: 'w-black-shirt',
    ...storeFields('store-zara-german'),
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
    ...storeFields('store-castro-kiryat'),
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
    layerId: 'w-white-oxford',
    ...storeFields('store-hm-technion'),
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
    ...storeFields('store-golf-checkpost'),
  },
  {
    id: 'p-polo',
    title: 'פולו זית',
    price: 119,
    image: require('../../assets/images/product-polo.png'),
    category: 'Shirts',
    color: 'Olive Green',
    subcategory: 'פולו',
    brand: 'Castro',
    ...storeFields('store-castro-gc'),
  },
  {
    id: 'p-linen',
    title: 'חולצת פשתן',
    price: 169,
    image: require('../../assets/images/product-linen.png'),
    category: 'Shirts',
    color: 'Beige',
    subcategory: 'פשתן',
    brand: 'H&M',
    ...storeFields('store-hm-lev'),
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
    layerId: 'w-blue-jeans',
    ...storeFields('store-zara-gc'),
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
    ...storeFields('store-pullbear-ck'),
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
    layerId: 'w-olive-cargo',
    ...storeFields('store-terminal-x'),
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
    ...storeFields('store-adidas-carmel'),
  },
  {
    id: 'p-chinos',
    title: 'צ׳ינו חאקי',
    price: 189,
    image: require('../../assets/images/product-chinos.png'),
    category: 'Pants',
    color: 'Khaki',
    subcategory: 'צ׳ינו',
    brand: 'Fox',
    ...storeFields('store-fox-city'),
  },
  {
    id: 'p-swim',
    title: 'בגד ים',
    price: 99,
    image: require('../../assets/images/product-swim.png'),
    category: 'Pants',
    color: 'Navy',
    subcategory: 'בגד ים',
    brand: 'Nike',
    ...storeFields('store-nike-batgalim'),
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
    layerId: 'w-denim-jacket',
    ...storeFields('store-castro-gc'),
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
    ...storeFields('store-local-atelier'),
  },
  {
    id: 'p-bomber',
    title: 'בומבר שחור',
    price: 299,
    image: require('../../assets/images/product-bomber.png'),
    category: 'Outerwear',
    color: 'Black',
    subcategory: 'בומבר',
    brand: 'Zara',
    ...storeFields('store-zara-german'),
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
    ...storeFields('store-victoria-carmel'),
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
    layerId: 'w-sneakers',
    ...storeFields('store-footlocker-lev'),
  },
  {
    id: 'p-boots',
    title: 'מגפוני עור',
    price: 379,
    image: require('../../assets/images/product-boots.png'),
    category: 'Shoes',
    color: 'Brown',
    subcategory: 'מגפיים',
    brand: 'רמי',
    ...storeFields('store-rami-hadar'),
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
    layerId: 'w-hat',
    ...storeFields('store-eli-neve'),
  },
  {
    id: 'p-underwear',
    title: 'תחתון בוקסר',
    price: 59,
    image: require('../../assets/images/product-underwear.png'),
    category: 'Underwear',
    color: 'Charcoal',
    subcategory: 'הלבשה תחתונה',
    brand: 'Fox',
    ...storeFields('store-fox-city'),
  },
  {
    id: 'p-socks',
    title: 'גרביים לבנות',
    price: 39,
    image: require('../../assets/images/product-socks.png'),
    category: 'Socks',
    color: 'White',
    subcategory: 'גרביים',
    brand: 'Adidas',
    ...storeFields('store-adidas-carmel'),
  },
  // ——— הרחבת קטלוג ———
  {
    id: 'p-tshirt-white',
    title: 'טי שירט לבנה',
    price: 79,
    image: require('../../assets/images/product-tshirt.png'),
    category: 'Shirts',
    color: 'White',
    subcategory: 'טי שירט',
    brand: 'Bershka',
    ...storeFields('store-pullbear-ck'),
  },
  {
    id: 'p-tshirt-navy',
    title: 'טי שירט נייבי',
    price: 95,
    image: require('../../assets/images/product-tshirt.png'),
    category: 'Shirts',
    color: 'Navy',
    subcategory: 'טי שירט',
    brand: 'Mango',
    ...storeFields('store-hm-lev'),
  },
  {
    id: 'p-hoodie-black',
    title: 'קפוצ׳ון שחור',
    price: 199,
    image: require('../../assets/images/product-hoodie.png'),
    category: 'Shirts',
    color: 'Black',
    subcategory: 'אוברסייז',
    brand: 'Nike',
    ...storeFields('store-nike-batgalim'),
  },
  {
    id: 'p-tee-stripe',
    title: 'חולצת פסים',
    price: 109,
    image: require('../../assets/images/product-polo.png'),
    category: 'Shirts',
    color: 'Navy',
    subcategory: 'חולצת פסים',
    brand: 'Renuar',
    ...storeFields('store-golf-checkpost'),
  },
  {
    id: 'p-cardigan',
    title: 'קרדיגן רך',
    price: 159,
    image: require('../../assets/images/product-turtleneck.png'),
    category: 'Shirts',
    color: 'Beige',
    subcategory: 'קרדיגן',
    brand: 'Mango',
    ...storeFields('store-hm-technion'),
  },
  {
    id: 'p-jeans-black',
    title: 'ג׳ינס שחור',
    price: 229,
    image: require('../../assets/images/product-jeans.png'),
    category: 'Pants',
    color: 'Black',
    subcategory: 'ג׳ינס',
    brand: 'American Eagle',
    ...storeFields('store-zara-german'),
  },
  {
    id: 'p-jeans-light',
    title: 'ג׳ינס בהיר',
    price: 209,
    image: require('../../assets/images/product-jeans.png'),
    category: 'Pants',
    color: 'Light Wash',
    subcategory: 'ג׳ינס',
    brand: 'Bershka',
    ...storeFields('store-castro-kiryat'),
  },
  {
    id: 'p-joggers',
    title: 'ג׳וגרס אפור',
    price: 149,
    image: require('../../assets/images/product-sport-pants.png'),
    category: 'Pants',
    color: 'Charcoal',
    subcategory: 'מכנס ספורט',
    brand: 'Adidas',
    ...storeFields('store-adidas-carmel'),
  },
  {
    id: 'p-blazer',
    title: 'בלייזר כחול',
    price: 329,
    image: require('../../assets/images/product-denim-jacket.png'),
    category: 'Outerwear',
    color: 'Navy',
    subcategory: 'בלייזר',
    brand: 'Renuar',
    ...storeFields('store-golf-gc'),
  },
  {
    id: 'p-coat',
    title: 'מעיל חורף',
    price: 399,
    image: require('../../assets/images/product-leather.png'),
    category: 'Outerwear',
    color: 'Charcoal',
    subcategory: 'מעיל',
    brand: 'Mango',
    ...storeFields('store-hm-lev'),
  },
  {
    id: 'p-skirt',
    title: 'חצאית מידי',
    price: 179,
    image: require('../../assets/images/product-dress.png'),
    category: 'Dresses',
    color: 'Black',
    subcategory: 'חצאית',
    brand: 'Victoria',
    ...storeFields('store-victoria-carmel'),
  },
  {
    id: 'p-cap',
    title: 'כובע מצחייה',
    price: 89,
    image: require('../../assets/images/product-hat.png'),
    category: 'Hats',
    color: 'Navy',
    subcategory: 'כובע מצחייה',
    brand: 'Nike',
    ...storeFields('store-nike-batgalim'),
  },
  {
    id: 'p-sandals',
    title: 'סנדלים',
    price: 199,
    image: require('../../assets/images/product-sneakers.png'),
    category: 'Shoes',
    color: 'Beige',
    subcategory: 'סנדלים',
    brand: 'H&M',
    ...storeFields('store-hm-technion'),
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
    subs: [
      'טי שירט',
      'אוברסייז',
      'גולף',
      'אוקספורד',
      'פולו',
      'פשתן',
      'חולצת פסים',
      'קרדיגן',
    ],
  },
  {
    id: 'Pants',
    label: 'מכנסיים',
    subs: ['ג׳ינס', 'ג׳ינס קצר', 'בגד ים', 'מכנס ספורט', 'קרגו', 'צ׳ינו'],
  },
  {
    id: 'Outerwear',
    label: 'עליוניות',
    subs: ['ג׳קט ג׳ינס', 'ז׳קט עור', 'בומבר', 'בלייזר', 'מעיל'],
  },
  {
    id: 'Underwear',
    label: 'הלבשה תחתונה',
    subs: ['הלבשה תחתונה'],
  },
  {
    id: 'Dresses',
    label: 'שמלות',
    subs: ['שמלה', 'חצאית'],
  },
  {
    id: 'Shoes',
    label: 'נעליים',
    subs: ['סניקרס', 'מגפיים', 'סנדלים'],
  },
  {
    id: 'Hats',
    label: 'כובעים',
    subs: ['כובע', 'כובע מצחייה'],
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
  { id: 'hm', name: 'H&M', color: '#E50010', initials: 'HM' },
  { id: 'bershka', name: 'Bershka', color: '#1C1C1C', initials: 'BE' },
  { id: 'mango', name: 'Mango', color: '#C4A35A', initials: 'MG' },
  { id: 'renuar', name: 'Renuar', color: '#2C3E50', initials: 'RE' },
  { id: 'ae', name: 'American Eagle', color: '#B22222', initials: 'AE' },
  { id: 'adidas', name: 'Adidas', color: '#000000', initials: 'AD' },
  { id: 'nike', name: 'Nike', color: '#111111', initials: 'NK' },
  { id: 'fox', name: 'Fox', color: '#E85D04', initials: 'FX' },
  { id: 'golf', name: 'Golf', color: '#1B4332', initials: 'GO' },
  { id: 'pullbear', name: 'Pull&Bear', color: '#3D3D3D', initials: 'PB' },
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

export function productById(id: string): ProductCard | undefined {
  return PRODUCTS.find((p) => p.id === id);
}
