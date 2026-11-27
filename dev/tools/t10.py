import sys;sys.path.insert(0,'/tmp/an')
from crop import *
with sync_playwright() as p:
    b,pg,errs=open_page(p,1000,560)
    pg.evaluate("()=>{document.querySelector('[data-q=low]').click();document.getElementById('mapZ').click();document.getElementById('mSolo').click()}");pg.wait_for_timeout(1500)
    # play a few seconds firing all weapons, punching, coins, inspect, tp toggle
    for w in range(4):
        J(pg,"()=>{__ug.switchW(%d);__ug.setFire(true,false)}"%w);pg.wait_for_timeout(1500)
        J(pg,"()=>{__ug.setFire(false,true)}");pg.wait_for_timeout(700);J(pg,"()=>{__ug.setFire(false,false);__ug.punch();__ug.inspect()}");pg.wait_for_timeout(700)
    J(pg,"()=>{__ug.tp=true}");pg.wait_for_timeout(1500);J(pg,"()=>{__ug.P.iT=99}")
    J(pg,"()=>{__ug.P.pos.set(0,1.3,10);__ug.P.yaw=.3}");pg.wait_for_timeout(1500);pg.locator('#screen').screenshot(path='/tmp/an/tp3.png')
    J(pg,"()=>{__ug.tp=false}")
    st=J(pg,"()=>({state:__ug.state,hp:__ug.P.hp,cur:__ug.cur,heroes:__ug.heroes.size,vmparts:__ug.guns.map(g=>!!g.userData.hand),fps:0})")
    print(st)
    pg.evaluate("()=>document.dispatchEvent(new KeyboardEvent('keydown',{code:'Escape'}))")
    J(pg,"()=>{__ug.toMenu()}");pg.wait_for_timeout(1200)
    print('menu',J(pg,"()=>({state:__ug.state,vis:__ug.selfHero.root.visible,fov:__ug.camera.fov})"))
    print([e for e in errs if 'ReadPixels' not in e and 'ERR_FAILED' not in e][:8])
    b.close()
