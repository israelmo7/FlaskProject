import { Image, Pressable, Text, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { DressableFigure } from '@/components/DressableFigure';
import { PERSONA_OPTIONS } from '@/constants/avatar';
import { he } from '@/i18n/he';
import type { AvatarPersona, AvatarProfile, OutfitLayers, OutfitPiece } from '@/types';

type Props = {
  profile: AvatarProfile;
  layers: OutfitLayers;
  onPersonaChange: (persona: AvatarPersona) => void;
  onRemovePiece?: (piece: OutfitPiece) => void;
  onFindNearMe?: () => void;
  onEditAvatar?: () => void;
};

export function HeroAvatarSection({
  profile,
  layers,
  onPersonaChange,
  onRemovePiece,
  onFindNearMe,
  onEditAvatar,
}: Props) {
  const { width } = useWindowDimensions();

  return (
    <View className="mx-4 mt-4 overflow-hidden rounded-2xl bg-[#12161C]">
      <Image
        source={require('../../assets/images/boutique-bg.png')}
        className="absolute inset-0 h-full w-full"
        resizeMode="cover"
        style={{ opacity: 0.45 }}
      />
      <LinearGradient
        colors={['rgba(12,14,18,0.5)', 'rgba(12,14,18,0.75)', 'rgba(12,14,18,0.92)']}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />

      <Text className="mt-5 text-center font-display text-2xl text-white">
        {he.heroTitle}
      </Text>
      <Text className="mt-1 px-4 text-center font-body text-xs text-stone-dark">
        הבובה שאתם מלבישים — בחרו גיל ומין, והוסיפו בגדים
      </Text>

      <View className="mt-3 flex-row flex-wrap justify-center px-2">
        {PERSONA_OPTIONS.map((opt) => {
          const active = profile.persona === opt.id;
          return (
            <Pressable
              key={opt.id}
              onPress={() => onPersonaChange(opt.id)}
              className={`mb-1.5 mx-1 rounded-full px-3 py-1.5 ${
                active ? 'bg-[#E07A4F]' : 'bg-white/15'
              }`}
            >
              <Text
                className={`font-bodyMedium text-xs ${
                  active ? 'text-white' : 'text-stone-light'
                }`}
              >
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View className="mt-2 items-center px-2 pb-2">
        <Pressable onPress={onEditAvatar}>
          <DressableFigure
            compact={width < 500}
            profile={profile}
            layers={layers}
            onRemovePiece={onRemovePiece}
          />
        </Pressable>
      </View>

      <View className="flex-row items-center justify-center gap-2 px-4 pb-4">
        <Pressable
          onPress={onEditAvatar}
          className="rounded-full border border-white/40 px-4 py-2"
        >
          <Text className="font-bodyMedium text-sm text-white">עריכת בובה</Text>
        </Pressable>
        <Pressable
          onPress={onFindNearMe}
          className="rounded-full bg-[#E07A4F] px-4 py-2"
        >
          <Text className="font-bodyBold text-sm text-white">{he.findNearMe}</Text>
        </Pressable>
      </View>
    </View>
  );
}
