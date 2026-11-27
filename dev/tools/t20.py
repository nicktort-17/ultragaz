import sys;sys.path.insert(0,'/tmp/an')
from crop import *
from PIL import Image
STEP="(n)=>new Promise(r=>{window.__frz=false;let k=0;const f=()=>{if(++k>=n){window.__frz=true;setTimeout(r,60)}else requestAnimationFrame(f)};requestAnimationFrame(f)})"
with sync_playwright() as p:
    b,pg,errs=open_page(p,1100,620)
    pg.evaluate("()=>{document.querySelector('[data-q=high]').click();document.getElementById('mapP').click();document.getElementById('mSolo').click()}");pg.wait_for_timeout(1500)
    J(pg,"()=>{const u=__ug;u.enemies.forEach(e=>u.kill(e,'x',true));u.toSpawn.length=0;u.P.pos.set(0,.1,27);u.P.yaw=0;u.P.pitch=.32;u.P.iT=999;u.spawnEnemy('vend',new THREE.Vector3(0,.1,16));u.spawnEnemy('vend',new THREE.Vector3(2.5,.1,16.5))}")
    pg.evaluate(STEP,30)
    J(pg,"()=>{const u=__ug;u.enemies.forEach(e=>{e.cd=99;e.cd2=99;e.speed=0;e.vel.set(0,0,0)});const es=u.enemies;es[0].pos.set(0,.1,16);es[1].pos.set(2.5,.1,16.5);es[0].wet=3;u.colaGeyser(es[0]);u.P.pos.set(0,.1,27)}")
    out=[]
    for i,n in enumerate([3,9,14,12]):
        pg.evaluate(STEP,n);pg.locator('#screen').screenshot(path='/tmp/an/_g.png');im=Image.open('/tmp/an/_g.png');W,H=im.size;im.crop((int(W*.18),0,int(W*.82),int(H*.85))).save('/tmp/an/gz%d.png'%i);out.append('/tmp/an/gz%d.png'%i)
    sheet(out[:2],'/tmp/an/gey_a.png',480);sheet(out[2:],'/tmp/an/gey_b.png',480)
    print([e for e in errs if 'ReadPixels' not in e and 'ERR_FAILED' not in e][:8])
    b.close()
