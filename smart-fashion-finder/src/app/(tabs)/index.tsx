import { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AvatarPreview } from '@/components/AvatarPreview';
import { CategoryDrawer } from '@/components/CategoryDrawer';
import { DEFAULT_FILTERS } from '@/constants/filters';
import { useGarmentRecognition } from '@/hooks/useGarmentRecognition';
import { he } from '@/i18n/he';
import type {
  BodyType,
  GarmentAnalysis,
  GarmentCategory,
  SearchFilters,
} from '@/types';

const WARDROBE: {
  label: string;
  category: GarmentCategory;
  color: string;
}[] = [
  { label: 'קרגו זית', category: 'Pants', color: 'Olive Green' },
  { label: 'אוקספורד לבן', category: 'Shirts', color: 'White' },
  { label: 'ג׳קט ג׳ינס', category: 'Outerwear', color: 'Light Wash' },
  { label: 'ג׳ינס אינדיגו', category: 'Pants', color: 'Indigo' },
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [bodyType, setBodyType] = useState<BodyType>('regular');
  const [garment, setGarment] = useState<GarmentAnalysis | null>(null);
  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS);
  const { isAnalyzing, analyzeImage, pickFromLibrary, snapWithCamera } =
    useGarmentRecognition();

  const dressWith = async (item: (typeof WARDROBE)[number]) => {
    const result = await analyzeImage('', 'avatar', {
      category: item.category,
      color: item.color,
      gender: filters.gender === 'All' ? 'Unisex' : filters.gender,
    });
    setGarment({
      ...result,
      category: item.category,
      color: item.color,
      imageUri: undefined,
    });
    setFilters((prev) => ({ ...prev, category: item.category }));
  };

  const findNearMe = () => {
    if (!garment) {
      Alert.alert(he.chooseGarmentAlert);
      return;
    }
    router.push({
      pathname: '/stores',
      params: {
        payload: JSON.stringify(garment),
        distanceKm: String(filters.distanceKm),
        gender: filters.gender,
        preferredSize: filters.preferredSize,
      },
    });
  };

  const runPhoto = async (mode: 'upload' | 'camera') => {
    try {
      const uri =
        mode === 'upload' ? await pickFromLibrary() : await snapWithCamera();
      if (!uri) return;
      const analysis = await analyzeImage(uri, mode, {
        category: filters.category === 'All' ? 'Pants' : filters.category,
        gender: filters.gender === 'All' ? 'Unisex' : filters.gender,
      });
      setGarment(analysis);
      router.push({
        pathname: '/analysis',
        params: {
          payload: JSON.stringify(analysis),
          distanceKm: String(filters.distanceKm),
          gender: filters.gender,
          preferredSize: filters.preferredSize,
        },
      });
    } catch {
      Alert.alert(he.recognitionFailed, he.recognitionFailedHint);
    }
  };

  const onSearchSubmit = async () => {
    if (!query.trim()) return;
    const hintCategory =
      filters.category === 'All' ? 'Pants' : filters.category;
    const analysis = await analyzeImage('', 'upload', {
      category: hintCategory,
      color: query.trim(),
    });
    setGarment({ ...analysis, color: query.trim(), imageUri: undefined });
  };

  return (
    <View className="flex-1 bg-stone" style={{ paddingTop: insets.top }}>
      {/* ===== Top bar: hamburger (ימין) + חיפוש (מרכז) ===== */}
      <View className="flex-row items-center px-4 pb-3 pt-2">
        {/* ב־RTL הילד הראשון מופיע מימין */}
        <Pressable
          onPress={() => setMenuOpen(true)}
          className="h-11 w-11 items-center justify-center rounded-xl bg-stone-light"
          accessibilityRole="button"
          accessibilityLabel={he.menuCategories}
        >
          <View className="w-5">
            <View className="mb-1.5 h-0.5 w-full rounded-full bg-ink" />
            <View className="mb-1.5 h-0.5 w-full rounded-full bg-ink" />
            <View className="h-0.5 w-full rounded-full bg-ink" />
          </View>
        </Pressable>

        <View className="mx-3 flex-1 flex-row items-center rounded-xl bg-stone-light px-3 py-2.5">
          <Ionicons name="search" size={18} color="#5C6675" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={onSearchSubmit}
            placeholder={he.searchPlaceholder}
            placeholderTextColor="#5C6675"
            className="mr-2 flex-1 text-right font-body text-base text-ink"
            returnKeyType="search"
            textAlign="right"
          />
        </View>

        <Pressable
          onPress={() => runPhoto('camera')}
          disabled={isAnalyzing}
          className="h-11 w-11 items-center justify-center rounded-xl bg-teal"
          accessibilityRole="button"
          accessibilityLabel={he.openCamera}
        >
          <Ionicons name="camera-outline" size={20} color="#FAF7F2" />
        </Pressable>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 pb-10"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ===== אווטאר להלבשה — מרכז המסך ===== */}
        <AvatarPreview
          hero
          bodyType={bodyType}
          onBodyTypeChange={setBodyType}
          garment={garment}
        />

        <Text className="mb-3 mt-5 text-right font-bodyMedium text-xs text-ink-muted">
          {he.overlayGarment}
        </Text>
        <View className="flex-row flex-wrap justify-end">
          {WARDROBE.filter(
            (item) =>
              filters.category === 'All' || item.category === filters.category,
          ).map((item) => {
            const active =
              garment?.category === item.category &&
              garment?.color === item.color;
            return (
              <Pressable
                key={item.label}
                disabled={isAnalyzing}
                onPress={() => dressWith(item)}
                className={`mb-2 ml-2 rounded-xl px-3.5 py-2.5 ${
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

        <View className="mt-3 flex-row justify-end gap-2">
          <Pressable
            onPress={() => runPhoto('upload')}
            disabled={isAnalyzing}
            className="flex-row items-center rounded-xl bg-stone-dark px-3 py-2.5"
          >
            <Text className="ml-1.5 font-bodyMedium text-sm text-ink">
              {he.openGallery}
            </Text>
            <Ionicons name="image-outline" size={16} color="#12161C" />
          </Pressable>
        </View>

        <Pressable
          onPress={findNearMe}
          className="mt-6 items-center rounded-xl bg-coral py-4"
          accessibilityRole="button"
        >
          <Text className="font-bodyBold text-base text-white">{he.findNearMe}</Text>
        </Pressable>

        <Text className="mt-4 text-center font-body text-xs text-ink-muted">
          {he.tagline}
        </Text>
      </ScrollView>

      <CategoryDrawer
        visible={menuOpen}
        selected={filters.category}
        onSelect={(category) =>
          setFilters((prev) => ({ ...prev, category }))
        }
        onClose={() => setMenuOpen(false)}
      />
    </View>
  );
}
