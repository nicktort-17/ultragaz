import os,sys;sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'));from ugenv import *  # пути окружения
import sys,json,time;sys.path.insert(0,TOOLS)
from base import *
def F(pg,n=30):pg.evaluate("()=>new Promise(r=>{let n=0;const f=()=>{if(++n>%d)r();else requestAnimationFrame(f)};f()})"%n)
with sync_playwright() as p:
    b,pg,errs=open_page(p,960,540)
    J(pg,"()=>__ug.begin('solo','l3')");J(pg,"()=>{window.__norender=1}");pg.wait_for_timeout(1200)
    J(pg,"()=>{__ug.P.iT=1e9;const S=__ug.story;S.room=1;S.phase='clear';const P=__ug.P;P.pos.set(0,0,-62);P.vel.set(0,0,0)}")
    for k in range(20):
        F(pg,20);s=J(pg,"()=>{const e=__ug.enemies.find(x=>x.type==='alt');return e&&e.st}")
        if s and s!='intro':break
    for q in range(6):
        J(pg,"()=>{const e=__ug.enemies.find(x=>x.type==='alt');if(!e)return;e.inv=0;if(e.ph<3){e.ph=3;e.hp=e.maxHp*.2}__ug.damage(e,99999,99,'x')}");F(pg,20)
        if J(pg,"()=>!!__eval('L3.end')"):break
    print('dead',J(pg,"()=>({end:!!__eval('L3.end'),en:__ug.enemies.map(e=>e.type+':'+e.ph+':'+Math.round(e.hp)).join(',')})"))
    # камера за кормой, смотрим на машину
    cam="()=>{const P=__ug.P;P.pos.set(4.5,0,-95.5);P.vel.set(0,0,0);const c=__eval('L3.car').position;P.yaw=Math.atan2(-(c.x-4.5),-(c.z+95.5));P.pitch=-.3}"
    for k in range(60):
        J(pg,cam);F(pg,15)
        e=J(pg,"()=>{const E=__eval('L3.end');const c=__eval('L3.car');return E?{t:+E.t.toFixed(1),st:E.st||null,free:!!__eval('L3.carFree'),br:!!__eval('L3.chainBroken'),car:c.position.toArray().map(v=>+v.toFixed(1)),door:+c.userData.door.rotation.y.toFixed(2)}:null}")
        print(e)
        if e and e['st'] in ('side','in','close') or (e and e['st']=='drive' and e['br'] and k%3==0) or k in (10,20):
            J(pg,"()=>{window.__norender=0}");F(pg,2);pg.screenshot(path=OUT+'/end_%02d.png'%k);J(pg,"()=>{window.__norender=1}")
        if e and e['car'][2]<-150:break
    print('errs',errs[:5])
    b.close()
