import { useMemo, useState, type ComponentType } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { StoreCard } from '@/components/StoreCard';
import { useNearbyStores } from '@/hooks/useNearbyStores';
import { useUserLocation } from '@/hooks/useUserLocation';
import type { DistanceRadius, GarmentAnalysis, GenderFilter, SearchFilters } from '@/types';
import { formatPriceILS } from '@/utils/stock';

let MapView: ComponentType<Record<string, unknown>> | null = null;
let Marker: ComponentType<Record<string, unknown>> | null = null;

if (Platform.OS !== 'web') {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const maps = require('react-native-maps');
  MapView = maps.default;
  Marker = maps.Marker;
}

type ViewMode = 'list' | 'map';

export default function StoresScreen() {
  const { width } = useWindowDimensions();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const params = useLocalSearchParams<{
    payload?: string;
    distanceKm?: string;
    gender?: string;
  }>();
  const { coords, label, permissionDenied } = useUserLocation();

  let analysis: GarmentAnalysis | null = null;
  try {
    analysis = params.payload ? (JSON.parse(params.payload) as GarmentAnalysis) : null;
  } catch {
    analysis = null;
  }

  const filters: SearchFilters = useMemo(
    () => ({
      category: analysis?.category ?? 'All',
      distanceKm: (Number(params.distanceKm) || 5) as DistanceRadius,
      gender: (params.gender as GenderFilter | 'All') || 'All',
    }),
    [analysis?.category, params.distanceKm, params.gender],
  );

  const matches = useNearbyStores(coords, { analysis, filters });
  const available = matches.filter((m) => m.item.stockStatus !== 'out_of_stock');

  return (
    <View className="flex-1 bg-stone">
      <View className="border-b border-stone-dark px-5 pb-4 pt-2">
        <Text className="font-display text-2xl text-ink">
          {analysis ? analysis.subcategory : 'Nearby inventory'}
        </Text>
        <Text className="mt-1 font-body text-sm text-ink-muted">
          Near {label}
          {permissionDenied ? ' (using Haifa demo location)' : ''} · within{' '}
          {filters.distanceKm} km
        </Text>
        {analysis && (
          <Text className="mt-1 font-bodyMedium text-sm text-teal">
            {analysis.color} · est. {formatPriceILS(analysis.estimatedPriceMin)}–
            {formatPriceILS(analysis.estimatedPriceMax)}
          </Text>
        )}

        <View className="mt-4 flex-row rounded-lg bg-stone-dark p-1">
          {(['list', 'map'] as ViewMode[]).map((mode) => (
            <Pressable
              key={mode}
              onPress={() => setViewMode(mode)}
              className={`flex-1 items-center rounded-md py-2 ${
                viewMode === mode ? 'bg-ink' : ''
              }`}
            >
              <Text
                className={`font-bodyMedium text-sm capitalize ${
                  viewMode === mode ? 'text-stone-light' : 'text-ink-soft'
                }`}
              >
                {mode} view
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {viewMode === 'map' ? (
        <View className="flex-1">
          {MapView && Marker ? (
            <MapView
              style={{ flex: 1, width }}
              initialRegion={{
                latitude: coords.latitude,
                longitude: coords.longitude,
                latitudeDelta: 0.08,
                longitudeDelta: 0.08,
              }}
            >
              <Marker
                coordinate={coords}
                title="You"
                pinColor="#1F6B63"
              />
              {matches.map((match) => (
                <Marker
                  key={match.item.id}
                  coordinate={{
                    latitude: match.store.latitude,
                    longitude: match.store.longitude,
                  }}
                  title={match.store.name}
                  description={`${match.item.name} · ${formatPriceILS(match.item.price)}`}
                />
              ))}
            </MapView>
          ) : (
            <View className="flex-1 items-center justify-center px-6">
              <Text className="text-center font-display text-xl text-ink">
                Map preview
              </Text>
              <Text className="mt-2 text-center font-body text-ink-muted">
                Interactive maps are available on iOS and Android. Showing store list
                pins as text for web.
              </Text>
              <ScrollView className="mt-4 w-full">
                {matches.map((match) => (
                  <View
                    key={match.item.id}
                    className="mb-3 border-b border-stone-dark pb-3"
                  >
                    <Text className="font-bodyBold text-ink">{match.store.name}</Text>
                    <Text className="font-body text-sm text-ink-muted">
                      {match.store.latitude.toFixed(4)}, {match.store.longitude.toFixed(4)} ·{' '}
                      {match.distanceKm} km
                    </Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}
          <ScrollView className="max-h-56 border-t border-stone-dark bg-stone-light px-5 pt-3">
            {matches.map((match) => (
              <StoreCard key={match.item.id} match={match} />
            ))}
          </ScrollView>
        </View>
      ) : (
        <ScrollView className="flex-1 px-5 pt-4" contentContainerClassName="pb-10">
          <Text className="mb-4 font-bodyMedium text-sm text-ink-muted">
            {available.length} stores with stock · {matches.length} total matches
          </Text>
          {matches.length === 0 ? (
            <View className="mt-10 items-center px-4">
              <Text className="font-display text-xl text-ink">No nearby matches</Text>
              <Text className="mt-2 text-center font-body text-ink-muted">
                Try widening the distance radius or adjusting gender filters on Home.
              </Text>
            </View>
          ) : (
            matches.map((match) => <StoreCard key={match.item.id} match={match} />)
          )}
        </ScrollView>
      )}
    </View>
  );
}
