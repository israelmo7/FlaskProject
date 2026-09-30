/**
 * StyleNear API proxy — keeps secrets off the client.
 *
 * POST /api/vton
 *   body: { persona?, garmentId?, category?, garmentDes?, yaw? }
 *   → { imageUrl, mode: 'live'|'mock', model? }
 *
 * POST /api/vision/analyze
 *   body: { imageBase64?, imageUri?, source?, hint? }
 *   → { analysis, matches[{ productId, score, ... }], mode: 'live'|'mock' }
 *
 * GET /health
 *
 * Without REPLICATE_API_TOKEN / OPENAI_API_KEY, returns mock responses so UI works.
 */
import cors from 'cors';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Replicate from 'replicate';
import {
  buildAnalysis,
  mockAttributesFromImage,
  rankCatalogMatches,
} from './vision-match.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PORT = Number(process.env.VTON_PORT || 8787);
const MODEL = process.env.REPLICATE_VTON_MODEL || 'cuuupid/idm-vton';
const TOKEN = process.env.REPLICATE_API_TOKEN || '';
const OPENAI_KEY = process.env.OPENAI_API_KEY || '';
const OPENAI_VISION_MODEL =
  process.env.OPENAI_VISION_MODEL || 'gpt-4o-mini';

/** POC garment map — expand later */
const GARMENTS = {
  'p-tshirt': {
    file: path.join(ROOT, 'assets/images/product-tshirt.png'),
    fallback: path.join(ROOT, 'assets/images/layers/cutouts/tshirt.png'),
    category: 'upper_body',
    garmentDes: 'Short sleeve black crew neck t-shirt',
    mockFitted: path.join(ROOT, 'assets/images/fit/man/p-tshirt.png'),
  },
  'p-denim-jkt': {
    file: path.join(ROOT, 'assets/images/product-denim-jacket.png'),
    fallback: path.join(ROOT, 'assets/images/layers/cutouts/denim-jkt.png'),
    category: 'upper_body',
    garmentDes: 'Blue denim jacket',
    mockFitted: path.join(ROOT, 'assets/images/fit/man/p-denim-jkt.png'),
  },
};

const PERSONA_BASE = {
  man: path.join(ROOT, 'assets/images/bases/turn/man_0.png'),
  woman: path.join(ROOT, 'assets/images/bases/turn/woman_0.png'),
  teenBoy: path.join(ROOT, 'assets/images/bases/teenBoy.png'),
  teenGirl: path.join(ROOT, 'assets/images/bases/teenGirl.png'),
  boy: path.join(ROOT, 'assets/images/bases/boy.png'),
  girl: path.join(ROOT, 'assets/images/bases/girl.png'),
};

function resolveExisting(...candidates) {
  for (const p of candidates) {
    if (p && fs.existsSync(p)) return p;
  }
  return null;
}

const app = express();
app.use(cors());
app.use(express.json({ limit: '12mb' }));

/** Serve mock / local assets for the Expo web client */
app.use(
  '/static',
  express.static(path.join(ROOT, 'assets/images'), {
    maxAge: '1h',
    fallthrough: true,
  }),
);

app.get('/health', (_req, res) => {
  res.json({
    ok: true,
    live: Boolean(TOKEN),
    visionLive: Boolean(OPENAI_KEY),
    model: MODEL,
    visionModel: OPENAI_VISION_MODEL,
    pocGarments: Object.keys(GARMENTS),
  });
});

async function liveVisionAttributes(imageBase64) {
  const raw = String(imageBase64 || '').replace(/^data:image\/\w+;base64,/, '');
  if (!raw) throw new Error('imageBase64 required for live vision');

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENAI_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: OPENAI_VISION_MODEL,
      temperature: 0.1,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            'You analyze fashion product photos. Reply ONLY with JSON keys: category (Pants|Shirts|Outerwear|Dresses|Shoes|Hats|Socks|Underwear), subcategory (short Hebrew or English label), color (English catalog color e.g. Black, Blue, Olive Green, Light Wash, White, Navy, Brown, Beige, Khaki, Charcoal), pattern, fit, gender (Men|Women|Unisex), confidence (0-1), estimatedPriceMin, estimatedPriceMax.',
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Identify the main garment in this photo for catalog matching.',
            },
            {
              type: 'image_url',
              image_url: { url: `data:image/jpeg;base64,${raw}` },
            },
          ],
        },
      ],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenAI vision ${res.status}: ${errText.slice(0, 200)}`);
  }
  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  const parsed = typeof content === 'string' ? JSON.parse(content) : content;
  if (!parsed?.category) throw new Error('Vision JSON missing category');
  return parsed;
}

/**
 * Zero-click visual search: attributes + ranked catalog matches.
 * Low confidence → still returns top visual/attribute neighbors (no tagging UI).
 */
app.post('/api/vision/analyze', async (req, res) => {
  try {
    const {
      imageBase64 = '',
      imageUri = '',
      source = 'upload',
      hint = {},
    } = req.body || {};

    let attrs;
    let mode = 'mock';

    if (OPENAI_KEY && imageBase64) {
      try {
        attrs = await liveVisionAttributes(imageBase64);
        mode = 'live';
      } catch (err) {
        console.warn('[vision] live failed, mock fallback:', err?.message);
        attrs = mockAttributesFromImage(imageBase64, hint);
        mode = 'mock';
      }
    } else {
      attrs = mockAttributesFromImage(imageBase64, hint);
    }

    const analysis = buildAnalysis(attrs, { imageUri, source });
    const minCount = analysis.confidence < 1 ? 3 : 3;
    const matches = rankCatalogMatches(analysis, { minCount, limit: 8 });

    return res.json({
      analysis,
      matches,
      mode,
      message:
        mode === 'mock'
          ? 'OPENAI_API_KEY missing or live failed — mock vision + catalog ranking.'
          : undefined,
    });
  } catch (err) {
    console.error('[vision]', err);
    return res.status(500).json({
      error: err?.message || 'Vision analyze failed',
    });
  }
});

app.post('/api/vton', async (req, res) => {
  try {
    const {
      persona = 'man',
      garmentId = 'p-tshirt',
      category,
      garmentDes,
      yaw = 0,
    } = req.body || {};

    const garment = GARMENTS[garmentId];
    if (!garment) {
      return res.status(400).json({
        error: `POC supports only: ${Object.keys(GARMENTS).join(', ')}`,
      });
    }

    const humanPath = resolveExisting(
      PERSONA_BASE[persona],
      PERSONA_BASE.man,
    );
    const garmPath = resolveExisting(garment.file, garment.fallback);
    if (!humanPath || !garmPath) {
      return res.status(500).json({
        error: 'Missing local person/garment image files',
        humanPath,
        garmPath,
      });
    }

    // Mock path — no token: serve pre-baked fitted look so UI can be wired
    if (!TOKEN) {
      const mockPath = resolveExisting(garment.mockFitted, garmPath);
      const rel = path.relative(path.join(ROOT, 'assets/images'), mockPath);
      const imageUrl = `http://127.0.0.1:${PORT}/static/${rel.split(path.sep).join('/')}`;
      return res.json({
        imageUrl,
        mode: 'mock',
        message:
          'REPLICATE_API_TOKEN missing — returned local fitted mock. Set the token for live IDM-VTON.',
        persona,
        garmentId,
        yaw,
      });
    }

    const replicate = new Replicate({ auth: TOKEN });
    const output = await replicate.run(MODEL, {
      input: {
        human_img: fs.createReadStream(humanPath),
        garm_img: fs.createReadStream(garmPath),
        garment_des: garmentDes || garment.garmentDes,
        category: category || garment.category,
        crop: true,
        steps: 30,
        seed: 42,
      },
    });

    // SDK may return string URL, array, or FileOutput with url()
    let imageUrl = null;
    if (typeof output === 'string') imageUrl = output;
    else if (Array.isArray(output) && output.length) {
      const first = output[0];
      imageUrl =
        typeof first === 'string'
          ? first
          : typeof first?.url === 'function'
            ? first.url()
            : first?.url || null;
    } else if (output && typeof output.url === 'function') {
      imageUrl = output.url();
    } else if (output?.url) {
      imageUrl = String(output.url);
    }

    if (!imageUrl) {
      return res.status(502).json({
        error: 'Unexpected Replicate output shape',
        raw: String(output).slice(0, 200),
      });
    }

    return res.json({
      imageUrl,
      mode: 'live',
      model: MODEL,
      persona,
      garmentId,
      yaw,
    });
  } catch (err) {
    console.error('[vton]', err);
    return res.status(500).json({
      error: err?.message || 'VTON failed',
    });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(
    `[stylenear-proxy] http://127.0.0.1:${PORT}  vton=${Boolean(TOKEN)}  vision=${Boolean(OPENAI_KEY)}  model=${MODEL}`,
  );
});
