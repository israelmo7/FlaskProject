import type { AvatarPersona } from '@/types';

/**
 * Outerwear Alignment — לגבר/אישה מעדיפים Fitted Look (גוף+מעיל),
 * לא cutout עם scale. החוקים כאן חלים בעיקר על ילדים / fallback overlays.
 */

export type OuterwearLayoutRules = {
  scaleX: number;
  scaleY: number;
  translateX: number;
  translateY: number;
  /** לבוגרים: false — משתמשים ב־Fitted Look */
  preferOpenFrontCutout: boolean;
};

/** בטיחות צוואר ל־fallback cutout בלבד */
export const OUTERWEAR_NECKLINE_MIN_Y = 0.02;

/**
 * Baked overlays על רשת Standard Fit — זהות (המעיל כבר מצויר על הגוף).
 * Cutout (ילדים): הזזה עדינה למטה + scaleX קל לכיסוי זרועות.
 */
const OUTERWEAR_BY_PERSONA: Record<
  AvatarPersona,
  { baked: OuterwearLayoutRules; cutout: OuterwearLayoutRules }
> = {
  man: {
    baked: {
      scaleX: 1,
      scaleY: 1,
      translateX: 0,
      translateY: 0,
      preferOpenFrontCutout: false,
    },
    cutout: {
      scaleX: 1,
      scaleY: 1,
      translateX: 0,
      translateY: 0.06,
      preferOpenFrontCutout: false,
    },
  },
  woman: {
    baked: {
      scaleX: 1,
      scaleY: 1,
      translateX: 0,
      translateY: 0,
      preferOpenFrontCutout: false,
    },
    cutout: {
      scaleX: 1,
      scaleY: 1,
      translateX: 0,
      translateY: 0.055,
      preferOpenFrontCutout: false,
    },
  },
  teenBoy: {
    baked: {
      scaleX: 1,
      scaleY: 1,
      translateX: 0,
      translateY: 0,
      preferOpenFrontCutout: false,
    },
    cutout: {
      scaleX: 1.02,
      scaleY: 1,
      translateX: 0,
      translateY: 0.05,
      preferOpenFrontCutout: false,
    },
  },
  teenGirl: {
    baked: {
      scaleX: 1,
      scaleY: 1,
      translateX: 0,
      translateY: 0,
      preferOpenFrontCutout: false,
    },
    cutout: {
      scaleX: 1.02,
      scaleY: 1,
      translateX: 0,
      translateY: 0.05,
      preferOpenFrontCutout: false,
    },
  },
  boy: {
    baked: {
      scaleX: 1,
      scaleY: 1,
      translateX: 0,
      translateY: 0,
      preferOpenFrontCutout: false,
    },
    cutout: {
      scaleX: 1.03,
      scaleY: 1,
      translateX: 0,
      translateY: 0.055,
      preferOpenFrontCutout: false,
    },
  },
  girl: {
    baked: {
      scaleX: 1,
      scaleY: 1,
      translateX: 0,
      translateY: 0,
      preferOpenFrontCutout: false,
    },
    cutout: {
      scaleX: 1.03,
      scaleY: 1,
      translateX: 0,
      translateY: 0.055,
      preferOpenFrontCutout: false,
    },
  },
};

export function outerwearRulesFor(
  persona: AvatarPersona,
  mode: 'baked' | 'cutout',
  _hasTopUnder = false,
): OuterwearLayoutRules {
  const row = OUTERWEAR_BY_PERSONA[persona] ?? OUTERWEAR_BY_PERSONA.man;
  const rules = mode === 'baked' ? row.baked : row.cutout;
  return {
    ...rules,
    translateY: Math.max(rules.translateY, mode === 'cutout' ? OUTERWEAR_NECKLINE_MIN_Y : 0),
  };
}

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

/** Open-front cutout כבוי לבוגרים — Fitted Look עדיף */
export function shouldUseOpenFrontOuter(
  _catalogId: string,
  _hasTopUnder: boolean,
): boolean {
  return false;
}
