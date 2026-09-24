import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { he } from '@/i18n/he';
import { PRODUCTS, type ProductCard, type ShopGender } from '@/data/catalog';
import { formatPriceILS } from '@/utils/stock';

type GenderPillsProps = {
  selected: ShopGender;
  onSelect: (g: ShopGender) => void;
};

/** בדף הבית — רק SALE (בלי נשים/גברים) */
export function GenderPills({ selected, onSelect }: GenderPillsProps) {
  const active = selected === 'sale';

  return (
    <View className="mt-4 flex-row flex-wrap justify-center gap-2 px-4">
      <Pressable
        onPress={() => onSelect('sale')}
        className={`rounded-full border px-5 py-2.5 ${
          active ? 'border-[#E07A4F] bg-[#E07A4F]' : 'border-[#D5CFC6] bg-white'
        }`}
        accessibilityRole="button"
        accessibilityState={{ selected: active }}
      >
        <Text
          className={`font-bodyBold text-sm ${
            active ? 'text-white' : 'text-ink'
          }`}
        >
          {he.sale}
        </Text>
      </Pressable>
    </View>
  );
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
};

export function ProductGrid({ onSelect }: ProductGridProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="mt-4"
      contentContainerClassName="gap-3 px-4 pb-8"
    >
      {PRODUCTS.map((product) => (
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
      ))}
    </ScrollView>
  );
}
