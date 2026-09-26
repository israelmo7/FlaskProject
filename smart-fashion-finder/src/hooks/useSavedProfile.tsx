import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_AVATAR_PROFILE } from '@/constants/avatar';
import { DEFAULT_AREA_ID } from '@/constants/areas';
import { PRODUCTS } from '@/data/catalog';
import type { AvatarProfile, CartItem, OutfitLayers, OutfitPiece } from '@/types';

const STORAGE_KEY = '@stylenear/user_prefs_v3';
const LEGACY_KEYS = ['@stylenear/user_prefs_v2', '@stylenear/user_prefs_v1'] as const;

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

/** אינדקס מחירים — במקום סריקת PRODUCTS בכל הוספה לסל */
const PRICE_BY_LAYER = new Map<string, number>();
const PRICE_BY_PRODUCT_ID = new Map<string, number>();
const PRICE_BY_TITLE = new Map<string, number>();
for (const p of PRODUCTS) {
  if (typeof p.price !== 'number') continue;
  PRICE_BY_PRODUCT_ID.set(p.id, p.price);
  PRICE_BY_TITLE.set(p.title, p.price);
  if (p.layerId) PRICE_BY_LAYER.set(p.layerId, p.price);
}

function normalizeProfile(partial?: Partial<AvatarProfile>): AvatarProfile {
  return {
    ...DEFAULT_AVATAR_PROFILE,
    ...partial,
    weightKg: partial?.weightKg ?? DEFAULT_AVATAR_PROFILE.weightKg,
  };
}

function priceForPiece(piece: OutfitPiece): number {
  if (typeof piece.price === 'number') return piece.price;
  for (const [layerId, price] of PRICE_BY_LAYER) {
    if (piece.id.startsWith(layerId) || piece.id.includes(layerId)) return price;
  }
  for (const [pid, price] of PRICE_BY_PRODUCT_ID) {
    if (piece.id.includes(pid)) return price;
  }
  return PRICE_BY_TITLE.get(piece.label) ?? 149;
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

type PrefsApi = {
  ready: boolean;
  prefs: SavedUserPrefs;
  profile: AvatarProfile;
  preferredSize: string;
  layers: OutfitLayers;
  cart: CartItem[];
  areaId: string;
  onboardingComplete: boolean;
  updateProfile: (profile: AvatarProfile) => void;
  updatePreferredSize: (preferredSize: string) => void;
  updateLayers: (layers: OutfitLayers | ((prev: OutfitLayers) => OutfitLayers)) => void;
  updateAreaId: (areaId: string) => void;
  updateCart: (cart: CartItem[]) => void;
  saveLookToCart: () => number;
  addPieceToCart: (piece: OutfitPiece) => void;
  removeCartItem: (id: string) => void;
  clearCart: () => void;
  completeOnboarding: (profile: AvatarProfile, preferredSize?: string) => void;
  saveAll: (partial: Partial<SavedUserPrefs>) => void;
  reload: () => Promise<void>;
};

const SavedProfileContext = createContext<PrefsApi | null>(null);

function useSavedProfileState(): PrefsApi {
  const [prefs, setPrefs] = useState<SavedUserPrefs>(DEFAULT_PREFS);
  const [ready, setReady] = useState(false);
  const prefsRef = useRef(prefs);
  const writeChain = useRef(Promise.resolve());

  useEffect(() => {
    prefsRef.current = prefs;
  }, [prefs]);

  const writeStorage = useCallback((next: SavedUserPrefs) => {
    writeChain.current = writeChain.current
      .then(async () => {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        // ניקוי מפתחות ישנים אחרי מיגרציה מוצלחת
        await Promise.all(LEGACY_KEYS.map((k) => AsyncStorage.removeItem(k).catch(() => undefined)));
      })
      .catch(() => undefined);
  }, []);

  /** עדכון פונקציונלי — מונע דריסת state בשינויים רצופים */
  const patchPrefs = useCallback(
    (updater: (prev: SavedUserPrefs) => SavedUserPrefs) => {
      setPrefs((prev) => {
        const next = updater(prev);
        prefsRef.current = next;
        writeStorage(next);
        return next;
      });
    },
    [writeStorage],
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        let raw = await AsyncStorage.getItem(STORAGE_KEY);
        let fromLegacy = false;
        if (!raw) {
          for (const key of LEGACY_KEYS) {
            raw = await AsyncStorage.getItem(key);
            if (raw) {
              fromLegacy = true;
              break;
            }
          }
        }
        if (raw && !cancelled) {
          const normalized = normalizePrefs(JSON.parse(raw) as Partial<SavedUserPrefs>);
          setPrefs(normalized);
          prefsRef.current = normalized;
          if (fromLegacy) writeStorage(normalized);
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
  }, [writeStorage]);

  const updateProfile = useCallback(
    (profile: AvatarProfile) => {
      patchPrefs((prev) => ({ ...prev, profile: normalizeProfile(profile) }));
    },
    [patchPrefs],
  );

  const updatePreferredSize = useCallback(
    (preferredSize: string) => {
      patchPrefs((prev) => ({ ...prev, preferredSize }));
    },
    [patchPrefs],
  );

  const updateLayers = useCallback(
    (layers: OutfitLayers | ((prev: OutfitLayers) => OutfitLayers)) => {
      patchPrefs((prev) => ({
        ...prev,
        layers: typeof layers === 'function' ? layers(prev.layers) : layers,
      }));
    },
    [patchPrefs],
  );

  const updateAreaId = useCallback(
    (areaId: string) => {
      patchPrefs((prev) => ({ ...prev, areaId }));
    },
    [patchPrefs],
  );

  const updateCart = useCallback(
    (cart: CartItem[]) => {
      patchPrefs((prev) => ({ ...prev, cart }));
    },
    [patchPrefs],
  );

  const saveLookToCart = useCallback(() => {
    const current = prefsRef.current;
    const pieces = layersToPieces(current.layers);
    if (pieces.length === 0) return 0;
    const now = new Date().toISOString();
    const additions: CartItem[] = pieces.map((p) => ({
      ...p,
      id: `cart-${p.id}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      price: priceForPiece(p),
      addedAt: now,
    }));
    patchPrefs((prev) => ({ ...prev, cart: [...prev.cart, ...additions] }));
    return additions.length;
  }, [patchPrefs]);

  const addPieceToCart = useCallback(
    (piece: OutfitPiece) => {
      const now = new Date().toISOString();
      const item: CartItem = {
        ...piece,
        id: `cart-${piece.id}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        price: priceForPiece(piece),
        addedAt: now,
      };
      patchPrefs((prev) => ({ ...prev, cart: [...prev.cart, item] }));
    },
    [patchPrefs],
  );

  const removeCartItem = useCallback(
    (id: string) => {
      patchPrefs((prev) => ({
        ...prev,
        cart: prev.cart.filter((c) => c.id !== id),
      }));
    },
    [patchPrefs],
  );

  const clearCart = useCallback(() => {
    patchPrefs((prev) => ({ ...prev, cart: [] }));
  }, [patchPrefs]);

  const completeOnboarding = useCallback(
    (profile: AvatarProfile, preferredSize?: string) => {
      patchPrefs((prev) => ({
        ...prev,
        profile: normalizeProfile(profile),
        preferredSize: preferredSize || prev.preferredSize,
        onboardingComplete: true,
      }));
    },
    [patchPrefs],
  );

  const saveAll = useCallback(
    (partial: Partial<SavedUserPrefs>) => {
      patchPrefs((prev) => ({
        ...prev,
        ...partial,
        profile: normalizeProfile(partial.profile ?? prev.profile),
        cart: partial.cart ?? prev.cart,
        layers: partial.layers ?? prev.layers,
      }));
    },
    [patchPrefs],
  );

  const reload = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const normalized = normalizePrefs(JSON.parse(raw) as Partial<SavedUserPrefs>);
        setPrefs(normalized);
        prefsRef.current = normalized;
      }
    } catch {
      // keep
    }
  }, []);

  return useMemo(
    () => ({
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
    }),
    [
      ready,
      prefs,
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
    ],
  );
}

export function SavedProfileProvider({ children }: { children: ReactNode }) {
  const value = useSavedProfileState();
  return (
    <SavedProfileContext.Provider value={value}>{children}</SavedProfileContext.Provider>
  );
}

export function useSavedProfile(): PrefsApi {
  const ctx = useContext(SavedProfileContext);
  if (!ctx) {
    throw new Error('useSavedProfile must be used within SavedProfileProvider');
  }
  return ctx;
}
