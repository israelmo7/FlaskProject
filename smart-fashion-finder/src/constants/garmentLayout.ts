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

/** שכבות מצוירות של גבר (כוללות גוף) — כיול על בסיס הגבר */
const MAN_BAKED: Record<OutfitSlot, SlotLayout> = {
  top: { bodyScale: 1, y: 0, x: 0 },
  bottom: { bodyScale: 1, y: 0, x: 0 },
  outer: { bodyScale: 1.02, y: -0.01, x: 0 },
  dress: { bodyScale: 1, y: 0, x: 0 },
  shoes: { bodyScale: 1, y: 0.01, x: 0 },
  hat: { bodyScale: 1, y: -0.02, x: 0 },
};

/**
 * cutouts רשומים על 480×900 — סקייל עדין לפי persona בלבד.
 */
function uniformSlots(
  scale: number,
  yShift = 0,
): Record<OutfitSlot, SlotLayout> {
  return {
    top: { bodyScale: scale, y: yShift, x: 0 },
    bottom: { bodyScale: scale * 0.98, y: yShift + 0.01, x: 0 },
    outer: { bodyScale: scale * 1.03, y: yShift - 0.005, x: 0 },
    dress: { bodyScale: scale, y: yShift + 0.005, x: 0 },
    shoes: { bodyScale: scale * 0.95, y: yShift + 0.01, x: 0 },
    hat: { bodyScale: scale * 0.92, y: yShift - 0.01, x: 0 },
  };
}

const CUTOUT_BY_PERSONA: Record<
  AvatarPersona,
  Record<OutfitSlot, SlotLayout>
> = {
  man: uniformSlots(1.0, 0),
  woman: uniformSlots(0.92, 0.01),
  teenBoy: uniformSlots(0.9, 0.015),
  teenGirl: uniformSlots(0.86, 0.02),
  boy: uniformSlots(0.72, 0.04),
  girl: uniformSlots(0.7, 0.045),
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
    uniformSlots(1)[slot] ?? { bodyScale: 1, y: 0, x: 0 }
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
