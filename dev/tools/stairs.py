import os,sys;sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'));from ugenv import *  # пути окружения
import sys;sys.path.insert(0,TOOLS)
from base import *
with sync_playwright() as p:
    b,pg,errs=open_page(p,320,180)
    for sp in [13,44]:
        print(sp,pg.evaluate("""()=>__eval(`curMap=null;loadMap('l2');const p=new V3(-4,0,3),v=new V3();const tr=[];for(let i=0;i<40;i++){v.x=-%d;v.z=0;v.y-=27*.016;const r=moveBody(p,v,.4,1.75,.016,true);if(r.ground&&v.y<0)v.y=0;if(i%%4==0)tr.push(p.x.toFixed(1)+'/'+p.y.toFixed(2))}tr.join(' ')`)"""%sp))
    print(pg.evaluate("()=>__eval(`curMap=null;loadMap('zavod');const p=new V3(11.77,3.41,-34.05),v=new V3(-7.39,-2.67,10.69);moveBody(p,v,1.1,4.5,.033,true);p.y.toFixed(2)`)"))
    b.close()
