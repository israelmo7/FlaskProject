#core
import string
import random
from flask import Blueprint, render_template,redirect,request,session,make_response

def fdebug(name, var, sendfrom = ''):
    
    l = 0 
    
    if var and type(var) != int:
        l =len(var)
    print("[{}]>>{} = {} | {} | ({})\n".format(sendfrom,name,var,type(var),l))

SIZE_LIMIT = 8

core_bp = Blueprint('core_bp', __name__, template_folder = 'templates',static_folder = 'static')

rooms_c, keys_c, guests_c = 0, 0, 0

def init_db_c(r,k,g):
    global rooms_c, keys_c, guests_c
    #print("Init:\nR: {}\nK: {}\nG: {}\n".format(r,k,g))
    rooms_c, keys_c, guests_c = r, k, g
    
def init_session():
    session.clear()
    #print("It really Init(ed)")
    session['mvars'] = {'user': {'id': "",'seq': "",'used': 1}, 'buffer':{'input': "", 'output': "",'used': 1}}

def rand_str(len):

    # using random.choices() generating random strings
    res = ''.join(random.choices(string.ascii_letters, k=len)) # initializing size of string
    return res


@core_bp.route('/',methods=['GET'])
def display_signes():

    ret= rand_str(1)        
    #print("Before: {}\n".format(session['mvars']))
    if session.get('mvars') and session.get('mvars')['buffer']['used'] == 0:
        session['mvars']['buffer']['used'] = 1
        
        #print("After: {}\n".format(session['mvars']))
        ret = session['mvars']['buffer']['output'][-1]
    else:
        init_session()

    return ret



@core_bp.route('/<tav>',methods=['GET'])
def knock_knock(tav):

    resp = ""
    print("knoknok")
    if type(tav) == str and len(tav) == 1 and (tav >= 'a' and tav <= 'z'):
                    
        if not session.get('mvars') or len(session['mvars']['buffer']['input']) >= SIZE_LIMIT or not session.get('user_id'):
           #session['user_id'] = rand_str(32)
           session['mvars'] = {'user':{'id': "",'seq': "",'used': 1}, 'buffer':{'input': "", 'output': "",'used': 1}}
            
            
        session['mvars']['buffer']['input'] += tav
        session['mvars']['buffer']['output'] += rand_str(1)[0]#code_r
        session['mvars']['buffer']['used'] = 0
        
        similar_ans = keys_c.find_key(session['mvars']['buffer']['input'])
        fdebug("similar_ans", similar_ans, "KNOCKx2")
        fdebug("session['mvars']['buffer']['input']", session['mvars']['buffer']['input'], "KNOCKx2")
        if similar_ans: #if some part of the begining is simillar
            #print("Rs: {}".format(reg_seq))
            
            da_same = keys_c.find_key(session['mvars']['buffer']['input'], equal = True)
            fdebug("da_same", da_same, "KNOCKx2")
            
            if len(da_same) > 0 and da_same[0] in similar_ans:
                session['id'] = rand_str(13)
                print("[KNOCKx2] It's Similar\n")
                session['mvars']['user']['id'] = da_same[0][0]
                session['mvars']['user']['seq'] = session['mvars']['buffer']['output']
                session['mvars']['user']['used'] = 0


    else:
        init_session()
        
    return redirect("/data/")
    #GV
@core_bp.route('/POST',methods=['GET'])
def send_seq():

    data_p = None
    
    fdebug("args",request.args, "POST")
    fdebug("mvars", session.get('mvars'), "POST")
    
    ## Check if there is only Arg and set it in 'data_p'.
    if session.get('mvars') and len(request.args) == 1:
    
        fdebug("data_p", data_p, "POST")
        fdebug("requestDeArgs", request.args.get(session['mvars']['user']['seq']), "POST")
            
        data_p = request.args.get(session['mvars']['user']['seq'])
        
    ## Check if there is connection to exist Key [Seq: Found | id: Found]    
    if data_p == '1' and session['mvars']['user']['id'] != 0:
        
        ###################
####     Need to add Auth via Session   
        ###################
        
        ans = keys_c.get_key(session['mvars']['user']['id'])
        if len(ans) > 0:
            
            valid = session.get('id')
            
            ans = "".join(ans[0])
            print("CheckAns: {}\n".format(ans))
            
            if valid:
            
                
                keys_c.set_key(session['mvars']['user']['id'],valid[:8:])
                
                ##Still has no storage
                
                
            else:
                print("[POST] Error: couldnt find UserID\n")
    else:
        print("--Not found\n")
        init_session()
        
    return redirect('/')
    
