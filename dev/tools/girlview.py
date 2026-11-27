import os,sys;sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'));from ugenv import *  # пути окружения
import sys;sys.path.insert(0,TOOLS)
from base import *
out=sys.argv[1] if len(sys.argv)>1 else 'gv'
poses=sys.argv[2].split(',') if len(sys.argv)>2 else ['stand','taunt','sulk']
with sync_playwright() as p:
    b,pg,errs=open_page(p,1100,620)
    J(pg,"()=>__ug.begin('solo','l3')");pg.wait_for_timeout(4500)
    J(pg,"""()=>__eval(`(()=>{window.__GV=[];for(const [o,x] of [[ALT_O,-.75],[BEACH_O,.75]]){const G=buildGirl(o);G.g.position.set(x*1.05,0,-32);G.g.rotation.y=0;scene.add(G.g);__GV.push(G)}
      enemies.forEach(e=>e.dead=1);const P=__ug.P;P.iT=1e9;P.pos.set(0,-.1,-26.4);P.vel.set(0,0,0);P.yaw=0;P.pitch=-0.07;window.__frz=1;camera.fov=24;camera.updateProjectionMatrix();gunScene.visible=false;document.querySelectorAll('body>div').forEach(d=>{if(!d.querySelector('canvas'))d.style.visibility='hidden'})})()`)""")
    for i,pose in enumerate(poses):
        for ang,tag in [(0,'f'),(1.1,'s'),(2.6,'b')]:
            J(pg,"""()=>__eval(`for(const G of __GV){G.g.rotation.y=%f;for(let k=0;k<40;k++)girlPose(G,'%s',1/30)}`)"""%(ang,pose))
            pg.wait_for_timeout(350);pg.screenshot(path=OUT+'/%s_%s_%s.png'%(out,pose,tag))
    print('info',J(pg,"()=>__eval('({calls:renderer.info.render.calls,tris:renderer.info.render.triangles,n:__GV.map(G=>{let k=0;G.g.traverse(m=>{if(m.isMesh)k++});return k})})')"))
    print([e for e in errs if 'ReadPixels' not in e and 'ERR_FAILED' not in e][:5])
    b.close()
