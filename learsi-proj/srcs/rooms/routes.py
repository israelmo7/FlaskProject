import threading
import time

from flask import Blueprint, redirect, render_template, request, session

from srcs.db import ADMIN_KEY_ID
from srcs.utils import fdebug

rooms_bp = Blueprint(
    'rooms_bp', __name__, template_folder='templates', static_folder='static'
)

# Special room path (.adminPanel. in DB). Enter like any room: /room/adminPanel
ADMIN_ROOM_PATH = 'adminPanel'

rooms_c, keys_c, guests_c = 0, 0, 0
_cleaner_started = False


def init_db_r(r, k, g):
    global rooms_c, keys_c, guests_c
    rooms_c, keys_c, guests_c = r, k, g


def start_guest_cleaner(app):
    """Background loop: wipe guests table every SESSION_TIMEOUT seconds."""
    global _cleaner_started
    if _cleaner_started or app.config.get('SKIP_MYSQL') or app.config.get('TESTING'):
        return
    _cleaner_started = True

    try:
        timeout = int(app.config.get('SESSION_TIMEOUT', 3600))
    except (TypeError, ValueError):
        timeout = 3600
    timeout = max(timeout, 30)

    def _loop():
        while True:
            time.sleep(timeout)
            try:
                with app.app_context():
                    guests = app.extensions.get('guests_c')
                    if guests:
                        guests.remove_all_guests()
                        print(f"[GUEST-CLEANER] Cleared guests (interval={timeout}s)")
            except Exception as exc:
                print(f"[GUEST-CLEANER] Error: {exc}")

    threading.Thread(target=_loop, name='guest-cleaner', daemon=True).start()


def path_room_to_id(room_path):
    """Turn a path segment like 'lobby' into the numeric rooms.id, or None."""
    rows = rooms_c.get_room(room_path)
    if not rows:
        return None
    return rows[0][0]


def room_type_for(room_path, room_id):
    """chat | admin — from DB rtype, else path fallback."""
    rtype = rooms_c.get_rtype(room_id) if rooms_c else None
    if rtype in ('chat', 'admin'):
        return rtype
    if room_path in (ADMIN_ROOM_PATH, 'admin'):
        return 'admin'
    return 'chat'


def has_right_key(room_id, guest_id):
    """Return key id if guest may enter this room, else None."""
    room_info = rooms_c.get_doors(room_id)
    print(f"[HAS-RIGHT-KEY]: room_id={room_id} room_info={room_info}")
    if not room_info or not room_info[0][0]:
        return None

    room_doors = [door for door in str(room_info[0][0]).split('.') if door]
    key_matches = keys_c.find_key_by_session(guest_id)

    if not key_matches or not room_doors:
        return None

    print(f"[HAS-RIGHT-KEY]: keys={key_matches}, room_doors={room_doors}")
    for match in key_matches:
        if str(match[0]) in room_doors:
            return match[0]
    return None


def has_admin_key(guest_id):
    """True if guest currently holds builtin ADMIN_KEY_ID."""
    matches = keys_c.find_key_by_session(guest_id) or []
    return any(m[0] == ADMIN_KEY_ID for m in matches)


def render_room_shell(room_path, room_type, gid):
    """One React shell; App.jsx picks Chat vs AdminPanel from data-room-type."""
    return render_template(
        "room_app.html",
        room_path=room_path,
        room_type=room_type,
        se=gid,
    )


@rooms_bp.route('/<value>', methods=['GET'])
def enter_room(value):
    """Same door for every room type. React types get the shell immediately."""
    ans = redirect('/room/')

    gid = session.get('id')
    rid = path_room_to_id(value)

    fdebug("gid", gid, "ENTER-ROOM")
    fdebug("rid", rid, "ENTER-ROOM")

    if gid and rid is not None:
        gid = gid[:8]
        print(f"[ENTER-ROOM]: gid={gid} rid={rid} path={value}")
        rtype = room_type_for(value, rid)

        kid = has_right_key(rid, gid)
        if kid is None and rtype == 'admin' and keys_c.find_key_by_session(gid):
            keys_c.grant_admin_key(gid)
            kid = has_right_key(rid, gid)

        if kid is not None:
            if not guests_c.get_guest(gid):
                guests_c.add_guest(gid, kid)
            if rtype != 'admin':
                keys_c.grant_admin_key(gid)

            if rtype == 'admin':
                ans = render_room_shell(value, 'admin', gid)
            else:
                ans = render_template(
                    "panel.html",
                    se=gid,
                    room_id=rid,
                    room_path=value,
                    room_type=rtype,
                )
        else:
            print("[ENTER-ROOM]: Cant get In\n")
    else:
        print("[ENTER-ROOM]: Couldnt find SessionID\n")

    return ans


@rooms_bp.route('/<room_path>/messages', methods=['GET'])
def get_messages(room_path):
    gid = session.get('id')
    room_id = path_room_to_id(room_path)

    if not gid or room_id is None:
        return redirect('/')

    if room_type_for(room_path, room_id) == 'admin':
        return redirect(f'/room/{room_path}')

    print(f"[GET-MESSAGES]: path={room_path} room_id={room_id}, gid={gid}")
    if has_right_key(room_id, gid[:8]) is None:
        print(f"[GET-MESSAGES]: no permission path={room_path} gid={gid}")
        return redirect('/')

    data = rooms_c.get_chat_messages(room_id)
    messages = ""
    if data and data[0] and data[0][0] is not None:
        messages = data[0][0]
        if not isinstance(messages, str):
            messages = str(messages)

    return render_template(
        "messages.html",
        messages=messages,
        room_path=room_path,
        se=gid[:8],
    )


@rooms_bp.route('/<room_path>/messages', methods=['POST'])
def send_message(room_path):
    gid = session.get('id')
    message = request.form.get('message', '')
    print(f"[SEND-MESSAGE]: room_path={room_path}, gid={gid}, message={message!r}")
    if not gid or not message.strip():
        return redirect('/')

    room_id = path_room_to_id(room_path)
    if room_id is None:
        return redirect('/')
    if room_type_for(room_path, room_id) == 'admin':
        return redirect(f'/room/{room_path}')
    if has_right_key(room_id, gid[:8]) is None:
        return redirect('/')

    rooms_c.set_chat_messages(room_id, message)
    return redirect(f'/room/{room_path}/messages')


@rooms_bp.route('/<room_path>/app', methods=['GET'])
def room_app(room_path):
    """Serve React shell; room_type tells App.jsx what to show."""
    gid = session.get('id')
    room_id = path_room_to_id(room_path)

    if not gid or room_id is None:
        return redirect('/')

    gid = gid[:8]
    rtype = room_type_for(room_path, room_id)

    if has_right_key(room_id, gid) is None:
        if rtype == 'admin' and keys_c.find_key_by_session(gid):
            keys_c.grant_admin_key(gid)
        if has_right_key(room_id, gid) is None:
            return redirect('/')

    if rtype != 'admin':
        keys_c.grant_admin_key(gid)

    return render_room_shell(room_path, rtype, gid)


@rooms_bp.route('/', methods=['GET'])
def rindex():
    return '', 404
