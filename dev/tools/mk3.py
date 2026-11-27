import os,sys;sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'));from ugenv import *  # пути окружения
import sys;sys.path.insert(0,TOOLS)
from base import *
def F(pg,n=30):pg.evaluate("()=>new Promise(r=>{let n=0;const f=()=>{if(++n>%d)r();else requestAnimationFrame(f)};f()})"%n)
with sync_playwright() as p:
    b,pg,errs=open_page(p,640,360)
    J(pg,"()=>{__ug.begin('solo','l1')}");pg.wait_for_timeout(1200)
    J(pg,"()=>__eval(`document.getElementById('lvCard').hidden=true;P.pos.set(1.5,0,30);P.yaw=0;P.pitch=-.7;P.iT=1e9`)");F(pg,30);pg.screenshot(path=OUT+'/mk_4.png')
    b.close()
