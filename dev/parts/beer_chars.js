/* ================= УРОВЕНЬ 3: персонажи, босс, квест ================= */
/* ---------- девушка: риг из примитивов, лицо — нарисованная текстура ---------- */
const GT={};
function cTex(w,h,f){const c=document.createElement('canvas');c.width=w;c.height=h;f(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.anisotropy=8;return t}
function faceTex(kind,ex){const key=kind+'|'+ex;if(GT[key])return GT[key];
 const alt=kind==='alt';return GT[key]=cTex(1024,512,(g,w,h)=>{const cx=256,ey=274;
  g.fillStyle=alt?'#f3d8cb':'#f0cfb4';g.fillRect(0,0,w,h);
  const sh=g.createLinearGradient(cx-190,0,cx+190,0);sh.addColorStop(0,'rgba(150,80,70,.18)');sh.addColorStop(.25,'rgba(0,0,0,0)');sh.addColorStop(.75,'rgba(0,0,0,0)');sh.addColorStop(1,'rgba(150,80,70,.18)');g.fillStyle=sh;g.fillRect(cx-190,0,380,h);
  // румянец
  for(const s of[-1,1]){const r=g.createRadialGradient(cx+s*74,322,4,cx+s*74,322,40);r.addColorStop(0,alt?'rgba(255,110,160,.38)':'rgba(255,120,110,.42)');r.addColorStop(1,'rgba(255,120,150,0)');g.fillStyle=r;g.fillRect(cx+s*74-44,280,88,88)}
  if(!alt){g.fillStyle='#4a2a20';g.beginPath();g.arc(cx+34,372,3.4,0,7);g.fill();const hl=g.createRadialGradient(cx,300,4,cx,300,30);hl.addColorStop(0,'rgba(255,255,255,.16)');hl.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=hl;g.fillRect(cx-30,270,60,60)}
  // брови
  const brow=(s,lift,ang)=>{g.save();g.translate(cx+s*52,ey-46-lift);g.scale(s,1);g.strokeStyle=alt?'#1a1216':'#7a5230';g.lineCap='round';g.lineWidth=alt?7:6;g.beginPath();g.moveTo(-26,6-ang);g.quadraticCurveTo(4,-8+ang*.2,30,2+ang*.6);g.stroke();g.restore()};
  const eyeOpen=(s,wide)=>{g.save();g.translate(cx+s*50,ey);g.scale(s*1.28,1.28);const W=wide?1.12:1;
   {const es=g.createRadialGradient(4,-10,4,4,-10,40);es.addColorStop(0,alt?'rgba(110,40,120,.55)':'rgba(200,120,90,.38)');es.addColorStop(1,'rgba(110,40,120,0)');g.fillStyle=es;g.fillRect(-40,-50,84,56)}
   g.beginPath();g.moveTo(-24*W,3);g.quadraticCurveTo(-4,-19*W,26*W,-6);g.quadraticCurveTo(4,15*W,-24*W,3);g.closePath();g.fillStyle='#fbf6f4';g.fill();g.save();g.clip();
   g.fillStyle=alt?'#5b3c88':'#2f9ab8';g.beginPath();g.arc(2,-2,12.5*W,0,7);g.fill();g.fillStyle=alt?'#2a1640':'#175a70';g.lineWidth=3;g.strokeStyle=g.fillStyle;g.beginPath();g.arc(2,-2,12.5*W,0,7);g.stroke();
   g.fillStyle='#0b0710';g.beginPath();g.arc(2,-2,wide?4:5.5,0,7);g.fill();g.fillStyle='#fff';g.beginPath();g.arc(-3,-7,3.4,0,7);g.fill();g.beginPath();g.arc(7,3,1.6,0,7);g.fill();g.restore();
   g.strokeStyle='#120c10';g.lineCap='round';g.lineWidth=alt?6:4.5;g.beginPath();g.moveTo(-24*W,3);g.quadraticCurveTo(-4,-19*W,26*W,-6);g.lineTo(alt?42:34,alt?-19:-13);g.stroke();
   g.lineWidth=2.2;for(let i=0;i<(alt?4:6);i++){const x=(alt?8:-4)+i*6;g.beginPath();g.moveTo(x,-12+i*1.2);g.lineTo(x+5,-20+i*1.1);g.stroke()}
   g.strokeStyle='rgba(30,20,25,.6)';g.lineWidth=1.6;g.beginPath();g.moveTo(26*W,-6);g.quadraticCurveTo(10,13*W,-8,10);g.stroke();g.restore()};
  const eyeShut=(s,happy)=>{g.save();g.translate(cx+s*50,ey);g.scale(s*1.28,1.28);g.strokeStyle='#120c10';g.lineCap='round';g.lineWidth=alt?6:4.5;g.beginPath();
   if(happy){g.moveTo(-22,6);g.quadraticCurveTo(2,-14,26,4)}else{g.moveTo(-22,-2);g.quadraticCurveTo(2,10,26,-4)}g.stroke();if(alt){g.beginPath();g.moveTo(24,-3);g.lineTo(40,-15);g.stroke()}
   g.lineWidth=2;for(let i=0;i<3;i++){g.beginPath();g.moveTo(10+i*7,happy?-4:5);g.lineTo(13+i*8,happy?-10:11);g.stroke()}g.restore()};
  // глаза по выражению
  if(ex==='wink'){brow(-1,0,0);brow(1,-4,3);eyeOpen(-1);eyeShut(1)}
  else if(ex==='blink'){brow(-1,0,0);brow(1,0,0);eyeShut(-1);eyeShut(1)}
  else if(ex==='laugh'||ex==='happy'){brow(-1,6,0);brow(1,6,0);eyeShut(-1,1);eyeShut(1,1)}
  else if(ex==='angry'){brow(-1,-6,-9);brow(1,-6,-9);eyeOpen(-1);eyeOpen(1)}
  else if(ex==='scared'){brow(-1,10,9);brow(1,10,9);eyeOpen(-1,1);eyeOpen(1,1)}
  else if(ex==='dizzy'){brow(-1,4,6);brow(1,4,6);for(const s of[-1,1]){g.save();g.translate(cx+s*48,ey);g.strokeStyle='#120c10';g.lineWidth=4;g.beginPath();for(let a=0;a<12;a+=.3){const r=a*1.4;g.lineTo(Math.cos(a)*r,Math.sin(a)*r*.8)}g.stroke();g.restore()}}
  else{brow(-1,0,0);brow(1,2,0);eyeOpen(-1);eyeOpen(1)}
  // нос
  g.strokeStyle=alt?'rgba(170,100,95,.7)':'rgba(170,100,80,.7)';g.lineWidth=3;g.lineCap='round';g.beginPath();g.moveTo(cx-8,318);g.quadraticCurveTo(cx,325,cx+8,318);g.stroke();
  g.fillStyle='rgba(255,255,255,.35)';g.beginPath();g.arc(cx+1,309,3,0,7);g.fill();
  // рот
  const lip=alt?'#7a1a44':'#e0567a',lipD=alt?'#4c0f2a':'#a8304e';g.save();g.translate(cx,356);
  if(ex==='laugh'||ex==='happy'||ex==='scared'||ex==='angry'){const op=ex==='scared'?[18,20]:ex==='angry'?[26,12]:[30,18];
   g.fillStyle='#3a0a18';g.beginPath();if(ex==='scared')g.ellipse(0,4,op[0],op[1],0,0,7);else{g.moveTo(-op[0],-4);g.quadraticCurveTo(0,-8,op[0],-4);g.quadraticCurveTo(0,op[1]*1.6,-op[0],-4)}g.fill();
   g.fillStyle='#fff';g.save();g.clip();g.fillRect(-op[0],-10,op[0]*2,ex==='angry'?7:6);if(ex==='angry')g.fillRect(-op[0],op[1]*.6,op[0]*2,8);g.restore();
   g.strokeStyle=lip;g.lineWidth=5;g.beginPath();if(ex==='scared')g.ellipse(0,4,op[0],op[1],0,0,7);else{g.moveTo(-op[0],-4);g.quadraticCurveTo(0,-9,op[0],-4);g.quadraticCurveTo(0,op[1]*1.6,-op[0],-4)}g.stroke()}
  else{const sm=ex==='smirk'||ex==='wink'?1:0;g.fillStyle=lip;g.beginPath();g.moveTo(-27,0);g.quadraticCurveTo(-12,-10,-3,-6);g.quadraticCurveTo(0,-4,3,-6);g.quadraticCurveTo(14,-10,27,-1-sm*7);g.quadraticCurveTo(10,4,-27,0);g.fill();
   g.fillStyle=lip;g.beginPath();g.moveTo(-24,1);g.quadraticCurveTo(0,20,25,-1-sm*6);g.quadraticCurveTo(0,6,-24,1);g.fill();
   g.strokeStyle=lipD;g.lineWidth=2.5;g.beginPath();g.moveTo(-27,0);g.quadraticCurveTo(0,4,27,-1-sm*7);g.stroke();
   g.fillStyle='rgba(255,255,255,'+(alt?.32:.5)+')';g.beginPath();g.ellipse(-4,9,9,2.8,0,0,7);g.fill()}
  g.restore();
  if(alt){g.fillStyle='#e8eef4';for(const x of[-15,15]){g.beginPath();g.arc(cx+x,384,3.2,0,7);g.fill()}g.beginPath();g.arc(cx+76,226,2.6,0,7);g.arc(cx+82,238,2.6,0,7);g.fill()}})}
function hairTex(base,streak,mud){const key='h'+base+streak+(mud?1:0);if(GT[key])return GT[key];return GT[key]=cTex(256,256,(g,w,h)=>{g.fillStyle=base;g.fillRect(0,0,w,h);
 let sd=3;const rn=()=>(sd=(sd*16807)%2147483647)/2147483647;
 for(let i=0;i<260;i++){const x=rn()*w,l=.25+rn()*.3;g.strokeStyle=`rgba(${rn()<.5?'255,255,255':'0,0,0'},${.06+rn()*.1})`;g.lineWidth=1+rn()*2;g.beginPath();g.moveTo(x,0);g.bezierCurveTo(x+rn()*6-3,h*.3,x+rn()*6-3,h*.7,x+rn()*8-4,h);g.stroke()}
 const sh=g.createLinearGradient(0,0,0,h);sh.addColorStop(0,'rgba(255,255,255,0)');sh.addColorStop(.22,'rgba(255,255,255,.16)');sh.addColorStop(.32,'rgba(255,255,255,0)');g.fillStyle=sh;g.fillRect(0,0,w,h);
 if(streak&&!mud){g.fillStyle=streak;for(const [x,ww] of[[30,26],[150,18],[205,30]]){g.globalAlpha=.92;g.fillRect(x,0,ww,h);g.globalAlpha=.25;g.fillStyle='#fff';g.fillRect(x+4,0,3,h);g.fillStyle=streak}g.globalAlpha=1}
 if(mud){g.fillStyle=mud;for(let i=0;i<16;i++){g.globalAlpha=.25+rn()*.35;g.fillRect(rn()*w,0,3+rn()*7,h)}g.globalAlpha=1}})}
function plaidTex(){if(GT.plaid)return GT.plaid;const t=cTex(256,256,(g,w,h)=>{g.fillStyle='#8a0f22';g.fillRect(0,0,w,h);g.globalAlpha=.55;g.fillStyle='#16080c';
  for(const o of[0,128]){g.fillRect(o+18,0,44,h);g.fillRect(0,o+18,w,44)}g.globalAlpha=.8;g.fillStyle='#e8c040';for(const o of[0,128]){g.fillRect(o+86,0,5,h);g.fillRect(0,o+86,w,5)}
  g.globalAlpha=.35;g.fillStyle='#000';for(const o of[0,128]){g.fillRect(o+104,0,14,h);g.fillRect(0,o+104,w,14)}g.globalAlpha=1});t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(3,1);return GT.plaid=t}
function netTex(skin){const key='net'+skin;if(GT[key])return GT[key];const t=cTex(128,128,(g,w,h)=>{g.fillStyle=skin;g.fillRect(0,0,w,h);g.strokeStyle='#120e12';g.lineWidth=2.2;
 for(let i=-128;i<256;i+=16){g.beginPath();g.moveTo(i,0);g.lineTo(i+128,h);g.stroke();g.beginPath();g.moveTo(i+128,0);g.lineTo(i,h);g.stroke()}});t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(4,4);return GT[key]=t}
function teeTex(kind){const key='tee'+kind;if(GT[key])return GT[key];return GT[key]=cTex(512,256,(g,w,h)=>{
 if(kind==='band'){g.fillStyle='#17151b';g.fillRect(0,0,w,h);const cx=w*.5;g.fillStyle='#ff3fa4';g.font='900 22px "Russo One",Arial';g.textAlign='center';g.fillText('ГАЗ-ПАНК',cx,h*.47);
  g.fillStyle='#f4f0e6';g.beginPath();g.ellipse(cx,h*.66,18,17,0,0,7);g.fill();g.fillRect(cx-10,h*.66+8,20,11);g.fillStyle='#17151b';for(const x of[-7,7]){g.beginPath();g.arc(cx+x,h*.66,4.6,0,7);g.fill()}
  g.strokeStyle='#ff3fa4';g.lineWidth=3;g.beginPath();g.moveTo(cx-30,h*.56);g.lineTo(cx+30,h*.82);g.moveTo(cx+30,h*.56);g.lineTo(cx-30,h*.82);g.stroke()}
 else{g.fillStyle='#a9cdea';g.fillRect(0,0,w,h);let sd=9;const rn=()=>(sd=(sd*16807)%2147483647)/2147483647;g.fillStyle='rgba(96,62,32,.62)';
  for(let i=0;i<22;i++){const x=rn()*w,y=h*.3+rn()*h*.7;g.beginPath();g.ellipse(x,y,6+rn()*26,4+rn()*14,rn()*3,0,7);g.fill()}g.fillStyle='rgba(96,62,32,.35)';g.fillRect(0,h*.82,w,h*.18);
  g.fillStyle='#fff6e0';g.font='900 22px Arial';g.textAlign='center';g.fillText('ПЛЯЖ 2026',w*.5,h*.5);g.fillStyle='#e8461e';g.beginPath();g.arc(w*.5,h*.66,14,Math.PI,0);g.fill()}})}
/* профиль торса: [r,y] от талии; глубина — масштаб z */
function latheG(pts,seg,ph0,phL){const g=new THREE.LatheGeometry(pts.map(([r,y])=>new THREE.Vector2(r,y)),seg||24,ph0||0,phL||Math.PI*2);return g}
function tubeG(pts,r){const c=new THREE.CatmullRomCurve3(pts.map(p=>new V3(...p)));return new THREE.TubeGeometry(c,16,r,6,false)}
/* поза: суставы → [x,y,z]; правая сторона зеркалится */
const GPOSE={
 stand:{lSh:[.05,0,.12],lEl:[-.15,0,0],lHip:[0,0,.03],lKn:[0,0,0],spine:[0,0,0],neck:[0,0,0],head:[0,0,0],fl:'relax',fr:'relax'},
 taunt:{lSh:[-.5,0,2.45],lEl:[0,0,.7],rSh:[.1,0,-.25],rEl:[-.9,0,0],lHip:[0,0,.03],spine:[0,.15,.05],head:[.05,-.2,-.12],fl:'rock',fr:'fist'},
 point:{rSh:[-1.45,.15,-.1],rEl:[-.05,0,0],lSh:[.1,0,.35],lEl:[-1.6,0,0],spine:[0,-.2,0],head:[.05,.2,0],fr:'point',fl:'fist'},
 aim:{rSh:[-1.45,-.15,-.15],rEl:[-.15,0,0],lSh:[-.9,.2,.2],lEl:[-1.4,0,0],spine:[0,-.25,0],head:[.12,.1,0],fr:'grip',fl:'grip'},
 throw:{rSh:[-2.6,.1,-.3],rEl:[-1.3,0,0],lSh:[-.8,0,.4],lEl:[-.4,0,0],spine:[.1,.35,0],head:[0,-.2,0],fr:'grip',fl:'open'},
 laugh:{lSh:[.3,0,.35],lEl:[-1.7,.4,0],rSh:[.3,0,-.35],rEl:[-1.7,-.4,0],spine:[-.2,0,0],head:[-.35,0,0],fl:'fist',fr:'fist'},
 cheer:{lSh:[-.3,0,2.7],lEl:[0,0,.25],rSh:[-.3,0,-2.7],rEl:[0,0,-.25],head:[-.2,0,0],fl:'fist',fr:'fist'},
 tread:{lSh:[-.6,0,2.4],lEl:[-.6,0,.2],rSh:[-.6,0,-2.1],rEl:[-.8,0,-.2],head:[-.3,0,0],lHip:[-.3,0,.1],lKn:[.8,0,0],rHip:[.4,0,-.1],rKn:[.6,0,0],fl:'open',fr:'open'},
 hold:{lSh:[-1.2,0,.45],lEl:[-.6,0,0],rSh:[-1.2,0,-.45],rEl:[-.6,0,0],head:[-.15,0,0],lHip:[-.2,0,.1],lKn:[.5,0,0],fl:'grip',fr:'grip'},
 climb:{lSh:[-2.4,0,.3],lEl:[-.6,0,0],rSh:[-2.2,0,-.3],rEl:[-.9,0,0],lHip:[-1.3,0,.1],lKn:[1.6,0,0],rHip:[-.3,0,-.1],rKn:[.5,0,0],spine:[.3,0,0],fl:'grip',fr:'grip'},
 ride:{lSh:[-.9,0,.5],lEl:[-.7,0,0],rSh:[-.4,0,-.5],rEl:[-.6,0,0],lHip:[-1.35,-.2,.62],lKn:[1.35,0,0],rHip:[-1.35,.2,-.62],rKn:[1.35,0,0],spine:[.18,0,0],head:[-.15,0,0],fl:'grip',fr:'grip'},
 rideAim:{lSh:[-.9,0,.5],lEl:[-.7,0,0],rSh:[-1.5,-.3,-.1],rEl:[-.1,0,0],lHip:[-1.35,-.2,.62],lKn:[1.35,0,0],rHip:[-1.35,.2,-.62],rKn:[1.35,0,0],spine:[.1,-.2,0],head:[.05,.15,0],fl:'grip',fr:'grip'},
 rideTaunt:{lSh:[-.9,0,.5],lEl:[-.7,0,0],rSh:[-.4,0,-2.5],rEl:[0,0,-.6],lHip:[-1.35,-.2,.62],lKn:[1.35,0,0],rHip:[-1.35,.2,-.62],rKn:[1.35,0,0],spine:[0,-.1,-.08],head:[-.1,.2,.1],fl:'grip',fr:'rock'},
 dazed:{lSh:[.2,0,1.2],lEl:[-.3,0,0],rSh:[.2,0,-1.3],rEl:[-.3,0,0],lHip:[-1.35,-.2,.62],lKn:[1.35,0,0],rHip:[-1.35,.2,-.62],rKn:[1.35,0,0],spine:[-.3,0,.3],head:[.3,0,.4],fl:'open',fr:'open'},
 jump:{lSh:[-.4,0,1.9],lEl:[-.3,0,0],rSh:[-.4,0,-1.9],rEl:[-.3,0,0],lHip:[-1,0,.2],lKn:[1.5,0,0],rHip:[-.3,0,-.15],rKn:[.6,0,0],spine:[.2,0,0],fl:'rock',fr:'open'},
 sulk:{lSh:[-.9,.5,.2],lEl:[-1.9,.6,0],rSh:[-.9,-.5,-.2],rEl:[-1.9,-.6,0],lHip:[-1.5,0,.25],lKn:[1.5,0,0],rHip:[-1.5,0,-.25],rKn:[1.5,0,0],spine:[.12,0,0],head:[.25,.5,0],fl:'fist',fr:'fist'},
 chute:{lSh:[-.2,0,2.6],lEl:[-.5,0,.4],rSh:[-.2,0,-2.6],rEl:[-.5,0,-.4],lHip:[-.2,0,.08],lKn:[.4,0,0],rHip:[-.5,0,-.08],rKn:[.7,0,0],head:[.1,.3,0],fl:'grip',fr:'grip'}};
const FING={relax:[.5,.6,.7,.8,.3],fist:[1.9,2,2,1.9,.9],rock:[0,2.2,2.2,0,1],point:[0,2,2,1.9,.9],grip:[1.4,1.5,1.5,1.4,.9],open:[.05,.05,.05,.1,.1]};
function buildGirlP(o){const S=o.scale||1,root=new THREE.Group(),J={},mats=[];const ENVO={envMap:ENV,envMapIntensity:.35};
 const mt=(c,x)=>{const m=new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.6},x||{}));mats.push(m);return m};
 const skin=mt(o.skin,{roughness:.55,emissive:new THREE.Color(o.skin).multiplyScalar(.14)}),hairM=mt(0xffffff,{map:hairTex(o.hair,o.streak,o.soft),roughness:.42,side:THREE.DoubleSide,...ENVO,envMapIntensity:.25});
 const gp=(par,x,y,z)=>{const g=new THREE.Group();g.position.set(x,y,z);par.add(g);return g};
 const put=(par,geo,mat,x,y,z,rx,ry,rz)=>{const m=new THREE.Mesh(geo,mat);m.position.set(x||0,y||0,z||0);if(rx||ry||rz)m.rotation.set(rx||0,ry||0,rz||0);m.castShadow=true;par.add(m);return m};
 const top=o.kind==='alt'?mt(0xffffff,{map:teeTex('band'),roughness:.8}):skin,bando=mt(0xff4f9a,{roughness:.35,...ENVO,envMapIntensity:.5}),denim=mt(0x4a6fa5,{roughness:.85}),goldM=mt(0xf2c45a,{metalness:1,roughness:.22,envMap:ENV});
 const leather=mt(0x141217,{roughness:.32,metalness:.15,...ENVO,envMapIntensity:.6}),silver=mt(0xd8dee6,{metalness:1,roughness:.2,envMap:ENV});
 const legM=o.kind==='alt'?mt(0xffffff,{map:netTex('#f3d8cb'),roughness:.55}):skin;
 const bootM=o.kind==='alt'?mt(0x141216,{roughness:.35,...ENVO,envMapIntensity:.5}):skin,soleM=o.kind==='alt'?mt(0x0a0a0c,{roughness:.8}):mt(0xffffff,{roughness:.5});
 const pink=new THREE.MeshBasicMaterial({color:o.streakHex||0xff3fa4});
 J.root=root;J.hips=gp(root,0,.93,0);
 // таз и юбка/штаны
 put(J.hips,latheG([[.0,-.1],[.115,-.1],[.15,-.02],[.145,.06],[.125,.1]],20),o.kind==='alt'?leather:denim).scale.z=.74;
 if(o.kind==='alt'){const sk=new THREE.CylinderGeometry(.16,.29,.27,32,1,true),p=sk.attributes.position;for(let i=0;i<p.count;i++){const a=Math.atan2(p.getZ(i),p.getX(i)),k=(p.getY(i)+.135)/.27;const f=1+(1-k)*.07*Math.cos(a*16);p.setX(i,p.getX(i)*f);p.setZ(i,p.getZ(i)*f*.8)}sk.computeVertexNormals();
  const sm=mt(0xffffff,{map:plaidTex(),roughness:.75,side:THREE.DoubleSide});put(J.hips,sk,sm,0,-.06,0);
  put(J.hips,new THREE.TorusGeometry(.145,.018,6,28),leather,0,.075,0,Math.PI/2).scale.y=.74;put(J.hips,new THREE.BoxGeometry(.05,.04,.02),silver,0,.075,.112);
  put(J.hips,tubeG([[.12,.05,.05],[.16,-.04,.07],[.15,-.1,.0],[.12,.04,-.06]],.007),silver)}
 // ноги
 for(const s of[1,-1]){const n=s>0?'l':'r',hip=J[n+'Hip']=gp(J.hips,s*.09,-.03,0);put(hip,new THREE.CylinderGeometry(.072,.056,.42,14),legM,0,-.2,0);if(o.kind!=='alt'){put(hip,new THREE.CylinderGeometry(.08,.077,.13,14),denim,0,-.045,0);put(hip,new THREE.TorusGeometry(.077,.008,5,18),mt(0xe8eef8,{roughness:.9}),0,-.11,0,Math.PI/2)}
  const kn=J[n+'Kn']=gp(hip,0,-.41,0);put(kn,new THREE.CylinderGeometry(.054,.04,.4,14),legM,0,-.2,0);
  const ft=gp(kn,0,-.4,0);if(o.kind==='alt'){put(ft,new THREE.CylinderGeometry(.062,.066,.2,14),bootM,0,.06,0);put(ft,new THREE.BoxGeometry(.11,.1,.25),bootM,0,-.05,.05);put(ft,new THREE.BoxGeometry(.125,.07,.29),soleM,0,-.12,.05);
   for(const y of[.1,.02])put(ft,new THREE.TorusGeometry(.066,.008,4,16),silver,0,y,0,Math.PI/2)}
  else{put(ft,new THREE.BoxGeometry(.075,.06,.22),skin,0,-.06,.05);put(ft,new THREE.BoxGeometry(.09,.03,.25),soleM,0,-.105,.05);put(ft,new THREE.TorusGeometry(.04,.007,4,12),goldM,0,-.06,.05,Math.PI/2).scale.set(1.1,1,.6)}}
 // торс
 J.spine=gp(J.hips,0,.09,0);
 put(J.spine,latheG([[.122,-.02],[.118,.03],[.128,.11],[.142,.19],[.148,.25],[.14,.31],[.115,.36],[.06,.39],[.0,.4]],24).rotateY(Math.PI),top).scale.z=.7;
 if(o.kind!=='alt'){const b=put(J.spine,new THREE.CylinderGeometry(.156,.15,.11,24,1,true),bando,0,.25,0);b.scale.z=.76;bando.side=THREE.DoubleSide;put(J.spine,new THREE.SphereGeometry(.022,10,8),bando,0,.25,.118);}
 if(o.kind==='alt'){const jk=latheG([[.133,.0],[.132,.05],[.14,.12],[.154,.2],[.16,.26],[.152,.32],[.125,.37],[.075,.4]],24,.78,Math.PI*2-1.56);const j=put(J.spine,jk,leather);j.scale.z=.74;
  put(J.spine,new THREE.TorusGeometry(.07,.02,6,20,Math.PI),leather,0,.385,-.012,Math.PI/2,0,Math.PI)}
 J.neck=gp(J.spine,0,.395,0);put(J.neck,new THREE.CylinderGeometry(.043,.05,.11,12),skin,0,.04,0);
 if(o.kind!=='alt'){put(J.neck,new THREE.TorusGeometry(.056,.004,5,24),goldM,0,-.005,.012,Math.PI/2+.42);put(J.neck,new THREE.OctahedronGeometry(.013),goldM,0,-.035,.072)}
 if(o.kind==='alt'){put(J.neck,new THREE.TorusGeometry(.047,.012,6,20),leather,0,.04,0,Math.PI/2);put(J.neck,new THREE.TorusGeometry(.014,.004,6,12),silver,0,.025,.054);const hrt=put(J.neck,new THREE.SphereGeometry(.009,8,6),pink,0,.012,.056)}
 // голова
 J.head=gp(J.neck,0,.07,0);const HR=.126;
 J.faceM=mt(0xffffff,{map:faceTex(o.kind,o.kind==='alt'?'smirk':'scared'),roughness:.55,emissive:0xffffff,emissiveMap:faceTex(o.kind,o.kind==='alt'?'smirk':'scared'),emissiveIntensity:.12});
 const hg=new THREE.SphereGeometry(HR,40,28),hp=hg.attributes.position;for(let i=0;i<hp.count;i++){const y=hp.getY(i);if(y<0){const t=-y/HR;hp.setX(i,hp.getX(i)*(1-.26*t*t));hp.setZ(i,hp.getZ(i)*(1-.12*t*t)+(hp.getZ(i)>0?.012*t:0))}}hg.computeVertexNormals();
 const hd=put(J.head,hg,J.faceM,0,.095,0);hd.scale.set(.9,1.06,.97);
 for(const s of[-1,1]){put(J.head,new THREE.SphereGeometry(.026,8,6),skin,s*.112,.09,-.005).scale.set(.5,1,.8);if(o.kind==='alt')put(J.head,new THREE.TorusGeometry(.013,.003,6,12),silver,s*.118,.062,0,0,Math.PI/2);else put(J.head,new THREE.TorusGeometry(.024,.003,6,16),goldM,s*.117,.045,0,0,Math.PI/2)}
 // волосы
 const hc=J.hairC=gp(J.head,0,.095,0);const R2=HR*1.07;
 put(hc,new THREE.SphereGeometry(R2,32,10,0,Math.PI*2,0,.32*Math.PI),hairM).scale.set(.92,1.08,.99);
 put(hc,new THREE.SphereGeometry(R2*1.01,32,12,2.62,4.18,.22*Math.PI,.42*Math.PI),hairM).scale.set(.92,1.08,.99);
 {const N=22,ph0=.36,ph1=2.78,P=[],UV=[],I=[];for(let i=0;i<=N;i++){const ph=ph0+(ph1-ph0)*i/N,cf=Math.abs(Math.cos(ph-Math.PI/2)),jag=o.kind==='alt'?[.0,.05,.015,.065,.02,.045,0,.06,.025,.05,.01][i%11]:(i%2?.012:0)+(i/N)*.12,bot=(o.kind==='alt'?.37:.3)*Math.PI+jag*Math.PI-cf*.05*Math.PI;
   for(const [j,th] of[[0,.17*Math.PI],[1,(.17*Math.PI+bot)/2],[2,bot]]){const rr=R2*(1.04+j*.02);P.push(-rr*Math.cos(ph)*Math.sin(th)*.92,rr*Math.cos(th)*1.08,rr*Math.sin(ph)*Math.sin(th)*.99+(j===2?.008:0));UV.push(i/N,1-j/2)}
   if(i){const a=(i-1)*3,b=i*3;I.push(a,b,a+1,a+1,b,b+1,a+1,b+1,a+2,a+2,b+1,b+2)}}
  const bg=new THREE.BufferGeometry();bg.setAttribute('position',new THREE.Float32BufferAttribute(P,3));bg.setAttribute('uv',new THREE.Float32BufferAttribute(UV,2));bg.setIndex(I);bg.computeVertexNormals();put(hc,bg,hairM)}
 J.back=gp(hc,0,0,0);{const L=o.kind==='alt'?[[R2*1.0,.02],[R2*1.1,-.1],[R2*1.24,-.22],[R2*1.34,-.33],[R2*1.4,-.4]]:[[R2*1.0,.02],[R2*1.14,-.1],[R2*1.3,-.22],[R2*1.38,-.34],[R2*1.32,-.44],[R2*1.4,-.52]];
  const bk=latheG(L.map(([r,y])=>[r,y]),30,Math.PI-1.95,3.9),p=bk.attributes.position;const last=L[L.length-1][1];for(let i=0;i<p.count;i++){if(Math.abs(p.getY(i)-last)<1e-4)p.setY(i,last+((i%2)?.05:0));if(o.kind!=='alt'){const a=Math.atan2(p.getX(i),p.getZ(i)),f=1+.07*Math.sin(a*9+p.getY(i)*14);p.setX(i,p.getX(i)*f);p.setZ(i,p.getZ(i)*f)}}bk.computeVertexNormals();put(J.back,bk,hairM).scale.set(.95,1,.9)}
 const lockM=mt(o.kind==='alt'?o.hair:'#f0cc66',{roughness:.4,...ENVO}),lockP=o.streakHex?mt(o.streakHex,{roughness:.4,emissive:o.streakHex,emissiveIntensity:.25}):lockM;
 J.locks=[];for(const s of[-1,1]){const lk=gp(hc,s*.094,-.01,.05);const ln=o.kind==='alt'?-.34:-.4,wv=o.kind==='alt'?0:.03;const m=put(lk,tubeG([[0,.02,0],[s*(.012+wv),-.08,.012],[s*.02,-.18,.03],[s*(.016+wv),-.28,.03],[s*.014,ln,.02]],o.kind==='alt'?.024:.02),s>0&&o.streakHex?lockP:lockM);m.scale.set(o.kind==='alt'?.55:.4,1,1.4);J.locks.push(lk)}
 if(o.kind!=='alt'){const gl=gp(hc,0,.105,.03);gl.rotation.x=-.35;const lm=mt(0x1a1a22,{roughness:.05,metalness:.6,envMap:ENV});for(const s of[-1,1])put(gl,new THREE.SphereGeometry(.038,14,10),lm,s*.045,0,.075).scale.set(1,.75,.35);put(gl,new THREE.TorusGeometry(.115,.006,5,24,Math.PI),goldM,0,0,0,Math.PI/2,0,Math.PI);put(gl,new THREE.BoxGeometry(.03,.006,.006),goldM,0,0,.078)}
 if(false){const bun=put(hc,new THREE.IcosahedronGeometry(.07,2),lockM,0,.07,-.1);const p=bun.geometry.attributes.position;for(let i=0;i<p.count;i++){const f=1+Math.sin(p.getX(i)*80)*Math.cos(p.getY(i)*70)*.12;p.setXYZ(i,p.getX(i)*f,p.getY(i)*f,p.getZ(i)*f)}bun.geometry.computeVertexNormals();
  for(const [x,y,z,a] of[[.07,.1,.0,.9],[-.06,.11,.02,-1]])put(hc,new THREE.ConeGeometry(.01,.06,4),lockM,x,y,z,0,0,a)}
 // руки
 for(const s of[1,-1]){const n=s>0?'l':'r',sh=J[n+'Sh']=gp(J.spine,s*.165,.34,0);const sleeve=o.kind==='alt'?leather:top;
  put(sh,new THREE.SphereGeometry(o.kind==='alt'?.052:.045,12,8),sleeve);put(sh,new THREE.CylinderGeometry(o.kind==='alt'?.049:.045,o.kind==='alt'?.043:.04,.28,12),o.kind==='alt'?leather:skin,0,-.14,0);
  const el=J[n+'El']=gp(sh,0,-.28,0);put(el,new THREE.CylinderGeometry(.042,.033,.25,12),o.kind==='alt'?leather:skin,0,-.125,0);
  if(o.kind!=='alt')for(const y of[-.215,-.235])put(el,new THREE.TorusGeometry(.036,.005,5,16),goldM,0,y,0,Math.PI/2+(y+.22)*4);
  if(o.kind==='alt'){put(el,new THREE.CylinderGeometry(.036,.036,.04,12),silver,0,-.2,0);for(let k=0;k<6;k++){const a=k/6*6.283;put(el,new THREE.ConeGeometry(.008,.02,4),silver,Math.cos(a)*.038,-.2,Math.sin(a)*.038,0,0,-Math.PI/2).rotation.y=-a}}
  const wr=J[n+'Wr']=gp(el,0,-.255,0);put(wr,new THREE.BoxGeometry(.07,.085,.032),skin,0,-.04,0);
  const F=J[n+'F']=[];for(let k=0;k<4;k++){const f=gp(wr,(k-1.5)*.017*s,-.082,0);put(f,new THREE.CylinderGeometry(.0085,.0075,.07,6),skin,0,-.035,0);F.push(f)}
  const th=gp(wr,s*.04,-.03,.012);th.rotation.z=s*.5;put(th,new THREE.CylinderGeometry(.009,.008,.055,6),skin,0,-.027,0);F.push(th)}
 root.scale.setScalar(S);root.traverse(m=>{if(m.isMesh)m.castShadow=true});mergeKids(root);
 const G={g:root,J,mats,kind:o.kind,pose:'stand',ex:null,blinkT:2+Math.random()*3,bubble:null,bubT:0,t:Math.random()*9};setFace(G,o.kind==='alt'?'smirk':'scared');return G}
/* ---------- модели девушек из Blender (girls.py): гладкое тело на скелете, одежда, волосы прядями ---------- */
let GIRL_T={};
function loadGirls(){if(!THREE.GLTFLoader)return;for(const k of['alt','beach']){if(GIRL_T[k])continue;GIRL_T[k]='load';
 ugModel('models/girl_'+k+'.json',gl=>{gl.scene.updateMatrixWorld(true);GIRL_T[k]=gl.scene},undefined,()=>{GIRL_T[k]=null})}}
function strandTex(){if(GT.strand)return GT.strand;const t=cTex(256,256,(g,w,h)=>{g.fillStyle='#fff';g.fillRect(0,0,w,h);let sd=5;const rn=()=>(sd=(sd*16807)%2147483647)/2147483647;
  for(let i=0;i<340;i++){const x=rn()*w;g.strokeStyle=rn()<.55?`rgba(0,0,0,${.08+rn()*.18})`:`rgba(255,255,255,${.1+rn()*.2})`;g.lineWidth=.8+rn()*2.2;g.beginPath();g.moveTo(x,0);g.bezierCurveTo(x+rn()*4-2,h*.4,x+rn()*4-2,h*.7,x+rn()*5-2.5,h);g.stroke()}
  const sh=g.createLinearGradient(0,0,0,h);sh.addColorStop(0,'rgba(0,0,0,.25)');sh.addColorStop(.12,'rgba(255,255,255,0)');sh.addColorStop(.2,'rgba(255,255,255,.4)');sh.addColorStop(.3,'rgba(255,255,255,0)');sh.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=sh;g.fillRect(0,0,w,h)});
 t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=8;return GT.strand=t}
function denimTex(){if(GT.denim)return GT.denim;const t=cTex(256,256,(g,w,h)=>{g.fillStyle='#5b80b8';g.fillRect(0,0,w,h);let sd=9;const rn=()=>(sd=(sd*16807)%2147483647)/2147483647;
  for(let i=0;i<2600;i++){const x=rn()*w,y=rn()*h;g.fillStyle=rn()<.5?'rgba(255,255,255,.12)':'rgba(10,20,50,.16)';g.fillRect(x,y,1+rn()*3,1)}
  g.strokeStyle='rgba(240,200,120,.7)';g.lineWidth=1.5;g.setLineDash([4,3]);for(const y of[18,140]){g.beginPath();g.moveTo(0,y);g.lineTo(w,y);g.stroke()}});t.wrapS=t.wrapT=THREE.RepeatWrapping;return GT.denim=t}
/* UV по положению вершины (поза покоя) — под старые холщовые текстуры игры */
function girlUV(geo,how){if(geo.userData.uv===how)return;const p=geo.attributes.position,n=p.count,uv=new Float32Array(n*2),TAU=Math.PI*2;
 for(let i=0;i<n;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i);let u=0,v=0;
  if(how==='face'){const a=x/.9,b=(y-1.58)/1.06,c=z/.97,r=Math.hypot(a,b,c)||1;let ph=Math.atan2(c,-a);if(ph<0)ph+=TAU;u=ph/TAU;v=1-Math.acos(Math.max(-1,Math.min(1,b/r)))/Math.PI}
  else if(how==='tee'){u=.5+Math.atan2(x,z)/TAU;v=(y-1.0)/.42}
  else if(how==='plaid'){u=(.5+Math.atan2(x,z)/TAU)*1.3;v=(1.0-y)/.36}
  else if(how==='net'){const cx=Math.abs(x)>.02?Math.sign(x)*.09:0;u=(.5+Math.atan2(x-cx,z)/TAU)*1.25;v=y*2.6}
  else if(how==='denim'){u=(.5+Math.atan2(x,z)/TAU)*2.2;v=y*3}
  uv[i*2]=u;uv[i*2+1]=v}
 geo.setAttribute('uv',new THREE.BufferAttribute(uv,2));geo.userData.uv=how}
function buildGirl(o){const T_=GIRL_T[o.kind];return T_&&T_!=='load'?buildGirlM(o,T_):buildGirlP(o)}
function buildGirlM(o,TP){const S=o.scale||1,root=new THREE.Group(),J={},mats=[],alt=o.kind==='alt';const ENVO={envMap:ENV,envMapIntensity:.35};
 // суставы — по костям шаблона, без поворотов: позы из GPOSE ложатся как раньше
 const bones={};TP.traverse(b=>{if(b.isBone)bones[b.name]=b});const wp=n=>bones[n].getWorldPosition(new V3());
 const mk=n=>{if(J[n])return J[n];const b=bones[n],pn=b.parent&&b.parent.isBone?b.parent.name:null,par=pn?mk(pn):root,g=new THREE.Group();g.name='g_'+n;const p=wp(n);if(pn)p.sub(wp(pn));g.position.copy(p);par.add(g);return J[n]=g};
 for(const n in bones)mk(n);J.root=root;J.locks=[J.lockL,J.lockR];
 const MC={};const skinC=new THREE.Color(o.skin);
 const mdef=(n)=>{switch(n){
  case'skin':return{color:skinC,roughness:.5,emissive:skinC.clone().multiplyScalar(.2)};
  case'face':{const t=faceTex(o.kind,alt?'smirk':'scared');return{color:0xffffff,map:t,roughness:.55,emissive:0xffffff,emissiveMap:t,emissiveIntensity:.12}}
  case'tee':return{color:0xffffff,map:teeTex('band'),roughness:.8,uv:'tee'};
  case'leather':return{color:0x17141a,roughness:.3,metalness:.2,...ENVO,envMapIntensity:.7};
  case'plaid':return{color:0xffffff,map:plaidTex(),roughness:.75,side:THREE.DoubleSide,uv:'plaid'};
  case'tights':{const t=netTex(o.skin).clone();t.needsUpdate=true;t.repeat.set(1,1);return{color:0xffffff,map:t,roughness:.55,emissive:skinC.clone().multiplyScalar(.1),uv:'net'}}
  case'boot':return{color:0x151318,roughness:.28,metalness:.1,...ENVO,envMapIntensity:.6};
  case'sole':return{color:0x0b0b0d,roughness:.85};
  case'silver':return{color:0xd8dee6,metalness:1,roughness:.2,envMap:ENV};
  case'gold':return{color:0xf2c45a,metalness:1,roughness:.22,envMap:ENV};
  case'pinkGlow':return{color:0xff3fa4,roughness:.4,emissive:0xff3fa4,emissiveIntensity:.3};
  case'nail':return{color:0x0c0a10,roughness:.15,...ENVO};
  case'hair':return{color:0xffffff,vertexColors:true,map:strandTex(),roughness:.42,...ENVO,envMapIntensity:.3,side:THREE.DoubleSide};
  case'bando':return{color:0xff4f9a,roughness:.35,...ENVO,envMapIntensity:.5};
  case'denim':return{color:0xffffff,map:denimTex(),roughness:.85,uv:'denim'};
  case'white':return{color:0xf4f1ea,roughness:.5};
  case'strap':return{color:0xe8d2b0,roughness:.6};
  case'lens':return{color:0x1a1a22,roughness:.05,metalness:.6,envMap:ENV};
  default:return{color:0xcccccc,roughness:.6}}};
 const mget=(src,skinned)=>{const n=src.name||'x',key=n+(skinned?'#s':'');if(MC[key])return MC[key];const d=mdef(n),uv=d.uv;delete d.uv;const m=new THREE.MeshStandardMaterial(d);if(skinned)m.skinning=true;m.userData.uv=uv||(n==='face'?'face':null);mats.push(m);if(n==='face')J.faceM=m;return MC[key]=m};
 const sms=[],BN=Object.keys(bones);
 TP.traverse(m=>{if(!m.isMesh)return;const nm=(m.name||'')+'|'+(m.parent&&m.parent.name||'');
  const ga=m.geometry.attributes;if(ga.color_1&&!m.geometry.userData.c1){const c=ga.color_1,A=c.array,sc=A instanceof Uint16Array?65535:A instanceof Uint8Array?255:1,f=new Float32Array(c.count*3);for(let i=0;i<c.count;i++)for(let q=0;q<3;q++)f[i*3+q]=Math.pow(A[i*c.itemSize+q]/sc,1/2.2);m.geometry.setAttribute('color',new THREE.BufferAttribute(f,3));m.geometry.deleteAttribute('color_1');m.geometry.userData.c1=1}
  if(m.isSkinnedMesh){const mt=mget(m.material,true);if(mt.userData.uv)girlUV(m.geometry,mt.userData.uv);
   // единый скелет на все части: индексы костей переводим в общий порядок
   const geo=m.geometry;if(!geo.userData.remap){const own=m.skeleton.bones.map(b=>BN.indexOf(b.name)),si=geo.attributes.skinIndex;for(let i=0;i<si.array.length;i++)si.array[i]=Math.max(0,own[si.array[i]]);si.needsUpdate=true;geo.userData.remap=1}
   const sm=new THREE.SkinnedMesh(geo,mt);sm.castShadow=true;sm.frustumCulled=false;root.add(sm);sms.push(sm);return}
  const r=/R_([A-Za-z]+)_/.exec(nm);if(!r||!J[r[1]])return;const mt=mget(m.material,false);if(mt.userData.uv)girlUV(m.geometry,mt.userData.uv);
  const c=new THREE.Mesh(m.geometry,mt);c.castShadow=true;m.updateMatrixWorld(true);c.applyMatrix4(m.matrixWorld);c.position.sub(wp(r[1]));J[r[1]].add(c)});
 // пальцы: шаблоны T_finger/T_thumb на суставы пальцев
 const tf=TP.getObjectByName('T_finger'),tt=TP.getObjectByName('T_thumb');
 const fclone=t=>{const g=new THREE.Group();t.traverse(m=>{if(m.isMesh){const c=new THREE.Mesh(m.geometry,mget(m.material,false));c.castShadow=true;g.add(c)}});return g};
 for(const [s,n] of[[1,'l'],[-1,'r']]){const wr=J[n+'Wr'],F=J[n+'F']=[];const gp=(x,y,z)=>{const g=new THREE.Group();g.position.set(x,y,z);wr.add(g);return g};
  for(let k=0;k<4;k++){const f=gp((k-1.5)*.0175*s,-.07,0);if(tf){const c=fclone(tf);c.scale.setScalar(k===3?.82:k===0?.94:1);f.add(c)}F.push(f)}
  const th=gp(s*.033,-.03,.014);th.rotation.z=s*.5;if(tt)th.add(fclone(tt));F.push(th)}
 root.scale.setScalar(S);root.updateMatrixWorld(true);
 const SK=new THREE.Skeleton(BN.map(n=>J[n]));for(const sm of sms)sm.bind(SK,sm.matrixWorld)
 const G={g:root,J,mats,kind:o.kind,pose:'stand',ex:null,blinkT:2+Math.random()*3,bubble:null,bubT:0,t:Math.random()*9,model:1};setFace(G,alt?'smirk':'scared');return G}
const BEACH_O={kind:'beach',skin:'#f2c8a6',hair:'#e9c158',streak:null,soft:'#fff2c0',scale:1.08};
function setFace(G,ex){if(G.ex===ex)return;G.ex=ex;const t=faceTex(G.kind,ex);G.J.faceM.map=t;G.J.faceM.emissiveMap=t;G.J.faceM.needsUpdate=true}
/* плавное приведение к позе; extra — добавки поверх (качание, взмахи) */
/* анимация: пружины к позе + дыхание/перенос веса + взгляд на камеру + волосы с инерцией */
const LOOKW={stand:1,taunt:.8,point:.6,laugh:.5,cheer:.5,hold:.8,tread:.6,sulk:.35,throw:.3,aim:.2,ride:.6,rideTaunt:.7,rideAim:.2,climb:.4,jump:.2,chute:.45,dazed:0};
const IDLEW={stand:1,taunt:.7,point:.5,laugh:.6,cheer:.6,hold:.5,sulk:.8,ride:.5,rideTaunt:.5,tread:.3,aim:.3,rideAim:.3,chute:.4,climb:.2,throw:.2};
const LEGW={stand:1,taunt:1,point:1,laugh:1,cheer:.7,aim:.6,throw:.4};
const _hgq=new THREE.Quaternion(),_hgv=new V3(),_hgv2=new V3(),_hgv3=new V3();
function jspring(j,t,dt,om,ze){if(!j)return;const r=j.rotation,v=j.userData.av||(j.userData.av=new V3());
 if(dt>=.25){r.set(t[0],t[1],t[2]);v.set(0,0,0);return}if(dt<=0)return;
 const n=Math.ceil(dt/.034),h=dt/n,w2=om*om,c=2*ze*om;
 for(let i=0;i<n;i++){v.x+=(w2*(t[0]-r.x)-c*v.x)*h;v.y+=(w2*(t[1]-r.y)-c*v.y)*h;v.z+=(w2*(t[2]-r.z)-c*v.z)*h;r.x+=v.x*h;r.y+=v.y*h;r.z+=v.z*h}}
function girlPose(G,name,dt,extra){const P_=GPOSE[name]||GPOSE.stand,k=Math.min(1,dt*9),J=G.J;G.t+=dt;G.pose=name;const ex=extra||{},t=G.t;
 if(!G.model){const set=(j,v)=>{if(!j)return;const r=j.rotation;r.x+=(v[0]-r.x)*k;r.y+=(v[1]-r.y)*k;r.z+=(v[2]-r.z)*k};
  for(const n of['Sh','El','Hip','Kn']){const L=P_['l'+n]||GPOSE.stand['l'+n]||[0,0,0],R=P_['r'+n]||[L[0],-L[1],-L[2]];
   set(J['l'+n],ex['l'+n]?L.map((v,i)=>v+ex['l'+n][i]):L);set(J['r'+n],ex['r'+n]?R.map((v,i)=>v+ex['r'+n][i]):R)}
  for(const n of['spine','neck','head']){const v=P_[n]||[0,0,0],e=ex[n];set(J[n],e?v.map((x,i)=>x+e[i]):v)}
  J.back.rotation.x=Math.sin(t*1.7)*.05+(ex.hair||0);J.locks.forEach((l,i)=>{l.rotation.x=Math.sin(t*2.1+i)*.08+(ex.hair||0)*.6;l.rotation.z=Math.sin(t*1.3+i*2)*.05})}
 else{const iw=IDLEW[name]??.3,lw=LEGW[name]||0,br=Math.sin(t*2.3),sw=Math.sin(t*.8),T={};
  const add=(n,v)=>{const a=T[n];a[0]+=v[0];a[1]+=v[1];a[2]+=v[2]};
  for(const n of['Sh','El','Hip','Kn']){const L=P_['l'+n]||GPOSE.stand['l'+n]||[0,0,0],R=P_['r'+n]||[L[0],-L[1],-L[2]];T['l'+n]=L.slice();T['r'+n]=R.slice();
   if(ex['l'+n])add('l'+n,ex['l'+n]);if(ex['r'+n])add('r'+n,ex['r'+n])}
  for(const n of['spine','neck','head']){T[n]=(P_[n]||[0,0,0]).slice();if(ex[n])add(n,ex[n])}
  // дыхание, покачивание, перенос веса
  add('spine',[br*.02*iw,sw*.05*iw,sw*.025*iw]);add('neck',[-br*.012*iw,0,-sw*.015*iw]);add('head',[Math.sin(t*1.1)*.025*iw,Math.sin(t*.55)*.07*iw,Math.sin(t*.7+1)*.05*iw]);
  add('lSh',[Math.sin(t*1.3)*.02*iw,0,br*.025*iw]);add('rSh',[Math.sin(t*1.3+2)*.02*iw,0,-br*.025*iw]);add('lEl',[-Math.max(0,br)*.04*iw,0,0]);add('rEl',[-Math.max(0,br)*.04*iw,0,0]);
  if(lw){add('lHip',[0,0,sw*.035*lw]);add('rHip',[0,0,sw*.035*lw]);add('lKn',[Math.max(0,sw)*.14*lw,0,0]);add('rKn',[Math.max(0,-sw)*.14*lw,0,0]);add('lHip',[-Math.max(0,sw)*.06*lw,0,0]);add('rHip',[-Math.max(0,-sw)*.06*lw,0,0])}
  // взгляд: голова поворачивается к камере (или к G.look)
  let lw2=(LOOKW[name]??.3)*(G.lookW??1);if(dt<.25&&lw2>0&&J.spine.parent){_hgv.copy(G.look||camera.position);J.spine.worldToLocal(_hgv);_hgv.sub(J.neck.position);_hgv.y-=.17;
   let yaw=Math.atan2(_hgv.x,_hgv.z),pit=-Math.atan2(_hgv.y,Math.hypot(_hgv.x,_hgv.z));lw2*=Math.max(0,Math.min(1,(2.5-Math.abs(yaw))/.5));
   yaw=Math.max(-1.1,Math.min(1.1,yaw))*lw2;pit=Math.max(-.45,Math.min(.45,pit))*lw2;const lk=G.lk||(G.lk=[0,0]),f=Math.min(1,dt*3.5);lk[0]+=(yaw-lk[0])*f;lk[1]+=(pit-lk[1])*f}
  else if(G.lk){const f=Math.min(1,dt*3.5);G.lk[0]-=G.lk[0]*f;G.lk[1]-=G.lk[1]*f}
  if(G.lk){add('neck',[G.lk[1]*.4,G.lk[0]*.4,0]);add('head',[G.lk[1]*.6,G.lk[0]*.6,0])}
  for(const n of['lSh','rSh','lEl','rEl','lHip','rHip','lKn','rKn'])jspring(J[n],T[n],dt,12,.78);
  for(const n of['spine','neck','head'])jspring(J[n],T[n],dt,9,.82);
  hairDyn(G,dt,ex)}
 for(const [side,key] of[['l','fl'],['r','fr']]){const f=FING[P_[key]||'relax'];J[side+'F'].forEach((j,i)=>{if(i<4)j.rotation.x+=(f[i]-j.rotation.x)*k;else j.rotation.x+=(f[4]*.6-j.rotation.x)*k})}
 // моргание
 if(G.ex==='smirk'||G.ex==='scared'||G.ex==='angry'||G.ex==='blink'||G.ex==='determined'){G.blinkT-=dt;if(G.blinkT<0&&G.ex!=='blink'){G.preB=G.ex;setFace(G,'blink')}if(G.blinkT<-.12){G.blinkT=2+Math.random()*3.5;if(G.preB)setFace(G,G.preB);G.preB=null}}
 if(G.bubble){G.bubT-=dt;G.bubble.visible=G.bubT>0;if(G.bubT>0){const s=Math.min(1,(3-G.bubT)*8,G.bubT*4);G.bubble.material.opacity=Math.min(1,s);G.bubble.scale.set(G.bw*s,G.bh*s,1)}}}
function hairDyn(G,dt,ex){const J=G.J;if(dt<=0)return;
 J.hairC.getWorldPosition(_hgv);const hv=G.hv||(G.hv=new V3()),hp=G.hp||(G.hp=_hgv.clone());
 if(dt<.2){_hgv2.copy(_hgv).sub(hp).divideScalar(dt);if(_hgv2.lengthSq()>900)_hgv2.setLength(30);hv.lerp(_hgv2,Math.min(1,dt*8))}else hv.set(0,0,0);hp.copy(_hgv);
 const air=_hgv3.set(-hv.x*.1,-1-hv.y*.1,-hv.z*.1);if(ex.wind)air.add(ex.wind);const gust=Math.sin(G.t*1.9)*.04+Math.sin(G.t*3.3)*.02;
 const H=[[J.back,-.1,1.3,-.6,.6,1],[J.back2,-.2,.9,-.5,.5,.7],[J.lockL,-.9,.25,-.12,.8,.8],[J.lockR,-.9,.25,-.8,.12,.8]];
 for(const [j,x0,x1,z0,z1,gn] of H){if(!j)continue;j.parent.getWorldQuaternion(_hgq).invert();_hgv2.copy(air).applyQuaternion(_hgq).normalize();
  const tx=Math.max(x0,Math.min(x1,Math.atan2(-_hgv2.z,-_hgv2.y)*gn+gust+(ex.hair||0))),tz=Math.max(z0,Math.min(z1,Math.atan2(_hgv2.x,-_hgv2.y)*gn+gust*.5));
  jspring(j,[tx,0,tz],dt,6.5,.32)}}
function say(G,txt,dur){if(!G.bubble){G.bubble=new THREE.Sprite(new THREE.SpriteMaterial({transparent:true,depthWrite:false}));G.bubble.position.y=2.15;G.g.add(G.bubble)}
 const c=document.createElement('canvas');c.width=640;c.height=180;const g=c.getContext('2d');g.font='900 52px "Russo One",Arial';const w=Math.min(620,g.measureText(txt).width+60);
 g.fillStyle=G.kind==='alt'?'#17151b':'#fffaf0';g.strokeStyle=G.kind==='alt'?'#ff3fa4':'#ff4f9a';g.lineWidth=8;const x0=(640-w)/2;g.beginPath();g.roundRect?g.roundRect(x0,14,w,110,30):g.rect(x0,14,w,110);g.fill();g.stroke();
 g.beginPath();g.moveTo(300,122);g.lineTo(320,164);g.lineTo(344,122);g.fill();g.fillStyle=G.kind==='alt'?'#ff3fa4':'#c02a6a';g.textAlign='center';g.textBaseline='middle';g.fillText(txt,320,70,600);
 if(G.bubble.material.map)G.bubble.material.map.dispose();G.bubble.material.map=new THREE.CanvasTexture(c);G.bubble.material.needsUpdate=true;G.bw=G.kind==='alt'?2.6:3.2;G.bh=G.kind==='alt'?.73:.9;G.bubT=dur||2.6}

/* ---------- танк «ДЕНЕЖНЫЙ МЕШОК» ---------- */
function flagTex(){if(GT.flag)return GT.flag;return GT.flag=cTex(256,160,(g,w,h)=>{g.fillStyle='#111';g.fillRect(0,0,w,h);g.save();g.translate(128,74);g.scale(.5,.5);g.fillStyle='#f4f0e6';g.beginPath();g.ellipse(0,-20,62,58,0,0,7);g.fill();g.fillRect(-36,20,72,36);
 g.fillStyle='#111';for(const x of[-24,24]){g.beginPath();g.ellipse(x,-18,17,20,0,0,7);g.fill()}g.beginPath();g.moveTo(0,4);g.lineTo(-8,20);g.lineTo(8,20);g.fill();for(let x=-28;x<=28;x+=14)g.fillRect(x-2,40,4,16);
 g.fillStyle='#f4f0e6';for(const a of[.7,-.7]){g.save();g.rotate(a);g.fillRect(-120,88,240,18);for(const sx of[-120,120]){g.beginPath();g.arc(sx,90,14,0,7);g.arc(sx,104,14,0,7);g.fill()}g.restore()}
 g.fillStyle='#ff6fae';g.beginPath();g.moveTo(-20,-84);g.lineTo(-52,-104);g.lineTo(-52,-64);g.fill();g.beginPath();g.moveTo(-20,-84);g.lineTo(12,-104);g.lineTo(12,-64);g.fill();g.beginPath();g.arc(-20,-84,9,0,7);g.fill();g.restore()})}
function trackTex(){if(GT.track)return GT.track;const t=cTex(256,64,(g,w,h)=>{g.fillStyle='#1c1c20';g.fillRect(0,0,w,h);for(let x=0;x<w;x+=32){g.fillStyle='#34343a';g.fillRect(x+4,0,20,h);g.fillStyle='#4a4a52';g.fillRect(x+6,4,16,h-8);g.fillStyle='#22222a';g.fillRect(x+12,0,4,h)}});t.wrapS=THREE.RepeatWrapping;return GT.track=t}
function stadium(L,R,n){const pts=[],c=L/2-R;for(let i=0;i<=n;i++){const a=-Math.PI/2+i/n*Math.PI;pts.push([c+Math.cos(a)*R,R+Math.sin(a)*R])}for(let i=0;i<=n;i++){const a=Math.PI/2+i/n*Math.PI;pts.push([-c+Math.cos(a)*R,R+Math.sin(a)*R])}pts.push(pts[0]);return pts}
function trackBand(L,R,W){const pts=stadium(L,R,10),P=[],UV=[],N=[],I=[];let u=0;for(let i=0;i<pts.length;i++){const [z,y]=pts[i];if(i)u+=Math.hypot(z-pts[i-1][0],y-pts[i-1][1]);const nz=z-Math.sign(z)*Math.min(Math.abs(z),L/2-R),ny=y-R,nl=Math.hypot(nz,ny)||1;
  for(const x of[-W/2,W/2]){P.push(x,y,z);UV.push(u/.6,x>0?1:0);N.push(0,ny/nl,nz/nl)}if(i){const a=(i-1)*2;I.push(a,a+2,a+1,a+1,a+2,a+3)}}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(N,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(UV,2));g.setIndex(I);return g}
function buildTank(){const b=beerMats(),T={},g=new THREE.Group();T.g=g;const E={envMap:ENV};
 const camo=b.moneyT.clone();camo.needsUpdate=true;camo.repeat.set(.45,.45);const camoM=new THREE.MeshStandardMaterial({map:camo,color:0xb8d8a8,roughness:.6,metalness:.15,...E,envMapIntensity:.3});
 const dark=new THREE.MeshStandardMaterial({color:0x26282c,roughness:.5,metalness:.5,...E}),chrome=b.chrome,gold=b.gold;
 const put=(par,geo,mat,x,y,z,rx,ry,rz)=>{const m=new THREE.Mesh(geo,mat);m.position.set(x||0,y||0,z||0);m.rotation.set(rx||0,ry||0,rz||0);m.castShadow=true;par.add(m);return m};
 // гусеницы
 const tt=trackTex().clone();tt.needsUpdate=true;tt.wrapS=THREE.RepeatWrapping;const trM=new THREE.MeshStandardMaterial({map:tt,roughness:.85,metalness:.2});T.treads=tt;
 for(const s of[-1,1]){const tr=put(g,trackBand(5.4,.46,.78),trM,s*1.32,0,0);tr.material.side=THREE.DoubleSide;
  for(let i=0;i<5;i++){const z=-1.9+i*.95;put(g,new THREE.CylinderGeometry(.36,.36,.2,18),dark,s*1.42,.46,z,0,0,Math.PI/2);put(g,new THREE.CylinderGeometry(.16,.16,.22,12),chrome,s*1.43,.46,z,0,0,Math.PI/2)}
  for(const z of[2.24,-2.24]){put(g,new THREE.CylinderGeometry(.4,.4,.24,14),dark,s*1.4,.46,z,0,0,Math.PI/2);put(g,new THREE.TorusGeometry(.3,.05,6,14),gold,s*1.53,.46,z,0,Math.PI/2,0)}
  const sk=put(g,new THREE.BoxGeometry(.08,.42,5),camoM,s*1.76,.98,0);put(g,new THREE.BoxGeometry(.09,.06,5.02),new THREE.MeshBasicMaterial({color:0xff3fa4}),s*1.77,.77,0)}
 // корпус: боковой профиль, выдавленный поперёк
 const sh=new THREE.Shape();[[2.65,.5],[2.75,.82],[2.05,1.38],[-2.2,1.38],[-2.7,1.02],[-2.6,.5]].forEach(([z,y],i)=>i?sh.lineTo(z,y):sh.moveTo(z,y));
 const hg=new THREE.ExtrudeGeometry(sh,{depth:2.36,bevelEnabled:true,bevelThickness:.05,bevelSize:.05,bevelSegments:2});hg.translate(0,0,-1.18);hg.rotateY(-Math.PI/2);put(g,hg,camoM);
 put(g,new THREE.BoxGeometry(2.5,.05,.12),gold,0,1.4,2.02);for(const s of[-1,1]){put(g,new THREE.CircleGeometry(.12,16),new THREE.MeshBasicMaterial({color:0xfff2c0}),s*.85,1.12,2.42,-.9)}
 // подсветка днища
 const glow=put(g,new THREE.PlaneGeometry(3.6,5.8),new THREE.MeshBasicMaterial({color:0xff3fa4,transparent:true,opacity:.42,blending:THREE.AdditiveBlending,depthWrite:false,map:softTex?softTex('rgba(255,255,255,1)','rgba(255,255,255,0)'):null}),0,.03,0,-Math.PI/2);glow.castShadow=false;
 // корма: пачки денег и пивной бак (уязвимое место)
 for(let i=0;i<6;i++){const m=put(g,new THREE.BoxGeometry(.5,.2,.26),b.money,(i%3-1)*.55,1.5+Math.floor(i/3)*.21,-1.55);m.material=b.money}
 put(g,new THREE.BoxGeometry(1.7,.04,.3),dark,0,1.72,-1.55);
 T.keg=new THREE.Group();T.keg.position.set(0,1.62,-2.2);g.add(T.keg);put(T.keg,new THREE.CylinderGeometry(.34,.34,1.5,20),b.keg,0,0,0,0,0,Math.PI/2);
 T.kegGlowM=new THREE.MeshBasicMaterial({color:0xffb020});put(T.keg,new THREE.CylinderGeometry(.355,.355,.16,20),T.kegGlowM,0,0,0,0,0,Math.PI/2);
 for(const s of[-1,1])put(T.keg,new THREE.TorusGeometry(.35,.03,6,20),chrome,s*.6,0,0,0,Math.PI/2,0);
 for(const s of[-1,1]){put(g,new THREE.CylinderGeometry(.1,.12,.5,10),dark,s*.95,1.5,-2.35,.5);}T.exh=[new V3(-.95,1.75,-2.5),new V3(.95,1.75,-2.5)];
 // башня
 T.tur=new THREE.Group();T.tur.position.set(0,1.38,.1);g.add(T.tur);
 put(T.tur,new THREE.CylinderGeometry(1.0,1.18,.62,28),camoM,0,.31,-.1);put(T.tur,new THREE.TorusGeometry(1.0,.04,6,28),gold,0,.62,-.1,Math.PI/2);
 put(T.tur,new THREE.BoxGeometry(1.0,.52,.5),camoM,0,.3,.95);
 T.gun=new THREE.Group();T.gun.position.set(0,.33,1.15);T.tur.add(T.gun);put(T.gun,new THREE.CylinderGeometry(.11,.14,3.3,14),dark,0,0,1.65,Math.PI/2);put(T.gun,new THREE.CylinderGeometry(.17,.17,.5,14),dark,0,0,1.3,Math.PI/2);
 put(T.gun,new THREE.BoxGeometry(.36,.22,.42),dark,0,0,3.35);put(T.gun,new THREE.TorusGeometry(.15,.035,6,14),gold,0,0,3.1);T.muzzle=new THREE.Group();T.muzzle.position.set(0,0,3.6);T.gun.add(T.muzzle);
 put(T.tur,new THREE.CylinderGeometry(.035,.035,.9,8),dark,.34,.42,1.35,Math.PI/2);T.mg=new THREE.Group();T.mg.position.set(.34,.42,1.85);T.tur.add(T.mg);
 put(T.tur,new THREE.TorusGeometry(.4,.06,8,24),dark,-.05,.64,-.3,Math.PI/2);T.lid=new THREE.Group();T.lid.position.set(-.05,.66,-.72);T.tur.add(T.lid);put(T.lid,new THREE.CylinderGeometry(.4,.4,.06,20),camoM,0,0,.4);T.lid.rotation.x=-1.9;
 // антенна с флагом
 put(T.tur,new THREE.CylinderGeometry(.018,.025,2.4,6),chrome,.72,1.8,-.75);T.flag=put(T.tur,new THREE.PlaneGeometry(.9,.58,8,4).translate(.45,0,0),new THREE.MeshStandardMaterial({map:flagTex(),side:THREE.DoubleSide,roughness:.8}),.72,2.7,-.75);T.flagBase=T.flag.geometry.attributes.position.array.slice();
 // надписи
 for(const s of[-1,1]){const d=put(T.tur,new THREE.PlaneGeometry(1.3,.32),new THREE.MeshBasicMaterial({map:signTex('10/10','#ff3fa4','rgba(0,0,0,0)',512,128,'900 100px "Russo One",Arial'),transparent:true,depthWrite:false}),s*1.06,.32,-.1,0,s*Math.PI/2,0);d.castShadow=false}
 for(const s of[-1,1]){const d=put(g,new THREE.PlaneGeometry(3.2,.34),new THREE.MeshBasicMaterial({map:signTex('ДЕНЕЖНЫЙ МЕШОК','#ffe08a','rgba(0,0,0,0)',1024,110,'900 84px "Russo One",Arial'),transparent:true,depthWrite:false}),s*1.81,.98,0,0,s*Math.PI/2,0);d.castShadow=false}
 T.seat=new THREE.Group();T.seat.position.set(-.05,-.55,-.3);T.tur.add(T.seat);T.flag.userData.keep=1;
 g.traverse(o=>{if(o.isMesh&&o.material&&o.material.isMeshBasicMaterial)o.castShadow=false});mergeKids(g);return T}
/* ---------- баллистическая ракета «ЯДЕРНАЯ ЛЮБОВЬ» ---------- */
function missileTex(){if(GT.mis)return GT.mis;return GT.mis=cTex(512,1024,(g,w,h)=>{g.fillStyle='#f2efe8';g.fillRect(0,0,w,h);
 for(let y=0;y<h;y+=128){g.fillStyle='rgba(0,0,0,.06)';g.fillRect(0,y,w,3)}
 g.fillStyle='#ffcf1a';g.fillRect(0,h*.86,w,h*.08);g.fillStyle='#111';for(let x=-40;x<w;x+=56){g.beginPath();g.moveTo(x,h*.86);g.lineTo(x+28,h*.86);g.lineTo(x+56,h*.94);g.lineTo(x+28,h*.94);g.fill()}
 g.fillStyle='#ff3fa4';g.fillRect(0,h*.02,w,h*.03);
 for(const u of[.25,.75]){const cx=u*w;g.save();g.translate(cx,h*.14);g.fillStyle='#ffcf1a';g.beginPath();g.arc(0,0,54,0,7);g.fill();g.fillStyle='#111';g.beginPath();g.arc(0,0,9,0,7);g.fill();
  for(let k=0;k<3;k++){g.beginPath();g.moveTo(0,0);g.arc(0,0,48,-Math.PI/2+k*2.094-.52,-Math.PI/2+k*2.094+.52);g.closePath();g.fill()}g.fillStyle='#ffcf1a';g.beginPath();g.arc(0,0,15,0,7);g.fill();g.fillStyle='#111';g.beginPath();g.arc(0,0,9,0,7);g.fill();g.restore();
  g.save();g.translate(cx,h*.42);g.fillStyle='#ff3fa4';for(const s of[-1,1]){g.beginPath();g.moveTo(s*30,-10);g.quadraticCurveTo(s*80,-60,s*110,-20);g.quadraticCurveTo(s*90,-24,s*84,0);g.quadraticCurveTo(s*72,-10,s*62,10);g.quadraticCurveTo(s*48,0,s*30,14);g.fill()}
  g.beginPath();g.moveTo(0,40);g.bezierCurveTo(-70,-10,-40,-60,0,-24);g.bezierCurveTo(40,-60,70,-10,0,40);g.fill();g.fillStyle='#fff';g.font='900 30px "Russo One",Arial';g.textAlign='center';g.fillText('10/10',0,4);g.restore();
  g.save();g.translate(cx,h*.66);g.rotate(Math.PI/2);g.fillStyle='#17151b';g.font='900 44px "Russo One",Arial';g.textAlign='center';g.textBaseline='middle';g.fillText('ЯДЕРНАЯ ЛЮБОВЬ',0,0);g.restore()}})}
function buildMissile(){const b=beerMats(),M_={},g=new THREE.Group();M_.g=g;const E={envMap:ENV};
 const body=new THREE.MeshStandardMaterial({map:missileTex(),roughness:.35,metalness:.25,...E,envMapIntensity:.5}),pinkM=new THREE.MeshStandardMaterial({color:0xff4fa8,roughness:.3,metalness:.2,...E,envMapIntensity:.5}),dark=new THREE.MeshStandardMaterial({color:0x1d1d22,roughness:.4,metalness:.6,...E});
 const put=(par,geo,mat,x,y,z,rx,ry,rz)=>{const m=new THREE.Mesh(geo,mat);m.position.set(x||0,y||0,z||0);m.rotation.set(rx||0,ry||0,rz||0);m.castShadow=true;par.add(m);return m};
 put(g,new THREE.CylinderGeometry(.44,.44,4.4,28),body,0,0,0,Math.PI/2);
 const nose=latheG([[.44,0],[.43,.3],[.39,.65],[.31,1.0],[.2,1.3],[.08,1.55],[0,1.65]],28);put(g,nose,pinkM,0,0,2.2,Math.PI/2);put(g,new THREE.SphereGeometry(.09,10,8),dark,0,0,3.82);
 const tail=latheG([[.25,-.75],[.36,-.55],[.42,-.2],[.44,0]],24);put(g,tail,dark,0,0,-2.2,Math.PI/2);
 const fin=new THREE.Shape();fin.moveTo(0,0);fin.lineTo(.95,-.35);fin.lineTo(.95,-.95);fin.lineTo(0,-1.25);fin.closePath();const fg=new THREE.ExtrudeGeometry(fin,{depth:.05,bevelEnabled:false});fg.translate(0,0,-.025);
 for(let k=0;k<4;k++){const f=new THREE.Group();f.rotation.z=k*Math.PI/2+Math.PI/4;f.position.z=-1.25;g.add(f);put(f,fg,dark,.4,0,0,Math.PI/2,0,0);put(f,new THREE.BoxGeometry(.06,.07,1.25),pinkM,1.35,0,-.6).scale.set(1,1,.48)}
 // седло, руль
 put(g,new THREE.BoxGeometry(.36,.14,1.0),pinkM,0,.47,-.15);put(g,new THREE.TorusGeometry(.18,.035,8,16,Math.PI),b.chrome,0,.5,.75,0,0,0);
 // пламя
 M_.flame=new THREE.Group();M_.flame.position.z=-2.95;g.add(M_.flame);const fm=(c,o)=>new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:o,blending:THREE.AdditiveBlending,depthWrite:false});
 const f1=put(M_.flame,new THREE.ConeGeometry(.3,2.6,16,1,true).translate(0,-1.3,0),fm(0xff7a1a,.75),0,0,0,-Math.PI/2);const f2=put(M_.flame,new THREE.ConeGeometry(.17,1.6,12,1,true).translate(0,-.8,0),fm(0xfff2b0,.9),0,0,0,-Math.PI/2);f1.castShadow=f2.castShadow=false;M_.f1=f1;M_.f2=f2;
 M_.light={intensity:0};
 M_.seat=new THREE.Group();M_.seat.position.set(0,.53,-.32);g.add(M_.seat);M_.nozzle=new V3(0,0,-3.1);mergeKids(g);return M_}

/* ================= БОСС: АЛЬТУШКА 10/10 ================= */
const ALT_O={kind:'alt',skin:'#f3d8cb',hair:'#16141c',streak:'#ff3fa4',streakHex:0xff3fa4,scale:1.3};
const ALT_C=new V3(0,0,-77);
const LOOP=(()=>{const P=[],hx=8,z0=-90,z1=-64,R=4;const seg=(ax,az,bx,bz,n)=>{for(let i=0;i<n;i++){const k=i/n;P.push([ax+(bx-ax)*k,az+(bz-az)*k])}};
 const arc=(cx,cz,a0,n)=>{for(let i=0;i<n;i++){const a=a0+i/n*Math.PI/2;P.push([cx+Math.cos(a)*R,cz+Math.sin(a)*R])}};
 seg(hx,z0+R,hx,z1-R,18);arc(hx-R,z1-R,0,8);seg(hx-R,z1,-hx+R,z1,8);arc(-hx+R,z1-R,Math.PI/2,8);seg(-hx,z1-R,-hx,z0+R,18);arc(-hx+R,z0+R,Math.PI,8);seg(-hx+R,z0,hx-R,z0,8);arc(hx-R,z0+R,Math.PI*1.5,8);
 const S=[0];for(let i=1;i<=P.length;i++){const a=P[i-1],b=P[i%P.length];S.push(S[i-1]+Math.hypot(b[0]-a[0],b[1]-a[1]))}return{P,S,L:S[P.length]}})();
const _lp={x:0,z:0,t:0},_av=new V3(),_aw=new V3(),_ax=new V3();
function loopAt(s,o){const L=LOOP.L,S=LOOP.S,P=LOOP.P;s=((s%L)+L)%L;let lo=0,hi=P.length-1;while(lo<hi){const m=(lo+hi+1)>>1;if(S[m]<=s)lo=m;else hi=m-1}
 const a=P[lo],b=P[(lo+1)%P.length],k=(s-S[lo])/((S[lo+1]-S[lo])||1);o.x=a[0]+(b[0]-a[0])*k;o.z=a[1]+(b[1]-a[1])*k;o.t=Math.atan2(b[0]-a[0],b[1]-a[1]);return o}
function loopNear(x,z){let best=0,bd=1e9;for(let s=0;s<LOOP.L;s+=.5){loopAt(s,_lp);const d=(x-_lp.x)**2+(z-_lp.z)**2;if(d<bd){bd=d;best=s}}return best}
const angD=(a,b)=>Math.atan2(Math.sin(a-b),Math.cos(a-b));
function altCleanup(){if(!L3)return;const F=L3.altFx||{};for(const k in F)if(F[k]&&F[k].parent)F[k].parent.remove(F[k]);L3.altFx={};
 if(L3.wreck){const w=L3.wreck;if(w.g.parent)w.g.parent.remove(w.g);w.g.traverse(o=>{const i=level.indexOf(o);if(i>=0)level.splice(i,1)});const bi=boxes.indexOf(w.box);if(bi>=0)boxes.splice(bi,1);L3.wreck=null}
 if(L3.end){for(const o of[L3.end.mis,L3.end.girl&&L3.end.girl.g,L3.end.chute,L3.end.chuteFly,L3.end.chute&&L3.end.chute.userData.lines,L3.end.chuteFly&&L3.end.chuteFly.userData.lines])if(o&&o.parent)o.parent.remove(o);L3.end=null}
 for(const o of L3.orph||[])if(o.parent)o.parent.remove(o);L3.orph=[];L3.obbs=[]}
function buildAlt(g,mm,mats){altCleanup();const A={};g.userData.alt=A;
 A.tank=buildTank();g.add(A.tank.g);A.mp=new THREE.Group();g.add(A.mp);A.mis=buildMissile();A.mp.add(A.mis.g);A.mp.visible=false;
 A.girl=buildGirl(ALT_O);A.tank.seat.add(A.girl.g);setFace(A.girl,'wink');
 A.tm=[];A.tank.g.traverse(o=>{if(o.isMesh&&o.material.isMeshStandardMaterial&&o.material.map&&o.material.map.image===beerMats().moneyT.image&&o.material!==beerMats().money&&!mats.includes(o.material)){mats.push(o.material);A.tm.push(o.material)}});
 {const shared=new Set(Object.values(beerMats()).filter(v=>v&&v.isMaterial)),cl=new Map();
  A.mis.g.traverse(o=>{if(!o.isMesh||!o.material.isMeshStandardMaterial)return;let m=o.material;if(shared.has(m)){if(!cl.has(m))cl.set(m,m.clone());m=o.material=cl.get(m)}
   if(m.emissive.getHex()===0&&!mats.includes(m))mats.push(m)})}
 A.ob={x:0,z:0,yaw:0,hw:1.8,hl:2.8,top:1.42,dx:0,dz:0,dyaw:0,live:true};if(L3){L3.obbs=[A.ob];L3.alt=A}
 A.ac=-1;A.acT=0;A.vs=new V3();A.lp=null;A.taunt=0;return new THREE.MeshBasicMaterial({color:0xff3fa4})}
/* ---------- снаряды ---------- */
let _shellG=null,_bulG=null;
function altShell(from,dir){if(!_shellG){_shellG=THREE.CapsuleGeometry?new THREE.CapsuleGeometry(.16,.55,4,8):new THREE.CylinderGeometry(.16,.16,.8,8);_shellG.rotateX(Math.PI/2)}
 const m=new THREE.Mesh(_shellG,new THREE.MeshBasicMaterial({color:0xffd27a}));m.position.copy(from);m.lookAt(from.clone().add(dir));scene.add(m);
 const p={m,vel:dir.clone().multiplyScalar(40),owner:'enemy',dmg:24,pdmg:32,r:.45,t:4,kind:'shell',netId:++pnid,onDie:shellBoom};proj.push(p);return p}
function shellBoom(p){const pos=p.m.position;if(p.owner!=='enemy')return;blast(pos,3.8,0xffa040);puff(pos,50,0xffb050,11,.7,6);puff(pos,24,0x2a2020,5,1.1,-2);const v=sndV(pos.x,pos.y,pos.z);sfx('boom',.9*Math.max(.25,v));shake=Math.max(shake,.4*v);
 const pc=tmpA.set(P.pos.x,P.pos.y+.9,P.pos.z),d=pc.distanceTo(pos);if(P.alive&&d<4&&P.iT<=0){const f=1-d/4;hurt(Math.round(18*f));P.vel.add(tmpB.subVectors(pc,pos).normalize().multiplyScalar(13*f));P.vel.y+=6*f}
 if(mode==='solo'||isHost)kegsNear(pos,3.6,true)}
function altBullet(from,dir,speed,dmg){if(!_bulG){_bulG=new THREE.CylinderGeometry(.05,.05,.7,6);_bulG.rotateX(Math.PI/2)}const m=new THREE.Mesh(_bulG,new THREE.MeshBasicMaterial({color:0xffe066}));m.position.copy(from);m.lookAt(from.clone().add(dir));scene.add(m);
 const pb={m,vel:dir.clone().multiplyScalar(speed),owner:'enemy',dmg,r:.18,t:3,kind:'bullet',netId:++pnid,np:1};npMark(pb,.22);proj.push(pb)}
function kegsNear(p,r,mine){if(!L3)return;L3.kegs.forEach((k,i)=>{if(k.alive&&k.pos.distanceTo(p)<r+.5)kegBoom(i,mine)})}
const onDeck=(x,z)=>({x:THREE.MathUtils.clamp(x,-11.8,11.8),z:THREE.MathUtils.clamp(z,-94.5,-57.5)});
/* ---------- мозг ---------- */
function altGoal(e,t){let best=e.s,bc=1e9;for(let s=0;s<LOOP.L;s+=2.5){loopAt(s,_lp);const d=Math.hypot(_lp.x-t.pos.x,_lp.z-t.pos.z);let ds=s-e.s;ds-=Math.round(ds/LOOP.L)*LOOP.L;
  const c=Math.abs(d-11.5)+(d<6.5?12:0)+Math.abs(ds)*.05;if(c<bc){bc=c;best=s}}return best}
function tankFoot(x,z,yaw,o){const sx=Math.sin(yaw),cz=Math.cos(yaw);for(let i=0;i<3;i++){const k=(i-1)*1.55;o[i]=[x+sx*k,z+cz*k]}return o}
const _ft=[[0,0],[0,0],[0,0]];
function tankHits(x,z,yaw){tankFoot(x,z,yaw,_ft);if(Math.abs(x)>10.9||z>-57.6||z<-93.9)return true;
 for(const b of boxes){if(b.max.y<.3||b.min.y>1.3||b===(L3.wreck&&L3.wreck.box))continue;for(const [fx,fz] of _ft){const cx=Math.max(b.min.x,Math.min(fx,b.max.x)),cz=Math.max(b.min.z,Math.min(fz,b.max.z));if((fx-cx)**2+(fz-cz)**2<1.62*1.62)return true}}return false}
function tankCrush(e){tankFoot(e.pos.x,e.pos.z,e.hd,_ft);for(const c of L3.chairs)if(c.alive)for(const [fx,fz] of _ft)if(Math.hypot(c.x-fx,c.z-fz)<2.1){breakChair(c);if(mp())pushFx(['L',0,9,L3.chairs.indexOf(c)]);break}
 L3.kegs.forEach((k,i)=>{if(!k.alive)return;for(const [fx,fz] of _ft)if(Math.hypot(k.pos.x-fx,k.pos.z-fz)<2.1){kegBoom(i,true);damage(e,6,99,'keg');addStyle('ТАНК НА КЕГЕ',90);break}})}
function turretTrack(e,tx,ty,tz,rate,dt){const A=e.g.userData.alt,px=e.pos.x+Math.sin(e.hd)*.1,pz=e.pos.z+Math.cos(e.hd)*.1;const want=Math.atan2(tx-px,tz-pz)-e.hd;const d=angD(want,e.tyaw);e.tyaw+=Math.sign(d)*Math.min(Math.abs(d),rate*dt);
 const hd=Math.hypot(tx-px,tz-pz);e.gel=Math.max(-.12,Math.min(.4,Math.atan2(ty-(e.pos.y+1.7),hd)))}
function altAI(e,t,to,dist,dt,tg){const A=e.g.userData.alt;if(!A)return;e.stT=(e.stT||0)+dt;const tp=t.pos;
 if(!e.ph){e.ph=1;e.st='intro';e.stT=0;e.s=loopNear(e.pos.x,e.pos.z);loopAt(e.s,_lp);e.pos.set(_lp.x,0,_lp.z);e.hd=_lp.t;e.tyaw=0;e.gel=0;e.spd=0;e.dir=1;e.cdG=2.2;e.cdM=4.5;e.cdR=8;e.cdT=6.5;e.inv=true;e.r=2.5;e.cy=1.1;e.goal=e.s;e.hit=new Map()}
 const go=(st)=>{e.st=st;e.stT=0};
 if(e.ph===1){e.cdG-=dt;e.cdM-=dt;e.cdR-=dt;e.cdT-=dt;
  if(e.hp<e.maxHp*.55&&e.st!=='ram'){e.ph=2;go('trans');e.inv=true;e.tankAt=e.pos.clone();sfx('boom');shake=Math.max(shake,.4);return altTrans(e,dt)}
  const drive=(maxV)=>{e.goT=(e.goT||0)-dt;if(e.goT<=0){e.goT=.7;e.goal=altGoal(e,t)}let ds=e.goal-e.s;ds-=Math.round(ds/LOOP.L)*LOOP.L;const want=Math.abs(ds)<.8?0:Math.sign(ds)*Math.min(maxV,Math.abs(ds)*1.2+1);
   loopAt(e.s,_lp);if(want){const tan=_lp.t+(want<0?Math.PI:0),dh=angD(tan,e.hd);if(Math.abs(dh)>.45){e.spd*=1-Math.min(1,dt*5);e.hd+=Math.sign(dh)*Math.min(Math.abs(dh),1.7*dt)}else{e.hd+=dh*Math.min(1,dt*5);e.dir=Math.sign(want);e.spd+=(Math.abs(want)-e.spd)*Math.min(1,dt*2)}}
   else e.spd*=1-Math.min(1,dt*3);e.s+=e.dir*e.spd*dt;loopAt(e.s,_lp);e.pos.x=_lp.x;e.pos.z=_lp.z};
  if(e.st==='intro'){e.ac=19;turretTrack(e,tp.x,tp.y+1,tp.z,.8,dt);if(e.stT>2.4){e.inv=false;go('drive')}}
  else if(e.st==='drive'){e.ac=10;drive(5.2);turretTrack(e,tp.x,tp.y+1,tp.z,1.4,dt);
   const lt=los(_av.set(e.pos.x,e.pos.y+2.4,e.pos.z),_aw.set(tp.x,tp.y+1.2,tp.z));
   if(dist<7.5&&e.cdR<=0){go('ramW');ring(new V3(e.pos.x,.1,e.pos.z),4,0xff3fa4);sfx('charge',.8)}
   else if(e.cdG<=0&&lt&&e.stT>.6)go('aim');else if(e.cdM<=0&&lt&&dist<26&&e.stT>.4)go('mg');else if(e.cdT<=0&&dist>7)go('throw')}
  else if(e.st==='aim'){e.ac=11;e.wind=1;drive(1.8);turretTrack(e,tp.x,tp.y+1,tp.z,1.05,dt);if(e.stT>1.15){e.wind=0;const mz=A.tank.muzzle.getWorldPosition(new V3()),d=A.tank.muzzle.getWorldDirection(new V3());altShell(mz,d);sfx('boom',.8);sfx('shot',.6);shake=Math.max(shake,.15*sndV(mz.x,mz.y,mz.z)+.05);puff(mz,30,0xffd27a,8,.4,-2);A.kick=.35;if(mp())pushFx(['A',0,6,0]);e.cdG=rnd(3.4,4.6);go('drive')}}
  else if(e.st==='mg'){e.ac=13;drive(3.5);turretTrack(e,tp.x,tp.y+1,tp.z,2.3,dt);e.mgT=(e.mgT||0)-dt;if(e.mgT<=0&&e.stT>.15){e.mgT=.085;const mz=A.tank.mg.getWorldPosition(new V3()),lead=t.vel.clone().multiplyScalar(mz.distanceTo(tp)/44*.7),d=new V3(tp.x+lead.x,tp.y+1.1,tp.z+lead.z).sub(mz).normalize();altBullet(mz,spread(d,.04),44,5);if(Math.random()<.5)sfx('rev',.25)}
   if(e.stT>1){e.cdM=rnd(2.2,3.2);go('drive')}}
  else if(e.st==='throw'){e.ac=17;drive(4);turretTrack(e,tp.x,tp.y+1,tp.z,1.4,dt);if(!e.thr&&e.stT>.45){e.thr=1;const from=A.girl.J.rWr.getWorldPosition(new V3()),q=onDeck(tp.x+t.vel.x*.9,tp.z+t.vel.z*.9);const pr=lobShot(from,new V3(q.x,groundAt(q.x,q.z,4),q.z),1.2,16,.4,0xc8661a,'bomb');sfx('throw')}
   if(e.stT>.9){e.thr=0;e.cdT=rnd(6,8.5);go('drive')}}
  else if(e.st==='ramW'){e.ac=14;e.spd*=1-Math.min(1,dt*6);const want=Math.atan2(tp.x-e.pos.x,tp.z-e.pos.z),dh=angD(want,e.hd);e.hd+=Math.sign(dh)*Math.min(Math.abs(dh),2.6*dt);turretTrack(e,tp.x,tp.y+1,tp.z,2,dt);
   if(e.stT>.9){go('ram');e.ramHit=new Set();sfx('dash');banner('ТАРАН!')}}
  else if(e.st==='ram'){e.ac=15;const sp=15,nx=e.pos.x+Math.sin(e.hd)*sp*dt,nz=e.pos.z+Math.cos(e.hd)*sp*dt;turretTrack(e,tp.x,tp.y+1,tp.z,2,dt);
   if(tankHits(nx,nz,e.hd)){go('stuck');sfx('slam');sfx('boom',.5);shake=Math.max(shake,.35*sndV(e.pos.x,1,e.pos.z));puff(new V3(nx+Math.sin(e.hd)*2.4,.8,nz+Math.cos(e.hd)*2.4),40,0xf2efe8,8,.6);banner('ТАНК ЗАСТРЯЛ! БЕЙ ПО ПИВНОМУ БАКУ');if(mp())pushFx(['A',0,7,0])}
   else{e.pos.x=nx;e.pos.z=nz;tankCrush(e);for(const c of tg){if(e.ramHit.has(c))continue;const lx=c.pos.x-e.pos.x,lz=c.pos.z-e.pos.z,fx=lx*Math.cos(e.hd)-lz*Math.sin(e.hd),fz=lx*Math.sin(e.hd)+lz*Math.cos(e.hd);
     if(Math.abs(fx)<2.2&&fz>-3&&fz<3.4&&c.pos.y<2.2){e.ramHit.add(c);hitTarget(c,30,new V3(Math.sin(e.hd)*20,9,Math.cos(e.hd)*20));shake=Math.max(shake,.35)}}
    if(e.stT>1.35)go('ret')}}
  else if(e.st==='stuck'){e.ac=16;turretTrack(e,tp.x,tp.y+1,tp.z,.6,dt);if(e.stT>1.6)go('ret')}
  else if(e.st==='ret'){e.ac=10;if(e.stT<dt*1.5){e.rs=loopNear(e.pos.x,e.pos.z)}loopAt(e.rs,_lp);const dx=_lp.x-e.pos.x,dz=_lp.z-e.pos.z,dd=Math.hypot(dx,dz);turretTrack(e,tp.x,tp.y+1,tp.z,1.4,dt);
   if(dd<.4||e.stT>4){e.s=e.rs;e.spd=0;e.cdR=rnd(7.5,10);go('drive')}else{const want=Math.atan2(dx,dz),rev=Math.abs(angD(want,e.hd))>Math.PI/2,hw=rev?want+Math.PI:want,dh=angD(hw,e.hd);e.hd+=Math.sign(dh)*Math.min(Math.abs(dh),1.8*dt);
    if(Math.abs(dh)<.5){const v=Math.min(5,dd*2+1)*dt;e.pos.x+=dx/dd*v;e.pos.z+=dz/dd*v;tankCrush(e)}}}
  if(e.st!=='ram'){// давит игроков при езде
   for(const c of tg){const lx=c.pos.x-e.pos.x,lz=c.pos.z-e.pos.z,fx=lx*Math.cos(e.hd)-lz*Math.sin(e.hd),fz=lx*Math.sin(e.hd)+lz*Math.cos(e.hd);if(Math.abs(fx)<2.05&&Math.abs(fz)<3.05&&c.pos.y<1.2&&e.spd>2.5&&T-(e.hit.get(c.local?'me':c.peer)||-9)>.8){e.hit.set(c.local?'me':c.peer,T);hitTarget(c,8,new V3(Math.sin(e.hd)*e.dir*9,5,Math.cos(e.hd)*e.dir*9))}}}
  e.g.rotation.y=e.hd;e.pos.y=0;return}
 if(e.ph===2)return altTrans(e,dt);
 // ---------- фаза ракеты ----------
 e.fT=(e.fT||0)+dt;e.vel=e.vel||new V3();const C=ALT_C;e.cdU-=dt;e.cdB-=dt;e.cdR-=dt;const low=e.hp<e.maxHp*.3;if(low)e.cdN-=dt;
 const steer=(x,y,z,maxV,acc)=>{_av.set((x-e.pos.x)*1.5,(y-e.pos.y)*1.5,(z-e.pos.z)*1.5).clampLength(0,maxV);e.vel.lerp(_av,Math.min(1,dt*acc))};
 const orbit=(spd)=>{const R=16+5*Math.sin(e.fT*.23),h=10+3*Math.sin(e.fT*.37+1);e.th+=e.fdir*spd/R*dt;steer(C.x+Math.sin(e.th)*R,h,C.z+Math.cos(e.th)*R,spd+4,2.2)};
 const lt=()=>los(_av.set(e.pos.x,e.pos.y,e.pos.z),_aw.set(tp.x,tp.y+1.2,tp.z));
 if(e.st==='fly'){e.ac=30;orbit(15);if(Math.random()<dt*.06)e.fdir*=-1;
  if(low&&e.cdN<=0){go('nukeUp');banner('ОНА НАБИРАЕТ ВЫСОТУ…');sfx('jet',.8)}
  else if(e.cdR<=0&&dist<28&&e.stT>.8){go('ramW');ring(e.pos.clone(),3.4,0xff3fa4);sfx('charge',.9);banner('ТАРАН! БЕЙ В ОТВЕТ (F)')}
  else if(e.cdB<=0&&e.stT>.5){go('bombs')}else if(e.cdU<=0&&e.stT>.4&&lt())go('uzi')}
 else if(e.st==='uzi'){e.ac=31;orbit(11);e.uT=(e.uT||0)-dt;if(e.uT<=0&&e.stT>.25){e.uT=.08;const mz=A.girl.J.rWr.getWorldPosition(new V3()),lead=t.vel.clone().multiplyScalar(mz.distanceTo(tp)/42*.6),d=new V3(tp.x+lead.x,tp.y+1.1,tp.z+lead.z).sub(mz).normalize();altBullet(mz,spread(d,.06),42,5);if(Math.random()<.6)sfx('rev',.22)}
  if(e.stT>1.15){e.cdU=rnd(2.3,3.3);go('fly')}}
 else if(e.st==='bombs'){e.ac=32;orbit(12);if(!e.thr&&e.stT>.25){e.thr=1;const from=e.pos.clone();for(const c of tg)for(let i=0;i<(c.local?4:3);i++){const a=Math.random()*6.28,r=i?rnd(1.5,4.5):rnd(0,1),q=onDeck(c.pos.x+c.vel.x*1.1+Math.sin(a)*r,c.pos.z+c.vel.z*1.1+Math.cos(a)*r);npMark(lobShot(from,new V3(q.x,groundAt(q.x,q.z,4),q.z),rnd(1.1,1.6),14,.38,0xff4fa8,'bomb'),.7)}sfx('throw')}
  if(e.stT>.7){e.thr=0;e.cdB=rnd(6,8);go('fly')}}
 else if(e.st==='ramW'){e.ac=33;e.vel.multiplyScalar(1-Math.min(1,dt*3));e.vel.y+=(Math.max(4,tp.y+4)-e.pos.y)*dt*2;if(e.stT>1){go('ram');const lead=t.vel.clone().multiplyScalar(.25);e.rdir=new V3(tp.x+lead.x,tp.y+1,tp.z+lead.z).sub(e.pos).normalize();e.ramHit=new Set();sfx('rocket',1);sfx('dash')}}
 else if(e.st==='ram'){e.ac=34;e.vel.copy(e.rdir).multiplyScalar(30);
  for(const c of tg){if(e.ramHit.has(c))continue;if(e.pos.distanceTo(_av.set(c.pos.x,c.pos.y+1,c.pos.z))<2.4){e.ramHit.add(c);hitTarget(c,30,e.rdir.clone().multiplyScalar(20).setY(8));shake=Math.max(shake,.4)}}
  const past=_av.set(tp.x,tp.y+1,tp.z).sub(e.pos).dot(e.rdir)<-4;if(e.stT>1.6||past||e.pos.y<1.4||inBox(e.pos)||e.ramHit.size){e.vel.set(e.rdir.x*12,11,e.rdir.z*12);e.cdR=rnd(7,9.5);go('fly')}}
 else if(e.st==='daze'){e.ac=35;e.vel.multiplyScalar(1-Math.min(1,dt*1.6));e.vel.y+=(3.4-e.pos.y)*dt*3;if(e.stT>3.4){e.vel.y=8;e.cdR=rnd(6,8);go('fly')}}
 else if(e.st==='nukeUp'){e.ac=36;steer(0,30,-76,20,2.5);if(e.stT>2.4||e.pos.distanceTo(_av.set(0,30,-76))<3){go('nukeAim');e.nk=onDeck(tp.x,tp.z);banner('ЯДЕРНОЕ ПИКЕ! УХОДИ ИЗ КРУГА');sfx('siren',1)}}
 else if(e.st==='nukeAim'){e.ac=37;const q=onDeck(tp.x,tp.z),dx=q.x-e.nk.x,dz=q.z-e.nk.z,dd=Math.hypot(dx,dz),v=Math.min(dd,3.4*dt);if(dd>.01){e.nk.x+=dx/dd*v;e.nk.z+=dz/dd*v}
  steer(e.nk.x,30,e.nk.z,20,4);if(e.stT%0.9<dt)sfx('siren',.9);if(e.stT>2.7){go('nukeDive');e.vel.set(0,-46,0);e.pos.x=e.nk.x;e.pos.z=e.nk.z}}
 else if(e.st==='nukeDive'){e.ac=38;e.vel.set(0,-46,0);if(e.pos.y<=1.2){e.pos.y=1.2;nukeBoom(e.pos.x,e.pos.z,true,tg);go('rec');e.vel.set(0,13,0);e.cdN=rnd(19,24)}}
 else if(e.st==='rec'){e.ac=30;e.vel.y*=1-Math.min(1,dt*.8);e.vel.x*=.95;e.vel.z*=.95;if(e.stT>1.6)go('fly')}
 e.pos.addScaledVector(e.vel,dt);e.pos.y=Math.max(e.st==='nukeDive'?1.2:2.2,Math.min(34,e.pos.y));
 if(e.vel.lengthSq()>1)e.g.rotation.y=e.st==='nukeAim'||e.st==='nukeUp'?e.g.rotation.y:Math.atan2(e.vel.x,e.vel.z)}
function altTrans(e,dt){e.ac=20;const t=e.stT;if(t<.6){e.pos.copy(e.tankAt);return}
 if(!e.mOn){e.mOn=1;e.pos.set(0,-5.5,-75);e.g.rotation.y=Math.PI}
 if(t<2.2){const k=Math.min(1,(t-.6)/1.6);e.pos.y=-5.5+10*(1-Math.pow(1-k,3))}
 else if(t<3.2){e.pos.y=4.5+Math.sin((t-2.2)*6)*.08}
 else if(t<4.3){const k=(t-3.2)/1.1;e.pos.y=4.5+k*k*6;e.pos.z=-75-k*k*6}
 else{e.ph=3;e.st='fly';e.stT=0;e.inv=false;e.r=1.9;e.cy=0;e.vel=new V3(0,3,-10);e.th=Math.atan2(e.pos.x-ALT_C.x,e.pos.z-ALT_C.z);e.fdir=1;e.cdU=1.5;e.cdB=4;e.cdR=6;e.cdN=3;e.ac=30}}
function nukeBoom(x,z,host,tg){const p=new V3(x,1,z);blast(p,9,0xffe066);blast(p,6,0xff3fa4);ring(new V3(x,.15,z),11,0xffcf1a);ring(new V3(x,.2,z),7,0xff3fa4);puff(p,160,0xfff2c8,18,1.3,4);puff(p,80,0xff4fa8,14,1.2,6);puff(p,60,0x2a2020,8,1.6,-3);
 sfx('boom',1);sfx('slam',1);shake=Math.max(shake,.85*Math.max(.3,sndV(x,1,z)));freeze=Math.max(freeze,.08);
 if(host){if(mp())pushFx(['A',0,3,r1(x),r1(z)]);for(const c of tg){const d=Math.hypot(c.pos.x-x,c.pos.z-z);if(d<8&&!(!los(_av.set(x,2.5,z),_aw.set(c.pos.x,c.pos.y+1.2,c.pos.z))&&d>3)){const f=1-d/9;hitTarget(c,Math.round(18+38*f),new V3(c.pos.x-x,0,c.pos.z-z).normalize().multiplyScalar(18*f).setY(10*f))}}
  kegsNear(p,8,true);for(const c of L3.chairs)if(c.alive&&Math.hypot(c.x-x,c.z-z)<8)breakChair(c)}}
function altParry(e){e.st='daze';e.stT=0;e.vel.copy(aim).multiplyScalar(14).setY(5);damage(e,14,1,'parry');heal(40);addStyle('ОТБИЛ РАКЕТУ',250);parryOk();banner('РАКЕТА ОТБИТА! АЛЬТУШКА ОГЛУШЕНА');shake=Math.max(shake,.4)}
function altDmgK(e){return e.st==='daze'?1.6:e.st==='stuck'?1.5:1}
function altFloor(e){return(e.ph||1)<3?e.maxHp*.5:0}
/* слабое место: пивной бак танка / сопло ракеты */
function altWeak(e,o,dir){const A=e.g.userData.alt;if(!A)return false;if((e.ph||1)===1){A.tank.keg.getWorldPosition(_wh);return raySphere(o,dir,_wh,.75)!==null}
 if(e.ph===3){A.mis.g.localToWorld(_wh.copy(A.mis.nozzle));return raySphere(o,dir,_wh,.8)!==null}return false}
/* ---------- внешний вид (у всех, по коду состояния) ---------- */
const ALT_SAY={19:['ПРИВЕТ, НЕУДАЧНИК','wink'],14:['С ДОРОГИ!','angry'],16:['ЭЙ! ЭТО МОЙ БАК!','angry'],20:['НУ ВСЁ, ДЕРЖИСЬ!','angry'],33:['ЛОВИ ПОЦЕЛУЙЧИК!','wink'],35:['АЙ… ЗВЁЗДОЧКИ…','dizzy'],36:['БАБАХ ЛЮБВИ!','laugh']};
function altOnAc(e,A,ac){const s=ALT_SAY[ac];if(s){say(A.girl,s[0],2.4);setFace(A.girl,s[1])}else if(ac===10||ac===30)setFace(A.girl,Math.random()<.5?'smirk':'wink');else if(ac===11||ac===31)setFace(A.girl,'smirk');else if(ac===13)setFace(A.girl,'laugh');
 if(ac===20){A.tr=0}if(ac===37&&!(L3.altFx&&L3.altFx.nuke))altNukeMark(e);if(ac===35)sfx('ding',.8)}
function altNukeMark(e){const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d');g.strokeStyle='#ffcf1a';g.lineWidth=14;g.beginPath();g.arc(128,128,118,0,7);g.stroke();g.fillStyle='rgba(255,207,26,.22)';g.fill();
 g.fillStyle='#ffcf1a';for(let k=0;k<3;k++){g.beginPath();g.moveTo(128,128);g.arc(128,128,80,-Math.PI/2+k*2.094-.5,-Math.PI/2+k*2.094+.5);g.closePath();g.fill()}g.fillStyle='#111';g.beginPath();g.arc(128,128,22,0,7);g.fill();
 const m=new THREE.Mesh(new THREE.PlaneGeometry(16,16).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c),transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));m.position.set(e.pos.x,.08,e.pos.z);m.renderOrder=3;scene.add(m);L3.altFx.nuke=m}
function altAnim(e,dt){const A=e.g.userData.alt;if(!A||!L3)return;const ac=e.ac||10,ph=Math.floor(ac/10)||1;if(ph>=2&&A.tm)for(const m of A.tm)m.emissive.setHex(0);if(L3.hatch)L3.hatch.want=ph===2&&A.acT>.2&&A.acT<4.5?1:0;if(ac!==A.ac){A.ac=ac;A.acT=0;altOnAc(e,A,ac)}A.acT+=dt;const T_=A.tank,G=A.girl;L3.altFx=L3.altFx||{};
 // оценка скорости по смещению (одинаково у хоста и клиентов)
 if(A.lp){_av.subVectors(e.pos,A.lp).divideScalar(Math.max(dt,1e-3));if(_av.lengthSq()<4000)A.vs.lerp(_av,Math.min(1,dt*6))}else A.lp=new V3();A.lp.copy(e.pos);
 const near=()=>{let b=null,bd=1e9;for(const c of targets()){const d=Math.hypot(c.pos.x-e.pos.x,c.pos.z-e.pos.z);if(d<bd){bd=d;b=c}}return b};
 if(ph===1||(ph===2&&!A.wreck)){
  const ob=A.ob,ny=e.g.rotation.y;ob.dx=e.pos.x-ob.x;ob.dz=e.pos.z-ob.z;ob.dyaw=angD(ny,ob.yaw);ob.x=e.pos.x;ob.z=e.pos.z;ob.yaw=ny;
  const fw=Math.sin(ny)*ob.dx+Math.cos(ny)*ob.dz,turn=ob.dyaw;T_.treads.offset.x-=fw*.9;
  if(e.remote){const c=near();if(c){const want=Math.atan2(c.pos.x-e.pos.x,c.pos.z-e.pos.z)-ny,d=angD(want,T_.tur.rotation.y);T_.tur.rotation.y+=Math.sign(d)*Math.min(Math.abs(d),1.6*dt)}}else{T_.tur.rotation.y=e.tyaw;T_.gun.rotation.x=-(e.gel||0)}
  A.kick=Math.max(0,(A.kick||0)-dt);T_.gun.position.z=1.15-A.kick*.9;
  T_.kegGlowM.color.setHex(ac===16?(Math.sin(A.acT*24)>0?0xffffff:0xff3a1a):0xffb020);
  if(ac===16&&Math.random()<dt*20){T_.keg.getWorldPosition(_aw);puff(_aw,2,0xffffff,3,.4,-2)}
  {const ex=ac===14||ac===15?.9:Math.abs(fw)>.01?.35:.12;if(Math.random()<dt*30*ex)for(const p of T_.exh){_aw.copy(p).applyMatrix4(T_.g.matrixWorld);puff(_aw,1,ac===15?0x2a2a2a:0x8a8a8a,1.2,.8,-3)}}
  {const pa=T_.flag.geometry.attributes.position,b=T_.flagBase;for(let i=0;i<pa.count;i++){const x=b[i*3];pa.setZ(i,Math.sin(e.t2=(e.t2||0)+0)*0+Math.sin(T*7-x*5)*.08*x)}pa.needsUpdate=true}
  // лазерный прицел
  let lz=L3.altFx.laser;if(ac===11){if(!lz){lz=new THREE.Group();const c=new THREE.Mesh(new THREE.CylinderGeometry(.018,.018,1,6).translate(0,.5,0),new THREE.MeshBasicMaterial({color:0xff2040,transparent:true,opacity:.85,blending:THREE.AdditiveBlending,depthWrite:false}));lz.add(c);
    const d=new THREE.Mesh(new THREE.SphereGeometry(.09,10,8),new THREE.MeshBasicMaterial({color:0xff4060,transparent:true,opacity:.9,blending:THREE.AdditiveBlending,depthWrite:false}));lz.add(d);lz.userData={c,d};scene.add(lz);L3.altFx.laser=lz}
   lz.visible=true;T_.g.updateMatrixWorld(true);const o=T_.muzzle.getWorldPosition(_aw),dir=T_.muzzle.getWorldDirection(_ax);ray.set(o,dir);ray.far=70;const h=ray.intersectObjects(level,false);let L=h.length?h[0].distance:70;
   const pt=raySphere(o,dir,_av.set(P.pos.x,P.pos.y+1,P.pos.z),.55);if(pt!==null&&pt<L)L=Math.max(.5,pt-1.2);lz.position.copy(o);lz.quaternion.setFromUnitVectors(UPV,dir);lz.userData.c.scale.y=L;lz.userData.d.position.y=L;const fl=A.acT>.75?(Math.sin(A.acT*40)>0?1:.3):.85;lz.userData.c.material.opacity=fl;lz.userData.d.scale.setScalar(.8+Math.sin(A.acT*30)*.3)}
  else if(lz)lz.visible=false;
  const hp=ac===11?'point':ac===17?'throw':ac===13||ac===16?'laugh':ac===14||ac===15?'taunt':ac===19?'taunt':((A.taunt+=dt)%6<3?'laugh':'taunt');girlPose(G,hp,dt);
  if(ph===2&&A.acT>=.55)altDetach(e,A)}
 if(ph===2&&A.wreck){const t=A.acT;A.mp.visible=t>.62;A.mp.rotation.set(t<3.2?-Math.PI/2:-Math.PI/2*(1-Math.min(1,(t-3.2)/.8)),0,0);altMisFx(A,t<3.2?.35:1,dt);
  if(t>.62&&t<2.4&&Math.random()<dt*40)puff(new V3(rnd(-2.5,2.5),0,-75+rnd(-3,3)),4,0xfff6e2,8,.9,7);
  if(t>2.2&&!A.jump){A.jump={from:G.g.getWorldPosition(new V3()),t:0};scene.attach(G.g);L3.orph.push(G.g);girlPose(G,'jump',1);setFace(G,'laugh');sfx('throw')}
  if(A.jump&&!A.jump.done){const j=A.jump;j.t+=dt;const k=Math.min(1,j.t/.85);A.mis.seat.updateMatrixWorld(true);const to=A.mis.seat.getWorldPosition(_aw);_av.lerpVectors(j.from,to,k);_av.y+=Math.sin(k*Math.PI)*3.2-1.21*k;G.g.position.copy(_av);G.g.rotation.y=Math.PI;girlPose(G,'jump',dt);
   if(k>=1){j.done=1;A.mis.seat.add(G.g);G.g.position.set(0,-.93*1.3,0);G.g.rotation.set(0,0,0);const i=L3.orph.indexOf(G.g);if(i>=0)L3.orph.splice(i,1)}}
  else if(A.jump)girlPose(G,'rideTaunt',dt)}
 if(ph===3){A.mp.visible=true;if(A.wreck&&!A.jump)altSnapRide(A);const v=A.vs,hs=Math.hypot(v.x,v.z);let pitch=-Math.atan2(v.y,Math.max(hs,.1)),roll=0;
  if(ac===36||ac===37){pitch=ac===37?Math.PI/2:pitch;}else if(ac===38)pitch=Math.PI/2*.98;
  {const yaw=e.g.rotation.y,dy=angD(yaw,A.yaw0??yaw);A.yaw0=yaw;roll=THREE.MathUtils.clamp(-dy/Math.max(dt,1e-3)*.22,-.7,.7)}
  if(ac===35){A.mp.rotation.x+=dt*0;A.spin=(A.spin||0)+dt*9;A.mp.rotation.set(Math.sin(A.spin*.7)*.3,0,A.spin)}
  else{const k=Math.min(1,dt*4);A.mp.rotation.x+=(pitch-A.mp.rotation.x)*k;A.mp.rotation.z+=(roll-A.mp.rotation.z)*k;A.spin=0}
  altMisFx(A,ac===34||ac===38?1.6:ac===35?.15:1,dt);
  const gp=ac===31?'rideAim':ac===35?'dazed':ac===33||ac===36?'rideTaunt':ac===32?'rideTaunt':((A.taunt+=dt)%7<2?'rideTaunt':'ride');girlPose(G,gp,dt);
  if(ac===35&&Math.random()<dt*10){G.J.head.getWorldPosition(_aw);_aw.y+=.5;puff(_aw,1,0xffe066,1.5,.5,-1)}
  const nk=L3.altFx.nuke;if(nk){if(ac===37||ac===38){nk.visible=true;nk.position.x+=(e.pos.x-nk.position.x)*Math.min(1,dt*6);nk.position.z+=(e.pos.z-nk.position.z)*Math.min(1,dt*6);nk.material.opacity=.55+.45*Math.sin(T*14);nk.rotation.y+=dt*1.5}else{scene.remove(nk);L3.altFx.nuke=null}}}
 // спецэффекты фазы
 G.g.visible=true}
function altMisFx(A,k,dt){const M_=A.mis,f=.8+Math.random()*.4;M_.flame.scale.set(k*f,k*f,k*(.8+Math.random()*.5));M_.light.intensity=k*2.2*f;if(L3&&L3.misL){M_.g.localToWorld(L3.misL.position.set(0,0,-3.6));L3.misL.intensity=Math.max(L3.misL.intensity,k*2.2*f)}if(Math.random()<dt*40*k){M_.g.localToWorld(_aw.set(0,0,-3.4));puff(_aw,2,Math.random()<.5?0xffa040:0xfff2c8,2.5*k,.45,-2)}}
function altDetach(e,A){if(A.wreck)return;const w=A.tank.g;mapGroup.attach(w);A.wreck=w;const ob={x:A.ob.x,z:A.ob.z,yaw:A.ob.yaw,hw:1.8,hl:2.8,top:1.42,dx:0,dz:0,dyaw:0,live:false};L3.obbs=[ob];
 const box={min:new V3(ob.x-1.5,0,ob.z-1.5),max:new V3(ob.x+1.5,1.4,ob.z+1.5)};boxes.push(box);w.traverse(o=>{if(o.isMesh)level.push(o)});L3.wreck={g:w,box,ob,t:0};
 A.tank.kegGlowM.color.setHex(0x3a2a20);blast(new V3(ob.x,1.5,ob.z),5,0xffa040);puff(new V3(ob.x,1.5,ob.z),90,0x2a2020,9,1.4,-3);sfx('boom',1);
 // девушку держим в башне до прыжка
 }
function altSnapRide(A){const G=A.girl;if(G.g.parent!==A.mis.seat){A.mis.seat.add(G.g);G.g.position.set(0,-.93*1.3,0);G.g.rotation.set(0,0,0)}A.jump={done:1}}
function altDeath(e){const A=e.g.userData.alt;if(!A||!L3)return;altCleanupFx();const G=A.girl;e.g.updateMatrixWorld(true);
 mapGroup.attach(A.mp);const end={mis:A.mp,girl:G,t:0,v:new V3(A.vs.x*.5,6,A.vs.z*.5),spin:0,chute:null};
 mapGroup.attach(G.g);L3.end=end;end.gv=new V3(A.vs.x*.25,11,A.vs.z*.25);end.v.set(A.vs.x*.6,2,A.vs.z*.6);girlPose(G,'jump',1);setFace(G,'dizzy');sfx('jet');shake=Math.max(shake,.35);puff(G.g.position,40,0xfff0f8,8,.6,6);
 if(A.wreck)A.wreck=null;banner('АЛЬТУШКА ПОВЕРЖЕНА!');sfx('frag')}
/* эпичный взрыв ракеты «Ядерная любовь»: серия огненных шаров, ударная волна, обломки, розовый гриб */
function missileBoom(E,p){const B=E.boom={t:0,p:p.clone(),q:[],deb:[],fx:[]};sfx('boom',1);sfx('frag',.8);shake=Math.max(shake,.9);blast(p,7,0xfff0c0);puff(p,140,0xffb040,16,1.2,4);puff(p,80,0xff5aa8,13,1.4,2);puff(p,60,0x2a2020,8,2.2,-2);
 for(let i=0;i<6;i++)B.q.push({t:.08+i*.11,p:p.clone().add(new V3(rnd(-3.5,3.5),rnd(-1.5,3),rnd(-3.5,3.5))),r:rnd(3,5),c:[0xffd070,0xff7a3a,0xff5aa8][i%3]});
 const sw=new THREE.Mesh(new THREE.RingGeometry(.85,1,64),new THREE.MeshBasicMaterial({color:0xfff0d0,transparent:true,side:THREE.DoubleSide,depthWrite:false,blending:THREE.AdditiveBlending}));sw.rotation.x=-Math.PI/2;sw.position.copy(p);mapGroup.add(sw);B.fx.push({m:sw,k:'ring'});
 const sh=new THREE.Mesh(new THREE.SphereGeometry(1,24,16),new THREE.MeshBasicMaterial({color:0xffc0e0,transparent:true,opacity:.5,depthWrite:false,blending:THREE.AdditiveBlending}));sh.position.copy(p);mapGroup.add(sh);B.fx.push({m:sh,k:'shell'});
 const cap=new THREE.Mesh(new THREE.SphereGeometry(1,20,12),new THREE.MeshStandardMaterial({color:0xff8cc8,emissive:0xff3a80,emissiveIntensity:.7,transparent:true,opacity:.72,depthWrite:false,roughness:1}));cap.position.copy(p);cap.scale.set(1,.6,1);mapGroup.add(cap);B.fx.push({m:cap,k:'cap'});
 const stem=new THREE.Mesh(new THREE.CylinderGeometry(.7,1.3,1,16,1,true).translate(0,-.5,0),new THREE.MeshStandardMaterial({color:0xffa0d0,emissive:0xff5a90,emissiveIntensity:.6,transparent:true,opacity:.7,depthWrite:false,side:THREE.DoubleSide}));stem.position.copy(p);mapGroup.add(stem);B.fx.push({m:stem,k:'stem'});
 const dm=[new THREE.MeshStandardMaterial({color:0xff4fa8,roughness:.4}),new THREE.MeshStandardMaterial({color:0x26262c,metalness:.6,roughness:.4}),new THREE.MeshStandardMaterial({color:0xe8e2d8,roughness:.5})];
 for(let i=0;i<14;i++){const g=i%3===0?new THREE.ConeGeometry(.25,.6,6):i%3===1?new THREE.BoxGeometry(.6,.05,.5):new THREE.CylinderGeometry(.22,.22,.5,8);const d=new THREE.Mesh(g,dm[i%3]);d.position.copy(p);mapGroup.add(d);
  B.deb.push({m:d,v:new V3(rnd(-1,1),rnd(.2,1.2),rnd(-1,1)).normalize().multiplyScalar(rnd(12,24)),w:new V3(rnd(-9,9),rnd(-9,9),rnd(-9,9))})}
 banner('ЯДЕРНАЯ ЛЮБОВЬ — БУМ!')}
function updBoom(E,dt){const B=E.boom;if(!B)return;B.t+=dt;const t=B.t;
 for(const q of B.q)if(!q.done&&t>=q.t){q.done=1;blast(q.p,q.r,q.c);puff(q.p,50,q.c,10,.9,3);sfx('boom',.5)}
 for(const f of B.fx){const m=f.m;if(!m.parent)continue;
  if(f.k==='ring'){const r=2+t*38;m.scale.setScalar(r);m.material.opacity=Math.max(0,1-t/1.1);if(t>1.1)m.parent.remove(m)}
  else if(f.k==='shell'){const r=1+t*22;m.scale.setScalar(r);m.material.opacity=Math.max(0,.5-t*.8);if(t>.7)m.parent.remove(m)}
  else if(f.k==='cap'){const g=Math.min(1,t/1.2),r=1.6+g*4.6;m.scale.set(r,r*.6,r);m.position.y=B.p.y+g*9+t*.6;m.material.opacity=.72*Math.max(0,1-Math.max(0,t-2.2)/2);m.rotation.y+=dt*.3;if(Math.random()<dt*30)puff(m.position.clone().add(new V3(rnd(-r,r),rnd(-1,1)*r*.4,rnd(-r,r))),3,Math.random()<.5?0xff8cc8:0xffb070,2,1.2,-1);if(t>4.3)m.parent.remove(m)}
  else if(f.k==='stem'){const g=Math.min(1,t/1.2);m.position.y=B.p.y+g*9+t*.6;m.scale.set(1+g*.8,g*9+t*.6+.1,1+g*.8);m.material.opacity=.7*Math.max(0,1-Math.max(0,t-2)/2);if(t>4.1)m.parent.remove(m)}}
 for(const d of B.deb){if(!d.m.parent)continue;d.v.y-=14*dt;d.m.position.addScaledVector(d.v,dt);d.m.rotation.x+=d.w.x*dt;d.m.rotation.y+=d.w.y*dt;d.m.rotation.z+=d.w.z*dt;if(Math.random()<dt*30)puff(d.m.position,1,0x2a2a2a,1,.9,-1.5);
  if(d.m.position.y<SEA_Y||(onHull(d.m.position.x,d.m.position.z)&&d.m.position.y<.2)){if(d.m.position.y<SEA_Y)splash(d.m.position.x,d.m.position.z,.8);else puff(d.m.position,8,0xffa040,3,.4);d.m.parent.remove(d.m)}}
 if(t>5)E.boom=null}
function altCleanupFx(){const F=L3&&L3.altFx;if(!F)return;for(const k in F)if(F[k]&&F[k].parent)F[k].parent.remove(F[k]);L3.altFx={}}
function updAltEnd(dt){const E=L3.end;if(!E)return;E.t+=dt;const m=E.mis;
 // ракета: дымит, искрит и эпично взрывается в воздухе
 if(m.parent){E.v.y-=5*dt;m.position.addScaledVector(E.v,dt);m.rotation.z+=dt*7;m.rotation.x+=dt*1.4;if(Math.random()<dt*60)puff(m.position,2,Math.random()<.5?0x333333:0xff8040,2.5,1,-2);if(Math.random()<dt*25)puff(m.position,3,0xffe080,7,.25,6);
  if(E.t>1.2||m.position.y<SEA_Y+.6){missileBoom(E,m.position.clone());m.parent.remove(m)}}
 updBoom(E,dt);
 const G=E.girl,car=L3.car;if(!G||!car)return;const U=car.userData,inner=U.inner;
 // катапульта: вылетает вверх, кувыркаясь
 if(!E.chute&&!E.st){E.gv.y-=13*dt;G.g.position.addScaledVector(E.gv,dt);G.g.rotation.x=Math.max(0,1-E.t/.9)*E.t*6;girlPose(G,'jump',dt,{hair:.4});
  if(E.t>.9){const c=buildChute();mapGroup.add(c);E.chute=c;c.scale.setScalar(.05);E.from=G.g.position.clone();E.ct=0;E.sw=new V3(.5,0,0);E.swv=new V3();G.g.rotation.x=0;sfx('throw',1);puff(G.g.position.clone().setY(G.g.position.y+3),30,0xff8ccc,6,.5,2);setFace(G,'angry');say(G,'ЭТО ЕЩЁ НЕ КОНЕЦ!',2.6)}}
 // спуск на парашюте: раскачивается как маятник, подруливает к машине, у самой машины подгибает ноги
 if(E.chute){E.ct+=dt;const T_=6,k=Math.min(1,E.ct/T_);inner.updateMatrixWorld(true);const to=inner.localToWorld(_aw.set(0,.98,-1.75)).clone();
  const sk=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2,prev=G.g.position.clone();
  // траектория: сначала уводит за борт, над водой снижается и заходит в машину сбоку — сквозь яхту не пролетает
  if(!E.side)E.side=-1;const sd=E.side,B=(a0,a1,a2,a3,u)=>{const w=1-u;return w*w*w*a0+3*w*w*u*a1+3*w*u*u*a2+u*u*u*a3};
  const c1x=sd*26,c1y=Math.max(E.from.y,8)+4,c1z=E.from.z+3,c2x=to.x+sd*9,c2y=to.y+3,c2z=to.z+1;
  G.g.position.set(B(E.from.x,c1x,c2x,to.x,sk),B(E.from.y,c1y,c2y,to.y,k),B(E.from.z,c1z,c2z,to.z,sk));
  if(onHull(G.g.position.x,G.g.position.z))G.g.position.y=Math.max(G.g.position.y,3.2);
  const vel=_av.copy(G.g.position).sub(prev).divideScalar(Math.max(dt,1e-3));
  // маятник: наклон в сторону движения + затухающие колебания
  const tx=-vel.z*.06,tz=vel.x*.06;E.swv.x+=((tx-E.sw.x)*9-E.swv.x*1.2)*dt;E.swv.z+=((tz-E.sw.z)*9-E.swv.z*1.2)*dt;E.sw.x+=E.swv.x*dt;E.sw.z+=E.swv.z*dt;
  const flare=k>.86?(k-.86)/.14:0;const c=E.chute,ps=E.ct<.45?Math.min(1.08,1-Math.pow(1-E.ct/.45,3)*1+Math.sin(E.ct/.45*Math.PI)*.15):1+Math.sin(E.ct*2.6)*.03;c.scale.set(ps,ps*(1-flare*.15),ps);
  const off=_aw.set(0,3.5,0).applyEuler(new THREE.Euler(E.sw.x-flare*.35,0,E.sw.z));c.position.copy(G.g.position).add(off);c.rotation.set(E.sw.x-flare*.35,E.t*.15,E.sw.z);
  G.g.rotation.set(E.sw.x*.9,G.g.rotation.y+((Math.atan2(to.x-G.g.position.x,to.z-G.g.position.z)||0)-G.g.rotation.y)*Math.min(1,dt*1.5)*(1-k),E.sw.z*.9);
  girlPose(G,flare>0?'jump':'chute',dt,{lHip:[Math.sin(E.t*2.7)*.18,0,0],rHip:[-Math.sin(E.t*2.7)*.18,0,0],lKn:[Math.max(0,Math.sin(E.t*2.7))*.3,0,0],rKn:[Math.max(0,-Math.sin(E.t*2.7))*.3,0,0],wind:_av.set(0,1.6,0)});
  updChute(c,G,E.ct,flare);
  if(E.ct>3&&!E.said2){E.said2=1;say(G,'ПАПИНА МАШИНА, ВЫРУЧАЙ!',2.4)}if(flare>0&&!E.said3){E.said3=1;setFace(G,'wink')}
  if(k>=1){inner.attach(G.g);G.g.rotation.set(0,0,0);c.userData.v=new V3(rnd(-1,1),1.2,-3.5);E.chuteFly=c;E.chute=null;E.st='land';E.sT=0;sfx('slam',.5);puff(G.g.getWorldPosition(new V3()),20,0xfff0f8,4,.4,6);shake=Math.max(shake,.15)}}
 if(E.chuteFly){const c=E.chuteFly;if(c.userData.lines)c.userData.lines.visible=false;updChute(c,null,E.t,1.5);c.userData.v.y-=2.2*dt;c.position.addScaledVector(c.userData.v,dt);c.rotation.x+=dt*.9;c.scale.y=Math.max(.15,c.scale.y-dt*.9);c.scale.x*=1-dt*.12;c.scale.z*=1-dt*.12;if(c.position.y<SEA_Y){splash(c.position.x,c.position.z,1.4);mapGroup.remove(c);E.chuteFly=null}}
 if(!E.st)return;
 E.sT+=dt;const st=E.st,lp=(a,b,k)=>G.g.position.lerpVectors(a,b,Math.min(1,k));
 if(st==='land'){girlPose(G,'stand',dt);G.g.position.set(0,.98,-1.75);G.g.rotation.set(0,0,0);if(E.sT>.5){E.st='side';E.sT=0;sfx('throw')}}
 else if(st==='side'){girlPose(G,'jump',dt);const k=Math.min(1,E.sT/.6);G.g.position.set(1.35*k,.98+Math.sin(k*Math.PI)*.8-.5*k,-1.75+1.35*k);G.g.rotation.y=k*-Math.PI/2;U.door.rotation.y=-1.25*Math.min(1,E.sT/.5);if(k>=1){E.st='in';E.sT=0;sfx('door',.6)}}
 else if(st==='in'){girlPose(G,'sulk',dt);const k=Math.min(1,E.sT/.55);G.g.position.set(1.35-.9*k,.48+Math.sin(k*Math.PI)*.35,-.4+.05*k);G.g.rotation.y=-Math.PI/2*(1-k);if(k>=1){U.seat.attach(G.g);G.g.position.set(0,-.93*1.3+.15,0);G.g.rotation.set(0,0,0);E.st='close';E.sT=0}}
 else if(st==='close'){girlPose(G,'ride',dt);U.door.rotation.y=-1.25*(1-Math.min(1,E.sT/.35));if(E.sT>.35){sfx('door',.8);E.st='rev';E.sT=0;sfx('horn',.6)}}
 else if(st==='rev'){girlPose(G,'rideTaunt',dt);setFace(G,'wink');for(let i=0;i<2;i++){inner.localToWorld(_av.set(rnd(-.6,.6),.5,-2.5));puff(_av,1,0x555555,2,.8,-3)}car.rotation.x=Math.sin(E.sT*40)*.02;if(E.sT>.9){E.st='drive';E.sT=0;L3.carFree=true;E.cv=0;say(G,'ПОКА, НЕУДАЧНИК!',3)}}
 else if(st==='drive'){girlPose(G,(E.sT%1.2)<.6?'rideTaunt':'ride',dt);E.cv=Math.min(20,E.cv+dt*9);car.rotation.y+=dt*Math.sin(E.sT*.6)*.15;const fx=-Math.sin(car.rotation.y),fz=-Math.cos(car.rotation.y);car.position.x+=fx*E.cv*dt;car.position.z+=fz*E.cv*dt;car.position.y=seaH(car.position.x,car.position.z,lvT)-.4+Math.sin(E.sT*9)*.05;car.rotation.x=-.06;
  if(!L3.chainBroken&&car.position.z<-110.5){L3.chainBroken=true;const bp=new V3(car.position.x,car.position.y+.75,car.position.z+2.4);puff(bp,40,0xd8dee6,8,.6);blast(bp,1.2,0xffe08a);sfx('crack',1);sfx('slam',.6);banner('ЦЕПЬ ЛОПНУЛА!');
   for(let i=0;i<8;i++){const lk=new THREE.Mesh(new THREE.TorusGeometry(.12,.035,6,10),beerMats().chrome);lk.position.copy(bp);mapGroup.add(lk);(L3.links=L3.links||[]).push({m:lk,v:new V3(rnd(-4,4),rnd(3,7),rnd(-4,4)),t:2})}}
  if(Math.random()<dt*30){inner.localToWorld(_av.set(rnd(-1,1),.2,-2.6));puff(_av,3,0xfff6e2,4,.7,8)}
  if(E.sT>9&&car.parent){car.visible=false}}
 for(const l of L3.links||[]){l.t-=dt;l.v.y-=14*dt;l.m.position.addScaledVector(l.v,dt);l.m.rotation.x+=dt*9;if(l.m.position.y<SEA_Y){l.t=0}if(l.t<=0&&l.m.parent)l.m.parent.remove(l.m)}if(L3.links)L3.links=L3.links.filter(l=>l.t>0)}

/* ================= КВЕСТ: спасти грязнульку ================= */
const Q_HOME=new V3(27.5,0,-23),Q_HELP=new V3(6.2,4.2,-56.05);
function questInit(){const G=buildGirl(BEACH_O);mapGroup.add(G.g);L3.q={st:0,G,held:null,ring:null,t:0,sta:-1,pos:Q_HOME.clone(),bubT:2,thrT:4,vm:null,deckP:null,fl:flamingo()};mapGroup.add(L3.q.fl);questPlace(0)}
function flamingo(){const g=new THREE.Group(),pk=new THREE.MeshStandardMaterial({color:0xff6fae,roughness:.25,metalness:0,envMap:ENV,envMapIntensity:.6}),yl=new THREE.MeshStandardMaterial({color:0xffc040,roughness:.4}),dk=new THREE.MeshBasicMaterial({color:0x111111});
 g.add(new THREE.Mesh(new THREE.TorusGeometry(.9,.32,12,28),pk)).rotation.x=Math.PI/2;const nk=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new V3(0,.2,-.85),new V3(0,1.1,-1.05),new V3(0,1.7,-.7),new V3(0,1.75,-.35)]),16,.13,8,false),pk);g.add(nk);
 const hd=new THREE.Mesh(new THREE.SphereGeometry(.22,12,10),pk);hd.position.set(0,1.78,-.3);g.add(hd);const bk=new THREE.Mesh(new THREE.ConeGeometry(.09,.32,8),yl);bk.position.set(0,1.7,-.06);bk.rotation.x=Math.PI/2+.6;g.add(bk);for(const s of[-1,1]){const e=new THREE.Mesh(new THREE.SphereGeometry(.04,6,5),dk);e.position.set(s*.15,1.85,-.24);g.add(e)}g.traverse(o=>{if(o.isMesh)o.castShadow=true});return g}
function questPlace(dt){const q=L3.q,G=q.G,t=lvT,S=BEACH_O.scale;
 if(q.st===0){q.pos.set(Q_HOME.x+Math.sin(t*.31)*1.3,0,Q_HOME.z+Math.cos(t*.23)*1.8);q.pos.y=seaH(q.pos.x,q.pos.z,t)-1.12*S;G.g.position.copy(q.pos);G.g.rotation.y=-Math.PI/2+Math.sin(t*.7)*.5}
 if(q.fl){const fx=Q_HOME.x+4+Math.sin(t*.17)*2.5,fz=Q_HOME.z-5+Math.cos(t*.13)*3;q.fl.position.set(fx,seaH(fx,fz,t)+.05,fz);q.fl.rotation.set(Math.sin(t*1.3)*.12,t*.2,Math.cos(t*1.1)*.1)}}
function ringMesh(){const b=beerMats(),g=new THREE.Group();g.add(new THREE.Mesh(new THREE.TorusGeometry(.4,.1,10,28),b.ring));g.add(new THREE.Mesh(new THREE.TorusGeometry(.3,.025,6,20),b.foam));g.traverse(o=>{if(o.isMesh)o.castShadow=true});return g}
let _ropeG=null;function ropeTo(rp,a,b){if(!rp){if(!_ropeG)_ropeG=new THREE.CylinderGeometry(.025,.025,1,5).translate(0,.5,0);rp=new THREE.Mesh(_ropeG,new THREE.MeshStandardMaterial({color:0xf2ead8,roughness:.9}));scene.add(rp)}
 const d=_ax.subVectors(b,a),L=d.length();rp.position.copy(a);rp.quaternion.setFromUnitVectors(UPV,d.divideScalar(L||1));rp.scale.set(1,L,1);return rp}
function ringHeld(){return!!(L3&&L3.q&&L3.q.held!=null)}
function l3Interact(){if(!L3||!L3.q||state!=='play'||!P.alive)return;const q=L3.q;
 if(q.held!=null){const r=L3.rings[q.held];r.has=true;r.rg.visible=true;q.held=null;heldVM(false);sfx('flip');return}
 let bi=-1,bd=2.8;L3.rings.forEach((r,i)=>{if(!r.has)return;const d=Math.hypot(P.pos.x-r.pos.x,P.pos.z-r.pos.z);if(d<bd&&Math.abs(P.pos.y-r.pos.y+1)<2){bd=d;bi=i}});
 if(bi<0)return;const r=L3.rings[bi];r.has=false;r.rg.visible=false;q.held=bi;heldVM(true);sfx('flip');banner(q.st===0?'ЛКМ — БРОСИТЬ КРУГ ГРЯЗНУЛЬКЕ':'ЛКМ — БРОСИТЬ КРУГ')}
function heldVM(on){const q=L3.q;if(on){if(!q.vm){q.vm=ringMesh();q.vm.position.set(-.3,-.3,-.62);q.vm.rotation.set(.9,.35,.2);q.vm.scale.setScalar(.42);gunScene.add(q.vm)}q.vm.visible=true}else if(q.vm)q.vm.visible=false}
function throwRing(){if(!ringHeld())return false;const q=L3.q,sta=q.held;q.held=null;heldVM(false);camera.getWorldDirection(aim);
 const p0=camera.position.clone().addScaledVector(aim,.9).add(new V3(0,-.25,0)),v=aim.clone().multiplyScalar(15).add(new V3(0,3.2,0));q.ring=ringFly(p0,v,sta,true);sfx('throw');
 if(mp())pushFx(['L',0,1,r1(p0.x),r1(p0.y),r1(p0.z),r1(v.x),r1(v.y),r1(v.z),sta]);return true}
function ringFly(p0,v,sta,mine){const m=ringMesh();m.position.copy(p0);scene.add(m);return{m,vel:v,sta,mine,st:'fly',t:0,rope:null}}
function updRing(R,dt){const q=L3.q,st=L3.rings[R.sta],pos=R.m.position;R.t+=dt;
 if(R.st==='fly'){R.vel.y-=15*dt;pos.addScaledVector(R.vel,dt);R.m.rotation.x+=dt*6;R.m.rotation.y+=dt*3;
  if(pos.distanceTo(st.pos)>30){R.vel.multiplyScalar(.2)}
  if(onHull(pos.x,pos.z)){if(pos.y<groundAt(pos.x,pos.z,4)+.12){R.st='back';R.t=0}}
  else{const sy=seaH(pos.x,pos.z,lvT);if(pos.y<sy+.05){R.st='float';R.t=0;splash(pos.x,pos.z,.5);
    if(R.mine&&q.st===0&&Math.hypot(pos.x-q.pos.x,pos.z-q.pos.z)<3.2&&Math.sign(q.pos.x)===st.s){questGrab(R.sta);if(mp())pushFx(['L',0,2,R.sta])}}}
  if(R.t>4){R.st='back';R.t=0}}
 else if(R.st==='float'){pos.y=seaH(pos.x,pos.z,lvT)+.05;R.m.rotation.set(Math.PI/2+Math.sin(lvT*2)*.2,0,Math.cos(lvT*1.6)*.2);if(R.t>1.8){R.st='back';R.t=0;R.from=pos.clone()}}
 else if(R.st==='back'){if(!R.from)R.from=pos.clone();const k=Math.min(1,R.t/.9);pos.lerpVectors(R.from,st.pos,k);pos.y+=Math.sin(k*Math.PI)*1.5;if(k>=1){st.has=true;st.rg.visible=true;return false}}
 else if(R.st==='held'){q.G.J.spine.getWorldPosition(pos);pos.y+=.2;R.m.rotation.set(Math.PI/2,0,0)}
 R.rope=ropeTo(R.rope,st.pos,pos);return true}
function questGrab(sta){const q=L3.q;if(q.st!==0)return;q.st=1;q.sta=sta;q.t=0;if(q.ring&&q.ring.sta===sta)q.ring.st='held';else{if(q.ring)ringDrop(q.ring);q.ring=ringFly(q.pos.clone(),new V3(),sta,false);q.ring.st='held'}
 setFace(q.G,'happy');say(q.G,'ДЕРЖУСЬ!',2);sfx('ding')}
function ringDrop(R){if(R.m.parent)R.m.parent.remove(R.m);if(R.rope&&R.rope.parent)R.rope.parent.remove(R.rope)}
function questReward(){addStyle('СПАСЕНИЕ НА ВОДАХ',400);sfx('frag');if(!prog.l3save){prog.l3save=1;saveProg();bankAdd(2000);setTimeout(()=>banner('+2000 ★ — ГРЯЗНУЛЬКА БЛАГОДАРИТ'),1900)}banner('ГРЯЗНУЛЬКА СПАСЕНА!')}
function questSync(st){const q=L3&&L3.q;if(!q)return;if(st===4&&q.st<3){questToHelper()}else if(st===5&&q.st===0){q.st=5;q.t=0}}
function questToHelper(){const q=L3.q;if(q.ring){ringDrop(q.ring);q.ring=null;const r=L3.rings[q.sta];if(r){r.has=true;r.rg.visible=true}}q.st=4;q.t=0;q.placed=false}
function girlSwap(G,o){const T_=GIRL_T[o.kind];if(G.model||!T_||T_==='load'||!G.g.parent)return G;const N=buildGirl(o);N.g.position.copy(G.g.position);N.g.quaternion.copy(G.g.quaternion);G.g.parent.add(N.g);G.g.parent.remove(G.g);setFace(N,G.ex||'scared');return N}
function updQuest(dt){const q=L3.q;if(!q)return;if(!q.G.model&&q.st===0&&!q.held)q.G=girlSwap(q.G,BEACH_O);const G=q.G,S=story,t=lvT;q.t+=dt;
 if(q.ring&&!updRing(q.ring,dt)){ringDrop(q.ring);q.ring=null}
 for(const R of L3.ghostR||[])if(!updRing(R,dt)){ringDrop(R);R.dead=1}if(L3.ghostR)L3.ghostR=L3.ghostR.filter(R=>!R.dead);
 if(S&&S.room===1&&q.st===0){q.annT=(q.annT||0)+dt;if(q.annT>2.6&&!q.ann){q.ann=1;banner('ЗА ПРАВЫМ БОРТОМ КТО-ТО ТОНЕТ!');say(G,'ПОМОГИТЕ! Я ТУТ!',3)}}
 if(S&&S.room>=2&&q.st===0){q.st=5;q.t=0;banner('ГРЯЗНУЛЬКУ УНЕСЛО ПЕНОЙ…')}
 if(S&&S.room>=2&&q.st>=1&&q.st<4)questToHelper();
 if(q.st===0){questPlace(dt);const flail={lSh:[Math.sin(t*5)*.5,0,Math.sin(t*5)*.25],rSh:[Math.sin(t*5+2)*.5,0,Math.sin(t*5+2)*.25],head:[Math.sin(t*2)*.1,Math.sin(t*1.3)*.3,0]};girlPose(G,'tread',dt,flail);
  if(Math.random()<dt*6){G.J.lWr.getWorldPosition(_aw);puff(_aw,2,0xfff6e2,3,.5,8)}
  q.bubT-=dt;if(q.bubT<=0){q.bubT=rnd(3.5,5);const d=Math.hypot(P.pos.x-q.pos.x,P.pos.z-q.pos.z);if(d<60)say(G,['ПОМОГИТЕ!','СПАСИТЕ!','ТОНУ В ПИВЕ!','КРУГ! КИНЬТЕ КРУГ!'][Math.floor(Math.random()*4)],2.6)}}
 else if(q.st===1){const r=L3.rings[q.sta],tx=r.pos.x+r.s*1.5,tz=r.pos.z,dx=tx-q.pos.x,dz=tz-q.pos.z,dd=Math.hypot(dx,dz),v=Math.min(dd,2.6*dt);if(dd>.01){q.pos.x+=dx/dd*v;q.pos.z+=dz/dd*v}
  q.pos.y=seaH(q.pos.x,q.pos.z,t)-1.15*BEACH_O.scale;G.g.position.copy(q.pos);G.g.rotation.y=Math.atan2(dx,dz)||G.g.rotation.y;girlPose(G,'hold',dt);if(Math.random()<dt*10)puff(new V3(q.pos.x,SEA_Y+.2,q.pos.z),2,0xfff6e2,3,.5,8);
  if(dd<.5){q.st=2;q.t=0;q.c0=q.pos.clone();sfx('gloop',.6)}}
 else if(q.st===2){const r=L3.rings[q.sta],k=Math.min(1,q.t/1.5),s2=r.s;let x,y;if(k<.7){const a=k/.7;x=q.c0.x+(r.pos.x+s2*.3-q.c0.x)*a;y=q.c0.y+(1.25-q.c0.y)*a*a}else{const a=(k-.7)/.3;x=r.pos.x+s2*.3-s2*1.9*a;y=1.25*(1-a)}
  G.g.position.set(x,y,r.pos.z);G.g.rotation.y=s2>0?-Math.PI/2:Math.PI/2;girlPose(G,'climb',dt);if(q.ring){ringDrop(q.ring);q.ring=null;r.has=true;r.rg.visible=true}
  if(k>=1){q.st=3;q.t=0;q.deckP=G.g.position.clone();say(G,'СПАСИБО, ГЕРОЙ!',3);setFace(G,'happy');questReward()}}
 else if(q.st===3||q.st===4){if(q.st===3&&q.t>3.2){q.st=4;q.t=0;q.placed=false}
  const boss=S&&S.room>=2;if(q.st===4&&boss&&!q.placed){q.placed=true;G.g.position.copy(Q_HELP);G.g.rotation.y=Math.PI;say(G,'Я С ТОБОЙ! ЛОВИ ЕЁ!',3);setFace(G,'wink')}
  if(!boss&&q.deckP){G.g.position.copy(q.deckP);const a=Math.atan2(P.pos.x-q.deckP.x,P.pos.z-q.deckP.z);G.g.rotation.y+=angD(a,G.g.rotation.y)*Math.min(1,dt*3)}
  if(boss&&q.placed){const b=enemies.find(e=>e.type==='alt'&&!e.dead);if(b){const a=Math.atan2(b.pos.x-Q_HELP.x,b.pos.z-Q_HELP.z);G.g.rotation.y+=angD(a,G.g.rotation.y)*Math.min(1,dt*3)}
   q.thrT-=dt;if(q.thw>0){q.thw-=dt;girlPose(G,'throw',dt)}else girlPose(G,(t%4)<2?'cheer':'stand',dt);
   if((mode==='solo'||isHost)&&b&&!b.inv&&q.thrT<=0){q.thrT=rnd(4.2,6);const to=center(b,new V3());to.addScaledVector(b.vel||A0,.6);helperThrow(to,true)}}
  else if(q.st===3)girlPose(G,'cheer',dt);else girlPose(G,'stand',dt)}
 else if(q.st===5){if(q.t<4){q.pos.x+=dt*3.5;q.pos.y=seaH(q.pos.x,q.pos.z,t)-1.12*BEACH_O.scale-q.t*.5;G.g.position.copy(q.pos);girlPose(G,'tread',dt)}else G.g.visible=false}}
const A0=new V3();
function helperThrow(to,host){const q=L3.q,G=q.G;q.thw=.5;G.J.rWr.getWorldPosition(_aw);const from=_aw.clone();const m=bottleMesh();m.position.copy(from);scene.add(m);L3.hb=L3.hb||[];L3.hb.push({m,from,to:to.clone(),t:0,host});sfx('throw',.6);
 if(host&&mp())pushFx(['L',0,6,r1(to.x),r1(to.y),r1(to.z)])}
function updHelperBottles(dt){if(!L3.hb)return;for(const h of L3.hb){h.t+=dt;const k=Math.min(1,h.t/.9);h.m.position.lerpVectors(h.from,h.to,k);h.m.position.y+=Math.sin(k*Math.PI)*3;h.m.rotation.x+=dt*12;
  if(k>=1){h.dead=1;scene.remove(h.m);blast(h.to,1.6,0xfff6e2);puff(h.to,30,0xfff6e2,7,.6,4);puff(h.to,14,0xe09a18,5,.6,6);sfx('gloop',.7*Math.max(.3,sndV(h.to.x,h.to.y,h.to.z)));
   if(h.host){const b=enemies.find(e=>e.type==='alt'&&!e.dead);if(b&&center(b,_av).distanceTo(h.to)<b.r+2.5){damage(b,3,99,'mud');addStyle('ГРЯЗНУЛЬКА ПОМОГЛА',30)}}}}
 L3.hb=L3.hb.filter(h=>!h.dead)}
/* ---------- игрок и танк/обломки: столкновение, езда на крыше ---------- */
function obbPush(p,r,h,carry,list){let on=false;for(const ob of list||L3.obbs||[]){const c=Math.cos(ob.yaw),sn=Math.sin(ob.yaw),lx=p.x-ob.x,lz=p.z-ob.z,fx=lx*c-lz*sn,fz=lx*sn+lz*c,ex=ob.hw+r,ez=ob.hl+r;
  if(Math.abs(fx)>=ex||Math.abs(fz)>=ez||p.y>ob.top+.05||p.y+h<(ob.bot||0))continue;
  if(p.y>ob.top-.55&&carry){p.y=ob.top;on=ob;continue}
  const px=ex-Math.abs(fx),pz=ez-Math.abs(fz);let nx=fx,nz=fz;if(px<pz)nx=Math.sign(fx||1)*ex;else nz=Math.sign(fz||1)*ez;p.x=ob.x+nx*c+nz*sn;p.z=ob.z-nx*sn+nz*c}return on}
/* в море: машина денег и грязнулька — твёрдые (на крышу машины можно встать) */
function updSeaCol(){if(!P.alive||state!=='play')return;const L=L3.sobbs||(L3.sobbs=[{hw:1.12,hl:2.5,live:false},{hw:.38,hl:.38,live:false}]);const list=[];
 const c=L3.car;if(c&&c.visible){const o=L[0];o.x=c.position.x;o.z=c.position.z;o.yaw=c.rotation.y;o.bot=c.position.y-.6;o.top=c.position.y+1.02;list.push(o)}
 const q=L3.q;if(q&&q.G&&q.G.g.visible&&q.G.g.parent){const gp=q.G.g.getWorldPosition(_hgv);if(!onHull(gp.x,gp.z)){const o=L[1];o.x=gp.x;o.z=gp.z;o.yaw=0;o.bot=gp.y;o.top=gp.y+1.9;list.push(o)}}
 if(!list.length)return;const on=list[0]===L[0]?obbPush(P.pos,.4,1.75,true,[L[0]]):false;if(list.includes(L[1]))obbPush(P.pos,.4,1.75,false,[L[1]]);if(on&&P.vel.y<=.5){P.vel.y=Math.max(0,P.vel.y);P.grounded=true;P.lastG=T}}
function updObbs(dt){updSeaCol();if(!L3.obbs||!L3.obbs.length)return;
 if(P.alive&&state==='play'){const on=obbPush(P.pos,.4,1.75,true);if(on&&P.vel.y<=.5){P.vel.y=Math.max(0,P.vel.y);P.grounded=true;P.lastG=T;if(on.live){P.pos.x+=on.dx*0;P.pos.z+=on.dz*0;
   const c=Math.cos(on.dyaw),sn=Math.sin(on.dyaw),lx=P.pos.x-on.x,lz=P.pos.z-on.z;P.pos.x=on.x+lx*c+lz*sn;P.pos.z=on.z-lx*sn+lz*c;P.yaw+=on.dyaw}}}
 if(mode==='solo'||isHost)for(const e of enemies){if(e.dead||e.remote||e.type==='alt'||ENEMY[e.type].fly)continue;obbPush(e.pos,e.r*.8,2,true)}}
function resetL3(){if(!L3)return;altCleanup();L3.carFree=false;L3.chainBroken=false;if(L3.car){L3.car.visible=true;L3.car.rotation.set(0,0,0);L3.car.userData.door.rotation.y=0}for(const l of L3.links||[])if(l.m.parent)l.m.parent.remove(l.m);L3.links=[];for(const k of kmarks){scene.remove(k.m);scene.remove(k.f)}kmarks=[];for(const k of L3.kegs){if(!k.alive){k.alive=true;k.g.visible=true;if(!boxes.includes(k.box))boxes.push(k.box);k.g.traverse(o=>{if(o.isMesh&&!level.includes(o))level.push(o)})}}
 for(const c of L3.chairs)if(!c.alive){c.alive=true;c.g.visible=true;if(!boxes.includes(c.box))boxes.push(c.box)}
 for(const r of L3.rings){r.has=true;r.rg.visible=true}
 const q=L3.q;if(q){if(q.ring)ringDrop(q.ring);q.ring=null;for(const R of L3.ghostR||[])ringDrop(R);L3.ghostR=[];q.held=null;heldVM(false);q.st=0;q.t=0;q.placed=false;q.ann=0;q.annT=0;q.G.g.visible=true;setFace(q.G,'scared');questPlace(0)}
 for(const h of L3.hb||[])scene.remove(h.m);L3.hb=[];if(L3.hatch){L3.hatch.want=0;L3.hatch.k=0}if(L3.wave)L3.wave.visible=false;L3.waveHit.clear();L3.lastWarn=-1;L3.inSeaT=0}
function clearL3(){if(typeof bloomPass!=='undefined'&&bloomPass){bloomPass.threshold=.93;bloomPass.strength=.42}altCleanup();const q=L3.q;if(q){if(q.ring)ringDrop(q.ring);for(const R of L3.ghostR||[])ringDrop(R);if(q.vm)gunScene.remove(q.vm)}for(const h of L3.hb||[])scene.remove(h.m);const hn=document.getElementById('l3hint');if(hn)hn.hidden=true}
/* подсказки */
function l3Hint(){let el=document.getElementById('l3hint');if(!el){el=document.createElement('div');el.id='l3hint';el.hidden=true;(document.querySelector('.hud')||document.body).appendChild(el)}
 let txt='';if(state==='play'&&P.alive&&L3.q){const q=L3.q;if(q.held!=null)txt='<b>ЛКМ</b> бросить круг · <b>E</b> повесить обратно';
  else{for(const r of L3.rings)if(r.has&&Math.hypot(P.pos.x-r.pos.x,P.pos.z-r.pos.z)<2.8){txt='<b>E</b> взять спасательный круг';break}}}
 if(el.dataset.t!==txt){el.dataset.t=txt;el.innerHTML=txt;el.hidden=!txt}}
/* сеть */
function l3Fx(n){if(!L3)return;const s2=n[0];if(s2===1&&L3.q){(L3.ghostR=L3.ghostR||[]).push(ringFly(new V3(n[1],n[2],n[3]),new V3(n[4],n[5],n[6]),n[7]|0,false))}
 else if(s2===2&&L3.q)questGrab(n[1]|0);else if(s2===6&&L3.q)helperThrow(new V3(n[1],n[2],n[3]),false);else if(s2===9){const c=L3.chairs[n[1]|0];if(c)breakChair(c)}}
function altFx(n){const s2=n[0];if(s2===10){if(L3)waveReverse(n[1],n[2],n[3],false);return}if(s2===8){bambBoom(new V3(n[1],n[2],n[3]),false);return}if(s2===9){ketoMark(n[1],n[2],n[3],false);return}if(!L3)return;if(s2===3)nukeBoom(n[1],n[2],false,[]);else if(s2===6){const b=enemies.find(e=>e.type==='alt');if(b){const A=b.g.userData.alt;A.kick=.35;const mz=A.tank.muzzle.getWorldPosition(new V3());puff(mz,30,0xffd27a,8,.4,-2);sfx('boom',.7)}}
 else if(s2===7)sfx('slam')}


/* ================= мобы моря пива ================= */
/* Бамбун — моряк-великан с веслом и бочкой пива. Модель — из Blender (models/bambun.json), части собираются в риг. */
let BAMB_T=null;
function loadBambun(){loadGirls();if(typeof loadQueen==='function')loadQueen();if(BAMB_T||!THREE.GLTFLoader)return;BAMB_T='load';ugModel('models/bambun.json',gl=>{BAMB_T=gl.scene;BAMB_T.updateMatrixWorld(true)},undefined,()=>{BAMB_T=null})}
function buildBambun(g,mm,mats){const J={},cl=new Map(),part=n=>{const o=BAMB_T&&BAMB_T!=='load'?BAMB_T.getObjectByName(n):null;if(!o)return null;const c=o.clone();c.position.set(0,0,0);c.rotation.set(0,0,0);
  c.traverse(m=>{if(m.isMesh){m.castShadow=true;let k=cl.get(m.material);if(!k){k=m.material.clone();k.envMap=ENV;k.envMapIntensity=.35;cl.set(m.material,k);mats.push(k)}m.material=k}});return c};
 const gp=(par,x,y,z)=>{const o=new THREE.Group();o.position.set(x,y,z);par.add(o);return o};
 J.hips=gp(g,0,2,0);J.spine=gp(J.hips,0,0,0);J.neck=gp(J.spine,0,1.45,0);
 for(const [s,n] of[[1,'L'],[-1,'R']]){J['sh'+n]=gp(J.spine,s*.66,1.32,0);J['el'+n]=gp(J['sh'+n],0,-.85,0);J['hand'+n]=gp(J['el'+n],0,-.82,0);J['hip'+n]=gp(J.hips,s*.24,0,0);J['kn'+n]=gp(J['hip'+n],0,-1,0)}
 const add=(par,n,fb)=>{const c=part(n)||fb();par.add(c);return c};
 const sk=mm(0xd9a07a,{roughness:.55}),cyl=(r0,r1,L,mt)=>()=>{const m=new THREE.Mesh(new THREE.CylinderGeometry(r0,r1,L,10),mt);m.geometry.translate(0,-L/2,0);return m};
 add(J.spine,'torso',()=>{const m=new THREE.Mesh(new THREE.CylinderGeometry(.55,.5,1.5,12),mm(0x1f3a6e));m.geometry.translate(0,.75,0);return m});
 add(J.neck,'head',()=>{const m=new THREE.Mesh(new THREE.SphereGeometry(.34,12,10),sk);m.position.y=.45;return m});
 for(const n of['L','R']){add(J['sh'+n],'uarm_'+n,cyl(.16,.13,.85,sk));add(J['el'+n],'farm_'+n,cyl(.13,.11,.8,sk));add(J['hip'+n],'thigh_'+n,cyl(.2,.15,1,mm(0x5a4630)));add(J['kn'+n],'shin_'+n,cyl(.15,.13,1,mm(0xe8b21a)))}
 J.oar=add(J.handR,'oar',cyl(.06,.06,3.4,mm(0xc08a4e)));J.oar.rotation.x=Math.PI/2;
 g.userData.bb=J;g.traverse(o=>{if(o.isMesh)o.castShadow=true});return new THREE.MeshBasicMaterial({color:0xffcc33})}
function bambAI(e,t,to,dist,dt,tg){e.st=e.st||'run';e.stT=(e.stT||0)+dt;const go=s=>{e.st=s;e.stT=0;e.hitDone=false};const tp=t.pos;e.cdJ=(e.cdJ??rnd(3,6))-dt;e.cdS=(e.cdS??rnd(1.5,3))-dt;
 if(e.st==='stun'){e.ac=5;e.vel.x*=.85;e.vel.z*=.85;if(e.stT>1.8)go('run');return}
 if(e.st==='jump'){e.ac=4;if(e.onGround&&e.stT>.25){go('run');ring(e.pos,3,0xe8a420);puff(new V3(e.pos.x,e.pos.y+.2,e.pos.z),30,0xfff6e2,7,.6);sfx('slam',.5*Math.max(.3,sndV(e.pos.x,e.pos.y,e.pos.z)))}return}
 if(e.st==='swH'||e.st==='swV'){const H=e.st==='swH',wind=H?.55:.72;e.ac=H?1:2;e.vel.x*=.7;e.vel.z*=.7;e.wind=e.stT<wind?1:0;
  if(!e.hitDone&&e.stT>=wind){e.hitDone=true;const fx=Math.sin(e.g.rotation.y),fz=Math.cos(e.g.rotation.y);sfx('slam',.6);shake=Math.max(shake,.15*sndV(e.pos.x,e.pos.y,e.pos.z));
   if(!H){const p=new V3(e.pos.x+fx*3.6,e.pos.y+.1,e.pos.z+fz*3.6);ring(p,2.4,0xe8a420);puff(p,24,0xfff6e2,6,.5)}
   for(const c of tg){const dx=c.pos.x-e.pos.x,dz=c.pos.z-e.pos.z,d=Math.hypot(dx,dz),fw=(dx*fx+dz*fz),lat=Math.abs(dx*fz-dz*fx),dy=c.pos.y-e.pos.y;if(dy<-1.5||dy>3)continue;
    const ok=H?(d<4.7&&fw>-.4):(fw>0&&fw<5.6&&lat<1.5);if(ok){const dm=Math.round(rnd(20,30));hitTarget(c,dm,H?new V3(-fz,0,fx).multiplyScalar(14*(Math.random()<.5?1:-1)).setY(6):new V3(fx*9,8,fz*9));shake=Math.max(shake,.3)}}}
  if(e.stT>wind+.45)go('run');return}
 if(e.st==='spit'){e.ac=3;e.vel.x*=.8;e.vel.z*=.8;if(!e.hitDone&&e.stT>.35){e.hitDone=true;const B=e.g.userData.bb,m=B.neck.getWorldPosition(new V3());m.y+=.35;enemyShot(m,t,24,12,.32,0xe8a420);sfx('gloop',.7)}if(e.stT>.7){e.cdS=rnd(2.5,4);go('run')}return}
 e.ac=0;const want=e.speed;e.vel.x+=(to.x*want-e.vel.x)*Math.min(1,dt*5);e.vel.z+=(to.z*want-e.vel.z)*Math.min(1,dt*5);
 if(dist<4.2&&e.cd<=0){go(Math.random()<.55?'swH':'swV');e.cd=rnd(1.4,2.2);sfx('charge',.5)}
 else if(e.onGround&&e.cdJ<=0&&((tp.y>e.pos.y+1.8&&dist<20)||(dist>9&&dist<17&&Math.random()<.4))){const T_=1.05,dx=tp.x+t.vel.x*.4-e.pos.x,dz=tp.z+t.vel.z*.4-e.pos.z,dy=tp.y-e.pos.y;e.vel.set(dx/T_,(dy+.5*26*T_*T_)/T_,dz/T_);e.cdJ=rnd(4.5,7);go('jump');sfx('jet',.4)}
 else if(dist>6&&dist<24&&e.cdS<=0&&los(center(e,_av),_aw.set(tp.x,tp.y+1.2,tp.z)))go('spit')}
function bambAnim(e,dt){const B=e.g.userData.bb;if(!B)return;const ac=e.ac||0,k=Math.min(1,dt*10),hs=e.remote?(e.hs||0):Math.hypot(e.vel.x,e.vel.z);if(e.remote){const p=e.pos;e.hs=e.lp?Math.min(12,p.distanceTo(e.lp)/Math.max(dt,1e-3)):0;e.lp=(e.lp||new V3()).copy(p)}
 e.rt=(e.rt||0)+dt*(2+hs*.75);const w=Math.sin(e.rt),run=Math.min(1,hs/8),L=(o,x,y,z)=>{o.rotation.x+=(x-o.rotation.x)*k;o.rotation.y+=((y||0)-o.rotation.y)*k;o.rotation.z+=((z||0)-o.rotation.z)*k};
 let hL=w*.8*run,hR=-w*.8*run,kL=Math.max(0,-w)*1.1*run,kR=Math.max(0,w)*1.1*run,sp=[.12*run,0,0],shL=[-w*.5*run,0,.15],shR=[-.6,0,-.15],elR=[-.9,0,0],elL=[-.3,0,0],oar=[Math.PI/2,0,0];
 const t_=e.stT||0;
 if(ac===1){const a=e.wind?-1:1.3;sp=[.05,a*.9,0];shR=[-1.4,0,-1.2];elR=[-.3,0,0];shL=[-1.2,0,.6];oar=[Math.PI/2,0,a>0?-.6:.6]}
 else if(ac===2){const up=!!e.wind;sp=[up?-.3:.45,0,0];shR=[up?-3:-1.2,0,-.2];shL=[up?-3:-1.2,0,.2];elR=[up?-.4:0,0,0];elL=elR;oar=[up?Math.PI*.15:Math.PI*.55,0,0]}
 else if(ac===3){sp=[.4,0,0];B.neck.rotation.x=-.3}
 else if(ac===4){hL=-1.2;hR=-.4;kL=1.6;kR=.6;shL=[-2.6,0,.4];shR=[-2.6,0,-.4]}
 else if(ac===5){sp=[-.35,0,.25];shL=[.3,0,.9];shR=[.3,0,-.9]}
 L(B.spine,...sp);L(B.hipL,hL);L(B.hipR,hR);L(B.knL,kL);L(B.knR,kR);L(B.shL,...shL);L(B.shR,...shR);L(B.elR,...elR);L(B.elL,...elL);L(B.oar,...oar);if(ac!==3)B.neck.rotation.x*=.9;
 B.hips.position.y=2+Math.abs(Math.sin(e.rt))*.12*run}
function bambBoom(p,host){blast(p,4.6,0xe8a420);puff(p,90,0xfff6e2,14,1,6);puff(p,50,0xd98a10,11,.9,8);sfx('boom',.9*Math.max(.3,sndV(p.x,p.y,p.z)));shake=Math.max(shake,.35*sndV(p.x,p.y,p.z));addPuddle(p.x,p.y-1.9,p.z,2.6,9);
 if(!host)return;if(mp())pushFx(['A',0,8,r1(p.x),r1(p.y),r1(p.z)]);for(const c of targets()){const d=_av.set(c.pos.x,c.pos.y+1,c.pos.z).distanceTo(p);if(d<4.8){const f=1-d/4.8;hitTarget(c,Math.round(10+14*f),_aw.subVectors(_av,p).normalize().multiplyScalar(14*f).setY(6*f).clone())}}
 for(const o of enemies)if(!o.dead&&center(o,_ax).distanceTo(p)<4.8&&o.type!=='bambun')damage(o,6,99,'keg');if(L3)kegsNear(p,4,true)}
/* Кетональщик — автомат на ногах: бегает, прыгает и бьёт по площади при приземлении (не парируется) */
function buildKeto(g,mm){const red=mm(0xb8102a,{roughness:.35,metalness:.2,envMap:ENV,envMapIntensity:.4}),dark=mm(0x1a1214,{roughness:.2,metalness:.6,envMap:ENV}),steel=mm(0x9aa2aa,{metalness:.9,roughness:.3,envMap:ENV}),cream=mm(0xf6eee2);
 const K={};const add=(par,geo,mt,x,y,z)=>{const m=new THREE.Mesh(geo,mt);m.position.set(x,y,z);par.add(m);m.castShadow=true;return m};
 K.body=new THREE.Group();K.body.position.y=1.45;g.add(K.body);add(K.body,new THREE.BoxGeometry(1.5,2.5,1.1),red,0,1.25,0);add(K.body,new THREE.BoxGeometry(1.1,1.3,.08),dark,0,1.45,.56);
 for(let r=0;r<3;r++)for(let c=0;c<4;c++)add(K.body,new THREE.CylinderGeometry(.08,.08,.3,8),mm([0x6b2a12,0x7ee08a,0xff9a4d][r]),-.39+c*.26,1+r*.4,.58);
 const eyes=new THREE.MeshBasicMaterial({color:0xffcc33});add(K.body,new THREE.BoxGeometry(.32,.12,.06),eyes,-.3,2.25,.56);add(K.body,new THREE.BoxGeometry(.32,.12,.06),eyes,.3,2.25,.56);add(K.body,new THREE.BoxGeometry(1.2,.25,.1),cream,0,.4,.56);
 add(K.body,new THREE.BoxGeometry(1.2,.22,.9),dark,0,-.05,0);const kt=document.createElement('canvas');kt.width=256;kt.height=64;const c2=kt.getContext('2d');c2.fillStyle='#111';c2.fillRect(0,0,256,64);c2.fillStyle='#7ee08a';c2.font='900 40px "Russo One",Arial';c2.textAlign='center';c2.fillText('КЕТО',128,46);
 add(K.body,new THREE.PlaneGeometry(1,.25),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(kt)}),0,2.6,.561);
 K.legs=[];for(const s of[-1,1]){const hip=new THREE.Group();hip.position.set(s*.45,1.45,0);g.add(hip);add(hip,new THREE.SphereGeometry(.2,10,8),dark,0,0,0);add(hip,new THREE.CylinderGeometry(.13,.1,.8,10),steel,0,-.4,0);
  const kn=new THREE.Group();kn.position.y=-.8;hip.add(kn);add(kn,new THREE.SphereGeometry(.15,10,8),dark,0,0,0);add(kn,new THREE.CylinderGeometry(.1,.08,.7,10),steel,0,-.35,0);add(kn,new THREE.CylinderGeometry(.05,.05,.6,6),red,0,-.3,-.13);
  add(kn,new THREE.BoxGeometry(.32,.12,.5),dark,0,-.68,.08);K.legs.push({hip,kn})}
 g.userData.keto=K;return eyes}
function ketoAI(e,t,to,dist,dt,tg){e.st=e.st||'run';e.stT=(e.stT||0)+dt;const go=s=>{e.st=s;e.stT=0};e.cdJ=(e.cdJ??rnd(1.5,3))-dt;const tp=t.pos;
 if(e.st==='crouch'){e.ac=2;e.vel.x*=.7;e.vel.z*=.7;if(e.stT>.3){const T_=.8,lx=tp.x+t.vel.x*.5,lz=tp.z+t.vel.z*.5,dy=tp.y-e.pos.y;e.vel.set((lx-e.pos.x)/T_,(dy+.5*26*T_*T_)/T_,(lz-e.pos.z)/T_);go('air');sfx('jet',.4)}return}
 if(e.st==='air'){e.ac=3;if(e.onGround&&e.stT>.2){go('run');e.cdJ=rnd(3.5,5.5);ketoMark(e.pos.x,e.pos.y,e.pos.z,true,e.blue?BLUE:0);sfx('slam',.6*Math.max(.3,sndV(e.pos.x,e.pos.y,e.pos.z)));puff(new V3(e.pos.x,e.pos.y+.2,e.pos.z),26,0xf2efe8,7,.5)}return}
 if(e.wind>0){e.wind-=dt;e.ac=1;e.vel.x*=.8;e.vel.z*=.8;if(e.wind<=0){for(const c of tg){const d=Math.hypot(c.pos.x-e.pos.x,c.pos.z-e.pos.z);if(d<2.8&&Math.abs(c.pos.y-e.pos.y)<2.2)hitTarget(c,16,to.clone().multiplyScalar(13).setY(5))}e.cd=1}return}
 if(e.kw>0){e.kw-=dt;e.ac=2;e.vel.x*=.6;e.vel.z*=.6;if(e.kw<=0){e.kd=.34;e.kdir=to.clone();e.khit=0;sfx('dash',.7)}return}
 if(e.kd>0){e.kd-=dt;e.ac=3;e.vel.x=e.kdir.x*27;e.vel.z=e.kdir.z*27;if(Math.random()<dt*40)puff(new V3(e.pos.x,e.pos.y+.3,e.pos.z),2,BLUE_L,3,.4);
  if(!e.khit)for(const c of tg){if(Math.hypot(c.pos.x-e.pos.x,c.pos.z-e.pos.z)<1.9&&Math.abs(c.pos.y-e.pos.y)<2.4){e.khit=1;hitTarget(c,20,e.kdir.clone().multiplyScalar(20).setY(7));shake=Math.max(shake,.25);sfx('slam',.5)}}
  if(e.kd<=0){e.vel.x*=.2;e.vel.z*=.2;e.cdK=rnd(3.5,5.5)}return}
 e.ac=0;e.vel.x+=(to.x*e.speed-e.vel.x)*Math.min(1,dt*6);e.vel.z+=(to.z*e.speed-e.vel.z)*Math.min(1,dt*6);
 if(e.blue&&e.onGround&&dist>3.5&&dist<9&&(e.cdK=(e.cdK??rnd(1,2.5))-dt)<=0){e.kw=.4;sfx('charge',.4);return}
 if(dist<2.4&&e.cd<=0)e.wind=.35;else if(e.onGround&&e.cdJ<=0&&dist>4.5&&dist<17)go('crouch')}
function ketoAnim(e,dt){const K=e.g.userData.keto;if(!K)return;const hs=e.remote?(e.hs||0):Math.hypot(e.vel.x,e.vel.z);if(e.remote){e.hs=e.lp?Math.min(16,e.pos.distanceTo(e.lp)/Math.max(dt,1e-3)):0;e.lp=(e.lp||new V3()).copy(e.pos)}
 const ac=e.ac||0,k=Math.min(1,dt*12);e.rt=(e.rt||0)+dt*(3+hs*.9);const run=Math.min(1,hs/9);
 K.legs.forEach((l,i)=>{const ph=Math.sin(e.rt+i*Math.PI);let hx=ph*.9*run,kx=Math.max(0,-ph)*1.3*run;if(ac===2){hx=-.9;kx=1.6}else if(ac===3){hx=-.5;kx=.9}l.hip.rotation.x+=(hx-l.hip.rotation.x)*k;l.kn.rotation.x+=(kx-l.kn.rotation.x)*k});
 const by=ac===2?1.05:1.45+Math.abs(Math.sin(e.rt))*.15*run;K.body.position.y+=(by-K.body.position.y)*k;K.legs.forEach(l=>l.hip.position.y=K.body.position.y);K.body.rotation.x+=((ac===1?.35:ac===3?-.2:.08*run)-K.body.rotation.x)*k;
 e.eyes.color.setHex(ac===1||ac===2?0xffffff:0xffcc33)}
let kmarks=[];
function ketoMark(x,y,z,host,hex){hex=hex||(curMap==='l4'?BLUE:0xff2a3a);const m=new THREE.Mesh(MARK_G,new THREE.MeshBasicMaterial({color:hex,transparent:true,opacity:.8,depthWrite:false,side:THREE.DoubleSide}));m.position.set(x,y+.08,z);m.scale.setScalar(3.2);scene.add(m);
 const f=new THREE.Mesh(GOO_G,new THREE.MeshBasicMaterial({color:hex,transparent:true,opacity:.2,depthWrite:false}));f.position.copy(m.position);f.scale.setScalar(.1);scene.add(f);kmarks.push({m,f,x,y,z,t:1,host});if(host&&mp())pushFx(['A',0,9,r1(x),r1(y),r1(z)])}
function updKmarks(dt){for(const k of kmarks){k.t-=dt;const a=1-Math.max(0,k.t);k.f.scale.setScalar(3.2*a);k.m.material.opacity=.5+.4*Math.sin(T*24);
  if(k.t<=0){scene.remove(k.m);scene.remove(k.f);const p=new V3(k.x,k.y+.2,k.z);ring(p,3.6,0xff5a3a);puff(p,40,0xf2efe8,9,.6);sfx('slam',.7*Math.max(.3,sndV(k.x,k.y,k.z)));shake=Math.max(shake,.3*sndV(k.x,k.y,k.z));
   if(k.host)for(const c of targets()){const d=Math.hypot(c.pos.x-k.x,c.pos.z-k.z);if(d<3.2&&Math.abs(c.pos.y-k.y)<1.6)hitTarget(c,20,new V3(c.pos.x-k.x,0,c.pos.z-k.z).normalize().multiplyScalar(10).setY(7))}}}
 kmarks=kmarks.filter(k=>k.t>0)}

/* ================= уровень 3 в списке ================= */
LEVELS.push({id:'l3',n:3,name:'ПИВНОЕ МОРЕ',sub:'Яхта «Пенная Леди» качается на пивных волнах. Пенный вал смывает всех за борт, кеги взрываются от выстрела.',
 desc:'Пенные валы смывают врагов за борт. Кеги взрываются. За бортом тонет грязнулька — кинь ей круг.',boss:'Альтушка 10/10',diff:6,par:480,build:buildL3,start:[0,0,46],open:[0],
 rooms:[{name:'КАЮТ-КОМПАНИЯ',trig:[-10.4,10.4,2.5,26.6],bounds:[-10.4,10.4,2.1,27.9],cp:[0,0,26.3],entry:0,exit:1,
   sp:[[-3,0,8],[2,0,10.5],[0,0,4],[6,0,20],[-4,0,19.5],[-6,0,5],[6.5,0,23.5],[2,0,24.6],[-2,3.2,14],[3,3.2,10]],waves:[{vend:4,can:3},{vend:3,can:3,drone:3}]},
  {name:'ПРОМЕНАД',trig:[-12.8,12.8,-43,-.6],bounds:[-13.4,13.4,-44,1],cp:[0,0,-1.6],entry:1,exit:2,
   sp:[[-8,0,-6],[8,0,-6],[-5,0,-16],[5,0,-28.5],[-8,0,-38],[8,0,-37.5],[0,0,-34],[0,0,-10],[-4,4.5,-20],[4,4.5,-30]],waves:[{vend:4,can:4,drone:2},{bambun:1,vend:3,jelly:2},{bambun:2,can:4,vend:2,drone:2}]},
  {name:'КОРМОВАЯ ПАЛУБА',trig:[-12.8,12.8,-92,-57],bounds:[-13.4,13.4,-96,-44.6],cp:[0,0,-50],entry:2,exit:null,bossAt:[0,0,-88],
   sp:[[-6,0,-60],[10,0,-60],[-11,0,-77],[11,0,-77],[-9,0,-92],[8.5,0,-92.5],[0,0,-60],[-4,5,-70],[4,5,-84]],waves:[{alt:1}],
   rein:[{at:.8,w:{can:4,vend:2}},{at:.5,w:{bambun:1,drone:2,jelly:2}},{at:.25,w:{can:4,vend:2,drone:2}}]}]});
/* ---------- парашют Альтушки: купол из клиньев, кромка-фестоны, вытяжное отверстие, стропы до плеч, ткань «дышит» ---------- */
function chuteTex(){if(GT.chute)return GT.chute;const t=cTex(1024,256,(g,w,h)=>{const n=16;for(let i=0;i<n;i++){const x=i*w/n;g.fillStyle=i%2?'#ff4fa8':'#fff3f8';g.fillRect(x,0,w/n+1,h);
  if(i%4===1){g.fillStyle='rgba(255,79,168,.9)';g.save();g.translate(x+w/n/2,h*.55);g.beginPath();g.moveTo(0,10);g.bezierCurveTo(-26,-12,-12,-32,0,-16);g.bezierCurveTo(12,-32,26,-12,0,10);g.fill();g.restore()}}
 const gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,'rgba(0,0,0,.18)');gr.addColorStop(.25,'rgba(0,0,0,0)');gr.addColorStop(.9,'rgba(0,0,0,0)');gr.addColorStop(1,'rgba(60,0,30,.35)');g.fillStyle=gr;g.fillRect(0,0,w,h);
 g.strokeStyle='rgba(120,20,70,.55)';g.lineWidth=3;for(let i=0;i<=n;i++){g.beginPath();g.moveTo(i*w/n,0);g.lineTo(i*w/n,h);g.stroke()}g.fillStyle='#d0207a';g.fillRect(0,h-10,w,10)});t.wrapS=THREE.RepeatWrapping;return GT.chute=t}
function buildChute(){const c=new THREE.Group(),G=16,SEG=10,R=2.1,H=1.35;const pos=[],uv=[],idx=[];
 // купол: G клиньев, каждый выгнут наружу между швами; снизу фестоны
 const C=G*8;for(let j=0;j<=SEG;j++){const v=j/SEG,phi=.12+v*(Math.PI/2*1.04-.12);for(let i=0;i<=C;i++){const a=i/C*Math.PI*2,gp=(i%8)/8,bul=Math.sin(gp*Math.PI)*.09*(.4+v);
   const r=R*Math.sin(phi)*(1+bul),y=H*Math.cos(phi)-(j===SEG?Math.sin(gp*Math.PI)*.12:0);pos.push(Math.cos(a)*r,y,Math.sin(a)*r);uv.push(i/C,1-v)}}
 for(let j=0;j<SEG;j++)for(let i=0;i<C;i++){const a=j*(C+1)+i,b=a+1,d=a+C+1,e=d+1;idx.push(a,d,b,b,d,e)}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();
 const cm=new THREE.MeshStandardMaterial({map:chuteTex(),side:THREE.DoubleSide,roughness:.7,emissive:0x2a0818,emissiveIntensity:.4});const dome=new THREE.Mesh(g,cm);dome.castShadow=true;c.add(dome);
 const vent=new THREE.Mesh(new THREE.TorusGeometry(R*Math.sin(.12),.03,6,24),new THREE.MeshStandardMaterial({color:0xd0207a}));vent.rotation.x=Math.PI/2;vent.position.y=H*Math.cos(.12);c.add(vent);
 // стропы: от каждого шва к плечам (обновляются каждый кадр в мировых координатах)
 const lg=new THREE.BufferGeometry();lg.setAttribute('position',new THREE.Float32BufferAttribute(new Float32Array(G*2*3+12),3));const lines=new THREE.LineSegments(lg,new THREE.LineBasicMaterial({color:0x2a2030}));lines.frustumCulled=false;mapGroup.add(lines);
 c.userData={dome,base:pos.slice(),lines,G,C,SEG,R,H};return c}
const _cw=new V3(),_cs=new V3();
function updChute(c,G,t,flare){const u=c.userData,p=u.dome.geometry.attributes.position,b=u.base;
 // ткань дышит: клинья то надуваются, то опадают, кромка трепещет; при подлёте к машине купол «гасится»
 for(let k=0;k<p.count;k++){const x=b[k*3],y=b[k*3+1],z=b[k*3+2],a=Math.atan2(z,x),v=1-Math.max(0,y)/u.H,br=1+.035*Math.sin(t*3.1)+.025*Math.sin(t*7.3+a*4)*v*v,dn=flare*.25*v;p.setXYZ(k,x*br*(1+dn*.4),y-dn*.6+Math.sin(t*9+a*8)*.03*v*v*v,z*br*(1+dn*.4))}
 p.needsUpdate=true;u.dome.geometry.computeVertexNormals();
 if(!G||!u.lines.visible)return;c.updateMatrixWorld(true);const lp=u.lines.geometry.attributes.position;G.g.updateMatrixWorld(true);
 const L=G.J.lSh||G.J.lEl||G.J.spine,Rr=G.J.rSh||G.J.rEl||G.J.spine;const pl=L.getWorldPosition(new V3()).add(_cs.set(0,.35,0)),pr=Rr.getWorldPosition(new V3()).add(_cs.set(0,.35,0));
 const sk=(u.SEG)*(u.C+1);for(let i=0;i<u.G;i++){const vi=sk+i*8;_cw.fromBufferAttribute(p,vi);c.localToWorld(_cw);const tgt=Math.cos(i/u.G*Math.PI*2)>0?pr:pl;lp.setXYZ(i*2,_cw.x,_cw.y,_cw.z);lp.setXYZ(i*2+1,tgt.x,tgt.y,tgt.z)}
 lp.setXYZ(u.G*2,pl.x,pl.y,pl.z);lp.setXYZ(u.G*2+1,pl.x,pl.y-.4,pl.z);lp.setXYZ(u.G*2+2,pr.x,pr.y,pr.z);lp.setXYZ(u.G*2+3,pr.x,pr.y-.4,pr.z);lp.needsUpdate=true}
/*BEER-END*/