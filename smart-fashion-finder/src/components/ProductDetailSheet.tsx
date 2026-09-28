import { useEffect, useMemo, useRef, useState } from 'react';
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
import { SIZE_OPTIONS_BY_CATEGORY } from '@/constants/avatar';
import type { ProductCard } from '@/data/catalog';
import { he } from '@/i18n/he';
import { openNavigation } from '@/utils/contact';
import { formatPriceILS } from '@/utils/stock';

type Props = {
  product: ProductCard | null;
  visible: boolean;
  onClose: () => void;
  onDressAvatar: (product: ProductCard, size: string) => void;
  onAddToCart: (product: ProductCard, size: string) => void;
  preferredSize?: string;
};

function pickInitialSize(
  category: ProductCard['category'] | undefined,
  preferredSize: string,
): string {
  const opts = category
    ? SIZE_OPTIONS_BY_CATEGORY[category] ?? ['S', 'M', 'L']
    : ['S', 'M', 'L'];
  if (opts.includes(preferredSize)) return preferredSize;
  if (opts.includes('M')) return 'M';
  return opts[Math.floor(opts.length / 2)];
}

/** כרטיס פריט מלא — מידות, חנות, הלבשה לפי מידה */
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
  const [selectedSize, setSelectedSize] = useState(preferredSize);
  const selectedSizeRef = useRef(selectedSize);
  selectedSizeRef.current = selectedSize;
  const openedProductId = useRef<string | null>(null);

  const sizeOptions = useMemo(() => {
    if (!product) return ['S', 'M', 'L'];
    return SIZE_OPTIONS_BY_CATEGORY[product.category] ?? ['S', 'M', 'L', 'XL'];
  }, [product]);

  // אתחול מידה רק בפתיחת מוצר חדש — לא לדרוס בחירה כש־preferredSize מתעדכן
  useEffect(() => {
    if (!visible || !product) return;
    if (openedProductId.current === product.id) return;
    openedProductId.current = product.id;
    setLiked(false);
    setSelectedSize(pickInitialSize(product.category, preferredSize));
  }, [visible, product?.id, product?.category, preferredSize]);

  useEffect(() => {
    if (!visible) openedProductId.current = null;
  }, [visible]);

  if (!product) return null;

  const canNavigate =
    typeof product.latitude === 'number' && typeof product.longitude === 'number';

  const onNavigate = () => {
    if (!canNavigate) return;
    openNavigation(
      product.latitude!,
      product.longitude!,
      product.storeName || product.title,
    );
  };

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
                {he.sizeLabel}: {selectedSize}
              </Text>
            </View>

            <Text className="mb-2 mt-4 text-right font-bodyMedium text-xs text-ink-muted">
              {he.chooseSizeHint}
            </Text>
            <View className="flex-row flex-wrap justify-end">
              {sizeOptions.map((size) => {
                const active = selectedSize === size;
                return (
                  <Pressable
                    key={size}
                    onPress={() => setSelectedSize(size)}
                    className={`mb-2 ml-2 min-w-[44px] items-center rounded-md px-3 py-2 ${
                      active ? 'bg-teal' : 'bg-[#F3F0EB]'
                    }`}
                  >
                    <Text
                      className={`font-bodyBold text-sm ${
                        active ? 'text-white' : 'text-ink'
                      }`}
                    >
                      {size}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View className="mt-2 gap-2 rounded-2xl bg-[#F7F4EF] px-4 py-3">
              <Row label={he.brandLabel} value={product.brand || '—'} />
              <Row label={he.storeLabel} value={product.storeName || '—'} />
              <Row
                label={he.storeLocationLabel}
                value={product.storeArea || product.storeAddress || 'חיפה'}
              />
              <Row
                label={he.addressLabel}
                value={product.storeAddress || '—'}
              />
              <Row label={he.category} value={product.subcategory} />
            </View>

            {canNavigate ? (
              <Pressable
                onPress={onNavigate}
                className="mt-4 flex-row items-center justify-center rounded-2xl bg-[#E07A4F] py-3.5"
                accessibilityRole="button"
                accessibilityLabel={he.navigate}
              >
                <Ionicons name="navigate" size={18} color="#fff" />
                <Text className="mr-2 font-bodyBold text-[15px] text-white">
                  {he.navigate}
                </Text>
              </Pressable>
            ) : null}

            <View className="mt-3 flex-row gap-3">
              <Pressable
                onPress={() => {
                  const size = selectedSizeRef.current;
                  onAddToCart(product, size);
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
                  const size = selectedSizeRef.current;
                  onDressAvatar(product, size);
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
    <View className="flex-row items-center justify-between gap-3">
      <Text className="flex-1 text-left font-bodyMedium text-sm text-ink">
        {value}
      </Text>
      <Text className="font-body text-xs text-ink-muted">{label}</Text>
    </View>
  );
}
