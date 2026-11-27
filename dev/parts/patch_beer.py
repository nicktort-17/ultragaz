import re,sys
p='/home/claude/ultra/index.html'
s=open(p).read()
def rep(a,b,n=1):
    global s
    c=s.count(a)
    if c!=n:
        print('ANCHOR FAIL',c,repr(a[:100]));sys.exit(1)
    s=s.replace(a,b)

beer=open('/home/claude/ultra/parts/beer_world.js').read()+'\n'+open('/home/claude/ultra/parts/beer_chars.js').read()
if '/*BEER-BEGIN*/' in s:
    s=re.sub(r'/\*BEER-BEGIN\*/.*?/\*BEER-END\*/\n?',lambda m:beer+'\n',s,flags=re.S)
    open(p,'w').write(s);print('beer re-spliced');sys.exit(0)

# 1. модуль уровня 3 сразу после сюжетного
rep("/*STORY-END*/\nlet mapId='zavod';try{","/*STORY-END*/\n"+beer+"\nlet mapId='zavod';try{")
# 2. загрузка карты
rep("else if(id==='l2')buildL2();else buildFactory();","else if(id==='l2')buildL2();else if(id==='l3')buildL3();else buildFactory();")
# 3. враг-босс
rep("const ENEMY={can:{hp:3,","const ENEMY={alt:{hp:280,r:2.5,cy:1.1,speed:4,boss:1,noslip:1,name:'АЛЬТУШКА 10/10'},can:{hp:3,")
rep("const TYPES=['vend','drone','golem','banan','boss','can','jelly','queen'];","const TYPES=['vend','drone','golem','banan','boss','can','jelly','queen','alt'];")
rep("else if(type==='queen')eyes=buildQueen(g,mm);","else if(type==='queen')eyes=buildQueen(g,mm);else if(type==='alt')eyes=buildAlt(g,mm,mats);")
rep("if(type==='queen'&&mode==='coop')e.hp*=1+.6*remotes.size;e.maxHp=e.hp;return e}","if((type==='queen'||type==='alt')&&mode==='coop')e.hp*=1+.6*remotes.size;e.maxHp=e.hp;return e}")
rep("function spawnEnemy(type,pos){if(!ENEMY[type].fly&&type!=='queen'){","function spawnEnemy(type,pos){if(type==='alt'){banner('АЛЬТУШКА 10/10 НА ТАНКЕ «ДЕНЕЖНЫЙ МЕШОК»');sfx('horn');shake=Math.max(shake,.3)}if(!ENEMY[type].fly&&type!=='queen'&&type!=='alt'){")
# 4. ИИ
rep("if(!e.leaping&&!(e.stun>0)&&!(e.slip>0)&&e.type!=='queen'&&!(e.shk>0))e.g.rotation.y=","if(!e.leaping&&!(e.stun>0)&&!(e.slip>0)&&e.type!=='queen'&&e.type!=='alt'&&!(e.shk>0))e.g.rotation.y=")
rep("  else if(e.type==='queen'){queenAI(e,t,to,dist,dt,tg);queenAnim(e,dt)}","  else if(e.type==='queen'){queenAI(e,t,to,dist,dt,tg);queenAnim(e,dt)}\n  else if(e.type==='alt'){altAI(e,t,to,dist,dt,tg);altAnim(e,dt)}")
rep("  if(e.type==='queen'){}","  if(e.type==='queen'||e.type==='alt'){}")
rep("if(e.type==='queen')queenAnim(e,dt);if(e.type==='vend')","if(e.type==='queen')queenAnim(e,dt);if(e.type==='alt')altAnim(e,dt);if(e.type==='vend')")
rep("function clientEnemyAnim(dt){for(const e of enemies){if(!e.remote||!e.tgt)continue;e.pos.lerp(e.tgt,Math.min(1,dt*12));",
    "function clientEnemyAnim(dt){for(const e of enemies){if(!e.remote||!e.tgt)continue;if(e.type==='alt'&&e.pos.distanceTo(e.tgt)>6)e.pos.copy(e.tgt);e.pos.lerp(e.tgt,Math.min(1,dt*12));")
# 5. урон, смерть
rep("function damage(e,dmg,dist,src){if(e.dead)return;if(e.inv){","function damage(e,dmg,dist,src){if(e.dead)return;if(e.type==='alt'&&!e.inv){dmg*=altDmgK(e);const fl=altFloor(e);if(e.hp-dmg<fl)dmg=Math.max(0,e.hp-fl)}if(e.inv){")
rep("if(en&&!en.dead){en.hp-=dmg;en.flash=.08;if(en.hp<=0)kill(en,'remote',true)}","if(en&&!en.dead){en.hp-=dmg;if(en.type==='alt')en.hp=Math.max(en.hp,altFloor(en));en.flash=.08;if(en.hp<=0)kill(en,'remote',true)}")
rep("if(e.type==='banan'){pts=300;lbl='БАНАНИНИ ПОВЕРЖЕН';","if(e.type==='alt'){pts=1200;lbl='АЛЬТУШКА ПОВЕРЖЕНА';for(let i=0;i<14;i++)orbs.push(makeOrb(c));blast(c,8,0xff3fa4);puff(c,180,0xff4fa8,16,1.4,6);shake=Math.max(shake,.6)}if(e.type==='banan'){pts=300;lbl='БАНАНИНИ ПОВЕРЖЕН';")
rep("function kill(e,src,quiet){e.dead=true;","function kill(e,src,quiet){e.dead=true;if(e.type==='alt')altDeath(e);")
rep("for(const e of enemies)if(!ids.has(e.id)&&!e.dead){e.dead=true;scene.remove(e.g);","for(const e of enemies)if(!ids.has(e.id)&&!e.dead){e.dead=true;if(e.type==='alt')altDeath(e);scene.remove(e.g);")
rep("if(type==='queen')banner('КАРАМЕЛЬНАЯ ЦАРИЦА ПРОБУЖДАЕТСЯ');puff","if(type==='queen')banner('КАРАМЕЛЬНАЯ ЦАРИЦА ПРОБУЖДАЕТСЯ');if(type==='alt')banner('АЛЬТУШКА 10/10 НА ТАНКЕ «ДЕНЕЖНЫЙ МЕШОК»');puff")
# 6. стрельба: кеги, слабые места, парирование
rep(" if(story)for(const v of valves){const t=raySphere(o,dir,v.pos,.9);if(t!==null&&t<wallD)valveHit(v)}",
    " if(story)for(const v of valves){const t=raySphere(o,dir,v.pos,.9);if(t!==null&&t<wallD)valveHit(v)}\n if(L3){let bk=-1,bt=1e9;L3.kegs.forEach((k,i)=>{if(!k.alive)return;const t=raySphere(o,dir,k.pos,.62);if(t!==null&&t<wallD+.35&&t<bt){bt=t;bk=i}});if(bk>=0){wallD=Math.min(wallD,bt);kegBoom(bk,true);addStyle('КЕГА',25)}}")
rep("const wk=weakHit(e,o,dir);if(wk&&T-(e.wkT||0)>.5){e.wkT=T;addStyle('В САХАРНОЕ СЕРДЦЕ',30);sfx('ding',.5)}",
    "const wk=weakHit(e,o,dir);if(wk&&T-(e.wkT||0)>.5){e.wkT=T;addStyle(e.type==='alt'?(e.ph===3?'В СОПЛО':'В ПИВНОЙ БАК'):'В САХАРНОЕ СЕРДЦЕ',30);sfx('ding',.5)}")
rep("function weakHit(e,o,dir){if(e.type!=='queen'||!e.g.userData.q)return false;","function weakHit(e,o,dir){if(e.type==='alt')return altWeak(e,o,dir);if(e.type!=='queen'||!e.g.userData.q)return false;")
rep("function explode(pos,r,dmg,src){if(story)for(const v of valves)if(v.pos.distanceTo(pos)<r+.6)valveHit(v);","function explode(pos,r,dmg,src){if(story)for(const v of valves)if(v.pos.distanceTo(pos)<r+.6)valveHit(v);if(L3)setTimeout(()=>kegsNear(pos,r*.8,true),70);")
rep("  if(e.type==='boss'&&e.dashT>0&&!e.remote&&L<4.5&&tmpC.copy(to).normalize().dot(aim)>.15){",
    "  if(e.type==='alt'&&e.st==='ram'&&e.ph===3&&!e.remote&&L<5.5&&tmpC.copy(to).normalize().dot(aim)>.1){altParry(e);did=true;continue}\n  if(e.type==='boss'&&e.dashT>0&&!e.remote&&L<4.5&&tmpC.copy(to).normalize().dot(aim)>.15){")
rep("p.owner='player';p.kind='parried';p.g=0;if(p.mark){scene.remove(p.mark);p.mark=null}p.dmg=14;","p.owner='player';p.kind='parried';p.g=0;if(p.mark){scene.remove(p.mark);p.mark=null}p.dmg=p.pdmg||14;")
# 7. снаряды: хук onDie
rep("  if(p.owner==='enemy'){if(P.alive&&pos.distanceTo(pc)<p.r+.55){if(P.iT<=0)hurt(p.dmg);else addStyle('УВОРОТ',20);p.dead=true;continue}}",
    "  if(p.owner==='enemy'){if(P.alive&&pos.distanceTo(pc)<p.r+.55){if(P.iT<=0)hurt(p.dmg);else addStyle('УВОРОТ',20);p.dead=true;if(p.onDie)p.onDie(p);continue}}")
rep("else explode(pos.clone(),3.5,6,'parry')}else puff(pos,8,p.m.material.color.getHex(),4,.4)}}",
    "else explode(pos.clone(),3.5,6,'parry')}else{puff(pos,8,p.m.material.color.getHex(),4,.4);if(p.onDie)p.onDie(p)}}}")
# 8. сеть: виды снарядов
rep("p.kind==='blob'?2:p.kind==='bomb'?3:0","p.kind==='blob'?2:p.kind==='bomb'?3:p.kind==='shell'?4:p.kind==='bullet'?5:0")
rep("  const big=!!a[7],kd=+a[8]||0;if(kd===2||kd===3){",
    "  const big=!!a[7],kd=+a[8]||0;if(kd===4||kd===5){const o=new V3(+a[1]||0,+a[2]||0,+a[3]||0),v=new V3(+a[4]||0,+a[5]||0,+a[6]||0),L=v.length()||1;if(kd===4){const pp=altShell(o,v.clone().divideScalar(L));pp.vel.copy(v);pp.netId=nid}else{altBullet(o,v.clone().divideScalar(L),L,5);proj[proj.length-1].netId=nid}continue}\n  if(kd===2||kd===3){")
rep(" else if(k==='q'&&!isHost&&story){"," else if(k==='K'){if(L3)kegBoom(n[0],false)}else if(k==='W'){if(L3)splash(n[0],n[1],1.6)}else if(k==='L')l3Fx(n);else if(k==='A')altFx(n);\n else if(k==='q'&&!isHost&&story){")
# 9. ввод: E — круг, ЛКМ — бросок
rep("else if(e.code==='KeyV')inspect();","else if(e.code==='KeyV')inspect();else if(e.code==='KeyE'&&L3)l3Interact();")
rep("if(!locked&&!noLock){lock();return}if(e.button===0)fireHeld=true;","if(!locked&&!noLock){lock();return}if(e.button===0&&L3&&ringHeld()){throwRing();e.preventDefault();return}if(e.button===0)fireHeld=true;")
rep("function fire(alt){if(!P.alive)return;","function fire(alt){if(!P.alive||(L3&&ringHeld()))return;")
rep("  guns.forEach((g,j)=>g.visible=j===cur);vmUpdate(dt);","  guns.forEach((g,j)=>g.visible=j===cur&&!(L3&&ringHeld()));vmUpdate(dt);")
# 10. звуки
rep(" else if(k==='crack'){"," else if(k==='horn'){tone(1.5,'sawtooth',98,92,.22*v);tone(1.5,'sawtooth',147,140,.16*v);tone(1.5,'square',73,70,.1*v);nz(1.3,'lowpass',300,.4*v,120)}\n else if(k==='crack'){")
# 11. банка — золотое пиво на яхте
rep("c.fillStyle='#c8102e';c.fillRect(0,0,512,256);const gr=c.createLinearGradient(0,0,0,256);","c.fillStyle=L3?'#d9a21e':'#c8102e';c.fillRect(0,0,512,256);const gr=c.createLinearGradient(0,0,0,256);")
rep("c.fillText('ГАЗ!',70,120);c.fillText('ГАЗ!',442,120);","c.fillText(L3?'ПИВО':'ГАЗ!',70,120);c.fillText(L3?'ПИВО':'ГАЗ!',442,120);")
# 12. меню: три карточки, обложка уровня 3, подсказка на экране
rep(".lvs{display:grid;grid-template-columns:1fr 1fr;gap:1vw}",".lvs{display:grid;grid-template-columns:repeat(3,1fr);gap:1vw}")
rep(".lvc .tx{display:block;padding:1vh 1vw 1.2vh}",""".lvc.l3 .art{background:
 radial-gradient(ellipse 12% 22% at 72% 38%,#fff2d8 0 30%,rgba(255,200,140,.6) 45%,transparent 70%),
 linear-gradient(176deg,transparent 0 58%,#fbfaf6 58% 64%,#14213d 64% 68%,transparent 68%) 18% 0/44% 100% no-repeat,
 linear-gradient(180deg,transparent 0 50%,#f4f2ec 50% 58%,transparent 58%) 26% 0/22% 100% no-repeat,
 linear-gradient(160deg,transparent 0 22%,#ff4fa8 22% 25%,#f2efe8 25% 31%,transparent 31%) 70% 0/30% 100% no-repeat,
 repeating-linear-gradient(180deg,rgba(255,246,226,.55) 0 2px,transparent 2px 9px) 0 100%/100% 34% no-repeat,
 linear-gradient(180deg,#3a2456 0,#9a4a78 30%,#ff9a5c 56%,#f0a030 66%,#b86410 100%)}
#l3hint{position:absolute;left:50%;bottom:18vh;transform:translateX(-50%);padding:.7em 1.3em;font:600 14px/1 Rubik,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#fff6e2;background:rgba(20,10,4,.7);border:1px solid rgba(255,200,120,.45);pointer-events:none;z-index:5}
#l3hint b{color:#ffc040;font-weight:800}
.lvc .tx{display:block;padding:1vh 1vw 1.2vh}""")
open(p,'w').write(s);print('beer patched')
