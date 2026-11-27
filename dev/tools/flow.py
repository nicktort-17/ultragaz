import sys,json;sys.path.insert(0,'/tmp/an')
from base import *
lv=sys.argv[1]
def F(pg,n=30):pg.evaluate("()=>new Promise(r=>{let n=0;const f=()=>{if(++n>%d)r();else requestAnimationFrame(f)};f()})"%n)
st="()=>({ph:__ug.story.phase,room:__ug.story.room,wi:__ug.story.wi,en:__ug.enemies.map(e=>e.type).join(','),ts:__ug.toSpawn.length,doors:__ug.doors.map(d=>d.open?1:0).join(''),hud:document.getElementById('left').textContent,state:__ug.state,hp:Math.round(__ug.P.hp)})"
with sync_playwright() as p:
    b,pg,errs=open_page(p,640,360)
    J(pg,"()=>__ug.begin('solo','%s')"%lv);pg.wait_for_timeout(1000)
    J(pg,"()=>{__ug.P.iT=1e9;window.__norender=1}")
    L=J(pg,"()=>__ug.LEVELS.find(l=>l.id==='%s').rooms.map(r=>r.cp)"%lv)
    for ri,cp in enumerate(L):
        # шагнуть в триггер зала
        J(pg,"()=>{const R=__ug.story.lv.rooms[%d];const P=__ug.P;P.pos.set((R.trig[0]+R.trig[1])/2+3,R.cp[1]+.05,(R.trig[2]+R.trig[3])/2);P.vel.set(0,0,0);P.iT=1e9}"%ri)
        F(pg,10);print('enter',ri,J(pg,st))
        for k in range(14):
            F(pg,40)
            s=J(pg,st)
            if k%3==0:print(' ',k,s)
            if s['ph']!='fight':break
            J(pg,"()=>{for(const e of __ug.enemies){if(e.type==='boss'||e.type==='queen'){if(!e.inv)__ug.damage(e,e.hp*.34+1,99,'x')}else __ug.damage(e,9999,99,'x')}__ug.P.iT=1e9}")
        print('after',ri,J(pg,st))
        J(pg,"()=>{window.__norender=0}");F(pg,4);pg.screenshot(path='/tmp/an/fl_%s_%d.png'%(lv,ri));J(pg,"()=>{window.__norender=1}")
    F(pg,200);J(pg,"()=>{window.__norender=0}");F(pg,4);print('end',J(pg,st))
    pg.screenshot(path='/tmp/an/fl_%s_res.png'%lv)
    print(J(pg,"()=>JSON.stringify(__ug.prog)"))
    print([e for e in errs if 'ReadPixels' not in e and 'ERR_FAILED' not in e][:8])
    b.close()
