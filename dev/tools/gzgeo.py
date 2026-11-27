import sys;sys.path.insert(0,'/tmp/an')
from base import *
with sync_playwright() as p:
    b,pg,errs=open_page(p,640,360)
    J(pg,"()=>__ug.begin('solo','l2')");pg.wait_for_timeout(3000)
    J(pg,"()=>{__ug.switchW(3)}");pg.wait_for_timeout(800)
    print(J(pg,"""()=>__eval(`(()=>{const g=guns[3],u=g.userData;g.position.set(0,0,0);g.rotation.set(0,0,0);g.updateMatrixWorld(true);const r={};for(const [k,re] of [['head',/^Голова[ _]сифона/],['noz',/^(Носик|Дульце)/],['bot',/^Бутылка[ _]сифона/],['grip',/^Рукоять/],['lever',/^Рычаг[ _]сифона/]]){const b=boxIn(u.model,re,g);r[k]=b?[b.min.toArray().map(v=>+v.toFixed(2)),b.max.toArray().map(v=>+v.toFixed(2))]:null}r.mz=u.mz.toArray().map(v=>+v.toFixed(2));return r})()`)"""))
    b.close()
