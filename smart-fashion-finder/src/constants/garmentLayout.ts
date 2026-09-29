import type { AvatarPersona, OutfitSlot } from '@/types';
import {
  overlayLayoutFor,
  type GarmentFitMode,
  type OverlayAnchorLayout,
} from '@/constants/overlayAnchors';

export type { GarmentFitMode } from '@/constants/overlayAnchors';

/** @deprecated — השתמשו ב־OverlayAnchorLayout / overlayLayoutFor */
export type SlotLayout = {
  bodyScale: number;
  y: number;
  x: number;
};

/** טרנספורם סופי של בגד על הגוף (שברי קנבס Standard Fit) */
export type GarmentTransform = {
  scaleX: number;
  scaleY: number;
  translateX: number;
  translateY: number;
  zIndex: number;
  anchor: OverlayAnchorLayout['anchor'];
};

/**
 * פריסת סלוט לפי מערכת Anchor Points (Standard Fit 480×900).
 */
export function slotLayoutFor(
  persona: AvatarPersona,
  slot: OutfitSlot,
  mode: GarmentFitMode = 'cutout',
): SlotLayout {
  const layout = overlayLayoutFor(persona, slot, mode);
  return {
    bodyScale: (layout.scaleX + layout.scaleY) / 2,
    y: layout.translateY,
    x: layout.translateX,
  };
}

/**
 * @deprecated Standard Fit — מידה/גובה לא משפיעים על הוויזואל
 */
export function garmentFitFactor(
  _size?: string,
  _heightCm?: number,
): number {
  return 1;
}

/**
 * Standard Fit + Anchor Points — יישור אחיד לכל הקטלוג.
 * מידה / גובה לא משנים scale (זהות Standard Fit).
 */
export function garmentFitTransform(
  _size: string | undefined,
  _heightCm: number,
  slot: OutfitSlot,
  layout: SlotLayout,
  persona: AvatarPersona = 'man',
  mode: GarmentFitMode = 'cutout',
): GarmentTransform {
  // מעדיפים את מערכת העוגנים המלאה; SlotLayout נשמר לתאימות
  const anchored = overlayLayoutFor(persona, slot, mode);
  return {
    scaleX: anchored.scaleX || layout.bodyScale,
    scaleY: anchored.scaleY || layout.bodyScale,
    translateX: anchored.translateX,
    translateY: anchored.translateY,
    zIndex: anchored.zIndex,
    anchor: anchored.anchor,
  };
}

/** תאימות לאחור */
export function garmentHang(
  size: string | undefined,
  heightCm: number,
  slot: OutfitSlot,
): { translateY: number; scaleY: number } {
  const t = garmentFitTransform(size, heightCm, slot, {
    bodyScale: 1,
    y: 0,
    x: 0,
  });
  return { translateY: t.translateY, scaleY: t.scaleY };
}

/** תאימות לאחור — תמיד 1 */
export function garmentVisualScale(
  _size?: string,
  _heightCm?: number,
): number {
  return 1;
}
