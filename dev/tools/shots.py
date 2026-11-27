import os,sys;sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'));from ugenv import *  # пути окружения
import sys,json;sys.path.insert(0,TOOLS)
from base import *
lv=sys.argv[1];views=json.loads(sys.argv[2]);tag=sys.argv[3] if len(sys.argv)>3 else 's'
def F(pg,n=30):pg.evaluate("()=>new Promise(r=>{let n=0;const f=()=>{if(++n>%d)r();else requestAnimationFrame(f)};f()})"%n)
with sync_playwright() as p:
    b,pg,errs=open_page(p,1280,720)
    J(pg,"()=>__ug.begin('solo','%s')"%lv);pg.wait_for_timeout(1500)
    J(pg,"()=>{document.getElementById('lvCard').hidden=true;__ug.P.iT=1e9;window.__dt=1/30;if(__eval('typeof L4!==\"undefined\"&&L4')){__eval('L4.intro.t=20;L4.intro.hop=1;L4.car.visible=false')}}")
    F(pg,10)
    J(pg,"()=>{window.__frz=1;document.querySelectorAll('#hud,.hud,#hudL,#hudR').forEach(e=>e.style.display='none');__eval('gunScene.visible=false')}")
    for i,(x,y,z,yaw,pit) in enumerate(views):
        J(pg,"()=>{const P=__ug.P;P.pos.set(%f,%f,%f);P.vel.set(0,0,0);P.yaw=%f;P.pitch=%f;__ug.enemies.forEach(e=>e.dead=1)}"%(x,y,z,yaw,pit))
        F(pg,6);pg.screenshot(path=OUT+'/%s_%d.png'%(tag,i))
    print([e for e in errs if 'ReadPixels' not in e and 'ERR_FAILED' not in e][:8])
    b.close()
