import { Linking, Platform, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { he } from '@/i18n/he';
import type { StoreMatch } from '@/types';
import { formatDistance } from '@/utils/distance';
import { formatPriceILS, stockColorClass, stockLabel } from '@/utils/stock';

type Props = {
  match: StoreMatch;
  preferredSize?: string;
};

function openNavigation(lat: number, lng: number, label: string) {
  const encoded = encodeURIComponent(label);
  const google = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=walking`;
  const apple = `http://maps.apple.com/?daddr=${lat},${lng}&q=${encoded}`;
  const waze = `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`;
  const url = Platform.OS === 'ios' ? apple : google;
  Linking.openURL(url).catch(() => Linking.openURL(waze));
}

export function StoreCard({ match, preferredSize = 'All' }: Props) {
  const { store, item, distanceKm, hasPreferredSize } = match;
  const showSizeHint = preferredSize !== 'All';
  const highlight = showSizeHint && hasPreferredSize;

  return (
    <View
      className={`mb-4 overflow-hidden rounded-xl border p-3 ${
        highlight
          ? 'border-teal bg-teal/5'
          : store.isBoutique
            ? 'border-teal/40 bg-transparent'
            : 'border-stone-dark bg-transparent'
      }`}
    >
      <View className="flex-row items-start">
        <View className="flex-1">
          <View className="flex-row items-center justify-between">
            <Text className="font-bodyBold text-base text-ink">
              {formatPriceILS(item.price)}
            </Text>
            <View className="flex-row items-center">
              {store.isBoutique && (
                <View className="ml-2 rounded-md bg-teal/15 px-2 py-0.5">
                  <Text className="font-bodyMedium text-[10px] text-teal">
                    {he.boutique}
                  </Text>
                </View>
              )}
              <Text className="font-display text-lg text-ink">{store.name}</Text>
            </View>
          </View>

          <Text className="mt-0.5 text-right font-body text-sm text-ink-muted">
            {store.mall} · {formatDistance(distanceKm)}
          </Text>
          <Text className="mt-0.5 text-right font-body text-xs text-ink-muted">
            {store.address}, {store.city}
          </Text>
          <Text className="mt-2 text-right font-bodyMedium text-sm text-ink-soft">
            {item.name}
          </Text>

          <View className="mt-2 flex-row flex-wrap justify-end">
            <Text className="ml-2 font-body text-xs text-ink-muted">
              {he.sizesInStore}:
            </Text>
            {item.sizes.map((size) => {
              const isYours = preferredSize !== 'All' && size === preferredSize;
              return (
                <View
                  key={size}
                  className={`mb-1 ml-1 rounded-md px-2 py-0.5 ${
                    isYours ? 'bg-teal' : 'bg-stone-dark'
                  }`}
                >
                  <Text
                    className={`font-bodyMedium text-xs ${
                      isYours ? 'text-stone-light' : 'text-ink-soft'
                    }`}
                  >
                    {size}
                  </Text>
                </View>
              );
            })}
          </View>

          {showSizeHint && (
            <Text
              className={`mt-2 text-right font-bodyMedium text-xs ${
                hasPreferredSize ? 'text-stock-high' : 'text-stock-out'
              }`}
            >
              {hasPreferredSize ? he.mySizeBadge : he.sizeMissing}
            </Text>
          )}

          <View className="mt-3 flex-row items-center justify-between">
            <Pressable
              onPress={() =>
                openNavigation(store.latitude, store.longitude, store.name)
              }
              className={`flex-row items-center rounded-md px-3 py-2.5 ${
                highlight ? 'bg-teal' : 'bg-ink'
              }`}
              accessibilityRole="button"
              accessibilityLabel={`${he.navigate} ${store.name}`}
            >
              <Text className="ml-1.5 font-bodyBold text-xs text-stone-light">
                {highlight ? he.navigateNow : he.navigate}
              </Text>
              <Ionicons name="navigate" size={14} color="#FAF7F2" />
            </Pressable>

            <View
              className={`flex-row items-center rounded-md px-2.5 py-1 ${stockColorClass(
                item.stockStatus,
              )}`}
            >
              <Text className="font-bodyMedium text-xs text-white">
                {stockLabel(item.stockStatus)}
                {item.stockStatus === 'low_stock'
                  ? ` · ${he.left} ${item.stockCount}`
                  : ''}
              </Text>
            </View>
          </View>

          {highlight ? (
            <Text className="mt-2 text-right font-body text-[10px] text-teal">
              {he.walkingHint}
            </Text>
          ) : null}
        </View>

        <View
          className="mr-0 ml-3 h-12 w-12 items-center justify-center rounded-lg"
          style={{ backgroundColor: store.logoColor }}
        >
          <Text className="font-bodyBold text-sm text-white">
            {store.name.slice(0, 2)}
          </Text>
        </View>
      </View>
    </View>
  );
}
