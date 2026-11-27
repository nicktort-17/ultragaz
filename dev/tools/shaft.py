import sys;sys.path.insert(0,'/tmp/an')
from base import *
def F(pg,n=30):pg.evaluate("()=>new Promise(r=>{let n=0;const f=()=>{if(++n>%d)r();else requestAnimationFrame(f)};f()})"%n)
with sync_playwright() as p:
    b,pg,errs=open_page(p,800,480)
    J(pg,"()=>__ug.begin('solo','l3')");J(pg,"()=>{window.__norender=1}");pg.wait_for_timeout(1500)
    J(pg,"()=>{__ug.P.iT=1e9;const S=__ug.story;S.room=1;S.phase='clear';const P=__ug.P;P.pos.set(0,0,-62);P.vel.set(0,0,0)}")
    for k in range(40):
        F(pg,20);s=J(pg,"()=>{const e=__ug.enemies.find(x=>x.type==='alt');return e&&e.st}")
        if s and s!='intro':break
    J(pg,"()=>__eval(`window.__dt=1/30;const e=enemies.find(x=>x.type==='alt');e.hp=e.maxHp*.5;P.pos.set(5,.05,-60);P.vel.set(0,0,0);P.iT=0;P.hp=100`)")
    for k in range(14):
        F(pg,6)
        if k==4:J(pg,"()=>__eval(`P.pos.set(0,.3,-74);P.vel.set(0,0,0)`)")
        print(k,J(pg,"()=>__eval(`[+L3.hatch.k.toFixed(2),L3.hatchBox.max.y,P.pos.toArray().map(v=>+v.toFixed(1)),+P.vel.y.toFixed(1),Math.round(P.hp),(enemies.find(x=>x.type==='alt')||{}).ac]`)"))
    print([e for e in errs if 'ReadPixels' not in e][:5])
    b.close()
