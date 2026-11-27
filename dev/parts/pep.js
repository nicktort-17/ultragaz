/*PEP-BEGIN*/
/* ===== ПЕПСШТЕЙН — «ПОСЛЕДНИЙ АКЦИОНЕР»: финальный босс 4-го уровня (площадь храма) =====
 Модель models/pep.json (blender/pepsstein.py): HOST — старик, PH1 трон-паук, PH2 гуманоид, PH3 паук-гигант.
 e.ac уходит клиентам: 5 пробуждение · 10 ходьба 11 «Дивиденды» 12 «Пакет акций» 13 «Топот» 14 «Чаевые» 15 «Привилегия» 16 оглушён 17 «Капитализация» (таран)
 20/21 переход в фазу II · 30 ходьба 31 «Кулак рынка» 32/33 «Ракетный кулак» L/R 34/39 «Поглощение» (прыжок, 39 — повторный) 35 «Ценовой сговор» 36 «Франшиза» 37 оглушён 38 «Скупка» (три удара)
 40/41 переход в фазу III · 50 ходьба 51 «Обвал рынка» 52 «Ликвидация» 53 «Ракетный ливень» 54 «Прокол» 55 «Перегрузка ядра» 56 ядро подавлено
 57 «Враждебное поглощение» (всасывание) 58 «Делистинг» (осколки экранов) 59 «Дочерние компании» (дроны) · 60 крах паука, старика выбрасывает · 61 «Последний взнос» (добить старика)
 Ярость: когда в текущей фазе остаётся <35% её доли HP — короче паузы, быстрее ход, связки атак.
 Урон по игрокам считает хост (hitTarget), клиенты рисуют те же эффекты по событиям 'P' и по e.ac. */
ENEMY.pep={hp:640,r:3,cy:3.8,speed:0,boss:1,noslip:1,name:'ПЕПСШТЕЙН'};if(!TYPES.includes('pep'))TYPES.push('pep');
const PEP_Y=9,PEP_OBS=[[0,-123,3.7],[-14,-114,1.4],[14,-114,1.4],[-14,-134,1.4],[14,-134,1.4],[-8,-108.5,.6],[8,-108.5,.6],[-22,-108.5,.6],[22,-108.5,.6]];
const PEP_LINES=['КТО ПУСТИЛ НИЩЕБРОДА НА МОЙ ОСТРОВ?!','ДИВИДЕНДЫ — НЕ ДЛЯ ТЕБЯ!','ЧАЕВЫЕ, ХОЛОП!','У МЕНЯ ИММУНИТЕТ!','МОЯ ПРИВИЛЕГИЯ?!',
 'ДА КАК ТЫ СМЕЕШЬ! ЭТО МОЙ ОСТРОВ!','МОНОПОЛИЯ!','РЫНОК — ЭТО Я!','КУПЛЮ ТЕБЯ С ПОТРОХАМИ!','ФРАНШИЗА!','НЕТ! Я НЕ ПРОДАЮ! НИКОГДА!',
 'ВСЁ ЭТО — МОЁ!','ОБВАЛ РЫНКА!','ЛИКВИДАЦИЯ!','ТЫ — СТРОЧКА В МОЁМ ОТЧЁТЕ!','ПЕРЕГРУЗКА!','НЕТ... МОИ АКТИВЫ!..','Я ВЕЧЕН... Я...','ПАКЕТ АКЦИЙ — ЛОВИ!','ВОЗВРАТ ИНВЕСТИЦИЙ?!','ЗА МНОЙ БУДУЩЕЕ!','ЗВУК ЛИКВИДНОСТИ!',
 'КАПИТАЛИЗАЦИЯ!','СКУПАЮ ВСЁ!','ВРАЖДЕБНОЕ ПОГЛОЩЕНИЕ!','ДЕЛИСТИНГ!','ДОЧЕРНИЕ КОМПАНИИ — ФАС!','ЯРОСТЬ АКЦИОНЕРА!',
 'ДАВАЙ ДОГОВОРИМСЯ!','Я ВСЁ ВЕРНУ... ПОЧТИ!','ВОЗЬМИ АКЦИИ! ВСЕ!','ЧАЕВЫЕ... ВОЗЬМИ ЧАЕВЫЕ!','ТЫ НЕ ПОСМЕЕШЬ! Я — РЫНОК!'];
const PEP_PH={1:'ПЕПСШТЕЙН — ПРИВИЛЕГИЯ',2:'ПЕПСШТЕЙН — МОНОПОЛИЯ',3:'ПЕПСШТЕЙН — ВРАЖДЕБНОЕ ПОГЛОЩЕНИЕ',4:'ПЕПСШТЕЙН — ПОСЛЕДНИЙ ВЗНОС'};
const PEP_EPI='<b>ЭПИЛОГ</b>Империя Пепсштейна рухнула за одну торговую сессию: котировки — в ноль, острова — чайкам, контрольный пакет — уборщицам храма. От «последнего акционера» остались только золотые очки на площади. Говорят, по ночам из-под обломков ещё доносится: «...покупай на падении...». <i>Газ свободен.</i>';
let PEP_T=null;const PEP={fx:[],prop:null,say:null,tick:null};
const _pv=new V3(),_pv2=new V3(),_pv3=new V3(),_pq=new THREE.Quaternion(),_pe=new THREE.Euler(0,0,0,'YZX'),_pa=new THREE.Euler(0,0,0,'XYZ'),PZ=new V3(0,0,1),PY=new V3(0,1,0),PX=new V3(1,0,0);
const pepAuth=()=>!mp()||isHost;
const pepPh=ac=>ac<20?1:ac<40?2:3,PEP_SC={1:1.3,2:1.3,3:1.12};
const pepE=k=>k*k*(3-2*k),pepC=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
function pepFloor(e){if(e.ac===61)return 0;const k=(e.maxHp||600)/600,ph=pepPh(e.ac||5);return ph===1?400*k:ph===2?200*k:.5}
/* доля HP, оставшаяся в текущей фазе (1 → 0); ярость — меньше 35% */
function pepRageK(e){const m=e.maxHp||600,ph=pepPh(e.ac||5);return ph===1?(e.hp-m*2/3)/(m/3):ph===2?(e.hp-m/3)/(m/3):e.hp/(m/3)}
function pepCd(e,c){return c*(e.rage?.55:.8)}
function pepPuff(p,n,hex,spd,life,grav){const d=camera.position.distanceTo(p);if(d<4.5)return;if(d<9)n=Math.ceil(n*.35);puff(p,n,hex,spd,life,grav)}
function pfx(...a){if(mp()&&isHost)pushFx(['P',0,...a.map(r1)])}
function pepSnd(k,v=1){if(!ac||muted)return;try{
 if(k==='gat'){nz(.07,'bandpass',1800,.5*v);tone(.05,'square',140,90,.12*v)}
 else if(k==='laser'){tone(.5,'sawtooth',180,90,.18*v);nz(.5,'bandpass',900,.4*v,300)}
 else if(k==='whine'){tone(.9,'sawtooth',120,900,.12*v)}
 else if(k==='step'){nz(.25,'lowpass',260,1.1*v,60);tone(.2,'sine',70,35,.5*v)}
 else if(k==='coin'){tone(.12,'triangle',1800,2600,.12*v);tone(.18,'triangle',2400,3200,.08*v)}
 else if(k==='zap'){nz(.15,'highpass',3000,.5*v);tone(.12,'square',900,300,.1*v)}}catch(_){}}

/* ---------- модель ---------- */
function loadPep(){if(PEP_T||!THREE.GLTFLoader)return;PEP_T='load';ugModel('models/pep.json',gl=>{gl.scene.updateMatrixWorld(true);PEP_T=gl.scene;pepOnLoad()},undefined,()=>{PEP_T=null})}
function pepFacet(m){m.onBeforeCompile=sh=>{sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vPO;').replace('#include <begin_vertex>','#include <begin_vertex>\nvPO=position;');
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vPO;').replace('#include <color_fragment>','#include <color_fragment>\n{vec3 fn=normalize(cross(dFdx(vPO),dFdy(vPO)));diffuseColor.rgb*=.86+.14*fract(sin(dot(floor(fn*23.+.5),vec3(12.9898,78.233,37.719)))*43758.5453);}')};
 m.customProgramCacheKey=()=>'pepFacet';return m}
function pepTickTex(){if(PEP.tick)return PEP.tick;const c=document.createElement('canvas');c.width=1024;c.height=256;const tx=new THREE.CanvasTexture(c);tx.wrapS=THREE.RepeatWrapping;PEP.tick={c,tx,mode:''};pepTickDraw('norm');return PEP.tick}
function pepTickDraw(mode){const K=PEP.tick;if(!K||K.mode===mode)return;K.mode=mode;const g=K.c.getContext('2d');g.fillStyle=mode==='dead'?'#090103':'#1c0306';g.fillRect(0,0,1024,256);
 g.strokeStyle='rgba(255,60,40,.18)';g.lineWidth=2;for(let x=0;x<1024;x+=64){g.beginPath();g.moveTo(x,0);g.lineTo(x,256);g.stroke()}for(let y=0;y<256;y+=64){g.beginPath();g.moveTo(0,y);g.lineTo(1024,y);g.stroke()}
 g.font='900 64px "Russo One",Arial';g.textBaseline='middle';
 const row=mode==='crash'?['▼ ОБВАЛ ▼','−99%','▼ ОБВАЛ ▼','−99%']:mode==='dead'?['БАНКРОТ','0.00','БАНКРОТ','0.00']:['ПШТН ▲','+134%','ГАЗ ▼','−12%','ВОДА ▲','+7%'];
 let x=12;for(let i=0;i<row.length;i++){g.fillStyle=/▼|−|БАНК|0\.00/.test(row[i])?'#ff2a1c':'#ffd36a';g.fillText(row[i],x,62);x+=g.measureText(row[i]).width+30}
 g.lineWidth=7;g.strokeStyle=mode==='norm'?'#ffd36a':'#ff2a1c';g.beginPath();let y=mode==='norm'?220:120;g.moveTo(0,y);
 for(let i=1;i<=24;i++){y+=mode==='norm'?(Math.random()-.62)*26:mode==='crash'?(Math.random()-.15)*16:0;y=Math.max(110,Math.min(248,y));g.lineTo(i*43,y)}g.stroke();K.tx.needsUpdate=true}
function pepMats(){const E={envMap:ENV,envMapIntensity:.7,flatShading:true},S=(c,o)=>pepFacet(new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.6,metalness:.1},E,o)));
 const M={navy:S(0x2a3078,{roughness:.5,metalness:.18}),red:S(0xb8162d,{roughness:.5}),cream:S(0xdcc6ae,{roughness:.62,metalness:0}),metal:S(0x9a9ca6,{metalness:.8,roughness:.35}),
  gun:S(0x55545f,{metalness:.7,roughness:.4}),dark:S(0x2c2b36),skin:S(0xc99d86,{roughness:.8,metalness:0}),hair:S(0xcfccd8,{roughness:.85,metalness:0}),velvet:S(0x7a1223,{roughness:.9,metalness:0}),
  banner:S(0x8e1628,{roughness:.85,metalness:0,side:THREE.DoubleSide}),cableR:S(0xc41a2c,{roughness:.45}),cableB:S(0x2a4cc0,{roughness:.45}),
  gold:new THREE.MeshStandardMaterial({color:0xe0ac40,metalness:.95,roughness:.28,envMap:ENV,envMapIntensity:1.3,flatShading:true}),
  mouth:new THREE.MeshBasicMaterial({color:0x160404}),glow:new THREE.MeshBasicMaterial({color:0xff4a30}),eye:new THREE.MeshBasicMaterial({color:0xff6a40}),
  gem:new THREE.MeshStandardMaterial({color:0xff1636,emissive:0xff1636,emissiveIntensity:1.4,roughness:.15,flatShading:true}),
  glass:new THREE.MeshStandardMaterial({color:0xff5a5a,transparent:true,opacity:.3,roughness:.05,metalness:.1,envMap:ENV,envMapIntensity:1.6,depthWrite:false,side:THREE.DoubleSide,flatShading:true}),
  screen:new THREE.MeshBasicMaterial({map:pepTickTex().tx,side:THREE.DoubleSide})};
 if(typeof gzGlass==='function'){gzGlass(M.glass,.3);M.glass.side=THREE.DoubleSide}return M}
function pepClone(n,M){const o=PEP_T.getObjectByName(n).clone(true);o.position.set(0,0,0);o.quaternion.identity();o.scale.set(1,1,1);
 o.traverse(m=>{if(m.isMesh){m.material=M[m.material.name]||M.navy;m.castShadow=m.material!==M.glass&&m.material!==M.screen&&m.material!==M.glow;m.receiveShadow=false;if(m.material===M.glass)m.renderOrder=3}});return o}
function pepGlow(hex,s){const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:softTex('rgba(255,255,255,1)','rgba(255,255,255,0)'),color:hex,blending:THREE.AdditiveBlending,depthWrite:false,transparent:true}));sp.scale.set(s,s,1);return sp}
function pepLeg(root,hip,knee,Lu,Ll){root.updateMatrixWorld(true);const f=knee.localToWorld(new V3(0,-Ll,0));root.worldToLocal(f);f.y=0;
 return{hip,knee,Lu,Ll,rest:f,foot:new V3(),from:new V3(),want:new V3(),up:false,st:0,ov:null,init:false,hq:hip.quaternion.clone(),kq:knee.quaternion.clone()}}
function pepAssemble(g){const M=pepMats(),R={M,g};const F=(r,n)=>r.getObjectByName(n);
 R.host=pepClone('HOST',M);R.p1=pepClone('PH1',M);R.p2=pepClone('PH2',M);R.p3=pepClone('PH3',M);g.add(R.p1,R.p2,R.p3);R.p1.scale.setScalar(PEP_SC[1]);R.p2.scale.setScalar(PEP_SC[2]);R.p3.scale.setScalar(PEP_SC[3]);
 R.b1=F(R.p1,'P1_body');R.b1y=R.b1.position.y;R.seat1=F(R.p1,'P1_seat');R.ban1=F(R.p1,'P1_banner');
 R.gun={L:F(R.p1,'P1_gunL'),R:F(R.p1,'P1_gunR')};R.bar={L:F(R.p1,'P1_barL'),R:F(R.p1,'P1_barR')};R.mz={L:F(R.p1,'P1_mzL'),R:F(R.p1,'P1_mzR')};
 R.pod={L:F(R.p1,'P1_podL'),R:F(R.p1,'P1_podR')};R.pm={L:F(R.p1,'P1_pmL'),R:F(R.p1,'P1_pmR')};
 R.l1=[0,1,2,3].map(i=>pepLeg(R.p1,F(R.p1,'P1_hip'+i),F(R.p1,'P1_knee'+i),1.75,2.95));
 const P2=n=>F(R.p2,'P2_'+n);R.pel=P2('pelvis');R.pely=R.pel.position.y;R.chest=P2('chest');R.seat2=P2('seat');R.skF=P2('skirtF');R.skB=P2('skirtB');
 R.arm={L:P2('armL'),R:P2('armR')};R.elb={L:P2('elbL'),R:P2('elbR')};R.fist={L:P2('fistL'),R:P2('fistR')};R.thigh={L:P2('thighL'),R:P2('thighR')};R.knee2={L:P2('kneeL'),R:P2('kneeR')};R.foot2={L:P2('footL'),R:P2('footR')};
 R.b3=F(R.p3,'P3_body');R.b3y=R.b3.position.y;R.seat3=F(R.p3,'P3_seat');R.core=F(R.p3,'P3_core');R.dome=F(R.p3,'P3_dome');R.halo=F(R.p3,'P3_halo');R.cab=F(R.p3,'P3_cables');
 R.wing=[0,1,2,3,4,5].map(i=>{const w=F(R.p3,'P3_wing'+i);return{w,q0:w.quaternion.clone(),s:i<3?-1:1}});
 R.pod3={L:F(R.p3,'P3_podL'),R:F(R.p3,'P3_podR')};R.pm3={L:F(R.p3,'P3_pmL'),R:F(R.p3,'P3_pmR')};R.can={L:F(R.p3,'P3_canL'),R:F(R.p3,'P3_canR')};R.cm={L:F(R.p3,'P3_cmL'),R:F(R.p3,'P3_cmR')};
 R.l3=[0,1,2,3,4,5,6,7].map(i=>pepLeg(R.p3,F(R.p3,'P3_hip'+i),F(R.p3,'P3_knee'+i),3.6,5.6));
 const H=n=>F(R.host,'H_'+n);R.hd=H('head');R.jaw=H('jaw');R.neck=H('neck');R.tor=H('torso');R.hips=H('hips');
 R.harm={L:H('armL'),R:H('armR')};R.hfore={L:H('foreL'),R:H('foreR')};R.hhand={L:H('handL'),R:H('handR')};
 for(const k of['hd','jaw','neck','tor'])R[k+'q']=R[k].quaternion.clone();
 // голова всегда на своей шее (R.hdHome) — запасной возврат
 R.hdHome={par:R.hd.parent,pos:R.hd.position.clone(),s:R.hd.scale.clone()};R.hdq2=new THREE.Quaternion().setFromEuler(new THREE.Euler(.05,0,0));R.hdBase=R.hdq;R.neck2=P2('neck');
 // попадания — лучом по настоящим мешам фазы; метка слабого места на меше
 const tag=(o,w)=>o.traverse(m=>{if(m.isMesh)m.userData.pw=w});tag(R.host,'host');tag(R.core,'core');tag(R.dome,'dome');
 const ms=o=>{const a=[];o.traverse(m=>{if(m.isMesh)a.push(m)});return a},mh=ms(R.host),mhd=ms(R.hd);
 R.hl={1:ms(R.p1).concat(mh),2:ms(R.p2).concat(mh),3:ms(R.p3).concat(mh),61:mh};R.hph=1;
 // свечения: ядро, глаза, шит привилегии, лучи
 R.coreG=pepGlow(0xff3a20,5.5);R.core.add(R.coreG);
 R.eyeG=pepGlow(0xff4020,.55);R.hd.add(R.eyeG);R.eyeG.position.set(0,.11,.12);
 R.shield=new THREE.Mesh(new THREE.IcosahedronGeometry(1,2),new THREE.MeshBasicMaterial({color:0xffc94a,transparent:true,opacity:.22,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,wireframe:false}));
 R.shieldW=new THREE.Mesh(R.shield.geometry,new THREE.MeshBasicMaterial({color:0xffe08a,transparent:true,opacity:.5,wireframe:true,blending:THREE.AdditiveBlending,depthWrite:false}));R.shield.add(R.shieldW);
 R.shield.visible=false;R.b1.add(R.shield);R.shield.position.set(0,1.5,.3);
 const bm=()=>new THREE.MeshBasicMaterial({color:0xff4030,transparent:true,opacity:.85,blending:THREE.AdditiveBlending,depthWrite:false});
 const cyl=new THREE.CylinderGeometry(1,1,1,10,1,true).translate(0,.5,0).rotateX(Math.PI/2);R.beamG=cyl;
 R.beam2=new THREE.Mesh(cyl,bm());R.beam2.visible=false;scene.add(R.beam2);R.beams3=[new THREE.Mesh(cyl,bm()),new THREE.Mesh(cyl,bm())];R.beams3.forEach(b=>{b.visible=false;scene.add(b)});
 R.aim3=[new THREE.Mesh(cyl,new THREE.MeshBasicMaterial({color:0xff2a1a,transparent:true,opacity:.5,blending:THREE.AdditiveBlending,depthWrite:false})),null];R.aim3[1]=new THREE.Mesh(cyl,R.aim3[0].material);R.aim3.forEach(b=>{b.visible=false;scene.add(b)});
 R.cable=new THREE.Mesh(new THREE.CylinderGeometry(.06,.06,1,6,1,true).translate(0,.5,0).rotateX(Math.PI/2),new THREE.MeshStandardMaterial({color:0x2a2a30,metalness:.8,roughness:.4}));R.cable.visible=false;scene.add(R.cable);
 R.mzG={L:pepGlow(0xff4a20,1.6),R:pepGlow(0xff4a20,1.6)};R.cm.L.add(R.mzG.L);R.cm.R.add(R.mzG.R);R.mzG.L.visible=R.mzG.R.visible=false;
 R.ventG=pepGlow(0xff3020,2.8);R.chest.add(R.ventG);R.ventG.position.set(0,1.07,.86);R.ventG.visible=false;
 R.hostAt=0;pepHostTo(R,1);return R}
function pepHostTo(R,ph){if(R.hostAt===ph||R.wreck)return;R.hostAt=ph;const H=R.hdHome;
 if(R.hd.parent!==H.par){H.par.add(R.hd);R.hd.position.copy(H.pos);R.hd.scale.copy(H.s);R.hd.quaternion.copy(R.hdq)}R.hdBase=R.hdq;R.eyeG.scale.setScalar(.55);
 // фаза II: старик того же размера, что в I, просто залезает в «кабину» в груди робота (ноги внутри — скрыты)
 const seat=ph===1?R.seat1:ph===2?R.seat2:R.seat3;seat.add(R.host);R.host.position.set(0,0,0);R.host.quaternion.identity();R.host.scale.setScalar(ph===3?1.9:1.5);R.host.visible=true;R.hips.visible=ph!==2}
function pepDispose(R){if(!R)return;for(const m of[R.beam2,...R.beams3,...R.aim3,R.cable])if(m&&m.parent)m.parent.remove(m);
 if(!R.final){if(R.host&&R.host.parent===scene)scene.remove(R.host);if(R.wreck&&R.wreck.parent===scene)scene.remove(R.wreck)}}

/* ---------- 2-звенная IK ног: колено вверх; бедро — вдоль +X, голень — вдоль −Y от колена ---------- */
function pepIK2(h,dy,Lu,Ll){const D0=Math.hypot(h,dy)||1e-6,D=Math.max(Math.abs(Lu-Ll)+1e-3,Math.min(Lu+Ll-1e-3,D0)),fu=h/D0*D,fv=dy/D0*D;
 const a=(Lu*Lu-Ll*Ll+D*D)/(2*D),hh=Math.sqrt(Math.max(0,Lu*Lu-a*a));let nx=-fv/D,ny=fu/D;if(ny<0){nx=-nx;ny=-ny}
 const kx=a*fu/D+hh*nx,ky=a*fv/D+hh*ny,p=Math.atan2(ky,kx),phi=Math.atan2(fv-ky,fu-kx);return[p,p-phi-Math.PI/2]}
function pepIK(L,target){const par=L.hip.parent;_pv.copy(target);par.worldToLocal(_pv);_pv.sub(L.hip.position);
 const yaw=Math.atan2(-_pv.z,_pv.x),r=pepIK2(Math.hypot(_pv.x,_pv.z),_pv.y,L.Lu,L.Ll);
 L.hip.quaternion.setFromEuler(_pe.set(0,yaw,r[0]));L.knee.quaternion.setFromAxisAngle(PZ,-r[1])}
/* шаги: ноги одной группы шагают, пока другая стоит; цель — точка покоя, сдвинутая по скорости */
function pepGait(R,legs,root,o,dt){const grpBusy=[0,0];for(const L of legs)if(L.up)grpBusy[L.grp]=1;
 for(const L of legs){_pv2.copy(L.rest).multiplyScalar(o.spread||1);root.localToWorld(_pv2);_pv2.x+=(o.vx||0)*o.lead;_pv2.z+=(o.vz||0)*o.lead;_pv2.y=o.gy(_pv2.x,_pv2.z);L.want.copy(_pv2);
  if(!L.init){L.init=true;L.foot.copy(L.want)}
  if(!L.up&&!grpBusy[1-L.grp]&&L.foot.distanceTo(L.want)>o.thr){L.up=true;L.st=0;L.from.copy(L.foot);grpBusy[L.grp]=1}
  if(L.up){L.st+=dt/o.dur;const k=Math.min(1,L.st),k2=pepE(k);L.foot.lerpVectors(L.from,L.want,k2);L.foot.y+=o.lift*Math.sin(Math.PI*k);if(k>=1){L.up=false;L.foot.copy(L.want);if(o.onStep)o.onStep(L)}}
  pepIK(L,L.ov||L.foot)}}

/* ---------- эффекты (общие для хоста и клиентов) ---------- */
const PEP_RING_G=new THREE.CylinderGeometry(1,1,1,72,1,true).translate(0,.5,0);
function pepRing(x,z,dmg,spd,maxR,hex){const m=new THREE.Mesh(PEP_RING_G,new THREE.MeshBasicMaterial({color:hex||0xff3a1a,transparent:true,opacity:.9,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));
 m.position.set(x,PEP_Y,z);scene.add(m);const f={k:'ring',m,x,z,R:1.5,spd:spd||16,max:maxR||20,dmg:pepAuth()?dmg:0,hit:new Set()};PEP.fx.push(f);if(dmg)pfx(1,x,z,1,spd||16,maxR||20)}
function pepMark(x,z,r,life,hex){const m=new THREE.Mesh(new THREE.RingGeometry(.82,1,40).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({color:hex||0xff2a1a,transparent:true,opacity:.8,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide}));
 const d=new THREE.Mesh(new THREE.CircleGeometry(1,32).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({color:hex||0xff2a1a,transparent:true,opacity:.18,depthWrite:false,blending:THREE.AdditiveBlending}));m.add(d);
 m.position.set(x,PEP_Y+.06,z);m.scale.setScalar(r);scene.add(m);const f={k:'mark',m,t:0,life,r};PEP.fx.push(f);return f}
let PEP_RK_G=null;
function pepRocketMesh(){if(!PEP_RK_G){PEP_RK_G=new THREE.CylinderGeometry(.13,.13,.9,8).rotateX(Math.PI/2)}const m=new THREE.Mesh(PEP_RK_G,new THREE.MeshStandardMaterial({color:0xe8dfcd,roughness:.5}));
 const tip=new THREE.Mesh(new THREE.ConeGeometry(.14,.32,8).rotateX(Math.PI/2),new THREE.MeshBasicMaterial({color:0xff3a22}));tip.position.z=.6;m.add(tip);const fl=pepGlow(0xffa040,.9);fl.position.z=-.55;m.add(fl);scene.add(m);return m}
/* ракета: взлёт из кассеты вверх, затем пикирует в точку (кривая Безье); маркер на земле */
function pepRocket(from,tx,tz,T_,dmg,r){const m=pepRocketMesh();m.position.copy(from);const to=new V3(tx,PEP_Y,tz),c1=from.clone().add(new V3(0,9+Math.random()*4,0)),c2=to.clone().add(new V3(rnd(-2,2),14,rnd(-2,2)));
 const mk=pepMark(tx,tz,r||2.8,T_+.1,0xff3a1a);PEP.fx.push({k:'rk',m,mk,from:from.clone(),c1,c2,to,T:T_,t:0,dmg:pepAuth()?dmg:0,r:r||2.8});sfx('rocket',.35*Math.max(.3,sndV(from.x,from.y,from.z)))}
function pepCoin(from,tx,tz,T_,dmg){const m=new THREE.Mesh(new THREE.CylinderGeometry(.32,.32,.07,14),new THREE.MeshStandardMaterial({color:0xe0ac40,metalness:.95,roughness:.25,envMap:ENV}));m.position.copy(from);scene.add(m);
 const mk=pepMark(tx,tz,2.4,T_+.05,0xffc040);PEP.fx.push({k:'coin',m,mk,from:from.clone(),to:new V3(tx,PEP_Y+.1,tz),T:T_,t:0,dmg:pepAuth()?(dmg||14):0});pepSnd('coin')}
/* свеча графика: тёмно-красный столб падает с неба; потом стоит препятствием и уходит в землю */
const PEP_BAR_G=new THREE.BoxGeometry(1.2,1,1.2).translate(0,.5,0),PEP_WICK_G=new THREE.BoxGeometry(.18,1,.18).translate(0,.5,0);
function pepBar(x,z,h,delay){const m=new THREE.Mesh(PEP_BAR_G,new THREE.MeshStandardMaterial({color:0xc0101e,emissive:0x5a0008,roughness:.4,metalness:.2,envMap:ENV}));m.scale.set(1,h,1);
 const w=new THREE.Mesh(PEP_WICK_G,new THREE.MeshBasicMaterial({color:0xff3a22}));w.position.y=1;w.scale.y=1.2/h*2;m.add(w);m.visible=false;scene.add(m);
 const mk=pepMark(x,z,1.15,delay+1.05,0xff1a1a);const line=new THREE.Mesh(PEP_WICK_G,new THREE.MeshBasicMaterial({color:0xff2a1a,transparent:true,opacity:.35,blending:THREE.AdditiveBlending,depthWrite:false}));
 line.scale.set(.25,40,.25);line.position.set(x,PEP_Y,z);line.visible=false;scene.add(line);PEP.fx.push({k:'bar',m,mk,line,x,z,h,t:-delay,dmg:pepAuth()?30:0,hit:new Set()})}
function pepDebris(obj,vel,spin){const w=new V3(),q=new THREE.Quaternion(),s=new V3();obj.updateMatrixWorld(true);obj.matrixWorld.decompose(w,q,s);scene.add(obj);obj.position.copy(w);obj.quaternion.copy(q);obj.scale.copy(s);
 PEP.fx.push({k:'deb',m:obj,vel,spin:spin||new V3(rnd(-2,2),rnd(-2,2),rnd(-2,2)),t:0})}
function pepFxUpd(dt){const auth=pepAuth(),tg=auth?targets():null;
 for(const f of PEP.fx){if(f.dead)continue;
  if(f.k==='ring'){f.R+=f.spd*dt;f.m.scale.set(f.R,1.1,f.R);f.m.material.opacity=Math.max(0,.9*(1-Math.pow(f.R/f.max,3)));if(Math.random()<dt*18){const a=Math.random()*6.28;pepPuff(_pv.set(f.x+Math.sin(a)*f.R,PEP_Y+.4,f.z+Math.cos(a)*f.R),2,0xffb060,3,.4,6)}
   if(f.dmg)for(const c of tg){const key=c.local?'me':c.peer;if(f.hit.has(key))continue;const d=Math.hypot(c.pos.x-f.x,c.pos.z-f.z);if(Math.abs(d-f.R)<1&&c.pos.y<PEP_Y+1.05){f.hit.add(key);hitTarget(c,f.dmg,_pv.set(c.pos.x-f.x,0,c.pos.z-f.z).normalize().multiplyScalar(13).setY(8))}}
   if(f.R>f.max)f.dead=true}
  else if(f.k==='mark'){f.t+=dt;f.m.material.opacity=.45+.4*Math.abs(Math.sin(f.t*12));f.m.rotation.y+=dt*1.5;if(f.t>f.life)f.dead=true}
  else if(f.k==='rk'){f.t+=dt;const u=Math.min(1,f.t/f.T),a=1-u;_pv.set(0,0,0).addScaledVector(f.from,a*a*a).addScaledVector(f.c1,3*a*a*u).addScaledVector(f.c2,3*a*u*u).addScaledVector(f.to,u*u*u);
   f.m.lookAt(_pv);f.m.position.copy(_pv);if(Math.random()<dt*40)puff(f.m.position,1,0xd8d0c0,1.5,.6,-1);
   if(u>=1){f.dead=true;f.mk.dead=true;blast(f.to,f.r,0xff7a2a);pepPuff(f.to,30,0xffa040,8,.7,6);pepPuff(f.to,12,0x2a2020,4,1,-2);const v=sndV(f.to.x,f.to.y,f.to.z);sfx('boom',.7*Math.max(.25,v));shake=Math.max(shake,.3*v);
    if(f.dmg)for(const c of tg){const d=Math.hypot(c.pos.x-f.to.x,c.pos.z-f.to.z);if(d<f.r&&c.pos.y<PEP_Y+3){const k=1-d/f.r;hitTarget(c,Math.round(f.dmg*(.5+.5*k)),_pv2.set(c.pos.x-f.to.x,0,c.pos.z-f.to.z).normalize().multiplyScalar(10*k).setY(6*k))}}}}
  else if(f.k==='coin'){f.t+=dt;const u=Math.min(1,f.t/f.T);f.m.position.lerpVectors(f.from,f.to,u);f.m.position.y+=Math.sin(Math.PI*u)*6;f.m.rotation.x+=dt*14;
   if(u>=1){f.dead=true;f.mk.dead=true;blast(f.to,2.3,0xffd060);puff(f.to,26,0xffd060,8,.6,8);sfx('boom',.4*Math.max(.25,sndV(f.to.x,f.to.y,f.to.z)));
    if(f.dmg)for(const c of tg){const d=Math.hypot(c.pos.x-f.to.x,c.pos.z-f.to.z);if(d<2.5&&c.pos.y<PEP_Y+2.5)hitTarget(c,f.dmg,_pv2.set(c.pos.x-f.to.x,0,c.pos.z-f.to.z).normalize().multiplyScalar(8).setY(5))}}}
  else if(f.k==='bar'){const pt=f.t;f.t+=dt;
   if(f.t<0){}else if(f.t<1){f.line.visible=true;f.line.material.opacity=.15+.35*f.t}
   else{f.line.visible=false;f.m.visible=true;const fall=pepC((f.t-1)/.22);f.m.position.set(f.x,PEP_Y+(1-fall)*30,f.z);
    if(pt<1.22&&f.t>=1.22){f.mk.dead=true;blast(_pv.set(f.x,PEP_Y+.5,f.z),2.2,0xff3a1a);pepPuff(_pv,24,0x8a1a1a,7,.7,6);pepPuff(_pv,12,0xd8c8b0,5,1,-1);const v=sndV(f.x,PEP_Y,f.z);sfx('slam',.8*Math.max(.25,v));shake=Math.max(shake,.25*v);
     if(f.dmg)for(const c of tg){const d=Math.hypot(c.pos.x-f.x,c.pos.z-f.z);if(d<1.35&&c.pos.y<PEP_Y+f.h){hitTarget(c,f.dmg,_pv2.set(c.pos.x-f.x,0,c.pos.z-f.z).normalize().multiplyScalar(14).setY(7))}}}
    if(f.t>3.6){const s=pepC((f.t-3.6)/.6);f.m.position.y=PEP_Y-s*f.h;if(s>=1)f.dead=true}}}
  else if(f.k==='deb'){f.t+=dt;f.vel.y-=18*dt;f.m.position.addScaledVector(f.vel,dt);f.m.rotation.x+=f.spin.x*dt;f.m.rotation.y+=f.spin.y*dt;f.m.rotation.z+=f.spin.z*dt;
   if(f.m.position.y<PEP_Y){f.m.position.y=PEP_Y;f.vel.multiplyScalar(.4);f.vel.y=Math.abs(f.vel.y)*.3;f.spin.multiplyScalar(.5)}if(Math.random()<dt*10)puff(f.m.position,1,0x3a3030,2,1.2,-2);
   if(f.t>3.2){f.m.scale.multiplyScalar(1-Math.min(.5,dt*2.5));if(f.t>4.6)f.dead=true}}
  else if(f.k==='z'){f.t+=dt;f.m.position.y+=dt*.6;f.m.position.x+=Math.sin(f.t*2)*dt*.3;f.m.material.opacity=Math.max(0,1-f.t/2.4);if(f.t>2.4)f.dead=true}
  else if(f.k==='sk'){f.t+=dt;const u=Math.min(1,f.t/f.T);f.m.position.lerpVectors(f.from,f.to,u*u);f.m.material.opacity=.9*(1-u*.5);if(u>=1)f.dead=true}
  else if(f.k==='gl'){f.t+=dt;if(!f.rest){f.vel.y-=18*dt;f.m.position.addScaledVector(f.vel,dt);f.m.rotation.x+=f.spin.x*dt;f.m.rotation.z+=f.spin.z*dt;
    if(f.m.position.y<PEP_Y+.03){f.m.position.y=PEP_Y+.03;if(Math.abs(f.vel.y)<2.5){f.rest=1;f.m.rotation.set(-Math.PI/2+.08,f.m.rotation.y,0);pepSnd('coin',.6)}else{f.vel.y=-f.vel.y*.35;f.vel.x*=.5;f.vel.z*=.5;pepSnd('coin',.4)}}}
   if(f.t>40){f.m.scale.multiplyScalar(1-Math.min(.5,dt*2));if(f.t>41.5)f.dead=true}}
  else if(f.k==='wreck'){f.t+=dt;const R=f.R,left=Math.ceil(f.T-f.t),done=story&&story.phase==='done';
   if(f.t>-1.4&&!f.al){f.al=1;if(typeof gzAlert==='function')gzAlert('ПЕПСШТЕЙН','ОБАНКРОЧЕН','последний взнос принят · ядро обломков нестабильно','gold')}
   if(f.t>=0&&left!==f.n&&left>0){f.n=left;if(!done)banner('ЯДРО НЕСТАБИЛЬНО — БЕГИ В ХРАМ! '+left);pepSnd('zap',.7)}
   const u=Math.max(0,f.t);R.core.scale.setScalar(1+.3*Math.abs(Math.sin(u*(3+u*1.6))));R.coreG.material.opacity=.55+.45*Math.abs(Math.sin(u*(5+u*2)));R.coreG.material.color.setHex(u%1<.5?0xffd0a0:0xff3a20);R.coreG.scale.setScalar(5.5+u*.9);
   if(Math.random()<dt*(2.5+u*.9)){R.b3.getWorldPosition(_pv);_pv.add(_pv2.set(rnd(-3.5,3.5),rnd(-1,2.5),rnd(-3.5,3.5)));blast(_pv,1.7,0xff7a2a);pepPuff(_pv,14,0xffa040,7,.6,4);if(Math.random()<.4)sfx('boom',.35*Math.max(.25,sndV(_pv.x,_pv.y,_pv.z)))}
   if(f.t>=f.T){f.dead=true;pepBoom(R,R.core.getWorldPosition(new V3()))}}}
 // свечи — препятствия для своего игрока
 if(P.alive)for(const f of PEP.fx)if(f.k==='bar'&&!f.dead&&f.t>1.22&&f.t<4){const dx=P.pos.x-f.x,dz=P.pos.z-f.z,m=.6+.45;if(Math.abs(dx)<m&&Math.abs(dz)<m&&P.pos.y<f.m.position.y+f.h-.2){if(Math.abs(dx)>Math.abs(dz))P.pos.x=f.x+Math.sign(dx||1)*m;else P.pos.z=f.z+Math.sign(dz||1)*m}}
 PEP.fx=PEP.fx.filter(f=>{if(f.dead){if(f.m&&f.m.parent)f.m.parent.remove(f.m);if(f.line&&f.line.parent)f.line.parent.remove(f.line)}return!f.dead})}
function pepReset(){for(const f of PEP.fx){if(f.m&&f.m.parent)f.m.parent.remove(f.m);if(f.line&&f.line.parent)f.line.parent.remove(f.line)}PEP.fx=[];
 if(PEP.say&&PEP.say.parent)PEP.say.parent.remove(PEP.say);PEP.say=null;pepTint(0);for(const e of enemies)if(e.type==='pep')pepDispose(e.g.userData.pep);
 if(PEP.prop&&(!L4||!PEP.prop.g.parent||PEP.prop.g.parent!==mapGroup)){if(PEP.prop.g.parent)PEP.prop.g.parent.remove(PEP.prop.g);pepDispose(PEP.prop.R);PEP.prop=null}}
/* сеть: клиенты повторяют эффекты */
function pepFx(n){const e=enemies.find(x=>x.type==='pep'&&!x.dead),k=n[0];
 if(k===1)pepRing(n[1],n[2],0,n[4],n[5]);
 else if(k===2){if(!e||!e.g.userData.pep)return;const R=e.g.userData.pep,ph=pepPh(e.ac||5),side=n[1]?'R':'L',from=(ph===1?R.pm[side]:R.pm3[side]).getWorldPosition(new V3());pepRocket(from,n[2],n[3],n[4],0,n[5])}
 else if(k===3){for(let i=1;i+3<n.length+1;i+=4)if(n[i+3]!=null)pepBar(n[i],n[i+1],n[i+2],n[i+3])}
 else if(k===4){if(e)pepSay(e,PEP_LINES[n[1]]||'')}
 else if(k===5){if(e)pepShieldFx(e)}
 else if(k===7)pepMark(n[1],n[2],n[3],n[4],0xff3a1a);
 else if(k===8){if(e)pepBlastFx(e)}
 else if(k===9){if(e)(e.stabs||(e.stabs=[])).push({leg:n[1],x:n[2],z:n[3],t:0})}
 else if(k===10){if(e)e.beamD=n[1]}
 else if(k===12){if(!e||!e.g.userData.pep)return;const R=e.g.userData.pep;pepCoin(R.hhand.R.getWorldPosition(new V3()),n[1],n[2],n[3])}
 else if(k===13){for(let i=1;i+1<n.length;i+=2)pepMark(n[i],n[i+1],2.3,1,0xffa030)}
 else if(k===14){banner('ЯРОСТЬ АКЦИОНЕРА!');sfx('roar',.8)}}

/* ---------- реплики ---------- */
function pepSay(e,txt,dur){const R=e.g.userData.pep;if(!R)return;const c=document.createElement('canvas');c.width=1024;c.height=200;const g=c.getContext('2d');g.font='900 66px "Russo One",Arial';
 const w=Math.min(1000,g.measureText(txt).width+80),x0=(1024-w)/2;g.fillStyle='rgba(18,22,60,.94)';g.strokeStyle='#e0ac40';g.lineWidth=9;g.beginPath();g.roundRect?g.roundRect(x0,16,w,128,22):g.rect(x0,16,w,128);g.fill();g.stroke();
 g.fillStyle='#e0ac40';g.beginPath();g.moveTo(492,142);g.lineTo(512,190);g.lineTo(536,142);g.fill();g.fillStyle='#fff1d0';g.textAlign='center';g.textBaseline='middle';g.fillText(txt,512,82,980);
 if(!PEP.say){PEP.say=new THREE.Sprite(new THREE.SpriteMaterial({transparent:true,depthWrite:false,depthTest:false}));PEP.say.renderOrder=20;scene.add(PEP.say)}
 if(PEP.say.material.map)PEP.say.material.map.dispose();PEP.say.material.map=new THREE.CanvasTexture(c);PEP.say.material.needsUpdate=true;PEP.say.userData={t:dur||2.8,e};e.talk=Math.min(2.2,dur||2.8)}
function pepSayN(e,i,dur){pepSay(e,PEP_LINES[i],dur);pfx(4,i)}
function pepSayUpd(dt){const S=PEP.say;if(!S)return;const u=S.userData;u.t-=dt;const e=u.e,R=e&&e.g.userData.pep;S.visible=u.t>0&&!!R&&!e.dead;if(!S.visible)return;
 R.hd.getWorldPosition(_pv);const d=camera.position.distanceTo(_pv),s=Math.max(6,d*.36);S.position.copy(_pv).add(_pv2.set(0,1.4+s*.14,0));S.scale.set(s,s*.195,1);S.material.opacity=Math.min(1,u.t*3)}

/* ---------- сборка врага ---------- */
function buildPep(g,mm,mats){g.userData.pepPending=true;if(PEP_T&&PEP_T!=='load'){g.userData.pep=pepAssemble(g);g.userData.pepPending=false}else loadPep();
 const eyes=new THREE.MeshBasicMaterial({color:0xff4020});return eyes}
function pepTryBuild(e){if(e.g.userData.pep||!PEP_T||PEP_T==='load')return;e.g.userData.pep=pepAssemble(e.g)}
function pepOnLoad(){}
function pepPrewarm(){try{const w=new THREE.Group();pepAssemble(w);w.position.set(0,-80,0);scene.add(w);renderer.compile(scene,camera);scene.remove(w);pepDispose(w.userData.pep||null)}catch(_){}}
function pepSpawnInit(e){e.pos.set(0,PEP_Y,-129);e.g.rotation.y=0;e.vel.set(0,0,0);const ck=story&&story.pepPh||1,k=e.maxHp;
 if(ck>=3){e.hp=k/3+.5;pepSet(e,'tr23',41);banner('ЧЕКПОИНТ: ФАЗА III')}else if(ck===2){e.hp=k*2/3+.5;pepSet(e,'tr12',21);banner('ЧЕКПОИНТ: ФАЗА II')}else pepSet(e,'wake',5);e.inv=true;sfx('horn',.8)}
function pepKillGuard(e,quiet){if(e.pepDone||quiet||e.remote)return false;if(e.st!=='death'){e.hp=.5;e.inv=true;pepSet(e,'death',60)}return true}
/* спящий босс у портика до начала боя */
function pepProp(){if(PEP.prop||!PEP_T||PEP_T==='load'||!L4)return;if(enemies.some(x=>x.type==='pep'))return;const g=new THREE.Group();g.position.set(0,PEP_Y,-129);mapGroup.add(g);
 const R=pepAssemble(g);g.userData.pep=R;R.p2.visible=R.p3.visible=false;PEP.prop={g,R,t:0,zt:0};if(PEP.warm!==L4){PEP.warm=L4;pepPrewarm()}pepPoseP1(R,{h:1.05,tilt:.12},0)}
function pepPropUpd(dt){const pr=PEP.prop;if(!pr)return;if(!L4||pr.g.parent!==mapGroup||enemies.some(x=>x.type==='pep')){if(pr.g.parent)pr.g.parent.remove(pr.g);pepDispose(pr.R);PEP.prop=null;return}
 pr.t+=dt;const R=pr.R;R.b1.position.y=R.b1y-1.55+Math.sin(pr.t*1.3)*.04;R.hd.quaternion.copy(R.hdq).multiply(_pq.setFromAxisAngle(PX,.55+Math.sin(pr.t*1.3)*.05));R.jaw.quaternion.setFromAxisAngle(PX,.05);
 pr.g.updateMatrixWorld(true);for(const L of R.l1){if(!L.init){_pv2.copy(L.rest).multiplyScalar(1.12);pr.g.localToWorld(_pv2);_pv2.y=PEP_Y;L.foot.copy(_pv2);L.init=true}pepIK(L,L.foot)}
 pr.zt-=dt;if(pr.zt<=0&&camera.position.distanceTo(pr.g.position)<60){pr.zt=1.1;const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d');x.font='900 52px "Russo One",Arial';x.fillStyle='#fff1d0';x.strokeStyle='#23338a';x.lineWidth=6;x.strokeText('Z',14,50);x.fillText('Z',14,50);
  const s=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),transparent:true,depthWrite:false}));R.hd.getWorldPosition(s.position);s.position.y+=.7;s.scale.setScalar(.7);scene.add(s);PEP.fx.push({k:'z',m:s,t:0})}}

/* ---------- позы ---------- */
function pepPoseP1(R,o,dt){R.b1.position.y=R.b1y-(o.low||0)+(o.bob||0);R.b1.rotation.set(o.tilt||0,0,o.roll||0)}
function pepHostAnim(e,R,dt,o){const t=T+(e?e.seed||0:0);
 // голова следит за игроком, челюсть — когда говорит/кричит
 let yaw=0,pit=0;if(o.look){R.hd.getWorldPosition(_pv);_pv2.copy(o.look).sub(_pv);const iq=_pq.copy(R.hd.parent.getWorldQuaternion(new THREE.Quaternion())).invert();_pv2.applyQuaternion(iq);yaw=pepC(Math.atan2(_pv2.x,_pv2.z),-.9,.9);pit=pepC(-Math.atan2(_pv2.y,Math.hypot(_pv2.x,_pv2.z)),-.5,.5)}
 if(o.droop)pit=.55+Math.sin(t*1.3)*.05;if(o.daze){yaw=Math.sin(t*2.6)*.5;pit=.25+Math.sin(t*3.1)*.15}
 R.hdA=R.hdA||{y:0,p:0};R.hdA.y+=(yaw-R.hdA.y)*Math.min(1,dt*5);R.hdA.p+=(pit-R.hdA.p)*Math.min(1,dt*5);
 R.hd.quaternion.copy(R.hdBase||R.hdq).multiply(_pq.setFromEuler(_pe.set(R.hdA.p,R.hdA.y,0)));
 const talk=e&&e.talk>0;if(e&&e.talk>0)e.talk-=dt;const jaw=o.scream?.42+Math.sin(t*30)*.05:talk?.18+Math.abs(Math.sin(t*13))*.22:.12;R.jawA=(R.jawA||0)+(jaw-(R.jawA||0))*Math.min(1,dt*12);R.jaw.quaternion.setFromAxisAngle(PX,R.jawA);
 // руки: на подлокотниках, взмах «чаевых», поднятые в «привилегии»
 const flick=o.flick||0,raise=o.raise||0;
 R.harm.R.quaternion.setFromEuler(_pa.set(-1.4*flick-1.1*raise,0,-.25*raise-.15*flick));R.harm.L.quaternion.setFromEuler(_pa.set(-1.1*raise,0,.25*raise));
 R.hfore.R.quaternion.setFromAxisAngle(PX,-.5*flick);
 R.tor.quaternion.copy(R.torq).multiply(_pq.setFromAxisAngle(PX,(o.lean||0)+Math.sin(t*1.7)*.02))}

/* ---------- попадания: луч по видимым мешам текущей фазы (слабые места — по метке меша) ---------- */
function pepVis(o){while(o){if(!o.visible)return false;o=o.parent}return true}
function pepRay(e,o,d){const R=e.g.userData.pep;if(!R||!R.hl)return raySphere(o,d,center(e,_pv3),e.r);const L=R.hl[R.hph]||R.hl[1];
 const rc=R.rc||(R.rc=new THREE.Raycaster());rc.set(o,d);rc.far=500;const hits=rc.intersectObjects(L,false);
 for(const h of hits){if(!pepVis(h.object))continue;e.pwk=h.object.userData.pw||null;e.pwkT=T;return h.distance}return null}
function pepWeak(e){return e.pwkT===T&&!!e.pwk}
function pepWeakLbl(e){return e.pwk==='core'?'В ЯДРО':e.pwk==='dome'?'В КУПОЛ':'В АКЦИОНЕРА'}

/* ---------- урон по боссу ---------- */
function pepDmg(e,dmg,src){if(e.pwkT===T&&e.pwk==='core'&&src!=='parry')src='pcore';
 if(e.remote){const fl=pepFloor(e);if(e.hp-dmg<fl)dmg=Math.max(0,e.hp-fl);if(e.ac===15&&src!=='punch'&&src!=='parry')pepShieldPing(e);return[dmg,src]}
 return[pepApply(e,dmg,src),src]}
function pepApply(e,dmg,src){const ac=e.ac||5;
 if(ac===15){if(src==='punch'||src==='parry'){pepShieldBreak(e);dmg*=1.2}else{dmg*=.1;pepShieldPing(e)}}
 if(ac===16||ac===37||ac===56)dmg*=1.5;
 if((ac===55||ac===57)&&src==='pcore'){e.coreDmg=(e.coreDmg||0)+dmg}
 if(src==='parry'&&ac>=30&&ac<37&&!e.inv&&e.st!=='stag2'&&T-(e.parT||-9)>1){e.parT=T;addStyle('ВОЗВРАТ ИНВЕСТИЦИЙ',260);pepSet(e,'stag2',37);pepSayN(e,19)}
 const fl=pepFloor(e);if(e.hp-dmg<fl)dmg=Math.max(0,e.hp-fl);return dmg}
function pepNetDmg(e,dmg,src){if(e.inv)return 0;return pepApply(e,dmg,src)}
function pepShieldPing(e){if(Math.random()<.35){const R=e.g.userData.pep;if(R){R.shield.getWorldPosition(_pv);puff(_pv.add(_pv2.set(rnd(-2,2),rnd(-1,2),rnd(-2,2))),4,0xffd060,5,.3)}if(Math.random()<.3)sfx('ding',.25)}}
function pepShieldBreak(e){if(e.st!=='shield')return;addStyle('ПРИВИЛЕГИЯ ОТОЗВАНА',220);heal(25);pepShieldFx(e);pfx(5);pepSet(e,'stag1',16);pepSayN(e,4)}
function pepShieldFx(e){const R=e.g.userData.pep;if(!R)return;R.shield.getWorldPosition(_pv);blast(_pv,4.5,0xffd060);puff(_pv,80,0xffd060,14,.8,4);sfx('parry',1);sfx('boom',.6);shake=Math.max(shake,.35);freeze=Math.max(freeze,.08)}
function pepBlastFx(e){const R=e.g.userData.pep;if(!R)return;R.core.getWorldPosition(_pv);const p=_pv.clone();blast(p,30,0xfff0e0);puff(p,160,0xffe8d0,26,1.2,2);puff(p,80,0xff3a1a,18,1.4,2);sfx('boom',1.2);sfx('frag',1);shake=1;
 const fl=$('vig');if(fl)fl.style.opacity=1}

/* ---------- ИИ (хост) ---------- */
function pepSet(e,st,acN){e.st=st;e.stT=0;e.ac=acN}
function pepTurn(e,want,rate,dt){const cur=e.g.rotation.y,d=angD(want,cur);e.g.rotation.y=cur+Math.sign(d)*Math.min(Math.abs(d),rate*dt)}
function pepBox(e){const ph=pepPh(e.ac||5);return ph===3?[-13.5,13.5,-126.5,-114.5]:[-21,21,-131.5,-110]}
function pepClamp(e){const b=pepBox(e);e.pos.x=pepC(e.pos.x,b[0],b[1]);e.pos.z=pepC(e.pos.z,b[2],b[3])}
function pepMove(e,tx,tz,spd,dt,avoid){const dx=tx-e.pos.x,dz=tz-e.pos.z,d=Math.hypot(dx,dz);let vx=0,vz=0;if(d>.4){const s=Math.min(spd,d*2);vx=dx/d*s;vz=dz/d*s}
 if(avoid)for(const o of PEP_OBS){const ox=e.pos.x-o[0],oz=e.pos.z-o[1],od=Math.hypot(ox,oz)||.01,m=o[2]+avoid;if(od<m+1.5){const k=Math.min(2,(m+1.5-od)/1.5);vx+=ox/od*spd*k;vz+=oz/od*spd*k}}
 e.vel.x+=(vx-e.vel.x)*Math.min(1,dt*3);e.vel.z+=(vz-e.vel.z)*Math.min(1,dt*3);e.pos.x+=e.vel.x*dt;e.pos.z+=e.vel.z*dt;
 if(avoid)for(const o of PEP_OBS){const ox=e.pos.x-o[0],oz=e.pos.z-o[1],od=Math.hypot(ox,oz)||.01,m=o[2]+avoid*.75;if(od<m){e.pos.x=o[0]+ox/od*m;e.pos.z=o[1]+oz/od*m}}
 pepClamp(e)}
function pepPick(e,list){const ok=list.filter(a=>a[1]>0&&a[0]!==e.lastA);let s=0;for(const a of ok)s+=a[1];let r=Math.random()*s;for(const a of ok){r-=a[1];if(r<=0){e.lastA=a[0];return a[0]}}return ok.length?ok[0][0]:null}
function pepLaunch(e,R,side,tx,tz,T_,dmg,r,ph){const from=(ph===1?R.pm[side]:R.pm3[side]).getWorldPosition(new V3());pepRocket(from,tx,tz,T_,dmg,r);pfx(2,side==='R'?1:0,tx,tz,T_,r)}
function pepGround(x,z){return groundAt(x,z,PEP_Y+1.2)}
function pepSeg(a,b,mn,mx){let t0=0,t1=1;for(const k of['x','y','z']){const d=b[k]-a[k];if(Math.abs(d)<1e-9){if(a[k]<mn[k]||a[k]>mx[k])return false}else{let u=(mn[k]-a[k])/d,v=(mx[k]-a[k])/d;if(u>v){const w=u;u=v;v=w}t0=Math.max(t0,u);t1=Math.min(t1,v);if(t0>t1)return false}}return true}
const PEP_COL={min:new V3(-.8,PEP_Y,-123.8),max:new V3(.8,PEP_Y+2.9,-122.2)};
function pepLos(a,b){if(pepSeg(a,b,PEP_COL.min,PEP_COL.max))return false;for(const bx of boxes)if(bx.max.y-bx.min.y>.9&&pepSeg(a,b,bx.min,bx.max))return false;return true}
function pepHitNear(x,z,r,dmg,kn,yMax){for(const c of targets()){const dx=c.pos.x-x,dz=c.pos.z-z,d=Math.hypot(dx,dz);if(d<r&&c.pos.y<(yMax||PEP_Y+3)){const k=1-d/r;hitTarget(c,Math.round(dmg*(.55+.45*k)),_pv2.set(dx,0,dz).normalize().multiplyScalar(kn*k+4).setY(7*k+3))}}}
function pepAI(e,t,to,dist,dt,tg){if(!e.g.userData.pep){pepTryBuild(e);if(!e.g.userData.pep)return}
 const R=e.g.userData.pep;e.stT=(e.stT||0)+dt;e.cdA=(e.cdA||0)-dt;e.cdS=(e.cdS||0)-dt;e.cdC=(e.cdC==null?14:e.cdC)-dt;e.cdF=(e.cdF==null?12:e.cdF)-dt;const st=e.st||'wake',tt=e.stT,tp=t.pos;
 const ph=pepPh(e.ac||5),want=Math.atan2(tp.x-e.pos.x,tp.z-e.pos.z);e.vel.y=0;e.cdB=(e.cdB==null?16:e.cdB)-dt;
 if(/^walk/.test(st)&&!e.inv&&e.rageP!==ph&&pepRageK(e)<.35){e.rageP=ph;banner('ЯРОСТЬ АКЦИОНЕРА!');pepSayN(e,27,2);sfx('roar',.9);shake=Math.max(shake,.4);pfx(14)}
 e.rage=e.rageP===ph;
 if(!e.inv&&st!=='death'&&e.hp<=pepFloor(e)+.01){if(ph===1){pepSet(e,'tr12',20);e.inv=true;return}if(ph===2){pepSet(e,'tr23',40);e.inv=true;return}if(ph===3){pepSet(e,'death',60);e.inv=true;return}}
 const fw=_pv3.set(Math.sin(e.g.rotation.y),0,Math.cos(e.g.rotation.y));
 switch(st){
 /* --- пробуждение --- */
 case'wake':e.inv=true;e.ac=5;pepTurn(e,want,.8,dt);if(tt>2.7){e.inv=false;pepSet(e,'walk1',10);e.cdA=1.2}break;
 /* --- ФАЗА I --- */
 case'walk1':{pepTurn(e,want,1.6,dt);const side=_pv.set(-(tp.z-e.pos.z),0,tp.x-e.pos.x).normalize(),rd=dist<9?-1:dist>15?1:0;e.strafe=e.strafe||1;if(Math.random()<dt*.25)e.strafe*=-1;
  pepMove(e,e.pos.x+side.x*e.strafe*6+(tp.x-e.pos.x)/(dist||1)*rd*6,e.pos.z+side.z*e.strafe*6+(tp.z-e.pos.z)/(dist||1)*rd*6,e.rage?5.8:4.6,dt,2.4);
  if(e.cdA<=0){const a=pepPick(e,[['stomp',dist<7.5?60:0],['gat',dist>5?34:10],['rkt',30],['coin',dist>8?16:0],['shield',e.cdS<=0?24:0],['charge',dist>8?26:6]]);
   if(a==='charge'){pepSet(e,'charge',17);sfx('charge',.8);break}
   if(a==='stomp'){pepSet(e,'stomp',13);sfx('charge',.6)}else if(a==='gat'){pepSet(e,'gat',11);e.sw=Math.random()<.5?-1:1;e.fireAcc=0;pepSnd('whine',.8);if(Math.random()<.4)pepSayN(e,1)}
   else if(a==='rkt'){pepSet(e,'rkt',12);e.rkN=0;e.rkAt=tp.clone();if(Math.random()<.4)pepSayN(e,18)}else if(a==='coin'){pepSet(e,'coin',14);pepSayN(e,2)}else if(a==='shield'){pepSet(e,'shield',15);e.cdS=16;e.orbT=1;pepSayN(e,3);sfx('ding',.8)}}break}
 case'gat':{pepTurn(e,want,1.1,dt);e.vel.multiplyScalar(.9);if(tt>.9&&tt<3.3){e.fireAcc+=dt*18;while(e.fireAcc>=1){e.fireAcc--;e.gs=(e.gs||0)^1;const side=e.gs?'R':'L',from=R.mz[side].getWorldPosition(new V3());
    const u=(tt-.9)/2.4,aimP=_pv.set(tp.x+t.vel.x*.25,tp.y+1,tp.z+t.vel.z*.25),dir=aimP.sub(from).normalize().applyAxisAngle(PY,e.sw*(.32-.64*u));dir.x+=rnd(-.02,.02);dir.y+=rnd(-.015,.02);dir.z+=rnd(-.02,.02);dir.normalize();
    altBullet(from,dir,46,4);if(Math.random()<.5)pepSnd('gat',.5*Math.max(.3,sndV(from.x,from.y,from.z)));puff(from,2,0xffd27a,4,.12,0)}}
  if(tt>3.6){if(e.rage){pepSet(e,'rkt',12);e.rkN=0;e.rkAt=tp.clone();break}pepSet(e,'walk1',10);e.cdA=pepCd(e,1.4)}break}
 case'rkt':pepTurn(e,want,1,dt);e.vel.multiplyScalar(.9);if(tt>.6&&e.rkN<12&&tt>.6+e.rkN*.09){const i=e.rkN++,a=i/11*Math.PI*2+e.seed,r=i===0?0:3.6,c=i===0?tp:e.rkAt;pepLaunch(e,R,i%2?'R':'L',c.x+Math.sin(a)*r,c.z+Math.cos(a)*r,1.55,18,2.8,1)}
  if(tt>2.5){pepSet(e,'walk1',10);e.cdA=pepCd(e,1.3)}break;
 case'stomp':e.vel.multiplyScalar(.85);if(tt>.72&&!e.did){e.did=1;pepRing(e.pos.x,e.pos.z,18,15,18,0xffa030);pepHitNear(e.pos.x+fw.x*2,e.pos.z+fw.z*2,5,24,12);shake=Math.max(shake,.5);sfx('slam',1);pepPuff(_pv.set(e.pos.x,PEP_Y+.3,e.pos.z),36,0xd8c8b0,7,1,-1)}
  if(e.rage&&tt>1.05&&!e.d2){e.d2=1;pepRing(e.pos.x,e.pos.z,16,19,22,0xff6a30);sfx('slam',.8)}
  if(tt>1.5){e.did=e.d2=0;pepSet(e,'walk1',10);e.cdA=pepCd(e,1.1)}break;
 case'coin':pepTurn(e,want,1.4,dt);e.vel.multiplyScalar(.9);if(tt>.55&&!e.did){e.did=1;const from=R.hhand.R.getWorldPosition(new V3());for(let i=0;i<5;i++){const a=rnd(0,6.28),r=i?rnd(1.5,4):0,x=tp.x+t.vel.x*.6+Math.sin(a)*r,z=tp.z+t.vel.z*.6+Math.cos(a)*r,T_=1+i*.08;pepCoin(from,x,z,T_);pfx(12,x,z,T_)}}
  if(tt>1.4){e.did=0;pepSet(e,'walk1',10);e.cdA=pepCd(e,1.2)}break;
 case'shield':{pepTurn(e,want,1.4,dt);const side=_pv.set(-(tp.z-e.pos.z),0,tp.x-e.pos.x).normalize();pepMove(e,e.pos.x+side.x*e.strafe*5,e.pos.z+side.z*e.strafe*5,3,dt,2.4);
  e.orbT-=dt;if(tt>.5&&e.orbT<=0){e.orbT=.75;const from=R.shield.getWorldPosition(new V3());from.y+=.5;enemyShot(from,t,15,10,.38,0xffd060);proj[proj.length-1].pdmg=24}
  if(tt>6.5){pepSet(e,'walk1',10);e.cdA=1}break}
 case'stag1':e.vel.multiplyScalar(.85);if(tt>2.6){pepSet(e,'walk1',10);e.cdA=.8}break;
 /* «Капитализация»: трон-паук пригибается и таранит через арену по намеченной линии */
 case'charge':{if(tt<.9){pepTurn(e,want,2.4,dt);e.vel.multiplyScalar(.85)}
  else if(!e.chT){const L=Math.hypot(tp.x-e.pos.x,tp.z-e.pos.z)||1,dx=(tp.x-e.pos.x)/L,dz=(tp.z-e.pos.z)/L,b=pepBox(e);const x=pepC(e.pos.x+dx*(L+7),b[0],b[1]),z=pepC(e.pos.z+dz*(L+7),b[2],b[3]);
   e.chT=new V3(x,PEP_Y,z);e.chHit=new Set();const nn=[];for(let i=1;i<=6;i++){const u=i/6,mx=e.pos.x+(x-e.pos.x)*u,mz=e.pos.z+(z-e.pos.z)*u;pepMark(mx,mz,2.3,1,0xffa030);nn.push(mx,mz)}pfx(13,...nn);sfx('jet',.8);pepSayN(e,22,1.6)}
  else{const dx=e.chT.x-e.pos.x,dz=e.chT.z-e.pos.z,d=Math.hypot(dx,dz);
   if(tt<2.6&&d>.9){const sp=Math.min(e.rage?27:23,d*6);e.vel.set(dx/d*sp,0,dz/d*sp);e.pos.x+=e.vel.x*dt;e.pos.z+=e.vel.z*dt;e.g.rotation.y=Math.atan2(dx,dz);
    for(const o of PEP_OBS){const ox=e.pos.x-o[0],oz=e.pos.z-o[1],od=Math.hypot(ox,oz)||.01,m=o[2]+2.4;if(od<m){e.pos.x=o[0]+ox/od*m;e.pos.z=o[1]+oz/od*m;e.chT.set(e.pos.x,PEP_Y,e.pos.z)}}
    for(const c of targets()){const key=c.local?'me':c.peer;if(e.chHit.has(key))continue;if(Math.hypot(c.pos.x-e.pos.x,c.pos.z-e.pos.z)<3.7&&c.pos.y<PEP_Y+3.3){e.chHit.add(key);hitTarget(c,28,_pv2.set(c.pos.x-e.pos.x,0,c.pos.z-e.pos.z).normalize().multiplyScalar(19).setY(9))}}
    if(Math.random()<dt*24)pepPuff(_pv.set(e.pos.x+rnd(-2,2),PEP_Y+.3,e.pos.z+rnd(-2,2)),3,0xd8c8b0,4,.6,-1)}
   else{e.vel.multiplyScalar(.8);if(!e.did){e.did=1;shake=Math.max(shake,.45);sfx('slam',.9);pepRing(e.pos.x,e.pos.z,14,14,15,0xffa030)}}
   if(tt>3.3){e.did=0;e.chT=null;pepSet(e,'walk1',10);e.cdA=pepCd(e,1.1)}}break}
 /* --- переход I→II --- */
 case'tr12':{e.inv=true;e.vel.multiplyScalar(.8);const ck=e.ac===21;
  if(tt>.05&&!e.d1){e.d1=1;pepSayN(e,ck?6:5,ck?2.2:3)}
  if(!ck&&tt>3.7&&!e.d3){e.d3=1;pepSayN(e,6,2)}
  if(!ck&&tt>4.2&&!e.d2){e.d2=1;pepRing(e.pos.x,e.pos.z,10,16,20,0xffa030);shake=Math.max(shake,.6);sfx('slam',1)}
  if(tt>(ck?2.4:5.6)){e.d1=e.d2=e.d3=0;e.inv=false;if(story)story.pepPh=Math.max(story.pepPh||1,2);pepSet(e,'walk2',30);e.cdA=1}break}
 /* --- ФАЗА II --- */
 case'walk2':{pepTurn(e,want,2,dt);const dd=dist>8?1:dist<5?-.6:0;pepMove(e,e.pos.x+(tp.x-e.pos.x)/(dist||1)*dd*5,e.pos.z+(tp.z-e.pos.z)/(dist||1)*dd*5,e.rage?6.9:5.6,dt,1.6);
  if(e.cdA<=0){if(e.cdF<=0&&enemies.length<4){pepSet(e,'summon',36);e.cdF=e.rage?16:24;pepSayN(e,9);break}
   const a=pepPick(e,[['slam',dist<8.5?45:5],['punch',dist>5?36:14],['beam',dist<22?28:0],['leap',dist>11?40:dist>7?14:0],['buyout',dist<13?28:10]]);
   if(a==='buyout'){pepSet(e,'buyout',38);e.bn=0;sfx('charge',.9);pepSayN(e,23,1.8);break}
   if(a==='slam'){pepSet(e,'slam',31);sfx('charge',.7)}else if(a==='punch'){e.ps=(e.ps||0)^1;pepSet(e,'punch',e.ps?33:32);sfx('charge',.6);if(Math.random()<.35)pepSayN(e,8)}
   else if(a==='beam'){pepSet(e,'beam',35);e.beamY=e.g.rotation.y;e.beamDir=Math.random()<.5?-1:1;e.beamD=pepC(dist,7,20);pfx(10,e.beamD);sfx('charge',.9);if(Math.random()<.4)pepSayN(e,7)}
   else if(a==='leap'){pepSet(e,'leap',34)}}break}
 case'slam':pepTurn(e,want,1.2,dt);e.vel.multiplyScalar(.85);if(tt>.95&&!e.did){e.did=1;const x=e.pos.x+fw.x*4.4,z=e.pos.z+fw.z*4.4;pepHitNear(x,z,5.2,30,14);pepRing(x,z,16,15,20,0xffa030);shake=Math.max(shake,.55);sfx('slam',1);sfx('boom',.6);
   pepPuff(_pv.set(x,PEP_Y+.4,z),40,0xd8c8b0,8,1,-1);pepPuff(_pv,24,0xffd060,8,.8,8)}
  if(tt>1.9){e.did=0;if(e.rage&&Math.random()<.6){e.ps=(e.ps||0)^1;pepSet(e,'punch',e.ps?33:32);break}pepSet(e,'walk2',30);e.cdA=pepCd(e,1)}break;
 case'punch':{pepTurn(e,want,2.2,dt);e.vel.multiplyScalar(.85);const side=e.ac===33?'R':'L';
  if(tt>.75&&!e.did){e.did=1;const from=R.fist[side].getWorldPosition(new V3()),dir=_pv.set(tp.x+t.vel.x*.35,tp.y+1,tp.z+t.vel.z*.35).sub(from).normalize();e.fp=pepFist(e,R,side,from,dir,0,e.rage?40:34)}
  if(e.rage&&e.did&&!e.dbl&&tt>1.2){e.dbl=1;e.did=0;e.ret=0;e.ac=e.ac===33?32:33;e.stT=.3;break}
  if(tt>.75&&(!e.fp||e.fp.dead)&&tt>1.4){if(!e.ret)e.ret=tt;if(tt-e.ret>.6){e.did=e.dbl=0;e.ret=0;e.fp=null;pepSet(e,'walk2',30);e.cdA=pepCd(e,.8)}}
  if(tt>5){e.did=e.dbl=0;e.ret=0;e.fp=null;pepSet(e,'walk2',30);e.cdA=pepCd(e,.8)}break}
 case'leap':{if(tt<.55){e.vel.multiplyScalar(.8);pepTurn(e,want,3,dt);e.lp0=e.pos.clone();e.lp1=null}
  else if(tt<1.7){if(!e.lp1){const b=pepBox(e);let x=pepC(tp.x+t.vel.x*.5,b[0],b[1]),z=pepC(tp.z+t.vel.z*.5,b[2],b[3]);for(const o of PEP_OBS){const ox=x-o[0],oz=z-o[1],od=Math.hypot(ox,oz)||.01,m=o[2]+1.8;if(od<m){x=o[0]+ox/od*m;z=o[1]+oz/od*m}}
    e.lp1=new V3(x,PEP_Y,z);pepMark(x,z,6,1.25,0xff3a1a);pfx(7,x,z,6,1.25);sfx('jet',.8)}
   const u=(tt-.55)/1.15;e.pos.x=e.lp0.x+(e.lp1.x-e.lp0.x)*u;e.pos.z=e.lp0.z+(e.lp1.z-e.lp0.z)*u;e.pos.y=PEP_Y+Math.sin(Math.PI*u)*8;pepTurn(e,Math.atan2(e.lp1.x-e.lp0.x,e.lp1.z-e.lp0.z),3,dt)}
  else{e.pos.y=PEP_Y;if(!e.did){e.did=1;pepHitNear(e.pos.x,e.pos.z,6,32,16,PEP_Y+3.5);pepRing(e.pos.x,e.pos.z,15,16,22,0xffa030);shake=Math.max(shake,.7);sfx('slam',1.1);sfx('boom',.8);pepPuff(_pv.set(e.pos.x,PEP_Y+.4,e.pos.z),50,0xd8c8b0,9,1.1,-1)}
   if(tt>2.6){e.did=0;if(e.rage&&!e.lp2){e.lp2=1;pepSet(e,'leap',39);break}e.lp2=0;pepSet(e,'walk2',30);e.cdA=pepCd(e,1)}}break}
 case'beam':{e.vel.multiplyScalar(.85);if(tt<.9)pepTurn(e,want,2,dt);else if(tt<3.1){const u=(tt-.9)/2.2;e.g.rotation.y=e.beamY+e.beamDir*(-.95+1.9*u)}
  if(tt>.9&&tt<3.1){e.bt=(e.bt||0)-dt;if(e.bt<=0){e.bt=.14;pepBeamHit(R,R.beam2,.95,9,targets())}}
  if(tt>3.5){pepSet(e,'walk2',30);e.cdA=pepCd(e,1.1)}break}
 case'summon':e.vel.multiplyScalar(.85);if(tt>.6&&!e.did){e.did=1;shake=Math.max(shake,.3);sfx('slam',.7);for(const s of e.rage?[-1,0,1]:[-1,1]){const a=Math.atan2(tp.x-e.pos.x,tp.z-e.pos.z)+s*1.1,p=new V3(pepC(e.pos.x+Math.sin(a)*7,-20,20),PEP_Y+.5,pepC(e.pos.z+Math.cos(a)*7,-132,-110));spawnEnemy('keto',p)}banner('ФРАНШИЗА: КЕТОНАЛЬЩИКИ!')}
  if(tt>1.3){e.did=0;pepSet(e,'walk2',30);e.cdA=1}break;
 case'stag2':e.vel.multiplyScalar(.85);if(tt>2.6){pepSet(e,'walk2',30);e.cdA=.8}break;
 /* «Скупка»: кулаки над головой и три удара по земле — три волны, каждую надо перепрыгнуть */
 case'buyout':{pepTurn(e,want,1,dt);e.vel.multiplyScalar(.85);const hs=[1,1.55,2.1];
  for(let i=0;i<3;i++)if(tt>hs[i]&&(e.bn||0)<=i){e.bn=i+1;const x=e.pos.x+fw.x*3.6,z=e.pos.z+fw.z*3.6;pepRing(x,z,20,13+i*3,16+i*4,i===2?0xff5a20:0xffa030);pepHitNear(x,z,4.3,22,10);shake=Math.max(shake,.45);sfx('slam',.9);pepPuff(_pv.set(x,PEP_Y+.4,z),30,0xd8c8b0,8,.9,-1);if(i===2){sfx('boom',.7);pepPuff(_pv,20,0xffd060,8,.8,8)}}
  if(tt>3){e.bn=0;pepSet(e,'walk2',30);e.cdA=pepCd(e,1.1)}break}
 /* --- переход II→III --- */
 case'tr23':{e.inv=true;e.vel.multiplyScalar(.8);const ck=e.ac===41,land=ck?2:3;{const b=pepBox({ac:50});if(!e.lz){e.lz=new V3(pepC(e.pos.x,b[0],b[1]),PEP_Y,pepC(e.pos.z,b[2],b[3]))}e.pos.x+=(e.lz.x-e.pos.x)*Math.min(1,dt*1.5);e.pos.z+=(e.lz.z-e.pos.z)*Math.min(1,dt*1.5)}
  if(!ck&&tt>.05&&!e.d1){e.d1=1;pepSayN(e,10,2.6)}
  if(tt>land&&!e.d2){e.d2=1;pepRing(e.pos.x,e.pos.z,10,18,26,0xff3a1a);shake=1;sfx('slam',1.2);sfx('boom',1)}
  if(tt>(ck?2.6:5.2)&&!e.d3){e.d3=1;pepSayN(e,11,2.6)}
  if(tt>(ck?5:8)){e.d1=e.d2=e.d3=0;e.lz=null;e.inv=false;if(story)story.pepPh=3;pepSet(e,'walk3',50);e.cdA=1.5;e.cdC=16}break}
 /* --- ФАЗА III --- */
 case'walk3':{pepTurn(e,want,e.rage?1.1:.8,dt);const k=dist>5?1:0;pepMove(e,tp.x,tp.z,(e.rage?4.4:3.4)*k,dt,0);
  if(e.cdA<=0){if(e.cdC<=0&&e.hp<pepFloor({ac:30,maxHp:e.maxHp})*.97){pepSet(e,'core',55);e.coreDmg=0;e.cdC=e.rage?24:34;pepSayN(e,15);break}
   if(e.cdB<=0&&enemies.length<5){pepSet(e,'brood',59);e.cdB=e.rage?18:28;break}
   const a=pepPick(e,[['crash',26],['liq',dist>4?24:8],['rain',18],['stab',dist<11?30:6],['suck',dist>6&&dist<26?24:0],['shard',22]]);
   if(a==='suck'){pepSet(e,'suck',57);e.coreDmg=0;pepSayN(e,24,2);pepSnd('whine',1);break}if(a==='shard'){pepSet(e,'shard',58);e.sv=0;break}
   if(a==='crash'){pepSet(e,'crash',51);e.wv=0;pepSayN(e,12)}else if(a==='liq'){pepSet(e,'liq',52);e.beamD=pepC(dist,8,20);pfx(10,e.beamD);pepSnd('whine',1);if(Math.random()<.5)pepSayN(e,13)}
   else if(a==='rain'){pepSet(e,'rain',53);e.rkN=0}else if(a==='stab'){pepSet(e,'stab',54);e.sn=0;if(Math.random()<.4)pepSayN(e,14)}}break}
 case'crash':{pepTurn(e,want,.6,dt);e.vel.multiplyScalar(.9);const w=Math.floor((tt-.8)/.95);if(tt>.8&&w<3&&w>=e.wv){e.wv=w+1;const pts=[];
   if(w===0){pts.push([tp.x,tp.z]);for(let i=0;i<6;i++){const a=i/6*Math.PI*2+rnd(0,.5);pts.push([tp.x+Math.sin(a)*3.6,tp.z+Math.cos(a)*3.6])}}
   else if(w===1){const a=Math.atan2(tp.x-e.pos.x,tp.z-e.pos.z),px=Math.cos(a),pz=-Math.sin(a);for(let i=-3;i<=3;i++)pts.push([tp.x+px*i*2.6+Math.sin(a)*rnd(-.5,.5),tp.z+pz*i*2.6+Math.cos(a)*rnd(-.5,.5)])}
   else for(let i=0;i<7;i++){const a=rnd(0,6.28),r=i?rnd(1.5,6):0;pts.push([tp.x+t.vel.x*.5+Math.sin(a)*r,tp.z+t.vel.z*.5+Math.cos(a)*r])}
   const nn=[];for(const [x,z] of pts){const h=rnd(3.5,8.5),d=rnd(0,.25);const xx=pepC(x,-25,25),zz=pepC(z,-138,-105.5);pepBar(xx,zz,h,d);nn.push(xx,zz,h,d)}pfx(3,...nn)}
  if(tt>4.6){if(e.rage){pepSet(e,'rain',53);e.rkN=0;break}pepSet(e,'walk3',50);e.cdA=pepCd(e,1.3)}break}
 case'liq':{pepTurn(e,want,.5,dt);e.vel.multiplyScalar(.9);if(tt>1.3&&tt<4){e.bt=(e.bt||0)-dt;if(e.bt<=0){e.bt=.15;const tg2=targets();for(const b of R.beams3)if(b.visible)pepBeamHit(R,b,.9,9,tg2)}}
  if(tt>4.5){pepSet(e,'walk3',50);e.cdA=pepCd(e,1.2)}break}
 case'rain':pepTurn(e,want,.7,dt);e.vel.multiplyScalar(.9);if(tt>.5&&e.rkN<18&&tt>.5+e.rkN*.1){const i=e.rkN++,a=i*.9+e.seed,r=1.2+i*.35;pepLaunch(e,R,i%2?'R':'L',tp.x+Math.sin(a)*r,tp.z+Math.cos(a)*r,1.4,18,3,3)}
  if(tt>3.6){pepSet(e,'walk3',50);e.cdA=pepCd(e,1.2)}break;
 case'stab':{e.vel.multiplyScalar(.9);pepTurn(e,want,.7,dt);const cyc=1.15,k=Math.floor(tt/cyc);if(k<3&&k>=e.sn){e.sn=k+1;
   let best=0,bd=1e9;R.l3.forEach((L,i)=>{const d=Math.hypot(L.foot.x-tp.x,L.foot.z-tp.z);if(d<bd&&!(e.stabs||[]).some(s=>s.leg===i&&s.t<cyc)){bd=d;best=i}});
   const x=tp.x+t.vel.x*.3,z=tp.z+t.vel.z*.3;(e.stabs||(e.stabs=[])).push({leg:best,x,z,t:0});pfx(9,best,x,z);pepMark(x,z,1.8,.62,0xff1a1a);pfx(7,x,z,1.8,.62);sfx('charge',.5)}
  if(tt>3*cyc+.35){pepSet(e,'walk3',50);e.cdA=pepCd(e,1.1)}break}
 case'core':{e.vel.multiplyScalar(.85);const need=40*(1+.5*(mode==='coop'?remotes.size:0));
  if(tt>.3&&!e.did){e.did=1;banner('ЯДРО ПЕРЕГРУЖАЕТСЯ — СБЕЙ ЯДРО ИЛИ ПРЯЧЬСЯ!');sfx('siren',.8)}
  if(e.coreDmg>=need&&tt<6){e.did=0;addStyle('ЯДРО ПОДАВЛЕНО',300);heal(30);sfx('parry',1);sfx('boom',.8);R.core.getWorldPosition(_pv);blast(_pv,4,0xffd060);puff(_pv,80,0xffd0a0,12,.9,4);pepSet(e,'stun3',56);break}
  if(tt>6&&!e.d2){e.d2=1;pepBlastFx(e);pfx(8);R.core.getWorldPosition(_pv);const cp=_pv.clone();for(const c of targets()){const pc=_pv2.set(c.pos.x,c.pos.y+1.2,c.pos.z);if(pepLos(cp,pc)){hitTarget(c,48,pc.clone().sub(cp).setY(0).normalize().multiplyScalar(18).setY(9))}else if(c.local)addStyle('УКРЫЛСЯ',60)}}
  if(tt>7.2){e.did=e.d2=0;pepSet(e,'walk3',50);e.cdA=pepCd(e,1.4)}break}
 case'stun3':e.vel.multiplyScalar(.8);if(tt>4.6){pepSet(e,'walk3',50);e.cdA=1}break;
 /* «Враждебное поглощение»: пасть втягивает всех, кто впереди; у пасти — укус. Сбей ядро — «выкуп отклонён» */
 case'suck':{pepTurn(e,want,.9,dt);e.vel.multiplyScalar(.85);if(tt>.2&&!e.did){e.did=1;banner('ПОГЛОЩЕНИЕ — БЕГИ ИЛИ БЕЙ В ЯДРО!')}
  if(tt>.9&&tt<4.3){e.bt=(e.bt||0)-dt;if(e.bt<=0){e.bt=.3;R.core.getWorldPosition(_pv);for(const c of targets()){const dx=c.pos.x-_pv.x,dz=c.pos.z-_pv.z,d=Math.hypot(dx,dz);if(d<5&&c.pos.y<PEP_Y+4.5)hitTarget(c,15,_pv2.set(dx,0,dz).normalize().multiplyScalar(17).setY(10))}}}
  if((e.coreDmg||0)>=30*(1+.5*(mode==='coop'?remotes.size:0))&&tt<4.3){e.did=0;addStyle('ВЫКУП ОТКЛОНЁН',260);heal(15);sfx('parry',1);R.core.getWorldPosition(_pv);blast(_pv,4,0xffd060);puff(_pv,60,0xffd0a0,12,.9,4);pepSet(e,'stun3',56);e.stT=1.6;break}
  if(tt>4.7){e.did=0;pepSet(e,'walk3',50);e.cdA=pepCd(e,1.2)}break}
 /* «Делистинг»: экраны на лопастях стреляют осколками котировок (залпы по всем лопастям) */
 case'shard':{pepTurn(e,want,.8,dt);e.vel.multiplyScalar(.9);const vol=e.rage?[.6,1.25,1.9,2.55]:[.7,1.5,2.3];
  for(let i=0;i<vol.length;i++)if(tt>vol[i]&&(e.sv||0)<=i){e.sv=i+1;for(const W of R.wing){const from=W.w.localToWorld(new V3(W.s*3.3,.2,.4));enemyShot(from,t,21,9,.42,0xff3a2a);const pp=proj[proj.length-1];if(pp)pp.pdmg=18}pepSnd('zap',.9);if(i===0)pepSayN(e,25,1.6)}
  if(tt>vol[vol.length-1]+.7){e.sv=0;pepSet(e,'walk3',50);e.cdA=pepCd(e,1.2)}break}
 /* «Дочерние компании»: из брюха вылетают дроны */
 case'brood':e.vel.multiplyScalar(.85);if(tt>.7&&!e.did){e.did=1;for(let i=0;i<3;i++){const a=e.g.rotation.y+(i-1)*1.3,p=new V3(pepC(e.pos.x+Math.sin(a)*6.5,-20,20),PEP_Y+4.5,pepC(e.pos.z+Math.cos(a)*6.5,-132,-110));spawnEnemy('drone',p)}banner('ДОЧЕРНИЕ КОМПАНИИ!');pepSayN(e,26,1.8);sfx('horn',.6)}
  if(tt>1.6){e.did=0;pepSet(e,'walk3',50);e.cdA=pepCd(e,1)}break;
 /* --- банкротство --- */
 case'death':e.inv=true;e.vel.multiplyScalar(.8);if(tt>.05&&!e.d1){e.d1=1;pepSayN(e,16,2.4)}if(tt>2.6&&!e.d2){e.d2=1;pepSayN(e,17,2.2)}
  if(tt>4.3){e.d1=e.d2=0;const L=R.ej?R.ej.to:e.pos;e.pos.set(L.x,PEP_Y,L.z);e.vel.set(0,0,0);e.hp=.5;e.pepDone=true;pepSet(e,'final',61)}break
 /* «Последний взнос»: старик ползёт к игроку, торгуется и швыряет жалкие чаевые; любой удар его добивает */
 case'final':{e.inv=false;e.pepDone=true;e.hp=Math.min(e.hp,.5);e.vel.set(0,0,0);pepTurn(e,want,2.5,dt);
  if(dist>3.4){e.pos.x+=(tp.x-e.pos.x)/dist*1.15*dt;e.pos.z+=(tp.z-e.pos.z)/dist*1.15*dt}{const b=pepBox({ac:10});e.pos.x=pepC(e.pos.x,b[0],b[1]);e.pos.z=pepC(e.pos.z,b[2],b[3])}
  if(tt>.3&&!e.d1){e.d1=1;banner('ПОСЛЕДНИЙ ВЗНОС — ДОБЕЙ АКЦИОНЕРА!');pepSayN(e,28,2.6);e.begT=3.4}
  e.begT=(e.begT||3)-dt;if(e.d1&&e.begT<=0){e.begT=rnd(2.6,3.6);const i=[29,30,31,32][Math.floor(Math.random()*4)];pepSayN(e,i,2.4);
   if(i===31){const from=R.hhand.R.getWorldPosition(new V3());for(let k=0;k<3;k++){const a=rnd(0,6.28),r=k?rnd(1,2.6):0,x=tp.x+Math.sin(a)*r,z=tp.z+Math.cos(a)*r;pepCoin(from,x,z,.9+k*.1,5);pfx(12,x,z,.9+k*.1)}}}
  if(tt>26&&!e.d3){e.d3=1;pepSayN(e,16,2);e.hp=0;kill(e,'x')}break}}
 if(st!=='leap')e.pos.y=PEP_Y}
/* ракетный кулак: снаряд с копией кулака на тросе; его можно отбить ударом */
function pepFist(e,R,side,from,dir,nid,spd){const fistM=R.fist[side];const m=new THREE.Mesh(new THREE.BoxGeometry(.9,.9,.9),new THREE.MeshBasicMaterial({color:0xffffff,visible:false}));
 const cp=fistM.clone(true);cp.visible=true;cp.position.set(0,0,0);cp.quaternion.setFromAxisAngle(PX,-Math.PI/2);cp.scale.setScalar(PEP_SC[2]);cp.position.set(0,0,-.62);m.add(cp);const fl=pepGlow(0xffa040,1.8);fl.position.set(0,0,-.5);m.add(fl);
 m.position.copy(from);m.lookAt(from.clone().add(dir));scene.add(m);
 const p={m,vel:dir.clone().multiplyScalar(spd||34),owner:'enemy',dmg:24,pdmg:40,r:.95,t:2.6,kind:'pfist',netId:nid||++pnid,side,e,onDie:pp=>{blast(pp.m.position,2,0xffa040);pepPuff(pp.m.position,24,0xd8c8b0,6,.6,6);sfx('boom',.5*Math.max(.25,sndV(pp.m.position.x,pp.m.position.y,pp.m.position.z)))}};
 proj.push(p);sfx('rocket',.9);pepSnd('zap',.6);return p}
function pepFistNet(o,v,nid){const e=enemies.find(x=>x.type==='pep'&&!x.dead);if(!e||!e.g.userData.pep)return false;const R=e.g.userData.pep,dL=R.fist.L.getWorldPosition(_pv).distanceTo(o),dR=R.fist.R.getWorldPosition(_pv).distanceTo(o);
 pepFist(e,R,dL<dR?'L':'R',o,v.clone().normalize(),nid,v.length());return true}
function pepFistUpd(dt){for(const p of proj){if(p.dead||!p.e||(p.kind!=='pfist'&&p.kind!=='parried'))continue;p.m.lookAt(_pv.copy(p.m.position).add(p.vel));if(Math.random()<dt*40)puff(p.m.position,1,0xffd0a0,2,.4,-1);
  if(p.owner==='player'&&!p.gold){p.gold=1;p.m.children[1].material.color.setHex(0xfff0a0);p.m.children[1].scale.setScalar(2.6)}}}

/* лучи: фаза II — из решётки на груди, фаза III — двойная «ликвидация» */
function pepBeamSet(b,from,to,r){_pv.subVectors(to,from);const L=_pv.length();b.position.copy(from);b.lookAt(to);b.scale.set(r,r,L);b.visible=true}
function pepBeamHit(R,b,rad,dmg,tg){if(!b.visible)return;const a=b.position,dir=_pv.set(0,0,1).applyQuaternion(b.quaternion),L=b.scale.z;
 for(const c of tg){let best=1e9;for(const hy of[.3,1,1.6]){_pv2.set(c.pos.x,c.pos.y+hy,c.pos.z).sub(a);const s=pepC(_pv2.dot(dir),0,L);const d=_pv2.addScaledVector(dir,-s).length();best=Math.min(best,d)}
  if(best<rad)hitTarget(c,dmg,_pv3.set(rnd(-1,1),2,rnd(-1,1)))}}

/* ---------- финал: старик рассыпается золотой пылью, очки падают; ядро обломков — отсчёт и взрыв ---------- */
function pepFinal(e){const R=e.g.userData.pep;if(!R||R.final)return;R.final=true;if(story)story.pepWin=true;
 R.g.updateMatrixWorld(true);const hp=R.tor.getWorldPosition(new V3()),hd=R.hd.getWorldPosition(new V3());
 if(R.host.visible){puff(hp,170,0xffd060,5,1.8,-1.2);puff(hd,80,0xfff0b0,4,1.5,-.8);puff(hp,40,0x8a7c60,3,2,-.5);blast(hp,3.2,0xffd060);pepGlasses(hd,R.g.rotation.y)}
 R.host.visible=false;sfx('frag',1);sfx('boom',.6);pepSnd('coin',1);shake=Math.max(shake,.4);freeze=Math.max(freeze,.2);
 if(pepAuth()){for(let i=0;i<14;i++)orbs.push(makeOrb(hp.clone().add(new V3(rnd(-2,2),1,rnd(-2,2)))));
  // «дочерние компании» банкротятся вместе с владельцем
  setTimeout(()=>{for(const x of enemies.slice())if(x.type!=='pep'&&!x.dead&&!x.remote)damage(x,1e6,99,'x')},350)}
 banner('ПЕПСШТЕЙН ОБАНКРОЧЕН!');addStyle('ПЕПСШТЕЙН ОБАНКРОЧЕН',1200);if(PEP.say&&PEP.say.parent)PEP.say.parent.remove(PEP.say);PEP.say=null;
 if(R.wreck&&R.wreck.parent)PEP.fx.push({k:'wreck',m:R.wreck,R,t:-2.2,T:9,n:-1});else pepBoom(R,R.b3.getWorldPosition(new V3()))}
function pepGlasses(p,yaw){const g=new THREE.Group(),M=new THREE.MeshStandardMaterial({color:0xe0ac40,metalness:.95,roughness:.25,envMap:ENV});
 for(const s of[-1,1]){for(const [x,y,w,h] of[[0,.05,.16,.018],[0,-.05,.16,.018],[-.08,0,.018,.12],[.08,0,.018,.12]]){const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,.018),M);b.position.set(s*.1+x,y,0);g.add(b)}
  const tm=new THREE.Mesh(new THREE.BoxGeometry(.018,.018,.2),M);tm.position.set(s*.18,.04,-.1);g.add(tm)}
 const br=new THREE.Mesh(new THREE.BoxGeometry(.05,.018,.018),M);br.position.set(0,.04,0);g.add(br);g.scale.setScalar(1.9);g.position.copy(p);g.rotation.y=yaw||0;scene.add(g);
 PEP.fx.push({k:'gl',m:g,vel:new V3(rnd(-1,1),5,rnd(-1,1)),spin:new V3(rnd(-6,6),0,rnd(-6,6)),t:0})}
function pepBoom(R,c){blast(c,16,0xfff0d0);blast(c,9,0xff3a1a);puff(c,240,0xffd060,26,1.5,5);puff(c,140,0x2a2020,12,2.2,-3);sfx('boom',1.4);sfx('frag',1);shake=1.3;freeze=Math.max(freeze,.2);const fl=$('vig');if(fl)fl.style.opacity=1;
 const parts=[...R.wing.map(w=>w.w),R.pod3.L,R.pod3.R,R.can.L,R.can.R,R.halo,...R.l3.map(L=>L.knee),R.dome];
 for(const o of parts){if(!o||!o.parent)continue;o.getWorldPosition(_pv);const v=_pv.clone().sub(c).setY(0).normalize().multiplyScalar(rnd(8,18));v.y=rnd(9,18);pepDebris(o,v)}
 pepTickDraw('dead');pepTint(0);
 if(P.alive&&state==='play'){const d=Math.hypot(P.pos.x-c.x,P.pos.z-c.z);if(story&&story.phase==='done'){addStyle('УСПЕЛ',400)}else if(d<18){const k=1-d/18;P.hp=Math.max(1,P.hp-Math.round(45*k));P.vel.add(_pv.set(P.pos.x-c.x,0,P.pos.z-c.z).normalize().multiplyScalar(22*k).setY(10*k));$('vig').style.opacity=1;sfx('hurt')}else addStyle('УСПЕЛ',400)}}
function pepGone(e){const R=e.g.userData.pep;if(R&&!R.final&&(e.ac||0)>=60)pepFinal(e);pepDispose(R)}
function pepTint(k){if(typeof gradePass==='undefined'||!gradePass)return;PEP.tint=k;const u=gradePass.uniforms;if(k>0)u.warm.value.set(1.03+.14*k,1-.08*k,.97-.1*k);else if(PEP.tinted)u.warm.value.set(1.03,1,.97);PEP.tinted=k>0}

/* ---------- анимация (хост и клиенты) ---------- */
function pepAnim(e,dt){const g=e.g;if(!g.userData.pep){pepTryBuild(e);if(!g.userData.pep)return}const R=g.userData.pep;
 const ac=e.ac||5;if(ac!==e.acP){e.acP=ac;e.acT=0;pepOnAc(e,R,ac)}else e.acT+=dt;const at=e.acT,ph=pepPh(ac),t=T+(e.seed||0);
 const pk=ac===61?4:ph;if(!e.pepNm||e.pepNm!==pk){e.pepNm=pk;e.bname=PEP_PH[pk]}
 const tgt=_pv3;{let best=1e9;for(const c of targets()){const d=Math.hypot(c.pos.x-e.pos.x,c.pos.z-e.pos.z);if(d<best){best=d;tgt.set(c.pos.x,c.pos.y+1.4,c.pos.z)}}if(best>=1e9)tgt.set(e.pos.x,e.pos.y+1,e.pos.z+10)}
 const look=tgt.clone();
 // скорость для походки (клиент — из смещения позиции)
 const pp=e.pp||(e.pp=e.pos.clone()),vx=(e.pos.x-pp.x)/Math.max(dt,1e-3),vz=(e.pos.z-pp.z)/Math.max(dt,1e-3);pp.copy(e.pos);e.spd=(e.spd||0)+(Math.hypot(vx,vz)-(e.spd||0))*Math.min(1,dt*6);
 // какие модели видны
 let v1=ph===1,v2=ph===2,v3=ph===3;if(ac===20)v1=at<1.6,v2=at>=1.6;if(ac===21)v1=false;if(ac===40){v2=at<5;v3=at>=1}if(ac===41){v2=false;v3=true}
 R.p1.visible=v1;R.p2.visible=v2;R.p3.visible=v3;pepHostTo(R,ac===20?(at<1.6?1:2):ac===40?(at<5?2:3):ph);
 R.shield.visible=ac===15&&at>.4;R.beam2.visible=false;R.beams3.forEach(b=>b.visible=false);R.aim3.forEach(b=>b.visible=false);R.cable.visible=false;R.ventG.visible=false;
 e.cy=ph===1?3.8:ph===2?6.2:6;e.r=ph===1?3:ph===2?3:3.6;if(ac===61){e.cy=1.3;e.r=1.4}
 const rg=!e.inv&&ac!==60&&ac!==61&&pepRageK(e)<.35;
 g.updateMatrixWorld(true);
 const gy=(x,z)=>pepGround(x,z);
 R.rg=rg;
 /* ===== ФАЗА I ===== */
 if(v1){const o={low:0,bob:0,tilt:0,roll:0};let spread=1;
  if(ac===5){const k=pepE(pepC((at-.4)/1.4));o.low=1.55*(1-k);o.tilt=.12*(1-k)}
  if(ac===16){o.low=1.1+Math.sin(t*3)*.05;o.roll=Math.sin(t*2.2)*.08;o.tilt=.15;spread=1.18}
  if(ac===20){const k=pepE(pepC(at/1.4));o.low=1.5*k;o.roll=Math.sin(t*14)*.05*k;o.tilt=.2*k;spread=1+.2*k;if(Math.random()<dt*25){R.b1.getWorldPosition(_pv);puff(_pv.add(_pv2.set(rnd(-1.5,1.5),rnd(-.5,1),rnd(-1.5,1.5))),3,0xffd060,8,.4,6)}}
  if(ac===13){const up=at<.7?pepE(at/.7):at<.8?1-(at-.7)/.1:0;o.tilt=-.22*up+(at>=.7&&at<1.1?.08:0);o.low=-.45*up}
  if(ac===17){const k=at<.9?pepE(at/.9):at<2.6?1:Math.max(0,1-(at-2.6)/.6);o.low=.65*k;o.tilt=.24*k;o.roll=Math.sin(t*16)*.03*k;if(at>.9&&at<2.6&&Math.random()<dt*20){R.b1.getWorldPosition(_pv);puff(_pv.add(_pv2.set(rnd(-1,1),rnd(0,1),rnd(-1,1))),2,0xffd060,6,.3,4)}}
  o.bob=Math.sin(t*9)*.06*pepC(e.spd/3);pepPoseP1(R,o,dt);g.updateMatrixWorld(true);
  const stomp=ac===13&&at<.78;
  for(const [i,L] of R.l1.entries()){L.grp=(i===0||i===3)?0:1;L.ov=null;if(stomp&&(i===0||i===2)){const up=at<.7?pepE(at/.7):1-(at-.7)/.08;_pv2.copy(L.rest).multiplyScalar(.85);g.localToWorld(_pv2);_pv2.y=PEP_Y+2.8*Math.max(0,up);L.ov=_pv2.clone()}}
  pepGait(R,R.l1,g,{thr:ac===17?2.2:1.45,dur:ac===17?.18:.34,lift:ac===17?.8:1.2,lead:ac===17?.12:.25,vx,vz,gy,spread,onStep:L=>{if(Math.random()<.5)sfx('press',.25*Math.max(.2,sndV(L.foot.x,L.foot.y,L.foot.z)))}},dt);
  if(ac===13&&at>.7&&at<.76)for(const L of R.l1)L.foot.y=gy(L.foot.x,L.foot.z);
  // оружие
  const spin=ac===11?(at<.9?at/.9*30:at<3.3?30:Math.max(0,30-(at-3.3)*40)):ac===10?2:0;R.gsp=(R.gsp||0)+(spin-(R.gsp||0))*Math.min(1,dt*4);R.bar.L.rotation.z+=R.gsp*dt;R.bar.R.rotation.z-=R.gsp*dt;
  const fire=ac===11&&at>.9&&at<3.3;if(fire){R.gun.L.rotation.x=Math.sin(t*60)*.02;R.gun.R.rotation.x=Math.cos(t*60)*.02}else R.gun.L.rotation.x=R.gun.R.rotation.x=0;
  const pod=ac===12?(at<.5?pepE(at/.5):at<2?1:Math.max(0,1-(at-2)/.4)):0;R.pod.L.rotation.x=R.pod.R.rotation.x=-.62*pod;
  R.ban1.rotation.x=Math.sin(t*2.1)*.06+pepC(e.spd/6)*.18;
  pepHostAnim(e,R,dt,{look,droop:ac===5&&at<.35,daze:ac===16,scream:(ac===5&&at>.35&&at<1.6)||(ac===20&&at<1.6)||(ac===13&&at>.5&&at<1)||(ac===17&&at>.9&&at<2),flick:ac===14?(at<.35?at/.35:at<.6?1-(at-.35)/.25:0):0,raise:ac===15?pepC(at/.4):0,lean:ac===20?.25:ac===17&&at>.9&&at<2.6?.3:0})}
 /* ===== ФАЗА II ===== */
 if(v2){const ph2=pepP2Pose(e,R,ac,at,t,dt);
  if(ac===35&&at>.75&&at<3.1){R.ventG.visible=true;R.ventG.material.opacity=.7+.3*Math.sin(t*30);if(at>.9){const from=R.ventG.getWorldPosition(new V3()),yaw=g.rotation.y,D=e.beamD||12;
    const to=new V3(e.pos.x+Math.sin(yaw)*D,PEP_Y,e.pos.z+Math.cos(yaw)*D);pepBeamSet(R.beam2,from,to,.42+Math.sin(t*40)*.06);if(Math.random()<dt*40){puff(to,3,0xff6a30,7,.5,6);puff(to,1,0x2a2020,3,1,-2)}if(Math.random()<dt*8)pepSnd('laser',.5*Math.max(.3,sndV(to.x,to.y,to.z)))}}
  pepHostAnim(e,R,dt,{look,daze:ac===37,scream:(ac===20&&at>3.6&&at<4.6)||(ac===31&&at>.5&&at<1.2)||(ac===40&&at<2.5),lean:0,raise:ac===36&&at<.6?1:0})}
 /* ===== ФАЗА III ===== */
 if(v3)pepP3Pose(e,R,ac,at,t,dt,look,vx,vz,gy);
 // тряска при шагах тяжёлых фаз
 R.p1.visible=v1;
 // хит-сферы и выталкивание игрока
 g.updateMatrixWorld(true);R.hph=ac===61?61:ac===20?(at<1.6?1:2):ac===40?(at<3?2:3):ac===21?2:ph;pepPush(e,R,ph,ac,at);
 const hf=T-(e.lastHit||-9)<.07;if(hf!==R.hf){R.hf=hf;for(const k of['navy','cream','red','gun'])R.M[k].emissive.setHex(hf?0x3a0c08:0)}
 if(ac===15){const s=3.1+Math.sin(t*6)*.08;R.shield.scale.setScalar(s);R.shield.material.opacity=.18+.06*Math.sin(t*9);R.shieldW.rotation.y+=dt*.6}
 // тикеры и оттенок неба в фазе III
 if(PEP.tick){PEP.tick.tx.offset.x+=dt*(ac===51||ac===58||rg?.45:.12);pepTickDraw(ac===60||ac===61?'dead':ac===51||ac===58||rg?'crash':'norm')}
 const tint=ac===61?0:ac===40?pepC((at-1)/2):ph===3&&ac!==60?1:ac===60?Math.max(0,1-at/4):rg?.45:0;if(Math.abs((PEP.tint||0)-tint)>.01)pepTint(tint)}
function pepOnAc(e,R,ac){
 if(ac===5)setTimeout(()=>{if(!e.dead&&e.ac===5)pepSay(e,PEP_LINES[0],3.2)},400);
 if(ac===5)setTimeout(()=>{if(!e.dead)gzAlert('ПЕПСШТЕЙН','ПОСЛЕДНИЙ АКЦИОНЕР','фаза I · привилегия','gold')},1200);
 if(ac===20||ac===21)setTimeout(()=>{if(!e.dead){gzAlert('ПЕПСШТЕЙН','ФАЗА 2','монополия · кулак рынка · ракетный кулак · скупка · поглощение');sfx('horn',.9);sfx('roar',.6);shake=Math.max(shake,.35)}},ac===21?300:1700);
 if(ac===40||ac===41){sfx('horn',1);setTimeout(()=>{if(!e.dead){gzAlert('ПЕПСШТЕЙН','ФАЗА 3','враждебное поглощение · обвал рынка · ликвидация · делистинг · ядро');sfx('roar',.9);shake=Math.max(shake,.5)}},ac===41?2600:5200)}
 if(ac===60){sfx('horn',1);sfx('roar',1)}
 if(ac===61&&!pepAuth())banner('ПОСЛЕДНИЙ ВЗНОС — ДОБЕЙ АКЦИОНЕРА!');
 if(ac===57&&!pepAuth())banner('ПОГЛОЩЕНИЕ — БЕГИ ИЛИ БЕЙ В ЯДРО!');
 if(ac===32||ac===33||ac===30){}
 if(ac!==54)e.stabs=[];
 if(ac===55&&!pepAuth())banner('ЯДРО ПЕРЕГРУЖАЕТСЯ — СБЕЙ ЯДРО ИЛИ ПРЯЧЬСЯ!');
 if(ac===56){R.core.getWorldPosition(_pv);blast(_pv,4,0xffd060);puff(_pv,60,0xffd0a0,12,.9,4)}
 // ракетный кулак у клиентов
 if((ac===32||ac===33)&&!pepAuth())setTimeout(()=>{if(e.dead||e.ac!==ac)return;const side=ac===33?'R':'L';R.fist[side].visible=false},750)}
/* поза гуманоида: ходьба по фазе шага, удары, прыжок, колено */
function pepP2Pose(e,R,ac,at,t,dt){const sp=pepC(e.spd/5.5);R.wph=(R.wph||0)+e.spd*dt/3.1*Math.PI;const w=R.wph,sw=Math.sin(w);
 const P={pel:0,lean:0,tw:0,thL:-.5*sw*sp,thR:.5*sw*sp,knL:.7*Math.max(0,Math.sin(w+1.6))*sp+.05,knR:.7*Math.max(0,Math.sin(w+1.6+Math.PI))*sp+.05,shL:.35*sw*sp,shR:-.35*sw*sp,elL:-.08,elR:-.08,abL:.12,abR:.12};
 if(sp>.1&&Math.abs(Math.sin(w))>.97&&!R.stepD){R.stepD=1;const v=sndV(e.pos.x,e.pos.y,e.pos.z);pepSnd('step',.7*Math.max(.2,v));shake=Math.max(shake,.12*v)}if(Math.abs(Math.sin(w))<.9)R.stepD=0;
 P.pel=Math.abs(Math.cos(w))*.12*sp;
 if(ac===20||ac===21){const s=ac===21?pepC(at/1.6):pepC((at-1.6)/2.6),k=pepE(s);const cr=1-k;P.pel=-1.4*cr;P.thL=P.thR=-1.2*cr;P.knL=P.knR=2.2*cr;P.lean=.5*cr;P.shL=P.shR=-.3*cr;P.elL=P.elR=-1.6*cr;
  if(ac===20&&at>3.6){const u=pepC((at-3.6)/.6),dn=u<.6?u/.6:1-(u-.6)/.4;P.shL=P.shR=-2.4+1.4*u;P.lean=.3*dn;P.pel=-.4*dn}}
 if(ac===31){const u=at<.9?pepE(at/.9):at<1.05?1-(at-.9)/.15:Math.max(0,1-(at-1.05)/.8)*.0,dn=at>=.9&&at<1.9?(at<1.05?(at-.9)/.15:1-(at-1.05)/.85):0;
  P.shL=P.shR=-2.9*u-1.2*dn;P.elL=P.elR=-.5*u;P.lean=-.18*u+.45*dn;P.pel=-.7*dn;P.thL=P.thR=-.4*dn;P.knL=P.knR=.8*dn;P.abL=P.abR=.25*u}
 if(ac===32||ac===33){const S=ac===33?'R':'L',u=pepE(pepC(at/.7)),back=at>.75&&at<.9?1-(at-.75)/.15:0;P['sh'+S]=-1.55*u;P['el'+S]=0;P['ab'+S]=0;P.tw=(S==='L'?1:-1)*-.35*u+back*.1;P.lean=.05*u;
  const fp=proj.find(q=>!q.dead&&q.e===e&&q.side===S&&(q.kind==='pfist'||q.kind==='parried'));if(fp&&fp.kind==='pfist'){pepBeamSet(R.cable,R.elb[S].getWorldPosition(new V3()),fp.m.position,1)}}
 for(const S of['L','R'])R.fist[S].visible=!proj.some(q=>!q.dead&&q.e===e&&q.side===S&&(q.kind==='pfist'||q.kind==='parried'));
 if(ac===38){const hs=[1,1.55,2.1];let f=at<.75?pepE(at/.75):1;for(const h of hs){if(at>h-.16&&at<=h)f=Math.min(f,(h-at)/.16);else if(at>h&&at<h+.36)f=Math.min(f,(at-h)/.36*.8)}if(at>2.1)f=0;const dn=at>.9?1-f:0;
  P.shL=P.shR=-2.9*f-.5*dn;P.elL=P.elR=-.35*f;P.abL=P.abR=.1+.15*f;P.lean=-.16*f+.42*dn;P.pel=-.55*dn;P.thL=P.thR=-.35*dn;P.knL=P.knR=.7*dn}
 if(ac===34||ac===39){const crouch=at<.55?pepE(at/.55):at<1.7?.2:at<2.6?1-(at-1.7)/.9:0,air=at>=.55&&at<1.7;P.pel=-1.0*crouch;P.thL=P.thR=-.9*crouch-(air?.6:0);P.knL=P.knR=1.6*crouch+(air?1.2:0);P.shL=P.shR=air?-2.6:-.4*crouch;P.elL=P.elR=air?-.4:-.6;P.lean=.25*crouch}
 if(ac===35){const u=pepC(at/.9);P.lean=-.12*u;P.shL=P.shR=.25*u;P.abL=P.abR=.5*u}
 if(ac===36){const u=at<.6?pepE(at/.6):Math.max(0,1-(at-.6)/.5);P.shR=-3*u;P.elR=-.2;P.abR=.2}
 if(ac===37){P.pel=-1.1;P.thL=-1.35;P.knL=1.5;P.thR=.25;P.knR=1.75;P.lean=.35+Math.sin(t*2)*.04;P.shL=P.shR=.1;P.elL=P.elR=-.1;P.abL=P.abR=.05}
 if(ac===40){const k=pepE(pepC(at/1)),lift=pepC((at-3)/2);P.pel=-1.1*k;P.thL=-1.35*k;P.knL=1.5*k;P.thR=.25*k;P.knR=1.75*k;P.lean=.35*k;
  R.p2.position.y=lift*lift*6.5;R.p2.scale.setScalar(PEP_SC[2]*(1-.75*lift));R.p2.rotation.y=lift*lift*2.5;if(lift>0&&Math.random()<dt*30){R.chest.getWorldPosition(_pv);puff(_pv,3,0xff3a1a,8,.4,4)}}else{R.p2.position.y=0;R.p2.scale.setScalar(PEP_SC[2]);R.p2.rotation.y=0}
 const sm=Math.min(1,dt*10),A=R.p2a||(R.p2a={});for(const k in P){A[k]=A[k]==null?P[k]:A[k]+(P[k]-A[k])*sm}
 R.pel.position.y=R.pely+A.pel;R.pel.rotation.set(0,A.tw*.5,0);R.chest.rotation.set(A.lean,A.tw,0);
 for(const s of['L','R']){const sg=s==='L'?1:-1;R.thigh[s].rotation.set(A['th'+s],0,0);R.knee2[s].rotation.set(A['kn'+s],0,0);R.foot2[s].rotation.set(-A['th'+s]-A['kn'+s]*.8,0,0);
  R.arm[s].rotation.set(A['sh'+s],0,sg*A['ab'+s]);R.elb[s].rotation.set(A['el'+s],0,0)}
 R.skF.rotation.x=Math.min(0,Math.min(A.thL,A.thR))*.7+Math.sin(t*2)*.04;R.skB.rotation.x=-Math.max(0,Math.max(A.thL,A.thR))*.5-Math.sin(t*2)*.04}
/* поза паука-гиганта: 8 ног, крылья, нимб, пушки, ядро */
function pepP3Pose(e,R,ac,at,t,dt,look,vx,vz,gy){const g=e.g;let low=0,tilt=0,roll=0,spread=1,off=null,wing=0,coreK=1,coreS=1;
 if(ac===40||ac===41){const t0=ac===41?0:1,uf=ac===41?2.5:5,u=pepC((at-t0)/2);if(u<1){const S=new V3(0,PEP_Y+18,-162),E=new V3(e.pos.x,PEP_Y,e.pos.z),p=S.lerp(E,u);p.y+=Math.sin(Math.PI*u)*9;off=p;tilt=-.4*(1-u)}
  if(at>=t0+2&&at<t0+2.4){low=1.4*(1-(at-t0-2)/.4)}wing=-1+pepE(pepC((at-uf)/2));coreK=pepC((at-uf)/2)}
 if(ac===55){low=pepE(pepC(at/.8))*2.2;coreS=1+pepC(at/6)*.9;coreK=1+at*.4}
 if(ac===56){low=3.2;roll=Math.sin(t*2.3)*.05;spread=1.15;coreK=.3+.7*Math.abs(Math.sin(t*9));wing=-.5}
 if(ac===60){const k=pepE(pepC(at/2.2));low=3.6*k;roll=.18*k;tilt=.12*k;spread=1+.35*k;wing=-.8*k;coreK=Math.max(0,1-at/2)*(.5+.5*Math.abs(Math.sin(t*20)));
  if(Math.random()<dt*5){R.b3.getWorldPosition(_pv);_pv.add(_pv2.set(rnd(-3,3),rnd(-1,2),rnd(-3,3)));blast(_pv,2.6,0xff7a2a);puff(_pv,30,0xffa040,9,.7,4);sfx('boom',.5)}
  if(at>2.4&&!R.domeOff){R.domeOff=1;R.dome.visible=false;R.dome.getWorldPosition(_pv);puff(_pv.add(_pv2.set(0,1.2,0)),70,0xff8080,10,.7,10);sfx('crack',1)}
  if(at>2.8&&!R.wreck)pepEject(e,R);
  if(R.ej&&R.ej.t<1){const E=R.ej;E.t=Math.min(1,E.t+dt/1.25);const u=E.t;R.host.position.lerpVectors(E.from,E.to,u);R.host.position.y+=Math.sin(Math.PI*u)*5.5;R.host.rotation.set(u*Math.PI*2.2,g.rotation.y+Math.PI,0);
   if(Math.random()<dt*30)puff(R.host.position,2,0x9a948c,2,.8,-1);
   if(E.t>=1){R.host.rotation.set(.12,Math.atan2(look.x-E.to.x,look.z-E.to.z),0);pepPuff(_pv.copy(E.to).setY(PEP_Y+.3),40,0xd8c8b0,7,1,-1);sfx('slam',.7);shake=Math.max(shake,.3)}}}
 /* «последний взнос»: обломки паука лежат, старик — в группе врага у ног игрока */
 if(ac===61){if(!R.wreck)pepEject(e,R,true);low=3.6;roll=.18;tilt=.12;spread=1.35;wing=-.8;coreK=.35+.35*Math.abs(Math.sin(t*7));
  if(R.host.parent!==g){g.add(R.host);R.host.position.set(0,.32,0);R.host.quaternion.identity();R.host.scale.setScalar(1.9);R.host.visible=true}
  R.host.position.y=.32+Math.abs(Math.sin(t*2.6))*.06;R.host.rotation.set(.14+Math.sin(t*1.7)*.05,0,Math.sin(t*1.3)*.04);if(Math.random()<dt*3){R.b3.getWorldPosition(_pv);_pv.add(_pv2.set(rnd(-3,3),rnd(-1,2),rnd(-3,3)));puff(_pv,6,0xffa040,5,.5,3)}}
 /* «враждебное поглощение»: корпус приседает, пасть тянет всех спереди (каждый клиент тянет своего игрока) */
 if(ac===57){const k=pepE(pepC(at/.6))*(at<4.3?1:Math.max(0,1-(at-4.3)/.4));low=.6*k;tilt=.12*k;coreS=1+.3*k;coreK=1+.8*k;wing=.25*k;
  if(at>.9&&at<4.3){R.core.getWorldPosition(_pv);const cx=_pv.x,cy=_pv.y,cz=_pv.z,fx=Math.sin(g.rotation.y),fz=Math.cos(g.rotation.y);
   if(P.alive&&state==='play'){const dx=cx-P.pos.x,dz=cz-P.pos.z,d=Math.hypot(dx,dz),front=(-dx*fx-dz*fz)/(d||1);if(d<28&&d>2.2&&front>.15){const sp=(6.5+6*(1-d/28))*pepC((at-.9)/.5);P.pos.x+=dx/d*sp*dt;P.pos.z+=dz/d*sp*dt}}
   if(Math.random()<dt*55){const a=g.rotation.y+rnd(-.7,.7),r=rnd(5,20),from=new V3(cx+Math.sin(a)*r,PEP_Y+rnd(.3,4.5),cz+Math.cos(a)*r),m=pepGlow(Math.random()<.5?0xff5a3a:0xffc080,rnd(.35,.8));m.position.copy(from);scene.add(m);PEP.fx.push({k:'sk',m,from,to:new V3(cx,cy,cz),t:0,T:rnd(.45,.8)})}
   if(Math.random()<dt*6)pepSnd('whine',.25)}}
 if(ac===58)wing=.42+Math.sin(t*22)*.05;
 if(ac===59){low=.35;roll=Math.sin(t*24)*.03;if(at>.6&&at<.9&&Math.random()<dt*30){R.b3.getWorldPosition(_pv);puff(_pv.add(_pv2.set(rnd(-2,2),-1.5,rnd(-2,2))),6,0xd8c8b0,6,.6,-1)}}
 if(ac===51)wing=.35+Math.sin(t*14)*.05;
 if(R.wreck){vx=vz=0}const spd=R.wreck?0:e.spd;
 // корпус
 R.b3.position.y=R.b3y-low+Math.sin(t*4.4)*.12*pepC(spd/2.5)+Math.sin(t*1.1)*.06;R.b3.rotation.set(tilt+pepC(spd/8)*.05,0,roll);
 if(!R.wreck){if(off){R.p3.position.copy(g.worldToLocal(off.clone()))}else R.p3.position.set(0,0,0)}
 g.updateMatrixWorld(true);
 // ноги
 const stabs=e.stabs||[];for(const L of R.l3)L.ov=null;
 for(const s of stabs){s.t+=dt;const L=R.l3[s.leg];if(!L)continue;const u=s.t;let y;if(u<.55)y=PEP_Y+pepE(u/.55)*5.5;else if(u<.67)y=PEP_Y+5.5*(1-(u-.55)/.12);else y=PEP_Y;
  if(u>=.67&&!s.hit){s.hit=1;pepPuff(_pv.set(s.x,PEP_Y+.3,s.z),30,0xd8c8b0,7,.8,-1);ring(_pv,2.6,0xff3a1a);const v=sndV(s.x,PEP_Y,s.z);sfx('slam',.9*Math.max(.25,v));shake=Math.max(shake,.35*v);
   if(pepAuth())pepHitNear(s.x,s.z,1.8,34,12,PEP_Y+3)}
  if(u<1.15){L.ov=new V3(s.x,y,s.z);if(u>=.67)L.foot.set(s.x,PEP_Y,s.z)}}
 e.stabs=stabs.filter(s=>s.t<1.15);
 const air=off!=null;if(air)for(const L of R.l3){_pv2.copy(L.rest).multiplyScalar(.55);g.localToWorld(_pv2);_pv2.y+=3+R.p3.position.y;L.ov=_pv2.clone();L.init=false}
 R.l3.forEach((L,i)=>{L.grp=[0,1,0,1,1,0,1,0][i]});
 pepGait(R,R.l3,R.p3,{thr:2.6,dur:.55,lift:2.9,lead:.35,vx,vz,gy,spread,onStep:L=>{const v=sndV(L.foot.x,L.foot.y,L.foot.z);pepSnd('step',.8*Math.max(.15,v));shake=Math.max(shake,.1*v);pepPuff(_pv.copy(L.foot).setY(PEP_Y+.2),6,0xd8c8b0,4,.6,-1)}},dt);
 // крылья, нимб, ядро, кассеты, пушки
 R.wing.forEach((W,i)=>{const f=Math.sin(t*2+i)*.04+wing*(.55+.15*(i%3));W.w.quaternion.copy(W.q0).multiply(_pq.setFromAxisAngle(PZ,W.s*f))});
 R.halo.rotation.z+=dt*(ac===55?3:R.rg?1.8:.5);R.halo.scale.setScalar(1+(ac===55?.1*Math.sin(t*20):0));
 R.core.scale.setScalar(coreS*(1+Math.sin(t*6)*.05));R.coreG.material.opacity=pepC(coreK*.8,0,1);R.coreG.scale.setScalar(5.5*coreS*(1+.15*Math.sin(t*9)));
 R.coreG.material.color.setHex(ac===55&&at>3?0xffd0a0:0xff3a20);
 const pod=ac===53?(at<.5?pepE(at/.5):at<2.4?1:Math.max(0,1-(at-2.4)/.5)):0;R.pod3.L.rotation.x=R.pod3.R.rotation.x=-.55*pod;
 R.cab.rotation.x=Math.sin(t*1.3)*.04;R.cab.rotation.z=Math.cos(t*1.1)*.04;
 // «ЛИКВИДАЦИЯ»: прицельные лучи, затем двойной луч ножницами
 const ch=ac===52&&at<1.3,fire=ac===52&&at>=1.3&&at<4;R.mzG.L.visible=R.mzG.R.visible=ac===52&&at<4;if(R.mzG.L.visible){const s=ch?.6+at*1.4:2.4+Math.sin(t*30)*.3;R.mzG.L.scale.set(s,s,1);R.mzG.R.scale.set(s,s,1)}
 if(ch||fire){const yaw=g.rotation.y,D=e.beamD||12;['L','R'].forEach((s,i)=>{const from=R.cm[s].getWorldPosition(new V3());let ang=0,dd=D;if(fire){const u=(at-1.3)/2.7;ang=(i?-1:1)*.55*Math.cos(Math.PI*u);dd=D+4*Math.sin(2*Math.PI*u)}else ang=(i?-1:1)*.55;
   const a=yaw+ang,to=new V3(e.pos.x+Math.sin(a)*dd,PEP_Y,e.pos.z+Math.cos(a)*dd);if(fire){pepBeamSet(R.beams3[i],from,to,.55+Math.sin(t*35+i)*.08);if(Math.random()<dt*30)puff(to,3,0xff6a30,8,.5,6)}else{pepBeamSet(R.aim3[i],from,to,.05)}});
  if(fire&&Math.random()<dt*7)pepSnd('laser',.6)}
 const uf=ac===41?2.5:5,beg=ac===61?Math.max(0,Math.sin(t*2.2))*.8:0;pepHostAnim(e,R,dt,{look,scream:((ac===40||ac===41)&&at>uf&&at<uf+2)||ac===55||ac===57||(ac===60&&at<2.6),daze:ac===56||(ac===60&&R.ej&&R.ej.t>=1),raise:(ac===40||ac===41)&&at>uf+.2&&at<uf+2?1:beg,lean:ac===61?.25:0})}
/* крах: обломки паука остаются в мире, старика выбрасывает из купола на площадь */
function pepLand(e){const yaw=e.g.rotation.y;let x=pepC(e.pos.x+Math.sin(yaw)*8.5,-19,19),z=pepC(e.pos.z+Math.cos(yaw)*8.5,-130.5,-111);
 for(const o of PEP_OBS){const ox=x-o[0],oz=z-o[1],od=Math.hypot(ox,oz)||.01,m=o[2]+1.6;if(od<m){x=o[0]+ox/od*m;z=o[1]+oz/od*m}}return new V3(x,PEP_Y,z)}
function pepEject(e,R,instant){if(R.wreck)return;R.g.updateMatrixWorld(true);const w=new V3(),q=new THREE.Quaternion(),s=new V3();
 R.p3.matrixWorld.decompose(w,q,s);scene.add(R.p3);R.p3.position.copy(w);R.p3.quaternion.copy(q);R.p3.scale.copy(s);R.wreck=R.p3;R.p3.updateMatrixWorld(true);
 R.host.matrixWorld.decompose(w,q,s);scene.add(R.host);R.host.position.copy(w);R.host.quaternion.copy(q);R.host.scale.setScalar(1.9);R.host.visible=true;
 const to=pepLand(e);to.y=PEP_Y+.32;R.ej={from:w.clone(),to,t:instant?1:0};if(instant){R.host.position.copy(to)}else{sfx('crack',.8);puff(w,40,0xff8080,8,.6,6)}}
/* игрок не проходит сквозь корпус и ноги */
function pepPush(e,R,ph,ac,at){if(!P.alive)return;const p=P.pos;
 const cyl=(x,z,r,y0,y1)=>{if(p.y+1.7<y0||p.y>y1)return;const dx=p.x-x,dz=p.z-z,d=Math.hypot(dx,dz);if(d<r&&d>.001){p.x=x+dx/d*r;p.z=z+dz/d*r}};
 if(R.p1.visible){R.b1.getWorldPosition(_pv);cyl(_pv.x,_pv.z,2.3,PEP_Y-1,_pv.y+3)}
 if(R.p2.visible&&R.p2.scale.x>1.1){R.pel.getWorldPosition(_pv);cyl(_pv.x,_pv.z,2.1,e.pos.y-1,e.pos.y+9.5)}
 if(e.ac===61)cyl(e.pos.x,e.pos.z,1.1,PEP_Y-1,PEP_Y+2.4);
 if(R.p3.visible){R.b3.getWorldPosition(_pv);cyl(_pv.x,_pv.z,3.3,_pv.y-2,_pv.y+2.8);
  for(const L of R.l3){L.knee.localToWorld(_pv.set(0,-L.Ll*.8,0));const fx=L.foot.x,fz=L.foot.z;cyl((fx+_pv.x)/2,(fz+_pv.z)/2,.65,PEP_Y-1,PEP_Y+3)}}}
/* ---------- кадр модуля ---------- */
function pepFrame(dt){if(!story||story.lv.id!=='l4'){if(PEP.fx.length)pepReset();return}loadPep();pepFxUpd(dt);pepFistUpd(dt);pepSayUpd(dt);pepPropUpd(dt);
 if(!PEP.prop&&PEP_T&&PEP_T!=='load'&&L4&&!enemies.some(x=>x.type==='pep')&&story.room<3&&!PEP.noProp)pepProp()}
/*PEP-END*/
