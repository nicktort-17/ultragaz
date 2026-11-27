import sys;sys.path.insert(0,'/tmp/an')
from crop import *
with sync_playwright() as p:
    b,pg,errs=open_page(p,1600,900)
    pg.evaluate("()=>{document.querySelector('[data-q=high]').click();document.querySelectorAll('#sw button')[0].click()}");pg.wait_for_timeout(1200)
    out=[]
    for i,drag in enumerate([0,1.57,3.14,-1.57]):
        J(pg,"()=>{__ug.SHOW.anim='idle';__ug.SHOW.drag=%s}"%drag);pg.wait_for_timeout(800);out.append(hero_crop(pg,'/tmp/an/h%d.png'%i))
    sheet(out,'/tmp/an/turn.png',520)
    b.close()
