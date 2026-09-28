import type { AvatarPersona } from '@/types';

/** POC garments that can call the VTON proxy */
export const VTON_POC_GARMENT_IDS = ['p-tshirt', 'p-denim-jkt'] as const;
export type VtonPocGarmentId = (typeof VTON_POC_GARMENT_IDS)[number];

export function isVtonPocGarment(catalogId: string | null | undefined): boolean {
  if (!catalogId) return false;
  return (VTON_POC_GARMENT_IDS as readonly string[]).includes(catalogId);
}

export type VtonRequest = {
  persona: AvatarPersona;
  garmentId: VtonPocGarmentId | string;
  category?: 'upper_body' | 'lower_body' | 'dresses';
  garmentDes?: string;
  yaw?: number;
};

export type VtonResponse = {
  imageUrl: string;
  mode: 'live' | 'mock';
  message?: string;
  model?: string;
  error?: string;
};

const DEFAULT_BASE =
  (typeof process !== 'undefined' &&
    process.env?.EXPO_PUBLIC_VTON_API_URL) ||
  'http://127.0.0.1:8787';

export function vtonApiBase(): string {
  return DEFAULT_BASE.replace(/\/$/, '');
}

/**
 * Calls the local VTON proxy (never send Replicate token from the client).
 */
export async function requestVtonTryOn(
  body: VtonRequest,
  signal?: AbortSignal,
): Promise<VtonResponse> {
  const res = await fetch(`${vtonApiBase()}/api/vton`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal,
  });
  const data = (await res.json()) as VtonResponse & { error?: string };
  if (!res.ok) {
    throw new Error(data.error || `VTON HTTP ${res.status}`);
  }
  if (!data.imageUrl) {
    throw new Error(data.error || 'VTON returned no imageUrl');
  }
  return data;
}

export async function vtonHealth(): Promise<{
  ok: boolean;
  live: boolean;
}> {
  const res = await fetch(`${vtonApiBase()}/health`);
  if (!res.ok) throw new Error(`VTON health ${res.status}`);
  return res.json();
}
