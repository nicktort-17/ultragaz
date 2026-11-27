import os,sys;sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'));from ugenv import *  # пути окружения
import sys;sys.path.insert(0,TOOLS)
from base import *
out=sys.argv[1] if len(sys.argv)>1 else 'mv'
with sync_playwright() as p:
    b,pg,errs=open_page(p,1100,620)
    J(pg,"()=>__ug.begin('solo','l1')");pg.wait_for_timeout(3500)
    J(pg,"()=>__eval(`loadMuscle()`)");pg.wait_for_timeout(2500)
    print(J(pg,"()=>__eval(`String(MUSCLE_T&&MUSCLE_T.type)`)"))
    J(pg,"""()=>__eval(`(()=>{window.__MV=[];const P=__ug.P;enemies.forEach(e=>e.dead=1);P.iT=1e9;
      const base=P.pos.clone();window.__B=base;
      for(let i=0;i<3;i++){const h=buildHero('#ff3b3b',{cos:{skin:1,crest:0,wings:0,pattern:0}});h.root.position.set(base.x+(i-1)*1.3,base.y,base.z-5.5);h.root.rotation.y=Math.PI;scene.add(h.root);__MV.push(h)}
      P.pitch=-0.05;window.__frz=1;camera.fov=40;camera.updateProjectionMatrix();gunScene.visible=false;document.querySelectorAll('body>div').forEach(d=>{if(!d.querySelector('canvas'))d.style.visibility='hidden'})})()`)""")
    def st(over):
        return "Object.assign({vx:0,vz:0,vy:0,yaw:Math.PI,air:false,slide:false,dash:false,slam:false,pitch:0,hp:100,alive:true,w:0},%s)"%over
    tests=[('idle',['{}','{}','{}'],0),('run',['{vz:9}','{vz:9}','{vz:9}'],[0,1.2,2.4]),('mix',['{air:true,vy:4}','{slide:true,vz:18}','{dash:true,vz:30}'],0)]
    for name,sts,ph in tests:
        for ang,tag in [(0,'f'),(1.3,'s'),(3.0,'b')]:
            js="for(let i=0;i<3;i++){const h=__MV[i];h.root.rotation.y=Math.PI+%f;const s=%s;s.yaw=h.root.rotation.y;const v=s.vz||0;s.vx=-Math.sin(s.yaw)*v;s.vz=-Math.cos(s.yaw)*v;for(let k=0;k<50;k++){h.root.position.x+=s.vx/30*0;animHero(h,s,1/30)}%s}"%(ang,'%s',"if(%s)h.ph=%s;" % ('1' if isinstance(ph,list) else '0', '[0,1.2,2.4][i]' if isinstance(ph,list) else '0'))
            js2="const SS=[%s];"%(",".join(st(x) for x in sts))+js.replace("const s=%s","const s=SS[i]")
            J(pg,"()=>__eval(`%s`)"%js2.replace('`','\\`'))
            pg.wait_for_timeout(300);pg.screenshot(path=OUT+'/%s_%s_%s.png'%(out,name,tag))
    # плащ: снять
    J(pg,"()=>__eval(`for(const h of __MV){h.root.rotation.y=Math.PI+2.6}capeToggle(__MV[1]);capeToggle(__MV[2]);for(let k=0;k<14;k++)for(const h of __MV)animHero(h,{vx:0,vz:0,vy:0,yaw:h.root.rotation.y,air:false,slide:false,dash:false,slam:false,pitch:0,hp:100,alive:true,w:0},1/30);for(let k=0;k<40;k++)animHero(__MV[2],{vx:0,vz:0,vy:0,yaw:0,air:false,slide:false,dash:false,slam:false,pitch:0,hp:100,alive:true,w:0},1/30)`)")
    pg.wait_for_timeout(300);pg.screenshot(path=OUT+'/%s_cape.png'%out)
    print('info',J(pg,"()=>__eval('({calls:renderer.info.render.calls,tris:renderer.info.render.triangles})')"))
    print([e for e in errs if 'ReadPixels' not in e and 'ERR_FAILED' not in e][:6])
    b.close()
