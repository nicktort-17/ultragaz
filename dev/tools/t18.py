import os,sys;sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'));from ugenv import *  # пути окружения
import sys;sys.path.insert(0,TOOLS)
from crop import *
def setup(pg,nick):
    pg.evaluate("(n)=>{document.querySelector('[data-q=low]').click();const i=document.getElementById('nick');i.value=n;i.dispatchEvent(new Event('change'));const c=document.getElementById('code');c.value='cos1';c.dispatchEvent(new Event('change'))}",nick)
with sync_playwright() as p:
    b=launch(p)
    ctx=b.new_context(viewport={'width':800,'height':460});pages=[];errs=[]
    for i in range(2):
        pg=ctx.new_page();pg.on('pageerror',lambda e:errs.append(str(e)))
        HAVE_THREE and pg.route('**/three@0.128.0/examples/js/**',lambda r:r.fulfill(path=THREE_DIR+'/examples/js/'+r.request.url.split('/examples/js/')[1],content_type='text/javascript'))
        HAVE_THREE and pg.route('**/three.min.js',lambda r:r.fulfill(path=THREE_DIR+'/build/three.min.js',content_type='text/javascript'))
        pg.route('**/mqtt.min.js',lambda r:r.fulfill(path=FAKEMQTT,content_type='text/javascript'))
        pg.route('**/peerjs.min.js',lambda r:r.abort());pg.route('**/fonts.googleapis.com/**',lambda r:r.abort())
        pg.goto(URL);pages.append(pg)
    pages[1].wait_for_timeout(3000);A,B=pages
    setup(A,'Альфа');setup(B,'Бета')
    A.evaluate("()=>{Object.assign(__ug.myCos,{crest:2,wings:1,pattern:3})}")
    A.evaluate("()=>document.getElementById('mCoop').click()");B.evaluate("()=>document.getElementById('mCoop').click()");B.wait_for_timeout(3500)
    print('B sees',B.evaluate("()=>[...__ug.remotes.values()].map(r=>[r.name,r.cos,r.hero.cos])"))
    for pg in (A,B):pg.evaluate("()=>{const u=__ug;u.enemies.filter(e=>!e.remote).forEach(e=>u.kill(e,'x',true));u.startWave(5)}")
    B.wait_for_timeout(9000)
    for nm,pg in (('A',A),('B',B)):print(nm,pg.evaluate("()=>({wave:document.getElementById('wave').textContent,boss:__ug.enemies.filter(e=>e.type==='boss').map(e=>[e.remote,Math.round(e.hp),Math.round(e.maxHp)]),bar:!document.getElementById('bossBar').hidden,bank:Math.round(__ug.bank)})"))
    print(errs[:5])
    b.close()
