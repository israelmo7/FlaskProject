import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BrandCircles, ProductGrid, StyleBanner } from '@/components/DiscoverySection';
import { CategoryDrawer } from '@/components/CategoryDrawer';
import { HeroAvatarSection } from '@/components/HeroAvatarSection';
import { SiteHeader } from '@/components/SiteHeader';
import {
  categoryToSlot,
  personaToGenderFilter,
  removeSlot,
  wearPiece,
} from '@/constants/avatar';
import { DEFAULT_FILTERS } from '@/constants/filters';
import { areaLabelForId, type ProductCard } from '@/data/catalog';
import { useGarmentRecognition } from '@/hooks/useGarmentRecognition';
import { useSavedProfile } from '@/hooks/useSavedProfile';
import { he } from '@/i18n/he';
import type {
  GarmentAnalysis,
  GarmentCategory,
  LocationSearchMode,
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
    onboardingComplete,
    updateLayers,
    updatePreferredSize,
    reload,
  } = useSavedProfile();
  const { pickFromLibrary, snapWithCamera, isAnalyzing } = useGarmentRecognition();

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  useEffect(() => {
    if (ready && !onboardingComplete) {
      router.replace('/onboarding');
    }
  }, [ready, onboardingComplete]);

  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState<GarmentCategory | null>(null);
  const [filterSub, setFilterSub] = useState<string | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [locationMode, setLocationMode] = useState<LocationSearchMode>('nearby');
  const [listening, setListening] = useState(false);
  const [filters] = useState<SearchFilters>(DEFAULT_FILTERS);

  const focusPiece = useMemo(
    () => layers.top || layers.bottom || layers.dress || layers.outer || layers.shoes,
    [layers],
  );

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
    const size = preferredSize || 'M';
    dressPiece({
      id: product.layerId
        ? `${product.layerId}-${size}`
        : `home-${product.id}-${size}`,
      label: product.title,
      category: product.category,
      subcategory: product.subcategory,
      color: product.color,
      size,
      slot: categoryToSlot(product.category),
    });
  };

  const onSearchSubmit = () => {
    if (!query.trim()) return;
    dressPiece({
      id: `search-${query}-${preferredSize || 'M'}`,
      label: query.trim(),
      category: filterCategory || 'Pants',
      subcategory: filterSub || 'Search',
      color: 'Blue',
      size: preferredSize || 'M',
      slot: categoryToSlot(filterCategory || 'Pants'),
    });
  };

  const goToTag = async (source: 'upload' | 'camera') => {
    if (isAnalyzing) return;
    const uri =
      source === 'camera' ? await snapWithCamera() : await pickFromLibrary();
    if (!uri) return;
    router.push({
      pathname: '/tag',
      params: {
        imageUri: uri,
        source,
        preferredSize: preferredSize || 'M',
      },
    });
  };

  const onVoiceSearch = () => {
    if (Platform.OS !== 'web') {
      Alert.alert(he.voiceSearch, he.voiceUnsupported);
      return;
    }
    const w = globalThis as unknown as {
      SpeechRecognition?: new () => SpeechRec;
      webkitSpeechRecognition?: new () => SpeechRec;
    };
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) {
      Alert.alert(he.voiceSearch, he.voiceUnsupported);
      return;
    }
    const rec = new SR();
    rec.lang = 'he-IL';
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    setListening(true);
    rec.onresult = (event: {
      results: { [i: number]: { [j: number]: { transcript: string } } };
    }) => {
      const text = event.results[0]?.[0]?.transcript ?? '';
      if (text) setQuery(text);
      setListening(false);
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    rec.start();
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
        onTheWay: locationMode === 'onTheWay' ? '1' : '0',
      },
    });
  };

  const openProfile = () => router.push('/onboarding');

  if (!ready || !onboardingComplete) {
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
        onProfile={openProfile}
        onArea={() => router.push('/area')}
        onMenu={() => setMenuOpen(true)}
        onCamera={() => void goToTag('camera')}
        onGallery={() => void goToTag('upload')}
        areaLabel={areaLabelForId(areaId)}
        cartCount={countLayers(layers)}
        locationMode={locationMode}
        onLocationModeChange={setLocationMode}
        onVoiceSearch={onVoiceSearch}
        listening={listening}
      />

      <CategoryDrawer
        visible={menuOpen}
        selectedCategory={filterCategory}
        selectedSub={filterSub}
        onSelect={(category, subcategory) => {
          setFilterCategory(category);
          setFilterSub(subcategory);
        }}
        onClose={() => setMenuOpen(false)}
      />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <HeroAvatarSection
          profile={profile}
          layers={layers}
          onRemovePiece={(piece) =>
            setLayers((prev) => removeSlot(prev, piece.slot))
          }
          onFindNearMe={goToStores}
          onEditAvatar={openProfile}
        />

        <Text className="mt-3 px-4 text-right font-body text-xs text-ink-muted">
          {he.myPreferredSize}: {preferredSize}
          {locationMode === 'onTheWay' ? ` · ${he.locOnTheWay}` : ''}
        </Text>

        <BrandCircles
          selectedId={selectedBrand}
          onSelect={(id) =>
            setSelectedBrand((prev) => (prev === id ? null : id))
          }
        />

        <StyleBanner />

        <View className="mt-3 flex-row items-center justify-between px-4">
          <Pressable
            onPress={goToStores}
            className="rounded-full bg-ink px-4 py-2"
          >
            <Text className="font-bodyBold text-sm text-white">{he.findNearMe}</Text>
          </Pressable>
          <Text className="font-bodyMedium text-sm text-ink-muted">
            {filterSub
              ? `קטגוריה: ${filterSub}`
              : 'בחרו קטגוריה מהתפריט או מוצר להלבשה'}
          </Text>
        </View>

        <ProductGrid
          onSelect={onProductSelect}
          category={filterCategory}
          subcategory={filterSub}
        />
      </ScrollView>
    </View>
  );
}

type SpeechRec = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult:
    | ((event: {
        results: { [i: number]: { [j: number]: { transcript: string } } };
      }) => void)
    | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
};
