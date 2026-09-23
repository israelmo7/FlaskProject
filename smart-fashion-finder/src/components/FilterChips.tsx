import { Pressable, Text, View } from 'react-native';
import {
  CATEGORY_OPTIONS,
  DISTANCE_OPTIONS,
  GENDER_OPTIONS,
} from '@/constants/filters';
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
      className={`mr-2 mb-2 rounded-md px-3 py-2 ${
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
      <Text className="mb-2 font-bodyMedium text-xs uppercase tracking-widest text-ink-muted">
        Category
      </Text>
      <View className="flex-row flex-wrap">
        {CATEGORY_OPTIONS.map((option) => (
          <Chip
            key={option}
            label={option}
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

      <Text className="mb-2 mt-3 font-bodyMedium text-xs uppercase tracking-widest text-ink-muted">
        Distance
      </Text>
      <View className="flex-row flex-wrap">
        {DISTANCE_OPTIONS.map((km) => (
          <Chip
            key={km}
            label={`${km} km`}
            active={filters.distanceKm === km}
            onPress={() =>
              onChange({ ...filters, distanceKm: km as DistanceRadius })
            }
          />
        ))}
      </View>

      <Text className="mb-2 mt-3 font-bodyMedium text-xs uppercase tracking-widest text-ink-muted">
        Gender
      </Text>
      <View className="flex-row flex-wrap">
        {GENDER_OPTIONS.map((option) => (
          <Chip
            key={option}
            label={option}
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
