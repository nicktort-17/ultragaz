import os,sys;sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'));from ugenv import *  # пути окружения
import sys;sys.path.insert(0,TOOLS)
from base import *
def F(pg,n=30):pg.evaluate("()=>new Promise(r=>{let n=0;const f=()=>{if(++n>%d)r();else requestAnimationFrame(f)};f()})"%n)
with sync_playwright() as p:
    b,pg,errs=open_page(p,960,540)
    J(pg,"()=>__ug.begin('solo','l1')");pg.wait_for_timeout(2500)
    J(pg,"()=>{window.__dt=1/30;const R=__ug.story.lv.rooms[2];__ug.P.iT=1e9;__ug.P.pos.set(R.cp[0],R.cp[1]+.05,R.cp[2]-14);document.getElementById('lvCard').hidden=true;__eval('roomStart(2)')}")
    for k in range(5):F(pg,15)
    J(pg,"()=>__eval(`const b=enemies.find(e=>e.type==='boss');b.hp=b.maxHp*.45;enemies.forEach(e=>{if(e.type!=='boss')e.dead=1})`)")
    F(pg,10);pg.screenshot(path=OUT+'/d_alert.png')
    hits=0
    for k in range(40):
        F(pg,8)
        r=J(pg,"()=>__eval(`(()=>{const b=enemies.find(e=>e.type==='boss');P.hp=100;const L=DL.lz;b.cdS=99;b.cdD=99;return {lz:L?+L.t.toFixed(1):null,rain:GZ.rain.length,cdL:+(b.cdL||0).toFixed(1),cdR:+(b.cdR||0).toFixed(1),bp:b.pos.toArray().map(v=>+v.toFixed(1))}})()`)")
        if k%4==0:print(k,r)
        if r['lz'] and r['lz']>1.6 and not hits: pg.screenshot(path=OUT+'/d_laser.png');hits=1
        if r['rain']>0 and hits<2: 
            if hits==1: pg.screenshot(path=OUT+'/d_rain.png');hits=2
    print([e for e in errs if 'ReadPixels' not in e and 'ERR_FAILED' not in e][:8])
    b.close()
