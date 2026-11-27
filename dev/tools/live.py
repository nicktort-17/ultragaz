import os,sys;sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'));from ugenv import *  # пути окружения
import sys,json;sys.path.insert(0,TOOLS)
from base import *
def F(pg,n=30):pg.evaluate("()=>new Promise(r=>{let n=0;const f=()=>{if(++n>%d)r();else requestAnimationFrame(f)};f()})"%n)
MON="""window.__viol=[];window.__ext=null;window.__mon=setInterval(()=>__eval(`if(!window.__ext){const e={x0:1e9,x1:-1e9,z0:1e9,z1:-1e9};for(const b of boxes){if(b.max.y-b.min.y<2)continue;e.x0=Math.min(e.x0,b.min.x);e.x1=Math.max(e.x1,b.max.x);e.z0=Math.min(e.z0,b.min.z);e.z1=Math.max(e.z1,b.max.z)}window.__ext=e}
 const E=window.__ext,bodies=enemies.map(e=>[e.type,e.pos,e.type==='queen'||ENEMY[e.type].fly?0:1]).concat([['player',P.pos,1]]);
 for(const [t,p,g] of bodies){const mid=new V3(p.x,p.y+(g?1:0),p.z);const out=p.x<E.x0+.5||p.x>E.x1-.5||p.z<E.z0+.5||p.z>E.z1-.5;
  const inw=boxes.some(b=>b.max.y-b.min.y>2&&mid.x>b.min.x+.05&&mid.x<b.max.x-.05&&mid.z>b.min.z+.05&&mid.z<b.max.z-.05&&mid.y>b.min.y&&mid.y<b.max.y);
  if((out||inw)&&window.__viol.length<20)window.__viol.push(t+(out?' OUT ':' INWALL ')+[p.x,p.y,p.z].map(v=>v.toFixed(1)).join(','))}`),100)"""
with sync_playwright() as p:
    b,pg,errs=open_page(p,320,180)
    for lv,setup,secs in json.loads(sys.argv[1]):
        J(pg,"()=>{window.__norender=1;window.__ext=null;clearInterval(window.__mon)}")
        J(pg,"()=>{if(%s===null)__eval(\"mapId='plaza'\");__ug.begin('solo',%s)}"%(json.dumps(lv),json.dumps(lv)));pg.wait_for_timeout(800)
        J(pg,"()=>{"+MON+";__eval(`P.iT=1e9;"+setup+"`)}")
        for k in range(secs):
            F(pg,30);J(pg,"()=>__eval('P.iT=1e9;P.hp=100')")
        print(lv,setup[:40],J(pg,"()=>({v:window.__viol,en:__eval('enemies.map(e=>e.type).join()')})"),flush=True)
    print([e for e in errs if 'ReadPixels' not in e and 'ERR_FAILED' not in e][:5])
    b.close()
