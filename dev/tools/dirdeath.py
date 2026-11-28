import os,sys;sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'));from ugenv import *  # пути окружения
# Смерть Директора («Ликвидация»): кадры перегрузки, взрыва и разлёта обломков -> dev/out/director/death.jpg
from base import *
from PIL import Image,ImageDraw
E=lambda pg,s:pg.evaluate("(s)=>__eval(s)",s)
def F(pg,n=30):pg.evaluate("()=>new Promise(r=>{let n=0;const f=()=>{if(++n>%d)r();else requestAnimationFrame(f)};f()})"%n)
OD=os.path.join(OUT,'director');os.makedirs(OD,exist_ok=True)
CAM="(()=>{for(const o of enemies.slice())if(o.type!=='boss'){scene.remove(o.g);enemies.splice(enemies.indexOf(o),1)}toSpawn=[];proj.length=0;P.iT=1e9;P.hp=100;P.pos.set(0,__Y0+3.2,5.5);P.vel.set(0,0,0);P.yaw=0;P.pitch=-.05})()"
with sync_playwright() as p:
    b,pg,errs=open_page(p,960,600)
    J(pg,"()=>__ug.begin('solo','l1')");pg.wait_for_timeout(1500)
    for i in range(60):
        if E(pg,"!!(DIR_T&&DIR_T!=='load')"):break
        pg.wait_for_timeout(500)
    E(pg,"(()=>{gunScene.visible=false;window.__dt=1/60;window.__Y0=P.pos.y;story.phase='clear';for(const e of enemies.slice())scene.remove(e.g);enemies.length=0;const e=makeEnemy('boss',new V3(0,P.pos.y,-3),'tb1');enemies.push(e);e.cd=99;e.cdD=99;e.cdS=99;e.hp=e.maxHp*.03;e.finDone=true;window.__B=e})()")
    for i in range(40):F(pg,3);E(pg,CAM+";__B.pos.set(0,__Y0+3,-3);__B.vel.set(0,0,0);__B.cd=99;__B.cdD=99;__B.cdS=99;__B.cdL=99;__B.cdR=99")
    shots=[]
    def snap(n):E(pg,CAM);F(pg,1);f=os.path.join(OD,'death_%s.png'%n);pg.screenshot(path=f);shots.append((n,f))
    snap('0_low_hp')
    E(pg,"(()=>{__ug.damage(__B,__B.maxHp+999,99,'x2')})()")
    t=0
    for tt in (.3,.9,1.5,1.85,2.0,2.5,3.2,5.0):
        F(pg,max(1,int((tt-t)*60)));t=tt;snap('%.2fs'%tt)
    print('dead objects:',E(pg,"DIR_DEAD.length"),'parts:',E(pg,"DIR_DEAD[0]&&DIR_DEAD[0].parts.length"),'caps:',E(pg,"DIR_DEAD[0]&&DIR_DEAD[0].caps.length"))
    print('errors:',[e for e in errs if 'ReadPixels' not in e and 'ERR_FAILED' not in e and 'CONNECTION_REFUSED' not in e][:6])
    b.close()
w,h=400,250;o=Image.new('RGB',(3*w,3*h));d=ImageDraw.Draw(o)
for i,(n,f) in enumerate(shots):o.paste(Image.open(f).convert('RGB').resize((w,h)),(i%3*w,i//3*h));d.rectangle([i%3*w,i//3*h,i%3*w+90,i//3*h+16],fill=(0,0,0));d.text((i%3*w+4,i//3*h+3),n,fill=(255,220,0))
o.save(os.path.join(OD,'death.jpg'),quality=90);print(os.path.join(OD,'death.jpg'))
