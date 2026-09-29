import type { AvatarPersona } from '@/types';

/**
 * Outerwear Alignment System — חוקים גלובליים לכל עליונית
 * (מעיל / קפוצ׳ון / ז׳קט / ג׳קט ג׳ינס / ווסט / …) ולכל persona.
 *
 * מופעל אוטומטית כש־slot === 'outer' (category Outerwear),
 * בלי כיול ידני לפריט.
 */

export type OuterwearLayoutRules = {
  /** Scale אופקי — כיסוי כתפיים/שרוולים מלא */
  scaleX: number;
  /** Scale אנכי — בלי לטפס לפנים */
  scaleY: number;
  translateX: number;
  /** חיובי = למטה — Neckline Safety */
  translateY: number;
  /**
   * כשיש Top מתחת — העדף cutout פתוח (open-front)
   * כדי שהחולצה תיראה במרכז החזה.
   */
  preferOpenFrontCutout: boolean;
};

/** מינימום הזזה למטה לכל עליונית — צוואר/פנים תמיד גלויים */
export const OUTERWEAR_NECKLINE_MIN_Y = 0.03;

/**
 * מורפולוגיה לפי דמות — כיסוי זרועות + בטיחות צוואר.
 * ילדים: scaleX מעט רחב יותר יחסית לכתפיים הצרות.
 */
const OUTERWEAR_BY_PERSONA: Record<AvatarPersona, OuterwearLayoutRules> = {
  man: {
    scaleX: 1.04,
    scaleY: 1.0,
    translateX: 0,
    translateY: 0.04,
    preferOpenFrontCutout: true,
  },
  woman: {
    scaleX: 1.03,
    scaleY: 1.0,
    translateX: 0,
    translateY: 0.042,
    preferOpenFrontCutout: true,
  },
  teenBoy: {
    scaleX: 1.06,
    scaleY: 1.0,
    translateX: 0,
    translateY: 0.048,
    preferOpenFrontCutout: true,
  },
  teenGirl: {
    scaleX: 1.05,
    scaleY: 1.0,
    translateX: 0,
    translateY: 0.045,
    preferOpenFrontCutout: true,
  },
  boy: {
    scaleX: 1.08,
    scaleY: 1.0,
    translateX: 0,
    translateY: 0.055,
    preferOpenFrontCutout: true,
  },
  girl: {
    scaleX: 1.07,
    scaleY: 1.0,
    translateX: 0,
    translateY: 0.052,
    preferOpenFrontCutout: true,
  },
};

/** cutout / open-front — נכסים מצוירים גבוה; הזזה חזקה יותר מ־baked */
const CUTOUT_EXTRA_Y = 0.08;

/**
 * חוקי עליונית גלובליים ל־persona + מצב נכס.
 * `hasTopUnder` — לובשים חולצה מתחת → open-front + neckline בטוח.
 */
export function outerwearRulesFor(
  persona: AvatarPersona,
  mode: 'baked' | 'cutout',
  hasTopUnder = false,
): OuterwearLayoutRules {
  const base = OUTERWEAR_BY_PERSONA[persona] ?? OUTERWEAR_BY_PERSONA.man;
  let translateY = Math.max(base.translateY, OUTERWEAR_NECKLINE_MIN_Y);
  if (mode === 'cutout') {
    translateY += CUTOUT_EXTRA_Y;
  }
  // מעל חולצה — עוד למטה כדי לא לדרוס צווארון/פנים
  if (hasTopUnder) {
    translateY += 0.02;
  }

  return {
    scaleX: base.scaleX,
    scaleY: base.scaleY,
    translateX: base.translateX,
    translateY,
    preferOpenFrontCutout: base.preferOpenFrontCutout && hasTopUnder,
  };
}

/** מזהי cutout פתוחים (מרכז חזה שקוף) — נוצרים מ־`*-open.png` */
export const OPEN_FRONT_OUTER_IDS = new Set([
  'p-bomber',
  'p-denim-jkt',
  'p-leather',
  'p-hoodie',
  'p-hoodie-black',
  'p-coat',
  'p-blazer',
  'p-cardigan',
]);

/** האם להעדיף נכס open-front עבור מזהה קטלוג */
export function shouldUseOpenFrontOuter(
  catalogId: string,
  hasTopUnder: boolean,
): boolean {
  if (!hasTopUnder) return false;
  const id = catalogId.startsWith('p-') ? catalogId : `p-${catalogId}`;
  return OPEN_FRONT_OUTER_IDS.has(id) || OPEN_FRONT_OUTER_IDS.has(catalogId);
}
