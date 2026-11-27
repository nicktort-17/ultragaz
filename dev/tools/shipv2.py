import os,sys;sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'));from ugenv import *  # пути окружения
import sys;sys.path.insert(0,TOOLS)
from base import *
with sync_playwright() as p:
    b,pg,errs=open_page(p,960,540)
    J(pg,"()=>__ug.begin('solo','l1')");pg.wait_for_timeout(3000)
    J(pg,"()=>{__ug.enemies.forEach(e=>e.dead=1);__ug.P.iT=1e9;document.getElementById('lvCard').hidden=true;__ug.switchW(0)}");pg.wait_for_timeout(1200)
    for i,(ry,hx,hy,hz) in enumerate([(-.05,.23,-.21,-.56),(-.2,.23,-.21,-.56),(.35,.23,-.21,-.56),(-.35,.2,-.22,-.5)]):
        J(pg,"()=>__eval(`GUN_CFG[0].rot[1]=%f;GUN_CFG[0].hold=[%f,%f,%f]`)"%(ry,hx,hy,hz));pg.wait_for_timeout(900);pg.screenshot(path=OUT+'/sr_%d.png'%i)
    b.close()
