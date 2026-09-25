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

/** גיבור בית — בובה גדולה משמאל + שמירת לוק / מצא לידך מימינה */
export function HeroAvatarSection({
  profile,
  layers,
  onRemovePiece,
  onFindNearMe,
  onSaveLook,
}: Props) {
  const { width } = useWindowDimensions();
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
    <View className="mx-3 mt-3 rounded-2xl bg-[#FAF8F5] px-3 pb-4 pt-3">
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-end',
          justifyContent: 'flex-start',
          direction: 'ltr',
        }}
      >
        <DressableFigure
          compact={compact}
          profile={profile}
          layers={layers}
          onRemovePiece={onRemovePiece}
          hideMeta
        />

        <View
          style={{
            flex: 1,
            marginLeft: 12,
            marginBottom: 48,
            gap: 10,
            alignItems: 'flex-start',
          }}
        >
          <Pressable
            onPress={onSave}
            className="rounded-2xl bg-ink px-6 py-3.5 shadow-sm"
            style={{ minWidth: 148 }}
          >
            <Text className="text-center font-bodyBold text-[15px] text-white">
              {he.saveLook}
            </Text>
          </Pressable>
          <Pressable
            onPress={onFindNearMe}
            className="rounded-2xl bg-[#E07A4F] px-6 py-3.5 shadow-sm"
            style={{ minWidth: 148 }}
          >
            <Text className="text-center font-bodyBold text-[15px] text-white">
              {he.findNearMe}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
