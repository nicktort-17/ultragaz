import os,sys;sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'));from ugenv import *  # пути окружения
import sys;sys.path.insert(0,TOOLS)
from base import *
with sync_playwright() as p:
    b,pg,errs=open_page(p,900,700)
    J(pg,"()=>__ug.begin('solo','l1')");pg.wait_for_timeout(3500)
    J(pg,"()=>__eval(`loadMuscle()`)");pg.wait_for_timeout(2500)
    J(pg,"""()=>__eval(`(()=>{const P=__ug.P;enemies.forEach(e=>e.dead=1);P.iT=1e9;const base=P.pos.clone();
      const h=buildHero('#ff3b3b',{cos:{skin:1,crest:0,wings:0,pattern:0}});h.root.position.set(base.x,base.y,base.z-3.2);scene.add(h.root);window.__H=h;
      P.pitch=0.12;window.__frz=1;camera.fov=22;camera.updateProjectionMatrix();gunScene.visible=false;document.querySelectorAll('body>div').forEach(d=>{if(!d.querySelector('canvas'))d.style.visibility='hidden'})})()`)""")
    for ang,tag in [(0,'f'),(2.8,'b'),(.7,'s')]:
        J(pg,"()=>__eval(`const h=__H;h.root.rotation.y=%f;for(let k=0;k<60;k++)animHero(h,{vx:0,vz:0,vy:0,yaw:h.root.rotation.y,air:false,slide:false,dash:false,slam:false,pitch:0,hp:100,alive:true,w:0},1/30)`)"%ang)
        pg.wait_for_timeout(300);pg.screenshot(path=OUT+'/mz_%s.png'%tag)
    print([e for e in errs if 'ReadPixels' not in e and 'ERR_FAILED' not in e][:6])
    b.close()
