import { Image, Platform, Pressable, Text, View } from 'react-native';
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
          }}
        >
          <Image
            source={baseImage}
            resizeMode="contain"
            style={{
              width: dollW,
              height: dollH,
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
          top: bodyH * 0.14,
          width: bodyW * 0.78 * fit,
          height: bodyH * 0.34 * Math.min(1.12, Math.max(0.9, fit)),
        }
      : region === 'bottom'
        ? {
            top: bodyH * 0.38,
            width: bodyW * 0.58 * fit,
            height: bodyH * 0.55,
          }
        : region === 'dress'
          ? {
              top: bodyH * 0.14,
              width: bodyW * 0.72 * fit,
              height: bodyH * 0.66,
            }
          : region === 'hat'
            ? {
                top: bodyH * 0.04,
                width: bodyW * 0.48 * Math.min(1.12, Math.max(0.92, fit)),
                height: bodyH * 0.13,
              }
            : region === 'shoes'
              ? {
                  top: bodyH * 0.88,
                  width: bodyW * 0.52 * Math.min(1.1, Math.max(0.9, fit)),
                  height: bodyH * 0.1,
                }
              : {
                  top: bodyH * 0.12,
                  width: bodyW * 0.82 * fit,
                  height: bodyH * 0.38 * Math.min(1.12, Math.max(0.9, fit)),
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
        overflow: 'hidden',
        backgroundColor: 'transparent',
      }}
    >
      {src ? (
        <Image
          source={src}
          resizeMode="contain"
          style={[
            {
              width: '100%',
              height: '100%',
              backgroundColor: 'transparent',
            },
            Platform.OS === 'web'
              ? ({ mixBlendMode: 'multiply' } as object)
              : null,
          ]}
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
    </View>
  );
}
