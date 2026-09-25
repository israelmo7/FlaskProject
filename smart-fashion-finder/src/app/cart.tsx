import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCallback } from 'react';
import { personaToGenderFilter } from '@/constants/avatar';
import { useSavedProfile } from '@/hooks/useSavedProfile';
import { he } from '@/i18n/he';
import type { CartItem, GarmentAnalysis } from '@/types';
import { formatPriceILS } from '@/utils/stock';

export default function CartScreen() {
  const {
    ready,
    cart,
    preferredSize,
    profile,
    updatePreferredSize,
    removeCartItem,
    clearCart,
    reload,
  } = useSavedProfile();

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  const findNearMe = (piece: CartItem) => {
    const size = piece.size || preferredSize || 'M';
    updatePreferredSize(size);
    const analysis: GarmentAnalysis = {
      id: `cart-${piece.id}`,
      category: piece.category,
      subcategory: piece.subcategory,
      color: piece.color,
      pattern: 'Solid',
      fit: 'Regular',
      gender: personaToGenderFilter(profile.persona),
      estimatedPriceMin: Math.max(50, piece.price - 40),
      estimatedPriceMax: piece.price + 40,
      confidence: 0.9,
      boundingBoxes: [],
      source: 'avatar',
      size,
    };
    router.push({
      pathname: '/stores',
      params: {
        payload: JSON.stringify(analysis),
        distanceKm: '8',
        gender: analysis.gender,
        preferredSize: size,
      },
    });
  };

  const total = cart.reduce((sum, item) => sum + item.price, 0);

  if (!ready) {
    return (
      <View className="flex-1 items-center justify-center bg-stone-light">
        <ActivityIndicator color="#1F6B63" />
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-stone-light"
      contentContainerClassName="px-4 pb-10 pt-4"
    >
      <Text className="mb-1 text-right font-display text-2xl text-ink">
        {he.cartTitle}
      </Text>
      <Text className="mb-5 text-right font-body text-sm text-ink-muted">
        {he.cartLookHint}
      </Text>

      {cart.length === 0 ? (
        <View className="items-center rounded-2xl bg-white px-6 py-12">
          <Ionicons name="cart-outline" size={40} color="#8A847C" />
          <Text className="mt-3 text-center font-bodyBold text-base text-ink">
            {he.cartEmpty}
          </Text>
          <Text className="mt-2 text-center font-body text-sm text-ink-muted">
            {he.cartEmptyHintLook}
          </Text>
          <Pressable
            onPress={() => router.back()}
            className="mt-6 rounded-full bg-ink px-5 py-3"
          >
            <Text className="font-bodyBold text-sm text-white">{he.backToHome}</Text>
          </Pressable>
        </View>
      ) : (
        <>
          {cart.map((piece) => (
            <View
              key={piece.id}
              className="mb-3 rounded-2xl border border-[#E8E4DE] bg-white px-4 py-4"
            >
              <View className="flex-row items-start justify-between">
                <Pressable onPress={() => removeCartItem(piece.id)} hitSlop={10}>
                  <Ionicons name="trash-outline" size={20} color="#C45C4A" />
                </Pressable>
                <View className="flex-1 items-end pl-3">
                  <Text className="font-bodyBold text-base text-ink">{piece.label}</Text>
                  <Text className="mt-1 font-body text-sm text-ink-muted">
                    {he.sizeLabel}: {piece.size || preferredSize}
                  </Text>
                  <Text className="mt-0.5 font-body text-xs text-ink-muted">
                    {piece.subcategory}
                  </Text>
                  <Text className="mt-2 font-bodyBold text-base text-teal">
                    {formatPriceILS(piece.price)}
                  </Text>
                </View>
              </View>
              <Pressable
                onPress={() => findNearMe(piece)}
                className="mt-3 flex-row items-center justify-center rounded-full bg-[#E07A4F] py-3"
              >
                <Text className="ml-1.5 font-bodyBold text-sm text-white">
                  {he.navigate}
                </Text>
                <Ionicons name="navigate" size={16} color="#fff" />
              </Pressable>
            </View>
          ))}

          <View className="mb-3 flex-row items-center justify-between rounded-2xl bg-white px-4 py-3">
            <Text className="font-bodyBold text-base text-ink">
              {formatPriceILS(total)}
            </Text>
            <Text className="font-bodyMedium text-sm text-ink-muted">{he.cartTotal}</Text>
          </View>

          <Pressable
            onPress={clearCart}
            className="mt-1 items-center rounded-full border border-[#D5CFC6] py-3"
          >
            <Text className="font-bodyMedium text-sm text-ink-soft">{he.clearCart}</Text>
          </Pressable>
        </>
      )}
    </ScrollView>
  );
}
