import sys;sys.path.insert(0,'/tmp/an')
from base import *
with sync_playwright() as p:
    b,pg,errs=open_page(p,960,540)
    J(pg,"()=>{__ug.myCos.skin=1;__ug.rebuildSelf()}");pg.wait_for_timeout(2500)
    J(pg,"()=>__ug.begin('solo','l1')");pg.wait_for_timeout(3000)
    pg.keyboard.press('KeyH');J(pg,"()=>{__ug.enemies.forEach(e=>e.dead=1);__ug.P.iT=1e9;window.__dt=1/30}")
    pg.keyboard.down('KeyW')
    for i in range(8):
        pg.wait_for_timeout(250);pg.screenshot(path='/tmp/an/rr_%d.png'%i)
        print(J(pg,"()=>__eval('[P.pos.z.toFixed(2),selfHero.cape.p[112*3+1].toFixed(2), (selfHero.cape.p[112*3+2]-P.pos.z).toFixed(2)]')"))
    pg.keyboard.up('KeyW')
    b.close()
