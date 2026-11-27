import sys,json;sys.path.insert(0,'/tmp/an')
from base import *
def F(pg,n=30):pg.evaluate("()=>new Promise(r=>{let n=0;const f=()=>{if(++n>%d)r();else requestAnimationFrame(f)};f()})"%n)
with sync_playwright() as p:
    b,pg,errs=open_page(p,640,360)
    for lv,setup in [('l1','P.pos.set(0,0,12)'),('l2','story.room=1;story.phase="clear";P.pos.set(0,2.8,-91)'),('l2','P.pos.set(0,3.2,10)')]:
        J(pg,"()=>{window.__norender=1;__ug.begin('solo','%s')}"%lv);pg.wait_for_timeout(800)
        J(pg,"()=>__eval(`P.iT=1e9;%s`)"%setup);F(pg,200)
        J(pg,"()=>__eval(`for(let i=0;i<10;i++)spawnEnemy(['vend','can','jelly','drone','golem'][i%5],spawns[i%spawns.length]);P.iT=1e9`)");F(pg,30)
        J(pg,"()=>{window.__fts=0;window.__ftn=0}");F(pg,120)
        print(lv,setup[:30],J(pg,"()=>({ms:+(window.__fts/window.__ftn).toFixed(2),en:__eval('enemies.length'),pr:__eval('proj.length')})"),flush=True)
    print([e for e in errs if 'ReadPixels' not in e and 'ERR_FAILED' not in e][:5])
    b.close()
