import type { AvatarPersona, OutfitSlot } from '@/types';
import { sizeFitScale, sizeRelativeToHeight } from '@/constants/avatar';

/** פריסת בגד על גוף הדמות */
export type SlotLayout = {
  /** סולם ביחס למסגרת הדמות */
  bodyScale: number;
  /** הזזה אנכית (חלק מגובה הבובה, חיובי = למטה) */
  y: number;
  /** הזזה אופקית (חלק מרוחב) */
  x: number;
};

export type GarmentFitMode = 'baked' | 'cutout';

/** שכבות מצוירות של גבר (כוללות גוף) — כיול מדויק על בסיס הגבר */
const MAN_BAKED: Record<OutfitSlot, SlotLayout> = {
  top: { bodyScale: 1, y: 0, x: 0 },
  bottom: { bodyScale: 1, y: 0, x: 0 },
  outer: { bodyScale: 1.02, y: -0.01, x: 0 },
  dress: { bodyScale: 1, y: 0, x: 0 },
  shoes: { bodyScale: 1, y: 0.01, x: 0 },
  hat: { bodyScale: 1, y: -0.02, x: 0 },
};

/**
 * בגדי cutout נקיים (בלי ידיים) — ממוקמים על אזור הגוף לפי persona.
 * ערכים מכוילים לתמונות layers/product על בסיסי 480×900.
 */
const WOMAN_CUTOUT: Record<OutfitSlot, SlotLayout> = {
  top: { bodyScale: 0.78, y: -0.02, x: 0 },
  bottom: { bodyScale: 0.72, y: 0.08, x: 0 },
  outer: { bodyScale: 0.82, y: -0.025, x: 0 },
  dress: { bodyScale: 0.8, y: 0.02, x: 0 },
  shoes: { bodyScale: 0.55, y: 0.28, x: 0 },
  hat: { bodyScale: 0.42, y: -0.32, x: 0 },
};

const TEEN_GIRL_CUTOUT: Record<OutfitSlot, SlotLayout> = {
  top: { bodyScale: 0.72, y: 0.0, x: 0 },
  bottom: { bodyScale: 0.66, y: 0.1, x: 0 },
  outer: { bodyScale: 0.76, y: -0.01, x: 0 },
  dress: { bodyScale: 0.74, y: 0.03, x: 0 },
  shoes: { bodyScale: 0.5, y: 0.3, x: 0 },
  hat: { bodyScale: 0.4, y: -0.3, x: 0 },
};

const TEEN_BOY_CUTOUT: Record<OutfitSlot, SlotLayout> = {
  top: { bodyScale: 0.76, y: -0.01, x: 0 },
  bottom: { bodyScale: 0.7, y: 0.09, x: 0 },
  outer: { bodyScale: 0.8, y: -0.015, x: 0 },
  dress: { bodyScale: 0.76, y: 0.02, x: 0 },
  shoes: { bodyScale: 0.52, y: 0.29, x: 0 },
  hat: { bodyScale: 0.4, y: -0.3, x: 0 },
};

const GIRL_CUTOUT: Record<OutfitSlot, SlotLayout> = {
  top: { bodyScale: 0.58, y: 0.04, x: 0 },
  bottom: { bodyScale: 0.52, y: 0.14, x: 0 },
  outer: { bodyScale: 0.6, y: 0.03, x: 0 },
  dress: { bodyScale: 0.58, y: 0.06, x: 0 },
  shoes: { bodyScale: 0.42, y: 0.32, x: 0 },
  hat: { bodyScale: 0.36, y: -0.26, x: 0 },
};

const BOY_CUTOUT: Record<OutfitSlot, SlotLayout> = {
  top: { bodyScale: 0.6, y: 0.03, x: 0 },
  bottom: { bodyScale: 0.54, y: 0.13, x: 0 },
  outer: { bodyScale: 0.62, y: 0.025, x: 0 },
  dress: { bodyScale: 0.6, y: 0.05, x: 0 },
  shoes: { bodyScale: 0.44, y: 0.31, x: 0 },
  hat: { bodyScale: 0.36, y: -0.26, x: 0 },
};

/** גבר עם cutout (גיבוי אם אין baked) */
const MAN_CUTOUT: Record<OutfitSlot, SlotLayout> = {
  top: { bodyScale: 0.85, y: -0.03, x: 0 },
  bottom: { bodyScale: 0.8, y: 0.06, x: 0 },
  outer: { bodyScale: 0.9, y: -0.035, x: 0 },
  dress: { bodyScale: 0.85, y: 0.01, x: 0 },
  shoes: { bodyScale: 0.58, y: 0.27, x: 0 },
  hat: { bodyScale: 0.44, y: -0.34, x: 0 },
};

const CUTOUT_BY_PERSONA: Record<
  AvatarPersona,
  Record<OutfitSlot, SlotLayout>
> = {
  man: MAN_CUTOUT,
  woman: WOMAN_CUTOUT,
  teenGirl: TEEN_GIRL_CUTOUT,
  teenBoy: TEEN_BOY_CUTOUT,
  girl: GIRL_CUTOUT,
  boy: BOY_CUTOUT,
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
    CUTOUT_BY_PERSONA[persona]?.[slot] ??
    MAN_CUTOUT[slot] ?? { bodyScale: 1, y: 0, x: 0 }
  );
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
  const oversize = Math.max(0, (sizeS - 1) * 0.7 + Math.max(0, rel - 1) * 0.3);
  const short = Math.max(0, (160 - heightCm) / 80);
  const hang = oversize * (0.05 + short * 0.08);

  if (slot === 'top' || slot === 'outer' || slot === 'dress') {
    return {
      translateY: hang,
      scaleY: 1 + hang * 2.2,
    };
  }
  if (slot === 'bottom') {
    return {
      translateY: hang * 0.35,
      scaleY: 1 + hang * 1.4,
    };
  }
  return { translateY: hang * 0.15, scaleY: 1 + hang * 0.4 };
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
  const byHeight = sizeRelativeToHeight(size, heightCm);
  return Math.min(1.32, Math.max(0.75, bySize * 0.78 + byHeight * 0.22));
}
