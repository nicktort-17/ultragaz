import sys;sys.path.insert(0,'/tmp/an')
from base import *
with sync_playwright() as p:
    b,pg,errs=open_page(p,960,540)
    t=J(pg,"()=>{const t0=performance.now();__ug.begin('solo','l4');return performance.now()-t0}")
    pg.wait_for_timeout(4000)
    print('build ms',t)
    print(J(pg,"()=>__eval('({tris:renderer.info.render.triangles,calls:renderer.info.render.calls,boxes:boxes.length,terr:!!TERR,pos:P.pos.toArray().map(v=>+v.toFixed(2))})')"))
    pg.wait_for_timeout(5000)
    print(J(pg,"()=>__eval('({pos:P.pos.toArray().map(v=>+v.toFixed(2)),room:story.room,ph:story.phase,intro:L4.intro.t})')"))
    pg.screenshot(path='/tmp/an/l4a.png')
    print([e for e in errs if 'ReadPixels' not in e and 'ERR_FAILED' not in e][:8])
    b.close()
