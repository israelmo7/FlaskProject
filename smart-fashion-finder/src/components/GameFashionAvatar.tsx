import { View } from 'react-native';
import Svg, {
  Circle,
  Defs,
  Ellipse,
  G,
  LinearGradient as SvgLinearGradient,
  Path,
  RadialGradient,
  Stop,
} from 'react-native-svg';
import {
  buildWidthScale,
  garmentColorHex,
  heightScale,
  isFemalePersona,
  sizeFitScale,
  sizeRelativeToHeight,
} from '@/constants/avatar';
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
  deep: string;
  blush: string;
  lip: string;
  lipDark: string;
  hair: string;
  hairMid: string;
  hairShine: string;
  brow: string;
  iris: string;
};

function skinFor(persona: AvatarPersona): SkinPalette {
  const female = isFemalePersona(persona);
  if (persona === 'boy' || persona === 'girl') {
    return {
      light: '#F6DCC6',
      mid: '#EBC4A6',
      shadow: '#D4A486',
      deep: '#C08E6E',
      blush: 'rgba(232,140,140,0.35)',
      lip: female ? '#E89898' : '#C9958A',
      lipDark: female ? '#D47878' : '#B88478',
      hair: persona === 'girl' ? '#6B4228' : '#3E2C1E',
      hairMid: persona === 'girl' ? '#8A5A35' : '#5A4030',
      hairShine: persona === 'girl' ? '#A87048' : '#7A5A40',
      brow: '#3A2818',
      iris: '#4A3728',
    };
  }
  if (persona === 'teenBoy' || persona === 'teenGirl') {
    return {
      light: '#F0D2B6',
      mid: '#E2B894',
      shadow: '#C99A74',
      deep: '#B07E58',
      blush: 'rgba(220,120,120,0.32)',
      lip: female ? '#D4848A' : '#C08A7A',
      lipDark: female ? '#C06870' : '#A87868',
      hair: '#1A1410',
      hairMid: '#2E2420',
      hairShine: '#4A3A32',
      brow: '#1A1410',
      iris: '#3A2E24',
    };
  }
  if (persona === 'man') {
    return {
      light: '#E6BE98',
      mid: '#D4A57C',
      shadow: '#B88760',
      deep: '#9E6E48',
      blush: 'rgba(180,100,80,0.22)',
      lip: '#B88478',
      lipDark: '#9E6C60',
      hair: '#1C1612',
      hairMid: '#2E241C',
      hairShine: '#4A3C32',
      brow: '#1C1612',
      iris: '#2E2418',
    };
  }
  return {
    light: '#F4D4BC',
    mid: '#E8C0A0',
    shadow: '#D0A080',
    deep: '#B88868',
    blush: 'rgba(230,130,130,0.38)',
    lip: '#D4787E',
    lipDark: '#C06068',
    hair: '#241812',
    hairMid: '#3A2820',
    hairShine: '#6A4A38',
    brow: '#241812',
    iris: '#3A2A20',
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

/** viewBox units — דמות משחק אופנה אלגנטית */
const VB_W = 120;
const VB_H = 220;
const CX = 60;

/**
 * דמות משחק אופנה ברמה גבוהה — סילואט SVG, פנים מפורטות, בגדים לפי גזרה.
 */
export function GameFashionAvatar({ profile, layers, width, height }: Props) {
  const female = isFemalePersona(profile.persona);
  const skin = skinFor(profile.persona);
  const wScale = buildWidthScale(profile.build);
  const hScale = heightScale(profile.heightCm, profile.persona);
  void hScale;

  const shoulderHalf = (female ? 22 : 26) * wScale;
  const waistHalf = (female ? 13 : 17) * wScale;
  const hipHalf = (female ? 20 : 18) * wScale;
  const armW = (female ? 5.2 : 6.2) * Math.min(1.15, wScale);
  const legW = (female ? 7.2 : 8.4) * Math.min(1.2, wScale);
  const gap = 2.4;

  const headR = female ? 14.5 : 15.2;
  const headCy = 28;
  const neckTop = headCy + headR * 0.72;
  const shoulderY = 48;
  const chestY = 62;
  const waistY = 88;
  const hipY = 102;
  const crotchY = 108;
  const kneeY = 148;
  const ankleY = 188;
  const footY = 198;

  const fitFor = (piece: OutfitPiece) =>
    sizeFitScale(piece.size) *
    sizeRelativeToHeight(piece.size, profile.heightCm) *
    Math.min(1.12, Math.max(0.88, wScale));

  const outerIsHat = layers.outer?.category === 'Hats';
  const showUnderwearTop = !layers.dress && !layers.top;
  const showUnderwearBottom = !layers.dress && !layers.bottom;

  // גוף — סילואט רך (כתפיים → מותן → ירכיים)
  const torsoPath = [
    `M ${CX - shoulderHalf} ${shoulderY}`,
    `C ${CX - shoulderHalf - 2} ${shoulderY + 8}, ${CX - waistHalf - 1} ${waistY - 10}, ${CX - waistHalf} ${waistY}`,
    `C ${CX - waistHalf} ${waistY + 6}, ${CX - hipHalf} ${hipY - 4}, ${CX - hipHalf} ${hipY}`,
    `L ${CX - hipHalf * 0.55} ${crotchY}`,
    `L ${CX + hipHalf * 0.55} ${crotchY}`,
    `L ${CX + hipHalf} ${hipY}`,
    `C ${CX + hipHalf} ${hipY - 4}, ${CX + waistHalf} ${waistY + 6}, ${CX + waistHalf} ${waistY}`,
    `C ${CX + waistHalf + 1} ${waistY - 10}, ${CX + shoulderHalf + 2} ${shoulderY + 8}, ${CX + shoulderHalf} ${shoulderY}`,
    `C ${CX + shoulderHalf * 0.55} ${shoulderY - 3}, ${CX - shoulderHalf * 0.55} ${shoulderY - 3}, ${CX - shoulderHalf} ${shoulderY}`,
    'Z',
  ].join(' ');

  const leftArmPath = armPath(CX - shoulderHalf + 1, shoulderY + 2, -1, armW, hipY - 4);
  const rightArmPath = armPath(CX + shoulderHalf - 1, shoulderY + 2, 1, armW, hipY - 4);

  const leftLegPath = legPath(CX - gap / 2 - legW / 2, crotchY - 2, legW, ankleY, -1);
  const rightLegPath = legPath(CX + gap / 2 + legW / 2, crotchY - 2, legW, ankleY, 1);

  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height} viewBox={`0 0 ${VB_W} ${VB_H}`}>
        <Defs>
          <SvgLinearGradient id="skinGrad" x1="0.2" y1="0" x2="0.9" y2="1">
            <Stop offset="0" stopColor={skin.light} />
            <Stop offset="0.45" stopColor={skin.mid} />
            <Stop offset="1" stopColor={skin.shadow} />
          </SvgLinearGradient>
          <SvgLinearGradient id="skinSoft" x1="0.3" y1="0" x2="0.7" y2="1">
            <Stop offset="0" stopColor={skin.light} />
            <Stop offset="1" stopColor={skin.mid} />
          </SvgLinearGradient>
          <RadialGradient id="cheekL" cx="0.35" cy="0.5" rx="0.5" ry="0.5">
            <Stop offset="0" stopColor={skin.blush} />
            <Stop offset="1" stopColor="rgba(0,0,0,0)" />
          </RadialGradient>
          <RadialGradient id="cheekR" cx="0.65" cy="0.5" rx="0.5" ry="0.5">
            <Stop offset="0" stopColor={skin.blush} />
            <Stop offset="1" stopColor="rgba(0,0,0,0)" />
          </RadialGradient>
          <RadialGradient id="stageGlow" cx="0.5" cy="0.35" rx="0.55" ry="0.45">
            <Stop offset="0" stopColor="rgba(255,255,255,0.35)" />
            <Stop offset="1" stopColor="rgba(255,255,255,0)" />
          </RadialGradient>
          <SvgLinearGradient id="hairGrad" x1="0.3" y1="0" x2="0.7" y2="1">
            <Stop offset="0" stopColor={skin.hairShine} />
            <Stop offset="0.4" stopColor={skin.hairMid} />
            <Stop offset="1" stopColor={skin.hair} />
          </SvgLinearGradient>
          <SvgLinearGradient id="floorShadow" x1="0.5" y1="0" x2="0.5" y2="1">
            <Stop offset="0" stopColor="rgba(40,30,20,0.18)" />
            <Stop offset="1" stopColor="rgba(40,30,20,0)" />
          </SvgLinearGradient>
        </Defs>

        {/* במה רכה */}
        <Ellipse cx={CX} cy={footY + 6} rx={34 * wScale} ry={5.5} fill="url(#floorShadow)" />
        <Ellipse cx={CX} cy={110} rx={48} ry={70} fill="url(#stageGlow)" />

        {/* שיער מאחור (נשים) */}
        {female ? (
          <Path
            d={[
              `M ${CX - headR * 1.05} ${headCy - 2}`,
              `C ${CX - headR * 1.35} ${headCy + 8}, ${CX - headR * 1.25} ${headCy + 28}, ${CX - headR * 0.95} ${headCy + 42}`,
              `C ${CX - headR * 0.7} ${headCy + 48}, ${CX - headR * 0.4} ${headCy + 46}, ${CX - headR * 0.35} ${headCy + 38}`,
              `L ${CX - headR * 0.55} ${headCy + 8}`,
              `L ${CX + headR * 0.55} ${headCy + 8}`,
              `L ${CX + headR * 0.35} ${headCy + 38}`,
              `C ${CX + headR * 0.4} ${headCy + 46}, ${CX + headR * 0.7} ${headCy + 48}, ${CX + headR * 0.95} ${headCy + 42}`,
              `C ${CX + headR * 1.25} ${headCy + 28}, ${CX + headR * 1.35} ${headCy + 8}, ${CX + headR * 1.05} ${headCy - 2}`,
              `C ${CX + headR * 0.4} ${headCy + 18}, ${CX - headR * 0.4} ${headCy + 18}, ${CX - headR * 1.05} ${headCy - 2}`,
              'Z',
            ].join(' ')}
            fill="url(#hairGrad)"
          />
        ) : null}

        {/* ידיים מאחורי הטורסו חלקית */}
        <Path d={leftArmPath} fill="url(#skinGrad)" />
        <Path d={rightArmPath} fill="url(#skinGrad)" />

        {/* רגליים */}
        <Path d={leftLegPath} fill="url(#skinGrad)" />
        <Path d={rightLegPath} fill="url(#skinGrad)" />

        {/* כפות רגליים */}
        <Ellipse
          cx={CX - gap / 2 - legW / 2 - 1}
          cy={footY}
          rx={legW * 0.85}
          ry={3.8}
          fill={skin.deep}
        />
        <Ellipse
          cx={CX + gap / 2 + legW / 2 + 1}
          cy={footY}
          rx={legW * 0.85}
          ry={3.8}
          fill={skin.deep}
        />

        {/* צוואר */}
        <Path
          d={[
            `M ${CX - 4.2} ${neckTop}`,
            `C ${CX - 4.8} ${neckTop + 6}, ${CX - 5.2} ${shoulderY - 2}, ${CX - 6} ${shoulderY}`,
            `L ${CX + 6} ${shoulderY}`,
            `C ${CX + 5.2} ${shoulderY - 2}, ${CX + 4.8} ${neckTop + 6}, ${CX + 4.2} ${neckTop}`,
            `C ${CX + 2} ${neckTop - 1}, ${CX - 2} ${neckTop - 1}, ${CX - 4.2} ${neckTop}`,
            'Z',
          ].join(' ')}
          fill="url(#skinSoft)"
        />

        {/* טורסו */}
        <Path d={torsoPath} fill="url(#skinGrad)" />
        {/* הצללת מותן עדינה */}
        <Ellipse
          cx={CX}
          cy={waistY}
          rx={waistHalf * 0.9}
          ry={3}
          fill="rgba(0,0,0,0.04)"
        />

        {/* הלבשה תחתונה */}
        {showUnderwearTop && female ? (
          <Path
            d={[
              `M ${CX - shoulderHalf * 0.55} ${shoulderY + 10}`,
              `C ${CX - shoulderHalf * 0.5} ${chestY + 4}, ${CX - 8} ${chestY + 10}, ${CX} ${chestY + 8}`,
              `C ${CX + 8} ${chestY + 10}, ${CX + shoulderHalf * 0.5} ${chestY + 4}, ${CX + shoulderHalf * 0.55} ${shoulderY + 10}`,
              `C ${CX + 10} ${shoulderY + 14}, ${CX - 10} ${shoulderY + 14}, ${CX - shoulderHalf * 0.55} ${shoulderY + 10}`,
              'Z',
            ].join(' ')}
            fill="#F7F3EE"
            stroke="#E8E0D6"
            strokeWidth={0.4}
          />
        ) : null}
        {showUnderwearBottom ? (
          <Path
            d={[
              `M ${CX - hipHalf * 0.72} ${hipY - 6}`,
              `Q ${CX} ${hipY - 10}, ${CX + hipHalf * 0.72} ${hipY - 6}`,
              `L ${CX + hipHalf * 0.55} ${crotchY + 2}`,
              `Q ${CX} ${crotchY + 8}, ${CX - hipHalf * 0.55} ${crotchY + 2}`,
              'Z',
            ].join(' ')}
            fill={female ? '#F7F3EE' : '#2A2A30'}
          />
        ) : null}

        {/* בגדים */}
        {layers.bottom && !layers.dress ? (
          <GarmentBottom
            piece={layers.bottom}
            fit={fitFor(layers.bottom)}
            cx={CX}
            hipY={hipY}
            crotchY={crotchY}
            ankleY={ankleY}
            hipHalf={hipHalf}
            legW={legW}
            gap={gap}
          />
        ) : null}

        {layers.top && !layers.dress ? (
          <GarmentTop
            piece={layers.top}
            fit={fitFor(layers.top)}
            female={female}
            cx={CX}
            shoulderY={shoulderY}
            chestY={chestY}
            waistY={waistY}
            hipY={hipY}
            shoulderHalf={shoulderHalf}
            waistHalf={waistHalf}
            armW={armW}
            outer={false}
          />
        ) : null}

        {layers.dress ? (
          <GarmentDress
            piece={layers.dress}
            fit={fitFor(layers.dress)}
            cx={CX}
            shoulderY={shoulderY}
            chestY={chestY}
            waistY={waistY}
            hipY={hipY}
            kneeY={kneeY}
            shoulderHalf={shoulderHalf}
            waistHalf={waistHalf}
            hipHalf={hipHalf}
          />
        ) : null}

        {layers.outer && !outerIsHat ? (
          <GarmentTop
            piece={layers.outer}
            fit={fitFor(layers.outer)}
            female={female}
            cx={CX}
            shoulderY={shoulderY - 1}
            chestY={chestY}
            waistY={waistY}
            hipY={hipY + 4}
            shoulderHalf={shoulderHalf * 1.08}
            waistHalf={waistHalf * 1.12}
            armW={armW * 1.15}
            outer
          />
        ) : null}

        {layers.shoes ? (
          <GarmentShoes
            piece={layers.shoes}
            cx={CX}
            ankleY={ankleY}
            footY={footY}
            legW={legW}
            gap={gap}
          />
        ) : null}

        {/* ראש */}
        <Ellipse cx={CX} cy={headCy + 1} rx={headR} ry={headR * 1.08} fill="url(#skinGrad)" />
        {/* לחיים */}
        <Ellipse cx={CX - 7} cy={headCy + 4} rx={5} ry={3.5} fill="url(#cheekL)" />
        <Ellipse cx={CX + 7} cy={headCy + 4} rx={5} ry={3.5} fill="url(#cheekR)" />

        {/* שיער קדמי */}
        <HairFront female={female} cx={CX} headCy={headCy} headR={headR} />

        {/* פנים */}
        <Face
          cx={CX}
          cy={headCy}
          female={female}
          skin={skin}
          persona={profile.persona}
        />

        {layers.outer && outerIsHat ? (
          <GarmentHat piece={layers.outer} cx={CX} headCy={headCy} headR={headR} />
        ) : null}

        {/* ברך — עומק עדין */}
        <Ellipse
          cx={CX - gap / 2 - legW / 2}
          cy={kneeY}
          rx={legW * 0.35}
          ry={1.2}
          fill="rgba(0,0,0,0.05)"
        />
        <Ellipse
          cx={CX + gap / 2 + legW / 2}
          cy={kneeY}
          rx={legW * 0.35}
          ry={1.2}
          fill="rgba(0,0,0,0.05)"
        />
      </Svg>
    </View>
  );
}

function armPath(sx: number, sy: number, side: -1 | 1, w: number, ey: number): string {
  const ex = sx + side * (w * 0.35);
  return [
    `M ${sx - side * 1} ${sy}`,
    `C ${sx + side * (w * 0.9)} ${sy + 8}, ${ex + side * w * 0.55} ${sy + 28}, ${ex + side * w * 0.4} ${ey}`,
    `C ${ex + side * w * 0.15} ${ey + 3}, ${ex - side * w * 0.35} ${ey + 2}, ${ex - side * w * 0.45} ${ey - 2}`,
    `C ${sx - side * w * 0.15} ${sy + 30}, ${sx - side * w * 0.55} ${sy + 10}, ${sx - side * w * 0.35} ${sy + 1}`,
    'Z',
  ].join(' ');
}

function legPath(cx: number, top: number, w: number, ankle: number, side: -1 | 1): string {
  const taper = w * 0.82;
  return [
    `M ${cx - w / 2} ${top}`,
    `C ${cx - w / 2 - 0.5} ${top + 20}, ${cx - taper / 2 - 0.3} ${ankle - 30}, ${cx - taper / 2} ${ankle}`,
    `L ${cx + taper / 2} ${ankle}`,
    `C ${cx + taper / 2 + 0.3} ${ankle - 30}, ${cx + w / 2 + 0.5} ${top + 20}, ${cx + w / 2} ${top}`,
    `Q ${cx + side} ${top - 2}, ${cx - w / 2} ${top}`,
    'Z',
  ].join(' ');
}

function HairFront({
  female,
  cx,
  headCy,
  headR,
}: {
  female: boolean;
  cx: number;
  headCy: number;
  headR: number;
}) {
  if (female) {
    return (
      <G>
        <Path
          d={[
            `M ${cx - headR * 1.02} ${headCy - 2}`,
            `C ${cx - headR * 1.1} ${headCy - headR * 0.95}, ${cx - headR * 0.55} ${headCy - headR * 1.25}, ${cx} ${headCy - headR * 1.18}`,
            `C ${cx + headR * 0.55} ${headCy - headR * 1.25}, ${cx + headR * 1.1} ${headCy - headR * 0.95}, ${cx + headR * 1.02} ${headCy - 2}`,
            `C ${cx + headR * 0.95} ${headCy + 6}, ${cx + headR * 0.7} ${headCy + 10}, ${cx + headR * 0.55} ${headCy + 14}`,
            `C ${cx + headR * 0.35} ${headCy + 4}, ${cx + 4} ${headCy - 2}, ${cx} ${headCy + 1}`,
            `C ${cx - 4} ${headCy - 2}, ${cx - headR * 0.35} ${headCy + 4}, ${cx - headR * 0.55} ${headCy + 14}`,
            `C ${cx - headR * 0.7} ${headCy + 10}, ${cx - headR * 0.95} ${headCy + 6}, ${cx - headR * 1.02} ${headCy - 2}`,
            'Z',
          ].join(' ')}
          fill="url(#hairGrad)"
        />
        {/* פס ברק */}
        <Path
          d={`M ${cx - 6} ${headCy - headR * 0.85} Q ${cx - 2} ${headCy - headR * 1.05}, ${cx + 3} ${headCy - headR * 0.75}`}
          stroke="rgba(255,255,255,0.18)"
          strokeWidth={1.6}
          fill="none"
          strokeLinecap="round"
        />
        {/* פוני עדין */}
        <Path
          d={`M ${cx - 9} ${headCy - 4} Q ${cx - 3} ${headCy + 2}, ${cx + 1} ${headCy - 1}`}
          stroke="url(#hairGrad)"
          strokeWidth={2.2}
          fill="none"
          strokeLinecap="round"
          opacity={0.85}
        />
        <Path
          d={`M ${cx + 8} ${headCy - 3} Q ${cx + 3} ${headCy + 3}, ${cx - 1} ${headCy}`}
          stroke="url(#hairGrad)"
          strokeWidth={2}
          fill="none"
          strokeLinecap="round"
          opacity={0.75}
        />
      </G>
    );
  }
  return (
    <G>
      <Path
        d={[
          `M ${cx - headR * 0.98} ${headCy + 1}`,
          `C ${cx - headR * 1.05} ${headCy - headR * 0.7}, ${cx - headR * 0.4} ${headCy - headR * 1.15}, ${cx} ${headCy - headR * 1.12}`,
          `C ${cx + headR * 0.4} ${headCy - headR * 1.15}, ${cx + headR * 1.05} ${headCy - headR * 0.7}, ${cx + headR * 0.98} ${headCy + 1}`,
          `C ${cx + headR * 0.7} ${headCy - 4}, ${cx + 4} ${headCy - 8}, ${cx} ${headCy - 6}`,
          `C ${cx - 4} ${headCy - 8}, ${cx - headR * 0.7} ${headCy - 4}, ${cx - headR * 0.98} ${headCy + 1}`,
          'Z',
        ].join(' ')}
        fill="url(#hairGrad)"
      />
      <Path
        d={`M ${cx - 5} ${headCy - headR * 0.75} Q ${cx} ${headCy - headR * 0.95}, ${cx + 5} ${headCy - headR * 0.7}`}
        stroke="rgba(255,255,255,0.14)"
        strokeWidth={1.4}
        fill="none"
        strokeLinecap="round"
      />
    </G>
  );
}

function Face({
  cx,
  cy,
  female,
  skin,
  persona,
}: {
  cx: number;
  cy: number;
  female: boolean;
  skin: SkinPalette;
  persona: AvatarPersona;
}) {
  const eyeY = cy - 1.5;
  const eyeSpread = female ? 6.2 : 6.6;
  const eyeW = female ? 3.4 : 3.2;
  const eyeH = female ? 2.6 : 2.3;
  const child = persona === 'boy' || persona === 'girl';

  return (
    <G>
      {/* גבות */}
      <Path
        d={`M ${cx - eyeSpread - 2.2} ${eyeY - 3.8} Q ${cx - eyeSpread} ${eyeY - 5.2}, ${cx - eyeSpread + 2.8} ${eyeY - 3.6}`}
        stroke={skin.brow}
        strokeWidth={female ? 1.1 : 1.35}
        fill="none"
        strokeLinecap="round"
      />
      <Path
        d={`M ${cx + eyeSpread + 2.2} ${eyeY - 3.8} Q ${cx + eyeSpread} ${eyeY - 5.2}, ${cx + eyeSpread - 2.8} ${eyeY - 3.6}`}
        stroke={skin.brow}
        strokeWidth={female ? 1.1 : 1.35}
        fill="none"
        strokeLinecap="round"
      />

      {/* עיניים */}
      {([-1, 1] as const).map((side) => {
        const ex = cx + side * eyeSpread;
        return (
          <G key={side}>
            <Ellipse cx={ex} cy={eyeY} rx={eyeW} ry={eyeH} fill="#FFF" />
            <Ellipse
              cx={ex + side * 0.15}
              cy={eyeY + 0.15}
              rx={eyeW * 0.55}
              ry={eyeH * 0.7}
              fill={skin.iris}
            />
            <Circle cx={ex + side * 0.15} cy={eyeY + 0.2} r={1.05} fill="#1A120E" />
            <Circle cx={ex - 0.7} cy={eyeY - 0.6} r={0.55} fill="#FFF" opacity={0.9} />
            {female ? (
              <Path
                d={`M ${ex - eyeW} ${eyeY + 0.2} Q ${ex} ${eyeY + eyeH + 0.8}, ${ex + eyeW} ${eyeY + 0.2}`}
                stroke="rgba(40,20,20,0.12)"
                strokeWidth={0.6}
                fill="none"
              />
            ) : null}
          </G>
        );
      })}

      {/* אף עדין */}
      <Path
        d={`M ${cx} ${cy + 1} Q ${cx + 1.6} ${cy + 4.5}, ${cx} ${cy + 5.2}`}
        stroke={skin.shadow}
        strokeWidth={0.9}
        fill="none"
        strokeLinecap="round"
        opacity={0.55}
      />

      {/* שפתיים */}
      <Path
        d={[
          `M ${cx - (female ? 3.4 : 2.8)} ${cy + 9.2}`,
          `Q ${cx} ${cy + (female ? 10.8 : 10.2)}, ${cx + (female ? 3.4 : 2.8)} ${cy + 9.2}`,
          `Q ${cx} ${cy + (female ? 12.2 : 11.4)}, ${cx - (female ? 3.4 : 2.8)} ${cy + 9.2}`,
          'Z',
        ].join(' ')}
        fill={skin.lip}
      />
      <Path
        d={`M ${cx - (female ? 3.2 : 2.6)} ${cy + 9.2} Q ${cx} ${cy + 10}, ${cx + (female ? 3.2 : 2.6)} ${cy + 9.2}`}
        stroke={skin.lipDark}
        strokeWidth={0.55}
        fill="none"
        opacity={0.7}
      />

      {child ? (
        <Ellipse cx={cx} cy={cy + 6} rx={2} ry={1.2} fill="rgba(255,255,255,0.15)" />
      ) : null}
    </G>
  );
}

function garmentColors(piece: OutfitPiece) {
  const base = garmentColorHex(piece.color);
  return {
    base,
    light: shade(base, 36),
    mid: shade(base, 10),
    dark: shade(base, -38),
    deeper: shade(base, -55),
  };
}

function GarmentTop({
  piece,
  fit,
  female,
  cx,
  shoulderY,
  chestY,
  waistY,
  hipY,
  shoulderHalf,
  waistHalf,
  armW,
  outer,
}: {
  piece: OutfitPiece;
  fit: number;
  female: boolean;
  cx: number;
  shoulderY: number;
  chestY: number;
  waistY: number;
  hipY: number;
  shoulderHalf: number;
  waistHalf: number;
  armW: number;
  outer: boolean;
}) {
  const c = garmentColors(piece);
  const sh = shoulderHalf * fit;
  const wh = waistHalf * fit * (outer ? 1.05 : 1);
  const hemY = outer ? hipY + 2 : waistY + 14;
  const neckW = female ? 5.5 : 6.2;
  const neckD = outer ? 4 : 7;

  const body = [
    `M ${cx - sh} ${shoulderY + 1}`,
    `C ${cx - sh - 1} ${shoulderY + 10}, ${cx - wh - 1} ${waistY - 4}, ${cx - wh} ${hemY}`,
    `Q ${cx} ${hemY + 2}, ${cx + wh} ${hemY}`,
    `C ${cx + wh + 1} ${waistY - 4}, ${cx + sh + 1} ${shoulderY + 10}, ${cx + sh} ${shoulderY + 1}`,
    // צווארון — נגזרת עגולה
    `L ${cx + neckW} ${shoulderY + 2}`,
    `C ${cx + neckW * 0.6} ${shoulderY + neckD}, ${cx - neckW * 0.6} ${shoulderY + neckD}, ${cx - neckW} ${shoulderY + 2}`,
    'Z',
  ].join(' ');

  const sleeveL = [
    `M ${cx - sh + 1} ${shoulderY + 2}`,
    `C ${cx - sh - armW * 1.1} ${shoulderY + 6}, ${cx - sh - armW * 1.35} ${shoulderY + 22}, ${cx - sh - armW * 0.9} ${shoulderY + 36}`,
    `C ${cx - sh - armW * 0.45} ${shoulderY + 38}, ${cx - sh - 2} ${shoulderY + 28}, ${cx - sh + 2} ${shoulderY + 14}`,
    'Z',
  ].join(' ');

  const sleeveR = [
    `M ${cx + sh - 1} ${shoulderY + 2}`,
    `C ${cx + sh + armW * 1.1} ${shoulderY + 6}, ${cx + sh + armW * 1.35} ${shoulderY + 22}, ${cx + sh + armW * 0.9} ${shoulderY + 36}`,
    `C ${cx + sh + armW * 0.45} ${shoulderY + 38}, ${cx + sh + 2} ${shoulderY + 28}, ${cx + sh - 2} ${shoulderY + 14}`,
    'Z',
  ].join(' ');

  const gid = `top-${piece.id}`;

  return (
    <G>
      <Defs>
        <SvgLinearGradient id={gid} x1="0.15" y1="0" x2="0.9" y2="1">
          <Stop offset="0" stopColor={c.light} />
          <Stop offset="0.4" stopColor={c.mid} />
          <Stop offset="1" stopColor={c.dark} />
        </SvgLinearGradient>
      </Defs>
      <Path d={sleeveL} fill={`url(#${gid})`} />
      <Path d={sleeveR} fill={`url(#${gid})`} />
      <Path d={body} fill={`url(#${gid})`} />
      {/* תפר כתף */}
      <Path
        d={`M ${cx - sh + 2} ${shoulderY + 3} Q ${cx} ${shoulderY + 1}, ${cx + sh - 2} ${shoulderY + 3}`}
        stroke="rgba(255,255,255,0.12)"
        strokeWidth={0.6}
        fill="none"
      />
      {/* קיפול מותן */}
      <Path
        d={`M ${cx - wh * 0.7} ${hemY - 1} Q ${cx} ${hemY + 1.5}, ${cx + wh * 0.7} ${hemY - 1}`}
        stroke={c.deeper}
        strokeWidth={0.5}
        fill="none"
        opacity={0.35}
      />
      {/* הדגשת חזה עדינה */}
      <Ellipse
        cx={cx}
        cy={chestY + 2}
        rx={sh * 0.35}
        ry={4}
        fill="rgba(255,255,255,0.06)"
      />
    </G>
  );
}

function GarmentBottom({
  piece,
  fit,
  cx,
  hipY,
  crotchY,
  ankleY,
  hipHalf,
  legW,
  gap,
}: {
  piece: OutfitPiece;
  fit: number;
  cx: number;
  hipY: number;
  crotchY: number;
  ankleY: number;
  hipHalf: number;
  legW: number;
  gap: number;
}) {
  const c = garmentColors(piece);
  const hh = hipHalf * 0.95 * fit;
  const pw = legW * (0.92 + (fit - 1) * 0.45);
  const short =
    piece.subcategory?.includes('קצר') ||
    piece.label.includes('קצר') ||
    piece.subcategory?.toLowerCase().includes('short');
  const hemY = short ? crotchY + 28 : ankleY - 2;
  const gid = `bot-${piece.id}`;

  const waist = [
    `M ${cx - hh} ${hipY - 8}`,
    `Q ${cx} ${hipY - 12}, ${cx + hh} ${hipY - 8}`,
    `L ${cx + hh * 0.85} ${crotchY + 4}`,
    `Q ${cx} ${crotchY + 10}, ${cx - hh * 0.85} ${crotchY + 4}`,
    'Z',
  ].join(' ');

  const leftLeg = [
    `M ${cx - gap / 2 - pw} ${crotchY}`,
    `C ${cx - gap / 2 - pw - 0.4} ${crotchY + 20}, ${cx - gap / 2 - pw * 0.85} ${hemY - 20}, ${cx - gap / 2 - pw * 0.82} ${hemY}`,
    `L ${cx - gap / 2 - 0.4} ${hemY}`,
    `C ${cx - gap / 2 - pw * 0.15} ${hemY - 20}, ${cx - gap / 2 - 0.6} ${crotchY + 18}, ${cx - gap / 2 - 1} ${crotchY}`,
    'Z',
  ].join(' ');

  const rightLeg = [
    `M ${cx + gap / 2 + 1} ${crotchY}`,
    `C ${cx + gap / 2 + 0.6} ${crotchY + 18}, ${cx + gap / 2 + pw * 0.15} ${hemY - 20}, ${cx + gap / 2 + 0.4} ${hemY}`,
    `L ${cx + gap / 2 + pw * 0.82} ${hemY}`,
    `C ${cx + gap / 2 + pw * 0.85} ${hemY - 20}, ${cx + gap / 2 + pw + 0.4} ${crotchY + 20}, ${cx + gap / 2 + pw} ${crotchY}`,
    'Z',
  ].join(' ');

  return (
    <G>
      <Defs>
        <SvgLinearGradient id={gid} x1="0.2" y1="0" x2="0.85" y2="1">
          <Stop offset="0" stopColor={c.light} />
          <Stop offset="0.45" stopColor={c.base} />
          <Stop offset="1" stopColor={c.dark} />
        </SvgLinearGradient>
      </Defs>
      <Path d={leftLeg} fill={`url(#${gid})`} />
      <Path d={rightLeg} fill={`url(#${gid})`} />
      <Path d={waist} fill={`url(#${gid})`} />
      {/* חגורה */}
      <Path
        d={`M ${cx - hh * 0.92} ${hipY - 7} Q ${cx} ${hipY - 10}, ${cx + hh * 0.92} ${hipY - 7}`}
        stroke={c.deeper}
        strokeWidth={1.4}
        fill="none"
        opacity={0.55}
      />
      {/* תפר מרכזי */}
      <Path
        d={`M ${cx} ${hipY - 6} L ${cx} ${crotchY + 6}`}
        stroke={c.deeper}
        strokeWidth={0.45}
        opacity={0.4}
      />
      {/* ברק על הרגל */}
      <Path
        d={`M ${cx - gap / 2 - pw * 0.55} ${crotchY + 8} L ${cx - gap / 2 - pw * 0.45} ${hemY - 6}`}
        stroke="rgba(255,255,255,0.14)"
        strokeWidth={1.1}
        strokeLinecap="round"
      />
      <Path
        d={`M ${cx + gap / 2 + pw * 0.35} ${crotchY + 8} L ${cx + gap / 2 + pw * 0.4} ${hemY - 6}`}
        stroke="rgba(255,255,255,0.1)"
        strokeWidth={1}
        strokeLinecap="round"
      />
    </G>
  );
}

function GarmentDress({
  piece,
  fit,
  cx,
  shoulderY,
  chestY,
  waistY,
  hipY,
  kneeY,
  shoulderHalf,
  waistHalf,
  hipHalf,
}: {
  piece: OutfitPiece;
  fit: number;
  cx: number;
  shoulderY: number;
  chestY: number;
  waistY: number;
  hipY: number;
  kneeY: number;
  shoulderHalf: number;
  waistHalf: number;
  hipHalf: number;
}) {
  const c = garmentColors(piece);
  const sh = shoulderHalf * fit;
  const wh = waistHalf * fit;
  const skirt = hipHalf * 1.35 * fit;
  const hemY = kneeY + 18;
  const neckW = 5.8;
  const gid = `dress-${piece.id}`;

  const d = [
    `M ${cx - sh} ${shoulderY + 1}`,
    `C ${cx - sh} ${shoulderY + 12}, ${cx - wh} ${waistY - 6}, ${cx - wh} ${waistY}`,
    `C ${cx - wh * 1.1} ${hipY}, ${cx - skirt} ${hipY + 16}, ${cx - skirt} ${hemY}`,
    `Q ${cx} ${hemY + 4}, ${cx + skirt} ${hemY}`,
    `C ${cx + skirt} ${hipY + 16}, ${cx + wh * 1.1} ${hipY}, ${cx + wh} ${waistY}`,
    `C ${cx + wh} ${waistY - 6}, ${cx + sh} ${shoulderY + 12}, ${cx + sh} ${shoulderY + 1}`,
    `L ${cx + neckW} ${shoulderY + 2}`,
    `C ${cx + 3} ${shoulderY + 9}, ${cx - 3} ${shoulderY + 9}, ${cx - neckW} ${shoulderY + 2}`,
    'Z',
  ].join(' ');

  return (
    <G>
      <Defs>
        <SvgLinearGradient id={gid} x1="0.2" y1="0" x2="0.85" y2="1">
          <Stop offset="0" stopColor={c.light} />
          <Stop offset="0.4" stopColor={c.base} />
          <Stop offset="1" stopColor={c.dark} />
        </SvgLinearGradient>
      </Defs>
      <Path d={d} fill={`url(#${gid})`} />
      <Path
        d={`M ${cx - wh} ${waistY} Q ${cx} ${waistY + 2}, ${cx + wh} ${waistY}`}
        stroke={c.deeper}
        strokeWidth={0.7}
        fill="none"
        opacity={0.35}
      />
      <Ellipse
        cx={cx}
        cy={chestY + 2}
        rx={sh * 0.3}
        ry={3.5}
        fill="rgba(255,255,255,0.07)"
      />
    </G>
  );
}

function GarmentShoes({
  piece,
  cx,
  ankleY,
  footY,
  legW,
  gap,
}: {
  piece: OutfitPiece;
  cx: number;
  ankleY: number;
  footY: number;
  legW: number;
  gap: number;
}) {
  const c = garmentColors(piece);
  const gid = `shoe-${piece.id}`;
  const positions = [
    cx - gap / 2 - legW / 2 - 1,
    cx + gap / 2 + legW / 2 + 1,
  ];

  return (
    <G>
      <Defs>
        <SvgLinearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={c.light} />
          <Stop offset="1" stopColor={c.dark} />
        </SvgLinearGradient>
      </Defs>
      {positions.map((px, i) => (
        <G key={i}>
          <Path
            d={[
              `M ${px - legW * 0.55} ${ankleY - 2}`,
              `Q ${px - legW * 0.5} ${footY + 1}, ${px - legW * 0.7} ${footY + 2.5}`,
              `Q ${px} ${footY + 4.5}, ${px + legW * 0.85} ${footY + 2}`,
              `Q ${px + legW * 0.55} ${ankleY + 1}, ${px + legW * 0.4} ${ankleY - 2}`,
              'Z',
            ].join(' ')}
            fill={`url(#${gid})`}
          />
          <Ellipse
            cx={px + 1}
            cy={footY + 1}
            rx={legW * 0.55}
            ry={1.4}
            fill="rgba(255,255,255,0.12)"
          />
        </G>
      ))}
    </G>
  );
}

function GarmentHat({
  piece,
  cx,
  headCy,
  headR,
}: {
  piece: OutfitPiece;
  cx: number;
  headCy: number;
  headR: number;
}) {
  const c = garmentColors(piece);
  const gid = `hat-${piece.id}`;
  const top = headCy - headR - 2;

  return (
    <G>
      <Defs>
        <SvgLinearGradient id={gid} x1="0.3" y1="0" x2="0.7" y2="1">
          <Stop offset="0" stopColor={c.light} />
          <Stop offset="1" stopColor={c.dark} />
        </SvgLinearGradient>
      </Defs>
      <Ellipse cx={cx} cy={top + 10} rx={headR * 1.25} ry={3.2} fill={`url(#${gid})`} />
      <Path
        d={[
          `M ${cx - headR * 0.7} ${top + 9}`,
          `C ${cx - headR * 0.75} ${top - 2}, ${cx - 4} ${top - 6}, ${cx} ${top - 6.5}`,
          `C ${cx + 4} ${top - 6}, ${cx + headR * 0.75} ${top - 2}, ${cx + headR * 0.7} ${top + 9}`,
          'Z',
        ].join(' ')}
        fill={`url(#${gid})`}
      />
      <Path
        d={`M ${cx - 4} ${top - 2} Q ${cx} ${top - 5}, ${cx + 3} ${top - 1}`}
        stroke="rgba(255,255,255,0.2)"
        strokeWidth={1.2}
        fill="none"
        strokeLinecap="round"
      />
    </G>
  );
}
