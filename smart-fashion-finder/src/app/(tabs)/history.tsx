import { ScrollView, Text, View } from 'react-native';
import { RecentSearches } from '@/components/TrendingStyles';
import { router } from 'expo-router';
import { useGarmentRecognition } from '@/hooks/useGarmentRecognition';
import { he } from '@/i18n/he';
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
        preferredSize: 'All',
      },
    });
  };

  return (
    <ScrollView className="flex-1 bg-stone" contentContainerClassName="px-5 py-5">
      <Text className="text-right font-display text-3xl text-ink">{he.historyTitle}</Text>
      <Text className="mt-2 text-right font-body text-base text-ink-muted">
        {he.historyHint}
      </Text>
      <View className="mt-2">
        <RecentSearches onSelect={onSelect} />
      </View>
    </ScrollView>
  );
}
