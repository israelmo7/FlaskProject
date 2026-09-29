import type { AvatarPersona, OutfitSlot } from '@/types';

/** פריסת עוגן בסיסית על גוף הדמות (cutouts רשומים על 480×900) */
export type SlotLayout = {
  /** סולם בסיס ביחס למסגרת הדמות — Standard Fit ≈ 1 */
  bodyScale: number;
  /** הזזה אנכית בסיסית (חלק מגובה, חיובי = למטה) */
  y: number;
  /** הזזה אופקית בסיסית */
  x: number;
};

export type GarmentFitMode = 'baked' | 'cutout';

/** טרנספורם סופי של בגד על הגוף */
export type GarmentTransform = {
  scaleX: number;
  scaleY: number;
  translateX: number;
  translateY: number;
};

/** Standard Fit — יישור אבסולוטי לכתפיים/גוף, בלי סקייל לפי מידה/גובה */
const STANDARD: SlotLayout = { bodyScale: 1, y: 0, x: 0 };

const MAN_BAKED: Record<OutfitSlot, SlotLayout> = {
  top: STANDARD,
  bottom: STANDARD,
  outer: STANDARD,
  dress: STANDARD,
  shoes: STANDARD,
  hat: { bodyScale: 1, y: -0.01, x: 0 },
};

const CUTOUT_BY_PERSONA: Record<
  AvatarPersona,
  Record<OutfitSlot, SlotLayout>
> = {
  man: {
    top: STANDARD,
    bottom: STANDARD,
    // cutouts של עליונית מצוירים גבוה מדי — הזזה למטה כדי לא לכסות פנים
    outer: { bodyScale: 1, y: 0.07, x: 0 },
    dress: STANDARD,
    shoes: STANDARD,
    hat: { bodyScale: 1, y: -0.01, x: 0 },
  },
  woman: {
    top: STANDARD,
    bottom: STANDARD,
    outer: STANDARD,
    dress: STANDARD,
    shoes: STANDARD,
    hat: { bodyScale: 1, y: -0.01, x: 0 },
  },
  teenBoy: {
    top: STANDARD,
    bottom: STANDARD,
    outer: STANDARD,
    dress: STANDARD,
    shoes: STANDARD,
    hat: { bodyScale: 1, y: -0.01, x: 0 },
  },
  teenGirl: {
    top: STANDARD,
    bottom: STANDARD,
    outer: STANDARD,
    dress: STANDARD,
    shoes: STANDARD,
    hat: { bodyScale: 1, y: -0.01, x: 0 },
  },
  boy: {
    top: STANDARD,
    bottom: STANDARD,
    outer: STANDARD,
    dress: STANDARD,
    shoes: STANDARD,
    hat: { bodyScale: 1, y: -0.008, x: 0 },
  },
  girl: {
    top: STANDARD,
    bottom: STANDARD,
    outer: STANDARD,
    dress: STANDARD,
    shoes: STANDARD,
    hat: { bodyScale: 1, y: -0.008, x: 0 },
  },
};

export function slotLayoutFor(
  persona: AvatarPersona,
  slot: OutfitSlot,
  mode: GarmentFitMode = 'cutout',
): SlotLayout {
  if (mode === 'baked' && persona === 'man') {
    return MAN_BAKED[slot] ?? STANDARD;
  }
  return CUTOUT_BY_PERSONA[persona]?.[slot] ?? STANDARD;
}

/**
 * @deprecated Standard Fit — תמיד 1 (מידה/גובה לא משפיעים על הוויזואל)
 */
export function garmentFitFactor(
  _size?: string,
  _heightCm?: number,
): number {
  return 1;
}

/**
 * Standard Fit: יישור קבוע על הגוף — בלי scale/translate לפי XS–XL או גובה.
 */
export function garmentFitTransform(
  _size: string | undefined,
  _heightCm: number,
  _slot: OutfitSlot,
  layout: SlotLayout,
): GarmentTransform {
  return {
    scaleX: layout.bodyScale,
    scaleY: layout.bodyScale,
    translateX: layout.x,
    translateY: layout.y,
  };
}

/** תאימות לאחור */
export function garmentHang(
  size: string | undefined,
  heightCm: number,
  slot: OutfitSlot,
): { translateY: number; scaleY: number } {
  const t = garmentFitTransform(size, heightCm, slot, STANDARD);
  return { translateY: t.translateY, scaleY: t.scaleY };
}

/** תאימות לאחור — תמיד 1 */
export function garmentVisualScale(
  _size?: string,
  _heightCm?: number,
): number {
  return 1;
}
