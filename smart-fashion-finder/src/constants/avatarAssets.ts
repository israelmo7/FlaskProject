import type { ImageSourcePropType } from 'react-native';
import type { AvatarPersona, OutfitLayers } from '@/types';
import { isFemalePersona } from '@/constants/avatar';

export const PERSONA_BASE_IMAGES: Record<AvatarPersona, ImageSourcePropType> = {
  woman: require('../../assets/images/bases/woman.png'),
  man: require('../../assets/images/bases/man.png'),
  teenGirl: require('../../assets/images/bases/teenGirl.png'),
  teenBoy: require('../../assets/images/bases/teenBoy.png'),
  girl: require('../../assets/images/bases/girl.png'),
  boy: require('../../assets/images/bases/boy.png'),
};

/** פריימי סיבוב 180° (קדמי → אחורי) */
export const TURN_YAWS = [0, 45, 90, 135, 180] as const;
export type TurnYaw = (typeof TURN_YAWS)[number];

const MAN_TURN: Record<TurnYaw, ImageSourcePropType> = {
  0: require('../../assets/images/bases/turn/man_0.png'),
  45: require('../../assets/images/bases/turn/man_45.png'),
  90: require('../../assets/images/bases/turn/man_90.png'),
  135: require('../../assets/images/bases/turn/man_135.png'),
  180: require('../../assets/images/bases/turn/man_180.png'),
};

const WOMAN_TURN: Partial<Record<TurnYaw, ImageSourcePropType>> = {
  0: require('../../assets/images/bases/turn/woman_0.png'),
  90: require('../../assets/images/bases/turn/woman_90.png'),
  180: require('../../assets/images/bases/turn/woman_180.png'),
};

/** לוקים מלאים — בגד לבוש על הדמות (חזית) */
export const FITTED_LOOKS_MAN: Record<string, ImageSourcePropType> = {
  'p-tshirt': require('../../assets/images/fit/man/p-tshirt.png'),
  'p-hoodie': require('../../assets/images/fit/man/p-hoodie.png'),
  'p-oxford': require('../../assets/images/fit/man/p-oxford.png'),
  'p-turtleneck': require('../../assets/images/fit/man/p-turtleneck.png'),
  'p-jeans': require('../../assets/images/fit/man/p-jeans.png'),
  'p-shorts': require('../../assets/images/fit/man/p-shorts.png'),
  'p-cargo': require('../../assets/images/fit/man/p-cargo.png'),
  'p-sport': require('../../assets/images/fit/man/p-sport.png'),
  'p-denim-jkt': require('../../assets/images/fit/man/p-denim-jkt.png'),
  'p-leather': require('../../assets/images/fit/man/p-leather.png'),
  'p-sneakers': require('../../assets/images/fit/man/p-sneakers.png'),
  'p-hat': require('../../assets/images/fit/man/p-hat.png'),
};

export const FITTED_LOOKS_WOMAN: Record<string, ImageSourcePropType> = {
  'p-dress': require('../../assets/images/fit/woman/p-dress.png'),
};

/** קומבואים מצוירים — מפתח topId|bottomId או outerId|bottomId */
export const FITTED_COMBOS: Record<string, ImageSourcePropType> = {
  'p-tshirt|p-jeans': require('../../assets/images/fit/man/combo-tshirt-jeans_0.png'),
  'p-hoodie|p-jeans': require('../../assets/images/fit/man/combo-hoodie-jeans.png'),
  'p-turtleneck|p-jeans': require('../../assets/images/fit/man/combo-turtleneck-jeans.png'),
  'p-oxford|p-jeans': require('../../assets/images/fit/man/combo-oxford-jeans.png'),
  'p-tshirt|p-cargo': require('../../assets/images/fit/man/combo-tshirt-cargo.png'),
  'p-denim-jkt|p-jeans': require('../../assets/images/fit/man/combo-denim-jkt-jeans.png'),
  'p-leather|p-jeans': require('../../assets/images/fit/man/combo-leather-jeans.png'),
};

/** קומבו טי+ג׳ינס עם פריימי 180° */
export const COMBO_TSHIRT_JEANS: Partial<Record<TurnYaw, ImageSourcePropType>> = {
  0: require('../../assets/images/fit/man/combo-tshirt-jeans_0.png'),
  90: require('../../assets/images/fit/man/combo-tshirt-jeans_90.png'),
  180: require('../../assets/images/fit/man/combo-tshirt-jeans_180.png'),
};

/** שכבות בגד (אזור גוף מהלוק המצויר) */
export const FITTED_OVERLAYS_MAN: Record<string, ImageSourcePropType> = {
  'p-tshirt': require('../../assets/images/fit/man/overlay/p-tshirt.png'),
  'p-hoodie': require('../../assets/images/fit/man/overlay/p-hoodie.png'),
  'p-oxford': require('../../assets/images/fit/man/overlay/p-oxford.png'),
  'p-turtleneck': require('../../assets/images/fit/man/overlay/p-turtleneck.png'),
  'p-jeans': require('../../assets/images/fit/man/overlay/p-jeans.png'),
  'p-shorts': require('../../assets/images/fit/man/overlay/p-shorts.png'),
  'p-cargo': require('../../assets/images/fit/man/overlay/p-cargo.png'),
  'p-sport': require('../../assets/images/fit/man/overlay/p-sport.png'),
  'p-denim-jkt': require('../../assets/images/fit/man/overlay/p-denim-jkt.png'),
  'p-leather': require('../../assets/images/fit/man/overlay/p-leather.png'),
  'p-sneakers': require('../../assets/images/fit/man/overlay/p-sneakers.png'),
  'p-hat': require('../../assets/images/fit/man/overlay/p-hat.png'),
};

export const GARMENT_LAYER_IMAGES: Record<string, ImageSourcePropType> = {
  'w-black-shirt': require('../../assets/images/layers/black-shirt-v2.png'),
  'w-white-oxford': require('../../assets/images/layers/white-shirt-v2.png'),
  'w-olive-cargo': require('../../assets/images/layers/olive-pants-v2.png'),
  'w-blue-jeans': require('../../assets/images/layers/blue-jeans-v2.png'),
  'w-denim-jacket': require('../../assets/images/layers/denim-jacket-v2.png'),
  'w-hat': require('../../assets/images/layers/hat.png'),
  'w-sneakers': require('../../assets/images/layers/sneakers.png'),
  'p-tshirt': require('../../assets/images/layers/black-shirt-v2.png'),
  'p-hoodie': require('../../assets/images/product-hoodie.png'),
  'p-oxford': require('../../assets/images/layers/white-shirt-v2.png'),
  'p-turtleneck': require('../../assets/images/product-turtleneck.png'),
  'p-jeans': require('../../assets/images/layers/blue-jeans-v2.png'),
  'p-shorts': require('../../assets/images/product-denim-shorts.png'),
  'p-cargo': require('../../assets/images/layers/olive-pants-v2.png'),
  'p-sport': require('../../assets/images/product-sport-pants.png'),
  'p-denim-jkt': require('../../assets/images/layers/denim-jacket-v2.png'),
  'p-leather': require('../../assets/images/product-leather.png'),
  'p-dress': require('../../assets/images/product-dress.png'),
  'p-sneakers': require('../../assets/images/layers/sneakers.png'),
  'p-hat': require('../../assets/images/layers/hat.png'),
};

const LAYER_KEYS_DESC = Object.keys(GARMENT_LAYER_IMAGES).sort(
  (a, b) => b.length - a.length,
);

export function layerImageForPieceId(pieceId: string): ImageSourcePropType | null {
  for (const key of LAYER_KEYS_DESC) {
    if (pieceId.includes(key)) return GARMENT_LAYER_IMAGES[key];
  }
  return null;
}

export function catalogIdFromPieceId(pieceId: string): string | null {
  const keys = [
    'p-tshirt',
    'p-hoodie',
    'p-oxford',
    'p-turtleneck',
    'p-jeans',
    'p-shorts',
    'p-cargo',
    'p-sport',
    'p-denim-jkt',
    'p-leather',
    'p-dress',
    'p-sneakers',
    'p-hat',
    'w-black-shirt',
    'w-white-oxford',
    'w-blue-jeans',
    'w-olive-cargo',
    'w-denim-jacket',
    'w-sneakers',
    'w-hat',
  ];
  const sorted = [...keys].sort((a, b) => b.length - a.length);
  for (const k of sorted) {
    if (pieceId.includes(k)) {
      if (k === 'w-black-shirt') return 'p-tshirt';
      if (k === 'w-white-oxford') return 'p-oxford';
      if (k === 'w-blue-jeans') return 'p-jeans';
      if (k === 'w-olive-cargo') return 'p-cargo';
      if (k === 'w-denim-jacket') return 'p-denim-jkt';
      if (k === 'w-sneakers') return 'p-sneakers';
      if (k === 'w-hat') return 'p-hat';
      return k;
    }
  }
  return null;
}

export function nearestTurnYaw(yaw: number): TurnYaw {
  const clamped = Math.max(0, Math.min(180, yaw));
  let best: TurnYaw = 0;
  let bestDist = Infinity;
  for (const y of TURN_YAWS) {
    const d = Math.abs(y - clamped);
    if (d < bestDist) {
      bestDist = d;
      best = y;
    }
  }
  return best;
}

export function turnBaseForPersona(
  persona: AvatarPersona,
  yaw: number,
): ImageSourcePropType {
  const frame = nearestTurnYaw(yaw);
  if (isFemalePersona(persona)) {
    const exact = WOMAN_TURN[frame];
    if (exact) return exact;
    if (frame <= 45) return WOMAN_TURN[0]!;
    if (frame <= 135) return WOMAN_TURN[90]!;
    return WOMAN_TURN[180]!;
  }
  return MAN_TURN[frame];
}

export function fittedLookForId(
  catalogId: string,
  female: boolean,
): ImageSourcePropType | null {
  if (female && FITTED_LOOKS_WOMAN[catalogId]) return FITTED_LOOKS_WOMAN[catalogId];
  return FITTED_LOOKS_MAN[catalogId] ?? FITTED_LOOKS_WOMAN[catalogId] ?? null;
}

export function fittedOverlayForId(catalogId: string): ImageSourcePropType | null {
  return FITTED_OVERLAYS_MAN[catalogId] ?? null;
}

export function frontFacingAmount(yaw: number): number {
  const rad = (Math.max(0, Math.min(180, yaw)) * Math.PI) / 180;
  return Math.max(0, Math.cos(rad));
}

export type ResolvedOutfit = {
  /** תמונת גוף מלאה (לוק / קומבו / בסיס) */
  hero: ImageSourcePropType | null;
  /** האם ה־hero כבר כולל סיבוב לפי yaw */
  heroTracksYaw: boolean;
  /** שכבות נוספות מעל ה־hero (אזורי בגד) */
  overlays: ImageSourcePropType[];
};

function pieceCatalogId(
  piece: { id: string } | undefined,
): string | null {
  return piece ? catalogIdFromPieceId(piece.id) : null;
}

/**
 * בחירת לוק מצויר / קומבו / שכבות — כדי שכל בגד יישב טוב על הדמות.
 */
export function resolveOutfitLook(
  layers: OutfitLayers,
  yaw: number,
  female: boolean,
): ResolvedOutfit {
  const topId = pieceCatalogId(layers.top);
  const bottomId = pieceCatalogId(layers.bottom);
  const outerId = pieceCatalogId(layers.outer);
  const dressId = pieceCatalogId(layers.dress);
  const shoesId = pieceCatalogId(layers.shoes);
  const hatId = pieceCatalogId(layers.hat);
  const facing = frontFacingAmount(yaw);

  // שמלה
  if (dressId) {
    const dress = fittedLookForId(dressId, female);
    const extras: ImageSourcePropType[] = [];
    if (shoesId && facing > 0.35) {
      const o = fittedOverlayForId(shoesId);
      if (o) extras.push(o);
    }
    if (hatId && facing > 0.35) {
      const o = fittedOverlayForId(hatId);
      if (o) extras.push(o);
    }
    return { hero: dress, heroTracksYaw: false, overlays: extras };
  }

  // קומבו טי+ג׳ינס עם סיבוב מלא
  if (topId === 'p-tshirt' && bottomId === 'p-jeans' && !outerId) {
    const frame = nearestTurnYaw(yaw);
    let hero =
      COMBO_TSHIRT_JEANS[frame] ??
      (frame <= 45
        ? COMBO_TSHIRT_JEANS[0]
        : frame <= 135
          ? COMBO_TSHIRT_JEANS[90]
          : COMBO_TSHIRT_JEANS[180]) ??
      null;
    const extras: ImageSourcePropType[] = [];
    if (shoesId && facing > 0.4) {
      const o = fittedOverlayForId(shoesId);
      if (o) extras.push(o);
    }
    if (hatId && facing > 0.4) {
      const o = fittedOverlayForId(hatId);
      if (o) extras.push(o);
    }
    return { hero, heroTracksYaw: true, overlays: extras };
  }

  // קומבואים מצוירים אחרים (חזית)
  const comboKeys: string[] = [];
  if (outerId && bottomId) comboKeys.push(`${outerId}|${bottomId}`);
  if (topId && bottomId) comboKeys.push(`${topId}|${bottomId}`);
  for (const key of comboKeys) {
    const combo = FITTED_COMBOS[key];
    if (combo) {
      const extras: ImageSourcePropType[] = [];
      // אם יש גם עליונית מעל קומבו טופ+תחתון
      if (outerId && key.startsWith(topId + '|')) {
        const o = fittedOverlayForId(outerId);
        if (o && facing > 0.35) extras.push(o);
      }
      if (shoesId && facing > 0.35) {
        const o = fittedOverlayForId(shoesId);
        if (o) extras.push(o);
      }
      if (hatId && facing > 0.35) {
        const o = fittedOverlayForId(hatId);
        if (o) extras.push(o);
      }
      return { hero: combo, heroTracksYaw: false, overlays: extras };
    }
  }

  // פריט יחיד עיקרי — לוק מלא
  const mains = [outerId, topId, bottomId].filter(Boolean) as string[];
  if (mains.length === 1) {
    const hero = fittedLookForId(mains[0], female);
    const extras: ImageSourcePropType[] = [];
    if (shoesId && facing > 0.35) {
      const o = fittedOverlayForId(shoesId);
      if (o) extras.push(o);
    }
    if (hatId && facing > 0.35) {
      const o = fittedOverlayForId(hatId);
      if (o) extras.push(o);
    }
    return { hero, heroTracksYaw: false, overlays: extras };
  }

  // כמה שכבות בלי קומבו מוכן:
  // גוף = לוק המכנסיים (או עליונית/טופ), מעליו שכבות אזוריות מצוירות
  const overlays: ImageSourcePropType[] = [];
  let hero: ImageSourcePropType | null = null;

  if (bottomId) {
    hero = fittedLookForId(bottomId, female);
    if (topId) {
      const o = fittedOverlayForId(topId);
      if (o) overlays.push(o);
    }
    if (outerId) {
      const o = fittedOverlayForId(outerId);
      if (o) overlays.push(o);
    }
  } else if (topId) {
    hero = fittedLookForId(topId, female);
    if (outerId) {
      const o = fittedOverlayForId(outerId);
      if (o) overlays.push(o);
    }
  } else if (outerId) {
    hero = fittedLookForId(outerId, female);
  }

  if (shoesId) {
    const o = fittedOverlayForId(shoesId);
    if (o) overlays.push(o);
  }
  if (hatId) {
    const o = fittedOverlayForId(hatId);
    if (o) overlays.push(o);
  }

  // רק אקססוריז
  if (!hero && overlays.length > 0) {
    return { hero: null, heroTracksYaw: false, overlays };
  }

  return { hero, heroTracksYaw: false, overlays };
}
