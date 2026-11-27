import sys;sys.path.insert(0,'/tmp/an')
from base import *
def F(pg,n=30):pg.evaluate("()=>new Promise(r=>{let n=0;const f=()=>{if(++n>%d)r();else requestAnimationFrame(f)};f()})"%n)
with sync_playwright() as p:
    b,pg,errs=open_page(p,1280,720)
    J(pg,"()=>__ug.begin('solo','l1')");pg.wait_for_timeout(3000)
    J(pg,"()=>{__ug.enemies.forEach(e=>e.dead=1);__ug.P.iT=1e9;document.getElementById('lvCard').hidden=true;__ug.switchW(0)}");pg.wait_for_timeout(1500)
    print(J(pg,"()=>__eval(`(()=>{const u=guns[0].userData,P_=u.parts;return [u.glb,!!P_.drum,P_.drumX,!!P_.hammer,!!P_.trigger,!!P_.barrel,(P_.needles||[]).length,(P_.caps||[]).length,u.k]})()`)"))
    pg.screenshot(path='/tmp/an/sp_idle.png')
    J(pg,"()=>__eval('window.__dt=1/60;fire(false)')");F(pg,3);pg.screenshot(path='/tmp/an/sp_fire.png')
    J(pg,"()=>__eval('delete window.__dt')")
    pg.wait_for_timeout(800);J(pg,"()=>__eval('inspect()')");pg.wait_for_timeout(1200);pg.screenshot(path='/tmp/an/sp_insp.png')
    print([e for e in errs if 'ReadPixels' not in e and 'ERR_FAILED' not in e][:5])
    b.close()
