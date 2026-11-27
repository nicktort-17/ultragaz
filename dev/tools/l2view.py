import os,sys;sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'));from ugenv import *  # пути окружения
import sys;sys.path.insert(0,TOOLS)
from base import *
shots=eval(sys.argv[1]);lv=sys.argv[2] if len(sys.argv)>2 else 'l2';out=sys.argv[3] if len(sys.argv)>3 else 'v'
with sync_playwright() as p:
    b,pg,errs=open_page(p,900,560)
    J(pg,"()=>__ug.begin('solo','%s')"%lv);pg.wait_for_timeout(3500)
    J(pg,"()=>__eval(`enemies.forEach(e=>e.dead=1);toSpawn.length=0;gunScene.visible=false`)")
    for i,(x,y,z,yaw,pit) in enumerate(shots):
        J(pg,"()=>{const P=__ug.P;P.iT=1e9;P.pos.set(%f,%f,%f);P.vel.set(0,0,0);P.yaw=%f;P.pitch=%f;window.__frz=1}"%(x,y,z,yaw,pit))
        pg.wait_for_timeout(500);pg.screenshot(path=OUT+'/%s_%d.png'%(out,i))
    print([e for e in errs if 'ReadPixels' not in e and 'ERR_FAILED' not in e][:5])
    b.close()
