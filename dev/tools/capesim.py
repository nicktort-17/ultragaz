import sys;sys.path.insert(0,'/tmp/an')
from base import *
with sync_playwright() as p:
    b,pg,errs=open_page(p,800,500)
    J(pg,"()=>__eval(`loadMuscle()`)");pg.wait_for_timeout(2500)
    print(J(pg,"""()=>__eval(`(()=>{const h=buildHero('#f33',{cos:{skin:1}});scene.add(h.root);const o=[];
     const mode=%s;
     for(let f=0;f<120;f++){const v=mode<0?0:mode>50?[0,6.1,9.3,11,11.9,12.4,12.7,12.8,12.9,13][Math.min(9,f)]:Math.min(13,f*mode);h.root.position.z-=v/30;const s={vx:0,vz:-v,vy:0,yaw:0,air:false,slide:false,dash:false,slam:false,pitch:0,hp:100,alive:true,w:0};
      animHero(h,s,1/30);if(f%%3==0&&f<50){const C=h.cape,r=h.root.position,i=112*3,j=58*3;o.push(f+': mid '+[(C.p[j+1]-r.y).toFixed(2),(C.p[j+2]-r.z).toFixed(2)]+' bot '+[(C.p[i+1]-r.y).toFixed(2),(C.p[i+2]-r.z).toFixed(2)])}}
     return o.join('\\\\n')})()`)"""%sys.argv[1]))
    b.close()
