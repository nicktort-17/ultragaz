import os,sys;sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'));from ugenv import *  # пути окружения
import sys;sys.path.insert(0,TOOLS)
from base import *
def F(pg,n=30):pg.evaluate("()=>new Promise(r=>{let n=0;const f=()=>{if(++n>%d)r();else requestAnimationFrame(f)};f()})"%n)
with sync_playwright() as p:
    b,pg,errs=open_page(p,800,480)
    J(pg,"()=>__ug.begin('solo','l2')");pg.wait_for_timeout(3000)
    J(pg,"()=>{window.__norender=1;window.__dt=1/30;const R=__ug.story.lv.rooms[2];__ug.P.iT=1e9;__ug.P.pos.set(R.cp[0],R.cp[1]+.05,R.cp[2]);__eval('roomStart(2)')}")
    seen=set()
    for k in range(70):
        F(pg,15)
        r=J(pg,"()=>__eval(`(()=>{const q=enemies.find(e=>e.type==='queen');const p=qPool();__ug.P.iT=1e9;__ug.P.hp=100;return q?{st:q.st,hp:Math.round(q.hp),y:+q.pos.y.toFixed(1),lvl:+p.y.toFixed(2),fill:+QS.fill.toFixed(2),feed:+QS.feedT.toFixed(1),sp:QS.spouts.length,vx:!!(QS.vortex&&QS.vortex.visible)}:null})()`)")
        if r: seen.add(r['st'])
        if k%5==0: print(k,r)
        if k==20: J(pg,"()=>__eval(`const q=enemies.find(e=>e.type==='queen');q.hp=q.maxHp*.6`)")
        if k==40: J(pg,"()=>__eval('openValve(0,true)')")
    print('states',seen)
    print([e for e in errs if 'ReadPixels' not in e and 'ERR_FAILED' not in e][:5])
    b.close()
