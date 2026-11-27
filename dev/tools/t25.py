import sys;sys.path.insert(0,'/tmp/an')
from crop import *
W="()=>new Promise(r=>{let n=0;const f=()=>{if(++n>60)r();else requestAnimationFrame(f)};f()})"
with sync_playwright() as p:
    for (w,h,q,name) in [(960,680,'mid','narrow')]:
        b,pg,errs=open_page(p,w,h)
        pg.route('**/objects/Reflector.js',lambda r:r.fulfill(path='/tmp/t/node_modules/three/examples/js/objects/Reflector.js',content_type='text/javascript'))
        pg.reload();pg.wait_for_timeout(3000)
        pg.keyboard.press('Space');pg.evaluate(W)
        J(pg,"()=>{document.querySelector('[data-q=%s]').click()}"%q);pg.evaluate(W)
        pg.screenshot(path='/tmp/an/r_%s_main.png'%name)
        pg.keyboard.press('ArrowDown');pg.keyboard.press('ArrowDown');pg.keyboard.press('ArrowDown');pg.keyboard.press('Enter');pg.evaluate(W)
        print(name,J(pg,"()=>({v:document.getElementById('menu').dataset.v,active:document.activeElement&&document.activeElement.textContent.slice(0,20),q:document.querySelector('.qb.sel')&&document.querySelector('.qb.sel').dataset.q})"))
        pg.screenshot(path='/tmp/an/r_%s_set.png'%name)
        pg.keyboard.press('Escape');pg.evaluate(W);pg.keyboard.press('ArrowUp');pg.keyboard.press('ArrowUp');pg.keyboard.press('ArrowUp');pg.keyboard.press('Enter');pg.evaluate(W)
        pg.screenshot(path='/tmp/an/r_%s_play.png'%name)
        pg.keyboard.press('Enter');pg.wait_for_timeout(2500)
        print(name,'state',J(pg,"()=>__ug.state"))
        print([e for e in errs if 'ReadPixels' not in e and 'ERR_FAILED' not in e][:6])
        b.close()
