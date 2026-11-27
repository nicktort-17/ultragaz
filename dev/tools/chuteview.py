import sys;sys.path.insert(0,'/tmp/an')
from base import *
def F(pg,n=30):pg.evaluate("()=>new Promise(r=>{let n=0;const f=()=>{if(++n>%d)r();else requestAnimationFrame(f)};f()})"%n)
with sync_playwright() as p:
    b,pg,errs=open_page(p,960,600)
    J(pg,"()=>__ug.begin('solo','l3')");pg.wait_for_timeout(2500)
    J(pg,"""()=>__eval(`(()=>{enemies.forEach(e=>e.dead=1);const G=buildGirl(ALT_O);G.g.position.set(0,6,-72);mapGroup.add(G.g);const c=buildChute();mapGroup.add(c);window.__C={G,c,t:0};
     gunScene.visible=false;window.__frz=1;const P=__ug.P;P.pos.set(0,4.6,-63.5);P.yaw=0;P.pitch=.32;P.iT=1e9})()`)""")
    for k in range(3):
        J(pg,"""()=>__eval(`(()=>{const {G,c}=__C;for(let i=0;i<12;i++){__C.t+=1/30;girlPose(G,'chute',1/30,{lHip:[Math.sin(__C.t*2.7)*.18,0,0],rHip:[-Math.sin(__C.t*2.7)*.18,0,0],wind:new V3(0,1.6,0)});c.position.copy(G.g.position).add(new V3(0,3.5,0));c.rotation.set(.12*Math.sin(__C.t),__C.t*.15,.1);updChute(c,G,__C.t,0)}})()`)""")
        F(pg,4);pg.screenshot(path='/tmp/an/cv_%d.png'%k)
    print([e for e in errs if 'ReadPixels' not in e and 'ERR_FAILED' not in e][:5])
    b.close()
