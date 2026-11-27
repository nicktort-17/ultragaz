# Поднимает тестовую копию игры (dev/.srv, её готовит prep2.py) на порту UG_PORT (8765).
# python dev/tools/srv.py         — запустить в фоне, если ещё не запущен
# python dev/tools/srv.py --fg    — запустить в этом окне (Ctrl+C — остановить)
# python dev/tools/srv.py --stop  — остановить фоновый сервер
import os,sys,subprocess,urllib.request,time
sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'));from ugenv import *
PID=os.path.join(SRV,'.pid')
def up():
    try:urllib.request.urlopen(URL,timeout=1);return True
    except Exception:return False
if '--stop' in sys.argv:
    if os.path.exists(PID):
        pid=int(open(PID).read())
        if os.name=='nt':subprocess.call(['taskkill','/F','/PID',str(pid)],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
        else:
            try:os.kill(pid,15)
            except OSError:pass
        os.remove(PID)
    print('stopped');sys.exit()
if not os.path.exists(os.path.join(SRV,'index.html')):
    sys.exit('нет %s — сначала python dev/tools/prep2.py'%os.path.join(SRV,'index.html'))
cmd=[sys.executable,'-m','http.server',str(PORT),'--bind','127.0.0.1','--directory',SRV]
if '--fg' in sys.argv:os.execv(sys.executable,cmd) if os.name!='nt' else sys.exit(subprocess.call(cmd))
if up():print('already up',URL);sys.exit()
fl=(subprocess.CREATE_NEW_PROCESS_GROUP|subprocess.DETACHED_PROCESS|subprocess.CREATE_NO_WINDOW) if os.name=='nt' else 0
pr=subprocess.Popen(cmd,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL,stdin=subprocess.DEVNULL,creationflags=fl,start_new_session=os.name!='nt')
open(PID,'w').write(str(pr.pid))
for _ in range(40):
    if up():break
    time.sleep(.25)
print('up' if up() else 'FAILED',URL)
