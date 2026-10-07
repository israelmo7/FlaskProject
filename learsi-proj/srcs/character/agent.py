"""Character command agent: visual-only replies; guest-scoped room access."""

from __future__ import annotations

import json
import threading

from srcs.character import brain

CHARACTER_ROOM_PATH = 'character'
# HQ room types Stick / brain must not "go" into.
HQ_RTYPES = frozenset({'character', 'ai'})
# Built-in routes Stick knows even before DB allowlist is read.
BUILTIN_ALLOW = ('lobby', 'garden', 'studio')

_lock = threading.Lock()
_DEFAULT = {
    'phase': 'idle',  # idle | walking | visiting
    'target': None,
    'caption': 'At home',
}
# Per actor id — guest session or autonomous '__brain__'.
_status_by_guest: dict[str, dict] = {}
# One pending delayed command timer per actor.
_delay_timers: dict[str, threading.Timer] = {}


def get_status(gid: str | None = None):
    """Pose + caption for Character.jsx (never persisted to rooms.chat)."""
    with _lock:
        if not gid:
            return dict(_DEFAULT)
        return dict(_status_by_guest.get(gid, _DEFAULT))


def _set_status(gid: str, **kwargs):
    with _lock:
        cur = _status_by_guest.setdefault(gid, dict(_DEFAULT))
        cur.update(kwargs)


def _chat_lines(rooms_c, room_id):
    data = rooms_c.get_chat_messages(room_id)
    raw = ''
    if data and data[0] and data[0][0] is not None:
        raw = data[0][0]
        if not isinstance(raw, str):
            raw = str(raw)
    # HQ rooms may store JSON config in chat — not a message log.
    text = raw.strip()
    if text.startswith('{'):
        try:
            json.loads(text)
            return []
        except (TypeError, ValueError, json.JSONDecodeError):
            pass
    return [line for line in raw.split('\n') if line]


def _home_room_id(rooms_c, home_path: str):
    rows = rooms_c.get_room(home_path)
    if not rows:
        return None
    return rows[0][0]


def get_allowlist(rooms_c, home_path: str = CHARACTER_ROOM_PATH) -> set[str]:
    """
    Rooms Stick may attempt: BUILTIN_ALLOW ∪ paths listed in home room chat JSON.
    Expected shape: {"allow":["lobby","garden",...]}
    """
    allowed = {p.lower() for p in BUILTIN_ALLOW}
    home_id = _home_room_id(rooms_c, home_path)
    if home_id is None:
        return allowed
    data = rooms_c.get_chat_messages(home_id)
    raw = ''
    if data and data[0] and data[0][0] is not None:
        raw = data[0][0]
        if not isinstance(raw, str):
            raw = str(raw)
    raw = raw.strip()
    if not raw:
        return allowed
    try:
        parsed = json.loads(raw)
        if isinstance(parsed, dict):
            for item in parsed.get('allow') or []:
                if isinstance(item, str) and item.strip():
                    allowed.add(item.strip().lower())
        elif isinstance(parsed, list):
            for item in parsed:
                if isinstance(item, str) and item.strip():
                    allowed.add(item.strip().lower())
    except (TypeError, ValueError, json.JSONDecodeError):
        pass
    allowed.discard(home_path.lower())
    allowed.discard(CHARACTER_ROOM_PATH)
    return allowed


def _find_room_by_path(rooms_c, path: str):
    """Return room dict from list_rooms, or None. Blocks HQ rtypes."""
    needle = (path or '').strip().lower()
    if not needle or needle in HQ_RTYPES or needle == CHARACTER_ROOM_PATH:
        return None
    for room in rooms_c.list_rooms():
        rpath = str(room.get('path') or '').lower()
        if rpath == needle:
            if room.get('rtype') in HQ_RTYPES:
                return None
            return room
    return None


def _visit_gate(rooms_c, path, allow, can_enter, home_path: str):
    """
    Shared door checks for go/read/send.
    Returns (room_dict, None) or (None, error_caption).
    """
    if not path:
        return None, brain.read_need_target()
    needle = str(path).strip().lower()
    if needle not in allow:
        return None, brain.go_not_allowed(path)
    room = _find_room_by_path(rooms_c, path)
    if room is None:
        if needle in HQ_RTYPES or needle == home_path.lower():
            return None, brain.go_denied(path)
        return None, brain.go_not_found(path)
    if not can_enter(room['id']):
        return None, brain.go_forbidden(path)
    return room, None


def parse_command(raw: str):
    """Split guest line into (verb, arg_string). verb lowercased; None if empty."""
    text = (raw or '').strip()
    if not text:
        return None, ''
    parts = text.split(None, 1)
    verb = parts[0].lower()
    arg = parts[1].strip() if len(parts) > 1 else ''
    return verb, arg


def _parse_read_count(arg: str) -> int | None:
    """Return line count or None if arg is present but invalid."""
    if not arg:
        return brain.DEFAULT_READ_LINES
    try:
        n = int(arg.strip())
    except (TypeError, ValueError):
        return None
    if n < 1 or n > brain.MAX_READ_LINES:
        return None
    return n


def _parse_wait_tail(arg: str):
    """
    Parse `wait` arguments.
    Returns:
      ('plain', None, None) — bare `wait`
      ('bad', None, None) — seconds out of range / empty junk
      ('delay', seconds, follow_or_None) — `wait 60` or `wait 60 knock a`
    """
    text = (arg or '').strip()
    if not text:
        return 'plain', None, None
    parts = text.split(None, 1)
    try:
        secs = int(parts[0])
    except (TypeError, ValueError):
        return 'bad', None, None
    if secs < brain.WAIT_MIN_SECS or secs > brain.WAIT_MAX_SECS:
        return 'bad', None, None
    follow = parts[1].strip() if len(parts) > 1 else ''
    return 'delay', secs, follow or None


def _cancel_delay(gid: str):
    with _lock:
        timer = _delay_timers.pop(gid, None)
    if timer is not None:
        timer.cancel()


def _schedule_delayed_command(
    app,
    rooms_c,
    gid: str,
    can_enter,
    home_path: str,
    seconds: int,
    follow_cmd: str | None,
):
    """After `seconds`, run follow_cmd (or mark wait done). Cancels any prior delay."""
    _cancel_delay(gid)
    app_obj = app

    def _fire():
        with _lock:
            _delay_timers.pop(gid, None)
        try:
            with app_obj.app_context():
                if follow_cmd:
                    verb, arg = parse_command(follow_cmd)
                    if verb == 'go' and arg:
                        _set_status(gid, phase='walking', target=arg.strip())
                    # Nested wait is allowed but unusual — run through handle_command.
                    handle_command(
                        rooms_c,
                        follow_cmd,
                        gid,
                        can_enter,
                        home_path=home_path,
                    )
                else:
                    caption = brain.wait_done()
                    _set_status(gid, phase='idle', caption=caption)
        except Exception as exc:
            print(f'[CHARACTER] delayed command failed: {exc}')
            _set_status(gid, caption='Wait failed')

    timer = threading.Timer(seconds, _fire)
    timer.daemon = True
    with _lock:
        _delay_timers[gid] = timer
    timer.start()


def handle_command(
    rooms_c,
    raw_message: str,
    gid: str,
    can_enter,
    home_path: str = CHARACTER_ROOM_PATH,
) -> str:
    """
    Run one command; update per-actor visual status; return caption.
    can_enter(room_id) -> bool — door rights for this actor.
    Does not write to the HQ room chat/DB.
    """
    verb, arg = parse_command(raw_message)
    if verb is None:
        caption = brain.help_line()
        _set_status(gid, caption=caption)
        return caption

    status = get_status(gid)
    target_path = status.get('target')
    allow = get_allowlist(rooms_c, home_path)

    if verb == 'go':
        if not arg:
            caption = brain.go_missing_arg()
            _set_status(gid, phase='idle', caption=caption)
            return caption
        room, err = _visit_gate(rooms_c, arg, allow, can_enter, home_path)
        if err:
            # go_missing uses different copy when empty; gate covers the rest.
            caption = err if err != brain.read_need_target() else brain.go_missing_arg()
            _set_status(gid, phase='idle', caption=caption)
            return caption
        path = room.get('path') or arg.strip()
        caption = brain.go_ok(path)
        _set_status(gid, phase='visiting', target=path, caption=caption)
        return caption

    if verb == 'read':
        count = _parse_read_count(arg)
        if count is None:
            caption = brain.read_bad_count()
            _set_status(gid, caption=caption)
            return caption
        room, err = _visit_gate(rooms_c, target_path, allow, can_enter, home_path)
        if err:
            _set_status(
                gid,
                phase='idle',
                target=None if err != brain.read_need_target() else target_path,
                caption=err,
            )
            return err
        path = room.get('path') or target_path
        lines = _chat_lines(rooms_c, room['id'])
        caption = brain.read_report(path, lines, max_show=count)
        _set_status(gid, phase='visiting', target=path, caption=caption)
        return caption

    if verb == 'say':
        if not arg:
            caption = brain.say_need_text()
            _set_status(gid, caption=caption)
            return caption
        caption = brain.say_ok(arg)
        _set_status(gid, caption=caption)
        return caption

    if verb == 'knock':
        # Same /data/<letter> pipe as guests. Isolated jar — not a formal guest.
        raw = (arg or '').strip().lower().replace(' ', '')
        if not raw:
            caption = brain.knock_need_seq()
            _set_status(gid, caption=caption)
            return caption
        if any(ch < 'a' or ch > 'z' for ch in raw):
            caption = brain.knock_bad_seq()
            _set_status(gid, caption=caption)
            return caption
        if len(raw) >= 8:
            caption = brain.knock_too_long()
            _set_status(gid, caption=caption)
            return caption
        try:
            from flask import current_app

            client = current_app.test_client()
            for ch in raw:
                client.get(f'/data/{ch}', follow_redirects=True)
        except Exception as exc:
            print(f'[CHARACTER] knock /data failed: {exc}')
        caption = brain.knock_via_data(raw)
        _set_status(gid, caption=caption)
        return caption

    if verb == 'send':
        if not arg:
            caption = brain.send_need_text()
            _set_status(gid, caption=caption)
            return caption
        room, err = _visit_gate(rooms_c, target_path, allow, can_enter, home_path)
        if err:
            caption = (
                brain.send_need_target()
                if err == brain.read_need_target()
                else err
            )
            _set_status(
                gid,
                phase='idle',
                target=None if err != brain.read_need_target() else target_path,
                caption=caption,
            )
            return caption
        path = room.get('path') or target_path
        stamped = f'{brain.NAME}: {arg}'
        rooms_c.set_chat_messages(room['id'], stamped)
        caption = brain.send_ok(path, arg)
        _set_status(gid, phase='visiting', target=path, caption=caption)
        return caption

    if verb == 'wait':
        kind, secs, follow = _parse_wait_tail(arg)
        if kind == 'bad':
            caption = brain.wait_bad_secs()
            _set_status(gid, caption=caption)
            return caption
        if kind == 'plain':
            caption = brain.wait_ok(target_path)
            _set_status(gid, phase='idle', target=target_path, caption=caption)
            return caption

        # wait <n> [command] — schedule follow-up on one line.
        try:
            from flask import current_app

            app = current_app._get_current_object()
        except Exception:
            app = None
        if app is None:
            caption = brain.wait_for(secs, follow)
            _set_status(gid, phase='idle', target=target_path, caption=caption)
            return caption

        _schedule_delayed_command(
            app,
            rooms_c,
            gid,
            can_enter,
            home_path,
            secs,
            follow,
        )
        caption = brain.wait_for(secs, follow)
        _set_status(gid, phase='idle', target=target_path, caption=caption)
        return caption

    if verb == 'back':
        if not target_path:
            caption = brain.back_already()
            _set_status(gid, phase='idle', target=None, caption=caption)
            return caption
        caption = brain.back_ok()
        _set_status(gid, phase='idle', target=None, caption=caption)
        return caption

    caption = brain.unknown(verb)
    _set_status(gid, caption=caption)
    return caption


def handle_character_command(
    rooms_c, raw_message: str, gid: str, can_enter
) -> dict:
    """
    Execute command for this guest. No writes to the character room chat/DB.
    Returns status dict for the UI.
    """
    text = (raw_message or '').strip()
    verb, arg = parse_command(text)
    if verb == 'go' and arg:
        _set_status(gid, phase='walking', target=arg.strip())

    handle_command(
        rooms_c,
        text,
        gid,
        can_enter,
        home_path=CHARACTER_ROOM_PATH,
    )
    return get_status(gid)


def start_character_agent(app):
    """No interval loop — commands come from the character UI."""
    if app.config.get('SKIP_MYSQL') or app.config.get('TESTING'):
        return
    print(
        '[CHARACTER] Command UI ready '
        '(go|read|say|send|wait|back|knock), visual-only'
    )
