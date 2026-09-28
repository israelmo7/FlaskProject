import { Alert, Pressable, Text, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { DressableFigure } from '@/components/DressableFigure';
import { he } from '@/i18n/he';
import type { AvatarProfile, OutfitLayers, OutfitPiece } from '@/types';

type Props = {
  profile: AvatarProfile;
  layers: OutfitLayers;
  onRemovePiece?: (piece: OutfitPiece) => void;
  onFindNearMe?: () => void;
  onSaveLook?: () => number;
  vtonHeroUri?: string | null;
  vtonStatus?: string | null;
};

/** גיבור בית — במה לבובה + פעולות */
export function HeroAvatarSection({
  profile,
  layers,
  onRemovePiece,
  onFindNearMe,
  onSaveLook,
  vtonHeroUri = null,
  vtonStatus = null,
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
    <LinearGradient
      colors={['#F7F1E8', '#EFE6DA', '#E8DFD2']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        marginHorizontal: 12,
        marginTop: 12,
        borderRadius: 24,
        paddingHorizontal: 14,
        paddingTop: 14,
        paddingBottom: 16,
        overflow: 'hidden',
      }}
    >
      <Text className="mb-2 text-right font-bodyMedium text-[11px] text-ink-muted">
        {he.homeDressHint}
      </Text>
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
          vtonHeroUri={vtonHeroUri}
        />

        <View
          style={{
            flex: 1,
            marginLeft: 12,
            marginBottom: 40,
            gap: 10,
            alignItems: 'flex-start',
          }}
        >
          <Pressable
            onPress={onSave}
            className="rounded-2xl bg-ink px-6 py-3.5"
            style={{ minWidth: 148 }}
          >
            <Text className="text-center font-bodyBold text-[15px] text-white">
              {he.saveLook}
            </Text>
          </Pressable>
          <Pressable
            onPress={onFindNearMe}
            className="rounded-2xl bg-[#E07A4F] px-6 py-3.5"
            style={{ minWidth: 148 }}
          >
            <Text className="text-center font-bodyBold text-[15px] text-white">
              {he.findNearMe}
            </Text>
          </Pressable>
          {vtonStatus ? (
            <Text className="mt-1 max-w-[160px] text-left font-body text-[10px] text-ink-muted">
              {vtonStatus}
            </Text>
          ) : null}
        </View>
      </View>
    </LinearGradient>
  );
}
