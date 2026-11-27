import os,sys;sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'));from ugenv import *  # пути окружения
# Остров Пепсштейна: синие (усиленные) версии обычных врагов + по одной новой атаке.
import re
P=INDEX
s=open(P,encoding='utf-8').read()
def rep(a,b,cnt=1):
    global s
    if b in s: return  # уже применено (раньше проверялось ещё «a not in s» — вставки, где a входит в b, дублировались)
    assert s.count(a)==cnt,('anchor',a[:90],s.count(a));s=s.replace(a,b)

JS=r'''/*BLUE4*/
const BLUE_T={vend:1,can:1,drone:1,golem:1,keto:1},BLUE=0x2f6bff,BLUE_L=0x8cc0ff;
function blueOn(type){return curMap==='l4'&&!!BLUE_T[type]}
function blueCanvas(src){const c=document.createElement('canvas');c.width=src.width;c.height=src.height;const g=c.getContext('2d');g.drawImage(src,0,0);const im=g.getImageData(0,0,c.width,c.height),d=im.data;
 for(let i=0;i<d.length;i+=4){const r=d[i],gg=d[i+1],b=d[i+2],mx=Math.max(r,gg,b),mn=Math.min(r,gg,b);if(mx<30||mx-mn<40||r!==mx||gg>r*.72)continue;
  // красный → синий: меняем местами R и B, зелёный чуть поднимаем для «пепси-синего»
  d[i]=b;d[i+1]=Math.min(255,gg+(r-gg)*.28);d[i+2]=r}
 g.putImageData(im,0,0);return c}
function blueify(e){const seen=new Set(),hsl={};e.g.traverse(o=>{if(!o.isMesh)return;(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>{if(!m||seen.has(m))return;seen.add(m);
 if(m.color){m.color.getHSL(hsl);if((hsl.h<.06||hsl.h>.93)&&hsl.s>.35)m.color.setHSL(.6,Math.min(1,hsl.s*1.05),Math.min(.56,hsl.l*1.3+.04))}
 if(m.map&&m.map.image&&m.map.image.getContext){const t=new THREE.CanvasTexture(blueCanvas(m.map.image));t.anisotropy=m.map.anisotropy;t.wrapS=m.map.wrapS;t.wrapT=m.map.wrapT;t.repeat.copy(m.map.repeat);if('colorSpace' in t)t.colorSpace=m.map.colorSpace;else t.encoding=m.map.encoding;m.map=t;m.needsUpdate=true}})});
 if(e.eyes&&e.type!=='vend'&&e.type!=='keto')e.eyes.color.setHex(0x59b0ff)}
function enemyShotDir(from,dir,speed,dmg,size,hex){const m=new THREE.Mesh(new THREE.SphereGeometry(size,14,10),new THREE.MeshBasicMaterial({color:hex}));m.position.copy(from);scene.add(m);proj.push({m,vel:dir.clone().normalize().multiplyScalar(speed),owner:'enemy',dmg,r:size,t:7,kind:'orb',netId:++pnid})}
function aimDir(from,t,speed){const d=new V3(t.pos.x,t.pos.y+1,t.pos.z).sub(from);d.add(t.vel.clone().multiplyScalar(d.length()/speed*.5));return d.normalize()}
/*BLUE4-END*/
'''
if '/*BLUE4*/' in s: s=re.sub(r'/\*BLUE4\*/.*?/\*BLUE4-END\*/\n',lambda m:JS,s,flags=re.S)
else:
    a='function makeEnemy(type,pos,id){';assert s.count(a)==1;s=s.replace(a,JS+a)

# усиление + перекраска при создании (на клиенте в коопе тоже — тот же makeEnemy)
rep("if((type==='queen'||type==='alt'||type==='pep')&&mode==='coop')e.hp*=1+.6*remotes.size;e.maxHp=e.hp;return e}",
    "if((type==='queen'||type==='alt'||type==='pep')&&mode==='coop')e.hp*=1+.6*remotes.size;if(blueOn(type)){e.blue=1;e.hp*=1.4;e.speed*=1.12;blueify(e)}e.maxHp=e.hp;return e}")
rep("puff(new V3(pos.x,Math.max(1,pos.y+1),pos.z),40,type==='banan'?0xffe135:type==='jelly'||type==='queen'?0xffa030:0xff2a3a",
    "puff(new V3(pos.x,Math.max(1,pos.y+1),pos.z),40,type==='banan'?0xffe135:type==='jelly'||type==='queen'?0xffa030:blueOn(type)?0x3a7bff:0xff2a3a")
rep("e.wind>0||e.lw>0?0x661111","e.wind>0||e.lw>0||e.vw>0||e.gw>0||e.kw>0||e.rw>0?(e.blue?0x123c8a:0x661111)")
rep("ring(e.pos,3.2,0xc8102e)","ring(e.pos,3.2,e.blue?BLUE:0xc8102e)")

# ВЕНДИНГ: «залп банками» — веер из трёх синих банок
rep("   else if(dist<2.4&&e.cd<=0)e.wind=.4;\n   else if(dist>4.5&&dist<12&&e.cd2<=0&&e.onGround)e.lw=.35;",
    "   else if(e.vw>0){e.vw-=dt;e.eyes.color.setHex(Math.sin(T*40)>0?0xffffff:0x59b0ff);if(e.vw<=0){e.eyes.color.setHex(0xffcc33);const f=pc.set(e.pos.x,e.pos.y+1.5,e.pos.z),d=aimDir(f,t,23);for(const a of[-.2,0,.2])enemyShotDir(f,d.clone().applyAxisAngle(_UP,a),23,12,.3,BLUE);sfx('orb',.8);puff(f,14,BLUE_L,6,.4);e.cd4=rnd(4.5,6.5)}}\n"
    "   else if(dist<2.4&&e.cd<=0)e.wind=.4;\n   else if(dist>4.5&&dist<12&&e.cd2<=0&&e.onGround)e.lw=.35;\n"
    "   else if(e.blue&&dist>5&&dist<19&&(e.cd4=(e.cd4??rnd(1.5,3))-dt)<=0&&los(center(e,pc),new V3(t.pos.x,t.pos.y+1,t.pos.z))){e.vw=.6;sfx('charge',.45)}")
rep("if(!e.leaping&&!(e.stun>0)){const want=e.wind>0||e.lw>0?0:e.speed;",
    "if(!e.leaping&&!(e.stun>0)){const want=e.wind>0||e.lw>0||e.vw>0?0:e.speed;")

# ГОЛЕМ: «ледяная волна» — расходящееся кольцо, через которое надо перепрыгнуть
rep("   else if(dist<4.6&&e.cd<=0)e.wind=.85;\n   else if(dist>7&&dist<20&&(e.cd3",
    "   else if(e.gw>0){e.gw-=dt;e.vel.x*=.8;e.vel.z*=.8;if(Math.random()<dt*20)puff(new V3(e.pos.x+rnd(-1.5,1.5),e.pos.y+.4,e.pos.z+rnd(-1.5,1.5)),2,BLUE_L,4,.5,6);if(e.gw<=0){waveRing(e.pos.x,e.pos.y,e.pos.z,true,{col:0x6fb2ff,em:0x0a2a6a,max:20,sp:12,d:20,pc:0xd8ecff});ring(e.pos,5,BLUE_L);sfx('slam');shake=Math.max(shake,.3);e.cd6=rnd(5.5,8)}}\n"
    "   else if(dist<4.6&&e.cd<=0)e.wind=.85;\n"
    "   else if(e.blue&&dist>5&&dist<15&&e.onGround&&(e.cd6=(e.cd6??rnd(2,4))-dt)<=0){e.gw=.9;ring(e.pos,4,BLUE);sfx('charge',.6)}\n"
    "   else if(dist>7&&dist<20&&(e.cd3")
rep("if(!(e.dashT>0)){const want=e.wind>0||e.dashW>0?0:e.speed;",
    "if(!(e.dashT>0)){const want=e.wind>0||e.dashW>0||e.gw>0?0:e.speed;")

# ДРОН: «очередь» — три быстрых синих заряда подряд
rep("   e.g.children[1].rotation.z+=dt*4;",
    "   if(e.blue){e.cd5=(e.cd5??rnd(2,4))-dt;if(e.bn>0){e.bt-=dt;if(e.bt<=0){e.bn--;e.bt=.13;const f=center(e,new V3());enemyShotDir(f,aimDir(f,t,26),26,7,.2,BLUE);sfx('orb',.4)}}\n"
    "    else if(e.cd5<=0&&dist<24&&los(center(e,pc),new V3(t.pos.x,t.pos.y+1.2,t.pos.z))){e.bn=3;e.bt=.4;e.cd5=rnd(5,7);e.cd=Math.max(e.cd,1.2);e.eyes.color.setHex(0xffffff);setTimeout(()=>{if(e.eyes)e.eyes.color.setHex(0x59b0ff)},400);sfx('charge',.35)}}\n"
    "   e.g.children[1].rotation.z+=dt*(e.bn>0?14:4);")

# БАНКА: «газовый рывок» — шипит, затем на скорости катится в игрока и взрывается
rep(" e.ac=0;const sp=e.speed*(e.wet>0?.75:1),side=Math.sin(T*3+e.seed)*3;",
    " if(e.blue){if(e.rw>0){e.rw-=dt;e.ac=1;e.vel.x*=.7;e.vel.z*=.7;if(Math.random()<dt*40)puff(new V3(e.pos.x,e.pos.y+.8,e.pos.z),2,BLUE_L,5,.4,-2);if(e.rw<=0){e.rush=.95;e.rdir=to.clone();sfx('jet',.5)}return}\n"
    "  if(e.rush>0){e.rush-=dt;e.ac=0;e.vel.x=e.rdir.x*25;e.vel.z=e.rdir.z*25;if(Math.random()<dt*30)puff(new V3(e.pos.x,e.pos.y+.4,e.pos.z),2,0xe6f2ff,3,.35);\n"
    "   for(const c of targets()){if(Math.hypot(c.pos.x-e.pos.x,c.pos.z-e.pos.z)<2.1&&Math.abs(c.pos.y-e.pos.y)<2.4){e.rush=0;canBurst(e,true);return}}if(e.rush<=0)e.cdR=rnd(4,6);return}\n"
    "  e.cdR=(e.cdR??rnd(1.5,3))-dt;if(e.cdR<=0&&dist>6&&dist<17&&e.onGround){e.rw=.5;sfx('hiss',Math.max(.3,sndV(e.pos.x,e.pos.y,e.pos.z)));return}}\n"
    " e.ac=0;const sp=e.speed*(e.wet>0?.75:1),side=Math.sin(T*3+e.seed)*3;")

# КЕТО: «рывок-пинок» — короткий замах и стремительный выпад ногой
rep(" e.ac=0;e.vel.x+=(to.x*e.speed-e.vel.x)*Math.min(1,dt*6);e.vel.z+=(to.z*e.speed-e.vel.z)*Math.min(1,dt*6);\n if(dist<2.4&&e.cd<=0)e.wind=.35;",
    " if(e.kw>0){e.kw-=dt;e.ac=2;e.vel.x*=.6;e.vel.z*=.6;if(e.kw<=0){e.kd=.34;e.kdir=to.clone();e.khit=0;sfx('dash',.7)}return}\n"
    " if(e.kd>0){e.kd-=dt;e.ac=3;e.vel.x=e.kdir.x*27;e.vel.z=e.kdir.z*27;if(Math.random()<dt*40)puff(new V3(e.pos.x,e.pos.y+.3,e.pos.z),2,BLUE_L,3,.4);\n"
    "  if(!e.khit)for(const c of tg){if(Math.hypot(c.pos.x-e.pos.x,c.pos.z-e.pos.z)<1.9&&Math.abs(c.pos.y-e.pos.y)<2.4){e.khit=1;hitTarget(c,20,e.kdir.clone().multiplyScalar(20).setY(7));shake=Math.max(shake,.25);sfx('slam',.5)}}\n"
    "  if(e.kd<=0){e.vel.x*=.2;e.vel.z*=.2;e.cdK=rnd(3.5,5.5)}return}\n"
    " e.ac=0;e.vel.x+=(to.x*e.speed-e.vel.x)*Math.min(1,dt*6);e.vel.z+=(to.z*e.speed-e.vel.z)*Math.min(1,dt*6);\n"
    " if(e.blue&&e.onGround&&dist>3.5&&dist<9&&(e.cdK=(e.cdK??rnd(1,2.5))-dt)<=0){e.kw=.4;sfx('charge',.4);return}\n"
    " if(dist<2.4&&e.cd<=0)e.wind=.35;")
rep("ketoMark(e.pos.x,e.pos.y,e.pos.z,true);sfx('slam'","ketoMark(e.pos.x,e.pos.y,e.pos.z,true,e.blue?BLUE:0);sfx('slam'")
rep("function ketoMark(x,y,z,host){const m=new THREE.Mesh(MARK_G,new THREE.MeshBasicMaterial({color:0xff2a3a,",
    "function ketoMark(x,y,z,host,hex){hex=hex||(curMap==='l4'?BLUE:0xff2a3a);const m=new THREE.Mesh(MARK_G,new THREE.MeshBasicMaterial({color:hex,")
rep("const f=new THREE.Mesh(GOO_G,new THREE.MeshBasicMaterial({color:0xff2a3a,transparent:true,opacity:.2,depthWrite:false}));f.position.copy(m.position)",
    "const f=new THREE.Mesh(GOO_G,new THREE.MeshBasicMaterial({color:hex,transparent:true,opacity:.2,depthWrite:false}));f.position.copy(m.position)")

# waveRing: параметры цвета/радиуса/скорости/урона
rep("function waveRing(x,y,z,dmg){const m=new THREE.Mesh(WR_G,new THREE.MeshStandardMaterial({color:0xd8801f,roughness:.08,metalness:.1,transparent:true,opacity:.85,envMap:ENV,emissive:0x5a2000,side:THREE.DoubleSide,depthWrite:false}));\n m.position.set(x,y,z);scene.add(m);wrings.push({x,y,z,R:3,m,dmg,hit:new Set()})}",
    "function waveRing(x,y,z,dmg,o){o=o||{};const m=new THREE.Mesh(WR_G,new THREE.MeshStandardMaterial({color:o.col||0xd8801f,roughness:.08,metalness:.1,transparent:true,opacity:.85,envMap:ENV,emissive:o.em||0x5a2000,side:THREE.DoubleSide,depthWrite:false}));\n m.position.set(x,y,z);scene.add(m);wrings.push({x,y,z,R:3,m,dmg,hit:new Set(),max:o.max||36,sp:o.sp||14,d:o.d||26,pc:o.pc||0xffd08a,fixY:!!o.max})}")
rep("function updWrings(dt){for(const w of wrings){w.R+=14*dt;const yl=syrupLvl(w.x,w.z);if(yl>-50)w.y=Math.max(yl,0);w.m.position.y=w.y-.1;w.m.scale.set(w.R,1.5,w.R);w.m.material.opacity=Math.max(0,.85-Math.pow(w.R/36,3));",
    "function updWrings(dt){for(const w of wrings){w.R+=w.sp*dt;const yl=w.fixY?-99:syrupLvl(w.x,w.z);if(yl>-50)w.y=Math.max(yl,0);w.m.position.y=w.y-.1;w.m.scale.set(w.R,w.fixY?1.1:1.5,w.R);w.m.material.opacity=Math.max(0,.85-Math.pow(w.R/w.max,3));")
rep("puff(new V3(w.x+Math.sin(a)*w.R,w.y+1.2,w.z+Math.cos(a)*w.R),2,0xffd08a,3,.5,8)}","puff(new V3(w.x+Math.sin(a)*w.R,w.y+1.2,w.z+Math.cos(a)*w.R),2,w.pc,3,.5,8)}")
rep("if(Math.abs(d-w.R)<1.1&&c.pos.y<w.y+1.3){w.hit.add(key);hitTarget(c,26,","if(Math.abs(d-w.R)<1.1&&c.pos.y<w.y+1.3&&c.pos.y>w.y-2.5){w.hit.add(key);hitTarget(c,w.d,")
rep("wrings=wrings.filter(w=>{const end=w.R>36;","wrings=wrings.filter(w=>{const end=w.R>w.max;")
if '_UP' not in s.split('/*BLUE4*/')[0] and 'const _UP=' not in s:
    s=s.replace('/*BLUE4*/\n','/*BLUE4*/\nconst _UP=new V3(0,1,0);\n',1)
rep("e.mats.forEach(m=>m.emissive.setHex(Math.sin(T*40)>0?0x883322:0x331111))","e.mats.forEach(m=>m.emissive.setHex(Math.sin(T*40)>0?(e.blue?0x224a99:0x883322):(e.blue?0x0a1838:0x331111)))")
open(P,'w',encoding='utf-8').write(s);print('blue ok')
