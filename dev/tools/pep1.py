import sys,json;sys.path.insert(0,'/tmp/an')
from base import *
def F(pg,n=30):pg.evaluate("()=>new Promise(r=>{let n=0;const f=()=>{if(++n>%d)r();else requestAnimationFrame(f)};f()})"%n)
E=lambda pg,s:pg.evaluate("()=>__eval(%s)"%json.dumps(s))
st="()=>({ph:__ug.story.phase,room:__ug.story.room,en:__ug.enemies.filter(e=>!e.dead).map(e=>e.type+':'+(e.ac||0)+':'+e.st+':'+Math.round(e.hp)).join(','),state:__ug.state})"
with sync_playwright() as p:
    b,pg,errs=open_page(p,960,540)
    J(pg,"()=>__ug.begin('solo','l4')");pg.wait_for_timeout(1500);J(pg,"()=>{window.__dt=1/30}")
    F(pg,60)
    print('PEP_T',E(pg,"typeof PEP_T==='object'&&PEP_T?'ok':String(PEP_T)"),'prop',E(pg,"!!PEP.prop"))
    # к храму: встать у входа на площадь, смотреть на спящего босса
    E(pg,"(()=>{P.iT=1e9;P.pos.set(0,9.05,-106);P.vel.set(0,0,0);P.yaw=0;P.pitch=-.05;story.room=2;story.phase='clear'})()")
    F(pg,20);pg.screenshot(path='/tmp/pt/p_prop.png')
    print('prop',E(pg,"PEP.prop?PEP.prop.g.position.toArray():null"))
    E(pg,"(()=>{P.pos.set(0,9.05,-112);})()");F(pg,10)
    print('after trig',J(pg,st))
    for i in range(6):
        F(pg,14);pg.screenshot(path='/tmp/pt/p_wake%d.png'%i)
    print('woke',J(pg,st))
    print([e for e in errs if 'ReadPixels' not in e and 'ERR_FAILED' not in e][:8])
    b.close()
