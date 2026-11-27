import os,sys;sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'));from ugenv import *  # пути окружения
import sys,json,time;sys.path.insert(0,TOOLS)
from base import *
def F(pg,n=30):pg.evaluate("()=>new Promise(r=>{let n=0;const f=()=>{if(++n>%d)r();else requestAnimationFrame(f)};f()})"%n)
st="()=>{const e=__ug.enemies.find(x=>x.type==='alt');return e?{st:e.st,ph:e.ph,ac:e.ac,hp:Math.round(e.hp),pos:e.pos.toArray().map(v=>+v.toFixed(1)),inv:!!e.inv,php:Math.round(__ug.P.hp)}:null}"
with sync_playwright() as p:
    b,pg,errs=open_page(p,480,270)
    J(pg,"()=>__ug.begin('solo','l3')");pg.wait_for_timeout(1200)
    J(pg,"()=>{window.__norender=1;__ug.P.iT=1e9;const S=__ug.story;S.room=1;S.phase='clear';const P=__ug.P;P.pos.set(0,0,-62);P.vel.set(0,0,0)}")
    for k in range(20):
        F(pg,20);s=J(pg,st)
        if s and s['st']!='intro':break
    J(pg,"()=>{const e=__ug.enemies.find(x=>x.type==='alt');__ug.damage(e,e.maxHp*.5,99,'x')}")
    for k in range(12):
        F(pg,30);s=J(pg,st)
        if s and s['ph']==3:break
    print('ph3',J(pg,st))
    print('girl parent is seat:',J(pg,"()=>{const e=__ug.enemies.find(x=>x.type==='alt');const A=e.g.userData.alt;return A.girl.g.parent===A.mis.seat}"))
    # авто-парирование
    J(pg,"""()=>{window.__par=0;const f=()=>{const e=__ug.enemies.find(x=>x.type==='alt');if(!e)return;const P=__ug.P,c=__ug.camera.position;
      if(e.st==='ram'){const dx=e.pos.x-c.x,dy=e.pos.y-c.y,dz=e.pos.z-c.z,d=Math.hypot(dx,dy,dz);P.yaw=Math.atan2(-dx,-dz);P.pitch=Math.atan2(dy,Math.hypot(dx,dz));if(d<4.5&&!window.__par){window.__par=1;__ug.punch()}}
      requestAnimationFrame(f)};f();const e=__ug.enemies.find(x=>x.type==='alt');e.cdR=0;e.cdU=9;e.cdB=9}""")
    seen=set()
    for k in range(30):
        F(pg,10);s=J(pg,st);seen.add(s['st'])
        if s['st']=='daze':break
    print('after ram',s,'seen',seen,'par',J(pg,"()=>window.__par"))
    # ядерное пике
    J(pg,"()=>{const e=__ug.enemies.find(x=>x.type==='alt');e.hp=e.maxHp*.25;e.cdN=0;e.cdR=99;e.cdU=99;e.cdB=99;e.st='fly';e.stT=1;const P=__ug.P;P.iT=0;P.hp=100;P.pos.set(0,0,-75)}")
    seen=set();hp0=100
    for k in range(140):
        F(pg,10);s=J(pg,st);seen.add(s['st'])
        J(pg,"()=>{const P=__ug.P;P.pos.set(0,0,-75);P.vel.set(0,0,0);if(P.hp<40)P.hp=40}")
        if s['st']=='rec':break
    print('nuke',s,'seen',seen)
    # смерть
    J(pg,"()=>{__ug.P.iT=1e9;__ug.P.hp=100;const e=__ug.enemies.find(x=>x.type==='alt');__ug.damage(e,9999,99,'x')}")
    F(pg,30)
    print('end',J(pg,"()=>{const E=__eval('L3.end');return E?{t:+E.t.toFixed(2),chute:!!E.chute,sat:!!E.sat}:null}"),J(pg,"()=>({ph:__ug.story.phase,en:__ug.enemies.map(e=>e.type).join(',')})"))
    J(pg,"()=>{for(const e of __ug.enemies)__ug.damage(e,9999,99,'x')}")
    for k in range(8):
        F(pg,60)
    print('end2',J(pg,"()=>{const E=__eval('L3.end');return E?{t:+E.t.toFixed(2),chute:!!E.chute,sat:!!E.sat,gp:E.girl.g.getWorldPosition(new THREE.Vector3()).toArray().map(v=>+v.toFixed(1))}:null}"),J(pg,"()=>({ph:__ug.story.phase,state:__ug.state})"))
    J(pg,"()=>{window.__norender=0;const P=__ug.P;P.pos.set(0,0,-92);P.yaw=Math.PI;P.pitch=-.15}");F(pg,3)
    pg.screenshot(path=OUT+'/boss_end.png')
    print('err',[e for e in errs if 'ReadPixels' not in e and 'ERR_FAILED' not in e][:8])
    b.close()
