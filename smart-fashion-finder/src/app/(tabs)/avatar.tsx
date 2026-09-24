import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { DressableFigure } from '@/components/DressableFigure';
import {
  BUILD_OPTIONS,
  HEIGHT_RANGE,
  PERSONA_OPTIONS,
  SIZE_OPTIONS_BY_CATEGORY,
  WARDROBE_ITEMS,
  categoryToSlot,
  outfitSummary,
  personaToGenderFilter,
  removeSlot,
  wearPiece,
  type WardrobeItem,
} from '@/constants/avatar';
import { useSavedProfile } from '@/hooks/useSavedProfile';
import { he } from '@/i18n/he';
import type {
  AvatarPersona,
  AvatarProfile,
  BodyBuild,
  GarmentAnalysis,
  OutfitLayers,
  OutfitPiece,
} from '@/types';

export default function AvatarScreen() {
  const {
    ready,
    profile,
    preferredSize,
    layers,
    updateProfile,
    updatePreferredSize,
    updateLayers,
    saveAll,
  } = useSavedProfile();

  const [heightText, setHeightText] = useState(String(profile.heightCm));
  const [selectedItem, setSelectedItem] = useState<WardrobeItem | null>(
    WARDROBE_ITEMS[0],
  );
  const [selectedSize, setSelectedSize] = useState(preferredSize || 'M');

  useEffect(() => {
    if (ready) {
      setHeightText(String(profile.heightCm));
      setSelectedSize(preferredSize || 'M');
    }
  }, [ready, profile.heightCm, preferredSize]);

  const sizeOptions = useMemo(() => {
    if (!selectedItem) return ['S', 'M', 'L', 'XL'];
    return SIZE_OPTIONS_BY_CATEGORY[selectedItem.category];
  }, [selectedItem]);

  const setPersona = (persona: AvatarPersona) => {
    const range = HEIGHT_RANGE[persona];
    const next: AvatarProfile = {
      ...profile,
      persona,
      heightCm: range.default,
    };
    updateProfile(next);
    setHeightText(String(range.default));
  };

  const applyHeight = (raw: string) => {
    setHeightText(raw.replace(/[^0-9]/g, ''));
    const n = Number(raw);
    if (!Number.isFinite(n)) return;
    const range = HEIGHT_RANGE[profile.persona];
    const clamped = Math.min(range.max, Math.max(range.min, n));
    updateProfile({ ...profile, heightCm: clamped });
  };

  const setLayers = (updater: (prev: OutfitLayers) => OutfitLayers) => {
    updateLayers(updater(layers));
  };

  const addToOutfit = () => {
    if (!selectedItem) return;
    if (!selectedSize) {
      Alert.alert(he.chooseSizeFirst);
      return;
    }
    const piece: OutfitPiece = {
      id: `${selectedItem.id}-${selectedSize}-${Date.now()}`,
      label: selectedItem.label,
      category: selectedItem.category,
      subcategory: selectedItem.subcategory,
      color: selectedItem.color,
      size: selectedSize,
      slot: categoryToSlot(selectedItem.category),
    };
    setLayers((prev) => wearPiece(prev, piece));
    updatePreferredSize(selectedSize);
  };

  const saveProfile = () => {
    saveAll({ profile, preferredSize: selectedSize || preferredSize, layers });
    updatePreferredSize(selectedSize || preferredSize);
    Alert.alert(he.profileSaved, `${he.myPreferredSize}: ${selectedSize || preferredSize}`);
  };

  const findNearMe = () => {
    const focus =
      layers.top || layers.bottom || layers.dress || layers.outer || layers.shoes;
    if (!focus) {
      Alert.alert(he.chooseGarmentAlert);
      return;
    }
    const size = focus.size || preferredSize || 'M';
    updatePreferredSize(size);
    const analysis: GarmentAnalysis = {
      id: `avatar-${Date.now()}`,
      category: focus.category,
      subcategory: focus.subcategory,
      color: focus.color,
      pattern: 'Solid',
      fit: 'Regular',
      gender: personaToGenderFilter(profile.persona),
      estimatedPriceMin: 120,
      estimatedPriceMax: 350,
      confidence: 0.9,
      boundingBoxes: [
        { x: 0.2, y: 0.2, width: 0.6, height: 0.6, label: focus.label },
      ],
      source: 'avatar',
      size,
    };
    router.push({
      pathname: '/stores',
      params: {
        payload: JSON.stringify(analysis),
        distanceKm: '5',
        gender: analysis.gender,
        preferredSize: size,
      },
    });
  };

  if (!ready) {
    return (
      <View className="flex-1 items-center justify-center bg-stone">
        <ActivityIndicator color="#1F6B63" />
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-stone"
      contentContainerClassName="px-5 py-5 pb-12"
      keyboardShouldPersistTaps="handled"
    >
      <Text className="text-right font-display text-3xl text-ink">{he.avatarTitle}</Text>
      <Text className="mt-2 text-right font-body text-base text-ink-muted">
        {he.avatarHint}
      </Text>
      <Text className="mt-1 text-right font-bodyMedium text-xs text-teal">
        {he.layersStay}
      </Text>

      <Text className="mb-2 mt-6 text-right font-bodyMedium text-xs text-ink-muted">
        {he.personaLabel}
      </Text>
      <View className="flex-row flex-wrap justify-end">
        {PERSONA_OPTIONS.map((opt) => {
          const active = profile.persona === opt.id;
          return (
            <Pressable
              key={opt.id}
              onPress={() => setPersona(opt.id)}
              className={`mb-2 ml-2 rounded-full px-3.5 py-2 ${
                active ? 'bg-teal' : 'bg-stone-dark'
              }`}
            >
              <Text
                className={`font-bodyMedium text-sm ${
                  active ? 'text-stone-light' : 'text-ink-soft'
                }`}
              >
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text className="mb-2 mt-4 text-right font-bodyMedium text-xs text-ink-muted">
        {he.heightLabel}
      </Text>
      <View className="flex-row items-center justify-end">
        <Text className="ml-2 font-body text-sm text-ink-muted">ס״מ</Text>
        <TextInput
          value={heightText}
          onChangeText={applyHeight}
          onBlur={() => setHeightText(String(profile.heightCm))}
          keyboardType="number-pad"
          className="w-24 rounded-xl bg-stone-light px-3 py-2.5 text-center font-bodyBold text-base text-ink"
          maxLength={3}
        />
      </View>

      <Text className="mb-2 mt-4 text-right font-bodyMedium text-xs text-ink-muted">
        {he.buildLabel}
      </Text>
      <View className="flex-row flex-wrap justify-end">
        {BUILD_OPTIONS.map((opt) => {
          const active = profile.build === opt.id;
          return (
            <Pressable
              key={opt.id}
              onPress={() =>
                updateProfile({ ...profile, build: opt.id as BodyBuild })
              }
              className={`mb-2 ml-2 rounded-xl px-3 py-2 ${
                active ? 'bg-ink' : 'bg-stone-dark'
              }`}
            >
              <Text
                className={`text-right font-bodyBold text-sm ${
                  active ? 'text-stone-light' : 'text-ink'
                }`}
              >
                {opt.label}
              </Text>
              <Text
                className={`text-right font-body text-[10px] ${
                  active ? 'text-stone-dark' : 'text-ink-muted'
                }`}
              >
                {opt.hint}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text className="mb-2 mt-4 text-right font-bodyMedium text-xs text-ink-muted">
        {he.myPreferredSize}
      </Text>
      <View className="flex-row flex-wrap justify-end">
        {['XS', 'S', 'M', 'L', 'XL'].map((size) => {
          const active = preferredSize === size;
          return (
            <Pressable
              key={size}
              onPress={() => {
                updatePreferredSize(size);
                setSelectedSize(size);
              }}
              className={`mb-2 ml-2 min-w-[44px] items-center rounded-md px-3 py-2 ${
                active ? 'bg-teal' : 'bg-stone-dark'
              }`}
            >
              <Text
                className={`font-bodyBold text-sm ${
                  active ? 'text-stone-light' : 'text-ink-soft'
                }`}
              >
                {size}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View className="mt-5">
        <DressableFigure
          profile={profile}
          layers={layers}
          onRemovePiece={(piece) =>
            setLayers((prev) => removeSlot(prev, piece.slot))
          }
        />
      </View>

      <Text className="mt-3 text-center font-body text-xs text-ink-muted">
        {outfitSummary(layers)}
      </Text>

      <Text className="mb-2 mt-6 text-right font-bodyMedium text-xs text-ink-muted">
        {he.overlayGarment}
      </Text>
      <View className="flex-row flex-wrap justify-end">
        {WARDROBE_ITEMS.map((item) => {
          const active = selectedItem?.id === item.id;
          return (
            <Pressable
              key={item.id}
              onPress={() => {
                setSelectedItem(item);
                const sizes = SIZE_OPTIONS_BY_CATEGORY[item.category];
                setSelectedSize(
                  sizes.includes(preferredSize)
                    ? preferredSize
                    : sizes.includes('M')
                      ? 'M'
                      : sizes[0],
                );
              }}
              className={`mb-2 ml-2 rounded-xl px-3 py-2 ${
                active ? 'bg-coral' : 'bg-ink'
              }`}
            >
              <Text className="font-bodyMedium text-sm text-stone-light">
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text className="mb-2 mt-3 text-right font-bodyMedium text-xs text-ink-muted">
        {he.sizeLabel}
        {selectedItem ? ` · ${selectedItem.label}` : ''}
      </Text>
      <View className="flex-row flex-wrap justify-end">
        {sizeOptions.map((size) => {
          const active = selectedSize === size;
          return (
            <Pressable
              key={size}
              onPress={() => setSelectedSize(size)}
              className={`mb-2 ml-2 min-w-[44px] items-center rounded-md px-3 py-2 ${
                active ? 'bg-teal' : 'bg-stone-dark'
              }`}
            >
              <Text
                className={`font-bodyBold text-sm ${
                  active ? 'text-stone-light' : 'text-ink-soft'
                }`}
              >
                {size}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable
        onPress={addToOutfit}
        className="mt-3 items-center rounded-xl bg-ink py-3.5"
      >
        <Text className="font-bodyBold text-base text-stone-light">
          הלבישו על הבובה · {selectedItem?.label} {selectedSize}
        </Text>
      </Pressable>

      <Pressable
        onPress={saveProfile}
        className="mt-3 items-center rounded-xl bg-teal py-3.5"
      >
        <Text className="font-bodyBold text-base text-stone-light">
          {he.saveProfile}
        </Text>
      </Pressable>

      <Pressable
        onPress={() => updateLayers({})}
        className="mt-3 items-center rounded-xl border border-stone-dark py-3"
      >
        <Text className="font-bodyMedium text-sm text-ink-muted">{he.clearOutfit}</Text>
      </Pressable>

      <Pressable
        onPress={findNearMe}
        className="mt-5 items-center rounded-xl bg-coral py-4"
        accessibilityRole="button"
      >
        <Text className="font-bodyBold text-base text-white">{he.findNearMe}</Text>
      </Pressable>
    </ScrollView>
  );
}
