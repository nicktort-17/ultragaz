import sys;sys.path.insert(0,'/tmp/an')
from crop import *
STEP="(n)=>new Promise(r=>{window.__frz=false;let k=0;const f=()=>{if(++k>=n){window.__frz=true;setTimeout(r,60)}else requestAnimationFrame(f)};requestAnimationFrame(f)})"
with sync_playwright() as p:
    b,pg,errs=open_page(p,1400,800)
    pg.evaluate("()=>{document.querySelector('[data-q=mid]').click();__ug.SHOW.anim='idle'}");pg.wait_for_timeout(800)
    J(pg,"()=>{__ug.bank=20000;__ug.buildHeroUI()}");pg.wait_for_timeout(300)
    pg.locator('#screen').screenshot(path='/tmp/an/cos_menu.png')
    out=[]
    combos=[(1,1,1,0),(2,2,2,3),(3,3,3,5),(4,0,4,6),(0,1,2,2)]
    for i,(c,w,pt,col) in enumerate(combos):
        J(pg,"()=>{window.__frz=false;Object.assign(__ug.myCos,{crest:%d,wings:%d,pattern:%d});document.querySelectorAll('#sw button')[%d].click();__ug.SHOW.drag=%s}"%(c,w,pt,col,[0.5,0.2,2.8,0.4,-0.6][i]))
        pg.evaluate(STEP,8);out.append(hero_crop(pg,'/tmp/an/cs%d.png'%i,10))
    sheet(out,'/tmp/an/cos_sheet.png',460)
    print(J(pg,"()=>document.getElementById('cosm').innerText.slice(0,300)"))
    print([e for e in errs if 'ReadPixels' not in e and 'ERR_FAILED' not in e][:8])
    b.close()
