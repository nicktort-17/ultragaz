import sys;sys.path.insert(0,'/tmp/an')
from base import *
def F(pg,n=30):pg.evaluate("()=>new Promise(r=>{let n=0;const f=()=>{if(++n>%d)r();else requestAnimationFrame(f)};f()})"%n)
with sync_playwright() as p:
    b,pg,errs=open_page(p,960,540)
    J(pg,"()=>__ug.begin('solo','l1')");pg.wait_for_timeout(2500)
    J(pg,"()=>{window.__dt=1/30;__ug.P.iT=1e9;__ug.P.pos.set(0,0,-100);__ug.P.yaw=0;__ug.P.pitch=-.1;document.getElementById('lvCard').hidden=true;__eval('roomStart(2)')}")
    F(pg,5)
    J(pg,"()=>__eval(`enemies.forEach(e=>e.dead=1);dlStart(-8,.9,-110,Math.PI/2,1,Math.PI*1.25,6,true)`)")
    for k in range(3):
        F(pg,12);print(J(pg,"()=>__eval(`[DL.lz&&+DL.lz.t.toFixed(2),DL.beam.visible,+DL.beam.userData.core.scale.x.toFixed(1),DL.beam.rotation.y.toFixed(2),P.pos.toArray()]`)"));pg.screenshot(path='/tmp/an/d_l%d.png'%k)
    b.close()
