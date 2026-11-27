import os,sys;sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'));from ugenv import *  # пути окружения
import sys;sys.path.insert(0,TOOLS)
from crop import *
with sync_playwright() as p:
    b,pg,errs=open_page(p,1600,900)
    pg.evaluate("()=>{document.querySelector('[data-q=high]').click();document.querySelectorAll('#sw button')[0].click()}");pg.wait_for_timeout(1200)
    out=[]
    for i,drag in enumerate([0,1.57,3.14,-1.57]):
        J(pg,"()=>{__ug.SHOW.anim='idle';__ug.SHOW.drag=%s}"%drag);pg.wait_for_timeout(800);out.append(hero_crop(pg,OUT+'/h%d.png'%i))
    sheet(out,OUT+'/turn.png',520)
    b.close()
