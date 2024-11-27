#core
import string
import random
from flask import Blueprint, render_template,redirect,request,session


SIZE_LIMIT = 8

core_bp = Blueprint('core_bp', __name__, template_folder = 'templates',static_folder = 'static')

rooms_c, keys_c, guests_c = 0, 0, 0

def init_db(r,k,g):
    global rooms_c, keys_c, guests_c
    print("Init:\nR: {}\nK: {}\nG: {}\n".format(r,k,g))
    rooms_c, keys_c, guests_c = r, k, g
    
def init_session():
    session.clear()
    print("It really Init(ed)")
    session['mvars'] = {'user': {'id': "",'seq': "",'used': 1}, 'buffer':{'input': "", 'output': "",'used': 1}}


def rand_str(len):

    # using random.choices() generating random strings
    res = ''.join(random.choices(string.ascii_letters, k=len)) # initializing size of string
    return res


@core_bp.route('/',methods=['GET'])
def display_signes():

    ret= rand_str(1)        
    print(session['mvars'])
    if session.get('mvars') and session['mvars']['buffer']['used'] == 0:
        session['mvars']['buffer']['used'] = 1
        print(session['mvars'])
        ret = session['mvars']['buffer']['output'][-1]
    else:
        print("11")
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
        
        similar_ans = keys_c.find_key_by_seq(session['mvars']['buffer']['input'])
        
        if similar_ans: #if some part of the begining is simillar
            #print("Rs: {}".format(reg_seq))
            
            da_same = keys_c.find_key_by_seq(session['mvars']['buffer']['input'],same=True)

            
            if len(da_same) > 0 and da_same[0] in similar_ans:
            
                
                
                session['mvars']['user']['id'] = da_same[0][0]
                session['mvars']['user']['seq'] = session['mvars']['buffer']['output']
                session['mvars']['user']['used'] = 0


    else:
        init_session()
        
    return redirect("/data/")
    #GV
@core_bp.route('/POST',methods=['GET'])
def send_seq():

    resp = ""
    
    if session.get('mvars'):
        data_p = request.args.get(session['mvars']['user']['seq'])
        print(session['mvars']['user']['seq']   )
    else:
        data_p = None
        print("data_p = None")
        
    if data_p and 10 > len(data_p) > 0:
        print(data_p)
    else:
        print("Error: not valid")
        data_p = ''
        
    print(session) 
        
    if session.get('mvars') and session['mvars']['user']['id'] != 0 and data_p == session['mvars']['user']['seq']:
        
        print("[{}] == [{}]".format(data_p,session['mvars']['user']['seq']))
        valid = rand_str(8)
        
        ans = keys_c.find_keys(session['mvars']['user']['id'])
        if len(ans) > 0:
        
            ans = "".join(ans[0])
            print("CheckAns: {}\n".format(ans))
            
            if not valid in ans.split("."):
                ans += "." + valid + "."
                
                print("Update it\n")
                keys_c.add_keys(ans,session['mvars']['user']['id'])
                
                if guests_c.add_guest(valid) == 1:
                    resp = make_response(render_template('hello.html', room =session['mvars']['user']['id'], code = valid))

    else:
        print("--Not found\n")
        init_session()
        
    return resp
    
