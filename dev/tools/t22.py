import sys;sys.path.insert(0,'/tmp/an')
from crop import *
with sync_playwright() as p:
    b,pg,errs=open_page(p,1440,810)
    pg.route('**/objects/Reflector.js',lambda r:r.fulfill(path='/tmp/t/node_modules/three/examples/js/objects/Reflector.js',content_type='text/javascript'))
    pg.reload();pg.wait_for_timeout(3000);pg.keyboard.press('Enter');pg.wait_for_timeout(1500)
    print(J(pg,"()=>[...document.querySelectorAll('.mm-cal > *, .mm-cal .cal-r > *, .mm-cal .cal-mw > *')].map(e=>[e.id||e.className,JSON.stringify(e.getBoundingClientRect().toJSON(),(k,v)=>typeof v==='number'?Math.round(v):v)])"))
    # hide canvas to test
    J(pg,"()=>{document.getElementById('calMoon').style.visibility='hidden'}");pg.wait_for_timeout(400)
    pg.screenshot(path='/tmp/an/cal_test.png',clip={'x':1050,'y':0,'width':390,'height':110})
    b.close()
