import sys;sys.path.insert(0,'/tmp/an')
from base import *
with sync_playwright() as p:
    b,pg,errs=open_page(p,1600,900)
    J(pg,"()=>__ug.begin('solo','l2')");pg.wait_for_timeout(3000)
    J(pg,"()=>{__ug.enemies.forEach(e=>e.dead=1);__ug.P.iT=1e9;__ug.switchW(3);document.getElementById('lvCard').hidden=true;__eval('gzSet(2)')}")
    for n,js in [('g100','gas=100'),('g70','gas=70'),('g30','gas=30'),('h100',"gas=100;guns[3].userData.model.traverse(o=>{if(o.name==='Бутылка_сифона')o.visible=false})")]:
        J(pg,"()=>__eval(`%s;gasIdle=99`)"%js);pg.wait_for_timeout(1500);pg.screenshot(path='/tmp/an/lq_%s.png'%n)
        print(n,J(pg,"()=>__eval(`[guns[3].userData.parts.liquid.scale.toArray()]`)"))
    b.close()
