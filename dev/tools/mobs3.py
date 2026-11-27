import sys,json;sys.path.insert(0,'/tmp/an')
from base import *
def F(pg,n=30):pg.evaluate("()=>new Promise(r=>{let n=0;const f=()=>{if(++n>%d)r();else requestAnimationFrame(f)};f()})"%n)
with sync_playwright() as p:
    b,pg,errs=open_page(p,960,540)
    J(pg,"()=>__ug.begin('solo','l3')");pg.wait_for_timeout(1500)
    print('model',J(pg,"()=>__eval('BAMB_T&&BAMB_T.type')"))
    J(pg,"()=>{const P=__ug.P;P.pos.set(0,0,-4);P.yaw=0;P.pitch=.05;P.iT=1e9;document.getElementById('lvCard').hidden=true;__eval(\"spawnEnemy('bambun',new THREE.Vector3(-3,0,-14));spawnEnemy('keto',new THREE.Vector3(4,0,-12))\")}")
    F(pg,10);J(pg,"()=>{window.__frz=1}");F(pg,3);pg.screenshot(path='/tmp/an/m1.png');J(pg,"()=>{window.__frz=0}")
    st="()=>__ug.enemies.map(e=>e.type+':'+e.st+':'+e.ac+':'+Math.round(e.hp)+'@'+e.pos.toArray().map(v=>v.toFixed(1))).join(' | ')"
    hp=[]
    for k in range(12):
        F(pg,20);print(k,J(pg,st),'php',J(pg,"()=>Math.round(__ug.P.hp)"),flush=True)
        if k==5:J(pg,"()=>{__ug.P.iT=0}")
        if k in(3,7):pg.screenshot(path='/tmp/an/m%d.png'%k)
    J(pg,"()=>{for(const e of __ug.enemies)__ug.damage(e,999,99,'x')}");F(pg,20)
    print('after kill',J(pg,st))
    print([e for e in errs if 'ReadPixels' not in e and 'ERR_FAILED' not in e][:6])
    b.close()
