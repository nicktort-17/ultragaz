import sys;sys.path.insert(0,'/tmp/an')
from crop import *
STEP="(n)=>new Promise(r=>{window.__frz=false;let k=0;const f=()=>{if(++k>=n){window.__frz=true;setTimeout(r,60)}else requestAnimationFrame(f)};requestAnimationFrame(f)})"
with sync_playwright() as p:
    b,pg,errs=open_page(p,1280,720)
    pg.evaluate("()=>{document.querySelector('[data-q=mid]').click();document.querySelectorAll('#sw button')[0].click();__ug.SHOW.anim='idle'}");pg.wait_for_timeout(2500)
    pg.locator('#screen').screenshot(path='/tmp/an/menu_z.png')
    pg.evaluate("()=>{document.getElementById('mapP').click();__ug.SHOW.anim='fire'}");pg.wait_for_timeout(2500)
    pg.locator('#screen').screenshot(path='/tmp/an/menu_p.png')
    pg.evaluate("()=>{document.getElementById('mSolo').click()}");pg.wait_for_timeout(1500)
    J(pg,"()=>{const u=__ug;u.enemies.forEach(e=>u.kill(e,'x',true));u.P.pos.set(0,.1,20);u.P.yaw=.4;u.P.pitch=-.05;u.P.iT=99;u.tp=true}")
    pg.evaluate(STEP,20);pg.locator('#screen').screenshot(path='/tmp/an/tp1.png')
    J(pg,"()=>{const u=__ug;u.P.slide=true;u.P.slideDir.set(-Math.sin(.4),0,-Math.cos(.4))}");pg.evaluate(STEP,12);pg.locator('#screen').screenshot(path='/tmp/an/tp2.png')
    J(pg,"()=>{const u=__ug;u.P.slide=false;u.tp=false;u.P.iT=0;u.P.hp=1;u.die()}");pg.evaluate(STEP,30);pg.locator('#screen').screenshot(path='/tmp/an/dead1.png')
    print([e for e in errs if 'ReadPixels' not in e and 'ERR_FAILED' not in e][:8])
    b.close()
