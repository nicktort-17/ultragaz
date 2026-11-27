import os,sys;sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'));from ugenv import *  # пути окружения
import sys;sys.path.insert(0,TOOLS)
from base import *
with sync_playwright() as p:
    b,pg,errs=open_page(p,320,180)
    for m in ['zavod','plaza']:
        print(m,pg.evaluate("()=>__eval(`curMap=null;loadMap('%s');mapAnims.map(f=>{let e='';try{f(.05)}catch(x){e=' THROWS '+x.message}return f.toString().slice(0,110)+e}).join('\\\\n')`)"%m))
    b.close()
