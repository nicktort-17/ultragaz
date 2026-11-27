import os,sys;sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'));from ugenv import *  # пути окружения
import sys;sys.path.insert(0,TOOLS)
from crop import *
STEP="(n)=>new Promise(r=>{window.__frz=false;let k=0;const f=()=>{if(++k>=n){window.__frz=true;setTimeout(r,60)}else requestAnimationFrame(f)};requestAnimationFrame(f)})"
with sync_playwright() as p:
    b,pg,errs=open_page(p,1100,620)
    pg.evaluate("()=>{document.querySelector('[data-q=mid]').click();document.getElementById('mapP').click();document.getElementById('mSolo').click()}");pg.wait_for_timeout(1500)
    J(pg,"()=>{const u=__ug;u.enemies.forEach(e=>u.kill(e,'x',true));u.toSpawn.length=0;u.P.pos.set(0,.1,24);u.P.yaw=0;u.P.pitch=.15;u.P.iT=999;u.spawnEnemy('vend',new THREE.Vector3(-2,.1,15));u.spawnEnemy('vend',new THREE.Vector3(1.5,.1,14));u.spawnEnemy('golem',new THREE.Vector3(4,.1,13))}")
    pg.evaluate(STEP,30)
    J(pg,"()=>{const u=__ug;u.enemies.forEach(e=>{e.cd=99;e.cd2=99;e.speed=0;e.vel.set(0,0,0)});const es=u.enemies;es[0].pos.set(-2,.1,15);es[1].pos.set(1.5,.1,14.5);es[2].pos.set(4.5,.1,13);es[0].wet=3;u.colaGeyser(es[0])}")
    pg.evaluate(STEP,7);pg.locator('#screen').screenshot(path=OUT+'/gey1.png')
    pg.evaluate(STEP,30)
    print(J(pg,"()=>{const u=__ug;return {pud:u.puddles.map(p=>[+p.r.toFixed(2),+p.t.toFixed(1)]),en:u.enemies.map(e=>[e.type,+e.hp.toFixed(1),+e.pos.y.toFixed(1)])}}"))
    # slip test: puddle under golem path
    J(pg,"()=>{const u=__ug;const g=u.enemies.find(e=>e.type==='golem');u.addPuddle(g.pos.x,g.pos.y,g.pos.z-1,1.8,8);g.speed=4.2;g.slipCd=0}")
    pg.evaluate(STEP,25)
    print(J(pg,"()=>{const u=__ug;return u.enemies.map(e=>[e.type,e.slip?+e.slip.toFixed(2):0])}"))
    pg.locator('#screen').screenshot(path=OUT+'/slip1.png')
    print([e for e in errs if 'ReadPixels' not in e and 'ERR_FAILED' not in e][:8])
    b.close()
