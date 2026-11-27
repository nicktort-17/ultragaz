import sys,json;sys.path.insert(0,'/tmp/an')
from base import *
shots={'l1':[('start',[0,0,30],0,-.05),('roomA',[0,0,-12],3.14,-.05),('press',[-8,0,-33],0,-.08),('carousel',[0,0,-91],0,-.05)],
       'l2':[('start',[0,3.2,29],0,-.1),('pump',[0,3.2,-14],3.14,-.1),('res',[0,3.2,-30.2],0,-.15),('heart',[8,2.8,-82],.4,-.12)]}
with sync_playwright() as p:
    b,pg,errs=open_page(p,960,540)
    for lv in ['l1','l2']:
        J(pg,"()=>__ug.begin('solo','%s')"%lv);pg.wait_for_timeout(1800)
        J(pg,"()=>{document.getElementById('lvCard').hidden=true}")
        for name,pos,yaw,pitch in shots[lv]:
            J(pg,"()=>{const P=__ug.P;P.pos.set(%f,%f,%f);P.vel.set(0,0,0);P.yaw=%f;P.pitch=%f;P.iT=1e9}"%(pos[0],pos[1],pos[2],yaw,pitch))
            pg.wait_for_timeout(600);pg.screenshot(path='/tmp/an/p_%s_%s.png'%(lv,name))
    print('err',[e for e in errs if 'ReadPixels' not in e and 'ERR_FAILED' not in e][:8])
    b.close()
from PIL import Image
names=[('l1',n[0]) for n in shots['l1']]+[('l2',n[0]) for n in shots['l2']]
ims=[Image.open('/tmp/an/p_%s_%s.png'%k).resize((480,270)) for k in names]
im=Image.new('RGB',(960,1080))
for i,a in enumerate(ims):im.paste(a,((i%2)*480,(i//2)*270))
im.save('/tmp/an/l12_all.png')
