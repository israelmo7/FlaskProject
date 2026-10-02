"""Autonomous rider: mind decides Stick commands; status is visual-only."""

from __future__ import annotations

import threading
import time

from srcs.ai import mind
from srcs.character import agent as stick

BRAIN_ROOM_PATH = 'brain'
BRAIN_ACTOR_ID = '__brain__'
CYCLE_SECONDS = 8

_started = False
_lock = threading.Lock()
_memory = {
    'step': mind._STEP_HOME,
    'last_command': None,
}


def get_brain_status():
    """Global Wander status for Brain.jsx watchers."""
    status = stick.get_status(BRAIN_ACTOR_ID)
    with _lock:
        status = dict(status)
        status['last_command'] = _memory.get('last_command')
        status['step'] = _memory.get('step')
    return status


def presence_in_room(room_path: str) -> dict:
    """
    Whether Wander is visible in this room right now.
    Present when target matches (walking toward or visiting / waiting there).
    """
    status = get_brain_status()
    needle = (room_path or '').strip().lower()
    target = (status.get('target') or '').strip().lower()
    present = bool(needle and target and needle == target)
    return {
        'present': present,
        'name': 'Wander',
        'phase': status.get('phase') if present else None,
        'caption': status.get('caption') if present else None,
        'target': status.get('target') if present else None,
    }


def _set_memory(**kwargs):
    with _lock:
        _memory.update(kwargs)


def _observe(rooms_c) -> dict:
    status = stick.get_status(BRAIN_ACTOR_ID)
    here = status.get('target')
    allow = sorted(stick.get_allowlist(rooms_c, BRAIN_ROOM_PATH))
    last_lines: list[str] = []
    if here:
        room = stick._find_room_by_path(rooms_c, here)
        if room:
            last_lines = stick._chat_lines(rooms_c, room['id'])
    with _lock:
        step = _memory.get('step') or mind._STEP_HOME
    return mind.build_observation(
        here=here,
        can_go=allow,
        last_lines=last_lines,
        caption=status.get('caption') or '',
        phase=status.get('phase') or 'idle',
        step=step,
    )


def _advance_step(command: str):
    verb, _arg = stick.parse_command(command)
    with _lock:
        step = _memory.get('step') or mind._STEP_HOME
        if verb == 'go':
            step = mind._STEP_ARRIVED
        elif verb == 'read':
            step = mind._STEP_READ
        elif verb == 'say':
            step = mind._STEP_SAID
        elif verb == 'back':
            step = mind._STEP_HOME
        elif verb == 'wait':
            # Stay in said/home so next tick can move again.
            if step == mind._STEP_SAID:
                step = mind._STEP_SAID
            elif not stick.get_status(BRAIN_ACTOR_ID).get('target'):
                step = mind._STEP_HOME
        _memory['step'] = step
        _memory['last_command'] = command


def run_brain_tick(rooms_c) -> dict:
    """One observe → decide → execute cycle. Used by daemon and tests."""
    observation = _observe(rooms_c)
    command = mind.decide(observation)
    verb, arg = stick.parse_command(command)
    if verb == 'go' and arg:
        stick._set_status(BRAIN_ACTOR_ID, phase='walking', target=arg.strip())

    # Server rider: allowlisted rooms only (executor still checks allowlist).
    allow = stick.get_allowlist(rooms_c, BRAIN_ROOM_PATH)

    def can_enter(room_id):
        for room in rooms_c.list_rooms():
            if room.get('id') == room_id:
                path = str(room.get('path') or '').lower()
                return path in allow
        return False

    stick.handle_command(
        rooms_c,
        command,
        BRAIN_ACTOR_ID,
        can_enter,
        home_path=BRAIN_ROOM_PATH,
    )
    _advance_step(command)
    return get_brain_status()


def start_brain_rider(app):
    """Daemon: Wander rides Stick tools on an interval."""
    global _started
    if _started or app.config.get('SKIP_MYSQL') or app.config.get('TESTING'):
        return
    _started = True

    try:
        interval = int(app.config.get('BRAIN_CYCLE_SECONDS', CYCLE_SECONDS))
    except (TypeError, ValueError):
        interval = CYCLE_SECONDS
    interval = max(interval, 5)

    def _loop():
        time.sleep(4)
        while True:
            try:
                with app.app_context():
                    rooms_c = app.extensions.get('rooms_c')
                    if rooms_c:
                        run_brain_tick(rooms_c)
            except Exception as exc:
                print(f'[BRAIN] Error: {exc}')
            time.sleep(interval)

    threading.Thread(target=_loop, name='brain-rider', daemon=True).start()
    print(f'[BRAIN] Rider started (cycle={interval}s) — tools + personality only')
