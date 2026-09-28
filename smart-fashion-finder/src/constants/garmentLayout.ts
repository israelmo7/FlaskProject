import type { AvatarPersona, OutfitSlot } from '@/types';
import { sizeFitScale, sizeRelativeToHeight } from '@/constants/avatar';

/** פריסת עוגן בסיסית על גוף הדמות (cutouts רשומים על 480×900) */
export type SlotLayout = {
  /** סולם בסיס ביחס למסגרת הדמות */
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

/** שכבות מצוירות של גבר (כוללות גוף) */
const MAN_BAKED: Record<OutfitSlot, SlotLayout> = {
  top: { bodyScale: 1, y: 0, x: 0 },
  bottom: { bodyScale: 1, y: 0, x: 0 },
  outer: { bodyScale: 1.02, y: -0.008, x: 0 },
  dress: { bodyScale: 1, y: 0, x: 0 },
  shoes: { bodyScale: 1, y: 0.012, x: 0 },
  hat: { bodyScale: 1, y: -0.018, x: 0 },
};

/**
 * cutouts רשומים לאותו קנבס כמו הבסיס — סקייל קרוב ל־1
 * כדי שהכתפיים/זרועות יישבו על הגוף (לא "צפים" קטנים).
 */
const CUTOUT_BY_PERSONA: Record<
  AvatarPersona,
  Record<OutfitSlot, SlotLayout>
> = {
  man: {
    top: { bodyScale: 1.02, y: -0.01, x: 0 },
    bottom: { bodyScale: 1.0, y: 0.005, x: 0 },
    outer: { bodyScale: 1.05, y: -0.015, x: 0 },
    dress: { bodyScale: 1.02, y: -0.005, x: 0 },
    shoes: { bodyScale: 0.98, y: 0.015, x: 0 },
    hat: { bodyScale: 0.96, y: -0.02, x: 0 },
  },
  woman: {
    top: { bodyScale: 1.0, y: -0.005, x: 0 },
    bottom: { bodyScale: 0.98, y: 0.01, x: 0 },
    outer: { bodyScale: 1.03, y: -0.012, x: 0 },
    dress: { bodyScale: 1.0, y: 0, x: 0 },
    shoes: { bodyScale: 0.95, y: 0.018, x: 0 },
    hat: { bodyScale: 0.94, y: -0.018, x: 0 },
  },
  teenBoy: {
    top: { bodyScale: 0.98, y: 0, x: 0 },
    bottom: { bodyScale: 0.96, y: 0.012, x: 0 },
    outer: { bodyScale: 1.0, y: -0.008, x: 0 },
    dress: { bodyScale: 0.98, y: 0.004, x: 0 },
    shoes: { bodyScale: 0.94, y: 0.02, x: 0 },
    hat: { bodyScale: 0.92, y: -0.015, x: 0 },
  },
  teenGirl: {
    top: { bodyScale: 0.96, y: 0.004, x: 0 },
    bottom: { bodyScale: 0.94, y: 0.014, x: 0 },
    outer: { bodyScale: 0.98, y: -0.006, x: 0 },
    dress: { bodyScale: 0.96, y: 0.006, x: 0 },
    shoes: { bodyScale: 0.92, y: 0.02, x: 0 },
    hat: { bodyScale: 0.9, y: -0.014, x: 0 },
  },
  boy: {
    top: { bodyScale: 0.94, y: 0.01, x: 0 },
    bottom: { bodyScale: 0.92, y: 0.02, x: 0 },
    outer: { bodyScale: 0.96, y: 0.004, x: 0 },
    dress: { bodyScale: 0.94, y: 0.012, x: 0 },
    shoes: { bodyScale: 0.9, y: 0.025, x: 0 },
    hat: { bodyScale: 0.88, y: -0.01, x: 0 },
  },
  girl: {
    top: { bodyScale: 0.93, y: 0.012, x: 0 },
    bottom: { bodyScale: 0.91, y: 0.022, x: 0 },
    outer: { bodyScale: 0.95, y: 0.006, x: 0 },
    dress: { bodyScale: 0.93, y: 0.014, x: 0 },
    shoes: { bodyScale: 0.88, y: 0.026, x: 0 },
    hat: { bodyScale: 0.86, y: -0.008, x: 0 },
  },
};

export function slotLayoutFor(
  persona: AvatarPersona,
  slot: OutfitSlot,
  mode: GarmentFitMode = 'cutout',
): SlotLayout {
  if (mode === 'baked' && persona === 'man') {
    return MAN_BAKED[slot] ?? { bodyScale: 1, y: 0, x: 0 };
  }
  return (
    CUTOUT_BY_PERSONA[persona]?.[slot] ?? {
      bodyScale: 1,
      y: 0,
      x: 0,
    }
  );
}

/**
 * מקדם התאמה משולב: מידת בגד × התאמה לגובה הדמות.
 * M על 165 ≈ 1 · S על גוף גבוה < 1 · L על גוף נמוך > 1
 */
export function garmentFitFactor(
  size: string | undefined,
  heightCm: number,
): number {
  if (!size) return 1;
  const bySize = sizeFitScale(size);
  const byHeight = sizeRelativeToHeight(size, heightCm);
  return Math.min(1.4, Math.max(0.7, bySize * 0.68 + byHeight * 0.32));
}

/**
 * טרנספורם בגד עם עגינה בכתפיים/מותן:
 * - S/XS: צר יותר + קצר יותר (שוליים עולים, שרוולים מתקצרים)
 * - L/XL: רחב יותר + ארוך יותר (שוליים יורדים, שרוולים ארוכים)
 * - transform origin במרכז → פיצוי translateY כדי לשמור כתפיים קבועות
 */
export function garmentFitTransform(
  size: string | undefined,
  heightCm: number,
  slot: OutfitSlot,
  layout: SlotLayout,
): GarmentTransform {
  const fit = garmentFitFactor(size, heightCm);
  const base = layout.bodyScale;

  if (slot === 'top' || slot === 'outer' || slot === 'dress') {
    // אורך רגיש יותר מרוחב — כמו חולצה אמיתית
    const widthFactor = 1 + (fit - 1) * 0.9;
    const lengthFactor = 1 + (fit - 1) * 1.45;
    const scaleX = base * widthFactor;
    const scaleY = base * lengthFactor;
    // עוגן כתפיים (~30% מעל מרכז המסגרת)
    const shoulderAnchor = 0.32;
    let translateY =
      layout.y + (lengthFactor - 1) * shoulderAnchor;
    // עודף oversize — שוליים נוספים למטה
    if (fit > 1) translateY += (fit - 1) * 0.045;
    // מידה קטנה — שוליים עולים מעט יותר
    if (fit < 1) translateY += (fit - 1) * 0.035;
    return {
      scaleX,
      scaleY,
      translateX: layout.x,
      translateY,
    };
  }

  if (slot === 'bottom') {
    const widthFactor = 1 + (fit - 1) * 0.8;
    const lengthFactor = 1 + (fit - 1) * 1.2;
    const scaleX = base * widthFactor;
    const scaleY = base * lengthFactor;
    // עוגן מותן/ירך
    const hipAnchor = 0.14;
    let translateY = layout.y + (lengthFactor - 1) * hipAnchor;
    if (fit > 1) translateY += (fit - 1) * 0.02;
    if (fit < 1) translateY += (fit - 1) * 0.015;
    return {
      scaleX,
      scaleY,
      translateX: layout.x,
      translateY,
    };
  }

  if (slot === 'shoes') {
    const f = 1 + (fit - 1) * 0.45;
    return {
      scaleX: base * f,
      scaleY: base * f,
      translateX: layout.x,
      translateY: layout.y + (fit - 1) * 0.008,
    };
  }

  // hat
  const f = 1 + (fit - 1) * 0.5;
  return {
    scaleX: base * f,
    scaleY: base * f,
    translateX: layout.x,
    translateY: layout.y + (1 - f) * 0.02,
  };
}

/**
 * תאימות לאחור / smoke tests — אורך+הזזה אנכית.
 */
export function garmentHang(
  size: string | undefined,
  heightCm: number,
  slot: OutfitSlot,
): { translateY: number; scaleY: number } {
  const t = garmentFitTransform(size, heightCm, slot, {
    bodyScale: 1,
    y: 0,
    x: 0,
  });
  return { translateY: t.translateY, scaleY: t.scaleY };
}

/**
 * סולם מידת הבגד (רוחב) — לא משנה את גודל הדמות.
 */
export function garmentVisualScale(
  size: string | undefined,
  heightCm: number,
): number {
  return garmentFitFactor(size, heightCm);
}
