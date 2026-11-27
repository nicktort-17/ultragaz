import os,sys;sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'));from ugenv import *  # пути окружения
import sys;sys.path.insert(0,TOOLS)
from crop import *
from PIL import Image
args=sys.argv[1:]
with sync_playwright() as p:
    b,pg,errs=open_page(p,1200,680)
    pg.evaluate("()=>{document.querySelector('[data-q=mid]').click();document.querySelectorAll('#sw button')[0].click();document.getElementById('mSolo').click()}");pg.wait_for_timeout(1500)
    J(pg,"()=>{const u=__ug;u.enemies.forEach(e=>u.kill(e,'x',true));u.P.pos.set(0,1.3,10);u.P.yaw=0;u.P.pitch=0}")
    out=[]
    for w in range(4):
        J(pg,"()=>{window.__frz=false;__ug.switchW(%d)}"%w);pg.wait_for_timeout(1500)
        J(pg,"()=>{window.__frz=true}");pg.wait_for_timeout(250)
        pg.locator('#screen').screenshot(path=OUT+'/fp%d.png'%w);out.append(OUT+'/fp%d.png'%w)
    J(pg,"()=>{window.__frz=false}")
    ims=[Image.open(x) for x in out];w,h=ims[0].size;S=Image.new('RGB',(w*2,h*2))
    for k,im in enumerate(ims):S.paste(im,((k%2)*w,(k//2)*h))
    S.resize((w,h)).save(OUT+'/fpsheet.png')
    print([e for e in errs if 'ReadPixels' not in e and 'ERR_FAILED' not in e][:8])
    b.close()
