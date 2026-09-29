import { Alert, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { he } from '@/i18n/he';
import type { StoreMatch } from '@/types';
import {
  callStore,
  holdItemMessage,
  openNavigation,
  openWhatsApp,
  storeHasPhone,
  storeHasWhatsApp,
} from '@/utils/contact';
import { formatDistance } from '@/utils/distance';
import { formatPriceILS, stockColorClass, stockLabel } from '@/utils/stock';
import { allSizes, isStoreOpenNow, qtyForSize, todayHoursLabel } from '@/utils/storeMeta';

type Props = {
  match: StoreMatch;
  preferredSize?: string;
};

export function StoreCard({ match, preferredSize = 'All' }: Props) {
  const { store, item, distanceKm, hasPreferredSize } = match;
  const showSizeHint = preferredSize !== 'All';
  const highlight = showSizeHint && hasPreferredSize;
  const openNow = isStoreOpenNow(store);
  const hoursLabel = todayHoursLabel(store);

  const message = holdItemMessage({
    storeName: store.name,
    itemName: item.name,
    size: preferredSize !== 'All' ? preferredSize : item.sizeStock[0]?.size || 'M',
  });

  const onWhatsApp = () => {
    if (!store.whatsapp) {
      Alert.alert(he.noWhatsApp, he.noWhatsAppHint);
      return;
    }
    openWhatsApp(store.whatsapp, message);
  };

  const onHold = () => {
    if (!store.whatsapp) {
      Alert.alert(he.holdItem, he.noWhatsAppHint);
      return;
    }
    openWhatsApp(store.whatsapp, message);
  };

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

          <View className="mt-1.5 flex-row flex-wrap items-center justify-end gap-1.5">
            <View
              className={`rounded-md px-2 py-0.5 ${
                openNow ? 'bg-stock-high' : 'bg-stock-out'
              }`}
            >
              <Text className="font-bodyMedium text-[10px] text-white">
                {openNow ? he.openNow : he.closedNow}
              </Text>
            </View>
            {hoursLabel ? (
              <Text className="font-body text-[10px] text-ink-muted">{hoursLabel}</Text>
            ) : null}
          </View>

          <Text className="mt-2 text-right font-bodyMedium text-sm text-ink-soft">
            {item.name}
          </Text>

          <View className="mt-2 flex-row flex-wrap justify-end">
            <Text className="ml-2 font-body text-xs text-ink-muted">
              {he.sizesInStore}:
            </Text>
            {allSizes(item).map(({ size, qty }) => {
              const isYours = preferredSize !== 'All' && size === preferredSize;
              const empty = qty <= 0;
              return (
                <View
                  key={size}
                  className={`mb-1 ml-1 rounded-md px-2 py-0.5 ${
                    empty
                      ? 'bg-stone-dark/50'
                      : isYours
                        ? 'bg-teal'
                        : 'bg-stone-dark'
                  }`}
                >
                  <Text
                    className={`font-bodyMedium text-xs ${
                      empty
                        ? 'text-ink-muted line-through'
                        : isYours
                          ? 'text-stone-light'
                          : 'text-ink-soft'
                    }`}
                  >
                    {size}
                    {qty > 0 ? ` (${qty})` : ''}
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
              {hasPreferredSize
                ? `${he.mySizeBadge}${
                    preferredSize !== 'All'
                      ? ` · ${qtyForSize(item, preferredSize)}`
                      : ''
                  }`
                : he.sizeMissing}
            </Text>
          )}

          <View className="mt-3 flex-row flex-wrap items-center justify-end gap-2">
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

          <View className="mt-2 flex-row flex-wrap justify-end gap-2">
            {storeHasPhone(store) ? (
              <Pressable
                onPress={() => callStore(store.phone!)}
                className="flex-row items-center rounded-full border border-[#D5CFC6] px-3 py-2"
              >
                <Text className="ml-1 font-bodyMedium text-xs text-ink">{he.callStore}</Text>
                <Ionicons name="call-outline" size={14} color="#12161C" />
              </Pressable>
            ) : null}
            {storeHasWhatsApp(store) ? (
              <Pressable
                onPress={onWhatsApp}
                className="flex-row items-center rounded-full bg-[#25D366] px-3 py-2"
              >
                <Text className="ml-1 font-bodyBold text-xs text-white">
                  {he.whatsappStore}
                </Text>
                <Ionicons name="logo-whatsapp" size={14} color="#fff" />
              </Pressable>
            ) : null}
            <Pressable
              onPress={onHold}
              className="flex-row items-center rounded-full bg-[#E07A4F] px-3 py-2"
            >
              <Text className="ml-1 font-bodyBold text-xs text-white">{he.holdItem}</Text>
              <Ionicons name="bookmark-outline" size={14} color="#fff" />
            </Pressable>
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
