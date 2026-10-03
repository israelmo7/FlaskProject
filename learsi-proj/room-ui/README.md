# Knocknok room UI (React) — 0.14

Vite + React island. Flask owns knock, keys, and auth. React picks the page
from `data-room-type` and fetches JSON from `/api/...`.

## Blueprints (Flask)

| Prefix | Job |
|--------|-----|
| `/data` | Knock |
| `/room` | Enter room, serve React shell |
| `/api` | JSON (`/<path>/messages`, `/character/*`, `/brain/status`, `/admin/...`) |

## Room types

Flask sets `data-room-type` from `rooms.rtype`. `App.jsx` switches:

- `chat` → `Chat.jsx` → `/api/<path>/messages`
- `admin` → `AdminPanel.jsx` → room preview cards + guests
- `character` → `Character.jsx` → command UI + visual status (no chat log)
- `ai` → `Brain.jsx` → watch Wander ride Stick tools

## Learn by reading

1. `index.html` — Vite entry
2. `src/main.jsx` — mounts into `#root`
3. `src/App.jsx` — picks page by room type
4. `vite.config.js` — build → `../srcs/static/room-ui/`

## Dev

```bash
cd learsi-proj/room-ui
npm install
npm run dev
```

Vite proxies `/api`, `/room`, `/data` → Flask `:5000`. Prefer opening the app on **Flask :5000**.

## Build (Flask serves static)

```bash
cd learsi-proj/room-ui
npm run build
```

Then open `/room/<path>` or `/room/<path>/app` on Flask.
