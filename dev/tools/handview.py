import os,sys;sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'));from ugenv import *  # пути окружения
import sys;sys.path.insert(0,TOOLS)
from base import *
with sync_playwright() as p:
    b,pg,errs=open_page(p,900,600)
    J(pg,"()=>__ug.begin('solo','l3')");pg.wait_for_timeout(4500)
    J(pg,"""()=>__eval(`(()=>{window.__GV=[];for(const [o,x] of [[ALT_O,-.75],[BEACH_O,.75]]){const G=buildGirl(o);G.g.position.set(x*1.05,0,-32);scene.add(G.g);__GV.push(G)}
      enemies.forEach(e=>e.dead=1);const P=__ug.P;P.iT=1e9;P.pos.set(0,-.1,-26.4);P.vel.set(0,0,0);window.__frz=1;camera.fov=9;camera.updateProjectionMatrix();gunScene.visible=false})()`)""")
    shots=[('stand',.12,-.13,0.4),('stand',-.08,-.14,0.4),('cheer',.12,.05,0.3),('hold',-.1,-.05,0)]
    for i,(pose,yaw,pit,rot) in enumerate(shots):
        J(pg,"""()=>__eval(`for(const G of __GV){G.g.rotation.y=%f;for(let k=0;k<40;k++)girlPose(G,'%s',1/30)}const P=__ug.P;P.yaw=%f;P.pitch=%f`)"""%(rot,pose,yaw,pit))
        pg.wait_for_timeout(400);pg.screenshot(path=OUT+'/hand_%d.png'%i)
    print([e for e in errs if 'ReadPixels' not in e and 'ERR_FAILED' not in e][:5])
    b.close()
