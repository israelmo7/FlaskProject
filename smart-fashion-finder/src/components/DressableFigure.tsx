import { Pressable, Text, View } from 'react-native';
import {
  PERSONA_OPTIONS,
  buildWidthScale,
  garmentColorHex,
  heightScale,
} from '@/constants/avatar';
import { GameFashionAvatar } from '@/components/GameFashionAvatar';
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

  const baseW = compact ? 156 : 188;
  const baseH = compact ? 300 : 360;
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

        <View
          className="self-start overflow-visible rounded-2xl"
          style={{
            width: dollW,
            height: dollH,
            backgroundColor: '#F3EEE6',
          }}
        >
          <GameFashionAvatar
            profile={profile}
            layers={layers}
            width={dollW}
            height={dollH}
          />
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
          מוכן להלבשה
        </Text>
      )}
    </View>
  );
}
