import { CATALOG_LITE } from './catalog-lite.mjs';

const COLOR_ALIASES = {
  black: ['black', 'charcoal', 'שחור'],
  white: ['white', 'off-white', 'cream', 'לבן'],
  blue: ['blue', 'navy', 'denim', 'light wash', 'כחול', 'נייבי'],
  green: ['green', 'olive', 'olive green', 'זית'],
  brown: ['brown', 'tan', 'beige', 'khaki', 'חום', 'בז'],
  beige: ['beige', 'cream', 'khaki', 'sand', 'בז', 'חאקי'],
  navy: ['navy', 'blue', 'נייבי'],
};

function norm(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/['׳״"]/g, '')
    .trim();
}

function colorBucket(color) {
  const c = norm(color);
  for (const [bucket, aliases] of Object.entries(COLOR_ALIASES)) {
    if (aliases.some((a) => c.includes(a) || a.includes(c))) return bucket;
  }
  return c.split(/\s+/)[0] || '';
}

function colorsClose(a, b) {
  const ba = colorBucket(a);
  const bb = colorBucket(b);
  if (!ba || !bb) return false;
  if (ba === bb) return true;
  // denim / light wash ↔ blue
  if ((ba === 'blue' && bb === 'navy') || (ba === 'navy' && bb === 'blue')) return true;
  if ((ba === 'beige' && bb === 'brown') || (ba === 'brown' && bb === 'beige')) return true;
  return false;
}

/**
 * Score a catalog row against vision attributes (0–1).
 */
export function scoreProduct(product, attrs) {
  let score = 0;
  if (product.category === attrs.category) score += 0.42;
  if (colorsClose(product.color, attrs.color)) score += 0.33;

  const subP = norm(product.subcategory);
  const subA = norm(attrs.subcategory);
  if (subP && subA && (subP.includes(subA) || subA.includes(subP))) score += 0.18;

  const fitP = norm(product.fit);
  const fitA = norm(attrs.fit);
  if (fitP && fitA && (fitP.includes(fitA) || fitA.includes(fitP))) score += 0.07;

  return Math.min(1, Math.round(score * 100) / 100);
}

/**
 * Rank catalog; always return at least `minCount` (visual fallback).
 */
export function rankCatalogMatches(attrs, { minCount = 3, limit = 8 } = {}) {
  const ranked = CATALOG_LITE.map((p) => ({
    productId: p.id,
    title: p.title,
    category: p.category,
    color: p.color,
    subcategory: p.subcategory,
    brand: p.brand,
    price: p.price,
    score: scoreProduct(p, attrs),
  })).sort((a, b) => b.score - a.score);

  const strong = ranked.filter((r) => r.score >= 0.35);
  const picks = (strong.length >= minCount ? strong : ranked).slice(0, limit);

  // Transparent fallback: pad to minCount from top visual/attribute neighbors
  while (picks.length < minCount && picks.length < ranked.length) {
    const next = ranked[picks.length];
    if (!next) break;
    if (!picks.some((p) => p.productId === next.productId)) picks.push(next);
  }

  return picks;
}

/** Deterministic mock attributes from image payload size / hint */
export function mockAttributesFromImage(imageBase64 = '', hint = {}) {
  const seeds = [
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
    },
    {
      category: 'Pants',
      subcategory: 'קרגו',
      color: 'Olive Green',
      pattern: 'Solid',
      fit: 'Relaxed Utility',
      gender: 'Unisex',
      estimatedPriceMin: 150,
      estimatedPriceMax: 300,
      confidence: 0.9,
    },
    {
      category: 'Shirts',
      subcategory: 'אוקספורד',
      color: 'White',
      pattern: 'Solid',
      fit: 'Classic Regular',
      gender: 'Unisex',
      estimatedPriceMin: 90,
      estimatedPriceMax: 180,
      confidence: 0.87,
    },
    {
      category: 'Outerwear',
      subcategory: 'ג׳קט ג׳ינס',
      color: 'Light Wash',
      pattern: 'Solid',
      fit: 'Oversized',
      gender: 'Unisex',
      estimatedPriceMin: 220,
      estimatedPriceMax: 400,
      confidence: 0.85,
    },
  ];

  if (hint.category) {
    const hit = seeds.find((s) => s.category === hint.category);
    if (hit) {
      return {
        ...hit,
        color: hint.color || hit.color,
        gender: hint.gender || hit.gender,
      };
    }
  }

  let hash = 0;
  const sample = String(imageBase64).slice(0, 800);
  for (let i = 0; i < sample.length; i += 17) {
    hash = (hash * 33 + sample.charCodeAt(i)) >>> 0;
  }
  return { ...seeds[hash % seeds.length] };
}

export function buildAnalysis(attrs, { imageUri, source = 'upload' } = {}) {
  return {
    id: `vision-${Date.now()}`,
    category: attrs.category,
    subcategory: attrs.subcategory,
    color: attrs.color,
    pattern: attrs.pattern || 'Solid',
    fit: attrs.fit || 'Regular',
    gender: attrs.gender || 'Unisex',
    estimatedPriceMin: attrs.estimatedPriceMin ?? 80,
    estimatedPriceMax: attrs.estimatedPriceMax ?? 350,
    confidence: typeof attrs.confidence === 'number' ? attrs.confidence : 0.8,
    boundingBoxes: attrs.boundingBoxes || [
      { x: 0.18, y: 0.12, width: 0.64, height: 0.7, label: attrs.subcategory },
    ],
    imageUri,
    source,
    manuallyTagged: false,
  };
}
