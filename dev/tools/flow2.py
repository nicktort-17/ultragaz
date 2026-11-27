import sys,json;sys.path.insert(0,'/tmp/an')
from base import *
lv=sys.argv[1];ri=int(sys.argv[2])
def F(pg,n=30):pg.evaluate("()=>new Promise(r=>{let n=0;const f=()=>{if(++n>%d)r();else requestAnimationFrame(f)};f()})"%n)
st="()=>({ph:__ug.story.phase,room:__ug.story.room,wi:__ug.story.wi,en:__ug.enemies.map(e=>e.type+(e.inv?'*':'')+':'+Math.round(e.hp)).join(','),ts:__ug.toSpawn.length,doors:__ug.doors.map(d=>d.open?1:0).join(''),hud:document.getElementById('left').textContent,state:__ug.state,hp:Math.round(__ug.P.hp),bb:document.getElementById('bossBar').hidden?'':document.querySelector('#bossBar .bn').textContent})"
with sync_playwright() as p:
    b,pg,errs=open_page(p,640,360)
    J(pg,"()=>__ug.begin('solo','%s')"%lv);pg.wait_for_timeout(1000)
    J(pg,"()=>{__ug.P.iT=1e9;window.__norender=1;const S=__ug.story;S.room=%d;S.phase='clear'}"%(ri-1))
    J(pg,"()=>{const R=__ug.story.lv.rooms[%d];const P=__ug.P;P.pos.set(R.cp[0],R.cp[1]+.05,(R.trig[2]+R.trig[3])/2);P.vel.set(0,0,0)}"%ri)
    for k in range(40):
        F(pg,40);s=J(pg,st)
        if k%4==0:print(k,s,flush=True)
        if s['ph']!='fight':break
        if k>=4:J(pg,"()=>{for(const e of __ug.enemies){if(e.type==='boss'||e.type==='queen'){if(!e.inv)__ug.damage(e,e.maxHp*.12,99,'x')}else __ug.damage(e,9999,99,'x')}__ug.P.iT=1e9;__ug.P.hp=100}")
    print('after',J(pg,st))
    F(pg,240);print('end',J(pg,st));J(pg,"()=>{window.__norender=0}");F(pg,4)
    pg.screenshot(path='/tmp/an/fl2_%s.png'%lv)
    print(J(pg,"()=>JSON.stringify(__ug.prog)"))
    print([e for e in errs if 'ReadPixels' not in e and 'ERR_FAILED' not in e][:8])
    b.close()
