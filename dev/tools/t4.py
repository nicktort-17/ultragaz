import sys;sys.path.insert(0,'/tmp/an')
from crop import *
POSES=[('run',.3,1.2),('run',.55,1.2),('jump',.25,1.3),('slide',.6,1.0),('dash',.1,1.3),('slam',.5,1.3),('punch',.12,.5),('fire',.05,1.2),('death',.25,.4),('death',1.6,.4)]
with sync_playwright() as p:
    b,pg,errs=open_page(p,1200,680)
    pg.evaluate("()=>{document.querySelector('[data-q=mid]').click();document.querySelectorAll('#sw button')[1].click()}");pg.wait_for_timeout(1200)
    out=[]
    for i,(an,t,drag) in enumerate(POSES):
        J(pg,"()=>{window.__frz=false;const S=__ug.SHOW;S.anim='%s';S.t=0;S.drag=%s}"%(an,drag))
        J(pg,"()=>new Promise(r=>{const S=__ug.SHOW;const go=()=>{if(S.t>=%s){window.__frz=true;r()}else requestAnimationFrame(go)};go()})"%t)
        pg.wait_for_timeout(450)
        out.append(hero_crop(pg,'/tmp/an/a%d.png'%i))
    J(pg,"()=>{window.__frz=false}")
    sheet(out[:5],'/tmp/an/anim1.png',430);sheet(out[5:],'/tmp/an/anim2.png',430)
    print([e for e in errs if 'ReadPixels' not in e and 'ERR_FAILED' not in e][:8])
    b.close()
