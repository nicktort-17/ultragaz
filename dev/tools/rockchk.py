import sys,json;sys.path.insert(0,'/tmp/an')
from base import *
def F(pg,n=30):pg.evaluate("()=>new Promise(r=>{let n=0;const f=()=>{if(++n>%d)r();else requestAnimationFrame(f)};f()})"%n)
E=lambda pg,s:pg.evaluate("()=>__eval(%s)"%json.dumps(s))
with sync_playwright() as p:
    b,pg,errs=open_page(p,640,360)
    J(pg,"()=>__ug.begin('solo','l4')");pg.wait_for_timeout(2500);J(pg,"()=>{window.__dt=1/30;window.__norender=1}");F(pg,8)
    print(E(pg,"JSON.stringify([[9.4,-21.4],[-13.9,-38],[14.1,-11.3],[-20,32.3],[28.4,29.7]].map(([x,z])=>[x,z,+TERR.base(x,z).toFixed(2),+TERR.h(x,z).toFixed(2)]))"))
    print('boxes',E(pg,"boxes.length"),'level',E(pg,"level.length"))
    # толкаем игрока в камень (9.4,-21.4) с запада
    E(pg,"(()=>{L4.intro.t=30;L4.intro.hop=1;story.phase='clear';P.iT=1e9;P.pos.set(4,TERR.h(4,-21.4)+.1,-21.4);P.vel.set(0,0,0)})()")
    for k in range(40):
        E(pg,"(()=>{P.vel.x=8;P.vel.z=0})()");F(pg,1)
    print('player after push',E(pg,"[P.pos.x.toFixed(2),P.pos.y.toFixed(2),P.pos.z.toFixed(2)].join(',')"))
    t=E(pg,"(()=>{const o=new V3(0,3,-15),d=new V3(9.4,1.5,-21.4).sub(o).normalize();ray.set(o,d);ray.far=60;const h=ray.intersectObjects(level,false);return h.length?h[0].distance.toFixed(2):'none'})()")
    print('bullet ray to rock',t)
    import time;t0=time.time();E(pg,"(()=>{const o=new V3(0,3,-15);for(let i=0;i<200;i++){ray.set(o,new V3(Math.sin(i),-.1,Math.cos(i)).normalize());ray.far=220;ray.intersectObjects(level,false)}})()");print('200 rays ms',int((time.time()-t0)*1000))
    print([e for e in errs if 'ReadPixels' not in e and 'ERR_FAILED' not in e][:5])
    b.close()
