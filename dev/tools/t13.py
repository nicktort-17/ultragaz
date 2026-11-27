import os,sys;sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'));from ugenv import *  # пути окружения
import sys;sys.path.insert(0,TOOLS)
from crop import *
STEP="(n)=>new Promise(r=>{window.__frz=false;let k=0;const f=()=>{if(++k>=n){window.__frz=true;setTimeout(r,60)}else requestAnimationFrame(f)};requestAnimationFrame(f)})"
with sync_playwright() as p:
    b,pg,errs=open_page(p,1100,620)
    pg.evaluate("()=>{document.querySelector('[data-q=mid]').click();document.getElementById('mapZ').click();document.getElementById('mSolo').click()}");pg.wait_for_timeout(1500)
    J(pg,"()=>{const u=__ug;u.enemies.forEach(e=>u.kill(e,'x',true));u.toSpawn.length=0;u.P.pos.set(0,1.3,12);u.P.yaw=0;u.P.pitch=.15;u.P.iT=999;u.spawnEnemy('boss',new THREE.Vector3(0,1.3,2))}")
    pg.evaluate(STEP,8);pg.locator('#screen').screenshot(path=OUT+'/boss1.png')
    J(pg,"()=>{window.__frz=false}");pg.wait_for_timeout(6000)
    J(pg,"()=>{window.__frz=true}");pg.locator('#screen').screenshot(path=OUT+'/boss2.png')
    print(J(pg,"()=>{const e=__ug.enemies.find(x=>x.type==='boss');return e?{hp:e.hp,max:e.maxHp,pos:e.pos.toArray().map(v=>+v.toFixed(1)),slam:e.slamS,dash:e.dashT,cd:e.cd}:null}"))
    J(pg,"()=>{const e=__ug.enemies.find(x=>x.type==='boss');e.hp=e.maxHp*.45}");J(pg,"()=>{window.__frz=false}");pg.wait_for_timeout(9000)
    J(pg,"()=>{window.__frz=true}");pg.locator('#screen').screenshot(path=OUT+'/boss3.png')
    print(J(pg,"()=>{const e=__ug.enemies.find(x=>x.type==='boss');return e?{hp:+e.hp.toFixed(1),ph2:e.ph2,slam:e.slamS,n:__ug.enemies.length,playerHp:__ug.P.hp}:null}"))
    print([e for e in errs if 'ReadPixels' not in e and 'ERR_FAILED' not in e][:8])
    b.close()
