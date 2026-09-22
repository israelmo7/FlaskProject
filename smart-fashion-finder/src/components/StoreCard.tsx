import { Linking, Platform, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { StoreMatch } from '@/types';
import { formatDistance } from '@/utils/distance';
import { formatPriceILS, stockColorClass, stockLabel } from '@/utils/stock';

type Props = {
  match: StoreMatch;
};

function openNavigation(lat: number, lng: number, label: string) {
  const encoded = encodeURIComponent(label);
  const google = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=&travelmode=walking`;
  const apple = `http://maps.apple.com/?daddr=${lat},${lng}&q=${encoded}`;
  const waze = `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`;
  const url = Platform.OS === 'ios' ? apple : google;
  Linking.openURL(url).catch(() => Linking.openURL(waze));
}

export function StoreCard({ match }: Props) {
  const { store, item, distanceKm } = match;

  return (
    <View className="mb-4 overflow-hidden border-b border-stone-dark pb-4">
      <View className="flex-row items-start">
        <View
          className="mr-3 h-12 w-12 items-center justify-center rounded-lg"
          style={{ backgroundColor: store.logoColor }}
        >
          <Text className="font-bodyBold text-sm text-white">
            {store.brand.slice(0, 2).toUpperCase()}
          </Text>
        </View>

        <View className="flex-1">
          <View className="flex-row items-center justify-between">
            <Text className="font-display text-lg text-ink">{store.name}</Text>
            <Text className="font-bodyBold text-base text-ink">
              {formatPriceILS(item.price)}
            </Text>
          </View>
          <Text className="mt-0.5 font-body text-sm text-ink-muted">
            {store.mall} · {formatDistance(distanceKm)}
          </Text>
          <Text className="mt-0.5 font-body text-xs text-ink-muted">
            {store.address}, {store.city}
          </Text>
          <Text className="mt-2 font-bodyMedium text-sm text-ink-soft">
            {item.name} · {item.sizes.join(', ')}
          </Text>

          <View className="mt-3 flex-row items-center justify-between">
            <View
              className={`flex-row items-center rounded-md px-2.5 py-1 ${stockColorClass(
                item.stockStatus,
              )}`}
            >
              <View className="mr-1.5 h-1.5 w-1.5 rounded-full bg-white" />
              <Text className="font-bodyMedium text-xs text-white">
                {stockLabel(item.stockStatus)}
                {item.stockStatus === 'low_stock'
                  ? ` · ${item.stockCount} left`
                  : ''}
              </Text>
            </View>

            <Pressable
              onPress={() =>
                openNavigation(store.latitude, store.longitude, store.name)
              }
              className="flex-row items-center rounded-md bg-ink px-3 py-2"
              accessibilityRole="button"
              accessibilityLabel={`Navigate to ${store.name}`}
            >
              <Ionicons name="navigate" size={14} color="#FAF7F2" />
              <Text className="ml-1.5 font-bodyMedium text-xs text-stone-light">
                Navigate
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}
