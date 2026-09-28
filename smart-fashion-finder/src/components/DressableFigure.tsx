import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
  PERSONA_OPTIONS,
  buildWidthScale,
  formatHeightMeters,
  garmentColorHex,
  heightScale,
} from '@/constants/avatar';
import { catalogIdFromPieceId } from '@/constants/avatarAssets';
import { AvatarExpandModal } from '@/components/AvatarExpandModal';
import { GameFashionAvatar } from '@/components/GameFashionAvatar';
import { he } from '@/i18n/he';
import type { AvatarProfile, OutfitLayers, OutfitPiece } from '@/types';

type Props = {
  profile: AvatarProfile;
  layers: OutfitLayers;
  onRemovePiece?: (piece: OutfitPiece) => void;
  compact?: boolean;
  hideMeta?: boolean;
  vtonHeroUri?: string | null;
};

function isVisibleWorn(piece: OutfitPiece): boolean {
  const id = catalogIdFromPieceId(piece.id);
  if (piece.category === 'Underwear' || id === 'p-underwear') return false;
  if (piece.category === 'Socks' || id === 'p-socks') return false;
  return true;
}

/**
 * אווטאר — כפתור שקוף להגדלה + סיבוב 180°.
 */
export function DressableFigure({
  profile,
  layers,
  onRemovePiece,
  compact = false,
  hideMeta = false,
  vtonHeroUri = null,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const wScale = buildWidthScale(profile.build);
  const hScale = heightScale(profile.heightCm, profile.persona);
  const personaLabel =
    PERSONA_OPTIONS.find((p) => p.id === profile.persona)?.label ?? '';

  const baseW = compact ? 172 : 208;
  const baseH = compact ? 310 : 372;
  const dollW = baseW * Math.min(1.22, Math.max(0.78, wScale));
  const dollH = Math.round(baseH * hScale);

  const worn = [
    layers.dress,
    layers.top,
    layers.bottom,
    layers.outer,
    layers.shoes,
    layers.hat,
  ]
    .filter(Boolean)
    .filter((p) => isVisibleWorn(p!)) as OutfitPiece[];

  return (
    <View className="items-start">
      <View style={{ width: Math.max(dollW + 16, 120), paddingVertical: 4 }}>
        <Text
          className={`mb-1.5 text-left ${
            hideMeta
              ? 'font-bodyMedium text-[11px] text-ink-muted'
              : 'font-display text-sm text-ink'
          }`}
        >
          {personaLabel} · {formatHeightMeters(profile.heightCm)}
          {!hideMeta ? ` (${profile.heightCm} ס״מ)` : ''}
        </Text>

        <View style={{ width: dollW, height: dollH, alignSelf: 'flex-start' }}>
          <LinearGradient
            colors={['#FFFBF5', '#F3EBE0', '#E8DFD4']}
            start={{ x: 0.15, y: 0 }}
            end={{ x: 0.85, y: 1 }}
            style={{
              width: dollW,
              height: dollH,
              borderRadius: 22,
              overflow: 'hidden',
              borderWidth: 1,
              borderColor: 'rgba(40,30,20,0.06)',
            }}
          >
            <GameFashionAvatar
              key={`avatar-${profile.persona}-${profile.heightCm}-${profile.build}-${vtonHeroUri ? 'vton' : 'fit'}`}
              profile={profile}
              layers={layers}
              width={dollW}
              height={dollH}
              vtonHeroUri={vtonHeroUri}
            />
          </LinearGradient>

          {/* כפתור שקוף על הדמות — הגדלת מסך + סיבוב */}
          <Pressable
            onPress={() => setExpanded(true)}
            accessibilityLabel={he.expandAvatar}
            hitSlop={8}
            style={{
              position: 'absolute',
              top: 8,
              left: 8,
              width: 36,
              height: 36,
              borderRadius: 18,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(255,255,255,0.38)',
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.55)',
            }}
          >
            <Ionicons name="expand-outline" size={18} color="rgba(20,18,16,0.75)" />
          </Pressable>
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
          {he.readyToDress}
        </Text>
      )}

      <AvatarExpandModal
        visible={expanded}
        onClose={() => setExpanded(false)}
        profile={profile}
        layers={layers}
        vtonHeroUri={vtonHeroUri}
      />
    </View>
  );
}
