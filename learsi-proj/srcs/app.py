import string
import random

from srcs import create_app
from flask import Flask,jsonify,redirect,render_template,Blueprint,request,make_response, session
from flask_mysqldb import MySQL

import json
from srcs.db import get_package
from srcs.rooms.routes import rooms_bp, init_db_r
from srcs.core.routes import core_bp, init_db_c

app = create_app()
#session.clear()

config_f = "\\".join(__file__.split('\\')[:-3:1])
config_f += "\\config.json"
with open(config_f) as config_file:
    data_conf = json.load(config_file)
    # Can be improved 
    app.config['MYSQL_HOST'] = data_conf['db']['HOST']
    app.config['MYSQL_USER'] = data_conf['db']['USER']
    app.config['MYSQL_PASSWORD'] = data_conf['db']['PASSWORD']
    app.config['MYSQL_DB'] = data_conf['db']['NAME']
    app.config["SESSION_PERMANENT"] = data_conf['ses']['PERMANENT']
    app.config["SESSION_TYPE"] = data_conf['ses']['TYPE']
    app.config['SESSION_COOKIE_PATH'] = data_conf['ses']['PATH'] 
    app.secret_key = data_conf['ses']['SECRET_KEY']
    
    
    print("[CONFIG] = True")


app.register_blueprint(rooms_bp, url_prefix = '/room')
app.register_blueprint(core_bp, url_prefix = "/data")
print("[BP] = True\n")

#SIZE_LIMIT = 8
mysql = MySQL(app)

rooms_c, keys_c, guests_c = get_package(app,mysql)
#print("Recived:\nR: {}\nK: {}\nG: {}\n".format(rooms_c,keys_c,guests_c))
init_db_r(rooms_c, keys_c, guests_c)
init_db_c(rooms_c, keys_c, guests_c)

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

#@app.route('/room/<value>',methods=['GET'])
@app.route('/admin')
def admin_panel():
    
    return "You Got it!"

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
    
@app.route('/', methods=['GET'])
def gindex():
    return render_template("gindex.html")
#@app.route('/data/', methods=['POST'])
if __name__ == "__main__":
    app.run(debug=True)    