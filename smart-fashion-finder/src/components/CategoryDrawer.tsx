import { useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MENU_CATEGORIES } from '@/data/catalog';
import { he } from '@/i18n/he';
import type { GarmentCategory } from '@/types';

type Props = {
  visible: boolean;
  selectedCategory?: GarmentCategory | 'All' | null;
  selectedSub?: string | null;
  onSelect: (category: GarmentCategory, subcategory: string) => void;
  onClose: () => void;
};

/** תפריט המבורגר — קטגוריות עם תתי־סוגים נפתחים */
export function CategoryDrawer({
  visible,
  selectedCategory,
  selectedSub,
  onSelect,
  onClose,
}: Props) {
  const [openId, setOpenId] = useState<GarmentCategory | null>(
    selectedCategory && selectedCategory !== 'All' ? selectedCategory : null,
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 flex-row bg-ink/45">
        <Pressable className="flex-1" onPress={onClose} accessibilityLabel={he.closeMenu} />

        <View className="h-full w-[82%] max-w-[340px] bg-stone-light px-4 pb-10 pt-14">
          <View className="mb-5 flex-row items-center justify-between">
            <Pressable onPress={onClose} hitSlop={12} accessibilityRole="button">
              <Ionicons name="close" size={26} color="#12161C" />
            </Pressable>
            <Text className="font-display text-2xl text-ink">{he.menuCategories}</Text>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {MENU_CATEGORIES.map((cat) => {
              const expanded = openId === cat.id;
              return (
                <View key={cat.id} className="mb-2 overflow-hidden rounded-xl bg-white">
                  <Pressable
                    onPress={() => setOpenId(expanded ? null : cat.id)}
                    className="flex-row items-center justify-between px-4 py-3.5"
                  >
                    <Ionicons
                      name={expanded ? 'chevron-up' : 'chevron-down'}
                      size={18}
                      color="#6B6560"
                    />
                    <Text className="font-bodyBold text-base text-ink">{cat.label}</Text>
                  </Pressable>

                  {expanded
                    ? cat.subs.map((sub) => {
                        const active =
                          selectedCategory === cat.id && selectedSub === sub;
                        return (
                          <Pressable
                            key={sub}
                            onPress={() => {
                              onSelect(cat.id, sub);
                              onClose();
                            }}
                            className={`border-t border-[#F0EBE4] px-4 py-3 ${
                              active ? 'bg-[#E07A4F]/15' : 'bg-[#FAF8F5]'
                            }`}
                          >
                            <Text
                              className={`text-right font-bodyMedium text-sm ${
                                active ? 'text-[#E07A4F]' : 'text-ink-soft'
                              }`}
                            >
                              {sub}
                            </Text>
                          </Pressable>
                        );
                      })
                    : null}
                </View>
              );
            })}
          </ScrollView>

          <Text className="mt-6 text-right font-body text-xs text-ink-muted">
            {he.pilotBadge}
          </Text>
        </View>
      </View>
    </Modal>
  );
}
