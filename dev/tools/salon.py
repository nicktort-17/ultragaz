import os,sys;sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'));from ugenv import *  # пути окружения
import sys;sys.path.insert(0,TOOLS)
from base import *
def F(pg,n=30):pg.evaluate("()=>new Promise(r=>{let n=0;const f=()=>{if(++n>%d)r();else requestAnimationFrame(f)};f()})"%n)
with sync_playwright() as p:
    b,pg,errs=open_page(p,480,270)
    for run in range(3):
        J(pg,"()=>__ug.begin('solo','l3')");pg.wait_for_timeout(800);J(pg,"()=>{window.__norender=1;window.__dt=1/30;__ug.P.iT=1e9;__ug.P.pos.set(0,0,24);__ug.P.vel.set(0,0,0)}")
        for k in range(14):
            F(pg,30);J(pg,"()=>{__ug.P.hp=100}")
            r=J(pg,"()=>__eval(`(()=>{const bad=[];for(const e of enemies){if(e.dead)continue;const p=e.pos;const inS=boxes.some(b=>p.x>b.min.x+.05&&p.x<b.max.x-.05&&p.z>b.min.z+.05&&p.z<b.max.z-.05&&p.y+.3>b.min.y&&p.y+.3<b.max.y);if(inS||p.y>4.6||p.y<-.3||Math.abs(p.x)>10.8||p.z<1.5||p.z>29)bad.push(e.type+'@'+[p.x,p.y,p.z].map(v=>v.toFixed(1))+(inS?' INSIDE':''))}return [story.phase,story.wi,enemies.filter(e=>!e.dead).length,bad.join(' | '),(story.escLog||[]).slice(-3).join(';')]})()`)")
            if r[3] or k%5==0: print(run,k,r)
            if k%3==2: J(pg,"()=>{const L=__ug.enemies.filter(e=>!e.dead);if(L.length)__ug.damage(L[0],999,99,'x')}")
    print([e for e in errs if 'ReadPixels' not in e and 'ERR_FAILED' not in e][:5])
    b.close()
