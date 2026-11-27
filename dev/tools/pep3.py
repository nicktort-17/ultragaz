import os,sys;sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'));from ugenv import *  # пути окружения
import sys,json;sys.path.insert(0,TOOLS)
from base import *
def F(pg,n=30):pg.evaluate("()=>new Promise(r=>{let n=0;const f=()=>{if(++n>%d)r();else requestAnimationFrame(f)};f()})"%n)
E=lambda pg,s:pg.evaluate("()=>__eval(%s)"%json.dumps(s))
LOOK="(()=>{const e=enemies.find(x=>x.type==='pep');P.iT=1e9;P.hp=100;const c=e?center(e,new V3()):new V3(0,12,-129);const d=c.clone().sub(new V3(P.pos.x,P.pos.y+1.6,P.pos.z));P.yaw=Math.atan2(-d.x,-d.z);P.pitch=Math.atan2(d.y,Math.hypot(d.x,d.z))+%f})()"
shots=[]
NR="window.__norender=%d"
def S(pg,name,pit=0.0):
    E(pg,LOOK%pit);J(pg,"()=>{window.__norender=0}");F(pg,1);pg.screenshot(path=OUT+'/pt/%s.png'%name);J(pg,"()=>{window.__norender=1}");shots.append(name)
def run(pg,frames,pit):
    for k in range(frames//10):E(pg,LOOK%pit);F(pg,10)
def force(pg,st,ac,extra='',frames=30,name=None,pit=0.0,ppos=None):
    if ppos:E(pg,"P.pos.set(%f,9.05,%f);P.vel.set(0,0,0)"%ppos)
    E(pg,"(()=>{const e=enemies.find(x=>x.type==='pep');e.inv=false;pepSet(e,'%s',%d);%s})()"%(st,ac,extra))
    run(pg,frames,pit)
    if name:S(pg,name,pit)
mode=sys.argv[1] if len(sys.argv)>1 else '3'
with sync_playwright() as p:
    b,pg,errs=open_page(p,800,450)
    J(pg,"()=>__ug.begin('solo','l4')");pg.wait_for_timeout(1500);J(pg,"()=>{window.__dt=1/30;window.__norender=1}")
    F(pg,30)
    E(pg,"(()=>{P.iT=1e9;P.pos.set(3,9.05,-104.8);P.vel.set(0,0,0);story.room=2;story.phase='clear';story.pepPh=%s})()"%mode)
    for k in range(10):
        F(pg,20)
        if E(pg,"enemies.some(x=>x.type==='pep')"):break
        E(pg,"P.pos.set(3,9.05,-112)")
    run(pg,170,.1)
    E(pg,"P.pos.set(3,9.05,-104.8)")
    S(pg,'h_ck',.1)
    if mode=='3':
        force(pg,'crash',51,"e.wv=0",50,'h_crash',.12)
        run(pg,20,.12);S(pg,'h_crash2',.05)
        force(pg,'liq',52,"e.beamD=12",20,'h_liq0',.05)
        run(pg,40,.05);S(pg,'h_liq',.05)
        force(pg,'rain',53,"e.rkN=0",40,'h_rain',.2)
        run(pg,20,.05);S(pg,'h_rain2',.0)
        force(pg,'stab',54,"e.sn=0",14,'h_stab',.1)
        run(pg,10,.1);S(pg,'h_stab2',.0)
        force(pg,'core',55,"e.coreDmg=0",60,'h_core',.1)
        run(pg,130,.1);S(pg,'h_core2',.1)
        force(pg,'death',60,"e.inv=true",30,'h_death1',.1)
        run(pg,60,.1);S(pg,'h_death2',.1)
        run(pg,90,.1);S(pg,'h_death3',.1)
        run(pg,40,.1);S(pg,'h_death4',.1)
        print('final',J(pg,"()=>({ph:__ug.story.phase,en:__ug.enemies.length})"))
    print([e for e in errs if 'ReadPixels' not in e and 'ERR_FAILED' not in e][:8])
    b.close()
    from PIL import Image
    ims=[Image.open(OUT+'/pt/%s.png'%n).resize((480,270)) for n in shots]
    cols=4;rows=(len(ims)+cols-1)//cols;out=Image.new('RGB',(480*cols,270*rows))
    for k,im in enumerate(ims):out.paste(im,((k%cols)*480,(k//cols)*270))
    out.save(OUT+'/pt/sheet3.png');print(shots)
