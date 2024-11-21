import string
import random

from flask import Flask,jsonify,redirect,render_template,request,make_response
from flask_mysqldb import MySQL

app = Flask(__name__)
 
app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = '159235'#'SArok480685141S'
app.config['MYSQL_DB'] = 'learsi'
 
mysql = MySQL(app)

valid_url = "/"
user = [0,'']
reg_seq = ""
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
    global reg_seq
    global user
    
    move = "/data/"
    # SELECT * FROM logins
    # WHERE seq LIKE %reg_seq%
    
    # reg_seq = '[0][1][2][..]' // Until no answers or seq limit.
    
    # Control the Seq
    if( len(reg_seq) >= SIZE_LIMIT):
        reg_seq=""
        user = [0,""]
    
    reg_seq += tav
    
    cur = mysql.connection.cursor()
    cur.execute("""SELECT * FROM logins WHERE seq LIKE '{}' """.format(reg_seq+'%'))
    first_match = cur.fetchall()
    if first_match:
        print("Rs: {}".format(reg_seq))
        cur.execute("""SELECT * FROM logins WHERE seq = '{}' """.format(reg_seq))
        next_match = cur.fetchall()
        print("{}[{}] || {}".format(next_match,len(tuple(cur.fetchall())),first_match))
        if (len(tuple(next_match))> 0 and next_match[0] in first_match):
            user[1] = next_match[0][1]
            user[0] = next_match[0][0]
            #path_to_move = "/YouAreIn"

    cur.close()
    return redirect("/data/")

def basic_page(text):
    ret = "<!DOCTYPE html>\n<html>\n<body>\n\n<h1>{}</h1>\n<p>My first paragraph.</p>\n\n</body>\n</html>".format(text)
    return ret
    
@app.route('/clean', methods=['GET'])
def clean():
    reg_seq = ""
    user = [0,""]
    return "Success", 200
@app.route('/data/', methods=['POST'])
def get_data():
    global valid_url
    global user
    resp = ""
    if user[1] != "" and (len(request.data) == 5 and type(request.data) == str):
        #path_2_move = "/YouAreIn"
        #Set Cookie
                        
        cur = mysql.connection.cursor()
        cur.execute("""UPDATE logins SET sessionID= {} WHERE id = {}""".format(request.data,user[0]))
        cur.close()
        codetovalid = rand_str(4)
        resp = make_response(render_template('hello.html', person=user[1], code = codetovalid))
        valid_url = "/data/{}/{}".format(request.data, codetovalid)
    else:
        user = [0,""]
        reg_seq = ""
        valid_url = "/"
        
    return resp
    
@app.route("/<name>")
def print_name(name):
    return basic_page(name)
    
    
if __name__ == "__main__":
    app.run(debug=True)    