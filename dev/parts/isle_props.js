/* ================= ОСТРОВ: постройки, реквизит, живность ================= */
function isleMats(){if(L4&&L4.M)return L4.M;let sd=17;const r=()=>(sd=(sd*16807)%2147483647)/2147483647;
 const T=(w,h,f,rep)=>{const t=cTex(w,h,f);t.wrapS=t.wrapT=THREE.RepeatWrapping;if(rep)t.repeat.set(rep[0],rep[1]);return t};
 const plank=T(512,512,(g,w,h)=>{for(let i=0;i<8;i++){const v=140+r()*40|0;const gr=g.createLinearGradient(0,i*64,0,i*64+60);gr.addColorStop(0,`rgb(${v},${v*.72|0},${v*.48|0})`);gr.addColorStop(1,`rgb(${v*.85|0},${v*.6|0},${v*.4|0})`);g.fillStyle=gr;g.fillRect(0,i*64,w,60);
   for(let k=0;k<40;k++){g.strokeStyle=`rgba(70,45,25,${.15+r()*.2})`;g.lineWidth=1;g.beginPath();const y=i*64+r()*60;g.moveTo(0,y);g.bezierCurveTo(w*.3,y+r()*6-3,w*.7,y+r()*6-3,w,y);g.stroke()}
   g.fillStyle='#3a2618';g.fillRect(0,i*64+60,w,4);const x=r()*w;g.fillRect(x,i*64,3,60);for(const xx of[x+12,x-12]){g.fillStyle='#555';g.beginPath();g.arc(xx,i*64+14,2.5,0,7);g.arc(xx,i*64+46,2.5,0,7);g.fill()}}});
 const thatch=T(512,512,(g,w,h)=>{g.fillStyle='#a47e3a';g.fillRect(0,0,w,h);for(let i=0;i<5000;i++){const x=r()*w,y=r()*h,l=20+r()*40;g.strokeStyle=r()<.5?`rgba(90,60,25,${.3+r()*.4})`:`rgba(230,200,120,${.3+r()*.4})`;g.lineWidth=1+r()*1.5;g.beginPath();g.moveTo(x,y);g.lineTo(x+(r()-.5)*6,y+l);g.stroke()}});
 const fringe=T(512,256,(g,w,h)=>{for(let i=0;i<700;i++){const x=r()*w,l=h*(.55+r()*.45);const gr=g.createLinearGradient(0,0,0,l);gr.addColorStop(0,'#8a6428');gr.addColorStop(1,r()<.5?'#d8b468':'#b88f45');g.strokeStyle=gr;g.lineWidth=2+r()*3;g.beginPath();g.moveTo(x,0);g.lineTo(x+(r()-.5)*14,l);g.stroke()}});
 const bamboo=T(128,512,(g,w,h)=>{const gr=g.createLinearGradient(0,0,w,0);gr.addColorStop(0,'#8a7a3a');gr.addColorStop(.5,'#d8c27a');gr.addColorStop(1,'#8a7a3a');g.fillStyle=gr;g.fillRect(0,0,w,h);for(let y=60;y<h;y+=120){g.fillStyle='#6a5a28';g.fillRect(0,y,w,8);g.fillStyle='#f0dc98';g.fillRect(0,y+8,w,3)}});
 const stone=T(512,512,(g,w,h)=>{g.fillStyle='#b9ad98';g.fillRect(0,0,w,h);for(let y=0;y<h;y+=64)for(let x=((y/64)%2)*64;x<w+64;x+=128){const v=175+r()*45|0;g.fillStyle=`rgb(${v},${v*.95|0},${v*.86|0})`;g.fillRect(x+3,y+3,122,58);
   for(let k=0;k<80;k++){g.fillStyle=r()<.5?'rgba(80,70,60,.25)':'rgba(255,250,240,.2)';g.fillRect(x+3+r()*122,y+3+r()*58,2,2)}g.fillStyle='rgba(90,120,60,.18)';if(r()<.4)g.fillRect(x+3,y+50,122,11)}});
 const tile=T(256,256,(g,w,h)=>{g.fillStyle='#e8f6f8';g.fillRect(0,0,w,h);for(let y=0;y<h;y+=32)for(let x=0;x<w;x+=32){g.fillStyle=`rgb(${200+r()*20|0},${235+r()*15|0},${240+r()*12|0})`;g.fillRect(x+1,y+1,30,30)}});
 const pave=T(512,512,(g,w,h)=>{g.fillStyle='#d8d0c0';g.fillRect(0,0,w,h);for(let y=0;y<h;y+=128)for(let x=0;x<w;x+=128){const v=205+r()*30|0;g.fillStyle=`rgb(${v},${v*.97|0},${v*.9|0})`;g.fillRect(x+3,y+3,122,122);for(let k=0;k<200;k++){g.fillStyle=r()<.5?'rgba(120,110,95,.2)':'rgba(255,255,255,.25)';g.fillRect(x+3+r()*122,y+3+r()*122,2,2)}}});
 const plaza=T(512,512,(g,w,h)=>{g.fillStyle='#efe6d4';g.fillRect(0,0,w,h);for(let y=0;y<h;y+=64)for(let x=0;x<w;x+=64){const c=((x+y)/64)%2?'#e6dbc6':'#f4ecdc';g.fillStyle=c;g.fillRect(x+2,y+2,60,60)}g.strokeStyle='#c8a050';g.lineWidth=4;g.strokeRect(2,2,w-4,h-4);g.beginPath();g.arc(w/2,h/2,90,0,7);g.stroke()});
 const stripe=T(64,512,(g,w,h)=>{for(let i=0;i<10;i++){g.fillStyle=i%2?'#f6f4ee':'#2f6ad8';g.fillRect(0,i*h/10,w,h/10)}g.fillStyle='rgba(0,0,0,.05)';for(let i=0;i<300;i++)g.fillRect(r()*w,r()*h,2,2)});
 const stucco=T(256,256,(g,w,h)=>{g.fillStyle='#f4f1ea';g.fillRect(0,0,w,h);for(let i=0;i<3000;i++){g.fillStyle=r()<.5?'rgba(200,190,175,.25)':'rgba(255,255,255,.5)';g.fillRect(r()*w,r()*h,2,2)}});
 const slat=T(256,256,(g,w,h)=>{for(let x=0;x<w;x+=16){const v=120+r()*30|0;g.fillStyle=`rgb(${v},${v*.7|0},${v*.45|0})`;g.fillRect(x,0,13,h);g.fillStyle='#2a1c12';g.fillRect(x+13,0,3,h)}});
 const net=T(256,64,(g,w,h)=>{g.strokeStyle='#f4f4f0';g.lineWidth=2;for(let x=0;x<=w;x+=12){g.beginPath();g.moveTo(x,0);g.lineTo(x,h);g.stroke()}for(let y=0;y<=h;y+=12){g.beginPath();g.moveTo(0,y);g.lineTo(w,y);g.stroke()}g.fillStyle='#f4f4f0';g.fillRect(0,0,w,7)});
 const cloth=T(256,256,(g,w,h)=>{g.fillStyle='#fbf8f0';g.fillRect(0,0,w,h);for(let x=0;x<w;x+=64){g.fillStyle='rgba(60,150,190,.55)';g.fillRect(x+6,0,18,h);g.fillStyle='rgba(60,150,190,.25)';g.fillRect(x+28,0,5,h)}g.fillStyle='rgba(0,0,0,.05)';for(let i=0;i<500;i++)g.fillRect(r()*w,r()*h,1,6);g.fillStyle='#d8a838';g.fillRect(0,h-14,w,10);for(let x=0;x<w;x+=10){g.fillRect(x,h-4,5,4)}});
 const parasol=(a,b)=>T(256,256,(g,w,h)=>{for(let i=0;i<16;i++){g.fillStyle=i%2?a:b;g.beginPath();g.moveTo(w/2,h/2);g.arc(w/2,h/2,w*.71,i/16*6.283,(i+1)/16*6.283);g.fill()}});
 const M=(o)=>new THREE.MeshStandardMaterial(Object.assign({roughness:.7},o));
 return {plank:M({map:plank,roughness:.85}),thatch:M({map:thatch,roughness:.95,side:THREE.DoubleSide}),fringe:M({map:fringe,alphaTest:.4,side:THREE.DoubleSide,roughness:.95,transparent:false}),bamboo:M({map:bamboo,roughness:.6}),
  stone:M({map:stone,roughness:.85}),tile:M({map:tile,roughness:.25,envMap:ENV,envMapIntensity:.4}),pave:M({map:pave,roughness:.85,color:0xbfb4a2}),plaza:M({map:plaza,roughness:.85,color:0xb3a894}),stripe:M({map:stripe,roughness:.45}),stucco:M({map:stucco,roughness:.65,color:0xe8e4da}),slat:M({map:slat,roughness:.75}),
  net:new THREE.MeshBasicMaterial({map:net,transparent:true,side:THREE.DoubleSide,alphaTest:.3}),cloth:M({map:cloth,side:THREE.DoubleSide,roughness:.9}),
  white:M({color:0xe6e1d6,roughness:.55}),cream:M({color:0xefe4cc,roughness:.8}),gold:M({color:0xf2c14b,metalness:1,roughness:.2,envMap:ENV}),glass:M({color:0x9fd8f0,roughness:.03,metalness:.4,transparent:true,opacity:.38,envMap:ENV,envMapIntensity:1.2}),
  dglass:M({color:0x1a2a34,roughness:.05,metalness:.6,envMap:ENV,envMapIntensity:1.1}),wood:M({color:0x7a5236,roughness:.7}),dwood:M({color:0x4a3020,roughness:.75}),rope:M({color:0xcfae78,roughness:.95}),
  blue:M({color:0x2f6ad8,roughness:.4}),red:M({color:0xe23a3a,roughness:.5}),dark:M({color:0x23262c,roughness:.5,metalness:.4}),chrome:M({color:0xdfe6ee,metalness:1,roughness:.18,envMap:ENV}),
  cushion:[['#f6f0e2','#d8cdb4'],['#2f8fa8','#f6f4ee'],['#f2b84b','#fff2cc'],['#e0506e','#f6f4ee']].map(([c1,c2])=>M({map:T(128,128,(g,w,h)=>{g.fillStyle=c1;g.fillRect(0,0,w,h);g.fillStyle=c2;for(let x=0;x<w;x+=32)g.fillRect(x,0,12,h);g.fillStyle='rgba(0,0,0,.12)';g.fillRect(0,0,w,3);g.fillRect(0,h-3,w,3)}),roughness:.92})),towel:[['#ff6fb0','#fff4e8'],['#5fe0c8','#f6f4ee'],['#f2b84b','#e0506e'],['#6f8cff','#ffffff']].map(([c1,c2])=>M({map:T(128,256,(g,w,h)=>{g.fillStyle=c1;g.fillRect(0,0,w,h);g.fillStyle=c2;for(let y=0;y<h;y+=48){g.fillRect(0,y,w,14);g.fillRect(0,y+20,w,4)}g.fillStyle='rgba(255,255,255,.5)';for(let x=0;x<w;x+=8)g.fillRect(x,0,3,6),g.fillRect(x,h-6,3,6)}),roughness:.95})),
  par:[M({map:parasol('#f6f2e8','#2f6ad8'),side:THREE.DoubleSide,roughness:.8}),M({map:parasol('#f6f2e8','#e0506e'),side:THREE.DoubleSide,roughness:.8}),M({map:parasol('#f6f2e8','#2fa88f'),side:THREE.DoubleSide,roughness:.8})],
  water:new THREE.MeshStandardMaterial({color:0x40c8e8,roughness:.05,metalness:.1,transparent:true,opacity:.75,envMap:ENV,envMapIntensity:1,emissive:0x0a5060,emissiveIntensity:.5}),
  lamp:new THREE.MeshBasicMaterial({color:0xfff0c8}),flame:new THREE.MeshBasicMaterial({color:0xffa030,transparent:true,opacity:.9,blending:THREE.AdditiveBlending,depthWrite:false}),
  hedge:leafMat(vegTextures().bush,.4,0xc8e0b0),leaf:M({color:0x3f9a3a,roughness:.7})}}
/* ---------- помощники ---------- */
const tY=(x,z)=>TERR?TERR.h(x,z):0;
function grp(x,y,z,ry=0){const g=new THREE.Group();g.position.set(x,y,z);g.rotation.y=ry;mapGroup.add(g);return g}
function gm(g,geo,mat,x=0,y=0,z=0,rx=0,ry=0,rz=0,cast=true){const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.rotation.set(rx,ry,rz);m.castShadow=cast;m.receiveShadow=true;g.add(m);return m}
const BX=(w,h,d)=>new THREE.BoxGeometry(w,h,d),CY=(r0,r1,h,s=10)=>new THREE.CylinderGeometry(r0,r1,h,s);
// твёрдый ящик в мировых координатах с учётом поворота группы на 0/90°
function solidR(x,y,z,w,h,d){solid(x,y,z,w,h,d)}
// соломенная крыша: конус + несколько «юбок» бахромы
function thatchRoof(g,y,rad,h,sides=8,rot=0){const M=L4.M,t=new THREE.Group();t.position.y=y;g.add(t);
 // конус и ярусы бахромы — в одной группе: масштаб крыши (сплющивание) применяется ко всему сразу
 const c=gm(t,new THREE.ConeGeometry(rad,h,sides,1,true),M.thatch,0,h/2,0,0,rot);c.material=M.thatch;
 const R=yy=>rad*(1-yy/h);for(let k=0;k<3;k++){const yy=k*h*.3,b=yy-.42,tp=yy+.12;
  const s=gm(t,new THREE.CylinderGeometry(R(tp)+.05,R(b)+.12+(k?0:.08),tp-b+(k?0:.18),sides,1,true),M.fringe,0,(tp+b)/2-(k?0:.09),0,0,rot);s.castShadow=true}
 return t}
// факел: бамбук + пламя, мерцает
/* ворота-шлюз острова: пилоны и перемычка (с коллизией), створка с рамой и полосами, огни-индикаторы —
   вертикальные планки на гранях пилонов (а не висящие в воздухе), фундамент-порог под «утопающей» створкой */
function isleGate(d,o){const M=L4.M,g=d.g,w=d.w,h=d.h,pw=o.pw||.9,pd=o.pd||1,lt=o.lt||.7,pm=o.pm||M.stone,tm=o.tm||M.gold,fr=o.fr||M.dark;
 if(o.posts!==false)for(const s of[-1,1]){const px=s*(w/2+pw/2);gm(g,BX(pw,h+lt,pd),pm,px,(h+lt)/2,0);if(o.cap){gm(g,BX(pw+.22,.24,pd+.22),tm,px,h+lt+.12,0);gm(g,BX(pw*.6,.3,pd*.6),pm,px,h+lt+.39,0)}
  gm(g,BX(pw+.12,.2,pd+.12),pm,px,.1,0);solid(d.x+px,d.y,d.z,pw,h+lt,pd)}
 if(lt>0){const lw=w+(o.posts!==false?pw*2:.4);gm(g,BX(lw,lt,pd),o.lm||pm,0,h+lt/2,0);gm(g,BX(lw+.06,.1,pd+.06),tm,0,h+lt-.05,0);gm(g,BX(w,.08,pd+.04),fr,0,h+.04,0);solid(d.x,d.y+h,d.z,w,lt,pd)}
 if(o.sign)for(const sz of o.signBack?[-1,1]:[1]){const sg=wsign(o.sign,d.x,d.y+h+lt/2,d.z+sz*(pd/2+.02),sz>0?0:Math.PI,Math.min(w,o.sw||w*.8),Math.min(lt*.72,.62),'#f6f4ee',o.sbg||'#2f6ad8')}
 // огни: прячем старые планки над проёмом, ставим вертикальные полосы по краям проёма с обеих сторон
 for(const m of g.children)if(m.material===d.lm)m.visible=false;
 const lx=o.lx!=null?o.lx:w/2+.13,lz=o.lz!=null?o.lz:pd/2+.035,lh=Math.min(h*.6,2.2);
 for(const s of[-1,1])for(const sz of[-1,1]){const l=new THREE.Mesh(BX(.1,lh,.06),d.lm);l.position.set(s*lx,h*.5,sz*lz);g.add(l)}
 // створка: рама, две полосы, заклёпки — едут вместе со створкой
 const dress=sl=>{const sw=d.slabs?w/2:w,dd=d.slabs?.18:.56;for(const s of[-1,1]){const a=new THREE.Mesh(BX(.14,h,dd),fr);a.position.x=s*(sw/2-.07);sl.add(a);const b=new THREE.Mesh(BX(sw,.14,dd),fr);b.position.y=s*(h/2-.07);sl.add(b)}
  for(const yy of[-.22,.22]){const b=new THREE.Mesh(BX(sw-.28,.1,dd+.02),o.bm||tm);b.position.y=yy*h;sl.add(b)}
  if(!d.slabs){const e=new THREE.Mesh(new THREE.CylinderGeometry(.42,.42,dd+.04,16).rotateX(Math.PI/2),o.bm||tm);sl.add(e)}else{const e=new THREE.Mesh(BX(.1,h*.5,dd+.03),o.bm||tm);e.position.x=(sl===d.slabs[0]?1:-1)*(sw/2-.2);sl.add(e)}};
 if(d.slabs)d.slabs.forEach(dress);else dress(d.slab);
 // фундамент: под утопающей створкой — короб до земли, чтобы она пряталась
 if(o.sill){const sh=o.sill===true?h+.4:o.sill;gm(g,BX(w+.3,sh,Math.max(.8,(d.slabs?.18:.5)+.3)),o.sm||M.dwood,0,-sh/2-.002,0)}
 return d}
function torch(x,z,y){y=y??tY(x,z);const M=L4.M,g=grp(x,y,z);gm(g,CY(.05,.07,1.7,8),M.bamboo,0,.85,0);gm(g,CY(.11,.07,.3,8),M.dwood,0,1.8,0);const f=gm(g,new THREE.ConeGeometry(.12,.45,8),M.flame,0,2.15,0,0,0,0,false);f.userData.dyn=1;
 L4.flames.push({f,ph:Math.random()*6});plight(x,y+2.2,z,0xff9a40,.35,7);solid(x,y,z,.2,1.9,.2)}
/* ---------- причал ---------- */
function buildPier(){const M=L4.M,Y=.2,Z0=27,Z1=100,W=5.2;
 // настил: доски поперёк, с зазорами (один инстанс-меш)
 const pl=[];for(let z=Z0;z<Z1;z+=.24)pl.push([0,Y-.04,z+.1]);const im=new THREE.InstancedMesh(BX(W,.08,.21),M.plank,pl.length),o=new THREE.Object3D();pl.forEach((p,i)=>{o.position.set(p[0],p[1],p[2]);o.rotation.y=(Math.random()-.5)*.01;o.updateMatrix();im.setMatrixAt(i,o.matrix)});im.receiveShadow=true;im.castShadow=true;mapGroup.add(im);
 for(const s of[-1,1]){decoW(s*(W/2-.15),Y-.42,(Z0+Z1)/2,.22,.34,Z1-Z0,M.dwood,2)}solid(0,Y-1.2,(Z0+Z1)/2,W,1.2,Z1-Z0);
 // сваи до дна, канатные перила на столбах
 for(let z=Z0+2;z<=Z1;z+=4)for(const s of[-1,1]){const bot=Math.min(-1,tY(s*2.4,z))-.6,h=Y-bot+.9;deco(CY(.15,.18,h,8),M.dwood,s*2.45,bot+h/2,z).castShadow=true}
 for(const s of[-1,1]){const posts=[];for(let z=Z0+1;z<=Z1-1;z+=3){if(z>35.5&&z<40.5)continue;posts.push(z);deco(CY(.07,.08,1.15,8),M.wood,s*2.45,Y+.55,z)}
  for(let i=1;i<posts.length;i++){if(posts[i]-posts[i-1]>3.5)continue;const a=new V3(s*2.45,Y+1.02,posts[i-1]),b=new V3(s*2.45,Y+1.02,posts[i]),m=a.clone().lerp(b,.5);m.y-=.18;deco(new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(a,m,b),8,.025,5,false),M.rope,0,0,0)}
  solid(s*2.5,Y,(Z0+Z1)/2+5,.25,1.1,Z1-Z0-10)}
 solid(0,Y,Z1+.2,W,1.1,.3);
 // фонари
 for(const z of[48,66,84]){solid(-2.45,Y,z,.2,2.8,.2);const g=grp(-2.45,Y,z);gm(g,CY(.05,.06,2.4,8),M.dark,0,1.2,0);gm(g,BX(.3,.05,.3),M.dark,0,2.3,0);gm(g,BX(.22,.34,.22),M.lamp,0,2.5,0,0,0,0,false);for(const [dx,dz] of[[-1,-1],[1,-1],[-1,1],[1,1]])gm(g,BX(.03,.36,.03),M.dark,dx*.12,2.5,dz*.12);gm(g,new THREE.ConeGeometry(.24,.18,4),M.dark,0,2.76,0,0,Math.PI/4);plight(-2.45,Y+2.5,z,0xffe0a0,.3,9)}
 // швартовые тумбы, ящики, спасательный круг
 for(const z of[56,90])for(const s of[-1,1]){solid(s*2.05,Y,z,.45,.5,.45);deco(CY(.16,.2,.45,10),M.dark,s*2.05,Y+.22,z);deco(CY(.22,.22,.06,10),M.dark,s*2.05,Y+.47,z)}
 addBoxW(1.6,Y,60,1,.8,.8,M.wood,1);addBoxW(1.75,Y+.8,60.1,.7,.5,.6,M.wood,1);
 // арка-ворота острова с вывеской и дверью-шлюзом
 {const g=grp(0,Y,38);for(const s of[-1,1]){gm(g,CY(.28,.32,4.6,10),M.dwood,s*3.35,2.3,0);gm(g,CY(.4,.4,.2,10),M.gold,s*3.35,4.6,0)}gm(g,BX(7.8,.45,.55),M.dwood,0,4.4,0);gm(g,BX(8.2,.18,.7),M.gold,0,4.7,0);
  thatchRoof(g,4.8,5.2,1.4,4,Math.PI/4).scale.z=.35;
  wsign('ОСТРОВ ПЕПСШТЕЙНА · ЧАСТНАЯ ТЕРРИТОРИЯ',0,Y+3.75,38.3,0,7.2,.7,'#f6f4ee','#2f6ad8');for(const s of[-1,1])solid(s*3.6,Y,38,1.2,4.6,.8)}
 isleGate(addDoor(0,Y,38,6,3.3,true,M.plank,'sink'),{posts:false,lt:0,lx:3.35,lz:.33,sill:3.6,sm:M.dwood});
 // лодки у причала
 L4.boats=[];{const b=boatModel(0xffffff,0x2f6ad8);b.position.set(6.2,SEA4_Y,76);b.rotation.y=.05;mapGroup.add(b);L4.boats.push({g:b,x:6.2,z:76,ry:.05});const j=jetski();j.position.set(-5.4,SEA4_Y,70);j.rotation.y=-.4;mapGroup.add(j);L4.boats.push({g:j,x:-5.4,z:70,ry:-.4})}}
function boatModel(c1,c2){const M=L4.M,g=new THREE.Group(),hull=new THREE.Mesh(latheG([[0,-.2],[.9,-.1],[1.1,.4],[1.15,.8],[0,.8]],16),new THREE.MeshStandardMaterial({color:c1,roughness:.3,envMap:ENV}));hull.scale.set(1,1,3.2);g.add(hull);
 const st=new THREE.Mesh(BX(2.3,.18,6.2),new THREE.MeshStandardMaterial({color:c2,roughness:.4}));st.position.y=.55;g.add(st);const dk=new THREE.Mesh(BX(1.9,.06,5.6),M.plank);dk.position.y=.8;g.add(dk);
 const ws=new THREE.Mesh(BX(1.8,.5,.06),M.glass);ws.position.set(0,1.1,.6);ws.rotation.x=-.5;g.add(ws);const seat=new THREE.Mesh(BX(1.6,.35,.8),M.cushion[0]);seat.position.set(0,.98,-1);g.add(seat);
 const mot=new THREE.Mesh(BX(.5,.8,.5),M.dark);mot.position.set(0,.6,-3.3);g.add(mot);g.traverse(o=>{if(o.isMesh){o.castShadow=true}});g.userData.dyn=1;return g}
function jetski(){const g=new THREE.Group(),b=new THREE.Mesh(new THREE.SphereGeometry(.6,14,10),new THREE.MeshStandardMaterial({color:0xe23a3a,roughness:.3,envMap:ENV}));b.scale.set(.9,.55,2.2);b.position.y=.25;g.add(b);
 const s=new THREE.Mesh(BX(.45,.25,.9),L4.M.dark);s.position.set(0,.6,-.3);g.add(s);const h=new THREE.Mesh(CY(.04,.04,.9,6),L4.M.chrome);h.rotation.z=Math.PI/2;h.position.set(0,.85,.45);g.add(h);g.traverse(o=>{if(o.isMesh)o.castShadow=true});g.userData.dyn=1;return g}
/* ---------- пляж ---------- */
function lounger(x,z,ry,ci,yo){const M=L4.M,y=yo??tY(x,z),g=grp(x,y,z,ry);const fr=M.wood;
 gm(g,BX(.7,.07,1.4),fr,0,.32,.25);for(let i=0;i<7;i++)gm(g,BX(.66,.03,.1),M.plank,0,.37,-.35+i*.18);
 const back=new THREE.Group();back.position.set(0,.36,-.45);back.rotation.x=-.85;g.add(back);gm(back,BX(.7,.06,.8),fr,0,0,-.4);gm(back,BX(.62,.08,.72),M.cushion[ci%4],0,.06,-.4);
 gm(g,BX(.62,.08,1.3),M.cushion[ci%4],0,.42,.25);gm(g,BX(.6,.012,1.6),M.towel[ci%4],0,.47,.15);for(const s of[-1,1])for(const zz of[-.35,.85])gm(g,BX(.05,.32,.05),fr,s*.32,.16,zz);solid(x,y,z,1,.5,1)}
function parasol(x,z,ci,tilt=0,yo){const M=L4.M,y=yo??tY(x,z),g=grp(x,y,z,Math.random()*6);g.rotation.z=tilt;gm(g,CY(.035,.035,2.7,8),M.wood,0,1.35,0);solid(x,y,z,.15,2.3,.15);
 const top=gm(g,new THREE.ConeGeometry(1.7,.55,16,1,true),M.par[ci%3],0,2.6,0);const fr=gm(g,new THREE.CylinderGeometry(1.7,1.72,.12,32,1,true),M.par[ci%3],0,2.3,0);gm(g,new THREE.SphereGeometry(.07,8,6),M.wood,0,2.9,0)}
function strawUmbrella(x,z){const M=L4.M,y=tY(x,z),g=grp(x,y,z,Math.random()*6);gm(g,CY(.06,.07,2.6,8),M.bamboo,0,1.3,0);thatchRoof(g,2.35,1.9,.7,10);solid(x,y,z,.2,2.4,.2)}
function cabana(x,z,ry){const M=L4.M,y=tY(x,z),g=grp(x,y,z,ry);
 gm(g,BX(3.6,.25,3.2),M.plank,0,.12,0);for(const [px,pz] of[[-1.65,-1.45],[1.65,-1.45],[-1.65,1.45],[1.65,1.45]])gm(g,CY(.08,.1,2.9,8),M.bamboo,px,1.45,pz);
 for(const s of[-1,1]){gm(g,BX(3.6,.1,.1),M.bamboo,0,2.85,s*1.45);gm(g,BX(.1,.1,3),M.bamboo,s*1.65,2.85,0)}thatchRoof(g,2.85,2.9,1.3,4,Math.PI/4).scale.set(1.05,1,.95);
 gm(g,BX(2.8,.35,2.2),M.cushion[0],0,.42,0);for(let i=0;i<3;i++)gm(g,BX(.7,.35,.18),M.cushion[1+i%3],-.8+i*.8,.75,-.95,-.25);
 L4.curtains=L4.curtains||[];for(const [px,pz,rr] of[[-1.65,0,Math.PI/2],[1.65,0,Math.PI/2]]){const geo=new THREE.PlaneGeometry(2.6,2.4,10,6);const c=gm(g,geo,M.cloth,px,1.6,pz,0,rr);c.userData.base=geo.attributes.position.array.slice();c.userData.dyn=1;L4.curtains.push(c)}
 g.updateMatrixWorld(true);for(const [px,pz] of[[-1.65,-1.45],[1.65,-1.45],[-1.65,1.45],[1.65,1.45]]){const w=new V3(px,0,pz).applyMatrix4(g.matrixWorld);solid(w.x,y,w.z,.25,2.9,.25)}solid(x,y,z,3.4,.6,3)}
function tikiBar(x,z,ry){const M=L4.M,y=tY(x,z),g=grp(x,y,z,ry);
 gm(g,BX(8,.3,5),M.plank,0,.15,0);for(const [px,pz] of[[-3.8,-2.3],[3.8,-2.3],[-3.8,2.3],[3.8,2.3]])gm(g,CY(.14,.16,3.4,8),M.bamboo,px,1.85,pz);
 thatchRoof(g,3.4,5.8,1.8,4,Math.PI/4).scale.set(1,1,.72);
 // стойка из бамбука
 const cnt=new THREE.Group();g.add(cnt);cnt.position.set(0,.3,1.2);for(let i=0;i<34;i++)gm(cnt,CY(.09,.09,1.05,8),M.bamboo,-3.3+i*.2,.52,0);gm(cnt,BX(7,.12,.9),M.wood,0,1.1,0);
 for(let i=0;i<4;i++){gm(g,CY(.22,.22,.08,12),M.wood,-2.4+i*1.6,.95,2.3);gm(g,CY(.04,.05,.65,6),M.bamboo,-2.4+i*1.6,.6,2.3)}
 // полки с бутылками, кокосы, вывеска
 for(const yy of[1.3,1.9])gm(g,BX(6,.06,.4),M.wood,0,yy,-1.8);for(const sx of[-1,1])gm(g,BX(.08,1.2,.42),M.wood,sx*3.02,1.62,-1.8);
 for(let i=0;i<36;i++)gm(g,CY(.085,.085,2.95,7),M.bamboo,-3.5+i*.2,1.78,-2.12);gm(g,BX(7.4,.14,.24),M.wood,0,3.2,-2.12);gm(g,BX(7.4,.1,.22),M.wood,0,.42,-2.12);
 gsolid(g,0,.3,-2.12,7.3,2.9,.3);const bt=[];for(let i=0;i<22;i++)bt.push([-2.7+(i%11)*.52,i<11?1.33:1.93,-1.8]);
 const bm=[new THREE.MeshStandardMaterial({color:0x3aa0e0,roughness:.1,envMap:ENV}),new THREE.MeshStandardMaterial({color:0x2f8a3a,roughness:.1,envMap:ENV}),new THREE.MeshStandardMaterial({color:0xe0a030,roughness:.1,envMap:ENV})];
 bt.forEach((p,i)=>gm(g,bottleGeo,bm[i%3],p[0],p[1],p[2]));for(let i=0;i<5;i++)gm(g,new THREE.SphereGeometry(.14,10,8),new THREE.MeshStandardMaterial({color:0x5a3a1a}),-1.8+i*.9,1.27,1.25);
 const sg=wsign('TIKI · КОКОСЫ · ГАЗИРОВКА',0,0,0,0,5.4,.6,'#3a2010','#f2c14b');mapGroup.remove(sg);sg.position.set(0,3.1,2.42);g.add(sg);
 for(const s of[-1,1]){const l=gm(g,new THREE.SphereGeometry(.18,10,8),M.lamp,s*2.6,3,2.2,0,0,0,false)}plight(x,y+3,z,0xffc070,.5,12);
 g.updateMatrixWorld(true);for(let i=0;i<4;i++){const w=new V3(-2.4+i*1.6,0,2.3).applyMatrix4(g.matrixWorld);solid(w.x,y,w.z,.5,1,.5)}for(const [px,pz] of[[-3.8,-2.3],[3.8,-2.3],[-3.8,2.3],[3.8,2.3]]){const w=new V3(px,0,pz).applyMatrix4(g.matrixWorld);solid(w.x,y,w.z,.35,3.4,.35)}const c=new V3(0,0,1.2).applyMatrix4(g.matrixWorld);solid(c.x,y,c.z,Math.abs(Math.cos(ry))*7+Math.abs(Math.sin(ry))*1,1.25,Math.abs(Math.sin(ry))*7+Math.abs(Math.cos(ry))*1)}
// AABB повёрнутого вокруг Y бокса внутри группы g (ly — низ относительно группы)
function gsolid(g,lx,ly,lz,w,h,d){g.updateMatrixWorld(true);const c=new V3(lx,0,lz).applyMatrix4(g.matrixWorld),a=g.rotation.y,cs=Math.abs(Math.cos(a)),sn=Math.abs(Math.sin(a));solid(c.x,g.position.y+ly,c.z,cs*w+sn*d,h,sn*w+cs*d)}
function lifeguard(x,z,ry){const M=L4.M,y=tY(x,z)-.05,g=grp(x,y,z,ry);const rw=new THREE.MeshStandardMaterial({color:0xe23a3a,roughness:.55}),ww=M.white;
 // сваи, утопленные в песок, и раскосы
 for(const [px,pz] of[[-1,-1],[1,-1],[-1,1],[1,1]])gm(g,CY(.09,.11,2.9,8),ww,px*.95,1.2,pz*.95);
 const th=Math.atan2(1.9,2.2);for(const s of[-1,1])for(const k of[-1,1]){gm(g,BX(.06,2.9,.06),ww,s*.95,1.3,0,k*th,0,0);gm(g,BX(.06,2.9,.06),ww,0,1.3,s*.95,0,0,k*th)}
 // площадка, будка (три стенки + перила спереди), крыша на стойках
 gm(g,BX(2.5,.16,2.5),M.plank,0,2.6,0);gm(g,BX(2.6,.1,2.6),ww,0,2.48,0);
 gm(g,BX(2.3,1.05,.1),rw,0,3.2,-1.15);for(const s of[-1,1]){gm(g,BX(.1,1.05,2.3),rw,s*1.15,3.2,0);gm(g,BX(.08,1.05,.08),ww,s*.5,3.2,1.17)}
 gm(g,BX(2.4,.1,.1),ww,0,3.7,1.17);gm(g,BX(2.4,.08,.08),ww,0,3.15,1.17);gm(g,BX(1.4,.42,.04),ww,0,3.32,-1.22);
 for(const s of[-1,1])for(const t of[-1,1])gm(g,CY(.05,.05,.95,6),ww,s*1.12,4.18,t*1.12);gm(g,BX(2.9,.14,2.9),rw,0,4.7,0);gm(g,BX(3,.06,3),ww,0,4.61,0);
 // лестница: две тетивы от песка до края площадки, ступени между ними
 const L=Math.hypot(1.95,2.68),ra=-Math.atan2(1.95,2.68);for(const s of[-1,1])gm(g,BX(.08,L,.12),ww,s*.47,1.34,2.25,ra,0,0);
 for(let i=1;i<=7;i++){const t=i/8;gm(g,BX(.9,.06,.24),M.plank,0,t*2.68,3.22-t*1.95)}
 const fl=gm(g,new THREE.PlaneGeometry(1,.6),new THREE.MeshStandardMaterial({color:0xe23a3a,side:THREE.DoubleSide}),.5,5.75,0);gm(g,CY(.03,.03,1.3,6),ww,0,5.4,0);L4.flags.push({m:fl,base:.5});
 const ring=gm(g,new THREE.TorusGeometry(.28,.08,8,18),new THREE.MeshStandardMaterial({color:0xff5a2a,roughness:.5}),.75,3.25,1.25);
 // коллизия: опора под площадкой, стенки будки, ступени лестницы
 gsolid(g,0,0,0,2.4,2.68,2.4);gsolid(g,0,2.68,-1.15,2.3,1.05,.14);for(const s of[-1,1])gsolid(g,s*1.15,2.68,0,.14,1.05,2.3);
 for(let i=1;i<=7;i++){const t=i/8;gsolid(g,0,0,3.22-t*1.95,.9,t*2.68,.26)}}
function volleyball(x,z){const M=L4.M,y=tY(x,z);for(const s of[-1,1]){deco(CY(.06,.06,2.6,8),M.white,x+s*4.2,y+1.3,z).castShadow=true;solid(x+s*4.2,y,z,.15,2.5,.15)}
 const n=deco(new THREE.PlaneGeometry(8.4,1),M.net,x,y+2,z);n.material.side=THREE.DoubleSide;
 const lm=new THREE.MeshBasicMaterial({color:0xf2f0e8});for(const [w,d,ox,oz] of[[16,.08,0,-4],[16,.08,0,4],[.08,8,-8,0],[.08,8,8,0]]){const l=deco(new THREE.PlaneGeometry(w,d).rotateX(-Math.PI/2),lm,x+ox,0,z+oz);l.position.y=tY(x+ox,z+oz)+.04;l.userData.dyn=1}
 const ball=deco(new THREE.SphereGeometry(.22,16,12),new THREE.MeshStandardMaterial({map:cTex(128,64,(g,w,h)=>{for(let i=0;i<6;i++){g.fillStyle=['#ffffff','#f2c14b','#2f6ad8'][i%3];g.fillRect(i*w/6,0,w/6,h)}})}),x-2,tY(x-2,z+2)+.22,z+2)}
function surfRack(x,z,ry){const M=L4.M,y=tY(x,z),g=grp(x,y,z,ry);for(const s of[-1,1])gm(g,BX(.1,1.6,.1),M.wood,s*1.2,.8,0);gm(g,BX(2.6,.1,.1),M.wood,0,1.5,0);
 const cols=[0xff6fb0,0x5fe0c8,0xf2b84b,0x6f8cff];for(let i=0;i<4;i++){const b=gm(g,new THREE.SphereGeometry(.3,12,8),new THREE.MeshStandardMaterial({color:cols[i],roughness:.3,envMap:ENV}),-.9+i*.6,1.2,.25,-.25);b.scale.set(.9,4.6,.18)}solid(x,y,z,2.6,1.5,.6)}
function kayak(x,z,ry,col){const y=tY(x,z),k=deco(new THREE.SphereGeometry(.45,14,8),new THREE.MeshStandardMaterial({color:col,roughness:.35,envMap:ENV}),x,y+.18,z,ry);k.scale.set(.75,.4,4.8);k.castShadow=true;solid(x,y,z,.8,.4,.8)}
function firePit(x,z){const M=L4.M,y=tY(x,z);solid(x,y,z,1.7,.35,1.7);for(let i=0;i<3;i++){const a=i*2.1,lx=x+Math.cos(a)*2.4,lz=z+Math.sin(a)*2.4;solid(lx,tY(lx,lz),lz,1.2,.45,1.2)}for(let i=0;i<10;i++){const a=i*.628;deco(new THREE.DodecahedronGeometry(.2,0),rockMat(),x+Math.cos(a)*.75,y+.1,z+Math.sin(a)*.75).castShadow=true}
 for(let i=0;i<4;i++){const l=deco(CY(.08,.08,1.1,6),M.dwood,x,y+.2,z,i*.8);l.rotation.z=1.2}L4.smokes.push({p:new V3(x,y+.4,z),r:.6,c:0xd8d0c8,f:true});
 for(let i=0;i<3;i++){const a=i*2.1,lx=x+Math.cos(a)*2.4,lz=z+Math.sin(a)*2.4,lg=deco(CY(.22,.22,1.8,10),M.wood,lx,tY(lx,lz)+.22,lz,a+Math.PI/2);lg.rotation.z=Math.PI/2;lg.castShadow=true}}
function sandcastle(x,z){solid(x,tY(x,z),z,1.4,.9,1.4);const y=tY(x,z),m=new THREE.MeshStandardMaterial({color:0xd9c08a,roughness:1});deco(CY(.6,.7,.4,10),m,x,y+.2,z);deco(CY(.35,.42,.55,10),m,x,y+.6,z);for(let i=0;i<4;i++){const a=i*1.57;deco(CY(.13,.16,.55,8),m,x+Math.cos(a)*.55,y+.45,z+Math.sin(a)*.55);deco(new THREE.ConeGeometry(.15,.22,8),m,x+Math.cos(a)*.55,y+.84,z+Math.sin(a)*.55)}}
function cooler(x,z,ry){solid(x,tY(x,z),z,.75,.55,.75);const y=tY(x,z),g=grp(x,y,z,ry);gm(g,BX(.7,.45,.45),new THREE.MeshStandardMaterial({color:0x2f6ad8,roughness:.4}),0,.22,0);gm(g,BX(.72,.08,.47),L4.M.white,0,.48,0);
 const can=new THREE.MeshStandardMaterial({color:0x2a58c8,metalness:.8,roughness:.25,envMap:ENV});for(let i=0;i<3;i++)gm(g,CY(.045,.045,.15,10),can,-.15+i*.15,.6,0)}
/* ---------- арена пляжа: крупные игровые формы вместо россыпи мелочи ---------- */
// Сан-дек: дощатое возвышение (запрыгнуть / подняться по ступени со стороны моря), пара шезлонгов у задней кромки.
function sunDeck(x,z,w,d,h){const M=L4.M;let y=-99;for(const [a,b] of[[-1,-1],[1,-1],[-1,1],[1,1],[0,0]])y=Math.max(y,tY(x+a*w/2,z+b*d/2));const top=y+h;
 decoW(x,y-.5,z,w,h+.5-.14,d,M.dwood,2).castShadow=true;decoW(x,top-.14,z,w+.3,.14,d+.3,M.plank,1).receiveShadow=true;
 for(const s of[-1,1])for(const t of[-1,1])decoW(x+s*(w/2-.1),y-.5,z+t*(d/2-.1),.28,h+.42,.28,M.wood,1);
 solid(x,y-.5,z,w+.3,h+.5,d+.3);
 // лесенка со стороны моря: ступени ≤ .45 (игрок сам шагает на ≤ .55)
 const sw=w*.55,sd=.75,ts=tY(x,z+d/2+.9),n=Math.max(1,Math.ceil((top-ts)/.45)-1);
 for(let k=1;k<=n;k++){const st=ts+(top-ts)*k/(n+1),zc=z+d/2+.15+(n-k+.5)*sd;decoW(x,y-.5,zc,sw,st-y+.5,sd,M.plank,1).receiveShadow=true;solid(x,y-.5,zc,sw,st-y+.5,sd)}
 for(let i=0;i<2;i++)lounger(x-w/2+1+i*1.3,z-d/2+.9,Math.PI,i+1,top);parasol(x+w/2-1.1,z-d/2+1,1,.05,top);return top}
// Скальный выступ: три сросшихся валуна — укрытие и высота; верх ходибельный (rockCollide поднимает рельеф).
function rockOutcrop(x,z){const rm=rockMat(),rg=rockGeo(311,3);
 for(const [ox,oz,sx,sy,sz,ry] of[[0,0,2.8,1.6,2.3,.3],[2.4,-1.3,1.8,2.4,1.6,1.1],[-2.1,1.3,1.5,1,1.4,2]]){const px=x+ox,pz=z+oz,y=tY(px,pz);
  const m=deco(rg,rm,px,y-.25,pz,ry);m.scale.set(sx,sy,sz);m.castShadow=m.receiveShadow=true;m.userData.dyn=1;m.updateMatrix();rockCollide(rg,m.matrix,rg);
  solid(px,y-1,pz,sx*1.35,sy*.95+.75,sz*1.35)}}
/* ---------- ворота в джунгли ---------- */
function jungleGate(){const M=L4.M,y=1.25,g=grp(0,y,-1);const st=rockMat();
 for(const s of[-1,1]){gm(g,BX(1.3,4.4,1.3),M.stone,s*3.75,2.2,0);gm(g,BX(1.6,.4,1.6),M.stone,s*3.75,4.55,0);const fc=tikiFace();fc.position.set(s*3.75,2.6,.7);g.add(fc)}
 gm(g,BX(9.2,.9,1.4),M.stone,0,5.1,0);gm(g,BX(9.8,.25,1.7),M.stone,0,5.65,0);
 for(const s of[-1,1])solid(s*3.75,y,-1,1.5,5.5,1.5);
 wsign('ДЖУНГЛИ ▸',0,y+4.95,-.27,0,3,.6,'#f6f4ee','#3f7a2a');torch(-5.2,1.8);torch(5.2,1.8)}
function tikiFace(){const g=new THREE.Group(),m=new THREE.MeshStandardMaterial({color:0x6a5040,roughness:.9});const b=new THREE.Mesh(BX(.9,1.6,.25),m);g.add(b);
 const dk=new THREE.MeshStandardMaterial({color:0x2a1a10});for(const s of[-1,1]){const e=new THREE.Mesh(BX(.22,.14,.1),dk);e.position.set(s*.2,.35,.12);g.add(e)}const mo=new THREE.Mesh(BX(.5,.18,.1),dk);mo.position.set(0,-.35,.12);g.add(mo);
 const n=new THREE.Mesh(BX(.16,.4,.12),m);n.position.set(0,0,.16);g.add(n);for(let i=0;i<5;i++){const t=new THREE.Mesh(BX(.06,.1,.05),new THREE.MeshStandardMaterial({color:0xf0e8d0}));t.position.set(-.2+i*.1,-.35,.17);g.add(t)}return g}
/* ---------- джунгли: водопад, ручей, мостик, руины, идол ---------- */
function buildJungleProps(){const M=L4.M;
 // водопад со скалы в заводь
 const fx=-17.2,fz=-21,top=10.5,bot=.35;{const wt=cTex(256,1024,(g,w,h)=>{g.fillStyle='rgba(210,240,250,.35)';g.fillRect(0,0,w,h);for(let i=0;i<700;i++){const x=Math.random()*w,l=40+Math.random()*200,y=Math.random()*h;const gr=g.createLinearGradient(0,y,0,y+l);gr.addColorStop(0,'rgba(255,255,255,0)');gr.addColorStop(.5,'rgba(235,250,255,.85)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(x,y,2+Math.random()*4,l)}});
  wt.wrapS=wt.wrapT=THREE.RepeatWrapping;wt.repeat.set(1,2);const wm=new THREE.MeshBasicMaterial({map:wt,transparent:true,opacity:.85,depthWrite:false,side:THREE.DoubleSide,color:0xd8f4ff});
  const geo=new THREE.PlaneGeometry(3.2,top-bot,1,12);const p=geo.attributes.position;for(let i=0;i<p.count;i++){const yy=p.getY(i),k=(yy+(top-bot)/2)/(top-bot);p.setZ(i,Math.pow(1-k,2)*-1.2)}
  const wf=deco(geo,wm,fx+1.6,(top+bot)/2,fz,Math.PI/2);wf.userData.dyn=1;L4.fall={m:wf,t:wt};const wf2=deco(geo,wm.clone(),fx+1.9,(top+bot)/2,fz+.3,Math.PI/2+.15);wf2.scale.set(.7,1,1);wf2.userData.dyn=1;L4.fall2=wf2;
  L4.mist={p:new V3(fx+2.6,bot+.3,fz),t:0}}
 // заводь и ручей: лента воды по руслу
 {const C=[[-17.5,-21],[-12,-23.5],[-6,-25],[0,-27.5],[6,-26.5],[11,-28.5],[17.5,-31]];const pts=[];for(let i=0;i<C.length-1;i++)for(let k=0;k<8;k++){const t=k/8;pts.push([C[i][0]+(C[i+1][0]-C[i][0])*t,C[i][1]+(C[i+1][1]-C[i][1])*t])}pts.push(C[C.length-1]);
  const P=[],UV=[],I=[];let acc=0;const Y=.42;for(let i=0;i<pts.length;i++){const a=pts[Math.max(0,i-1)],b=pts[Math.min(pts.length-1,i+1)],tx=b[0]-a[0],tz=b[1]-a[1],L=Math.hypot(tx,tz)||1,nx=-tz/L,nz=tx/L,w=i<4?2.9:1.9;
   if(i)acc+=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);P.push(pts[i][0]+nx*w,Y,pts[i][1]+nz*w,pts[i][0]-nx*w,Y,pts[i][1]-nz*w);UV.push(0,acc/4,1,acc/4);if(i){const q=(i-1)*2;I.push(q,q+2,q+1,q+1,q+2,q+3)}}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(UV,2));g.setIndex(I);g.computeVertexNormals();
  const ft=cTex(256,256,(g2,w,h)=>{g2.fillStyle='#3aa0b0';g2.fillRect(0,0,w,h);for(let i=0;i<300;i++){g2.strokeStyle=`rgba(230,250,255,${.1+Math.random()*.25})`;g2.lineWidth=1+Math.random()*2;const x=Math.random()*w,y=Math.random()*h;g2.beginPath();g2.moveTo(x,y);g2.bezierCurveTo(x+8,y+10,x-8,y+20,x,y+30);g2.stroke()}});ft.wrapS=ft.wrapT=THREE.RepeatWrapping;
  const cm=new THREE.MeshStandardMaterial({map:ft,transparent:true,opacity:.78,roughness:.05,metalness:.2,envMap:ENV,envMapIntensity:1.1,depthWrite:false});const cr=new THREE.Mesh(g,cm);cr.userData.dyn=1;cr.renderOrder=2;mapGroup.add(cr);L4.creek=ft;
  // кувшинки и камни у русла
  const lily=new THREE.MeshStandardMaterial({color:0x4a9a3a,roughness:.6,side:THREE.DoubleSide});for(let i=0;i<9;i++){const x=-15+Math.random()*4,z=-23+Math.random()*4;const l=deco(new THREE.CircleGeometry(.35,10,.3,5.9).rotateX(-Math.PI/2),lily,x,Y+.02,z,Math.random()*6);l.userData.dyn=1}
  for(let i=0;i<3;i++){const f=deco(new THREE.SphereGeometry(.12,8,6),new THREE.MeshStandardMaterial({color:0xff8ac0}),-14+i*1.2,Y+.08,-22.5+i*.4);f.scale.y=.6}}
 // деревянный мостик над ручьём на тропе
 {const z0=-27.5+.2,x0=jPath(-27.5),g=grp(x0,0,z0);for(let i=0;i<13;i++)gm(g,BX(2.4,.1,.32),M.plank,0,1.15+Math.sin(i/12*Math.PI)*.35,-2.1+i*.35);for(const s of[-1,1]){for(let i=0;i<4;i++)gm(g,CY(.06,.07,1.3,6),M.dwood,s*1.2,1.6,-2+i*1.33);gm(g,BX(.08,.08,4.4),M.dwood,s*1.2,2.25,0)}
  for(let i=0;i<13;i++)solid(x0,0,z0-2.1+i*.35,2.4,1.2+Math.sin(i/12*Math.PI)*.35,.36);for(const s of[-1,1])solid(x0+s*1.2,0,z0,.18,2.3,4.2)}
 // руины: колонны, обломки, каменный идол
 const st=M.stone;for(const [x,z,h,br] of[[-9,-12,3.4,0],[-6.5,-12.5,2.1,1],[9,-15,3,0],[11,-36,2.4,1],[-10.5,-39,3.8,0]]){const y=tY(x,z),g=grp(x,y,z,Math.random());gm(g,BX(1.1,.4,1.1),st,0,.2,0);gm(g,CY(.38,.42,h,12),st,0,.4+h/2,0);if(!br)gm(g,BX(1.1,.35,1.1),st,0,.4+h+.17,0);else gm(g,BX(.9,.1,.9),st,.1,.4+h,0,.2,0,.15);solid(x,y,z,1,h+.6,1)}
 {const x=-3,z=-14.5,y=tY(x,z),f=deco(CY(.4,.42,3.2,12),st,x,y+.4,z);f.rotation.z=Math.PI/2;f.rotation.y=.6;f.castShadow=true;solid(x,y,z,2.4,.8,1.6)}
 {const x=7,z=-41,y=tY(x,z),g=grp(x,y,z,-.5);const sm=new THREE.MeshStandardMaterial({color:0x8a8070,roughness:.95});gm(g,BX(2.2,1,1.8),st,0,.5,0);
  const h=gm(g,BX(1.7,3.4,1.4),sm,0,2.7,0);gm(g,BX(1.9,.5,1.6),sm,0,4.5,.05);gm(g,BX(.5,1.1,.5),sm,0,2.9,.8);for(const s of[-1,1]){gm(g,BX(.45,.25,.12),new THREE.MeshStandardMaterial({color:0x222018}),s*.42,3.45,.71);gm(g,BX(.3,.8,.3),sm,s*.95,2.8,0)}
  gm(g,BX(1,.18,.12),new THREE.MeshStandardMaterial({color:0x222018}),0,2.05,.71);const moss=new THREE.MeshStandardMaterial({color:0x4f7a3a,roughness:1});gm(g,BX(1.92,.15,1.62),moss,0,4.8,.05);solid(x,y,z,2.4,5,2.2)}
 // лестница к вилле с факелами и стеной-оградой
 stairsY(0,-50.6,0,1,8,6,1.05,4,M.stone);for(const s of[-1,1]){addBoxW(s*4.6,tY(s*4.6,-47.5),-47.6,.9,4.2-tY(s*4.6,-47.5)+.4,6,M.stone,2)}
 torch(-3.9,-45.2);torch(3.9,-45.2)}
// лестница с произвольной высотой основания: n ступеней от y0 до y1, идёт против (dx,dz)
function stairsY(x,z,dx,dz,w,n,y0,y1,mat){const rise=(y1-y0)/n,run=.8;for(let k=1;k<=n;k++){const o=(n-k)*run+run/2,px=x+dx*o,pz=z+dz*o;addBoxW(px,y0-1.5,pz,dx?run:w,k*rise+1.5,dz?run:w,mat,2)}}
/* ---------- вилла на плато y=4 ---------- */
function buildVilla(){const M=L4.M,Y=4;
 // ограда с воротами со стороны джунглей + стеклянные перила над обрывами
 for(const [a,b] of[[-34,-3.1],[3.1,34]]){addBoxW((a+b)/2,Y,-50.9,b-a,2.6,.6,M.stucco,2);decoW((a+b)/2,Y+2.6,-50.9,b-a+.1,.12,.75,M.cream,2)}
 const bal=(x0,z0,x1,z1)=>{const L=Math.hypot(x1-x0,z1-z0),ry=Math.atan2(x1-x0,z1-z0),cx=(x0+x1)/2,cz=(z0+z1)/2;const g=grp(cx,Y,cz,ry);gm(g,BX(.06,2.5,L),M.glass,0,1.3,0,0,0,0,false);gm(g,BX(.12,.08,L),M.chrome,0,2.58,0);gm(g,BX(.14,.12,L),M.chrome,0,.06,0);for(let t=-L/2;t<=L/2;t+=2.4)gm(g,BX(.08,2.6,.08),M.chrome,0,1.3,t);for(const e of[-1,1])gm(g,BX(.18,2.7,.18),M.chrome,0,1.35,e*L/2);solid(cx,Y,cz,Math.abs(x1-x0)+.3,2.6,Math.abs(z1-z0)+.3)};
 bal(-33.6,-51.5,-33.6,-101.5);bal(33.6,-51.5,33.6,-101.5);for(const [a0,b0] of[[-34,-7.1],[7.1,34]]){addBoxW((a0+b0)/2,Y-.2,-102.6,b0-a0,5.3,1.2,M.stone,2);decoW((a0+b0)/2,Y-.2,-101.95,b0-a0,.5,.12,M.dark,2);for(let x=a0+2;x<b0-1;x+=4){decoW(x,Y+.3,-101.98,.7,4.6,.14,M.stone,1)}}
 // дорожки из плитки
 const pv=(x,z,w,d)=>{const m=decoW(x,Y-.08,z,w,.12,d,M.pave,2);m.receiveShadow=true};pv(0,-62,4,22);pv(-6,-74,12,3.2);pv(8,-91,22,3.2);pv(0,-97,6,8);
 // дом: два объёма, панорамное стекло, деревянные ламели, плоские крыши с выносом
 const H=grp(-21,Y,-76);const hx=-21,hz=-76;
 gm(H,BX(16,.4,22),M.pave,0,.2,0);                                  // цоколь
 gm(H,BX(.5,4,22),M.stucco,-7.75,2.4,0);gm(H,BX(16,4,.5),M.stucco,0,2.4,-10.75);gm(H,BX(16,4,.5),M.stucco,0,2.4,10.75);   // глухие стены
 gm(H,BX(.12,3.8,20),M.glass,7.8,2.3,0,0,0,0,false);for(let z=-10;z<=10;z+=2.5)gm(H,BX(.16,3.9,.12),M.dark,7.85,2.35,z);   // стеклянный фасад к бассейну
 gm(H,BX(17.6,.45,24),M.white,.8,4.6,0);gm(H,BX(17.8,.08,24.2),M.dark,.8,4.85,0);
 const up=new THREE.Group();up.position.set(-2,4.85,-2);H.add(up);gm(up,BX(12,3.4,14),M.stucco,0,1.7,0);gm(up,BX(.1,2.6,12),M.dglass,6.05,1.6,0,0,0,0,false);gm(up,BX(12.2,.1,.1),M.dark,0,.05,7.05);
 for(let z=-6.5;z<=6.5;z+=.35)gm(up,BX(.12,3.2,.14),M.slat,6.2,1.7,z);gm(up,BX(14.5,.4,16.5),M.white,1,3.6,0);gm(up,BX(4,.1,6),M.dglass,0,3.85,0,0,0,0,false);
 // глухие стены снаружи: окна-щели в рамах, вертикальные ламели, бра — дом не выглядит коробкой
 for(const zz of[-6.5,0,6.5]){gm(H,BX(.08,1.15,4.4),M.dglass,-8.04,2.7,zz,0,0,0,false);for(const yy of[2.07,3.33])gm(H,BX(.14,.1,4.6),M.dark,-8.06,yy,zz);for(const dz of[-2.25,2.25])gm(H,BX(.14,1.36,.1),M.dark,-8.06,2.7,zz+dz)}
 for(let z=-10.4;z<=-9.3;z+=.28)gm(H,BX(.14,3.7,.12),M.slat,-8.1,2.45,z);for(let z=9.3;z<=10.4;z+=.28)gm(H,BX(.14,3.7,.12),M.slat,-8.1,2.45,z);
 for(const sz of[-1,1]){gm(H,BX(3.4,2.7,.08),M.dglass,2.6,2.35,sz*11.04,0,0,0,false);gm(H,BX(3.6,.12,.14),M.dark,2.6,3.76,sz*11.06);gm(H,BX(3.6,.12,.14),M.dark,2.6,.98,sz*11.06);
  for(let x=-6.9;x<=-3.6;x+=.3)gm(H,BX(.12,3.7,.14),M.slat,x,2.45,sz*11.09);gm(H,BX(.3,.3,.2),M.lamp,-1.2,3.1,sz*11.12,0,0,0,false)}
 gm(up,BX(.08,.95,9),M.dglass,-6.04,2,0,0,0,0,false);gm(up,BX(.12,.1,9.2),M.dark,-6.06,1.48,0);for(const sz of[-1,1])gm(up,BX(5.5,.95,.08),M.dglass,0,2,sz*7.04,0,0,0,false);
 // интерьер за стеклом: диван, ковёр, лампы, кухонный остров, картина
 gm(H,BX(5,.04,7),new THREE.MeshStandardMaterial({color:0xd8c8a8,roughness:1}),2,.42,0);gm(H,BX(1,.5,4.4),M.cushion[0],-2,.65,0);gm(H,BX(.35,.9,4.4),M.cushion[0],-2.5,.85,0);for(let i=0;i<3;i++)gm(H,BX(.2,.4,.5),M.cushion[1+i],-2.2,1,-1.2+i*1.2);
 gm(H,BX(1.4,.4,2.2),M.wood,1.2,.62,0);gm(H,BX(1.6,.95,4),M.white,2,.88,-6.5);gm(H,BX(1.7,.06,4.1),M.dark,2,1.36,-6.5);gm(H,BX(.1,1.6,2.6),new THREE.MeshBasicMaterial({color:0x5fe0c8}),-7.45,2.4,3);
 for(const z of[-4,0,4]){gm(H,new THREE.SphereGeometry(.28,12,10),M.lamp,1,3.7,z,0,0,0,false);plight(hx+1,Y+3.7,hz+z,0xffe2b0,.35,8)}
 solid(hx,Y,hz,16.2,4.85,22.2);solid(hx+.8,Y+4.6,hz,17.6,.25,24);solid(hx-1,Y+4.85,hz-2,14.5,3.8,16.5);
 // наружная лестница на крышу (там спавнятся враги)
 for(let k=0;k<11;k++)addBoxW(hx+9.5,Y,hz+10-k*.75,1.6,(k+1)*.42,.76,M.stucco,2);
 // бассейн-инфинити (утоплен в плато), шезлонги, фламинго
 const px=8,pz=-77,pw=16,pd=12,DY=Y+1;for(const [x,z,w,d] of[[px,pz-pd/2-.2,pw+.8,.4],[px,pz+pd/2+.2,pw+.8,.4],[px-pw/2-.2,pz,.4,pd],[px+pw/2+.2,pz,.4,pd]])addBoxW(x,Y,z,w,1.12,d,M.tile,2);
 addBoxW(px,Y,pz,pw,.1,pd,M.tile,2);const pwm=new THREE.MeshStandardMaterial({color:0x48d0ec,roughness:.03,metalness:.15,transparent:true,opacity:.72,envMap:ENV,envMapIntensity:1.2,emissive:0x0a5a70,emissiveIntensity:.45,depthWrite:false});
 const pool=deco(new THREE.PlaneGeometry(pw,pd,24,18).rotateX(-Math.PI/2),pwm,px,DY-.15,pz);pool.renderOrder=2;pool.userData.dyn=1;L4.pool=pool;L4.poolBase=pool.geometry.attributes.position.array.slice();
 for(const [x,z,w,d] of[[px,pz-pd/2-1.6,pw+4,2.4],[px,pz+pd/2+2.6,pw+4,4.4],[px+pw/2+1.6,pz,2.4,pd+5.6]])addBoxW(x,Y,z,w,1,d,M.plank,2);
 for(const [x,z,w,d] of[[px,pz+pd/2+5.05,6,.5],[px+pw/2+3.3,pz,1,4]])addBoxW(x,Y,z,w,.5,d,M.plank,2);
 {const fl=flamingo();fl.position.set(px+3,DY-.35,pz+1);mapGroup.add(fl);L4.flamingo=fl}
 for(let i=0;i<5;i++){const x=px-6+i*3;lounger(x,pz+pd/2+2.2,0,i,DY);if(i%2===0)parasol(x+1.5,pz+pd/2+4,i,0,DY)}
 // бар у бассейна, гриль с дымом, лаунж у камина
 {const g=grp(24,Y,-64);gm(g,BX(6,1.1,1.4),M.stucco,0,.55,0);gm(g,BX(6.4,.1,1.8),M.dark,0,1.15,0);gm(g,BX(6.8,.15,3.2),M.white,0,3.5,-.4);for(const s of[-1,1])for(const pz of[-1.6,.9])gm(g,CY(.08,.08,3.4,8),M.chrome,s*3.1,1.75,pz);
  for(let i=0;i<4;i++){gm(g,CY(.22,.22,.08,12),M.dark,-2.2+i*1.5,.85,1.2);gm(g,CY(.04,.04,.8,6),M.chrome,-2.2+i*1.5,.42,1.2)}solid(24,Y,-64,6,1.2,1.4);plight(24,Y+3,-64,0xffd090,.35,10)}
 {const x=26,z=-76,g=grp(x,Y,z);gm(g,BX(1.4,1,.8),M.dark,0,.5,0);gm(g,BX(1.5,.1,.9),M.chrome,0,1.02,0);solid(x,Y,z,1.4,1,.8);L4.smokes.push({p:new V3(x,Y+1.15,z),r:.4,c:0xe8e4e0})}
 {const x=-6,z=-92,g=grp(x,Y,z);gm(g,CY(.9,1,.45,16),M.stone,0,.22,0);const f=gm(g,new THREE.ConeGeometry(.35,.7,8),M.flame,0,.75,0,0,0,0,false);L4.flames.push({f,ph:1});plight(x,Y+1,z,0xff9a40,.4,8);
  for(let i=0;i<3;i++){const a=i*2.1+.5;const s=grp(x+Math.cos(a)*2.6,Y,z+Math.sin(a)*2.6,-a-Math.PI/2);gm(s,BX(2.2,.45,.9),M.white,0,.22,0);gm(s,BX(2.2,.25,.25),M.cushion[2],0,.55,-.35);solid(x+Math.cos(a)*2.6,Y,z+Math.sin(a)*2.6,1.6,.5,1.6)}solid(x,Y,z,1.8,.5,1.8)}
 // вертолётная площадка с вертолётом, гольф-кар, флагшток, скульптура
 {const x=22,z=-92;const hp=deco(CY(6,6,.14,48),M.dark,x,Y+.07,z);hp.receiveShadow=true;deco(new THREE.TorusGeometry(5.4,.1,6,64),new THREE.MeshBasicMaterial({color:0xf2c14b}),x,Y+.15,z).rotation.x=Math.PI/2;
  const H_=deco(new THREE.PlaneGeometry(3.6,4.4).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({map:signTex('H','#f6f4ee','rgba(0,0,0,0)',256,320,'bold 300px Arial'),transparent:true,depthWrite:false}),x,Y+.16,z);
  const h=heliModel();h.position.set(x,Y+.14,z);h.rotation.y=.6;mapGroup.add(h);L4.rotor=h.userData.rotor;solid(x,Y,z,3.4,3.4,6)}
 {const c=golfCart();c.position.set(-4,Y,-58);c.rotation.y=.4;mapGroup.add(c);solid(-4,Y,-58,1.8,1.5,2.6)}
 {deco(CY(.06,.08,9,8),M.chrome,30,Y+4.5,-55);const fl=deco(new THREE.PlaneGeometry(2.4,1.5,12,6),new THREE.MeshStandardMaterial({color:0x2f6ad8,side:THREE.DoubleSide,roughness:.8}),31.2,Y+8.2,-55);fl.userData.dyn=1;L4.flags.push({m:fl,base:1.2,cloth:fl.geometry.attributes.position.array.slice()})}
 {const g=grp(8,Y,-60);gm(g,BX(1.6,1.2,1.6),M.stucco,0,.6,0);gm(g,new THREE.SphereGeometry(1,32,20),M.gold,0,2.2,0);solid(8,Y,-60,1.6,3.2,1.6)}
 // живые изгороди и клумбы
 for(const [x,z,w,d] of[[-30,-58,2,12],[30,-84,2,10],[-14,-96,10,1.6],[14,-56,10,1.6]]){const m=decoW(x,Y,z,w,1.3,d,M.hedge,1);m.material=M.hedge;solid(x,Y,z,w,1.3,d)}
 // столбики-светильники
 for(const [x,z] of[[-2.4,-54],[2.4,-54],[-2.4,-66],[2.4,-66],[-12,-74],[18,-88],[-1,-90]]){deco(CY(.08,.08,.9,8),M.dark,x,Y+.45,z);deco(new THREE.SphereGeometry(.13,10,8),M.lamp,x,Y+.95,z)}
 // лестница к храму
 stairsY(0,-103.2,0,1,12,10,Y,9,M.stone);for(const s of[-1,1]){addBoxW(s*6.6,Y,-99.2,1,5.2,8,M.stone,2);const g=grp(s*6.6,Y+5.2,-95.6);gm(g,BX(1.3,.3,1.3),M.gold,0,.15,0);gm(g,new THREE.SphereGeometry(.45,16,12),M.gold,0,.75,0)}}
function flamingo(){const g=new THREE.Group(),m=new THREE.MeshStandardMaterial({color:0xff7ab8,roughness:.35});const b=new THREE.Mesh(new THREE.TorusGeometry(.6,.28,12,24),m);b.rotation.x=Math.PI/2;g.add(b);
 const n=new THREE.Mesh(new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(new V3(0,0,.6),new V3(0,1,.9),new V3(0,1.3,.5)),10,.11,8,false),m);g.add(n);const h=new THREE.Mesh(new THREE.SphereGeometry(.18,10,8),m);h.position.set(0,1.3,.5);g.add(h);
 const bk=new THREE.Mesh(new THREE.ConeGeometry(.06,.25,6),new THREE.MeshStandardMaterial({color:0x222222}));bk.rotation.x=Math.PI/2;bk.position.set(0,1.27,.72);g.add(bk);g.traverse(o=>{if(o.isMesh)o.castShadow=true});g.userData.dyn=1;return g}
function heliModel(){const M=L4.M,g=new THREE.Group(),bm=new THREE.MeshStandardMaterial({color:0x1f4fb8,metalness:.4,roughness:.3,envMap:ENV});
 const b=new THREE.Mesh(new THREE.SphereGeometry(1.4,24,16),bm);b.scale.set(1,.85,1.9);b.position.y=1.65;g.add(b);const gl=new THREE.Mesh(new THREE.SphereGeometry(1.2,20,12,0,Math.PI*2,0,Math.PI/2.2),M.dglass);gl.position.set(0,1.9,1.15);gl.rotation.x=.9;g.add(gl);
 const tl=new THREE.Mesh(CY(.18,.42,5,12),bm);tl.rotation.x=Math.PI/2;tl.position.set(0,2,-4);g.add(tl);const fin=new THREE.Mesh(BX(.12,1.3,.9),bm);fin.position.set(0,2.6,-6.3);g.add(fin);const tr=new THREE.Mesh(BX(.06,1.4,.12),M.dark);tr.position.set(.15,2.6,-6.4);g.add(tr);
 for(const s of[-1,1]){const sk=new THREE.Mesh(CY(.07,.07,3.6,8),M.chrome);sk.rotation.x=Math.PI/2;sk.position.set(s*1,.12,0);g.add(sk);for(const z of[-.9,.9]){const st=new THREE.Mesh(CY(.05,.05,.7,6),M.chrome);st.position.set(s*.8,.45,z);st.rotation.z=s*.4;g.add(st)}}
 const mast=new THREE.Mesh(CY(.12,.15,.5,8),M.dark);mast.position.y=3.1;g.add(mast);const rot=new THREE.Group();rot.position.y=3.38;g.add(rot);for(let i=0;i<4;i++){const bl=new THREE.Mesh(BX(.32,.05,4.4),M.dark);bl.position.z=2.2;const a=new THREE.Group();a.rotation.y=i*Math.PI/2;a.add(bl);rot.add(a)}
 g.traverse(o=>{if(o.isMesh)o.castShadow=true});g.userData.rotor=rot;g.userData.dyn=1;return g}
function golfCart(){const M=L4.M,g=new THREE.Group(),w=M.white;const b=new THREE.Mesh(BX(1.4,.55,2.4),w);b.position.y=.6;g.add(b);const s=new THREE.Mesh(BX(1.3,.25,.8),M.cushion[2]);s.position.set(0,1,-.3);g.add(s);const bk=new THREE.Mesh(BX(1.3,.6,.15),M.cushion[2]);bk.position.set(0,1.3,-.72);g.add(bk);
 const rf=new THREE.Mesh(BX(1.5,.08,2.2),M.cushion[1]);rf.position.y=2.05;g.add(rf);for(const sx of[-1,1])for(const sz of[-1,1]){const p=new THREE.Mesh(CY(.035,.035,1.1,6),M.chrome);p.position.set(sx*.65,1.5,sz*.95);g.add(p);const wh=new THREE.Mesh(CY(.28,.28,.2,14),M.dark);wh.rotation.z=Math.PI/2;wh.position.set(sx*.72,.28,sz*.8);g.add(wh)}
 g.traverse(o=>{if(o.isMesh)o.castShadow=true});g.userData.dyn=1;return g}
/* ---------- холм с храмом y=9 ---------- */
function buildTemple(){const M=L4.M,Y=9,TZ=-145;
 // площадь из плитки, балюстрада по краям
 {const pl=deco(new THREE.PlaneGeometry(40,30).rotateX(-Math.PI/2),M.plaza,0,Y+.025,-124);pl.receiveShadow=true;pl.material=M.plaza.clone();pl.material.map=M.plaza.map.clone();pl.material.map.repeat.set(5,3.75);pl.material.map.needsUpdate=true;pl.userData.dyn=1}
 const bal=(x0,z0,x1,z1)=>{const L=Math.hypot(x1-x0,z1-z0),ry=Math.atan2(x1-x0,z1-z0),g=grp((x0+x1)/2,Y,(z0+z1)/2,ry);gm(g,BX(.5,.2,L),M.stone,0,.1,0);gm(g,BX(.6,.15,L),M.stone,0,1.02,0);
  const n=Math.floor(L/.5);const im=new THREE.InstancedMesh(latheG([[.12,0],[.16,.1],[.09,.35],[.14,.6],[.1,.8],[0,.82]],10),M.stone,n),o=new THREE.Object3D();for(let i=0;i<n;i++){o.position.set(0,.18,-L/2+.25+i*.5);o.updateMatrix();im.setMatrixAt(i,o.matrix)}im.castShadow=true;g.add(im);
  for(const e of[-1,1]){gm(g,BX(.8,1.3,.8),M.stone,0,.65,e*L/2);gm(g,BX(.94,.14,.94),M.stone,0,1.37,e*L/2);gm(g,new THREE.SphereGeometry(.2,10,8),M.gold,0,1.62,e*L/2)}
  {const ox=x0===x1?Math.sign(x0)*.85:0,oz=z0===z1?(z0<-130?-.85:.85):0,hx=(x0+x1)/2+ox,hz=(z0+z1)/2+oz,hw=x0===x1?.9:Math.abs(x1-x0),hd=z0===z1?.9:Math.abs(z1-z0);const h=decoW(hx,Y,hz,hw,2.3,hd,M.hedge,1);h.material=M.hedge;h.castShadow=true;solid(hx,Y,hz,hw,2.3,hd)}
  solid((x0+x1)/2,Y,(z0+z1)/2,Math.abs(x1-x0)+1.2,2.5,Math.abs(z1-z0)+1.2)};
 bal(-27.6,-104,-27.6,-157);bal(27.6,-104,27.6,-157);bal(-27.6,-103.6,-6.5,-103.6);bal(6.5,-103.6,27.6,-103.6);bal(-27.6,-157.4,27.6,-157.4);
 isleGate(addDoor(0,Y,-103.4,6,3.2,false,M.dwood,'slide'),{pw:3.65,pd:1.2,lt:1.1,pm:M.stone,cap:1,sign:'ХРАМ ПЕПСШТЕЙНА',sw:5.2,sbg:'#1f3f8a',signBack:1});
 // полосатый храм с золотым куполом
 addBoxW(0,Y,TZ,16,.5,12.4,M.stone,2);addBoxW(0,Y+.5,TZ,15,7.2,11.4,M.stripe,2);
 for(const s of[-1,1])addBoxW(s*5.3,Y+.5,TZ+6.1,4.4,7.2,.6,M.stripe,2);decoW(0,Y+7.7,TZ,16.4,.6,12.8,M.white,2);decoW(0,Y+8.3,TZ,15,.3,11.6,M.gold,2);
 {const drum=deco(CY(4.6,4.8,1.4,32),M.white,0,Y+9.15,TZ);drum.castShadow=true;const dome=deco(new THREE.SphereGeometry(4.6,40,20,0,Math.PI*2,0,Math.PI/2),M.gold,0,Y+9.85,TZ);dome.castShadow=true;
  for(let i=0;i<16;i++){const rb=deco(new THREE.TorusGeometry(4.62,.07,6,24,Math.PI/2),M.gold,0,Y+9.85,TZ,i/16*Math.PI*2);rb.rotation.z=Math.PI/2;rb.rotation.order='YZX'}
  deco(CY(.5,.7,1,12),M.gold,0,Y+14.8,TZ);deco(new THREE.SphereGeometry(.65,16,12),M.gold,0,Y+15.7,TZ);deco(new THREE.ConeGeometry(.35,2.6,12),M.gold,0,Y+17.5,TZ)}
 // портик с колоннами и фронтоном
 for(let i=0;i<4;i++){const x=-5.4+i*3.6;const c=deco(latheG([[.55,0],[.55,.3],[.42,.45],[.38,6],[.5,6.2],[.58,6.4],[0,6.4]],20),M.white,x,Y+.5,TZ+8.2);c.castShadow=true;solid(x,Y,TZ+8.2,.9,7,.9)}
 addBoxW(0,Y,TZ+8.2,15,.5,3.6,M.stone,2);decoW(0,Y+6.9,TZ+8.2,15.4,.6,3.8,M.white,2);
 {const pd=new THREE.Shape();pd.moveTo(-7.7,0);pd.lineTo(7.7,0);pd.lineTo(0,2.2);pd.lineTo(-7.7,0);const pg=new THREE.ExtrudeGeometry(pd,{depth:3.8,bevelEnabled:false});const p=deco(pg,M.white,0,Y+7.5,TZ+6.3);p.castShadow=true;
  for(const sx of[-1,1]){const L=Math.hypot(7.7,2.2),rb=deco(BX(L,.16,.12),M.gold,sx*3.85,Y+8.6,TZ+10.16);rb.rotation.z=-sx*Math.atan2(2.2,7.7)}decoW(0,Y+7.45,TZ+10.12,15.4,.14,.12,M.gold,1);
  const disc=deco(new THREE.CircleGeometry(.5,24),M.gold,0,Y+8.2,TZ+10.12)}
 isleGate(addDoor(0,Y+.5,TZ+6.3,6,4.2,false,M.gold,'sink'),{pw:.9,pd:1.2,lt:.8,pm:M.stone,cap:1,sill:4.8,sm:M.stone,bm:M.dark});wsign('ХРАМ',0,Y+6.2,TZ+6.65,0,3.4,.8,'#f2c14b','#1f3f8a');
 // фонтан в центре площади
 {const x=0,z=-123;
  // чаша-кольцо: бортик с выступом, внутренняя стенка, дно — вода видна, а не спрятана в цилиндре
  const b1=deco(latheG([[4.3,0],[4.3,.58],[4.42,.66],[4.42,.84],[3.78,.84],[3.7,.74],[3.7,.16],[0,.16]],48),M.stone,x,Y,z);b1.castShadow=true;b1.receiveShadow=true;level.push(b1);
  deco(new THREE.TorusGeometry(4.43,.035,4,64).rotateX(Math.PI/2),M.gold,x,Y+.75,z);
  const w=deco(new THREE.CircleGeometry(3.72,48).rotateX(-Math.PI/2),M.water,x,Y+.6,z);w.userData.dyn=1;w.renderOrder=2;
  for(let i=0;i<16;i++){const a=i/16*Math.PI*2;solid(x+Math.cos(a)*4.02,Y,z+Math.sin(a)*4.02,1,.84,1)}
  // центральная колонна, средняя и верхняя чаши, струи и водяная завеса
  const col=deco(latheG([[.9,0],[.9,.25],[.6,.4],[.45,.7],[.4,1.7],[.55,1.9],[0,1.9]],20),M.stone,x,Y+.16,z);col.castShadow=true;level.push(col);
  const bw=deco(latheG([[.3,0],[1.1,.12],[1.7,.32],[1.78,.42],[1.62,.44],[.4,.2],[0,.2]],32),M.stone,x,Y+2.02,z);bw.castShadow=true;level.push(bw);
  const w2=deco(new THREE.CircleGeometry(1.6,32).rotateX(-Math.PI/2),M.water,x,Y+2.4,z);w2.userData.dyn=1;w2.renderOrder=2;
  deco(CY(.16,.22,.7,12),M.stone,x,Y+2.75,z);const bw2=deco(latheG([[.12,0],[.5,.08],[.72,.22],[.66,.26],[.2,.12],[0,.12]],24),M.gold,x,Y+3.1,z);bw2.castShadow=true;
  deco(new THREE.SphereGeometry(.22,16,12),M.gold,x,Y+3.5,z);
  const wm=M.water.clone();wm.opacity=.42;wm.depthWrite=false;wm.side=THREE.DoubleSide;const ct=cTex(256,256,(g,w,h)=>{g.clearRect(0,0,w,h);g.fillStyle='rgba(190,240,255,.28)';g.fillRect(0,0,w,h);for(let i=0;i<260;i++){const xx=Math.random()*w,l=30+Math.random()*120,yy=Math.random()*h;const gr=g.createLinearGradient(0,yy,0,yy+l);gr.addColorStop(0,'rgba(255,255,255,0)');gr.addColorStop(.5,'rgba(240,252,255,.9)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(xx,yy,1.5+Math.random()*3,l);g.fillRect(xx,yy-h,1.5+Math.random()*3,l)}});ct.wrapS=ct.wrapT=THREE.RepeatWrapping;ct.repeat.set(6,1);const cm=new THREE.MeshBasicMaterial({map:ct,transparent:true,depthWrite:false,side:THREE.DoubleSide,color:0xdaf6ff,opacity:.9});L4.fcur=ct;
  const cur=deco(new THREE.CylinderGeometry(1.72,1.9,1.8,40,1,true),cm,x,Y+1.52,z);cur.userData.dyn=1;cur.renderOrder=3;
  const cur2=deco(new THREE.CylinderGeometry(.66,.8,.66,24,1,true),cm,x,Y+2.74,z);cur2.userData.dyn=1;cur2.renderOrder=3;
  for(let i=0;i<8;i++){const a=i/8*Math.PI*2;deco(CY(.07,.09,.12,8),M.gold,x+Math.cos(a)*3.76,Y+.9,z+Math.sin(a)*3.76);const j=deco(new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(new V3(Math.cos(a)*3.76,.88,Math.sin(a)*3.76),new V3(Math.cos(a)*2.9,1.9,Math.sin(a)*2.9),new V3(Math.cos(a)*2.2,.62,Math.sin(a)*2.2)),12,.035,5,false),wm,x,Y,z);j.userData.dyn=1;j.renderOrder=3}
  solid(x,Y,z,1.3,2.06,1.3);solid(x,Y+2.02,z,2.6,.44,2.6);
  L4.fountain={p:new V3(x,Y+3.5,z)}}
 // золотые статуи на постаментах, клумбы, пальмы
 for(const [x,z] of[[-14,-114],[14,-114],[-14,-134],[14,-134]]){addBoxW(x,Y,z,2,.5,2,M.stone,2);const c=deco(latheG([[.62,0],[.55,.25],[.42,.4],[.38,2.6],[.5,2.75],[.6,2.9],[0,2.9]],20),M.white,x,Y+.5,z);c.castShadow=true;
  const bw=deco(latheG([[0,0],[.25,0],[.35,.1],[.9,.45],[1,.6],[.92,.62],[.3,.2],[0,.2]],24),M.gold,x,Y+3.35,z);bw.castShadow=true;const f=deco(new THREE.ConeGeometry(.55,1.3,10),M.flame,x,Y+4.4,z);L4.flames.push({f,ph:x+z});plight(x,Y+4.5,z,0xffa040,.45,10);L4.smokes.push({p:new V3(x,Y+4.6,z),r:.4,c:0x9a9088});solid(x,Y,z,1.4,4,1.4)}
 for(const x of[-22,-8,8,22]){const c=deco(latheG([[.5,0],[.45,.3],[.4,4.6],[.52,4.8],[.55,5],[0,5]],16),M.white,x,Y,-108.5);c.castShadow=true;solid(x,Y,-108.5,.9,5,.9)}
 // смотровая площадка с телескопом
 {const g=grp(-22,Y,-152);gm(g,CY(.06,.08,1.2,8),M.dark,0,.6,0);const t=gm(g,CY(.09,.14,1.2,12),M.gold,0,1.3,.2,-.6)}}
/* ---------- море вокруг: суперъяхта, катер, острова ---------- */
function buildSeaLife(){const M=L4.M;
 // суперъяхта Пепсштейна на рейде
 {const g=new THREE.Group();g.position.set(-95,SEA4_Y,72);g.rotation.y=.9;mapGroup.add(g);const wm=new THREE.MeshStandardMaterial({color:0xf8f8f6,roughness:.3,envMap:ENV}),dm=M.dglass;
  const hull=new THREE.Mesh(latheG([[0,-1],[3.6,-.6],[4.2,1.5],[4.3,3],[0,3]],24),new THREE.MeshStandardMaterial({color:0x1d2f5a,roughness:.3,envMap:ENV}));hull.scale.set(1,1,7.5);g.add(hull);
  for(let k=0;k<3;k++){const s=new THREE.Mesh(BX(7.4-k*1.6,2,40-k*9),wm);s.position.set(0,4+k*2,-2-k*2);g.add(s);const w=new THREE.Mesh(BX(7.5-k*1.6,.8,38-k*9),dm);w.position.set(0,4.2+k*2,-2-k*2);g.add(w)}
  const r=new THREE.Mesh(CY(.3,.3,5,8),wm);r.position.set(0,12,-10);g.add(r);const dish=new THREE.Mesh(new THREE.SphereGeometry(1,12,8),wm);dish.position.set(0,14.5,-10);g.add(dish);g.userData.dyn=1;L4.yacht=g}
 // катер, нарезающий круги вдали
 {const b=boatModel(0xf4f4f4,0xe23a3a);mapGroup.add(b);L4.speed={g:b,t:0}}
 // дальние острова
 const hill=new THREE.MeshStandardMaterial({color:0x5f8f3c,roughness:.9}),sandM=new THREE.MeshStandardMaterial({color:0xe8d6a0,roughness:1});
 hill.color.setHex(0x3c6e32);hill.flatShading=false;
 for(const [x,z,r,sd] of[[-230,-80,40,3],[250,20,46,5],[-190,210,28,7],[180,-260,34,9],[90,230,22,11]]){const g=new THREE.SphereGeometry(1,40,16,0,Math.PI*2,0,Math.PI/2),p=g.attributes.position,v=new V3();
  for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i);const n=ifbm(v.x*2+sd,v.z*2-sd,4);v.y*=.25+.55*n*n*1.6;v.x*=1+.15*(n-.5);p.setXYZ(i,v.x,v.y,v.z)}g.computeVertexNormals();
  const h=deco(g,hill,x,SEA4_Y-.3,z);h.scale.set(r,r*.9,r*.8);deco(CY(r*1.05,r*1.12,1.2,40),sandM,x,SEA4_Y-.45,z).scale.z=.82}}
/* ---------- живность ---------- */
function buildLife(){const M=L4.M;L4.life={};
 // крабы на пляже: бегают боком, убегают от игрока
 const cm=new THREE.MeshStandardMaterial({color:0xe2502a,roughness:.5}),crabs=[];
 for(let i=0;i<12;i++){const g=new THREE.Group(),b=new THREE.Mesh(new THREE.SphereGeometry(.16,10,6),cm);b.scale.set(1.3,.55,1);g.add(b);for(const s of[-1,1]){const cl=new THREE.Mesh(new THREE.SphereGeometry(.07,6,4),cm);cl.position.set(s*.2,.02,.12);g.add(cl);
   for(let k=0;k<3;k++){const l=new THREE.Mesh(BX(.16,.02,.02),cm);l.position.set(s*.2,-.04,-.06+k*.06);l.rotation.z=s*.4;g.add(l)}}for(const s of[-1,1]){const e=new THREE.Mesh(new THREE.SphereGeometry(.025,6,4),M.dark);e.position.set(s*.05,.09,.12);g.add(e)}
  g.userData.dyn=1;mapGroup.add(g);const x=rnd(-28,28),z=rnd(18,33);crabs.push({g,x,z,tx:x,tz:z,t:rnd(0,3),hide:0})}
 L4.life.crabs=crabs;
 // стайки рыб в лагуне (видны сквозь воду)
 const fg=new THREE.ConeGeometry(.08,.34,5);fg.rotateX(Math.PI/2);const fm=[new THREE.MeshStandardMaterial({color:0xffc83a,roughness:.4}),new THREE.MeshStandardMaterial({color:0x3ad0ff,roughness:.4}),new THREE.MeshStandardMaterial({color:0xff6a3a,roughness:.4})];
 L4.life.fish=[];for(let s=0;s<4;s++){const n=18,im=new THREE.InstancedMesh(fg,fm[s%3],n);im.userData.dyn=1;im.frustumCulled=false;mapGroup.add(im);L4.life.fish.push({im,n,cx:rnd(-14,14),cz:rnd(48,78),r:rnd(3,6),sp:rnd(.25,.5)*(s%2?1:-1),ph:rnd(0,6),y:rnd(-2.6,-1.8)})}
 // морские звёзды и ракушки на дне
 {const sg=new THREE.CircleGeometry(.16,5);sg.rotateX(-Math.PI/2);const list=[];for(let i=0;i<60;i++){const x=rnd(-30,30),z=rnd(36,60),h=tY(x,z);if(h<SEA4_Y-.3&&h>-5)list.push([x,h+.02,z,rnd(0,6),rnd(.6,1.2)])}vegInst(sg,new THREE.MeshStandardMaterial({color:0xff7a4a,roughness:.8}),list,false,true)}
 // дельфины: прыгают дугой вдали
 const dm=new THREE.MeshStandardMaterial({color:0x7a8a9a,roughness:.35,envMap:ENV});L4.life.dol=[];for(let i=0;i<3;i++){const g=new THREE.Group(),b=new THREE.Mesh(new THREE.SphereGeometry(.4,14,10),dm);b.scale.set(.7,.7,2.6);g.add(b);
  const fin=new THREE.Mesh(new THREE.ConeGeometry(.18,.5,4),dm);fin.position.set(0,.38,-.1);fin.rotation.x=-.4;g.add(fin);const tail=new THREE.Mesh(BX(.9,.06,.3),dm);tail.position.z=-1.05;g.add(tail);const nose=new THREE.Mesh(new THREE.ConeGeometry(.12,.4,8),dm);nose.rotation.x=Math.PI/2;nose.position.z=1.15;g.add(nose);
  g.visible=false;g.userData.dyn=1;mapGroup.add(g);L4.life.dol.push({g,t:-rnd(2,9)-i*1.5})}
 // попугаи над джунглями и бабочки у цветов
 const pc=[0xff3030,0x30c040,0x2a8cff,0xffc020];L4.life.par=[];for(let i=0;i<8;i++){const g=new THREE.Group(),c=pc[i%4],m=new THREE.MeshStandardMaterial({color:c,roughness:.6,side:THREE.DoubleSide});const b=new THREE.Mesh(new THREE.SphereGeometry(.14,8,6),m);b.scale.set(.8,.8,1.8);g.add(b);
  const tl=new THREE.Mesh(BX(.08,.02,.5),new THREE.MeshStandardMaterial({color:pc[(i+1)%4],side:THREE.DoubleSide}));tl.position.z=-.4;g.add(tl);const wg=new THREE.BufferGeometry();wg.setAttribute('position',new THREE.Float32BufferAttribute([0,0,-.15,0,0,.15,.6,0,-.05],3));wg.computeVertexNormals();
  const L=new THREE.Mesh(wg,m),R=new THREE.Mesh(wg,m);R.scale.x=-1;g.add(L,R);g.userData={L,R,r:rnd(6,14),h:rnd(9,15),sp:rnd(.4,.7)*(i%2?1:-1),ph:rnd(0,6),cx:rnd(-6,6),cz:rnd(-38,-14)};g.userData.dyn=1;mapGroup.add(g);L4.life.par.push(g)}
 const bfg=new THREE.PlaneGeometry(.14,.1);bfg.translate(.07,0,0);L4.life.bf=[];const bcol=[0xffd040,0xff70c0,0x60d0ff,0xffffff];for(let i=0;i<16;i++){const m=new THREE.MeshBasicMaterial({color:bcol[i%4],side:THREE.DoubleSide}),g=new THREE.Group(),L=new THREE.Mesh(bfg,m),R=new THREE.Mesh(bfg,m);R.scale.x=-1;g.add(L,R);g.userData.dyn=1;mapGroup.add(g);
  const zone=i<8?[rnd(-12,12),rnd(-40,-12),.8]:[rnd(-28,28),rnd(-96,-56),4.6];L4.life.bf.push({g,L,R,cx:zone[0],cz:zone[1],y:zone[2],ph:rnd(0,6)})}
 // чайки
 const gullM=new THREE.MeshStandardMaterial({color:0xfafafa,side:THREE.DoubleSide,roughness:.8});L4.birds=[];for(let i=0;i<12;i++){const g=new THREE.Group(),wg=new THREE.BufferGeometry();wg.setAttribute('position',new THREE.Float32BufferAttribute([0,0,-.25,0,0,.25,1.1,.1,0],3));wg.computeVertexNormals();
  const L=new THREE.Mesh(wg,gullM),R=new THREE.Mesh(wg,gullM);R.scale.x=-1;g.add(L,R);const bd=new THREE.Mesh(new THREE.SphereGeometry(.12,8,6),gullM);bd.scale.z=3;g.add(bd);g.userData={L,R,r:rnd(20,60),h:rnd(16,30),sp:rnd(.1,.22)*(Math.random()<.5?1:-1),ph:Math.random()*6,cz:rnd(-120,40),cx:rnd(-20,20)};g.userData.dyn=1;mapGroup.add(g);L4.birds.push(g)}}
function updLife(dt,t){const Lf=L4.life;if(!Lf)return;const P_=P.pos;
 for(const c of Lf.crabs){const d=Math.hypot(c.x-P_.x,c.z-P_.z);c.t-=dt;if(d<4.5&&!c.hide){c.hide=1.6;const a=Math.atan2(c.x-P_.x,c.z-P_.z);c.tx=c.x+Math.sin(a)*6;c.tz=c.z+Math.cos(a)*6}
  if(c.t<0){c.t=rnd(2,6);c.tx=Math.max(-30,Math.min(30,c.x+rnd(-3,3)));c.tz=Math.max(16,Math.min(34,c.z+rnd(-2,2)))}c.hide=Math.max(0,c.hide-dt);
  const dx=c.tx-c.x,dz=c.tz-c.z,L=Math.hypot(dx,dz);if(L>.05){const sp=(c.hide?3.4:.7)*dt;c.x+=dx/L*Math.min(L,sp);c.z+=dz/L*Math.min(L,sp);c.g.rotation.y=Math.atan2(dx,dz)+Math.PI/2}
  c.g.position.set(c.x,tY(c.x,c.z)+.06+Math.abs(Math.sin(t*20+c.x))*.015*(L>.05?1:0),c.z)}
 const o=_lifeO;for(const s of Lf.fish){for(let i=0;i<s.n;i++){const a=t*s.sp+s.ph+i*.32,rr=s.r+Math.sin(i*1.7)*.8;o.position.set(s.cx+Math.cos(a)*rr,s.y+Math.sin(i*2.3+t)*.25,s.cz+Math.sin(a)*rr*.6);o.rotation.set(0,-a+(s.sp>0?0:Math.PI),0);o.scale.setScalar(.8+(i%3)*.15);o.updateMatrix();s.im.setMatrixAt(i,o.matrix)}s.im.instanceMatrix.needsUpdate=true}
 for(const d of Lf.dol){d.t+=dt;if(d.t>0&&!d.g.visible){d.g.visible=true;const a=rnd(0,6.28),R=rnd(55,85);d.sx=Math.cos(a)*R;d.sz=40+Math.sin(a)*R*.6;d.dir=rnd(0,6.28)}
  if(d.g.visible){const k=d.t/1.3;if(k>1){d.g.visible=false;d.t=-rnd(5,12);puff(new V3(d.g.position.x,SEA4_Y,d.g.position.z),12,0xffffff,4,.7,10);continue}
   const fx=Math.sin(d.dir),fz=Math.cos(d.dir);d.g.position.set(d.sx+fx*k*8,SEA4_Y-.4+Math.sin(k*Math.PI)*2.6,d.sz+fz*k*8);d.g.rotation.set(-Math.cos(k*Math.PI)*.9,d.dir,0,'YXZ');if(k<.08)puff(d.g.position,6,0xffffff,3,.6,10)}}
 for(const g of Lf.par){const u=g.userData,a=t*u.sp+u.ph;g.position.set(u.cx+Math.cos(a)*u.r,u.h+Math.sin(t*1.3+u.ph)*1.2,u.cz+Math.sin(a)*u.r*.7);g.rotation.y=-a+(u.sp>0?0:Math.PI);const fl=Math.sin(t*14+u.ph)*.7;u.L.rotation.z=fl;u.R.rotation.z=-fl}
 for(const b of Lf.bf){const a=t*.7+b.ph;b.g.position.set(b.cx+Math.sin(a)*1.6+Math.sin(a*2.7)*.5,b.y+Math.abs(Math.sin(a*3.1))*.6+tY(b.cx,b.cz)*0,b.cz+Math.cos(a*1.3)*1.4);b.g.rotation.y=a;const fl=Math.sin(t*22+b.ph)*1.1;b.L.rotation.y=fl;b.R.rotation.y=-fl}
 for(const g of L4.birds){const u=g.userData,a=t*u.sp+u.ph;g.position.set(u.cx+Math.cos(a)*u.r,u.h+Math.sin(t*.7+u.ph)*1.5,u.cz+Math.sin(a)*u.r*.8);g.rotation.y=-a+(u.sp>0?0:Math.PI);const fl=Math.sin(t*6+u.ph)*.45;u.L.rotation.z=fl;u.R.rotation.z=-fl}}
const _lifeO=new THREE.Object3D();
