import os,sys;sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'));from ugenv import *  # пути окружения
import sys;sys.path.insert(0,TOOLS)
from base import *
def F(pg,n=30):pg.evaluate("()=>new Promise(r=>{let n=0;const f=()=>{if(++n>%d)r();else requestAnimationFrame(f)};f()})"%n)
with sync_playwright() as p:
    b,pg,errs=open_page(p,800,480)
    J(pg,"()=>__ug.begin('solo','l3')");pg.wait_for_timeout(1500)
    J(pg,"()=>{__ug.P.iT=1e9;const S=__ug.story;S.room=1;S.phase='clear';const P=__ug.P;P.pos.set(0,0,-62);P.vel.set(0,0,0)}")
    for k in range(40):
        F(pg,20);s=J(pg,"()=>{const e=__ug.enemies.find(x=>x.type==='alt');return e&&e.st}")
        if s and s!='intro':break
    print('alt',s)
    # профилирование кадров с обёрткой функций
    J(pg,"""()=>{window.__ft=[];let last=performance.now();const f=()=>{const n=performance.now();__ft.push([+(n-last).toFixed(0),__eval('(enemies.find(x=>x.type==="alt")||{}).ac')]);last=n;if(__ft.length<120)requestAnimationFrame(f)};requestAnimationFrame(f);
     __eval(`const e=enemies.find(x=>x.type==='alt');e.hp=e.maxHp*.5;P.iT=1e9`)}""")
    pg.wait_for_timeout(40000)
    ft=J(pg,"()=>__ft")
    big=[(i,x) for i,x in enumerate(ft) if x[0]>450]
    print(len(ft),'big',big[:20]);print('median',sorted(x[0] for x in ft)[len(ft)//2])
    b.close()
