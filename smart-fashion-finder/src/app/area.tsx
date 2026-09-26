import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { PILOT_AREAS } from '@/constants/areas';
import { useSavedProfile } from '@/hooks/useSavedProfile';
import { he } from '@/i18n/he';

export default function AreaScreen() {
  const { ready, areaId, updateAreaId } = useSavedProfile();

  if (!ready) {
    return (
      <View className="flex-1 items-center justify-center bg-stone-light">
        <ActivityIndicator color="#1F6B63" />
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-stone-light"
      contentContainerClassName="px-4 pb-10 pt-4"
    >
      <Text className="mb-1 text-right font-display text-2xl text-ink">
        {he.areaTitle}
      </Text>
      <Text className="mb-5 text-right font-body text-sm text-ink-muted">
        {he.areaHint}
      </Text>

      {PILOT_AREAS.map((area) => {
        const active = areaId === area.id;
        return (
          <Pressable
            key={area.id}
            onPress={() => {
              updateAreaId(area.id);
              router.back();
            }}
            className={`mb-3 flex-row items-center justify-between rounded-2xl border px-4 py-4 ${
              active
                ? 'border-[#E07A4F] bg-[#E07A4F]/10'
                : 'border-[#E8E4DE] bg-white'
            }`}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
          >
            <Ionicons
              name={active ? 'checkmark-circle' : 'location-outline'}
              size={24}
              color={active ? '#E07A4F' : '#6B6560'}
            />
            <View className="flex-1 items-end pr-3">
              <Text
                className={`font-bodyBold text-base ${
                  active ? 'text-[#E07A4F]' : 'text-ink'
                }`}
              >
                {area.label}
              </Text>
              <Text className="mt-0.5 font-body text-sm text-ink-muted">
                {area.subtitle}
              </Text>
            </View>
          </Pressable>
        );
      })}

      <Text className="mt-4 text-center font-body text-xs text-ink-muted">
        {he.pilotBadge}
      </Text>
    </ScrollView>
  );
}
