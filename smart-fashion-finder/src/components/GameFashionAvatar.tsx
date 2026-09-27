import {
  createElement,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  Image,
  PanResponder,
  Platform,
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
 * היפוך אופקי אמין:
 * - web: div עם CSS scaleX(-1) (לא תלוי ב־RN StyleSheet)
 * - native: View עם scaleX: -1
 */
function FlipHost({
  flip,
  width,
  height,
  children,
}: {
  flip: boolean;
  width: number;
  height: number;
  children: ReactNode;
}) {
  if (Platform.OS === 'web') {
    return createElement(
      'div',
      {
        'data-avatar-flip': flip ? '1' : '0',
        style: {
          width,
          height,
          position: 'relative' as const,
          transform: flip ? 'scaleX(-1)' : 'none',
          WebkitTransform: flip ? 'scaleX(-1)' : 'none',
          transformOrigin: 'center center',
        },
      },
      children,
    );
  }

  return (
    <View
      collapsable={false}
      style={{
        width,
        height,
        transform: flip ? ([{ scaleX: -1 }] as const) : undefined,
      }}
    >
      {children}
    </View>
  );
}

/**
 * דמות משחק — סיבוב 180° לכל persona,
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
  const hasTurnFrames = personaHasTurnFrames(profile.persona);
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
          applyYaw(yawRef.current >= 90 ? 180 : 0);
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

  const baseSrc = turnBaseForPersona(profile.persona, yaw);
  const bodyScaleX = Math.min(1.18, Math.max(0.82, wScale));
  const facingBack = yaw > 90;
  const frame = nearestTurnYaw(yaw);

  // בלי פריימי גב: היפוך אופקי; עם פריימים — תמונת גב
  const flipWhole = facingBack && !hasTurnFrames;
  const viewLabel = facingBack ? he.backViewHint : '';

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

      <FlipHost
        key={`flip-${profile.persona}-${flipWhole ? 'back' : 'front'}`}
        flip={flipWhole}
        width={width}
        height={height}
      >
        <View
          collapsable={false}
          style={{
            width,
            height,
            transform: [{ scaleX: bodyScaleX }],
          }}
        >
          <Image
            source={baseSrc}
            resizeMode="contain"
            style={{ position: 'absolute', width, height }}
          />
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
                        { scaleX: garmentScale },
                        { scaleY: garmentScale * ov.scaleY },
                      ],
                    }}
                  />
                );
              })
            : null}
        </View>
      </FlipHost>

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
