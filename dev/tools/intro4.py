import os,sys;sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'));from ugenv import *  # пути окружения
import sys;sys.path.insert(0,TOOLS)
from base import *
def F(pg,n=30):pg.evaluate("()=>new Promise(r=>{let n=0;const f=()=>{if(++n>%d)r();else requestAnimationFrame(f)};f()})"%n)
with sync_playwright() as p:
    b,pg,errs=open_page(p,640,360)
    for run in range(2):
        J(pg,"()=>__ug.begin('solo','l4')");J(pg,"()=>{window.__dt=1/30}")
        for k in range(6):
            F(pg,20);print(run,J(pg,"()=>__eval('[L4.intro.t.toFixed(2),!!L4.intro.hop,P.pos.toArray().map(v=>+v.toFixed(1)),L4.car.position.z.toFixed(1),L4.car.visible]')"))
            if run==0 and k==1:pg.screenshot(path=OUT+'/intro_a.png')
        J(pg,"()=>__ug.toMenu()");pg.wait_for_timeout(500)
    pg.screenshot(path=OUT+'/intro_b.png')
    print([e for e in errs if 'ReadPixels' not in e and 'ERR_FAILED' not in e][:5])
    b.close()
