import os,sys;sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'));from ugenv import *  # пути окружения
import sys;sys.path.insert(0,TOOLS)
from base import *
def F(pg,n=30):pg.evaluate("()=>new Promise(r=>{let n=0;const f=()=>{if(++n>%d)r();else requestAnimationFrame(f)};f()})"%n)
with sync_playwright() as p:
    b,pg,errs=open_page(p,900,560)
    J(pg,"()=>__ug.begin('solo','l1')");pg.wait_for_timeout(3000)
    J(pg,"()=>__eval(`enemies.forEach(e=>e.dead=1);toSpawn.length=0;const P=__ug.P;P.iT=1e9;P.pos.set(0,0,10);P.vel.set(0,0,0);P.yaw=0;P.pitch=.05;cur=3;tpView=true;0;gas=100`)")
    F(pg,20)
    for i in range(40):
        J(pg,"()=>__eval(`gas=100;camera.getWorldDirection(aim);soda(false)`)");F(pg,2)
        if i in (10,39):pg.screenshot(path=OUT+'/soda_%d.png'%i)
    J(pg,"()=>__eval(`const P=__ug.P;P.pitch=.35`)")
    for i in range(30):
        J(pg,"()=>__eval(`gas=100;camera.getWorldDirection(aim);soda(false)`)");F(pg,2)
    pg.screenshot(path=OUT+'/soda_up.png')
    print(J(pg,"()=>__eval(`[SODA.d.filter(d=>!d.dead).length,enemies.filter(e=>!e.dead).map(e=>e.type+':'+(e.wet||0).toFixed(1)).join(','),puddles.length]`)"))
    print([e for e in errs if 'ReadPixels' not in e and 'ERR_FAILED' not in e][:5])
    b.close()
