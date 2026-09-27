import { useMemo } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { BRANDS, PRODUCTS, type ProductCard } from '@/data/catalog';
import { he } from '@/i18n/he';
import type { GarmentCategory } from '@/types';
import { formatPriceILS } from '@/utils/stock';

type BrandRowProps = {
  selectedId?: string | null;
  onSelect?: (brandId: string) => void;
};

/** שורת מותגים — קומפקטית ומהירה לסינון */
export function BrandCircles({ selectedId, onSelect }: BrandRowProps) {
  return (
    <View className="mt-4">
      <Text className="mb-2 px-4 text-right font-bodyMedium text-[11px] text-ink-muted">
        {he.brandsRow}
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-2.5 px-4 pb-1"
      >
        {BRANDS.map((brand) => {
          const active = selectedId === brand.id;
          return (
            <Pressable
              key={brand.id}
              onPress={() => onSelect?.(brand.id)}
              accessibilityLabel={brand.name}
              className="items-center"
            >
              <View
                className={`items-center justify-center rounded-full ${
                  active ? 'border-2 border-[#E07A4F]' : 'border border-[#E8E4DE]'
                }`}
                style={{
                  width: 56,
                  height: 56,
                  backgroundColor: brand.color,
                }}
              >
                <Text className="font-bodyBold text-xs text-white">
                  {brand.initials}
                </Text>
              </View>
              <Text
                className="mt-1 max-w-[64px] text-center font-body text-[9px] text-ink-muted"
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
  query?: string;
  brandId?: string | null;
};

export function ProductGrid({
  onSelect,
  category = null,
  subcategory = null,
  query = '',
  brandId = null,
}: ProductGridProps) {
  const brandName = brandId
    ? BRANDS.find((b) => b.id === brandId)?.name.toLowerCase()
    : null;
  const q = query.trim().toLowerCase();

  const items = useMemo(
    () =>
      PRODUCTS.filter((p) => {
        if (category && category !== 'All' && p.category !== category) return false;
        if (subcategory && p.subcategory !== subcategory) return false;
        if (brandName) {
          const pb = (p.brand ?? '').toLowerCase();
          if (!pb.includes(brandName) && brandName !== pb) return false;
        }
        if (q) {
          const blob = `${p.title} ${p.subcategory} ${p.color} ${p.brand ?? ''} ${p.storeName ?? ''}`.toLowerCase();
          if (!blob.includes(q)) return false;
        }
        return true;
      }),
    [category, subcategory, brandName, q],
  );

  return (
    <View className="mt-4">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-3.5 px-4 pb-12"
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
              className="overflow-hidden rounded-2xl border border-[#EDE8E0] bg-white"
              style={{ width: 158 }}
            >
              <View
                className="relative items-center justify-center bg-[#FAF8F5]"
                style={{ height: 200 }}
              >
                <Image
                  source={product.image}
                  style={{ width: '90%', height: '90%' }}
                  resizeMode="contain"
                />
                {typeof product.price === 'number' ? (
                  <View className="absolute bottom-2 left-2 rounded-full bg-ink/90 px-2.5 py-1">
                    <Text className="font-bodyBold text-xs text-white">
                      {formatPriceILS(product.price)}
                    </Text>
                  </View>
                ) : null}
              </View>
              <View className="px-2.5 py-2.5">
                <Text
                  className="text-center font-bodyMedium text-xs text-ink"
                  numberOfLines={2}
                >
                  {product.title}
                </Text>
                {product.storeArea ? (
                  <Text
                    className="mt-1 text-center font-body text-[10px] text-ink-muted"
                    numberOfLines={1}
                  >
                    {product.storeArea}
                  </Text>
                ) : null}
              </View>
            </Pressable>
          ))
        )}
      </ScrollView>
    </View>
  );
}
