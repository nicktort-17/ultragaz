import sys,json;sys.path.insert(0,'/tmp/an')
from base import *
exec(open('/tmp/an/pep3.py').read().split("mode=sys.argv")[0].split("from base import *")[1])
def SP(pg,name,dist,ang,h,aim=0.0):
    # камера: игрок на расстоянии dist под углом ang от фронта босса
    E(pg,"(()=>{const e=enemies.find(x=>x.type==='pep');e.inv=true;const y=e.g.rotation.y+%f;P.pos.set(e.pos.x+Math.sin(y)*%f,9.05,e.pos.z+Math.cos(y)*%f);P.vel.set(0,0,0)})()"%(ang,dist,dist))
    F(pg,2);E(pg,"(()=>{const e=enemies.find(x=>x.type==='pep');const c=new V3(e.pos.x,e.pos.y+%f,e.pos.z);const d=c.clone().sub(new V3(P.pos.x,P.pos.y+1.6,P.pos.z));P.yaw=Math.atan2(-d.x,-d.z);P.pitch=Math.atan2(d.y,Math.hypot(d.x,d.z))})()"%h)
    J(pg,"()=>{window.__norender=0}");F(pg,1);pg.screenshot(path='/tmp/pt/%s.png'%name);J(pg,"()=>{window.__norender=1}");shots.append(name)
with sync_playwright() as p:
    b,pg,errs=open_page(p,960,540)
    J(pg,"()=>__ug.begin('solo','l4')");pg.wait_for_timeout(1500);J(pg,"()=>{window.__dt=1/30;window.__norender=1}")
    F(pg,30)
    E(pg,"(()=>{P.iT=1e9;P.pos.set(3,9.05,-112);P.vel.set(0,0,0);story.room=2;story.phase='clear'})()")
    for k in range(10):
        F(pg,20)
        if E(pg,"enemies.some(x=>x.type==='pep')"):break
    run(pg,90,0)
    E(pg,"(()=>{const e=enemies.find(x=>x.type==='pep');e.inv=true;pepSet(e,'stag1',16)})()");F(pg,10)
    SP(pg,'m_p1',11,.5,3.2)
    E(pg,"(()=>{const e=enemies.find(x=>x.type==='pep');e.hp=e.maxHp*.6;story.pepPh=2;pepSet(e,'tr12',21);e.inv=true})()")
    run(pg,90,0)
    E(pg,"(()=>{const e=enemies.find(x=>x.type==='pep');e.inv=true;pepSet(e,'stag2',37)})()");F(pg,6)
    E(pg,"(()=>{const e=enemies.find(x=>x.type==='pep');pepSet(e,'walk2',30);e.cdA=99})()");F(pg,40)
    SP(pg,'m_p2a',15,.35,5.5)
    SP(pg,'m_p2b',9,0.0,8.5)
    SP(pg,'m_p2c',15,2.6,5.5)
    E(pg,"(()=>{const e=enemies.find(x=>x.type==='pep');e.hp=e.maxHp*.3;story.pepPh=3;pepSet(e,'tr23',41);e.inv=true})()")
    run(pg,170,.1)
    E(pg,"(()=>{const e=enemies.find(x=>x.type==='pep');pepSet(e,'walk3',50);e.cdA=99})()");F(pg,30)
    SP(pg,'m_p3a',22,.3,6)
    SP(pg,'m_p3b',13,0.0,8)
    SP(pg,'m_p3c',22,2.8,7)
    print([e for e in errs if 'ReadPixels' not in e and 'ERR_FAILED' not in e][:8])
    b.close()
    from PIL import Image
    ims=[Image.open('/tmp/pt/%s.png'%n).resize((640,360)) for n in shots]
    cols=3;rows=(len(ims)+cols-1)//cols;out=Image.new('RGB',(640*cols,360*rows))
    for k,im in enumerate(ims):out.paste(im,((k%cols)*640,(k//cols)*360))
    out.save('/tmp/pt/sheet11.png');print(shots)
