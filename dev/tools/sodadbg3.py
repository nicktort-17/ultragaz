import os,sys;sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'));from ugenv import *  # пути окружения
import sys;sys.path.insert(0,TOOLS)
from base import *
def F(pg,n=30):pg.evaluate("()=>new Promise(r=>{let n=0;const f=()=>{if(++n>%d)r();else requestAnimationFrame(f)};f()})"%n)
with sync_playwright() as p:
    b,pg,errs=open_page(p,640,360)
    J(pg,"()=>__ug.begin('solo','l1')");pg.wait_for_timeout(3000)
    J(pg,"()=>__eval(`const P=__ug.P;P.iT=1e9;P.pos.set(0,0,12);P.yaw=.25;P.pitch=.08;cur=3`)")
    for i in range(12):
        J(pg,"()=>__eval(`enemies.forEach(e=>{e.dead=1;scene.remove(e.g)});toSpawn.length=0;gas=100;camera.getWorldDirection(aim);soda(false)`)");F(pg,2)
    print(J(pg,"""()=>__eval(`(()=>{const m=SODA.mesh,g=m.geometry,p=g.attributes.position,a=g.attributes.aA,n=g.drawRange.count;const out=[];for(let i=0;i<Math.min(n,12);i++){const v=new V3(p.getX(i),p.getY(i),p.getZ(i));const s=v.clone().project(camera);out.push([v.toArray().map(x=>+x.toFixed(2)),s.toArray().map(x=>+x.toFixed(2)),+a.getX(i).toFixed(2)])}return JSON.stringify({n,vis:m.visible,par:!!m.parent,inScene:scene.children.includes(m),out})})()`)"""))
    b.close()
