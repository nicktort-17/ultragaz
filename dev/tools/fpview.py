import sys;sys.path.insert(0,'/tmp/an')
from base import *
with sync_playwright() as p:
    b,pg,errs=open_page(p,960,540)
    J(pg,"()=>{__ug.myCos.skin=1;__ug.rebuildSelf()}");pg.wait_for_timeout(2500)
    J(pg,"()=>__ug.begin('solo','l1')");pg.wait_for_timeout(3000)
    J(pg,"()=>{__ug.enemies.forEach(e=>e.dead=1);__ug.P.iT=1e9}")
    for w in range(4):
        J(pg,"()=>__ug.switchW(%d)"%w);pg.wait_for_timeout(900);pg.screenshot(path='/tmp/an/fp_%d.png'%w)
    J(pg,"()=>__ug.punch()");pg.wait_for_timeout(120);pg.screenshot(path='/tmp/an/fp_p.png')
    print([e for e in errs if 'ReadPixels' not in e and 'ERR_FAILED' not in e][:6])
    b.close()
