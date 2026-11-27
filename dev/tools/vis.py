import os,sys;sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'));from ugenv import *  # пути окружения
import sys,json;sys.path.insert(0,TOOLS)
from base import *
def F(pg,n=30):pg.evaluate("()=>new Promise(r=>{let n=0;const f=()=>{if(++n>%d)r();else requestAnimationFrame(f)};f()})"%n)
with sync_playwright() as p:
    b,pg,errs=open_page(p,1280,720)
    HAVE_THREE and pg.route('**/objects/Reflector.js',lambda r:r.fulfill(path=THREE_DIR+'/examples/js/objects/Reflector.js',content_type='text/javascript'))
    pg.reload();pg.wait_for_timeout(3000)
    pg.keyboard.press('Space');F(pg,25);pg.screenshot(path=OUT+'/v_main.png')
    pg.keyboard.press('Enter');F(pg,40);pg.screenshot(path=OUT+'/v_story.png')
    J(pg,"()=>{__ug.prog.l1={done:1,t:212,g:'A',s:9000};__ug.mmView('page','story')}");F(pg,30);pg.screenshot(path=OUT+'/v_story2.png')
    # пресс в момент удара
    J(pg,"()=>{window.__norender=1;__ug.begin('solo','l1')}");pg.wait_for_timeout(800)
    J(pg,"()=>{document.getElementById('lvCard').hidden=true;const S=__ug.story;S.room=0;S.phase='clear';const P=__ug.P;P.pos.set(-8,0,-46.5);P.yaw=-1.25;P.pitch=.05;P.iT=1e9}")
    F(pg,20);J(pg,"()=>{window.__norender=0;__ug.lvT=3.2-0.02;window.__frz=1;const P=__ug.P;P.yaw=-1.2;P.pitch=.08}");F(pg,4)
    pg.screenshot(path=OUT+'/v_press.png')
    J(pg,"()=>{__ug.lvT=2.6;const P=__ug.P;P.yaw=-1.2}");F(pg,3);pg.screenshot(path=OUT+'/v_press_warn.png')
    J(pg,"()=>{window.__frz=0;__ug.showResults()}");F(pg,10);pg.screenshot(path=OUT+'/v_res.png')
    print([e for e in errs if 'ReadPixels' not in e and 'ERR_FAILED' not in e][:8])
    b.close()
