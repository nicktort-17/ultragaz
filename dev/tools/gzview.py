import sys;sys.path.insert(0,'/tmp/an')
from base import *
with sync_playwright() as p:
    b,pg,errs=open_page(p,1600,900)
    J(pg,"()=>__ug.begin('solo','l1')");pg.wait_for_timeout(3000)
    J(pg,"()=>{__ug.enemies.forEach(e=>e.dead=1);__ug.P.iT=1e9;__ug.switchW(3)}");pg.wait_for_timeout(900)
    for g in [100,0]:
        J(pg,"()=>__eval('gas=%d;gasIdle=99')"%g);pg.wait_for_timeout(1500)
        pg.screenshot(path='/tmp/an/gz_%d.png'%g)
    b.close()
