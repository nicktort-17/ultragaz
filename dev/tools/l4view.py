import sys;sys.path.insert(0,'/tmp/an')
from base import *
def F(pg,n=30):pg.evaluate("()=>new Promise(r=>{let n=0;const f=()=>{if(++n>%d)r();else requestAnimationFrame(f)};f()})"%n)
with sync_playwright() as p:
    b,pg,errs=open_page(p,900,540)
    J(pg,"()=>__ug.begin('solo','l4')");J(pg,"()=>{window.__dt=1/30}")
    for k,t in enumerate([10,40,150]):
        F(pg,t if k==0 else 30);pg.screenshot(path='/tmp/an/l4i_%d.png'%k)
        print(k,J(pg,"()=>__eval(`[L4.intro.t.toFixed(1),__ug.P.pos.toArray().map(v=>v.toFixed(1)),L4.car.position.toArray().map(v=>v.toFixed(1)),story.room]`)"))
    J(pg,"()=>__eval(`gunScene.visible=false`)")
    shots=[(0,0,36,0,.02),(-20,0,6,2.6,.05),(0,0,-6,0,.05),(0,2,-52,0,.08),(10,2,-60,-2.5,.1),(0,6,-110,0,.12),(-14,0,30,-2.3,.05)]
    for i,(x,y,z,yaw,pit) in enumerate(shots):
        J(pg,"()=>{const P=__ug.P;P.iT=1e9;P.pos.set(%f,%f,%f);P.vel.set(0,0,0);P.yaw=%f;P.pitch=%f;window.__frz=1}"%(x,y,z,yaw,pit))
        F(pg,6);pg.screenshot(path='/tmp/an/l4_%d.png'%i)
        J(pg,"()=>{window.__frz=0}")
    print([e for e in errs if 'ReadPixels' not in e and 'ERR_FAILED' not in e][:6])
    b.close()
