/**
 * החלטת הצגת לוק — לוגיקה טהורה לבדיקות (בלי require של תמונות).
 * A1: כמה שכבות בגד נשארות גלויות יחד (קומבו או overlay stack).
 */

export type OutfitPresentationMode = 'empty' | 'dress' | 'combo' | 'overlay' | 'single';

export type OutfitIds = {
  topId: string | null;
  bottomId: string | null;
  outerId: string | null;
  dressId: string | null;
};

/** תחתון אמיתי (לא תחתונים בלבד) */
export function realBottomId(bottomId: string | null): string | null {
  return bottomId && bottomId !== 'p-underwear' ? bottomId : null;
}

export function garmentSlotCount(ids: OutfitIds): number {
  const bottom = realBottomId(ids.bottomId);
  return [ids.outerId, ids.topId, bottom].filter(Boolean).length;
}

/**
 * איך להציג את הלוק כשיש/אין קומבו Fitted.
 * `hasCombo(upper, lower)` — האם קיים נכס קומבו לשניים.
 */
export function outfitPresentationMode(
  ids: OutfitIds,
  hasCombo: (upperId: string, lowerId: string) => boolean,
): OutfitPresentationMode {
  if (ids.dressId) return 'dress';

  const bottom = realBottomId(ids.bottomId);
  const { topId, outerId } = ids;

  if (!topId && !outerId && !bottom) return 'empty';

  // A1: שלושה פריטים — תמיד שכבות כדי שכולם יישארו גלויים
  if (outerId && topId && bottom) return 'overlay';

  if (outerId && bottom && !topId && hasCombo(outerId, bottom)) return 'combo';
  if (topId && bottom && !outerId && hasCombo(topId, bottom)) return 'combo';

  if (garmentSlotCount(ids) >= 2) return 'overlay';

  if (outerId || topId || bottom) return 'single';
  return 'empty';
}
