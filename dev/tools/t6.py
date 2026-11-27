import os,sys;sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'));from ugenv import *  # пути окружения
import sys,base64;sys.path.insert(0,TOOLS)
from crop import *
from PIL import Image
import io
VIEW="""(a)=>{const u=__ug,[w,dir,dist]=a,g=u.guns[w];u.guns.forEach((x,j)=>x.visible=j===w);g.updateMatrixWorld(true);
 const b=new THREE.Box3().setFromObject(g.userData.holder),c=b.getCenter(new THREE.Vector3());c.y-=.03,cam=new THREE.PerspectiveCamera(30,1.4,.01,20);
 const d=new THREE.Vector3(...dir).normalize();cam.position.copy(c).addScaledVector(d,dist);cam.lookAt(c);
 const r=u.renderer,sc=u.gunScene,bg=sc.background;sc.background=new THREE.Color(0x3a3f4a);r.setScissorTest(false);r.clear();r.render(sc,cam);sc.background=bg;return r.domElement.toDataURL('image/png')}"""
def grab(pg,args,path):
    d=J(pg,"(a)=>("+VIEW+")(a)" if False else VIEW.replace('(a)=>','',0) and None) if False else pg.evaluate(VIEW,args)
    Image.open(io.BytesIO(base64.b64decode(d.split(',')[1]))).convert('RGB').save(path);return path
with sync_playwright() as p:
    b,pg,errs=open_page(p,900,640)
    pg.evaluate("()=>{document.querySelector('[data-q=low]').click();document.querySelectorAll('#sw button')[0].click();document.getElementById('mSolo').click()}");pg.wait_for_timeout(1500)
    J(pg,"()=>{const u=__ug;u.enemies.forEach(e=>u.kill(e,'x',true));window.__frz=true}");pg.wait_for_timeout(300)
    rows=[]
    for w in range(4):
        J(pg,"()=>{__ug.switchW(%d);__ug.VM.draw=1}"%w);J(pg,"()=>{window.__frz=false}");pg.wait_for_timeout(500);J(pg,"()=>{window.__frz=true}");pg.wait_for_timeout(200)
        rows.append([grab(pg,[w,[1,.1,.1],1.25],OUT+'/g%d_r.png'%w),grab(pg,[w,[-1,.1,.1],1.25],OUT+'/g%d_l.png'%w),grab(pg,[w,[.25,.1,1],1.0],OUT+'/g%d_b.png'%w)])
    for w,r in enumerate(rows):sheet(r,OUT+'/gs%d.png'%w,300)
    print([e for e in errs if 'ReadPixels' not in e and 'ERR_FAILED' not in e][:8])
    b.close()
