import os,sys;sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'));from ugenv import *  # пути окружения
import sys,json;sys.path.insert(0,TOOLS)
from base import *
exec(open(TOOLS+'/pep3.py').read().split("mode=sys.argv")[0].split("from base import *")[1])
with sync_playwright() as p:
    b,pg,errs=open_page(p,800,450)
    J(pg,"()=>__ug.begin('solo','l4')");pg.wait_for_timeout(1500);J(pg,"()=>{window.__dt=1/30;window.__norender=1}")
    F(pg,30)
    E(pg,"(()=>{P.iT=1e9;P.pos.set(3,9.05,-112);P.vel.set(0,0,0);story.room=2;story.phase='clear';story.pepPh=3})()")
    for k in range(10):
        F(pg,20)
        if E(pg,"enemies.some(x=>x.type==='pep')"):break
    run(pg,200,0)
    E(pg,"(()=>{const e=enemies.find(x=>x.type==='pep');pepSet(e,'walk3',50);e.cdA=99;e.inv=true})()")
    E(pg,"P.pos.set(0,9.05,-104.6)");run(pg,10,.3);S(pg,'k_a',.3)
    E(pg,"(()=>{const R=enemies.find(x=>x.type==='pep').g.userData.pep;R.wing.forEach(W=>W.w.traverse(m=>{if(m.isMesh)m.frustumCulled=false}))})()");run(pg,2,.3);S(pg,'k_b',.3)
    E(pg,"(()=>{const R=enemies.find(x=>x.type==='pep').g.userData.pep;R.wing.forEach(W=>W.w.traverse(m=>{if(m.isMesh){m.material=new THREE.MeshBasicMaterial({color:0x00ff00,side:THREE.DoubleSide})}}))})()");run(pg,2,.3);S(pg,'k_c',.3)
    print(E(pg,"""(()=>{const e=enemies.find(x=>x.type==='pep'),R=e.g.userData.pep;const out=[];const w=R.wing[0].w;w.updateMatrixWorld(true);
      w.traverse(m=>{if(m.isMesh){const g=m.geometry;g.computeBoundingSphere();out.push([m.name,g.attributes.position.count,g.index?g.index.count:0,+g.boundingSphere.radius.toFixed(2),g.boundingSphere.center.toArray().map(v=>+v.toFixed(2)),+m.matrixWorld.determinant().toFixed(3),m.visible,m.material.name||m.material.type,m.frustumCulled])}});
      let p=w;const ch=[];while(p){ch.push(p.name+':'+p.visible+':'+p.scale.x.toFixed(2));p=p.parent}
      return JSON.stringify({out,ch})})()"""))
    b.close()
