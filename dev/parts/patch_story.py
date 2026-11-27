import os,sys;sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'));from ugenv import *  # пути окружения
import re,sys
p=INDEX
s=open(p).read()
def rep(a,b,n=1):
    global s
    c=s.count(a)
    if c!=n:
        print('ANCHOR FAIL',c,repr(a[:90]));sys.exit(1)
    s=s.replace(a,b)

story=open(PARTS+'/story.js').read()
# A. модуль сюжета перед загрузкой первой карты
if '/*STORY-BEGIN*/' in s:
    s=re.sub(r'/\*STORY-BEGIN\*/.*?/\*STORY-END\*/\n?',lambda m:story,s,flags=re.S)
else:
    rep("let mapId='zavod';try{",story+"let mapId='zavod';try{")
    # B. loadMap
    rep("mapGroup=new THREE.Group();scene.add(mapGroup);level.length=0;boxes.length=0;mapAnims.length=0;",
        "mapGroup=new THREE.Group();scene.add(mapGroup);level.length=0;boxes.length=0;mapAnims.length=0;resetMapExtras();")
    rep("pads.length=0;if(id==='plaza')buildPlaza();else buildFactory();",
        "pads.length=0;if(id==='plaza')buildPlaza();else if(id==='l1')buildL1();else if(id==='l2')buildL2();else buildFactory();")
    # C. враги
    rep("const ENEMY={boss:{hp:140,r:2,cy:3.2,speed:8},",
        "const ENEMY={can:{hp:3,r:.8,cy:.7,speed:12.5,noslip:1},jelly:{hp:6,r:1.15,cy:.2,speed:4,fly:1,noslip:1},queen:{hp:240,r:3.3,cy:6.2,speed:0,boss:1,noslip:1,name:'КАРАМЕЛЬНАЯ ЦАРИЦА'},boss:{hp:140,r:2,cy:3.2,speed:8,boss:1,name:'ГЕНЕРАЛЬНЫЙ ДИРЕКТОР ГАЗ-АДА'},")
    # D. модели
    rep(" else if(type==='boss'){eyes=buildBoss(g,mm,add)}",
        " else if(type==='boss'){eyes=buildBoss(g,mm,add)}\n else if(type==='can')eyes=buildCan(g,mm);else if(type==='jelly')eyes=buildJelly(g,mm);else if(type==='queen')eyes=buildQueen(g,mm);")
    # E. makeEnemy
    rep("if(type==='boss'){if(mode==='coop')e.hp*=1+.6*remotes.size;e.pos.y+=3}e.maxHp=e.hp;return e}",
        "if(type==='boss'){if(mode==='coop')e.hp*=1+.6*remotes.size;e.pos.y+=3}if(type==='queen'&&mode==='coop')e.hp*=1+.6*remotes.size;e.maxHp=e.hp;return e}")
    # F. spawnEnemy
    rep("function spawnEnemy(type,pos){enemies.push(makeEnemy(type,pos,++eid));puff(new V3(pos.x,1,pos.z),40,type==='banan'?0xffe135:0xff2a3a,8,.7);",
        "function spawnEnemy(type,pos){if(type==='jelly')pos=pos.clone().setY(pos.y+5);if(type==='queen'){pos=pos.clone().setY(-13);banner('КАРАМЕЛЬНАЯ ЦАРИЦА ПРОБУЖДАЕТСЯ');shake=Math.max(shake,.35)}enemies.push(makeEnemy(type,pos,++eid));puff(new V3(pos.x,Math.max(1,pos.y+1),pos.z),40,type==='banan'?0xffe135:type==='jelly'||type==='queen'?0xffa030:0xff2a3a,8,.7);")
    # G. kill
    rep("function kill(e,src,quiet){e.dead=true;",
        "function kill(e,src,quiet){e.dead=true;if(e.type==='can'&&src!=='self')canBurst(e,false);if(e.type==='jelly'){puff(center(e),50,0xffa030,9,.9,8);addGoo(e.pos.x,surfY(e.pos.x,e.pos.z),e.pos.z,2.4,8)}")
    rep("if(e.type==='banan'){pts=300;lbl='БАНАНИНИ ПОВЕРЖЕН';",
        "if(e.type==='can'){pts=70;lbl='БАНКА СМЯТА'}if(e.type==='jelly'){pts=110;lbl='МЕДУЗА ЛОПНУЛА'}if(e.type==='queen'){pts=900;lbl='ЦАРИЦА РАСТАЯЛА';banner('КАРАМЕЛЬНАЯ ЦАРИЦА РАСТАЯЛА!');for(let i=0;i<14;i++)orbs.push(makeOrb(c));blast(c,11,0xffa030);puff(c,200,0xd8801f,18,1.6,8);shake=Math.max(shake,.7)}if(e.type==='banan'){pts=300;lbl='БАНАНИНИ ПОВЕРЖЕН';")
    rep("if(src==='geyser')addStyle('В НЕБО ГЕЙЗЕРОМ',90);",
        "if(src==='geyser')addStyle('В НЕБО ГЕЙЗЕРОМ',90);if(src==='press')addStyle('ПОД ПРЕСС',150);if(src==='canbomb')addStyle('ЦЕПНАЯ РЕАКЦИЯ',70);if(src==='canpass')addStyle('БАНКА-БОМБА',60);")
    # H. damage
    rep("function damage(e,dmg,dist,src){if(e.dead)return;",
        "function damage(e,dmg,dist,src){if(e.dead)return;if(e.inv){if(Math.random()<.3)puff(center(e),3,0xfff1c0,4,.3);return}if(e.type==='queen'&&drainT>0)dmg*=1.5;")
    # I. сеть
    rep("const TYPES=['vend','drone','golem','banan','boss'];","const TYPES=['vend','drone','golem','banan','boss','can','jelly','queen'];")
    rep("Math.ceil(e.hp*10),e.wind>0?1:0,e.wet>0?Math.ceil(e.wet*10):0]);",
        "Math.ceil(e.hp*10),e.wind>0?1:0,e.wet>0?Math.ceil(e.wet*10):0,e.ac||0]);")
    rep("r1(p.vel.x),r1(p.vel.y),r1(p.vel.z),p.r>.4?1:0])}",
        "r1(p.vel.x),r1(p.vel.y),r1(p.vel.z),p.r>.4?1:0,p.kind==='blob'?2:p.kind==='bomb'?3:0,p.landY!=null?r1(p.landY):0])}\n if(mode==='coop'&&isHost&&story)o.lv=storyNet();")
    rep("function syncFromHost(){const h=hostSnap;if(!h)return;if(h.wv&&+h.wv!==wave){wave=+h.wv;banner('ВОЛНА '+wave)}\n $('wave').textContent='ВОЛНА '+wave;$('left').textContent='врагов: '+(+h.lf||0)+' · хост: '+(hostPeer===myPeer?'ты':nameOf(hostPeer));",
        "function syncFromHost(){const h=hostSnap;if(!h)return;if(story)syncStory(h);else{if(h.wv&&+h.wv!==wave){wave=+h.wv;banner('ВОЛНА '+wave)}\n $('wave').textContent='ВОЛНА '+wave;$('left').textContent='врагов: '+(+h.lf||0)+' · хост: '+(hostPeer===myPeer?'ты':nameOf(hostPeer))}")
    rep("if(type==='boss')banner('ГЕНЕРАЛЬНЫЙ ДИРЕКТОР ВЫШЕЛ НА СВЯЗЬ');puff(new V3(e.pos.x,1,e.pos.z),20,0xff2a3a,6,.5)}",
        "if(type==='boss')banner('ГЕНЕРАЛЬНЫЙ ДИРЕКТОР ВЫШЕЛ НА СВЯЗЬ');if(type==='queen')banner('КАРАМЕЛЬНАЯ ЦАРИЦА ПРОБУЖДАЕТСЯ');puff(new V3(e.pos.x,1,e.pos.z),20,0xff2a3a,6,.5)}")
    rep("if(a[8])e.wet=Math.max(e.wet||0,(+a[8]||0)/10)}",
        "if(a[8])e.wet=Math.max(e.wet||0,(+a[8]||0)/10);e.ac=+a[9]||0}")
    rep("  const big=!!a[7],m=new THREE.Mesh(new THREE.SphereGeometry(big?.55:.28,14,10),new THREE.MeshBasicMaterial({color:big?0xf3efe6:0x5fe0c8}));m.position.set(+a[1]||0,+a[2]||0,+a[3]||0);scene.add(m);\n  proj.push({m,vel:new V3(+a[4]||0,+a[5]||0,+a[6]||0),owner:'enemy',dmg:big?20:12,r:big?.55:.28,t:6,kind:'orb',netId:nid})}",
        "  const big=!!a[7],kd=+a[8]||0;if(kd===2||kd===3){const sz=kd===3?.55:.38,m=new THREE.Mesh(new THREE.SphereGeometry(sz,14,10),new THREE.MeshBasicMaterial({color:kd===3?0xc8661a:0xffa030}));m.position.set(+a[1]||0,+a[2]||0,+a[3]||0);scene.add(m);\n   const pp={m,vel:new V3(+a[4]||0,+a[5]||0,+a[6]||0),owner:'enemy',dmg:kd===3?16:10,r:sz,t:6,kind:kd===3?'bomb':'blob',g:18,landY:+a[9]||0,netId:nid};proj.push(pp);if(kd===3)markLanding(pp);continue}\n  const m=new THREE.Mesh(new THREE.SphereGeometry(big?.55:.28,14,10),new THREE.MeshBasicMaterial({color:big?0xf3efe6:0x5fe0c8}));m.position.set(+a[1]||0,+a[2]||0,+a[3]||0);scene.add(m);\n  proj.push({m,vel:new V3(+a[4]||0,+a[5]||0,+a[6]||0),owner:'enemy',dmg:big?20:12,r:big?.55:.28,t:6,kind:'orb',netId:nid})}")
    # J. клиентская анимация
    rep("if(e.type==='boss')bossAnim(e,dt);if(e.type==='vend')",
        "if(e.type==='boss')bossAnim(e,dt);if(e.type==='can')canAnim(e,dt);if(e.type==='jelly')jellyAnim(e,dt);if(e.type==='queen')queenAnim(e,dt);if(e.type==='vend')")
    # K. updEnemies
    rep("if(!e.leaping&&!(e.stun>0)&&!(e.slip>0))e.g.rotation.y=Math.atan2(to.x,to.z);",
        "if(!e.leaping&&!(e.stun>0)&&!(e.slip>0)&&e.type!=='queen'&&!(e.shk>0))e.g.rotation.y=Math.atan2(to.x,to.z);")
    rep("if(!(e.slip>0)&&e.type!=='drone'&&e.type!=='boss'&&e.onGround",
        "if(!(e.slip>0)&&e.type!=='drone'&&e.type!=='boss'&&!ENEMY[e.type].noslip&&e.onGround")
    rep("  if(e.type==='boss'){bossAI(e,t,to,dist,dt,tg);bossAnim(e,dt)}\n  else if(e.slip>0)slipUpd(e,dt);",
        "  if(e.type==='boss'){bossAI(e,t,to,dist,dt,tg);bossAnim(e,dt)}\n  else if(e.type==='queen'){queenAI(e,t,to,dist,dt,tg);queenAnim(e,dt)}\n  else if(e.type==='jelly'){jellyAI(e,t,to,dist,dt);jellyAnim(e,dt)}\n  else if(e.type==='can'){canAI(e,t,to,dist,dt);canAnim(e,dt)}\n  else if(e.slip>0)slipUpd(e,dt);")
    rep("  if(e.type==='boss'){e.onGround=moveBody(e.pos,e.vel,1.3,4.6,dt,false).ground;if(e.pos.y<-10){e.pos.copy(spawns[0]);e.pos.y+=4}}\n  else if(e.type==='drone'){e.pos.addScaledVector(e.vel,dt);e.pos.x=THREE.MathUtils.clamp(e.pos.x,-34,34);e.pos.z=THREE.MathUtils.clamp(e.pos.z,-34,34);if(inBox(e.pos))e.pos.y+=dt*8}\n  else{e.vel.y-=26*dt;e.onGround=moveBody(e.pos,e.vel,e.r*.8,e.type==='golem'?4.5:2.5,dt,true).ground;",
        "  if(e.type==='queen'){}\n  else if(e.type==='boss'){e.onGround=moveBody(e.pos,e.vel,1.3,4.6,dt,false).ground;if(story&&e.onGround)carryBody(e.pos,1.3,4.6,dt);if(e.pos.y<-10){e.pos.copy(spawns[0]);e.pos.y+=4}}\n  else if(ENEMY[e.type].fly){e.pos.addScaledVector(e.vel,dt);e.pos.x=THREE.MathUtils.clamp(e.pos.x,mapB.x0+1,mapB.x1-1);e.pos.z=THREE.MathUtils.clamp(e.pos.z,mapB.z0+1,mapB.z1-1);if(inBox(e.pos))e.pos.y+=dt*8}\n  else{e.vel.y-=26*dt;if(story){const sy=syrupDepth(e.pos);if(sy>.15&&!(e.dashT>0)){const cap=e.speed*.45+1,hs=Math.hypot(e.vel.x,e.vel.z);if(hs>cap){e.vel.x*=cap/hs;e.vel.z*=cap/hs}if(e.vel.y<-5)e.vel.y=-5}}e.onGround=moveBody(e.pos,e.vel,e.r*.8,e.type==='golem'?4.5:2.5,dt,true).ground;if(story&&e.onGround)carryBody(e.pos,e.r*.8,e.type==='golem'?4.5:2.5,dt);")
    # L. спавнер
    rep("function updWaves(dt){spawnT-=dt;\n if(toSpawn.length",
        "function updWaves(dt){spawnTick(dt);\n const left=toSpawn.length+telegraphs.length+enemies.length;$('wave').textContent='ВОЛНА '+wave;$('left').textContent='врагов: '+left+(mode==='coop'?' · хост: ты':'');\n if(!left){waveT+=dt;if(waveT>.01&&waveT-dt<=.01){banner('ВОЛНА ЗАЧИЩЕНА');heal(30);addStyle('ЗАЧИСТКА',50)}if(waveT>3){waveT=0;startWave(wave+1)}}}\nfunction spawnTick(dt){spawnT-=dt;\n if(toSpawn.length")
    rep("  m.position.set(pos.x,7,pos.z);scene.add(m);telegraphs.push({m,pos,type,t:.8});spawnT=.55}",
        "  m.position.set(pos.x,pos.y+7,pos.z);scene.add(m);telegraphs.push({m,pos,type,t:.8});spawnT=.55}")
    rep(" telegraphs=telegraphs.filter(t=>t.t>0);\n const left=toSpawn.length+telegraphs.length+enemies.length;$('wave').textContent='ВОЛНА '+wave;$('left').textContent='врагов: '+left+(mode==='coop'?' · хост: ты':'');\n if(!left){waveT+=dt;if(waveT>.01&&waveT-dt<=.01){banner('ВОЛНА ЗАЧИЩЕНА');heal(30);addStyle('ЗАЧИСТКА',50)}if(waveT>3){waveT=0;startWave(wave+1)}}}",
        " telegraphs=telegraphs.filter(t=>t.t>0)}")
    # M. снаряды
    rep("  if(p.kind==='ghostc'){p.vel.y-=20*dt;p.m.rotation.x+=dt*16}",
        "  if(p.kind==='ghostc'){p.vel.y-=20*dt;p.m.rotation.x+=dt*16}\n  if(p.kind==='canball'){p.vel.y-=9*dt;p.m.rotation.x+=dt*14;puff(pos,1,0xf6eee2,2,.4,-2)}\n  if(p.g&&p.owner==='enemy'){p.vel.y-=p.g*dt;pos.addScaledVector(p.vel,dt);if(Math.random()<dt*20)puff(pos,1,p.kind==='bomb'?0xc8661a:0xffa030,1,.4,4);\n   if(P.alive&&pos.distanceTo(pc)<p.r+.55){p.dead=true;if(P.iT>0)addStyle('УВОРОТ',20);else lobLand(p);continue}\n   if((p.vel.y<0&&pos.y<=p.landY)||inBox(pos)||p.t<=0){p.dead=true;lobLand(p);continue}continue}")
    rep("if(hit){p.dead=true;if(p.kind==='rocket')explode(pos.clone(),p.boost?7:4.8,p.boost?7:4.5,p.boost?'mentos':'rocket');",
        "if(hit){p.dead=true;if(p.kind==='canball')explode(pos.clone(),5.4,9,'canpass');else if(p.kind==='rocket')explode(pos.clone(),p.boost?7:4.8,p.boost?7:4.5,p.boost?'mentos':'rocket');")
    rep("if(inBox(pos)||pos.y<0||p.t<=0){p.dead=true;if(p.owner==='player'){if(p.kind==='rocket')",
        "if(inBox(pos)||pos.y<0||p.t<=0){p.dead=true;if(p.owner==='player'){if(p.kind==='canball')explode(pos.clone(),5.4,9,'canpass');else if(p.kind==='rocket')")
    rep(" proj=proj.filter(p=>{if(p.dead)scene.remove(p.m);return!p.dead});",
        " proj=proj.filter(p=>{if(p.dead){scene.remove(p.m);if(p.mark){scene.remove(p.mark);p.mark=null}}return!p.dead});")
    rep("p.owner='player';p.kind='parried';p.dmg=14;",
        "p.owner='player';p.kind='parried';p.g=0;if(p.mark){scene.remove(p.mark);p.mark=null}p.dmg=14;")
    # N. хитскан
    rep(" let tg=[];for(const e of enemies){const t=raySphere(o,dir,center(e,tmpA),e.r);if(t!==null&&t<wallD)tg.push([t,e])}",
        " if(story)for(const v of valves){const t=raySphere(o,dir,v.pos,.9);if(t!==null&&t<wallD)valveHit(v)}\n let tg=[];for(const e of enemies){const t=raySphere(o,dir,center(e,tmpA),e.r);if(t!==null&&t<wallD)tg.push([t,e])}")
    rep("hitMark();puff(o.clone().addScaledVector(dir,t),8,0xc8102e,6,.5)}else damage(e,dmg,t,src)}",
        "hitMark();puff(o.clone().addScaledVector(dir,t),8,0xc8102e,6,.5)}else{const wk=weakHit(e,o,dir);if(wk&&T-(e.wkT||0)>.5){e.wkT=T;addStyle('В САХАРНОЕ СЕРДЦЕ',30);sfx('ding',.5)}damage(e,wk?dmg*2:dmg,t,src)}}")
    # O. взрывы
    rep("function explode(pos,r,dmg,src){const wets=",
        "function explode(pos,r,dmg,src){if(story)for(const v of valves)if(v.pos.distanceTo(pos)<r+.6)valveHit(v);const wets=")
    # P. удар
    rep(" for(const e of enemies){const c=center(e,tmpA),to=tmpB.subVectors(c,o),L=to.length()-e.r;\n  if(e.type==='boss'&&e.dashT>0",
        " if(story)for(const v of valves){const tv=tmpA.subVectors(v.pos,o),L=tv.length();if(L<3.6&&tv.normalize().dot(aim)>.5){valveHit(v);did=true}}\n for(const e of enemies){const c=center(e,tmpA),to=tmpB.subVectors(c,o),L=to.length()-e.r;\n  if(e.type==='can'&&!e.remote&&!e.dead&&L<3.2&&tmpC.copy(to).normalize().dot(aim)>.3){canPass(e,aim);did=true;continue}\n  if(e.type==='boss'&&e.dashT>0")
    # Q. игрок
    rep(" if(P.dashT<=0&&!P.slam)P.vel.y-=(P.wallT>0&&P.vel.y<0?14:27)*dt;",
        " if(P.dashT<=0&&!P.slam)P.vel.y-=(P.wallT>0&&P.vel.y<0?14:27)*dt;\n P.syr=story?syrupDepth(P.pos):0;P.goo=story?!!gooAt(P.pos):false;\n if(P.syr>.05||P.goo){const cap=P.dashT>0?24:P.syr>.9?5.5:7,h2=Math.hypot(P.vel.x,P.vel.z);if(h2>cap){const f=Math.max(cap/h2,1-dt*9);P.vel.x*=f;P.vel.z*=f}}\n if(P.syr>.3&&!P.slam){P.vel.y+=27*dt*.5;if(P.vel.y<-6)P.vel.y=-6}")
    rep(" const r=moveBody(P.pos,P.vel,.4,P.slide?.9:1.75,dt,true);P.grounded=r.ground;",
        " const r=moveBody(P.pos,P.vel,.4,P.slide?.9:1.75,dt,true);P.grounded=r.ground;if(story&&P.grounded)P.yaw+=carryBody(P.pos,.4,P.slide?.9:1.75,dt);")
    rep(" if(P.pos.y<-14){const sp=spawns[Math.floor(Math.random()*spawns.length)];",
        " if(P.pos.y<-14&&story){P.pos.copy(story.cp);P.vel.set(0,0,0);P.iT=0;hurt(25);banner('СОРВАЛСЯ')}\n if(P.pos.y<-14){const sp=spawns[Math.floor(Math.random()*spawns.length)];")
    # R. прыжок
    rep("if(P.grounded||T-P.lastG<.12){P.vel.y=11;",
        "if(P.grounded||T-P.lastG<.12||(P.syr>.6&&P.vel.y<2)){P.vel.y=P.syr>.3?7.5:P.goo?8.5:11;")
    # S. цикл
    rep("  if(mode==='solo'||(mode==='coop'&&isHost)){updEnemies(dt);updWaves(dt)}else if(mode==='coop')clientEnemyAnim(dt);",
        "  if(story)updLevel(dt);\n  if(mode==='solo'||(mode==='coop'&&isHost)){updEnemies(dt);if(story)updStoryHost(dt);else updWaves(dt)}else if(mode==='coop')clientEnemyAnim(dt);")
    # T. поток игры
    rep("function placePlayer(){const s=",
        "function placePlayer(){if(story){const c=story.cp,co=mode==='coop';P.pos.set(c.x+(co?rnd(-1.4,1.4):0),c.y+.05,c.z+(co?rnd(-.8,.8):0));P.vel.set(0,0,0);P.yaw=story.cpYaw||0;P.pitch=0;return}const s=")
    rep("if(mode==='pvp'){wave=0;$('wave').textContent='PvP · '",
        "if(story)storyReset();else if(mode==='pvp'){wave=0;$('wave').textContent='PvP · '")
    rep("async function begin(m){initAudio();",
        "async function begin(m,lv){initAudio();")
    rep(" if(m)mode=m;loadMap(mapId);leaveNet();if(mode!=='solo'){const ok=await joinNet();if(!ok)mode='solo'}\n reset();state='play';",
        " if(m)mode=m;if(lv!==undefined)storyId=lv;if(storyId&&mode==='pvp')mode='coop';loadMap(storyId||mapId);leaveNet();if(mode!=='solo'){const ok=await joinNet();if(!ok)mode='solo'}\n story=storyId?newStory(storyId):null;reset();state='play';")
    rep("['menu','dead','pause'].forEach(i=>$(i).hidden=true);lobbyPresence();lock()}",
        "['menu','dead','pause','res'].forEach(i=>$(i).hidden=true);lobbyPresence();lock();if(story)lvCard();else $('lvCard').hidden=true}")
    rep("leaveNet();clearWorld();state='menu';mode='solo';['pause','dead'].forEach(i=>$(i).hidden=true);",
        "leaveNet();clearWorld();state='menu';mode='solo';story=null;['pause','dead','res','lvCard'].forEach(i=>$(i).hidden=true);")
    rep("net=await roomApi.join((mode+'-'+mapId+'-'+code).slice(0,48));",
        "net=await roomApi.join(((storyId?'story-'+storyId:mode+'-'+mapId)+'-'+code).slice(0,48));")
    rep(" if(mode==='solo'){state='dead';fireHeld=altHeld=false;",
        " if(story){P.alive=false;deaths++;P.respT=mode==='solo'?2.4:5;fireHeld=altHeld=false;puff(new V3(P.pos.x,P.pos.y+1,P.pos.z),80,0x5a1f0e,10,1.2);sfx('kill');banner(mode==='solo'?'ТЫ ВЫДОХСЯ · ЧЕКПОИНТ':'ТЫ ВЫДОХСЯ');return}\n if(mode==='solo'){state='dead';fireHeld=altHeld=false;")
    # U. полоска босса
    rep("{const bs=enemies.find(e=>e.type==='boss'&&!e.dead),bb=$('bossBar');if(!!bs===bb.hidden)bb.hidden=!bs;if(bs){",
        "{const bs=enemies.find(e=>ENEMY[e.type]&&ENEMY[e.type].boss&&!e.dead),bb=$('bossBar');if(!!bs===bb.hidden)bb.hidden=!bs;if(bs){const bn=ENEMY[bs.type].name;if(bb.dataset.n!==bn){bb.dataset.n=bn;bb.querySelector('.bn').textContent=bn}")
    # V. звуки
    rep(" else if(k==='slam'){nz(.5,'lowpass',400,1.2*v,50);tone(.4,'sine',70,30,.6*v)}\n}catch(e){}}",
        " else if(k==='slam'){nz(.5,'lowpass',400,1.2*v,50);tone(.4,'sine',70,30,.6*v)}\n else if(k==='door'){nz(.7,'lowpass',380,.8*v,120);tone(.6,'sawtooth',70,48,.14*v)}\n else if(k==='siren'){tone(.32,'square',640,900,.07*v);tone(.32,'triangle',1280,1800,.05*v)}\n else if(k==='press'){nz(.55,'lowpass',520,1.4*v,40);tone(.35,'square',95,38,.32*v);tone(.14,'triangle',1900,900,.12*v)}\n else if(k==='hiss'){nz(.75,'highpass',3800,.32*v,6500)}\n else if(k==='gloop'){tone(.22,'sine',460,120,.22*v);tone(.16,'sine',260,620,.1*v)}\n else if(k==='drain'){nz(1.3,'bandpass',520,.6*v,140);tone(.9,'sine',230,70,.22*v)}\n else if(k==='roar'){nz(1.3,'lowpass',420,1*v,110);tone(1.2,'sawtooth',110,68,.24*v);tone(1.2,'sawtooth',166,96,.14*v)}\n else if(k==='crack'){nz(.25,'highpass',2600,.6*v,800);tone(.2,'triangle',2700,1700,.12*v)}\n}catch(e){}}")
    # W. события сети
    rep(" else if(k==='h'){const p=new V3(n[0],n[1],n[2]);ring(p,6,0xf2b84b);puff(p,30,0xf2b84b,9,.5);sfx('slam',.4)}}",
        " else if(k==='h'){const p=new V3(n[0],n[1],n[2]);ring(p,6,0xf2b84b);puff(p,30,0xf2b84b,9,.5);sfx('slam',.4)}\n else if(k==='v'){if(isHost&&story)openValve(n[0],false)}\n else if(k==='k'){const p=new V3(n[0],n[1],n[2]);blast(p,4.6,0xfff1dc);puff(p,60,0xf6eee2,12,.9,5);sfx('boom',.5);addPuddle(n[0],n[3],n[2],2.3,9)}\n else if(k==='q'&&!isHost&&story){const s2=n[0];if(s2===1)waveRing(n[1],Math.max(0,syrupLvl(n[1],n[2])),n[2],false);else if(s2===2)spikeLine(n[1],n[2],n[3],12,false);else if(s2===3)spikeRing(n[1],n[2],n[3],false);else if(s2===5)sfx('roar',.8)}}")
    # X. очистка
    rep("function clearWorld(){clearCola();","function clearWorld(){clearStoryFx();clearCola();")
    # Y. клавиатура на экране итогов
    rep(" else if((state==='pause'||state==='dead')&&(e.code==='ArrowUp'||e.code==='ArrowDown')){const bs=[...$(state).querySelectorAll('.psb')]",
        " else if((state==='pause'||state==='dead'||state==='res')&&(e.code==='ArrowUp'||e.code==='ArrowDown')){const bs=[...$(state).querySelectorAll('.psb:not([hidden])')]")
    # AD. удар с неба не цепляет летунов
    rep("if(d<6&&e.type!=='drone'&&Math.abs(e.pos.y-P.pos.y)<2)","if(d<6&&!ENEMY[e.type].fly&&Math.abs(e.pos.y-P.pos.y)<2)")
    # AB. кооп в сюжете зависит от сети
    rep("function mmGo(){if(state!=='menu')return;uiSnd('ok');mmWipe();menuMusic(false);begin(MM.mode)}","function mmGo(){if(state!=='menu')return;uiSnd('ok');mmWipe();menuMusic(false);begin(MM.mode,null)}")
    rep("function netNote(r){$('mCoop').disabled=$('mPvp').disabled=!r;","function netNote(r){$('mCoop').disabled=$('mPvp').disabled=$('sCoop').disabled=!r;if(!r&&MM.smode!=='solo')mmSetSMode('solo',true);")
open(p,'w').write(s)
print('ok')
