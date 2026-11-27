import os,sys;sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'));from ugenv import *  # пути окружения
import sys,json;sys.path.insert(0,TOOLS)
from base import *
exec(open(TOOLS+'/pep3.py').read().split("mode=sys.argv")[0].split("from base import *")[1])
with sync_playwright() as p:
    b,pg,errs=open_page(p,800,450)
    J(pg,"()=>__ug.begin('solo','l4')");pg.wait_for_timeout(1500);J(pg,"()=>{window.__dt=1/30;window.__norender=1}")
    F(pg,30)
    E(pg,"(()=>{P.iT=1e9;P.pos.set(3,9.05,-112);P.vel.set(0,0,0);story.room=2;story.phase='clear'})()")
    for k in range(10):
        F(pg,20)
        if E(pg,"enemies.some(x=>x.type==='pep')"):break
    run(pg,90,0)
    force(pg,'coin',14,"",19,'n_coin',.05,(5,-116))
    run(pg,8,0);S(pg,'n_coin2',-.05)
    E(pg,"(()=>{const e=enemies.find(x=>x.type==='pep');e.hp=e.maxHp*.6;story.pepPh=2;pepSet(e,'tr12',21);e.inv=true})()")
    run(pg,90,0)
    force(pg,'punch',32,"",24,None,0,(6,-110))
    run(pg,3,0);S(pg,'n_punch',.02)
    force(pg,'leap',34,"",30,'n_leap',.25,(8,-110))
    E(pg,"(()=>{const e=enemies.find(x=>x.type==='pep');e.hp=e.maxHp*.3;pepSet(e,'tr23',41);e.inv=true})()")
    run(pg,160,.1)
    force(pg,'liq',52,"e.beamD=14",70,'n_liq',.05,(-14,-105))
    print([e for e in errs if 'ReadPixels' not in e and 'ERR_FAILED' not in e][:8])
    b.close()
    from PIL import Image
    ims=[Image.open(OUT+'/pt/%s.png'%n).resize((480,270)) for n in shots]
    cols=3;rows=(len(ims)+cols-1)//cols;out=Image.new('RGB',(480*cols,270*rows))
    for k,im in enumerate(ims):out.paste(im,((k%cols)*480,(k//cols)*270))
    out.save(OUT+'/pt/sheet8.png');print(shots)
