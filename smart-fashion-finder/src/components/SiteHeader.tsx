import { useState } from 'react';
import { Modal, Pressable, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { he } from '@/i18n/he';
import type { LocationSearchMode } from '@/types';

type Props = {
  query: string;
  onQueryChange: (value: string) => void;
  onSearchSubmit?: () => void;
  onCart?: () => void;
  onProfile?: () => void;
  onArea?: () => void;
  areaLabel?: string;
  cartCount?: number;
  locationMode?: LocationSearchMode;
  onLocationModeChange?: (mode: LocationSearchMode) => void;
  onVoiceSearch?: () => void;
  listening?: boolean;
};

const LOC_OPTIONS: { id: LocationSearchMode; label: string }[] = [
  { id: 'nearby', label: he.locNearby },
  { id: 'other', label: he.locOther },
  { id: 'onTheWay', label: he.locOnTheWay },
];

export function SiteHeader({
  query,
  onQueryChange,
  onSearchSubmit,
  onCart,
  onProfile,
  onArea,
  areaLabel,
  cartCount = 0,
  locationMode = 'nearby',
  onLocationModeChange,
  onVoiceSearch,
  listening = false,
}: Props) {
  const [locMenuOpen, setLocMenuOpen] = useState(false);

  const locLabel =
    LOC_OPTIONS.find((o) => o.id === locationMode)?.label ?? he.locNearby;

  const selectLoc = (mode: LocationSearchMode) => {
    setLocMenuOpen(false);
    onLocationModeChange?.(mode);
    if (mode === 'other') onArea?.();
  };

  return (
    <View className="border-b border-[#E8E4DE] bg-white px-4 pb-3 pt-2">
      <View className="flex-row flex-wrap items-center justify-between gap-y-3">
        <View className="flex-row items-center gap-3">
          <HeaderIcon
            icon="location-outline"
            label={areaLabel || he.area}
            onPress={onArea}
          />
          <HeaderIcon
            icon="person-outline"
            label={he.profile}
            onPress={onProfile}
          />
          <View className="relative">
            <HeaderIcon icon="cart-outline" label={he.cart} onPress={onCart} />
            {cartCount > 0 ? (
              <View className="absolute -left-0.5 -top-0.5 min-w-[16px] items-center rounded-full bg-[#E07A4F] px-1">
                <Text className="font-bodyBold text-[9px] text-white">
                  {cartCount}
                </Text>
              </View>
            ) : null}
          </View>

          {/* סרגל חיפוש: מיקרופון + תפריט מיקום משמאל, שדה מימין */}
          <View className="ml-1 min-w-[200px] max-w-[280px] flex-row items-center rounded-full border border-[#D9D3C9] bg-[#FAF8F5] px-2 py-1.5">
            <Pressable
              onPress={onVoiceSearch}
              hitSlop={8}
              accessibilityLabel={he.voiceSearch}
              className="px-1"
            >
              <Ionicons
                name={listening ? 'mic' : 'mic-outline'}
                size={18}
                color={listening ? '#E07A4F' : '#6B6560'}
              />
            </Pressable>

            <Pressable
              onPress={() => setLocMenuOpen(true)}
              className="mr-1 flex-row items-center rounded-full bg-white px-2 py-1"
              hitSlop={6}
            >
              <Text className="font-bodyMedium text-[10px] text-ink">{locLabel}</Text>
              <Ionicons name="chevron-down" size={12} color="#6B6560" />
            </Pressable>

            <Ionicons name="search" size={16} color="#6B6560" />
            <TextInput
              value={query}
              onChangeText={onQueryChange}
              onSubmitEditing={onSearchSubmit}
              placeholder={
                listening ? he.listening : he.searchPlaceholder
              }
              placeholderTextColor="#8A847C"
              className="mr-2 flex-1 text-right font-body text-sm text-ink"
              returnKeyType="search"
              textAlign="right"
            />
          </View>
        </View>

        <Text className="font-displayBold text-2xl text-ink">{he.brand}</Text>
      </View>

      <Modal
        visible={locMenuOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setLocMenuOpen(false)}
      >
        <Pressable
          className="flex-1 bg-ink/40"
          onPress={() => setLocMenuOpen(false)}
        >
          <View className="absolute left-4 right-4 top-24 rounded-2xl bg-white p-3">
            <Text className="mb-2 text-right font-bodyBold text-sm text-ink">
              {he.area}
            </Text>
            {LOC_OPTIONS.map((opt) => {
              const active = locationMode === opt.id;
              return (
                <Pressable
                  key={opt.id}
                  onPress={() => selectLoc(opt.id)}
                  className={`mb-1 rounded-xl px-4 py-3 ${
                    active ? 'bg-[#E07A4F]' : 'bg-[#F3F0EB]'
                  }`}
                >
                  <Text
                    className={`text-right font-bodyBold text-sm ${
                      active ? 'text-white' : 'text-ink'
                    }`}
                  >
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

function HeaderIcon({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress?: () => void;
}) {
  return (
    <Pressable onPress={onPress} className="items-center px-1" hitSlop={8}>
      <Ionicons name={icon} size={20} color="#1A1A1A" />
      <Text className="mt-0.5 font-body text-[10px] text-ink-muted" numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}
