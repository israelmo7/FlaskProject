import { useState } from 'react';
import { Alert, ScrollView, Text, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { FilterChips } from '@/components/FilterChips';
import { SearchOptions } from '@/components/SearchOptions';
import { RecentSearches, TrendingStyles } from '@/components/TrendingStyles';
import { BRAND_NAME, BRAND_TAGLINE, DEFAULT_FILTERS } from '@/constants/filters';
import { useGarmentRecognition } from '@/hooks/useGarmentRecognition';
import { he } from '@/i18n/he';
import type { GarmentAnalysis, RecentSearch, SearchFilters, TrendingStyle } from '@/types';

export default function HomeScreen() {
  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS);
  const [query, setQuery] = useState('');
  const { isAnalyzing, analyzeImage, pickFromLibrary, snapWithCamera } =
    useGarmentRecognition();

  const goToAnalysis = (analysis: GarmentAnalysis) => {
    router.push({
      pathname: '/analysis',
      params: {
        payload: JSON.stringify(analysis),
        distanceKm: String(filters.distanceKm),
        gender: filters.gender,
        preferredSize: filters.preferredSize,
      },
    });
  };

  const runRecognition = async (
    source: 'upload' | 'camera',
    getUri: () => Promise<string | null>,
  ) => {
    try {
      const uri = await getUri();
      if (!uri) return;
      const analysis = await analyzeImage(uri, source, {
        category: filters.category === 'All' ? 'Pants' : filters.category,
        gender: filters.gender === 'All' ? 'Unisex' : filters.gender,
      });
      goToAnalysis(analysis);
    } catch {
      Alert.alert(he.recognitionFailed, he.recognitionFailedHint);
    }
  };

  const fromRecent = async (search: RecentSearch) => {
    const analysis = await analyzeImage('', 'upload', {
      category: search.category,
      color: search.color,
    });
    goToAnalysis({
      ...analysis,
      imageUri: undefined,
      subcategory:
        search.category === 'Pants'
          ? 'Cargo Pants'
          : search.category === 'Shirts'
            ? 'Oxford Shirt'
            : 'Denim Jacket',
      color: search.color,
    });
  };

  const fromTrending = async (style: TrendingStyle) => {
    const analysis = await analyzeImage('', 'upload', {
      category: style.category,
      color: style.color,
    });
    goToAnalysis({
      ...analysis,
      imageUri: undefined,
      color: style.color,
      subcategory: analysis.subcategory,
    });
  };

  return (
    <ScrollView
      className="flex-1 bg-stone"
      contentContainerClassName="px-5 pb-8"
      keyboardShouldPersistTaps="handled"
    >
      <LinearGradient
        colors={['#154A45', '#1F6B63', '#2A313C']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          marginTop: 8,
          marginHorizontal: -20,
          paddingHorizontal: 20,
          paddingTop: 28,
          paddingBottom: 36,
        }}
      >
        <View className="mb-3 self-start rounded-md bg-white/15 px-2.5 py-1">
          <Text className="font-bodyMedium text-xs text-stone-light">
            {he.pilotBadge}
          </Text>
        </View>
        <Text className="text-right font-displayBold text-4xl text-stone-light">
          {BRAND_NAME}
        </Text>
        <Text className="mt-2 max-w-[300px] self-end text-right font-body text-base text-stone-dark">
          {BRAND_TAGLINE}
        </Text>
        <Text className="mt-3 max-w-[320px] self-end text-right font-body text-sm text-stone-dark/90">
          {he.valueProp}
        </Text>
      </LinearGradient>

      <View className="-mt-5 rounded-2xl bg-stone-light px-4 py-4 shadow-sm">
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={he.searchPlaceholder}
          placeholderTextColor="#5C6675"
          className="rounded-xl bg-stone px-4 py-3 text-right font-body text-base text-ink"
          returnKeyType="search"
          textAlign="right"
        />
        <View className="mt-4">
          <SearchOptions
            loading={isAnalyzing}
            onUpload={() => runRecognition('upload', pickFromLibrary)}
            onCamera={() => runRecognition('camera', snapWithCamera)}
            onAvatar={() => router.push('/avatar')}
          />
        </View>
      </View>

      <FilterChips filters={filters} onChange={setFilters} />
      <RecentSearches onSelect={fromRecent} />
      <TrendingStyles onSelect={fromTrending} />
    </ScrollView>
  );
}
