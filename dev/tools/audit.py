import os,sys;sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'));from ugenv import *  # пути окружения
import sys,json;sys.path.insert(0,TOOLS)
from base import *
def F(pg,n=30):pg.evaluate("()=>new Promise(r=>{let n=0;const f=()=>{if(++n>%d)r();else requestAnimationFrame(f)};f()})"%n)
E=lambda pg,s:pg.evaluate("()=>__eval(%s)"%json.dumps(s))
JS=r"""(()=>{const out=[];const bx=boxes;const B=new THREE.Box3(),G=new THREE.Box3(),M4=new THREE.Matrix4(),v=new V3();
const inBox=p=>{for(const b of bx)if(p.x>=b.min.x&&p.x<=b.max.x&&p.y>=b.min.y&&p.y<=b.max.y&&p.z>=b.min.z&&p.z<=b.max.z)return true;return p.y<tY(p.x,p.z)};
const test=(bb,tag)=>{const s=bb.getSize(new V3());if(Math.max(s.x,s.z)<1.1||s.y<.7)return;if(s.x>40||s.z>40)return;const g=tY((bb.min.x+bb.max.x)/2,(bb.min.z+bb.max.z)/2);if(bb.min.y>g+2.2)return;if(bb.max.y<g+.5)return;
 let n=0,h=0;for(let i=0;i<3;i++)for(let j=0;j<3;j++)for(let k=0;k<3;k++){v.set(bb.min.x+s.x*(.25+.25*i),Math.max(bb.min.y,g)+(bb.max.y-Math.max(bb.min.y,g))*(.15+.3*j),bb.min.z+s.z*(.25+.25*k));if(v.y>bb.max.y)continue;n++;if(inBox(v))h++}
 if(n&&h/n<.45)out.push([tag,+(h/n).toFixed(2),[(bb.min.x+bb.max.x)/2,(bb.min.y+bb.max.y)/2,(bb.min.z+bb.max.z)/2].map(a=>+a.toFixed(1)),[s.x,s.y,s.z].map(a=>+a.toFixed(1))])};
mapGroup.updateMatrixWorld(true);
mapGroup.traverse(o=>{if(!o.isMesh||o.userData.dyn&&!o.isInstancedMesh&&o.geometry.type==='PlaneGeometry')return;const m=Array.isArray(o.material)?o.material[0]:o.material;if(!m||m.transparent&&m.opacity<.9||m.blending===THREE.AdditiveBlending)return;
 if(o===L4.terr||o.geometry.attributes.position.count>60000)return;let nm=null;for(const D of[L4.VM||{},L4.M||{}])for(const k in D)if(D[k]===m)nm=k;if(m===L4.rockM)nm='ROCK';const col=nm||(m.color?m.color.getHexString():'?');if(o.parent&&o.parent.userData&&o.parent.userData.pepProp)return;const tag=(o.isInstancedMesh?'I:':'')+o.geometry.type+':'+col+(m.map?':tex':'');
 if(!o.geometry.boundingBox)o.geometry.computeBoundingBox();
 if(o.isInstancedMesh){for(let i=0;i<o.count;i++){o.getMatrixAt(i,M4);B.copy(o.geometry.boundingBox).applyMatrix4(M4).applyMatrix4(o.matrixWorld);test(B,tag)}}
 else{B.copy(o.geometry.boundingBox).applyMatrix4(o.matrixWorld);test(B,tag)}});
return JSON.stringify(out)})()"""
with sync_playwright() as p:
    b,pg,errs=open_page(p,640,360)
    J(pg,"()=>__ug.begin('solo','l4')");pg.wait_for_timeout(2500);J(pg,"()=>{window.__dt=1/30;window.__norender=1}");F(pg,10)
    r=json.loads(E(pg,JS))
    open(TOOLS+'/audit.json','w').write(json.dumps(r))
    from collections import Counter
    c=Counter(x[0] for x in r);print(len(r));
    for k,n in c.most_common(40):print(n,k)
    print([e for e in errs if 'ReadPixels' not in e][:5])
    b.close()
