"""Autonomous rider: mind decides Stick commands; status is visual-only."""

from __future__ import annotations

import threading
import time

from srcs.ai import mind
from srcs.character import agent as stick

BRAIN_ROOM_PATH = 'brain'
BRAIN_ACTOR_ID = '__brain__'
CYCLE_SECONDS = 8
# After echoing a guest line, only wait this long before normal tools resume.
ECHO_WAIT_SECONDS = 30
ECHO_QUOTE_MAX = 40

_started = False
_lock = threading.Lock()
_memory = {
    'step': mind._STEP_HOME,
    'last_command': None,
    # Presence-echo tracking (caption only — never written to rooms.chat).
    'echo_room': None,
    'echo_seen': 0,
    'echo_cooldown_until': 0.0,
}


def get_brain_status():
    """Global Wander status for Brain.jsx watchers."""
    status = stick.get_status(BRAIN_ACTOR_ID)
    now = time.time()
    with _lock:
        status = dict(status)
        status['last_command'] = _memory.get('last_command')
        status['step'] = _memory.get('step')
        until = float(_memory.get('echo_cooldown_until') or 0)
        status['echo_cooldown'] = max(0, int(until - now)) if until else 0
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


def _room_lines(rooms_c, path: str) -> list[str]:
    room = stick._find_room_by_path(rooms_c, path)
    if not room:
        return []
    return stick._chat_lines(rooms_c, room['id'])


def _format_echo(quote: str) -> str:
    text = (quote or '').strip() or '…'
    if len(text) > ECHO_QUOTE_MAX:
        text = text[: ECHO_QUOTE_MAX - 1] + '…'
    text = text.replace('"', "'")
    return f'Ha Ha, he said "{text}"!'


def _sync_echo_tracking(rooms_c, here: str | None):
    """
    On enter: baseline line count so only messages after arrival are echoed.
    On leave: clear echo state.
    """
    with _lock:
        prev = _memory.get('echo_room')
    if not here:
        if prev is not None:
            _set_memory(echo_room=None, echo_seen=0, echo_cooldown_until=0.0)
        return
    if here != prev:
        lines = _room_lines(rooms_c, here)
        _set_memory(
            echo_room=here,
            echo_seen=len(lines),
            echo_cooldown_until=0.0,
        )


def _echo_or_none(rooms_c, here: str | None) -> str | None:
    """
    If a new chat line appeared after arrival and cooldown is clear,
    return a `say` command. If still in post-echo wait, return `wait`.
    Otherwise None → caller runs normal mind.decide().
    """
    if not here:
        return None

    now = time.time()
    with _lock:
        echo_room = _memory.get('echo_room')
        seen = int(_memory.get('echo_seen') or 0)
        cooldown_until = float(_memory.get('echo_cooldown_until') or 0)

    if echo_room != here:
        return None

    if now < cooldown_until:
        return 'wait'

    lines = _room_lines(rooms_c, here)
    if len(lines) <= seen:
        return None

    # One new message per reaction; then 30s wait before next echo / normal play.
    quote = lines[seen]
    _set_memory(
        echo_seen=seen + 1,
        echo_cooldown_until=now + ECHO_WAIT_SECONDS,
    )
    return f'say {_format_echo(quote)}'


def _observe(rooms_c) -> dict:
    status = stick.get_status(BRAIN_ACTOR_ID)
    here = status.get('target')
    allow = sorted(stick.get_allowlist(rooms_c, BRAIN_ROOM_PATH))
    last_lines: list[str] = []
    if here:
        last_lines = _room_lines(rooms_c, here)
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
    """One observe → (echo?) → decide → execute cycle."""
    status = stick.get_status(BRAIN_ACTOR_ID)
    here = status.get('target')
    _sync_echo_tracking(rooms_c, here)

    observation = _observe(rooms_c)
    command = _echo_or_none(rooms_c, here)
    if command is None:
        command = mind.decide(observation)

    verb, arg = stick.parse_command(command)
    allow = stick.get_allowlist(rooms_c, BRAIN_ROOM_PATH)
    if verb == 'go' and arg:
        needle = arg.strip().lower()
        room = stick._find_room_by_path(rooms_c, arg)
        if room and needle in allow:
            stick._set_status(BRAIN_ACTOR_ID, phase='walking', target=arg.strip())

    # Server rider: allowlisted rooms only (executor still checks allowlist).

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

    # After a successful go, baseline this room's chat so only later lines echo.
    new_here = stick.get_status(BRAIN_ACTOR_ID).get('target')
    if verb == 'go' and new_here:
        lines = _room_lines(rooms_c, new_here)
        _set_memory(
            echo_room=new_here,
            echo_seen=len(lines),
            echo_cooldown_until=0.0,
        )
    elif verb == 'back':
        _set_memory(echo_room=None, echo_seen=0, echo_cooldown_until=0.0)

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
    print(
        f'[BRAIN] Rider started (cycle={interval}s, echo_wait={ECHO_WAIT_SECONDS}s)'
    )
