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
  compact?: boolean;
};

/** מידה משפיעה על רוחב הבגד על הגוף */
function sizeFitScale(size: string): number {
  const s = size.toUpperCase();
  if (s === 'XS' || s === '30') return 0.88;
  if (s === 'S' || s === '32') return 0.94;
  if (s === 'M' || s === '34') return 1;
  if (s === 'L' || s === '36') return 1.08;
  if (s === 'XL' || Number(s) >= 38) return 1.16;
  return 1;
}

/**
 * בובה פוטוריאליסטית לפי גיל/מין + שכבות בגדים צמודות לגוף.
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

  const dollW = (compact ? 200 : 248) * Math.min(1.18, Math.max(0.82, wScale));
  const dollH = (compact ? 310 : 380) * Math.min(1.18, Math.max(0.82, hScale));

  const worn = [layers.dress, layers.top, layers.bottom, layers.outer, layers.shoes].filter(
    Boolean,
  ) as OutfitPiece[];

  const baseImage = PERSONA_BASE_IMAGES[profile.persona];

  return (
    <View className="items-start">
      <View
        className="overflow-visible bg-transparent"
        style={{ width: dollW + 24, paddingVertical: compact ? 8 : 12 }}
      >
        <Text className="mb-1 text-left font-display text-base text-ink">
          {personaLabel} · {profile.heightCm} ס״מ
        </Text>

        <View
          className="items-center justify-center self-start overflow-hidden"
          style={{ width: dollW, height: dollH, borderRadius: 16 }}
        >
          <Image
            source={baseImage}
            style={{ width: dollW, height: dollH, resizeMode: 'cover' }}
          />

          {/* מכנסיים — צמודים יותר לפלג תחתון */}
          {layers.bottom && !layers.dress ? (
            <FittedGarment
              piece={layers.bottom}
              bodyW={dollW}
              bodyH={dollH}
              region="bottom"
              buildScale={wScale}
            />
          ) : null}

          {/* חולצה */}
          {layers.top && !layers.dress ? (
            <FittedGarment
              piece={layers.top}
              bodyW={dollW}
              bodyH={dollH}
              region="top"
              buildScale={wScale}
            />
          ) : null}

          {layers.dress ? (
            <FittedGarment
              piece={layers.dress}
              bodyW={dollW}
              bodyH={dollH}
              region="dress"
              buildScale={wScale}
            />
          ) : null}

          {layers.outer ? (
            <FittedGarment
              piece={layers.outer}
              bodyW={dollW}
              bodyH={dollH}
              region="outer"
              buildScale={wScale}
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

function FittedGarment({
  piece,
  bodyW,
  bodyH,
  region,
  buildScale,
}: {
  piece: OutfitPiece;
  bodyW: number;
  bodyH: number;
  region: 'top' | 'bottom' | 'dress' | 'outer';
  buildScale: number;
}) {
  const src = layerImageForPieceId(piece.id);
  const fit = sizeFitScale(piece.size) * Math.min(1.12, Math.max(0.9, buildScale));

  const layout =
    region === 'top'
      ? { top: bodyH * 0.18, width: bodyW * 0.72 * fit, height: bodyH * 0.34, radius: 18 }
      : region === 'bottom'
        ? {
            top: bodyH * 0.48,
            width: bodyW * 0.58 * fit,
            height: bodyH * 0.46,
            radius: 14,
          }
        : region === 'dress'
          ? {
              top: bodyH * 0.18,
              width: bodyW * 0.7 * fit,
              height: bodyH * 0.62,
              radius: 20,
            }
          : {
              top: bodyH * 0.16,
              width: bodyW * 0.78 * fit,
              height: bodyH * 0.38,
              radius: 20,
            };

  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: layout.top,
        alignSelf: 'center',
        width: layout.width,
        height: layout.height,
        borderRadius: layout.radius,
        overflow: 'hidden',
        // צל רך כדי שהבגד “ישב” על הגוף
        shadowColor: '#000',
        shadowOpacity: 0.35,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4,
        backgroundColor: src ? 'rgba(0,0,0,0.05)' : garmentColorHex(piece.color),
      }}
    >
      {src ? (
        <Image
          source={src}
          style={{ width: '100%', height: '100%', opacity: 0.96 }}
          resizeMode="cover"
        />
      ) : (
        <View
          style={{
            flex: 1,
            backgroundColor: garmentColorHex(piece.color),
            opacity: 0.92,
          }}
        />
      )}
      {/* שכבת כהות קלה בקצוות — תחושת עומק */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
          borderWidth: 1,
          borderColor: 'rgba(0,0,0,0.18)',
          borderRadius: layout.radius,
        }}
      />
      <View
        className="absolute left-1 right-1"
        style={{ bottom: 6 }}
      >
        <View className="self-center rounded-full bg-black/70 px-2 py-0.5">
          <Text className="font-bodyMedium text-[9px] text-white">
            {piece.label} · {piece.size}
          </Text>
        </View>
      </View>
    </View>
  );
}
