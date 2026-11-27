import sys;sys.path.insert(0,'/tmp/an')
from base import *
with sync_playwright() as p:
    b,pg,errs=open_page(p,960,540)
    J(pg,"()=>{__ug.begin('solo','l4')}");pg.wait_for_timeout(2500)
    print(J(pg,"()=>__eval('(()=>{const d=L4.depthTex.image.data,nx=TERR.nx;const k=(x,z)=>{const i=Math.round((x-TG.x0)/TG.c),j=Math.round((z-TG.z0)/TG.c);return [d[(j*nx+i)*4],TERR.h(x,z).toFixed(2)]};return {a:k(0,60),b:k(0,30),c:k(20,10),d:k(-60,0),u:L4.seaM.uniforms.uTG.value.toArray(),w:L4.depthTex.image.width,h:L4.depthTex.image.height}})()')"))
    b.close()
