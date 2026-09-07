from flask import Blueprint, redirect, request, session

from srcs.utils import fdebug, rand_str

SIZE_LIMIT = 8
SHOW_CHALLENGE_FLAG = 'show_challenge'

core_bp = Blueprint(
    'core_bp', __name__, template_folder='templates', static_folder='static'
)

rooms_c, keys_c, guests_c = 0, 0, 0


def init_db_c(r, k, g):
    global rooms_c, keys_c, guests_c
    rooms_c, keys_c, guests_c = r, k, g


def init_session():
    session.clear()
    session['mvars'] = {
        'user': {'id': "", 'seq': "", 'used': 1},
        'buffer': {'input': "", 'output': "", 'used': 1},
    }


def is_valid_knock_letter(tav):
    return isinstance(tav, str) and len(tav) == 1 and 'a' <= tav <= 'z'


def should_reset_knock_buffer(mvars):
    if not mvars:
        return True
    if len(mvars['buffer']['input']) >= SIZE_LIMIT:
        return True
    return False


@core_bp.route('/', methods=['GET'])
def display_signes():
    # Knock redirect sets this flag so /data/ returns the challenge without flushing.
    if session.pop(SHOW_CHALLENGE_FLAG, False):
        if session.get('mvars') and session['mvars']['buffer']['output']:
            session['mvars']['buffer']['used'] = 1
            return session['mvars']['buffer']['output'][-1]
        return rand_str(1)

    # Manual visit to /data/ — flush the knock buffer.
    init_session()
    return rand_str(1)


@core_bp.route('/<tav>', methods=['GET'])
def knock_knock(tav):
    if is_valid_knock_letter(tav):
        if should_reset_knock_buffer(session.get('mvars')):
            session['mvars'] = {
                'user': {'id': "", 'seq': "", 'used': 1},
                'buffer': {'input': "", 'output': "", 'used': 1},
            }

        session['mvars']['buffer']['input'] += tav
        session['mvars']['buffer']['output'] += rand_str(1)[0]
        session['mvars']['buffer']['used'] = 0

        similar_ans = keys_c.find_key(session['mvars']['buffer']['input'])
        fdebug("similar_ans", similar_ans, "KNOCKx2")
        fdebug(
            "session['mvars']['buffer']['input']",
            session['mvars']['buffer']['input'],
            "KNOCKx2",
        )

        if similar_ans:
            da_same = keys_c.find_key(session['mvars']['buffer']['input'], equal=True)
            fdebug("da_same", da_same, "KNOCKx2")

            if len(da_same) > 0 and da_same[0] in similar_ans:
                session['id'] = rand_str(13)
                session['mvars']['user']['id'] = da_same[0][0]
                session['mvars']['user']['seq'] = session['mvars']['buffer']['output']
                session['mvars']['user']['used'] = 0

        session[SHOW_CHALLENGE_FLAG] = True
        return redirect("/data/")

    init_session()
    return redirect("/data/")


@core_bp.route('/POST', methods=['GET'])
def send_seq():
    data_p = None

    fdebug("args", request.args, "POST")
    fdebug("mvars", session.get('mvars'), "POST")

    if session.get('mvars') and len(request.args) == 1:
        data_p = request.args.get(session['mvars']['user']['seq'])

    if (
        session.get('mvars')
        and data_p == '1'
        and session['mvars']['user']['id'] != 0
        and session['mvars']['user']['id'] != ""
    ):
        ans = keys_c.get_key(session['mvars']['user']['id'])
        if len(ans) > 0:
            valid = session.get('id')
            if valid:
                keys_c.set_key(session['mvars']['user']['id'], valid[:8])
            else:
                print("[POST] Error: couldnt find UserID\n")
    else:
        print("--Not found\n")
        init_session()

    return redirect('/')
