import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Image,
  PanResponder,
  Text,
  View,
  type GestureResponderEvent,
  type PanResponderGestureState,
} from 'react-native';
import { buildWidthScale, heightScale, isFemalePersona } from '@/constants/avatar';
import {
  frontFacingAmount,
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
    layers.bottom?.id,
    layers.outer?.id,
    layers.dress?.id,
    layers.shoes?.id,
    layers.hat?.id,
  ].join('|');
}

/**
 * דמות משחק — לוקים מצוירים לכל בגד + סיבוב 180°.
 */
export function GameFashionAvatar({ profile, layers, width, height }: Props) {
  const female = isFemalePersona(profile.persona);
  const wScale = buildWidthScale(profile.build);
  void heightScale(profile.heightCm, profile.persona);

  const [yaw, setYaw] = useState(0);
  const yawRef = useRef(0);
  const startYaw = useRef(0);
  const outfitKey = layersKey(layers);

  // איפוס סיבוב כשמשנים לוק — כדי לראות את ההלבשה בחזית
  useEffect(() => {
    yawRef.current = 0;
    setYaw(0);
  }, [outfitKey]);

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
    () => resolveOutfitLook(layers, yaw, female),
    [layers, yaw, female],
  );

  const facing = frontFacingAmount(yaw);
  const baseSrc = turnBaseForPersona(profile.persona, yaw);
  const scaleX = Math.min(1.15, Math.max(0.88, wScale));

  const hero = resolved.hero;
  const showHero = Boolean(hero) && (resolved.heroTracksYaw || facing > 0.28);
  const showBase =
    !showHero || (!resolved.heroTracksYaw && facing < 0.92) || !hero;

  const overlayOpacity = resolved.heroTracksYaw
    ? 1
    : Math.max(0, 0.15 + facing * 0.85);

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
            transform: [{ scaleX }],
            opacity: showHero ? Math.max(0, 1 - facing * 0.95) : 1,
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
            transform: [{ scaleX }],
            opacity: resolved.heroTracksYaw ? 1 : Math.max(0.25, facing),
          }}
        />
      ) : null}

      {facing > 0.2
        ? resolved.overlays.map((src, i) => (
            <Image
              key={`ov-${i}`}
              source={src}
              resizeMode="contain"
              style={{
                position: 'absolute',
                width,
                height,
                transform: [{ scaleX }],
                opacity: overlayOpacity,
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
