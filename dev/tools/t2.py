import os,sys;sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'));from ugenv import *  # пути окружения
import sys;sys.path.insert(0,TOOLS)
from base import *
from PIL import Image
with sync_playwright() as p:
    b,pg,errs=open_page(p,1280,720)
    pg.evaluate("()=>{document.querySelector('[data-q=mid]').click()}");pg.wait_for_timeout(1200)
    shots=[]
    for i,(an,drag) in enumerate([('idle',0),('idle',1.2),('idle',2.6),('idle',3.6),('run',0.6),('slide',0.6),('jump',0.6),('death',0.6)]):
        J(pg,"()=>{__ug.SHOW.anim='%s';__ug.SHOW.t=%s;__ug.SHOW.drag=%s}"%(an,'0.5' if an!='death' else '1.2',drag))
        pg.wait_for_timeout(900 if an!='death' else 1500)
        pg.locator('#screen').screenshot(path=OUT+'/s%d.png'%i);shots.append(OUT+'/s%d.png'%i)
    ims=[Image.open(x) for x in shots];w,h=ims[0].size
    # crop left 55%
    cw=int(w*.55);sheet=Image.new('RGB',(cw*4,h*2))
    for k,im in enumerate(ims):sheet.paste(im.crop((0,0,cw,h)),((k%4)*cw,(k//4)*h))
    sheet=sheet.resize((sheet.width//2,sheet.height//2));sheet.save(OUT+'/sheet1.png')
    print([e for e in errs if 'ReadPixels' not in e and 'ERR_FAILED' not in e][:8])
    b.close()
