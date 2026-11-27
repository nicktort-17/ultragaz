import os,sys;sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'));from ugenv import *  # пути окружения
import sys,json;sys.path.insert(0,TOOLS)
from base import *
def F(pg,n=30):pg.evaluate("()=>new Promise(r=>{let n=0;const f=()=>{if(++n>%d)r();else requestAnimationFrame(f)};f()})"%n)
E=lambda pg,s:pg.evaluate("()=>__eval(%s)"%json.dumps(s))
views=json.load(open(sys.argv[1]));out=sys.argv[2];W=int(sys.argv[3]) if len(sys.argv)>3 else 640
with sync_playwright() as p:
    b,pg,errs=open_page(p,W,W*9//16)
    J(pg,"()=>__ug.begin('solo','l4')");pg.wait_for_timeout(2500);J(pg,"()=>{window.__dt=1/30;window.__norender=1}");F(pg,8)
    E(pg,"(()=>{P.iT=1e9;story.phase='clear';for(const e of enemies.slice())e.hp=0;enemies.length=0;L4.intro.t=30;L4.intro.hop=1;gunScene.visible=false;for(const c of gunScene.children)c.visible=false;L4.car.visible=false;for(const el of document.body.children)if(el.tagName!=='CANVAS'&&!el.querySelector('canvas'))el.style.visibility='hidden';for(const el of document.querySelectorAll('.hud'))el.style.visibility='hidden'})()")
    names=[]
    for v in views:
        n,x,y,z,yaw,pit=v
        if y>=100: y=E(pg,"TERR.h(%f,%f)"%(x,z))+y-100
        E(pg,"(()=>{for(const e of enemies)scene.remove(e.g);enemies.length=0;P.pos.set(%f,%f,%f);P.vel.set(0,0,0);P.yaw=%f*Math.PI/180;P.pitch=%f*Math.PI/180;P.iT=1e9})()"%(x,y,z,yaw,pit))
        J(pg,"()=>{window.__norender=0}");F(pg,2);E(pg,"(()=>{P.pos.set(%f,%f,%f);P.vel.set(0,0,0)})()"%(x,y,z));F(pg,1)
        pg.screenshot(path=OUT+'/tour/%s.png'%n);J(pg,"()=>{window.__norender=1}");names.append(n)
    print([e for e in errs if 'ReadPixels' not in e and 'ERR_FAILED' not in e][:5])
    b.close()
from PIL import Image,ImageDraw,ImageFont
import os
FN=next((f for f in FONTS if os.path.exists(f)),None)
FT=ImageFont.truetype(FN,14) if FN else None
ims=[Image.open(OUT+'/tour/%s.png'%n).resize((480,270)) for n in names]
cols=3;rows=(len(ims)+cols-1)//cols;o=Image.new('RGB',(480*cols,270*rows))
for k,im in enumerate(ims):
    d=ImageDraw.Draw(im);d.rectangle((0,0,8+9*len(names[k]),20),fill=(0,0,0));d.text((4,2),names[k],fill=(255,255,0),font=FT)
    o.paste(im,((k%cols)*480,(k//cols)*270))
o.save(out);print(out,len(names))
