Knocknok 0.14v
--------------

Session-based knock authentication with Flask, MySQL, and a React room UI.

## Features

- Blueprints: `data` (knock), `rooms` (door + React shell), `api` (JSON for React)
- Progressive knock sequence in Flask sessions
- Rooms typed by `rtype` (`chat` → Chat, `admin` → AdminPanel, `character` → Character)
- Character Stick: command UI (`go` `read [n]` `send` `wait` `back`); visual-only replies
- Stick may only visit rooms on his allowlist **and** that the asking guest can open
- Admin panel can grant key `999` to a guest (yes/no confirm)
- Admin key is attached manually (not via knock)

## Setup

1. System packages (Ubuntu/Debian):

```bash
sudo apt-get update
sudo apt-get install -y python3-venv python3.12-dev build-essential \
  default-libmysqlclient-dev pkg-config mariadb-server mariadb-client
```

2. Create a virtual environment and install dependencies:

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Or use the helper script:

```bash
./scripts/install.sh
```

3. Copy the example config and edit credentials:

```bash
cp config.example.json config.json
```

4. Start MySQL/MariaDB and create the database schema:

```bash
./scripts/start-db.sh
# or manually:
# sudo mysql < schema.sql
```

If the DB already exists from an older 0.14 cut, refresh character + extra rooms:

```sql
INSERT IGNORE INTO rooms (id, paths, doors, chat, rtype) VALUES
  (2, '.character.', '999.1.2.', '{"allow":["lobby","garden","studio"]}', 'character'),
  (3, '.garden.', '999.1.2.', '{}', 'chat'),
  (4, '.studio.', '999.1.2.', '{}', 'chat');
UPDATE rooms SET chat = '{"allow":["lobby","garden","studio"]}'
  WHERE id = 2 AND rtype = 'character';
```

5. Build the React room UI, then run Flask from the repo / `learsi-proj`:

```bash
cd learsi-proj
make build
FLASK_DEBUG=1 PYTHONPATH=. python3 -m srcs.app
```

The app listens on `http://127.0.0.1:5000/` (use this port for knock + rooms).

## Development

- **Flask `:5000`** — real app (knock, rooms, built static React).
- **Vite `:5173`** — optional hot-reload while editing `room-ui` (`make run`). Prefer opening rooms via Flask so session cookies and `data-room-*` are set.
- Set `FLASK_DEBUG=1` for Flask debug mode.

## Testing

```bash
source venv/bin/activate
pytest
```

## Flow

1. Visit `/` → `/data/` and knock letters (e.g. `abc`).
2. Confirm via `/data/POST?<challenge>=1`.
3. Land in `/room/lobby` (React chat), open `/room/character` (Stick HQ), or `/room/adminPanel` if you hold the admin key.

## Changelog (0.14)

- New `rtype=character`: SVG stick-man HQ at `/room/character`
- Command UI (`go` `read [n]` `send` `wait` `back`); replies are visual captions only (no character chat log)
- Stick visits = guest door rights ∩ character allowlist (`rooms.chat` JSON + builtin lobby/garden/studio)
- Extra seed rooms: `garden`, `studio`
- Rotating stick styles (classic / chalk / ink / neon / sketch)
- `GET /api/character/status`, `POST /api/character/command`; AdminPanel Stick preview
- Admin: `POST /api/admin/grant-admin-key` + yes/no confirm popup on guest chips

## Changelog (0.13)

- React island for room pages; `rtype` selects Chat vs AdminPanel
- Admin panel: live room preview cards + guest list
- Core knock hardened; session cookie path forced to `/`
- Dead helpers/templates removed for a lean formal cut

###### [Flask | MySQL | Python | React]
