import string
import random

from flask import Flask,jsonify,redirect,render_template,request,make_response, session
from flask_mysqldb import MySQL

app = Flask(__name__)
with app.app_context():
    session['ready'] = 0
    session['id'] = None
app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = '159235'#'SArok480685141S'
app.config['MYSQL_DB'] = 'learsi'
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"

app.secret_key = 'BAD_SECRET_KEY'

#Session(app) 
mysql = MySQL(app)
#                                              user_knocks_code   server_signs_display
mvars = {'user': {'id': "",'seq': ""}, 'buffer':{'input': "", 'output': ""}}
valid_url = "/"
user = [0,'']
reg_seq = ["",""]
SIZE_LIMIT = 8

def rand_str(len):

    # using random.choices() generating random strings
    res = ''.join(random.choices(string.ascii_letters, k=len)) # initializing size of string
    return res
    
@app.route(valid_url, methods=['GET'])
def login():
    path_2_move = "/data/"
    if valid_url != "/":
        path_2_move = "/YouAreIn"

    return redirect(path_2_move)
    
@app.route('/data/<tav>', methods=['GET'])
def knock_knock(tav):
    global mvars
    
    resp = ""
        
    if type(tav) == str and len(tav) == 1 and (tav >= 'a' and tav <= 'z'):
            
        if( len(mvars['buffer']['input']) >= SIZE_LIMIT):
            mvars = {'user':{'id': "",'seq': ""}, 'buffer':{'input': "", 'output': ""}}
            
        print (session)
        
        if 'id' in session.keys() and session['id'] != None:
            session['id'] = '0'
            
        mvars['buffer']['input'] += tav
        mvars['buffer']['output'] += rand_str(1)[0]#code_r

        cur = mysql.connection.cursor()
        cur.execute("""SELECT * FROM logins WHERE seq LIKE '{}' """.format(mvars['buffer']['input']+'%'))
        its_similar = cur.fetchall()
        
        if its_similar: #if some part of the begining is simillar
            #print("Rs: {}".format(reg_seq))
            cur.execute("""SELECT * FROM logins WHERE seq = '{}' """.format(mvars['user']['id']))
            da_same = cur.fetchall()
            session['ready'] = 1
            print("{}[{}] || {}".format(da_same,len(tuple(cur.fetchall())),its_similar))
            
            if len(da_same) > 0 and da_same[0] in its_similar:
            #if (len(tuple(da_same))<3 and da_same[0] in its_similar):
                #user[1] = its_same[0][1]
                session['id'] = da_same[0][0]
                mvars['user']['id'] = da_same[0][0]
                mvars['user']['seq'] = mvars['buffer']['output']
                mvars['buffer']['output'] = ""
                mvars['buffer']['input'] = ""
                #path_to_move = "/YouAreIn"
            
        cur.close()
    return redirect("/data/")
    #GV

@app.route('/admin')
def admin_panel():
    
    return "You Got it!" if not session.get('id') else "None for you"
@app.route('/data/', methods=['GET'])
def display_signes():
    global mvars
    res = ''
    print (session)
    
    if 'ready' in session.keys() and session['ready'] == 1:
        print("^^^^^^^^^^^^^^^{}\n".format(mvars['buffer']['output']))
        res = mvars['buffer']['output'][-1]
        session['ready'] = 0
        #mvars['buffer']['output'][-1] = res
    else:
        mvars = {'user':{'id': "",'seq': ""}, 'buffer':{'input': "", 'output': ""}}
        
    return res
    
@app.route('/data/', methods=['POST'])
def get_data():
    global mvars
    global valid_url
    resp = ""
    
    if mvars['user']['id'] != 0 and request.data == mvars['user']['seq']:
        
        valid = rand_str(8)
        
        cur = mysql.connection.cursor()
        cur.execute("""UPDATE logins SET sessionID= {} WHERE id = {}""".format(valid,user[0]))
        cur.close()
        resp = make_response(render_template('hello.html', person=user[1], code = valid))
        valid_url = "/data/{}/{}".format(mvars['user']['seq'], valid)
    else:
        print("--Not found\n")
        mvars = {'user':{'id': "",'seq': ""}, 'buffer':{'input': "", 'output': ""}}
        valid_url = "/"
        session['id'] = None
        
    return resp
    
if __name__ == "__main__":
    app.run(debug=True)    