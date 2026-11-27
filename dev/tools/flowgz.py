import os,sys;sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'));from ugenv import *  # пути окружения
import sys,json;sys.path.insert(0,TOOLS)
from base import *
def F(pg,n=30):pg.evaluate("()=>new Promise(r=>{let n=0;const f=()=>{if(++n>%d)r();else requestAnimationFrame(f)};f()})"%n)
st="()=>({ph:__ug.story.phase,room:__ug.story.room,en:__ug.enemies.filter(e=>!e.dead).map(e=>e.type).join(','),mode:__eval('GZ.mode'),cut:__eval('!!GZ.cut'),state:__ug.state})"
with sync_playwright() as p:
    b,pg,errs=open_page(p,640,360)
    for lv in ['l2']:
        J(pg,"()=>__ug.begin('solo','%s')"%lv);pg.wait_for_timeout(1500)
        J(pg,"()=>{__ug.P.iT=1e9;window.__norender=1;window.__dt=1/30}")
        L=J(pg,"()=>__ug.story.lv.rooms.length")
        for ri in range(L):
            J(pg,"()=>{const R=__ug.story.lv.rooms[%d];const P=__ug.P;P.pos.set((R.trig[0]+R.trig[1])/2+3,R.cp[1]+.05,(R.trig[2]+R.trig[3])/2);P.vel.set(0,0,0);P.iT=1e9}"%ri)
            F(pg,10)
            for k in range(90):
                F(pg,30);s=J(pg,st)
                if s['ph']!='fight':break
                J(pg,"()=>{for(const e of __ug.enemies){if(e.dead)continue;if(e.type==='boss'||e.type==='queen'){if(!e.inv)__ug.damage(e,e.hp*.34+1,99,'x')}else __ug.damage(e,9999,99,'x')}__ug.P.iT=1e9;if(__ug.story.lv.id==='l2'&&Math.random()<.25)__eval('drainT=8')}")
            print(lv,'room',ri,J(pg,st))
        ex=J(pg,"()=>__ug.story.lv.exitTrig")
        J(pg,"()=>{const t=__ug.story.lv.exitTrig;__ug.P.pos.set((t[0]+t[1])/2,(t[4]||0)+.05,(t[2]+t[3])/2);__ug.P.vel.set(0,0,0)}");F(pg,20)
        print(lv,'at exit',J(pg,st))
        if lv=='l1':
            J(pg,"()=>__eval(`P.pos.set(0,1.1,-131.6)`)");F(pg,15);print('pick',J(pg,st))
            J(pg,"()=>{const t=__ug.story.lv.exitTrig;__ug.P.pos.set((t[0]+t[1])/2,(t[4]||0)+.05,(t[2]+t[3])/2)}");F(pg,20);print(lv,'at exit 2',J(pg,st))
    print([e for e in errs if 'ReadPixels' not in e and 'ERR_FAILED' not in e][:8])
    b.close()
