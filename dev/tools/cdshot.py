import os,sys;sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'));from ugenv import *  # пути окружения
import sys,json;sys.path.insert(0,TOOLS)
from base import *
def F(pg,n=30):pg.evaluate("()=>new Promise(r=>{let n=0;const f=()=>{if(++n>%d)r();else requestAnimationFrame(f)};f()})"%n)
E=lambda pg,s:pg.evaluate("()=>__eval(%s)"%json.dumps(s))
with sync_playwright() as p:
    b,pg,errs=open_page(p,1280,720)
    J(pg,"()=>__ug.begin('solo','l1')");pg.wait_for_timeout(3000);F(pg,10)
    for i,(ch,rg) in enumerate([(4,0),(2,.5),(1,1.2),(0,.2)]):
        E(pg,"(()=>{P.iT=1e9;coinCh=%d;coinRegen=%f;CD.prev=coinCh})()"%(ch,rg));F(pg,4);E(pg,"(()=>{coinCh=%d;coinRegen=%f})()"%(ch,rg));F(pg,2)
        pg.screenshot(path=OUT+'/tour/cd%d.png'%i,clip={'x':620,'y':330,'width':560,'height':390})
    print('dial',E(pg,"!!CD.mesh"),[e for e in errs if 'ReadPixels' not in e and 'ERR_FAILED' not in e][:5])
    b.close()
from PIL import Image
ims=[Image.open(OUT+'/tour/cd%d.png'%i) for i in range(4)];o=Image.new('RGB',(1120,780))
for k,im in enumerate(ims):o.paste(im,((k%2)*560,(k//2)*390))
o.save(OUT+'/tour/cdsheet.png')
