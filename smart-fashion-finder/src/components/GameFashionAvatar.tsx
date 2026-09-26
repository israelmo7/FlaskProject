import { useMemo, useRef, useState } from 'react';
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
  catalogIdFromPieceId,
  comboLookAtYaw,
  fittedLookForId,
  fittedOverlayForId,
  frontFacingAmount,
  isTshirtJeansCombo,
  turnBaseForPersona,
} from '@/constants/avatarAssets';
import { he } from '@/i18n/he';
import type { AvatarProfile, OutfitLayers, OutfitPiece } from '@/types';

type Props = {
  profile: AvatarProfile;
  layers: OutfitLayers;
  width: number;
  height: number;
};

/**
 * דמות משחק — לוקים מצוירים + סיבוב 180° (החלקה אופקית).
 */
export function GameFashionAvatar({ profile, layers, width, height }: Props) {
  const female = isFemalePersona(profile.persona);
  const wScale = buildWidthScale(profile.build);
  const hScale = heightScale(profile.heightCm, profile.persona);
  void hScale;

  const [yaw, setYaw] = useState(0);
  const yawRef = useRef(0);
  const startYaw = useRef(0);

  const pan = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_e, g) =>
          Math.abs(g.dx) > 4 || Math.abs(g.dy) > 4,
        onPanResponderGrant: () => {
          startYaw.current = yawRef.current;
        },
        onPanResponderMove: (
          _e: GestureResponderEvent,
          g: PanResponderGestureState,
        ) => {
          // גרירה ימינה = סיבוב לכיוון הגב
          const next = Math.max(0, Math.min(180, startYaw.current + g.dx * 0.55));
          yawRef.current = next;
          setYaw(next);
        },
        onPanResponderRelease: () => {
          // snap עדין לפריימים עגולים
          const snapped = Math.round(yawRef.current / 45) * 45;
          const clamped = Math.max(0, Math.min(180, snapped));
          yawRef.current = clamped;
          setYaw(clamped);
        },
      }),
    [],
  );

  const wornIds = useMemo(() => {
    const pieces = [
      layers.bottom,
      layers.top,
      layers.dress,
      layers.outer,
      layers.shoes,
    ].filter(Boolean) as OutfitPiece[];
    return pieces
      .map((p) => catalogIdFromPieceId(p.id))
      .filter(Boolean) as string[];
  }, [layers]);

  const facing = frontFacingAmount(yaw);
  const combo = isTshirtJeansCombo(layers);
  const comboSrc = combo ? comboLookAtYaw(yaw) : null;

  // לוק מלא יחיד — כשיש פריט מרכזי אחד (או שמלה)
  const soloLook = useMemo(() => {
    if (combo) return null;
    if (layers.dress) {
      const id = catalogIdFromPieceId(layers.dress.id);
      return id ? fittedLookForId(id, female) : null;
    }
    const mains = wornIds.filter((id) => id !== 'p-sneakers' && id !== 'p-hat');
    if (mains.length === 1 && !layers.outer) {
      return fittedLookForId(mains[0], female);
    }
    // רק נעליים / כובע — נשארים על בסיס
    return null;
  }, [combo, layers, wornIds, female]);

  const useOverlays =
    !comboSrc &&
    !soloLook &&
    wornIds.length > 0 &&
    facing > 0.15;

  const baseSrc = turnBaseForPersona(profile.persona, yaw);
  const scaleX = Math.min(1.15, Math.max(0.88, wScale));

  const overlayOrder = [
    layers.bottom,
    layers.top,
    layers.dress,
    layers.outer,
    layers.shoes,
  ].filter(Boolean) as OutfitPiece[];

  // מקור תצוגה ראשי
  const heroSrc = comboSrc ?? (soloLook && facing > 0.35 ? soloLook : null);
  const showBaseUnder = !heroSrc || (soloLook && facing <= 0.85);

  return (
    <View style={{ width, height }} {...pan.panHandlers}>
      {/* צל במה */}
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

      {showBaseUnder ? (
        <Image
          source={baseSrc}
          resizeMode="contain"
          style={{
            position: 'absolute',
            width,
            height,
            transform: [{ scaleX }],
            opacity: heroSrc ? 1 - facing * 0.85 : 1,
          }}
        />
      ) : null}

      {heroSrc ? (
        <Image
          source={heroSrc}
          resizeMode="contain"
          style={{
            position: 'absolute',
            width,
            height,
            transform: [{ scaleX }],
            opacity: comboSrc ? 1 : Math.max(0.2, facing),
          }}
        />
      ) : null}

      {useOverlays
        ? overlayOrder.map((piece) => {
            const id = catalogIdFromPieceId(piece.id);
            if (!id) return null;
            const src = fittedOverlayForId(id);
            if (!src) return null;
            return (
              <Image
                key={piece.id}
                source={src}
                resizeMode="contain"
                style={{
                  position: 'absolute',
                  width,
                  height,
                  transform: [{ scaleX }],
                  opacity: 0.25 + facing * 0.75,
                }}
              />
            );
          })
        : null}

      {/* רמז סיבוב */}
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
