from flask import Blueprint, redirect, render_template, session
from srcs.utils import fdebug

rooms_bp = Blueprint(
    'rooms_bp', __name__, template_folder='templates', static_folder='static'
)

rooms_c, keys_c, guests_c = 0, 0, 0
chat_capacity = 1000

def init_db_r(r, k, g, c):
    global rooms_c, keys_c, guests_c, chat_capacity
    rooms_c, keys_c, guests_c, chat_capacity = r, k, g, c 

def can_enter_room(room_id, guest_id):
    """Return the matching key id if guest may enter, else None."""
    room_info = rooms_c.get_doors(room_id)
    if not room_info or not room_info[0][0]:
        return None

    room_doors = [part for part in str(room_info[0][0]).split('.') if part]
    key_matches = keys_c.find_key_by_session(guest_id)

    if not key_matches or not room_doors:
        return None

    kid = key_matches[0][0]
    print(f"[CAN-ENTER-ROOM]: kid={kid}, room_doors={room_doors}")
    if str(kid) in room_doors:
        return kid
    return None


@rooms_bp.route('/<value>', methods=['GET'])
def enter_room(value):
    ans = redirect('/room/')

    gid = session.get('id')
    rid = rooms_c.check_room(value, 'paths')

    fdebug("gid", gid, "ENTER-ROOM")
    fdebug("rid", rid, "ENTER-ROOM")

    if gid and rid:
        gid = gid[:8]
        rid = rid[0][0]
        print(f"[ENTER-ROOM]: gid={gid}")
        kid = can_enter_room(rid, gid)
        pocket = guests_c.get_guest(gid)
        # NULL pocket is a broken row from older enter_room; treat as no guest key
        has_guest = 1 if pocket and pocket[0][0] is not None else 0

        if kid is not None:
            if guests_c.add_guest(gid, kid):
                ans = render_template("panel.html", se=gid)

        elif has_guest:
            room_info = rooms_c.get_doors(rid)
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
    print(f"[GET-MESSAGES]: room_id={room_id}, gid={gid}")
    if not gid:
        return redirect('/')

    if not can_enter_room(room_id, gid[:8]):
        return redirect('/')

    data = rooms_c.get_chat_messages(room_id)
    if not data:
        return redirect('/')

    messages = data[0][0] if data[0][0] else ""
    print(f"[GET-MESSAGES]: room_id={room_id}, gid={gid}, messages={messages}")
    return render_template("messages.html", messages=messages)



@rooms_bp.route('/<room_id>/messages', methods=['POST'])
def send_message(room_id):
    gid = session.get('id')
    message = request.form.get('message')
    print(f"[SEND-MESSAGE]: room_id={room_id}, gid={gid}, message={message}")
    if not gid or not message:
        return redirect('/')
    
    if not can_enter_room(room_id, gid[:8]):
        return redirect('/')

    rooms_c.set_chat_messages(room_id, message)

    return redirect(f'/rooms/{room_id}/messages')


@rooms_bp.route('/', methods=['GET'])
def rindex():
    return "Rooms"
