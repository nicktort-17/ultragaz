import sys,json;sys.path.insert(0,'/tmp/an')
from base import *
exec(open('/tmp/an/pep3.py').read().split("mode=sys.argv")[0].split("from base import *")[1])
with sync_playwright() as p:
    b,pg,errs=open_page(p,800,450)
    J(pg,"()=>__ug.begin('solo','l4')");pg.wait_for_timeout(1500);J(pg,"()=>{window.__dt=1/30;window.__norender=1}")
    F(pg,30)
    E(pg,"(()=>{P.iT=1e9;P.pos.set(3,9.05,-112);P.vel.set(0,0,0);story.room=2;story.phase='clear';story.pepPh=3})()")
    for k in range(10):
        F(pg,20)
        if E(pg,"enemies.some(x=>x.type==='pep')"):break
    run(pg,200,0)
    E(pg,"(()=>{const e=enemies.find(x=>x.type==='pep');pepSet(e,'walk3',50);e.cdA=99;e.inv=true;P.pos.set(0,9.05,-104.6)})()")
    run(pg,10,.3);S(pg,'m_front',.3)
    E(pg,"P.pos.set(-15,9.05,-108)");run(pg,10,.25);S(pg,'m_side',.25)
    E(pg,"(()=>{const e=enemies.find(x=>x.type==='pep');e.inv=false;pepSet(e,'death',60);e.inv=true;window.__dl=[]})()")
    for k in range(20):
        E(pg,LOOK%.2);F(pg,10);E(pg,"(()=>{const e=enemies.find(x=>x.type==='pep');window.__dl.push(e?[+e.stT.toFixed(2),e.acT&&+e.acT.toFixed(2)]:'gone')})()")
        if k in (3,9,13,17):S(pg,'m_death%d'%k,.2)
    print(E(pg,"JSON.stringify(window.__dl)"))
    print('final',J(pg,"()=>({ph:__ug.story.phase,en:__ug.enemies.length})"))
    print([e for e in errs if 'ReadPixels' not in e and 'ERR_FAILED' not in e][:8])
    b.close()
    from PIL import Image
    ims=[Image.open('/tmp/pt/%s.png'%n).resize((480,270)) for n in shots]
    cols=3;rows=(len(ims)+cols-1)//cols;out=Image.new('RGB',(480*cols,270*rows))
    for k,im in enumerate(ims):out.paste(im,((k%cols)*480,(k//cols)*270))
    out.save('/tmp/pt/sheet7.png');print(shots)
