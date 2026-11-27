import os,sys;sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'));from ugenv import *  # пути окружения
import sys;sys.path.insert(0,TOOLS)
from base import *
def F(pg,n=30):pg.evaluate("()=>new Promise(r=>{let n=0;const f=()=>{if(++n>%d)r();else requestAnimationFrame(f)};f()})"%n)
with sync_playwright() as p:
    b,pg,errs=open_page(p,800,480)
    J(pg,"()=>__ug.begin('solo','l3')");J(pg,"()=>{window.__norender=1}");pg.wait_for_timeout(1500)
    J(pg,"()=>{__ug.P.iT=1e9;const S=__ug.story;S.room=1;S.phase='clear';const P=__ug.P;P.pos.set(0,0,-62);P.vel.set(0,0,0)}")
    for k in range(40):
        F(pg,20);s=J(pg,"()=>{const e=__ug.enemies.find(x=>x.type==='alt');return e&&e.st}")
        if s and s!='intro':break
    J(pg,"()=>__eval(`window.__dt=1/30;const e=enemies.find(x=>x.type==='alt');e.ph=3;e.ac=30;e.inv=false;e.hp=1;damage(e,99,99,'x')`)")
    aim="()=>__eval(`(()=>{const E=L3.end;if(!E)return 0;const P=__ug.P;P.pos.set(7,0,-80);P.vel.set(0,0,0);const g=E.girl.g.getWorldPosition(new V3());const dx=g.x-P.pos.x,dz=g.z-P.pos.z,dy=g.y-(P.pos.y+1.6);P.yaw=Math.atan2(-dx,-dz);P.pitch=Math.atan2(dy,Math.hypot(dx,dz));return [E.t.toFixed(1),E.st||'-',g.toArray().map(v=>v.toFixed(1))]})()`)"
    shots=[3,8,14,24,36,50,62,72,80]
    J(pg,"()=>{window.__norender=0}")
    for k in range(85):
        r=J(pg,aim);F(pg,3)
        if k in shots: pg.screenshot(path=OUT+'/ad_%02d.png'%k);print(k,r)
    print([e for e in errs if 'ReadPixels' not in e and 'ERR_FAILED' not in e][:5])
    b.close()
