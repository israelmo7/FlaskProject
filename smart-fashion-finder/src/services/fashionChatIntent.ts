import type { GarmentCategory } from '@/types';

export type ChatIntent = {
  category?: GarmentCategory;
  color?: string;
  brand?: string;
  maxPrice?: number;
  keywords: string[];
  occasion?: string;
  /** תת־סוג חופשי (טי שירט, פולו, בומבר…) */
  subcategoryHint?: string;
};

const COLOR_MAP: { keys: string[]; color: string }[] = [
  { keys: ['שחור', 'black'], color: 'Black' },
  { keys: ['לבן', 'white'], color: 'White' },
  { keys: ['כחול כהה', 'נייבי', 'navy'], color: 'Navy' },
  { keys: ['כחול', 'blue'], color: 'Blue' },
  { keys: ['בז׳', 'בז', 'beige', 'קרם'], color: 'Beige' },
  { keys: ['חום', 'brown'], color: 'Brown' },
  { keys: ['זית', 'olive'], color: 'Olive Green' },
  { keys: ['ירוק', 'green'], color: 'Olive Green' },
  { keys: ['חאקי', 'khaki'], color: 'Khaki' },
  { keys: ['אפור', 'grey', 'gray', 'פחם', 'charcoal'], color: 'Charcoal' },
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
      'פולו',
      'polo',
      'פשתן',
      'linen',
    ],
    category: 'Shirts',
  },
  {
    keys: [
      'מכנס',
      'ג׳ינס',
      "ג'ינס",
      'jeans',
      'קרגו',
      'cargo',
      'shorts',
      'pants',
      'צ׳ינו',
      "צ'ינו",
      'chino',
      'בגד ים',
      'swim',
    ],
    category: 'Pants',
  },
  {
    keys: [
      'ג׳קט',
      "ג'קט",
      'ז׳קט',
      "ז'קט",
      'עליונ',
      'jacket',
      'leather',
      'עור',
      'בומבר',
      'bomber',
    ],
    category: 'Outerwear',
  },
  { keys: ['שמלה', 'dress'], category: 'Dresses' },
  {
    keys: ['נעל', 'סניקרס', 'shoes', 'sneaker', 'מגף', 'מגפי', 'boots'],
    category: 'Shoes',
  },
  { keys: ['כובע', 'hat'], category: 'Hats' },
  { keys: ['תחתון', 'בוקסר', 'underwear'], category: 'Underwear' },
  { keys: ['גרב', 'socks'], category: 'Socks' },
];

const SUB_HINTS: { keys: string[]; hint: string }[] = [
  { keys: ['טי שירט', 'טישירט', 'tshirt', 't-shirt'], hint: 'טי שירט' },
  { keys: ['קפוצ', 'hoodie'], hint: 'אוברסייז' },
  { keys: ['אוקספורד', 'oxford'], hint: 'אוקספורד' },
  { keys: ['גולף', 'turtleneck'], hint: 'גולף' },
  { keys: ['פולו', 'polo'], hint: 'פולו' },
  { keys: ['פשתן', 'linen'], hint: 'פשתן' },
  { keys: ['קרגו', 'cargo'], hint: 'קרגו' },
  { keys: ['צ׳ינו', "צ'ינו", 'chino'], hint: 'צ׳ינו' },
  { keys: ['בגד ים', 'swim'], hint: 'בגד ים' },
  { keys: ['ספורט', 'sport', 'jogger'], hint: 'מכנס ספורט' },
  { keys: ['קצר'], hint: 'קצר' },
  { keys: ['בומבר', 'bomber'], hint: 'בומבר' },
  { keys: ['עור', 'leather'], hint: 'עור' },
  { keys: ['ג׳ינס', "ג'ינס", 'denim', 'jeans'], hint: 'ג׳ינס' },
  { keys: ['סניקרס', 'sneaker'], hint: 'סניקרס' },
  { keys: ['מגף', 'מגפי', 'boot'], hint: 'מגפיים' },
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
  'fox',
  'רמי',
];

function capitalizeBrand(b: string): string {
  if (b === 'zara') return 'Zara';
  if (b === 'castro') return 'Castro';
  if (b === 'nike') return 'Nike';
  if (b === 'adidas') return 'Adidas';
  if (b === 'victoria') return 'Victoria';
  if (b === 'golf') return 'Golf';
  if (b === 'pull&bear') return 'Pull&Bear';
  if (b === 'fox') return 'Fox';
  if (b === 'רמי') return 'רמי';
  return b;
}

function looksLikeNewSearch(t: string): boolean {
  return (
    CATEGORY_MAP.some((row) => row.keys.some((k) => t.includes(k.toLowerCase()))) ||
    COLOR_MAP.some((row) => row.keys.some((k) => t.includes(k.toLowerCase()))) ||
    /חיפוש אחר|מחדש|reset/.test(t)
  );
}

/** חילוץ כוונה מהודעת משתמש (עברית / אנגלית) */
export function extractIntent(text: string, prev?: ChatIntent): ChatIntent {
  const t = text.trim().toLowerCase();
  const fresh = looksLikeNewSearch(t);

  const intent: ChatIntent = fresh
    ? { keywords: [] }
    : {
        category: prev?.category,
        color: prev?.color,
        brand: prev?.brand,
        maxPrice: prev?.maxPrice,
        keywords: [...(prev?.keywords ?? [])],
        occasion: prev?.occasion,
        subcategoryHint: prev?.subcategoryHint,
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

  for (const row of SUB_HINTS) {
    if (row.keys.some((k) => t.includes(k.toLowerCase()))) {
      intent.subcategoryHint = row.hint;
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

  if (/חורף|גשם|קר|winter/.test(t)) {
    intent.occasion = 'winter';
    if (!intent.category) intent.category = 'Outerwear';
  }
  if (/קיץ|חם|summer|beach/.test(t)) {
    intent.occasion = 'summer';
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
    case 'Underwear':
      return 'הלבשה תחתונה';
    case 'Socks':
      return 'גרביים';
    default:
      return 'בגד';
  }
}

/** התאמת צבע קשיחה לקטלוג — בלי «כמעט» שמזהם תוצאות */
export function colorMatches(productColor: string, intentColor: string): boolean {
  const pc = productColor.toLowerCase().trim();
  const ic = intentColor.toLowerCase().trim();
  if (pc === ic) return true;

  if (ic === 'black') return pc === 'black';
  if (ic === 'white') return pc === 'white' || pc.includes('white');
  if (ic === 'navy') return pc === 'navy' || pc.includes('navy');
  if (ic === 'blue') {
    // כחול / ג׳ינס — לא light wash של ג׳קט
    return (
      pc === 'blue' ||
      pc.includes('indigo') ||
      (pc.includes('blue') && !pc.includes('navy'))
    );
  }
  if (ic === 'beige') return pc.includes('beige') || pc.includes('cream');
  if (ic === 'olive green') return pc.includes('olive') || pc === 'olive green';
  if (ic === 'brown') return pc.includes('brown');
  if (ic === 'khaki') return pc.includes('khaki');
  if (ic === 'charcoal') {
    return pc.includes('charcoal') || pc === 'grey' || pc === 'gray';
  }
  // Light Wash וכו׳ — רק התאמה מדויקת / הכללה הדדית
  if (pc.includes(ic) || ic.includes(pc)) return true;
  return false;
}
