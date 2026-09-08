from flask import Blueprint, redirect, render_template, session
from srcs.utils import fdebug

rooms_bp = Blueprint(
    'rooms_bp', __name__, template_folder='templates', static_folder='static'
)

rooms_c, keys_c, guests_c = 0, 0, 0

def init_db_r(r, k, g):
    global rooms_c, keys_c, guests_c
    rooms_c, keys_c, guests_c = r, k, g

def own_that_key(gid, kid):

    pocket = guests_c.get_pocket(gid)
    
    if pocket and pocket[0][0] == kid:
        return True

    return False

def has_right_key(room_id, guest_id):

    room_info = rooms_c.get_doors(room_id)
    if not room_info or not room_info[0][0]:
        return False

    room_doors = [door for door in str(room_info[0][0]).split('.') if door]
    key_matches = keys_c.find_key_by_session(guest_id)

    if not key_matches or not room_doors:
        return False

    key_matches = key_matches[0][0]
    print(f"[CAN-ENTER-ROOM]: key_matches={key_matches}, room_doors={room_doors}")
    return str(key_matches) in room_doors


@rooms_bp.route('/<value>', methods=['GET'])
def enter_room(value):
    ans = redirect('/room/')

    gid = session.get('id')
    rid = rooms_c.get_room(value)

    has_guest = 0
    has_permission = 0
    kid = None

    fdebug("gid", gid, "ENTER-ROOM")
    fdebug("rid", rid, "ENTER-ROOM")

    if gid and rid:
        gid = gid[:8]
        rid = rid[0][0]
        print(f"[ENTER-ROOM]: gid={gid}")
        
        have_key = has_right_key(rid, gid)

        has_guest = guests_c.get_guest(gid)
        
        own_key = own_that_key(gid, kid)

        if have_key and not has_guest:
            guests_c.add_guest(gid, kid)
            ans = render_template("panel.html", se=gid)
        
        elif own_key or have_key:
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
        print("[GET-MESSAGES]: No gid found in session")
        return redirect('/')

    if not has_right_key(room_id, gid[:8]):
        print(f"[GET-MESSAGES]: gid={gid} does not have permission to enter room_id={room_id}")
        return redirect('/')

    data = rooms_c.get_chat_messages(room_id)
    if not data:
        print(f"[GET-MESSAGES]: No messages found for room_id={room_id}")
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
    
    if not has_right_key(room_id, gid[:8]):
        return redirect('/')

    rooms_c.set_chat_messages(room_id, message)

    return redirect(f'/rooms/{room_id}/messages')


@rooms_bp.route('/', methods=['GET'])
def rindex():
    return "Rooms"
