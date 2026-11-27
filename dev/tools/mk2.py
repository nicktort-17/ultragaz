import sys;sys.path.insert(0,'/tmp/an')
from base import *
def F(pg,n=30):pg.evaluate("()=>new Promise(r=>{let n=0;const f=()=>{if(++n>%d)r();else requestAnimationFrame(f)};f()})"%n)
with sync_playwright() as p:
    b,pg,errs=open_page(p,640,360)
    J(pg,"()=>{__ug.begin('solo','l1')}");pg.wait_for_timeout(1200);F(pg,20)
    print(J(pg,"()=>__eval(`JSON.stringify(beacons.map(b=>({vis:b.g.visible,inScene:!!b.g.parent&&!!b.g.parent.parent,ch:b.g.children.filter(c=>c.geometry&&c.geometry.type==='PlaneGeometry').map(c=>[c.position.x,c.position.y,c.position.z,c.material.opacity.toFixed(2),c.visible].join('/')).slice(0,3)})))`)"))
    b.close()
