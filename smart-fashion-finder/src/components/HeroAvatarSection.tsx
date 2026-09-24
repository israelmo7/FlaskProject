import { Pressable, Text, View, useWindowDimensions } from 'react-native';
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
  const compact = width < 500;

  return (
    <View className="mx-4 mt-4 bg-white">
      <Text className="text-right font-display text-2xl text-ink">{he.heroTitle}</Text>
      <Text className="mt-1 text-right font-body text-xs text-ink-muted">
        הבובה שאתם מלבישים — בחרו גיל ומין, והוסיפו בגדים
      </Text>

      <View className="mt-3 flex-row flex-wrap justify-end px-0">
        {PERSONA_OPTIONS.map((opt) => {
          const active = profile.persona === opt.id;
          return (
            <Pressable
              key={opt.id}
              onPress={() => onPersonaChange(opt.id)}
              className={`mb-1.5 ml-1.5 rounded-full px-3 py-1.5 ${
                active ? 'bg-[#E07A4F]' : 'bg-[#F3F0EB]'
              }`}
            >
              <Text
                className={`font-bodyMedium text-xs ${
                  active ? 'text-white' : 'text-ink'
                }`}
              >
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* בובה בצד שמאל — בלי רקע חנות מאחוריה */}
      <View className="mt-2 flex-row items-end justify-start">
        <Pressable onPress={onEditAvatar} className="items-start">
          <DressableFigure
            compact={compact}
            profile={profile}
            layers={layers}
            onRemovePiece={onRemovePiece}
          />
        </Pressable>

        <View className="mb-6 ml-3 flex-1 items-start gap-2 pb-2">
          <Pressable
            onPress={onEditAvatar}
            className="rounded-full border border-[#D5CFC6] px-4 py-2"
          >
            <Text className="font-bodyMedium text-sm text-ink">עריכת בובה</Text>
          </Pressable>
          <Pressable
            onPress={onFindNearMe}
            className="rounded-full bg-[#E07A4F] px-4 py-2"
          >
            <Text className="font-bodyBold text-sm text-white">{he.findNearMe}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
