import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_AVATAR_PROFILE } from '@/constants/avatar';
import { DEFAULT_AREA_ID } from '@/constants/areas';
import { PRODUCTS } from '@/data/catalog';
import type { AvatarProfile, CartItem, OutfitLayers, OutfitPiece } from '@/types';

const STORAGE_KEY = '@stylenear/user_prefs_v3';

export type SavedUserPrefs = {
  profile: AvatarProfile;
  preferredSize: string;
  layers: OutfitLayers;
  cart: CartItem[];
  areaId: string;
  onboardingComplete: boolean;
};

const DEFAULT_PREFS: SavedUserPrefs = {
  profile: DEFAULT_AVATAR_PROFILE,
  preferredSize: 'M',
  layers: {},
  cart: [],
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

function priceForPiece(piece: OutfitPiece): number {
  if (typeof piece.price === 'number') return piece.price;
  const match = PRODUCTS.find(
    (p) =>
      p.title === piece.label ||
      (piece.id.includes(p.id) || (p.layerId && piece.id.startsWith(p.layerId))),
  );
  return match?.price ?? 149;
}

function layersToPieces(layers: OutfitLayers): OutfitPiece[] {
  return [layers.dress, layers.top, layers.bottom, layers.outer, layers.shoes].filter(
    Boolean,
  ) as OutfitPiece[];
}

function normalizePrefs(parsed: Partial<SavedUserPrefs>): SavedUserPrefs {
  return {
    profile: normalizeProfile(parsed.profile),
    preferredSize: parsed.preferredSize || 'M',
    layers: parsed.layers || {},
    cart: Array.isArray(parsed.cart) ? parsed.cart : [],
    areaId: parsed.areaId || DEFAULT_AREA_ID,
    onboardingComplete: Boolean(parsed.onboardingComplete),
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
          (await AsyncStorage.getItem('@stylenear/user_prefs_v2')) ||
          (await AsyncStorage.getItem('@stylenear/user_prefs_v1'));
        if (raw && !cancelled) {
          setPrefs(normalizePrefs(JSON.parse(raw) as Partial<SavedUserPrefs>));
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
      // ignore
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

  const updateCart = useCallback(
    (cart: CartItem[]) => {
      void persist({ ...prefs, cart });
    },
    [persist, prefs],
  );

  /** שמירת לוק — כל מה שעל הבובה נכנס לסל */
  const saveLookToCart = useCallback(() => {
    const pieces = layersToPieces(prefs.layers);
    if (pieces.length === 0) return 0;
    const now = new Date().toISOString();
    const additions: CartItem[] = pieces.map((p) => ({
      ...p,
      id: `cart-${p.id}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      price: priceForPiece(p),
      addedAt: now,
    }));
    void persist({ ...prefs, cart: [...prefs.cart, ...additions] });
    return additions.length;
  }, [persist, prefs]);

  /** הוספת פריט בודד לסל (ממסך פרטי מוצר) */
  const addPieceToCart = useCallback(
    (piece: OutfitPiece) => {
      const now = new Date().toISOString();
      const item: CartItem = {
        ...piece,
        id: `cart-${piece.id}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        price: priceForPiece(piece),
        addedAt: now,
      };
      void persist({ ...prefs, cart: [...prefs.cart, item] });
    },
    [persist, prefs],
  );

  const removeCartItem = useCallback(
    (id: string) => {
      void persist({ ...prefs, cart: prefs.cart.filter((c) => c.id !== id) });
    },
    [persist, prefs],
  );

  const clearCart = useCallback(() => {
    void persist({ ...prefs, cart: [] });
  }, [persist, prefs]);

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
        cart: partial.cart ?? prefs.cart,
      });
    },
    [persist, prefs],
  );

  const reload = useCallback(async () => {
    try {
      const raw =
        (await AsyncStorage.getItem(STORAGE_KEY)) ||
        (await AsyncStorage.getItem('@stylenear/user_prefs_v2')) ||
        (await AsyncStorage.getItem('@stylenear/user_prefs_v1'));
      if (raw) setPrefs(normalizePrefs(JSON.parse(raw) as Partial<SavedUserPrefs>));
    } catch {
      // keep
    }
  }, []);

  return {
    ready,
    prefs,
    profile: prefs.profile,
    preferredSize: prefs.preferredSize,
    layers: prefs.layers,
    cart: prefs.cart,
    areaId: prefs.areaId,
    onboardingComplete: prefs.onboardingComplete,
    updateProfile,
    updatePreferredSize,
    updateLayers,
    updateAreaId,
    updateCart,
    saveLookToCart,
    addPieceToCart,
    removeCartItem,
    clearCart,
    completeOnboarding,
    saveAll,
    reload,
  };
}
