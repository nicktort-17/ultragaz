import sys,json;sys.path.insert(0,'/tmp/an')
from base import *
def F(pg,n=30):pg.evaluate("()=>new Promise(r=>{let n=0;const f=()=>{if(++n>%d)r();else requestAnimationFrame(f)};f()})"%n)
with sync_playwright() as p:
    b,pg,errs=open_page(p,960,540)
    J(pg,"()=>__ug.begin('solo','l4')");pg.wait_for_timeout(1500)
    J(pg,"()=>{document.getElementById('lvCard').hidden=true;__ug.P.iT=1e9;window.__dt=1/30;__eval('L4.intro.t=20;L4.intro.hop=1;L4.car.visible=false')}");F(pg,10)
    J(pg,"()=>{window.__frz=1;__eval('gunScene.visible=false');const P=__ug.P;P.pos.set(-24,1.6,24);P.yaw=-2.3;P.pitch=-.3}");F(pg,5);pg.screenshot(path='/tmp/an/d0.png')
    J(pg,"()=>{__eval('mapGroup.children.forEach(o=>{if(o.material&&o.material.uniforms&&o.material.uniforms.uDep)o.visible=false})')}");F(pg,5);pg.screenshot(path='/tmp/an/d1.png')
    b.close()
