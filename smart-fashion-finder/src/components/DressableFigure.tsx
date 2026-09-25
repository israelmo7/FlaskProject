import { Image, Pressable, Text, View } from 'react-native';
import {
  PERSONA_OPTIONS,
  buildWidthScale,
  garmentColorHex,
  heightScale,
  isFemalePersona,
  sizeFitScale,
  sizeRelativeToHeight,
} from '@/constants/avatar';
import { PERSONA_BASE_IMAGES, layerImageForPieceId } from '@/constants/avatarAssets';
import type { AvatarProfile, OutfitLayers, OutfitPiece } from '@/types';

type Props = {
  profile: AvatarProfile;
  layers: OutfitLayers;
  onRemovePiece?: (piece: OutfitPiece) => void;
  compact?: boolean;
};

type Region = 'top' | 'bottom' | 'dress' | 'outer' | 'hat' | 'shoes';

/**
 * בובה גדולה עם רגליים גלויות + בגדים לפי מידה וגובה (contain, לא ריבוע).
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

  const baseW = compact ? 260 : 320;
  const baseH = compact ? 460 : 560;
  const dollW = baseW * Math.min(1.22, Math.max(0.78, wScale));
  const dollH = baseH * hScale;

  const worn = [layers.dress, layers.top, layers.bottom, layers.outer, layers.shoes].filter(
    Boolean,
  ) as OutfitPiece[];

  const baseImage = PERSONA_BASE_IMAGES[profile.persona];
  const outerIsHat = layers.outer?.category === 'Hats';

  return (
    <View className="items-start">
      <View style={{ width: dollW + 20, paddingVertical: 6 }}>
        <Text className="mb-1.5 text-left font-display text-sm text-ink">
          {personaLabel} · {profile.heightCm} ס״מ
        </Text>

        <View
          className="self-start overflow-visible"
          style={{
            width: dollW,
            height: dollH,
            borderRadius: 8,
            backgroundColor: '#FAF8F5',
          }}
        >
          <Image
            source={baseImage}
            style={{
              width: dollW,
              height: dollH,
              resizeMode: 'contain',
            }}
          />

          {layers.bottom && !layers.dress ? (
            <FittedGarment
              piece={layers.bottom}
              bodyW={dollW}
              bodyH={dollH}
              region="bottom"
              buildScale={wScale}
              heightCm={profile.heightCm}
            />
          ) : null}

          {layers.top && !layers.dress ? (
            <FittedGarment
              piece={layers.top}
              bodyW={dollW}
              bodyH={dollH}
              region="top"
              buildScale={wScale}
              heightCm={profile.heightCm}
            />
          ) : null}

          {layers.dress ? (
            <FittedGarment
              piece={layers.dress}
              bodyW={dollW}
              bodyH={dollH}
              region="dress"
              buildScale={wScale}
              heightCm={profile.heightCm}
            />
          ) : null}

          {layers.outer && !outerIsHat ? (
            <FittedGarment
              piece={layers.outer}
              bodyW={dollW}
              bodyH={dollH}
              region="outer"
              buildScale={wScale}
              heightCm={profile.heightCm}
            />
          ) : null}

          {layers.outer && outerIsHat ? (
            <FittedGarment
              piece={layers.outer}
              bodyW={dollW}
              bodyH={dollH}
              region="hat"
              buildScale={wScale}
              heightCm={profile.heightCm}
            />
          ) : null}

          {layers.shoes ? (
            <FittedGarment
              piece={layers.shoes}
              bodyW={dollW}
              bodyH={dollH}
              region="shoes"
              buildScale={wScale}
              heightCm={profile.heightCm}
            />
          ) : null}
        </View>
      </View>

      {worn.length > 0 ? (
        <View className="mt-2 w-full flex-row flex-wrap justify-start">
          {worn.map((piece) => (
            <Pressable
              key={piece.id}
              onPress={() => onRemovePiece?.(piece)}
              className="mb-2 mr-2 rounded-full px-3 py-1.5"
              style={{ backgroundColor: garmentColorHex(piece.color) }}
            >
              <Text className="font-bodyMedium text-xs text-white">
                {piece.label} · {piece.size} ✕
              </Text>
            </Pressable>
          ))}
        </View>
      ) : (
        <Text className="mt-1 font-body text-[11px] text-ink-muted">
          {female ? 'מוכנה להלבשה' : 'מוכן להלבשה'}
        </Text>
      )}
    </View>
  );
}

function FittedGarment({
  piece,
  bodyW,
  bodyH,
  region,
  buildScale,
  heightCm,
}: {
  piece: OutfitPiece;
  bodyW: number;
  bodyH: number;
  region: Region;
  buildScale: number;
  heightCm: number;
}) {
  const src = layerImageForPieceId(piece.id);
  const fit =
    sizeFitScale(piece.size) *
    sizeRelativeToHeight(piece.size, heightCm) *
    Math.min(1.15, Math.max(0.85, buildScale));

  const layout =
    region === 'top'
      ? {
          top: bodyH * 0.15,
          width: bodyW * 0.64 * fit,
          height: bodyH * 0.3 * Math.min(1.1, Math.max(0.88, fit)),
        }
      : region === 'bottom'
        ? {
            top: bodyH * 0.4,
            width: bodyW * 0.52 * fit,
            height: bodyH * 0.52,
          }
        : region === 'dress'
          ? {
              top: bodyH * 0.15,
              width: bodyW * 0.6 * fit,
              height: bodyH * 0.62,
            }
          : region === 'hat'
            ? {
                top: bodyH * 0.02,
                width: bodyW * 0.42 * Math.min(1.15, Math.max(0.9, fit)),
                height: bodyH * 0.14,
              }
            : region === 'shoes'
              ? {
                  top: bodyH * 0.86,
                  width: bodyW * 0.48 * Math.min(1.1, Math.max(0.9, fit)),
                  height: bodyH * 0.12,
                }
              : {
                  top: bodyH * 0.13,
                  width: bodyW * 0.7 * fit,
                  height: bodyH * 0.34 * Math.min(1.1, Math.max(0.88, fit)),
                };

  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: layout.top,
        left: (bodyW - layout.width) / 2,
        width: layout.width,
        height: layout.height,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {src ? (
        <Image
          source={src}
          style={{
            width: '100%',
            height: '100%',
            resizeMode: 'contain',
          }}
        />
      ) : (
        <View
          style={{
            width: region === 'hat' ? '70%' : '78%',
            height: region === 'shoes' ? '55%' : '88%',
            borderRadius: region === 'bottom' || region === 'shoes' ? 14 : 18,
            backgroundColor: garmentColorHex(piece.color),
            opacity: 0.9,
          }}
        />
      )}
      {region !== 'shoes' && region !== 'hat' ? (
        <View
          className="absolute rounded-full bg-black/65 px-2 py-0.5"
          style={{ bottom: 2 }}
        >
          <Text className="font-bodyMedium text-[9px] text-white">{piece.size}</Text>
        </View>
      ) : null}
    </View>
  );
}
