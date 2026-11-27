import sys;sys.path.insert(0,'/tmp/an')
from base import *
with sync_playwright() as p:
    b,pg,errs=open_page(p,1600,900)
    J(pg,"()=>__ug.begin('solo','l2')");pg.wait_for_timeout(3000)
    J(pg,"()=>{__ug.enemies.forEach(e=>e.dead=1);__ug.P.iT=1e9;__ug.switchW(3);document.getElementById('lvCard').hidden=true}")
    for n,js in [('w100','gas=100'),('w50','gas=50'),('c100','gzSet(2);gas=100'),('c50','gas=50')]:
        J(pg,"()=>__eval('%s;gasIdle=99')"%js);pg.wait_for_timeout(1500);pg.screenshot(path='/tmp/an/lq_%s.png'%n)
    b.close()
