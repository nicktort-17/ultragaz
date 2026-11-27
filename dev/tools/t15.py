import sys,base64,io;sys.path.insert(0,'/tmp/an')
from crop import *
from PIL import Image
STEP="(n)=>new Promise(r=>{window.__frz=false;let k=0;const f=()=>{if(++k>=n){window.__frz=true;setTimeout(r,60)}else requestAnimationFrame(f)};requestAnimationFrame(f)})"
VIEW="""(a)=>{const u=__ug,e=u.enemies.find(x=>x.type==='boss');const c=new THREE.Vector3(e.pos.x,e.pos.y+3.2,e.pos.z);const cam=new THREE.PerspectiveCamera(40,1100/620,.1,200);
 const ang=e.g.rotation.y+a[0];cam.position.set(c.x+Math.sin(ang)*a[1],c.y+a[2],c.z+Math.cos(ang)*a[1]);cam.lookAt(c);const r=u.renderer;r.setScissorTest(false);r.clear();r.render(u.scene,cam);return r.domElement.toDataURL('image/png')}"""
with sync_playwright() as p:
    b,pg,errs=open_page(p,1100,620)
    pg.evaluate("()=>{document.querySelector('[data-q=mid]').click();document.getElementById('mapZ').click();document.getElementById('mSolo').click()}");pg.wait_for_timeout(1500)
    J(pg,"()=>{const u=__ug;u.enemies.forEach(e=>u.kill(e,'x',true));u.toSpawn.length=0;u.P.pos.set(0,1.3,16);u.P.iT=999;u.spawnEnemy('boss',new THREE.Vector3(0,1.3,6))}")
    pg.evaluate(STEP,6)
    out=[]
    for i,a in enumerate([[0,9,0],[.9,9,1],[2.8,9,1],[0.3,5,-1.2]]):
        d=pg.evaluate(VIEW,a);Image.open(io.BytesIO(base64.b64decode(d.split(',')[1]))).convert('RGB').save('/tmp/an/bv%d.png'%i);out.append('/tmp/an/bv%d.png'%i)
    sheet(out[:2],'/tmp/an/bossv1.png',420);sheet(out[2:],'/tmp/an/bossv2.png',420)
    b.close()
