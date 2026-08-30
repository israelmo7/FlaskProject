Knocknok 0.12v
--------------

Session-based knock authentication built with Flask and MySQL.

## Features

- Blueprint-based structure (`core`, `rooms`, `admin`)
- Progressive knock sequence stored in Flask sessions
- MySQL storage for keys, guests, and rooms

## Setup

1. Create a virtual environment and install dependencies:

```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

2. Copy the example config and edit credentials:

```bash
cp config.example.json config.json
```

3. Create the database schema:

```bash
mysql -u root -p < schema.sql
```

4. Run the application from the repository root:

```bash
cd learsi-proj
FLASK_DEBUG=1 python -m srcs.app
```

The app listens on `http://127.0.0.1:5000/`.

## Configuration

`config.json` at the repository root holds database and session settings. See `config.example.json` for the expected format.

## Development

- Set `FLASK_DEBUG=1` to enable Flask debug mode.
- Set `FLASK_ENABLE_TEST_ROUTE=1` to expose the legacy `/test/<parm>` debug route (disabled by default).

## Testing

```bash
pip install -r requirements.txt
pytest
```

## Flow

1. Visit `/` and click through to `/data/` to start knocking.
2. Visit `/data/<letter>` repeatedly to build a secret sequence.
3. Confirm via `/data/POST` when matched.
4. Enter rooms via `/room/<path>` after authentication.

###### [Flask | MySQL | Python]
