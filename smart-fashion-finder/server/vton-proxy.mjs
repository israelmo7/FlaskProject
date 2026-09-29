/**
 * StyleNear VTON POC proxy — keeps REPLICATE_API_TOKEN off the client.
 *
 * POST /api/vton
 *   body: { persona?, garmentId?, category?, garmentDes?, yaw? }
 *   → { imageUrl, mode: 'live'|'mock', model? }
 *
 * GET /health
 *
 * Without REPLICATE_API_TOKEN, returns a local mock fitted PNG so the UI path works.
 */
import cors from 'cors';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Replicate from 'replicate';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PORT = Number(process.env.VTON_PORT || 8787);
const MODEL = process.env.REPLICATE_VTON_MODEL || 'cuuupid/idm-vton';
const TOKEN = process.env.REPLICATE_API_TOKEN || '';

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
    model: MODEL,
    pocGarments: Object.keys(GARMENTS),
  });
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
    `[vton-proxy] http://127.0.0.1:${PORT}  live=${Boolean(TOKEN)}  model=${MODEL}`,
  );
});
