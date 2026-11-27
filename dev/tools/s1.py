import sys;sys.path.insert(0,'/tmp/an')
from base import *
W="()=>new Promise(r=>{let n=0;const f=()=>{if(++n>40)r();else requestAnimationFrame(f)};f()})"
def F(pg,n=40):pg.evaluate("()=>new Promise(r=>{let n=0;const f=()=>{if(++n>%d)r();else requestAnimationFrame(f)};f()})"%n)
with sync_playwright() as p:
    b,pg,errs=open_page(p,1280,720)
    pg.route('**/objects/Reflector.js',lambda r:r.fulfill(path='/tmp/t/node_modules/three/examples/js/objects/Reflector.js',content_type='text/javascript'))
    pg.reload();pg.wait_for_timeout(3000)
    pg.keyboard.press('Space');F(pg)
    pg.screenshot(path='/tmp/an/st_main.png')
    pg.keyboard.press('Enter');F(pg,50)
    pg.screenshot(path='/tmp/an/st_story.png')
    print(J(pg,"()=>({v:document.getElementById('menu').dataset.v,pg:__ug.MM.page,lv:__ug.MM.lv})"))
    pg.keyboard.press('Enter');pg.wait_for_timeout(2500)
    print('state',J(pg,"()=>({s:__ug.state,st:!!__ug.story,mode:__ug.mode,wave:__ug.wave,room:__ug.story&&__ug.story.room,pos:[__ug.P.pos.x,__ug.P.pos.y,__ug.P.pos.z]})"))
    pg.screenshot(path='/tmp/an/st_l1_start.png')
    print([e for e in errs if 'ReadPixels' not in e and 'ERR_FAILED' not in e][:8])
    b.close()
