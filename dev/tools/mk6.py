import os,sys;sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'));from ugenv import *  # пути окружения
import sys;sys.path.insert(0,TOOLS)
from base import *
def F(pg,n=30):pg.evaluate("()=>new Promise(r=>{let n=0;const f=()=>{if(++n>%d)r();else requestAnimationFrame(f)};f()})"%n)
with sync_playwright() as p:
    b,pg,errs=open_page(p,960,540)
    J(pg,"()=>{__ug.begin('solo','l1')}");pg.wait_for_timeout(1200)
    J(pg,"()=>__eval(`document.getElementById('lvCard').hidden=true;P.pos.set(1.5,0,32);P.yaw=0;P.pitch=-.05;P.iT=1e9`)");F(pg,30);pg.screenshot(path=OUT+'/c_0.png')
    J(pg,"()=>__eval(`story.room=0;story.phase='clear';setDoor(doors[1],true);P.pos.set(-1,0,-6);P.yaw=.05;P.pitch=-.1`)");F(pg,40);pg.screenshot(path=OUT+'/c_1.png')
    J(pg,"()=>{window.__dt=.008;__eval(`P.pos.set(0,0,-2);P.yaw=0;P.pitch=-.2;const p=new V3(-3,0,-11);telegraphs.push({m:makeTele(p,false),pos:p,type:'vend',t:.8});const q=new V3(5,0,-13);telegraphs.push({m:makeTele(q,true),pos:q,type:'golem',t:.8});const z=new V3(-14,4.5,-8);telegraphs.push({m:makeTele(z,false),pos:z,type:'vend',t:.8})`)}");F(pg,50)
    pg.screenshot(path=OUT+'/c_2.png')
    J(pg,"()=>{window.__dt=0;__ug.begin('solo','l2')}");pg.wait_for_timeout(1200)
    J(pg,"()=>{window.__dt=0;__eval(`document.getElementById('lvCard').hidden=true;story.room=1;story.phase='clear';setDoor(doors[2],true);P.pos.set(3,9.7,-58.5);P.yaw=0.1;P.pitch=.05;P.iT=1e9`)}");F(pg,40);pg.screenshot(path=OUT+'/c_3.png')
    print([e for e in errs if 'ReadPixels' not in e and 'ERR_FAILED' not in e][:4])
    b.close()
