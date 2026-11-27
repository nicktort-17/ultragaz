import os,sys;sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'));from ugenv import *  # пути окружения
import sys;sys.path.insert(0,TOOLS)
from base import *
with sync_playwright() as p:
    b,pg,errs=open_page(p,1100,620)
    J(pg,"()=>__ug.begin('solo','l1')");pg.wait_for_timeout(3500)
    J(pg,"()=>__eval(`loadMuscle()`)");pg.wait_for_timeout(2500)
    J(pg,"""()=>__eval(`(()=>{window.__MV=[];const P=__ug.P;enemies.forEach(e=>e.dead=1);P.iT=1e9;const base=P.pos.clone();
      for(let i=0;i<3;i++){const h=buildHero('#3bff6b',{cos:{skin:1}});h.root.position.set(base.x+(i-1)*1.4,base.y,base.z-5.5);h.root.rotation.y=Math.PI+.9;scene.add(h.root);__MV.push(h)}
      P.pitch=-0.05;window.__frz=1;camera.fov=40;camera.updateProjectionMatrix();gunScene.visible=false;document.querySelectorAll('body>div').forEach(d=>{if(!d.querySelector('canvas'))d.style.visibility='hidden'})
      const S=a=>Object.assign({vx:0,vz:0,vy:0,yaw:Math.PI+.9,air:false,slide:false,dash:false,slam:false,pitch:0,hp:100,alive:true,w:1},a);
      for(let k=0;k<60;k++){animHero(__MV[0],S({alive:false,hp:0}),1/30);animHero(__MV[2],S({slam:true,air:true,vy:-40}),1/30);animHero(__MV[1],S({pitch:.4}),1/30)}
      heroPunch(__MV[1]);for(let k=0;k<4;k++)animHero(__MV[1],S({pitch:.4}),1/30)})()`)""")
    pg.wait_for_timeout(300);pg.screenshot(path=OUT+'/md.png')
    print([e for e in errs if 'ReadPixels' not in e and 'ERR_FAILED' not in e][:6])
    b.close()
