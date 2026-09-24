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

export function heightScale(heightCm: number, persona: AvatarPersona): number {
  const range = HEIGHT_RANGE[persona];
  const mid = (range.min + range.max) / 2;
  return Math.min(1.2, Math.max(0.75, heightCm / mid));
}

export function categoryToSlot(category: GarmentCategory): OutfitSlot {
  switch (category) {
    case 'Shirts':
    case 'Underwear':
      return 'top';
    case 'Pants':
    case 'Socks':
      return 'bottom';
    case 'Outerwear':
    case 'Hats':
      return 'outer';
    case 'Dresses':
      return 'dress';
    case 'Shoes':
      return 'shoes';
  }
}

/** הוספת פריט לשכבות — נשארים כל שאר הפריטים */
export function wearPiece(layers: OutfitLayers, piece: OutfitPiece): OutfitLayers {
  const next = { ...layers };
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
  const parts = [layers.dress, layers.top, layers.bottom, layers.outer, layers.shoes]
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

export const WARDROBE_ITEMS: WardrobeItem[] = [
  {
    id: 'w-black-shirt',
    label: 'חולצה שחורה',
    category: 'Shirts',
    color: 'Black',
    subcategory: 'T-Shirt',
  },
  {
    id: 'w-white-oxford',
    label: 'אוקספורד לבן',
    category: 'Shirts',
    color: 'White',
    subcategory: 'Oxford Shirt',
  },
  {
    id: 'w-olive-cargo',
    label: 'קרגו זית',
    category: 'Pants',
    color: 'Olive Green',
    subcategory: 'Cargo Pants',
  },
  {
    id: 'w-blue-jeans',
    label: 'ג׳ינס כחול',
    category: 'Pants',
    color: 'Blue',
    subcategory: 'Slim Fit Jeans',
  },
  {
    id: 'w-denim-jacket',
    label: 'ג׳קט ג׳ינס',
    category: 'Outerwear',
    color: 'Light Wash',
    subcategory: 'Denim Jacket',
  },
  {
    id: 'w-beige-dress',
    label: 'שמלה בז׳',
    category: 'Dresses',
    color: 'Beige',
    subcategory: 'Midi Dress',
  },
];
