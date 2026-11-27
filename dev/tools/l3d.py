import os,sys;sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'));from ugenv import *  # пути окружения
import sys,json;sys.path.insert(0,TOOLS)
from base import *
def F(pg,n=30):pg.evaluate("()=>new Promise(r=>{let n=0;const f=()=>{if(++n>%d)r();else requestAnimationFrame(f)};f()})"%n)
with sync_playwright() as p:
    b,pg,errs=open_page(p,960,540)
    J(pg,"()=>__ug.begin('solo','l3')");pg.wait_for_timeout(1500)
    J(pg,"()=>{const P=__ug.P;P.pos.set(2,2.5,-93);P.vel.set(0,0,0);P.yaw=.1;P.pitch=-.28;P.iT=1e9;__eval('P.grounded=true');P.iT=1e9;document.getElementById('lvCard').hidden=true}")
    F(pg,20);pg.screenshot(path=OUT+'/d_car.png')
    J(pg,"()=>{__eval('story.room=2;story.phase=\"clear\"');__eval('L3.hatch.want=1');const P=__ug.P;P.pos.set(0,0,-62);P.yaw=0;P.pitch=-.4}");F(pg,80);pg.screenshot(path=OUT+'/d_open.png')
    print([e for e in errs if 'ReadPixels' not in e and 'ERR_FAILED' not in e][:5])
    b.close()
from PIL import Image
ims=[Image.open(OUT+'/d_%s.png'%n).resize((480,270)) for n in ['car','open']]
im=Image.new('RGB',(960,270))
for i,a in enumerate(ims):im.paste(a,(i*480,0))
im.save(OUT+'/d_grid.png')
