import sys,json;sys.path.insert(0,'/tmp/an')
from base import *
def F(pg,n=30):pg.evaluate("()=>new Promise(r=>{let n=0;const f=()=>{if(++n>%d)r();else requestAnimationFrame(f)};f()})"%n)
E=lambda pg,s:pg.evaluate("()=>__eval(%s)"%json.dumps(s))
with sync_playwright() as p:
    b,pg,errs=open_page(p,1280,720)
    J(pg,"()=>__ug.begin('solo','l4')");pg.evaluate('()=>{window.__L='+(sys.argv[1] if len(sys.argv)>1 else 'null')+';window.__C0='+(sys.argv[2] if len(sys.argv)>2 else '1')+'}');pg.wait_for_timeout(2500);J(pg,"()=>{window.__dt=1/30}");F(pg,8)
    E(pg,"(()=>{P.iT=1e9;story.phase='clear';for(const e of enemies)scene.remove(e.g);enemies.length=0;toSpawn=[];L4.intro.t=30;L4.intro.hop=1;gunScene.visible=false;for(const c of gunScene.children)c.visible=false;L4.car.visible=false;for(const el of document.body.children)if(el.tagName!=='CANVAS'&&!el.querySelector('canvas'))el.style.visibility='hidden';for(const el of document.querySelectorAll('.hud'))el.style.visibility='hidden'})()")
    E(pg,"(()=>{P.pos.set(1,TERR.h(1,17.5)+.05,17.5);P.yaw=0;P.pitch=.06;P.vel.set(0,0,0);const L=(window.__L||[['vend',-6],['can',-3],['keto',0],['golem',4],['drone',8]]);for(const [t,x] of L)spawnEnemy(t,new V3(x,TERR.h(x,8)+.1,8));for(const e of enemies){e.cd=e.cd2=e.cd4=e.cd5=e.cd6=e.cdR=e.cdK=e.cdJ=99}})()")
    F(pg,3);J(pg,"()=>{window.__dt=1e-4}");F(pg,3)
    pg.screenshot(path='/tmp/tour/blue_line.png')
    print(E(pg,"enemies.map(e=>e.type+':'+e.blue+':'+Math.round(e.hp)).join(' ')"))
    # бой: счётчик новых атак
    E(pg,"(()=>{story.phase='clear';toSpawn=[];window.__cnt={};for(const e of enemies){e.cd4=e.cd5=e.cd6=e.cdR=e.cdK=window.__C0??1}window.__dt=1/30})()")
    J(pg,"()=>{window.__norender=1}")
    E(pg,"(()=>{window.__tick=setInterval(()=>{P.iT=1e9;hp=100;for(const e of enemies){for(const s of['vw','gw','bn','rw','rush','kw','kd'])if(e[s]>0)__cnt[s]=(__cnt[s]||0)+1}},16)})()")
    for k in range(0):
        E(pg,"(()=>{P.iT=1e9;hp=100;for(const e of enemies){for(const s of['vw','gw','bn','rw','rush','kw','kd'])if(e[s]>0)__cnt[s]=(__cnt[s]||0)+1}})()")
    F(pg,400);print(E(pg,"JSON.stringify(__cnt)"),'wrings',E(pg,"wrings.length"),'alive',E(pg,"enemies.map(e=>e.type).join(',')"))
    print([e for e in errs if 'ReadPixels' not in e and 'ERR_FAILED' not in e][:5])
    b.close()
