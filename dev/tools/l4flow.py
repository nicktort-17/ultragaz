import os,sys;sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'));from ugenv import *  # пути окружения
import sys,json;sys.path.insert(0,TOOLS)
from base import *
def F(pg,n=30):pg.evaluate("()=>new Promise(r=>{let n=0;const f=()=>{if(++n>%d)r();else requestAnimationFrame(f)};f()})"%n)
st="()=>({ph:__ug.story.phase,room:__ug.story.room,en:__ug.enemies.filter(e=>!e.dead).length,doors:__ug.doors.map(d=>d.open?1:0).join(''),state:__ug.state,mark:document.getElementById('objm')?document.getElementById('objm').textContent:null})"
with sync_playwright() as p:
    b,pg,errs=open_page(p,480,270)
    J(pg,"()=>__ug.begin('solo','l4')");pg.wait_for_timeout(1000);J(pg,"()=>{window.__norender=1;window.__dt=1/30}")
    F(pg,200);print('after intro',J(pg,st),J(pg,"()=>__ug.P.pos.toArray().map(v=>+v.toFixed(1))"))
    for ri in range(4):
        J(pg,"()=>{const R=__ug.story.lv.rooms[%d];__ug.P.iT=1e9;__ug.P.pos.set((R.trig[0]+R.trig[1])/2,R.cp[1]+.05,(R.trig[2]+R.trig[3])/2);__ug.P.vel.set(0,0,0)}"%ri)
        for k in range(60):
            F(pg,30);s=J(pg,st)
            if s['room']==ri and s['ph'] in('clear','exit') :break
            J(pg,"()=>{for(const e of __ug.enemies){if(!e.inv&&!e.dead)__ug.damage(e,e.maxHp+50,99,'x')}__ug.P.iT=1e9;__ug.P.hp=100}")
        print('room',ri,J(pg,st))
    J(pg,"()=>{const e=__ug.story.lv.exitTrig;__ug.P.pos.set(0,e[4]+.05,(e[2]+e[3])/2);__ug.P.vel.set(0,0,0)}")
    F(pg,40);print('at exit',J(pg,st));F(pg,240);print('end',J(pg,st)['state'])
    print([e for e in errs if 'ReadPixels' not in e and 'ERR_FAILED' not in e][:5])
    b.close()
