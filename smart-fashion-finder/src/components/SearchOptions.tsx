import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  onUpload: () => void;
  onCamera: () => void;
  onAvatar: () => void;
  loading?: boolean;
};

function OptionButton({
  icon,
  title,
  subtitle,
  onPress,
  accent,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
  accent?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`mb-3 flex-row items-center rounded-xl px-4 py-4 ${
        accent ? 'bg-teal' : 'bg-ink'
      }`}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      <View
        className={`mr-4 h-11 w-11 items-center justify-center rounded-lg ${
          accent ? 'bg-teal-deep' : 'bg-ink-soft'
        }`}
      >
        <Ionicons name={icon} size={22} color="#FAF7F2" />
      </View>
      <View className="flex-1">
        <Text className="font-bodyBold text-base text-stone-light">{title}</Text>
        <Text className="mt-0.5 font-body text-sm text-stone-dark">{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#E4DDD2" />
    </Pressable>
  );
}

export function SearchOptions({ onUpload, onCamera, onAvatar, loading }: Props) {
  if (loading) {
    return (
      <View className="items-center justify-center rounded-xl bg-ink py-10">
        <ActivityIndicator color="#FAF7F2" size="large" />
        <Text className="mt-3 font-bodyMedium text-stone-light">
          Identifying garment…
        </Text>
      </View>
    );
  }

  return (
    <View>
      <OptionButton
        icon="image-outline"
        title="Upload Photo"
        subtitle="Pick a look from your gallery"
        onPress={onUpload}
      />
      <OptionButton
        icon="camera-outline"
        title="Camera Snap"
        subtitle="Capture an item you spotted"
        onPress={onCamera}
        accent
      />
      <OptionButton
        icon="body-outline"
        title="AI Avatar Customization"
        subtitle="Style a body type, then find it nearby"
        onPress={onAvatar}
      />
    </View>
  );
}
