import os,sys;sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'));from ugenv import *  # пути окружения
import sys;sys.path.insert(0,TOOLS)
from base import *
with sync_playwright() as p:
    b,pg,errs=open_page(p,960,540)
    J(pg,"()=>__ug.begin('solo','l3')");pg.wait_for_timeout(1500)
    J(pg,"()=>{__eval('lvT=WAVE_T0+WAVE_PER*3+2.6+1.5');const P=__ug.P;P.iT=1e9;P.pos.set(9,0,-14);P.vel.set(0,0,0);P.yaw=1.05;P.pitch=.05}")
    for i in range(6):
        pg.wait_for_timeout(200);pg.screenshot(path=OUT+'/wv_%d.png'%i)
        print(J(pg,"()=>({lvT:__eval('lvT'),wx:__eval('L3.wave&&L3.wave.position.x'),vis:__eval('L3.wave&&L3.wave.visible'),pv:__ug.P.vel.toArray().map(v=>+v.toFixed(1)),hp:__ug.P.hp})"))
    print([e for e in errs if 'ReadPixels' not in e and 'ERR_FAILED' not in e][:5])
    b.close()
