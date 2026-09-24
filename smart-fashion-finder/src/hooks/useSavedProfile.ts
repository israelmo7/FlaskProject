import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_AVATAR_PROFILE } from '@/constants/avatar';
import { DEFAULT_AREA_ID } from '@/constants/areas';
import type { AvatarProfile, OutfitLayers } from '@/types';

const STORAGE_KEY = '@stylenear/user_prefs_v1';

export type SavedUserPrefs = {
  profile: AvatarProfile;
  preferredSize: string;
  layers: OutfitLayers;
  areaId: string;
};

const DEFAULT_PREFS: SavedUserPrefs = {
  profile: DEFAULT_AVATAR_PROFILE,
  preferredSize: 'M',
  layers: {},
  areaId: DEFAULT_AREA_ID,
};

export function useSavedProfile() {
  const [prefs, setPrefs] = useState<SavedUserPrefs>(DEFAULT_PREFS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw && !cancelled) {
          const parsed = JSON.parse(raw) as Partial<SavedUserPrefs>;
          setPrefs({
            profile: { ...DEFAULT_AVATAR_PROFILE, ...parsed.profile },
            preferredSize: parsed.preferredSize || 'M',
            layers: parsed.layers || {},
            areaId: parsed.areaId || DEFAULT_AREA_ID,
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
      void persist({ ...prefs, profile });
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

  const saveAll = useCallback(
    (partial: Partial<SavedUserPrefs>) => {
      void persist({ ...prefs, ...partial });
    },
    [persist, prefs],
  );

  const reload = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<SavedUserPrefs>;
        setPrefs({
          profile: { ...DEFAULT_AVATAR_PROFILE, ...parsed.profile },
          preferredSize: parsed.preferredSize || 'M',
          layers: parsed.layers || {},
          areaId: parsed.areaId || DEFAULT_AREA_ID,
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
    updateProfile,
    updatePreferredSize,
    updateLayers,
    updateAreaId,
    saveAll,
    reload,
  };
}
