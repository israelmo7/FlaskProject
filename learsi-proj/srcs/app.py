import string
import random

from srcs import create_app
from flask import Flask,jsonify,redirect,render_template,Blueprint,request,make_response, session
from flask_mysqldb import MySQL
from srcs import db
from srcs.rooms.routes import rooms_bp

app = create_app()
#session.clear()

app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = '159235'#'SArok480685141S'
app.config['MYSQL_DB'] = 'learsi'
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"

app.secret_key = 'BAD_SECRET_KEY'

app.register_blueprint(rooms_bp, url_prefix = '/room')

#Session(app) 
mysql = MySQL(app)
#                                              user_knocks_code   server_signs_display
mvars = {'user': {'id': "",'seq': "",'used': 1}, 'buffer':{'input': "", 'output': "",'used': 1}}
valid_url = "/"
user = [0,'']
reg_seq = ["",""]
SIZE_LIMIT = 8

def rand_str(len):

    # using random.choices() generating random strings
    res = ''.join(random.choices(string.ascii_letters, k=len)) # initializing size of string
    return res
"""    
@app.route(valid_url, methods=['GET'])
def login():
    path_2_move = "/data/"
    if valid_url != "/":
        path_2_move = "/YouAreIn"

    return redirect(path_2_move)
"""

@app.route('/room/<value>',methods=['GET'])
def enter_room(value):
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
            
@app.route('/data/<tav>', methods=['GET'])
def knock_knock(tav):
    global mvars
    
    resp = ""
        
    if type(tav) == str and len(tav) == 1 and (tav >= 'a' and tav <= 'z'):
                    
        if not session.get('user_id') or len(mvars['buffer']['input']) >= SIZE_LIMIT:
            session['user_id'] = rand_str(32)
            mvars = {'user':{'id': "",'seq': "",'used': 1}, 'buffer':{'input': "", 'output': "",'used': 1}}
            
            
        mvars['buffer']['input'] += tav
        mvars['buffer']['output'] += rand_str(1)[0]#code_r
        mvars['buffer']['used'] = 0
        cur = mysql.connection.cursor()
        cur.execute("""SELECT * FROM keys_t WHERE seq LIKE '{}' """.format(mvars['buffer']['input']+'%'))
        its_similar = cur.fetchall()
        
        if its_similar: #if some part of the begining is simillar
            #print("Rs: {}".format(reg_seq))
            cur.execute("""SELECT * FROM keys_t WHERE seq = '{}' """.format(mvars['buffer']['input']))
            da_same = cur.fetchall()

            print("{}[{}] || {}".format(da_same,len(tuple(cur.fetchall())),its_similar))
            
            if len(da_same) > 0 and da_same[0] in its_similar:
            #if (len(tuple(da_same))<3 and da_same[0] in its_similar):
                #user[1] = its_same[0][1]

                mvars['user']['id'] = da_same[0][0]
                mvars['user']['seq'] = mvars['buffer']['output']
                mvars['user']['used'] = 0
        cur.close()
        session['glob'] = mvars


    else:
        session.clear()
        mvars = {'user':{'id': "",'seq': "",'used': 1}, 'buffer':{'input': "", 'output': "",'used': 1}}

    return redirect("/data/")
    #GV

@app.route('/admin')
def admin_panel():
    
    return "You Got it!"
@app.route('/data/', methods=['GET'])
def display_signes():
    global mvars
    ret = ''
    
    if mvars['buffer']['used'] == 0:
        mvars['buffer']['used'] = 1
        ret = mvars['buffer']['output'][-1]
    else:
        ret= rand_str(1)
        mvars = {'user':{'id': "",'seq': "",'used':1}, 'buffer':{'input': "", 'output': "",'used': 1}}
    

    session['glob'] = mvars
    return ret

@app.route('/test/<parm>')    
def tests(parm):
    print(type(parm))
    ret = jsonify(success=True)
    if type(parm) == str:
        try:
            parm = int(parm,10)                
            cur = mysql.connection.cursor()
            cur.execute("""update keys_t set sessions = {} where id = 99""".format(parm))
            mysql.connection.commit()
            cur.close()
            
        except ValueError:
            print("Enter number")
            ret = jsonify(success=False)
        
    return ret
    
    
@app.route('/<value>', methods=['POST'])
def join_room(value):
    
    ret = jsonify(success=False)
    
    data_p = request.get_data()
    print(type(value))
    if type(value) == str and 15 > len(value) > 0:
        #data_p = data_p.decode('utf-8')

        cur = mysql.connection.cursor()
        cur.execute("""select id from keys_t where sessions like "%{}%" """.format(value))
        ans = cur.fetchall()
    
        print (ans)
        if len(ans) == 1:
            
            cur.execute("""select * from guests where pocket = '{}'""".format(value))
            ans = cur.fetchall()
            print("ans= {}\nlen(ans)={}\n".format(ans,len(ans)))    
            if len(ans) == 0:
                cur.execute("""insert into guests (pocket) values( '{}' )""".format(value))
                mysql.connection.commit()
                
            print("data_p = {}\n".format(data_p))       
            ret = redirect('/admin')
            
        cur.close()

    else:   
        print("Error: not valid")
        
        
    return ret
@app.route('/data/', methods=['POST'])
def send_seq():
    global mvars

    resp = ""
    data_p = request.get_data()
    if type(data_p) == bytes and 10 > len(data_p) > 0:
        data_p = data_p.decode('utf-8')
    else:
        print("Error: not valid")
        data_p = ''
        
    print("[{}] == [{}]".format(data_p,mvars['user']['seq']))
    
    if mvars['user']['id'] != 0 and data_p == mvars['user']['seq']:
        print("In") 
        valid = rand_str(8)
        
        cur = mysql.connection.cursor()
        
        cur.execute("""select sessions from keys_t where id = {} """.format(mvars['user']['id']))
        ans = cur.fetchall()
        
        if len(ans) > 0:
        
            ans = "".join(ans[0])
            print("CheckAns: {}\n".format(ans))
            
            if not valid in ans.split("."):
                ans += "." + valid + "."
                
                print("Update it\n")
                cur.execute("""update keys_t set sessions = "{}" where id = {}""".format(ans, mvars['user']['id']))
                mysql.connection.commit()
                
                if db.add_guest(valid) == 1:
                    resp = make_response(render_template('hello.html', room =mvars['user']['id'], code = valid))

        cur.close()
    else:
        print("--Not found\n")
        mvars = {'user':{'id': "",'seq': "",'used':1}, 'buffer':{'input': "", 'output': "",'used': 1}}
    
    session['glob'] = mvars
    return resp
    
if __name__ == "__main__":
    app.run(debug=True)    