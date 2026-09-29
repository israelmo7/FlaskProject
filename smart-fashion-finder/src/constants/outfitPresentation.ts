/**
 * החלטת הצגת לוק — Fitted Look / Combo קודם (בגד יושב על הגוף).
 * Overlay stack רק כשאין נכס מצויר מתאים.
 */

export type OutfitPresentationMode =
  | 'empty'
  | 'dress'
  | 'combo'
  | 'outer-priority'
  | 'overlay'
  | 'single';

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
 * סדר עדיפות ויזואלית:
 * 1) Fitted Combo (גוף+בגדים מצוירים יחד)
 * 2) Outerwear Fitted Look — המעיל יושב על הדמות
 * 3) Fitted Look לפריט יחיד
 * 4) Overlay stack — רק כשאין ברירה
 */
export function outfitPresentationMode(
  ids: OutfitIds,
  hasCombo: (upperId: string, lowerId: string) => boolean,
): OutfitPresentationMode {
  if (ids.dressId) return 'dress';

  const bottom = realBottomId(ids.bottomId);
  const { topId, outerId } = ids;

  if (!topId && !outerId && !bottom) return 'empty';

  // מעיל+תחתון — קומבו מצויר (גם אם יש חולצה; המעיל חייב לשבת על הגוף)
  if (outerId && bottom && hasCombo(outerId, bottom)) return 'combo';

  // עליונית בכל מצב — Fitted Look של המעיל על הדמות (לא cutout צף)
  if (outerId) return 'outer-priority';

  if (topId && bottom && hasCombo(topId, bottom)) return 'combo';

  // שני פריטים בלי קומבו — שכבות baked
  if (garmentSlotCount(ids) >= 2) return 'overlay';

  if (topId || bottom) return 'single';
  return 'empty';
}
