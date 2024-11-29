#rooms
from flask import Blueprint,redirect, render_template,session

rooms_bp = Blueprint('rooms_bp', __name__, template_folder = 'templates',static_folder = 'static')


def fdebug(name, var, sendfrom = ''):
    
    l = 0 
    
    if var and type(var) != int:
        l =len(var)
    print("[{}]>>{} = {} | {} | ({})\n".format(sendfrom,name,var,type(var),l))


rooms_c, keys_c, guests_c = 0, 0, 0

def init_db_r(r,k,g):
    global rooms_c, keys_c, guests_c
    #print("Init:\nR: {}\nK: {}\nG: {}\n".format(r,k,g))
    rooms_c, keys_c, guests_c = r, k, g
    

#@rooms_bp.route('/',methods=['GET'])


# has Guest | has Key  | in Session
#     V     |    V     |  X  |  V  |  ==  (x) => login
#           |          |     |     |      (v) => login                    
#     X     |    V     |  ^  |  ^  |  ==  (x) =>                            not possible
#           |          |     |     |      (v) =>    make new guest and login
#     V     |    X     |  ^  |  ^  |  ==  (x) =>                            cant login
#           |          |     |     |      (v) => add key and login
#     X     |    X     |  ^  |  ^  |  ==  (x) =>                            cant login
#           |          |     |     |      (v) =>    make new guest, add key and login

#    has 
#    has no key ? check if in session
#   
#
@rooms_bp.route('/<value>',methods=['GET'])
def enter_room(value):
    
    ans = redirect('/room/')
    
    gid = session.get('id')
    rid = rooms_c.check_room(value, 'paths')
    
    has_premission = 0
    has_guest = 0
    
    fdebug("gid",gid,"ENTER-ROOM")
    fdebug("rid",rid,"ENTER-ROOM")
    
    
    if gid and rid:
        gid = gid[:8:]
        rid=rid[0][0]
        
        
        pocket = guests_c.get_guest(gid) # check if there is a guest with this SessionID & His pocket.
        
        has_guest = 1 if pocket else 0
        has_permission = 0
        kid = keys_c.find_key(gid,equal=True) # Check if there is a key whos waiting for an owner. (id)
        fdebug("kid", kid, "ENTER-ROOM")
        if kid:
        
            kid= kid[0][0]
            
            room_that_waits = self.get_room(rid) # [doors, paths]
            
            if room_that_waits:
                
                room_that_waits = room_that_waits[0][0].split('.') # the doors
                if kid in room_that_waits:
                    #Can enter
                    has_permission = 1
        else:
            print("[ENTER-ROOM] Couldnt find key session\n")
        
        if has_permission:
            
            if guests_c.add_guest(gid,kid):
                ans = render_template("panel.html", se= gid)
            
        elif has_guest:
            
            if pocket[0][0] in rooms_c.get_room(rid)[0][0].split('.'):
                ans = render_template("panel.html", se= gid)

        else:
            print("[ENTER-ROOM]: Cant get In\n")
    else:
        print("[ENTER-ROOM]: Couldnt find SessionID\n")

    return ans
            
            
@rooms_bp.route('/',methods=['GET'])
def rindex():
    
    return "Rooms"