import sys;sys.path.insert(0,'/tmp/an')
from crop import *
shots=sys.argv[1:] or ['title','main','play','hero','manual','settings']
with sync_playwright() as p:
    b,pg,errs=open_page(p,1440,810)
    pg.route('**/objects/Reflector.js',lambda r:r.fulfill(path='/tmp/t/node_modules/three/examples/js/objects/Reflector.js',content_type='text/javascript'))
    pg.reload();pg.wait_for_timeout(3000)
    W="()=>new Promise(r=>{let n=0;const f=()=>{if(++n>90)r();else requestAnimationFrame(f)};f()})"
    J(pg,"()=>{document.querySelectorAll('#sw button')[0].click()}")
    if 'title' in shots:pg.evaluate(W);pg.screenshot(path='/tmp/an/m_title.png')
    pg.keyboard.press('Enter');pg.evaluate(W)
    if 'main' in shots:pg.screenshot(path='/tmp/an/m_main.png')
    for name,idx in [('play',0),('hero',1),('manual',2),('settings',3)]:
        if name not in shots:continue
        J(pg,"()=>{document.querySelectorAll('#mmList .mi')[%d].click()}"%idx);pg.evaluate(W);pg.screenshot(path='/tmp/an/m_%s.png'%name)
        if name=='manual':
            J(pg,"()=>{document.querySelector('.mtab[data-t=guns]').click()}");pg.wait_for_timeout(500);pg.screenshot(path='/tmp/an/m_manual2.png')
            J(pg,"()=>{document.querySelector('.mtab[data-t=foes]').click()}");pg.wait_for_timeout(500);pg.screenshot(path='/tmp/an/m_manual3.png')
        pg.keyboard.press('Escape');pg.evaluate(W)
    print([e for e in errs if 'ReadPixels' not in e and 'ERR_FAILED' not in e][:10])
    b.close()
