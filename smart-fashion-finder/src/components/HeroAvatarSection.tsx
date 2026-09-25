import { Alert, Pressable, Text, View, useWindowDimensions } from 'react-native';
import { DressableFigure } from '@/components/DressableFigure';
import { he } from '@/i18n/he';
import type { AvatarProfile, OutfitLayers, OutfitPiece } from '@/types';

type Props = {
  profile: AvatarProfile;
  layers: OutfitLayers;
  onRemovePiece?: (piece: OutfitPiece) => void;
  onFindNearMe?: () => void;
  onSaveLook?: () => number;
};

/** גיבור בית — בובה גדולה משמאל + שמירת לוק / מצא לידך */
export function HeroAvatarSection({
  profile,
  layers,
  onRemovePiece,
  onFindNearMe,
  onSaveLook,
}: Props) {
  const { width } = useWindowDimensions();
  // בובה גדולה גם במובייל — רק במסכים צרים מאוד מצמצמים
  const compact = width < 360;

  const onSave = () => {
    if (!onSaveLook) return;
    const count = onSaveLook();
    if (count === 0) {
      Alert.alert(he.saveLookEmpty);
      return;
    }
    Alert.alert(he.saveLookDone, he.saveLookDoneHint.replace('{n}', String(count)));
  };

  return (
    <View className="mx-4 mt-3 bg-white">
      <View
        className="flex-row items-end"
        style={{ direction: 'ltr', justifyContent: 'flex-start' }}
      >
        <View className="items-start">
          <DressableFigure
            compact={compact}
            profile={profile}
            layers={layers}
            onRemovePiece={onRemovePiece}
          />
        </View>

        <View className="mb-8 ml-3 flex-1 items-start gap-2.5 pb-2">
          <Pressable
            onPress={onSave}
            className="rounded-full bg-ink px-5 py-3 shadow-sm"
          >
            <Text className="font-bodyBold text-sm text-white">{he.saveLook}</Text>
          </Pressable>
          <Pressable
            onPress={onFindNearMe}
            className="rounded-full bg-[#E07A4F] px-5 py-3 shadow-sm"
          >
            <Text className="font-bodyBold text-sm text-white">{he.findNearMe}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
