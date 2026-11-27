import sys;sys.path.insert(0,'/tmp/an')
from base import *
def F(pg,n=30):pg.evaluate("()=>new Promise(r=>{let n=0;const f=()=>{if(++n>%d)r();else requestAnimationFrame(f)};f()})"%n)
with sync_playwright() as p:
    b,pg,errs=open_page(p,960,540)
    J(pg,"()=>__ug.begin('solo','l2')");pg.wait_for_timeout(2500)
    J(pg,"()=>{window.__dt=1/30;const R=__ug.story.lv.rooms[2];__ug.P.iT=1e9;__ug.P.pos.set(R.cp[0],R.cp[1]+.05,R.cp[2]);__eval('roomStart(2)')}")
    for k in range(6):F(pg,15)
    J(pg,"()=>__eval(`P.pos.set(0,2.9,-80);const q=enemies.find(e=>e.type==='queen');q.st='idle';q.inv=false;q.hp=3;q.pos.y=-1;drainT=5;damage(q,2.5,99,'x')`)")
    for t in [-0.6,0.9,1.9,2.6,3.5,3.95,4.4,4.9,5.4,5.7,6.5,7.5,8.1]:
        while True:
            c=J(pg,"()=>__eval('GZ.cut?GZ.cut.t:99')")
            if c>=t:break
            F(pg,1)
        info=J(pg,"()=>__eval(`(()=>{const C=GZ.cut;if(!C)return null;const r={t:+C.t.toFixed(2),st:C.st};if(C.vc)r.vc=C.vc.position.toArray().map(v=>+v.toFixed(3));if(C.cube)r.cube=C.cube.position.toArray().map(v=>+v.toFixed(2));r.cam=camera.position.toArray().map(v=>+v.toFixed(2));r.h=C.h.toArray().map(v=>+v.toFixed(2));return r})()`)")
        print(info);pg.screenshot(path='/tmp/an/cd_%.1f.png'%t)
    b.close()
