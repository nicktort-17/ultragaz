import sys,json;sys.path.insert(0,'/tmp/an')
from base import *
def F(pg,n=30):pg.evaluate("()=>new Promise(r=>{let n=0;const f=()=>{if(++n>%d)r();else requestAnimationFrame(f)};f()})"%n)
E=lambda pg,s:pg.evaluate("()=>__eval(%s)"%json.dumps(s))
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--use-gl=swiftshader','--enable-unsafe-swiftshader','--disable-background-timer-throttling','--disable-renderer-backgrounding','--disable-backgrounding-occluded-windows'])
    ctx=b.new_context(viewport={'width':480,'height':270});pages=[];errs=[]
    for i in range(2):
        pg=ctx.new_page();pg.on('pageerror',lambda e,i=i:errs.append('P%d:'%i+str(e)))
        pg.route('**/three@0.128.0/examples/js/**',lambda r:r.fulfill(path='/tmp/t/node_modules/three/examples/js/'+r.request.url.split('/examples/js/')[1],content_type='text/javascript'))
        pg.route('**/three.min.js',lambda r:r.fulfill(path='/tmp/t/node_modules/three/build/three.min.js',content_type='text/javascript'))
        pg.route('**/mqtt.min.js',lambda r:r.fulfill(path='/tmp/fakemqtt.js',content_type='text/javascript'))
        pg.route('**/peerjs.min.js',lambda r:r.abort());pg.route('**/fonts.googleapis.com/**',lambda r:r.abort())
        pg.goto('http://localhost:8765/index.html');pages.append(pg)
    pages[0].wait_for_timeout(3000)
    for i,pg in enumerate(pages):
        J(pg,"()=>{document.getElementById('nick').value='P%d';document.getElementById('code').value='pq9';window.__norender=1;__ug.begin('coop','l4')}"%i)
        pg.wait_for_timeout(1500)
    for pg in pages:F(pg,30)
    hosts=[J(pg,"()=>__eval('isHost')") for pg in pages];print('hosts',hosts);H=pages[hosts.index(True)];C=pages[hosts.index(False)]
    for pg in pages:J(pg,"()=>{window.__dt=1/30;__ug.P.iT=1e9;__ug.P.pos.set(0,9.05,-112);__eval(\"story.room=2;story.phase='clear'\")}")
    for k in range(10):
        for pg in pages:F(pg,15)
    S="(()=>{const e=enemies.find(x=>x.type==='pep');return e?[e.st||'-',e.ac,Math.round(e.hp),!!e.g.userData.pep,e.remote,PEP.fx.length]:story.phase})()"
    print('start',[E(pg,S) for pg in pages])
    # клиент стреляет по боссу: урон уходит хосту
    for st,ac,ex in (('gat',11,"e.sw=1;e.fireAcc=0"),('charge',17,""),('rkt',12,"e.rkN=0;e.rkAt=P.pos.clone()"),('stomp',13,""),('shield',15,"e.orbT=1"),('tr12',20,"e.inv=true"),('punch',32,""),('buyout',38,"e.bn=0"),('beam',35,"e.beamY=e.g.rotation.y;e.beamDir=1;e.beamD=12"),('tr23',40,"e.inv=true"),('crash',51,"e.wv=0"),('liq',52,"e.beamD=12"),('stab',54,"e.sn=0"),('core',55,"e.coreDmg=0"),('suck',57,"e.coreDmg=0"),('shard',58,"e.sv=0"),('brood',59,"")):
        E(H,"(()=>{const e=enemies.find(x=>x.type==='pep');e.inv=false;pepSet(e,'%s',%d);%s})()"%(st,ac,ex))
        for k in range(6):
            for pg in pages:F(pg,10)
        E(C,"(()=>{const e=enemies.find(x=>x.type==='pep');const R=e&&e.g.userData.pep;if(R){const ph=e.ac===61?4:e.ac<20?1:e.ac<40?2:3;const c=(ph===3?R.b3:ph===4?R.tor:ph===2?R.chest:R.b1).getWorldPosition(new V3());const o=camera.position,dir=c.sub(o).normalize();hitscan(dir,3,false,'rev',0xffe3a3,true)}})()")
        print(st,'H',E(H,S),'C',E(C,S),'proj C',E(C,"proj.filter(p=>p.owner==='enemy').map(p=>p.kind).join(',')"))
    E(H,"(()=>{const e=enemies.find(x=>x.type==='pep');e.inv=false;pepSet(e,'death',60);e.inv=true})()")
    for k in range(12):
        for pg in pages:F(pg,15)
    print('death H',E(H,S),'C',E(C,S))
    for k in range(10):
        for pg in pages:F(pg,15)
    print('final H',E(H,S),'C',E(C,S))
    DBG="(()=>{const e=enemies.find(x=>x.type==='pep');const R=e&&e.g.userData.pep;if(!R)return 'noR';const c=R.tor.getWorldPosition(new V3());const o=camera.position.clone(),dir=c.clone().sub(o).normalize();const t=pepRay(e,o,dir);return JSON.stringify({hph:R.hph,n:(R.hl[61]||[]).length,vis:pepVis(R.hl[61][0]),par:R.host.parent===e.g,gv:e.g.visible,inScene:!!e.g.parent,t,c:[c.x,c.y,c.z].map(v=>+v.toFixed(1)),o:[o.x,o.y,o.z].map(v=>+v.toFixed(1)),ep:[e.pos.x,e.pos.z].map(v=>+v.toFixed(1)),hostVis:R.host.visible,id:e.id})})()"
    print('dbg H',E(H,DBG));print('dbg C',E(C,DBG))
    E(C,"(()=>{const e=enemies.find(x=>x.type==='pep');P.pos.set(e.pos.x+2,9.05,e.pos.z+6);P.vel.set(0,0,0)})()")
    for pg in pages:F(pg,6)
    for k in range(6):
        E(C,"(()=>{const e=enemies.find(x=>x.type==='pep');const R=e&&e.g.userData.pep;if(R&&e.ac===61){const c=R.tor.getWorldPosition(new V3());const o=camera.position,dir=c.sub(o).normalize();hitscan(dir,3,false,'rev',0xffe3a3,true)}})()")
        for pg in pages:F(pg,10)
    print('end H',E(H,S),'C',E(C,S),'fx H',E(H,"JSON.stringify(PEP.fx.map(f=>f.k))"),'fx C',E(C,"JSON.stringify(PEP.fx.map(f=>f.k))"),'win',E(H,"!!story.pepWin"),E(C,"!!story.pepWin"))
    print(errs[:8])
    b.close()
