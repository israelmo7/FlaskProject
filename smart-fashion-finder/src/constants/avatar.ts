import type {
  AvatarPersona,
  AvatarProfile,
  BodyBuild,
  GarmentCategory,
  GenderFilter,
  OutfitLayers,
  OutfitPiece,
  OutfitSlot,
} from '@/types';

export const PERSONA_OPTIONS: { id: AvatarPersona; label: string }[] = [
  { id: 'boy', label: 'ילד' },
  { id: 'girl', label: 'ילדה' },
  { id: 'teenBoy', label: 'נער' },
  { id: 'teenGirl', label: 'נערה' },
  { id: 'man', label: 'גבר' },
  { id: 'woman', label: 'אישה' },
];

/** ניסוח עדין למבנה גוף */
export const BUILD_OPTIONS: { id: BodyBuild; label: string; hint: string }[] = [
  { id: 'slim', label: 'רזה', hint: 'מבנה דק' },
  { id: 'average', label: 'ממוצע', hint: 'מבנה רגיל' },
  { id: 'full', label: 'מלא', hint: 'מבנה רך ומלא' },
  { id: 'plus', label: 'פלוס סייז', hint: 'מבנה רחב' },
];

export const DEFAULT_AVATAR_PROFILE: AvatarProfile = {
  persona: 'woman',
  heightCm: 165,
  build: 'average',
  weightKg: 60,
};

export const WEIGHT_RANGE: Record<AvatarPersona, { min: number; max: number; default: number }> = {
  boy: { min: 20, max: 55, default: 32 },
  girl: { min: 20, max: 55, default: 30 },
  teenBoy: { min: 45, max: 95, default: 62 },
  teenGirl: { min: 40, max: 85, default: 55 },
  man: { min: 55, max: 130, default: 78 },
  woman: { min: 45, max: 110, default: 60 },
};

export const HEIGHT_RANGE: Record<AvatarPersona, { min: number; max: number; default: number }> = {
  boy: { min: 100, max: 150, default: 130 },
  girl: { min: 100, max: 150, default: 128 },
  teenBoy: { min: 150, max: 185, default: 170 },
  teenGirl: { min: 145, max: 175, default: 162 },
  man: { min: 160, max: 200, default: 178 },
  woman: { min: 150, max: 185, default: 165 },
};

export const SIZE_OPTIONS_BY_CATEGORY: Record<GarmentCategory, string[]> = {
  Pants: ['XS', 'S', 'M', 'L', 'XL', '30', '32', '34'],
  Shirts: ['XS', 'S', 'M', 'L', 'XL'],
  Outerwear: ['XS', 'S', 'M', 'L', 'XL'],
  Dresses: ['XS', 'S', 'M', 'L', 'XL'],
  Shoes: ['36', '37', '38', '39', '40', '41', '42', '43'],
  Underwear: ['XS', 'S', 'M', 'L', 'XL'],
  Hats: ['S', 'M', 'L'],
  Socks: ['S', 'M', 'L'],
};

export function isFemalePersona(persona: AvatarPersona): boolean {
  return persona === 'girl' || persona === 'teenGirl' || persona === 'woman';
}

export function personaToGenderFilter(persona: AvatarPersona): GenderFilter {
  return isFemalePersona(persona) ? 'Women' : 'Men';
}

export function buildWidthScale(build: BodyBuild): number {
  switch (build) {
    case 'slim':
      return 0.82;
    case 'average':
      return 1;
    case 'full':
      return 1.18;
    case 'plus':
      return 1.35;
  }
}

/** גובה ייחוס אבסולוטי (ס״מ) — כל הדמויות על אותו סולם */
export const ABS_REF_HEIGHT_CM = 165;

/**
 * סולם גובה הבובה לפי ס״מ אמיתיים.
 * 178 ס״מ (1.78מ׳) > 165 > 130 — ההבדל נראה על הבובה.
 */
export function heightScale(heightCm: number, _persona?: AvatarPersona): number {
  const raw = heightCm / ABS_REF_HEIGHT_CM;
  return Math.min(1.42, Math.max(0.58, raw));
}

/** המרת קלט גובה: 1.78 → 178, או 178 כמו שהוא */
export function parseHeightInput(raw: string, persona: AvatarPersona): number | null {
  const cleaned = raw.replace(',', '.').replace(/[^\d.]/g, '');
  const n = Number(cleaned);
  if (!Number.isFinite(n) || n <= 0) return null;
  const asCm = n > 0 && n < 3 ? Math.round(n * 100) : Math.round(n);
  const range = HEIGHT_RANGE[persona];
  return Math.min(range.max, Math.max(range.min, asCm));
}

export function formatHeightMeters(heightCm: number): string {
  return `${(heightCm / 100).toFixed(2)} מ׳`;
}

/** כמה הבגד גדול/קטן ביחס לגובה הגוף */
export function sizeRelativeToHeight(size: string, heightCm: number): number {
  const ideal =
    heightCm < 140 ? 0 : heightCm < 155 ? 1 : heightCm < 168 ? 2 : heightCm < 178 ? 3 : heightCm < 188 ? 4 : 5;
  const map: Record<string, number> = {
    XS: 0,
    S: 1,
    M: 2,
    L: 3,
    XL: 4,
    '30': 1,
    '32': 2,
    '34': 3,
    '36': 4,
    '36S': 2,
    '37': 2,
    '38': 2,
    '39': 3,
    '40': 3,
    '41': 3,
    '42': 4,
    '43': 4,
  };
  const idx = map[size.toUpperCase()] ?? 2;
  const delta = idx - Math.min(4, ideal);
  // S על 178ס״מ → קטן יותר · L על 165 → גדול יותר
  return Math.min(1.35, Math.max(0.68, 1 + delta * 0.12));
}

/** סולם מידה אבסולוטי — L גדול מ־S */
export function sizeFitScale(size: string): number {
  const s = size.toUpperCase();
  if (s === 'XS' || s === '30') return 0.78;
  if (s === 'S' || s === '32' || s === '36' || s === '37') return 0.88;
  if (s === 'M' || s === '34' || s === '38' || s === '39') return 1;
  if (s === 'L' || s === '40' || s === '41') return 1.14;
  if (s === 'XL' || s === '42' || s === '43' || Number(s) >= 42) return 1.26;
  return 1;
}

/**
 * התאמת בגד לבובה: מידת הפריט × התאמה לגובה.
 * L על אותו גוף נראה גדול יותר מ־S.
 */
export function garmentFitOnBody(size: string | undefined, heightCm: number): number {
  if (!size) return 1;
  const bySize = sizeFitScale(size);
  const byHeight = sizeRelativeToHeight(size, heightCm);
  // ממוצע משוקלל — הבדל מידות בולט, עדיין יושב על הגוף
  return Math.min(1.4, Math.max(0.65, bySize * 0.55 + byHeight * 0.45));
}

export function usesPaintedAdultLooks(persona: AvatarPersona): boolean {
  return persona === 'man' || persona === 'woman';
}

export function categoryToSlot(category: GarmentCategory): OutfitSlot {
  switch (category) {
    case 'Shirts':
      return 'top';
    case 'Pants':
    case 'Underwear':
      return 'bottom';
    case 'Outerwear':
      return 'outer';
    case 'Hats':
      return 'hat';
    case 'Dresses':
      return 'dress';
    case 'Shoes':
    case 'Socks':
      return 'shoes';
  }
}

/** הוספת פריט לשכבות — נשארים כל שאר הפריטים */
export function wearPiece(layers: OutfitLayers, piece: OutfitPiece): OutfitLayers {
  const next = { ...layers };
  // הלבשה תחתונה = חזרה לבסיס הדמות (מסירים בגדים עליונים)
  if (piece.category === 'Underwear') {
    return {
      bottom: piece,
      shoes: next.shoes,
      hat: next.hat,
    };
  }
  if (piece.slot === 'dress') {
    // שמלה מחליפה עליון ותחתון ויזואלית, אבל לא מוחקת נעליים/עליונית
    delete next.top;
    delete next.bottom;
    next.dress = piece;
    return next;
  }
  if (piece.slot === 'top' || piece.slot === 'bottom') {
    delete next.dress;
  }
  next[piece.slot] = piece;
  return next;
}

export function removeSlot(layers: OutfitLayers, slot: OutfitSlot): OutfitLayers {
  const next = { ...layers };
  delete next[slot];
  return next;
}

export function outfitSummary(layers: OutfitLayers): string {
  const parts = [
    layers.dress,
    layers.top,
    layers.bottom,
    layers.outer,
    layers.shoes,
    layers.hat,
  ]
    .filter(Boolean)
    .map((p) => `${p!.label} (${p!.size})`);
  return parts.length ? parts.join(' · ') : 'רק תחתונים';
}

export function garmentColorHex(color?: string): string {
  if (!color) return '#1F6B63';
  const key = color.toLowerCase();
  if (key.includes('olive')) return '#556B2F';
  if (key.includes('indigo') || key.includes('blue') || key.includes('כחול')) return '#3B5F8A';
  if (key.includes('black') || key.includes('שחור')) return '#1A1A1A';
  if (key.includes('white') || key.includes('לבן')) return '#EDE8DF';
  if (key.includes('navy')) return '#1E3A5F';
  if (key.includes('camel') || key.includes('beige') || key.includes('בז')) return '#C4A882';
  if (key.includes('brown') || key.includes('חום')) return '#6B4F3A';
  if (key.includes('charcoal')) return '#2A2A2A';
  if (key.includes('cream')) return '#D9CDB8';
  if (key.includes('terracotta')) return '#C2664A';
  if (key.includes('light wash')) return '#7A9BB8';
  if (key.includes('green') || key.includes('זית')) return '#556B2F';
  return '#1F6B63';
}

export type WardrobeItem = {
  id: string;
  label: string;
  category: GarmentCategory;
  color: string;
  subcategory: string;
};

/** ארון סטודיו — כל פריטי הקטלוג שניתן להלביש (מזהה = id קטלוג) */
export const WARDROBE_ITEMS: WardrobeItem[] = [
  { id: 'p-tshirt', label: 'טי שירט שחורה', category: 'Shirts', color: 'Black', subcategory: 'טי שירט' },
  { id: 'p-hoodie', label: 'קפוצ׳ון', category: 'Shirts', color: 'Beige', subcategory: 'אוברסייז' },
  { id: 'p-oxford', label: 'אוקספורד לבן', category: 'Shirts', color: 'White', subcategory: 'אוקספורד' },
  { id: 'p-turtleneck', label: 'גולף', category: 'Shirts', color: 'Navy', subcategory: 'גולף' },
  { id: 'p-polo', label: 'פולו זית', category: 'Shirts', color: 'Olive Green', subcategory: 'פולו' },
  { id: 'p-linen', label: 'פשתן', category: 'Shirts', color: 'Beige', subcategory: 'פשתן' },
  { id: 'p-jeans', label: 'ג׳ינס כחול', category: 'Pants', color: 'Blue', subcategory: 'ג׳ינס' },
  { id: 'p-shorts', label: 'ג׳ינס קצר', category: 'Pants', color: 'Light Wash', subcategory: 'ג׳ינס קצר' },
  { id: 'p-cargo', label: 'קרגו זית', category: 'Pants', color: 'Olive Green', subcategory: 'קרגו' },
  { id: 'p-sport', label: 'מכנס ספורט', category: 'Pants', color: 'Navy', subcategory: 'מכנס ספורט' },
  { id: 'p-chinos', label: 'צ׳ינו', category: 'Pants', color: 'Khaki', subcategory: 'צ׳ינו' },
  { id: 'p-swim', label: 'בגד ים', category: 'Pants', color: 'Navy', subcategory: 'בגד ים' },
  { id: 'p-denim-jkt', label: 'ג׳קט ג׳ינס', category: 'Outerwear', color: 'Light Wash', subcategory: 'ג׳קט ג׳ינס' },
  { id: 'p-leather', label: 'ז׳קט עור', category: 'Outerwear', color: 'Brown', subcategory: 'ז׳קט עור' },
  { id: 'p-bomber', label: 'בומבר שחור', category: 'Outerwear', color: 'Black', subcategory: 'בומבר' },
  { id: 'p-dress', label: 'שמלה חומה', category: 'Dresses', color: 'Brown', subcategory: 'שמלה' },
  { id: 'p-sneakers', label: 'סניקרס', category: 'Shoes', color: 'White', subcategory: 'סניקרס' },
  { id: 'p-boots', label: 'מגפונים', category: 'Shoes', color: 'Brown', subcategory: 'מגפיים' },
  { id: 'p-hat', label: 'כובע', category: 'Hats', color: 'Black', subcategory: 'כובע' },
  { id: 'p-underwear', label: 'תחתון', category: 'Underwear', color: 'Charcoal', subcategory: 'הלבשה תחתונה' },
  { id: 'p-socks', label: 'גרביים', category: 'Socks', color: 'White', subcategory: 'גרביים' },
];
