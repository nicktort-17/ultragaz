import os,sys;sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'));from ugenv import *  # пути окружения
import sys,json,math;sys.path.insert(0,TOOLS)
from base import *
def F(pg,n=30):pg.evaluate("()=>new Promise(r=>{let n=0;const f=()=>{if(++n>%d)r();else requestAnimationFrame(f)};f()})"%n)
V=json.loads(sys.argv[1])
with sync_playwright() as p:
    b,pg,errs=open_page(p,1200,500)
    for i,(lv,x,y,z,tx,ty,tz) in enumerate(V):
        J(pg,"()=>{window.__frz=0;__ug.begin('solo','%s')}"%lv);pg.wait_for_timeout(1500)
        J(pg,"()=>{document.getElementById('lvCard').hidden=true;__ug.P.iT=1e9;window.__dt=1/30;if(__eval('typeof L4!==\"undefined\"&&L4')){__eval('L4.intro.t=20;L4.intro.hop=1;L4.car.visible=false')}}");F(pg,30)
        J(pg,"()=>{window.__frz=1;if(!document.getElementById('hidehud')){const s=document.createElement('style');s.id='hidehud';s.textContent='*{visibility:hidden!important}canvas{visibility:visible!important}';document.head.appendChild(s)}}")
        yaw=math.atan2(-(tx-x),-(tz-z));pit=math.atan2(ty-y,math.hypot(tx-x,tz-z))
        J(pg,"()=>{const P=__ug.P;P.pos.set(%f,%f,%f);P.vel.set(0,0,0);P.yaw=%f;P.pitch=%f;__ug.enemies.forEach(e=>e.dead=1);__eval('gunScene.visible=false')}"%(x,y-1.6,z,yaw,pit))
        F(pg,8);J(pg,"()=>__eval('gunScene.visible=false')");F(pg,2);pg.screenshot(path=OUT+'/art_%d.png'%i)
        J(pg,"()=>{document.getElementById('hidehud').remove();window.__frz=0;__ug.toMenu()}");pg.wait_for_timeout(500)
    b.close()
