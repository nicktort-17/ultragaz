import os,sys;sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'));from ugenv import *  # пути окружения
import sys;sys.path.insert(0,TOOLS)
from base import *
def F(pg,n=30):pg.evaluate("()=>new Promise(r=>{let n=0;const f=()=>{if(++n>%d)r();else requestAnimationFrame(f)};f()})"%n)
with sync_playwright() as p:
    b,pg,errs=open_page(p,960,540)
    J(pg,"()=>__ug.begin('solo','l2')");pg.wait_for_timeout(2500)
    J(pg,"()=>{window.__dt=1/30;const R=__ug.story.lv.rooms[2];__ug.P.iT=1e9;__ug.P.pos.set(R.cp[0],R.cp[1]+.05,R.cp[2]);document.getElementById('lvCard').hidden=true;__eval('roomStart(2)')}")
    for k in range(5):F(pg,15)
    J(pg,"()=>__eval(`const q=enemies.find(e=>e.type==='queen');q.st='idle';q.cd=.1;q.inv=false;q.hp=q.maxHp*.45;q.lastDive=-99;P.pos.set(-27,2.85,-106);P.yaw=-Math.PI/2;P.pitch=-.1`)")
    for k in range(16):
        F(pg,15);r=J(pg,"()=>__eval(`(()=>{const q=enemies.find(e=>e.type==='queen');const p=qPool();P.hp=100;return [q.st,+q.pos.y.toFixed(1),+p.y.toFixed(2),+QS.flood.toFixed(2),+P.pos.y.toFixed(1),+(P.syr||0).toFixed(1)]})()`)")
        print(k,r)
        if k==8:pg.screenshot(path=OUT+'/fl_1.png')
        if k==13:pg.screenshot(path=OUT+'/fl_2.png')
    print([e for e in errs if 'ReadPixels' not in e and 'ERR_FAILED' not in e][:8])
    b.close()
