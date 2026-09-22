from flask import Blueprint, jsonify, request, session

from srcs.rooms.routes import has_admin_key, has_right_key, path_room_to_id

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
    return [line for line in raw.split('\n') if line]


def _require_guest():
    gid = session.get('id')
    if not gid:
        return None
    return gid[:8]


@api_bp.route('/<room_path>/messages', methods=['GET'])
def api_get_messages(room_path):
    """JSON list of chat lines for the React room UI."""
    gid = _require_guest()
    if not gid:
        return jsonify(error='unauthorized'), 401
    room_id = path_room_to_id(room_path)
    if room_id is None or has_right_key(room_id, gid) is None:
        return jsonify(error='forbidden'), 403

    return jsonify(messages=_chat_lines(room_id))


@api_bp.route('/<room_path>/messages', methods=['POST'])
def api_send_message(room_path):
    """Append one plain message string; returns updated line list."""
    gid = _require_guest()
    if not gid:
        return jsonify(error='unauthorized'), 401
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
    """List rooms for AdminPanel (requires builtin admin key)."""
    gid = _require_guest()
    if not gid:
        return jsonify(error='unauthorized'), 401
    if not has_admin_key(gid):
        return jsonify(error='forbidden'), 403
    return jsonify(rooms=rooms_c.list_rooms())


@api_bp.route('/admin/guests', methods=['GET'])
def api_admin_guests():
    """List guests for AdminPanel (requires builtin admin key)."""
    gid = _require_guest()
    if not gid:
        return jsonify(error='unauthorized'), 401
    if not has_admin_key(gid):
        return jsonify(error='forbidden'), 403
    return jsonify(guests=guests_c.list_guests())


@api_bp.route('/', methods=['GET'])
@api_bp.route('/<value>', methods=['GET'])
def aindex(value=None):
    return '', 404
