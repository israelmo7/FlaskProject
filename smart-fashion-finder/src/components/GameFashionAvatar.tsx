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

/** אזורי גוף על בסיס דמות המשחק (יחס לגובה) — מכויל ל־PNG */
const Z = {
  shoulder: 0.285,
  chest: 0.34,
  waist: 0.44,
  hip: 0.5,
  crotch: 0.545,
  knee: 0.72,
  ankle: 0.885,
  foot: 0.945,
  neck: 0.245,
  headTop: 0.05,
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
  // רוחב דמות בפועל ב־PNG ~45–58% מהקנבס
  const bodySpan = width * (female ? 0.48 : 0.56);
  const shoulderW = bodySpan * (female ? 0.72 : 0.78) * Math.min(1.15, wScale);
  const waistW = bodySpan * (female ? 0.42 : 0.52) * Math.min(1.15, wScale);
  const hipW = bodySpan * (female ? 0.62 : 0.58) * Math.min(1.15, wScale);
  const legW = bodySpan * (female ? 0.22 : 0.24) * Math.min(1.12, wScale);
  const gap = bodySpan * 0.06;
  const armReach = bodySpan * 0.38;

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

      {/* שכבות בגדים — blend כדי שייראו חלק מהדמות המצוירת */}
      <Svg
        width={width}
        height={height}
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          mixBlendMode: 'multiply',
        }}
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
  const wh = (waistW / 2) * fit * (outer ? 1.06 : 1);
  const top = y(Z.neck) + 2;
  const hem = outer ? y(Z.hip) + 6 : y(Z.hip) - 4;
  const neckW = female ? sh * 0.34 : sh * 0.38;
  const neckD = outer ? 12 : 18;
  const gid = `g-top-${piece.id}-${outer ? 'o' : 't'}`;
  const sleeveLen = outer ? 0.72 : 0.42;

  // גוף החולצה — כתפיים רכות + מותן + צווארון עגול
  const body = [
    `M ${cx - sh * 0.92} ${top + 8}`,
    `C ${cx - sh * 1.05} ${top + 22}, ${cx - wh * 1.05} ${y(Z.waist)}, ${cx - wh} ${hem}`,
    `C ${cx - wh * 0.55} ${hem + 4}, ${cx + wh * 0.55} ${hem + 4}, ${cx + wh} ${hem}`,
    `C ${cx + wh * 1.05} ${y(Z.waist)}, ${cx + sh * 1.05} ${top + 22}, ${cx + sh * 0.92} ${top + 8}`,
    `C ${cx + sh * 0.55} ${top + 2}, ${cx + neckW} ${top + 4}, ${cx + neckW * 0.85} ${top + 6}`,
    `C ${cx + neckW * 0.45} ${top + neckD}, ${cx - neckW * 0.45} ${top + neckD}, ${cx - neckW * 0.85} ${top + 6}`,
    `C ${cx - neckW} ${top + 4}, ${cx - sh * 0.55} ${top + 2}, ${cx - sh * 0.92} ${top + 8}`,
    'Z',
  ].join(' ');

  // שרוולים בזווית A-pose
  const sleeveL = [
    `M ${cx - sh * 0.85} ${top + 10}`,
    `C ${cx - sh - armReach * 0.25} ${top + 14}, ${cx - sh - armReach * 0.65} ${top + 20 + sleeveLen * 20}, ${cx - sh - armReach * 0.85} ${top + 28 + sleeveLen * 40}`,
    `C ${cx - sh - armReach * 0.55} ${top + 34 + sleeveLen * 42}, ${cx - sh - armReach * 0.15} ${top + 30}, ${cx - sh * 0.55} ${top + 22}`,
    'Z',
  ].join(' ');

  const sleeveR = [
    `M ${cx + sh * 0.85} ${top + 10}`,
    `C ${cx + sh + armReach * 0.25} ${top + 14}, ${cx + sh + armReach * 0.65} ${top + 20 + sleeveLen * 20}, ${cx + sh + armReach * 0.85} ${top + 28 + sleeveLen * 40}`,
    `C ${cx + sh + armReach * 0.55} ${top + 34 + sleeveLen * 42}, ${cx + sh + armReach * 0.15} ${top + 30}, ${cx + sh * 0.55} ${top + 22}`,
    'Z',
  ].join(' ');

  return (
    <G opacity={0.88}>
      <Defs>
        <SvgLinearGradient id={gid} x1="0.2" y1="0" x2="0.85" y2="1">
          <Stop offset="0" stopColor={c.light} />
          <Stop offset="0.45" stopColor={c.mid} />
          <Stop offset="1" stopColor={c.dark} />
        </SvgLinearGradient>
      </Defs>
      <Path d={sleeveL} fill={`url(#${gid})`} />
      <Path d={sleeveR} fill={`url(#${gid})`} />
      <Path d={body} fill={`url(#${gid})`} />
      <Path
        d={`M ${cx - sh * 0.28} ${top + 20} Q ${cx - sh * 0.12} ${(top + hem) / 2}, ${cx - sh * 0.22} ${hem - 10}`}
        stroke="rgba(255,255,255,0.2)"
        strokeWidth={2.4}
        fill="none"
        strokeLinecap="round"
      />
      <Path
        d={`M ${cx - wh * 0.7} ${hem - 1} Q ${cx} ${hem + 3}, ${cx + wh * 0.7} ${hem - 1}`}
        stroke={c.deep}
        strokeWidth={1}
        fill="none"
        opacity={0.3}
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
  const hh = (hipW / 2) * fit;
  const thigh = legW * (1.15 + (fit - 1) * 0.35);
  const ankleW = legW * 0.85;
  const short =
    piece.subcategory?.includes('קצר') ||
    piece.label.includes('קצר') ||
    (piece.subcategory ?? '').toLowerCase().includes('short');
  const waistTop = y(Z.waist) + (y(Z.hip) - y(Z.waist)) * 0.55;
  const crotch = y(Z.crotch);
  const hem = short ? y(Z.knee) - 6 : y(Z.ankle) - 2;
  const gid = `g-bot-${piece.id}`;
  const lx = cx - gap / 2 - thigh / 2;
  const rx = cx + gap / 2 + thigh / 2;

  const waist = [
    `M ${cx - hh} ${waistTop}`,
    `Q ${cx} ${waistTop - 5}, ${cx + hh} ${waistTop}`,
    `C ${cx + hh * 0.95} ${crotch - 4}, ${cx + hh * 0.7} ${crotch + 4}, ${cx + gap / 2 + 2} ${crotch + 6}`,
    `Q ${cx} ${crotch + 12}, ${cx - gap / 2 - 2} ${crotch + 6}`,
    `C ${cx - hh * 0.7} ${crotch + 4}, ${cx - hh * 0.95} ${crotch - 4}, ${cx - hh} ${waistTop}`,
    'Z',
  ].join(' ');

  const left = [
    `M ${lx - thigh / 2} ${crotch + 2}`,
    `C ${lx - thigh / 2 - 1} ${crotch + 36}, ${lx - ankleW / 2 - 1} ${hem - 28}, ${lx - ankleW / 2} ${hem}`,
    `C ${lx - 2} ${hem + 2}, ${lx + 2} ${hem + 2}, ${lx + ankleW / 2} ${hem}`,
    `C ${lx + ankleW / 2 + 1} ${hem - 28}, ${lx + thigh / 2} ${crotch + 36}, ${lx + thigh / 2} ${crotch + 2}`,
    `Q ${lx} ${crotch - 2}, ${lx - thigh / 2} ${crotch + 2}`,
    'Z',
  ].join(' ');

  const right = [
    `M ${rx - thigh / 2} ${crotch + 2}`,
    `C ${rx - thigh / 2} ${crotch + 36}, ${rx - ankleW / 2} ${hem - 28}, ${rx - ankleW / 2} ${hem}`,
    `C ${rx - 2} ${hem + 2}, ${rx + 2} ${hem + 2}, ${rx + ankleW / 2} ${hem}`,
    `C ${rx + ankleW / 2 + 1} ${hem - 28}, ${rx + thigh / 2 + 1} ${crotch + 36}, ${rx + thigh / 2} ${crotch + 2}`,
    `Q ${rx} ${crotch - 2}, ${rx - thigh / 2} ${crotch + 2}`,
    'Z',
  ].join(' ');

  return (
    <G opacity={0.9}>
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
        d={`M ${cx - hh * 0.88} ${waistTop + 3} Q ${cx} ${waistTop - 1}, ${cx + hh * 0.88} ${waistTop + 3}`}
        stroke={c.deep}
        strokeWidth={2.2}
        fill="none"
        opacity={0.4}
      />
      <Path
        d={`M ${cx} ${waistTop + 5} L ${cx} ${crotch + 8}`}
        stroke={c.deep}
        strokeWidth={0.8}
        opacity={0.3}
      />
      <Path
        d={`M ${lx - thigh * 0.15} ${crotch + 14} L ${lx - thigh * 0.08} ${hem - 10}`}
        stroke="rgba(255,255,255,0.2)"
        strokeWidth={2}
        strokeLinecap="round"
      />
      <Path
        d={`M ${rx + thigh * 0.05} ${crotch + 14} L ${rx + thigh * 0.1} ${hem - 10}`}
        stroke="rgba(255,255,255,0.14)"
        strokeWidth={1.8}
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
