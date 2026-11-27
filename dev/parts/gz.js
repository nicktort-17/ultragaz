/*GZ-BEGIN*/
/* ================= Безгазява → Газява, катсцена с кубиком сахара, уведомления о фазах, фаза 2 директора ================= */
const GZ={puds:[],mode:2,ped:null,cut:null,cutDone:false,look:-1,rain:[],hintT:0,wflush:0};
const GZ_HY=4.8,GZ_CUT_T=8.9,GZ_T0=1.3;
function gzLevelMode(){return story?(story.lv.id==='l1'?0:story.lv.id==='l2'?1:2):2}
function gzBegin(){setTimeout(()=>{if(dbgOn()&&DBG.gz!=='auto')gzSet(+DBG.gz)},50);for(const m of GZ.puds)scene.remove(m);GZ.puds=[];gzStrands(null);GZ.ped=null;GZ.cut=null;GZ.cutDone=false;GZ.hintT=0;for(const r of GZ.rain){if(r.m)scene.remove(r.m);if(r.c)scene.remove(r.c)}GZ.rain=[];DL.lz=null;if(DL.beam)DL.beam.visible=false;gzBars(false);gzSet(gzLevelMode())}
function gzSet(m){GZ.mode=m;gzHud();gzLook(m===1?1:0);if(m===0&&cur===3)switchW(0,true)}
function gzHud(){const w=$('w3');if(!w)return;w.style.display=GZ.mode===0?'none':'';w.textContent='4 · '+(GZ.mode===1?'Безгазява':'Газява');const g=document.querySelector('.hud .gas');if(g){g.style.display=GZ.mode===0?'none':'';const s=g.querySelector('span');if(s)s.textContent=GZ.mode===1?'ВОДА':'ДАВЛЕНИЕ';g.classList.toggle('gzw',GZ.mode===1)}}
function gzExitOk(){if(!story||story.lv.id!=='l1'||GZ.mode>=1||mode!=='solo')return true;if(T-GZ.hintT>4){GZ.hintT=T;banner('СНАЧАЛА ЗАБЕРИ ПРОТОТИП — ОН НА ПОСТАМЕНТЕ У ВЫХОДА')}return false}

/* --- облик сифона: вода (k=1) или кола (k=0) --- */
const _gzc=new THREE.Color();
function gzMats(){const u=guns[3]&&guns[3].userData;if(!u||!u.glb)return null;if(u.gzM)return u.gzM;const R={liq:[],lab:[],bub:[],foam:[]};const list=[];u.model.traverse(o=>{if(o.isMesh)list.push(o)});
 for(const o of list){const n=o.name;
  if(/^Кола[ _]внутри/.test(n)){o.material=o.material.clone();o.material.transparent=true;R.liq.push({m:o.material,c:new THREE.Color(0x4a1a0a),e:new THREE.Color(0x1a0600)})}
  else if(/^(Красный[ _]пояс|Эмблема\.)/.test(n)){o.material=o.material.clone();R.lab.push({m:o.material,c:o.material.color.clone()})}
  else if(/^Пузырёк/.test(n))R.bub.push(o);else if(/^Пена[ _]на[ _]носике/.test(n))R.foam.push(o)}
 return u.gzM=R}
function gzLook(k){GZ.look=k;const R=gzMats();if(!R)return;
 for(const L of R.liq){L.m.color.copy(L.c).lerp(_gzc.setHex(0x3f9ae0),k);L.m.emissive.copy(L.e).lerp(_gzc.setHex(0x0b2a40),k);L.m.opacity=1-.28*k;L.m.roughness=.05;const tr=k>.02;if(L.m.transparent!==tr){L.m.transparent=tr;L.m.needsUpdate=true}L.m.depthWrite=!tr}
 for(const L of R.lab)L.m.color.copy(L.c).lerp(_gzc.setHex(0x1f6fc6),k);
 for(const b of R.bub)b.visible=k<.5;for(const f of R.foam)f.visible=k<.5}
/* стекло и пластик оружий: видимые края (френель) и блики */
function gzGlass(mt,op){mt.transparent=true;mt.opacity=op;mt.roughness=Math.min(mt.roughness==null?.1:mt.roughness,.08);mt.customProgramCacheKey=()=>'gzrim';
 mt.onBeforeCompile=sh=>{sh.fragmentShader=sh.fragmentShader.replace('#include <dithering_fragment>','float gzF=pow(1.-abs(dot(normalize(vViewPosition),normal)),2.2);gl_FragColor.rgb+=vec3(.85,.93,1.)*gzF*.55;gl_FragColor.a=clamp(gl_FragColor.a+gzF*.5,0.,1.);\n#include <dithering_fragment>')};mt.needsUpdate=true}
/* этикетка сифона — полая лента: убираем торцы, изнутри видна бумажная изнанка */
function gzOpenTube(o,inner){const g=o.geometry,p=g.attributes.position;let y0=1e9,y1=-1e9;for(let i=0;i<p.count;i++){const y=p.getY(i);if(y<y0)y0=y;if(y>y1)y1=y}
 const eps=(y1-y0)*.03,cap=i=>{const y=p.getY(i);return y>y1-eps?1:y<y0+eps?-1:0},idx=g.index?Array.from(g.index.array):[...Array(p.count).keys()],out=[];
 for(let t=0;t<idx.length;t+=3){const a=cap(idx[t]),b=cap(idx[t+1]),c=cap(idx[t+2]);if(a&&a===b&&b===c)continue;out.push(idx[t],idx[t+1],idx[t+2])}
 const ng=g.clone();ng.setIndex(out);o.geometry=ng;if(inner){const im=new THREE.MeshStandardMaterial({color:0xefe4cf,roughness:.85,side:THREE.BackSide});const m=new THREE.Mesh(ng,im);o.add(m)}}
function gzSetupGun(i,m){m.traverse(o=>{if(!o.isMesh)return;if(/^Кола[ _]внутри/.test(o.name))o.renderOrder=1;else if(o.material&&/стекло|ПЭТ|Лёд/i.test(o.material.name||'')){o.renderOrder=2;o.material.depthWrite=false}});if(i!==3)return;const list=[];m.traverse(o=>{if(o.isMesh&&/^(Красный[ _]пояс|Волна[ _]на[ _]поясе)/.test(o.name))list.push(o)});list.forEach(o=>gzOpenTube(o,/^Красный/.test(o.name)));guns[3].userData.gzM=null;if(GZ.look>=0)gzLook(GZ.look)}

/* --- струя воды --- */
function gzWater(alt){if(!alt){if(gas<2){fl0();return}gas-=1.8;gasIdle=.45;vmShot(3,false);const mz=muzzle(),d=spread(aim,.02);sodaEmit(mz,d,true);spray(mz,d,1);sprayFx-=1;if(sprayFx<=0){sprayFx=3;sfx('spray',.6)}
  if(mp()&&(fire.wfx=(fire.wfx||0)-1)<=0){fire.wfx=1;pushFx(['w',0,r1(mz.x),r1(mz.y),r1(mz.z),r2(d.x),r2(d.y),r2(d.z)])}}
 else{WP[3].at=.5;vmDry();sfx('throw',.35);banner('У БЕЗГАЗЯВЫ НЕТ ДАВЛЕНИЯ — РЕАКТИВНОГО РЫВКА НЕТ')}}
function gzWaterHit(e,dr){const c=center(e,tmpA),syr=e.type==='jelly'||e.type==='queen';puff(c,4,0xcfeeff,4,.35);puff(c,2,0xffffff,3,.3);
 e.wdmg=(e.wdmg||0)+.15*(syr?1.5:1);if(syr){if(Math.random()<.5)puff(c,3,0xffb050,2.5,.5,-3);if(!gzWaterHit.told){gzWaterHit.told=1;banner('ВОДА РАСТВОРЯЕТ СИРОП: +50% УРОНА ПО СИРОПНЫМ')}}
 if(!e.remote)e.vel.addScaledVector(_sv.copy(dr.v).normalize(),.5)}

/* --- крупные надписи: фаза босса, новое оружие --- */
const GZA=(()=>{const st=document.createElement('style');st.textContent=`
#phA{position:absolute;inset:0;z-index:28;pointer-events:none;display:none;flex-direction:column;align-items:center;justify-content:center;gap:.6vh}
#phA.on{display:flex;animation:phA 2.9s cubic-bezier(.2,.8,.2,1) forwards}
#phA::before{content:"";position:absolute;inset:0;background:radial-gradient(ellipse at center,transparent 35%,var(--pc,rgba(200,16,46,.55)));z-index:-1}
#phA i{font:500 clamp(14px,2.2vh,22px)/1 Oswald,sans-serif;letter-spacing:.55em;color:#fff;font-style:normal;text-shadow:0 2px 8px #000}
#phA b{font:400 clamp(64px,14vh,160px)/1 Anton,Oswald,sans-serif;color:#fff;letter-spacing:.04em;transform:skewX(-8deg);text-shadow:0 0 34px var(--pg,#ff2a3a),.06em .06em 0 var(--ps,#c8102e)}
#phA small{font:600 clamp(12px,1.9vh,19px)/1.2 Rubik,sans-serif;letter-spacing:.2em;color:#fff;background:var(--ps,#c8102e);padding:.5em 1.3em;clip-path:polygon(10px 0,100% 0,calc(100% - 10px) 100%,0 100%);text-transform:uppercase}
@keyframes phA{0%{opacity:0;transform:scale(1.4)}9%{opacity:1;transform:scale(1)}78%{opacity:1;transform:scale(.985)}100%{opacity:0;transform:scale(.96)}}
.hud .gas.gzw i b,.hud .gas.gzw i>*{background:linear-gradient(90deg,#2a7fd0,#8fd8ff)!important}
.gzbar{position:absolute;left:0;right:0;height:0;background:#000;z-index:27;pointer-events:none;transition:height .5s ease}.gzbar.t{top:0}.gzbar.b{bottom:0}.gzbar.on{height:11vh}
.hud.gzcut>*:not(#phA):not(.gzbar):not(#banner){opacity:0!important;transition:opacity .3s}`;document.head.appendChild(st);
 const host=document.querySelector('.hud')||document.body,d=document.createElement('div');d.id='phA';d.innerHTML='<i></i><b></b><small></small>';host.appendChild(d);
 const t=document.createElement('div');t.className='gzbar t';const b=document.createElement('div');b.className='gzbar b';host.appendChild(t);host.appendChild(b);return{d,t,b}})();
function gzAlert(top,big,sub,pal){const d=GZA.d;d.querySelector('i').textContent=top;d.querySelector('b').textContent=big;const s=d.querySelector('small');s.textContent=sub||'';s.style.display=sub?'':'none';
 const P2=pal==='cyan'?['rgba(30,140,230,.45)','#3fb6ff','#1f6fc6']:pal==='gold'?['rgba(220,140,20,.45)','#ffc040','#b86a00']:['rgba(200,16,46,.55)','#ff2a3a','#c8102e'];
 d.style.setProperty('--pc',P2[0]);d.style.setProperty('--pg',P2[1]);d.style.setProperty('--ps',P2[2]);d.classList.remove('on');void d.offsetWidth;d.classList.add('on');clearTimeout(gzAlert.h);gzAlert.h=setTimeout(()=>d.classList.remove('on'),3000)}
function gzBars(on){GZA.t.classList.toggle('on',on);GZA.b.classList.toggle('on',on);const h=document.querySelector('.hud');if(h)h.classList.toggle('gzcut',on)}
const PH_TXT={boss:['ГЕНЕРАЛЬНЫЙ ДИРЕКТОР','совет директоров · лазерный график · дивиденды'],queen:['КАРАМЕЛЬНАЯ ЦАРИЦА','уходит в сироп · зал затапливает · она быстрее'],alt:['АЛЬТУШКА 10/10','танк подбит · ракета на старте']};
function gzPhases(){for(const e of enemies){if(e.dead||!ENEMY[e.type]||!ENEMY[e.type].boss||e.phA)continue;if(e.type==='queen'&&(e.ac===10||e.st==='sugar'))continue;if(e.type==='pep')continue;
  const mh=e.maxHp||ENEMY[e.type].hp,ph2=e.type==='alt'?Math.floor((e.ac||10)/10)>=2:e.hp<mh*.5&&e.hp>0;
  if(ph2){e.phA=1;const tx=PH_TXT[e.type]||[ENEMY[e.type].name||'БОСС',''];gzAlert(tx[0],'ФАЗА 2',tx[1]);sfx('horn',.9);sfx('roar',.6);shake=Math.max(shake,.3)}}}

/* --- уровень 1: витрина с прототипом у выхода --- */
function gzPedBuild(){const x=0,z=-132.4,g=new THREE.Group();g.position.set(x,-2.4,z);mapGroup.add(g);
 const dark=new THREE.MeshStandardMaterial({color:0x2b2b30,metalness:.7,roughness:.35,envMap:ENV}),yel=new THREE.MeshStandardMaterial({color:0xf2b84b,metalness:.6,roughness:.3,envMap:ENV});
 const add=(geo,mat,y)=>{const m=new THREE.Mesh(geo,mat);m.position.y=y;g.add(m);return m};
 add(new THREE.CylinderGeometry(.78,.95,1.05,28),dark,.52);add(new THREE.CylinderGeometry(.8,.8,.07,28),yel,1.0);add(new THREE.CylinderGeometry(.66,.7,.06,28),new THREE.MeshBasicMaterial({color:0x6fd6ff}),1.06);
 const glass=add(new THREE.CylinderGeometry(.62,.62,1.15,28,1,true),new THREE.MeshStandardMaterial({color:0xd6f2ff,transparent:true,opacity:.16,roughness:.04,metalness:.1,envMap:ENV,envMapIntensity:1.6,depthWrite:false,side:THREE.DoubleSide}),1.66);
 const lid=add(new THREE.CylinderGeometry(.66,.66,.09,28),dark,2.27);add(new THREE.TorusGeometry(.66,.03,6,28).rotateX(Math.PI/2),yel,2.3);
 const glow=new THREE.Sprite(new THREE.SpriteMaterial({map:softTex('rgba(140,220,255,1)','rgba(40,120,255,0)'),blending:THREE.AdditiveBlending,depthWrite:false,transparent:true,opacity:.28}));glow.scale.setScalar(1.6);glow.position.set(0,1.2,-.3);g.add(glow);
 const hold=new THREE.Group();hold.position.y=1.62;g.add(hold);const u=guns[3].userData;
 if(u.glb&&u.holder){gzMats();const gun=u.holder.clone(true);gun.scale.multiplyScalar(2.3);gun.updateMatrixWorld(true);const bb=new THREE.Box3().setFromObject(gun),c=bb.getCenter(new V3());gun.position.sub(c);hold.add(gun)}
 else{const m=new THREE.Mesh(new THREE.CylinderGeometry(.1,.1,.7,14).rotateX(Math.PI/2),new THREE.MeshStandardMaterial({color:0x86ccf5,transparent:true,opacity:.7}));hold.add(m)}
 const sg=new THREE.Mesh(new THREE.PlaneGeometry(1.9,.5),new THREE.MeshBasicMaterial({map:signTex('ПРОТОТИП · БЕЗГАЗЯВА','#eaf6ff','#1f4f8a',1024,240,'bold 72px "Russo One",Arial'),transparent:true}));sg.position.set(0,2.75,0);g.add(sg);
 GZ.ped={g,hold,glass,lid,glow,sg,pos:new V3(x,0,z),t:0,got:false};solid(x,0,z,1.5,1.05,1.5)}
function gzPedUpd(dt){const S=story;if(!S||S.lv.id!=='l1')return;if(!GZ.ped){if(S.phase==='exit'||S.phase==='done'){gzPedBuild();sfx('door',.6)}return}
 const D=GZ.ped;D.t+=dt;D.g.position.y+=(0-D.g.position.y)*Math.min(1,dt*1.6);D.hold.rotation.y+=dt*1.1;D.hold.position.y=1.62+Math.sin(D.t*2)*.05;D.sg.lookAt(camera.position.x,D.sg.getWorldPosition(tmpA).y,camera.position.z);
 if(D.got){D.lid.position.y+=(3.1-D.lid.position.y)*Math.min(1,dt*3);D.glow.material.opacity*=.95;return}
 if(GZ.mode<1&&P.alive&&state==='play'&&Math.hypot(P.pos.x-D.pos.x,P.pos.z-D.pos.z)<1.9&&Math.abs(P.pos.y-1.05)<2.4){D.got=true;D.hold.visible=false;D.glass.visible=false;
  puff(new V3(D.pos.x,1.6,D.pos.z),40,0xcfeeff,5,.7,-2);gzSet(1);switchW(3,true);gzAlert('ПОЛУЧЕН ПРОТОТИП','БЕЗГАЗЯВА','обычная вода без давления · +50% урона по сиропным','cyan');sfx('ding');sfx('frag',.6);addStyle('НАХОДКА',80)}}

/* --- уровень 2: кубик сахара из сердца Царицы --- */
let GZ_CUBE_M=null;
function gzCube(vm){if(!GZ_CUBE_M){const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d');g.fillStyle='#fbf7ee';g.fillRect(0,0,128,128);
  for(let i=0;i<900;i++){const v=200+Math.random()*55|0;g.fillStyle='rgb('+v+','+(v-4)+','+(v-14)+')';g.fillRect(Math.random()*128,Math.random()*128,2+Math.random()*3,2+Math.random()*3)}
  const gr=g.createLinearGradient(0,40,0,128);gr.addColorStop(0,'rgba(216,128,31,0)');gr.addColorStop(.45,'rgba(216,128,31,.55)');gr.addColorStop(1,'rgba(150,70,10,.9)');g.fillStyle=gr;g.fillRect(0,0,128,128);
  for(let i=0;i<6;i++){const x=Math.random()*128;g.fillStyle='rgba(170,80,12,.7)';g.fillRect(x,55+Math.random()*30,4,80)}
  const t=new THREE.CanvasTexture(c);GZ_CUBE_M=new THREE.MeshStandardMaterial({map:t,roughness:.55,metalness:0,emissive:0x2a1400,envMap:ENV,envMapIntensity:.6})}
 const g=new THREE.Group(),s=vm?.08:.3;const b=new THREE.Mesh(new THREE.BoxGeometry(s,s,s),GZ_CUBE_M);g.add(b);
 const dm=new THREE.MeshStandardMaterial({color:0xd8801f,roughness:.08,transparent:true,opacity:.9,envMap:ENV,emissive:0x3a1800});for(let i=0;i<3;i++){const d=new THREE.Mesh(new THREE.SphereGeometry(s*.13,8,6),dm);d.scale.y=1.8;d.position.set((i-1)*s*.32,-s*.55-i%2*s*.08,(i%2-.5)*s*.4);g.add(d)}return g}
function gzCutStart(q){if(GZ.cut||GZ.mode!==1)return;if(dbgOn()&&DBG.skip){GZ.cutDone=true;gzSet(2);if(!q.remote){q.sugarDone=1;q.inv=false;kill(q,'water')}return}const qd=q.g.userData.q;if(!qd)return;const dx=P.pos.x-q.pos.x,dz=P.pos.z-q.pos.z,d=Math.hypot(dx,dz)||1;
 if(cur!==3)switchW(3,true);GZ.cut={t:-GZ_T0,q,qd,stand:null,from:P.pos.clone(),st:0,h:new V3(),cube:null,vc:null,cs:null,v0:null,sh:0};
 P.iT=1e9;gas=Math.max(gas,100);fireHeld=altHeld=false;P.vel.set(0,0,0);P.slide=false;P.slam=false;P.eye=1.6;gzBars(true);sfx('roar',.8);toSpawn=[];
 for(const p of proj)if(p.owner==='enemy')p.t=0;if(mode==='solo'||isHost)for(const e of enemies)if(e!==q&&!e.dead&&!e.remote&&e.type!=='queen')kill(e,'x',true)}
function gzQueenAnim(e,q,a){if(a===10&&GZ.mode===1&&!GZ.cut&&!GZ.cutDone&&state==='play'){if(P.alive)gzCutStart(e);else{GZ.cutDone=true;gzSet(2);gzAlert('ПОЛУЧЕНО','ГАЗЯВА','кубик сахара из сердца Царицы','gold')}}
 const C=GZ.cut&&GZ.cut.q===e?GZ.cut:null,rip=C&&C.rip;q.heart.visible=!rip;if(q.glow)q.glow.visible=!rip;
 if(a!==10)return;
 // жалкий вид на берегу: сгорбилась, оплывает, дрожит, сердце еле бьётся, под ней лужа
 const coll=C&&C.coll?Math.min(1,(T-C.coll)/1.2):0,tr=Math.sin(T*19)*.016+Math.sin(T*31)*.008;
 e.g.rotation.x=.2+.22*coll+tr;e.g.rotation.z=(e.g.rotation.z||0)*.9+Math.sin(T*2.1)*.04;e.g.scale.y*=.84-.2*coll;e.g.scale.x*=1+.08*coll;e.g.scale.z*=1+.08*coll;
 e.gzColl=coll;
 if(Math.random()<.08&&camera.position.distanceTo(e.pos)>3.2){const s=e.g.scale.x;puff(_gzq.set(e.pos.x+rnd(-.5,.5)*s*3,e.pos.y+rnd(.3,2.4)*s*6,e.pos.z+rnd(-.5,.5)*s*3),1,Math.random()<.5?0xd8801f:0xb05a10,.4,.9,14)}
 if(!e.gzPud&&e.pos.y>2&&e.pos.y<3.2&&e.landed!==0){const m=new THREE.Mesh(new THREE.CircleGeometry(1,28).rotateX(-Math.PI/2),new THREE.MeshStandardMaterial({color:0xb8620f,roughness:.08,metalness:.1,transparent:true,opacity:.85,envMap:ENV,emissive:0x2a1200}));m.position.set(e.pos.x,2.815,e.pos.z);m.scale.setScalar(.2);scene.add(m);e.gzPud=m;GZ.puds.push(m)}
 if(e.gzPud){const s=e.gzPud.scale.x;e.gzPud.scale.setScalar(Math.min(1.1+1.2*coll,s+.004));e.gzPud.position.x=e.pos.x;e.gzPud.position.z=e.pos.z}
 if(T-(e.moanT||0)>2.4){e.moanT=T;sfx('roar',.16)}}
const _gzq=new V3();
function gzQueenPost(e,q){const coll=e.gzColl||0,busy=GZ.cut&&GZ.cut.t>1.4;if(q.head){q.head.rotation.z=.38+Math.sin(T*1.4)*.06;q.head.rotation.x=.6+.3*coll}
 const ph=(T*.9)%1,beat=Math.max(Math.exp(-ph*18),.6*Math.exp(-Math.abs(ph-.22)*18));q.heart.scale.setScalar(.85+.25*beat);if(q.heartM&&q.heartM.emissive)q.heartM.emissiveIntensity=.1+1.2*beat;if(q.glow&&q.glow.material)q.glow.material.opacity=busy?.04:.1+.45*beat;if(busy&&q.heartM&&q.heartM.emissive)q.heartM.emissiveIntensity*=.35;}
function gzDamageGuard(e,dmg){if(e.type!=='queen'||!story||story.lv.id!=='l2'||e.sugarDone||e.st==='sugar'||e.ac===10||e.inv||e.hp-dmg>0)return false;
 if(e.remote){e.hp=.01;queueDmg('e'+e.id,dmg,'water');return true}
 e.hp=.01;e.st='sugar';e.stT=0;e.inv=true;toSpawn=[];const R=story.room>=0&&story.lv.rooms[story.room];if(R&&R.rein)R.rein.forEach((_,i)=>story.rein.add(i));
 for(const o of enemies)if(o!==e&&!o.dead&&!o.remote)kill(o,'x',true);return true}
function gzKillGuard(e){if(e.type!=='queen'||e.remote||e.sugarDone||e.st==='sugar'||!story||story.lv.id!=='l2'||state!=='play'||story.phase!=='fight')return false;e.hp=1;return gzDamageGuard(e,5)}
const _gzf=new V3(),_gzt=new V3();
let GZ_ST=null;
/* Раскадровка (t — от момента, когда Царица легла на берег):
   0–1.4  шаги к ней, Безгазява убрана вниз
   1.4–2.3 левая рука тянется к сердцу, 2.3 хватает, 2.3–3.7 тянет (нити сиропа), 3.7 рывок
   3.8–4.5 кубик на раскрытой ладони, 4.0–4.7 правая рука достаёт Безгазяву и ставит вертикально
   4.7–5.6 левая рука несёт кубик к головке сифона, 5.6 отпускает, 5.7–6.2 рука уходит
   5.9–7.2 правая рука трясёт сифон, вода → кола, 7.2 Газява, 7.3–7.9 оружие к бою, 7.9–8.5 добивание */
const GZC={S:.6,gp:new V3(0,-.055,-.27),sh:new V3(-.36,-.52,-.08),home:new V3(-.46,-.66,-.32),m4:new THREE.Matrix4(),qr:new THREE.Quaternion().setFromAxisAngle(new V3(0,0,1),Math.PI),v:new V3(),w:new V3(),d:new V3()};
const gzSm=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x)};
// точка мира → точка в пространстве вьюмодели на заданной глубине (у камер разный FOV)
function gzToGun(p,depth,out){const n=GZC.v.copy(p).project(camera);out.set(n.x,n.y,.5).unproject(gunCam).normalize();return out.multiplyScalar(depth/Math.max(.05,-out.z))}
function gzGunToWorld(p,dist,out){const n=GZC.w.copy(p).project(gunCam);out.set(n.x,n.y,.5).unproject(camera).sub(camera.position).normalize();return out.multiplyScalar(dist).add(camera.position)}
function gzStrands(C){if(!C){if(GZ_ST)GZ_ST.forEach(m=>{m.visible=false});return}
 if(!GZ_ST){const mt=new THREE.MeshStandardMaterial({color:0xd8801f,roughness:.05,metalness:.1,transparent:true,opacity:.92,envMap:ENV,emissive:0x3a1800});GZ_ST=[];for(let i=0;i<6;i++){const m=new THREE.Mesh(new THREE.CylinderGeometry(1,1,1,6).translate(0,.5,0),mt);m.visible=false;scene.add(m);GZ_ST.push(m)}}
 if(!C.hw)return;const B=C.hw;
 GZ_ST.forEach((m,i)=>{const A=_gzq.copy(C.h);A.x+=Math.sin(i*2.1)*.07;A.y+=Math.cos(i*1.7)*.06;A.z+=Math.sin(i*1.3+1)*.07;const d=GZC.d.copy(B).sub(A),L=d.length();
  m.visible=true;m.position.copy(A);m.quaternion.setFromUnitVectors(UPV,d.normalize());const w=(.011+.005*Math.sin(i*1.9))/Math.sqrt(Math.max(.25,L*(1+C.pull*2.5)));m.scale.set(w,L,w)})}
// левая рука: позиция точки хвата + направление пальцев + ладонь вверх/вниз
function gzHand(f,grasp,dir,palmUp,curl){const S=GZC.S;GZC.m4.lookAt(GZC.v.set(0,0,0),GZC.w.copy(dir).normalize(),UPV);f.quaternion.setFromRotationMatrix(GZC.m4);if(palmUp)f.quaternion.multiply(GZC.qr);
 f.scale.set(-S,S,S);const off=GZC.d.copy(GZC.gp).multiply(f.scale).applyQuaternion(f.quaternion);f.position.copy(grasp).sub(off);poseFist(curl)}
function gzFist(f,dt){const C=GZ.cut;if(!C||!C.fo){if(f.userData.cutPose){f.userData.cutPose=0;f.scale.set(1,1,1);f.quaternion.identity()}return false}
 f.userData.cutPose=1;f.visible=true;const t=C.t,V=(x,y,z)=>new V3(x,y,z);
 const reach=gzToGun(C.h,.6,V(0,0,0)),dirTo=p=>p.clone().sub(GZC.sh);let grasp,dir,up=false,curl;
 if(t<2.3){const k=gzSm((t-1.4)/.9);grasp=GZC.home.clone().lerp(reach,k);dir=dirTo(reach);curl=.05+.1*Math.sin(k*Math.PI)}
 else if(t<3.7){const j=Math.min(1,(t-2.3)/1.4);C.pull=j;grasp=reach.clone().add(dirTo(reach).normalize().multiplyScalar(-.05*j*j));grasp.x+=Math.sin(t*41)*.01*j;grasp.y+=Math.sin(t*37)*.01*j;dir=dirTo(reach);curl=Math.min(.9,(t-2.3)/.15*.9)}
 else if(t<3.85){const Y=V(-.17,-.13,-.42);grasp=reach.clone().lerp(Y,gzSm((t-3.7)/.15));dir=dirTo(Y);curl=.9}
 else if(t<4.7){const Y=V(-.17,-.13,-.42),Sh=V(-.09,-.05,-.4),k=gzSm((t-3.9)/.45);grasp=Y.clone().lerp(Sh,k);dir=k>.5?V(.35,.25,-1):dirTo(Y);up=k>.5;curl=.9-.45*gzSm((t-4.1)/.3)}
 else{const ht=C.headTop||V(.1,.05,-.55),above=ht.clone().add(V(0,.075,0));
  if(t<5.6){const k=gzSm((t-4.7)/.8);grasp=V(-.09,-.05,-.4).lerp(above,k);dir=dirTo(above).add(V(0,-.25,0));curl=.45+.4*gzSm((t-4.7)/.25)}
  else{const k=gzSm((t-5.75)/.45);grasp=above.clone().lerp(GZC.home,k);dir=dirTo(above);curl=.85-.75*gzSm((t-5.6)/.12)}}
 gzHand(f,grasp,dir,up,curl);f.updateMatrixWorld(true);
 // кубик в ладони
 if(C.vc&&C.vc.parent===f){C.vc.position.copy(GZC.gp);C.vc.rotation.y+=dt*(up?1.2:0)}
 // конец нитей сиропа — там, где на экране ладонь
 if(t<3.7){const gpW=f.localToWorld(GZC.v.copy(GZC.gp));const hd=C.h.distanceTo(camera.position);C.hw=gzGunToWorld(gpW,Math.max(.4,hd-.2-.25*(C.pull||0)),C.hw||new V3())}
 // отпустить кубик над головкой сифона
 if(t>=5.6&&C.vc&&C.vc.parent===f){gunScene.attach(C.vc);C.drop=C.vc.position.clone();C.dropT=t;sfx('throw',.5)}
 return true}
function gzCutUpd(dt){const C=GZ.cut;C.t+=dt;const t=C.t;P.vel.set(0,0,0);P.iT=1e9;toSpawn=[];if(C.q)C.q.flash=0;
 if(mode==='solo'||isHost)for(const e of enemies)if(e.type!=='queen'&&!e.dead&&!e.remote)kill(e,'x',true);
 if(t<0){if(C.q&&!C.q.dead){const dx=C.q.pos.x-P.pos.x,dz=C.q.pos.z-P.pos.z,hd=Math.hypot(dx,dz)||1;let dy=Math.atan2(-dx,-dz)-P.yaw;dy=Math.atan2(Math.sin(dy),Math.cos(dy));P.yaw+=dy*Math.min(1,dt*4);P.pitch+=(Math.atan2(C.q.pos.y+1.5-P.pos.y-P.eye,hd)-P.pitch)*Math.min(1,dt*4)}return}
 if(!C.stand){const q=C.q.pos,tg=Math.abs(q.x)>24?[0,1]:[1,0],a=new V3(q.x+tg[0]*1.4,2.8,q.z+tg[1]*1.4),b=new V3(q.x-tg[0]*1.4,2.8,q.z-tg[1]*1.4);C.stand=a.distanceTo(P.pos)<b.distanceTo(P.pos)?a:b;C.from=P.pos.clone()}
 if(C.q&&!C.q.dead&&C.qd.heart&&!C.rip)C.qd.heart.getWorldPosition(C.h);
 const k=Math.min(1,t/1.4),ke=k*k*(3-2*k);P.pos.lerpVectors(C.from,C.stand,ke);if(k<1)P.pos.y+=Math.abs(Math.sin(t*6.5))*.05;
 if(k<1&&(C.stp=(C.stp||0)-dt)<=0){C.stp=.48;sfx('hit',.25)}
 const ey=P.pos.y+P.eye,dx=C.h.x-P.pos.x,dz=C.h.z-P.pos.z,hd=Math.hypot(dx,dz)||1;let yT=Math.atan2(-dx,-dz),pT=Math.atan2(C.h.y-ey,hd);
 if(t>=3.85&&t<7.6)pT-=.1;else if(t>=7.6&&C.q){const qx=C.q.pos.x-P.pos.x,qz=C.q.pos.z-P.pos.z;yT=Math.atan2(-qx,-qz);pT=Math.atan2(C.q.pos.y+.6-ey,Math.hypot(qx,qz)||1)}
 let dy=yT-P.yaw;dy=Math.atan2(Math.sin(dy),Math.cos(dy));P.yaw+=dy*Math.min(1,dt*5);P.pitch+=(pT-P.pitch)*Math.min(1,dt*4);
 if(t>1&&t<3.7&&(C.hb=(C.hb||0)-dt)<=0){C.hb=t<2.3?.85:.42;sfx('slam',.22);shake=Math.max(shake,.06)}
 C.fo=t>1.4&&t<6.25;
 if(t>2.3&&C.st===0){C.st=1;C.vc=gzCube(true);C.vc.scale.setScalar(.55/GZC.S);fist.add(C.vc);C.vc.visible=false;sfx('gloop',1);sfx('roar',1);shake=Math.max(shake,.25)}
 if(C.st===1){gzStrands(C);shake=Math.max(shake,.1+.2*(C.pull||0));if(Math.random()<dt*6)puff(_gzq.copy(C.h).add(new V3(rnd(-.12,.12),rnd(-.12,.12),rnd(-.12,.12))),1,0xd8801f,1.2,.6,10);if((C.scr=(C.scr||0)-dt)<=0){C.scr=.55;sfx('roar',.5+.4*(C.pull||0))}}
 if(t>3.7&&C.st===1){C.st=2;C.rip=true;C.coll=T;gzStrands(null);C.vc.visible=true;freeze=Math.max(freeze,.3);shake=Math.max(shake,.7);sfx('slam',1);sfx('gloop',1);sfx('roar',1);
  puff(C.h,8,0xd8801f,3,.7,10);if(C.q)C.q.flash=.06;vmLight.color.setHex(0xffb050);vmLight.intensity=3;vmLight.position.set(-.1,-.1,-.42)}
 if(t>7.9&&t<8.5&&GZ.mode===2&&C.q&&!C.q.dead){const mz=muzzle(),d=_gzf.set(C.q.pos.x,C.q.pos.y+.6,C.q.pos.z).sub(mz).normalize();sodaEmit(mz,d,false);spray(mz,d,1);if((C.sp=(C.sp||0)-dt)<=0){C.sp=.12;sfx('spray',.8)}vmShot(3,false)}
 if(t>8.4&&!C.fin&&C.q){C.fin=1;C.q.flash=.1;puff(_gzt.set(C.q.pos.x,C.q.pos.y+.8,C.q.pos.z),24,0xd8801f,5,.9,8);sfx('gloop',1)}
 if(t>GZ_CUT_T){if(C.vc&&C.vc.parent)C.vc.parent.remove(C.vc);gzStrands(null);GZ.cut=null;GZ.cutDone=true;gzBars(false);P.iT=1.2;if(GZ.mode!==2)gzSet(2)}}
function gzVm(dt){try{gzVm_(dt)}catch(e){if(!gzVm.err){gzVm.err=1;console.error(e)}}}
// поза Безгазявы в правой руке во время ритуала (абсолютная, смешивается с обычной)
const GZR={p:new V3(.13,-.04,-.5),r:new THREE.Euler(1.32,-.55,.08),low:new V3(.26,-.7,-.45)};
function gzVm_(dt){if(cur!==3)return;const g=guns[3],u=g.userData,P_=u.parts||{},C=GZ.cut;if(P_.liquid){P_.liquid.scale.y=Math.min(P_.liquid.scale.y,1)*.96;P_.liquid.scale.x=P_.liquid.scale.z=.95}
 if(GZ.mode===1&&!C){if(P_.needle)P_.needle.rotation.z=1.8}
 if(!C)return;const t=C.t;
 // убрать оружие вниз, пока левая рука занята
 if(t<4.0){const k=gzSm((t+1.3)/.5);g.position.y-=.6*k;g.position.x+=.05*k;if(k>=1)g.visible=false;return}
 const drawK=gzSm((t-4.0)/.7),back=gzSm((t-7.3)/.6),b=drawK*(1-back);
 const tp=GZC.v.copy(GZR.low).lerp(GZR.p,drawK);
 g.position.lerp(tp,b);g.rotation.x+=(GZR.r.x-g.rotation.x)*b;g.rotation.y+=(GZR.r.y-g.rotation.y)*b;g.rotation.z+=(GZR.r.z-g.rotation.z)*b;
 const sk=t>5.95&&t<7.2?Math.sin((t-5.95)/1.25*Math.PI):0;
 g.position.y+=Math.sin(t*26)*.035*sk;g.rotation.z+=Math.sin(t*41)*.22*sk;g.rotation.x+=Math.sin(t*33)*.12*sk;
 if(sk>.3){C.sh-=dt;if(C.sh<=0){C.sh=.16;sfx('spray',.35)}}
 g.updateMatrixWorld(true);
 const hb=boxIn(u.model,/^Голова[ _]сифона/,null);if(hb){const c=hb.getCenter(_gzt);C.headTop=(C.headTop||new V3()).set(c.x,hb.max.y,c.z)}
 // кубик падает в головку
 if(C.drop&&C.vc){const k3=Math.min(1,(t-C.dropT)/.3),tgt=C.headTop||C.drop;C.vc.position.lerpVectors(C.drop,tgt,k3*k3);C.vc.scale.setScalar(.55*(1-.7*k3));C.vc.rotation.x+=dt*5;
  if(k3>=1){gunScene.remove(C.vc);C.vc=null;C.drop=null;C.st=4;vmLight.color.setHex(0xffc070);vmLight.intensity=3;vmLight.position.copy(tgt);sfx('gloop',.9);sfx('ding',.6)}}
 if(C.st>=4){const kk=gzSm((t-5.95)/1.15);gzLook(1-kk);if(P_.liquid)P_.liquid.scale.y=1;if(P_.needle)P_.needle.rotation.z=1.8-3.6*kk+(sk?Math.sin(t*60)*.25*sk:0);
  if(P_.bub&&P_.bot)for(const bb of P_.bub){bb.o.visible=kk>.35;bb.off+=dt*bb.sp*.5;const bt=P_.bot;if(bb.c0.y+bb.off>bt.c.y+bt.r*.8)bb.off=-bt.r*.8;bb.o.position.y=bb.y0+bb.off}}
 if(t>7.2&&C.st===4){C.st=5;gzSet(2);gas=100;gzAlert('ПОЛУЧЕНО','ГАЗЯВА','сахар + вода + взбалтывание = давление','gold');addStyle('САХАРНЫЙ ЗАРЯД',150);sfx('jet',.8);vmLight.color.setHex(0xfff0d0);vmLight.intensity=4}}

/* --- директор, фаза 2: «график падает» (вращающийся лазер) и «дивиденды» (дождь из золотых крышек) --- */
const DL={beam:null,lz:null};
function dlBeam(){if(DL.beam)return DL.beam;const g=new THREE.Group(),add=(geo,mat)=>{const m=new THREE.Mesh(geo,mat);g.add(m);return m};
 const glowM=new THREE.MeshBasicMaterial({color:0xff2a3a,transparent:true,opacity:.5,blending:THREE.AdditiveBlending,depthWrite:false});
 const core=add(new THREE.BoxGeometry(1,.16,.16).translate(.5,0,0),new THREE.MeshBasicMaterial({color:0xfff0f0,transparent:true}));const glow=add(new THREE.BoxGeometry(1,.75,.75).translate(.5,0,0),glowM);
 const post=add(new THREE.CylinderGeometry(.07,.07,1,8).translate(0,.5,0),glowM),tip=add(new THREE.SphereGeometry(.4,12,8),glowM),hub=add(new THREE.SphereGeometry(.45,14,10),new THREE.MeshBasicMaterial({color:0xff6a6a}));
 g.userData={core,glow,post,tip,hub,glowM};g.visible=false;scene.add(g);return DL.beam=g}
function dlStart(x,y,z,a0,dir,sw,by,host){DL.lz={x,y,z,a0,dir,sw,by,t:0,host,hit:new Set()};if(host&&mp())pushFx(['D',0,1,r1(x),r1(y),r1(z),r2(a0),dir,r2(sw),r1(by)]);sfx('charge',1);banner('ГРАФИК ПАДАЕТ — ПРЫГАЙ ЧЕРЕЗ ЛУЧ!')}
function dlUpd(dt){const L=DL.lz;if(!L){if(DL.beam)DL.beam.visible=false;return}L.t+=dt;const B=dlBeam(),U=B.userData;
 const TEL=1.05,ACT=2.6,k=L.t<TEL?0:Math.min(1,(L.t-TEL)/ACT),a=L.a0+L.dir*L.sw*(k*k*(3-2*k));
 ray.set(_gzt.set(L.x,L.y,L.z),_gzf.set(Math.sin(a),0,Math.cos(a)));ray.far=40;const h=ray.intersectObjects(level,false),len=h.length?h[0].distance:40;
 B.visible=true;B.position.set(L.x,L.y,L.z);B.rotation.y=a-Math.PI/2;U.core.scale.x=len;U.glow.scale.x=len;U.tip.position.x=len;U.post.scale.y=Math.max(.1,L.by-L.y);
 const on=L.t>=TEL;U.glowM.opacity=on?.6+.2*Math.sin(L.t*40):.25+.2*Math.abs(Math.sin(L.t*18));U.core.material.opacity=on?1:.55;U.glow.scale.y=U.glow.scale.z=on?1:.4;
 if(on&&Math.random()<dt*30)puff(_gzt.set(L.x+Math.sin(a)*len,L.y,L.z+Math.cos(a)*len),3,0xff5a3a,4,.3,6);
 if(on&&L.host)for(const c of targets()){const key=c.local?'me':c.peer;if(L.hit.has(key))continue;const px=c.pos.x-L.x,pz=c.pos.z-L.z,along=px*Math.sin(a)+pz*Math.cos(a),perp=Math.abs(px*Math.cos(a)-pz*Math.sin(a));
  if(along>0&&along<len&&perp<.6&&L.y>c.pos.y+.05&&L.y<c.pos.y+1.75){L.hit.add(key);hitTarget(c,22,new V3(Math.cos(a)*L.dir*-9,8,-Math.sin(a)*L.dir*-9));puff(new V3(c.pos.x,L.y,c.pos.z),20,0xff5a3a,6,.5)}}
 if(L.t>TEL+ACT+.25){DL.lz=null;B.visible=false}}
function dlRain(spots,host){for(const [x,y,z] of spots){const r=new THREE.Mesh(MARK_G,new THREE.MeshBasicMaterial({color:0xffc040,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));r.position.set(x,y+.07,z);r.scale.setScalar(2.4);scene.add(r);GZ.rain.push({x,y,z,t:-1.25,m:r,c:null,host})}
 if(host&&mp()){const a=['D',0,2];for(const s of spots.slice(0,7))a.push(r1(s[0]),r1(s[1]),r1(s[2]));pushFx(a)}sfx('ding',.7)}
let DL_COIN=null;
function dlCoin(){if(!DL_COIN)DL_COIN={g:new THREE.CylinderGeometry(.55,.55,.14,22),m:new THREE.MeshStandardMaterial({color:0xf2b84b,metalness:.85,roughness:.22,envMap:ENV,emissive:0x3a2000})};const m=new THREE.Mesh(DL_COIN.g,DL_COIN.m);m.rotation.x=Math.PI/2;return m}
function dlRainUpd(dt){for(const r of GZ.rain){const pt=r.t;r.t+=dt;r.m.material.opacity=r.t<0?.35+.5*Math.abs(Math.sin(r.t*14)):Math.max(0,1-r.t*4);
  if(pt<-.5&&r.t>=-.5){r.c=dlCoin();scene.add(r.c)}if(r.c&&r.t<0){const k=(r.t+.5)/.5;r.c.position.set(r.x,r.y+13*(1-k*k)+.2,r.z);r.c.rotation.z+=dt*14}
  if(pt<0&&r.t>=0){if(r.c){scene.remove(r.c);r.c=null}const p=new V3(r.x,r.y+.4,r.z);blast(p,1.7,0xffd060);puff(p,30,0xf2b84b,9,.6,6);ring(p,2.6,0xffc040);const v=sndV(r.x,r.y,r.z);if(v>.05)sfx('boom',v*.8);
   if(r.host)for(const c of targets()){if(Math.hypot(c.pos.x-r.x,c.pos.z-r.z)<2.5&&Math.abs(c.pos.y-r.y)<2.2)hitTarget(c,16,new V3(c.pos.x-r.x,0,c.pos.z-r.z).normalize().multiplyScalar(9).setY(9))}}}
 GZ.rain=GZ.rain.filter(r=>{const end=r.t>.3;if(end){scene.remove(r.m);if(r.c)scene.remove(r.c)}return!end})}
function dirExtra(e,t,dist,dt,tg){e.cdL=(e.cdL??4)-dt;e.cdR=(e.cdR??6.5)-dt;
 if(e.lzT>0){e.lzT-=dt;e.vel.multiplyScalar(1-dt*4);e.vel.y=(e.hy+3.4-e.pos.y)*2.5;return true}
 if(e.cdL<=0&&dist<28&&!DL.lz){const gy=groundAt(t.pos.x,t.pos.z,t.pos.y+.6),by=gy+.85,dir=Math.random()<.5?1:-1,a0=Math.atan2(t.pos.x-e.pos.x,t.pos.z-e.pos.z)-dir*1.4;
  dlStart(e.pos.x,by,e.pos.z,a0,dir,Math.PI*1.25,e.pos.y+2.8,true);e.lzT=1.05+2.6+.2;e.cdL=rnd(10,13);B_vis(e);return true}
 if(e.cdR<=0&&dist<34){const sp=[];for(const c of tg){const lx=c.pos.x+c.vel.x*.9,lz=c.pos.z+c.vel.z*.9;sp.push([lx,groundAt(lx,lz,c.pos.y+.6),lz]);for(let i=0;i<4;i++){const a=Math.random()*6.28,r=rnd(2.5,7),x=c.pos.x+Math.sin(a)*r,z=c.pos.z+Math.cos(a)*r;sp.push([x,groundAt(x,z,c.pos.y+.6),z])}}
  dlRain(sp,true);e.cdR=rnd(7.5,10);if(e.g.userData.boss)e.g.userData.boss.kickT=.4}
 return false}
function B_vis(e){const B=e.g.userData.boss;if(B)B.kickT=.5}
function dlFx(n){if(n[0]===1)dlStart(n[1],n[2],n[3],n[4],n[5]||1,n[6],n[7],false);else if(n[0]===2){const sp=[];for(let i=1;i+2<n.length;i+=3)sp.push([n[i],n[i+1],n[i+2]]);dlRain(sp,false)}}


/* ================= Дебаг-меню тестера: ник «torch» ================= */
const DBG=(()=>{let s={};try{s=JSON.parse(localStorage.getItem('ug-dbg')||'{}')}catch(e){}return Object.assign({god:false,ammo:false,dmg:1,speed:1,fly:false,skip:false,fps:false,gz:'auto'},s)})();
const isTorch=()=>{const i=$('nick');return String(i&&i.value!==''?i.value:(typeof nick!=='undefined'?nick:'')).trim().toLowerCase()==='torch'};
const dbgOn=()=>isTorch();
function dbgSave(){try{localStorage.setItem('ug-dbg',JSON.stringify(DBG))}catch(e){}}
const DBGUI=(()=>{const st=document.createElement('style');st.textContent=`
#dbgP{position:fixed;left:14px;bottom:14px;z-index:60;width:300px;max-height:calc(100vh - 28px);overflow:auto;background:rgba(10,14,24,.92);border:1px solid #ffcf1a;color:#eef;font:12px/1.35 Rubik,Arial,sans-serif;padding:10px 12px;box-shadow:0 6px 30px rgba(0,0,0,.5);display:none}
#dbgP h4{margin:0 0 6px;font:700 13px Oswald,Arial;letter-spacing:.18em;color:#ffcf1a}#dbgP h5{margin:9px 0 4px;font:600 11px Rubik;letter-spacing:.12em;color:#9fb3d9;text-transform:uppercase}
#dbgP label{display:flex;align-items:center;gap:6px;margin:3px 0;cursor:pointer}#dbgP select,#dbgP button{background:#1c2438;color:#fff;border:1px solid #3b4a6e;padding:3px 6px;font:12px Rubik,Arial;cursor:pointer}
#dbgP button:hover{border-color:#ffcf1a}#dbgP .row{display:flex;flex-wrap:wrap;gap:4px;margin:3px 0}#dbgP small{color:#8b97b3}
#dbgFps{position:fixed;right:10px;top:8px;z-index:61;font:700 12px monospace;color:#7f7;background:rgba(0,0,0,.55);padding:2px 6px;display:none;pointer-events:none}`;document.head.appendChild(st);
 const d=document.createElement('div');d.id='dbgP';document.body.appendChild(d);const f=document.createElement('div');f.id='dbgFps';document.body.appendChild(f);return{d,f}})();
function dbgBuild(){const d=DBGUI.d,ck=(k,l)=>`<label><input type="checkbox" data-k="${k}" ${DBG[k]?'checked':''}>${l}</label>`,sel=(k,l,o)=>`<label>${l} <select data-k="${k}">${o.map(([v,t])=>`<option value="${v}" ${String(DBG[k])===String(v)?'selected':''}>${t}</option>`).join('')}</select></label>`;
 const lv=LEVELS.map((L,i)=>`<div class="row"><b style="width:28px">${i+1}</b>${L.rooms.map((R,j)=>`<button data-go="${L.id}:${j}" title="${R.name}">${j+1}·${R.name.slice(0,9)}</button>`).join('')}</div>`).join('');
 d.innerHTML=`<h4>ДЕБАГ · TORCH</h4><small>видно только с ником torch</small>
 <h5>Игрок</h5>${ck('god','Бессмертие')}${ck('ammo','Бесконечные патроны, газ и крышки')}${ck('fly','Полёт (Space — вверх, C — вниз)')}
 ${sel('dmg','Урон по врагам',[[1,'×1'],[3,'×3'],[10,'×10'],[100,'×100']])}${sel('speed','Скорость игры',[[.25,'×0.25'],[.5,'×0.5'],[1,'×1'],[2,'×2']])}
 <h5>Сюжет</h5>${ck('skip','Пропускать катсцены')}${sel('gz','4-е оружие',[['auto','по уровню'],[0,'нет'],[1,'Безгазява'],[2,'Газява']])}
 <h5>Старт с комнаты</h5>${lv}
 <h5>Прочее</h5>${ck('fps','Счётчик FPS')}<div class="row"><button data-act="prog">Открыть все уровни</button><button data-act="reset">Сбросить прогресс</button></div>
 <small>В игре: F1 — убить всех врагов (Пепсштейн: следующая фаза), F2 — босс на 45% (фаза 2), F3 — бессмертие, F4 — полёт, F6 — следующая комната</small>`;
 d.querySelectorAll('[data-k]').forEach(el=>el.onchange=()=>{const k=el.dataset.k;DBG[k]=el.type==='checkbox'?el.checked:(isNaN(+el.value)?el.value:+el.value);dbgSave();if(k==='gz'&&state!=='menu')gzSet(DBG.gz==='auto'?gzLevelMode():+DBG.gz)});
 d.querySelectorAll('[data-go]').forEach(el=>el.onclick=()=>{const [id,j]=el.dataset.go.split(':');dbgGo(id,+j)});
 d.querySelectorAll('[data-act]').forEach(el=>el.onclick=()=>{if(el.dataset.act==='prog'){LEVELS.forEach(L=>{prog[L.id]=Object.assign({done:1},prog[L.id]||{})});saveProg();if(typeof buildLvList==='function')buildLvList();banner('ВСЕ УРОВНИ ОТКРЫТЫ')}
  else{if(confirm('Сбросить прогресс?')){for(const k in prog)delete prog[k];saveProg();if(typeof buildLvList==='function')buildLvList()}}})}
function dbgGo(id,j){if(typeof __ugBegin==='function')__ugBegin('solo',id);else begin('solo',id);setTimeout(()=>{if(!story||story.lv.id!==id)return;const R=story.lv.rooms[j];if(!R)return;
 story.cp=new V3(...R.cp);P.pos.set(R.cp[0],R.cp[1]+.05,R.cp[2]);P.vel.set(0,0,0);if(j>0)roomStart(j);if(DBG.gz!=='auto')gzSet(+DBG.gz);
 const c=document.getElementById('lvCard');if(c)c.hidden=true},400)}
let dbgShown=null,dbgFT=0,dbgFN=0;
setInterval(()=>{const on=dbgOn()&&state==='menu';if(on!==dbgShown){dbgShown=on;if(on)dbgBuild();DBGUI.d.style.display=on?'block':'none'}DBGUI.f.style.display=dbgOn()&&DBG.fps&&state!=='menu'?'block':'none'},500);
function dbgFrame(dt){if(!dbgOn())return;if(DBG.god){P.iT=Math.max(P.iT,.3);if(P.alive)P.hp=Math.max(P.hp,100)}if(DBG.ammo){gas=100;coinCh=4}
 dbgFN++;dbgFT+=dt/(DBG.speed||1);if(dbgFT>.5){DBGUI.f.textContent=Math.round(dbgFN/dbgFT)+' FPS';dbgFN=0;dbgFT=0}}
const dbgSpeed=()=>dbgOn()?(+DBG.speed||1):1,dbgDmg=e=>dbgOn()&&!e.remote?(+DBG.dmg||1):1,dbgFly=()=>dbgOn()&&DBG.fly;
addEventListener('keydown',ev=>{if(!dbgOn()||state!=='play')return;const c=ev.code;if(!['F1','F2','F3','F4','F6'].includes(c))return;ev.preventDefault();
 if(c==='F1'){for(const e of enemies)if(!e.dead&&!e.remote)damage(e,1e6,99,'x');toSpawn=[];banner('ДЕБАГ: ВРАГИ УБИТЫ')}
 else if(c==='F2'){for(const e of enemies)if(!e.dead&&ENEMY[e.type]&&ENEMY[e.type].boss){e.hp=(e.maxHp||ENEMY[e.type].hp)*.45}banner('ДЕБАГ: БОСС НА 45%')}
 else if(c==='F3'){DBG.god=!DBG.god;dbgSave();banner('БЕССМЕРТИЕ: '+(DBG.god?'ВКЛ':'ВЫКЛ'))}
 else if(c==='F4'){DBG.fly=!DBG.fly;dbgSave();banner('ПОЛЁТ: '+(DBG.fly?'ВКЛ':'ВЫКЛ'))}
 else if(c==='F6'&&story){const n=Math.min(story.lv.rooms.length-1,Math.max(0,story.room+1)),R=story.lv.rooms[n];for(const e of enemies)if(!e.dead&&!e.remote)kill(e,'x',true);toSpawn=[];story.phase='clear';story.room=n-1;P.pos.set(R.cp[0],R.cp[1]+.05,R.cp[2]);P.vel.set(0,0,0);banner('ДЕБАГ: КОМНАТА '+(n+1))}});

/* --- общий кадр --- */
function gzFrame(dt){try{gzFrame_(dt)}catch(e){if(!gzFrame.err){gzFrame.err=1;console.error(e)}}}
function gzFrame_(dt){dbgFrame(dt);gzPhases();dlUpd(dt);dlRainUpd(dt);if(story)gzPedUpd(dt);if(GZ.cut)gzCutUpd(dt);
 {const u=SODA.mesh&&SODA.mesh.material.uniforms;if(u&&u.uW)u.uW.value=GZ.mode===1?1:0}
 GZ.wflush-=dt;if(GZ.wflush<=0){GZ.wflush=.12;for(const e of enemies)if(e.wdmg>0&&!e.dead){const d=e.wdmg;e.wdmg=0;damage(e,d,99,'water')}}}
/*GZ-END*/
