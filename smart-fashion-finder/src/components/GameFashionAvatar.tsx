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
  nearestTurnYaw,
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
 * דמות משחק — לוקים מצוירים + סיבוב 180° בלי להוריד בגדים.
 */
export function GameFashionAvatar({ profile, layers, width, height }: Props) {
  const female = isFemalePersona(profile.persona);
  const wScale = buildWidthScale(profile.build);
  void heightScale(profile.heightCm, profile.persona);

  const [yaw, setYaw] = useState(0);
  const yawRef = useRef(0);
  const startYaw = useRef(0);
  const outfitKey = layersKey(layers);
  const clothed = hasClothes(layers);

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

  const baseSrc = turnBaseForPersona(profile.persona, yaw);
  const bodyScale = Math.min(1.15, Math.max(0.88, wScale));

  // סיבוב ויזואלי: כיווץ/היפוך אופקי — הבגדים נשארים על הדמות
  const rad = (yaw * Math.PI) / 180;
  const cos = Math.cos(rad);
  const turnScaleX =
    (cos >= 0 ? 1 : -1) * Math.max(0.22, Math.abs(cos)) * bodyScale;

  const hero = resolved.hero;
  // קומבו עם פריימי אמת (טי+ג׳ינס) — משתמשים בפריים לפי זווית
  const useYawFrames = resolved.heroTracksYaw && Boolean(hero);
  const frame = nearestTurnYaw(yaw);

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

      {/* בסיס ריק — רק כשאין בגדים */}
      {!clothed ? (
        <Image
          source={baseSrc}
          resizeMode="contain"
          style={{
            position: 'absolute',
            width,
            height,
            transform: [{ scaleX: bodyScale }],
          }}
        />
      ) : null}

      {/* לוק לבוש — תמיד נשאר בסיבוב */}
      {clothed && hero ? (
        <Image
          source={hero}
          resizeMode="contain"
          style={{
            position: 'absolute',
            width,
            height,
            transform: [
              {
                scaleX: useYawFrames ? bodyScale : turnScaleX,
              },
            ],
            opacity: 1,
          }}
        />
      ) : null}

      {/* בלי hero (נדיר) — בסיס מסתובב + שכבות */}
      {clothed && !hero ? (
        <Image
          source={baseSrc}
          resizeMode="contain"
          style={{
            position: 'absolute',
            width,
            height,
            transform: [{ scaleX: bodyScale }],
          }}
        />
      ) : null}

      {clothed
        ? resolved.overlays.map((src, i) => (
            <Image
              key={`ov-${i}-${frame}`}
              source={src}
              resizeMode="contain"
              style={{
                position: 'absolute',
                width,
                height,
                transform: [
                  {
                    scaleX: useYawFrames ? bodyScale : turnScaleX,
                  },
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
