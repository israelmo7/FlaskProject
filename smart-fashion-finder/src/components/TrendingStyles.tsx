import { Pressable, Text, View } from 'react-native';
import inventoryData from '@/data/inventory.json';
import { he } from '@/i18n/he';
import type { RecentSearch, TrendingStyle } from '@/types';

type RecentProps = {
  onSelect: (search: RecentSearch) => void;
};

type TrendingProps = {
  onSelect: (style: TrendingStyle) => void;
};

const accentFor = (color: string) => {
  const key = color.toLowerCase();
  if (key.includes('olive')) return '#556B2F';
  if (key.includes('indigo') || key.includes('navy')) return '#2C3E6B';
  if (key.includes('camel')) return '#A67C52';
  if (key.includes('white') || key.includes('cream')) return '#C9BFAF';
  if (key.includes('light wash')) return '#6B8CAE';
  return '#1F6B63';
};

export function RecentSearches({ onSelect }: RecentProps) {
  const items = inventoryData.recentSearches as RecentSearch[];

  return (
    <View className="mt-8">
      <Text className="mb-3 text-right font-display text-xl text-ink">
        {he.recent}
      </Text>
      {items.map((item) => (
        <Pressable
          key={item.id}
          onPress={() => onSelect(item)}
          className="mb-2 flex-row items-center justify-between border-b border-stone-dark py-3"
        >
          <View
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: accentFor(item.color) }}
          />
          <View className="flex-1 items-end">
            <Text className="font-bodyMedium text-base text-ink">{item.label}</Text>
            <Text className="font-body text-xs text-ink-muted">
              {item.category} · {item.color}
            </Text>
          </View>
        </Pressable>
      ))}
    </View>
  );
}

export function TrendingStyles({ onSelect }: TrendingProps) {
  const items = inventoryData.trendingStyles as TrendingStyle[];

  return (
    <View className="mb-10 mt-8">
      <Text className="mb-3 text-right font-display text-xl text-ink">
        {he.trending}
      </Text>
      <View className="flex-row flex-wrap justify-between">
        {items.map((style) => (
          <Pressable
            key={style.id}
            onPress={() => onSelect(style)}
            className="mb-3 w-[48%] overflow-hidden rounded-xl"
            style={{ backgroundColor: accentFor(style.color) }}
          >
            <View className="h-28 justify-end p-3">
              <Text className="text-right font-body text-xs text-white/80">
                {style.tag}
              </Text>
              <Text className="mt-1 text-right font-display text-lg text-white">
                {style.title}
              </Text>
              <Text className="text-right font-body text-xs text-white/80">
                {style.category}
              </Text>
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
