import sys;sys.path.insert(0,'/tmp/an')
from base import *
with sync_playwright() as p:
    b,pg,errs=open_page(p,1600,900)
    J(pg,"()=>__ug.begin('solo','l2')");pg.wait_for_timeout(3000)
    J(pg,"()=>{__ug.enemies.forEach(e=>e.dead=1);__ug.P.iT=1e9;__ug.switchW(3);document.getElementById('lvCard').hidden=true}");pg.wait_for_timeout(900)
    pg.screenshot(path='/tmp/an/gzw.png')
    J(pg,"()=>__eval('gzSet(2);gas=0;gasIdle=99')");pg.wait_for_timeout(1500);pg.screenshot(path='/tmp/an/gz0.png')
    J(pg,"()=>__eval('gas=60;gasIdle=99')");pg.wait_for_timeout(1500);pg.screenshot(path='/tmp/an/gz60.png')
    J(pg,"()=>__ug.switchW(2)");pg.wait_for_timeout(1200);pg.screenshot(path='/tmp/an/m2.png')
    J(pg,"()=>__ug.switchW(1)");pg.wait_for_timeout(1200);pg.screenshot(path='/tmp/an/m1.png')
    b.close()
