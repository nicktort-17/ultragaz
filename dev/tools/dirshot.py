import os,sys;sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'));from ugenv import *  # пути окружения
# Скриншоты нового Генерального директора (models/director.json): состояния визора/рук/нимба и резервуар при разном HP.
#   python dev/tools/dirshot.py        -> dev/out/director/states.jpg, core.jpg
import json
from base import *
from PIL import Image,ImageDraw
E=lambda pg,s:pg.evaluate("(s)=>__eval(s)",s)
def F(pg,n=30):pg.evaluate("()=>new Promise(r=>{let n=0;const f=()=>{if(++n>%d)r();else requestAnimationFrame(f)};f()})"%n)
OD=os.path.join(OUT,'director');os.makedirs(OD,exist_ok=True)
SETUP="""(()=>{P.iT=1e9;story.phase='clear';for(const e of enemies.slice())scene.remove(e.g);enemies.length=0;toSpawn=[];
 P.pos.set(0,P.pos.y,0);const e=makeEnemy('boss',new V3(0,P.pos.y,-12),'tb1');enemies.push(e);e.remote=true;e.cd=99;e.ry=0;e.tgt=e.pos.clone();window.__B=e;(function f(){if(window.__B&&__B.remote){__B.flash-=1/60;bossAnim(__B,1/60)}requestAnimationFrame(f)})();return !!(e.g.userData.boss&&e.g.userData.boss.dir)})()"""
CLEAN="(()=>{for(const o of enemies.slice())if(o!==__B){scene.remove(o.g);enemies.splice(enemies.indexOf(o),1)}toSpawn=[];proj.length=0;"
STATES=[('calm',"e.hp=e.maxHp;e.cd=99;e.dashW=0;e.dashT=0;e.slamS=0;e.lzT=0;e.flash=0;e.ph2=false"),
 ('volley',"e.cd=.2;e.g.userData.boss.kickT=.15"),
 ('windup',"e.cd=99;e.dashW=.25"),
 ('dash',"e.dashW=0;e.dashT=.4;e.vel.set(0,0,30)"),
 ('slam',"e.dashT=0;e.vel.set(0,0,0);e.slamS=2;e.slamT=.2"),
 ('hurt',"e.slamS=0;e.flash=.3"),
 ('rage',"e.flash=0;e.hp=e.maxHp*.35;e.ph2=true"),
 ('rage_laser',"e.lzT=2"),
 ('low_hp',"e.lzT=0;e.hp=e.maxHp*.05")]
with sync_playwright() as p:
    b,pg,errs=open_page(p,960,600)
    J(pg,"()=>__ug.begin('solo','l1')");pg.wait_for_timeout(1500)
    for i in range(60):
        if E(pg,"typeof DIR_T!=='undefined'&&DIR_T&&DIR_T!=='load'"):break
        pg.wait_for_timeout(500)
    print('model loaded:',E(pg,"!!(DIR_T&&DIR_T!=='load')"))
    E(pg,"(()=>{gunScene.visible=false;window.__dt=1/60})()")
    print('boss uses model:',E(pg,SETUP))
    E(pg,"(()=>{P.yaw=0;P.pitch=.12;P.vel.set(0,0,0);window.__Y0=P.pos.y})()")
    shots=[]
    for name,js in STATES:
        E(pg,"(()=>{const e=__B;%s})()"%js);F(pg,40);E(pg,CLEAN+"P.pos.set(0,__Y0+4.2,0);P.vel.set(0,0,0);P.yaw=0;P.pitch=-.02;__B.pos.set(0,__Y0+3,-9);__B.tgt.copy(__B.pos)})()");F(pg,2)
        f=os.path.join(OD,name+'.png');pg.screenshot(path=f);shots.append((name,f))
    # резервуар крупно при разном HP
    core=[]
    for hp in (1,.5,.2,.02):
        E(pg,"(()=>{const e=__B;e.hp=e.maxHp*%f;e.ph2=%s;e.lzT=0;e.flash=0;e.cd=99;e.g.userData.boss.sm=%f;e.pos.set(0,__Y0,-4.2);e.tgt.copy(e.pos)})()"%(hp,'true' if hp<.5 else 'false',1-hp))
        F(pg,30);E(pg,CLEAN+"P.pos.set(0,__Y0+1.2,0);P.vel.set(0,0,0);P.yaw=0;P.pitch=-.02})()");F(pg,2)
        f=os.path.join(OD,'core_%d.png'%int(hp*100));pg.screenshot(path=f);core.append(('HP %d%%'%int(hp*100),f))
    print([e for e in errs if 'ReadPixels' not in e and 'ERR_FAILED' not in e][:6])
    b.close()
def sheet(items,out,cols=3,w=480,h=300):
    rows=(len(items)+cols-1)//cols;o=Image.new('RGB',(cols*w,rows*h));d=ImageDraw.Draw(o)
    for i,(n,f) in enumerate(items):
        im=Image.open(f).convert('RGB').resize((w,h));o.paste(im,(i%cols*w,i//cols*h));d.rectangle([i%cols*w,i//cols*h,i%cols*w+len(n)*7+10,i//cols*h+16],fill=(0,0,0));d.text((i%cols*w+5,i//cols*h+3),n,fill=(255,220,0))
    o.save(out,quality=90);print(out)
sheet(shots,os.path.join(OD,'states.jpg'))
sheet(core,os.path.join(OD,'core.jpg'),cols=4,w=400,h=250)
