import os,sys;sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'));from ugenv import *  # пути окружения
import sys,json;sys.path.insert(0,TOOLS)
from base import *
def F(pg,n=30):pg.evaluate("()=>new Promise(r=>{let n=0;const f=()=>{if(++n>%d)r();else requestAnimationFrame(f)};f()})"%n)
with sync_playwright() as p:
    b,pg,errs=open_page(p,640,360)
    for lv,pos in [(None,[0,0,10]),('plaza',[0,0,20]),('l1',[0,0,12]),('l1',[0,0,-100]),('l2',[0,3.2,10]),('l2',[0,2.8,-91])]:
        mp="plaza" if lv=="plaza" else "zavod";J(pg,"()=>{window.__norender=0;__eval(\"mapId='"+mp+"'\");__ug.begin('solo',"+json.dumps(None if lv=='plaza' else lv)+")}");pg.wait_for_timeout(900)
        J(pg,"()=>__eval('P.pos.set(%f,%f,%f);P.iT=1e9;document.getElementById(\"lvCard\").hidden=true')"%tuple(pos));F(pg,60)
        r=J(pg,"""()=>__eval(`let pl=0,dl=0,sh=0,meshes=0,tr=0,inst=0;scene.traverse(o=>{if(o.isPointLight)pl++;if(o.isDirectionalLight){dl++;if(o.castShadow)sh++}if(o.isMesh){meshes++;if(o.isInstancedMesh)inst++}});
          renderer.info.autoReset=false;renderer.info.reset();renderer.render(scene,camera);const c=renderer.info.render.calls,t=renderer.info.render.triangles;renderer.info.autoReset=true;
          let t0=performance.now();for(let i=0;i<20;i++){window.__norender=1;}
          JSON.stringify({pl,dl,sh,meshes,inst,calls:c,tris:t,level:level.length,boxes:boxes.length,anims:mapAnims.length,en:enemies.length})`)""")
        # время кадра без рендера
        t=J(pg,"()=>{window.__norender=1;return new Promise(res=>{const t0=performance.now();let n=0;const f=()=>{if(++n>=60)res((performance.now()-t0)/60);else requestAnimationFrame(f)};f()})}")
        print(lv,pos,r,'rAF ms(no render)',round(t,2),flush=True)
    b.close()
