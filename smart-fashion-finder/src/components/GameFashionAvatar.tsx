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

/** בגדים אמיתיים בלבד — תחתונים/גרביים = בסיס חשוף */
function hasOuterClothes(layers: OutfitLayers): boolean {
  const bottomId = layers.bottom
    ? catalogIdFromPieceId(layers.bottom.id)
    : null;
  const shoesId = layers.shoes ? catalogIdFromPieceId(layers.shoes.id) : null;
  const realBottom = layers.bottom && bottomId !== 'p-underwear';
  const realShoes = layers.shoes && shoesId !== 'p-socks';
  return Boolean(
    layers.top || layers.outer || layers.dress || layers.hat || realBottom || realShoes,
  );
}

/**
 * דמות משחק — בסיס persona תמיד; בגדים כשכבות מכוילות לפי גוף/מידה.
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
  const clothed = hasOuterClothes(layers);

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
  const bodyScaleX = Math.min(1.18, Math.max(0.8, wScale));

  const rad = (yaw * Math.PI) / 180;
  const cos = Math.cos(rad);
  const flipScaleX =
    (cos >= 0 ? 1 : -1) * Math.max(0.22, Math.abs(cos)) * bodyScaleX;

  const hero = resolved.hero;
  const useYawFrames = resolved.heroTracksYaw && Boolean(hero) && adultLooks;
  // לאישה/ילדים — תמיד בסיס + שכבות; לגבר — לוק מצויר כשיש
  const overlayOnly = resolved.overlayOnly || !adultLooks;
  const showHero = clothed && Boolean(hero) && !overlayOnly;
  // בסיס הדמות תמיד נראה כשאין לוק מלא שמחליף גוף
  const showBase = !showHero;
  const frame = nearestTurnYaw(yaw);

  const baseTurnX =
    turnFrames && !clothed && adultLooks ? bodyScaleX : flipScaleX;
  const heroTurnX = useYawFrames ? bodyScaleX : flipScaleX;

  return (
    <View style={{ width, height }} {...pan.panHandlers}>
      {/* במה רכה לבובה */}
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

      {/* בסיס persona — בלי בגדים / מתחת לשכבות */}
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

      {/* לוק מלא לגבר בלבד */}
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
          }}
        />
      ) : null}

      {/* שכבות בגד מכוילות ל־persona + מידה (L ארוך יותר על גוף נמוך) */}
      {clothed
        ? resolved.overlays.map((ov, i) => {
            const combined = ov.scale * ov.bodyScale;
            const sx = (useYawFrames ? bodyScaleX : flipScaleX) * combined;
            const sy = combined * ov.scaleY;
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
                    { scaleX: sx },
                    { scaleY: sy },
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
            color: 'rgba(40,30,20,0.4)',
            fontFamily: 'DMSans_500Medium',
          }}
        >
          {he.rotateAvatarHint}
        </Text>
      </View>
    </View>
  );
}
