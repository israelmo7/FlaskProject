"""JSON APIs for React. Auth = same door check as /room/<path>."""

from flask import Blueprint, jsonify, request, session

from srcs.character.agent import (
    CHARACTER_ROOM_PATH,
    get_status,
    handle_character_command,
)
from srcs.rooms.routes import ADMIN_ROOM_PATH, has_right_key, path_room_to_id

api_bp = Blueprint(
    'api_bp', __name__, template_folder='templates', static_folder='static'
)
rooms_c, keys_c, guests_c = 0, 0, 0


def init_db_a(r, k, g):
    global rooms_c, keys_c, guests_c
    rooms_c, keys_c, guests_c = r, k, g


def _chat_lines(room_id):
    """Split rooms.chat blob into non-empty lines (still one DB string column)."""
    data = rooms_c.get_chat_messages(room_id)
    raw = ""
    if data and data[0] and data[0][0] is not None:
        raw = data[0][0]
        if not isinstance(raw, str):
            raw = str(raw)
    # Character HQ stores JSON allowlist in chat — not a message log.
    text = raw.strip()
    if text.startswith('{') or text.startswith('['):
        try:
            import json

            json.loads(text)
            return []
        except (TypeError, ValueError):
            pass
    return [line for line in raw.split('\n') if line]


def _require_guest():
    gid = session.get('id')
    if not gid:
        return None
    return gid[:8]


def _may_use_admin_panel(gid):
    """Same as entering /room/adminPanel — has_right_key on that room."""
    admin_id = path_room_to_id(ADMIN_ROOM_PATH)
    if admin_id is None:
        return False
    return has_right_key(admin_id, gid) is not None


def _may_use_character_room(gid):
    """Same door check as entering /room/character."""
    char_id = path_room_to_id(CHARACTER_ROOM_PATH)
    if char_id is None:
        return False
    return has_right_key(char_id, gid) is not None


@api_bp.route('/character/status', methods=['GET'])
def api_character_status():
    """Pose + visual caption for Character.jsx (per asking guest)."""
    gid = _require_guest()
    if not gid:
        return jsonify(error='unauthorized'), 401
    if not _may_use_character_room(gid):
        return jsonify(error='forbidden'), 403
    return jsonify(get_status(gid))


@api_bp.route('/character/command', methods=['POST'])
def api_character_command():
    """
    Run a Stick command for this guest. Visual-only reply (status caption).
    Does not write to the character room chat/DB.
    Stick may only visit allowlisted rooms the guest can open.
    """
    gid = _require_guest()
    if not gid:
        return jsonify(error='unauthorized'), 401
    if not _may_use_character_room(gid):
        return jsonify(error='forbidden'), 403

    payload = request.get_json(silent=True) or {}
    message = payload.get('message') or payload.get('command') or ''
    if not str(message).strip():
        return jsonify(error='empty'), 400

    def can_enter(room_id):
        return has_right_key(room_id, gid) is not None

    try:
        status = handle_character_command(rooms_c, message, gid, can_enter)
    except Exception as exc:
        print(f'[CHARACTER] command failed: {exc}')
        return jsonify(error='character_error'), 500
    return jsonify(status=status), 200


@api_bp.route('/<room_path>/messages', methods=['GET'])
def api_get_messages(room_path):
    """JSON list of chat lines for Chat.jsx."""
    gid = _require_guest()
    if not gid:
        return jsonify(error='unauthorized'), 401
    room_id = path_room_to_id(room_path)
    if room_id is None or has_right_key(room_id, gid) is None:
        return jsonify(error='forbidden'), 403

    return jsonify(messages=_chat_lines(room_id))


@api_bp.route('/<room_path>/messages', methods=['POST'])
def api_send_message(room_path):
    """Append one plain message; returns updated line list."""
    gid = _require_guest()
    if not gid:
        return jsonify(error='unauthorized'), 401
    # Character HQ is command UI only — no message log.
    if room_path == CHARACTER_ROOM_PATH:
        return jsonify(error='use /api/character/command'), 400
    room_id = path_room_to_id(room_path)
    if room_id is None or has_right_key(room_id, gid) is None:
        return jsonify(error='forbidden'), 403

    payload = request.get_json(silent=True) or {}
    message = payload.get('message') or request.form.get('message', '')
    if not str(message).strip():
        return jsonify(error='empty'), 400

    rooms_c.set_chat_messages(room_id, message)
    return jsonify(messages=_chat_lines(room_id)), 201


@api_bp.route('/admin/rooms', methods=['GET'])
def api_admin_rooms():
    """Live room list for AdminPanel.jsx."""
    gid = _require_guest()
    if not gid:
        return jsonify(error='unauthorized'), 401
    if not _may_use_admin_panel(gid):
        return jsonify(error='forbidden'), 403
    return jsonify(rooms=rooms_c.list_rooms())


@api_bp.route('/admin/guests', methods=['GET'])
def api_admin_guests():
    """Live guest list for AdminPanel.jsx."""
    gid = _require_guest()
    if not gid:
        return jsonify(error='unauthorized'), 401
    if not _may_use_admin_panel(gid):
        return jsonify(error='forbidden'), 403
    return jsonify(guests=guests_c.list_guests())


@api_bp.route('/', methods=['GET'])
@api_bp.route('/<value>', methods=['GET'])
def aindex(value=None):
    return '', 404
