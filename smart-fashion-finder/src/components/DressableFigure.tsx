import { Image, Pressable, Text, View } from 'react-native';
import {
  PERSONA_OPTIONS,
  buildWidthScale,
  garmentColorHex,
  heightScale,
  isFemalePersona,
} from '@/constants/avatar';
import { PERSONA_BASE_IMAGES, layerImageForPieceId } from '@/constants/avatarAssets';
import type { AvatarProfile, OutfitLayers, OutfitPiece } from '@/types';

type Props = {
  profile: AvatarProfile;
  layers: OutfitLayers;
  onRemovePiece?: (piece: OutfitPiece) => void;
  /** קומפקטי ל-Hero בדף הבית */
  compact?: boolean;
};

/**
 * בובה פוטוריאליסטית לפי גיל/מין + שכבות בגדים שנבחרו.
 * הבסיס הוא דמות איכותית; הבגדים נערמים מעליה ונשארים.
 */
export function DressableFigure({
  profile,
  layers,
  onRemovePiece,
  compact = false,
}: Props) {
  const female = isFemalePersona(profile.persona);
  const wScale = buildWidthScale(profile.build);
  const hScale = heightScale(profile.heightCm, profile.persona);
  const personaLabel =
    PERSONA_OPTIONS.find((p) => p.id === profile.persona)?.label ?? '';

  const dollW = (compact ? 200 : 240) * Math.min(1.15, Math.max(0.85, wScale));
  const dollH = (compact ? 300 : 360) * Math.min(1.15, Math.max(0.85, hScale));

  const worn = [layers.dress, layers.top, layers.bottom, layers.outer, layers.shoes].filter(
    Boolean,
  ) as OutfitPiece[];

  const baseImage = PERSONA_BASE_IMAGES[profile.persona];

  return (
    <View className="items-center">
      <View
        className="overflow-hidden rounded-2xl bg-[#12161C]"
        style={{ width: dollW + 48, paddingVertical: compact ? 12 : 20 }}
      >
        <Text className="mb-1 text-center font-display text-base text-stone-light">
          {personaLabel} · {profile.heightCm} ס״מ
        </Text>

        <View className="items-center justify-center" style={{ height: dollH }}>
          <Image
            source={baseImage}
            style={{
              width: dollW,
              height: dollH,
              resizeMode: 'contain',
            }}
          />

          {/* שכבות בגדים מעל הבסיס */}
          {layers.bottom && !layers.dress ? (
            <GarmentOverlay
              piece={layers.bottom}
              style={{
                bottom: dollH * 0.02,
                width: dollW * 0.55,
                height: dollH * 0.42,
              }}
            />
          ) : null}

          {layers.top && !layers.dress ? (
            <GarmentOverlay
              piece={layers.top}
              style={{
                top: dollH * 0.22,
                width: dollW * 0.58,
                height: dollH * 0.28,
              }}
            />
          ) : null}

          {layers.dress ? (
            <GarmentOverlay
              piece={layers.dress}
              style={{
                top: dollH * 0.2,
                width: dollW * 0.6,
                height: dollH * 0.55,
              }}
            />
          ) : null}

          {layers.outer ? (
            <GarmentOverlay
              piece={layers.outer}
              style={{
                top: dollH * 0.18,
                width: dollW * 0.62,
                height: dollH * 0.32,
              }}
            />
          ) : null}
        </View>

        <Text className="mt-2 px-3 text-center font-body text-xs text-stone-dark">
          {worn.length === 0
            ? female
              ? 'בסיס בלי בגדים חיצוניים — מוכנה להלבשה'
              : 'בסיס בלי בגדים חיצוניים — מוכן להלבשה'
            : 'הפריטים שבחרת נשארים על הבובה'}
        </Text>
      </View>

      {worn.length > 0 ? (
        <View className="mt-3 w-full flex-row flex-wrap justify-center">
          {worn.map((piece) => (
            <Pressable
              key={piece.id}
              onPress={() => onRemovePiece?.(piece)}
              className="mb-2 ml-2 rounded-full px-3 py-1.5"
              style={{ backgroundColor: garmentColorHex(piece.color) }}
            >
              <Text className="font-bodyMedium text-xs text-white">
                {piece.label} · {piece.size} ✕
              </Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

function GarmentOverlay({
  piece,
  style,
}: {
  piece: OutfitPiece;
  style: {
    top?: number;
    bottom?: number;
    width: number;
    height: number;
  };
}) {
  const src = layerImageForPieceId(piece.id);
  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        alignSelf: 'center',
        ...style,
        borderRadius: 12,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: src ? 'transparent' : garmentColorHex(piece.color),
        borderWidth: src ? 0 : 1,
        borderColor: 'rgba(255,255,255,0.35)',
      }}
    >
      {src ? (
        <Image source={src} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
      ) : null}
      <View className="absolute bottom-1 rounded bg-black/65 px-1.5 py-0.5">
        <Text className="font-bodyMedium text-[9px] text-white">
          {piece.label} · {piece.size}
        </Text>
      </View>
    </View>
  );
}
