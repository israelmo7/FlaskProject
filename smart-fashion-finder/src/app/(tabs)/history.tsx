import { ScrollView, Text, View } from 'react-native';
import { RecentSearches } from '@/components/TrendingStyles';
import { router } from 'expo-router';
import { useGarmentRecognition } from '@/hooks/useGarmentRecognition';
import type { RecentSearch } from '@/types';

export default function HistoryScreen() {
  const { analyzeImage } = useGarmentRecognition();

  const onSelect = async (search: RecentSearch) => {
    const analysis = await analyzeImage('', 'upload', {
      category: search.category,
      color: search.color,
    });
    router.push({
      pathname: '/analysis',
      params: {
        payload: JSON.stringify({
          ...analysis,
          color: search.color,
          imageUri: undefined,
        }),
        distanceKm: '5',
        gender: 'All',
      },
    });
  };

  return (
    <ScrollView className="flex-1 bg-stone" contentContainerClassName="px-5 py-5">
      <Text className="font-display text-3xl text-ink">Search history</Text>
      <Text className="mt-2 font-body text-base text-ink-muted">
        Jump back into a previous look and locate fresh stock nearby.
      </Text>
      <View className="mt-2">
        <RecentSearches onSelect={onSelect} />
      </View>
    </ScrollView>
  );
}
