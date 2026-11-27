import os,sys;sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'));from ugenv import *  # пути окружения
import sys;sys.path.insert(0,TOOLS)
from base import *
def F(pg,n=30):pg.evaluate("()=>new Promise(r=>{let n=0;const f=()=>{if(++n>%d)r();else requestAnimationFrame(f)};f()})"%n)
with sync_playwright() as p:
    b,pg,errs=open_page(p,480,270)
    J(pg,"()=>{window.__norender=1;window.__dt=.033;__ug.begin('solo','l1')}");pg.wait_for_timeout(800)
    tests=[("side wall",0,0,30,44,0),("door slab",-1,0,-15,0,-44),("press hall wall",-12,0,-50,-44,0),("arena wall",0,0,-100,0,44*0)]
    for name,x,y,z,vx,vz in [("side wall",0,0,30,44,0),("closed door",0,0,-15.5,0,-44),("room B west wall",-11,0,-50,-44,0),("pump",-12,0,8,44,0)]:
        res=[]
        for k in range(6):
            J(pg,"()=>{const P=__ug.P;P.pos.set(%f,%f,%f);P.dashDir=new THREE.Vector3(%f,0,%f).normalize();P.vel.set(0,0,0);P.dashT=.16;P.iT=1e9;}"%(x,y,z,vx,vz))
            F(pg,8);res.append([round(v,2) for v in J(pg,"()=>[__ug.P.pos.x,__ug.P.pos.z]")])
        print(name,res)
    print(errs[:3])
    b.close()
