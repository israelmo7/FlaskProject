import type { AvatarPersona, OutfitSlot } from '@/types';
import { sizeFitScale, sizeRelativeToHeight } from '@/constants/avatar';

/** פריסת בגד על גוף הדמות — מכויל לפי persona (השכבות מכוילות לגבר) */
export type SlotLayout = {
  /** סולם ביחס לכיול הגברי */
  bodyScale: number;
  /** הזזה אנכית (חלק מגובה הבובה, חיובי = למטה) */
  y: number;
  /** הזזה אופקית (חלק מרוחב) */
  x: number;
};

const MAN: Record<OutfitSlot, SlotLayout> = {
  top: { bodyScale: 1, y: 0, x: 0 },
  bottom: { bodyScale: 1, y: 0, x: 0 },
  outer: { bodyScale: 1.02, y: -0.01, x: 0 },
  dress: { bodyScale: 1, y: 0, x: 0 },
  shoes: { bodyScale: 1, y: 0.01, x: 0 },
  hat: { bodyScale: 1, y: -0.02, x: 0 },
};

const WOMAN: Record<OutfitSlot, SlotLayout> = {
  top: { bodyScale: 0.9, y: 0.015, x: 0 },
  bottom: { bodyScale: 0.88, y: 0.03, x: 0 },
  outer: { bodyScale: 0.92, y: 0.01, x: 0 },
  dress: { bodyScale: 0.95, y: 0.01, x: 0 },
  shoes: { bodyScale: 0.9, y: 0.02, x: 0 },
  hat: { bodyScale: 0.92, y: -0.01, x: 0 },
};

const TEEN_GIRL: Record<OutfitSlot, SlotLayout> = {
  top: { bodyScale: 0.84, y: 0.03, x: 0 },
  bottom: { bodyScale: 0.82, y: 0.045, x: 0 },
  outer: { bodyScale: 0.86, y: 0.025, x: 0 },
  dress: { bodyScale: 0.86, y: 0.03, x: 0 },
  shoes: { bodyScale: 0.84, y: 0.03, x: 0 },
  hat: { bodyScale: 0.86, y: 0, x: 0 },
};

const TEEN_BOY: Record<OutfitSlot, SlotLayout> = {
  top: { bodyScale: 0.88, y: 0.02, x: 0 },
  bottom: { bodyScale: 0.86, y: 0.035, x: 0 },
  outer: { bodyScale: 0.9, y: 0.015, x: 0 },
  dress: { bodyScale: 0.88, y: 0.02, x: 0 },
  shoes: { bodyScale: 0.88, y: 0.025, x: 0 },
  hat: { bodyScale: 0.9, y: 0, x: 0 },
};

const GIRL: Record<OutfitSlot, SlotLayout> = {
  top: { bodyScale: 0.7, y: 0.06, x: 0 },
  bottom: { bodyScale: 0.68, y: 0.09, x: 0 },
  outer: { bodyScale: 0.72, y: 0.055, x: 0 },
  dress: { bodyScale: 0.72, y: 0.06, x: 0 },
  shoes: { bodyScale: 0.68, y: 0.05, x: 0 },
  hat: { bodyScale: 0.72, y: 0.02, x: 0 },
};

const BOY: Record<OutfitSlot, SlotLayout> = {
  top: { bodyScale: 0.72, y: 0.055, x: 0 },
  bottom: { bodyScale: 0.7, y: 0.085, x: 0 },
  outer: { bodyScale: 0.74, y: 0.05, x: 0 },
  dress: { bodyScale: 0.72, y: 0.055, x: 0 },
  shoes: { bodyScale: 0.7, y: 0.045, x: 0 },
  hat: { bodyScale: 0.74, y: 0.015, x: 0 },
};

const BY_PERSONA: Record<AvatarPersona, Record<OutfitSlot, SlotLayout>> = {
  man: MAN,
  woman: WOMAN,
  teenGirl: TEEN_GIRL,
  teenBoy: TEEN_BOY,
  girl: GIRL,
  boy: BOY,
};

export function slotLayoutFor(
  persona: AvatarPersona,
  slot: OutfitSlot,
): SlotLayout {
  return BY_PERSONA[persona]?.[slot] ?? MAN[slot] ?? { bodyScale: 1, y: 0, x: 0 };
}

/**
 * מידה גדולה — רק הבגד ארוך יותר ויורד למטה (הגוף לא משתנה).
 */
export function garmentHang(
  size: string | undefined,
  heightCm: number,
  slot: OutfitSlot,
): { translateY: number; scaleY: number } {
  if (!size) return { translateY: 0, scaleY: 1 };
  const sizeS = sizeFitScale(size);
  const rel = sizeRelativeToHeight(size, heightCm);
  // עודף מידה ביחס לגוף — משפיע על הבגד בלבד
  const oversize = Math.max(0, (sizeS - 1) * 0.7 + Math.max(0, rel - 1) * 0.3);
  const short = Math.max(0, (160 - heightCm) / 80);
  const hang = oversize * (0.055 + short * 0.09);

  if (slot === 'top' || slot === 'outer' || slot === 'dress') {
    return {
      translateY: hang,
      scaleY: 1 + hang * 2.4,
    };
  }
  if (slot === 'bottom') {
    return {
      translateY: hang * 0.4,
      scaleY: 1 + hang * 1.5,
    };
  }
  return { translateY: hang * 0.2, scaleY: 1 + hang * 0.45 };
}

/**
 * סולם מידת הבגד בלבד — לא משנה את גודל הדמות.
 * M = 1, S קטן יותר, L גדול יותר.
 */
export function garmentVisualScale(
  size: string | undefined,
  heightCm: number,
): number {
  if (!size) return 1;
  const bySize = sizeFitScale(size);
  // התאמה עדינה לגובה — בלי לכווץ את הגוף, רק את הפריט
  const byHeight = sizeRelativeToHeight(size, heightCm);
  return Math.min(1.38, Math.max(0.72, bySize * 0.75 + byHeight * 0.25));
}
