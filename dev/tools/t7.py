import sys;sys.path.insert(0,'/tmp/an')
from crop import *
from PIL import Image
STEP="(n)=>new Promise(r=>{window.__frz=false;let k=0;const f=()=>{if(++k>=n){window.__frz=true;setTimeout(r,60)}else requestAnimationFrame(f)};requestAnimationFrame(f)})"
def snap(pg,path):
    pg.locator('#screen').screenshot(path='/tmp/an/_f.png');im=Image.open('/tmp/an/_f.png');W,H=im.size;im.crop((int(W*.42),int(H*.42),int(W*.98),H)).save(path);return path
with sync_playwright() as p:
    b,pg,errs=open_page(p,1100,620)
    pg.evaluate("()=>{document.querySelector('[data-q=low]').click();document.querySelectorAll('#sw button')[1].click();document.getElementById('mSolo').click()}");pg.wait_for_timeout(1500)
    J(pg,"()=>{const u=__ug;u.enemies.forEach(e=>u.kill(e,'x',true));u.P.pos.set(0,1.3,10);u.P.yaw=0;u.P.pitch=0}")
    rows=[]
    def seq(w,act,steps,name):
        J(pg,"()=>{__ug.switchW(%d)}"%w);pg.evaluate(STEP,30)
        J(pg,"()=>{const u=__ug;%s}"%act);fr=[]
        for i,n in enumerate(steps):
            pg.evaluate(STEP,n);fr.append(snap(pg,'/tmp/an/%s%d.png'%(name,i)))
        sheet(fr,'/tmp/an/seq_%s.png'%name,260)
    seq(0,"u.fire(false)",[1,2,3,6],'rev')
    seq(1,"u.fire(false)",[1,6,4,4,6],'shk')
    seq(2,"u.fire(false)",[2,6,5,5,8],'mnt')
    seq(3,"u.setFire(true,false)",[3,6,10],'gaz')
    J(pg,"()=>{__ug.setFire(false,false);__ug.gas=30}");pg.evaluate(STEP,30);snap(pg,'/tmp/an/gaz_low.png')
    seq(0,"u.inspect()",[8,18,30],'insp')
    J(pg,"()=>{__ug.switchW(1)}");fr=[]
    for i,n in enumerate([2,3,3,4]):pg.evaluate(STEP,n);fr.append(snap(pg,'/tmp/an/draw%d.png'%i))
    sheet(fr,'/tmp/an/seq_draw.png',260)
    print([e for e in errs if 'ReadPixels' not in e and 'ERR_FAILED' not in e][:8])
    b.close()
