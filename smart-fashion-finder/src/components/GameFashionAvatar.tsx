import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Image,
  PanResponder,
  Text,
  View,
  type GestureResponderEvent,
  type PanResponderGestureState,
} from 'react-native';
import {
  buildWidthScale,
  isFemalePersona,
} from '@/constants/avatar';
import {
  catalogIdFromPieceId,
  nearestTurnYaw,
  personaHasTurnFrames,
  resolveOutfitLook,
  turnBaseForPersona,
} from '@/constants/avatarAssets';
import { he } from '@/i18n/he';
import type { AvatarProfile, OutfitLayers } from '@/types';

type Props = {
  profile: AvatarProfile;
  layers: OutfitLayers;
  width: number;
  height: number;
};

function layersKey(layers: OutfitLayers): string {
  return [
    layers.top?.id,
    layers.top?.size,
    layers.bottom?.id,
    layers.bottom?.size,
    layers.outer?.id,
    layers.outer?.size,
    layers.dress?.id,
    layers.dress?.size,
    layers.shoes?.id,
    layers.shoes?.size,
    layers.hat?.id,
    layers.hat?.size,
  ].join('|');
}

function hasOuterClothes(layers: OutfitLayers): boolean {
  const bottomId = layers.bottom
    ? catalogIdFromPieceId(layers.bottom.id)
    : null;
  const shoesId = layers.shoes ? catalogIdFromPieceId(layers.shoes.id) : null;
  const realBottom = layers.bottom && bottomId !== 'p-underwear';
  const realShoes = layers.shoes && shoesId !== 'p-socks';
  return Boolean(
    layers.top ||
      layers.outer ||
      layers.dress ||
      layers.hat ||
      realBottom ||
      realShoes,
  );
}

/**
 * דמות משחק — הגוף תמיד בגודל קבוע; רק הבגד משתנה לפי מידה.
 * סיבוב 180° בלי לכיווץ הדמות לקו דק.
 */
export function GameFashionAvatar({ profile, layers, width, height }: Props) {
  const female = isFemalePersona(profile.persona);
  const wScale = buildWidthScale(profile.build);
  const hasTurnFrames = personaHasTurnFrames(profile.persona);

  const [yaw, setYaw] = useState(0);
  const yawRef = useRef(0);
  const startYaw = useRef(0);
  const outfitKey = layersKey(layers);
  const clothed = hasOuterClothes(layers);

  useEffect(() => {
    yawRef.current = 0;
    setYaw(0);
  }, [outfitKey, profile.persona]);

  const pan = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onStartShouldSetPanResponderCapture: () => true,
        onMoveShouldSetPanResponder: (_e, g) => Math.abs(g.dx) > 2,
        onMoveShouldSetPanResponderCapture: (_e, g) => Math.abs(g.dx) > 2,
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: () => {
          startYaw.current = yawRef.current;
        },
        onPanResponderMove: (
          _e: GestureResponderEvent,
          g: PanResponderGestureState,
        ) => {
          const next = Math.max(0, Math.min(180, startYaw.current + g.dx * 0.65));
          yawRef.current = next;
          setYaw(next);
        },
        onPanResponderRelease: () => {
          // קפיצה ל־0 / 90 / 180 — הדמות נשארת מלאה בכל זווית
          const snapped = Math.round(yawRef.current / 90) * 90;
          const clamped = Math.max(0, Math.min(180, snapped));
          yawRef.current = clamped;
          setYaw(clamped);
        },
      }),
    [],
  );

  const resolved = useMemo(
    () =>
      resolveOutfitLook(
        layers,
        yaw,
        female,
        profile.heightCm,
        profile.persona,
      ),
    [layers, yaw, female, profile.heightCm, profile.persona],
  );

  const baseSrc = turnBaseForPersona(profile.persona, yaw);
  // רוחב גוף לפי מבנה בלבד — לא לפי מידת בגד
  const bodyScaleX = Math.min(1.18, Math.max(0.82, wScale));

  // סיבוב: היפוך מלא ב־180° — הדמות נשארת דמות (בלי כיווץ ל־0.22)
  const facingBack = yaw > 90;
  const mirror = facingBack ? -1 : 1;
  // עם פריימי סיבוב אמיתיים — הפריים כבר מראה זווית, בלי היפוך על הבסיס
  const baseScaleX = hasTurnFrames ? bodyScaleX : mirror * bodyScaleX;
  // בגדים תמיד מתהפכים יחד עם הכיוון הוויזואלי
  const clothScaleX = mirror * bodyScaleX;

  const frame = nearestTurnYaw(yaw);

  const viewLabel =
    yaw <= 45 ? '' : yaw <= 135 ? he.sideViewHint : he.backViewHint;

  return (
    <View
      collapsable={false}
      style={{ width, height, minHeight: 160 }}
      {...pan.panHandlers}
    >
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          bottom: height * 0.015,
          left: width * 0.18,
          width: width * 0.64,
          height: height * 0.03,
          borderRadius: 999,
          backgroundColor: 'rgba(40,30,20,0.12)',
        }}
      />

      {/* גוף הדמות — תמיד אותו גודל, לא מושפע ממידת בגד */}
      <Image
        source={baseSrc}
        resizeMode="contain"
        style={{
          position: 'absolute',
          width,
          height,
          transform: [{ scaleX: baseScaleX }],
        }}
      />

      {/* בגדים בלבד — כאן משתנה המידה (S/M/L) */}
      {clothed
        ? resolved.overlays.map((ov, i) => {
            const garmentScale = ov.scale * ov.bodyScale;
            return (
              <Image
                key={`ov-${ov.key}-${i}-${frame}`}
                source={ov.src}
                resizeMode="contain"
                style={{
                  position: 'absolute',
                  width,
                  height,
                  transform: [
                    { translateX: ov.translateX * width },
                    { translateY: ov.translateY * height },
                    { scaleX: clothScaleX * garmentScale },
                    { scaleY: garmentScale * ov.scaleY },
                  ],
                }}
              />
            );
          })
        : null}

      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          bottom: 4,
          left: 0,
          right: 0,
          alignItems: 'center',
        }}
      >
        <Text
          style={{
            fontSize: 10,
            color: 'rgba(40,30,20,0.45)',
            fontFamily: 'DMSans_500Medium',
          }}
        >
          {viewLabel || he.rotateAvatarHint}
        </Text>
      </View>
    </View>
  );
}
