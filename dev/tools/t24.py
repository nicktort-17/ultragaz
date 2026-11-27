import os,sys;sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'));from ugenv import *  # пути окружения
import sys;sys.path.insert(0,TOOLS)
from crop import *
W="()=>new Promise(r=>{let n=0;const f=()=>{if(++n>40)r();else requestAnimationFrame(f)};f()})"
with sync_playwright() as p:
    b,pg,errs=open_page(p,1280,720)
    HAVE_THREE and pg.route('**/objects/Reflector.js',lambda r:r.fulfill(path=THREE_DIR+'/examples/js/objects/Reflector.js',content_type='text/javascript'))
    pg.reload();pg.wait_for_timeout(3000)
    pg.mouse.click(640,360);pg.evaluate(W)
    J(pg,"()=>{document.querySelector('[data-q=mid]').click()}")
    pg.keyboard.press('Enter');pg.evaluate(W)   # open ИГРАТЬ
    pg.screenshot(path=OUT+'/f_play.png')
    J(pg,"()=>{document.getElementById('startBtn').click()}");pg.wait_for_timeout(2500)
    st=J(pg,"()=>({state:__ug.state,menuHidden:document.getElementById('menu').hidden,hud:document.querySelector('.hud').style.visibility,heroParent:__ug.selfHero.root.parent===__ug.scene,layer:__ug.selfHero.root.children[0].layers.mask})")
    print('ingame',st)
    pg.evaluate(W);pg.screenshot(path=OUT+'/f_game.png')
    J(pg,"()=>{__ug.state='play';document.getElementById('pause').hidden=true}")
    J(pg,"()=>{const u=__ug;u.state='pause';document.getElementById('pause').hidden=false}");pg.wait_for_timeout(600);pg.screenshot(path=OUT+'/f_pause.png')
    J(pg,"()=>{const u=__ug;u.state='play';document.getElementById('pause').hidden=true;u.P.iT=0;u.P.hp=1;u.die()}");pg.wait_for_timeout(1800);pg.screenshot(path=OUT+'/f_dead.png')
    J(pg,"()=>{document.getElementById('toMenu').click()}");pg.evaluate(W);pg.evaluate(W)
    print('menu',J(pg,"()=>({state:__ug.state,v:document.getElementById('menu').dataset.v,heroParent:__ug.selfHero.root.parent!==__ug.scene})"))
    pg.screenshot(path=OUT+'/f_back.png')
    print([e for e in errs if 'ReadPixels' not in e and 'ERR_FAILED' not in e][:10])
    b.close()
