"""Background character: peeks other rooms, posts narration to home chat only."""

from __future__ import annotations

import random
import threading
import time

from srcs.character import brain  # scripted lines; LM can replace later

CHARACTER_ROOM_PATH = 'character'
# Seconds between visit cycles (idle → walk → visit → report).
CYCLE_SECONDS = 10
WALK_SECONDS = 2
VISIT_SECONDS = 2

_started = False
_lock = threading.Lock()
_status = {
    'phase': 'idle',
    'target': None,
    'last_line': None,
}


def get_status():
    """In-memory pose for Character.jsx / status API."""
    with _lock:
        return dict(_status)


def _set_status(**kwargs):
    with _lock:
        _status.update(kwargs)


def _chat_line_count(rooms_c, room_id):
    data = rooms_c.get_chat_messages(room_id)
    raw = ''
    if data and data[0] and data[0][0] is not None:
        raw = data[0][0]
        if not isinstance(raw, str):
            raw = str(raw)
    return len([line for line in raw.split('\n') if line])


def _character_room_id(rooms_c):
    rows = rooms_c.get_room(CHARACTER_ROOM_PATH)
    if not rows:
        return None
    return rows[0][0]


def _pick_target(rooms_c, home_id):
    rooms = rooms_c.list_rooms()
    candidates = [
        r
        for r in rooms
        if r.get('id') != home_id and r.get('rtype') != 'character'
    ]
    if not candidates:
        return None
    return random.choice(candidates)


def _post_home(rooms_c, home_id, line):
    rooms_c.set_chat_messages(home_id, line)
    _set_status(last_line=line)


def _run_cycle(app):
    rooms_c = app.extensions.get('rooms_c')
    if not rooms_c:
        return

    home_id = _character_room_id(rooms_c)
    if home_id is None:
        print('[CHARACTER] No character room row; skipping cycle')
        _set_status(phase='idle', target=None)
        return

    target = _pick_target(rooms_c, home_id)
    if target is None:
        line = brain.say_hi()
        _post_home(rooms_c, home_id, line)
        _set_status(phase='idle', target=None)
        return

    path = target.get('path') or str(target.get('id'))
    rid = target.get('id')

    _set_status(phase='walking', target=path)
    time.sleep(WALK_SECONDS)

    _set_status(phase='visiting', target=path)
    time.sleep(VISIT_SECONDS)

    count = 0
    try:
        count = _chat_line_count(rooms_c, rid)
    except Exception as exc:
        print(f'[CHARACTER] Peek failed for {path}: {exc}')

    line = brain.narrate_visit(path, count)
    _post_home(rooms_c, home_id, line)
    _set_status(phase='idle', target=None)


def start_character_agent(app):
    """Daemon thread: scripted visits; narrates only into character room chat."""
    global _started
    if _started or app.config.get('SKIP_MYSQL') or app.config.get('TESTING'):
        return
    _started = True

    try:
        interval = int(app.config.get('CHARACTER_CYCLE_SECONDS', CYCLE_SECONDS))
    except (TypeError, ValueError):
        interval = CYCLE_SECONDS
    interval = max(interval, 5)

    def _loop():
        # Short stagger so guest-cleaner and this don't stampede at boot.
        time.sleep(3)
        while True:
            try:
                with app.app_context():
                    _run_cycle(app)
            except Exception as exc:
                print(f'[CHARACTER] Error: {exc}')
                _set_status(phase='idle', target=None)
            time.sleep(interval)

    threading.Thread(target=_loop, name='character-agent', daemon=True).start()
    print(f'[CHARACTER] Agent started (cycle={interval}s)')
