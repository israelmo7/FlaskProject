
from flask import Flask

class Database:

    #Variables
    ########################################
    
    #_mysql = None
    #_cur = None
    
    
    
    #Inner-Functions
    ########################################

    def __init__(self,app, mysql):
        with app.app_context():
            print(app)
            self._mysql = mysql
            #self._cur = mysql.connection.cursor()
                
    def get_cur(self):
        return self._mysql.connection.cursor()
    """        
    def __del__(self):
        if self._cur:       
            self._cur.close()
    """

    #Global-Functions
    ########################################
    
    def push_data(self, table, data):
    
        data = ",".join(data)
        self._cur.execute("""insert into {} values ('{}')""".format(table,data))
        ans = self._cur.fetchall()
        
        return ans
        
        

            ####--- Classes ---####        
    ########################################
    ########################################
    
    
####--- ROOMS ---####        
class Rooms_c(Database): 
    
    def __init__(self,app,mysql):
        super().__init__(app,mysql)
   ##-->
      
    def check_room(self, r, column):

        ans=0
        with self.get_cur() as _cur:

            _cur.execute("""select id from rooms where {} like '%.{}.%'""".format(column,r))
            ans = _cur.fetchall()

        return ans if len(ans)>0 else 0
   
   
   ##-->
    
    def open_lock(self, rid, gid):

    
        ans = check_guest(gid)
        
        res = 0
        if ans:
            with self.get_cur() as _cur:

                _cur.execute("""select id from keys_t where sessions like '%.{}.%'""".format(ans))
                ans = _cur.fetchall()
                
                ans = "".join(ans)
                if ans:
                    if check_room(ans,'doors') == rid:
                        #logged in
                        res = 1
        return res

####################
####--- KEYS ---####
class Keys_c(Database):


    def __init__(self,app,mysql):
        super().__init__(app,mysql)
   ##-->  
   
    def add_keys(self,kid,ses):
        
        with self.get_cur() as _cur:
            _cur.execute("""select sessions from keys_t where id = '{}' """.format(kid))
            print("Kid: {}\n".format(kid))
            kses = _cur.fetchall()
            ses=str(ses)
            print("Kses: {}\n".format(kses))
            print("Ses: {}\n".format(ses))
            if kses == '' or ses not in kses.split('.'):
                kses += ses + '.'
                _cur.execute("""update keys_t set sessions = '{)' where id = '{}'""".format(kses,kid))
                self._mysql.connection.commit()
                
   ##-->        
   
    def find_keys(self,kid):
        ans=0
        with self.get_cur() as _cur:

            _cur.execute("""select sessions from keys_t where id = '{}' """.format(kid))
            ans = _cur.fetchall()
            
        return ans
   ##-->
    
    def find_key_by_seq(self,ses):
        ans=0
        with self.get_cur() as _cur:
            print("Parms:\nses: {}\n_cur: {}\n".format(ses,_cur))
            
            _cur.execute("""select * from keys_t where seq like '{}' """.format(ses))
            ans = _cur.fetchall()
            print("ANS: {}\n".format(ans))
                
        return ans
        
        
######################
####--- GUESTS ---####        
class Guests_c(Database):


    def __init__(self,app,mysql):
        super().__init__(app,mysql)
        
   ##-->

    def add_guest(self,gid,s):
        ans=0
        with self.get_cur() as _cur:

            _cur.execute("""select * from guests where session = '{}' """.format(gid))
            ans = _cur.fetchall()
            print("AddGuest: and= {}\n".format(ans))
            if len(ans) == 0:            
                _cur.execute("""insert into guests(session,pocket) values ('{}','.{}.')""".format(gid,s))
                self._mysql.connection.commit()
                ans = _cur.fetchall()
                ans = 1
            else:
                ans = 0
            
        return ans
   
   ##-->

    def check_guest(self,gid):
        ans=0
        with self.get_cur() as _cur:
    
            _cur.execute("""select pocket from guests where session = '{}'""".format(gid))
            ans = _cur.fetchall()

        return ans if len(ans) > 0 else 0        



def get_package(app, mysql):

    print("Send Package:\napp: {}\nmysql: {}\n".format(app,mysql))
    r = Rooms_c(app,mysql)
    k = Keys_c(app,mysql)
    g = Guests_c(app,mysql)
    
    return [r,k,g]