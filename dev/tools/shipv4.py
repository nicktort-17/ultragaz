import sys;sys.path.insert(0,'/tmp/an')
from base import *
def F(pg,n=30):pg.evaluate("()=>new Promise(r=>{let n=0;const f=()=>{if(++n>%d)r();else requestAnimationFrame(f)};f()})"%n)
with sync_playwright() as p:
    b,pg,errs=open_page(p,1280,720)
    J(pg,"()=>__ug.begin('solo','l1')");pg.wait_for_timeout(3000)
    J(pg,"()=>{__ug.enemies.forEach(e=>e.dead=1);__ug.P.iT=1e9;document.getElementById('lvCard').hidden=true;__ug.switchW(0)}");pg.wait_for_timeout(1500)
    pg.screenshot(path='/tmp/an/sq_0.png')
    r0=J(pg,"()=>__eval('guns[0].userData.parts.drum.rotation.z')")
    J(pg,"()=>__eval('fire(false)')");pg.wait_for_timeout(700)
    print('drum',r0,J(pg,"()=>__eval('[guns[0].userData.parts.drum.rotation.z,VP.drumT]')"))
    print([e for e in errs if 'ReadPixels' not in e and 'ERR_FAILED' not in e][:5])
    b.close()
