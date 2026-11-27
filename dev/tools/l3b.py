import os,sys;sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'));from ugenv import *  # пути окружения
import sys,json;sys.path.insert(0,TOOLS)
from base import *
with sync_playwright() as p:
    b,pg,errs=open_page(p,1280,720)
    J(pg,"()=>__ug.begin('solo','l3')");pg.wait_for_timeout(2000)
    J(pg,"()=>{const P=__ug.P;P.pos.set(12,0,-23);P.vel.set(0,0,0);P.yaw=-1.57;P.pitch=-.3;P.iT=1e9}")
    pg.wait_for_timeout(1500)
    print(J(pg,"()=>{const q=__eval('L3.q');return {st:q.st,pos:q.pos.toArray().map(v=>+v.toFixed(2)),gp:q.G.g.position.toArray().map(v=>+v.toFixed(2)),vis:q.G.g.visible,par:!!q.G.g.parent,inMap:q.G.g.parent===__eval('mapGroup')}}"))
    pg.screenshot(path=OUT+'/l3_girl.png')
    print('err',[e for e in errs if 'ReadPixels' not in e and 'ERR_FAILED' not in e][:8])
    b.close()
