import sys;sys.path.insert(0,'/tmp/an')
from base import *
def F(pg,n=30):pg.evaluate("()=>new Promise(r=>{let n=0;const f=()=>{if(++n>%d)r();else requestAnimationFrame(f)};f()})"%n)
with sync_playwright() as p:
    b,pg,errs=open_page(p,640,360)
    J(pg,"()=>__ug.begin('solo','l1')");pg.wait_for_timeout(3000)
    J(pg,"()=>__eval(`const P=__ug.P;P.iT=1e9;P.pos.set(0,0,12);P.yaw=.25;P.pitch=.08;cur=3`)")
    for i in range(12):
        J(pg,"()=>__eval(`enemies.forEach(e=>{e.dead=1;scene.remove(e.g)});toSpawn.length=0;gas=100;camera.getWorldDirection(aim);soda(false)`)");F(pg,2)
    print(J(pg,"""()=>__eval(`(()=>{camera.updateMatrixWorld();const L=SODA.d.filter(d=>!d.dead).sort((a,b)=>b.seq-a.seq).slice(0,8);return JSON.stringify({cam:camera.position.toArray().map(x=>+x.toFixed(2)),mz:muzzle().toArray().map(x=>+x.toFixed(2)),T,lastT:SODA.lastT,msid:SODA.msid,dr:L.map(d=>[d.sid,d.seq,+d.t.toFixed(2),d.p.toArray().map(x=>+x.toFixed(1)),d.p.clone().project(camera).toArray().map(x=>+x.toFixed(2))])})})()`)"""))
    b.close()
