import os,sys;sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'));from ugenv import *  # пути окружения
import sys;sys.path.insert(0,TOOLS)
from base import *
def F(pg,n=30):pg.evaluate("()=>new Promise(r=>{let n=0;const f=()=>{if(++n>%d)r();else requestAnimationFrame(f)};f()})"%n)
with sync_playwright() as p:
    b,pg,errs=open_page(p,960,540)
    J(pg,"()=>__ug.begin('solo','l1')");pg.wait_for_timeout(2500)
    J(pg,"()=>{window.__dt=1/30;const R=__ug.story.lv.rooms[2];__ug.P.iT=1e9;__ug.P.pos.set(R.cp[0],R.cp[1]+.05,R.cp[2]-14);document.getElementById('lvCard').hidden=true;__eval('roomStart(2)')}")
    for k in range(5):F(pg,15)
    J(pg,"()=>__eval(`const b=enemies.find(e=>e.type==='boss');b.hp=b.maxHp*.45;`)")
    F(pg,3)
    print(J(pg,"()=>__eval(`(()=>{const b=enemies.find(e=>e.type==='boss');return [b.phA,b.hp,b.maxHp,document.getElementById('phA').className,ENEMY.boss.boss]})()`)"))
    J(pg,"()=>__eval(`dlStart(P.pos.x+6,P.pos.y+.85,P.pos.z-6,0,1,Math.PI*1.25,P.pos.y+5,true)`)")
    for k in range(3):
        F(pg,15);print(J(pg,"()=>__eval(`[DL.lz&&DL.lz.t,DL.beam.visible,DL.beam.userData.core.scale.x,DL.beam.position.toArray()]`)"));pg.screenshot(path=OUT+'/d_l%d.png'%k)
    b.close()
