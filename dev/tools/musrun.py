import os,sys;sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'));from ugenv import *  # пути окружения
import sys;sys.path.insert(0,TOOLS)
from base import *
with sync_playwright() as p:
    b,pg,errs=open_page(p,1280,720)
    J(pg,"()=>{__ug.myCos.skin=1;__ug.rebuildSelf()}");pg.wait_for_timeout(2500)
    J(pg,"()=>__ug.begin('solo','l1')");pg.wait_for_timeout(3000)
    pg.keyboard.press('KeyH');J(pg,"()=>{__ug.enemies.forEach(e=>e.dead=1);__ug.P.iT=1e9}")
    pg.keyboard.down('KeyW')
    for i in range(6):
        pg.wait_for_timeout(250);print(J(pg,"()=>__eval('[selfHero.cape.air.toArray().map(v=>v.toFixed(1)),P.vel.toArray().map(v=>v.toFixed(1)),selfHero.root.rotation.y.toFixed(2)]')"))
    pg.screenshot(path=OUT+'/g_run.png');pg.keyboard.up('KeyW')
    b.close()
