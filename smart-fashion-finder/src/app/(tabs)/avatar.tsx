import { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { AvatarPreview } from '@/components/AvatarPreview';
import { useGarmentRecognition } from '@/hooks/useGarmentRecognition';
import { he } from '@/i18n/he';
import type { BodyType, GarmentAnalysis, GarmentCategory } from '@/types';

const PRESET_GARMENTS: {
  label: string;
  category: GarmentCategory;
  color: string;
}[] = [
  { label: 'קרגו זית', category: 'Pants', color: 'Olive Green' },
  { label: 'אוקספורד לבן', category: 'Shirts', color: 'White' },
  { label: 'ג׳קט ג׳ינס', category: 'Outerwear', color: 'Light Wash' },
];

export default function AvatarScreen() {
  const [bodyType, setBodyType] = useState<BodyType>('regular');
  const [garment, setGarment] = useState<GarmentAnalysis | null>(null);
  const { analyzeImage, isAnalyzing } = useGarmentRecognition();

  const applyPreset = async (preset: (typeof PRESET_GARMENTS)[number]) => {
    const result = await analyzeImage('', 'avatar', {
      category: preset.category,
      color: preset.color,
    });
    setGarment({ ...result, color: preset.color, imageUri: undefined });
  };

  const findNearMe = () => {
    if (!garment) {
      Alert.alert(he.chooseGarmentAlert);
      return;
    }
    router.push({
      pathname: '/stores',
      params: {
        payload: JSON.stringify(garment),
        distanceKm: '5',
        gender: garment.gender,
        preferredSize: 'M',
      },
    });
  };

  return (
    <ScrollView className="flex-1 bg-stone" contentContainerClassName="px-5 py-5">
      <Text className="text-right font-display text-3xl text-ink">{he.avatarTitle}</Text>
      <Text className="mt-2 text-right font-body text-base text-ink-muted">
        {he.avatarHint}
      </Text>

      <View className="mt-6">
        <AvatarPreview
          bodyType={bodyType}
          onBodyTypeChange={setBodyType}
          garment={garment}
        />
      </View>

      <Text className="mb-3 mt-8 text-right font-bodyMedium text-xs text-ink-muted">
        {he.overlayGarment}
      </Text>
      <View className="flex-row flex-wrap justify-end">
        {PRESET_GARMENTS.map((preset) => (
          <Pressable
            key={preset.label}
            disabled={isAnalyzing}
            onPress={() => applyPreset(preset)}
            className="mb-2 ml-2 rounded-md bg-ink px-3 py-2"
          >
            <Text className="font-bodyMedium text-sm text-stone-light">
              {preset.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <Pressable
        onPress={findNearMe}
        className="mt-8 items-center rounded-xl bg-coral py-4"
        accessibilityRole="button"
      >
        <Text className="font-bodyBold text-base text-white">{he.findNearMe}</Text>
      </Pressable>
    </ScrollView>
  );
}
