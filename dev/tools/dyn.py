import os,sys;sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'));from ugenv import *  # пути окружения
import sys;sys.path.insert(0,TOOLS)
from base import *
with sync_playwright() as p:
    b,pg,errs=open_page(p,320,180)
    for m in ['zavod','plaza','l1','l2']:
        print(m,pg.evaluate("()=>__eval(`curMap=null;loadMap('%s');JSON.stringify({dyn:mapGroup.children.filter(o=>o.userData.dyn).length,merged:mapGroup.children.filter(o=>o.userData.merged).length,hidden:mapGroup.children.filter(o=>o.isMesh&&!o.visible).length,vl:vLights.length})`)"%m))
    b.close()
