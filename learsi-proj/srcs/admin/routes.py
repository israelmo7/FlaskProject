"""Admin features for the special room `adminPanel` (rtype=admin).

rooms_bp still owns the door (enter + keys) like any room.
This blueprint owns the admin *page* and live list APIs.
"""

from flask import Blueprint, jsonify, redirect, render_template, session

from srcs.db import ADMIN_KEY_ID

admin_bp = Blueprint(
    'admin_bp', __name__, template_folder='templates', static_folder='static'
)

# Same path token as rooms.paths (.adminPanel.) — enter via /room/adminPanel
ADMIN_ROOM_PATH = 'adminPanel'

rooms_c, keys_c, guests_c = 0, 0, 0


def init_db_adm(r, k, g):
    global rooms_c, keys_c, guests_c
    rooms_c, keys_c, guests_c = r, k, g


def has_admin_key(guest_id):
    """True if guest currently holds builtin ADMIN_KEY_ID."""
    matches = keys_c.find_key_by_session(guest_id) or []
    return any(m[0] == ADMIN_KEY_ID for m in matches)


def render_admin_room_page(room_path, gid):
    """React shell with data-room-type=admin (AdminPanel.jsx, not Chat)."""
    return render_template(
        "room_app.html",
        room_path=room_path or ADMIN_ROOM_PATH,
        room_type='admin',
        se=gid,
    )


@admin_bp.route('/', methods=['GET'])
def admin_home():
    """Shortcut → the adminPanel room (still entered like any /room/...)."""
    return redirect(f'/room/{ADMIN_ROOM_PATH}')


def _require_admin_guest():
    gid = session.get('id')
    if not gid:
        return None
    gid = gid[:8]
    if not has_admin_key(gid):
        return None
    return gid


@admin_bp.route('/api/rooms', methods=['GET'])
def api_rooms():
    """Live room list for AdminPanel.jsx."""
    if _require_admin_guest() is None:
        return jsonify(error='forbidden'), 403
    return jsonify(rooms=rooms_c.list_rooms())


@admin_bp.route('/api/guests', methods=['GET'])
def api_guests():
    """Live guest list for AdminPanel.jsx."""
    if _require_admin_guest() is None:
        return jsonify(error='forbidden'), 403
    return jsonify(guests=guests_c.list_guests())
