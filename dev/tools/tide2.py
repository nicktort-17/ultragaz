import sys;sys.path.insert(0,'/tmp/an')
from base import *
def F(pg,n=30):pg.evaluate("()=>new Promise(r=>{let n=0;const f=()=>{if(++n>%d)r();else requestAnimationFrame(f)};f()})"%n)
S="()=>__eval(`[story.phase,story.room,pools.map(p=>+p.y.toFixed(2)).join('/'),+tideK.toFixed(2),+wetK.toFixed(2)]`)"
with sync_playwright() as p:
    b,pg,errs=open_page(p,640,360)
    J(pg,"()=>__ug.begin('solo','l2')");J(pg,"()=>{window.__norender=1;window.__dt=1/30;__ug.P.iT=1e9}");pg.wait_for_timeout(1000)
    for k in range(3):F(pg,60);print('idle',J(pg,S))
    J(pg,"()=>__eval('roomStart(0)')")
    for k in range(4):F(pg,150);print('fight',J(pg,S))
    J(pg,"()=>__eval(`enemies.forEach(e=>e.dead=1)`)");F(pg,60)
    for k in range(2):F(pg,150);print('clear',J(pg,S))
    J(pg,"()=>__eval('drainT=6')");F(pg,150);print('drain',J(pg,S));F(pg,200);print('after',J(pg,S))
    b.close()
