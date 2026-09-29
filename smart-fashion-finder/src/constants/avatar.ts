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

/**
 * Standard Fit — מבנה גוף לא משנה את רוחב הדמות הוויזואלי.
 * (נשמר לפרופיל/מלאי בלבד)
 */
export function buildWidthScale(_build: BodyBuild): number {
  return 1;
}

/** גובה ייחוס אבסולוטי (ס״מ) — מטא־דאטה בלבד */
export const ABS_REF_HEIGHT_CM = 165;

/**
 * Standard Fit — גובה הפרופיל לא משנה את גודל הדמות הוויזואלי.
 */
export function heightScale(
  _heightCm: number,
  _persona?: AvatarPersona,
): number {
  return 1;
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

/** @deprecated Standard Fit — תמיד 1 */
export function sizeRelativeToHeight(_size: string, _heightCm: number): number {
  return 1;
}

/** @deprecated Standard Fit — תמיד 1 (מידה נשמרת למלאי בלבד) */
export function sizeFitScale(_size: string): number {
  return 1;
}

/** @deprecated Standard Fit — תמיד 1 */
export function garmentFitOnBody(
  _size?: string,
  _heightCm?: number,
): number {
  return 1;
}

/**
 * Fitted Look כברירת מחדל לגבר/אישה — תמונת גוף+בגד מיושרת,
 * בלי שכבות overlay עם scale/translate דינמי.
 */
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

/**
 * הוספת פריט לשכבות:
 * - אותו סלוט מחליף (ג׳ינס→ג׳ינס, חולצה→חולצה)
 * - סלוטים שונים נשארים יחד (מכנסיים + חולצה)
 */
export function wearPiece(layers: OutfitLayers, piece: OutfitPiece): OutfitLayers {
  const next: OutfitLayers = { ...layers };

  // הלבשה תחתונה = חזרה לבסיס חשוף
  if (piece.category === 'Underwear') {
    return {
      bottom: piece,
      shoes: next.shoes,
      hat: next.hat,
    };
  }

  if (piece.slot === 'dress') {
    // שמלה מחליפה עליון+תחתון, לא נוגעת בנעליים/כובע/עליונית
    const { top: _t, bottom: _b, ...rest } = next;
    return { ...rest, dress: piece };
  }

  // חליפה מלאה — מחליפה עליון/תחתון/שמלה (לוק Perfect-Fit אחד)
  if (piece.slot === 'outer' && piece.id.includes('p-suit')) {
    return {
      outer: piece,
      shoes: next.shoes,
      hat: next.hat,
    };
  }

  // חולצה/מכנסיים — מסירים שמלה אם יש, אבל לא את הסלוט השני
  if (piece.slot === 'top' || piece.slot === 'bottom') {
    delete next.dress;
  }

  // החלפת אותו סלוט בלבד (הקודם נעלם, האחרים נשארים)
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
  { id: 'p-tshirt-white', label: 'טי לבנה', category: 'Shirts', color: 'White', subcategory: 'טי שירט' },
  { id: 'p-jeans-black', label: 'ג׳ינס שחור', category: 'Pants', color: 'Black', subcategory: 'ג׳ינס' },
  { id: 'p-hoodie-black', label: 'קפוצ׳ון שחור', category: 'Shirts', color: 'Black', subcategory: 'אוברסייז' },
  { id: 'p-blazer', label: 'בלייזר', category: 'Outerwear', color: 'Navy', subcategory: 'בלייזר' },
  { id: 'p-joggers', label: 'ג׳וגרס', category: 'Pants', color: 'Charcoal', subcategory: 'מכנס ספורט' },
];
