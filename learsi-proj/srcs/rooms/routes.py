from flask import Blueprint, redirect, render_template, session

from srcs.utils import fdebug

rooms_bp = Blueprint(
    'rooms_bp', __name__, template_folder='templates', static_folder='static'
)

rooms_c, keys_c, guests_c = 0, 0, 0


def init_db_r(r, k, g):
    global rooms_c, keys_c, guests_c
    rooms_c, keys_c, guests_c = r, k, g


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

        pocket = guests_c.get_guest(gid)
        has_guest = 1 if pocket else 0
        kid_matches = keys_c.find_key(gid, equal=True)
        fdebug("kid", kid_matches, "ENTER-ROOM")

        if kid_matches:
            kid = kid_matches[0][0]
            room_that_waits = rooms_c.get_room(rid)

            if room_that_waits:
                room_doors = room_that_waits[0][0].split('.')
                if str(kid) in room_doors:
                    has_permission = 1
        else:
            print("[ENTER-ROOM] Couldnt find key session\n")

        if has_permission:
            if guests_c.add_guest(gid, kid):
                ans = render_template("panel.html", se=gid)

        elif has_guest:
            room_info = rooms_c.get_room(rid)
            if room_info and pocket[0][0] in room_info[0][0].split('.'):
                ans = render_template("panel.html", se=gid)

        else:
            print("[ENTER-ROOM]: Cant get In\n")
    else:
        print("[ENTER-ROOM]: Couldnt find SessionID\n")

    return ans


@rooms_bp.route('/', methods=['GET'])
def rindex():
    return "Rooms"
