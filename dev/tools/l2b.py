import sys;sys.path.insert(0,'/tmp/an')
from base import *
def F(pg,n=30):pg.evaluate("()=>new Promise(r=>{let n=0;const f=()=>{if(++n>%d)r();else requestAnimationFrame(f)};f()})"%n)
with sync_playwright() as p:
    b,pg,errs=open_page(p,960,540)
    J(pg,"()=>__ug.begin('solo','l2')");pg.wait_for_timeout(2500)
    J(pg,"()=>{window.__dt=1/30;const R=__ug.story.lv.rooms[2];__ug.P.iT=1e9;__ug.P.pos.set(R.cp[0],R.cp[1]+.05,R.cp[2]);document.getElementById('lvCard').hidden=true;__eval('roomStart(2)')}")
    for k in range(8):F(pg,15)
    J(pg,"()=>{__ug.switchW(3);__eval(`P.pos.set(0,9.75,-78.5);const q=enemies.find(e=>e.type==='queen');q.pos.x=0;q.pos.z=-100;q.wx=0;q.wz=-100;q.st='idle';q.cd=99;const dx=q.pos.x-P.pos.x,dz=q.pos.z-P.pos.z;P.yaw=Math.atan2(-dx,-dz);P.pitch=-.12`)}");F(pg,10)
    q0=J(pg,"()=>__eval('enemies.find(e=>e.type===\"queen\").hp')")
    J(pg,"()=>__ug.setFire(true,false)")
    for k in range(4):
        F(pg,10);J(pg,"()=>__eval(`const q=enemies.find(e=>e.type==='queen');q.cd=99;const dx=q.pos.x-P.pos.x,dz=q.pos.z-P.pos.z;P.yaw=Math.atan2(-dx,-dz);P.pitch=Math.atan2(q.pos.y+q.cy-(P.pos.y+1.6),Math.hypot(dx,dz))+.03`)")
    pg.screenshot(path='/tmp/an/l2_water.png');J(pg,"()=>__ug.setFire(false,false)")
    q1=J(pg,"()=>__eval('enemies.find(e=>e.type===\"queen\").hp')");print('queen hp',q0,q1)
    J(pg,"()=>__eval(`drainT=12;const q=enemies.find(e=>e.type==='queen');q.dead=1;q.g.visible=false;P.pitch=-.45`)");F(pg,120);pg.screenshot(path='/tmp/an/l2_drain.png')
    b.close()
