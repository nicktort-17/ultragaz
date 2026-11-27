import sys,json;sys.path.insert(0,'/tmp/an')
from base import *
def F(pg,n=30):pg.evaluate("()=>new Promise(r=>{let n=0;const f=()=>{if(++n>%d)r();else requestAnimationFrame(f)};f()})"%n)
E=lambda pg,s:pg.evaluate("()=>__eval(%s)"%json.dumps(s))
with sync_playwright() as p:
    b,pg,errs=open_page(p,640,360)
    J(pg,"()=>__ug.begin('solo','l4')");pg.wait_for_timeout(2500);J(pg,"()=>{window.__dt=1/30;window.__norender=1}");F(pg,8)
    print('boxes',E(pg,"boxes.length"),'level',E(pg,"level.length"))
    for (sx,sz,vx,vz,name) in [(0,-114,0,-8,'fountain N'),(9,-123,-8,0,'fountain E'),(6,-117,-6,-6,'fountain NE'),(jx:=None,0,0,0,'')][:3]:
        E(pg,"(()=>{L4.intro.t=30;L4.intro.hop=1;story.phase='clear';P.iT=1e9;P.pos.set(%f,TERR.h(%f,%f)+.05,%f);P.vel.set(0,0,0)})()"%(sx,sx,sz,sz))
        for k in range(40):
            E(pg,"(()=>{P.vel.x=%f;P.vel.z=%f})()"%(vx,vz));F(pg,1)
        print(name,E(pg,"[P.pos.x.toFixed(2),P.pos.y.toFixed(2),P.pos.z.toFixed(2),Math.hypot(P.pos.x,P.pos.z+123).toFixed(2)].join(',')"))
    t=E(pg,"(()=>{const o=new V3(0,10,-112),d=new V3(0,9.5,-123).sub(o).normalize();ray.set(o,d);ray.far=60;const h=ray.intersectObjects(level,false);return h.length?h[0].distance.toFixed(2):'none'})()")
    print('bullet ray to fountain',t)
    print([e for e in errs if 'ReadPixels' not in e and 'ERR_FAILED' not in e][:5])
    b.close()
