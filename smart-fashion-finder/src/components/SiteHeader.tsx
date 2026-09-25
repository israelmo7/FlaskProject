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
  onMenu?: () => void;
  onCamera?: () => void;
  onGallery?: () => void;
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

/** כותרת קומפקטית — שורה אחת: תפריט · חיפוש קטן · אייקונים */
export function SiteHeader({
  query,
  onQueryChange,
  onSearchSubmit,
  onCart,
  onProfile,
  onArea,
  onMenu,
  onCamera,
  onGallery,
  areaLabel,
  cartCount = 0,
  locationMode = 'nearby',
  onLocationModeChange,
  onVoiceSearch,
  listening = false,
}: Props) {
  const [locMenuOpen, setLocMenuOpen] = useState(false);
  const [cameraMenuOpen, setCameraMenuOpen] = useState(false);
  const [locAnchor, setLocAnchor] = useState({ x: 0, y: 0 });

  const locLabel =
    LOC_OPTIONS.find((o) => o.id === locationMode)?.label ?? he.locNearby;

  const selectLoc = (mode: LocationSearchMode) => {
    setLocMenuOpen(false);
    onLocationModeChange?.(mode);
    if (mode === 'other') onArea?.();
  };

  return (
    <View className="border-b border-[#E8E4DE] bg-white px-3 pb-2 pt-1.5">
      <View className="flex-row items-center gap-2">
        <Pressable
          onPress={onMenu}
          hitSlop={8}
          accessibilityLabel={he.menuCategories}
          className="rounded-lg bg-[#F3F0EB] p-2"
        >
          <Ionicons name="menu" size={20} color="#12161C" />
        </Pressable>

        <Text className="font-displayBold text-lg text-ink">{he.brand}</Text>

        {/* חיפוש קומפקטי (~חצי מהקודם) */}
        <View
          className="min-w-0 flex-1 flex-row items-center rounded-full border border-[#D9D3C9] bg-[#FAF8F5] px-2 py-1"
          style={{ direction: 'ltr', maxWidth: 220 }}
        >
          <Pressable
            onPress={() => setCameraMenuOpen(true)}
            hitSlop={6}
            accessibilityLabel={he.openCamera}
            className="px-0.5"
          >
            <Ionicons name="camera-outline" size={16} color="#1A1A1A" />
          </Pressable>
          <Pressable
            onPress={onVoiceSearch}
            hitSlop={6}
            accessibilityLabel={he.voiceSearch}
            className="px-0.5"
          >
            <Ionicons
              name={listening ? 'mic' : 'mic-outline'}
              size={14}
              color={listening ? '#E07A4F' : '#6B6560'}
            />
          </Pressable>
          <Pressable
            onPress={(e) => {
              const ne = e.nativeEvent as { pageX?: number; pageY?: number };
              setLocAnchor({
                x: typeof ne.pageX === 'number' ? ne.pageX : 24,
                y: typeof ne.pageY === 'number' ? ne.pageY + 12 : 56,
              });
              setLocMenuOpen(true);
            }}
            className="mx-0.5 flex-row items-center rounded-full bg-white px-1.5 py-0.5"
            hitSlop={4}
          >
            <Text className="font-bodyMedium text-[9px] text-ink">{locLabel}</Text>
            <Ionicons name="chevron-down" size={10} color="#6B6560" />
          </Pressable>
          <Ionicons name="search" size={13} color="#6B6560" />
          <TextInput
            value={query}
            onChangeText={onQueryChange}
            onSubmitEditing={onSearchSubmit}
            placeholder={listening ? he.listening : he.searchPlaceholder}
            placeholderTextColor="#8A847C"
            className="ml-1 flex-1 font-body text-xs text-ink"
            returnKeyType="search"
            textAlign="right"
            style={{ direction: 'rtl', paddingVertical: 2, maxHeight: 22 }}
          />
        </View>

        <View className="flex-row items-center">
          <View className="relative">
            <HeaderIcon icon="cart-outline" label={he.cart} onPress={onCart} />
            {cartCount > 0 ? (
              <View className="absolute -left-0.5 -top-0.5 min-w-[14px] items-center rounded-full bg-[#E07A4F] px-0.5">
                <Text className="font-bodyBold text-[8px] text-white">
                  {cartCount}
                </Text>
              </View>
            ) : null}
          </View>
          <HeaderIcon
            icon="person-outline"
            label={he.profile}
            onPress={onProfile}
          />
          <HeaderIcon
            icon="location-outline"
            label={areaLabel || he.area}
            onPress={onArea}
          />
        </View>
      </View>

      <Modal
        visible={cameraMenuOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setCameraMenuOpen(false)}
      >
        <Pressable
          className="flex-1 justify-end bg-ink/45"
          onPress={() => setCameraMenuOpen(false)}
        >
          <View className="rounded-t-3xl bg-white px-5 pb-10 pt-4">
            <Text className="mb-4 text-center font-display text-xl text-ink">
              {he.captureTitle}
            </Text>
            <Pressable
              onPress={() => {
                setCameraMenuOpen(false);
                onCamera?.();
              }}
              className="mb-2 flex-row items-center justify-between rounded-xl bg-[#F3F0EB] px-4 py-4"
            >
              <Ionicons name="camera" size={22} color="#12161C" />
              <Text className="font-bodyBold text-base text-ink">{he.openCamera}</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                setCameraMenuOpen(false);
                onGallery?.();
              }}
              className="flex-row items-center justify-between rounded-xl bg-[#F3F0EB] px-4 py-4"
            >
              <Ionicons name="images-outline" size={22} color="#12161C" />
              <Text className="font-bodyBold text-base text-ink">{he.openGallery}</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      {/* תפריט סביבי קומפקטי — בגודל המילים, לא על כל המסך */}
      <Modal
        visible={locMenuOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setLocMenuOpen(false)}
      >
        <Pressable className="flex-1" onPress={() => setLocMenuOpen(false)}>
          <View
            className="absolute rounded-xl border border-[#E8E4DE] bg-white py-1 shadow-sm"
            style={{
              top: Math.max(48, locAnchor.y),
              left: Math.max(8, locAnchor.x - 20),
              minWidth: 96,
            }}
          >
            {LOC_OPTIONS.map((opt) => {
              const active = locationMode === opt.id;
              return (
                <Pressable
                  key={opt.id}
                  onPress={() => selectLoc(opt.id)}
                  className={`px-3 py-2 ${active ? 'bg-[#FFF1EA]' : ''}`}
                >
                  <Text
                    className={`text-right font-bodyMedium text-xs ${
                      active ? 'text-[#E07A4F]' : 'text-ink'
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
    <Pressable onPress={onPress} className="items-center px-1" hitSlop={6}>
      <Ionicons name={icon} size={18} color="#1A1A1A" />
      <Text className="mt-0.5 font-body text-[8px] text-ink-muted" numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}
