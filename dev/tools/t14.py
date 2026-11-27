import sys;sys.path.insert(0,'/tmp/an')
from crop import *
from PIL import Image
STEP="(n)=>new Promise(r=>{window.__frz=false;let k=0;const f=()=>{if(++k>=n){window.__frz=true;setTimeout(r,60)}else requestAnimationFrame(f)};requestAnimationFrame(f)})"
with sync_playwright() as p:
    b,pg,errs=open_page(p,1100,620)
    pg.evaluate("()=>{document.querySelector('[data-q=mid]').click();document.getElementById('mapP').click();document.getElementById('mSolo').click()}");pg.wait_for_timeout(1500)
    J(pg,"()=>{const u=__ug;u.enemies.forEach(e=>u.kill(e,'x',true));u.toSpawn.length=0;u.P.pos.set(0,.1,24);u.P.yaw=0;u.P.pitch=.22;u.P.iT=999;u.spawnEnemy('boss',new THREE.Vector3(0,.1,14))}")
    pg.evaluate(STEP,3)
    out=[]
    for i,ry in enumerate([0,.9,2.6]):
        J(pg,"()=>{const e=__ug.enemies.find(x=>x.type==='boss');e.pos.set(0,2.4,14.5);e.g.rotation.y=%s;e.vel.set(0,0,0);window.__frz=true}"%ry);pg.evaluate(STEP,1)
        J(pg,"()=>{const e=__ug.enemies.find(x=>x.type==='boss');e.pos.set(0,2.4,14.5);e.g.rotation.y=%s}"%ry);pg.wait_for_timeout(200)
        pg.locator('#screen').screenshot(path='/tmp/an/_b.png');im=Image.open('/tmp/an/_b.png');W,H=im.size;im.crop((int(W*.25),0,int(W*.75),H)).save('/tmp/an/bm%d.png'%i);out.append('/tmp/an/bm%d.png'%i)
    sheet(out,'/tmp/an/bossmodel.png',520)
    print([e for e in errs if 'ReadPixels' not in e and 'ERR_FAILED' not in e][:8])
    b.close()
