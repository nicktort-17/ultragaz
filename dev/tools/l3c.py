import os,sys;sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'));from ugenv import *  # пути окружения
import sys,json;sys.path.insert(0,TOOLS)
from base import *
def F(pg,n=30):pg.evaluate("()=>new Promise(r=>{let n=0;const f=()=>{if(++n>%d)r();else requestAnimationFrame(f)};f()})"%n)
with sync_playwright() as p:
    b,pg,errs=open_page(p,960,540)
    J(pg,"()=>__ug.begin('solo','l3')");pg.wait_for_timeout(1500)
    for name,pos,yaw,pitch in [('stern',[0,0,-93],3.14,-.25),('hatch',[0,0,-62],0,-.35),('bow',[0,0,55],3.14,-.2),('dh',[0,0,-40],0,.15)]:
        J(pg,"()=>{const P=__ug.P;P.pos.set(%f,%f,%f);P.vel.set(0,0,0);P.yaw=%f;P.pitch=%f;P.iT=1e9;document.getElementById('lvCard').hidden=true}"%(pos[0],pos[1],pos[2],yaw,pitch))
        F(pg,20);pg.screenshot(path=OUT+'/c_%s.png'%name)
    J(pg,"()=>{__eval('L3.hatch.want=1')}");F(pg,60);J(pg,"()=>{const P=__ug.P;P.pos.set(0,0,-62);P.yaw=0;P.pitch=-.35}");F(pg,5);pg.screenshot(path=OUT+'/c_open.png')
    print([e for e in errs if 'ReadPixels' not in e and 'ERR_FAILED' not in e][:5])
    b.close()
from PIL import Image
ims=[Image.open(OUT+'/c_%s.png'%n).resize((480,270)) for n in ['stern','hatch','open','bow','dh']]
im=Image.new('RGB',(960,810))
for i,a in enumerate(ims):im.paste(a,((i%2)*480,(i//2)*270))
im.save(OUT+'/c_grid.png')
