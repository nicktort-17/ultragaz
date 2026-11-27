import sys;sys.path.insert(0,'/tmp/an')
from crop import *
with sync_playwright() as p:
    b,pg,errs=open_page(p,900,520)
    pg.evaluate("()=>{document.querySelector('[data-q=low]').click();document.getElementById('mSolo').click()}");pg.wait_for_timeout(1500)
    J(pg,"()=>{const u=__ug;u.enemies.forEach(e=>u.kill(e,'x',true));u.switchW(0)}");pg.wait_for_timeout(800)
    r=[]
    for k in range(3):
        r.append(J(pg,"()=>{const P=__ug.guns[0].userData.parts;return [P.caps.length,P.caps.filter(c=>c.visible).length,document.getElementById('coinsH').textContent]}"))
        J(pg,"()=>{__ug.WP&&0;__ug.fire(true)}");pg.wait_for_timeout(450)
    print(r,errs[:3])
    b.close()
