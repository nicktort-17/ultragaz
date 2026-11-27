import os,sys;sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'));from ugenv import *  # пути окружения
import sys;sys.path.insert(0,TOOLS)
from base import *
def F(pg,n=30):pg.evaluate("()=>new Promise(r=>{let n=0;const f=()=>{if(++n>%d)r();else requestAnimationFrame(f)};f()})"%n)
with sync_playwright() as p:
    b,pg,errs=open_page(p,960,540)
    J(pg,"()=>__ug.begin('solo','l2')");pg.wait_for_timeout(2500)
    J(pg,"()=>{window.__dt=1/30;const R=__ug.story.lv.rooms[2];__ug.P.iT=1e9;__ug.P.pos.set(R.cp[0],R.cp[1]+.05,R.cp[2]);document.getElementById('lvCard').hidden=true;__eval('roomStart(2)')}")
    for k in range(6):F(pg,15)
    J(pg,"()=>{__ug.switchW(3);__eval(`P.pos.set(0,2.85,-79);P.yaw=0;P.pitch=-.12`)}");F(pg,15)
    q0=J(pg,"()=>__eval('enemies.find(e=>e.type===\"queen\").hp')")
    J(pg,"()=>__ug.setFire(true,false)");F(pg,40);pg.screenshot(path=OUT+'/l2_water.png');J(pg,"()=>__ug.setFire(false,false)")
    q1=J(pg,"()=>__eval('enemies.find(e=>e.type===\"queen\").hp')");print('queen hp',q0,q1)
    # phase 2 dive/under
    J(pg,"()=>__eval(`const q=enemies.find(e=>e.type==='queen');q.hp=q.maxHp*.45;q.st='idle';q.cd=0;q.inv=false;q.lastDive=-99`)")
    for k in range(14):
        F(pg,15);r=J(pg,"()=>__eval(`(()=>{const q=enemies.find(e=>e.type==='queen');const p=qPool();P.hp=100;return [q.st,+q.stT.toFixed(1),q.pos.toArray().map(v=>+v.toFixed(1)),+p.y.toFixed(2),+QS.fill.toFixed(2),enemies.filter(e=>e.type==='jelly'&&!e.dead).length]})()`)")
        print(k,r)
        if k==6:pg.screenshot(path=OUT+'/l2_under.png')
    J(pg,"()=>__eval(`P.pos.set(-27,2.85,-106);P.yaw=-Math.PI/2;P.pitch=-.35`)");F(pg,8);pg.screenshot(path=OUT+'/l2_side.png')
    J(pg,"()=>__eval(`drainT=10;P.pos.set(-27,2.85,-80);P.yaw=-2.4;P.pitch=-.4`)");F(pg,90);pg.screenshot(path=OUT+'/l2_drain.png')
    print([e for e in errs if 'ReadPixels' not in e and 'ERR_FAILED' not in e][:8])
    b.close()
