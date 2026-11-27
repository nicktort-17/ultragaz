import os,sys;sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'));from ugenv import *  # пути окружения
import sys,json;sys.path.insert(0,TOOLS)
from base import *
def F(pg,n=30):pg.evaluate("()=>new Promise(r=>{let n=0;const f=()=>{if(++n>%d)r();else requestAnimationFrame(f)};f()})"%n)
with sync_playwright() as p:
    b=launch(p)
    ctx=b.new_context(viewport={'width':400,'height':225});pages=[];errs=[]
    for i in range(2):
        pg=ctx.new_page();pg.on('pageerror',lambda e,i=i:errs.append(str(i)+':'+str(e)))
        HAVE_THREE and pg.route('**/three@0.128.0/examples/js/**',lambda r:r.fulfill(path=THREE_DIR+'/examples/js/'+r.request.url.split('/examples/js/')[1],content_type='text/javascript'))
        HAVE_THREE and pg.route('**/three.min.js',lambda r:r.fulfill(path=THREE_DIR+'/build/three.min.js',content_type='text/javascript'))
        pg.route('**/mqtt.min.js',lambda r:r.fulfill(path=FAKEMQTT,content_type='text/javascript'))
        pg.route('**/peerjs.min.js',lambda r:r.abort());pg.route('**/fonts.googleapis.com/**',lambda r:r.abort())
        pg.goto(URL);pages.append(pg)
    pages[0].wait_for_timeout(3000)
    J(pages[0],"()=>{__ug.myCos.skin=1;__ug.rebuildSelf()}");pages[0].wait_for_timeout(2000)
    for i,pg in enumerate(pages):
        J(pg,"()=>{document.getElementById('nick').value='P%d';document.getElementById('code').value='zm1';window.__norender=1;__ug.begin('coop','l1')}"%i)
        pg.wait_for_timeout(1500)
    for k in range(6):
        for pg in pages:F(pg,10)
    rq="()=>__eval('[...remotes.values()].map(r=>[r.name,!!r.hero.human,r.hero.capeOn,r.cos])')"
    print('remote on P1',J(pages[1],rq))
    J(pages[0],"()=>{document.dispatchEvent(new KeyboardEvent('keydown',{code:'KeyT'}))}")
    pages[0].keyboard.press('KeyT')
    for k in range(6):
        for pg in pages:F(pg,10)
    print('self P0',J(pages[0],"()=>__eval('[selfHero.human,selfHero.capeOn,myCape]')"))
    print('remote on P1 after T',J(pages[1],rq))
    print(errs[:4])
    b.close()
