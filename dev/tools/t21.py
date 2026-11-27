import os,sys;sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'));from ugenv import *  # пути окружения
import sys;sys.path.insert(0,TOOLS)
from crop import *
with sync_playwright() as p:
    b,pg,errs=open_page(p,1440,810)
    HAVE_THREE and pg.route('**/objects/Reflector.js',lambda r:r.fulfill(path=THREE_DIR+'/examples/js/objects/Reflector.js',content_type='text/javascript'))
    pg.reload();pg.wait_for_timeout(3500)
    pg.screenshot(path=OUT+'/m_title.png')
    pg.keyboard.press('Enter');pg.wait_for_timeout(2600)
    pg.screenshot(path=OUT+'/m_main.png')
    pg.keyboard.press('ArrowDown');pg.wait_for_timeout(600);pg.screenshot(path=OUT+'/m_main2.png')
    pg.keyboard.press('ArrowUp');pg.wait_for_timeout(300);pg.keyboard.press('Enter');pg.wait_for_timeout(2200);pg.screenshot(path=OUT+'/m_play.png')
    pg.keyboard.press('Escape');pg.wait_for_timeout(800);pg.keyboard.press('ArrowDown');pg.keyboard.press('Enter');pg.wait_for_timeout(2400);pg.screenshot(path=OUT+'/m_hero.png')
    pg.keyboard.press('Escape');pg.wait_for_timeout(800);pg.keyboard.press('ArrowDown');pg.keyboard.press('Enter');pg.wait_for_timeout(2000);pg.screenshot(path=OUT+'/m_manual.png')
    pg.keyboard.press('ArrowRight');pg.keyboard.press('ArrowRight');pg.wait_for_timeout(700);pg.screenshot(path=OUT+'/m_manual2.png')
    pg.keyboard.press('Escape');pg.wait_for_timeout(800);pg.keyboard.press('ArrowDown');pg.keyboard.press('Enter');pg.wait_for_timeout(2000);pg.screenshot(path=OUT+'/m_set.png')
    print(J(pg,"()=>({v:document.getElementById('menu').dataset.v,refl:!!THREE.Reflector,fps:0})"))
    print([e for e in errs if 'ReadPixels' not in e and 'ERR_FAILED' not in e][:10])
    b.close()
