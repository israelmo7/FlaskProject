# Knocknok room chat (React) — how to learn & run this UI

This folder is a **Vite + React** front end for one feature: room chat.

Flask still owns knock, keys, and auth. React only draws the chat and calls:

- `GET  /room/<id>/api/messages`  → `{ "messages": ["line1", "line2"] }`
- `POST /room/<id>/api/messages`  → `{ "message": "hello" }` then updated list

Chat is still **one string column** in MySQL (`rooms.chat`). Lines are plain text
(no guest name prefix).

## Learn by reading

1. `src/main.jsx` — mounts React into `#root`
2. `src/App.jsx` — state (`useState`), load/poll (`useEffect`), `fetch`
3. `vite.config.js` — build output goes to `../srcs/static/room-ui/`

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
