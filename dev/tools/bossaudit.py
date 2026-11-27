import sys;sys.path.insert(0,'/tmp/an')
from base import *
def F(pg,n=30):pg.evaluate("()=>new Promise(r=>{let n=0;const f=()=>{if(++n>%d)r();else requestAnimationFrame(f)};f()})"%n)
with sync_playwright() as p:
    b,pg,errs=open_page(p,320,180)
    J(pg,"()=>{__ug.begin('solo','l1')}");pg.wait_for_timeout(900)
    J(pg,"()=>{window.__norender=1;__ug.P.iT=1e9;const R=__ug.story.lv.rooms[2];__ug.P.pos.set(R.cp[0],R.cp[1]+.05,R.cp[2]);__eval('roomStart(2)')}")
    for k in range(40):
        F(pg,30)
        r=J(pg,"()=>__eval(`(()=>{const b=enemies.find(e=>e.type==='boss');return {ph:story.phase,doors:doors.map(d=>d.open?1:0).join(''),boss:b?[b.pos.x,b.pos.y,b.pos.z].map(v=>+v.toFixed(1)):null,st:b&&b.st}})()`)")
        print(k,r)
        J(pg,"()=>{__ug.P.iT=1e9;__ug.P.hp=100;const R=__ug.story.lv.rooms[2];__ug.P.pos.set(R.cp[0],R.cp[1]+.05,R.cp[2])}")
    b.close()
