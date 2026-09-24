import { Pressable, Text, View, useWindowDimensions } from 'react-native';
import { DressableFigure } from '@/components/DressableFigure';
import { he } from '@/i18n/he';
import type { AvatarProfile, OutfitLayers, OutfitPiece } from '@/types';

type Props = {
  profile: AvatarProfile;
  layers: OutfitLayers;
  onRemovePiece?: (piece: OutfitPiece) => void;
  onFindNearMe?: () => void;
  onEditAvatar?: () => void;
};

/** גיבור בית — בובה משמאל בלי רקע ובלי בחירת גיל/מין (נקבע באונבורדינג) */
export function HeroAvatarSection({
  profile,
  layers,
  onRemovePiece,
  onFindNearMe,
  onEditAvatar,
}: Props) {
  const { width } = useWindowDimensions();
  const compact = width < 500;

  return (
    <View className="mx-4 mt-4 bg-white">
      <Text className="text-right font-display text-2xl text-ink">{he.heroTitle}</Text>
      <Text className="mt-1 text-right font-body text-xs text-ink-muted">
        {he.homeDressHint}
      </Text>

      <View
        className="mt-3 flex-row items-end"
        style={{ direction: 'ltr', justifyContent: 'flex-start' }}
      >
        <Pressable onPress={onEditAvatar} className="items-start">
          <DressableFigure
            compact={compact}
            profile={profile}
            layers={layers}
            onRemovePiece={onRemovePiece}
          />
        </Pressable>

        <View className="mb-6 ml-3 flex-1 items-start gap-2 pb-2">
          <Pressable
            onPress={onEditAvatar}
            className="rounded-full border border-[#D5CFC6] px-4 py-2"
          >
            <Text className="font-bodyMedium text-sm text-ink">{he.editProfile}</Text>
          </Pressable>
          <Pressable
            onPress={onFindNearMe}
            className="rounded-full bg-[#E07A4F] px-4 py-2"
          >
            <Text className="font-bodyBold text-sm text-white">{he.findNearMe}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
