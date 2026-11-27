import sys;sys.path.insert(0,'/tmp/an')
from base import *
def F(pg,n=30):pg.evaluate("()=>new Promise(r=>{let n=0;const f=()=>{if(++n>%d)r();else requestAnimationFrame(f)};f()})"%n)
with sync_playwright() as p:
    b,pg,errs=open_page(p,960,540)
    J(pg,"()=>__ug.begin('solo','l2')");pg.wait_for_timeout(2500)
    J(pg,"()=>__eval(`gzAlert('КАРАМЕЛЬНАЯ ЦАРИЦА','ФАЗА 2','уходит в сироп')`)");pg.wait_for_timeout(500)
    print(J(pg,"()=>{const d=document.getElementById('phA');const r=d.getBoundingClientRect();return [d.className,getComputedStyle(d).display,getComputedStyle(d).opacity,r.width,r.height,getComputedStyle(d.parentElement).visibility]}"))
    pg.screenshot(path='/tmp/an/gz_alert.png')
    b.close()
