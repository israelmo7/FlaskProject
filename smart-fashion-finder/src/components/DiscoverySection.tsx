import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { he } from '@/i18n/he';
import { PRODUCTS, type ProductCard } from '@/data/catalog';
import type { GarmentCategory } from '@/types';
import { formatPriceILS } from '@/utils/stock';

export type HomeCategoryFilter = GarmentCategory | 'sale' | 'All';

export const HOME_CATEGORIES: { id: HomeCategoryFilter; label: string }[] = [
  { id: 'sale', label: he.sale },
  { id: 'Pants', label: he.filters.pants },
  { id: 'Shirts', label: he.filters.shirts },
  { id: 'Underwear', label: he.catUnderwear },
  { id: 'Hats', label: he.catHats },
  { id: 'Socks', label: he.catSocks },
  { id: 'Outerwear', label: he.filters.outerwear },
  { id: 'Dresses', label: he.catDresses },
  { id: 'Shoes', label: he.catShoes },
];

type CategoryPillsProps = {
  selected: HomeCategoryFilter;
  onSelect: (g: HomeCategoryFilter) => void;
};

/** SALE + קטגוריות בשורה אחת נגללת */
export function CategoryPills({ selected, onSelect }: CategoryPillsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="mt-4"
      contentContainerClassName="gap-2 px-4"
    >
      {HOME_CATEGORIES.map((item) => {
        const active = selected === item.id;
        return (
          <Pressable
            key={item.id}
            onPress={() => onSelect(item.id)}
            className={`rounded-full border px-4 py-2.5 ${
              active
                ? 'border-[#E07A4F] bg-[#E07A4F]'
                : 'border-[#D5CFC6] bg-white'
            }`}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
          >
            <Text
              className={`font-bodyBold text-sm ${
                active ? 'text-white' : 'text-ink'
              }`}
            >
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

/** @deprecated השתמשו ב־CategoryPills */
export function GenderPills({
  selected,
  onSelect,
}: {
  selected: HomeCategoryFilter;
  onSelect: (g: HomeCategoryFilter) => void;
}) {
  return <CategoryPills selected={selected} onSelect={onSelect} />;
}

export function StyleBanner() {
  return (
    <View className="mx-4 mt-5 items-center rounded-md bg-[#E07A4F] px-4 py-3">
      <Text className="font-bodyBold text-base text-white">{he.discoverStyle}</Text>
    </View>
  );
}

type ProductGridProps = {
  onSelect: (product: ProductCard) => void;
  category?: HomeCategoryFilter;
};

export function ProductGrid({ onSelect, category = 'sale' }: ProductGridProps) {
  const items =
    !category || category === 'sale' || category === 'All'
      ? PRODUCTS
      : PRODUCTS.filter((p) => p.category === category);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="mt-4"
      contentContainerClassName="gap-3 px-4 pb-8"
    >
      {items.length === 0 ? (
        <Text className="px-2 font-body text-sm text-ink-muted">
          אין מוצרים בקטגוריה הזו כרגע — נסו SALE או צילום בגד
        </Text>
      ) : (
        items.map((product) => (
          <Pressable
            key={product.id}
            onPress={() => onSelect(product)}
            className="overflow-hidden rounded-xl bg-[#F3F0EB]"
            style={{ width: 148 }}
          >
            <View className="relative" style={{ height: 180 }}>
              <Image
                source={product.image}
                className="h-full w-full"
                resizeMode="cover"
              />
              {product.badge ? (
                <View className="absolute bottom-2 right-2 left-2 rounded bg-black/55 px-1.5 py-1">
                  <Text
                    className="text-center font-body text-[10px] text-white"
                    numberOfLines={2}
                  >
                    {product.badge}
                  </Text>
                </View>
              ) : null}
              {typeof product.price === 'number' ? (
                <View className="absolute bottom-2 left-2 rounded bg-white/95 px-1.5 py-0.5">
                  <Text className="font-bodyBold text-xs text-ink">
                    {formatPriceILS(product.price)}
                  </Text>
                </View>
              ) : null}
            </View>
          </Pressable>
        ))
      )}
    </ScrollView>
  );
}
