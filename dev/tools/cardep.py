import os,sys;sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'));from ugenv import *  # пути окружения
import sys;sys.path.insert(0,TOOLS)
from base import *
def F(pg,n=30):pg.evaluate("()=>new Promise(r=>{let n=0;const f=()=>{if(++n>%d)r();else requestAnimationFrame(f)};f()})"%n)
with sync_playwright() as p:
    b,pg,errs=open_page(p,640,360)
    J(pg,"()=>__ug.begin('solo','l4')");J(pg,"()=>{window.__dt=1/30}")
    pts=[];bad=0
    for k in range(120):
        F(pg,3);r=J(pg,"()=>__eval(`(()=>{const c=L4.car;if(!c.visible)return null;const p=c.position;const hits=boxes.filter(b=>p.x+1.1>b.min.x&&p.x-1.1<b.max.x&&p.z+1.1>b.min.z&&p.z-1.1<b.max.z&&p.y+.9>b.min.y&&p.y+.2<b.max.y).length;return [+p.x.toFixed(1),+p.y.toFixed(1),+p.z.toFixed(1),+c.rotation.y.toFixed(2),hits,+L4.intro.t.toFixed(1)]})()`)")
        if r:pts.append(r);bad+=r[4]>0
        if k==75:pg.screenshot(path=OUT+'/cardep.png')
    print(len(pts),'hits',bad);print(pts[::6])
    b.close()
