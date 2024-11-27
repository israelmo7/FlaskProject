#rooms
from flask import Blueprint, render_template

rooms_bp = Blueprint('rooms_bp', __name__, template_folder = 'templates',static_folder = 'static')


@rooms_bp.route('/',methods=['GET'])
@rooms_bp.route('/<value>',methods=['GET'])
def enter_room(value):
    print("Inside app")
    resp = redirect('/data/')
    ret = jsonify(success=False)
    
    print("Val: {}\n".format((session.get('user_id'))))
    if session.get('user_id'):
        print(session.get('user_id'))
        rid = db.check_room(value,'paths')
        if rid:
            if db.open_lock(rid,session['user_id']):
                resp = render_template('panel.html', se = session['user_id'])
    else:
        print("Session not found")
        
    return resp
            