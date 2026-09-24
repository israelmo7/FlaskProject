import { Modal, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { categoryLabel, he } from '@/i18n/he';
import type { GarmentCategory } from '@/types';

const CATEGORIES: (GarmentCategory | 'All')[] = [
  'All',
  'Pants',
  'Shirts',
  'Outerwear',
];

type Props = {
  visible: boolean;
  selected: GarmentCategory | 'All';
  onSelect: (category: GarmentCategory | 'All') => void;
  onClose: () => void;
};

export function CategoryDrawer({ visible, selected, onSelect, onClose }: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 flex-row bg-ink/45">
        {/* tap outside to close — left side empty in RTL overlay */}
        <Pressable className="flex-1" onPress={onClose} accessibilityLabel={he.closeMenu} />

        <View className="h-full w-[78%] max-w-[320px] bg-stone-light px-5 pb-10 pt-14">
          <View className="mb-6 flex-row items-center justify-between">
            <Pressable onPress={onClose} hitSlop={12} accessibilityRole="button">
              <Ionicons name="close" size={26} color="#12161C" />
            </Pressable>
            <Text className="font-display text-2xl text-ink">{he.menuCategories}</Text>
          </View>

          {CATEGORIES.map((category) => {
            const active = selected === category;
            return (
              <Pressable
                key={category}
                onPress={() => {
                  onSelect(category);
                  onClose();
                }}
                className={`mb-2 rounded-xl px-4 py-4 ${
                  active ? 'bg-teal' : 'bg-stone'
                }`}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
              >
                <Text
                  className={`text-right font-bodyBold text-base ${
                    active ? 'text-stone-light' : 'text-ink'
                  }`}
                >
                  {categoryLabel[category] ?? category}
                </Text>
              </Pressable>
            );
          })}

          <Text className="mt-8 text-right font-body text-sm text-ink-muted">
            {he.pilotBadge}
          </Text>
        </View>
      </View>
    </Modal>
  );
}
