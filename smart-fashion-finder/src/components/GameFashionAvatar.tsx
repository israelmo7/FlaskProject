import { Image, View } from 'react-native';
import Svg, {
  Defs,
  Ellipse,
  G,
  LinearGradient as SvgLinearGradient,
  Path,
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
import { PERSONA_BASE_IMAGES } from '@/constants/avatarAssets';
import type { AvatarProfile, OutfitLayers, OutfitPiece } from '@/types';

type Props = {
  profile: AvatarProfile;
  layers: OutfitLayers;
  width: number;
  height: number;
};

/** אזורי גוף על בסיס דמות המשחק (יחס לגובה) */
const Z = {
  shoulder: 0.3,
  chest: 0.36,
  waist: 0.46,
  hip: 0.52,
  crotch: 0.56,
  knee: 0.74,
  ankle: 0.9,
  foot: 0.96,
  neck: 0.26,
  headTop: 0.06,
} as const;

function shade(hex: string, amount: number): string {
  const h = hex.replace('#', '');
  if (h.length !== 6) return hex;
  const n = parseInt(h, 16);
  const r = Math.min(255, Math.max(0, ((n >> 16) & 255) + amount));
  const g = Math.min(255, Math.max(0, ((n >> 8) & 255) + amount));
  const b = Math.min(255, Math.max(0, (n & 255) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

function colors(piece: OutfitPiece) {
  const base = garmentColorHex(piece.color);
  return {
    base,
    light: shade(base, 40),
    mid: shade(base, 8),
    dark: shade(base, -36),
    deep: shade(base, -55),
  };
}

/**
 * דמות משחק אופנה — בסיס מצויר ברמה גבוהה + בגדים מותאמים לפי אזורי גוף.
 */
export function GameFashionAvatar({ profile, layers, width, height }: Props) {
  const female = isFemalePersona(profile.persona);
  const wScale = buildWidthScale(profile.build);
  const hScale = heightScale(profile.heightCm, profile.persona);
  void hScale;

  const base = PERSONA_BASE_IMAGES[profile.persona];
  const cx = width / 2;
  const shoulderW = width * (female ? 0.38 : 0.42) * Math.min(1.2, wScale);
  const waistW = width * (female ? 0.24 : 0.3) * Math.min(1.2, wScale);
  const hipW = width * (female ? 0.34 : 0.32) * Math.min(1.2, wScale);
  const legW = width * (female ? 0.12 : 0.135) * Math.min(1.15, wScale);
  const gap = width * 0.03;
  const armReach = width * 0.14;

  const y = (t: number) => height * t;

  const fitFor = (piece: OutfitPiece) =>
    sizeFitScale(piece.size) *
    sizeRelativeToHeight(piece.size, profile.heightCm) *
    Math.min(1.12, Math.max(0.88, wScale));

  const outerIsHat = layers.outer?.category === 'Hats';

  return (
    <View style={{ width, height }}>
      {/* צל במה */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          bottom: height * 0.02,
          left: cx - width * 0.28,
          width: width * 0.56,
          height: height * 0.025,
          borderRadius: 999,
          backgroundColor: 'rgba(40,30,20,0.14)',
        }}
      />

      {/* דמות בסיס — איכות משחק */}
      <Image
        source={base}
        resizeMode="contain"
        style={{
          position: 'absolute',
          width,
          height,
          transform: [{ scaleX: Math.min(1.18, Math.max(0.85, wScale)) }],
        }}
      />

      {/* שכבות בגדים מעל הדמות */}
      <Svg
        width={width}
        height={height}
        style={{ position: 'absolute', left: 0, top: 0 }}
        pointerEvents="none"
      >
        {layers.bottom && !layers.dress ? (
          <BottomLayer
            piece={layers.bottom}
            fit={fitFor(layers.bottom)}
            cx={cx}
            y={y}
            hipW={hipW}
            legW={legW}
            gap={gap}
          />
        ) : null}

        {layers.top && !layers.dress ? (
          <TopLayer
            piece={layers.top}
            fit={fitFor(layers.top)}
            female={female}
            cx={cx}
            y={y}
            shoulderW={shoulderW}
            waistW={waistW}
            armReach={armReach}
            outer={false}
          />
        ) : null}

        {layers.dress ? (
          <DressLayer
            piece={layers.dress}
            fit={fitFor(layers.dress)}
            cx={cx}
            y={y}
            shoulderW={shoulderW}
            waistW={waistW}
            hipW={hipW}
          />
        ) : null}

        {layers.outer && !outerIsHat ? (
          <TopLayer
            piece={layers.outer}
            fit={fitFor(layers.outer)}
            female={female}
            cx={cx}
            y={y}
            shoulderW={shoulderW * 1.08}
            waistW={waistW * 1.12}
            armReach={armReach * 1.1}
            outer
          />
        ) : null}

        {layers.shoes ? (
          <ShoesLayer
            piece={layers.shoes}
            cx={cx}
            y={y}
            legW={legW}
            gap={gap}
          />
        ) : null}

        {layers.outer && outerIsHat ? (
          <HatLayer piece={layers.outer} cx={cx} y={y} width={width} />
        ) : null}
      </Svg>
    </View>
  );
}

function TopLayer({
  piece,
  fit,
  female,
  cx,
  y,
  shoulderW,
  waistW,
  armReach,
  outer,
}: {
  piece: OutfitPiece;
  fit: number;
  female: boolean;
  cx: number;
  y: (t: number) => number;
  shoulderW: number;
  waistW: number;
  armReach: number;
  outer: boolean;
}) {
  const c = colors(piece);
  const sh = (shoulderW / 2) * fit;
  const wh = (waistW / 2) * fit * (outer ? 1.05 : 1);
  const top = y(Z.shoulder) - 2;
  const hem = outer ? y(Z.hip) + 4 : y(Z.waist) + (y(Z.hip) - y(Z.waist)) * 0.55;
  const neckW = female ? sh * 0.28 : sh * 0.32;
  const neckD = outer ? 10 : 16;
  const gid = `g-top-${piece.id}-${outer ? 'o' : 't'}`;

  const body = [
    `M ${cx - sh} ${top + 4}`,
    `C ${cx - sh - 2} ${top + 18}, ${cx - wh - 1} ${hem - 20}, ${cx - wh} ${hem}`,
    `Q ${cx} ${hem + 3}, ${cx + wh} ${hem}`,
    `C ${cx + wh + 1} ${hem - 20}, ${cx + sh + 2} ${top + 18}, ${cx + sh} ${top + 4}`,
    `L ${cx + neckW} ${top + 6}`,
    `C ${cx + neckW * 0.55} ${top + neckD}, ${cx - neckW * 0.55} ${top + neckD}, ${cx - neckW} ${top + 6}`,
    'Z',
  ].join(' ');

  const sleeveL = [
    `M ${cx - sh + 2} ${top + 6}`,
    `C ${cx - sh - armReach * 0.55} ${top + 10}, ${cx - sh - armReach * 0.85} ${top + 28}, ${cx - sh - armReach * 0.7} ${top + 48}`,
    `C ${cx - sh - armReach * 0.35} ${top + 52}, ${cx - sh - 4} ${top + 34}, ${cx - sh + 4} ${top + 18}`,
    'Z',
  ].join(' ');

  const sleeveR = [
    `M ${cx + sh - 2} ${top + 6}`,
    `C ${cx + sh + armReach * 0.55} ${top + 10}, ${cx + sh + armReach * 0.85} ${top + 28}, ${cx + sh + armReach * 0.7} ${top + 48}`,
    `C ${cx + sh + armReach * 0.35} ${top + 52}, ${cx + sh + 4} ${top + 34}, ${cx + sh - 4} ${top + 18}`,
    'Z',
  ].join(' ');

  return (
    <G opacity={0.92}>
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
      {/* ברק בד */}
      <Path
        d={`M ${cx - sh * 0.35} ${top + 14} Q ${cx - sh * 0.15} ${hem * 0.5 + top * 0.5}, ${cx - sh * 0.25} ${hem - 8}`}
        stroke="rgba(255,255,255,0.16)"
        strokeWidth={2.2}
        fill="none"
        strokeLinecap="round"
      />
      <Path
        d={`M ${cx - sh + 4} ${top + 5} Q ${cx} ${top + 2}, ${cx + sh - 4} ${top + 5}`}
        stroke="rgba(255,255,255,0.12)"
        strokeWidth={1}
        fill="none"
      />
      <Path
        d={`M ${cx - wh * 0.75} ${hem - 1} Q ${cx} ${hem + 2}, ${cx + wh * 0.75} ${hem - 1}`}
        stroke={c.deep}
        strokeWidth={0.8}
        fill="none"
        opacity={0.35}
      />
    </G>
  );
}

function BottomLayer({
  piece,
  fit,
  cx,
  y,
  hipW,
  legW,
  gap,
}: {
  piece: OutfitPiece;
  fit: number;
  cx: number;
  y: (t: number) => number;
  hipW: number;
  legW: number;
  gap: number;
}) {
  const c = colors(piece);
  const hh = (hipW / 2) * 0.95 * fit;
  const pw = legW * (0.95 + (fit - 1) * 0.4);
  const short =
    piece.subcategory?.includes('קצר') ||
    piece.label.includes('קצר') ||
    (piece.subcategory ?? '').toLowerCase().includes('short');
  const waistTop = y(Z.hip) - 10;
  const crotch = y(Z.crotch);
  const hem = short ? y(Z.knee) - 8 : y(Z.ankle) - 4;
  const gid = `g-bot-${piece.id}`;

  const waist = [
    `M ${cx - hh} ${waistTop}`,
    `Q ${cx} ${waistTop - 6}, ${cx + hh} ${waistTop}`,
    `L ${cx + hh * 0.88} ${crotch + 6}`,
    `Q ${cx} ${crotch + 14}, ${cx - hh * 0.88} ${crotch + 6}`,
    'Z',
  ].join(' ');

  const left = [
    `M ${cx - gap / 2 - pw} ${crotch}`,
    `C ${cx - gap / 2 - pw - 1} ${crotch + 30}, ${cx - gap / 2 - pw * 0.88} ${hem - 24}, ${cx - gap / 2 - pw * 0.85} ${hem}`,
    `L ${cx - gap / 2 - 1} ${hem}`,
    `C ${cx - gap / 2 - pw * 0.2} ${hem - 24}, ${cx - gap / 2 - 2} ${crotch + 28}, ${cx - gap / 2 - 2} ${crotch}`,
    'Z',
  ].join(' ');

  const right = [
    `M ${cx + gap / 2 + 2} ${crotch}`,
    `C ${cx + gap / 2 + 2} ${crotch + 28}, ${cx + gap / 2 + pw * 0.2} ${hem - 24}, ${cx + gap / 2 + 1} ${hem}`,
    `L ${cx + gap / 2 + pw * 0.85} ${hem}`,
    `C ${cx + gap / 2 + pw * 0.88} ${hem - 24}, ${cx + gap / 2 + pw + 1} ${crotch + 30}, ${cx + gap / 2 + pw} ${crotch}`,
    'Z',
  ].join(' ');

  return (
    <G opacity={0.93}>
      <Defs>
        <SvgLinearGradient id={gid} x1="0.2" y1="0" x2="0.85" y2="1">
          <Stop offset="0" stopColor={c.light} />
          <Stop offset="0.45" stopColor={c.base} />
          <Stop offset="1" stopColor={c.dark} />
        </SvgLinearGradient>
      </Defs>
      <Path d={left} fill={`url(#${gid})`} />
      <Path d={right} fill={`url(#${gid})`} />
      <Path d={waist} fill={`url(#${gid})`} />
      <Path
        d={`M ${cx - hh * 0.9} ${waistTop + 2} Q ${cx} ${waistTop - 2}, ${cx + hh * 0.9} ${waistTop + 2}`}
        stroke={c.deep}
        strokeWidth={2}
        fill="none"
        opacity={0.45}
      />
      <Path
        d={`M ${cx} ${waistTop + 4} L ${cx} ${crotch + 8}`}
        stroke={c.deep}
        strokeWidth={0.7}
        opacity={0.35}
      />
      <Path
        d={`M ${cx - gap / 2 - pw * 0.55} ${crotch + 12} L ${cx - gap / 2 - pw * 0.48} ${hem - 8}`}
        stroke="rgba(255,255,255,0.18)"
        strokeWidth={1.6}
        strokeLinecap="round"
      />
      <Path
        d={`M ${cx + gap / 2 + pw * 0.35} ${crotch + 12} L ${cx + gap / 2 + pw * 0.4} ${hem - 8}`}
        stroke="rgba(255,255,255,0.12)"
        strokeWidth={1.4}
        strokeLinecap="round"
      />
    </G>
  );
}

function DressLayer({
  piece,
  fit,
  cx,
  y,
  shoulderW,
  waistW,
  hipW,
}: {
  piece: OutfitPiece;
  fit: number;
  cx: number;
  y: (t: number) => number;
  shoulderW: number;
  waistW: number;
  hipW: number;
}) {
  const c = colors(piece);
  const sh = (shoulderW / 2) * fit;
  const wh = (waistW / 2) * fit;
  const skirt = (hipW / 2) * 1.4 * fit;
  const top = y(Z.shoulder);
  const waist = y(Z.waist);
  const hem = y(Z.knee) + 18;
  const neckW = sh * 0.3;
  const gid = `g-dress-${piece.id}`;

  const d = [
    `M ${cx - sh} ${top + 4}`,
    `C ${cx - sh} ${top + 16}, ${cx - wh} ${waist - 8}, ${cx - wh} ${waist}`,
    `C ${cx - wh * 1.15} ${y(Z.hip)}, ${cx - skirt} ${y(Z.hip) + 20}, ${cx - skirt} ${hem}`,
    `Q ${cx} ${hem + 5}, ${cx + skirt} ${hem}`,
    `C ${cx + skirt} ${y(Z.hip) + 20}, ${cx + wh * 1.15} ${y(Z.hip)}, ${cx + wh} ${waist}`,
    `C ${cx + wh} ${waist - 8}, ${cx + sh} ${top + 16}, ${cx + sh} ${top + 4}`,
    `L ${cx + neckW} ${top + 6}`,
    `C ${cx + 4} ${top + 18}, ${cx - 4} ${top + 18}, ${cx - neckW} ${top + 6}`,
    'Z',
  ].join(' ');

  return (
    <G opacity={0.93}>
      <Defs>
        <SvgLinearGradient id={gid} x1="0.2" y1="0" x2="0.85" y2="1">
          <Stop offset="0" stopColor={c.light} />
          <Stop offset="0.4" stopColor={c.base} />
          <Stop offset="1" stopColor={c.dark} />
        </SvgLinearGradient>
      </Defs>
      <Path d={d} fill={`url(#${gid})`} />
      <Path
        d={`M ${cx - wh} ${waist} Q ${cx} ${waist + 3}, ${cx + wh} ${waist}`}
        stroke={c.deep}
        strokeWidth={1}
        fill="none"
        opacity={0.35}
      />
      <Path
        d={`M ${cx - sh * 0.3} ${top + 16} Q ${cx - sh * 0.12} ${(top + hem) / 2}, ${cx - sh * 0.2} ${hem - 12}`}
        stroke="rgba(255,255,255,0.14)"
        strokeWidth={2}
        fill="none"
        strokeLinecap="round"
      />
    </G>
  );
}

function ShoesLayer({
  piece,
  cx,
  y,
  legW,
  gap,
}: {
  piece: OutfitPiece;
  cx: number;
  y: (t: number) => number;
  legW: number;
  gap: number;
}) {
  const c = colors(piece);
  const gid = `g-shoe-${piece.id}`;
  const ankle = y(Z.ankle);
  const foot = y(Z.foot);
  const positions = [cx - gap / 2 - legW / 2 - 2, cx + gap / 2 + legW / 2 + 2];

  return (
    <G opacity={0.95}>
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
              `M ${px - legW * 0.55} ${ankle}`,
              `Q ${px - legW * 0.5} ${foot}, ${px - legW * 0.75} ${foot + 2}`,
              `Q ${px} ${foot + 5}, ${px + legW * 0.9} ${foot + 1}`,
              `Q ${px + legW * 0.55} ${ankle + 2}, ${px + legW * 0.4} ${ankle}`,
              'Z',
            ].join(' ')}
            fill={`url(#${gid})`}
          />
          <Ellipse
            cx={px + 2}
            cy={foot + 0.5}
            rx={legW * 0.5}
            ry={1.6}
            fill="rgba(255,255,255,0.14)"
          />
        </G>
      ))}
    </G>
  );
}

function HatLayer({
  piece,
  cx,
  y,
  width,
}: {
  piece: OutfitPiece;
  cx: number;
  y: (t: number) => number;
  width: number;
}) {
  const c = colors(piece);
  const gid = `g-hat-${piece.id}`;
  const top = y(Z.headTop) + 4;
  const brimY = top + 22;
  const r = width * 0.16;

  return (
    <G opacity={0.95}>
      <Defs>
        <SvgLinearGradient id={gid} x1="0.3" y1="0" x2="0.7" y2="1">
          <Stop offset="0" stopColor={c.light} />
          <Stop offset="1" stopColor={c.dark} />
        </SvgLinearGradient>
      </Defs>
      <Ellipse cx={cx} cy={brimY} rx={r * 1.35} ry={4} fill={`url(#${gid})`} />
      <Path
        d={[
          `M ${cx - r * 0.75} ${brimY - 1}`,
          `C ${cx - r * 0.8} ${top + 4}, ${cx - 8} ${top}, ${cx} ${top - 1}`,
          `C ${cx + 8} ${top}, ${cx + r * 0.8} ${top + 4}, ${cx + r * 0.75} ${brimY - 1}`,
          'Z',
        ].join(' ')}
        fill={`url(#${gid})`}
      />
      <Path
        d={`M ${cx - 6} ${top + 6} Q ${cx} ${top + 1}, ${cx + 5} ${top + 7}`}
        stroke="rgba(255,255,255,0.22)"
        strokeWidth={1.4}
        fill="none"
        strokeLinecap="round"
      />
    </G>
  );
}
