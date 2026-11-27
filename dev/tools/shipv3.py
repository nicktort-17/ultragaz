import sys;sys.path.insert(0,'/tmp/an')
from base import *
with sync_playwright() as p:
    b,pg,errs=open_page(p,1280,720)
    J(pg,"()=>__ug.begin('solo','l1')");pg.wait_for_timeout(3000)
    J(pg,"()=>{__ug.enemies.forEach(e=>e.dead=1);__ug.P.iT=1e9;document.getElementById('lvCard').hidden=true;__ug.switchW(0)}");pg.wait_for_timeout(1500)
    pg.screenshot(path='/tmp/an/sq_0.png')
    J(pg,"()=>__eval(`window.__frz=1`)")
    J(pg,"()=>__eval(`const P_=guns[0].userData.parts;P_.hammer.rotation.x=.75;P_.trigger.rotation.x=.45;P_.barrel.position.z=P_.barrel.userData.base.z+.012;P_.drum.rotation.x=.5;P_.needles.forEach(n=>n.rotation.x=1);P_.caps[3].visible=false;P_.caps[2].visible=false`)")
    pg.wait_for_timeout(500);pg.screenshot(path='/tmp/an/sq_1.png')
    print(J(pg,"()=>typeof __frz"))
    b.close()
