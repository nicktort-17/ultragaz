import os,sys;sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'));from ugenv import *  # пути окружения
import sys;sys.path.insert(0,TOOLS)
from base import *
with sync_playwright() as p:
    b,pg,errs=open_page(p,1280,720)
    HAVE_THREE and pg.route('**/objects/Reflector.js',lambda r:r.fulfill(path=THREE_DIR+'/examples/js/objects/Reflector.js',content_type='text/javascript'))
    pg.reload();pg.wait_for_timeout(3000)
    J(pg,"()=>__ug.begin('solo','l1')");pg.wait_for_timeout(1500)
    print(J(pg,"""()=>[...document.querySelectorAll('#screen *')].filter(e=>{const r=e.getBoundingClientRect(),c=getComputedStyle(e);return r.width>500&&r.height>200&&c.visibility!=='hidden'&&c.display!=='none'&&+c.opacity>0}).map(e=>{const r=e.getBoundingClientRect();return e.tagName+'#'+e.id+'.'+e.className+' '+[r.x,r.y,r.width,r.height].map(Math.round)+' bg:'+getComputedStyle(e).backgroundColor+' op:'+getComputedStyle(e).opacity})"""))
    J(pg,"()=>{document.getElementById('lvCard').hidden=true}");pg.wait_for_timeout(300)
    pg.screenshot(path=OUT+'/st_l1_nocard.png')
    b.close()
