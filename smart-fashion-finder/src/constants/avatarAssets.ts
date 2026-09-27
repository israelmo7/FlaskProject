import type { ImageSourcePropType } from 'react-native';
import type { AvatarPersona, OutfitLayers, OutfitPiece } from '@/types';
import { garmentFitOnBody, usesPaintedAdultLooks } from '@/constants/avatar';

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
  'p-polo': require('../../assets/images/fit/man/p-polo.png'),
  'p-linen': require('../../assets/images/fit/man/p-linen.png'),
  'p-jeans': require('../../assets/images/fit/man/p-jeans.png'),
  'p-shorts': require('../../assets/images/fit/man/p-shorts.png'),
  'p-cargo': require('../../assets/images/fit/man/p-cargo.png'),
  'p-sport': require('../../assets/images/fit/man/p-sport.png'),
  'p-chinos': require('../../assets/images/fit/man/p-chinos.png'),
  'p-swim': require('../../assets/images/fit/man/p-swim.png'),
  'p-denim-jkt': require('../../assets/images/fit/man/p-denim-jkt.png'),
  'p-leather': require('../../assets/images/fit/man/p-leather.png'),
  'p-bomber': require('../../assets/images/fit/man/p-bomber.png'),
  'p-sneakers': require('../../assets/images/fit/man/p-sneakers.png'),
  'p-boots': require('../../assets/images/fit/man/p-boots.png'),
  'p-hat': require('../../assets/images/fit/man/p-hat.png'),
  // תחתון = בסיס הדמות (ללא בגדים עליונים)
  'p-underwear': require('../../assets/images/bases/turn/man_0.png'),
  // גרביים — על בסיס הדמות (נראים עם הנעליים הקיימות)
  'p-socks': require('../../assets/images/bases/turn/man_0.png'),
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
  'p-bomber|p-jeans': require('../../assets/images/fit/man/combo-bomber-jeans.png'),
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
  'p-polo': require('../../assets/images/fit/man/overlay/p-polo.png'),
  'p-linen': require('../../assets/images/fit/man/overlay/p-linen.png'),
  'p-jeans': require('../../assets/images/fit/man/overlay/p-jeans.png'),
  'p-shorts': require('../../assets/images/fit/man/overlay/p-shorts.png'),
  'p-cargo': require('../../assets/images/fit/man/overlay/p-cargo.png'),
  'p-sport': require('../../assets/images/fit/man/overlay/p-sport.png'),
  'p-chinos': require('../../assets/images/fit/man/overlay/p-chinos.png'),
  'p-swim': require('../../assets/images/fit/man/overlay/p-swim.png'),
  'p-denim-jkt': require('../../assets/images/fit/man/overlay/p-denim-jkt.png'),
  'p-leather': require('../../assets/images/fit/man/overlay/p-leather.png'),
  'p-bomber': require('../../assets/images/fit/man/overlay/p-bomber.png'),
  'p-sneakers': require('../../assets/images/fit/man/overlay/p-sneakers.png'),
  'p-boots': require('../../assets/images/fit/man/overlay/p-boots.png'),
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
    'p-polo',
    'p-linen',
    'p-jeans',
    'p-shorts',
    'p-cargo',
    'p-sport',
    'p-chinos',
    'p-swim',
    'p-denim-jkt',
    'p-leather',
    'p-bomber',
    'p-dress',
    'p-sneakers',
    'p-boots',
    'p-hat',
    'p-underwear',
    'p-socks',
    'w-black-shirt',
    'w-white-oxford',
    'w-blue-jeans',
    'w-olive-cargo',
    'w-denim-jacket',
    'w-beige-dress',
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
      if (k === 'w-beige-dress') return 'p-dress';
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

/** האם לדמות יש פריימי סיבוב ייעודיים */
export function personaHasTurnFrames(persona: AvatarPersona): boolean {
  return persona === 'man' || persona === 'woman';
}

/**
 * בסיס הדמות לפי persona — ילדה/ילד/נער מקבלים את התמונה שלהם,
 * לא גבר/אישה.
 */
export function turnBaseForPersona(
  persona: AvatarPersona,
  yaw: number,
): ImageSourcePropType {
  if (persona === 'man') {
    return MAN_TURN[nearestTurnYaw(yaw)];
  }
  if (persona === 'woman') {
    const frame = nearestTurnYaw(yaw);
    const exact = WOMAN_TURN[frame];
    if (exact) return exact;
    if (frame <= 45) return WOMAN_TURN[0]!;
    if (frame <= 135) return WOMAN_TURN[90]!;
    return WOMAN_TURN[180]!;
  }
  // ילד / ילדה / נער / נערה — בסיס ייעודי (סיבוב ב־scaleX בקומפוננטה)
  return PERSONA_BASE_IMAGES[persona];
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

export type ResolvedOverlay = {
  src: ImageSourcePropType;
  /** סולם מידה מותאם לגובה הבובה */
  scale: number;
  key: string;
};

export type ResolvedOutfit = {
  /** תמונת גוף מלאה (לוק / קומבו / בסיס) */
  hero: ImageSourcePropType | null;
  /** האם ה־hero כבר כולל סיבוב לפי yaw */
  heroTracksYaw: boolean;
  /** סולם מידה ל־hero (לפי פריט דומיננטי) */
  heroScale: number;
  /** שכבות נוספות מעל ה־hero (אזורי בגד) */
  overlays: ResolvedOverlay[];
  /** מצב שכבות בלבד — בסיס persona נשאר מתחת */
  overlayOnly: boolean;
};

function pieceCatalogId(
  piece: { id: string } | undefined,
): string | null {
  return piece ? catalogIdFromPieceId(piece.id) : null;
}

function fitFor(piece: OutfitPiece | undefined, heightCm: number): number {
  return garmentFitOnBody(piece?.size, heightCm);
}

function pushOverlayLayer(
  extras: ResolvedOverlay[],
  piece: OutfitPiece | undefined,
  heightCm: number,
  skipIds?: string[],
) {
  const id = pieceCatalogId(piece);
  if (!id || skipIds?.includes(id)) return;
  if (id === 'p-underwear' || id === 'p-socks') return;
  const o = fittedOverlayForId(id);
  if (!o) return;
  extras.push({
    src: o,
    scale: fitFor(piece, heightCm),
    key: `${id}-${piece?.size ?? 'M'}`,
  });
}

/** שכבות בגד בלבד — לילד/ילדה/נער שלא מחליפים את גוף הדמות */
function resolveOverlayOnlyStack(
  layers: OutfitLayers,
  heightCm: number,
): ResolvedOutfit {
  const overlays: ResolvedOverlay[] = [];
  // סדר: תחתון → שמלה/טופ → עליונית → נעליים → כובע
  pushOverlayLayer(overlays, layers.bottom, heightCm);
  pushOverlayLayer(overlays, layers.dress, heightCm);
  pushOverlayLayer(overlays, layers.top, heightCm);
  pushOverlayLayer(overlays, layers.outer, heightCm);
  pushOverlayLayer(overlays, layers.shoes, heightCm, ['p-socks']);
  pushOverlayLayer(overlays, layers.hat, heightCm);
  const dominant =
    layers.outer || layers.dress || layers.top || layers.bottom || layers.shoes;
  return {
    hero: null,
    heroTracksYaw: false,
    heroScale: fitFor(dominant, heightCm),
    overlays,
    overlayOnly: true,
  };
}

/**
 * בחירת לוק מצויר / קומבו / שכבות — הבגדים נשארים גם בסיבוב 180°.
 * לדמויות ילד/נער: שכבות על בסיס הדמות (בלי להחליף לגוף גבר/אישה).
 */
export function resolveOutfitLook(
  layers: OutfitLayers,
  yaw: number,
  female: boolean,
  heightCm = 165,
  persona?: AvatarPersona,
): ResolvedOutfit {
  // אישה / ילדים / נערים — לא מחליפים את גוף הדמות בלוק גברי
  if (persona && !usesPaintedAdultLooks(persona)) {
    // שמלה לאישה — לוק מצויר ייעודי
    if (persona === 'woman' && layers.dress) {
      const dressId = pieceCatalogId(layers.dress);
      const dressLook = dressId ? fittedLookForId(dressId, true) : null;
      const extras: ResolvedOverlay[] = [];
      pushOverlayLayer(extras, layers.shoes, heightCm, ['p-socks']);
      pushOverlayLayer(extras, layers.hat, heightCm);
      if (dressLook) {
        return {
          hero: dressLook,
          heroTracksYaw: false,
          heroScale: fitFor(layers.dress, heightCm),
          overlays: extras,
          overlayOnly: false,
        };
      }
    }
    return resolveOverlayOnlyStack(layers, heightCm);
  }

  const topId = pieceCatalogId(layers.top);
  const bottomId = pieceCatalogId(layers.bottom);
  const outerId = pieceCatalogId(layers.outer);
  const dressId = pieceCatalogId(layers.dress);

  const withAccessories = (
    hero: ImageSourcePropType | null,
    heroTracksYaw: boolean,
    heroPiece: OutfitPiece | undefined,
    baseExtras: ResolvedOverlay[] = [],
  ): ResolvedOutfit => {
    const extras = [...baseExtras];
    pushOverlayLayer(extras, layers.shoes, heightCm, ['p-socks']);
    pushOverlayLayer(extras, layers.hat, heightCm);
    const safeHero: ImageSourcePropType | null =
      hero ??
      (outerId ? fittedLookForId(outerId, female) : null) ??
      (topId ? fittedLookForId(topId, female) : null) ??
      (bottomId ? fittedLookForId(bottomId, female) : null) ??
      (dressId ? fittedLookForId(dressId, female) : null) ??
      null;
    const dominant =
      heroPiece ||
      layers.outer ||
      layers.dress ||
      layers.top ||
      layers.bottom ||
      layers.shoes;
    return {
      hero: safeHero,
      heroTracksYaw,
      heroScale: fitFor(dominant, heightCm),
      overlays: extras,
      overlayOnly: false,
    };
  };

  if (bottomId === 'p-underwear' && !topId && !outerId && !dressId) {
    return withAccessories(
      fittedLookForId('p-underwear', female),
      false,
      layers.bottom,
    );
  }

  if (dressId) {
    return withAccessories(
      fittedLookForId(dressId, female),
      false,
      layers.dress,
    );
  }

  if (topId === 'p-tshirt' && bottomId === 'p-jeans' && !outerId) {
    const frame = nearestTurnYaw(yaw);
    const hero =
      COMBO_TSHIRT_JEANS[frame] ??
      (frame <= 45
        ? COMBO_TSHIRT_JEANS[0]
        : frame <= 135
          ? COMBO_TSHIRT_JEANS[90]
          : COMBO_TSHIRT_JEANS[180]) ??
      null;
    return withAccessories(hero, true, layers.top);
  }

  const comboKeys: string[] = [];
  if (outerId && bottomId) comboKeys.push(`${outerId}|${bottomId}`);
  if (topId && bottomId) comboKeys.push(`${topId}|${bottomId}`);
  for (const key of comboKeys) {
    const combo = FITTED_COMBOS[key];
    if (combo) {
      const extras: ResolvedOverlay[] = [];
      if (outerId && topId && key === `${topId}|${bottomId}`) {
        pushOverlayLayer(extras, layers.outer, heightCm);
      }
      return withAccessories(
        combo,
        false,
        layers.outer || layers.top,
        extras,
      );
    }
  }

  const mains = [outerId, topId, bottomId].filter(Boolean) as string[];
  if (mains.length === 1) {
    const piece =
      (outerId === mains[0] && layers.outer) ||
      (topId === mains[0] && layers.top) ||
      (bottomId === mains[0] && layers.bottom) ||
      undefined;
    return withAccessories(
      fittedLookForId(mains[0], female),
      false,
      piece || undefined,
    );
  }
  if (mains.length === 0 && (layers.shoes || layers.hat)) {
    const piece = layers.shoes?.id.includes('socks')
      ? layers.hat
      : layers.shoes || layers.hat;
    const heroId = pieceCatalogId(piece);
    return withAccessories(
      heroId ? fittedLookForId(heroId, female) : null,
      false,
      piece,
    );
  }

  const overlays: ResolvedOverlay[] = [];
  let hero: ImageSourcePropType | null = null;
  let heroPiece: OutfitPiece | undefined;

  if (outerId && bottomId) {
    hero = fittedLookForId(bottomId, female);
    heroPiece = layers.bottom;
    pushOverlayLayer(overlays, layers.outer, heightCm);
  } else if (outerId && topId) {
    hero = fittedLookForId(topId, female);
    heroPiece = layers.top;
    pushOverlayLayer(overlays, layers.outer, heightCm);
  } else if (outerId) {
    hero = fittedLookForId(outerId, female);
    heroPiece = layers.outer;
  } else if (bottomId) {
    hero = fittedLookForId(bottomId, female);
    heroPiece = layers.bottom;
    pushOverlayLayer(overlays, layers.top, heightCm);
  } else if (topId) {
    hero = fittedLookForId(topId, female);
    heroPiece = layers.top;
  }

  return withAccessories(hero, false, heroPiece, overlays);
}
