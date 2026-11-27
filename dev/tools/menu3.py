import sys,json;sys.path.insert(0,'/tmp/an')
from base import *
with sync_playwright() as p:
    b,pg,errs=open_page(p,1280,720)
    J(pg,"()=>{__eval(\"prog={l1:{done:1,t:300,g:'A',s:1000},l2:{done:1,t:400,g:'B',s:900}};buildLvList()\");__ug.mmView('page','story')}");pg.wait_for_timeout(1200)
    J(pg,"()=>__eval('buildLvList()')");pg.wait_for_timeout(500)
    pg.screenshot(path='/tmp/an/menu3.png')
    print([e for e in errs if 'ReadPixels' not in e and 'ERR_FAILED' not in e][:5])
    b.close()
