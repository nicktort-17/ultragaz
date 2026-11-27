import os,sys;sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'));from ugenv import *  # пути окружения
import sys,json,time;sys.path.insert(0,TOOLS)
from base import *
def F(pg,n=30):pg.evaluate("()=>new Promise(r=>{let n=0;const f=()=>{if(++n>%d)r();else requestAnimationFrame(f)};f()})"%n)
st="()=>{const e=__ug.enemies.find(x=>x.type==='alt');return e?{st:e.st,ph:e.ph,ac:e.ac,hp:Math.round(e.hp),mx:Math.round(e.maxHp),pos:e.pos.toArray().map(v=>+v.toFixed(1)),hd:+(e.hd||0).toFixed(2),inv:!!e.inv,s:+(e.s||0).toFixed(1)}:null}"
with sync_playwright() as p:
    b,pg,errs=open_page(p,1280,720)
    J(pg,"()=>__ug.begin('solo','l3')");pg.wait_for_timeout(1500)
    J(pg,"()=>{__ug.P.iT=1e9;const S=__ug.story;S.room=1;S.phase='clear'}")
    J(pg,"()=>{const P=__ug.P;P.pos.set(0,0,-60);P.vel.set(0,0,0);P.yaw=0;P.pitch=-.12}")
    F(pg,20)
    print(J(pg,"()=>({room:__ug.story.room,ph:__ug.story.phase,en:__ug.enemies.map(e=>e.type).join(',')})"))
    for k in range(8):
        F(pg,40);print(k,J(pg,st),flush=True)
        if k in(1,4,7):pg.screenshot(path=OUT+'/boss_%d.png'%k)
    # урон до второй фазы
    J(pg,"()=>{const e=__ug.enemies.find(x=>x.type==='alt');__ug.damage(e,e.maxHp*.5,99,'x')}")
    for k in range(10):
        F(pg,30);s=J(pg,st);print('t',k,s,flush=True)
        if k in(2,4,6,9):pg.screenshot(path=OUT+'/boss_t%d.png'%k)
    print('err',[e for e in errs if 'ReadPixels' not in e and 'ERR_FAILED' not in e][:8])
    b.close()
