
from flask import Flask

MAX_KEY_SESSIONS = 5

class Database:

    #Variables
    ########################################
    
    #_mysql = None
    #_cur = None
    
    
    
    #Inner-Functions
    ########################################

    def __init__(self,app, mysql):
        with app.app_context():
            self._mysql = mysql
            #self._cur = mysql.connection.cursor()
                
    def get_cur(self):
        return self._mysql.connection.cursor()
    """        
    def __del__(self):
        if self._cur:       
            self._cur.close()
    """
    def commitit(self):
        self._mysql.connection.commit()
    #Global-Functions
    ########################################
    
    def push_data(self, table, data):
    
        data = ",".join(data)
        self._cur.execute("""insert into {} values ('{}')""".format(table,data))
        ans = self._cur.fetchall()
        
        return ans
        
    
    def get_session(self, sid):
        
        ans = 0
        with self.get_cur() as _cur:
        
            _cur.execute(""" select * from sessions where s == '{}' """.format(sid))
            ans = _cur.fetchall()
            
            if ans != ():
                # for now 1 result only
                #( (s, t, value, extra)
                
                ans = ans[0][1::]
            
        return ans
    
    def set_session(self, s):
        
        res = 0
        
        # if its valid by num of args, their len and if there is no duplicate.
        if len(s) == 4 and (len(s[0]) <= 32 and len(s[1]) <= 1 and len(s[2]) <= 13 and len(s[3]) <= 7) and self.get_session(s[0]) == 0:
            
            with self.get_cur() as _cur:
                
                _cur.execute(""" insert into sessions values ('{}', '{}', '{}', '{}') """.format(s[0], s[1], s[2], s[3]))
                self.commitit()
                print("Session: Added!\n")
                res = 1
                
        return res
    


            ####--- Classes ---####        
    ########################################
    ########################################
    
    
####--- ROOMS ---####        
class Rooms_c(Database): 
    
    def __init__(self,app,mysql):
        super().__init__(app,mysql)
   ##-->
      
      
    def get_room(self, rid):
        
        ans=None
        with self.get_cur() as _cur:
        
            _cur.execute(""" select doors,paths from keys_t where id = '{}' """.format(rid))
            ans = _cur.fetchall()
        return ans
        
    def enter_aroom(self, path):
        
        rid = check_room("paths", path)
        gid = session.get('id')
        if rid and gid:
            rid = rid[0][0]
            gid = gid[:8:]
            
            
            
            
    def check_room(self, r, column):

        ans=None
        with self.get_cur() as _cur:

            _cur.execute("""select id from rooms where {} like '%.{}.%'""".format(column,r))
            ans = _cur.fetchall()

        return ans
   
   
   ##-->
    

####################
####--- KEYS ---####
class Keys_c(Database):


    def __init__(self,app,mysql):
        super().__init__(app,mysql)
   ##-->  
   
    def set_key(self,kid, gid):
        
        kses = self.get_key(kid)
    
        print("Kid: {}\n".format(kid))
        
        
        if kses != None != (): # Itsnt an empty search 
            
            kses = kses[0][0]#[:-2:]#"".join(str(kses)).split('.')
            kses = kses.split('.')[1:-1:]
            
            
            print("Kses: {}\n".format(kses))
            print("Gid: {}\n".format(gid))
            
            # kses (now) => list of key sessions
            
            already_there = gid in kses
            if len(kses) > MAX_KEY_SESSIONS:
                kses = kses[(0 if already_there else 1):MAX_KEY_SESSIONS:]
                print("[ADD-KEY] kses = {}\n".format(kses))

            if not already_there:
            #######
            
                more_sessions_by_this_guest = self.find_key(gid,equal=True)
                
                if more_sessions_by_this_guest:
                    self.del_key_ses(more_sessions_by_this_guest,gid)
                
                kses = "." + ".".join(kses + [gid + '.'])
                
                with self.get_cur() as _cur:
                    _cur.execute("""update keys_t set sessions = '{}' where id = '{}' """.format(kses,kid))
                    self.commitit()
    
                    print("Keys_t: Updated!\n")
                    
            

    
   ##-->        
   
    def del_key_ses(self,kids,gid):
        
        with self.get_cur() as _cur:
            for kid in kids:
                
                
                _cur.execute("""select sessions from keys_t where id = '{}' """.format(str(kid)))
                ans = _cur.fetchall()
                
                if len(ans)>0:
                    ans = [str(i[0]) for i in ans]
                    
                    try:
                        ans.pop(ans.index(gid))
                        print("[DelKey]>> Guest removed from key ({})\n".format(kid))
                    except ValueError:
                        print("[DelKey]>> Error: Couldnt find the index\n")
                    _cur.execute(""" update keys_t set sessions = '{}' where id = '{}' """.format())
                
   ##-->        
   
    def get_key(self,kid):
        ans=None
        with self.get_cur() as _cur:

            _cur.execute("""select sessions from keys_t where id = '{}' """.format(kid))
            ans = _cur.fetchall()
            
        return ans
   ##-->
    
    def find_key(self,seq, equal = False):
        ans=None
        with self.get_cur() as _cur:
        
            print("Parms:\nseq: {}\n_cur: {}\n".format(seq,_cur))
            ###### Not Secure
            
            cmd_sql = """select id from keys_t where seq like '%{}{}' """.format(seq, '%' if not equal else '')
            print(cmd_sql)
            _cur.execute(cmd_sql)
            ans = _cur.fetchall()
            print("ANS: {}\n".format(ans))
                
        return ans
        
        
######################
####--- GUESTS ---####        
class Guests_c(Database):


    def __init__(self,app,mysql):
        super().__init__(app,mysql)
        
   ##-->
    
    def update_guest(self, gid, s):
        
        if self._get_guest(gid):
            
            with self.get_cur() as _cur:
            
                _cur.execute(""" update guests set pocket = '{}' where id = '{}' """.format(s,gid))
                _self.comitit()
        else:
            print("UP-GUEST]Error: couldnt find this guest\n")
        
        
        
    def add_guest(self,gid,s):
        ans=0
        with self.get_cur() as _cur:

            # Check if exist
            _cur.execute("""select pocket from guests where session = '{}' """.format(gid))
            ans = _cur.fetchall()
            print("AddGuest: and= {}\n".format(ans))
            
            
            if len(ans) == 0:            
            ##Need Session
                _cur.execute("""insert into guests(session,pocket) values ('{}','{}')""".format(gid,s))
                self._mysql.connection.commit()
                ans = _cur.fetchall()
                ans = 1
                
                #                  s   t   v   e
                self.set_session((gid, 'k', 'session', ''))
            
            
            elif ans[0][0] != s:
                ans=1
                self.update_guest(gid,s)
                
            
        return ans

   ##-->

    def get_guest(self,gid):
        ans=None
        with self.get_cur() as _cur:
    
            _cur.execute("""select pocket from guests where session = '{}'""".format(gid))
            ans = _cur.fetchall()

        return ans if ans != () else None        



def get_package(app, mysql):

#    print("Send Package:\napp: {}\nmysql: {}\n".format(app,mysql))
    r = Rooms_c(app,mysql)
    k = Keys_c(app,mysql)
    g = Guests_c(app,mysql)
    return [r,k,g]