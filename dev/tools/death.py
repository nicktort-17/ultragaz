import sys,json;sys.path.insert(0,'/tmp/an')
from base import *
def F(pg,n=30):pg.evaluate("()=>new Promise(r=>{let n=0;const f=()=>{if(++n>%d)r();else requestAnimationFrame(f)};f()})"%n)
st="()=>({ph:__ug.story.phase,room:__ug.story.room,tries:__ug.story.tries,en:__ug.enemies.length,ts:__ug.toSpawn.length,alive:__ug.P.alive,pos:[__ug.P.pos.x,__ug.P.pos.y,__ug.P.pos.z].map(v=>+v.toFixed(1)),resp:document.getElementById('respawn').textContent,ban:document.getElementById('banner').textContent})"
with sync_playwright() as p:
    b,pg,errs=open_page(p,640,360)
    J(pg,"()=>{window.__norender=1;__ug.begin('solo','l1')}");pg.wait_for_timeout(800)
    J(pg,"()=>{const P=__ug.P;P.pos.set(-6,0,12)}");F(pg,120);print(J(pg,st))
    J(pg,"()=>{__ug.P.iT=0;__ug.P.hp=1;__ug.die()}");F(pg,30);print(J(pg,st))
    F(pg,120);print(J(pg,st))
    J(pg,"()=>{const P=__ug.P;P.pos.set(0,-20,0)}");F(pg,20);print(J(pg,st))
    print([e for e in errs if 'ReadPixels' not in e and 'ERR_FAILED' not in e][:8])
    b.close()
