import sys,json;sys.path.insert(0,'/tmp/an')
from base import *
shots=[('bow',[0,0,50],0,-.05),('salon',[0,0,26],0,-.08),('salon2',[5,0,4],2.6,-.05),('prom',[0,0,-1],0,-.05),('prom_side',[11,0,-22],-1.57,-.12),('aft',[0,0,-57],0,-.08),('stern',[3,1,-93],3.0,-.1),('side_out',[-11.5,0,-40],-1.2,-.05)]
with sync_playwright() as p:
    b,pg,errs=open_page(p,1280,720)
    J(pg,"()=>__ug.begin('solo','l3')");pg.wait_for_timeout(2500)
    print('err0',[e for e in errs if 'ReadPixels' not in e][:6])
    print(J(pg,"()=>({lv:__ug.story&&__ug.story.lv.id,boxes:__ug.boxes.length,L3:!!__eval('L3'),kegs:__eval('L3.kegs.length'),q:__eval('L3.q&&L3.q.st'),pos:__ug.P.pos.toArray()})"))
    for name,pos,yaw,pitch in shots:
        J(pg,"()=>{const P=__ug.P;P.pos.set(%f,%f,%f);P.vel.set(0,0,0);P.yaw=%f;P.pitch=%f;P.iT=1e9}"%(pos[0],pos[1],pos[2],yaw,pitch))
        pg.wait_for_timeout(700)
        pg.screenshot(path='/tmp/an/l3_%s.png'%name)
    print('err',[e for e in errs if 'ReadPixels' not in e][:8])
    b.close()
