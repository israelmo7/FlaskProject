import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { GarmentOverlay } from '@/components/GarmentOverlay';
import { categoryToSlot, wearPiece } from '@/constants/avatar';
import { PRODUCTS } from '@/data/catalog';
import { useSavedProfile } from '@/hooks/useSavedProfile';
import { he } from '@/i18n/he';
import {
  requestVisionAnalyze,
  type VisualProductMatch,
} from '@/services/visionSearch';
import type { GarmentAnalysis, OutfitPiece } from '@/types';
import { formatPriceILS } from '@/utils/stock';

function SkeletonBlock({ className }: { className?: string }) {
  return <View className={`rounded-xl bg-stone-dark/80 ${className ?? ''}`} />;
}

export default function AnalysisScreen() {
  const params = useLocalSearchParams<{
    payload?: string;
    matches?: string;
    imageUri?: string;
    source?: string;
    pending?: string;
    distanceKm?: string;
    gender?: string;
    preferredSize?: string;
  }>();

  const { preferredSize, layers, saveAll, updatePreferredSize } =
    useSavedProfile();

  const initialAnalysis = useMemo(() => {
    try {
      return params.payload
        ? (JSON.parse(params.payload) as GarmentAnalysis)
        : null;
    } catch {
      return null;
    }
  }, [params.payload]);

  const initialMatches = useMemo(() => {
    try {
      return params.matches
        ? (JSON.parse(params.matches) as VisualProductMatch[])
        : [];
    } catch {
      return [];
    }
  }, [params.matches]);

  const [analysis, setAnalysis] = useState<GarmentAnalysis | null>(
    initialAnalysis,
  );
  const [matches, setMatches] = useState<VisualProductMatch[]>(initialMatches);
  const [loading, setLoading] = useState(
    params.pending === '1' && Boolean(params.imageUri),
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.pending !== '1' || !params.imageUri) return;
    let cancelled = false;
    const source =
      params.source === 'camera' || params.source === 'upload'
        ? params.source
        : 'upload';

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await requestVisionAnalyze({
          imageUri: params.imageUri!,
          source,
        });
        if (cancelled) return;
        setAnalysis(result.analysis);
        setMatches(result.matches);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : he.recognitionFailed);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [params.pending, params.imageUri, params.source]);

  /** Try-on: write piece into outfit store → open Avatar Studio */
  const dressMatch = (match: VisualProductMatch) => {
    const product = PRODUCTS.find((p) => p.id === match.productId);
    if (!product) return;
    const size = preferredSize || 'M';
    const piece: OutfitPiece = {
      id: `${product.id}-${size}-${Date.now()}`,
      label: product.title,
      category: product.category,
      subcategory: product.subcategory,
      color: product.color,
      size,
      slot: categoryToSlot(product.category),
      price: product.price,
    };
    updatePreferredSize(size);
    const nextLayers = wearPiece(layers, piece);
    saveAll({
      layers: nextLayers,
      preferredSize: size,
    });
    router.replace('/avatar');
  };

  const goStores = () => {
    if (!analysis) return;
    router.push({
      pathname: '/stores',
      params: {
        payload: JSON.stringify(analysis),
        distanceKm: params.distanceKm ?? '5',
        gender: params.gender ?? analysis.gender,
        preferredSize: params.preferredSize ?? analysis.size ?? preferredSize ?? 'All',
      },
    });
  };

  if (loading) {
    return (
      <ScrollView
        className="flex-1 bg-stone"
        contentContainerClassName="px-5 py-5 pb-10"
      >
        <Text className="mb-2 text-right font-display text-2xl text-ink">
          {he.visualSearchTitle}
        </Text>
        <Text className="mb-5 text-right font-body text-sm text-ink-muted">
          {he.analyzing}
        </Text>
        <SkeletonBlock className="mb-4 aspect-[3/4] w-full" />
        <SkeletonBlock className="mb-3 h-16 w-full" />
        <SkeletonBlock className="mb-3 h-16 w-full" />
        <SkeletonBlock className="h-16 w-full" />
        <View className="mt-8 items-center">
          <ActivityIndicator color="#1F6B63" size="large" />
        </View>
      </ScrollView>
    );
  }

  if (!analysis) {
    return (
      <View className="flex-1 items-center justify-center bg-stone px-6">
        <Text className="font-display text-2xl text-ink">
          {error ? he.recognitionFailed : he.noAnalysis}
        </Text>
        <Text className="mt-2 text-center font-body text-ink-muted">
          {error || he.noAnalysisHint}
        </Text>
        <Pressable
          onPress={() => router.back()}
          className="mt-6 rounded-xl bg-teal px-5 py-3"
        >
          <Text className="font-bodyBold text-stone-light">{he.goBack}</Text>
        </Pressable>
      </View>
    );
  }

  const topMatches = matches.slice(0, Math.max(3, matches.length));

  return (
    <ScrollView
      className="flex-1 bg-stone"
      contentContainerClassName="px-5 py-5 pb-10"
    >
      <Text className="mb-1 text-right font-display text-2xl text-ink">
        {he.visualSearchTitle}
      </Text>
      <Text className="mb-4 text-right font-body text-sm text-ink-muted">
        {he.visualSearchHint}
      </Text>

      <GarmentOverlay analysis={analysis} />

      <Text className="mb-2 mt-7 text-right font-bodyMedium text-xs text-ink-muted">
        {he.similarProducts}
      </Text>

      {topMatches.map((match) => {
        const product = PRODUCTS.find((p) => p.id === match.productId);
        const pct = Math.round(match.score * 100);
        return (
          <View
            key={match.productId}
            className="mb-3 flex-row items-center rounded-2xl border border-stone-dark bg-stone-light px-3 py-3"
          >
            {product ? (
              <Image
                source={product.image}
                className="h-16 w-14 rounded-lg bg-stone"
                resizeMode="cover"
              />
            ) : (
              <View className="h-16 w-14 rounded-lg bg-stone-dark" />
            )}
            <View className="mx-3 flex-1">
              <Text className="text-right font-bodyBold text-sm text-ink">
                {match.title}
              </Text>
              <Text className="mt-0.5 text-right font-body text-xs text-ink-muted">
                {match.color} · {match.subcategory}
                {typeof match.price === 'number'
                  ? ` · ${formatPriceILS(match.price)}`
                  : ''}
              </Text>
              <Text className="mt-1 text-right font-bodyMedium text-xs text-teal">
                {he.matchScore.replace('{n}', String(pct))}
              </Text>
            </View>
            <View className="max-w-[118px] gap-2">
              <Pressable
                onPress={() => dressMatch(match)}
                className="items-center rounded-lg bg-ink px-2.5 py-2"
                accessibilityRole="button"
                accessibilityLabel={he.tryOnShort}
              >
                <Text className="text-center font-bodyBold text-[10px] text-stone-light">
                  {he.tryOnShort}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  router.push({
                    pathname: '/stores',
                    params: {
                      payload: JSON.stringify({
                        ...analysis,
                        category: match.category,
                        subcategory: match.subcategory,
                        color: match.color,
                      }),
                      distanceKm: params.distanceKm ?? '5',
                      gender: analysis.gender,
                      preferredSize: preferredSize || 'All',
                    },
                  });
                }}
                className="items-center rounded-lg bg-coral px-2.5 py-2"
                accessibilityRole="button"
                accessibilityLabel={he.storeShort}
              >
                <Text className="text-center font-bodyBold text-[10px] text-white">
                  {he.storeShort}
                </Text>
              </Pressable>
            </View>
          </View>
        );
      })}

      <Pressable
        onPress={goStores}
        className="mt-4 items-center rounded-xl bg-coral py-4"
        accessibilityRole="button"
        accessibilityLabel={he.findNearMe}
      >
        <Text className="font-bodyBold text-base text-white">{he.findNearMe}</Text>
      </Pressable>

      {layers.top || layers.bottom || layers.outer ? (
        <Text className="mt-3 text-center font-body text-xs text-ink-muted">
          {he.layersStay}
        </Text>
      ) : null}
    </ScrollView>
  );
}
