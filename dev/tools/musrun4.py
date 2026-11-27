import os,sys;sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'));from ugenv import *  # пути окружения
import sys;sys.path.insert(0,TOOLS)
from base import *
with sync_playwright() as p:
    b,pg,errs=open_page(p,960,540)
    J(pg,"()=>{__ug.myCos.skin=1;__ug.rebuildSelf()}");pg.wait_for_timeout(2500)
    J(pg,"()=>__ug.begin('solo','l1')");pg.wait_for_timeout(3000)
    pg.keyboard.press('KeyH');J(pg,"()=>{__ug.enemies.forEach(e=>e.dead=1);__ug.P.iT=1e9;window.__dt=1/30;window.__LOG=[];const f=()=>{const h=__ug.selfHero,C=h.cape,P=__ug.P;__LOG.push([P.pos.y.toFixed(2),P.vel.z.toFixed(1),(C.p[112*3+1]-P.pos.y).toFixed(2),(C.p[112*3+2]-P.pos.z).toFixed(2),C.dbg,h.ph.toFixed(1)].join(' '));if(__LOG.length<70)requestAnimationFrame(f)};requestAnimationFrame(f)}")
    pg.keyboard.down('KeyW');pg.wait_for_timeout(9000);pg.keyboard.up('KeyW')
    print('\n'.join(J(pg,"()=>__LOG")))
    b.close()
