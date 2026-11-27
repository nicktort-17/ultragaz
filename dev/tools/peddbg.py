import os,sys;sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'));from ugenv import *  # пути окружения
import sys;sys.path.insert(0,TOOLS)
from base import *
def F(pg,n=30):pg.evaluate("()=>new Promise(r=>{let n=0;const f=()=>{if(++n>%d)r();else requestAnimationFrame(f)};f()})"%n)
with sync_playwright() as p:
    b,pg,errs=open_page(p,960,540)
    J(pg,"()=>__ug.begin('solo','l1')");pg.wait_for_timeout(2500)
    J(pg,"()=>{window.__dt=1/30;__ug.P.iT=1e9;__eval(`story.room=2;story.phase='exit';enemies.forEach(e=>e.dead=1)`)}");F(pg,60)
    print(J(pg,"()=>__eval(`(()=>{const h=GZ.ped.hold;h.updateMatrixWorld(true);const b=new THREE.Box3().setFromObject(h);return [h.children.length,b.min.toArray(),b.max.toArray(),guns[3].userData.glb]})()`)"))
    J(pg,"()=>__eval(`P.pos.set(0,0,-129.6);P.yaw=0;P.pitch=-.15;document.getElementById('lvCard').hidden=true`)");F(pg,10);pg.screenshot(path=OUT+'/ped2.png')
    b.close()
