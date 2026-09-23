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
    id: 'p3',
    title: 'קולקציות חדשות לנשים',
    image: require('../../assets/images/product-collection.png'),
    category: 'Outerwear',
    color: 'Mixed',
    subcategory: 'Collection',
    badge: 'קולקציות חדשות לנשים',
  },
  {
    id: 'p4',
    title: 'close-up',
    image: require('../../assets/images/denim-swatch.png'),
    category: 'Pants',
    color: 'Blue',
    subcategory: 'Denim',
    badge: 'close-up',
  },
  {
    id: 'p5',
    title: 'מכנסיים מחויטים',
    price: 199,
    image: require('../../assets/images/product-turtleneck.png'),
    category: 'Shirts',
    color: 'Navy',
    subcategory: 'Turtleneck',
    badge: 'מכנסיים מחויטים',
  },
];
