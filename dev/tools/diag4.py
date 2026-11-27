import sys,json;sys.path.insert(0,'/tmp/an')
from base import *
with sync_playwright() as p:
    b,pg,errs=open_page(p,480,270)
    J(pg,"()=>__ug.begin('solo','l3')");pg.wait_for_timeout(1500)
    print(J(pg,"""()=>__eval(`(()=>{const ch=L3.chand.parent;const r=[];ch.traverse(o=>{if(o.isMesh)r.push(o.geometry.type+':'+o.material.type+':'+o.material.uuid.slice(0,4)+':'+(o.parent===L3.chand?'arm':'ch'))});return JSON.stringify(r)})()`)"""))
    print(J(pg,"""()=>__eval(`(()=>{const G=L3.q.G;const r={};G.g.traverse(o=>{if(o.isMesh){const k=o.parent.type+':'+o.material.uuid.slice(0,4);r[k]=(r[k]||0)+1}});return JSON.stringify(r)})()`)"""))
    b.close()
