import { Pressable, ScrollView, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { GarmentOverlay } from '@/components/GarmentOverlay';
import type { GarmentAnalysis } from '@/types';

export default function AnalysisScreen() {
  const params = useLocalSearchParams<{
    payload?: string;
    distanceKm?: string;
    gender?: string;
  }>();

  let analysis: GarmentAnalysis | null = null;
  try {
    analysis = params.payload ? (JSON.parse(params.payload) as GarmentAnalysis) : null;
  } catch {
    analysis = null;
  }

  if (!analysis) {
    return (
      <View className="flex-1 items-center justify-center bg-stone px-6">
        <Text className="font-display text-2xl text-ink">No analysis yet</Text>
        <Text className="mt-2 text-center font-body text-ink-muted">
          Upload a photo or style an avatar to identify a garment.
        </Text>
        <Pressable
          onPress={() => router.back()}
          className="mt-6 rounded-xl bg-teal px-5 py-3"
        >
          <Text className="font-bodyBold text-stone-light">Go back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-stone" contentContainerClassName="px-5 py-5 pb-10">
      <GarmentOverlay analysis={analysis} />

      <Pressable
        onPress={() =>
          router.push({
            pathname: '/stores',
            params: {
              payload: JSON.stringify(analysis),
              distanceKm: params.distanceKm ?? '5',
              gender: params.gender ?? analysis.gender,
            },
          })
        }
        className="mt-8 items-center rounded-xl bg-coral py-4"
        accessibilityRole="button"
        accessibilityLabel="Find Near Me"
      >
        <Text className="font-bodyBold text-base text-white">Find Near Me</Text>
      </Pressable>
    </ScrollView>
  );
}
