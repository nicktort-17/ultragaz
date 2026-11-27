import os,sys;sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'));from ugenv import *  # пути окружения
import sys,json;sys.path.insert(0,TOOLS)
from base import *
tag=sys.argv[1]
def F(pg,n=30):pg.evaluate("()=>new Promise(r=>{let n=0;const f=()=>{if(++n>%d)r();else requestAnimationFrame(f)};f()})"%n)
views=[('zavod',[0,0,22],0,0),('zavod',[-20,0,-20],-2.4,-.1),('plaza',[0,0,26],0,.05),('plaza',[20,0,-10],1.2,0),('l1',[0,0,19],0,0),('l2',[-14,3.2,14],-2.75,-.28)]
with sync_playwright() as p:
    b,pg,errs=open_page(p,640,360)
    for i,(m,pos,yaw,pit) in enumerate(views):
        lv='null' if m in('zavod','plaza') else "'"+m+"'"
        J(pg,"()=>{window.__norender=0;__eval(\"mapId='"+(m if m in('zavod','plaza') else 'zavod')+"'\");__ug.begin('solo',"+lv+")}");pg.wait_for_timeout(900)
        J(pg,"()=>__eval(`P.pos.set(%f,%f,%f);P.yaw=%f;P.pitch=%f;P.iT=1e9;document.getElementById('lvCard').hidden=true;enemies.forEach(e=>scene.remove(e.g));enemies=[];toSpawn=[];telegraphs.forEach(t=>scene.remove(t.m));telegraphs=[]`)"%(*pos,yaw,pit));F(pg,40)
        pg.screenshot(path=OUT+'/cmp_%s_%d.png'%(tag,i))
    print(errs[:3] if [e for e in errs if 'ReadPixels' not in e and 'ERR_FAILED' not in e] else 'ok')
    b.close()
