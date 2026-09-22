# Knocknok room chat (React) — how to learn & run this UI

This folder is a **Vite + React** front end for one feature: room chat.

Flask still owns knock, keys, and auth. React only draws the chat and calls:

- `GET  /room/<id>/api/messages`  → `{ "messages": ["line1", "line2"] }`
- `POST /room/<id>/api/messages`  → `{ "message": "hello" }` then updated list

Chat is still **one string column** in MySQL (`rooms.chat`). Lines are plain text
(no guest name prefix).

## Learn by reading

1. `index.html` — Vite **must** have this at the project root (entry HTML + `/src/main.jsx` script)
2. `src/main.jsx` — mounts React into `#root`
3. `src/App.jsx` — picks Chat vs AdminPanel; Chat does `useState` / `useEffect` / `fetch`
4. `vite.config.js` — build output goes to `../srcs/static/room-ui/`

## Dev (hot reload)

Terminal A — Flask on port 5000  
Terminal B:

```bash
cd learsi-proj/room-ui
npm install
npm run dev
```

Open the Vite URL, or better: knock + enter room in Flask, then open
`/room/<id>/app` (session cookie must be on localhost).

Vite proxies `/room` → Flask (`vite.config.js`).

## Production-ish (what Flask serves)

```bash
cd learsi-proj/room-ui
npm run build
```

Then open `/room/<id>/app` on the Flask app. Template:
`srcs/templates/room_app.html`.

## Concepts you practiced

| React idea | Where |
|------------|--------|
| Component | `App` |
| State | `messages`, `draft` |
| Effects / polling | `useEffect` + `setInterval` |
| Events | form `onSubmit`, input `onChange` |
| Talking to backend | `fetch` + `credentials: 'include'` |
