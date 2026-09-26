import type { GarmentCategory } from '@/types';

export type ChatIntent = {
  category?: GarmentCategory;
  color?: string;
  brand?: string;
  maxPrice?: number;
  keywords: string[];
  occasion?: string;
};

const COLOR_MAP: { keys: string[]; color: string }[] = [
  { keys: ['שחור', 'black'], color: 'Black' },
  { keys: ['לבן', 'white'], color: 'White' },
  { keys: ['כחול', 'blue', 'ג׳ינס', "ג'ינס", 'denim'], color: 'Blue' },
  { keys: ['בז', 'בז׳', 'beige', 'קרם'], color: 'Beige' },
  { keys: ['חום', 'brown'], color: 'Brown' },
  { keys: ['זית', 'ירוק', 'olive', 'green'], color: 'Olive Green' },
  { keys: ['נייבי', 'כחול כהה', 'navy'], color: 'Navy' },
];

const CATEGORY_MAP: { keys: string[]; category: GarmentCategory }[] = [
  {
    keys: [
      'חולצה',
      'טי שירט',
      'טישירט',
      'אוקספורד',
      'קפוצ',
      'hoodie',
      'shirt',
      'tshirt',
      'גולף',
    ],
    category: 'Shirts',
  },
  {
    keys: ['מכנס', 'ג׳ינס', "ג'ינס", 'קרגו', 'shorts', 'pants', 'jeans'],
    category: 'Pants',
  },
  {
    keys: ['ג׳קט', "ג'קט", 'ז׳קט', "ז'קט", 'עליונ', 'jacket', 'leather', 'עור'],
    category: 'Outerwear',
  },
  { keys: ['שמלה', 'dress'], category: 'Dresses' },
  { keys: ['נעל', 'סניקרס', 'shoes', 'sneaker'], category: 'Shoes' },
  { keys: ['כובע', 'hat'], category: 'Hats' },
];

const BRAND_KEYS = [
  'zara',
  'castro',
  'nike',
  'adidas',
  'h&m',
  'hm',
  'victoria',
  'golf',
  'pull&bear',
  'terminal',
];

function capitalizeBrand(b: string): string {
  if (b === 'zara') return 'Zara';
  if (b === 'castro') return 'Castro';
  if (b === 'nike') return 'Nike';
  if (b === 'adidas') return 'Adidas';
  if (b === 'victoria') return 'Victoria';
  if (b === 'golf') return 'Golf';
  if (b === 'pull&bear') return 'Pull&Bear';
  return b;
}

/** חילוץ כוונה מהודעת משתמש (עברית / אנגלית) — בלי תלות בתמונות */
export function extractIntent(text: string, prev?: ChatIntent): ChatIntent {
  const t = text.trim().toLowerCase();
  const intent: ChatIntent = {
    category: prev?.category,
    color: prev?.color,
    brand: prev?.brand,
    maxPrice: prev?.maxPrice,
    keywords: [...(prev?.keywords ?? [])],
    occasion: prev?.occasion,
  };

  for (const row of CATEGORY_MAP) {
    if (row.keys.some((k) => t.includes(k.toLowerCase()))) {
      intent.category = row.category;
      break;
    }
  }

  for (const row of COLOR_MAP) {
    if (row.keys.some((k) => t.includes(k.toLowerCase()))) {
      intent.color = row.color;
      break;
    }
  }

  for (const b of BRAND_KEYS) {
    if (t.includes(b)) {
      intent.brand =
        b === 'hm' ? 'H&M' : b === 'terminal' ? 'Terminal X' : capitalizeBrand(b);
      break;
    }
  }

  const priceMatch =
    t.match(/(?:עד|מתחת|under|max)?\s*₪?\s*(\d{2,4})/) ||
    t.match(/(\d{2,4})\s*(?:שקל|ש״ח|ש"ח|ils)?/);
  if (priceMatch) {
    const n = Number(priceMatch[1]);
    if (n >= 40 && n <= 2000) intent.maxPrice = n;
  }

  if (/חורף|גשם|קר|jacket|winter/.test(t)) {
    intent.occasion = 'winter';
    if (!intent.category) intent.category = 'Outerwear';
  }
  if (/קיץ|חם|summer|beach/.test(t)) {
    intent.occasion = 'summer';
    if (!intent.category) intent.category = 'Pants';
  }
  if (/ערב|חתונה|elegant|fancy/.test(t)) {
    intent.occasion = 'evening';
    if (!intent.category) intent.category = 'Dresses';
  }
  if (/ספורט|sport|run/.test(t)) {
    intent.keywords.push('sport');
  }

  const words = t.split(/\s+/).filter((w) => w.length > 2);
  intent.keywords = Array.from(new Set([...intent.keywords, ...words])).slice(-12);

  return intent;
}

export function categoryHe(c?: GarmentCategory): string {
  switch (c) {
    case 'Shirts':
      return 'חולצה';
    case 'Pants':
      return 'מכנסיים';
    case 'Outerwear':
      return 'עליונית';
    case 'Dresses':
      return 'שמלה';
    case 'Shoes':
      return 'נעליים';
    case 'Hats':
      return 'כובע';
    default:
      return 'בגד';
  }
}
