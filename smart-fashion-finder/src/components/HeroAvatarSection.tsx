import { Image, Pressable, Text, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { he } from '@/i18n/he';

type Props = {
  onFindNearMe?: () => void;
  onAvatarPress?: () => void;
};

export function HeroAvatarSection({ onFindNearMe, onAvatarPress }: Props) {
  const { width } = useWindowDimensions();
  const heroHeight = Math.min(520, Math.max(380, width * 0.72));

  return (
    <View
      className="mx-4 mt-4 overflow-hidden rounded-2xl"
      style={{ height: heroHeight }}
    >
      <Image
        source={require('../../assets/images/boutique-bg.png')}
        className="absolute inset-0 h-full w-full"
        resizeMode="cover"
      />
      <LinearGradient
        colors={['rgba(12,14,18,0.35)', 'rgba(12,14,18,0.55)', 'rgba(12,14,18,0.75)']}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      />

      <Text className="mt-6 text-center font-display text-2xl text-white md:text-3xl">
        {he.heroTitle}
      </Text>

      <View className="flex-1 flex-row items-end justify-center px-2 pb-4">
        {/* הדמות */}
        <Pressable onPress={onAvatarPress} className="items-center">
          <Image
            source={require('../../assets/images/avatar-doll.png')}
            style={{
              width: Math.min(260, width * 0.42),
              height: Math.min(360, width * 0.58),
            }}
            resizeMode="contain"
          />
          <Text className="mt-1 font-bodyMedium text-sm text-white">
            {he.heroCaption}
          </Text>
        </Pressable>

        {/* קריאה לדוגמת בד — ג'ינס כחול */}
        <View
          className="absolute items-center"
          style={{
            right: width > 700 ? 48 : 12,
            bottom: heroHeight * 0.28,
            width: 92,
          }}
        >
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              left: -40,
              top: 36,
              width: 44,
              height: 1,
              backgroundColor: 'rgba(255,255,255,0.85)',
            }}
          />
          <Pressable
            onPress={onFindNearMe}
            className="overflow-hidden rounded-md border border-white/80 bg-white"
            style={{ width: 78, height: 78 }}
          >
            <Image
              source={require('../../assets/images/denim-swatch.png')}
              className="h-full w-full"
              resizeMode="cover"
            />
          </Pressable>
          <Text className="mt-1.5 text-center font-bodyMedium text-xs text-white">
            {he.swatchLabel}
          </Text>
        </View>
      </View>
    </View>
  );
}
