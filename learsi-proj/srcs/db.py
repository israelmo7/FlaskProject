
from flask import Flask
from flask_mysqldb import MySQL

app = Flask(__name__)
app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = '159235'#'SArok480685141S'
app.config['MYSQL_DB'] = 'learsi'

app.secret_key = 'BAD_SECRET_KEY'

#Session(app) 
mysql = MySQL(app)


def add_guest(gid,s):
    cur = mysql.connection.cursor()
    
    cur.execute("""select * from guests where session = '{}' """.format(gid))
    ans = cur.fetchall()
    print("AddGuest: and= {}\n".format(ans))
    if len(ans) == 0:            
        cur.execute("""insert into guests(session,pocket) values ('{}','.{}.')""".format(gid,s))
        mysql.connection.commit()
        ans = cur.fetchall()
        ans = 1
    else:
        ans = 0
    
    cur.close()
    return ans
        
def push_data(table, data):
    cur = mysql.connection.cursor()
    data = ",".join(data)
    cur.execute("""insert into {} values ('{}')""".format(table,data))
    ans = cur.fetchall()
    
    cur.close()
    return ans
    
    
def check_room(r, column):
    cur = mysql.connection.cursor()
    cur.execute("""select id from rooms where {} like '%.{}.%'""".format(column,r))
    ans = cur.fetchall()
    
    cur.close()
    return ans if len(ans)>0 else 0
    
def open_lock(rid, gid):

    ans = check_guest(gid)
    
    res = 0
    if ans:
        cur = mysql.connection.cursor()
        cur.execute("""select id from keys_t where sessions like '%.{}.%'""".format(ans))
        ans = cur.fetchall()
        cur.close()
        ans = "".join(ans)
        if ans:
            if check_room(ans,'doors') == rid:
                #logged in
                res = 1
            
    
        
        
        
    return res
    
def check_guest(gid):
    
    cur = mysql.connection.cursor()
    cur.execute("""select pocket from guests where session = '{}'""".format(gid))
    ans = cur.fetchall()

    cur.close()    
    return ans if len(ans) > 0 else 0