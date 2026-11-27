import os,sys;sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'));from ugenv import *  # пути окружения
import sys;sys.path.insert(0,TOOLS)
from base import *
with sync_playwright() as p:
    b,pg,errs=open_page(p,1280,720)
    J(pg,"()=>{__ug.myCos.skin=1;__ug.rebuildSelf()}");pg.wait_for_timeout(2500)
    J(pg,"()=>__ug.begin('solo','l1')");pg.wait_for_timeout(3000)
    pg.keyboard.press('KeyH');J(pg,"()=>{__ug.enemies.forEach(e=>e.dead=1);__ug.P.iT=1e9}")
    q="()=>__eval('(()=>{const C=selfHero.cape,r=selfHero.root.position,o=[];for(const i of [4,58,112,108,116]){o.push([(C.p[i*3]-r.x).toFixed(2),(C.p[i*3+1]-r.y).toFixed(2),(C.p[i*3+2]-r.z).toFixed(2)].join(\",\"))}return o.slice(1,3).join(\" | \")+\" air=\"+C.air.toArray().map(v=>v.toFixed(1))+\" pit=\"+P.pitch.toFixed(2)+\" vy=\"+P.vel.y.toFixed(1)+\" g=\"+P.grounded+\" sl=\"+P.slide})()')"
    print('idle',J(pg,q))
    pg.keyboard.down('KeyW')
    for i in range(8):
        pg.wait_for_timeout(200);print(J(pg,q))
        if i==4: pg.screenshot(path=OUT+'/g_run.png')
    pg.keyboard.up('KeyW')
    b.close()
