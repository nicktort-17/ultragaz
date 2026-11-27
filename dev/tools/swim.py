import sys;sys.path.insert(0,'/tmp/an')
from base import *
def F(pg,n=30):pg.evaluate("()=>new Promise(r=>{let n=0;const f=()=>{if(++n>%d)r();else requestAnimationFrame(f)};f()})"%n)
S="()=>__eval(`[+P.pos.x.toFixed(1),+P.pos.y.toFixed(2),+P.pos.z.toFixed(1),+(P.syr||0).toFixed(2),+P.vel.y.toFixed(1),+qPool().y.toFixed(2),P.grounded]`)"
with sync_playwright() as p:
    b,pg,errs=open_page(p,960,540)
    J(pg,"()=>__ug.begin('solo','l2')");pg.wait_for_timeout(2500)
    J(pg,"()=>{window.__dt=1/30;const R=__ug.story.lv.rooms[2];__ug.P.iT=1e9;__ug.P.pos.set(R.cp[0],R.cp[1]+.05,R.cp[2]);document.getElementById('lvCard').hidden=true;__eval('roomStart(2)')}")
    F(pg,30)
    J(pg,"()=>__eval(`enemies.forEach(e=>{e.cd=99});P.pos.set(-8,9,-84);P.vel.set(0,0,0);P.yaw=Math.PI;P.pitch=-.2`)")
    for k in range(8):F(pg,10);print('fall',J(pg,S))
    pg.screenshot(path='/tmp/an/sw_float.png')
    # плыть к южному бортику (z -81) и выпрыгнуть
    J(pg,"()=>__eval(`P.yaw=0`)")
    pg.keyboard.down('KeyS')
    for k in range(8):F(pg,10);print('swim',J(pg,S))
    J(pg,"()=>__eval('jump()')")
    for k in range(5):F(pg,6);print('jump',J(pg,S))
    pg.keyboard.up('KeyS')
    J(pg,"()=>__eval(`drainT=10`)");F(pg,120);print('drain',J(pg,S))
    J(pg,"()=>__eval(`P.pos.set(0,9.75,-78.5);P.yaw=0;P.pitch=-.4`)");F(pg,8);pg.screenshot(path='/tmp/an/sw_view.png')
    print([e for e in errs if 'ReadPixels' not in e and 'ERR_FAILED' not in e][:8])
    b.close()
