import type { AvatarPersona, OutfitSlot } from '@/types';

/**
 * Standard Fit overlay canvas — PR #14.
 * כל ה־overlays / cutouts מיושרים לרשת 480×900.
 */
export const STANDARD_FIT = {
  width: 480,
  height: 900,
} as const;

/** נקודות עיגון על גוף הדמות (נורמליזציה 0–1 ביחס לגובה/רוחב הקנבס) */
export type AnchorId = 'head' | 'shoulders' | 'hips' | 'feet';

export type BodyAnchor = {
  id: AnchorId;
  /** מרכז אופקי (0–1) */
  x: number;
  /** גובה העוגן (0 = ראש הקנבס, 1 = רגל) */
  y: number;
};

/**
 * רשת עוגנים קנונית — מכוילת לפי בסיס Standard Fit (גבר)
 * ומותאמת פר־persona ביחסים דומים.
 *
 * head      — כובעים / אקססוריז ראש
 * shoulders — Tops & Outerwear (כתפיים/חזה; צוואר וידיים נשארים גלויים)
 * hips      — Bottoms (מותניים מכסים בוקסר/בסיס)
 * feet      — הנעלה (קרסול / כף רגל)
 */
export const CANONICAL_ANCHORS: Record<AnchorId, BodyAnchor> = {
  head: { id: 'head', x: 0.5, y: 0.055 },
  shoulders: { id: 'shoulders', x: 0.5, y: 0.175 },
  hips: { id: 'hips', x: 0.5, y: 0.4 },
  feet: { id: 'feet', x: 0.5, y: 0.875 },
};

/** מיפוי קטגוריית סלוט → עוגן גוף */
export const SLOT_ANCHOR: Record<OutfitSlot, AnchorId> = {
  hat: 'head',
  top: 'shoulders',
  outer: 'shoulders',
  dress: 'shoulders',
  bottom: 'hips',
  shoes: 'feet',
};

/** סדר שכבות (zIndex) — מכנסיים מתחת, כובע מעל */
export const SLOT_Z_INDEX: Record<OutfitSlot, number> = {
  bottom: 10,
  dress: 20,
  top: 30,
  outer: 40,
  shoes: 50,
  hat: 60,
};

export type OverlayAnchorLayout = {
  anchor: AnchorId;
  scaleX: number;
  scaleY: number;
  /** חלק מרוחב הקנבס */
  translateX: number;
  /** חלק מגובה הקנבס — חיובי = למטה */
  translateY: number;
  zIndex: number;
};

type Nudge = {
  scaleX: number;
  scaleY: number;
  translateX: number;
  translateY: number;
};

const IDENTITY: Nudge = {
  scaleX: 1,
  scaleY: 1,
  translateX: 0,
  translateY: 0,
};

/**
 * כללי יישור אחידים לפי סלוט (baked / על רשת Standard Fit).
 * Bottoms: מעט למעלה + הגדלה אנכית — כיסוי מלא של בוקסר הבסיס.
 * Tops/Outer: הזזה קלה למטה כדי לא לחתוך פנים/צוואר.
 */
const SLOT_NUDGE_BAKED: Record<OutfitSlot, Nudge> = {
  // hips: למעלה + הגדלה קלה — קו מותניים מכסה בוקסר הבסיס
  bottom: { scaleX: 1.02, scaleY: 1.04, translateX: 0, translateY: -0.055 },
  // shoulders: הזזה עדינה למטה — צוואר/פנים פנויים
  top: { scaleX: 1, scaleY: 1, translateX: 0, translateY: 0.01 },
  outer: { scaleX: 1, scaleY: 1, translateX: 0, translateY: 0.016 },
  dress: { scaleX: 1, scaleY: 1.01, translateX: 0, translateY: 0.01 },
  shoes: { scaleX: 1, scaleY: 1, translateX: 0, translateY: 0.012 },
  hat: { scaleX: 1, scaleY: 1, translateX: 0, translateY: -0.014 },
};

/**
 * cutouts — נכסים לא תמיד על אותה רשת; תיקונים חזקים יותר.
 * Outer: רק הזזה למטה (בלי scale — scale ממרכז דוחף צווארון לפנים).
 * Bottom: למעלה + scale מתון לכיסוי בוקסר.
 */
const SLOT_NUDGE_CUTOUT: Record<OutfitSlot, Nudge> = {
  bottom: { scaleX: 1.03, scaleY: 1.05, translateX: 0, translateY: -0.03 },
  top: { scaleX: 1, scaleY: 1, translateX: 0, translateY: 0.022 },
  outer: { scaleX: 1, scaleY: 1, translateX: 0, translateY: 0.08 },
  dress: { scaleX: 1, scaleY: 1, translateX: 0, translateY: 0.022 },
  shoes: { scaleX: 1, scaleY: 1, translateX: 0, translateY: 0.05 },
  hat: { scaleX: 1, scaleY: 1, translateX: 0, translateY: -0.012 },
};

/** התאמות עדינות לפי persona (יחסי גוף שונים) */
const PERSONA_Y_BIAS: Record<AvatarPersona, Partial<Record<OutfitSlot, number>>> =
  {
    man: {},
    woman: {
      bottom: -0.01,
      top: 0.005,
      outer: 0.01,
      hat: -0.008,
    },
    teenBoy: {
      bottom: 0.01,
      top: 0.01,
      outer: 0.015,
      shoes: 0.01,
    },
    teenGirl: {
      bottom: 0.005,
      top: 0.008,
      outer: 0.012,
    },
    boy: {
      bottom: 0.02,
      top: 0.015,
      outer: 0.02,
      shoes: 0.015,
      hat: -0.005,
    },
    girl: {
      bottom: 0.015,
      top: 0.012,
      outer: 0.018,
      shoes: 0.012,
      hat: -0.005,
    },
  };

export type GarmentFitMode = 'baked' | 'cutout';

/**
 * מחזיר layout מלא לסלוט — עוגן + scale/translate + zIndex.
 * זה מקור האמת היחיד ליישור overlays בכל הקטלוג.
 */
export function overlayLayoutFor(
  persona: AvatarPersona,
  slot: OutfitSlot,
  mode: GarmentFitMode = 'cutout',
): OverlayAnchorLayout {
  const anchor = SLOT_ANCHOR[slot];
  const base = mode === 'baked' ? SLOT_NUDGE_BAKED[slot] : SLOT_NUDGE_CUTOUT[slot];
  const nudge = base ?? IDENTITY;
  const yBias = PERSONA_Y_BIAS[persona]?.[slot] ?? 0;

  return {
    anchor,
    scaleX: nudge.scaleX,
    scaleY: nudge.scaleY,
    translateX: nudge.translateX,
    translateY: nudge.translateY + yBias,
    zIndex: SLOT_Z_INDEX[slot],
  };
}

/** עוגן גוף ל־persona (כרגע אותה רשת קנונית; מוכן להרחבה) */
export function bodyAnchorFor(
  _persona: AvatarPersona,
  anchorId: AnchorId,
): BodyAnchor {
  return CANONICAL_ANCHORS[anchorId];
}
