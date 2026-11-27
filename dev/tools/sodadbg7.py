import os,sys;sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'));from ugenv import *  # пути окружения
import sys;sys.path.insert(0,TOOLS)
from base import *
def F(pg,n=30):pg.evaluate("()=>new Promise(r=>{let n=0;const f=()=>{if(++n>%d)r();else requestAnimationFrame(f)};f()})"%n)
with sync_playwright() as p:
    b,pg,errs=open_page(p,900,560)
    J(pg,"()=>__ug.begin('solo','l1')");pg.wait_for_timeout(3000)
    J(pg,"()=>__eval(`const P=__ug.P;P.iT=1e9;P.pos.set(0,0,12);P.yaw=.25;P.pitch=.08;cur=3;window.__dt=1/60`)")
    for i in range(30):
        J(pg,"()=>__eval(`enemies.forEach(e=>{e.dead=1;scene.remove(e.g)});toSpawn.length=0;gas=100;camera.getWorldDirection(aim);soda(false)`)");F(pg,5)
    print(J(pg,"""()=>__eval(`(()=>{window.__frz=1;const g=SODA.mesh.geometry,p=g.attributes.position;const v=[];for(let i=0;i<6;i++)v.push([p.getX(i),p.getY(i),p.getZ(i)].map(x=>+x.toFixed(2)));
     const t=new THREE.Mesh(new THREE.BoxGeometry(.3,.3,.3),new THREE.MeshBasicMaterial({color:0x00ff00}));t.position.set(v[0][0],v[0][1],v[0][2]);scene.add(t);
     const m2=new THREE.Mesh(g,new THREE.MeshBasicMaterial({color:0xff00ff,side:THREE.DoubleSide,depthTest:false}));m2.frustumCulled=false;scene.add(m2);
     return JSON.stringify({v,cnt:g.drawRange.count,attrs:Object.keys(g.attributes)})})()`)"""))
    F(pg,3);pg.screenshot(path=OUT+'/soda_dbg.png')
    b.close()
