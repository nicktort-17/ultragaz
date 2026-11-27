import os,sys;sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'));from ugenv import *  # пути окружения
import sys;sys.path.insert(0,TOOLS)
from base import *
with sync_playwright() as p:
    b,pg,errs=open_page(p,320,180)
    print(pg.evaluate("""()=>__eval(`window.__norender=1;curMap=null;loadMap('zavod');const p=new V3(11.77,3.41,-34.05),v=new V3(-7.39,-2.67,10.69);
    const pre=boxes.filter(b=>ov(p,1.1,4.5,b)).map(b=>[b.min.x,b.min.y,b.min.z,b.max.x,b.max.y,b.max.z].map(q=>+q.toFixed(2)).join(','));
    const near=boxes.filter(b=>Math.abs(b.min.z+34)<3&&b.max.y>3&&b.min.y<9&&b.min.x<14&&b.max.x>9).map(b=>[b.min.x,b.min.y,b.min.z,b.max.x,b.max.y,b.max.z].map(q=>+q.toFixed(2)).join(','));
    moveBody(p,v,1.1,4.5,.033,true);JSON.stringify({pre,near,res:[p.x,p.y,p.z]})`)"""))
    b.close()
