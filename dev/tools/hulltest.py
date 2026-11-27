import sys,json;sys.path.insert(0,'/tmp/an')
from base import *
with sync_playwright() as p:
    b,pg,errs=open_page(p,320,180)
    J(pg,"()=>__ug.begin('solo','l3')");pg.wait_for_timeout(1500)
    r=J(pg,"""()=>__eval(`(()=>{const out=[];const starts=[];for(let z=-94;z<=56;z+=2)for(const x of[-10,-5,0,5,10]){if(onHull(x,z)&&Math.abs(x)<hullHW(z)-1)starts.push([x,z])}
     for(const [sx,sz] of starts)for(let a=0;a<16;a++){const ang=a/16*Math.PI*2,p=new THREE.Vector3(sx,.01,sz),v=new THREE.Vector3();
       if(boxes.some(b=>ov(p,.4,1.75,b)))continue;
       for(let i=0;i<150;i++){v.x=Math.sin(ang)*13;v.z=Math.cos(ang)*13;v.y-=27/60;const r=moveBody(p,v,.4,1.75,1/60,true);if(r.ground&&v.y<0)v.y=0}
       if(!onHull(p.x,p.z)||p.y<-.5)out.push([sx,sz,+(ang).toFixed(2),+p.x.toFixed(1),+p.y.toFixed(1),+p.z.toFixed(1)])}
     return JSON.stringify({n:starts.length,bad:out.length,ex:out.slice(0,25)})})()`)""")
    print(r)
    print([e for e in errs if 'ReadPixels' not in e and 'ERR_FAILED' not in e][:5])
    b.close()
