import { Pressable, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { he } from '@/i18n/he';

type Props = {
  query: string;
  onQueryChange: (value: string) => void;
  onSearchSubmit?: () => void;
  onCart?: () => void;
  onProfile?: () => void;
  onArea?: () => void;
  onNav?: (key: string) => void;
};

export function SiteHeader({
  query,
  onQueryChange,
  onSearchSubmit,
  onCart,
  onProfile,
  onArea,
  onNav,
}: Props) {
  return (
    <View className="border-b border-[#E8E4DE] bg-white px-4 pb-3 pt-2">
      {/* שורה עליונה: ניווט · לוגו · חיפוש + אייקונים */}
      <View className="flex-row flex-wrap items-center justify-between gap-y-3">
        {/* ב־RTL: קבוצת האייקונים תופיע מימין */}
        <View className="flex-row items-center gap-3">
          <HeaderIcon
            icon="location-outline"
            label={he.area}
            onPress={onArea}
          />
          <HeaderIcon
            icon="person-outline"
            label={he.profile}
            onPress={onProfile}
          />
          <HeaderIcon
            icon="cart-outline"
            label={he.cart}
            onPress={onCart}
          />

          <View className="ml-1 min-w-[160px] max-w-[220px] flex-row items-center rounded-full border border-[#D9D3C9] bg-[#FAF8F5] px-3 py-2">
            <Ionicons name="search" size={16} color="#6B6560" />
            <TextInput
              value={query}
              onChangeText={onQueryChange}
              onSubmitEditing={onSearchSubmit}
              placeholder={he.searchPlaceholder}
              placeholderTextColor="#8A847C"
              className="mr-2 flex-1 text-right font-body text-sm text-ink"
              returnKeyType="search"
              textAlign="right"
            />
          </View>
        </View>

        <Text className="font-displayBold text-2xl text-ink">{he.brand}</Text>

        <View className="flex-row items-center gap-4">
          {(
            [
              ['home', he.nav.home],
              ['collections', he.nav.collections],
              ['offers', he.nav.offers],
              ['about', he.nav.about],
            ] as const
          ).map(([key, label]) => (
            <Pressable key={key} onPress={() => onNav?.(key)} hitSlop={6}>
              <Text className="font-bodyMedium text-sm text-ink-soft">{label}</Text>
            </Pressable>
          ))}
        </View>
      </View>
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
      <Text className="mt-0.5 font-body text-[10px] text-ink-muted">{label}</Text>
    </Pressable>
  );
}
