import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_AVATAR_PROFILE } from '@/constants/avatar';
import { DEFAULT_AREA_ID } from '@/constants/areas';
import type { AvatarProfile, OutfitLayers } from '@/types';

const STORAGE_KEY = '@stylenear/user_prefs_v2';

export type SavedUserPrefs = {
  profile: AvatarProfile;
  preferredSize: string;
  layers: OutfitLayers;
  areaId: string;
  onboardingComplete: boolean;
};

const DEFAULT_PREFS: SavedUserPrefs = {
  profile: DEFAULT_AVATAR_PROFILE,
  preferredSize: 'M',
  layers: {},
  areaId: DEFAULT_AREA_ID,
  onboardingComplete: false,
};

function normalizeProfile(partial?: Partial<AvatarProfile>): AvatarProfile {
  return {
    ...DEFAULT_AVATAR_PROFILE,
    ...partial,
    weightKg: partial?.weightKg ?? DEFAULT_AVATAR_PROFILE.weightKg,
  };
}

export function useSavedProfile() {
  const [prefs, setPrefs] = useState<SavedUserPrefs>(DEFAULT_PREFS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw =
          (await AsyncStorage.getItem(STORAGE_KEY)) ||
          (await AsyncStorage.getItem('@stylenear/user_prefs_v1'));
        if (raw && !cancelled) {
          const parsed = JSON.parse(raw) as Partial<SavedUserPrefs>;
          setPrefs({
            profile: normalizeProfile(parsed.profile),
            preferredSize: parsed.preferredSize || 'M',
            layers: parsed.layers || {},
            areaId: parsed.areaId || DEFAULT_AREA_ID,
            onboardingComplete: Boolean(parsed.onboardingComplete),
          });
        }
      } catch {
        // keep defaults
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const persist = useCallback(async (next: SavedUserPrefs) => {
    setPrefs(next);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore write errors in demo
    }
  }, []);

  const updateProfile = useCallback(
    (profile: AvatarProfile) => {
      void persist({ ...prefs, profile: normalizeProfile(profile) });
    },
    [persist, prefs],
  );

  const updatePreferredSize = useCallback(
    (preferredSize: string) => {
      void persist({ ...prefs, preferredSize });
    },
    [persist, prefs],
  );

  const updateLayers = useCallback(
    (layers: OutfitLayers) => {
      void persist({ ...prefs, layers });
    },
    [persist, prefs],
  );

  const updateAreaId = useCallback(
    (areaId: string) => {
      void persist({ ...prefs, areaId });
    },
    [persist, prefs],
  );

  const completeOnboarding = useCallback(
    (profile: AvatarProfile, preferredSize?: string) => {
      void persist({
        ...prefs,
        profile: normalizeProfile(profile),
        preferredSize: preferredSize || prefs.preferredSize,
        onboardingComplete: true,
      });
    },
    [persist, prefs],
  );

  const saveAll = useCallback(
    (partial: Partial<SavedUserPrefs>) => {
      void persist({
        ...prefs,
        ...partial,
        profile: normalizeProfile(partial.profile ?? prefs.profile),
      });
    },
    [persist, prefs],
  );

  const reload = useCallback(async () => {
    try {
      const raw =
        (await AsyncStorage.getItem(STORAGE_KEY)) ||
        (await AsyncStorage.getItem('@stylenear/user_prefs_v1'));
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<SavedUserPrefs>;
        setPrefs({
          profile: normalizeProfile(parsed.profile),
          preferredSize: parsed.preferredSize || 'M',
          layers: parsed.layers || {},
          areaId: parsed.areaId || DEFAULT_AREA_ID,
          onboardingComplete: Boolean(parsed.onboardingComplete),
        });
      }
    } catch {
      // keep current
    }
  }, []);

  return {
    ready,
    prefs,
    profile: prefs.profile,
    preferredSize: prefs.preferredSize,
    layers: prefs.layers,
    areaId: prefs.areaId,
    onboardingComplete: prefs.onboardingComplete,
    updateProfile,
    updatePreferredSize,
    updateLayers,
    updateAreaId,
    completeOnboarding,
    saveAll,
    reload,
  };
}
