import os,sys;sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'));from ugenv import *  # пути окружения
import sys;sys.path.insert(0,TOOLS)
from base import *
with sync_playwright() as p:
    b,pg,errs=open_page(p,1280,720)
    J(pg,"()=>__ug.mmView('page','story')");pg.wait_for_timeout(800)
    print(J(pg,"()=>{const a=document.querySelector('.lvc .art'),c=getComputedStyle(a),btn=a.parentElement;return [c.height,c.display,c.minHeight,getComputedStyle(btn).display,btn.offsetHeight,[...btn.children].map(x=>x.className)]}"))
    b.close()
