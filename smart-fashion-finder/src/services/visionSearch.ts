import { PRODUCTS } from '@/data/catalog';
import type { GarmentAnalysis, GarmentCategory, GenderFilter } from '@/types';

export type VisualProductMatch = {
  productId: string;
  title: string;
  category: GarmentCategory;
  color: string;
  subcategory: string;
  brand?: string;
  price?: number;
  /** 0–1 similarity */
  score: number;
};

export type VisionAnalyzeResponse = {
  analysis: GarmentAnalysis;
  matches: VisualProductMatch[];
  mode: 'live' | 'mock';
  message?: string;
  error?: string;
};

const DEFAULT_BASE =
  (typeof process !== 'undefined' &&
    process.env?.EXPO_PUBLIC_VTON_API_URL) ||
  'http://127.0.0.1:8787';

export function visionApiBase(): string {
  return DEFAULT_BASE.replace(/\/$/, '');
}

async function uriToBase64(uri: string): Promise<string> {
  const res = await fetch(uri);
  const blob = await res.blob();
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = String(reader.result || '');
      const base64 = result.includes(',') ? result.split(',')[1] : result;
      if (!base64) reject(new Error('Failed to encode image'));
      else resolve(base64);
    };
    reader.onerror = () => reject(new Error('FileReader failed'));
    reader.readAsDataURL(blob);
  });
}

function colorClose(a: string, b: string): boolean {
  const na = a.toLowerCase();
  const nb = b.toLowerCase();
  if (na.includes(nb.split(' ')[0]) || nb.includes(na.split(' ')[0])) return true;
  const pairs: [string, string][] = [
    ['blue', 'navy'],
    ['blue', 'light wash'],
    ['beige', 'khaki'],
    ['beige', 'brown'],
    ['black', 'charcoal'],
  ];
  return pairs.some(
    ([x, y]) =>
      (na.includes(x) && nb.includes(y)) || (na.includes(y) && nb.includes(x)),
  );
}

/** Client-side ranking — used if proxy is unreachable */
export function rankLocalCatalogMatches(
  analysis: GarmentAnalysis,
  limit = 8,
): VisualProductMatch[] {
  const ranked = PRODUCTS.map((p) => {
    let score = 0;
    if (p.category === analysis.category) score += 0.42;
    if (colorClose(p.color, analysis.color)) score += 0.33;
    const subP = p.subcategory.toLowerCase();
    const subA = analysis.subcategory.toLowerCase();
    if (subP.includes(subA) || subA.includes(subP)) score += 0.18;
    return {
      productId: p.id,
      title: p.title,
      category: p.category,
      color: p.color,
      subcategory: p.subcategory,
      brand: p.brand,
      price: p.price,
      score: Math.min(1, Math.round(score * 100) / 100),
    };
  }).sort((a, b) => b.score - a.score);

  return ranked.slice(0, Math.max(3, limit));
}

function localMockAnalyze(
  imageUri: string,
  source: GarmentAnalysis['source'],
  hint?: Partial<{ category: GarmentCategory; color: string; gender: GenderFilter }>,
): VisionAnalyzeResponse {
  const seeds: Omit<GarmentAnalysis, 'id' | 'imageUri' | 'source'>[] = [
    {
      category: 'Pants',
      subcategory: 'ג׳ינס',
      color: 'Blue',
      pattern: 'Solid',
      fit: 'Slim',
      gender: 'Unisex',
      estimatedPriceMin: 150,
      estimatedPriceMax: 250,
      confidence: 0.86,
      boundingBoxes: [{ x: 0.2, y: 0.25, width: 0.55, height: 0.6, label: 'ג׳ינס' }],
    },
    {
      category: 'Outerwear',
      subcategory: 'בומבר',
      color: 'Black',
      pattern: 'Solid',
      fit: 'Regular',
      gender: 'Unisex',
      estimatedPriceMin: 220,
      estimatedPriceMax: 350,
      confidence: 0.84,
      boundingBoxes: [{ x: 0.15, y: 0.1, width: 0.7, height: 0.6, label: 'בומבר' }],
    },
    {
      category: 'Shirts',
      subcategory: 'טי שירט',
      color: 'Black',
      pattern: 'Solid',
      fit: 'Regular',
      gender: 'Unisex',
      estimatedPriceMin: 70,
      estimatedPriceMax: 140,
      confidence: 0.88,
      boundingBoxes: [{ x: 0.18, y: 0.12, width: 0.64, height: 0.55, label: 'טי שירט' }],
    },
  ];

  let base = seeds[Math.abs(imageUri.length) % seeds.length];
  if (hint?.category) {
    const hit = seeds.find((s) => s.category === hint.category);
    if (hit) base = { ...hit, color: hint.color ?? hit.color, gender: hint.gender ?? hit.gender };
  }

  const analysis: GarmentAnalysis = {
    ...base,
    id: `local-vision-${Date.now()}`,
    imageUri,
    source,
    manuallyTagged: false,
  };

  return {
    analysis,
    matches: rankLocalCatalogMatches(analysis),
    mode: 'mock',
    message: 'Proxy unreachable — local mock vision + catalog ranking',
  };
}

/**
 * Zero-click vision search via local proxy.
 * Always returns analysis + at least 3 similar catalog products.
 */
export async function requestVisionAnalyze(options: {
  imageUri: string;
  source: GarmentAnalysis['source'];
  hint?: Partial<{ category: GarmentCategory; color: string; gender: GenderFilter }>;
  signal?: AbortSignal;
}): Promise<VisionAnalyzeResponse> {
  const { imageUri, source, hint, signal } = options;

  let imageBase64 = '';
  try {
    imageBase64 = await uriToBase64(imageUri);
  } catch {
    // still call proxy / local mock without base64
  }

  try {
    const res = await fetch(`${visionApiBase()}/api/vision/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64, imageUri, source, hint }),
      signal,
    });
    const data = (await res.json()) as VisionAnalyzeResponse;
    if (!res.ok) {
      throw new Error(data.error || `Vision HTTP ${res.status}`);
    }
    if (!data.analysis) throw new Error('Vision returned no analysis');

    const matches =
      Array.isArray(data.matches) && data.matches.length >= 3
        ? data.matches
        : rankLocalCatalogMatches(data.analysis);

    return {
      ...data,
      analysis: { ...data.analysis, imageUri: data.analysis.imageUri || imageUri },
      matches,
    };
  } catch {
    return localMockAnalyze(imageUri, source, hint);
  }
}
