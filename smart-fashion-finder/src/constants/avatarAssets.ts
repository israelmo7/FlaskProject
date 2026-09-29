import type { ImageSourcePropType } from 'react-native';
import type {
  AvatarPersona,
  OutfitLayers,
  OutfitPiece,
  OutfitSlot,
} from '@/types';
import { usesPaintedAdultLooks } from '@/constants/avatar';
import {
  garmentFitTransform,
  slotLayoutFor,
  type GarmentTransform,
} from '@/constants/garmentLayout';
import { outfitPresentationMode } from '@/constants/outfitPresentation';

export const PERSONA_BASE_IMAGES: Record<AvatarPersona, ImageSourcePropType> = {
  woman: require('../../assets/images/bases/woman.png'),
  man: require('../../assets/images/bases/man.png'),
  teenGirl: require('../../assets/images/bases/teenGirl.png'),
  teenBoy: require('../../assets/images/bases/teenBoy.png'),
  girl: require('../../assets/images/bases/girl.png'),
  boy: require('../../assets/images/bases/boy.png'),
};

/** פריימי סיבוב 180° (קדמי → אחורי) */
export const TURN_YAWS = [0, 45, 90, 135, 180] as const;
export type TurnYaw = (typeof TURN_YAWS)[number];

const MAN_TURN: Record<TurnYaw, ImageSourcePropType> = {
  0: require('../../assets/images/bases/turn/man_0.png'),
  45: require('../../assets/images/bases/turn/man_45.png'),
  90: require('../../assets/images/bases/turn/man_90.png'),
  135: require('../../assets/images/bases/turn/man_135.png'),
  180: require('../../assets/images/bases/turn/man_180.png'),
};

const WOMAN_TURN: Record<TurnYaw, ImageSourcePropType> = {
  0: require('../../assets/images/bases/turn/woman_0.png'),
  45: require('../../assets/images/bases/turn/woman_45.png'),
  90: require('../../assets/images/bases/turn/woman_90.png'),
  135: require('../../assets/images/bases/turn/woman_135.png'),
  180: require('../../assets/images/bases/turn/woman_180.png'),
};

/** פריימי סיבוב פוטוריאליסטיים — ילדה/ילד/נער (0 / 90 / 180) */
const GIRL_TURN: Partial<Record<TurnYaw, ImageSourcePropType>> = {
  0: require('../../assets/images/bases/turn/girl_0.png'),
  90: require('../../assets/images/bases/turn/girl_90.png'),
  180: require('../../assets/images/bases/turn/girl_180.png'),
};
const BOY_TURN: Partial<Record<TurnYaw, ImageSourcePropType>> = {
  0: require('../../assets/images/bases/turn/boy_0.png'),
  90: require('../../assets/images/bases/turn/boy_90.png'),
  180: require('../../assets/images/bases/turn/boy_180.png'),
};
const TEEN_GIRL_TURN: Partial<Record<TurnYaw, ImageSourcePropType>> = {
  0: require('../../assets/images/bases/turn/teenGirl_0.png'),
  90: require('../../assets/images/bases/turn/teenGirl_90.png'),
  180: require('../../assets/images/bases/turn/teenGirl_180.png'),
};
const TEEN_BOY_TURN: Partial<Record<TurnYaw, ImageSourcePropType>> = {
  0: require('../../assets/images/bases/turn/teenBoy_0.png'),
  90: require('../../assets/images/bases/turn/teenBoy_90.png'),
  180: require('../../assets/images/bases/turn/teenBoy_180.png'),
};

function pickTurnFrame(
  table: Partial<Record<TurnYaw, ImageSourcePropType>>,
  yaw: number,
  fallback: ImageSourcePropType,
): ImageSourcePropType {
  const frame = nearestTurnYaw(yaw);
  if (table[frame]) return table[frame]!;
  if (frame <= 45) return table[0] ?? fallback;
  if (frame <= 135) return table[90] ?? table[0] ?? fallback;
  return table[180] ?? table[90] ?? table[0] ?? fallback;
}

/**
 * Fitted Looks — גבר (חזית).
 *
 * קובץ זה: `src/constants/avatarAssets.ts`
 *
 * ## איך מוסיפים PNG חדש אחרי העלאה ל־assets
 * 1. שמרו קובץ ב־`assets/images/fit/man/<id>.png` (480×900, גוף+בגד)
 * 2. הוסיפו שורה כאן, למשל:
 *    `'p-tshirt-white': require('../../assets/images/fit/man/p-tshirt-white.png'),`
 * 3. אם היה alias ב־`CATALOG_ALIASES` לאותו id — מחקו את ה־alias
 *    כדי שהלוק החדש ייטען במקום ה־placeholder.
 *
 * ## Placeholders בינתיים (בלי PNG חדש)
 * וריאנטים כמו `p-tshirt-white` ממופים ב־`CATALOG_ALIASES` ללוק קיים
 * (למשל `p-tshirt`). אין צורך בשורה נפרדת כאן עד שיש asset ייעודי.
 */
export const FITTED_LOOKS_MAN: Record<string, ImageSourcePropType> = {
  'p-tshirt': require('../../assets/images/fit/man/p-tshirt.png'),
  'p-hoodie': require('../../assets/images/fit/man/p-hoodie.png'),
  'p-oxford': require('../../assets/images/fit/man/p-oxford.png'),
  'p-turtleneck': require('../../assets/images/fit/man/p-turtleneck.png'),
  'p-polo': require('../../assets/images/fit/man/p-polo.png'),
  'p-linen': require('../../assets/images/fit/man/p-linen.png'),
  'p-jeans': require('../../assets/images/fit/man/p-jeans.png'),
  'p-shorts': require('../../assets/images/fit/man/p-shorts.png'),
  'p-cargo': require('../../assets/images/fit/man/p-cargo.png'),
  'p-sport': require('../../assets/images/fit/man/p-sport.png'),
  'p-chinos': require('../../assets/images/fit/man/p-chinos.png'),
  'p-swim': require('../../assets/images/fit/man/p-swim.png'),
  'p-denim-jkt': require('../../assets/images/fit/man/p-denim-jkt.png'),
  'p-leather': require('../../assets/images/fit/man/p-leather.png'),
  'p-bomber': require('../../assets/images/fit/man/p-bomber.png'),
  // placeholder — עד שיהיה fit/man/p-suit.png ייעודי
  'p-suit': require('../../assets/images/fit/turn/man_suit_0.png'),
  'p-sneakers': require('../../assets/images/fit/man/p-sneakers.png'),
  'p-boots': require('../../assets/images/fit/man/p-boots.png'),
  'p-hat': require('../../assets/images/fit/man/p-hat.png'),
  'p-underwear': require('../../assets/images/bases/turn/man_0.png'),
  'p-socks': require('../../assets/images/bases/turn/man_0.png'),
  // ——— aliases as explicit placeholders (same files; safe direct lookup) ———
  'p-tshirt-white': require('../../assets/images/fit/man/p-oxford.png'),
  'p-tshirt-navy': require('../../assets/images/fit/man/p-tshirt.png'),
  'p-hoodie-black': require('../../assets/images/fit/man/p-hoodie.png'),
  'p-tee-stripe': require('../../assets/images/fit/man/p-polo.png'),
  'p-cardigan': require('../../assets/images/fit/man/p-turtleneck.png'),
  'p-jeans-black': require('../../assets/images/fit/man/p-jeans.png'),
  'p-jeans-light': require('../../assets/images/fit/man/p-jeans.png'),
  'p-joggers': require('../../assets/images/fit/man/p-sport.png'),
  'p-blazer': require('../../assets/images/fit/man/p-denim-jkt.png'),
  'p-coat': require('../../assets/images/fit/man/p-leather.png'),
  'p-skirt': require('../../assets/images/fit/woman/p-dress.png'),
  'p-cap': require('../../assets/images/fit/man/p-hat.png'),
  'p-sandals': require('../../assets/images/fit/man/p-sneakers.png'),
};

/**
 * Fitted Looks — אישה.
 *
 * ייעודיים: dress / suit / linen. השאר = placeholders מנכסים קיימים
 * (כולל לוקים של גבר כגיבוי זמני) עד שיועלו PNG של אישה.
 *
 * הוספת PNG ייעודי:
 * `'p-tshirt': require('../../assets/images/fit/woman/p-tshirt.png'),`
 */
export const FITTED_LOOKS_WOMAN: Record<string, ImageSourcePropType> = {
  'p-dress': require('../../assets/images/fit/woman/p-dress.png'),
  'p-skirt': require('../../assets/images/fit/woman/p-dress.png'),
  'p-suit': require('../../assets/images/fit/turn/woman_suit_0.png'),
  'p-linen': require('../../assets/images/fit/turn/woman_linen_jeans_0.png'),
  // placeholders — reused existing assets (no new PNGs)
  'p-tshirt': require('../../assets/images/fit/man/p-tshirt.png'),
  'p-tshirt-white': require('../../assets/images/fit/man/p-oxford.png'),
  'p-tshirt-navy': require('../../assets/images/fit/man/p-tshirt.png'),
  'p-hoodie': require('../../assets/images/fit/man/p-hoodie.png'),
  'p-hoodie-black': require('../../assets/images/fit/man/p-hoodie.png'),
  'p-oxford': require('../../assets/images/fit/man/p-oxford.png'),
  'p-turtleneck': require('../../assets/images/fit/man/p-turtleneck.png'),
  'p-cardigan': require('../../assets/images/fit/man/p-turtleneck.png'),
  'p-polo': require('../../assets/images/fit/man/p-polo.png'),
  'p-tee-stripe': require('../../assets/images/fit/man/p-polo.png'),
  'p-jeans': require('../../assets/images/fit/man/p-jeans.png'),
  'p-jeans-black': require('../../assets/images/fit/man/p-jeans.png'),
  'p-jeans-light': require('../../assets/images/fit/man/p-jeans.png'),
  'p-shorts': require('../../assets/images/fit/man/p-shorts.png'),
  'p-cargo': require('../../assets/images/fit/man/p-cargo.png'),
  'p-sport': require('../../assets/images/fit/man/p-sport.png'),
  'p-joggers': require('../../assets/images/fit/man/p-sport.png'),
  'p-chinos': require('../../assets/images/fit/man/p-chinos.png'),
  'p-swim': require('../../assets/images/fit/man/p-swim.png'),
  'p-denim-jkt': require('../../assets/images/fit/man/p-denim-jkt.png'),
  'p-blazer': require('../../assets/images/fit/man/p-denim-jkt.png'),
  'p-leather': require('../../assets/images/fit/man/p-leather.png'),
  'p-coat': require('../../assets/images/fit/man/p-leather.png'),
  'p-bomber': require('../../assets/images/fit/man/p-bomber.png'),
  'p-sneakers': require('../../assets/images/fit/man/p-sneakers.png'),
  'p-sandals': require('../../assets/images/fit/man/p-sneakers.png'),
  'p-boots': require('../../assets/images/fit/man/p-boots.png'),
  'p-hat': require('../../assets/images/fit/man/p-hat.png'),
  'p-cap': require('../../assets/images/fit/man/p-hat.png'),
  'p-underwear': require('../../assets/images/bases/turn/woman_0.png'),
  'p-socks': require('../../assets/images/bases/turn/woman_0.png'),
};

/** קומבואים מצוירים — מפתח topId|bottomId או outerId|bottomId */
export const FITTED_COMBOS: Record<string, ImageSourcePropType> = {
  'p-tshirt|p-jeans': require('../../assets/images/fit/man/combo-tshirt-jeans_0.png'),
  'p-hoodie|p-jeans': require('../../assets/images/fit/man/combo-hoodie-jeans.png'),
  'p-turtleneck|p-jeans': require('../../assets/images/fit/man/combo-turtleneck-jeans.png'),
  'p-oxford|p-jeans': require('../../assets/images/fit/man/combo-oxford-jeans.png'),
  'p-tshirt|p-cargo': require('../../assets/images/fit/man/combo-tshirt-cargo.png'),
  'p-denim-jkt|p-jeans': require('../../assets/images/fit/man/combo-denim-jkt-jeans.png'),
  'p-leather|p-jeans': require('../../assets/images/fit/man/combo-leather-jeans.png'),
  'p-bomber|p-jeans': require('../../assets/images/fit/man/combo-bomber-jeans.png'),
};

/** קומבו טי+ג׳ינס עם פריימי 180° */
export const COMBO_TSHIRT_JEANS: Partial<Record<TurnYaw, ImageSourcePropType>> = {
  0: require('../../assets/images/fit/man/combo-tshirt-jeans_0.png'),
  90: require('../../assets/images/fit/man/combo-tshirt-jeans_90.png'),
  180: require('../../assets/images/fit/man/combo-tshirt-jeans_180.png'),
};

/**
 * לוקים מצוירים Perfect-Fit על גוף פוטוריאליסטי — לפי persona + מפתח לוק + yaw.
 * כוללים גוף+בגד בהתאמה מדויקת (בלי רווחים).
 */
const FITTED_TURN_LOOKS: Record<
  string,
  Partial<Record<TurnYaw, ImageSourcePropType>>
> = {
  'man|p-suit': {
    0: require('../../assets/images/fit/turn/man_suit_0.png'),
    45: require('../../assets/images/fit/turn/man_suit_45.png'),
    90: require('../../assets/images/fit/turn/man_suit_90.png'),
    135: require('../../assets/images/fit/turn/man_suit_135.png'),
    180: require('../../assets/images/fit/turn/man_suit_180.png'),
  },
  'woman|p-suit': {
    0: require('../../assets/images/fit/turn/woman_suit_0.png'),
    45: require('../../assets/images/fit/turn/woman_suit_45.png'),
    90: require('../../assets/images/fit/turn/woman_suit_90.png'),
    135: require('../../assets/images/fit/turn/woman_suit_135.png'),
    180: require('../../assets/images/fit/turn/woman_suit_180.png'),
  },
  'man|p-tshirt|p-jeans': {
    0: require('../../assets/images/fit/turn/man_tshirt_jeans_0.png'),
    90: require('../../assets/images/fit/turn/man_tshirt_jeans_90.png'),
    180: require('../../assets/images/fit/turn/man_tshirt_jeans_180.png'),
  },
  'woman|p-linen|p-jeans': {
    0: require('../../assets/images/fit/turn/woman_linen_jeans_0.png'),
    90: require('../../assets/images/fit/turn/woman_linen_jeans_90.png'),
    180: require('../../assets/images/fit/turn/woman_linen_jeans_180.png'),
  },
};

function fittedTurnKey(
  persona: AvatarPersona,
  layers: OutfitLayers,
): string | null {
  const topId = pieceCatalogId(layers.top);
  const bottomId = pieceCatalogId(layers.bottom);
  const outerId = pieceCatalogId(layers.outer);
  const dressId = pieceCatalogId(layers.dress);
  if (dressId) return null;
  if (outerId === 'p-suit') return `${persona}|p-suit`;
  if (outerId) return null;
  if (topId === 'p-tshirt' && bottomId === 'p-jeans') {
    return `${persona}|p-tshirt|p-jeans`;
  }
  if (topId === 'p-linen' && bottomId === 'p-jeans') {
    return `${persona}|p-linen|p-jeans`;
  }
  return null;
}

function fittedTurnLook(
  persona: AvatarPersona,
  layers: OutfitLayers,
  yaw: number,
): ImageSourcePropType | null {
  const key = fittedTurnKey(persona, layers);
  if (!key) return null;
  const table = FITTED_TURN_LOOKS[key];
  if (!table) return null;
  return pickTurnFrame(table, yaw, table[0] ?? Object.values(table)[0]!);
}

/** שכבות בגד (אזור גוף מהלוק המצויר) */
export const FITTED_OVERLAYS_MAN: Record<string, ImageSourcePropType> = {
  'p-tshirt': require('../../assets/images/fit/man/overlay/p-tshirt.png'),
  'p-hoodie': require('../../assets/images/fit/man/overlay/p-hoodie.png'),
  'p-oxford': require('../../assets/images/fit/man/overlay/p-oxford.png'),
  'p-turtleneck': require('../../assets/images/fit/man/overlay/p-turtleneck.png'),
  'p-polo': require('../../assets/images/fit/man/overlay/p-polo.png'),
  'p-linen': require('../../assets/images/fit/man/overlay/p-linen.png'),
  'p-jeans': require('../../assets/images/fit/man/overlay/p-jeans.png'),
  'p-shorts': require('../../assets/images/fit/man/overlay/p-shorts.png'),
  'p-cargo': require('../../assets/images/fit/man/overlay/p-cargo.png'),
  'p-sport': require('../../assets/images/fit/man/overlay/p-sport.png'),
  'p-chinos': require('../../assets/images/fit/man/overlay/p-chinos.png'),
  'p-swim': require('../../assets/images/fit/man/overlay/p-swim.png'),
  'p-denim-jkt': require('../../assets/images/fit/man/overlay/p-denim-jkt.png'),
  'p-leather': require('../../assets/images/fit/man/overlay/p-leather.png'),
  'p-bomber': require('../../assets/images/fit/man/overlay/p-bomber.png'),
  'p-sneakers': require('../../assets/images/fit/man/overlay/p-sneakers.png'),
  'p-boots': require('../../assets/images/fit/man/overlay/p-boots.png'),
  'p-hat': require('../../assets/images/fit/man/overlay/p-hat.png'),
};

/**
 * שכבות בגד נקיות בלבד (בלי ידיים/עור), רשומות על קנבס 480×900.
 */
export const GARMENT_LAYER_IMAGES: Record<string, ImageSourcePropType> = {
  'w-black-shirt': require('../../assets/images/layers/cutouts/tshirt.png'),
  'w-white-oxford': require('../../assets/images/layers/cutouts/oxford.png'),
  'w-olive-cargo': require('../../assets/images/layers/cutouts/cargo.png'),
  'w-blue-jeans': require('../../assets/images/layers/cutouts/jeans.png'),
  'w-denim-jacket': require('../../assets/images/layers/cutouts/denim-jkt.png'),
  'w-hat': require('../../assets/images/layers/cutouts/hat.png'),
  'w-sneakers': require('../../assets/images/layers/cutouts/sneakers.png'),
  'p-tshirt': require('../../assets/images/layers/cutouts/tshirt.png'),
  'p-hoodie': require('../../assets/images/layers/cutouts/hoodie.png'),
  'p-oxford': require('../../assets/images/layers/cutouts/oxford.png'),
  'p-turtleneck': require('../../assets/images/layers/cutouts/turtleneck.png'),
  'p-polo': require('../../assets/images/layers/cutouts/polo.png'),
  'p-linen': require('../../assets/images/layers/cutouts/linen.png'),
  'p-jeans': require('../../assets/images/layers/cutouts/jeans.png'),
  'p-shorts': require('../../assets/images/layers/cutouts/shorts.png'),
  'p-cargo': require('../../assets/images/layers/cutouts/cargo.png'),
  'p-sport': require('../../assets/images/layers/cutouts/sport.png'),
  'p-chinos': require('../../assets/images/layers/cutouts/cargo.png'),
  'p-swim': require('../../assets/images/layers/cutouts/swim.png'),
  'p-denim-jkt': require('../../assets/images/layers/cutouts/denim-jkt.png'),
  'p-leather': require('../../assets/images/layers/cutouts/leather.png'),
  'p-bomber': require('../../assets/images/layers/cutouts/bomber.png'),
  'p-dress': require('../../assets/images/layers/cutouts/dress.png'),
  'p-skirt': require('../../assets/images/layers/cutouts/dress.png'),
  'p-sneakers': require('../../assets/images/layers/cutouts/sneakers.png'),
  'p-sandals': require('../../assets/images/layers/cutouts/sneakers.png'),
  'p-boots': require('../../assets/images/layers/cutouts/sneakers.png'),
  'p-hat': require('../../assets/images/layers/cutouts/hat.png'),
  'p-cap': require('../../assets/images/layers/cutouts/hat.png'),
  'p-suit': require('../../assets/images/fit/turn/man_suit_0.png'),
  'p-blazer': require('../../assets/images/layers/cutouts/denim-jkt.png'),
  'p-coat': require('../../assets/images/layers/cutouts/leather.png'),
  'p-joggers': require('../../assets/images/layers/cutouts/sport.png'),
  'p-cardigan': require('../../assets/images/layers/cutouts/turtleneck.png'),
  'p-tee-stripe': require('../../assets/images/layers/cutouts/polo.png'),
  'p-tshirt-white': require('../../assets/images/layers/cutouts/oxford.png'),
  'p-tshirt-navy': require('../../assets/images/layers/cutouts/tshirt.png'),
  'p-hoodie-black': require('../../assets/images/layers/cutouts/hoodie.png'),
  'p-jeans-black': require('../../assets/images/layers/cutouts/jeans.png'),
  'p-jeans-light': require('../../assets/images/layers/cutouts/jeans.png'),
};

const LAYER_KEYS_DESC = Object.keys(GARMENT_LAYER_IMAGES).sort(
  (a, b) => b.length - a.length,
);

export function layerImageForPieceId(pieceId: string): ImageSourcePropType | null {
  for (const key of LAYER_KEYS_DESC) {
    if (pieceId.includes(key)) return GARMENT_LAYER_IMAGES[key];
  }
  return null;
}

/**
 * Aliases / placeholders — מזהה קטלוג → מפתח ב־FITTED_LOOKS_* הקיים.
 * בלי PNG חדש: וריאנט צבע/סגנון מצביע ללוק הקרוב ביותר שכבר יש.
 * כשמעלים PNG ייעודי — מוסיפים ל־FITTED_LOOKS_* ומוחקים מכאן.
 */
const CATALOG_ALIASES: Record<string, string> = {
  'p-tshirt-white': 'p-tshirt',
  'p-tshirt-navy': 'p-tshirt',
  'p-hoodie-black': 'p-hoodie',
  'p-jeans-black': 'p-jeans',
  'p-jeans-light': 'p-jeans',
  'p-blazer': 'p-denim-jkt',
  'p-coat': 'p-leather',
  'p-skirt': 'p-dress',
  'p-cap': 'p-hat',
  'p-sandals': 'p-sneakers',
  'p-tee-stripe': 'p-polo',
  'p-cardigan': 'p-turtleneck',
  'p-joggers': 'p-sport',
};

export function catalogIdFromPieceId(pieceId: string): string | null {
  // aliases קודם (ארוכים יותר)
  const aliasKeys = Object.keys(CATALOG_ALIASES).sort((a, b) => b.length - a.length);
  for (const k of aliasKeys) {
    if (pieceId.includes(k)) return CATALOG_ALIASES[k];
  }

  const keys = [
    'p-tshirt',
    'p-hoodie',
    'p-oxford',
    'p-turtleneck',
    'p-polo',
    'p-linen',
    'p-jeans',
    'p-shorts',
    'p-cargo',
    'p-sport',
    'p-chinos',
    'p-swim',
    'p-denim-jkt',
    'p-leather',
    'p-bomber',
    'p-suit',
    'p-dress',
    'p-sneakers',
    'p-boots',
    'p-hat',
    'p-underwear',
    'p-socks',
    'w-black-shirt',
    'w-white-oxford',
    'w-blue-jeans',
    'w-olive-cargo',
    'w-denim-jacket',
    'w-beige-dress',
    'w-sneakers',
    'w-hat',
  ];
  const sorted = [...keys].sort((a, b) => b.length - a.length);
  for (const k of sorted) {
    if (pieceId.includes(k)) {
      if (k === 'w-black-shirt') return 'p-tshirt';
      if (k === 'w-white-oxford') return 'p-oxford';
      if (k === 'w-blue-jeans') return 'p-jeans';
      if (k === 'w-olive-cargo') return 'p-cargo';
      if (k === 'w-denim-jacket') return 'p-denim-jkt';
      if (k === 'w-beige-dress') return 'p-dress';
      if (k === 'w-sneakers') return 'p-sneakers';
      if (k === 'w-hat') return 'p-hat';
      return k;
    }
  }
  return null;
}

export function nearestTurnYaw(yaw: number): TurnYaw {
  const clamped = Math.max(0, Math.min(180, yaw));
  let best: TurnYaw = 0;
  let bestDist = Infinity;
  for (const y of TURN_YAWS) {
    const d = Math.abs(y - clamped);
    if (d < bestDist) {
      bestDist = d;
      best = y;
    }
  }
  return best;
}

/** האם לדמות יש פריימי סיבוב ייעודיים */
export function personaHasTurnFrames(_persona: AvatarPersona): boolean {
  return true;
}

/** פריימי סיבוב מצוירים אמיתיים (לא היפוך CSS) — כל ה־personas */
export function personaHasPaintedTurn(_persona: AvatarPersona): boolean {
  return true;
}

/**
 * בסיס הדמות לפי persona + זווית — פריימים פוטוריאליסטיים עקביים.
 */
export function turnBaseForPersona(
  persona: AvatarPersona,
  yaw: number,
): ImageSourcePropType {
  const fallback = PERSONA_BASE_IMAGES[persona];
  switch (persona) {
    case 'man':
      return MAN_TURN[nearestTurnYaw(yaw)];
    case 'woman':
      return WOMAN_TURN[nearestTurnYaw(yaw)];
    case 'girl':
      return pickTurnFrame(GIRL_TURN, yaw, fallback);
    case 'boy':
      return pickTurnFrame(BOY_TURN, yaw, fallback);
    case 'teenGirl':
      return pickTurnFrame(TEEN_GIRL_TURN, yaw, fallback);
    case 'teenBoy':
      return pickTurnFrame(TEEN_BOY_TURN, yaw, fallback);
    default:
      return fallback;
  }
}

/**
 * מחזיר Fitted Look לפי מזהה קטלוג.
 * פותר aliases, לא זורק — מחזיר null רק אם אין שום placeholder.
 */
export function fittedLookForId(
  catalogId: string,
  female: boolean,
): ImageSourcePropType | null {
  try {
    const aliased = CATALOG_ALIASES[catalogId] ?? catalogId;
    if (female) {
      return (
        FITTED_LOOKS_WOMAN[catalogId] ??
        FITTED_LOOKS_WOMAN[aliased] ??
        FITTED_LOOKS_MAN[catalogId] ??
        FITTED_LOOKS_MAN[aliased] ??
        null
      );
    }
    return (
      FITTED_LOOKS_MAN[catalogId] ??
      FITTED_LOOKS_MAN[aliased] ??
      FITTED_LOOKS_WOMAN[catalogId] ??
      FITTED_LOOKS_WOMAN[aliased] ??
      null
    );
  } catch {
    return null;
  }
}

/**
 * שכבות מצוירות של גבר כוללות ידיים/עור — רק על דמות גבר.
 * לשאר הדמויות מחזירים null כדי ליפול לשכבות בגד נקיות (בלי גוף).
 */
export function fittedOverlayForId(
  catalogId: string,
  persona?: AvatarPersona,
): ImageSourcePropType | null {
  if (persona && persona !== 'man') return null;
  return FITTED_OVERLAYS_MAN[catalogId] ?? null;
}

export function frontFacingAmount(yaw: number): number {
  const rad = (Math.max(0, Math.min(180, yaw)) * Math.PI) / 180;
  return Math.max(0, Math.cos(rad));
}

export type ResolvedOverlay = {
  src: ImageSourcePropType;
  /** סקייל רוחב סופי (כולל bodyScale + מידה) */
  scaleX: number;
  /** סקייל אורך סופי */
  scaleY: number;
  translateY: number;
  translateX: number;
  slot: OutfitSlot;
  key: string;
};

export type ResolvedOutfit = {
  /** תמונת גוף מלאה (לוק / קומבו) */
  hero: ImageSourcePropType | null;
  heroTracksYaw: boolean;
  heroScale: number;
  /** טרנספורם מידה על לוק Perfect-Fit (כתפיים קבועות) */
  heroFit: GarmentTransform | null;
  overlays: ResolvedOverlay[];
  /** true = בסיס persona + שכבות; false = hero מלא */
  overlayOnly: boolean;
};

function pieceCatalogId(
  piece: { id: string } | undefined,
): string | null {
  return piece ? catalogIdFromPieceId(piece.id) : null;
}

function isUnderwearPiece(piece: OutfitPiece | undefined): boolean {
  if (!piece) return false;
  const id = catalogIdFromPieceId(piece.id);
  return piece.category === 'Underwear' || id === 'p-underwear';
}

function isSocksPiece(piece: OutfitPiece | undefined): boolean {
  if (!piece) return false;
  const id = catalogIdFromPieceId(piece.id);
  return piece.category === 'Socks' || id === 'p-socks';
}

function pushOverlayLayer(
  extras: ResolvedOverlay[],
  piece: OutfitPiece | undefined,
  heightCm: number,
  persona: AvatarPersona,
  skipIds?: string[],
  /** A1: בערימת שכבות — cutouts נקיים כדי שלא ייאפו גופייה/מכנסיים מתוך נכס עליון */
  preferCutout = false,
) {
  if (!piece || isUnderwearPiece(piece) || isSocksPiece(piece)) return;
  const id = pieceCatalogId(piece);
  if (!id || skipIds?.includes(id)) return;
  // גבר: שכבה מצוירת על הגוף. אחרים / ערימה: בגד נקי בלי ידיים/עור אפויים.
  const baked = preferCutout ? null : fittedOverlayForId(id, persona);
  const o =
    baked ?? layerImageForPieceId(id) ?? layerImageForPieceId(piece.id);
  if (!o) return;
  const slot = piece.slot;
  // Standard Fit: יישור 1:1 לגוף — בלי scale לפי מידה/גובה
  const layout = slotLayoutFor(persona, slot, baked ? 'baked' : 'cutout');
  const fit = garmentFitTransform(undefined, heightCm, slot, layout);
  extras.push({
    src: o,
    scaleX: fit.scaleX,
    scaleY: fit.scaleY,
    translateY: fit.translateY,
    translateX: fit.translateX,
    slot,
    key: `${id}-std-${slot}-${baked ? 'b' : 'c'}`,
  });
}

/** שכבות בגד על בסיס הדמות — בלי להחליף את הגוף */
function resolveOverlayOnlyStack(
  layers: OutfitLayers,
  heightCm: number,
  persona: AvatarPersona,
): ResolvedOutfit {
  const overlays: ResolvedOverlay[] = [];
  // A1: כשיש עליון+עליונית — cutout לעליונית (בלי גופייה אפויה שמסתירה את החולצה)
  const cutoutOuter = Boolean(layers.top && layers.outer);
  // סדר ציור: מכנסיים → שמלה/חולצה → עליונית → נעליים → כובע
  if (!isUnderwearPiece(layers.bottom)) {
    pushOverlayLayer(overlays, layers.bottom, heightCm, persona);
  }
  pushOverlayLayer(overlays, layers.dress, heightCm, persona);
  pushOverlayLayer(overlays, layers.top, heightCm, persona);
  pushOverlayLayer(
    overlays,
    layers.outer,
    heightCm,
    persona,
    undefined,
    cutoutOuter,
  );
  if (!isSocksPiece(layers.shoes)) {
    pushOverlayLayer(overlays, layers.shoes, heightCm, persona, ['p-socks']);
  }
  pushOverlayLayer(overlays, layers.hat, heightCm, persona);
  return {
    hero: null,
    heroTracksYaw: false,
    heroScale: 1,
    heroFit: null,
    overlays,
    overlayOnly: true,
  };
}

/**
 * בחירת לוק מצויר / קומבו / שכבות — הבגדים נשארים גם בסיבוב 180°.
 * לדמויות ילד/נער: שכבות על בסיס הדמות (בלי להחליף לגוף גבר/אישה).
 */
export function resolveOutfitLook(
  layers: OutfitLayers,
  yaw: number,
  female: boolean,
  heightCm = 165,
  persona: AvatarPersona = 'man',
): ResolvedOutfit {
  // Perfect-Fit מצויר (גוף+בגד) עם פריימי סיבוב — כשיש לוק ייעודי
  const turnHero = fittedTurnLook(persona, layers, yaw);
  if (turnHero) {
    const extras: ResolvedOverlay[] = [];
    // הלוק המלא כולל נעליים; רק כובע כשכבה נוספת
    pushOverlayLayer(extras, layers.hat, heightCm, persona);
    return {
      hero: turnHero,
      heroTracksYaw: true,
      heroScale: 1,
      heroFit: null,
      overlays: extras,
      overlayOnly: false,
    };
  }

  // בסיס הדמות + שכבות בגד — הגוף לא מוחלף ולא משתנה עם מידה
  if (!usesPaintedAdultLooks(persona)) {
    return resolveOverlayOnlyStack(layers, heightCm, persona);
  }

  const topId = pieceCatalogId(layers.top);
  const bottomId = pieceCatalogId(layers.bottom);
  const outerId = pieceCatalogId(layers.outer);
  const dressId = pieceCatalogId(layers.dress);

  // תחתונים בלבד / בלי בגדים — רק בסיס
  if (
    (!topId && !outerId && !dressId && (!bottomId || bottomId === 'p-underwear')) &&
    (!layers.shoes || isSocksPiece(layers.shoes)) &&
    !layers.hat
  ) {
    return {
      hero: null,
      heroTracksYaw: false,
      heroScale: 1,
      heroFit: null,
      overlays: [],
      overlayOnly: true,
    };
  }

  /** Fitted Look בלבד — כובע אופציונלי; אם אין hero → overlay stack בטוח */
  const withFittedHero = (
    hero: ImageSourcePropType | null,
    heroTracksYaw: boolean,
    _heroPiece: OutfitPiece | undefined,
  ): ResolvedOutfit => {
    const extras: ResolvedOverlay[] = [];
    const safeHero: ImageSourcePropType | null =
      hero ??
      (outerId ? fittedLookForId(outerId, female) : null) ??
      (topId ? fittedLookForId(topId, female) : null) ??
      (bottomId && bottomId !== 'p-underwear'
        ? fittedLookForId(bottomId, female)
        : null) ??
      (dressId ? fittedLookForId(dressId, female) : null) ??
      null;
    if (!safeHero) {
      // Fallback — לא קורסים; בסיס persona + שכבות cutout 1:1
      return resolveOverlayOnlyStack(layers, heightCm, persona);
    }
    pushOverlayLayer(extras, layers.hat, heightCm, persona);
    return {
      hero: safeHero,
      heroTracksYaw,
      heroScale: 1,
      heroFit: null,
      overlays: extras,
      overlayOnly: false,
    };
  };

  if (dressId) {
    return withFittedHero(
      fittedLookForId(dressId, female),
      false,
      layers.dress,
    );
  }

  const realBottom = bottomId && bottomId !== 'p-underwear' ? bottomId : null;

  /** קומבו Fitted לפי מזהים (+ aliases) */
  const comboFor = (
    upperId: string | null,
    lowerId: string | null,
  ): ImageSourcePropType | null => {
    if (!upperId || !lowerId) return null;
    const u = CATALOG_ALIASES[upperId] ?? upperId;
    const l = CATALOG_ALIASES[lowerId] ?? lowerId;
    return (
      FITTED_COMBOS[`${upperId}|${lowerId}`] ??
      FITTED_COMBOS[`${u}|${l}`] ??
      FITTED_COMBOS[`${upperId}|${l}`] ??
      FITTED_COMBOS[`${u}|${lowerId}`] ??
      null
    );
  };

  const hasCombo = (upper: string, lower: string) =>
    Boolean(comboFor(upper, lower));

  // טי+ג׳ינס עם פריימי סיבוב (בלי מעיל) — לפני החלטת A1 הכללית
  if (
    !outerId &&
    realBottom === 'p-jeans' &&
    (topId === 'p-tshirt' ||
      CATALOG_ALIASES[topId ?? ''] === 'p-tshirt')
  ) {
    const frame = nearestTurnYaw(yaw);
    const hero =
      COMBO_TSHIRT_JEANS[frame] ??
      (frame <= 45
        ? COMBO_TSHIRT_JEANS[0]
        : frame <= 135
          ? COMBO_TSHIRT_JEANS[90]
          : COMBO_TSHIRT_JEANS[180]) ??
      comboFor(topId, realBottom);
    if (hero) return withFittedHero(hero, true, layers.top);
  }

  // A1: קומבו לזוג / overlay כשיש כמה שכבות בלי קומבו מלא (כולל top+bottom+outer)
  const mode = outfitPresentationMode(
    { topId, bottomId, outerId, dressId },
    hasCombo,
  );

  if (mode === 'overlay') {
    return resolveOverlayOnlyStack(layers, heightCm, persona);
  }

  if (mode === 'combo') {
    const outerBottom = comboFor(outerId, realBottom);
    if (outerBottom && !topId) {
      return withFittedHero(outerBottom, false, layers.outer);
    }
    const topBottom = comboFor(topId, realBottom);
    if (topBottom && !outerId) {
      return withFittedHero(topBottom, false, layers.top);
    }
    // הגנה — אם אין נכס בפועל, נפילת שכבות
    return resolveOverlayOnlyStack(layers, heightCm, persona);
  }

  // פריט יחיד — Fitted Look
  if (outerId) {
    return withFittedHero(
      fittedLookForId(outerId, female),
      false,
      layers.outer,
    );
  }
  if (topId) {
    return withFittedHero(fittedLookForId(topId, female), false, layers.top);
  }
  if (realBottom) {
    return withFittedHero(
      fittedLookForId(realBottom, female),
      false,
      layers.bottom,
    );
  }

  if (layers.shoes || layers.hat) {
    const piece = isSocksPiece(layers.shoes)
      ? layers.hat
      : layers.shoes || layers.hat;
    const heroId = pieceCatalogId(piece);
    return withFittedHero(
      heroId ? fittedLookForId(heroId, female) : null,
      false,
      piece,
    );
  }

  return {
    hero: null,
    heroTracksYaw: false,
    heroScale: 1,
    heroFit: null,
    overlays: [],
    overlayOnly: true,
  };
}
