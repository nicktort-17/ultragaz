import os,sys;sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'));from ugenv import *  # пути окружения
import sys;sys.path.insert(0,TOOLS)
from base import *
with sync_playwright() as p:
    b,pg,errs=open_page(p,960,540)
    J(pg,"()=>__ug.begin('solo','l3')");pg.wait_for_timeout(1500)
    for i,(x,z,yaw,pit) in enumerate([(10,-20,1.57,-.12),(0,-95,0,-.25),(-10,-80,-1.2,-.05)]):
        J(pg,"()=>{const P=__ug.P;P.iT=1e9;P.pos.set(%f,0,%f);P.vel.set(0,0,0);P.yaw=%f;P.pitch=%f}"%(x,z,yaw,pit));pg.wait_for_timeout(700)
        pg.screenshot(path=OUT+'/sea_%d.png'%i)
    # пенный вал
    J(pg,"()=>{__eval('lvT=WAVE_T0+WAVE_PER*3+2.6+1.6');const P=__ug.P;P.pos.set(-4,0,-20);P.yaw=1.4;P.pitch=-.05}");pg.wait_for_timeout(250)
    pg.screenshot(path=OUT+'/sea_w.png')
    print([e for e in errs if 'ReadPixels' not in e and 'ERR_FAILED' not in e][:5])
    b.close()
