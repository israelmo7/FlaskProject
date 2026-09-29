import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Image,
  PanResponder,
  Text,
  View,
  type GestureResponderEvent,
  type PanResponderGestureState,
} from 'react-native';
import { isFemalePersona } from '@/constants/avatar';
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
  /** תוצאת VTON (URL) — מחליפה את ה־Fitted Look */
  vtonHeroUri?: string | null;
};

function layersKey(layers: OutfitLayers): string {
  return [
    layers.top?.id,
    layers.bottom?.id,
    layers.outer?.id,
    layers.dress?.id,
    layers.shoes?.id,
    layers.hat?.id,
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
 * דמות משחק — Standard / Fitted Look:
 * מעדיפים תמונת גוף+בגד מיושרת; בלי scale לפי מידה/גובה.
 * סיבוב 180° לפי פריימי persona.
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
  vtonHeroUri = null,
}: Props) {
  const female = isFemalePersona(profile.persona);
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

  const facingBack = yaw > 90;
  const frame = nearestTurnYaw(yaw);
  const mirrorOverlays = facingBack && !paintedTurn;
  const baseSrc = turnBaseForPersona(profile.persona, yaw);
  const viewLabel = facingBack ? he.backViewHint : '';
  const overlayFlip = mirrorOverlays ? -1 : 1;

  const useVton = Boolean(vtonHeroUri);
  const useFittedHero =
    useVton || Boolean(resolved.hero && !resolved.overlayOnly);
  const heroSource = useVton
    ? { uri: vtonHeroUri! }
    : resolved.hero
      ? resolved.hero
      : null;

  // מעל Fitted Look / VTON: רק כובע (הלוק עצמו כולל את שאר הבגד)
  const accessoryOverlays =
    useFittedHero && !useVton
      ? resolved.overlays.filter((ov) => ov.slot === 'hat')
      : [];

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

      <View collapsable={false} style={{ width, height }}>
        {useFittedHero && heroSource ? (
          <Image
            key={`hero-${useVton ? 'vton' : 'fit'}-${profile.persona}-${frame}`}
            source={heroSource}
            resizeMode="contain"
            style={{ position: 'absolute', width, height }}
          />
        ) : (
          <Image
            key={`base-${profile.persona}-${frame}`}
            source={baseSrc}
            resizeMode="contain"
            style={{ position: 'absolute', width, height }}
          />
        )}

        {/* שכבות בגד — Standard Fit + הזזת cutout (למשל עליונית) */}
        {clothed && !useFittedHero
          ? resolved.overlays.map((ov, i) => (
              <Image
                key={`ov-${ov.key}-${i}-${frame}`}
                source={ov.src}
                resizeMode="contain"
                style={{
                  position: 'absolute',
                  width,
                  height,
                  transform: [
                    { translateX: (ov.translateX || 0) * width },
                    { translateY: (ov.translateY || 0) * height },
                    { scaleX: (ov.scaleX || 1) * overlayFlip },
                    { scaleY: ov.scaleY || 1 },
                  ],
                }}
              />
            ))
          : null}

        {accessoryOverlays.map((ov, i) => (
          <Image
            key={`acc-${ov.key}-${i}-${frame}`}
            source={ov.src}
            resizeMode="contain"
            style={{ position: 'absolute', width, height }}
          />
        ))}
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
