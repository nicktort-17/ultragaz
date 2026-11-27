import os,sys;sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'));from ugenv import *  # пути окружения
import sys,json;sys.path.insert(0,TOOLS)
from base import *
def F(pg,n=30):pg.evaluate("()=>new Promise(r=>{let n=0;const f=()=>{if(++n>%d)r();else requestAnimationFrame(f)};f()})"%n)
chk="""()=>__eval(`(()=>{const R=roomOf();let out=[];for(const e of enemies){const p=e.pos,b=R.bounds;let bad=p.x<b[0]-.3||p.x>b[1]+.3||p.z<b[2]-.3||p.z>b[3]+.3;if(R.zone&&Math.hypot(p.x-R.zone[0],p.z-R.zone[1])>R.zone[2]+.3)bad=true;if(bad&&!(L3&&!onHull(p.x,p.z)))out.push(e.type+'@'+[p.x,p.y,p.z].map(v=>v.toFixed(1)))}return {n:enemies.length,out,esc:story.escN||0}})()`)"""
with sync_playwright() as p:
    b,pg,errs=open_page(p,320,180)
    for lv,nr in [('l1',3),('l2',3),('l3',2)]:
        for ri in range(nr):
            J(pg,"()=>{__ug.begin('solo','%s')}"%lv);pg.wait_for_timeout(900)
            J(pg,"()=>{window.__norender=1;__ug.P.iT=1e9;__eval('story.escN=0');const R=__ug.story.lv.rooms[%d];__ug.P.pos.set(R.cp[0],R.cp[1]+.05,R.cp[2]);__eval('roomStart(%d)')}"%(ri,ri))
            worst=[]
            for rnd_ in range(4):
                J(pg,"()=>__eval(`for(let i=0;i<10;i++)toSpawn.push(['vend','can','golem','drone','jelly'][i%5]);spawnT=0`)")
                for k in range(10):
                    F(pg,30);r=J(pg,chk)
                    if r['out']:worst+=r['out']
                    J(pg,"()=>{__ug.P.iT=1e9;__ug.P.hp=100;const R=__ug.story.lv.rooms[%d];__ug.P.pos.set(R.cp[0],R.cp[1]+.05,R.cp[2])}"%ri)
                J(pg,"()=>{for(const e of __ug.enemies)if(!__ug.ENEMY[e.type].boss)__ug.damage(e,9999,99,'x')}")
            print(lv,ri,'esc',J(pg,"()=>__eval('story.escN||0')"),'stillOut',worst[:4],flush=True)
    print([e for e in errs if 'ReadPixels' not in e and 'ERR_FAILED' not in e][:5])
    b.close()
