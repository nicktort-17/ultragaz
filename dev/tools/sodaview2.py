import os,sys;sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'));from ugenv import *  # пути окружения
import sys;sys.path.insert(0,TOOLS)
from base import *
def F(pg,n=30):pg.evaluate("()=>new Promise(r=>{let n=0;const f=()=>{if(++n>%d)r();else requestAnimationFrame(f)};f()})"%n)
with sync_playwright() as p:
    b,pg,errs=open_page(p,900,560)
    J(pg,"()=>__ug.begin('solo','l1')");pg.wait_for_timeout(3000)
    for tp,pit,tag in [(False,.08,'fp'),(True,.12,'tp'),(False,.3,'up')]:
        J(pg,"()=>__eval(`const P=__ug.P;P.iT=1e9;P.pos.set(0,0,12);P.vel.set(0,0,0);P.yaw=.25;P.pitch=%f;cur=3;tpView=%s;window.__dt=1/60`)"%(pit,'true' if tp else 'false'))
        for i in range(30):
            J(pg,"()=>__eval(`enemies.forEach(e=>{e.dead=1;scene.remove(e.g)});toSpawn.length=0;gas=100;camera.getWorldDirection(aim);soda(false)`)");F(pg,5)
        pg.screenshot(path=OUT+'/soda2_%s.png'%tag)
    print([e for e in errs if "ReadPixels" not in e and "ERR_FAILED" not in e][:5])
    b.close()
