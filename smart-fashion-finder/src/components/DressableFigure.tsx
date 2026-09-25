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
  /** הסתרת תווית גובה בדף הבית */
  hideMeta?: boolean;
};

type Region = 'top' | 'bottom' | 'dress' | 'outer' | 'hat' | 'shoes';

/**
 * בובה מאוירת זקופה — בגדים נלבשים על אזורי גוף (חזה / רגליים) לפי מידה וגובה.
 */
export function DressableFigure({
  profile,
  layers,
  onRemovePiece,
  compact = false,
  hideMeta = false,
}: Props) {
  const female = isFemalePersona(profile.persona);
  const wScale = buildWidthScale(profile.build);
  const hScale = heightScale(profile.heightCm, profile.persona);
  const personaLabel =
    PERSONA_OPTIONS.find((p) => p.id === profile.persona)?.label ?? '';

  const baseW = compact ? 168 : 200;
  const baseH = compact ? 320 : 380;
  const dollW = baseW * Math.min(1.18, Math.max(0.82, wScale));
  const dollH = baseH * hScale;

  const worn = [layers.dress, layers.top, layers.bottom, layers.outer, layers.shoes].filter(
    Boolean,
  ) as OutfitPiece[];

  const baseImage = PERSONA_BASE_IMAGES[profile.persona];
  const outerIsHat = layers.outer?.category === 'Hats';

  return (
    <View className="items-start">
      <View style={{ width: dollW + 12, paddingVertical: 4 }}>
        {!hideMeta ? (
          <Text className="mb-1 text-left font-display text-sm text-ink">
            {personaLabel} · {profile.heightCm} ס״מ
          </Text>
        ) : null}

        <View
          className="self-start overflow-visible"
          style={{ width: dollW, height: dollH }}
        >
          <Image
            source={baseImage}
            resizeMode="contain"
            style={{ width: dollW, height: dollH }}
          />

          {layers.bottom && !layers.dress ? (
            <BodyGarment
              piece={layers.bottom}
              bodyW={dollW}
              bodyH={dollH}
              region="bottom"
              buildScale={wScale}
              heightCm={profile.heightCm}
            />
          ) : null}

          {layers.top && !layers.dress ? (
            <BodyGarment
              piece={layers.top}
              bodyW={dollW}
              bodyH={dollH}
              region="top"
              buildScale={wScale}
              heightCm={profile.heightCm}
            />
          ) : null}

          {layers.dress ? (
            <BodyGarment
              piece={layers.dress}
              bodyW={dollW}
              bodyH={dollH}
              region="dress"
              buildScale={wScale}
              heightCm={profile.heightCm}
            />
          ) : null}

          {layers.outer && !outerIsHat ? (
            <BodyGarment
              piece={layers.outer}
              bodyW={dollW}
              bodyH={dollH}
              region="outer"
              buildScale={wScale}
              heightCm={profile.heightCm}
            />
          ) : null}

          {layers.outer && outerIsHat ? (
            <BodyGarment
              piece={layers.outer}
              bodyW={dollW}
              bodyH={dollH}
              region="hat"
              buildScale={wScale}
              heightCm={profile.heightCm}
            />
          ) : null}

          {layers.shoes ? (
            <BodyGarment
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

/** בגד מעוצב לאזור גוף — לא תמונת מוצר מרובעת */
function BodyGarment({
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
  const color = garmentColorHex(piece.color);
  const fit =
    sizeFitScale(piece.size) *
    sizeRelativeToHeight(piece.size, heightCm) *
    Math.min(1.12, Math.max(0.88, buildScale));
  const texture = layerImageForPieceId(piece.id);

  if (region === 'hat') {
    const w = bodyW * 0.42 * Math.min(1.15, Math.max(0.9, fit));
    return (
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: bodyH * 0.02,
          left: (bodyW - w) / 2,
          width: w,
          height: bodyH * 0.1,
          alignItems: 'center',
        }}
      >
        <View
          style={{
            width: '100%',
            height: '38%',
            borderRadius: 999,
            backgroundColor: color,
            marginTop: '28%',
          }}
        />
        <View
          style={{
            position: 'absolute',
            top: 0,
            width: '58%',
            height: '72%',
            borderTopLeftRadius: 40,
            borderTopRightRadius: 40,
            borderBottomLeftRadius: 8,
            borderBottomRightRadius: 8,
            backgroundColor: color,
          }}
        />
      </View>
    );
  }

  if (region === 'shoes') {
    const w = bodyW * 0.5;
    return (
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: bodyH * 0.9,
          left: (bodyW - w) / 2,
          width: w,
          height: bodyH * 0.07,
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}
      >
        <View
          style={{
            width: '42%',
            height: '100%',
            borderRadius: 10,
            backgroundColor: color,
          }}
        />
        <View
          style={{
            width: '42%',
            height: '100%',
            borderRadius: 10,
            backgroundColor: color,
          }}
        />
      </View>
    );
  }

  if (region === 'bottom') {
    const w = bodyW * 0.4 * fit;
    const h = bodyH * 0.48;
    const top = bodyH * 0.42;
    const gap = bodyW * 0.04;
    return (
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top,
          left: (bodyW - w * 2 - gap) / 2,
          width: w * 2 + gap,
          height: h,
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}
      >
        <LegPiece color={color} width={w} height={h} texture={texture} />
        <LegPiece color={color} width={w} height={h} texture={texture} />
      </View>
    );
  }

  // top / outer / dress — חזה / גוף בצורת גוף (לא ריבוע)
  const isDress = region === 'dress';
  const isOuter = region === 'outer';
  const w =
    bodyW *
    (isOuter ? 0.68 : isDress ? 0.55 : 0.55) *
    fit;
  const h = bodyH * (isDress ? 0.48 : isOuter ? 0.26 : 0.24);
  const top = bodyH * (isOuter ? 0.17 : 0.18);

  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top,
        left: (bodyW - w) / 2,
        width: w,
        height: h,
        alignItems: 'center',
      }}
    >
      {/* גוף החולצה — רחב בכתפיים, צר במותן */}
      <View
        style={{
          width: '100%',
          height: '100%',
          borderTopLeftRadius: w * 0.22,
          borderTopRightRadius: w * 0.22,
          borderBottomLeftRadius: isDress ? w * 0.28 : w * 0.18,
          borderBottomRightRadius: isDress ? w * 0.28 : w * 0.18,
          backgroundColor: color,
          overflow: 'hidden',
          opacity: 0.92,
          transform: [{ scaleX: 0.92 }],
        }}
      >
        {texture ? (
          <Image
            source={texture}
            resizeMode="cover"
            style={{ width: '100%', height: '100%', opacity: 0.45 }}
          />
        ) : null}
      </View>
      {!isDress ? (
        <>
          <View
            style={{
              position: 'absolute',
              top: h * 0.06,
              left: -w * 0.14,
              width: w * 0.26,
              height: h * 0.38,
              borderRadius: 14,
              backgroundColor: color,
              opacity: 0.92,
              transform: [{ rotate: '-12deg' }],
            }}
          />
          <View
            style={{
              position: 'absolute',
              top: h * 0.06,
              right: -w * 0.14,
              width: w * 0.26,
              height: h * 0.38,
              borderRadius: 14,
              backgroundColor: color,
              opacity: 0.92,
              transform: [{ rotate: '12deg' }],
            }}
          />
        </>
      ) : null}
    </View>
  );
}

function LegPiece({
  color,
  width,
  height,
  texture,
}: {
  color: string;
  width: number;
  height: number;
  texture: ReturnType<typeof layerImageForPieceId>;
}) {
  return (
    <View
      style={{
        width,
        height,
        borderRadius: 14,
        backgroundColor: color,
        overflow: 'hidden',
      }}
    >
      {texture ? (
        <Image
          source={texture}
          resizeMode="cover"
          style={{ width: '100%', height: '100%', opacity: 0.5 }}
        />
      ) : null}
    </View>
  );
}
