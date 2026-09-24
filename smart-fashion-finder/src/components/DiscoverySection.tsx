import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { BRANDS, PRODUCTS, type ProductCard } from '@/data/catalog';
import { he } from '@/i18n/he';
import type { GarmentCategory } from '@/types';
import { formatPriceILS } from '@/utils/stock';

export function StyleBanner() {
  return (
    <View className="mx-4 mt-5 items-center rounded-md bg-[#E07A4F] px-4 py-3">
      <Text className="font-bodyBold text-base text-white">{he.discoverStyle}</Text>
    </View>
  );
}

type BrandRowProps = {
  selectedId?: string | null;
  onSelect?: (brandId: string) => void;
};

/** שורת מותגים עגולה — במקום שורת הקטגוריות */
export function BrandCircles({ selectedId, onSelect }: BrandRowProps) {
  return (
    <View className="mt-5">
      <Text className="mb-3 px-4 text-right font-bodyBold text-sm text-ink">
        {he.brandsTitle}
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-4 px-4 pb-2"
      >
        {BRANDS.map((brand) => {
          const active = selectedId === brand.id;
          return (
            <Pressable
              key={brand.id}
              onPress={() => onSelect?.(brand.id)}
              className="items-center"
              style={{ width: 76 }}
            >
              <View
                className={`items-center justify-center rounded-full ${
                  active ? 'border-2 border-[#E07A4F]' : 'border border-[#E8E4DE]'
                }`}
                style={{
                  width: 68,
                  height: 68,
                  backgroundColor: brand.color,
                }}
              >
                <Text className="font-bodyBold text-base text-white">
                  {brand.initials}
                </Text>
              </View>
              <Text
                className="mt-1.5 text-center font-bodyMedium text-[11px] text-ink"
                numberOfLines={1}
              >
                {brand.name}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

type ProductGridProps = {
  onSelect: (product: ProductCard) => void;
  category?: GarmentCategory | 'All' | null;
  subcategory?: string | null;
};

export function ProductGrid({
  onSelect,
  category = null,
  subcategory = null,
}: ProductGridProps) {
  const items = PRODUCTS.filter((p) => {
    if (category && category !== 'All' && p.category !== category) return false;
    if (subcategory && p.subcategory !== subcategory) return false;
    return true;
  });

  return (
    <View className="mt-2">
      {(category || subcategory) && (
        <Text className="mb-2 px-4 text-right font-body text-xs text-ink-muted">
          {subcategory || category}
        </Text>
      )}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-3 px-4 pb-8"
      >
        {items.length === 0 ? (
          <Text className="px-2 font-body text-sm text-ink-muted">
            {he.noProductsInCategory}
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
                <View className="absolute bottom-2 right-2 left-2 rounded bg-black/55 px-1.5 py-1">
                  <Text
                    className="text-center font-body text-[10px] text-white"
                    numberOfLines={2}
                  >
                    {product.title}
                  </Text>
                </View>
                {typeof product.price === 'number' ? (
                  <View className="absolute top-2 left-2 rounded bg-white/95 px-1.5 py-0.5">
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
    </View>
  );
}
