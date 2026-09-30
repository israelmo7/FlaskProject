import { useEffect, useRef, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  HEIGHT_RANGE,
  PERSONA_OPTIONS,
  WEIGHT_RANGE,
  normalizeAdultPersona,
} from '@/constants/avatar';
import { useSavedProfile } from '@/hooks/useSavedProfile';
import { he } from '@/i18n/he';
import type { AvatarPersona, AvatarProfile } from '@/types';

/**
 * יצירת / עריכת פרופיל — בחירת דמות (גבר / אישה בלבד).
 */
export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const {
    ready,
    profile,
    preferredSize,
    onboardingComplete,
    completeOnboarding,
    saveAll,
    layers,
  } = useSavedProfile();

  const editing = onboardingComplete;
  const dirtyRef = useRef(false);

  const [persona, setPersona] = useState<AvatarPersona>(
    normalizeAdultPersona(profile.persona),
  );

  useEffect(() => {
    if (!ready || dirtyRef.current) return;
    setPersona(normalizeAdultPersona(profile.persona));
  }, [ready, profile.persona]);

  const selectPersona = (next: AvatarPersona) => {
    dirtyRef.current = true;
    setPersona(normalizeAdultPersona(next));
  };

  const buildNextProfile = (): AvatarProfile => {
    const next = normalizeAdultPersona(persona);
    return {
      persona: next,
      heightCm: HEIGHT_RANGE[next].default,
      weightKg: WEIGHT_RANGE[next].default,
      build: profile.build || 'average',
    };
  };

  const onContinue = () => {
    const next = buildNextProfile();

    if (editing) {
      const personaChanged = next.persona !== profile.persona;
      saveAll({
        profile: next,
        preferredSize: preferredSize || 'M',
        layers: personaChanged ? {} : layers,
        onboardingComplete: true,
      });
      dirtyRef.current = false;
      Alert.alert(
        he.profileUpdated,
        PERSONA_OPTIONS.find((p) => p.id === next.persona)?.label ?? '',
      );
      router.replace('/(tabs)');
      return;
    }
    completeOnboarding(next, preferredSize || 'M');
    dirtyRef.current = false;
    router.replace('/(tabs)');
  };

  if (!ready) {
    return <View className="flex-1 bg-stone-light" />;
  }

  return (
    <ScrollView
      className="flex-1 bg-stone-light"
      contentContainerStyle={{
        paddingTop: insets.top + 24,
        paddingBottom: insets.bottom + 40,
        paddingHorizontal: 20,
      }}
      keyboardShouldPersistTaps="handled"
    >
      {editing ? (
        <Pressable onPress={() => router.back()} className="mb-3 self-end">
          <Text className="font-bodyMedium text-sm text-teal">← חזרה</Text>
        </Pressable>
      ) : null}

      <Text className="text-right font-display text-3xl text-ink">
        {editing ? he.editProfile : he.onboardingTitle}
      </Text>
      <Text className="mt-2 text-right font-body text-sm text-ink-muted">
        {editing ? he.editProfileHint : he.onboardingHint}
      </Text>

      <View className="mt-8 rounded-2xl border border-[#E07A4F]/35 bg-[#FFF7F2] px-4 py-4">
        <Text className="text-right font-display text-xl text-ink">
          {he.changeAvatarPersona}
        </Text>
        <Text className="mt-1 text-right font-body text-xs text-ink-muted">
          {he.changeAvatarPersonaHint}
        </Text>
        <View className="mt-4 flex-row flex-wrap justify-end gap-2">
          {PERSONA_OPTIONS.map((opt) => {
            const active = persona === opt.id;
            return (
              <Pressable
                key={opt.id}
                onPress={() => selectPersona(opt.id)}
                className={`rounded-full border px-4 py-2.5 ${
                  active
                    ? 'border-[#E07A4F] bg-[#E07A4F]'
                    : 'border-[#D5CFC6] bg-white'
                }`}
              >
                <Text
                  className={`font-bodyBold text-sm ${
                    active ? 'text-white' : 'text-ink'
                  }`}
                >
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <Pressable
        onPress={onContinue}
        className="mt-10 items-center rounded-xl bg-[#E07A4F] py-4"
      >
        <Text className="font-bodyBold text-base text-white">
          {editing ? he.saveProfileChanges : he.onboardingContinue}
        </Text>
      </Pressable>
    </ScrollView>
  );
}
