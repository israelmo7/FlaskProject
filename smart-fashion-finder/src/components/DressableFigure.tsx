import { Pressable, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  PERSONA_OPTIONS,
  buildWidthScale,
  garmentColorHex,
  heightScale,
} from '@/constants/avatar';
import { GameFashionAvatar } from '@/components/GameFashionAvatar';
import { he } from '@/i18n/he';
import type { AvatarProfile, OutfitLayers, OutfitPiece } from '@/types';

type Props = {
  profile: AvatarProfile;
  layers: OutfitLayers;
  onRemovePiece?: (piece: OutfitPiece) => void;
  compact?: boolean;
  /** הסתרת תווית גובה בדף הבית */
  hideMeta?: boolean;
};

/**
 * אווטאר משחק אופנה — דמות מעוצבת + בגדים לפי אזורי גוף ומידה.
 */
export function DressableFigure({
  profile,
  layers,
  onRemovePiece,
  compact = false,
  hideMeta = false,
}: Props) {
  const wScale = buildWidthScale(profile.build);
  const hScale = heightScale(profile.heightCm, profile.persona);
  const personaLabel =
    PERSONA_OPTIONS.find((p) => p.id === profile.persona)?.label ?? '';

  const baseW = compact ? 168 : 200;
  const baseH = compact ? 320 : 380;
  const dollW = baseW * Math.min(1.2, Math.max(0.82, wScale));
  const dollH = baseH * hScale;

  const worn = [layers.dress, layers.top, layers.bottom, layers.outer, layers.shoes].filter(
    Boolean,
  ) as OutfitPiece[];

  return (
    <View className="items-start">
      <View style={{ width: dollW + 16, paddingVertical: 4 }}>
        {!hideMeta ? (
          <Text className="mb-1.5 text-left font-display text-sm text-ink">
            {personaLabel} · {profile.heightCm} ס״מ
          </Text>
        ) : null}

        <LinearGradient
          colors={['#F7F1E8', '#EDE4D6', '#E6DCCE']}
          start={{ x: 0.2, y: 0 }}
          end={{ x: 0.8, y: 1 }}
          style={{
            width: dollW,
            height: dollH,
            borderRadius: 20,
            overflow: 'hidden',
            alignSelf: 'flex-start',
          }}
        >
          <GameFashionAvatar
            profile={profile}
            layers={layers}
            width={dollW}
            height={dollH}
          />
        </LinearGradient>
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
    </View>
  );
}
