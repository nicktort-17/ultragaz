import sys,json;sys.path.insert(0,'/tmp/an')
from base import *
def F(pg,n=30):pg.evaluate("()=>new Promise(r=>{let n=0;const f=()=>{if(++n>%d)r();else requestAnimationFrame(f)};f()})"%n)
E=lambda pg,s:pg.evaluate("()=>__eval(%s)"%json.dumps(s))
with sync_playwright() as p:
    b,pg,errs=open_page(p,480,270)
    J(pg,"()=>__ug.begin('solo','l4')");pg.wait_for_timeout(1500);J(pg,"()=>{window.__dt=1/30;window.__norender=1}")
    F(pg,30)
    E(pg,"(()=>{P.pos.set(0,9.05,-112);P.vel.set(0,0,0);story.room=2;story.phase='clear';window.__log=[];window.__hurt=0;window.__hp=100})()")
    F(pg,10)
    # каждые 6 кадров: стрелять по ближайшей хит-сфере (слабое место, если есть), следить за урон-логом
    SIM="""(()=>{const e=enemies.find(x=>x.type==='pep');const L=window.__log;
      if(P.hp<window.__hp)window.__hurt+=window.__hp-P.hp;if(P.hp<35)P.hp=100;window.__hp=P.hp;
      if(!e){if(L[L.length-1]!=='gone')L.push('gone');return}
      const k=e.st+':'+e.ac;if(L[L.length-1]!==k)L.push(k+' t='+T.toFixed(1)+' hp='+Math.round(e.hp));
      const R=e.g.userData.pep;if(!R)return;const ph=e.ac===61?4:e.ac<20?1:e.ac<40?2:3;const tgt=(ph===3?R.core:ph===4?R.tor:R.hd).getWorldPosition(new V3());
      // игрок держится в 13 м от босса и стреляет
      const d=new V3(P.pos.x-e.pos.x,0,P.pos.z-e.pos.z);const dl=d.length()||1;const want=13;P.pos.x=e.pos.x+d.x/dl*want;P.pos.z=e.pos.z+d.z/dl*want;P.pos.x=Math.max(-24,Math.min(24,P.pos.x));P.pos.z=Math.max(-137,Math.min(-106,P.pos.z));
      const o=camera.position,dir=tgt.clone().sub(o).normalize();P.yaw=Math.atan2(-dir.x,-dir.z);P.pitch=Math.asin(dir.y);
      if(e.ac===15){P.pos.set(e.pos.x+Math.sin(e.g.rotation.y)*4,P.pos.y,e.pos.z+Math.cos(e.g.rotation.y)*4);punch()}
      else hitscan(dir,2.2,false,'rev',0xffe3a3,true)})()"""
    t=0
    for k in range(1500):
        E(pg,SIM);F(pg,4);t+=4/30
        if k%100==0:
            st=E(pg,"(()=>{const e=enemies.find(x=>x.type==='pep');return e?[e.st,e.ac,Math.round(e.hp),Math.round(e.maxHp)]:story.phase})()")
            print(round(t,1),st,flush=True)
            if st=='exit':break
    print(E(pg,"JSON.stringify(window.__log)"))
    print('hurt total',E(pg,"window.__hurt"),'phase',J(pg,"()=>__ug.story.phase"),'win',E(pg,"!!story.pepWin"),'fx',E(pg,"JSON.stringify(PEP.fx.map(f=>f.k))"))
    print([e for e in errs if 'ReadPixels' not in e and 'ERR_FAILED' not in e][:10])
    b.close()
