import { Image, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  buildWidthScale,
  garmentColorHex,
  heightScale,
  isFemalePersona,
  sizeFitScale,
  sizeRelativeToHeight,
} from '@/constants/avatar';
import { layerImageForPieceId } from '@/constants/avatarAssets';
import type { AvatarPersona, AvatarProfile, OutfitLayers, OutfitPiece } from '@/types';

type Props = {
  profile: AvatarProfile;
  layers: OutfitLayers;
  width: number;
  height: number;
};

type SkinPalette = {
  light: string;
  mid: string;
  shadow: string;
  lip: string;
  hair: string;
  hairShine: string;
};

function skinFor(persona: AvatarPersona): SkinPalette {
  const female = isFemalePersona(persona);
  if (persona === 'boy' || persona === 'girl') {
    return {
      light: '#F3D4BC',
      mid: '#E8C4A8',
      shadow: '#D4A88C',
      lip: female ? '#E8A0A0' : '#C9958A',
      hair: persona === 'girl' ? '#5C3A22' : '#3A2A1C',
      hairShine: '#8B5A2B',
    };
  }
  if (persona === 'teenBoy' || persona === 'teenGirl') {
    return {
      light: '#EED0B4',
      mid: '#E0B896',
      shadow: '#C99A78',
      lip: female ? '#D4848A' : '#C08A7A',
      hair: '#1F1814',
      hairShine: '#4A3A30',
    };
  }
  if (persona === 'man') {
    return {
      light: '#E2B994',
      mid: '#D4A57C',
      shadow: '#B88762',
      lip: '#B88478',
      hair: '#2A221C',
      hairShine: '#4A3C32',
    };
  }
  // woman
  return {
    light: '#F0D2BA',
    mid: '#E6C0A0',
    shadow: '#D0A080',
    lip: '#D4787E',
    hair: '#2C1E18',
    hairShine: '#5A3C2C',
  };
}

function shade(hex: string, amount: number): string {
  const h = hex.replace('#', '');
  if (h.length !== 6) return hex;
  const n = parseInt(h, 16);
  const r = Math.min(255, Math.max(0, ((n >> 16) & 255) + amount));
  const g = Math.min(255, Math.max(0, ((n >> 8) & 255) + amount));
  const b = Math.min(255, Math.max(0, (n & 255) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

/**
 * דמות משחק אופנה — פרופורציות, הצללות וביגוד לפי אזורי גוף.
 */
export function GameFashionAvatar({ profile, layers, width, height }: Props) {
  const female = isFemalePersona(profile.persona);
  const skin = skinFor(profile.persona);
  const wScale = buildWidthScale(profile.build);
  const hScale = heightScale(profile.heightCm, profile.persona);

  // פרופורציות דמות משחק (ראש → רגל)
  const unit = height / 100;
  const headR = 11.2 * unit;
  const headCy = 14 * unit;
  const shoulderY = 28 * unit;
  const waistY = 48 * unit;
  const hipY = 54 * unit;
  const kneeY = 74 * unit;
  const ankleY = 92 * unit;
  const shoulderW = (female ? 34 : 40) * unit * wScale;
  const waistW = (female ? 22 : 28) * unit * wScale;
  const hipW = (female ? 30 : 28) * unit * wScale;
  const armW = (female ? 7.2 : 8.2) * unit * Math.min(1.15, wScale);
  const legW = (female ? 9.5 : 11) * unit * Math.min(1.2, wScale);
  const gap = 3.2 * unit;
  const cx = width / 2;

  // גובה הדמות משפיע מעט על מרווח הרגליים (כבר ב־height החיצוני)
  void hScale;

  const outerIsHat = layers.outer?.category === 'Hats';
  const showUnderwear = !layers.dress && !layers.top && !layers.bottom;

  return (
    <View style={{ width, height }}>
      {/* במה / צל */}
      <View
        style={{
          position: 'absolute',
          bottom: 2,
          left: cx - width * 0.28,
          width: width * 0.56,
          height: 10,
          borderRadius: 999,
          backgroundColor: 'rgba(0,0,0,0.12)',
        }}
      />

      {/* שיער מאחור */}
      {female ? (
        <View
          style={{
            position: 'absolute',
            top: headCy - headR * 0.2,
            left: cx - headR * 1.15,
            width: headR * 2.3,
            height: headR * 3.2,
            borderRadius: headR * 1.2,
            backgroundColor: skin.hair,
            opacity: 0.95,
          }}
        />
      ) : null}

      {/* ראש */}
      <LinearGradient
        colors={[skin.light, skin.mid, skin.shadow]}
        start={{ x: 0.3, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={{
          position: 'absolute',
          top: headCy - headR,
          left: cx - headR,
          width: headR * 2,
          height: headR * 2,
          borderRadius: headR,
        }}
      />
      {/* שיער קדמי */}
      <LinearGradient
        colors={[skin.hairShine, skin.hair]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{
          position: 'absolute',
          top: headCy - headR * 1.05,
          left: cx - headR * 1.05,
          width: headR * 2.1,
          height: headR * (female ? 1.35 : 0.95),
          borderTopLeftRadius: headR * 1.2,
          borderTopRightRadius: headR * 1.2,
          borderBottomLeftRadius: female ? headR * 0.4 : headR * 0.8,
          borderBottomRightRadius: female ? headR * 0.4 : headR * 0.8,
        }}
      />
      {/* עיניים */}
      <View
        style={{
          position: 'absolute',
          top: headCy - unit * 1.2,
          left: cx - unit * 4.2,
          width: unit * 2.4,
          height: unit * 1.6,
          borderRadius: 999,
          backgroundColor: '#FFF',
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: headCy - unit * 1.2,
          left: cx + unit * 1.8,
          width: unit * 2.4,
          height: unit * 1.6,
          borderRadius: 999,
          backgroundColor: '#FFF',
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: headCy - unit * 0.7,
          left: cx - unit * 3.4,
          width: unit * 1.2,
          height: unit * 1.2,
          borderRadius: 999,
          backgroundColor: '#2A2018',
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: headCy - unit * 0.7,
          left: cx + unit * 2.2,
          width: unit * 1.2,
          height: unit * 1.2,
          borderRadius: 999,
          backgroundColor: '#2A2018',
        }}
      />
      {/* שפתיים */}
      <View
        style={{
          position: 'absolute',
          top: headCy + unit * 3.2,
          left: cx - unit * 2,
          width: unit * 4,
          height: unit * 1.3,
          borderRadius: 999,
          backgroundColor: skin.lip,
        }}
      />

      {/* צוואר */}
      <LinearGradient
        colors={[skin.mid, skin.shadow]}
        style={{
          position: 'absolute',
          top: headCy + headR * 0.75,
          left: cx - unit * 3,
          width: unit * 6,
          height: unit * 5,
          borderRadius: unit * 2,
        }}
      />

      {/* ידיים (מאחורי הגוף חלקית) */}
      <Limb
        left={cx - shoulderW / 2 - armW * 0.35}
        top={shoulderY + unit}
        width={armW}
        height={hipY - shoulderY + unit * 4}
        colors={[skin.light, skin.mid, skin.shadow]}
        radius={armW / 2}
      />
      <Limb
        left={cx + shoulderW / 2 - armW * 0.65}
        top={shoulderY + unit}
        width={armW}
        height={hipY - shoulderY + unit * 4}
        colors={[skin.light, skin.mid, skin.shadow]}
        radius={armW / 2}
      />

      {/* גוף / טורסו */}
      <View
        style={{
          position: 'absolute',
          top: shoulderY,
          left: cx - shoulderW / 2,
          width: shoulderW,
          height: hipY - shoulderY + unit * 2,
          overflow: 'hidden',
          borderTopLeftRadius: unit * 6,
          borderTopRightRadius: unit * 6,
          borderBottomLeftRadius: unit * 8,
          borderBottomRightRadius: unit * 8,
        }}
      >
        <LinearGradient
          colors={[skin.light, skin.mid, skin.shadow]}
          start={{ x: 0.2, y: 0 }}
          end={{ x: 0.9, y: 1 }}
          style={{ flex: 1 }}
        />
        {/* מותן צרה יותר ויזואלית */}
        <View
          style={{
            position: 'absolute',
            top: waistY - shoulderY,
            left: (shoulderW - waistW) / 2,
            width: waistW,
            height: 2,
            backgroundColor: 'transparent',
          }}
        />
      </View>

      {/* רגליים */}
      <Limb
        left={cx - gap / 2 - legW}
        top={hipY}
        width={legW}
        height={ankleY - hipY}
        colors={[skin.light, skin.mid, skin.shadow]}
        radius={legW / 2}
      />
      <Limb
        left={cx + gap / 2}
        top={hipY}
        width={legW}
        height={ankleY - hipY}
        colors={[skin.light, skin.mid, skin.shadow]}
        radius={legW / 2}
      />

      {/* כפות רגליים בסיס */}
      <View
        style={{
          position: 'absolute',
          top: ankleY - unit,
          left: cx - gap / 2 - legW - unit,
          width: legW + unit * 2,
          height: unit * 4,
          borderRadius: unit * 2,
          backgroundColor: skin.shadow,
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: ankleY - unit,
          left: cx + gap / 2 - unit,
          width: legW + unit * 2,
          height: unit * 4,
          borderRadius: unit * 2,
          backgroundColor: skin.shadow,
        }}
      />

      {/* הלבשה תחתונה בסיס */}
      {showUnderwear || (!layers.top && !layers.dress) ? (
        <Underwear
          female={female}
          cx={cx}
          shoulderY={shoulderY}
          hipY={hipY}
          shoulderW={shoulderW}
          hipW={hipW}
          unit={unit}
          visibleTop={!layers.top && !layers.dress}
          visibleBottom={!layers.bottom && !layers.dress}
        />
      ) : null}

      {/* בגדים — סדר שכבות נכון */}
      {layers.bottom && !layers.dress ? (
        <FittedClothes
          piece={layers.bottom}
          region="bottom"
          cx={cx}
          unit={unit}
          shoulderY={shoulderY}
          hipY={hipY}
          ankleY={ankleY}
          shoulderW={shoulderW}
          hipW={hipW}
          waistW={waistW}
          legW={legW}
          gap={gap}
          buildScale={wScale}
          heightCm={profile.heightCm}
        />
      ) : null}

      {layers.top && !layers.dress ? (
        <FittedClothes
          piece={layers.top}
          region="top"
          cx={cx}
          unit={unit}
          shoulderY={shoulderY}
          hipY={hipY}
          ankleY={ankleY}
          shoulderW={shoulderW}
          hipW={hipW}
          waistW={waistW}
          legW={legW}
          gap={gap}
          buildScale={wScale}
          heightCm={profile.heightCm}
        />
      ) : null}

      {layers.dress ? (
        <FittedClothes
          piece={layers.dress}
          region="dress"
          cx={cx}
          unit={unit}
          shoulderY={shoulderY}
          hipY={hipY}
          ankleY={ankleY}
          shoulderW={shoulderW}
          hipW={hipW}
          waistW={waistW}
          legW={legW}
          gap={gap}
          buildScale={wScale}
          heightCm={profile.heightCm}
        />
      ) : null}

      {layers.outer && !outerIsHat ? (
        <FittedClothes
          piece={layers.outer}
          region="outer"
          cx={cx}
          unit={unit}
          shoulderY={shoulderY}
          hipY={hipY}
          ankleY={ankleY}
          shoulderW={shoulderW}
          hipW={hipW}
          waistW={waistW}
          legW={legW}
          gap={gap}
          buildScale={wScale}
          heightCm={profile.heightCm}
        />
      ) : null}

      {layers.outer && outerIsHat ? (
        <FittedClothes
          piece={layers.outer}
          region="hat"
          cx={cx}
          unit={unit}
          shoulderY={headCy - headR}
          hipY={hipY}
          ankleY={ankleY}
          shoulderW={headR * 2}
          hipW={hipW}
          waistW={waistW}
          legW={legW}
          gap={gap}
          buildScale={wScale}
          heightCm={profile.heightCm}
        />
      ) : null}

      {layers.shoes ? (
        <FittedClothes
          piece={layers.shoes}
          region="shoes"
          cx={cx}
          unit={unit}
          shoulderY={shoulderY}
          hipY={hipY}
          ankleY={ankleY}
          shoulderW={shoulderW}
          hipW={hipW}
          waistW={waistW}
          legW={legW}
          gap={gap}
          buildScale={wScale}
          heightCm={profile.heightCm}
        />
      ) : null}

      {/* ברך עדינה — עומק */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: kneeY,
          left: cx - gap / 2 - legW + 2,
          width: legW - 4,
          height: 1,
          backgroundColor: 'rgba(0,0,0,0.06)',
        }}
      />
    </View>
  );
}

function Limb({
  left,
  top,
  width,
  height,
  colors,
  radius,
}: {
  left: number;
  top: number;
  width: number;
  height: number;
  colors: [string, string, ...string[]];
  radius: number;
}) {
  return (
    <LinearGradient
      colors={colors}
      start={{ x: 0.2, y: 0 }}
      end={{ x: 0.9, y: 1 }}
      style={{
        position: 'absolute',
        left,
        top,
        width,
        height,
        borderRadius: radius,
      }}
    />
  );
}

function Underwear({
  female,
  cx,
  shoulderY,
  hipY,
  shoulderW,
  hipW,
  unit,
  visibleTop,
  visibleBottom,
}: {
  female: boolean;
  cx: number;
  shoulderY: number;
  hipY: number;
  shoulderW: number;
  hipW: number;
  unit: number;
  visibleTop: boolean;
  visibleBottom: boolean;
}) {
  return (
    <>
      {visibleTop && female ? (
        <View
          style={{
            position: 'absolute',
            top: shoulderY + unit * 6,
            left: cx - shoulderW * 0.28,
            width: shoulderW * 0.56,
            height: unit * 7,
            borderRadius: unit * 2,
            backgroundColor: '#F5F2EE',
            borderWidth: 1,
            borderColor: '#E5DFD6',
          }}
        />
      ) : null}
      {visibleBottom ? (
        <View
          style={{
            position: 'absolute',
            top: hipY - unit * 3,
            left: cx - hipW * 0.38,
            width: hipW * 0.76,
            height: unit * 8,
            borderRadius: unit * 3,
            backgroundColor: female ? '#F5F2EE' : '#2A2A2E',
          }}
        />
      ) : null}
    </>
  );
}

function FittedClothes({
  piece,
  region,
  cx,
  unit,
  shoulderY,
  hipY,
  ankleY,
  shoulderW,
  hipW,
  waistW,
  legW,
  gap,
  buildScale,
  heightCm,
}: {
  piece: OutfitPiece;
  region: 'top' | 'bottom' | 'dress' | 'outer' | 'hat' | 'shoes';
  cx: number;
  unit: number;
  shoulderY: number;
  hipY: number;
  ankleY: number;
  shoulderW: number;
  hipW: number;
  waistW: number;
  legW: number;
  gap: number;
  buildScale: number;
  heightCm: number;
}) {
  const base = garmentColorHex(piece.color);
  const light = shade(base, 28);
  const dark = shade(base, -32);
  const fit =
    sizeFitScale(piece.size) *
    sizeRelativeToHeight(piece.size, heightCm) *
    Math.min(1.12, Math.max(0.88, buildScale));
  const texture = layerImageForPieceId(piece.id);

  if (region === 'hat') {
    const w = shoulderW * 1.15 * Math.min(1.12, fit);
    return (
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: shoulderY - unit * 2,
          left: cx - w / 2,
          width: w,
          height: unit * 10,
          alignItems: 'center',
        }}
      >
        <LinearGradient
          colors={[light, base, dark]}
          style={{
            width: '100%',
            height: unit * 3.5,
            borderRadius: 999,
            marginTop: unit * 4,
          }}
        />
        <LinearGradient
          colors={[light, base, dark]}
          style={{
            position: 'absolute',
            top: 0,
            width: w * 0.62,
            height: unit * 7,
            borderTopLeftRadius: unit * 8,
            borderTopRightRadius: unit * 8,
            borderBottomLeftRadius: unit * 2,
            borderBottomRightRadius: unit * 2,
          }}
        />
      </View>
    );
  }

  if (region === 'shoes') {
    const shoeW = legW + unit * 3;
    return (
      <View pointerEvents="none">
        {[
          cx - gap / 2 - legW - unit,
          cx + gap / 2 - unit,
        ].map((left, i) => (
          <LinearGradient
            key={i}
            colors={[light, base, dark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              position: 'absolute',
              top: ankleY - unit * 1.5,
              left,
              width: shoeW,
              height: unit * 5,
              borderRadius: unit * 2.5,
            }}
          />
        ))}
      </View>
    );
  }

  if (region === 'bottom') {
    const pantW = legW * (0.95 + (fit - 1) * 0.5);
    const top = hipY - unit * 4;
    const h = ankleY - top - unit;
    return (
      <View pointerEvents="none">
        {/* מותן */}
        <LinearGradient
          colors={[light, base, dark]}
          style={{
            position: 'absolute',
            top,
            left: cx - hipW * 0.42 * fit,
            width: hipW * 0.84 * fit,
            height: unit * 6,
            borderRadius: unit * 2,
          }}
        />
        {[cx - gap / 2 - pantW, cx + gap / 2].map((left, i) => (
          <View
            key={i}
            style={{
              position: 'absolute',
              top: top + unit * 4,
              left,
              width: pantW,
              height: h - unit * 4,
              borderRadius: pantW / 2,
              overflow: 'hidden',
            }}
          >
            <LinearGradient
              colors={[light, base, dark]}
              start={{ x: 0.2, y: 0 }}
              end={{ x: 0.9, y: 1 }}
              style={{ flex: 1 }}
            />
            {texture ? (
              <Image
                source={texture}
                resizeMode="cover"
                style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  opacity: 0.35,
                }}
              />
            ) : null}
          </View>
        ))}
      </View>
    );
  }

  // top / outer / dress
  const isDress = region === 'dress';
  const isOuter = region === 'outer';
  const topW = shoulderW * (isOuter ? 1.12 : 1.02) * fit;
  const botW = (isDress ? hipW * 1.05 : waistW * 1.15) * fit;
  const top = shoulderY - unit * (isOuter ? 1 : 0.5);
  const h = isDress
    ? kneeYish(hipY, ankleY, unit) - top
    : (isOuter ? hipY - unit * 2 : waistYish(hipY, unit)) - top + unit * 2;

  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top,
        left: cx - topW / 2,
        width: topW,
        height: Math.max(h, unit * 12),
        alignItems: 'center',
      }}
    >
      <View
        style={{
          width: topW,
          height: '100%',
          borderTopLeftRadius: unit * 5,
          borderTopRightRadius: unit * 5,
          borderBottomLeftRadius: isDress ? unit * 10 : unit * 4,
          borderBottomRightRadius: isDress ? unit * 10 : unit * 4,
          overflow: 'hidden',
          transform: [{ scaleX: Math.min(1, botW / topW + 0.15) }],
        }}
      >
        <LinearGradient
          colors={[light, base, dark]}
          start={{ x: 0.15, y: 0 }}
          end={{ x: 0.9, y: 1 }}
          style={{ flex: 1 }}
        />
        {texture ? (
          <Image
            source={texture}
            resizeMode="cover"
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              opacity: 0.32,
            }}
          />
        ) : null}
        {/* צווארון */}
        <View
          style={{
            position: 'absolute',
            top: unit * 1.5,
            alignSelf: 'center',
            left: '35%',
            width: '30%',
            height: unit * 3,
            borderRadius: unit,
            backgroundColor: 'rgba(255,255,255,0.12)',
          }}
        />
      </View>
      {/* שרוולים */}
      {!isDress ? (
        <>
          <LinearGradient
            colors={[light, base, dark]}
            style={{
              position: 'absolute',
              top: unit * 2,
              left: -topW * 0.16,
              width: topW * 0.28,
              height: h * 0.45,
              borderRadius: unit * 4,
              transform: [{ rotate: '-18deg' }],
            }}
          />
          <LinearGradient
            colors={[light, base, dark]}
            style={{
              position: 'absolute',
              top: unit * 2,
              right: -topW * 0.16,
              width: topW * 0.28,
              height: h * 0.45,
              borderRadius: unit * 4,
              transform: [{ rotate: '18deg' }],
            }}
          />
        </>
      ) : null}
    </View>
  );
}

function waistYish(hipY: number, unit: number) {
  return hipY - unit * 8;
}

function kneeYish(hipY: number, ankleY: number, unit: number) {
  return hipY + (ankleY - hipY) * 0.55 + unit * 2;
}
