import sys,json;sys.path.insert(0,'/tmp/an')
from base import *
def F(pg,n=30):pg.evaluate("()=>new Promise(r=>{let n=0;const f=()=>{if(++n>%d)r();else requestAnimationFrame(f)};f()})"%n)
with sync_playwright() as p:
    b,pg,errs=open_page(p,640,360)
    # сначала сюжет, потом в меню и аркада — storyId должен сброситься
    J(pg,"()=>{window.__norender=1;__ug.begin('solo','l2')}");pg.wait_for_timeout(800);F(pg,30)
    J(pg,"()=>__ug.toMenu()");F(pg,10)
    J(pg,"()=>{document.getElementById('startBtn').click()}");pg.wait_for_timeout(1200);F(pg,60)
    print(J(pg,"()=>({st:__ug.state,story:!!__ug.story,wave:__ug.wave,ts:__ug.toSpawn.length,en:__ug.enemies.length,txt:document.getElementById('wave').textContent,left:document.getElementById('left').textContent})"))
    for k in range(8):
        J(pg,"()=>{for(const e of __ug.enemies)__ug.damage(e,9999,99,'x');__ug.P.iT=1e9}");F(pg,40)
    print(J(pg,"()=>({st:__ug.state,wave:__ug.wave,txt:document.getElementById('wave').textContent,left:document.getElementById('left').textContent})"))
    J(pg,"()=>{__ug.P.iT=0;__ug.die()}");F(pg,60)
    print(J(pg,"()=>({st:__ug.state,dead:!document.getElementById('dead').hidden})"))
    print([e for e in errs if 'ReadPixels' not in e and 'ERR_FAILED' not in e][:8])
    b.close()
