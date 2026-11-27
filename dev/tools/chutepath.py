import os,sys;sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'));from ugenv import *  # пути окружения
import sys;sys.path.insert(0,TOOLS)
from base import *
def F(pg,n=30):pg.evaluate("()=>new Promise(r=>{let n=0;const f=()=>{if(++n>%d)r();else requestAnimationFrame(f)};f()})"%n)
with sync_playwright() as p:
    b,pg,errs=open_page(p,640,360)
    J(pg,"()=>__ug.begin('solo','l3')");J(pg,"()=>{window.__norender=1}");pg.wait_for_timeout(1500)
    J(pg,"()=>{__ug.P.iT=1e9;const S=__ug.story;S.room=1;S.phase='clear';const P=__ug.P;P.pos.set(0,0,-62);P.vel.set(0,0,0)}")
    for k in range(40):
        F(pg,20);s=J(pg,"()=>{const e=__ug.enemies.find(x=>x.type==='alt');return e&&e.st}")
        if s and s!='intro':break
    J(pg,"()=>__eval(`window.__dt=1/30;const e=enemies.find(x=>x.type==='alt');e.ph=3;e.ac=30;e.inv=false;e.hp=1;damage(e,99,99,'x')`)")
    bad=0;pts=[]
    for k in range(200):
        F(pg,2);r=J(pg,"()=>__eval(`(()=>{const E=L3.end;if(!E||!E.chute)return null;const p=E.girl.g.position;const inS=boxes.some(b=>p.x>b.min.x&&p.x<b.max.x&&p.z>b.min.z&&p.z<b.max.z&&p.y+.5>b.min.y&&p.y<b.max.y);return [p.x,p.y,p.z,inS,onHull(p.x,p.z)]})()`)")
        if r: pts.append([round(v,1) if isinstance(v,float) else v for v in r]); bad+=r[3]
    print(len(pts),'inside boxes:',bad);print(pts[::8])
    b.close()
