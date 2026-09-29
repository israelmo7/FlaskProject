import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  HEIGHT_RANGE,
  PERSONA_OPTIONS,
  WEIGHT_RANGE,
  formatHeightMeters,
  parseHeightInput,
} from '@/constants/avatar';
import { useSavedProfile } from '@/hooks/useSavedProfile';
import { he } from '@/i18n/he';
import type { AvatarPersona, AvatarProfile } from '@/types';

/**
 * יצירת / עריכת פרופיל — שינוי דמות נשמר באמת לכל persona.
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

  const [persona, setPersona] = useState<AvatarPersona>(profile.persona || 'woman');
  const [heightCm, setHeightCm] = useState(
    String(profile.heightCm || HEIGHT_RANGE.woman.default),
  );
  const [weightKg, setWeightKg] = useState(
    String(profile.weightKg || WEIGHT_RANGE.woman.default),
  );

  useEffect(() => {
    if (!ready || dirtyRef.current) return;
    setPersona(profile.persona || 'woman');
    setHeightCm(String(profile.heightCm || HEIGHT_RANGE.woman.default));
    setWeightKg(String(profile.weightKg || WEIGHT_RANGE.woman.default));
  }, [ready, profile.persona, profile.heightCm, profile.weightKg]);

  const heightMeta = HEIGHT_RANGE[persona];
  const weightMeta = WEIGHT_RANGE[persona];

  const selectPersona = (next: AvatarPersona) => {
    dirtyRef.current = true;
    setPersona(next);
    setHeightCm(String(HEIGHT_RANGE[next].default));
    setWeightKg(String(WEIGHT_RANGE[next].default));
  };

  const onHeightChange = (raw: string) => {
    dirtyRef.current = true;
    setHeightCm(raw.replace(/[^\d.,]/g, ''));
  };

  const onWeightChange = (raw: string) => {
    dirtyRef.current = true;
    setWeightKg(raw.replace(/[^0-9]/g, ''));
  };

  const parsedHeight = useMemo(
    () => parseHeightInput(heightCm, persona),
    [heightCm, persona],
  );

  const canContinue = useMemo(() => {
    const w = Number(weightKg);
    return (
      parsedHeight !== null &&
      !Number.isNaN(w) &&
      w >= weightMeta.min &&
      w <= weightMeta.max
    );
  }, [parsedHeight, weightKg, weightMeta]);

  const buildNextProfile = (): AvatarProfile | null => {
    if (parsedHeight === null) return null;
    return {
      persona,
      heightCm: parsedHeight,
      weightKg: Number(weightKg),
      build: profile.build || 'average',
    };
  };

  const onContinue = () => {
    const next = buildNextProfile();
    if (!next || !canContinue) return;

    // שמירה אטומית — דמות חדשה מתחילה בלי בגדים (בסיס חשוף)
    if (editing) {
      const personaChanged = next.persona !== profile.persona;
      saveAll({
        profile: next,
        preferredSize: preferredSize || 'M',
        layers: personaChanged ? {} : layers,
        onboardingComplete: true,
      });
      dirtyRef.current = false;
      Alert.alert(he.profileUpdated, `${PERSONA_OPTIONS.find((p) => p.id === next.persona)?.label ?? ''} · ${formatHeightMeters(next.heightCm)}`);
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

      <Text className="mt-8 mb-2 text-right font-bodyBold text-base text-ink">
        {he.onboardingHeight}
      </Text>
      <Text className="mb-2 text-right font-body text-xs text-ink-muted">
        {heightMeta.min}–{heightMeta.max} {he.cmUnit}
        {parsedHeight ? ` · ${formatHeightMeters(parsedHeight)}` : ''}
      </Text>
      <TextInput
        value={heightCm}
        onChangeText={onHeightChange}
        onBlur={() => {
          if (parsedHeight !== null) setHeightCm(String(parsedHeight));
        }}
        keyboardType="decimal-pad"
        textAlign="right"
        className="rounded-xl border border-[#D5CFC6] bg-white px-4 py-3 font-body text-base text-ink"
        placeholder={`${heightMeta.default} או 1.78`}
        placeholderTextColor="#8A847C"
      />

      <Text className="mt-6 mb-2 text-right font-bodyBold text-base text-ink">
        {he.onboardingWeight}
      </Text>
      <Text className="mb-2 text-right font-body text-xs text-ink-muted">
        {weightMeta.min}–{weightMeta.max} {he.kgUnit}
      </Text>
      <TextInput
        value={weightKg}
        onChangeText={onWeightChange}
        keyboardType="number-pad"
        textAlign="right"
        className="rounded-xl border border-[#D5CFC6] bg-white px-4 py-3 font-body text-base text-ink"
        placeholder={`${weightMeta.default}`}
        placeholderTextColor="#8A847C"
      />

      <Pressable
        onPress={onContinue}
        disabled={!canContinue}
        className={`mt-10 items-center rounded-xl py-4 ${
          canContinue ? 'bg-[#E07A4F]' : 'bg-[#D5CFC6]'
        }`}
      >
        <Text className="font-bodyBold text-base text-white">
          {editing ? he.saveProfileChanges : he.onboardingContinue}
        </Text>
      </Pressable>
    </ScrollView>
  );
}
