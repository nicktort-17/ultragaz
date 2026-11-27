import sys,json;sys.path.insert(0,'/tmp/an')
from base import *
with sync_playwright() as p:
    b,pg,errs=open_page(p,480,270)
    J(pg,"()=>__ug.begin('solo','l3')");pg.wait_for_timeout(1500)
    print(J(pg,"""()=>__eval(`(()=>{const out={direct:0,why:{},groups:[]};for(const c of mapGroup.children){if(c.isMesh){out.direct++;const k=c.userData.merged?'merged':c.userData.dyn?'dyn':c.isInstancedMesh?'inst':Array.isArray(c.material)?'arr':c.material.transparent?'transp':!c.visible?'hidden':!c.geometry.attributes.uv?'nouv':'other';out.why[k]=(out.why[k]||0)+1;if(k==='other'||k==='transp')out.why[k+'_ex']=(out.why[k+'_ex']||[]).concat([c.geometry.type+':'+(c.material.type)]).slice(0,12)}
       else{let n=0;c.traverse(o=>{if(o.isMesh&&o.visible)n++});out.groups.push([n,c.type,c.position.toArray().map(v=>Math.round(v)).join(',')])}}
       out.groups.sort((a,b)=>b[0]-a[0]);out.groups=out.groups.slice(0,14);let sc=0;scene.traverse(o=>{if(o.isMesh&&o.visible)sc++});out.sceneVisible=sc;let hid=0;scene.traverse(o=>{if(o.isMesh&&!o.visible)hid++});out.hidden=hid;return JSON.stringify(out)})()`)"""))
    b.close()
