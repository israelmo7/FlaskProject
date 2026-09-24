import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  GenderPills,
  ProductGrid,
  StyleBanner,
} from '@/components/DiscoverySection';
import { HeroAvatarSection } from '@/components/HeroAvatarSection';
import { SiteHeader } from '@/components/SiteHeader';
import {
  HEIGHT_RANGE,
  categoryToSlot,
  personaToGenderFilter,
  removeSlot,
  wearPiece,
} from '@/constants/avatar';
import { DEFAULT_FILTERS } from '@/constants/filters';
import { areaLabelForId, type ProductCard, type ShopGender } from '@/data/catalog';
import { useSavedProfile } from '@/hooks/useSavedProfile';
import { he } from '@/i18n/he';
import type {
  AvatarPersona,
  GarmentAnalysis,
  OutfitLayers,
  OutfitPiece,
  SearchFilters,
} from '@/types';

function countLayers(layers: OutfitLayers): number {
  return [layers.dress, layers.top, layers.bottom, layers.outer, layers.shoes].filter(
    Boolean,
  ).length;
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const {
    ready,
    profile,
    preferredSize,
    layers,
    areaId,
    updateProfile,
    updateLayers,
    updatePreferredSize,
    reload,
  } = useSavedProfile();

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  const [query, setQuery] = useState('');
  const [shopGender, setShopGender] = useState<ShopGender>('sale');
  const [filters] = useState<SearchFilters>(DEFAULT_FILTERS);

  const focusPiece = useMemo(
    () => layers.top || layers.bottom || layers.dress || layers.outer || layers.shoes,
    [layers],
  );

  const setPersona = (persona: AvatarPersona) => {
    const range = HEIGHT_RANGE[persona];
    updateProfile({ ...profile, persona, heightCm: range.default });
  };

  const setLayers = (updater: (prev: OutfitLayers) => OutfitLayers) => {
    updateLayers(updater(layers));
  };

  const dressPiece = (piece: Omit<OutfitPiece, 'id'> & { id?: string }) => {
    const size = piece.size || preferredSize || 'M';
    const full: OutfitPiece = {
      ...piece,
      size,
      id: piece.id ?? `${piece.category}-${size}-${Date.now()}`,
    };
    setLayers((prev) => wearPiece(prev, full));
  };

  const onProductSelect = (product: ProductCard) => {
    dressPiece({
      id: `home-${product.id}-${preferredSize || 'M'}`,
      label: product.title,
      category: product.category === 'Dresses' ? 'Dresses' : product.category,
      subcategory: product.subcategory,
      color: product.color,
      size: preferredSize || 'M',
      slot: categoryToSlot(
        product.category === 'Dresses' ? 'Dresses' : product.category,
      ),
    });
  };

  const onSearchSubmit = () => {
    if (!query.trim()) return;
    dressPiece({
      id: `search-${query}-${preferredSize || 'M'}`,
      label: query.trim(),
      category: 'Pants',
      subcategory: 'Search',
      color: 'Blue',
      size: preferredSize || 'M',
      slot: 'bottom',
    });
  };

  const goToStores = () => {
    if (!focusPiece) {
      Alert.alert(he.chooseGarmentAlert);
      return;
    }
    const size = focusPiece.size || preferredSize || 'M';
    updatePreferredSize(size);
    const analysis: GarmentAnalysis = {
      id: `home-${Date.now()}`,
      category: focusPiece.category,
      subcategory: focusPiece.subcategory,
      color: focusPiece.color,
      pattern: 'Solid',
      fit: 'Regular',
      gender: personaToGenderFilter(profile.persona),
      estimatedPriceMin: 120,
      estimatedPriceMax: 350,
      confidence: 0.9,
      boundingBoxes: [],
      source: 'avatar',
      size,
    };
    router.push({
      pathname: '/stores',
      params: {
        payload: JSON.stringify(analysis),
        distanceKm: String(filters.distanceKm),
        gender: analysis.gender,
        preferredSize: size,
      },
    });
  };

  if (!ready) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator color="#1F6B63" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      <SiteHeader
        query={query}
        onQueryChange={setQuery}
        onSearchSubmit={onSearchSubmit}
        onCart={() => router.push('/cart')}
        onProfile={() => router.push('/avatar')}
        onArea={() => router.push('/area')}
        areaLabel={areaLabelForId(areaId)}
        cartCount={countLayers(layers)}
      />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <HeroAvatarSection
          profile={profile}
          layers={layers}
          onPersonaChange={setPersona}
          onRemovePiece={(piece) =>
            setLayers((prev) => removeSlot(prev, piece.slot))
          }
          onFindNearMe={goToStores}
          onEditAvatar={() => router.push('/avatar')}
        />

        <Text className="mt-3 px-4 text-right font-body text-xs text-ink-muted">
          {he.myPreferredSize}: {preferredSize}
        </Text>

        <GenderPills selected={shopGender} onSelect={setShopGender} />

        <StyleBanner />

        <View className="mt-2 flex-row items-center justify-between px-4">
          <Pressable
            onPress={goToStores}
            className="rounded-full bg-ink px-4 py-2"
          >
            <Text className="font-bodyBold text-sm text-white">{he.findNearMe}</Text>
          </Pressable>
          <Text className="font-bodyMedium text-sm text-ink-muted">
            לחצו על מוצר כדי להלביש את הבובה
          </Text>
        </View>

        <ProductGrid onSelect={onProductSelect} />
      </ScrollView>
    </View>
  );
}
