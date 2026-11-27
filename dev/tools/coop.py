import sys,json;sys.path.insert(0,'/tmp/an')
from base import *
def F(pg,n=30):pg.evaluate("()=>new Promise(r=>{let n=0;const f=()=>{if(++n>%d)r();else requestAnimationFrame(f)};f()})"%n)
st="()=>({host:window.__isHost&&__isHost(),ph:__ug.story.phase,room:__ug.story.room,en:__ug.enemies.map(e=>e.type).join(','),doors:__ug.doors.map(d=>d.open?1:0).join(''),hud:document.getElementById('left').textContent,state:__ug.state,pos:[__ug.P.pos.x,__ug.P.pos.y,__ug.P.pos.z].map(v=>+v.toFixed(1)),lvT:+__ug.lvT.toFixed(2),rem:__ug.remotes.size})"
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--use-gl=swiftshader','--enable-unsafe-swiftshader','--disable-background-timer-throttling','--disable-renderer-backgrounding','--disable-backgrounding-occluded-windows'])
    ctx=b.new_context(viewport={'width':480,'height':270});pages=[];errs=[]
    for i in range(2):
        pg=ctx.new_page();pg.on('pageerror',lambda e:errs.append(str(e)))
        pg.route('**/three@0.128.0/examples/js/**',lambda r:r.fulfill(path='/tmp/t/node_modules/three/examples/js/'+r.request.url.split('/examples/js/')[1],content_type='text/javascript'))
        pg.route('**/three.min.js',lambda r:r.fulfill(path='/tmp/t/node_modules/three/build/three.min.js',content_type='text/javascript'))
        pg.route('**/mqtt.min.js',lambda r:r.fulfill(path='/tmp/fakemqtt.js',content_type='text/javascript'))
        pg.route('**/peerjs.min.js',lambda r:r.abort());pg.route('**/fonts.googleapis.com/**',lambda r:r.abort())
        pg.goto('http://localhost:8765/index.html');pages.append(pg)
    pages[0].wait_for_timeout(3000)
    for i,pg in enumerate(pages):
        J(pg,"()=>{document.getElementById('nick').value='P%d';document.getElementById('code').value='zz9';window.__norender=1;__ug.begin('coop','l1')}"%i)
        pg.wait_for_timeout(1500)
    for pg in pages:F(pg,30)
    for i,pg in enumerate(pages):print(i,J(pg,st))
    # хост (у кого меньший peer) — двигаем страницу 0 в зал
    J(pages[0],"()=>{const P=__ug.P;P.pos.set(0,0,10);P.iT=1e9}");J(pages[1],"()=>{__ug.P.iT=1e9}")
    for k in range(6):
        for pg in pages:F(pg,25)
        print(k,[J(pg,st) for pg in pages])
    # убить всех у хоста, пока зал не зачищен
    for k in range(16):
        for pg in pages:
            J(pg,"()=>{for(const e of __ug.enemies)__ug.damage(e,9999,99,'x');__ug.P.iT=1e9}");F(pg,25)
    print('after',[J(pg,st) for pg in pages])
    print([e for e in errs][:8])
    b.close()
