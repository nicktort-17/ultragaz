import os,sys;sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'));from ugenv import *  # пути окружения
import sys;sys.path.insert(0,TOOLS)
from base import *
with sync_playwright() as p:
    b,pg,errs=open_page(p)
    pg.evaluate("()=>document.querySelector('[data-q=mid]').click()");pg.wait_for_timeout(1500)
    shot_screen(pg,OUT+'/menu1.png')
    print(J(pg,"()=>{const u=__ug;return {glb:u.guns.map(g=>!!g.userData.glb),gi:u.guns.map(g=>g.userData.gi?['rx','rzF','rzB','h','tilt','gy','gz','gb'].map(k=>g.userData.gi[k]!=null?+g.userData.gi[k].toFixed(3):null):null),parts:u.guns.map(g=>g.userData.parts?Object.keys(g.userData.parts).filter(k=>g.userData.parts[k]):null),tp:u.selfHero.J.tp.map(x=>!!x)}}"))
    print(errs[:10])
    b.close()
