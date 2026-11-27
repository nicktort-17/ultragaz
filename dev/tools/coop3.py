import os,sys;sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'));from ugenv import *  # пути окружения
import sys,json;sys.path.insert(0,TOOLS)
from base import *
def F(pg,n=30):pg.evaluate("()=>new Promise(r=>{let n=0;const f=()=>{if(++n>%d)r();else requestAnimationFrame(f)};f()})"%n)
st="()=>{const e=__ug.enemies.find(x=>x.type==='alt');return {host:__eval('isHost'),room:__ug.story.room,ph:__ug.story.phase,en:__ug.enemies.map(x=>x.type).join(','),alt:e?[e.ac,Math.round(e.hp),e.pos.toArray().map(v=>+v.toFixed(1))]:null,wreck:!!__eval('L3.wreck'),end:!!__eval('L3.end'),q:__eval('L3.q.st'),obbs:__eval('L3.obbs.length')}}"
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
    for i,pg in enumerate(pages):
        J(pg,"()=>{document.getElementById('nick').value='P%d';document.getElementById('code').value='zz7';window.__norender=1;__ug.begin('coop','l3')}"%i)
        pg.wait_for_timeout(1500)
    for pg in pages:F(pg,30)
    hs=[J(pg,"()=>__eval('isHost')") for pg in pages];print('hosts',hs)
    H=pages[hs.index(True)];C=pages[hs.index(False)]
    # клиент спасает грязнульку: берёт круг и бросает
    J(C,"()=>{const P=__ug.P;P.iT=1e9;P.pos.set(11.6,0,-15.5);P.vel.set(0,0,0)}");F(C,5)
    J(C,"()=>{__eval('l3Interact()');const q=__eval('L3.q'),P=__ug.P,c=__ug.camera.position;const dx=q.pos.x-c.x,dz=q.pos.z-c.z;P.yaw=Math.atan2(-dx,-dz);P.pitch=.05}");F(C,2);J(C,"()=>__eval('throwRing()')")
    for k in range(30):
        for pg in (H,C):F(pg,12)
        qh=J(H,"()=>__eval('L3.q.st')");qc=J(C,"()=>__eval('L3.q.st')")
        if qh>=3 and qc>=3:break
    print('quest host/client',qh,qc)
    # хост идёт к боссу
    J(H,"()=>{__ug.P.iT=1e9;const S=__ug.story;S.room=1;S.phase='clear';const P=__ug.P;P.pos.set(0,0,-62);P.vel.set(0,0,0)}")
    for k in range(8):
        for pg in (H,C):F(pg,20)
    print('boss',[J(pg,st) for pg in (H,C)])
    J(H,"()=>{const e=__ug.enemies.find(x=>x.type==='alt');e.inv=false;__ug.damage(e,e.maxHp*.5,99,'x')}")
    for k in range(14):
        for pg in (H,C):F(pg,20)
        if k in(2,6,13):print('trans',k,[J(pg,st) for pg in (H,C)])
    J(H,"()=>{const e=__ug.enemies.find(x=>x.type==='alt');e.inv=false;__ug.damage(e,9999,99,'x')}")
    for k in range(4):
        for pg in (H,C):F(pg,20)
    print('dead',[J(pg,st) for pg in (H,C)])
    print([e for e in errs][:8])
    b.close()
