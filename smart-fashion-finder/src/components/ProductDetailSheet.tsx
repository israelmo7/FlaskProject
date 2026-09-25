import { useEffect, useState } from 'react';
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ProductCard } from '@/data/catalog';
import { he } from '@/i18n/he';
import { formatPriceILS } from '@/utils/stock';

type Props = {
  product: ProductCard | null;
  visible: boolean;
  onClose: () => void;
  onDressAvatar: (product: ProductCard) => void;
  onAddToCart: (product: ProductCard) => void;
  preferredSize?: string;
};

/** כרטיס פריט מלא — תמונה גדולה, מחיר, חנות, מותג, לב, הלבשה, סל */
export function ProductDetailSheet({
  product,
  visible,
  onClose,
  onDressAvatar,
  onAddToCart,
  preferredSize = 'M',
}: Props) {
  const { height } = useWindowDimensions();
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    setLiked(false);
  }, [product?.id]);

  if (!product) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-ink/45">
        <Pressable className="flex-1" onPress={onClose} />
        <View
          className="rounded-t-3xl bg-white px-5 pb-10 pt-3"
          style={{ maxHeight: height * 0.88 }}
        >
          <View className="mb-3 items-center">
            <View className="h-1.5 w-12 rounded-full bg-[#D9D3C9]" />
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View className="relative mb-4 items-center overflow-hidden rounded-2xl bg-[#FAF8F5]">
              <Image
                source={product.image}
                resizeMode="contain"
                style={{ width: '100%', height: Math.min(340, height * 0.38) }}
              />
              <Pressable
                onPress={() => setLiked((v) => !v)}
                hitSlop={10}
                accessibilityLabel={he.favorite}
                className="absolute right-3 top-3 rounded-full bg-white/95 p-2.5 shadow-sm"
              >
                <Ionicons
                  name={liked ? 'heart' : 'heart-outline'}
                  size={22}
                  color={liked ? '#C45C4A' : '#1A1A1A'}
                />
              </Pressable>
            </View>

            <Text className="text-right font-display text-2xl text-ink">
              {product.title}
            </Text>

            <View className="mt-2 flex-row items-center justify-between">
              <Text className="font-bodyBold text-xl text-teal">
                {typeof product.price === 'number'
                  ? formatPriceILS(product.price)
                  : '—'}
              </Text>
              <Text className="font-bodyMedium text-sm text-ink-muted">
                {he.sizeLabel}: {preferredSize}
              </Text>
            </View>

            <View className="mt-4 gap-2 rounded-2xl bg-[#F7F4EF] px-4 py-3">
              <Row label={he.brandLabel} value={product.brand || '—'} />
              <Row label={he.storeLabel} value={product.storeName || '—'} />
              <Row label={he.category} value={product.subcategory} />
            </View>

            <View className="mt-5 flex-row gap-3">
              <Pressable
                onPress={() => {
                  onAddToCart(product);
                  onClose();
                }}
                className="flex-1 flex-row items-center justify-center rounded-2xl border border-[#D9D3C9] bg-white py-3.5"
              >
                <Ionicons name="cart-outline" size={18} color="#12161C" />
                <Text className="mr-2 font-bodyBold text-sm text-ink">
                  {he.addToCart}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  onDressAvatar(product);
                  onClose();
                }}
                className="flex-1 flex-row items-center justify-center rounded-2xl bg-ink py-3.5"
              >
                <Ionicons name="body-outline" size={18} color="#fff" />
                <Text className="mr-2 font-bodyBold text-sm text-white">
                  {he.dressOnAvatar}
                </Text>
              </Pressable>
            </View>

            <Pressable onPress={onClose} className="mt-4 items-center py-2">
              <Text className="font-bodyMedium text-sm text-ink-muted">
                {he.closeMenu}
              </Text>
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between">
      <Text className="font-bodyMedium text-sm text-ink">{value}</Text>
      <Text className="font-body text-xs text-ink-muted">{label}</Text>
    </View>
  );
}
