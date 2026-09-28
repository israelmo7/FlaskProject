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
  top: { bodyScale: 1.04, y: -0.008, x: 0 },
  bottom: { bodyScale: 1.02, y: 0.002, x: 0 },
  outer: { bodyScale: 1.06, y: -0.012, x: 0 },
  dress: { bodyScale: 1.03, y: -0.004, x: 0 },
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
    top: { bodyScale: 1.06, y: -0.014, x: 0 },
    bottom: { bodyScale: 1.02, y: 0.004, x: 0 },
    outer: { bodyScale: 1.08, y: -0.018, x: 0 },
    dress: { bodyScale: 1.05, y: -0.008, x: 0 },
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
  // דגש על מידת הבגד; גובה משפיע משנית (M על 170 ≠ M על 190)
  return Math.min(1.38, Math.max(0.78, bySize * 0.78 + byHeight * 0.22));
}

/**
 * טרנספורם בגד עם עגינה בכתפיים/מותן:
 * - S/XS: שוליים עולים + שרוולים מתקצרים — בלי לנתק כתפיים (רצפת רוחב)
 * - L/XL: רחב/ארוך יותר — שוליים ושרוולים יורדים
 * - transform origin במרכז → פיצוי translateY לעיגון כתפיים
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
    // רוחב מתון (שומר כיסוי כתפיים) · אורך חזק (שוליים/שרוולים)
    const widthFactor = Math.min(1.22, Math.max(0.92, 1 + (fit - 1) * 0.55));
    const lengthFactor = Math.min(1.42, Math.max(0.78, 1 + (fit - 1) * 1.85));
    const scaleX = base * widthFactor;
    const scaleY = base * lengthFactor;
    // עוגן כתפיים — הארכה/קיצור מהמותן כלפי מטה בלבד
    const shoulderAnchor = 0.36;
    let translateY = layout.y + (lengthFactor - 1) * shoulderAnchor;
    if (fit > 1) translateY += (fit - 1) * 0.055;
    if (fit < 1) translateY += (fit - 1) * 0.04;
    return {
      scaleX,
      scaleY,
      translateX: layout.x,
      translateY,
    };
  }

  if (slot === 'bottom') {
    const widthFactor = Math.min(1.18, Math.max(0.9, 1 + (fit - 1) * 0.65));
    const lengthFactor = Math.min(1.32, Math.max(0.82, 1 + (fit - 1) * 1.35));
    const scaleX = base * widthFactor;
    const scaleY = base * lengthFactor;
    const hipAnchor = 0.16;
    let translateY = layout.y + (lengthFactor - 1) * hipAnchor;
    if (fit > 1) translateY += (fit - 1) * 0.025;
    if (fit < 1) translateY += (fit - 1) * 0.018;
    return {
      scaleX,
      scaleY,
      translateX: layout.x,
      translateY,
    };
  }

  if (slot === 'shoes') {
    const f = Math.min(1.12, Math.max(0.9, 1 + (fit - 1) * 0.4));
    return {
      scaleX: base * f,
      scaleY: base * f,
      translateX: layout.x,
      translateY: layout.y + (fit - 1) * 0.008,
    };
  }

  // hat
  const f = Math.min(1.12, Math.max(0.9, 1 + (fit - 1) * 0.45));
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
