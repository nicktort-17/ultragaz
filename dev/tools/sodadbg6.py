import sys;sys.path.insert(0,'/tmp/an')
from base import *
def F(pg,n=30):pg.evaluate("()=>new Promise(r=>{let n=0;const f=()=>{if(++n>%d)r();else requestAnimationFrame(f)};f()})"%n)
with sync_playwright() as p:
    b,pg,errs=open_page(p,900,560)
    J(pg,"()=>__ug.begin('solo','l1')");pg.wait_for_timeout(3000)
    J(pg,"()=>__eval(`const P=__ug.P;P.iT=1e9;P.pos.set(0,0,12);P.yaw=.25;P.pitch=.08;cur=3;window.__dt=1/60`)")
    for i in range(30):
        J(pg,"()=>__eval(`enemies.forEach(e=>{e.dead=1;scene.remove(e.g)});toSpawn.length=0;gas=100;camera.getWorldDirection(aim);soda(false)`)");F(pg,5)
    J(pg,"()=>__eval(`window.__frz=1;const m=SODA.mesh;m.material.depthTest=false;m.renderOrder=999`)")
    F(pg,3);pg.screenshot(path='/tmp/an/soda_dbg.png')
    print(J(pg,"()=>__eval(`[SODA.mesh.geometry.drawRange.count,SODA.d.filter(d=>!d.dead).length]`)"))
    b.close()
