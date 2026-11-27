import os,sys;sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'));from ugenv import *  # пути окружения
import sys;sys.path.insert(0,TOOLS)
from base import *
with sync_playwright() as p:
    b,pg,errs=open_page(p,900,540)
    J(pg,"()=>__ug.begin('solo','l3')");pg.wait_for_timeout(4500)
    for i,(x,y,z,yaw,pit) in enumerate([(30,-2.5,-80,1.3,.05),(8,0,-20,0.6,-.1),(0,0,-60,0,0)]):
        J(pg,"()=>{const P=__ug.P;P.iT=1e9;P.pos.set(%f,%f,%f);P.vel.set(0,0,0);P.yaw=%f;P.pitch=%f;window.__frz=1}"%(x,y,z,yaw,pit))
        pg.wait_for_timeout(600);pg.screenshot(path=OUT+'/sun_%d.png'%i)
    b.close()
