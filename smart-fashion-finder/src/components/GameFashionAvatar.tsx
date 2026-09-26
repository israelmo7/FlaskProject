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
  usesPaintedAdultLooks,
} from '@/constants/avatar';
import {
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

function hasClothes(layers: OutfitLayers): boolean {
  return Boolean(
    layers.top ||
      layers.bottom ||
      layers.outer ||
      layers.dress ||
      layers.shoes ||
      layers.hat,
  );
}

/**
 * דמות משחק — בסיס לפי persona, גובה אמיתי, מידות בגד, סיבוב 180°.
 */
export function GameFashionAvatar({ profile, layers, width, height }: Props) {
  const female = isFemalePersona(profile.persona);
  const wScale = buildWidthScale(profile.build);
  const adultLooks = usesPaintedAdultLooks(profile.persona);
  const turnFrames = personaHasTurnFrames(profile.persona);

  const [yaw, setYaw] = useState(0);
  const yawRef = useRef(0);
  const startYaw = useRef(0);
  const outfitKey = layersKey(layers);
  const clothed = hasClothes(layers);

  useEffect(() => {
    yawRef.current = 0;
    setYaw(0);
  }, [outfitKey, profile.persona]);

  const pan = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_e, g) => Math.abs(g.dx) > 3,
        onPanResponderGrant: () => {
          startYaw.current = yawRef.current;
        },
        onPanResponderMove: (
          _e: GestureResponderEvent,
          g: PanResponderGestureState,
        ) => {
          const next = Math.max(0, Math.min(180, startYaw.current + g.dx * 0.6));
          yawRef.current = next;
          setYaw(next);
        },
        onPanResponderRelease: () => {
          const snapped = Math.round(yawRef.current / 45) * 45;
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
  const bodyScaleX = Math.min(1.2, Math.max(0.78, wScale));

  const rad = (yaw * Math.PI) / 180;
  const cos = Math.cos(rad);
  const flipScaleX =
    (cos >= 0 ? 1 : -1) * Math.max(0.22, Math.abs(cos)) * bodyScaleX;

  const hero = resolved.hero;
  const useYawFrames = resolved.heroTracksYaw && Boolean(hero) && adultLooks;
  const overlayOnly = resolved.overlayOnly || !adultLooks;
  const showHero = clothed && Boolean(hero) && !overlayOnly;
  const showBase = !clothed || overlayOnly || !showHero;
  const frame = nearestTurnYaw(yaw);

  const baseTurnX = turnFrames && !clothed ? bodyScaleX : flipScaleX;
  const heroTurnX = useYawFrames ? bodyScaleX : flipScaleX;

  return (
    <View style={{ width, height }} {...pan.panHandlers}>
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          bottom: height * 0.02,
          left: width * 0.22,
          width: width * 0.56,
          height: height * 0.025,
          borderRadius: 999,
          backgroundColor: 'rgba(40,30,20,0.14)',
        }}
      />

      {showBase ? (
        <Image
          source={baseSrc}
          resizeMode="contain"
          style={{
            position: 'absolute',
            width,
            height,
            transform: [{ scaleX: baseTurnX }],
          }}
        />
      ) : null}

      {showHero && hero ? (
        <Image
          source={hero}
          resizeMode="contain"
          style={{
            position: 'absolute',
            width,
            height,
            transform: [
              { scaleX: heroTurnX },
              { scale: resolved.heroScale },
            ],
            opacity: 1,
          }}
        />
      ) : null}

      {clothed
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
                  { scaleX: useYawFrames ? bodyScaleX : flipScaleX },
                  { scale: ov.scale },
                ],
                opacity: 1,
              }}
            />
          ))
        : null}

      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          bottom: 6,
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
          {he.rotateAvatarHint}
        </Text>
      </View>
    </View>
  );
}
