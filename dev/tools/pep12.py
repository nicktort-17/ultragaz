import os,sys;sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'));from ugenv import *  # пути окружения
import sys,json;sys.path.insert(0,TOOLS)
from base import *
exec(open(TOOLS+'/pep3.py').read().split("mode=sys.argv")[0].split("from base import *")[1])
exec(open(TOOLS+'/pep11.py').read().split("with sync_playwright")[0].split("exec(open")[1].split("\n",1)[1])
with sync_playwright() as p:
    b,pg,errs=open_page(p,960,540)
    J(pg,"()=>__ug.begin('solo','l4')");pg.wait_for_timeout(1500);J(pg,"()=>{window.__dt=1/30;window.__norender=1}")
    F(pg,30)
    E(pg,"(()=>{P.iT=1e9;P.pos.set(3,9.05,-112);P.vel.set(0,0,0);story.room=2;story.phase='clear'})()")
    for k in range(10):
        F(pg,20)
        if E(pg,"enemies.some(x=>x.type==='pep')"):break
    run(pg,90,0)
    E(pg,"(()=>{const e=enemies.find(x=>x.type==='pep');e.inv=true;e.hp=e.maxHp*.68;pepSet(e,'tr12',20)})()")
    for k,fr in enumerate((40,30,40,40,40)):
        F(pg,fr);SP(pg,'t%d'%k,13,.2,5)
    E(pg,"(()=>{const e=enemies.find(x=>x.type==='pep');pepSet(e,'walk2',30);e.cdA=99;e.g.rotation.y=0;e.pos.set(0,9,-122)})()");F(pg,20)
    SP(pg,'t_head',6.5,.0,9.5)
    print([e for e in errs if 'ReadPixels' not in e and 'ERR_FAILED' not in e][:8])
    b.close()
    from PIL import Image
    ims=[Image.open(OUT+'/pt/%s.png'%n).resize((640,360)) for n in shots]
    cols=3;rows=(len(ims)+cols-1)//cols;out=Image.new('RGB',(640*cols,360*rows))
    for k,im in enumerate(ims):out.paste(im,((k%cols)*640,(k//cols)*360))
    out.save(OUT+'/pt/sheet12.png');print(shots)
