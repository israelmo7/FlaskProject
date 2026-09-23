import { useMemo, useState } from 'react';
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
import {
  DEFAULT_AVATAR_PROFILE,
  HEIGHT_RANGE,
  categoryToSlot,
  personaToGenderFilter,
  removeSlot,
  wearPiece,
} from '@/constants/avatar';
import { DEFAULT_FILTERS } from '@/constants/filters';
import type { ProductCard, ShopGender } from '@/data/catalog';
import { he } from '@/i18n/he';
import type {
  AvatarPersona,
  AvatarProfile,
  GarmentAnalysis,
  OutfitLayers,
  OutfitPiece,
  SearchFilters,
} from '@/types';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [shopGender, setShopGender] = useState<ShopGender>('women');
  const [filters] = useState<SearchFilters>(DEFAULT_FILTERS);
  const [profile, setProfile] = useState<AvatarProfile>(DEFAULT_AVATAR_PROFILE);
  const [layers, setLayers] = useState<OutfitLayers>({});

  const focusPiece = useMemo(
    () => layers.top || layers.bottom || layers.dress || layers.outer || layers.shoes,
    [layers],
  );

  const setPersona = (persona: AvatarPersona) => {
    const range = HEIGHT_RANGE[persona];
    setProfile((p) => ({ ...p, persona, heightCm: range.default }));
  };

  const onShopGender = (g: ShopGender) => {
    setShopGender(g);
    if (g === 'men') setPersona('man');
    if (g === 'women') setPersona('woman');
  };

  const dressPiece = (piece: Omit<OutfitPiece, 'id'> & { id?: string }) => {
    const full: OutfitPiece = {
      ...piece,
      id: piece.id ?? `${piece.category}-${piece.size}-${Date.now()}`,
    };
    setLayers((prev) => wearPiece(prev, full));
  };

  const onProductSelect = (product: ProductCard) => {
    dressPiece({
      id: `home-${product.id}-M`,
      label: product.title,
      category: product.category === 'Dresses' ? 'Dresses' : product.category,
      subcategory: product.subcategory,
      color: product.color,
      size: 'M',
      slot: categoryToSlot(
        product.category === 'Dresses' ? 'Dresses' : product.category,
      ),
    });
  };

  const onQuickDenim = () => {
    dressPiece({
      id: 'w-blue-jeans-M',
      label: 'ג׳ינס כחול',
      category: 'Pants',
      subcategory: 'Slim Fit Jeans',
      color: 'Blue',
      size: 'M',
      slot: 'bottom',
    });
  };

  const goToStores = () => {
    if (!focusPiece) {
      Alert.alert(he.chooseGarmentAlert);
      return;
    }
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
      size: focusPiece.size,
    };
    router.push({
      pathname: '/stores',
      params: {
        payload: JSON.stringify(analysis),
        distanceKm: String(filters.distanceKm),
        gender: analysis.gender,
        preferredSize: focusPiece.size,
      },
    });
  };

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      <SiteHeader
        query={query}
        onQueryChange={setQuery}
        onSearchSubmit={() => {
          if (query.trim()) onQuickDenim();
        }}
        onCart={() => Alert.alert(he.cart, 'עגלת הקניות תתווסף בגרסה הבאה.')}
        onProfile={() => Alert.alert(he.profile, 'פרופיל משתמש יתווסף בקרוב.')}
        onArea={() => Alert.alert(he.area, he.pilotBadge)}
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
          onQuickDenim={onQuickDenim}
        />

        <GenderPills selected={shopGender} onSelect={onShopGender} />

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
