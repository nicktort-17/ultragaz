import os,sys;sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'));from ugenv import *  # пути окружения
import sys,time;sys.path.insert(0,TOOLS)
from base import *
with sync_playwright() as p:
    b,pg,errs=open_page(p,800,450)
    J(pg,"()=>__ug.begin('solo','l2')");pg.wait_for_timeout(2500)
    J(pg,"()=>{document.getElementById('lvCard').hidden=true;__ug.P.iT=1e9;window.__fc=0;const f=()=>{__fc++;requestAnimationFrame(f)};f()}")
    pg.keyboard.press('Digit4');pg.wait_for_timeout(800)
    print('cur',J(pg,"()=>__ug.cur"),J(pg,"()=>__fc"))
    J(pg,"()=>__ug.setFire(true,false)")
    for i in range(8):
        t=time.time()
        try:
            r=pg.evaluate("()=>[__fc,__eval(`T.toFixed(2)`),__eval('gas'),__eval('SODA.d?SODA.d.length:-1')]")
        except Exception as e: r=str(e)[:100]
        print(i,round(time.time()-t,2),r);pg.wait_for_timeout(700)
    J(pg,"()=>__ug.setFire(false,false)")
    print([e for e in errs if 'ReadPixels' not in e and 'ERR_FAILED' not in e][:8])
    b.close()
