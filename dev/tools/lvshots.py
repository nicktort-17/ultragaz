import sys,json,math;sys.path.insert(0,'/tmp/an')
from base import *
lv=sys.argv[1]
def F(pg,n=30):pg.evaluate("()=>new Promise(r=>{let n=0;const f=()=>{if(++n>%d)r();else requestAnimationFrame(f)};f()})"%n)
with sync_playwright() as p:
    b,pg,errs=open_page(p,1200,500)
    J(pg,"()=>__ug.begin('solo','%s')"%lv);pg.wait_for_timeout(1500)
    J(pg,"()=>{document.getElementById('lvCard').hidden=true;__ug.P.iT=1e9;window.__dt=1/30;if(__eval('typeof L4!==\"undefined\"&&L4')){__eval('L4.intro.t=20;L4.intro.hop=1;L4.car.visible=false')}}");F(pg,10)
    rooms=J(pg,"()=>__ug.story.lv.rooms.map(R=>({cp:R.cp,t:R.trig}))")
    J(pg,"()=>{window.__frz=1;const s=document.createElement('style');s.textContent='*{visibility:hidden!important}canvas{visibility:visible!important}';document.head.appendChild(s)}")
    for i,R in enumerate(rooms):
        cx=(R['t'][0]+R['t'][1])/2;cz=(R['t'][2]+R['t'][3])/2;x,y,z=R['cp'];yaw=math.atan2(-(cx-x),-(cz-z))
        J(pg,"()=>{const P=__ug.P;P.pos.set(%f,%f,%f);P.vel.set(0,0,0);P.yaw=%f;P.pitch=-0.02;__ug.enemies.forEach(e=>e.dead=1)}"%(x,y+1.2,z,yaw))
        F(pg,6);J(pg,"()=>__eval('gunScene.visible=false')");F(pg,2);pg.screenshot(path='/tmp/an/lv_%s_%d.png'%(lv,i))
    b.close()
