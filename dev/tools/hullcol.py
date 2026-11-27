import os,sys;sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'));from ugenv import *  # пути окружения
import sys;sys.path.insert(0,TOOLS)
from base import *
def F(pg,n=30):pg.evaluate("()=>new Promise(r=>{let n=0;const f=()=>{if(++n>%d)r();else requestAnimationFrame(f)};f()})"%n)
with sync_playwright() as p:
    b,pg,errs=open_page(p,480,270)
    J(pg,"()=>__ug.begin('solo','l3')");pg.wait_for_timeout(1500);J(pg,"()=>{window.__norender=1;window.__dt=1/30}")
    for (x,z,vx,vz) in [(17,0,-8,0),(-17,-40,8,0),(0,-100,0,8),(8,52,-8,0)]:
        J(pg,"()=>{const P=__ug.P;P.iT=1e9;P.pos.set(%f,-4.3,%f);P.vel.set(%f,0,%f)}"%(x,z,vx,vz))
        out=[]
        for k in range(8):
            J(pg,"()=>{const P=__ug.P;P.vel.x=%f;P.vel.z=%f}"%(vx,vz));F(pg,3);out.append(J(pg,"()=>__ug.P.pos.toArray().map(v=>+v.toFixed(2))"))
        print((x,z),out[-1])
    b.close()
