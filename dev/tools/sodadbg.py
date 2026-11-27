import os,sys;sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'));from ugenv import *  # пути окружения
import sys;sys.path.insert(0,TOOLS)
from base import *
def F(pg,n=30):pg.evaluate("()=>new Promise(r=>{let n=0;const f=()=>{if(++n>%d)r();else requestAnimationFrame(f)};f()})"%n)
with sync_playwright() as p:
    b,pg,errs=open_page(p,640,360)
    J(pg,"()=>__ug.begin('solo','l1')");pg.wait_for_timeout(3000)
    J(pg,"()=>__eval(`enemies.forEach(e=>e.dead=1);toSpawn.length=0;const P=__ug.P;P.iT=1e9;P.pos.set(0,0,10);P.vel.set(0,0,0);P.yaw=0;P.pitch=.05;cur=3`)")
    F(pg,10)
    for i in range(6):
        J(pg,"()=>__eval(`gas=100;camera.getWorldDirection(aim);soda(false)`)");F(pg,2)
    print(J(pg,"()=>__eval(`JSON.stringify({mz:muzzle().toArray().map(v=>+v.toFixed(2)),aim:aim.toArray().map(v=>+v.toFixed(2)),d:SODA.d.filter(d=>!d.dead).map(d=>[d.sid,d.seq,+d.t.toFixed(2),d.p.toArray().map(v=>+v.toFixed(1))]),n:SODA.mesh.geometry.drawRange.count})`)"))
    b.close()
