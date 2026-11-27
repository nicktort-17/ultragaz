import os,sys;sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'));from ugenv import *  # пути окружения
import sys,json;sys.path.insert(0,TOOLS)
from base import *
exec(open(TOOLS+'/pep3.py').read().split("mode=sys.argv")[0].split("from base import *")[1])
with sync_playwright() as p:
    b,pg,errs=open_page(p,800,450)
    J(pg,"()=>__ug.begin('solo','l4')");pg.wait_for_timeout(1500);J(pg,"()=>{window.__dt=1/30;window.__norender=1}")
    F(pg,30)
    E(pg,"(()=>{P.iT=1e9;P.pos.set(3,9.05,-112);P.vel.set(0,0,0);story.room=2;story.phase='clear';story.pepPh=2})()")
    for k in range(10):
        F(pg,20)
        if E(pg,"enemies.some(x=>x.type==='pep')"):break
    run(pg,90,0)
    force(pg,'punch',32,"",27,'i_punch',0,(4,-114))
    run(pg,6,0);S(pg,'i_punch2',0)
    E(pg,"(()=>{const e=enemies.find(x=>x.type==='pep');e.hp=e.maxHp*.3;pepSet(e,'tr23',40);e.inv=true})()")
    run(pg,280,.1)
    for nm,pos in (('j_left',(-16,-108)),('j_right',(17,-111)),('j_far',(0,-104.6))):
        E(pg,"(()=>{const e=enemies.find(x=>x.type==='pep');pepSet(e,'walk3',50);e.cdA=99;P.pos.set(%f,9.05,%f);P.vel.set(0,0,0)})()"%pos)
        run(pg,10,.12);S(pg,nm,.12)
    force(pg,'liq',52,"e.beamD=12",75,'j_liq',.05,(-12,-106))
    force(pg,'crash',51,"e.wv=0",36,'j_crash',.12,(10,-108))
    print([e for e in errs if 'ReadPixels' not in e and 'ERR_FAILED' not in e][:8])
    b.close()
    from PIL import Image
    ims=[Image.open(OUT+'/pt/%s.png'%n).resize((480,270)) for n in shots]
    cols=4;rows=(len(ims)+cols-1)//cols;out=Image.new('RGB',(480*cols,270*rows))
    for k,im in enumerate(ims):out.paste(im,((k%cols)*480,(k//cols)*270))
    out.save(OUT+'/pt/sheet4.png');print(shots)
