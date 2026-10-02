Knocknok 0.13v
--------------

Session-based knock authentication with Flask, MySQL, and a React room UI.

## Features

- Blueprints: `data` (knock), `rooms` (door + React shell), `api` (JSON for React)
- Progressive knock sequence in Flask sessions
- Rooms typed by `rtype` (`chat` → Chat, `admin` → AdminPanel)
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
3. Land in `/room/lobby` (React chat) or open `/room/adminPanel` if you hold the admin key.

## Changelog (0.13)

- React island for room pages; `rtype` selects Chat vs AdminPanel
- Admin panel: live room preview cards + guest list
- Core knock hardened; session cookie path forced to `/`
- Dead helpers/templates removed for a lean formal cut

###### [Flask | MySQL | Python | React]
