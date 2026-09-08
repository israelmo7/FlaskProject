from flask import Blueprint, redirect, render_template, session
from config import chat.CAPACITY
from srcs.utils import fdebug

rooms_bp = Blueprint(
    'rooms_bp', __name__, template_folder='templates', static_folder='static'
)

rooms_c, keys_c, guests_c = 0, 0, 0
chat_capacity = CAPACITY

def init_db_r(r, k, g):
    global rooms_c, keys_c, guests_c
    rooms_c, keys_c, guests_c = r, k, g

def can_enter_room(room_id, guest_id):
    room_info = rooms_c.get_room(room_id)
    if not room_info or not room_info[0][0]:
        return False

    room_doors = [part for part in str(room_info[0][0]).split('.') if part]
    key_matches = keys_c.find_key_by_session(guest_id)

    if not key_matches:
        return False

    key_id = key_matches[0][0]
    return str(key_id) in room_doors


@rooms_bp.route('/<value>', methods=['GET'])
def enter_room(value):
    ans = redirect('/room/')

    gid = session.get('id')
    rid = rooms_c.check_room(value, 'paths')

    has_guest = 0
    has_permission = 0
    kid = None

    fdebug("gid", gid, "ENTER-ROOM")
    fdebug("rid", rid, "ENTER-ROOM")

    if gid and rid:
        gid = gid[:8]
        rid = rid[0][0]

        can_enter = can_enter_room(rid, gid)
        pocket = guests_c.get_guest(gid)
        has_guest = 1 if pocket else 0
        
        if can_enter:
            if guests_c.add_guest(gid, kid):
                ans = render_template("panel.html", se=gid)

        elif has_guest:
            room_info = rooms_c.get_room(rid)
            if room_info and room_info[0][0]:
                room_doors = [part for part in str(room_info[0][0]).split('.') if part]
                if str(pocket[0][0]) in room_doors:
                    ans = render_template("panel.html", se=gid)

        else:
            print("[ENTER-ROOM]: Cant get In\n")
    else:
        print("[ENTER-ROOM]: Couldnt find SessionID\n")

    return ans

@rooms_bp.route('/<room_id>/messages', methods=['GET'])
def get_messages(room_id):
    gid = session.get('id')

    if not gid:
        return redirect('/')

    if not can_enter_room(room_id, gid[:8]):
        return redirect('/')

    data = rooms_c.get_chat_messages(room_id)
    if not data:
        return redirect('/')

    messages = data[0][0] if data[0][0] else ""
    return render_template("messages.html", messages=messages)



@rooms_bp.route('/<room_id>/messages', methods=['POST'])
def send_message(room_id):
    gid = session.get('id')
    message = request.form.get('message')

    if not gid or not message:
        return redirect('/')
    
    if not can_enter_room(room_id, gid[:8]):
        return redirect('/')

    rooms_c.set_chat_messages(room_id, message)

    return redirect(f'/rooms/{room_id}/messages')


@rooms_bp.route('/', methods=['GET'])
def rindex():
    return "Rooms"
