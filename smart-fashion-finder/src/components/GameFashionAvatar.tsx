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
  personaHasPaintedTurn,
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
  yaw?: number;
  onYawChange?: (yaw: number) => void;
  enablePan?: boolean;
  showHint?: boolean;
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
 * דמות משחק — סיבוב 180° לכל persona:
 * - גבר/אישה: פריימי גב אמיתיים
 * - ילדה/ילד/נער: PNG מראה מוכן + היפוך שכבות בגד
 * גוף קבוע, מידה רק על הבגד.
 */
export function GameFashionAvatar({
  profile,
  layers,
  width,
  height,
  yaw: controlledYaw,
  onYawChange,
  enablePan = true,
  showHint = true,
}: Props) {
  const female = isFemalePersona(profile.persona);
  const wScale = buildWidthScale(profile.build);
  const paintedTurn = personaHasPaintedTurn(profile.persona);
  const controlled = typeof controlledYaw === 'number';

  const [internalYaw, setInternalYaw] = useState(0);
  const yaw = controlled ? controlledYaw! : internalYaw;
  const yawRef = useRef(yaw);
  const startYaw = useRef(0);
  const onYawChangeRef = useRef(onYawChange);
  const controlledRef = useRef(controlled);
  const outfitKey = layersKey(layers);
  const clothed = hasOuterClothes(layers);

  useEffect(() => {
    onYawChangeRef.current = onYawChange;
    controlledRef.current = controlled;
  }, [onYawChange, controlled]);

  useEffect(() => {
    yawRef.current = yaw;
  }, [yaw]);

  const applyYaw = (next: number) => {
    const clamped = Math.max(0, Math.min(180, next));
    yawRef.current = clamped;
    if (controlledRef.current) onYawChangeRef.current?.(clamped);
    else setInternalYaw(clamped);
  };

  useEffect(() => {
    if (!controlled) {
      yawRef.current = 0;
      setInternalYaw(0);
    }
  }, [outfitKey, profile.persona, controlled]);

  const pan = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => enablePan,
        onStartShouldSetPanResponderCapture: () => enablePan,
        onMoveShouldSetPanResponder: (_e, g) =>
          enablePan && Math.abs(g.dx) > 2,
        onMoveShouldSetPanResponderCapture: (_e, g) =>
          enablePan && Math.abs(g.dx) > 2,
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: () => {
          startYaw.current = yawRef.current;
        },
        onPanResponderMove: (
          _e: GestureResponderEvent,
          g: PanResponderGestureState,
        ) => {
          if (!enablePan) return;
          applyYaw(startYaw.current + g.dx * 0.7);
        },
        onPanResponderRelease: () => {
          if (!enablePan) return;
          // נצמד לפריים הקרוב: 0 / 45 / 90 / 135 / 180
          applyYaw(nearestTurnYaw(yawRef.current));
        },
      }),
    [enablePan],
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

  const bodyScaleX = Math.min(1.18, Math.max(0.82, wScale));
  const facingBack = yaw > 90;
  const frame = nearestTurnYaw(yaw);
  const mirrorOverlays = facingBack && !paintedTurn;
  const baseSrc = turnBaseForPersona(profile.persona, yaw);
  const viewLabel = facingBack ? he.backViewHint : '';
  const overlayFlip = mirrorOverlays ? -1 : 1;
  // Perfect-Fit מצויר: גוף+בגד כתמונה אחת לפי זווית (גודל גוף קבוע)
  const useHero = Boolean(resolved.hero && !resolved.overlayOnly);

  return (
    <View
      collapsable={false}
      style={{ width, height, minHeight: 160 }}
      {...(enablePan ? pan.panHandlers : {})}
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

      <View
        collapsable={false}
        style={{
          width,
          height,
          transform: [{ scaleX: bodyScaleX }],
        }}
      >
        {useHero ? (
          <Image
            key={`hero-${profile.persona}-${frame}-${facingBack ? 'back' : 'front'}-${resolved.heroFit?.scaleY ?? 1}`}
            source={resolved.hero!}
            resizeMode="contain"
            style={{
              position: 'absolute',
              width,
              height,
              transform: resolved.heroFit
                ? [
                    {
                      translateX:
                        resolved.heroFit.translateX * width * overlayFlip,
                    },
                    { translateY: resolved.heroFit.translateY * height },
                    {
                      scaleX: resolved.heroFit.scaleX * overlayFlip,
                    },
                    { scaleY: resolved.heroFit.scaleY },
                  ]
                : undefined,
            }}
          />
        ) : (
          <Image
            key={`base-${profile.persona}-${frame}-${facingBack ? 'back' : 'front'}`}
            source={baseSrc}
            resizeMode="contain"
            style={{ position: 'absolute', width, height }}
          />
        )}
        {clothed && !useHero
          ? resolved.overlays.map((ov, i) => (
              <Image
                key={`ov-${ov.key}-${i}-${frame}-${facingBack ? 'back' : 'front'}`}
                source={ov.src}
                resizeMode="contain"
                style={{
                  position: 'absolute',
                  width,
                  height,
                  transform: [
                    {
                      translateX: ov.translateX * width * overlayFlip,
                    },
                    { translateY: ov.translateY * height },
                    { scaleX: ov.scaleX * overlayFlip },
                    { scaleY: ov.scaleY },
                  ],
                }}
              />
            ))
          : null}
        {useHero && resolved.overlays.length > 0
          ? resolved.overlays.map((ov, i) => (
              <Image
                key={`acc-${ov.key}-${i}-${frame}`}
                source={ov.src}
                resizeMode="contain"
                style={{
                  position: 'absolute',
                  width,
                  height,
                  transform: [
                    {
                      translateX: ov.translateX * width * overlayFlip,
                    },
                    { translateY: ov.translateY * height },
                    { scaleX: ov.scaleX * overlayFlip },
                    { scaleY: ov.scaleY },
                  ],
                }}
              />
            ))
          : null}
      </View>

      {showHint ? (
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
      ) : null}
    </View>
  );
}
