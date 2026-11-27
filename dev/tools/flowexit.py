import sys,json;sys.path.insert(0,'/tmp/an')
from base import *
def F(pg,n=30):pg.evaluate("()=>new Promise(r=>{let n=0;const f=()=>{if(++n>%d)r();else requestAnimationFrame(f)};f()})"%n)
st="()=>({ph:__ug.story.phase,room:__ug.story.room,en:__ug.enemies.map(e=>e.type).join(','),doors:__ug.doors.map(d=>d.open?1:0).join(''),hud:document.getElementById('left').textContent,state:__ug.state,mark:document.getElementById('objm')?document.getElementById('objm').textContent:null})"
with sync_playwright() as p:
    b,pg,errs=open_page(p,480,270)
    for lv in ['l1','l2','l3']:
        J(pg,"()=>__ug.begin('solo','%s')"%lv);pg.wait_for_timeout(1000)
        J(pg,"()=>{__ug.P.iT=1e9;window.__norender=1;const S=__ug.story;S.room=1;S.phase='clear';const R=S.lv.rooms[2];__ug.P.pos.set(R.cp[0],R.cp[1]+.05,(R.trig[2]+R.trig[3])/2)}")
        for k in range(40):
            F(pg,30);s=J(pg,st)
            if s['ph']!='fight' and k>2:break
            J(pg,"()=>{for(const e of __ug.enemies){if(!e.inv)__ug.damage(e,e.maxHp*.3+50,99,'x')}__ug.P.iT=1e9;__ug.P.hp=100}")
        F(pg,60);print(lv,'after boss',J(pg,st))
        J(pg,"()=>{window.__norender=0}");F(pg,3);pg.screenshot(path='/tmp/an/exit_%s.png'%lv);J(pg,"()=>{window.__norender=1}")
        if lv=='l3':J(pg,"()=>{__ug.P.pos.set(3,-3.5,-100);__ug.P.vel.set(0,0,0)}")
        else:J(pg,"()=>{const e=__ug.story.lv.exitTrig;__ug.P.pos.set(0,e[4]+.05,(e[2]+e[3])/2);__ug.P.vel.set(0,0,0)}")
        F(pg,40);print(lv,'at exit',J(pg,st));F(pg,240);print(lv,'end',J(pg,st)['state'])
    print([e for e in errs if 'ReadPixels' not in e and 'ERR_FAILED' not in e][:5])
    b.close()
