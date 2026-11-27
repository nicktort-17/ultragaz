import sys;sys.path.insert(0,'/tmp/an')
from base import *
def F(pg,n=30):pg.evaluate("()=>new Promise(r=>{let n=0;const f=()=>{if(++n>%d)r();else requestAnimationFrame(f)};f()})"%n)
with sync_playwright() as p:
    b,pg,errs=open_page(p,900,560)
    J(pg,"()=>__ug.begin('solo','l1')");pg.wait_for_timeout(3000)
    J(pg,"()=>__eval(`const P=__ug.P;P.iT=1e9;P.pos.set(0,0,12);P.yaw=.25;P.pitch=.08;cur=3`)")
    for i in range(20):
        J(pg,"()=>__eval(`enemies.forEach(e=>{e.dead=1;scene.remove(e.g)});toSpawn.length=0;gas=100;camera.getWorldDirection(aim);soda(false)`)");F(pg,2)
    J(pg,"()=>__eval(`const mm=new THREE.MeshBasicMaterial({color:0x00ff00,side:THREE.DoubleSide});mm.uniforms={uT:{value:0}};SODA.mesh.material=mm`)")
    for i in range(10):
        J(pg,"()=>__eval(`gas=100;camera.getWorldDirection(aim);soda(false)`)");F(pg,2)
    pg.screenshot(path='/tmp/an/soda_dbg.png')
    b.close()
