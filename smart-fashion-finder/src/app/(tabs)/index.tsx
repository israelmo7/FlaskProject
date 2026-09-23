import { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  GenderPills,
  ProductGrid,
  StyleBanner,
} from '@/components/DiscoverySection';
import { HeroAvatarSection } from '@/components/HeroAvatarSection';
import { SiteHeader } from '@/components/SiteHeader';
import { DEFAULT_FILTERS } from '@/constants/filters';
import type { ProductCard, ShopGender } from '@/data/catalog';
import { useGarmentRecognition } from '@/hooks/useGarmentRecognition';
import { he } from '@/i18n/he';
import type { GarmentAnalysis, SearchFilters } from '@/types';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [shopGender, setShopGender] = useState<ShopGender>('women');
  const [filters] = useState<SearchFilters>(DEFAULT_FILTERS);
  const { analyzeImage, isAnalyzing } = useGarmentRecognition();

  const buildPantsAnalysis = async (
    color = 'Blue',
    subcategory = 'Slim Fit Jeans',
  ): Promise<GarmentAnalysis> => {
    const result = await analyzeImage('', 'avatar', {
      category: 'Pants',
      color,
      gender: shopGender === 'men' ? 'Men' : 'Women',
    });
    return {
      ...result,
      category: 'Pants',
      color,
      subcategory,
      gender: shopGender === 'men' ? 'Men' : 'Women',
      imageUri: undefined,
    };
  };

  const goToStores = async (analysis?: GarmentAnalysis) => {
    const payload = analysis ?? (await buildPantsAnalysis());
    router.push({
      pathname: '/stores',
      params: {
        payload: JSON.stringify(payload),
        distanceKm: String(filters.distanceKm),
        gender: payload.gender,
        preferredSize: filters.preferredSize,
      },
    });
  };

  const onProductSelect = async (product: ProductCard) => {
    const result = await analyzeImage('', 'avatar', {
      category: product.category === 'Dresses' ? 'Outerwear' : product.category,
      color: product.color,
      gender: shopGender === 'men' ? 'Men' : 'Women',
    });
    const analysis: GarmentAnalysis = {
      ...result,
      category: product.category === 'Dresses' ? 'Outerwear' : product.category,
      color: product.color,
      subcategory: product.subcategory,
      gender: shopGender === 'men' ? 'Men' : 'Women',
      imageUri: undefined,
      estimatedPriceMin: product.price ? Math.round(product.price * 0.85) : result.estimatedPriceMin,
      estimatedPriceMax: product.price ?? result.estimatedPriceMax,
    };
    router.push({
      pathname: '/analysis',
      params: {
        payload: JSON.stringify(analysis),
        distanceKm: String(filters.distanceKm),
        gender: analysis.gender,
        preferredSize: filters.preferredSize,
      },
    });
  };

  const onSearchSubmit = async () => {
    if (!query.trim()) return;
    await goToStores(await buildPantsAnalysis(query.trim(), 'Search Match'));
  };

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      <SiteHeader
        query={query}
        onQueryChange={setQuery}
        onSearchSubmit={onSearchSubmit}
        onCart={() => Alert.alert(he.cart, 'עגלת הקניות תתווסף בגרסה הבאה.')}
        onProfile={() => Alert.alert(he.profile, 'פרופיל משתמש יתווסף בקרוב.')}
        onArea={() => Alert.alert(he.area, he.pilotBadge)}
        onNav={(key) => {
          if (key === 'collections') {
            // גלילה ויזואלית — כבר במסך
          }
        }}
      />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <HeroAvatarSection
          onFindNearMe={() => goToStores()}
          onAvatarPress={() => router.push('/avatar')}
        />

        <GenderPills selected={shopGender} onSelect={setShopGender} />

        <StyleBanner />

        <View className="mt-2 flex-row items-center justify-between px-4">
          <Pressable
            disabled={isAnalyzing}
            onPress={() => goToStores()}
            className="rounded-full bg-ink px-4 py-2"
          >
            <Text className="font-bodyBold text-sm text-white">{he.findNearMe}</Text>
          </Pressable>
          <Text className="font-bodyMedium text-sm text-ink-muted">
            {he.discoverStyle}
          </Text>
        </View>

        <ProductGrid onSelect={onProductSelect} />
      </ScrollView>
    </View>
  );
}
