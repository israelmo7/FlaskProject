"""Character command agent: guest chat verbs drive Stick (no interval loop)."""

from __future__ import annotations

from srcs.character import brain

CHARACTER_ROOM_PATH = 'character'

_lock = __import__('threading').Lock()
_status = {
    'phase': 'idle',  # idle | walking | visiting
    'target': None,  # room path Stick is "at", or None = home
    'last_line': None,
}


def get_status():
    """In-memory pose for Character.jsx / status API."""
    with _lock:
        return dict(_status)


def _set_status(**kwargs):
    with _lock:
        _status.update(kwargs)


def _chat_lines(rooms_c, room_id):
    data = rooms_c.get_chat_messages(room_id)
    raw = ''
    if data and data[0] and data[0][0] is not None:
        raw = data[0][0]
        if not isinstance(raw, str):
            raw = str(raw)
    return [line for line in raw.split('\n') if line]


def _character_room_id(rooms_c):
    rows = rooms_c.get_room(CHARACTER_ROOM_PATH)
    if not rows:
        return None
    return rows[0][0]


def _find_room_by_path(rooms_c, path: str):
    """Return room dict from list_rooms, or None. Blocks going into character HQ."""
    needle = (path or '').strip().lower()
    if not needle:
        return None
    for room in rooms_c.list_rooms():
        rpath = str(room.get('path') or '').lower()
        if rpath == needle:
            if room.get('rtype') == 'character' or rpath == CHARACTER_ROOM_PATH:
                return None
            return room
    return None


def _post_home(rooms_c, home_id, line: str):
    rooms_c.set_chat_messages(home_id, line)
    _set_status(last_line=line)


def parse_command(raw: str):
    """Split guest line into (verb, arg_string). verb lowercased; None if empty."""
    text = (raw or '').strip()
    if not text:
        return None, ''
    parts = text.split(None, 1)
    verb = parts[0].lower()
    arg = parts[1].strip() if len(parts) > 1 else ''
    return verb, arg


def handle_command(rooms_c, raw_message: str) -> str:
    """
    Run one command against shared rooms_c; update status; return Stick reply.
    Caller posts the guest line first, then this reply, into character chat.
    """
    verb, arg = parse_command(raw_message)
    if verb is None:
        return brain.help_line()

    status = get_status()
    target_path = status.get('target')

    if verb == 'go':
        if not arg:
            _set_status(phase='idle')
            return brain.go_missing_arg()
        room = _find_room_by_path(rooms_c, arg)
        if room is None:
            needle = arg.strip().lower()
            _set_status(phase='idle')
            if needle == CHARACTER_ROOM_PATH:
                return brain.go_denied(arg.strip())
            return brain.go_not_found(arg.strip())
        path = room.get('path') or arg.strip()
        _set_status(phase='visiting', target=path)
        return brain.go_ok(path)

    if verb == 'read':
        if not target_path:
            _set_status(phase='idle')
            return brain.read_need_target()
        room = _find_room_by_path(rooms_c, target_path)
        if room is None:
            _set_status(phase='idle', target=None)
            return brain.go_not_found(target_path)
        lines = _chat_lines(rooms_c, room['id'])
        _set_status(phase='visiting', target=target_path)
        return brain.read_report(target_path, lines)

    if verb == 'send':
        if not target_path:
            _set_status(phase='idle')
            return brain.send_need_target()
        if not arg:
            return brain.send_need_text()
        room = _find_room_by_path(rooms_c, target_path)
        if room is None:
            _set_status(phase='idle', target=None)
            return brain.go_not_found(target_path)
        stamped = f'{brain.NAME}: {arg}'
        rooms_c.set_chat_messages(room['id'], stamped)
        _set_status(phase='visiting', target=target_path)
        return brain.send_ok(target_path, arg)

    if verb == 'wait':
        _set_status(phase='idle', target=target_path)
        return brain.wait_ok(target_path)

    if verb == 'back':
        if not target_path:
            _set_status(phase='idle', target=None)
            return brain.back_already()
        _set_status(phase='idle', target=None)
        return brain.back_ok()

    return brain.unknown(verb)


def handle_character_message(rooms_c, guest_line: str) -> list[str]:
    """
    Append guest command + Stick reply to character room chat.
    Returns full chat lines for the API response.
    """
    home_id = _character_room_id(rooms_c)
    if home_id is None:
        raise RuntimeError('character room missing')

    text = (guest_line or '').strip()
    rooms_c.set_chat_messages(home_id, text)

    # Brief walking flash when going somewhere (UI can poll status).
    verb, _arg = parse_command(text)
    if verb == 'go' and _arg:
        _set_status(phase='walking', target=_arg.strip())

    reply = handle_command(rooms_c, text)
    _post_home(rooms_c, home_id, reply)
    return _chat_lines(rooms_c, home_id)


def start_character_agent(app):
    """No interval loop — commands come from chat. Kept for create_app import safety."""
    if app.config.get('SKIP_MYSQL') or app.config.get('TESTING'):
        return
    print('[CHARACTER] Command chat ready (go|read|send|wait|back)')
