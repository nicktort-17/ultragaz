/* окружение для отражений на хроме и стекле (пушки, герой) */
const ENV=(()=>{const pm=new THREE.PMREMGenerator(renderer),es=new THREE.Scene();
 const sky=new THREE.Mesh(new THREE.SphereGeometry(10,24,12),new THREE.MeshBasicMaterial({side:THREE.BackSide,vertexColors:true}));
 const cols=[],pa=sky.geometry.attributes.position;for(let i=0;i<pa.count;i++){const y=pa.getY(i)/10,c=new THREE.Color().setHSL(.07,.35,.12+.55*Math.max(0,y));cols.push(c.r,c.g,c.b)}
 sky.geometry.setAttribute('color',new THREE.Float32BufferAttribute(cols,3));es.add(sky);
 for(const [x,y,z,w,h] of [[0,8,0,8,1],[7,3,-4,1,4],[-7,4,3,1,3]]){const p=new THREE.Mesh(new THREE.BoxGeometry(w,h,w),new THREE.MeshBasicMaterial({color:0xffffff}));p.position.set(x,y,z);es.add(p)}
 return pm.fromScene(es,.04).texture})();
gunScene.environment=ENV;
const FLASH_T=(()=>{const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d');g.translate(64,64);
 for(let i=0;i<7;i++){g.rotate(Math.PI*2/7);const L=40+Math.random()*20;g.beginPath();g.moveTo(-7,0);g.lineTo(0,-L);g.lineTo(7,0);g.closePath();g.fillStyle='rgba(255,214,140,.85)';g.fill()}
 const r=g.createRadialGradient(0,0,0,0,0,40);r.addColorStop(0,'#fff');r.addColorStop(.35,'rgba(255,230,170,.95)');r.addColorStop(1,'rgba(255,140,40,0)');g.fillStyle=r;g.beginPath();g.arc(0,0,40,0,7);g.fill();
 const t=new THREE.CanvasTexture(c);t.minFilter=THREE.LinearFilter;return t})();
function flashSprite(){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:FLASH_T,color:0xffe2b0,blending:THREE.AdditiveBlending,depthWrite:false,transparent:true}));s.visible=false;return s}
/* ================= viewmodels: модель в руке ================= */
const vmRoot=new THREE.Group();gunScene.add(vmRoot);
const vmLight=new THREE.PointLight(0xffc27a,0,1.6,2);vmRoot.add(vmLight);
const fpMat={armor:M(new THREE.Color(myColor),{metalness:.55,roughness:.3,envMap:ENV})};
/* hold — точка хвата (верх рукояти) в пространстве камеры; rot — разворот ствола к прицелу */
const GUN_CFG=[
 {f:'shipuchka',len:.44,hold:[.215,-.215,-.43],rot:[.02,.07,0],mz:/^Срез[ _]трубочки/,fl:.15},
 {f:'shaker',len:.6,hold:[.205,-.225,-.45],rot:[.02,.06,0],mz:/^Дуло/,fl:.26},
 {f:'mentos',len:.6,hold:[.215,-.245,-.42],rot:[.03,.065,0],mz:/^Крышка-распылитель/,fl:.22},
 {f:'gazyava',len:.52,hold:[.205,-.215,-.42],rot:[.02,.06,0],mz:/^Дульце/,fl:0}];
function gunModel(i){const g=new THREE.Group(),dark=M(0x2b2b30,{metalness:.7,roughness:.3}),red=M(0xc8102e,{roughness:.35}),cream=M(0xf6eee2),gold=M(0xf2b84b,{metalness:.8,roughness:.25});
 const add=(geo,mat,x,y,z,rx=0,rz=0)=>{const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.rotation.x=rx;m.rotation.z=rz;g.add(m);return m};
 if(i===0){add(new THREE.BoxGeometry(.09,.14,.3),red,0,0,0);add(new THREE.CylinderGeometry(.03,.03,.36,12),dark,0,.03,-.3,Math.PI/2);
  add(new THREE.CylinderGeometry(.075,.075,.12,10),gold,0,.02,-.08,0,Math.PI/2);add(new THREE.BoxGeometry(.07,.2,.1),dark,0,-.14,.08,.3)}
 else if(i===1){add(new THREE.BoxGeometry(.16,.13,.42),red,0,0,0);for(const s of[-1,1])add(new THREE.CylinderGeometry(.038,.038,.55,12),dark,s*.04,.04,-.42,Math.PI/2);
  add(new THREE.BoxGeometry(.13,.16,.3),M(0x6b3a1e),0,-.06,.3,.15);add(new THREE.BoxGeometry(.17,.03,.2),cream,0,.075,-.05)}
 else if(i===2){add(new THREE.CylinderGeometry(.11,.11,.8,16),red,0,0,-.2,Math.PI/2);add(new THREE.CylinderGeometry(.115,.115,.08,16),cream,0,0,-.45,Math.PI/2);
  add(new THREE.CylinderGeometry(.13,.09,.12,16),dark,0,0,-.62,Math.PI/2);add(new THREE.BoxGeometry(.07,.18,.1),dark,0,-.16,.0,.2);add(new THREE.SphereGeometry(.06,10,8),gold,0,.12,-.1)}
 else{const glass=M(0x5a2412,{roughness:.1,metalness:.2,transparent:true,opacity:.85});add(new THREE.CylinderGeometry(.13,.13,.42,18),glass,0,0,-.05,Math.PI/2);
  add(new THREE.CylinderGeometry(.135,.135,.14,18),red,0,0,-.05,Math.PI/2);add(new THREE.CylinderGeometry(.05,.12,.16,16),glass,0,0,-.33,Math.PI/2);
  add(new THREE.CylinderGeometry(.04,.05,.12,12),cream,0,0,-.46,Math.PI/2);add(new THREE.BoxGeometry(.06,.16,.08),dark,0,-.15,.08,.2);add(new THREE.CylinderGeometry(.02,.02,.2,8),gold,0,.14,-.1)}
 g.children.forEach(c=>{c.scale.multiplyScalar(.72);c.position.multiplyScalar(.72);c.position.y-=.06});
 const fl=flashSprite();fl.position.set(0,0,i===0?-.36:i===1?-.52:-.5);g.add(fl);g.userData.flash=fl;g.userData.mz=fl.position.clone();
 g.visible=false;vmRoot.add(g);return g}
const guns=[0,1,2,3].map(gunModel);
/* --- разбор рукояти: ось, наклон, габариты в «системе ладони» --- */
function vertsOf(objs){const out=[],v=new V3();for(const o of objs){const p=o.geometry.attributes.position;for(let i=0;i<p.count;i++)out.push(v.fromBufferAttribute(p,i).applyMatrix4(o.matrixWorld).clone())}return out}
function gripInfo(grip,extra,guard){const vs=vertsOf(grip);let y0=1e9,y1=-1e9;for(const p of vs){y0=Math.min(y0,p.y);y1=Math.max(y1,p.y)}const hh=y1-y0;
 const top=new V3(),bot=new V3();let nt=0,nb=0;for(const p of vs){if(p.y>y1-hh*.18){top.add(p);nt++}if(p.y<y0+hh*.18){bot.add(p);nb++}}top.divideScalar(nt);bot.divideScalar(nb);
 const ax=top.clone().sub(bot).normalize(),tilt=Math.atan2(ax.z,ax.y),q=new THREE.Quaternion().setFromAxisAngle(new V3(1,0,0),-tilt);
 const loc=p=>p.clone().sub(top).applyQuaternion(q);let rx=0,zf=0,zb=0,ym=0;
 for(const p of vs){const l=loc(p);rx=Math.max(rx,Math.abs(l.x));zf=Math.max(zf,-l.z);zb=Math.max(zb,l.z);ym=Math.min(ym,l.y)}
 if(extra.length)for(const p of vertsOf(extra)){const l=loc(p);if(l.y>ym&&l.y<.01)zf=Math.max(zf,-l.z)}
 const gi={top,tilt,rx,rzF:zf,rzB:zb,h:-ym};
 if(guard.length){let gy0=1e9,gy1=-1e9,gz0=1e9,gz1=-1e9;for(const p of vertsOf(guard)){const l=loc(p);gy0=Math.min(gy0,l.y);gy1=Math.max(gy1,l.y);gz0=Math.min(gz0,l.z);gz1=Math.max(gz1,l.z)}
  gi.gy=clamp((gy0+gy1)/2,-gi.h*.3,-.008);gi.gz=Math.min(-zf*.5,(gz0+gz1)/2);gi.gb=gy0}
 return gi}
/* --- правая робо-рука, обхватывающая рукоять --- */
function buildGripHand(gi){const H=new THREE.Group(),t=.0165,rx=Math.max(.012,gi.rx),F=Math.max(.012,gi.rzF),B=Math.max(.008,gi.rzB);
 const add=(p,geo,mat,x=0,y=0,z=0,ax=0,ay=0,az=0)=>{const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.rotation.set(ax,ay,az);p.add(m);return m};
 const grp=(p,x=0,y=0,z=0,ry=0)=>{const g=new THREE.Group();g.position.set(x,y,z);g.rotation.y=ry;p.add(g);return g};
 const knob=new THREE.SphereGeometry(t*.56,10,8);
 const yIdx=gi.gy!=null?gi.gy:-.015,yStart=gi.gy!=null?Math.min(gi.gb-t*.55,yIdx-t*1.15):yIdx-t*1.12;
 let step=t*1.1;const room=gi.h-t*.45+yStart;if(room<step*2)step=Math.max(t*.75,room/2);
 const ys=[yIdx,yStart,yStart-step,yStart-step*2],zK=-F*.18,fingers=[];
 ys.forEach((y,f)=>{const idx=f===0&&gi.gy!=null,joints=[];let par=grp(H,rx+t*.5,y,zK+(idx?-.003:0),.08),Ls,As;
  if(idx){const reach=Math.max(.018,-gi.gz+zK);Ls=[reach*.8,.019,.015];As=[.08,1.05,.75]}
  else{const k=f===3?.9:1;Ls=[(F+t*.5+zK)*1.02,(2*rx+t*.7)*k,Math.min(.024,F*.6+.006)*k];As=[.08,1.42,1.32]}
  for(let k=0;k<3;k++){const j=k?grp(par,0,0,-Ls[k-1],As[k]):par;add(j,knob,HM.chrome);
   const seg=add(j,new THREE.BoxGeometry(t,t*.95,Ls[k]),k===1?HM.dark:fpMat.armor,0,0,-Ls[k]/2);
   if(k===0)add(j,new THREE.BoxGeometry(t*1.04,t*.32,Ls[k]*.7),HM.cream,0,t*.5,-Ls[k]/2);
   if(k===2)add(j,new THREE.BoxGeometry(t*.7,t*.3,t*.5),HM.red,0,t*.5,-Ls[k]+t*.35);
   j.userData.base=j.rotation.y;joints.push(j);par=j}
  fingers.push(joints)});
 // большой палец: из-за спины рукояти — на левую сторону
 const th=[];{const j0=grp(H,rx*.35,-.004,B+t*.55,Math.PI/2),L1=rx*1.25+t*.5;add(j0,knob,HM.chrome);add(j0,new THREE.BoxGeometry(t*1.05,t,L1),fpMat.armor,0,0,-L1/2);
  const j1=grp(j0,0,.002,-L1,-1.38),L2=Math.min(.04,B+F*.45);add(j1,knob,HM.chrome);add(j1,new THREE.BoxGeometry(t,t*.95,L2),HM.dark,0,0,-L2/2);
  add(j1,new THREE.BoxGeometry(t*.7,t*.3,t*.5),HM.red,0,t*.5,-L2+t*.35);th.push(j0,j1)}
 // ладонь и тыльная броня
 const yTop=.004,yBot=ys[3]-t*.75,pz0=zK-t*.35,pz1=B+t*1.2,ph=yTop-yBot,pd=pz1-pz0,pzc=(pz0+pz1)/2,pyc=(yTop+yBot)/2;
 add(H,new THREE.BoxGeometry(t*1.05,ph,pd),HM.dark,rx+t*1.0,pyc,pzc);
 add(H,tbox(t*.5,t*.5,ph*.9,pd*.92,pd*.8),fpMat.armor,rx+t*1.65,pyc,pzc);
 add(H,new THREE.BoxGeometry(t*.3,ph*.86,t*.75),HM.cream,rx+t*1.95,pyc,pzc+pd*.12);
 add(H,new THREE.BoxGeometry(t*.9,ph*.95,t*.8),HM.chrome,rx+t*.85,pyc,zK+.002);
 add(H,new THREE.SphereGeometry(t*.32,8,6),new THREE.MeshBasicMaterial({color:0x6fd6ff}),rx+t*1.95,pyc+ph*.25,pzc-pd*.25);
 // запястье и предплечье уходят за кадр: назад-вниз-вправо
 const wr=new V3(rx+t*.95,yBot+t*.6,pz1-t*.3);add(H,new THREE.SphereGeometry(.026,12,10),HM.chrome,wr.x,wr.y,wr.z);
 const fa=new THREE.Group();fa.position.copy(wr);H.add(fa);
 const dir=new V3(.36,-.34,.87).normalize().applyAxisAngle(new V3(1,0,0),-gi.tilt);fa.quaternion.setFromUnitVectors(new V3(0,0,1),dir);
 add(fa,cylZ(.026,.04,.62,8),HM.dark,0,0,.32);add(fa,cylZ(.034,.05,.44,8),fpMat.armor,0,0,.26);
 add(fa,new THREE.BoxGeometry(.013,.012,.4),HM.cream,0,.047,.25,.035);
 for(const [z,r] of[[.07,.037],[.43,.05]])add(fa,new THREE.TorusGeometry(r,.0065,6,20),HM.red,0,0,z);
 add(fa,new THREE.TorusGeometry(.03,.006,6,20),HM.chrome,0,0,.02);
 add(fa,cylZ(.007,.007,.32,6),HM.chrome,0,-.042,.24);add(fa,cylZ(.012,.012,.07,8),HM.dark,0,-.042,.4);
 add(fa,cylZ(.02,.02,.075,14),HM.red,.044,.022,.22);add(fa,cylZ(.0205,.0205,.022,14),HM.white,.044,.022,.22);
 H.traverse(o=>{if(o.isMesh)o.renderOrder=1});
 return{g:H,fingers,thumb:th}}
/* --- узлы для анимации частей (поворотные оси создаются по габаритам) --- */
function partPivot(m,re,pv){const objs=[];m.traverse(o=>{if(o.isMesh&&re.test(o.name))objs.push(o)});if(!objs.length)return null;
 m.updateMatrixWorld(true);const inv=m.matrixWorld.clone().invert(),bx=new THREE.Box3();for(const o of objs)bx.union(new THREE.Box3().setFromObject(o).applyMatrix4(inv));
 const p=new THREE.Group();p.position.copy(pv?pv(bx):bx.getCenter(new V3()));m.add(p);m.updateMatrixWorld(true);objs.forEach(o=>p.attach(o));
 p.userData.base=p.position.clone();p.userData.box=bx;return p}
function boxIn(m,re,space){const objs=[];m.traverse(o=>{if(o.isMesh&&re.test(o.name))objs.push(o)});if(!objs.length)return null;
 const bx=new THREE.Box3(),inv=space?space.matrixWorld.clone().invert():null;for(const o of objs){const b=new THREE.Box3().setFromObject(o);if(inv)b.applyMatrix4(inv);bx.union(b)}return bx}
function loadGunModels(){if(!THREE.GLTFLoader)return;const L=new THREE.GLTFLoader();
 GUN_CFG.forEach((cf,i)=>L.load('models/'+cf.f+'.json',gl=>{try{setupGun(i,gl.scene)}catch(e){console.warn('gun',i,e)}},undefined,()=>{}))}
function setupGun(i,m){const cf=GUN_CFG[i],drop=[];
 m.traverse(o=>{if(/Монетка[ _]в[ _]полёте/.test(o.name))drop.push(o);if(o.isMesh){const ms=Array.isArray(o.material)?o.material:[o.material];ms.forEach(mt=>{const n=mt.name||'';
  if(/стекло/i.test(n)){mt.transparent=true;mt.opacity=.78}if(/ПЭТ/.test(n)){mt.transparent=true;mt.opacity=.38;mt.depthWrite=false}if(/Лёд/.test(n)){mt.transparent=true;mt.opacity=.6}
  if(/Свечение/.test(n)){mt.emissiveIntensity=2}mt.envMap=ENV;mt.envMapIntensity=1.1})}});
 drop.forEach(o=>o.parent&&o.parent.remove(o));
 m.rotation.y=Math.PI;m.updateMatrixWorld(true);const box=new THREE.Box3().setFromObject(m),size=box.getSize(new V3()),c=box.getCenter(new V3()),k=cf.len/Math.max(size.z,.01);
 m.position.sub(c);const holder=new THREE.Group();holder.add(m);holder.scale.setScalar(k);holder.updateMatrixWorld(true);
 const pick=re=>{const a=[];m.traverse(o=>{if(o.isMesh&&re.test(o.name))a.push(o)});return a};
 const gi=gripInfo(pick(/^Рукоять/),i===3?pick(/^(Рычаг[ _]сифона|Наконечник[ _]рычага)/):[],pick(/^Спусковая[ _]скоба/));
 holder.position.sub(gi.top);holder.updateMatrixWorld(true);
 const g=guns[i],u=g.userData;g.children.slice().forEach(ch=>{if(ch!==u.flash)g.remove(ch)});g.add(holder);g.scale.setScalar(1);
 const hand=buildGripHand(gi),hf=new THREE.Group();hf.rotation.x=gi.tilt;hf.add(hand.g);g.add(hf);
 const mzb=boxIn(m,cf.mz,g);u.mz=mzb?mzb.getCenter(new V3()):new V3(0,.03,-cf.len*.8);u.mz.z-=.02;u.flash.position.copy(u.mz);
 Object.assign(u,{glb:true,holder,model:m,k,gi,hand,parts:{}});const P_=u.parts;
 if(i===0){const ax=boxIn(m,/^Ось[ _]барабана/,m);P_.drum=partPivot(m,/^Баночка/,b=>{const cc=ax?ax.getCenter(new V3()):b.getCenter(new V3());return new V3(cc.x,cc.y,b.getCenter(new V3()).z)});
  P_.hammer=partPivot(m,/^(Рычаг[ _]крана|Набалдашник[ _]рычага)/,b=>new V3((b.min.x+b.max.x)/2,b.min.y,b.max.z));
  P_.caps=[];m.traverse(o=>{const r=/^Запасная[ _]крышка[ _](\d)$/.exec(o.name);if(r)P_.caps[+r[1]-1]=o})}
 else if(i===1){P_.pump=partPivot(m,/^Цевьё/);P_.cap=partPivot(m,/^Крышка[ _]шейкера/);const sb=boxIn(m,/^Шейкер$/,g);u.eject=sb?new V3(sb.max.x,sb.max.y-.01,(sb.min.z+sb.max.z)/2):new V3(.05,.03,-.15)}
 else if(i===2){P_.pump=partPivot(m,/^(Ручка[ _]насоса|Шток[ _]насоса)/);P_.ments=[1,2,3,4].map(n=>partPivot(m,new RegExp('^Ментос[ _]'+n+'$')));
  P_.mstep=P_.ments[1]&&P_.ments[0]?P_.ments[1].userData.base.clone().sub(P_.ments[0].userData.base):new V3();P_.mo=0;P_.mu=0;P_.mg=1}
 else{P_.lever=partPivot(m,/^(Рычаг[ _]сифона|Наконечник[ _]рычага)/,b=>new V3((b.min.x+b.max.x)/2,b.max.y,(b.min.z+b.max.z)/2));
  P_.needle=partPivot(m,/^Стрелка$/,b=>new V3((b.min.x+b.max.x)/2,b.min.y,(b.min.z+b.max.z)/2));
  P_.liquid=partPivot(m,/^Кола[ _]внутри/,b=>new V3((b.min.x+b.max.x)/2,b.min.y,(b.min.z+b.max.z)/2));
  P_.nozzle=partPivot(m,/^(Носик|Дульце)/);const bb=boxIn(m,/^Бутылка[ _]сифона/,m);
  P_.bot=bb?{c:bb.getCenter(new V3()),r:Math.min(bb.max.x-bb.min.x,bb.max.y-bb.min.y)*.4}:null;
  P_.bub=[];const inv=m.matrixWorld.clone().invert();m.traverse(o=>{if(o.isMesh&&/^Пузырёк/.test(o.name)){const c0=new THREE.Box3().setFromObject(o).applyMatrix4(inv).getCenter(new V3());P_.bub.push({o,c0,y0:o.position.y,off:Math.random()*.02,sp:.6+Math.random()*.8})}})}
 m.traverse(o=>{if(o.isMesh)o.renderOrder=0});
 heroes.forEach(h=>attachTPGun(h,i))}
loadGunModels();
/* --- анимация вьюмодели: пружины отдачи, раскачка, шаг, приземление, доставание, осмотр --- */
const VM={sp:[0,0,0,0,0,0],sv:[0,0,0,0,0,0],rc:[0,0,0,0],rv:[0,0,0,0],bobT:0,bobA:0,airY:0,tilt:0,slideW:0,dashW:0,punchW:0,draw:1,insp:0,ly:0,lp:0,land:0,landV:0,first:true};
const VP={drum:0,drumT:0,hammer:0,trig:0,pump:0,cap:0,mpump:0,feed:0,squash:0,spray:0,lever:0,jet:0,needle:.5,coin:0,dry:0};
const vmParts=[];const ICE_G=new THREE.BoxGeometry(.016,.016,.016),ICE_M=new THREE.MeshStandardMaterial({color:0xd8f4ff,transparent:true,opacity:.75,roughness:.08,metalness:.1});
function vmKick(p,z,y,r){const K=24;VM.rv[0]+=p*K;VM.rv[1]+=z*K;VM.rv[2]+=y*K;VM.rv[3]+=r*K}
function vmShot(i,alt){const R=()=>Math.random()-.5,u=guns[i].userData;VM.insp=0;
 if(i!==3&&!(i===0&&alt)&&!(i===2&&alt)){u.flash.visible=true;u.flash.material.rotation=Math.random()*6.3;u.flash.scale.setScalar(GUN_CFG[i].fl*(.85+Math.random()*.35));VP.flashT=.05;
  vmLight.position.copy(u.mz).applyMatrix4(guns[i].matrix);vmLight.intensity=i===1?5:3.2}
 if(i===0){if(!alt){vmKick(.17,.045,R()*.05,R()*.07);VP.drumT-=Math.PI/3;VP.hammer=1;VP.trig=1}else{vmKick(.2,-.015,.02,-.1);VP.coin=1}}
 else if(i===1){if(!alt){vmKick(.3,.085,R()*.06,.09+R()*.04);VP.pump=.001;VP.cap=1;VP.trig=1}else vmKick(-.16,-.06,0,.05)}
 else if(i===2){if(!alt){vmKick(.27,.1,R()*.04,R()*.06);VP.mpump=.001;VP.squash=1;VP.trig=1;const P_=u.parts;if(P_&&P_.ments)P_.mu=.001}else{vmKick(.05,.015,0,.03);VP.trig=1}}
 else{if(!alt){vmKick(.012+Math.random()*.01,.006,R()*.012,R()*.012);VP.spray=.14}else{vmKick(.32,.12,R()*.03,R()*.05);VP.jet=1;VP.spray=.25}}
 fireCount++;heroFire(selfHero)}
function vmDry(){VP.dry=1;VP.trig=1;vmKick(.01,0,0,0)}
function vmLand(vy){VM.landV-=Math.min(1.1,-vy/34)*.75}
function vmDrawStart(){VM.draw=0;VM.insp=0;VP.drawFx=0}
function inspect(){if(state!=='play'||!P.alive||VM.draw<1)return;VM.insp=.0001;VP.inspFx=0}
function vmUpdate(dt){const g=guns[cur],u=g.userData,cf=GUN_CFG[cur],e=r=>1-Math.exp(-r*dt),P_=u.parts||{};
 // мышиная инерция
 if(VM.first){VM.ly=P.yaw;VM.lp=P.pitch;VM.first=false}
 let dy=P.yaw-VM.ly;dy=Math.atan2(Math.sin(dy),Math.cos(dy));const dp=P.pitch-VM.lp;VM.ly=P.yaw;VM.lp=P.pitch;
 VM.sv[0]+=clamp(dy,-.2,.2)*1.6;VM.sv[1]+=clamp(-dp,-.2,.2)*1.4;VM.sv[2]+=clamp(-dy,-.2,.2)*2.4;VM.sv[3]+=clamp(-dp,-.2,.2)*2;VM.sv[4]+=clamp(dy,-.2,.2)*1.2;
 for(let k=0;k<5;k++){VM.sv[k]+=(-110*VM.sp[k]-15*VM.sv[k])*dt;VM.sp[k]+=VM.sv[k]*dt}
 VM.sp[0]=clamp(VM.sp[0],-.06,.06);VM.sp[1]=clamp(VM.sp[1],-.05,.05);VM.sp[2]=clamp(VM.sp[2],-.18,.18);VM.sp[3]=clamp(VM.sp[3],-.15,.15);VM.sp[4]=clamp(VM.sp[4],-.15,.15);
 // отдача
 for(let k=0;k<4;k++){VM.rv[k]+=(-240*VM.rc[k]-23*VM.rv[k])*dt;VM.rc[k]+=VM.rv[k]*dt}
 // ходьба / воздух / подкат / рывок / удар
 const hs=Math.hypot(P.vel.x,P.vel.z),fx=-Math.sin(P.yaw),fz=-Math.cos(P.yaw),vf=P.vel.x*fx+P.vel.z*fz,vr=-P.vel.x*fz+P.vel.z*fx;
 const walk=P.grounded&&!P.slide&&P.dashT<=0;VM.bobA+=((walk?Math.min(1,hs/13):0)-VM.bobA)*e(8);if(walk)VM.bobT+=dt*Math.min(13,hs)*.82;
 VM.airY+=(clamp(-P.vel.y*.0016,-.035,.03)*(P.grounded?0:1)-VM.airY)*e(10);
 VM.tilt+=(clamp(-vr*.0065,-.11,.11)-VM.tilt)*e(7);
 VM.slideW+=((P.slide?1:0)-VM.slideW)*e(12);VM.dashW+=((P.dashT>0?1:0)-VM.dashW)*e(18);VM.punchW+=((punchT>0?1:0)-VM.punchW)*e(16);
 VM.landV+=(-150*VM.land-13*VM.landV)*dt;VM.land+=VM.landV*dt;
 const br=Math.sin(T*1.7),bA=VM.bobA,bt=VM.bobT;
 vmRoot.position.set(VM.sp[0]+Math.sin(bt)*.013*bA-vr*.0012-.02*VM.slideW,
  VM.sp[1]+(Math.cos(bt*2)-1)*.006*bA+br*.0022+VM.airY+VM.land*.06-.035*VM.slideW-.02*VM.dashW,
  clamp(vf*.0011,-.02,.02)+.05*VM.dashW+.02*VM.slideW);
 vmRoot.rotation.set(VM.sp[3]+br*.004-.06*VM.dashW+VM.land*.08,VM.sp[2],VM.sp[4]+Math.sin(bt)*.018*bA+VM.tilt+.22*VM.slideW);
 // доставание
 VM.draw=Math.min(1,VM.draw+dt/.32);const dw=VM.draw,eb=1+2.7*Math.pow(dw-1,3)+1.7*Math.pow(dw-1,2),nd=1-eb;
 // осмотр
 let ip=0;if(VM.insp>0){VM.insp+=dt/2.3;if(VM.insp>=1)VM.insp=0;else{const x=VM.insp;ip=x<.16?Math.sin(x/.16*Math.PI/2):x>.82?Math.cos((x-.82)/.18*Math.PI/2):1;ip=ip*ip*(3-2*ip)}}
 const pw=VM.punchW,ho=cf.hold,ro=cf.rot;
 g.position.set(ho[0]-.08*ip+.035*pw,ho[1]-.24*nd+.045*ip-.05*pw,ho[2]+VM.rc[1]+.05*ip);
 g.rotation.set(ro[0]+VM.rc[0]-1.05*nd+.12*ip-.12*pw,ro[1]+VM.rc[2]+.72*ip-.15*nd,ro[2]+VM.rc[3]+.5*nd+.42*ip-.22*pw);
 // вспышка и свет
 VP.flashT=(VP.flashT||0)-dt;if(VP.flashT<=0)guns.forEach(x=>x.userData.flash.visible=false);vmLight.intensity=Math.max(0,vmLight.intensity-dt*40);
 // палец на спуске
 VP.trig=Math.max(0,VP.trig-dt*9);VP.dry=Math.max(0,VP.dry-dt*5);
 const H=u.hand;if(H){const f0=H.fingers[0],sq=cur===3?VP.lever:0;
  H.fingers.forEach((js,fi)=>js.forEach((j,k)=>{j.rotation.y=j.userData.base+(fi===0&&k?VP.trig*(k===1?.42:.3):0)+(k&&cur===3?sq*.12:0)}))}
 // части оружия
 if(cur===0){VP.drum+=(VP.drumT-VP.drum)*e(26);if(Math.abs(VP.drumT)>50){VP.drum-=VP.drumT;VP.drumT=0}
  if(P_.drum)P_.drum.rotation.z=VP.drum;VP.hammer=Math.max(0,VP.hammer-dt*7);if(P_.hammer)P_.hammer.rotation.x=-.55*Math.sin(VP.hammer*Math.PI);
  if(P_.caps){const n=Math.round(coinCh*1.75);P_.caps.forEach((c,j)=>{if(c)c.visible=j<n})}
  if(VM.insp>0&&!VP.inspFx&&VM.insp>.2){VP.inspFx=1;VP.drumT-=Math.PI*4}
  if(dw<1&&dw>.55&&!VP.drawFx){VP.drawFx=1;VP.drumT-=Math.PI*2/3}}
 else if(cur===1){let pp=0;if(VP.pump>0){VP.pump+=dt;const t=(VP.pump-.2)/.38;if(t>0&&t<1)pp=Math.sin(t*Math.PI);if(t>.45&&!VP.ej){VP.ej=1;ejectIce(g,u)}if(VP.pump>.7){VP.pump=0;VP.ej=0}}
  if(VM.insp>0){const x=VM.insp;if(x>.25&&x<.75)pp=Math.max(pp,Math.abs(Math.sin((x-.25)*Math.PI*4))*.9)}
  if(dw<1&&dw>.45)pp=Math.max(pp,Math.sin((dw-.45)/.55*Math.PI));
  if(P_.pump)P_.pump.position.z=P_.pump.userData.base.z-pp*.075/u.k;g.rotation.z+=pp*.1;g.rotation.x-=pp*.05;g.position.x-=pp*.008;
  VP.cap=Math.max(0,VP.cap-dt*6);if(P_.cap)P_.cap.position.z=P_.cap.userData.base.z-VP.cap*.025/u.k}
 else if(cur===2){let pp=0;if(VP.mpump>0){VP.mpump+=dt;const t=(VP.mpump-.3)/.4;if(t>0&&t<1)pp=Math.sin(t*Math.PI);if(VP.mpump>.75)VP.mpump=0}
  if(VM.insp>0){const x=VM.insp;if(x>.25&&x<.75)pp=Math.max(pp,Math.abs(Math.sin((x-.25)*Math.PI*3)))}
  if(dw<1&&dw>.45)pp=Math.max(pp,Math.sin((dw-.45)/.55*Math.PI));
  if(P_.pump)P_.pump.position.y=P_.pump.userData.base.y-pp*.06/u.k;g.rotation.x+=pp*.03;
  VP.squash=Math.max(0,VP.squash-dt*5);const sq=Math.sin(VP.squash*Math.PI)*.05;if(u.model)u.model.scale.set(1+sq,1+sq,1-sq*.6);
  if(P_.ments&&P_.ments[0]){if(P_.mu>0){P_.mu=Math.min(1,P_.mu+dt/.32);if(P_.mu>=1){P_.mu=0;P_.mo=(P_.mo+1)%4;P_.mg=0}}P_.mg=Math.min(1,P_.mg+dt/.18);
   const uu=P_.mu>0?clamp((P_.mu-.15)/.85,0,1):0;P_.ments.forEach((p,j)=>{if(!p)return;const sl=((j+P_.mo)%4)+uu;p.position.copy(P_.ments[0].userData.base).addScaledVector(P_.mstep,sl);
    p.scale.setScalar(sl>3?Math.max(.001,4-sl):(sl<1&&((j+P_.mo)%4)===0?Math.max(.001,P_.mg):1))})}}
 else{const firing=VP.spray>0;VP.spray=Math.max(0,VP.spray-dt);VP.lever+=((firing||VP.dry>0||(VM.insp>.3&&VM.insp<.7)?1:0)-VP.lever)*e(18);
  if(P_.lever)P_.lever.rotation.x=VP.lever*.38;VP.needle+=(gas/100-VP.needle)*e(6);
  if(P_.needle)P_.needle.rotation.z=(VP.needle-.5)*-3.6+(firing?(Math.random()-.5)*.08:0)+(VM.insp>.3&&VM.insp<.55?Math.sin(VM.insp*40)*.3:0);
  if(P_.liquid)P_.liquid.scale.y=.3+.7*gas/100;
  if(P_.nozzle){const j=firing?.004/u.k:0;P_.nozzle.position.set(P_.nozzle.userData.base.x+(Math.random()-.5)*j,P_.nozzle.userData.base.y+(Math.random()-.5)*j,P_.nozzle.userData.base.z)}
  VP.jet=Math.max(0,VP.jet-dt*3);g.position.x+=Math.sin(T*90)*.004*VP.jet;
  if(P_.bub&&P_.bot){const bt2=P_.bot,lvl=(.3+.7*gas/100);for(const b of P_.bub){b.off+=dt*b.sp*(firing?.3:.07);const dx=b.c0.x-bt2.c.x,lim=Math.sqrt(Math.max(0,bt2.r*bt2.r-dx*dx)),top=Math.min(bt2.c.y+lim,bt2.c.y-bt2.r+2*bt2.r*lvl-.004);
   if(b.c0.y+b.off>top)b.off=bt2.c.y-lim-b.c0.y;b.o.position.y=b.y0+b.off}}}
 // ледяные гильзы шейкера
 for(let k=vmParts.length-1;k>=0;k--){const p=vmParts[k];p.t-=dt;p.v.y-=3.2*dt;p.m.position.addScaledVector(p.v,dt);p.m.rotation.x+=p.w.x*dt;p.m.rotation.y+=p.w.y*dt;if(p.t<=0){gunScene.remove(p.m);vmParts.splice(k,1)}}}
function ejectIce(g,u){if(!u.eject)return;const m=new THREE.Mesh(ICE_G,ICE_M);m.position.copy(u.eject).applyMatrix4(g.matrixWorld);gunScene.add(m);
 vmParts.push({m,v:new V3(.55+Math.random()*.3,.55+Math.random()*.3,.1+Math.random()*.15),w:new V3(Math.random()*20,Math.random()*20,0),t:.8})}
