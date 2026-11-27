import sys;sys.path.insert(0,'/tmp/an')
from base import *
with sync_playwright() as p:
    b,pg,errs=open_page(p,640,360)
    J(pg,"()=>{__ug.begin('solo','l4')}");pg.wait_for_timeout(2500)
    print(J(pg,"()=>__eval('(()=>{const o={};for(const [x,z] of [[-24,24],[0,20],[0,30],[0,34],[-10,28],[20,26],[-30,10]])o[x+\",\"+z]=TERR.h(x,z).toFixed(2);return o})()')"))
    b.close()
