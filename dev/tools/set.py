import os,sys;sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'));from ugenv import *  # пути окружения
import sys;sys.path.insert(0,TOOLS)
from base import *
def F(pg,n=30):pg.evaluate("()=>new Promise(r=>{let n=0;const f=()=>{if(++n>%d)r();else requestAnimationFrame(f)};f()})"%n)
with sync_playwright() as p:
    b,pg,errs=open_page(p,1280,720)
    HAVE_THREE and pg.route('**/objects/Reflector.js',lambda r:r.fulfill(path=THREE_DIR+'/examples/js/objects/Reflector.js',content_type='text/javascript'))
    pg.reload();pg.wait_for_timeout(3000)
    J(pg,"()=>{__ug.mmView('page','settings')}");F(pg,30);pg.screenshot(path=OUT+'/v_set.png')
    J(pg,"()=>{document.getElementById('fpsOn').click();window.__norender=0;__ug.begin('solo','l1')}");pg.wait_for_timeout(1500);F(pg,90)
    pg.screenshot(path=OUT+'/v_fps.png',clip={'x':0,'y':0,'width':400,'height':120})
    print(J(pg,"()=>document.getElementById('fps').textContent"),[e for e in errs if 'ReadPixels' not in e and 'ERR_FAILED' not in e][:3])
    b.close()
