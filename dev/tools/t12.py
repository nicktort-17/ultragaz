import sys;sys.path.insert(0,'/tmp/an')
from crop import *
STEP="(n)=>new Promise(r=>{window.__frz=false;let k=0;const f=()=>{if(++k>=n){window.__frz=true;setTimeout(r,60)}else requestAnimationFrame(f)};requestAnimationFrame(f)})"
with sync_playwright() as p:
    b,pg,errs=open_page(p,1100,620)
    pg.evaluate("()=>{document.querySelector('[data-q=mid]').click();document.getElementById('mapP').click();document.getElementById('mSolo').click()}");pg.wait_for_timeout(1500)
    J(pg,"()=>{const u=__ug;u.enemies.forEach(e=>u.kill(e,'x',true));u.P.pos.set(0,.1,20);u.P.yaw=0;u.P.pitch=-.1;u.P.iT=99;u.spawnEnemy('vend',new THREE.Vector3(-1.6,.1,15));u.spawnEnemy('golem',new THREE.Vector3(2.2,.1,14))}")
    pg.evaluate(STEP,40)
    J(pg,"()=>{const u=__ug;u.enemies.forEach(e=>{e.speed=0;e.vel.set(0,0,0);e.cd=99;e.cd2=99})}")
    J(pg,"()=>{const u=__ug,es=u.enemies;es[0].pos.set(-1.6,.1,15);es[1].pos.set(2.2,.1,14);es[0].wet=3}")
    pg.evaluate(STEP,25);pg.locator('#screen').screenshot(path='/tmp/an/wet.png')
    print([e for e in errs if 'ReadPixels' not in e and 'ERR_FAILED' not in e][:5])
    b.close()
