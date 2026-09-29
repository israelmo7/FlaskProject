import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { he } from '@/i18n/he';
import type { GarmentAnalysis, GarmentCategory, GenderFilter } from '@/types';

const CATEGORIES: { id: GarmentCategory; label: string }[] = [
  { id: 'Pants', label: he.filters.pants },
  { id: 'Shirts', label: he.filters.shirts },
  { id: 'Outerwear', label: he.filters.outerwear },
  { id: 'Dresses', label: he.catDresses },
  { id: 'Underwear', label: he.catUnderwear },
  { id: 'Hats', label: he.catHats },
  { id: 'Socks', label: he.catSocks },
  { id: 'Shoes', label: he.catShoes },
];

const COLORS = [
  { id: 'Black', label: 'שחור' },
  { id: 'White', label: 'לבן' },
  { id: 'Blue', label: 'כחול' },
  { id: 'Olive Green', label: 'זית' },
  { id: 'Brown', label: 'חום' },
  { id: 'Beige', label: 'בז׳' },
  { id: 'Navy', label: 'נייבי' },
];

const SIZES = ['XS', 'S', 'M', 'L', 'XL', '32', '34'];
const GENDERS: { id: GenderFilter; label: string }[] = [
  { id: 'Women', label: he.filters.women },
  { id: 'Men', label: he.filters.men },
  { id: 'Unisex', label: he.filters.unisex },
];

/**
 * תיוג ידני חכם אחרי צילום/גלריה — שלב ביניים עד Vision API.
 */
export default function TagScreen() {
  const params = useLocalSearchParams<{
    imageUri?: string;
    source?: string;
    preferredSize?: string;
  }>();

  const [category, setCategory] = useState<GarmentCategory>('Pants');
  const [color, setColor] = useState('Blue');
  const [size, setSize] = useState(params.preferredSize || 'M');
  const [gender, setGender] = useState<GenderFilter>('Unisex');

  const subcategory = useMemo(() => {
    switch (category) {
      case 'Pants':
        return 'Slim Fit Jeans';
      case 'Shirts':
        return 'T-Shirt';
      case 'Outerwear':
        return 'Jacket';
      case 'Dresses':
        return 'Midi Dress';
      case 'Underwear':
        return 'Underwear';
      case 'Hats':
        return 'Cap';
      case 'Socks':
        return 'Socks';
      case 'Shoes':
        return 'Sneakers';
    }
  }, [category]);

  const confirm = () => {
    const analysis: GarmentAnalysis = {
      id: `manual-${Date.now()}`,
      category,
      subcategory,
      color,
      pattern: 'Solid',
      fit: 'Regular',
      gender,
      estimatedPriceMin: 80,
      estimatedPriceMax: 350,
      confidence: 1,
      boundingBoxes: [],
      imageUri: params.imageUri,
      source: 'manual',
      size,
      manuallyTagged: true,
    };
    router.replace({
      pathname: '/analysis',
      params: {
        payload: JSON.stringify(analysis),
        distanceKm: '8',
        gender: analysis.gender,
        preferredSize: size,
      },
    });
  };

  return (
    <ScrollView
      className="flex-1 bg-stone-light"
      contentContainerClassName="px-4 pb-12 pt-4"
    >
      <Text className="mb-1 text-right font-display text-2xl text-ink">
        {he.tagTitle}
      </Text>
      <Text className="mb-4 text-right font-body text-sm text-ink-muted">
        {he.tagHint}
      </Text>

      {params.imageUri ? (
        <Image
          source={{ uri: params.imageUri }}
          className="mb-4 h-48 w-full rounded-xl bg-stone"
          resizeMode="cover"
        />
      ) : null}

      <Section title={he.category}>
        <ChipRow
          items={CATEGORIES.map((c) => ({ id: c.id, label: c.label }))}
          selected={category}
          onSelect={(id) => setCategory(id as GarmentCategory)}
        />
      </Section>

      <Section title={he.colorPattern}>
        <ChipRow
          items={COLORS}
          selected={color}
          onSelect={setColor}
        />
      </Section>

      <Section title={he.sizeLabel}>
        <ChipRow
          items={SIZES.map((s) => ({ id: s, label: s }))}
          selected={size}
          onSelect={setSize}
        />
      </Section>

      <Section title={he.filters.gender}>
        <ChipRow
          items={GENDERS.map((g) => ({ id: g.id, label: g.label }))}
          selected={gender}
          onSelect={(id) => setGender(id as GenderFilter)}
        />
      </Section>

      <Pressable
        onPress={confirm}
        className="mt-6 items-center rounded-xl bg-[#E07A4F] py-4"
      >
        <Text className="font-bodyBold text-base text-white">{he.tagConfirm}</Text>
      </Pressable>
    </ScrollView>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View className="mb-4">
      <Text className="mb-2 text-right font-bodyBold text-sm text-ink">{title}</Text>
      {children}
    </View>
  );
}

function ChipRow({
  items,
  selected,
  onSelect,
}: {
  items: { id: string; label: string }[];
  selected: string;
  onSelect: (id: string) => void;
}) {
  return (
    <View className="flex-row flex-wrap justify-end gap-2">
      {items.map((item) => {
        const active = selected === item.id;
        return (
          <Pressable
            key={item.id}
            onPress={() => onSelect(item.id)}
            className={`rounded-full border px-3 py-2 ${
              active ? 'border-[#E07A4F] bg-[#E07A4F]' : 'border-[#D5CFC6] bg-white'
            }`}
          >
            <Text
              className={`font-bodyMedium text-xs ${
                active ? 'text-white' : 'text-ink'
              }`}
            >
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
