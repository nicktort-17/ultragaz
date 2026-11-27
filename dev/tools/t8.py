import sys;sys.path.insert(0,'/tmp/an')
from crop import *
from PIL import Image
def setup(pg,nick):
    pg.evaluate("(n)=>{document.querySelector('[data-q=low]').click();const i=document.getElementById('nick');i.value=n;i.dispatchEvent(new Event('change'));const c=document.getElementById('code');c.value='herotest';c.dispatchEvent(new Event('change'));document.getElementById('mapP').click()}",nick)
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--use-gl=swiftshader','--enable-unsafe-swiftshader','--disable-background-timer-throttling','--disable-renderer-backgrounding','--disable-backgrounding-occluded-windows'])
    ctx=b.new_context(viewport={'width':1000,'height':580});pages=[];errs=[]
    for i in range(2):
        pg=ctx.new_page();pg.on('pageerror',lambda e:errs.append(str(e)))
        pg.route('**/three@0.128.0/examples/js/**',lambda r:r.fulfill(path='/tmp/t/node_modules/three/examples/js/'+r.request.url.split('/examples/js/')[1],content_type='text/javascript'))
        pg.route('**/three.min.js',lambda r:r.fulfill(path='/tmp/t/node_modules/three/build/three.min.js',content_type='text/javascript'))
        pg.route('**/mqtt.min.js',lambda r:r.fulfill(path='/tmp/fakemqtt.js',content_type='text/javascript'))
        pg.route('**/peerjs.min.js',lambda r:r.abort());pg.route('**/fonts.googleapis.com/**',lambda r:r.abort())
        pg.goto('http://localhost:8765/index.html');pages.append(pg)
    pg.wait_for_timeout(3000)
    A,B=pages
    setup(A,'Альфа');setup(B,'Бета');A.evaluate("()=>document.querySelectorAll('#sw button')[2].click()")
    A.evaluate("()=>document.getElementById('mPvp').click()");B.evaluate("()=>document.getElementById('mPvp').click()");B.wait_for_timeout(2500)
    out=[]
    def place():
        A.evaluate("()=>{const u=__ug;u.P.pos.set(.3,.1,18.5);u.P.yaw=-.35;u.P.pitch=0;u.P.iT=99}")
        B.evaluate("()=>{const u=__ug;u.P.pos.set(.1,.1,14.6);u.P.yaw=Math.PI;u.P.pitch=-.12;u.P.iT=99}")
    for i,act in enumerate(["","u.P.vel.set(0,0,-13);u.P.grounded=true","u.P.slide=true;u.P.slideDir.set(0,0,-1)","u.fire(false)","u.P.vel.set(0,9,0);u.P.grounded=false","u.punch()"]):
        place();A.evaluate("()=>{const u=__ug;u.P.slide=false;u.P.vel.set(0,0,0);%s}"%act)
        if 'vel.set(0,0,-13)' in act:
            for k in range(6):A.evaluate("()=>{const u=__ug;u.P.pos.set(.3,.1,18.5);u.P.vel.set(-6,0,-11)}");B.wait_for_timeout(150)
        else:B.wait_for_timeout(700)
        B.locator('#screen').screenshot(path='/tmp/an/mp%d.png'%i);im=Image.open('/tmp/an/mp%d.png'%i);W,H=im.size;im.crop((int(W*.25),int(H*.05),int(W*.75),int(H*.8))).save('/tmp/an/mpc%d.png'%i);out.append('/tmp/an/mpc%d.png'%i)
    sheet(out[:3],'/tmp/an/mp_a.png',360);sheet(out[3:],'/tmp/an/mp_b.png',360)
    print(A.evaluate("()=>__ug.P.pos.toArray()"),B.evaluate("()=>[__ug.P.pos.toArray(),[...__ug.remotes.values()].map(r=>r.pos.toArray())]"))
    print(B.evaluate("()=>{const r=[...__ug.remotes.values()][0];return r?{n:r.name,an:r.an,fc:r.fc,w:r.w,v:r.vel.toArray().map(x=>+x.toFixed(1)),wr:+r.hero.wRun.toFixed(2),ws:+r.hero.wSlide.toFixed(2)}:null}"))
    print(errs[:5])
    b.close()
