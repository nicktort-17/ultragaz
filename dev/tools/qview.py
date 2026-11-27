import sys;sys.path.insert(0,'/tmp/an')
from base import *
def F(pg,n=30):pg.evaluate("()=>new Promise(r=>{let n=0;const f=()=>{if(++n>%d)r();else requestAnimationFrame(f)};f()})"%n)
with sync_playwright() as p:
    b,pg,errs=open_page(p,900,600)
    J(pg,"()=>__ug.begin('solo','l2')");pg.wait_for_timeout(4000)
    J(pg,"()=>{window.__dt=1/30;const R=__ug.story.lv.rooms[2];__ug.P.iT=1e9;__ug.P.pos.set(R.cp[0],R.cp[1]+.05,R.cp[2]);__eval('roomStart(2)')}")
    F(pg,120)
    print(J(pg,"()=>__eval(`(()=>{const q=enemies.find(e=>e.type==='queen');return q?[q.st,!!q.g.userData.q.model,q.pos.toArray().map(v=>v.toFixed(1))]:null})()`)"))
    for i,ac in enumerate([0,2,1,8]):
        J(pg,"""()=>__eval(`(()=>{const q=enemies.find(e=>e.type==='queen');q.cd=99;q.st='x';q.ac=%d;q.pos.set(0,0,-104);gunScene.visible=false;const P=__ug.P;P.iT=1e9;P.pos.set(%f,3.5,-93.5);const dx=q.pos.x-P.pos.x,dz=q.pos.z-P.pos.z;P.yaw=Math.atan2(-dx,-dz);P.pitch=.3})()`)"""%(ac,[0,3,-4,1][i]))
        F(pg,25);pg.screenshot(path='/tmp/an/qv_%d.png'%i)
    print([e for e in errs if 'ReadPixels' not in e and 'ERR_FAILED' not in e][:5])
    b.close()
