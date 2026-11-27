import os,sys;sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'));from ugenv import *  # пути окружения
import sys;sys.path.insert(0,TOOLS)
from base import *
with sync_playwright() as p:
    b,pg,errs=open_page(p,1280,720)
    J(pg,"()=>{__ug.myCos.skin=1;__ug.rebuildSelf();__ug.buildHeroUI()}");pg.wait_for_timeout(3000)
    print('human',J(pg,"()=>__ug.selfHero.human"))
    J(pg,"()=>__ug.mmView&&__ug.mmView('hero')");pg.wait_for_timeout(2500)
    pg.screenshot(path=OUT+'/mm_hero.png')
    J(pg,"()=>{__ug.SHOW.anim='cape';__ug.SHOW.t=0;__ug.buildHeroUI()}");pg.wait_for_timeout(1500)
    pg.screenshot(path=OUT+'/mm_cape1.png');pg.wait_for_timeout(1300);pg.screenshot(path=OUT+'/mm_cape2.png')
    # игра от третьего лица
    J(pg,"()=>__ug.begin('solo','l1')");pg.wait_for_timeout(3000)
    pg.keyboard.press('KeyH');pg.wait_for_timeout(300)
    J(pg,"()=>{__ug.enemies.forEach(e=>e.dead=1);__ug.P.iT=1e9}")
    pg.keyboard.down('KeyW');pg.wait_for_timeout(1200);pg.screenshot(path=OUT+'/g_run.png');pg.keyboard.up('KeyW')
    pg.keyboard.press('KeyT');pg.wait_for_timeout(400);pg.screenshot(path=OUT+'/g_t1.png');pg.wait_for_timeout(1000);pg.screenshot(path=OUT+'/g_t2.png')
    print('cape',J(pg,"()=>__eval('[selfHero.capeOn,myCape,selfHero.capeK,tpView]')"))
    pg.keyboard.press('KeyT');pg.wait_for_timeout(1500)
    print('cape2',J(pg,"()=>__eval('[selfHero.capeOn,myCape,selfHero.capeK]')"))
    J(pg,"()=>{window.__ftn=0;window.__fts=0}");pg.wait_for_timeout(3000);print('ft ms',J(pg,"()=>__fts/__ftn"))
    print([e for e in errs if 'ReadPixels' not in e and 'ERR_FAILED' not in e][:6])
    b.close()
