import os,sys;sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'));from ugenv import *  # пути окружения
import sys;sys.path.insert(0,TOOLS)
from base import *
with sync_playwright() as p:
    b,pg,errs=open_page(p,900,540)
    J(pg,"()=>__ug.begin('solo','l3')");pg.wait_for_timeout(4500)
    for i,(x,y,z,yaw,pit) in enumerate([(22,-6.5,-30,1.57,.35),(22,-6.5,-30,0,-.1),(22,-5.6,-30,1.57,.05)]):
        J(pg,"()=>{const P=__ug.P;P.iT=1e9;P.pos.set(%f,%f,%f);P.vel.set(0,0,0);P.yaw=%f;P.pitch=%f;window.__frz=1}"%(x,y,z,yaw,pit))
        pg.wait_for_timeout(500);pg.screenshot(path=OUT+'/uw_%d.png'%i)
        print(J(pg,"()=>__eval('[UW&&UW.lq,camera.position.y.toFixed(2),seaH(camera.position.x,camera.position.z,lvT).toFixed(2)]')"))
    J(pg,"()=>{window.__frz=0;__ug.begin('solo','l2')}");pg.wait_for_timeout(4000)
    J(pg,"()=>__eval(`(()=>{const p=pools[0];tideK=1;wetK=1;for(const q of pools){q.y=q.hi;q.m.position.y=q.y;q.m.visible=true}const P=__ug.P;P.iT=1e9;P.pos.set((p.x0+p.x1)/2,p.hi-2.4,(p.z0+p.z1)/2);P.vel.set(0,0,0);P.pitch=.2;window.__frz=1})()`)")
    pg.wait_for_timeout(500);pg.screenshot(path=OUT+'/uw_3.png')
    print(J(pg,"()=>__eval('[UW&&UW.lq,camera.position.y.toFixed(2),pools[0].y]')"))
    print([e for e in errs if 'ReadPixels' not in e and 'ERR_FAILED' not in e][:5])
    b.close()
