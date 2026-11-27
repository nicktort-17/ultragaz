import os,sys;sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'));from ugenv import *  # пути окружения
import sys,json;sys.path.insert(0,TOOLS)
from base import *
exec(open(TOOLS+'/pep3.py').read().split("mode=sys.argv")[0].split("from base import *")[1])
with sync_playwright() as p:
    b,pg,errs=open_page(p,800,450)
    J(pg,"()=>__ug.begin('solo','l4')");pg.wait_for_timeout(1500);J(pg,"()=>{window.__dt=1/30;window.__norender=1}")
    F(pg,30)
    E(pg,"(()=>{P.iT=1e9;P.pos.set(3,9.05,-112);P.vel.set(0,0,0);story.room=2;story.phase='clear';story.pepPh=3})()")
    for k in range(10):
        F(pg,20)
        if E(pg,"enemies.some(x=>x.type==='pep')"):break
    run(pg,170,.1)
    force(pg,'death',60,"e.inv=true",130,None,.1,(3,-104.8))
    E(pg,"(()=>{const e=enemies.find(x=>x.type==='pep');P.pos.set(e.pos.x+3,9.05,e.pos.z+7)})()")
    run(pg,30,0);S(pg,'g0',-.05)
    E(pg,"(()=>{const e=enemies.find(x=>x.type==='pep');damage(e,50,5,'rev')})()")
    for k,n in enumerate((2,4,8,14)):
        F(pg,n);S(pg,'g%d'%(k+1),-.05)
    print([e for e in errs if 'ReadPixels' not in e and 'ERR_FAILED' not in e][:8])
    b.close()
    from PIL import Image
    ims=[Image.open(OUT+'/pt/%s.png'%n).resize((400,225)) for n in shots]
    out=Image.new('RGB',(400*len(ims),225))
    for k,im in enumerate(ims):out.paste(im,(k*400,0))
    out.save(OUT+'/pt/sheet10.png');print(shots)
