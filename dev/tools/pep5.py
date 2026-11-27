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
    E(pg,"(()=>{const e=enemies.find(x=>x.type==='pep');pepSet(e,'walk3',50);e.cdA=99;P.pos.set(0,9.05,-104.6)})()");run(pg,20,.35);S(pg,'k_top',.35)
    print(E(pg,"""(()=>{const e=enemies.find(x=>x.type==='pep'),R=e.g.userData.pep;const out=[];R.wing.forEach((W,i)=>{const w=W.w;w.updateMatrixWorld(true);const a=w.getWorldPosition(new V3()),t=w.localToWorld(new V3(W.s*4.8,0,0));
      const sc=w.children.map(c=>c.name+':'+c.type+':'+c.visible+':'+(c.material?c.material.type:'-')).join('|');out.push([a.toArray().map(v=>+v.toFixed(1)),t.toArray().map(v=>+v.toFixed(1))])});
      return JSON.stringify({ac:e.ac,st:e.st,pos:e.pos.toArray(),p3vis:R.p3.visible,b3:R.b3.getWorldPosition(new V3()).toArray().map(v=>+v.toFixed(1)),w:out})})()"""))
    print([e for e in errs if 'ReadPixels' not in e and 'ERR_FAILED' not in e][:8])
    b.close()
