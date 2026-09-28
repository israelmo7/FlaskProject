import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BrandCircles, ProductGrid } from '@/components/DiscoverySection';
import { CategoryDrawer } from '@/components/CategoryDrawer';
import { HeroAvatarSection } from '@/components/HeroAvatarSection';
import { ProductDetailSheet } from '@/components/ProductDetailSheet';
import { SiteHeader } from '@/components/SiteHeader';
import {
  categoryToSlot,
  personaToGenderFilter,
  removeSlot,
  wearPiece,
} from '@/constants/avatar';
import { catalogIdFromPieceId } from '@/constants/avatarAssets';
import { DEFAULT_FILTERS } from '@/constants/filters';
import { PRODUCTS, areaLabelForId, type ProductCard } from '@/data/catalog';
import { useGarmentRecognition } from '@/hooks/useGarmentRecognition';
import { useSavedProfile } from '@/hooks/useSavedProfile';
import { he } from '@/i18n/he';
import { isVtonPocGarment, requestVtonTryOn } from '@/services/vton';
import type {
  GarmentAnalysis,
  GarmentCategory,
  LocationSearchMode,
  OutfitLayers,
  OutfitPiece,
  SearchFilters,
} from '@/types';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ openProductId?: string }>();
  const {
    ready,
    profile,
    preferredSize,
    layers,
    cart,
    areaId,
    onboardingComplete,
    updateLayers,
    updatePreferredSize,
    saveLookToCart,
    addPieceToCart,
  } = useSavedProfile();
  const { pickFromLibrary, snapWithCamera, isAnalyzing } = useGarmentRecognition();

  useEffect(() => {
    if (ready && !onboardingComplete) {
      router.replace('/onboarding');
    }
  }, [ready, onboardingComplete]);

  const [query, setQuery] = useState('');
  const [committedQuery, setCommittedQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState<GarmentCategory | null>(null);
  const [filterSub, setFilterSub] = useState<string | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [locationMode, setLocationMode] = useState<LocationSearchMode>('nearby');
  const [listening, setListening] = useState(false);
  const [filters] = useState<SearchFilters>(DEFAULT_FILTERS);
  const [detailProduct, setDetailProduct] = useState<ProductCard | null>(null);
  const [vtonHeroUri, setVtonHeroUri] = useState<string | null>(null);
  const [vtonLoading, setVtonLoading] = useState(false);
  const [vtonStatus, setVtonStatus] = useState<string | null>(null);

  useEffect(() => {
    const id = typeof params.openProductId === 'string' ? params.openProductId : undefined;
    if (!id) return;
    const found = PRODUCTS.find((p) => p.id === id);
    if (found) {
      setDetailProduct(found);
      router.setParams({ openProductId: undefined });
    }
  }, [params.openProductId]);

  const focusPiece = useMemo(
    () =>
      layers.top ||
      layers.bottom ||
      layers.dress ||
      layers.outer ||
      layers.shoes ||
      layers.hat,
    [layers],
  );

  const setLayers = (updater: (prev: OutfitLayers) => OutfitLayers) => {
    updateLayers(updater);
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

  const productToPiece = (
    product: ProductCard,
    sizeOverride?: string,
  ): OutfitPiece => {
    const size = sizeOverride || preferredSize || 'M';
    return {
      // שומרים את מזהה הקטלוג ב־id כדי להתאים לוק מצויר
      id: `${product.id}-${size}`,
      label: product.title,
      category: product.category,
      subcategory: product.subcategory,
      color: product.color,
      size,
      slot: categoryToSlot(product.category),
      price: product.price,
    };
  };

  /** לחיצה על מוצר → פתיחת פרטים (לא הלבשה מיידית) */
  const onProductSelect = (product: ProductCard) => {
    setDetailProduct(product);
  };

  const onDressFromDetail = (product: ProductCard, size: string) => {
    updatePreferredSize(size);
    setVtonHeroUri(null);
    setVtonStatus(null);
    dressPiece(productToPiece(product, size));
  };

  const onAddToCartFromDetail = (product: ProductCard, size: string) => {
    updatePreferredSize(size);
    addPieceToCart(productToPiece(product, size));
    Alert.alert(he.addedToCart, `${product.title} · ${size}`);
  };

  const onVtonTryOn = async (product: ProductCard, size: string) => {
    if (!isVtonPocGarment(product.id)) return;
    updatePreferredSize(size);
    dressPiece(productToPiece(product, size));
    setVtonLoading(true);
    setVtonStatus(he.dressVtonLoading);
    try {
      const result = await requestVtonTryOn({
        persona: profile.persona,
        garmentId: product.id,
        category: 'upper_body',
        garmentDes: product.title,
        yaw: 0,
      });
      setVtonHeroUri(result.imageUrl);
      setVtonStatus(
        result.mode === 'live' ? he.dressVtonDoneLive : he.dressVtonDoneMock,
      );
    } catch (err) {
      setVtonHeroUri(null);
      setVtonStatus(null);
      Alert.alert(
        he.dressVtonFailed,
        err instanceof Error ? err.message : String(err),
      );
    } finally {
      setVtonLoading(false);
    }
  };

  const onSearchSubmit = () => {
    setCommittedQuery(query.trim());
    setFilterSub(null);
    // לא מאפסים קטגוריה אם כבר נבחרה מהתפריט — רק מעדכנים טקסט חיפוש
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
      if (text) {
        setQuery(text);
        setCommittedQuery(text.trim());
      }
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

  const onSaveLook = () => saveLookToCart();

  if (!ready || !onboardingComplete) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator color="#1F6B63" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#FAF7F2]" style={{ paddingTop: insets.top }}>
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
        onChat={() => router.push('/chat')}
        areaLabel={areaLabelForId(areaId)}
        cartCount={cart.length}
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

      <ProductDetailSheet
        product={detailProduct}
        visible={Boolean(detailProduct)}
        onClose={() => setDetailProduct(null)}
        onDressAvatar={onDressFromDetail}
        onAddToCart={onAddToCartFromDetail}
        onVtonTryOn={(p, s) => void onVtonTryOn(p, s)}
        vtonLoading={vtonLoading}
        preferredSize={preferredSize || 'M'}
      />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <HeroAvatarSection
          profile={profile}
          layers={layers}
          onRemovePiece={(piece) => {
            setLayers((prev) => removeSlot(prev, piece.slot));
            const id = catalogIdFromPieceId(piece.id);
            if (isVtonPocGarment(id)) {
              setVtonHeroUri(null);
              setVtonStatus(null);
            }
          }}
          onFindNearMe={goToStores}
          onSaveLook={onSaveLook}
          vtonHeroUri={vtonHeroUri}
          vtonStatus={vtonStatus}
        />

        <BrandCircles
          selectedId={selectedBrand}
          onSelect={(id) =>
            setSelectedBrand((prev) => (prev === id ? null : id))
          }
        />

        {filterSub ? (
          <View className="mt-2 flex-row items-center justify-end px-4">
            <Pressable
              onPress={() => {
                setFilterCategory(null);
                setFilterSub(null);
              }}
              className="rounded-full bg-[#F3F0EB] px-3 py-1.5"
            >
              <Text className="font-bodyMedium text-xs text-ink-muted">
                {filterSub} ✕
              </Text>
            </Pressable>
          </View>
        ) : null}

        <ProductGrid
          onSelect={onProductSelect}
          category={filterCategory}
          subcategory={filterSub}
          query={committedQuery}
          brandId={selectedBrand}
        />
      </ScrollView>

      <Pressable
        onPress={() => router.push('/chat')}
        accessibilityLabel={he.chat}
        className="absolute bottom-6 left-4 flex-row items-center rounded-full bg-ink px-4 py-3 shadow-lg"
        style={{ elevation: 4 }}
      >
        <Text className="ml-2 font-bodyBold text-sm text-white">{he.chat}</Text>
        <Ionicons name="chatbubble-ellipses" size={18} color="#fff" />
      </Pressable>
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
