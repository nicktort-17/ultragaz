import os,sys;sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'));from ugenv import *  # пути окружения
import sys;sys.path.insert(0,TOOLS)
from crop import *
STEP="(n)=>new Promise(r=>{window.__frz=false;let k=0;const f=()=>{if(++k>=n){window.__frz=true;setTimeout(r,60)}else requestAnimationFrame(f)};requestAnimationFrame(f)})"
with sync_playwright() as p:
    b,pg,errs=open_page(p,700,400)
    pg.evaluate("()=>{document.querySelector('[data-q=low]').click();document.getElementById('mSolo').click()}");pg.wait_for_timeout(1500)
    J(pg,"()=>{const u=__ug;u.P.iT=999;u.enemies.forEach(e=>u.kill(e,'x',true));u.startWave(5)}")
    print(J(pg,"()=>__ug.toSpawn.slice()"))
    pg.evaluate(STEP,90)
    print(J(pg,"()=>({e:__ug.enemies.map(e=>e.type),bar:!document.getElementById('bossBar').hidden,bank:Math.round(__ug.bank)})"))
    J(pg,"()=>{const u=__ug,e=u.enemies.find(x=>x.type==='boss');u.kill(e,'rev')}");pg.evaluate(STEP,3)
    print(J(pg,"()=>({e:__ug.enemies.map(e=>e.type),bank:Math.round(__ug.bank),ls:localStorage.getItem('ug-sp')})"))
    print([e for e in errs if 'ReadPixels' not in e and 'ERR_FAILED' not in e][:5])
    b.close()
