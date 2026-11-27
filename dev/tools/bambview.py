import sys;sys.path.insert(0,'/tmp/an')
from base import *
with sync_playwright() as p:
    b,pg,errs=open_page(p,900,600)
    J(pg,"()=>__ug.begin('solo','l3')");pg.wait_for_timeout(4500)
    J(pg,"""()=>__eval(`(()=>{enemies.forEach(e=>e.dead=1);toSpawn.length=0;spawnEnemy('bambun',new V3(0,0,-33));window.__B=enemies[enemies.length-1];spawnEnemy('keto',new V3(3,0,-31));window.__K=enemies[enemies.length-1];
      const P=__ug.P;P.iT=1e9;P.pos.set(0,-.1,-26.4);P.vel.set(0,0,0);P.yaw=.05;P.pitch=-.05;camera.fov=30;camera.updateProjectionMatrix();gunScene.visible=false})()`)""")
    for i,(ac,ry) in enumerate([(0,0),(0,2.4),(2,0.6),(3,-.5)]):
        J(pg,"""()=>__eval(`window.__frz=0;for(const e of [__B,__K]){e.ac=%d;e.st='x';e.vel.set(0,0,0);e.g.rotation.y=%f}`)"""%(ac,ry))
        J(pg,"()=>__eval(`for(let k=0;k<30;k++){bambAnim(__B,1/30)}window.__frz=1;__B.pos.set(0,0,-33);__B.g.position.copy(__B.pos);__B.g.rotation.y=%f`)"%ry)
        pg.wait_for_timeout(400);pg.screenshot(path='/tmp/an/bamb_%d.png'%i)
    print([e for e in errs if 'ReadPixels' not in e and 'ERR_FAILED' not in e][:5])
    b.close()
