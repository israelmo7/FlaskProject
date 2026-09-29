import { Pressable, Text, View } from 'react-native';
import {
  CATEGORY_OPTIONS,
  DISTANCE_OPTIONS,
  GENDER_OPTIONS,
  SIZE_OPTIONS,
} from '@/constants/filters';
import { categoryLabel, genderLabel, he } from '@/i18n/he';
import type { DistanceRadius, GarmentCategory, GenderFilter, SearchFilters } from '@/types';

type Props = {
  filters: SearchFilters;
  onChange: (next: SearchFilters) => void;
};

function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`mb-2 ml-2 rounded-md px-3 py-2 ${
        active ? 'bg-teal' : 'bg-stone-dark/70'
      }`}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
    >
      <Text
        className={`font-bodyMedium text-sm ${
          active ? 'text-stone-light' : 'text-ink-soft'
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function FilterChips({ filters, onChange }: Props) {
  return (
    <View className="mt-4">
      <Text className="mb-2 font-bodyMedium text-xs text-ink-muted">
        {he.filters.category}
      </Text>
      <View className="flex-row flex-wrap">
        {CATEGORY_OPTIONS.map((option) => (
          <Chip
            key={option}
            label={categoryLabel[option] ?? option}
            active={filters.category === option}
            onPress={() =>
              onChange({
                ...filters,
                category: option as GarmentCategory | 'All',
              })
            }
          />
        ))}
      </View>

      <Text className="mb-2 mt-3 font-bodyMedium text-xs text-ink-muted">
        {he.filters.size}
      </Text>
      <View className="flex-row flex-wrap">
        {SIZE_OPTIONS.map((size) => (
          <Chip
            key={size}
            label={size === 'All' ? he.filters.all : size}
            active={filters.preferredSize === size}
            onPress={() => onChange({ ...filters, preferredSize: size })}
          />
        ))}
      </View>

      <Text className="mb-2 mt-3 font-bodyMedium text-xs text-ink-muted">
        {he.filters.distance}
      </Text>
      <View className="flex-row flex-wrap">
        {DISTANCE_OPTIONS.map((km) => (
          <Chip
            key={km}
            label={`${km} ${he.filters.km}`}
            active={filters.distanceKm === km}
            onPress={() =>
              onChange({ ...filters, distanceKm: km as DistanceRadius })
            }
          />
        ))}
      </View>

      <Text className="mb-2 mt-3 font-bodyMedium text-xs text-ink-muted">
        {he.filters.gender}
      </Text>
      <View className="flex-row flex-wrap">
        {GENDER_OPTIONS.map((option) => (
          <Chip
            key={option}
            label={genderLabel[option] ?? option}
            active={filters.gender === option}
            onPress={() =>
              onChange({
                ...filters,
                gender: option as GenderFilter | 'All',
              })
            }
          />
        ))}
      </View>
    </View>
  );
}
