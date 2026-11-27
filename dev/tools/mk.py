import os,sys;sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'));from ugenv import *  # пути окружения
import sys;sys.path.insert(0,TOOLS)
from base import *
def F(pg,n=30):pg.evaluate("()=>new Promise(r=>{let n=0;const f=()=>{if(++n>%d)r();else requestAnimationFrame(f)};f()})"%n)
with sync_playwright() as p:
    b,pg,errs=open_page(p,1280,720)
    J(pg,"()=>{__ug.begin('solo','l1')}");pg.wait_for_timeout(1200)
    J(pg,"()=>__eval(`document.getElementById('lvCard').hidden=true;P.pos.set(1.5,0,32);P.yaw=0;P.pitch=-.05;P.iT=1e9`)");F(pg,40);pg.screenshot(path=OUT+'/mk_0.png')
    J(pg,"()=>__eval(`P.yaw=2.6`)");F(pg,8);pg.screenshot(path=OUT+'/mk_1.png')
    J(pg,"()=>__eval(`story.room=0;story.phase='clear';setDoor(doors[1],true);P.pos.set(-3,0,-4);P.yaw=.15;P.pitch=-.12`)");F(pg,40);pg.screenshot(path=OUT+'/mk_2.png')
    J(pg,"()=>__eval(`const p=new V3(0,0,-10);telegraphs.push({m:makeTele(p,false),pos:p,type:'vend',t:.8});const q=new V3(7,0,-12);telegraphs.push({m:makeTele(q,true),pos:q,type:'golem',t:.8})`)");F(pg,22);J(pg,"()=>{window.__frz=1}");F(pg,2);pg.screenshot(path=OUT+'/mk_3.png')
    print([e for e in errs if 'ReadPixels' not in e and 'ERR_FAILED' not in e][:4])
    b.close()
