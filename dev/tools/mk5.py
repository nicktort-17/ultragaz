import os,sys;sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'));from ugenv import *  # пути окружения
import sys;sys.path.insert(0,TOOLS)
from base import *
def F(pg,n=30):pg.evaluate("()=>new Promise(r=>{let n=0;const f=()=>{if(++n>%d)r();else requestAnimationFrame(f)};f()})"%n)
with sync_playwright() as p:
    b,pg,errs=open_page(p,960,540)
    J(pg,"()=>{__ug.begin('solo','l1')}");pg.wait_for_timeout(1200)
    J(pg,"()=>__eval(`document.getElementById('lvCard').hidden=true;story.room=0;story.phase='clear';P.pos.set(0,0,-2);P.yaw=0;P.pitch=-.2;P.iT=1e9`)");F(pg,10)
    J(pg,"()=>{window.__dt=.008;__eval(`const p=new V3(-2.5,0,-11);telegraphs.push({m:makeTele(p,false),pos:p,type:'vend',t:.8});const q=new V3(4,0,-13);telegraphs.push({m:makeTele(q,true),pos:q,type:'golem',t:.8})`)}");F(pg,50)
    print(J(pg,"()=>__eval(`telegraphs.map(t=>t.t.toFixed(2)+' '+t.m.userData.rm.opacity.toFixed(2)).join()`)"))
    pg.screenshot(path=OUT+'/mk_5.png')
    b.close()
