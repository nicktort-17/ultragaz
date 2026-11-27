
{
const $=id=>document.getElementById(id),V3=THREE.Vector3,rnd=(a,b)=>a+Math.random()*(b-a),r1=v=>Math.round(v*10)/10,r2=v=>Math.round(v*100)/100;
const wrap=$('screen'),canvas=$('c');
let best=0,sens=1.2,nick='',code='zavod';
try{best=+localStorage.getItem('ug-best')||0;sens=+localStorage.getItem('ug-sens')||1.2;nick=localStorage.getItem('ug-nick')||'';code=localStorage.getItem('ug-code')||'zavod'}catch(e){}
if(!nick)nick='Газ-'+Math.floor(rnd(100,999));
$('nick').value=nick;$('code').value=code;$('sens').value=$('sens2').value=sens;
const cleanNick=s=>(s||'').replace(/[\u0000-\u001f\u007f-\u009f\u200b-\u200f\u2028-\u202e\u2060-\u206f\ufeff]/g,'').trim().slice(0,14)||'Игрок';
const cleanCode=s=>((s||'').toLowerCase().replace(/[^a-z0-9-]/g,'').slice(0,20))||'zavod';
const save=(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}};
const setSens=v=>{sens=+v;$('sens').value=$('sens2').value=v;save('ug-sens',v);const sv=$('sensV');if(sv)sv.textContent=(+v).toFixed(1)};
$('sens').oninput=e=>setSens(e.target.value);$('sens2').oninput=e=>setSens(e.target.value);
$('nick').onchange=()=>{nick=cleanNick($('nick').value);$('nick').value=nick;save('ug-nick',nick);lobbyPresence()};
$('code').onchange=()=>{code=cleanCode($('code').value);$('code').value=code;save('ug-code',code);lobbyPresence()};
function setMap(id){mapId=id;save('ug-map',id);$('mapZ').classList.toggle('sel',id==='zavod');$('mapP').classList.toggle('sel',id==='plaza');$('mapZ').setAttribute('aria-checked',id==='zavod');$('mapP').setAttribute('aria-checked',id==='plaza');if(state==='menu')loadMap(id);lobbyPresence()}
const showBest=()=>{$('best').textContent=best?'Рекорд в соло: '+best:''};showBest();
const COLORS=['#ff4d5e','#5fe0c8','#f2b84b','#8fd0f5','#c58cff','#7ee08a','#ff9a4d','#f6eee2'];
let myColor=COLORS[Math.floor(Math.random()*COLORS.length)];try{const c=localStorage.getItem('ug-color');if(COLORS.includes(c))myColor=c}catch(e){}

/* ================= renderer & scenes ================= */
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
renderer.autoClear=false;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
const MAXA=renderer.capabilities.getMaxAnisotropy();
let quality='high';try{quality=localStorage.getItem('ug-q')||'high'}catch(e){}
const Q={high:{pr:2,shadow:2048,bloom:true,shadows:true},mid:{pr:1.25,shadow:1024,bloom:true,shadows:true},low:{pr:1,shadow:512,bloom:false,shadows:false}};
renderer.setPixelRatio(Math.min(devicePixelRatio,Q[quality].pr));renderer.shadowMap.enabled=Q[quality].shadows;
const scene=new THREE.Scene();scene.background=new THREE.Color(0x1b0608);scene.fog=new THREE.Fog(0x1b0608,30,100);
const camera=new THREE.PerspectiveCamera(90,16/9,.05,300);camera.rotation.order='YXZ';scene.add(camera);
const gunScene=new THREE.Scene(),gunCam=new THREE.PerspectiveCamera(68,16/9,.01,10);
gunScene.add(new THREE.HemisphereLight(0xffeedd,0x441111,1.1));{const l=new THREE.DirectionalLight(0xffffff,.8);l.position.set(1,2,1);gunScene.add(l)}
const flashLight=new THREE.PointLight(0xffaa44,0,26);scene.add(flashLight);
const GradeShader={uniforms:{tDiffuse:{value:null},sat:{value:1.28},con:{value:1.08},vig:{value:.32},warm:{value:new THREE.Vector3(1.03,1.0,.97)}},
 vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
 fragmentShader:'uniform sampler2D tDiffuse;uniform float sat,con,vig;uniform vec3 warm;varying vec2 vUv;void main(){vec4 c=texture2D(tDiffuse,vUv);float l=dot(c.rgb,vec3(.299,.587,.114));c.rgb=mix(vec3(l),c.rgb,sat);c.rgb=(c.rgb-.5)*con+.5;c.rgb*=warm;float d=distance(vUv,vec2(.5));c.rgb*=1.0-vig*smoothstep(.35,.85,d);gl_FragColor=c;}'};
let composer=null,bloomPass=null,renderPass=null,gradePass=null,postMenu=null;
function setupPost(){composer=null;renderPass=gradePass=null;postMenu=null;if(!Q[quality].bloom||!THREE.EffectComposer||!THREE.UnrealBloomPass||!THREE.ShaderPass)return;
 try{composer=new THREE.EffectComposer(renderer);composer.addPass(renderPass=new THREE.RenderPass(scene,camera));
  bloomPass=new THREE.UnrealBloomPass(new THREE.Vector2(512,512),.42,.4,.93);composer.addPass(bloomPass);composer.addPass(gradePass=new THREE.ShaderPass(GradeShader))}catch(e){composer=null}}
function shadowLight(l,size,range){l.castShadow=Q[quality].shadows;l.shadow.camera.layers.enable(1);l.shadow.mapSize.set(Q[quality].shadow,Q[quality].shadow);const c=l.shadow.camera;c.left=c.bottom=-size;c.right=c.top=size;c.near=1;c.far=range;l.shadow.bias=-.0004;l.shadow.normalBias=.03;return l}
function applyShadows(){mapGroup.traverse(o=>{if(!(o.isMesh||o.isInstancedMesh))return;const m=o.material,basic=m&&(m.isMeshBasicMaterial||m.isShaderMaterial||m.isPointsMaterial);
 o.receiveShadow=!basic;o.castShadow=!basic&&!(m&&m.transparent)&&!o.userData.noCast})}

function grain(g,w,h,a=.07,n=1){const d=g.getImageData(0,0,w,h),px=d.data;for(let i=0;i<px.length;i+=4){const k=(Math.random()-.5)*255*a;px[i]+=k;px[i+1]+=k;px[i+2]+=k}g.putImageData(d,0,0)}
function tex(w,h,draw,rx,ry,noGrain){const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');draw(g,w,h);if(!noGrain)grain(g,w,h);
 const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rx,ry);t.anisotropy=MAXA;t.magFilter=THREE.NearestFilter;t.minFilter=THREE.LinearMipmapLinearFilter;return t}
const M=(c,o={})=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.6,metalness:.1},o));
const crateTex=tex(128,128,(g,w,h)=>{g.fillStyle='#b8834a';g.fillRect(0,0,w,h);g.strokeStyle='#7a5226';g.lineWidth=10;g.strokeRect(5,5,w-10,h-10);g.beginPath();g.moveTo(8,8);g.lineTo(w-8,h-8);g.moveTo(w-8,8);g.lineTo(8,h-8);g.stroke()},1,1);
const mats={crate:M(0xffffff,{map:crateTex,roughness:.85}),tank:M(0xd9dde2,{metalness:.45,roughness:.28}),red:M(0xc8102e,{roughness:.4}),neon:new THREE.MeshBasicMaterial({color:0xff2a3a}),metal:M(0xa9adb3,{metalness:.5,roughness:.35})};

/* ================= maps ================= */
const level=[],boxes=[],mapAnims=[],pads=[];let mapGroup=new THREE.Group(),curMap=null,spawns=[];scene.add(mapGroup);
function solid(x,y,z,w,h,d){boxes.push({min:new V3(x-w/2,y,z-d/2),max:new V3(x+w/2,y+h,z+d/2)})}
function addBox(x,y,z,w,h,d,mat){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x,y+h/2,z);mapGroup.add(m);level.push(m);solid(x,y,z,w,h,d);return m}
function deco(geo,mat,x,y,z,ry=0){const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.rotation.y=ry;mapGroup.add(m);return m}
function addLights(list){for(const l of list)mapGroup.add(l)}
const MAPS=[{id:'zavod',name:'Завод «Газ-Ад»'},{id:'plaza',name:'Площадь фонтана'}];

/* ---------- общие помощники карт ---------- */
function addPad(x,y,z,vx,vy,vz,col=0x5fe0c8){pads.push({x,y,z,vx,vy,vz,r:1.3});
 const ring=deco(new THREE.TorusGeometry(1.25,.16,8,28),M(0xf2b84b,{metalness:.8,roughness:.25}),x,y+.08,z);ring.rotation.x=Math.PI/2;
 const disc=deco(new THREE.CircleGeometry(1.1,28),new THREE.MeshBasicMaterial({color:col}),x,y+.06,z);disc.rotation.x=-Math.PI/2;
 const grate=deco(new THREE.RingGeometry(.35,.5,20),new THREE.MeshBasicMaterial({color:0x1a1012}),x,y+.07,z);grate.rotation.x=-Math.PI/2;
 let t=Math.random();mapAnims.push(dt=>{t+=dt;if(t>.07){t=0;puff(new V3(x+rnd(-.6,.6),y+.3,z+rnd(-.6,.6)),2,Math.random()<.5?0xf6eee2:0x5fe0c8,2.5,.6,-3)}disc.material.color.setHSL(.47,.7,.55+Math.sin(performance.now()/180)*.08)})}
const MATS2={};
function signTex(text,fg,bg,w=1024,h=256,font='bold 150px "Russo One",Arial'){const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');
 if(bg){g.fillStyle=bg;g.fillRect(0,0,w,h)}g.font=font;g.textAlign='center';g.textBaseline='middle';g.lineWidth=14;g.strokeStyle='#f6eee2';g.strokeText(text,w/2,h/2+6);g.fillStyle=fg;g.fillText(text,w/2,h/2+6);
 const t=new THREE.CanvasTexture(c);t.anisotropy=4;return t}
function stripeTex(a,b,n=8,rx=1,ry=1){return tex(64,64,(g,w,h)=>{for(let i=0;i<n;i++){g.fillStyle=i%2?b:a;g.fillRect(i*w/n,0,w/n,h)}},rx,ry)}
function inst(geo,mat,list,solidSize){const im=new THREE.InstancedMesh(geo,mat,list.length),o=new THREE.Object3D();
 list.forEach((t,i)=>{o.position.set(t[0],t[1],t[2]);o.rotation.set(t[4]||0,t[3]||0,t[5]||0);o.scale.setScalar(t[6]||1);o.updateMatrix();im.setMatrixAt(i,o.matrix)});
 im.instanceMatrix.needsUpdate=true;mapGroup.add(im);return im}
function softTex(inner,outer){const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d'),gr=g.createRadialGradient(64,64,0,64,64,64);
 gr.addColorStop(0,inner);gr.addColorStop(.55,inner.replace(/[\d.]+\)$/,'0.55)'));gr.addColorStop(1,outer);g.fillStyle=gr;g.fillRect(0,0,128,128);return new THREE.CanvasTexture(c)}
const bottleGeo=new THREE.LatheGeometry([[0,0],[.13,0],[.14,.03],[.14,.26],[.11,.34],[.05,.44],[.045,.52],[0,.52]].map(([r,y])=>new THREE.Vector2(r,y)),12);

/* ---------- Завод «Газ-Ад» ---------- */
function buildFactory(){
 scene.background=new THREE.Color(0xb9b0a4);scene.fog=new THREE.Fog(0xb9b0a4,45,130);
 const hemi=new THREE.HemisphereLight(0xfff6ec,0x5a4a44,.48),sun=shadowLight(new THREE.DirectionalLight(0xfff1dc,.55),42,90);sun.position.set(14,44,9);
 const pts=[[0,12,0,0xfff0dc],[-22,12,-22,0xffe6c8],[22,12,22,0xffe6c8],[22,12,-22,0xfff0dc],[-22,12,22,0xfff0dc]].map(([x,y,z,c])=>{const l=new THREE.PointLight(c,.45,50);l.position.set(x,y,z);return l});
 addLights([hemi,sun,...pts]);
 const floorTex=tex(256,256,(g,w,h)=>{g.fillStyle='#8e8780';g.fillRect(0,0,w,h);for(let i=0;i<400;i++){g.fillStyle='rgba(60,50,45,'+(Math.random()*.08)+')';g.fillRect(Math.random()*w,Math.random()*h,3,3)}
  g.strokeStyle='#746d66';g.lineWidth=3;for(let i=0;i<=w;i+=64){g.beginPath();g.moveTo(i,0);g.lineTo(i,h);g.stroke();g.beginPath();g.moveTo(0,i);g.lineTo(w,i);g.stroke()}},18,18);
 const wallTex=tex(256,256,(g,w,h)=>{g.fillStyle='#c9c0b3';g.fillRect(0,0,w,h);g.strokeStyle='#aca293';g.lineWidth=4;for(let x=0;x<=w;x+=64){g.beginPath();g.moveTo(x,0);g.lineTo(x,h-60);g.stroke()}
  g.fillStyle='#c8102e';g.fillRect(0,h-60,w,22);g.fillStyle='#f6eee2';g.fillRect(0,h-38,w,6);for(let x=0;x<w;x+=64){g.fillStyle='#f2b84b';g.fillRect(x,h-32,32,32);g.fillStyle='#2b2b30';g.fillRect(x+32,h-32,32,32)}
  g.fillStyle='#bfe3f5';for(let x=12;x<w;x+=64)g.fillRect(x,40,40,70);g.strokeStyle='#8d949a';g.lineWidth=4;for(let x=12;x<w;x+=64)g.strokeRect(x,40,40,70)},10,1);
 const ceilTex=tex(256,256,(g,w,h)=>{g.fillStyle='#bdb6ad';g.fillRect(0,0,w,h);g.strokeStyle='#a29a90';g.lineWidth=8;for(let i=0;i<=w;i+=128){g.beginPath();g.moveTo(i,0);g.lineTo(i,h);g.stroke();g.beginPath();g.moveTo(0,i);g.lineTo(w,i);g.stroke()}},9,9);
 const hazard=stripeTex('#f2b84b','#2b2b30',8,6,1);
 const floor=M(0xffffff,{map:floorTex,roughness:.85}),wall=M(0xffffff,{map:wallTex,roughness:.7}),pillar=M(0xc9c1b6,{roughness:.6}),ceil=M(0xffffff,{map:ceilTex,roughness:.9,side:THREE.DoubleSide}),
  pipeM=M(0x9aa1a8,{metalness:.6,roughness:.3}),dark=M(0x3a3a40,{metalness:.5,roughness:.4}),glass=M(0x6b2a14,{roughness:.15,transparent:true,opacity:.85}),hz=M(0xffffff,{map:hazard,roughness:.6}),rail=M(0xf2b84b,{metalness:.3,roughness:.4});
 addBox(0,-1,0,74,1,74,floor);
 // разметка проходов на полу
 for(const [x,z,w,d] of [[0,-16,40,.25],[0,16,40,.25],[-16,0,.25,32],[16,0,.25,32]])deco(new THREE.BoxGeometry(w,.02,d),mats.red,x,.01,z);
 for(const [x,z,w,d] of [[0,-36,74,1],[0,36,74,1],[-36,0,1,74],[36,0,1,74]])addBox(x,0,z,w,16,d,wall);
 addBox(0,16,0,74,1,74,ceil).userData.noCast=true;
 const sky=new THREE.MeshBasicMaterial({color:0xfffbf0});
 const rayM=new THREE.MeshBasicMaterial({color:0xfff0d0,transparent:true,opacity:.07,blending:THREE.AdditiveBlending,depthWrite:false});
 for(const z of[-24,-8,8,24]){deco(new THREE.BoxGeometry(70,.5,.6),pillar,0,15.7,z).userData.noCast=true;for(const x of[-24,0,24]){deco(new THREE.BoxGeometry(6,.12,3),sky,x,15.9,z);
  const r=deco(new THREE.BoxGeometry(5.4,15.6,2.6),rayM,x-1.4,8,z);r.rotation.z=.18}}
 // верхняя галерея по периметру и газовые гейзеры к ней
 const gal=M(0xc4c8cd,{roughness:.5,metalness:.25});
 for(const [x,z,w,d] of [[0,-33.6,64.6,2.6],[0,33.6,64.6,2.6],[-33.6,0,2.6,64.6],[33.6,0,2.6,64.6]]){addBox(x,8,z,w,.35,d,gal);
  const inner=[x?x-Math.sign(x)*1.3:0,z?z-Math.sign(z)*1.3:0];deco(new THREE.BoxGeometry(w>3?w:.08,.08,w>3?.08:d),rail,x?inner[0]:0,9.3,z?inner[1]:0);
  deco(new THREE.BoxGeometry(w>3?w:.1,.14,w>3?.1:d),hz,x?inner[0]:0,8.42,z?inner[1]:0)}
 const gp=[];for(let t=-30;t<=30;t+=5){gp.push([t,8.8,-32.3],[t,8.8,32.3],[-32.3,8.8,t],[32.3,8.8,t])}
 inst(new THREE.CylinderGeometry(.05,.05,1,6),rail,gp);
 for(const [sx,sz] of [[-1,-1],[1,-1],[-1,1],[1,1]])addPad(sx*27.5,0,sz*27.5,sx*3.2,21.5,sz*3.2);
 // подвесные лампы
 const shade=M(0xc8102e,{roughness:.4,side:THREE.DoubleSide}),bulb=new THREE.MeshBasicMaterial({color:0xfff2c4});
 for(const [x,z] of [[-8,-8],[8,-8],[-8,8],[8,8],[-20,0],[20,0]]){deco(new THREE.CylinderGeometry(.03,.03,4,4),pipeM,x,14,z);deco(new THREE.ConeGeometry(.9,.7,16,1,true),shade,x,11.8,z);deco(new THREE.SphereGeometry(.3,10,8),bulb,x,11.55,z)}
 // вывески ГАЗ-АД на северной и южной стенах
 const sign=new THREE.MeshBasicMaterial({map:signTex('ГАЗ-АД','#c8102e','#2b0a0e')});
 for(const s of[-1,1]){const p=deco(new THREE.PlaneGeometry(14,3.5),sign,0,10.5,s*35.45);p.rotation.y=s>0?Math.PI:0}
 const sign2=new THREE.MeshBasicMaterial({map:signTex('ЦЕХ РОЗЛИВА №1','#2b0a0e','#f2b84b',1024,160,'bold 90px "Russo One",Arial')});
 for(const s of[-1,1]){const p=deco(new THREE.PlaneGeometry(10,1.6),sign2,s*35.45,7.5,0);p.rotation.y=-s*Math.PI/2}
 // центральная платформа с карусельным разливочным автоматом
 addBox(0,0,0,12,1.2,12,mats.metal);
 for(const t of[-1,1]){deco(new THREE.BoxGeometry(12.2,.12,.12),mats.neon,0,1.22,t*6);deco(new THREE.BoxGeometry(.12,.12,12.2),mats.neon,t*6,1.22,0)}
 const base=deco(new THREE.CylinderGeometry(2.2,2.5,1.2,24),dark,0,1.8,0);level.push(base);solid(0,1.2,0,4,2.4,4);
 const carousel=new THREE.Group();carousel.position.set(0,2.4,0);mapGroup.add(carousel);
 const ring=new THREE.Mesh(new THREE.CylinderGeometry(2.3,2.3,.15,32),pipeM);carousel.add(ring);
 for(let i=0;i<16;i++){const a=i/16*Math.PI*2,b=new THREE.Mesh(bottleGeo,glass);b.position.set(Math.cos(a)*1.9,.08,Math.sin(a)*1.9);b.scale.setScalar(1.6);carousel.add(b)}
 const head=deco(new THREE.CylinderGeometry(.9,1.3,.9,16),mats.red,0,3.25,0);deco(new THREE.CylinderGeometry(.15,.15,3,8),pipeM,0,5.2,0);
 mapAnims.push(dt=>{carousel.rotation.y+=dt*.6});
 // мост между балконами над платформой
 addBox(0,3.8,0,3,.4,53,M(0xc4c8cd,{roughness:.55,metalness:.2}));for(const s of[-1,1])deco(new THREE.BoxGeometry(.12,.42,53),hz,s*1.5,4,0);
 for(const s of[-1,1])deco(new THREE.BoxGeometry(.08,.08,53),rail,s*1.45,4.9,0);
 inst(new THREE.CylinderGeometry(.05,.05,.9,6),rail,Array.from({length:28},(_,i)=>[(i%2?1:-1)*1.45,4.65,-26+Math.floor(i/2)*4]));
 // колонны
 for(const [x,z] of [[-14,-14],[14,-14],[-14,14],[14,14]]){addBox(x,0,z,3,13,3,pillar);deco(new THREE.BoxGeometry(3.1,.6,3.1),mats.red,x,3,z);deco(new THREE.BoxGeometry(3.12,.15,3.12),new THREE.MeshBasicMaterial({color:0xf6eee2}),x,3.38,z);deco(new THREE.BoxGeometry(3.12,.8,3.12),hz,x,.4,z)}
 // ящики с бутылками, сложенные штабелями
 const crates=[[8,-21,2],[-10,20,2],[22,-8,1.8],[-22,10,1.8],[10,23,1.6],[-6,-25,2],[-25,-22,2],[25,22,2],[-25,-22+2,2,2],[25,22-2,2]];
 for(const [x,z,s,st] of crates){addBox(x,0,z,s,s,s,mats.crate);if(st)addBox(x,s,z,s*.9,s*.9,s*.9,mats.crate)}
 // балконы с лестницами
 for(const sz of[-1,1]){addBox(0,3.8,sz*32.5,16,.6,6,mats.metal);for(let i=0;i<3;i++)addBox(9.5+i*2,0,sz*32.5,2,3.6-i*1.2,3,mats.metal);
  deco(new THREE.BoxGeometry(16,.1,.1),mats.neon,0,4.42,sz*29.5);deco(new THREE.BoxGeometry(16,.08,.08),rail,0,5.4,sz*29.6)}
 // баки с трубами и вентилями
 for(const x of[-26,26]){const g=new THREE.Group();const t=new THREE.Mesh(new THREE.CylinderGeometry(3,3,9,28),mats.tank);t.position.y=4.5;g.add(t);
  const top=new THREE.Mesh(new THREE.SphereGeometry(3,28,12,0,Math.PI*2,0,Math.PI/2),mats.tank);top.position.y=9;g.add(top);
  const band=new THREE.Mesh(new THREE.CylinderGeometry(3.05,3.05,1,28),mats.red);band.position.y=5.5;g.add(band);
  const lad=new THREE.Mesh(new THREE.BoxGeometry(.6,8,.1),hz);lad.position.set(0,4,3.05);g.add(lad);
  g.position.set(x,0,0);mapGroup.add(g);g.traverse(o=>{if(o.isMesh)level.push(o)});solid(x,0,0,5.6,10.5,5.6);
  deco(new THREE.CylinderGeometry(.45,.45,5,12),pipeM,x,13.5,0);const v=deco(new THREE.TorusGeometry(.6,.1,6,16),mats.red,x+.5,13,0);v.rotation.y=Math.PI/2}
 for(const s of[-1,1]){const pz=s*34.6;const p=deco(new THREE.CylinderGeometry(.5,.5,70,12),pipeM,0,12.5,pz);p.rotation.z=Math.PI/2;
  const p2=deco(new THREE.CylinderGeometry(.3,.3,70,10),mats.red,0,13.6,pz);p2.rotation.z=Math.PI/2}
 inst(new THREE.TorusGeometry(.62,.08,6,14),dark,[-28,-14,0,14,28].flatMap(x=>[[x,12.5,-34.6,Math.PI/2],[x,12.5,34.6,Math.PI/2]]));
 // конвейеры вдоль стен с едущими бутылками
 const beltTex=stripeTex('#3a3a40','#55555c',8,1,20);beltTex.rotation=Math.PI/2;
 const beltM=M(0xffffff,{map:beltTex,roughness:.8});
 for(const s of[-1,1]){addBox(s*31,0,0,2,1,44,dark);const top=deco(new THREE.BoxGeometry(1.8,.04,44),beltM,s*31,1.02,0);deco(new THREE.BoxGeometry(2.1,.25,44.2),hz,s*31,.12,0);
  mapAnims.push(dt=>{beltTex.offset.x-=dt*.35})}
 const NB=36,bot=new THREE.InstancedMesh(bottleGeo,glass,NB),o=new THREE.Object3D();mapGroup.add(bot);
 mapAnims.push(dt=>{const t=performance.now()/1000;for(let i=0;i<NB;i++){const s=i<NB/2?-1:1,k=(i%(NB/2))/(NB/2);let z=((k*44+t*1.4*s)%44+44)%44-22;o.position.set(s*31,1.04,z);o.scale.setScalar(1.3);o.updateMatrix();bot.setMatrixAt(i,o.matrix)}bot.instanceMatrix.needsUpdate=true});
 // автоматы с газировкой у стен
 const vend=M(0xc8102e,{roughness:.35}),vglass=new THREE.MeshBasicMaterial({color:0xffe3a8});
 for(const [x,z,ry] of [[-20,-35,0],[-17,-35,0],[20,35,Math.PI],[17,35,Math.PI]]){addBox(x,0,z+(ry?-.6:.6),2,3,1.2,vend);const f=deco(new THREE.PlaneGeometry(1.4,1.6),vglass,x,1.9,z+(ry?-1.22:1.22));f.rotation.y=ry}
 spawns=[[-30,-30],[30,-30],[-30,30],[30,30],[-24,-12],[24,12],[0,-24],[0,24],[-18,0],[18,0]].map(([x,z])=>new V3(x,0,z))}

/* ---------- Площадь фонтана ---------- */
const FN=1400,fg=new THREE.BufferGeometry(),fp=new Float32Array(FN*3),fv=new Float32Array(FN*3),fl=new Float32Array(FN),fc=new Float32Array(FN*3);let fi=0;
for(let i=0;i<FN;i++)fp[i*3+1]=-999;fg.setAttribute('position',new THREE.BufferAttribute(fp,3));fg.setAttribute('color',new THREE.BufferAttribute(fc,3));
const fountainPts=new THREE.Points(fg,new THREE.PointsMaterial({size:.17,vertexColors:true,transparent:true,opacity:.9,depthWrite:false}));fountainPts.frustumCulled=false;
function jet(x,y,z,vx,vy,vz,foam){const i=fi=(fi+1)%FN;fp[i*3]=x;fp[i*3+1]=y;fp[i*3+2]=z;fv[i*3]=vx;fv[i*3+1]=vy;fv[i*3+2]=vz;fl[i]=2.2;
 const c=foam?[.96,.92,.85]:[.42,.16,.08];fc[i*3]=c[0];fc[i*3+1]=c[1];fc[i*3+2]=c[2]}
function makeSky(top,mid,bot){const m=new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,depthTest:false,fog:false,
 uniforms:{cT:{value:new THREE.Color(top)},cM:{value:new THREE.Color(mid)},cB:{value:new THREE.Color(bot)}},
 vertexShader:'varying vec3 vp;void main(){vp=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
 fragmentShader:'uniform vec3 cT,cM,cB;varying vec3 vp;void main(){float h=vp.y;vec3 c=h>0.0?mix(cM,cT,pow(clamp(h,0.0,1.0),0.55)):mix(cM,cB,pow(clamp(-h,0.0,1.0),0.4));gl_FragColor=vec4(c,1.0);}'});
 const s=new THREE.Mesh(new THREE.SphereGeometry(200,32,16),m);s.renderOrder=-10;s.frustumCulled=false;return s}
function buildPlaza(){
 scene.background=new THREE.Color(0xcfe6fb);scene.fog=new THREE.Fog(0xd8ecfd,90,240);
 const skyG=new THREE.Group();mapGroup.add(skyG);skyG.add(makeSky(0x2a78d8,0xd6ecff,0x9cc4ea));
 const sunM=new THREE.SpriteMaterial({map:softTex('rgba(255,250,225,1)','rgba(255,240,200,0)'),fog:false,depthWrite:false,transparent:true});
 const sunS=new THREE.Sprite(sunM);sunS.position.set(70,95,-120);sunS.scale.set(70,70,1);sunS.renderOrder=-9;skyG.add(sunS);
 const cloudM=new THREE.SpriteMaterial({map:softTex('rgba(255,255,255,.95)','rgba(255,255,255,0)'),fog:false,depthWrite:false,transparent:true});
 for(let i=0;i<46;i++){const below=i>=26,a=Math.random()*Math.PI*2,r=below?rnd(40,170):rnd(110,175),s=new THREE.Sprite(cloudM);
  s.position.set(Math.cos(a)*r,below?rnd(-70,-40):rnd(-5,55),Math.sin(a)*r);const k=below?rnd(60,110):rnd(30,60);s.scale.set(k,k*.45,1);s.renderOrder=-8;skyG.add(s)}
 mapAnims.push(()=>skyG.position.copy(camera.position));
 const hemi=new THREE.HemisphereLight(0xbfdcff,0x9c8462,.42),sun=shadowLight(new THREE.DirectionalLight(0xffe6bf,.82),52,200);sun.position.set(38,62,-52);addLights([hemi,sun]);
 const tileTex=tex(256,256,(g,w,h)=>{g.fillStyle='#d8cab0';g.fillRect(0,0,w,h);for(let y=0;y<4;y++)for(let x=0;x<4;x++){g.fillStyle=(x+y)%2?'#cdbb9c':'#ddd0b8';g.fillRect(x*64+2,y*64+2,60,60)}
  g.strokeStyle='#bba98a';g.lineWidth=3;for(let i=0;i<=w;i+=64){g.beginPath();g.moveTo(i,0);g.lineTo(i,h);g.stroke();g.beginPath();g.moveTo(0,i);g.lineTo(w,i);g.stroke()}},22,22);
 const grassTex=tex(128,128,(g,w,h)=>{g.fillStyle='#6fae4f';g.fillRect(0,0,w,h);for(let i=0;i<500;i++){g.fillStyle=Math.random()<.5?'#5f9c42':'#82c060';g.fillRect(Math.random()*w,Math.random()*h,2,4)}},20,20);
 const marble=M(0xf4efe6,{roughness:.35}),stone=M(0xe2d6c1,{roughness:.7}),floor=M(0xffffff,{map:tileTex,roughness:.6}),gold=M(0xf2b84b,{metalness:.8,roughness:.25}),
  grass=M(0xffffff,{map:grassTex,roughness:.9}),rock=M(0xa48d6b,{roughness:.95,flatShading:true}),chrome=M(0xd9dde2,{metalness:.8,roughness:.2}),dark=M(0x3a3a40,{metalness:.4,roughness:.5});
 // остров: трава, мощёная площадь, скалистое основание
 addBox(0,-1,0,82,1,82,grass);const tiles=deco(new THREE.PlaneGeometry(72,72),floor,0,.012,0);tiles.rotation.x=-Math.PI/2;
 const under=deco(new THREE.ConeGeometry(60,46,9,3),rock,0,-24.2,0);under.rotation.x=Math.PI;under.userData.noCast=true;
 for(let i=0;i<6;i++){const a=i/6*Math.PI*2+.4,r=rnd(85,120),y=rnd(-30,-8),isl=new THREE.Group();isl.position.set(Math.cos(a)*r,y,Math.sin(a)*r);
  const c=new THREE.Mesh(new THREE.ConeGeometry(rnd(5,9),rnd(9,14),7),rock);c.rotation.x=Math.PI;c.position.y=-5;isl.add(c);
  const tp=new THREE.Mesh(new THREE.CylinderGeometry(7,6,1.2,9),grass);isl.add(tp);const tr=new THREE.Mesh(new THREE.CylinderGeometry(.3,.4,4,6),M(0x8a5a3a));tr.position.set(1,2.5,0);isl.add(tr);
  const cr=new THREE.Mesh(new THREE.SphereGeometry(2,8,6),M(0x5f9c42,{flatShading:true}));cr.position.set(1,5,0);isl.add(cr);mapGroup.add(isl)}
 // ЗАБОР: столбы — гигантские банки, перила — полосатые трубочки, между ними — медальоны-крышки
 const straw=M(0xffffff,{map:stripeTex('#c8102e','#f6eee2',10,30,1),roughness:.4}),canM=M(0xc8102e,{roughness:.3,metalness:.3});
 const runs=[[-40,40,40,40],[-40,-40,-40,40],[40,-40,40,40],[-40,-40,-30,-40],[30,-40,40,-40]];
 const posts=[],capsL=[];
 for(const [x1,z1,x2,z2] of runs){const len=Math.hypot(x2-x1,z2-z1),n=Math.round(len/5),mx=(x1+x2)/2,mz=(z1+z2)/2,horiz=z1===z2;
  for(let i=0;i<=n;i++){const t=i/n;posts.push([x1+(x2-x1)*t,1.4,z1+(z2-z1)*t]);if(i<n)capsL.push([x1+(x2-x1)*(t+.5/n),1.55,z1+(z2-z1)*(t+.5/n),horiz?0:Math.PI/2,Math.PI/2])}
  for(const y of[.75,2.25]){const r=deco(new THREE.CylinderGeometry(.13,.13,len,10),straw,mx,y,mz);r.rotation.set(horiz?0:Math.PI/2,0,horiz?Math.PI/2:0)}
  solid(mx,0,mz,horiz?len:1,3.2,horiz?1:len)}
 inst(new THREE.CylinderGeometry(.48,.48,2.8,18),canM,posts);
 inst(new THREE.CylinderGeometry(.44,.48,.18,18),chrome,posts.map(p=>[p[0],2.88,p[2]]));inst(new THREE.CylinderGeometry(.485,.485,.5,18),M(0xf6eee2),posts.map(p=>[p[0],1.5,p[2]]));
 inst(new THREE.CylinderGeometry(.55,.55,.12,21),mats.red,capsL);inst(new THREE.CylinderGeometry(.36,.36,.14,24),M(0xf6eee2),capsL);
 // ВХОД НА ЗАВОД «ГАЗ-АД» на северной стороне
 const facTex=tex(256,256,(g,w,h)=>{g.fillStyle='#d9cfc0';g.fillRect(0,0,w,h);g.fillStyle='#c9bdac';for(let y=0;y<h;y+=16)for(let x=(y/16)%2*16;x<w;x+=32)g.fillRect(x,y,30,14);
  g.fillStyle='#c8102e';g.fillRect(0,200,w,22);g.fillStyle='#f6eee2';g.fillRect(0,222,w,6);g.fillStyle='#9fd0ea';for(let x=20;x<w;x+=64){g.fillRect(x,50,28,60)}},6,2);
 const facM=M(0xffffff,{map:facTex,roughness:.8}),shutterM=M(0xffffff,{map:stripeTex('#8a8f96','#a4a9b0',16,1,6),metalness:.4,roughness:.5}),hzM=M(0xffffff,{map:stripeTex('#f2b84b','#2b2b30',8,4,1)});
 addBox(-18,0,-50,24,18,20,facM);addBox(18,0,-50,24,18,20,facM);addBox(0,7.5,-50,12,10.5,20,facM);
 addBox(0,-1,-46,12,1,12,dark);
 const sh=deco(new THREE.BoxGeometry(12,5,.3),shutterM,0,5,-51);solid(0,0,-51.5,12,18,1);level.push(sh);
 const glow=deco(new THREE.PlaneGeometry(11.6,2.5),new THREE.MeshBasicMaterial({color:0xff4d2e}),0,1.25,-50.8);
 for(const s of[-1,1])deco(new THREE.BoxGeometry(.6,7.5,.6),hzM,s*6.3,3.75,-40.2);deco(new THREE.BoxGeometry(13.2,.6,.6),hzM,0,7.8,-40.2);
 const bigSign=deco(new THREE.PlaneGeometry(22,5.5),new THREE.MeshBasicMaterial({map:signTex('ГАЗ-АД','#c8102e','#1a0507')}),0,13,-39.9);
 const neonL=new THREE.PointLight(0xff3344,1.2,26);neonL.position.set(0,12,-36);mapGroup.add(neonL);
 mapAnims.push(()=>{const t=performance.now()/1000;bigSign.material.color.setScalar(.85+.15*Math.sin(t*3)*Math.sin(t*7.3))});
 for(const [x,z] of [[-3,-47],[3,-46],[-4,-44.5]])addBox(x,0,z,1.8,1.8,1.8,mats.crate);
 addBox(4.5,0,-48.5,2,3,1.2,M(0xc8102e,{roughness:.35}));
 // трубы и дымящие трубы на крыше
 for(const x of[-22,22]){deco(new THREE.CylinderGeometry(1.6,2,16,16),M(0xd9cfc0),x,26,-54);deco(new THREE.CylinderGeometry(1.65,1.65,1.4,16),mats.red,x,31,-54);deco(new THREE.CylinderGeometry(1.66,1.66,.4,16),M(0xf6eee2),x,30.1,-54)}
 const smokeM=new THREE.SpriteMaterial({map:softTex('rgba(235,235,240,.9)','rgba(235,235,240,0)'),depthWrite:false,transparent:true});
 const smokes=[];for(let i=0;i<16;i++){const s=new THREE.Sprite(smokeM.clone());s.userData={x:i%2?-22:22,t:i/8};mapGroup.add(s);smokes.push(s)}
 mapAnims.push(dt=>{for(const s of smokes){s.userData.t=(s.userData.t+dt*.12)%1;const t=s.userData.t;s.position.set(s.userData.x+t*6,34+t*18,-54+t*3);s.scale.setScalar(3+t*9);s.material.opacity=.75*(1-t)}});
 for(const s of[-1,1]){const p=deco(new THREE.CylinderGeometry(.5,.5,14,10),M(0x9aa1a8,{metalness:.6,roughness:.3}),s*9,9,-40.4)}
 // квадратная колоннада с галереей поверху (на неё забрасывают гейзеры)
 const colPos=[];for(let i=0;i<=12;i++){const t=-26+i*52/12;colPos.push([t,4.5,-26],[t,4.5,26]);if(i>0&&i<12)colPos.push([-26,4.5,t],[26,4.5,t])}
 const cols=inst(new THREE.CylinderGeometry(.75,.85,9,16),marble,colPos);level.push(cols);
 inst(new THREE.BoxGeometry(2.1,.6,2.1),stone,colPos.map(p=>[p[0],.3,p[2]]));inst(new THREE.BoxGeometry(2.1,.5,2.1),stone,colPos.map(p=>[p[0],8.75,p[2]]));
 colPos.forEach(p=>solid(p[0],0,p[2],1.7,9,1.7));
 for(const [x,z,w,d] of [[0,-26,55.4,3.4],[0,26,55.4,3.4],[-26,0,3.4,48.6],[26,0,3.4,48.6]]){addBox(x,9,z,w,.8,d,stone);deco(new THREE.BoxGeometry(w+.1,.18,d+.1),gold,x,9.9,z)}
 for(const [x,z,ry] of [[-13,26,0],[13,26,0],[26,13,Math.PI/2],[26,-13,Math.PI/2],[-26,13,Math.PI/2],[-26,-13,Math.PI/2]]){
  const b=deco(new THREE.PlaneGeometry(3,5.2),M(0xc8102e,{side:THREE.DoubleSide,roughness:.6}),x+(ry?Math.sign(x)*1.75:0),6.1,z+(ry?0:Math.sign(z)*1.75));b.rotation.y=ry;
  const w=deco(new THREE.PlaneGeometry(3.02,.4),new THREE.MeshBasicMaterial({color:0xf6eee2,side:THREE.DoubleSide}),x+(ry?Math.sign(x)*1.77:0),5.5,z+(ry?0:Math.sign(z)*1.77));w.rotation.y=ry}
 for(const [x,z,vx,vz] of [[0,21.6,0,3.2],[0,-21.6,0,-3.2],[21.6,0,3.2,0],[-21.6,0,-3.2,0]])addPad(x,0,z,vx,23,vz);
 addPad(0,0,6.6,0,15,-3.2,0xffd27a);
 // монументальные арки у края острова
 for(const [x,z,ry] of [[0,36.5,0],[36.5,0,Math.PI/2],[-36.5,0,Math.PI/2]]){const ax=ry?0:1,az=ry?1:0;
  for(const s2 of[-1,1]){addBox(x+ax*s2*5.5,0,z+az*s2*5.5,2.4,13,2.4,marble);deco(new THREE.BoxGeometry(2.7,.5,2.7),gold,x+ax*s2*5.5,13.2,z+az*s2*5.5)}
  addBox(x,13,z,ry?3:13.4,2.2,ry?13.4:3,stone);deco(new THREE.BoxGeometry(ry?3.1:13.5,.3,ry?13.5:3.1),gold,x,15.3,z);
  const ban=deco(new THREE.PlaneGeometry(4,5.5),M(0xc8102e,{side:THREE.DoubleSide,roughness:.6}),x,10,z);ban.rotation.y=ry;
  const cp=deco(new THREE.CylinderGeometry(1.2,1.2,.35,21),mats.red,x,10.4,z);cp.rotation.set(Math.PI/2,ry,0);cp.translateY(ry?.0:.0)}
 // фонари-бутылки, скамейки, кадки с пальмами
 const lampPos=[];for(let i=0;i<8;i++){const a=i/8*Math.PI*2+Math.PI/8;lampPos.push([Math.cos(a)*20,0,Math.sin(a)*20])}
 inst(new THREE.CylinderGeometry(.09,.12,3.4,8),dark,lampPos.map(p=>[p[0],1.7,p[2]]));
 inst(bottleGeo,M(0x6b2a14,{roughness:.1,transparent:true,opacity:.9,emissive:0x5a1a00}),lampPos.map(p=>[p[0],3.3,p[2],0,0,0,2.2]));
 inst(new THREE.SphereGeometry(.28,10,8),new THREE.MeshBasicMaterial({color:0xffd27a}),lampPos.map(p=>[p[0],3.75,p[2]]));
 const benches=[[8,21,0],[-8,-21,0],[21,8,Math.PI/2],[-21,-8,Math.PI/2]];
 for(const [x,z,ry] of benches){const w=ry?.8:4,d=ry?4:.8;addBox(x,0,z,w,.55,d,M(0x8a5a3a,{roughness:.8}));deco(new THREE.BoxGeometry(ry?.15:4,.8,ry?4:.15),M(0x8a5a3a),x+(ry?.4:0),.95,z+(ry?0:.4))}
 const palmPos=[[-15,20],[15,20],[-20,-15],[20,-15]];
 for(const [x,z] of palmPos){addBox(x,0,z,2.2,1,2.2,stone);const tr=deco(new THREE.CylinderGeometry(.22,.35,6,7),M(0x9a6a40,{flatShading:true}),x,4,z);tr.rotation.z=.12;
  for(let k=0;k<7;k++){const a=k/7*Math.PI*2,lf=deco(new THREE.SphereGeometry(.5,8,5),M(0x4f9a3a,{flatShading:true}),x+.7+Math.cos(a)*1.5,6.7,z+Math.sin(a)*1.5);lf.scale.set(3.2,.18,.9);lf.rotation.set(0,-a,-.35)}
  deco(new THREE.SphereGeometry(.45,8,6),M(0x6b4a2a),x+.7,7,z)}
 // угловые террасы (кроме северных — там завод) с лестницами и зонтиками
 for(const [sx,sz] of [[-1,1],[1,1],[-1,-1],[1,-1]]){const cx=sx*33.5,cz=sz*32;addBox(cx,0,cz,7,2.4,7,stone);
  for(let k=0;k<2;k++)addBox(cx-sx*(4.3+k*1.6),0,cz,1.6,1.6-k*.8,4,stone);
  deco(new THREE.CylinderGeometry(.08,.08,3,8),gold,cx,3.9,cz);deco(new THREE.ConeGeometry(2.6,1,12,1,true),M(0xc8102e,{side:THREE.DoubleSide,roughness:.5}),cx,5.6,cz)}
 // фонтан: ступени, бассейн, чаша, бутылка-статуя
 const colaM=new THREE.MeshStandardMaterial({color:0x4a1a0a,roughness:.08,metalness:.1,transparent:true,opacity:.85});
 deco(new THREE.BoxGeometry(22,.25,22),stone,0,.125,0);
 for(const [x,z,w,d] of [[0,-9,19,1],[0,9,19,1],[-9,0,1,17],[9,0,1,17]])addBox(x,0,z,w,1,d,marble);
 inst(new THREE.SphereGeometry(.45,12,8),gold,[[-9,1.2,-9],[9,1.2,-9],[-9,1.2,9],[9,1.2,9]]);
 const pool=deco(new THREE.PlaneGeometry(17,17),colaM,0,.55,0);pool.rotation.x=-Math.PI/2;
 const foamRing=deco(new THREE.RingGeometry(3.2,4.2,32),new THREE.MeshBasicMaterial({color:0xf6eee2,transparent:true,opacity:.7}),0,.58,0);foamRing.rotation.x=-Math.PI/2;
 deco(new THREE.CylinderGeometry(2,2.6,3,20),marble,0,1.5,0);solid(0,0,0,4,3,4);
 const bowl=deco(new THREE.CylinderGeometry(4.6,3.2,.8,32),marble,0,3.3,0);solid(0,2.9,0,7,.8,7);level.push(bowl);
 deco(new THREE.CylinderGeometry(4.3,4.3,.1,32),colaM,0,3.68,0);
 const bottlePts=[[0,0],[1.3,0],[1.4,.2],[1.4,2.8],[1.2,3.5],[.6,4.4],[.45,5],[.5,5.3],[.5,5.5],[0,5.5]].map(([r,y])=>new THREE.Vector2(r,y));
 const bottle=deco(new THREE.LatheGeometry(bottlePts,28),M(0x6b2a14,{roughness:.1,metalness:.1,transparent:true,opacity:.92}),0,3.7,0);
 deco(new THREE.CylinderGeometry(1.42,1.42,1.1,28),mats.red,0,5.2,0);deco(new THREE.CylinderGeometry(1.43,1.43,.2,28),new THREE.MeshBasicMaterial({color:0xf6eee2}),0,5.3,0);
 deco(new THREE.CylinderGeometry(.62,.62,.3,21),mats.red,0,9.35,0);solid(0,3.7,0,2.6,5.8,2.6);level.push(bottle);
 mapGroup.add(fountainPts);
 mapAnims.push(dt=>{const n=Math.min(50,Math.ceil(dt*900));for(let k=0;k<n;k++){const a=Math.random()*Math.PI*2,sp=rnd(3,5.5);jet(Math.cos(a)*.3,9.6,Math.sin(a)*.3,Math.cos(a)*sp,rnd(7,10),Math.sin(a)*sp,Math.random()<.35)}
  for(let k=0;k<6;k++){const c=[[-8.5,-8.5],[8.5,-8.5],[-8.5,8.5],[8.5,8.5]][k%4];jet(c[0],1.1,c[1],-c[0]*.28+rnd(-.4,.4),rnd(5,6.5),-c[1]*.28+rnd(-.4,.4),Math.random()<.5)}
  for(let i=0;i<FN;i++){if(fl[i]<=0)continue;fl[i]-=dt;fv[i*3+1]-=14*dt;fp[i*3]+=fv[i*3]*dt;fp[i*3+1]+=fv[i*3+1]*dt;fp[i*3+2]+=fv[i*3+2]*dt;
   const r=Math.hypot(fp[i*3],fp[i*3+2]);if(fp[i*3+1]<(r<4.4?3.7:.55)){fl[i]=0;fp[i*3+1]=-999}}
  fg.attributes.position.needsUpdate=true;fg.attributes.color.needsUpdate=true;foamRing.rotation.z+=dt*.3});
 spawns=[[-33.5,32],[33.5,32],[-33.5,-32],[33.5,-32],[-22,0],[22,0],[0,-30],[0,22],[-15,-15],[15,15]].map(([x,z])=>new V3(x,0,z));
 spawns.forEach((s,i)=>{if(i<4)s.y=2.4})}

function loadMap(id){if(curMap===id)return;scene.remove(mapGroup);mapGroup.traverse(o=>{if(o.geometry&&o!==fountainPts)o.geometry.dispose()});
 mapGroup=new THREE.Group();scene.add(mapGroup);level.length=0;boxes.length=0;mapAnims.length=0;for(let i=0;i<FN;i++){fl[i]=0;fp[i*3+1]=-999}
 pads.length=0;if(id==='plaza')buildPlaza();else buildFactory();applyShadows();curMap=id}
let mapId='zavod';try{mapId=localStorage.getItem('ug-map')==='plaza'?'plaza':'zavod'}catch(e){}
loadMap(mapId);
const inBox=p=>{for(const b of boxes)if(p.x>b.min.x&&p.x<b.max.x&&p.y>b.min.y&&p.y<b.max.y&&p.z>b.min.z&&p.z<b.max.z)return true;return false};
function ov(p,r,h,b){return p.x+r>b.min.x&&p.x-r<b.max.x&&p.z+r>b.min.z&&p.z-r<b.max.z&&p.y+h>b.min.y&&p.y<b.max.y}
function moveBody(p,v,r,h,dt,step){let ground=false,wall=null;
 p.x+=v.x*dt;for(const b of boxes)if(ov(p,r,h,b)){const up=b.max.y-p.y;if(step&&up>0&&up<=.55){p.y=b.max.y;continue}
  if(p.x+r-b.min.x<b.max.x-(p.x-r)){p.x=b.min.x-r-1e-3;wall=new V3(-1,0,0)}else{p.x=b.max.x+r+1e-3;wall=new V3(1,0,0)}v.x=0}
 p.z+=v.z*dt;for(const b of boxes)if(ov(p,r,h,b)){const up=b.max.y-p.y;if(step&&up>0&&up<=.55){p.y=b.max.y;continue}
  if(p.z+r-b.min.z<b.max.z-(p.z-r)){p.z=b.min.z-r-1e-3;wall=new V3(0,0,-1)}else{p.z=b.max.z+r+1e-3;wall=new V3(0,0,1)}v.z=0}
 p.y+=v.y*dt;for(const b of boxes)if(ov(p,r,h,b)){if(v.y<=0){p.y=b.max.y;ground=true}else p.y=b.min.y-h-1e-3;v.y=0}
 return{ground,wall}}

/* ================= audio ================= */
let ac=null,master=null,noise=null,muted=false;
function initAudio(){if(ac)return;try{ac=new(window.AudioContext||window.webkitAudioContext)();master=ac.createGain();master.gain.value=.3;master.connect(ac.destination);
 noise=ac.createBuffer(1,ac.sampleRate,ac.sampleRate);const d=noise.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1}catch(e){ac=null}}
function nz(dur,type,f,vol,f2){const t=ac.currentTime,s=ac.createBufferSource();s.buffer=noise;const fl=ac.createBiquadFilter();fl.type=type;fl.frequency.setValueAtTime(f,t);if(f2)fl.frequency.exponentialRampToValueAtTime(f2,t+dur);
 const g=ac.createGain();g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.001,t+dur);s.connect(fl);fl.connect(g);g.connect(master);s.start(t);s.stop(t+dur)}
function tone(dur,type,f,f2,vol){const t=ac.currentTime,o=ac.createOscillator();o.type=type;o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+dur);
 const g=ac.createGain();g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.001,t+dur);o.connect(g);g.connect(master);o.start(t);o.stop(t+dur)}
function sfx(k,v=1){if(!ac||muted)return;try{
 if(k==='rev'){nz(.14,'bandpass',2200,.9*v);tone(.12,'square',180,60,.25*v)}
 else if(k==='charge'){nz(.35,'bandpass',3000,.9*v,600);tone(.4,'sawtooth',900,80,.3*v)}
 else if(k==='shot'){nz(.28,'lowpass',1400,1.1*v,300);tone(.15,'square',120,40,.3*v)}
 else if(k==='rocket'){nz(.3,'bandpass',800,.6*v,2400);tone(.3,'sawtooth',200,500,.15*v)}
 else if(k==='boom'){nz(.8,'lowpass',700,1.4*v,60);tone(.5,'sine',90,30,.6*v)}
 else if(k==='hit'){tone(.05,'square',1200,900,.12)}
 else if(k==='kill'){tone(.25,'sawtooth',500,90,.2);nz(.2,'highpass',2500,.3)}
 else if(k==='frag'){tone(.4,'square',400,1200,.25);tone(.4,'sine',800,1600,.2)}
 else if(k==='parry'){tone(.35,'sine',1500,2200,.35);tone(.35,'triangle',750,1100,.25)}
 else if(k==='dash'){nz(.18,'highpass',800,.5,4000)}
 else if(k==='hurt'){tone(.2,'sawtooth',220,90,.35)}
 else if(k==='heal'){tone(.12,'sine',700,1000,.15)}
 else if(k==='throw'){nz(.15,'bandpass',1200,.4,500)}
 else if(k==='orb'){tone(.2,'triangle',600,300,.12*v)}
 else if(k==='ding'){tone(.35,'triangle',2200,2600,.25*v);tone(.25,'sine',3300,3000,.12*v)}
 else if(k==='flip'){tone(.12,'triangle',1400,1800,.12*v)}
 else if(k==='spray'){nz(.09,'highpass',3500,.25*v,1500)}
 else if(k==='jet'){nz(.45,'bandpass',900,1*v,3000);tone(.3,'sawtooth',120,400,.15*v)}
 else if(k==='slam'){nz(.5,'lowpass',400,1.2*v,50);tone(.4,'sine',70,30,.6*v)}
}catch(e){}}

/* ================= fx ================= */
const PN=900,pg=new THREE.BufferGeometry(),pp=new Float32Array(PN*3),pc=new Float32Array(PN*3),pv=new Float32Array(PN*3),pl=new Float32Array(PN),pgv=new Float32Array(PN);
for(let i=0;i<PN;i++)pp[i*3+1]=-999;
pg.setAttribute('position',new THREE.BufferAttribute(pp,3));pg.setAttribute('color',new THREE.BufferAttribute(pc,3));
const points=new THREE.Points(pg,new THREE.PointsMaterial({size:.22,vertexColors:true,transparent:true,opacity:.95}));points.frustumCulled=false;scene.add(points);
let pi=0;const col=new THREE.Color();
function puff(pos,n,hex,spd,life,grav=14){col.setHex(hex);for(let k=0;k<n;k++){const i=pi=(pi+1)%PN;pp[i*3]=pos.x;pp[i*3+1]=pos.y;pp[i*3+2]=pos.z;
 const a=Math.random()*6.283,u=Math.random()*2-1,s=spd*(.3+Math.random()*.7),q=Math.sqrt(1-u*u);pv[i*3]=Math.cos(a)*q*s;pv[i*3+1]=u*s+spd*.3;pv[i*3+2]=Math.sin(a)*q*s;
 pc[i*3]=col.r;pc[i*3+1]=col.g;pc[i*3+2]=col.b;pl[i]=life*(.5+Math.random()*.5);pgv[i]=grav}}
function spray(o,d,n){for(let k=0;k<n;k++){const i=pi=(pi+1)%PN;const foam=Math.random()<.35;col.setHex(foam?0xf6eee2:0x6b2a12);pp[i*3]=o.x;pp[i*3+1]=o.y;pp[i*3+2]=o.z;
 pv[i*3]=d.x*40+rnd(-2.5,2.5);pv[i*3+1]=d.y*40+rnd(-1.5,3);pv[i*3+2]=d.z*40+rnd(-2.5,2.5);pc[i*3]=col.r;pc[i*3+1]=col.g;pc[i*3+2]=col.b;pl[i]=rnd(.6,.85);pgv[i]=7}}
const fx=[];
function tracer(a,b,hex){const g=new THREE.BufferGeometry().setFromPoints([a,b]);const m=new THREE.Line(g,new THREE.LineBasicMaterial({color:hex,transparent:true,opacity:1}));scene.add(m);fx.push({m,t:.12,max:.12,kind:'line'})}
function blast(pos,r,hex){const m=new THREE.Mesh(new THREE.SphereGeometry(1,20,14),new THREE.MeshBasicMaterial({color:hex,transparent:true,opacity:.85,depthWrite:false}));m.position.copy(pos);m.scale.setScalar(.3);scene.add(m);fx.push({m,t:.3,max:.3,r,kind:'blast'});flashLight.position.copy(pos);flashLight.intensity=6}
function ring(pos,r,hex){const m=new THREE.Mesh(new THREE.RingGeometry(.8,1,40),new THREE.MeshBasicMaterial({color:hex,transparent:true,side:THREE.DoubleSide,depthWrite:false}));m.rotation.x=-Math.PI/2;m.position.copy(pos);m.position.y+=.1;scene.add(m);fx.push({m,t:.35,max:.35,r,kind:'ring'})}
function updFx(dt){for(let i=0;i<PN;i++){if(pl[i]<=0)continue;pl[i]-=dt;if(pl[i]<=0){pp[i*3+1]=-999;continue}
 pv[i*3+1]-=pgv[i]*dt;pp[i*3]+=pv[i*3]*dt;pp[i*3+1]+=pv[i*3+1]*dt;pp[i*3+2]+=pv[i*3+2]*dt;if(pp[i*3+1]<.02){pp[i*3+1]=.02;pv[i*3+1]*=-.3;pv[i*3]*=.7;pv[i*3+2]*=.7}}
 pg.attributes.position.needsUpdate=true;pg.attributes.color.needsUpdate=true;
 for(let i=fx.length-1;i>=0;i--){const f=fx[i];f.t-=dt;const k=1-f.t/f.max;
  if(f.kind==='line')f.m.material.opacity=f.t/f.max;
  else if(f.kind==='blast'){f.m.scale.setScalar(.3+f.r*Math.min(1,k*1.6));f.m.material.opacity=.85*(1-k)}
  else{f.m.scale.setScalar(f.r*k);f.m.material.opacity=1-k}
  if(f.t<=0){scene.remove(f.m);f.m.geometry.dispose();f.m.material.dispose();fx.splice(i,1)}}
 flashLight.intensity=Math.max(0,flashLight.intensity-dt*30)}

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
const fpMat={armor:M(new THREE.Color(myColor),{metalness:.55,roughness:.3,envMap:ENV})};setTimeout(()=>{try{rebuildSelf()}catch(e){}},0);
/* hold — точка хвата (верх рукояти) в пространстве камеры; rot — разворот ствола к прицелу */
const GUN_CFG=[
 {f:'shipuchka',len:.44,hold:[.25,-.2,-.6],rot:[.03,.07,0],mz:/^Срез[ _]трубочки/,fl:.15},
 {f:'shaker',len:.6,hold:[.24,-.215,-.62],rot:[.03,.06,0],mz:/^Дуло/,fl:.26},
 {f:'mentos',len:.6,hold:[.26,-.25,-.64],rot:[.03,.065,0],mz:/^Крышка-распылитель/,fl:.22},
 {f:'gazyava',len:.52,hold:[.235,-.215,-.66],rot:[.03,.06,0],mz:/^Дульце/,fl:0}];
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
  P_.caps=[];const extra=[];m.traverse(o=>{const r=/^Запасная[ _]крышка[ _](\d)$/.exec(o.name);if(r){if(+r[1]<=4)P_.caps[+r[1]-1]=o;else extra.push(o)}});extra.forEach(o=>o.parent&&o.parent.remove(o))}
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
  if(P_.caps)P_.caps.forEach((c,j)=>{if(c)c.visible=j<coinCh})
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
/* роботизированная рука для удара: сине-бело-красная броня, хромовые суставы, сегментные пальцы */
const fist=new THREE.Group(),fingerJoints=[],thumbJoints=[];
{const blue=new THREE.MeshStandardMaterial({color:0x1f4fc8,metalness:.75,roughness:.28}),navy=new THREE.MeshStandardMaterial({color:0x0e1f55,metalness:.6,roughness:.35}),
 white=new THREE.MeshStandardMaterial({color:0xf2f5fa,metalness:.25,roughness:.3}),red=new THREE.MeshStandardMaterial({color:0xd0122c,metalness:.4,roughness:.3}),
 chrome=new THREE.MeshStandardMaterial({color:0xe8ecf2,metalness:1,roughness:.12}),dark=new THREE.MeshStandardMaterial({color:0x1a1d24,metalness:.7,roughness:.4}),
 glow=new THREE.MeshBasicMaterial({color:0x6fd6ff});
 const add=(par,geo,mat,x,y,z,rx=0,ry=0,rz=0)=>{const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.rotation.set(rx,ry,rz);par.add(m);return m};
 const R90=Math.PI/2;
 // предплечье
 add(fist,new THREE.CylinderGeometry(.05,.058,.42,20),blue,0,0,.12,R90);
 add(fist,new THREE.BoxGeometry(.085,.03,.3),white,0,.048,.1);add(fist,new THREE.BoxGeometry(.03,.07,.26),white,-.05,.0,.12);
 for(const z of[.0,.2])add(fist,new THREE.TorusGeometry(.059,.009,8,24),red,0,0,z);
 add(fist,new THREE.TorusGeometry(.06,.006,8,24),chrome,0,0,.29);
 for(const sx of[-1,1]){add(fist,new THREE.CylinderGeometry(.008,.008,.24,8),chrome,sx*.064,-.03,.08,R90);add(fist,new THREE.CylinderGeometry(.013,.013,.08,10),dark,sx*.064,-.03,.24,R90)}
 // баллон-банка на предплечье
 add(fist,new THREE.CylinderGeometry(.03,.03,.11,20),blue,.06,.05,.14,R90);add(fist,new THREE.CylinderGeometry(.0305,.0305,.03,20),white,.06,.05,.14,R90);
 add(fist,new THREE.CylinderGeometry(.027,.027,.008,20),chrome,.06,.05,.085,R90);add(fist,new THREE.CylinderGeometry(.027,.027,.008,20),chrome,.06,.05,.195,R90);
 add(fist,new THREE.SphereGeometry(.009,8,6),glow,-.02,.066,.02);add(fist,new THREE.SphereGeometry(.009,8,6),glow,.0,.066,.02);
 // запястье
 add(fist,new THREE.SphereGeometry(.05,16,12),chrome,0,0,-.11);add(fist,new THREE.TorusGeometry(.052,.008,8,24),red,0,0,-.1);
 // ладонь
 const hand=new THREE.Group();hand.position.set(0,0,-.13);hand.scale.setScalar(1.75);fist.add(hand);
 add(hand,new THREE.BoxGeometry(.1,.04,.1),blue,0,0,-.04);add(hand,new THREE.BoxGeometry(.104,.012,.085),white,0,.024,-.04);
 add(hand,new THREE.BoxGeometry(.06,.006,.05),red,0,.032,-.04);add(hand,new THREE.SphereGeometry(.007,8,6),glow,0,.036,-.06);
 // пальцы: 3 сегмента, хромовые костяшки
 const segL=[.034,.026,.022];
 for(let f=0;f<4;f++){let par=hand;const x=-.036+f*.024,joints=[];
  for(let k=0;k<3;k++){const j=new THREE.Group();j.position.set(k?0:x,k?0:.004,k?-segL[k-1]:-.094);par.add(j);
   add(j,new THREE.SphereGeometry(.011,10,8),chrome,0,0,0);add(j,new THREE.BoxGeometry(.017,.017,segL[k]),k===2?white:blue,0,0,-segL[k]/2);
   if(k<2)add(j,new THREE.BoxGeometry(.019,.006,segL[k]*.7),white,0,.011,-segL[k]/2);
   if(k===2)add(j,new THREE.BoxGeometry(.012,.004,.008),red,0,.009,-segL[k]+.006);
   joints.push(j);par=j}
  fingerJoints.push(joints)}
 // большой палец
 {let par=hand;for(let k=0;k<2;k++){const j=new THREE.Group();if(!k){j.position.set(-.056,-.006,-.03);j.rotation.set(0,.7,.3)}else j.position.set(0,0,-.03);par.add(j);
  add(j,new THREE.SphereGeometry(.012,10,8),chrome,0,0,0);add(j,new THREE.BoxGeometry(.019,.019,.03),k?white:blue,0,0,-.015);thumbJoints.push(j);par=j}}
 fist.traverse(o=>{if(o.isMesh)o.renderOrder=1})}
function poseFist(curl){fingerJoints.forEach((js,f)=>js.forEach((j,k)=>{j.rotation.x=-curl*[1.45,1.6,1.25][k]*(1-f*.03)}));
 thumbJoints[0].rotation.x=-curl*.5;thumbJoints[1].rotation.x=-curl*.9;thumbJoints[0].rotation.y=.7-curl*.5}
fist.position.set(-.26,-.3,-.45);fist.visible=false;gunScene.add(fist);poseFist(0);

/* ================= ГЕРОЙ «Г-1 Газировщик»: процедурная модель и анимации ================= */
const HL={th:.42,sh:.42,mt:.26,ft:.05},WHITE=new THREE.Color(1,1,1);
const mix=(a,b,t)=>a+(b-a)*t,clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
function tbox(w0,w1,h,d0,d1,dz=0){const g=new THREE.BoxGeometry(1,h,1),p=g.attributes.position;
 for(let i=0;i<p.count;i++){const t=p.getY(i)>0;p.setX(i,p.getX(i)*(t?w1:w0));p.setZ(i,p.getZ(i)*(t?d1:d0)+(t?dz:0))}g.computeVertexNormals();return g}
const cylZ=(rNeg,rPos,l,s=8)=>new THREE.CylinderGeometry(rPos,rNeg,l,s).rotateX(Math.PI/2);
const HM={dark:M(0x1c1e24,{metalness:.8,roughness:.36,envMap:ENV}),chrome:M(0xe6eaf0,{metalness:1,roughness:.13,envMap:ENV,envMapIntensity:1.25}),
 cream:M(0xf6eee2,{metalness:.15,roughness:.34,envMap:ENV,envMapIntensity:.6}),red:M(0xc8102e,{metalness:.5,roughness:.28,envMap:ENV}),
 crest:M(0xc8102e,{metalness:.55,roughness:.26,envMap:ENV,side:THREE.DoubleSide,emissive:0x1a0000}),
 gold:M(0xf2b84b,{metalness:.9,roughness:.22,envMap:ENV}),glass:M(0x2a0d06,{metalness:.35,roughness:.07,envMap:ENV,envMapIntensity:1.7}),
 blue:M(0x1f4fc8,{metalness:.7,roughness:.28,envMap:ENV}),white:M(0xf2f5fa,{metalness:.25,roughness:.3,envMap:ENV}),rubber:M(0x121216,{roughness:.85})};
const HMC={};
function heroMats(col,pat='solid'){const key=col+'|'+pat;if(HMC[key])return HMC[key];const c=new THREE.Color(col);
 return HMC[key]={armor:M(c,{map:patTex(pat),metalness:.55,roughness:.3,envMap:ENV}),armorD:M(c.clone().multiplyScalar(.42),{metalness:.7,roughness:.34,envMap:ENV})}}
const WING_T=(()=>{const c=document.createElement('canvas');c.width=64;c.height=256;const g=c.getContext('2d');
 const h=g.createLinearGradient(0,0,64,0);h.addColorStop(0,'rgba(255,255,255,0)');h.addColorStop(.12,'rgba(255,255,255,.35)');h.addColorStop(.3,'rgba(255,255,255,.55)');h.addColorStop(.5,'#fff');h.addColorStop(.7,'rgba(255,255,255,.55)');h.addColorStop(.88,'rgba(255,255,255,.35)');h.addColorStop(1,'rgba(255,255,255,0)');
 g.fillStyle=h;g.fillRect(0,0,64,256);g.globalCompositeOperation='destination-in';const v=g.createLinearGradient(0,0,0,256);
 v.addColorStop(0,'rgba(0,0,0,.04)');v.addColorStop(.55,'rgba(0,0,0,.8)');v.addColorStop(.9,'#000');v.addColorStop(1,'rgba(0,0,0,.5)');g.fillStyle=v;g.fillRect(0,0,64,256);
 const t=new THREE.CanvasTexture(c);t.minFilter=THREE.LinearFilter;return t})();
function bladeGeo(L,W){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute([0,0,0,-W*.5,L*.24,0,0,L,0,W*.5,L*.24,0],3));
 g.setAttribute('uv',new THREE.Float32BufferAttribute([.5,0,0,.24,.5,1,1,.24],2));g.setIndex([0,3,2,0,2,1]);return g}
const HG=(()=>{const R8=Math.PI/8;return{
 pelvis:tbox(.2,.27,.15,.13,.18),belt:tbox(.29,.29,.04,.2,.2),tasset:tbox(.13,.1,.17,.025,.025).translate(0,-.085,0),
 hipBall:new THREE.SphereGeometry(.056,12,8),joint:new THREE.SphereGeometry(.05,12,8),jointS:new THREE.SphereGeometry(.038,10,8),
 thigh:new THREE.CylinderGeometry(.038,.03,HL.th,6).translate(0,-HL.th/2,0),thighPl:tbox(.075,.125,.3,.07,.085,-.01).translate(0,-.19,-.022),
 thighStripe:new THREE.BoxGeometry(.03,.26,.012).translate(0,-.19,-.07),
 shin:new THREE.CylinderGeometry(.03,.026,HL.sh,6).translate(0,-HL.sh/2,0),shinPl:tbox(.055,.09,.32,.035,.055,-.012).translate(0,-.2,-.03),
 piston:new THREE.CylinderGeometry(.011,.011,.3,6).translate(0,-.21,.038),
 meta:new THREE.CylinderGeometry(.026,.019,HL.mt,6).translate(0,-HL.mt/2,0),metaPl:tbox(.04,.055,.2,.03,.036).translate(0,-.13,.022),
 foot:tbox(.105,.075,.05,.21,.16,-.02).translate(0,-.025,-.06),heel:tbox(.035,.012,.035,.05,.015,.012).translate(0,-.03,.06),
 toeCap:tbox(.1,.07,.025,.05,.035).translate(0,-.012,-.15),
 waist:new THREE.CylinderGeometry(.055,.07,.16,8).rotateY(R8).translate(0,.08,0),waistRing:new THREE.TorusGeometry(.066,.011,6,16).rotateX(Math.PI/2),
 abs:tbox(.17,.21,.1,.12,.13).translate(0,.06,-.03),
 chest:tbox(.3,.5,.34,.19,.27,-.03).translate(0,.2,0),chestBack:tbox(.27,.42,.28,.08,.07).translate(0,.2,.115),
 collar:tbox(.42,.28,.06,.25,.18).translate(0,.4,0),stripe:new THREE.BoxGeometry(.05,.36,.022),
 coreRim:new THREE.CylinderGeometry(.068,.068,.05,18).rotateX(Math.PI/2),core:new THREE.CircleGeometry(.054,18),coreTab:new THREE.BoxGeometry(.02,.05,.012),
 tank:new THREE.CylinderGeometry(.045,.045,.26,12),tankCap:new THREE.SphereGeometry(.045,12,6,0,Math.PI*2,0,Math.PI/2),valve:new THREE.CylinderGeometry(.011,.011,.05,6),
 neck:new THREE.CylinderGeometry(.038,.05,.08,8).translate(0,.04,0),
 helm:new THREE.CylinderGeometry(.07,.116,.19,8).rotateY(R8).translate(0,.095,0),helmBand:new THREE.CylinderGeometry(.121,.121,.045,8).rotateY(R8).translate(0,.03,0),
 lip:new THREE.TorusGeometry(.072,.013,6,16).rotateX(Math.PI/2),crown:crownGeo(.084,17),
 visor:new THREE.BoxGeometry(.15,.026,.02),visorFrame:new THREE.BoxGeometry(.175,.05,.024),jaw:tbox(.14,.16,.07,.06,.05).translate(0,.035,-.07),
 fin:tbox(.012,.012,.05,.13,.06,.03),
 pad:tbox(.17,.12,.08,.2,.15),padTrim:tbox(.18,.18,.018,.21,.21),
 upper:new THREE.CylinderGeometry(.032,.028,.28,6).translate(0,-.14,0),upperPl:tbox(.07,.06,.2,.085,.07).translate(0,-.12,0),
 fore:tbox(.085,.07,.24,.095,.075).translate(0,-.135,0),foreStripe:new THREE.BoxGeometry(.012,.2,.02).translate(0,-.135,-.048),
 foreL:new THREE.CylinderGeometry(.044,.05,.25,12).translate(0,-.135,0),ring:new THREE.TorusGeometry(.051,.008,6,16).rotateX(Math.PI/2),
 foreLPl:new THREE.BoxGeometry(.03,.2,.05).translate(.04,-.13,0),fist:tbox(.07,.075,.085,.085,.08),knuckle:new THREE.BoxGeometry(.078,.028,.03),
 gripHand:tbox(.062,.066,.075,.1,.105),
 bladeA:bladeGeo(.78,.17),bladeB:bladeGeo(.66,.15),bladeC:bladeGeo(.5,.12),wingRoot:new THREE.BoxGeometry(.05,.05,.06)}})();
const heroes=new Set();
function buildHero(color,opt={}){
 const cos=opt.cos||{crest:0,wings:0,pattern:0},mt=heroMats(color,COS.pattern[cos.pattern][0]),root=new THREE.Group(),J={},layer=opt.layer||0;
 const glowC=new THREE.Color(color).lerp(WHITE,.5),glow=new THREE.MeshBasicMaterial({color:glowC.clone()});
 const wingM=new THREE.MeshBasicMaterial({map:WING_T,color:new THREE.Color(color).lerp(WHITE,.18),transparent:true,opacity:.9,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide});
 const add=(par,geo,mat,x=0,y=0,z=0,rx=0,ry=0,rz=0)=>{const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.rotation.set(rx,ry,rz);m.castShadow=mat!==glow&&mat!==wingM;par.add(m);return m};
 const grp=(par,x=0,y=0,z=0)=>{const g=new THREE.Group();g.position.set(x,y,z);par.add(g);return g};
 J.body=grp(root);J.hips=grp(J.body,0,.98,0);
 // таз: тёмный каркас, пояс в цвет брони, набедренные пластины
 add(J.hips,HG.pelvis,HM.dark);add(J.hips,HG.belt,mt.armor,0,.06,0);
 for(const s of[-1,1]){add(J.hips,HG.tasset,mt.armor,s*.075,.035,-.1,.22,0,s*-.12);add(J.hips,HG.tasset,mt.armorD,s*.13,.03,0,0,0,s*.35)}
 add(J.hips,HG.tasset,mt.armorD,0,.04,.1,-.25,0,0);
 // ноги: цифровидные, как у машин — бедро вперёд, голень назад, длинная плюсна
 for(const s of[-1,1]){const L={};L.hip=grp(J.hips,s*.115,-.04,0);
  add(L.hip,HG.hipBall,HM.chrome);add(L.hip,HG.thigh,HM.dark);add(L.hip,HG.thighPl,mt.armor);add(L.hip,HG.thighStripe,HM.cream,s*.025,0,0);
  L.knee=grp(L.hip,0,-HL.th,0);add(L.knee,HG.joint,HM.chrome);const kc=add(L.knee,HG.crown,HM.crest,0,0,-.045,-Math.PI/2);kc.scale.setScalar(.55);
  add(L.knee,HG.shin,HM.dark);add(L.knee,HG.shinPl,mt.armor);add(L.knee,HG.piston,HM.chrome);
  L.ankle=grp(L.knee,0,-HL.sh,0);add(L.ankle,HG.jointS,HM.chrome);add(L.ankle,HG.meta,HM.dark);add(L.ankle,HG.metaPl,mt.armorD);
  L.toe=grp(L.ankle,0,-HL.mt,0);add(L.toe,HG.jointS,HM.chrome).scale.setScalar(.8);add(L.toe,HG.foot,HM.dark);add(L.toe,HG.toeCap,mt.armor);add(L.toe,HG.heel,HM.red);
  J[s<0?'L':'R']=L}
 // корпус
 J.spine=grp(J.hips,0,.05,0);add(J.spine,HG.waist,HM.dark);add(J.spine,HG.waistRing,HM.chrome,0,.04,0);add(J.spine,HG.waistRing,HM.chrome,0,.12,0);add(J.spine,HG.abs,mt.armorD);
 J.chest=grp(J.spine,0,.15,0);const C=J.chest;
 add(C,HG.chest,mt.armor);add(C,HG.chestBack,HM.dark);add(C,HG.collar,HM.dark);
 add(C,HG.stripe,HM.cream,-.09,.2,-.118,-.12,0,-.55);add(C,HG.stripe,HM.red,-.035,.2,-.122,-.12,0,-.55).scale.set(.5,.9,1);
 // ядро-банка в груди: светится цветом игрока
 add(C,HG.coreRim,HM.chrome,.06,.2,-.13);J.core=add(C,HG.core,glow,.06,.2,-.156,0,Math.PI);add(C,HG.coreTab,HM.chrome,.06,.235,-.16);
 // баллоны CO2 на спине
 for(const s of[-1,1]){const tk=grp(C,s*.08,.2,.16);tk.rotation.z=s*-.08;add(tk,HG.tank,HM.gold);add(tk,HG.tankCap,HM.chrome,0,.13,0);add(tk,HG.tankCap,HM.chrome,0,-.13,0,Math.PI);add(tk,HG.valve,HM.chrome,0,.17,0);add(tk,HG.ring,HM.red,0,.06,0).scale.setScalar(.9)}
 // крылья: энергетические лезвия, яркость = здоровье
 J.wingG=grp(C,0,.27,.2);J.wingG.rotation.x=.42;J.blades=[];
 for(const s of[-1,1]){add(J.wingG,HG.wingRoot,HM.chrome,s*.045,0,0);
  const wv=COS.wings[cos.wings][0];WINGS[wv].forEach(([geo,a],i)=>{const p=grp(J.wingG,s*.05,0,i*.012);
   if(geo)add(p,geo,wingM);else for(const [y,sc] of [[.14,.07],[.3,.092],[.46,.075],[.6,.055]])add(p,CG.bub,wingM,0,y*(1-i*.08),0).scale.setScalar(sc*(1-i*.1));
   p.userData.base=-s*a;p.rotation.z=-s*a;J.blades.push(p)})}
 if(COS.wings[cos.wings][0]==='bubbles')wingM.map=BUB_T;
 // голова: горлышко бутылки из тёмного стекла, визор, крышка-гребень
 J.neck=grp(C,0,.42,.01);add(J.neck,HG.neck,HM.chrome);J.head=grp(J.neck,0,.075,0);const Hd=J.head;
 add(Hd,HG.helm,HM.glass);add(Hd,HG.helmBand,mt.armor);add(Hd,HG.jaw,HM.dark);add(Hd,HG.lip,HM.chrome,0,.19,0);buildCrest({glow,J},Hd,add,COS.crest[cos.crest][0]);
 add(Hd,HG.visorFrame,HM.dark,0,.105,-.087,-.24);J.visor=add(Hd,HG.visor,glow,0,.106,-.098,-.24);
 for(const s of[-1,1])add(Hd,HG.fin,HM.chrome,s*.1,.12,.03,-.35,0,s*.18);
 // руки: левая — сине-бело-красный «кулак», правая держит оружие
 for(const s of[-1,1]){const A={};A.sh=grp(C,s*.275,.33,0);A.sh.rotation.order='YXZ';
  add(A.sh,HG.joint,HM.chrome);add(A.sh,HG.pad,s<0?HM.blue:mt.armor,s*.035,.035,0,0,0,s*-.42);add(A.sh,HG.padTrim,HM.cream,s*.03,.0,0,0,0,s*-.42).scale.set(.9,1,.9);
  add(A.sh,HG.upper,HM.dark);add(A.sh,HG.upperPl,s<0?HM.white:mt.armorD,s*.022,0,0);
  A.el=grp(A.sh,0,-.28,0);add(A.el,HG.jointS,HM.chrome);
  if(s<0){add(A.el,HG.foreL,HM.blue);add(A.el,HG.foreLPl,HM.white);add(A.el,HG.ring,HM.red,0,-.05,0);add(A.el,HG.ring,HM.red,0,-.22,0);}
  else{add(A.el,HG.fore,mt.armor);add(A.el,HG.foreStripe,HM.cream);add(A.el,HG.ring,HM.chrome,0,-.245,0).scale.setScalar(.95)}
  A.hand=grp(A.el,0,-.28,0);
  if(s<0){add(A.hand,HG.fist,HM.blue,0,-.03,0);add(A.hand,HG.knuckle,HM.white,0,-.03,-.045);add(A.hand,HG.jointS,HM.chrome,0,0,0).scale.setScalar(.8)}
  else{add(A.hand,HG.jointS,HM.chrome).scale.setScalar(.8);add(A.hand,HG.gripHand,HM.dark,0,-.062,.05);add(A.hand,HG.knuckle,mt.armor,.034,-.062,.05,0,Math.PI/2).scale.set(1.1,2.4,.45)}
  J[s<0?'aL':'aR']=A}
 // оружие в руке (клоны моделей вьюмодели) + вспышка
 J.tpG=grp(J.aR.hand,0,-.06,0);J.tpG.rotation.x=-Math.PI/2;J.tp=[];J.flash=flashSprite();J.flash.scale.setScalar(.45);J.tpG.add(J.flash);
 root.traverse(o=>{if(o.material===mt.armor)o.userData.mk='a';else if(o.material===mt.armorD)o.userData.mk='d';if(layer)o.layers.set(layer)});
 const h={cos:cosStr(cos),root,J,layer,color,glow,glowC,wingM,t:Math.random()*9,ph:0,wRun:0,wAir:0,wSlide:0,wDash:0,wSlam:0,hipYaw:0,fireT:0,punchT:0,landT:0,dead:false,deadT:0,wasAir:false,vyPrev:0,lastW:-1,flashT:0};
 for(let i=0;i<4;i++)attachTPGun(h,i);heroes.add(h);return h}
function attachTPGun(h,i){const u=guns[i]&&guns[i].userData;if(!u||!u.holder||h.J.tp[i])return;
 const g=new THREE.Group(),c=u.holder.clone();g.add(c);g.scale.setScalar(1.15);g.visible=false;
 c.traverse(o=>{if(o.isMesh)o.castShadow=true;if(h.layer)o.layers.set(h.layer)});h.J.tpG.add(g);h.J.tp[i]=g;h.lastW=-1}
function disposeHero(h){heroes.delete(h);if(h.root.parent)h.root.parent.remove(h.root)}
function setHeroColor(h,col){const mt=heroMats(col);h.color=col;h.glowC.set(col).lerp(WHITE,.5);h.glow.color.copy(h.glowC);h.wingM.color.set(col).lerp(WHITE,.18);
 h.root.traverse(o=>{if(o.userData.mk==='a')o.material=mt.armor;else if(o.userData.mk==='d')o.material=mt.armorD})}
/* s: {vx,vz,vy,yaw,air,slide,dash,slam,pitch,hp,alive,w} */
function animHero(h,s,dt){const J=h.J,e=r=>1-Math.exp(-r*dt);h.t+=dt;
 if(!s.alive){if(!h.dead){h.dead=true;h.deadT=0}h.deadT+=dt}else if(h.dead){h.dead=false;h.deadT=0}
 const dead=h.dead,spd=Math.hypot(s.vx,s.vz),fx=-Math.sin(s.yaw),fz=-Math.cos(s.yaw),fw=s.vx*fx+s.vz*fz,sd=-s.vx*fz+s.vz*fx;
 const gr=!s.air&&!s.dash&&!s.slam&&!dead;
 h.wRun+=((gr&&!s.slide?Math.min(1,spd/7):0)-h.wRun)*e(10);
 h.wAir+=((s.air&&!s.dash&&!s.slam&&!dead?1:0)-h.wAir)*e(8);
 h.wSlide+=((s.slide&&!dead?1:0)-h.wSlide)*e(14);
 h.wDash+=((s.dash&&!dead?1:0)-h.wDash)*e(16);
 h.wSlam+=((s.slam&&!dead?1:0)-h.wSlam)*e(14);
 const wD=dead?Math.min(1,h.deadT/.3):0,wF=dead?clamp((h.deadT-.25)/.45,0,1):0,wFe=wF*wF*(3-2*wF);
 if(h.wasAir&&!s.air&&h.vyPrev<-9)h.landT=Math.min(1,-h.vyPrev/28);h.wasAir=s.air;h.vyPrev=s.vy;h.landT=Math.max(0,h.landT-dt*4.5);
 let ma=Math.atan2(sd,fw),dir=1;if(Math.abs(ma)>1.75){ma-=Math.sign(ma)*Math.PI;dir=-1}ma=clamp(ma,-1.05,1.05);
 h.hipYaw+=((gr&&!s.slide&&spd>1.5?-ma:0)-h.hipYaw)*e(9);if(gr)h.ph+=dt*dir*Math.min(14,spd*.95);
 const tuck=.5+.5*clamp(s.vy/10,-1,1);let hmax=0;
 for(const [g,ph,lead] of [[J.L,h.ph,true],[J.R,h.ph+Math.PI,false]]){
  const c=Math.cos(ph),sn=Math.sin(ph),lift=Math.max(0,-sn),st=Math.max(0,sn),br=Math.sin(h.t*2.1)*.025;
  let th=.5,kn=-1.2+br,an=.9-br*.5,tz=(lead?-1:1)*.05;
  th=mix(th,.45+.62*c,h.wRun);kn=mix(kn,-1.1-1.05*lift+.12*st,h.wRun);an=mix(an,.85+.62*lift-.08*st,h.wRun);
  th=mix(th,lead?.75+.6*tuck:.18+.3*tuck,h.wAir);kn=mix(kn,lead?-1.45-.65*tuck:-.85-.5*tuck,h.wAir);an=mix(an,lead?1.05+.3*tuck:.55+.3*tuck,h.wAir);
  th=mix(th,lead?1.5:-.15,h.wSlide);kn=mix(kn,lead?-.35:-2.25,h.wSlide);an=mix(an,lead?.3:1.55,h.wSlide);tz=mix(tz,(lead?-1:1)*.13,h.wSlide);
  th=mix(th,lead?-.1:-.45,h.wDash);kn=mix(kn,lead?-1.35:-1.7,h.wDash);an=mix(an,1.1,h.wDash);
  th=mix(th,.12,h.wSlam);kn=mix(kn,-.5,h.wSlam);an=mix(an,.42,h.wSlam);tz=mix(tz,(lead?-1:1)*.015,h.wSlam);
  th+=h.landT*.4;kn-=h.landT*.8;an+=h.landT*.4;
  th=mix(th,lead?1.55:1.3,wD);kn=mix(kn,lead?-2.55:-2.35,wD);an=mix(an,1.25,wD);
  g.hip.rotation.set(th,0,tz);g.knee.rotation.x=kn;g.ankle.rotation.x=an;
  const sum=th+kn+an,point=Math.max(h.wAir*.75,h.wSlam*.9,h.wDash*.8);g.toe.rotation.x=-sum-point*.55;
  hmax=Math.max(hmax,HL.th*Math.cos(th)+HL.sh*Math.cos(th+kn)+HL.mt*Math.cos(sum)+HL.ft)}
 let hy=mix(hmax,.98,Math.max(h.wAir,h.wDash,h.wSlam));hy=mix(hy,.5,h.wSlide);hy=mix(hy,.56,wD);
 J.hips.position.y=hy;J.hips.rotation.set(0,h.hipYaw,Math.sin(h.ph)*.06*h.wRun);
 // корпус
 h.punchT=Math.max(0,h.punchT-dt);const pk=h.punchT>0?Math.sin(Math.min(1,(1-h.punchT/.3)*1.7)*Math.PI):0;
 const lean=(dir>0?-.22:.12)*h.wRun*Math.min(1,spd/13);
 let spx=lean+.38*h.wSlide-.6*h.wDash+.08*h.wAir+.1*h.wSlam-h.landT*.3;spx=mix(spx,-.8,wD);
 const twist=-.42*pk;J.spine.rotation.set(spx,-h.hipYaw+twist,-Math.sin(h.ph)*.04*h.wRun);
 h.fireT=Math.max(0,h.fireT-dt*6);const kick=h.fireT*h.fireT;
 const chx=mix(s.pitch*.28+Math.sin(h.t*2.1)*.015+kick*.07,.35,wD);J.chest.rotation.set(chx,0,0);
 J.head.rotation.set(mix(s.pitch*.42-spx*.45-chx*.3,.75,wD),-twist*.6,0);
 // левая рука
 const pL=h.ph,aim=Math.PI/2+s.pitch-(spx+chx);
 let lsx=.12,lsz=-.14,lel=.45,lsy=0;
 lsx=mix(lsx,.1-.8*Math.cos(pL),h.wRun);lel=mix(lel,.6+.4*Math.max(0,Math.cos(pL)),h.wRun);
 lsx=mix(lsx,.55,h.wAir);lsz=mix(lsz,-.75,h.wAir);lel=mix(lel,.55,h.wAir);
 lsx=mix(lsx,-.55,h.wSlide);lsz=mix(lsz,-.4,h.wSlide);lel=mix(lel,.25,h.wSlide);
 lsx=mix(lsx,-1,h.wDash);lsz=mix(lsz,-.25,h.wDash);lel=mix(lel,.2,h.wDash);
 lsx=mix(lsx,1.1,h.wSlam);lsz=mix(lsz,-.25,h.wSlam);lel=mix(lel,1,h.wSlam);
 lsx=mix(lsx,aim,pk);lsz=mix(lsz,.12,pk);lel=mix(lel,0,pk);lsy=-.28*pk;
 lsx=mix(lsx,.15,wD);lsz=mix(lsz,-.1,wD);lel=mix(lel,.3,wD);
 J.aL.sh.rotation.set(lsx,lsy,lsz);J.aL.el.rotation.x=lel;J.aL.hand.rotation.x=pk*.25;
 // правая рука: всегда целится
 let rsx=1.12+s.pitch*.55+.06*Math.sin(h.ph*2)*h.wRun+kick*.12,rel=.38+kick*.55,rsz=-.1;
 rsx=mix(rsx,.2,wD);rel=mix(rel,.25,wD);rsz=mix(rsz,.08,wD);
 J.aR.sh.rotation.set(rsx,mix(.22,0,wD),rsz);J.aR.el.rotation.x=rel;J.aR.hand.rotation.x=mix(Math.PI/2+s.pitch-(spx+chx+rsx+rel)+kick*.3,-.4,wD);
 // смерть: падение вперёд
 J.body.rotation.set(-.35*wFe,0,-1.38*wFe);J.body.position.set(.18*wFe,.05*wFe,-.1*wFe);
 // крылья, визор, ядро
 const hpK=clamp(s.hp/100,0,1),wo=(s.alive?.38+.62*hpK:0)+h.wDash*.6;h.wingM.opacity+=(wo-h.wingM.opacity)*e(9);
 J.blades.forEach((b,i)=>{b.rotation.z=b.userData.base*(1+.3*h.wDash+.14*h.wAir-.3*h.wSlide)+Math.sin(h.t*1.6+i)*.035});
 J.wingG.rotation.x=.42+.35*h.wDash-.2*h.wSlide;if(J.halo){J.halo.rotation.y+=dt*1.6;J.halo.position.y=.34+Math.sin(h.t*2)*.012}
 h.glow.color.copy(h.glowC).multiplyScalar(dead?Math.max(.08,1-h.deadT*1.6):(.85+.15*Math.sin(h.t*3)));
 // оружие
 if(s.w!==h.lastW){h.lastW=s.w;J.tp.forEach((g,i)=>{if(g)g.visible=i===s.w});const u=guns[s.w]&&guns[s.w].userData;if(u&&u.mz)J.flash.position.copy(u.mz).multiplyScalar(1.15).add(new V3(0,0,-.05))}
 h.flashT=Math.max(0,h.flashT-dt);J.flash.visible=h.flashT>0&&s.w!==3;}
function heroFire(h){h.fireT=1;h.flashT=.06;h.J.flash.material.rotation=Math.random()*6.3}
function heroPunch(h){h.punchT=.3}
/* ================= кастомизация героя за очки стиля ================= */
const COS={crest:[['cap','Крышка',0],['straws','Ирокез из трубочек',1500],['crown','Корона из крышек',4000],['horns','Рога-открывашки',8000],['halo','Нимб-колечко',15000]],
 wings:[['blades','Лезвия',0],['bubbles','Пузыри',2500],['jets','Струи',6000],['ribbon','Ленты',12000]],
 pattern:[['solid','Сплошная',0],['wave','Волна',1000],['checker','Клетка',3000],['dots','Пузырьки',7000],['tiger','Тигр',12000]]};
const COS_N={crest:'Гребень',wings:'Крылья',pattern:'Броня'};
let bank=0,bankDirty=false,bankSaveT=0;try{bank=Math.max(0,+localStorage.getItem('ug-sp')||0)}catch(e){}
const cosOk=(k,i)=>COS[k][i]&&bank>=COS[k][i][2];
let myCos={crest:0,wings:0,pattern:0};try{const c=JSON.parse(localStorage.getItem('ug-cos')||'{}');for(const k in myCos)if(Number.isInteger(c[k])&&cosOk(k,c[k]))myCos[k]=c[k]}catch(e){}
const cosStr=c=>c.crest+'.'+c.wings+'.'+c.pattern;
function parseCos(s){const a=String(s||'').split('.').map(x=>Math.max(0,Math.floor(+x)||0));return{crest:Math.min(a[0]||0,COS.crest.length-1),wings:Math.min(a[1]||0,COS.wings.length-1),pattern:Math.min(a[2]||0,COS.pattern.length-1)}}
function bankAdd(pts){const prev=bank;bank+=pts;bankDirty=true;
 for(const k in COS)for(const [,nm,cost] of COS[k])if(cost>prev&&cost<=bank){banner('ОТКРЫТО: '+nm.toUpperCase());feed.unshift({label:'★ '+COS_N[k]+': '+nm,t:3.5});sfx('ding')}}
function bankTick(dt){bankSaveT-=dt;if(bankDirty&&bankSaveT<=0){bankSaveT=2;bankDirty=false;save('ug-sp',Math.round(bank))}}
const PAT_T={};
function patTex(id){if(!id||id==='solid')return null;if(PAT_T[id])return PAT_T[id];const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d');let sd=7;const rn=()=>(sd=(sd*16807)%2147483647)/2147483647;
 g.fillStyle='#fff';g.fillRect(0,0,128,128);g.fillStyle='#6e6e6e';
 if(id==='wave'){g.beginPath();g.moveTo(0,128);for(let x=0;x<=128;x+=4)g.lineTo(x,62+Math.sin(x/128*Math.PI*2)*20);g.lineTo(128,128);g.fill();g.strokeStyle='#ffffff';g.lineWidth=7;g.beginPath();for(let x=0;x<=128;x+=4)g.lineTo(x,50+Math.sin(x/128*Math.PI*2)*20);g.stroke()}
 else if(id==='checker'){for(let i=0;i<4;i++)for(let j=0;j<4;j++)if((i+j)%2)g.fillRect(i*32,j*32,32,32)}
 else if(id==='dots'){for(let k=0;k<26;k++){const r=3+rn()*11;g.beginPath();g.arc(rn()*128,rn()*128,r,0,7);g.fill()}g.fillStyle='#fff';for(let k=0;k<14;k++){g.beginPath();g.arc(rn()*128,rn()*128,1.5+rn()*2,0,7);g.fill()}}
 else if(id==='tiger'){g.fillStyle='#3e3e3e';for(let k=0;k<6;k++){const y=k*22+rn()*8;g.beginPath();g.moveTo(-4,y);g.lineTo(40+rn()*30,y+6+rn()*6);g.lineTo(70+rn()*40,y+2);g.lineTo(132,y+10);g.lineTo(132,y+14);g.lineTo(60+rn()*30,y+12);g.lineTo(-4,y+9);g.fill()}}
 const t=new THREE.CanvasTexture(c);t.anisotropy=MAXA;t.wrapS=t.wrapT=THREE.RepeatWrapping;return PAT_T[id]=t}
const BUB_T=(()=>{const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d'),r=g.createRadialGradient(64,64,30,64,64,62);
 r.addColorStop(0,'rgba(255,255,255,.08)');r.addColorStop(.75,'rgba(255,255,255,.35)');r.addColorStop(.92,'#fff');r.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=r;g.beginPath();g.arc(64,64,62,0,7);g.fill();
 g.fillStyle='rgba(255,255,255,.9)';g.beginPath();g.ellipse(44,42,12,7,-.7,0,7);g.fill();const t=new THREE.CanvasTexture(c);t.minFilter=THREE.LinearFilter;return t})();
const STRAW_T=(()=>{const c=document.createElement('canvas');c.width=8;c.height=64;const g=c.getContext('2d');for(let i=0;i<8;i++){g.fillStyle=i%2?'#f6eee2':'#d0122c';g.fillRect(0,i*8,8,8)}const t=new THREE.CanvasTexture(c);t.magFilter=THREE.NearestFilter;return t})();
const CG={straw:new THREE.CylinderGeometry(.011,.011,1,8).translate(0,.5,0),capS:crownGeo(.036,13),hornBar:new THREE.BoxGeometry(.028,.17,.012).translate(0,.085,0),hornRing:new THREE.TorusGeometry(.032,.01,6,16),
 halo:new THREE.TorusGeometry(.12,.012,8,28).rotateX(Math.PI/2),tab:new THREE.BoxGeometry(.05,.008,.03),band:new THREE.TorusGeometry(.078,.012,6,18).rotateX(Math.PI/2),
 jetA:bladeGeo(1.08,.065),jetB:bladeGeo(.95,.06),jetC:bladeGeo(.78,.05),ribA:bladeGeo(.74,.36),ribB:bladeGeo(.6,.3),bub:new THREE.CircleGeometry(1,22)};
const strawM=M(0xffffff,{map:STRAW_T,roughness:.4});
function buildCrest(h,Hd,add,id){const grp=(x,y,z)=>{const g=new THREE.Group();g.position.set(x,y,z);Hd.add(g);return g};
 if(id!=='straws'&&id!=='crown')add(Hd,HG.crown,HM.crest,0,.222,0);
 if(id==='straws'){add(Hd,HG.crown,HM.crest,0,.205,0).scale.set(1,.6,1);for(let i=-2;i<=2;i++){const m=add(Hd,CG.straw,strawM,0,.21,i*.022,i*.34);m.scale.y=.28-.045*Math.abs(i)}}
 else if(id==='crown'){add(Hd,CG.band,HM.gold,0,.2,0);for(let k=0;k<6;k++){const a=k/6*Math.PI*2,g=grp(Math.sin(a)*.064,.23,Math.cos(a)*.064);g.rotation.y=a;add(g,CG.capS,k%2?HM.gold:HM.crest,0,0,0,Math.PI/2-.35)}}
 else if(id==='horns'){for(const s of[-1,1]){const g=grp(s*.075,.18,.01);g.rotation.z=-s*.55;g.rotation.x=.25;add(g,CG.hornBar,HM.chrome);add(g,CG.hornRing,HM.chrome,0,.19,0,0,Math.PI/2);add(g,new THREE.BoxGeometry(.03,.03,.014),HM.gold,0,.02,0)}}
 else if(id==='halo'){const g=grp(0,.34,0);add(g,CG.halo,h.glow);add(g,CG.tab,h.glow,.13,0,0);h.J.halo=g}}
const WINGS={blades:[[HG.bladeA,.42],[HG.bladeB,.85],[HG.bladeC,1.25]],jets:[[CG.jetA,.2],[CG.jetB,.45],[CG.jetC,.72]],ribbon:[[CG.ribA,.55],[CG.ribB,1.05]],bubbles:[[null,.35],[null,.8],[null,1.25]]};

let fireCount=0,punchCount=0;const tmpV0=new V3();let selfHero=buildHero(myColor,{layer:1,cos:myCos});
function rebuildSelf(){disposeHero(selfHero);selfHero=buildHero(myColor,{layer:1,cos:myCos});scene.add(selfHero.root);selfHero.root.visible=false;fpMat.armor.map=patTex(COS.pattern[myCos.pattern][0]);fpMat.armor.color.set(myColor);fpMat.armor.needsUpdate=true}
scene.add(selfHero.root);selfHero.root.visible=false;

/* ================= game state ================= */
const P={pos:new V3(),vel:new V3(),yaw:0,pitch:0,hp:100,stam:3,grounded:false,lastG:0,wallN:new V3(),wallT:0,wallJ:0,dashT:0,dashDir:new V3(),slide:false,slideDir:new V3(),slam:false,eye:1.6,iT:0,alive:true,respT:0};
const keys={};let mode='solo',state='menu',T=0,wave=0,toSpawn=[],spawnT=0,waveT=0,score=0,kills=0,deaths=0,styleV=0,feed=[],freeze=0,shake=0,fovKick=0,locked=false,noLock=false;
let enemies=[],proj=[],orbs=[],telegraphs=[],recentKills=[],eid=0,pnid=0;
let cur=0,prevW=0,kick=0,swap=0,punchT=0,punchCd=0,fireHeld=false,altHeld=false,showBoard=false;
const WP=[{name:'Шипучка',cd:.32,acd:.3,t:0,at:0},{name:'Шейкер',cd:.85,acd:2.2,t:0,at:0},{name:'Ментос-пушка',cd:.9,acd:.6,t:0,at:0},{name:'Газява',cd:.08,acd:1.2,t:0,at:0}];
let gas=100,gasIdle=0,sprayFx=0,coins=[],coinCh=4,coinRegen=0;
const RANKS=[['D','ТЁПЛЕНЬКО','#d6bfb2'],['C','ШИПИТ','#8fd0f5'],['B','БУРЛИТ','#7ee08a'],['A','ГАЗИРОВАННО','#f2b84b'],['S','СВЕРХГАЗ','#ff9a4d'],['SS','S-ГАЗ','#ff5a68'],['SSS','ULTRAGAS','#ff2a3a']];
const PVPM=14; // урон по игрокам = урон по врагам × PVPM
const rank=()=>Math.min(6,Math.floor(styleV/100));
function addStyle(label,pts){styleV=Math.min(699,styleV+pts);bankAdd(pts);if(mode!=='pvp')score+=Math.round(pts*(1+rank()*.3));feed.unshift({label:'+ '+label,t:2.4});if(feed.length>6)feed.length=6}
function banner(txt){const b=$('banner');b.textContent=txt;b.style.opacity=1;clearTimeout(banner.h);banner.h=setTimeout(()=>b.style.opacity=0,1800)}
let lastAtk=null,lastAtkT=-9;
let pflashV=0;function parryOk(){pflashV=.7;punchCd=0;flashLight.position.copy(camera.position);flashLight.intensity=5;sfx('parry');freeze=Math.max(freeze,.09)}
function hurt(d,from){if(P.iT>0||!(state==='play'||(state==='pause'&&mp()))||!P.alive)return;P.hp-=d;if(from){lastAtk=from;lastAtkT=T}styleV=Math.max(0,styleV-60);$('vig').style.opacity=.9;shake=Math.max(shake,.25);sfx('hurt');if(P.hp<=0)die()}
function heal(n){if(P.hp<100&&n>0&&P.alive)P.hp=Math.min(100,P.hp+n)}

/* ================= network (room capability) ================= */
let roomApi=null,net=null,myPeer=null,lastPeers=null,sendT=0,seqN=0,isHost=true,hostPeer=null,hostSnap=null,kb=null;
const remotes=new Map(),seen=new Map(),dl=[],fxOut=[],pending=new Map(),killedIds=new Map(),knownOp=new Set();
const mp=()=>mode!=='solo'&&net;
function queueDmg(target,d,src,k){const p=pending.get(target)||{d:0,src,k:[0,0,0]};p.d+=d;p.src=src;if(k){p.k[0]+=k.x;p.k[1]+=k.y;p.k[2]+=k.z}pending.set(target,p)}
function flushDmg(){for(const [t,p] of pending){dl.push([t,++seqN,r1(p.d),p.src,r1(p.k[0]),r1(p.k[1]),r1(p.k[2])]);if(dl.length>14)dl.shift()}pending.clear()}
function pushFx(arr){arr[1]=++seqN;fxOut.push(arr);if(fxOut.length>8)fxOut.shift()}
const nameOf=peer=>{const r=remotes.get(peer);return r?r.name:'кто-то'};
function lobbyPresence(){if(roomApi&&roomApi.connected())roomApi.presence({n:nick,m:state==='menu'?'menu':mode,r:code,c:myColor}).catch(()=>{})}
/* --- P2P (PeerJS) adapter with the same shape as the room API: used outside claude.ai, e.g. on GitHub Pages --- */
function peerRoom(name){const hostId='ultragaz-v2-'+name.replace(/[^a-z0-9-]/g,'-');let peer=null,amHost=false,hostConn=null,myId=null,ok=false,closed=false,tick=null,tries=0;
 const mine={},all=new Map(),conns=new Map();let snap=Object.freeze([]);
 const rebuild=()=>{const a=[];if(myId)a.push({peer:myId,by:null,isMe:true,sameTab:true,kind:'viewer',guest:false,presence:Object.freeze(Object.assign({},mine))});
  for(const [id,pr] of all)if(id!==myId)a.push({peer:id,by:null,isMe:false,sameTab:false,kind:'viewer',guest:false,presence:pr});snap=Object.freeze(a)};
 const safe=v=>{try{return Object.freeze(JSON.parse(JSON.stringify(v)))}catch(e){return Object.freeze({})}};
 function reset(){ok=false;amHost=false;clearInterval(tick);tick=null;all.clear();conns.clear();hostConn=null;try{peer&&peer.destroy()}catch(e){}peer=null;rebuild()}
 function retry(fn,ms){if(closed)return;tries++;setTimeout(()=>{if(!closed)fn()},ms+Math.random()*ms)}
 function asHost(){reset();peer=new Peer(hostId,{debug:0});
  peer.on('open',id=>{myId=id;amHost=true;ok=true;tries=0;rebuild();
   tick=setInterval(()=>{const list=[[myId,mine]];for(const [id,pr] of all)list.push([id,pr]);for(const c of conns.values())if(c.open)try{c.send({t:'s',list})}catch(e){}rebuild()},60)});
  peer.on('connection',c=>{c.on('open',()=>conns.set(c.peer,c));c.on('data',d=>{if(d&&d.t==='p'&&d.p&&typeof d.p==='object'&&JSON.stringify(d.p).length<6000)all.set(c.peer,safe(d.p))});
   c.on('close',()=>{conns.delete(c.peer);all.delete(c.peer);rebuild()});c.on('error',()=>{})});
  peer.on('error',e=>{if(e.type==='unavailable-id')retry(asClient,150);else if(!ok)retry(asHost,800)});
  peer.on('disconnected',()=>{try{peer.reconnect()}catch(e){}})}
 function asClient(){reset();peer=new Peer({debug:0});
  peer.on('open',id=>{myId=id;rebuild();hostConn=peer.connect(hostId,{serialization:'json'});
   hostConn.on('open',()=>{ok=true;tries=0;hostConn.send({t:'p',p:mine})});
   hostConn.on('data',d=>{if(!d||d.t!=='s'||!Array.isArray(d.list))return;all.clear();for(const it of d.list.slice(0,32))if(Array.isArray(it)&&typeof it[0]==='string'&&it[1]&&typeof it[1]==='object')all.set(it[0],safe(it[1]));rebuild()});
   hostConn.on('close',()=>{if(!closed)retry(asHost,400)});hostConn.on('error',()=>{})});
  peer.on('error',e=>{if(e.type==='peer-unavailable')retry(asHost,300);else if(!ok)retry(asClient,800)})}
 asClient();
 return{name,peers:()=>snap,connected:()=>ok,onPeers(){return()=>{}},onConnection(f){setTimeout(()=>f(ok));return()=>{}},on(){return()=>{}},emit:()=>Promise.resolve(),
  presence(p){for(const k in p){if(p[k]===null)delete mine[k];else mine[k]=p[k]}if(!amHost&&hostConn&&hostConn.open)try{hostConn.send({t:'p',p:mine})}catch(e){}rebuild();return Promise.resolve()},
  leave(){closed=true;reset();return Promise.resolve()}}}
/* --- relay (MQTT over WebSocket): every player publishes its state to a public broker, works behind any router --- */
const BROKERS=['wss://broker.emqx.io:8084/mqtt','wss://broker.hivemq.com:8884/mqtt','wss://test.mosquitto.org:8081/mqtt'];
let brokerIdx=0;
function mqttRoom(name){const base='ultragaz/v3/'+name.replace(/[^a-z0-9-]/g,'-')+'/',myId='p'+Math.random().toString(36).slice(2,12);
 const mine={},others=new Map();let snap=Object.freeze([]),ok=false,client=null,closed=false,dirty=true,lastPub=0,gen=0;
 const rebuild=()=>{const now=Date.now();for(const [id,o] of others)if(now-o.t>5000)others.delete(id);
  const a=[{peer:myId,by:null,isMe:true,sameTab:true,kind:'viewer',guest:false,presence:Object.freeze(Object.assign({},mine))}];
  for(const [id,o] of others)a.push({peer:id,by:null,isMe:false,sameTab:false,kind:'viewer',guest:false,presence:o.p});snap=Object.freeze(a)};
 function connect(){if(closed)return;const my=++gen,url=BROKERS[brokerIdx%BROKERS.length];let dead=false;
  const fail=()=>{if(dead||my!==gen||closed)return;dead=true;ok=false;try{client.end(true)}catch(e){}brokerIdx++;setTimeout(connect,800)};
  try{client=mqtt.connect(url,{clientId:'ug_'+myId+'_'+my,clean:true,connectTimeout:7000,reconnectPeriod:0,keepalive:20,will:{topic:base+myId,payload:'',qos:0,retain:false}})}catch(e){fail();return}
  const to=setTimeout(()=>{if(!ok)fail()},8000);
  client.on('connect',()=>{clearTimeout(to);ok=true;client.subscribe(base+'+',{qos:0});dirty=true});
  client.on('message',(t,buf)=>{const id=t.slice(base.length);if(id===myId||!/^p[a-z0-9]{4,16}$/.test(id))return;const txt=buf.toString();
   if(!txt){others.delete(id);rebuild();return}if(txt.length>8000)return;try{const pr=JSON.parse(txt);if(pr&&typeof pr==='object'&&!Array.isArray(pr))others.set(id,{p:Object.freeze(pr),t:Date.now()})}catch(e){}rebuild()});
  client.on('error',fail);client.on('close',fail);client.on('offline',fail)}
 const tick=setInterval(()=>{if(closed)return;const now=Date.now();if(ok&&client&&(dirty&&now-lastPub>66||now-lastPub>1000)){dirty=false;lastPub=now;try{client.publish(base+myId,JSON.stringify(mine),{qos:0})}catch(e){}}rebuild()},33);
 connect();rebuild();
 return{name,peers:()=>snap,connected:()=>ok,onPeers(){return()=>{}},onConnection(f){setTimeout(()=>f(ok));return()=>{}},on(){return()=>{}},emit:()=>Promise.resolve(),
  presence(p){for(const k in p){if(p[k]===null)delete mine[k];else mine[k]=p[k]}dirty=true;return Promise.resolve()},
  leave(){closed=true;clearInterval(tick);try{if(client&&ok)client.publish(base+myId,'',{qos:0});setTimeout(()=>{try{client.end(true)}catch(e){}},150)}catch(e){}return Promise.resolve()}}}
let p2p=false;
function initNet(){const c=window.claude;
 if((!c||!c.use)&&(window.mqtt||typeof window.Peer==='function')){p2p=true;const useMq=!!(window.mqtt&&window.mqtt.connect);roomApi={connected:()=>true,presence:()=>Promise.resolve(),onPeers:()=>()=>{},onConnection:f=>{f(true);return()=>{}},join:n=>Promise.resolve(useMq?mqttRoom(n):peerRoom(n))};netNote(roomApi);return}
 if(!c||!c.use){netNote(null);return}
 c.use('room').then(r=>{roomApi=r;netNote(r);if(!r)return;
  r.onConnection(()=>{netNote(r);lobbyPresence()},()=>netNote(null));
  r.onPeers(ch=>{const ps=ch.peers.filter(p=>p.kind==='viewer');const me=ps.find(p=>p.sameTab);if(me)myPeer=me.peer;
   const others=ps.filter(p=>!p.sameTab).map(p=>{const n=typeof p.presence.n==='string'?p.presence.n.slice(0,14):'Игрок';const m=p.presence.m;return n+(m==='coop'?' (кооп «'+String(p.presence.r||'').slice(0,20)+'»)':m==='pvp'?' (PvP «'+String(p.presence.r||'').slice(0,20)+'»)':'')});
   $('online').textContent=others.length?'Сейчас на странице: '+others.join(', '):'';},()=>{});
 }).catch(()=>netNote(null))}
function netNote(r){$('mCoop').disabled=$('mPvp').disabled=!r;$('netDot').classList.toggle('on',!!r);$('netShort').textContent=r?'онлайн':'офлайн';if(!r&&MM.mode!=='solo')mmSetMode('solo',true);
 $('netNote').textContent=r?(p2p?'Онлайн через сервер-ретранслятор: отправь друзьям ссылку на эту страницу — пусть введут ту же комнату и выберут тот же режим.':'Мультиплеер доступен: друзья открывают эту же страницу, вводят ту же комнату и выбирают тот же режим.'):'Мультиплеер работает, когда игру открывают по ссылке на claude.ai люди, с которыми вы ей поделились. Сейчас доступно соло.'}
async function joinNet(){if(!roomApi)return false;try{net=await roomApi.join((mode+'-'+mapId+'-'+code).slice(0,48));
 net.onPeers(()=>{},()=>{});return true}catch(e){net=null;banner('Не удалось войти в комнату');return false}}
function leaveNet(){if(net){try{net.leave()}catch(e){}}net=null;remotes.forEach(r=>disposeHero(r.hero));remotes.clear();seen.clear();hostSnap=null;knownOp.clear()}
function makeLabel(text,color){const c=document.createElement('canvas');c.width=256;c.height=64;const g=c.getContext('2d');g.font='bold 34px Arial';g.textAlign='center';g.lineWidth=6;g.strokeStyle='rgba(0,0,0,.8)';g.strokeText(text,128,44);g.fillStyle=color;g.fillText(text,128,44);
 const s=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),depthTest:false,transparent:true}));s.scale.set(2.4,.6,1);return s}
function makeAvatar(name,color,cs){const h=buildHero(color,{cos:parseCos(cs)}),g=h.root;const label=makeLabel(name,color);label.position.y=2.3;g.add(label);scene.add(g);
 return{g,hero:h,label,name,color,cos:String(cs||'0.0.0'),pos:new V3(),tgt:new V3(),vel:new V3(),nv:new V3(),tT:0,yaw:0,pt:0,an:0,alive:true,hp:100,k:0,d:0,w:0,lastW:-1,fc:-1,pu:-1}}
function farSpawn(){let bestS=spawns[0],bd=-1;for(const s of spawns){let d=1e9;for(const r of remotes.values())if(r.alive)d=Math.min(d,s.distanceTo(r.pos));if(d===1e9)d=Math.random()*10;d+=Math.random()*6;if(d>bd){bd=d;bestS=s}}return bestS}

function netFrame(dt){if(!mp())return;const ps=net.peers();
 if(ps!==lastPeers){lastPeers=ps;const me=ps.find(p=>p.sameTab);if(me)myPeer=me.peer;const alive=new Set();
  for(const p of ps){if(p.sameTab||p.kind!=='viewer')continue;const pr=p.presence||{};if(pr.m!==mode||!pr.pl)continue;alive.add(p.peer);
   let r=remotes.get(p.peer);const nm=typeof pr.n==='string'?pr.n.slice(0,14):'Игрок',cl=COLORS.includes(pr.c)?pr.c:'#f6eee2';
   const cs=cosStr(parseCos(pr.hc));if(!r||r.name!==nm||r.color!==cl||r.cos!==cs){if(r)disposeHero(r.hero);const nr=makeAvatar(nm,cl,cs);if(r){nr.pos.copy(r.pos);nr.tgt.copy(r.tgt);nr.k=r.k;nr.d=r.d;nr.fc=r.fc;nr.pu=r.pu}else{nr.pos.set(+pr.x||0,+pr.y||0,+pr.z||0);nr.tgt.copy(nr.pos)}r=nr;remotes.set(p.peer,r)}
   {const nx=+pr.x||0,ny=+pr.y||0,nz=+pr.z||0;if(nx!==r.tgt.x||ny!==r.tgt.y||nz!==r.tgt.z){const d=Math.max(.03,T-r.tT);r.nv.set((nx-r.tgt.x)/d,(ny-r.tgt.y)/d,(nz-r.tgt.z)/d).clampLength(0,60);r.tT=T}
    if(Math.hypot(nx-r.pos.x,ny-r.pos.y,nz-r.pos.z)>7){r.pos.set(nx,ny,nz);r.nv.set(0,0,0)}r.tgt.set(nx,ny,nz)}
   r.yaw=+pr.yw||0;r.pt=+pr.pt||0;r.an=+pr.an||0;r.alive=!!pr.al;r.hp=+pr.hp||0;r.k=+pr.k||0;r.d=+pr.d||0;r.w=Math.max(0,Math.min(3,+pr.w||0));r.score=+pr.sc||0;r.label.visible=r.alive;
   {const fc=+pr.fc||0,pu=+pr.pu||0;if(r.fc>=0&&fc>r.fc)heroFire(r.hero);if(r.pu>=0&&pu>r.pu)heroPunch(r.hero);r.fc=fc;r.pu=pu}
   const s=seen.get(p.peer)||{dl:0,fx:0,kb:0};seen.set(p.peer,s);
   if(Array.isArray(pr.dl))for(const e of pr.dl){if(!Array.isArray(e)||!(e[1]>s.dl))continue;s.dl=Math.max(s.dl,e[1]);applyDl(p.peer,e)}
   if(Array.isArray(pr.fx))for(const e of pr.fx){if(!Array.isArray(e)||!(e[1]>s.fx))continue;s.fx=Math.max(s.fx,e[1]);applyFx(e)}
   if(Array.isArray(pr.kb)&&pr.kb[0]>s.kb){s.kb=pr.kb[0];if(pr.kb[1]===myPeer&&mode==='pvp'){kills++;sfx('frag');banner('ФРАГ: '+nm);addStyle('ФРАГ',140);if(!P.grounded)addStyle('В ПОЛЁТЕ',35)}else if(mode==='pvp'){const kn=pr.kb[1]===p.peer?'сам себя':nameOf(pr.kb[1]);feed.unshift({label:nameOf(p.peer)+' ✕ '+kn,t:3})}}}
  for(const [peer,r] of remotes)if(!alive.has(peer)){disposeHero(r.hero);remotes.delete(peer)}
  if(mode==='coop'){let h=myPeer;for(const p of ps)if(p.kind==='viewer'&&p.presence&&p.presence.m==='coop'&&p.presence.pl&&(!h||p.peer<h))h=p.peer;
   const was=isHost;hostPeer=h;isHost=!myPeer||h===myPeer;const hp=ps.find(p=>p.peer===hostPeer&&!p.sameTab);hostSnap=hp?hp.presence:null;
   if(was&&!isHost)becomeClient();else if(!was&&isHost)becomeHost()}}
 for(const r of remotes.values()){r.pos.lerp(r.tgt,Math.min(1,dt*15));r.g.position.copy(r.pos);r.vel.lerp(T-r.tT>.25?tmpV0.set(0,0,0):r.nv,Math.min(1,dt*10));
  let dy=r.yaw-r.g.rotation.y;dy=Math.atan2(Math.sin(dy),Math.cos(dy));r.g.rotation.y+=dy*Math.min(1,dt*18);
  animHero(r.hero,{vx:r.vel.x,vz:r.vel.z,vy:r.vel.y,yaw:r.g.rotation.y,air:!!(r.an&1),slide:!!(r.an&2),dash:!!(r.an&4),slam:!!(r.an&8),pitch:r.pt,hp:r.hp,alive:r.alive,w:r.w},dt)}
 if(mode==='coop'&&!isHost)syncFromHost();
 sendT-=dt;if(sendT<=0){sendT=.05;sendPresence()}}
function applyDl(from,e){const [t,,d,src,kx,ky,kz]=e;const dmg=Math.max(0,Math.min(200,+d||0));
 if(t===myPeer){if(mode==='pvp'){hurt(Math.round(dmg),from);if(P.alive)P.vel.add(new V3(+kx||0,+ky||0,+kz||0).clampLength(0,30))}else if(mode==='coop'&&from===hostPeer){hurt(Math.round(dmg));P.vel.add(new V3(+kx||0,+ky||0,+kz||0).clampLength(0,30))}}
 else if(mode==='coop'&&isHost&&typeof t==='string'){if(t[0]==='e'){const id=+t.slice(1),en=enemies.find(x=>x.id===id);if(en&&!en.dead){en.hp-=dmg;en.flash=.08;if(en.hp<=0)kill(en,'remote',true)}}
  else if(t[0]==='p'){const id=+t.slice(1);for(const p of proj)if(p.netId===id&&p.owner==='enemy')p.dead=true}}}
function applyFx(e){const k=e[0],n=e.slice(2).map(v=>+v||0);
 if(k==='t'){tracer(new V3(n[0],n[1],n[2]),new V3(n[3],n[4],n[5]),n[6]?0x8fd0f5:0xffe3a3);sfx('rev',.35)}
 else if(k==='s'){const o=new V3(n[0],n[1],n[2]),d=new V3(n[3],n[4],n[5]).normalize();for(let i=0;i<6;i++)tracer(o,o.clone().addScaledVector(spread(d,.075),30),0xffc070);sfx('shot',.35)}
 else if(k==='b'){const p=new V3(n[0],n[1],n[2]);blast(p,n[3],0xff8a3d);puff(p,40,0xffa040,12,.7,6);sfx('boom',.5)}
 else if(k==='r'){const m=rocketMesh();m.position.set(n[0],n[1],n[2]);const v=new V3(n[3],n[4],n[5]);m.lookAt(m.position.clone().add(v));m.rotateY(Math.PI);proj.push({m,vel:v,owner:'ghost',kind:'ghost',t:3,r:.3})}
 else if(k==='g'){const m=bottleMesh();m.position.set(n[0],n[1],n[2]);proj.push({m,vel:new V3(n[3],n[4],n[5]),owner:'ghost',kind:'ghostg',t:2.6,r:.3})}
 else if(k==='c'){const m=capMesh();m.position.set(n[0],n[1],n[2]);proj.push({m,vel:new V3(n[3],n[4],n[5]),owner:'ghost',kind:'ghostc',t:3,r:.2})}
 else if(k==='w'){const o=new V3(n[0],n[1],n[2]),d=new V3(n[3],n[4],n[5]).normalize();spray(o,d,6);floorPuddle(o,d,32,.55,7)}
 else if(k==='y'){geyserFx(n[0],n[1],n[2]);addPuddle(n[0],n[1],n[2],2.6,10)}
 else if(k==='j'){const o=new V3(n[0],n[1],n[2]),d=new V3(n[3],n[4],n[5]).normalize();for(let i=0;i<3;i++)spray(o,spread(d,.25),10);sfx('jet',.4)}
 else if(k==='h'){const p=new V3(n[0],n[1],n[2]);ring(p,6,0xf2b84b);puff(p,30,0xf2b84b,9,.5);sfx('slam',.4)}}
function sendPresence(){const o={n:nick,c:myColor,m:mode,r:code,pl:1,al:P.alive?1:0,x:r2(P.pos.x),y:r2(P.pos.y),z:r2(P.pos.z),yw:r2(P.yaw),pt:r2(P.pitch),an:(P.grounded?0:1)|(P.slide?2:0)|(P.dashT>0?4:0)|(P.slam?8:0),fc:fireCount,pu:punchCount,hc:cosStr(myCos),hp:Math.max(0,Math.ceil(P.hp)),w:cur,k:kills,d:deaths,sc:score,dl:dl.slice(),fx:fxOut.slice()};
 if(kb)o.kb=kb;
 if(mode==='coop'&&isHost){o.wv=wave;o.lf=toSpawn.length+telegraphs.length+enemies.length;
  o.en=enemies.slice(0,26).map(e=>[e.id,Math.max(0,TYPES.indexOf(e.type)),r1(e.pos.x),r1(e.pos.y),r1(e.pos.z),r2(e.g.rotation.y),Math.ceil(e.hp*10),e.wind>0?1:0,e.wet>0?Math.ceil(e.wet*10):0]);
  o.op=proj.filter(p=>p.owner==='enemy'&&p.netId).slice(-16).map(p=>[p.netId,r1(p.m.position.x),r1(p.m.position.y),r1(p.m.position.z),r1(p.vel.x),r1(p.vel.y),r1(p.vel.z),p.r>.4?1:0])}
 net.presence(o).catch(()=>{if(o.op){o.op=o.op.slice(-6);o.en=o.en.slice(0,14);net.presence(o).catch(()=>{})}})}
function becomeClient(){enemies.forEach(e=>scene.remove(e.g));enemies=[];telegraphs.forEach(t=>scene.remove(t.m));telegraphs=[];toSpawn=[];
 proj=proj.filter(p=>{if(p.owner==='enemy'){scene.remove(p.m);return false}return true});knownOp.clear()}
function becomeHost(){for(const e of enemies){e.remote=false;e.cd=rnd(.5,2);e.cd2=rnd(2,4)}toSpawn=[];waveT=0;if(hostSnap&&hostSnap.wv)wave=+hostSnap.wv||wave}
const TYPES=['vend','drone','golem','banan','boss'];
function syncFromHost(){const h=hostSnap;if(!h)return;if(h.wv&&+h.wv!==wave){wave=+h.wv;banner('ВОЛНА '+wave)}
 $('wave').textContent='ВОЛНА '+wave;$('left').textContent='врагов: '+(+h.lf||0)+' · хост: '+(hostPeer===myPeer?'ты':nameOf(hostPeer));
 const list=Array.isArray(h.en)?h.en:[],ids=new Set();
 for(const k of [...killedIds.keys()])if(T-killedIds.get(k)>1.5)killedIds.delete(k);
 for(const a of list){if(!Array.isArray(a))continue;const id=+a[0],type=TYPES[+a[1]]||'vend';ids.add(id);if(killedIds.has(id))continue;
  let e=enemies.find(x=>x.id===id);if(!e){e=makeEnemy(type,new V3(+a[2]||0,+a[3]||0,+a[4]||0),id);e.remote=true;enemies.push(e);if(type==='boss')banner('ГЕНЕРАЛЬНЫЙ ДИРЕКТОР ВЫШЕЛ НА СВЯЗЬ');puff(new V3(e.pos.x,1,e.pos.z),20,0xff2a3a,6,.5)}
  e.tgt=e.tgt||new V3();e.tgt.set(+a[2]||0,+a[3]||0,+a[4]||0);e.ry=+a[5]||0;const hh=(+a[6]||0)/10;e.hp=T-(e.lastHit||-9)<.6?Math.min(e.hp,hh):hh;e.wind=a[7]?1:0;if(a[8])e.wet=Math.max(e.wet||0,(+a[8]||0)/10)}
 for(const e of enemies)if(!ids.has(e.id)&&!e.dead){e.dead=true;scene.remove(e.g);puff(center(e),40,0x5a1f0e,9,1)}
 enemies=enemies.filter(e=>!e.dead);
 const ops=Array.isArray(h.op)?h.op:[],live=new Set();
 for(const a of ops){if(!Array.isArray(a))continue;const nid=+a[0];live.add(nid);if(knownOp.has(nid))continue;knownOp.add(nid);
  const big=!!a[7],m=new THREE.Mesh(new THREE.SphereGeometry(big?.55:.28,14,10),new THREE.MeshBasicMaterial({color:big?0xf3efe6:0x5fe0c8}));m.position.set(+a[1]||0,+a[2]||0,+a[3]||0);scene.add(m);
  proj.push({m,vel:new V3(+a[4]||0,+a[5]||0,+a[6]||0),owner:'enemy',dmg:big?20:12,r:big?.55:.28,t:6,kind:'orb',netId:nid})}
 for(const id of knownOp)if(!live.has(id)&&knownOp.size>40)knownOp.delete(id)}
function clientEnemyAnim(dt){for(const e of enemies){if(!e.remote||!e.tgt)continue;e.pos.lerp(e.tgt,Math.min(1,dt*12));e.g.rotation.y=e.ry;
 const ef=e.flash>0;e.flash-=dt;e.wet=(e.wet||0)-dt;e.mats.forEach(m=>m.emissive.setHex(ef?0xffffff:e.wind?0x661111:e.wet>0?0x2a1000:0));wetFx(e,dt);if(e.type==='boss')bossAnim(e,dt);if(e.type==='vend')e.eyes.color.setHex(e.wind?0xffffff:0xffcc33);if(e.type==='drone')e.g.children[1].rotation.z+=dt*4}}

/* ================= enemies ================= */
const ENEMY={boss:{hp:140,r:2,cy:3.2,speed:8},vend:{hp:5,r:.9,cy:1.2,speed:7.5},drone:{hp:2.4,r:.75,cy:0,speed:6},golem:{hp:24,r:1.6,cy:2,speed:4.2},banan:{hp:16,r:1,cy:1.5,speed:10.5}};
function buildEnemy(type){const g=new THREE.Group(),mats=[];const mm=(c,o)=>{const m=M(c,o);mats.push(m);return m};const add=(geo,mat,x,y,z)=>{const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);g.add(m);return m};let eyes;
 if(type==='vend'){add(new THREE.BoxGeometry(1.5,2.5,1.1),mm(0xc8102e,{roughness:.35}),0,1.25,0);add(new THREE.BoxGeometry(1.1,1.3,.08),mm(0x1a1012,{roughness:.1,metalness:.5}),0,1.45,.56);
  for(let r=0;r<3;r++)for(let c=0;c<4;c++)add(new THREE.CylinderGeometry(.08,.08,.3,8),mm([0x6b2a12,0x7ee08a,0xff9a4d][r]),-.39+c*.26,1.0+r*.4,.58);
  eyes=new THREE.MeshBasicMaterial({color:0xffcc33});add(new THREE.BoxGeometry(.32,.12,.06),eyes,-.3,2.25,.56);add(new THREE.BoxGeometry(.32,.12,.06),eyes,.3,2.25,.56);
  add(new THREE.BoxGeometry(1.2,.25,.1),mm(0xf6eee2),0,.4,.56)}
 else if(type==='drone'){add(new THREE.SphereGeometry(.65,20,14),mm(0xf4fffc,{roughness:.25}),0,0,0);const t=add(new THREE.TorusGeometry(.85,.07,8,28),new THREE.MeshBasicMaterial({color:0x5fe0c8}),0,0,0);t.rotation.x=Math.PI/2;
  eyes=new THREE.MeshBasicMaterial({color:0xff2a3a});add(new THREE.SphereGeometry(.2,12,8),eyes,0,0,.58)}
 else if(type==='boss'){eyes=buildBoss(g,mm,add)}
 else if(type==='banan'){const yel=mm(0xffd93a,{roughness:.45}),pulp=mm(0xfff3c4,{roughness:.6}),brown=mm(0x5a3a1a,{roughness:.8}),body=new THREE.Group();g.add(body);g.userData.body=body;
  const core=new THREE.Mesh(new THREE.CylinderGeometry(.42,.5,2.2,18),pulp);core.position.y=1.5;body.add(core);
  const tipM=new THREE.Mesh(new THREE.SphereGeometry(.42,16,10,0,Math.PI*2,0,Math.PI/2),pulp);tipM.position.y=2.6;body.add(tipM);
  for(let i=0;i<4;i++){const a=i/4*Math.PI*2+Math.PI/4,leg=new THREE.Group();leg.position.set(Math.cos(a)*.42,.95,Math.sin(a)*.42);leg.rotation.y=-a;
   const pl=new THREE.Mesh(new THREE.BoxGeometry(.5,1.25,.09),yel);pl.position.set(.25,-.45,0);pl.rotation.z=-.6;leg.add(pl);
   const pin=new THREE.Mesh(new THREE.BoxGeometry(.46,1.2,.02),pulp);pin.position.set(.25,-.45,-.05);pin.rotation.z=-.6;leg.add(pin);
   const tipL=new THREE.Mesh(new THREE.BoxGeometry(.16,.2,.1),brown);tipL.position.set(.62,-.95,0);tipL.rotation.z=-.6;leg.add(tipL);body.add(leg)}
  const skirt=new THREE.Mesh(new THREE.CylinderGeometry(.55,.5,.5,18,1,true),yel);skirt.position.y=1.05;body.add(skirt);
  const fc=document.createElement('canvas');fc.width=fc.height=256;const f=fc.getContext('2d');
  f.strokeStyle='#3a2410';f.lineWidth=12;f.lineCap='round';f.beginPath();f.arc(80,100,26,Math.PI*1.1,Math.PI*1.9);f.stroke();f.beginPath();f.arc(176,100,26,Math.PI*1.1,Math.PI*1.9);f.stroke();
  f.beginPath();f.moveTo(50,70);f.lineTo(105,82);f.moveTo(206,70);f.lineTo(151,82);f.stroke();
  f.fillStyle='#5a1a10';f.beginPath();f.ellipse(128,170,78,42,0,0,Math.PI);f.fill();f.fillStyle='#fffaf0';f.fillRect(56,168,144,22);
  f.strokeStyle='#c9b89a';f.lineWidth=3;for(let x=74;x<200;x+=18){f.beginPath();f.moveTo(x,168);f.lineTo(x,190);f.stroke()}
  f.fillStyle='rgba(255,120,80,.45)';f.beginPath();f.arc(48,140,18,0,7);f.arc(208,140,18,0,7);f.fill();
  const faceT=new THREE.CanvasTexture(fc);const head=new THREE.Mesh(new THREE.SphereGeometry(.62,24,16),yel);head.position.y=3.15;body.add(head);
  const face=new THREE.Mesh(new THREE.PlaneGeometry(1.05,1.05),new THREE.MeshStandardMaterial({map:faceT,emissiveMap:faceT,emissive:0xffffff,emissiveIntensity:.55,transparent:true,roughness:.5}));face.position.set(0,3.15,.5);body.add(face);mats.push(face.material);
  const stem=new THREE.Mesh(new THREE.CylinderGeometry(.08,.14,.4,8),brown);stem.position.y=3.85;stem.rotation.z=.3;body.add(stem);
  eyes=new THREE.MeshBasicMaterial({color:0xffd93a});
  const lc=document.createElement('canvas');lc.width=1024;lc.height=128;const l=lc.getContext('2d');l.font='italic 900 72px Georgia,serif';l.textAlign='center';l.lineWidth=10;l.strokeStyle='#1a1000';l.strokeText('МАКСИМИ БАНАНИНИ',512,88);l.fillStyle='#ffe135';l.fillText('МАКСИМИ БАНАНИНИ',512,88);
  const lab=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(lc),depthTest:false,transparent:true}));lab.scale.set(5.2,.65,1);lab.position.y=4.5;g.add(lab)}
 else{const s=mm(0xf3efe6,{roughness:.9});add(new THREE.BoxGeometry(2.4,2,1.8),s,0,2.4,0);add(new THREE.BoxGeometry(1.6,1.4,1.4),s,0,.7,0);add(new THREE.BoxGeometry(1.3,1.1,1.2),s,0,4,0);
  for(const x of[-1.7,1.7])add(new THREE.BoxGeometry(1,1.8,1),s,x,2.1,0);eyes=new THREE.MeshBasicMaterial({color:0xff2a3a});add(new THREE.BoxGeometry(.9,.18,.06),eyes,0,4.1,.62)}
 g.rotation.order='YXZ';g.traverse(o=>{if(o.isMesh)o.castShadow=true});scene.add(g);return{g,mats,eyes}}
function makeEnemy(type,pos,id){const d=ENEMY[type],b=buildEnemy(type);const e=Object.assign({id,type,hp:d.hp*(1+wave*.06),r:d.r,cy:d.cy,speed:d.speed,vel:new V3(),cd:rnd(1,2.5),cd2:rnd(2,4),wind:0,flash:0,seed:Math.random()*9,strafe:Math.random()<.5?1:-1,dead:false,remote:false},b);
 e.pos=b.g.position;e.pos.copy(pos);if(type==='drone'&&pos.y<1)e.pos.y=5;if(type==='boss'){if(mode==='coop')e.hp*=1+.6*remotes.size;e.pos.y+=3}e.maxHp=e.hp;return e}
function spawnEnemy(type,pos){enemies.push(makeEnemy(type,pos,++eid));puff(new V3(pos.x,1,pos.z),40,type==='banan'?0xffe135:0xff2a3a,8,.7);if(type==='banan'){banner('МАКСИМИ БАНАНИНИ ПРИБЫЛ!');sfx('frag')}if(type==='boss'){banner('ГЕНЕРАЛЬНЫЙ ДИРЕКТОР ВЫШЕЛ НА СВЯЗЬ');sfx('frag');shake=Math.max(shake,.3)}}
let peels=[];const peelGeo=new THREE.ConeGeometry(.6,.12,5),peelMat=M(0xffd93a,{roughness:.5});
function dropPeel(pos){const m=new THREE.Mesh(peelGeo,peelMat);m.position.set(pos.x,pos.y+.06,pos.z);m.rotation.y=Math.random()*6;m.scale.set(1,1,1.4);scene.add(m);peels.push({m,t:16});if(peels.length>14){scene.remove(peels[0].m);peels.shift()}}
function updPeels(dt){for(const pe of peels){pe.t-=dt;if(P.alive&&P.grounded&&Math.hypot(P.pos.x-pe.m.position.x,P.pos.z-pe.m.position.z)<.85&&Math.abs(P.pos.y-pe.m.position.y)<.6){pe.t=0;
  const f=new V3(-Math.sin(P.yaw),0,-Math.cos(P.yaw));P.vel.x=f.x*16+rnd(-3,3);P.vel.z=f.z*16+rnd(-3,3);P.vel.y=7;P.grounded=false;P.yaw+=rnd(-.6,.6);P.pitch=Math.min(1.2,P.pitch+.5);shake=Math.max(shake,.25);sfx('throw');banner('ПОСКОЛЬЗНУЛСЯ!');feed.unshift({label:'− БАНАНОВАЯ КОЖУРА',t:2.4})}}
 peels=peels.filter(pe=>{if(pe.t<=0)scene.remove(pe.m);return pe.t>0})}
const center=(e,o=new V3())=>o.set(e.pos.x,e.pos.y+e.cy,e.pos.z);
function hitMark(){$('hm').style.opacity=1;clearTimeout(hitMark.h);hitMark.h=setTimeout(()=>$('hm').style.opacity=0,90);sfx('hit')}
function damage(e,dmg,dist,src){if(e.dead)return;if(e.type==='boss'&&e.slamS===4)dmg*=1.5;if(e.wet>0&&src!=='soda')dmg*=1.35;if(src==='soda'){if(!(e.wet>0))addStyle('ЗАЛИТ',10);e.wet=3}e.hp-=dmg;e.flash=.08;e.lastHit=T;hitMark();
 if(dist<6)heal(dmg*3.5);puff(center(e),6,0x6b2a12,6,.5);
 if(e.remote){queueDmg('e'+e.id,dmg,src);if(e.hp<=0){killedIds.set(e.id,T);kill(e,src)}}
 else if(e.hp<=0)kill(e,src)}
function kill(e,src,quiet){e.dead=true;if(e.puddle){scene.remove(e.puddle);e.puddle=null}const corpse=e.type==='drone'&&!e.remote;if(!corpse)scene.remove(e.g);const c=center(e);if(corpse)spawnCorpse(e);
 puff(c,e.type==='golem'||e.type==='boss'?120:60,e.type==='golem'?0xf3efe6:0x5a1f0e,e.type==='golem'?14:10,1.1);puff(c,25,0xc8102e,8,.8);
 if(quiet)return;kills++;sfx('kill');
 for(let i=0;i<(e.type==='golem'?5:2);i++)orbs.push(makeOrb(c));
 let pts=60,lbl='УБИЙСТВО';if(e.type==='golem'){pts=180;lbl='ГОЛЕМ РАСТАЯЛ'}if(e.type==='boss'){pts=600;lbl='ДИРЕКТОР УВОЛЕН';banner('ДИРЕКТОР УВОЛЕН!');for(let i=0;i<12;i++)orbs.push(makeOrb(c));blast(c,9,0xffe066);puff(c,160,0xf6eee2,16,1.4);shake=Math.max(shake,.6);if(bossRing){scene.remove(bossRing);bossRing=null}}if(e.type==='banan'){pts=300;lbl='БАНАНИНИ ПОВЕРЖЕН';banner('БАНАНИНИ ПОВЕРЖЕН!');for(let i=0;i<6;i++)orbs.push(makeOrb(c))}
 addStyle(lbl,pts);if(!P.grounded)addStyle('В ПОЛЁТЕ',35);if(src==='slam')addStyle('УДАР С НЕБА',70);if(src==='parry')addStyle('ВОЗВРАТ К ОТПРАВИТЕЛЮ',90);
 if(src==='combo')addStyle('КОМБО-ВЗРЫВ',60);if(src==='soda')addStyle('ЗАХЛЕБНУЛСЯ',50);if(src==='mentos')addStyle('МЕНТОС + КОЛА',90);if(src==='coin')addStyle('ЧЕРЕЗ КРЫШКУ',60);if(src==='stomp')addStyle('РАЗДАВЛЕН',120);if(src==='coinpunch')addStyle('КРЫШКОЙ В ЛОБ',90);if(src==='foam')addStyle('ВСПЕНЕН',70);if(src==='drone')addStyle('СВОЙ ЖЕ ДРОН',90);if(src==='punch')addStyle('НОКАУТ',80);if(src==='geyser')addStyle('В НЕБО ГЕЙЗЕРОМ',90);if(e.slip>0)addStyle('НА СКОЛЬЗКОМ',40);
 recentKills.push(T);recentKills=recentKills.filter(t=>T-t<.35);if(recentKills.length>=2)addStyle(recentKills.length>=3?'МЯСОРУБКА':'ДУПЛЕТ',50*recentKills.length)}
function spawnCorpse(e){const m=e.g;m.children.forEach(ch=>{if(ch.material&&ch.material.color)ch.material=ch.material.clone()});e.mats.forEach(mt=>mt.emissive.setHex(0x331a00));
 const d=new V3(P.pos.x-e.pos.x,P.pos.y+1-e.pos.y,P.pos.z-e.pos.z).normalize();proj.push({m,vel:d.multiplyScalar(5).add(new V3(0,3,0)),owner:'enemy',kind:'dcorpse',dmg:25,r:.8,t:7,netId:++pnid,spin:rnd(3,6)});sfx('orb',.8)}
function enemyBlast(pos){blast(pos,4,0x5fe0c8);sfx('boom');puff(pos,60,0xf4fffc,12,.8,6);shake=Math.max(shake,Math.min(.5,.6-camera.position.distanceTo(pos)/40));
 for(const c of targets()){const cp=new V3(c.pos.x,c.pos.y+1,c.pos.z),d=cp.distanceTo(pos);if(d<4.5){const f=1-d/4.5;hitTarget(c,Math.round(10+18*f),cp.sub(pos).normalize().multiplyScalar(16*f).setY(6*f))}}
 for(const e of enemies){if(e.dead)continue;const d=center(e,tmpA).distanceTo(pos)-e.r;if(d<4)damage(e,2,99,'x')}}
/* облитый газявой враг: глянцевая корка колы, капли, шипящие пузырьки, лужица */
const COLA=new THREE.Color(0x3b1407),PUD_G=new THREE.CircleGeometry(1,20).rotateX(-Math.PI/2);
function wetFx(e,dt){const w=Math.max(0,Math.min(1,(e.wet||0)/.6)),k=e.wetK||0,nk=k+(w-k)*Math.min(1,dt*8);e.wetK=nk;
 if(nk>.01||k>.01)e.mats.forEach(m=>{const u=m.userData;if(!u.c0){u.c0=m.color.clone();u.r0=m.roughness;u.m0=m.metalness}
  m.color.copy(u.c0).lerp(COLA,nk*.62);m.roughness=u.r0+(.06-u.r0)*nk;m.metalness=u.m0+(.35-u.m0)*nk});
 if(w>0&&!e.dead&&e.type!=='drone'&&e.type!=='boss'&&(e.onGround||e.remote)){e.pudT=(e.pudT||0)-dt;if(e.pudT<=0){e.pudT=.4;addPuddle(e.pos.x,e.remote?groundY(e.pos):e.pos.y,e.pos.z,e.r*.6,7)}}
 if(w>0&&!e.dead){e.dripT=(e.dripT||0)-dt;if(e.dripT<=0){e.dripT=.07+Math.random()*.06;const c=center(e,tmpA),r=e.r*.8;
  const p=new V3(c.x+(Math.random()-.5)*r,c.y+(Math.random()-.2)*r,c.z+(Math.random()-.5)*r);puff(p,1,0x4a1a08,.6,.7,22);
  if(Math.random()<.6){const q=new V3(c.x+(Math.random()-.5)*r*1.4,c.y+Math.random()*r,c.z+(Math.random()-.5)*r*1.4);puff(q,2,0xf6eee2,1.4,.45,-5)}
  if(Math.random()<.08)sfx('spray',.12)}}}
/* ================= лужи колы: ловушка для врагов ================= */
const PUD_GS=[0,1,2].map(s=>{const sh=new THREE.Shape(),N=26;for(let i=0;i<N;i++){const a=i/N*Math.PI*2,r=1+.13*Math.sin(a*3+s*2)+.08*Math.sin(a*5+s*4)+.05*Math.cos(a*7+s);const x=Math.cos(a)*r,y=Math.sin(a)*r;i?sh.lineTo(x,y):sh.moveTo(x,y)}
 return new THREE.ShapeGeometry(sh,2).rotateX(-Math.PI/2)});
let puddles=[];
function addPuddle(x,y,z,r,life){for(const p of puddles){if(p.t>.5&&Math.abs(p.y-y)<.5&&Math.hypot(p.x-x,p.z-z)<p.r*.8+r*.4){p.r=Math.min(4.2,Math.sqrt(p.r*p.r+r*r*.35));p.t=Math.max(p.t,life);return p}}
 if(puddles.length>=28){const o=puddles.shift();scene.remove(o.m);o.m.material.dispose()}
 const m=new THREE.Mesh(PUD_GS[puddles.length%3],new THREE.MeshStandardMaterial({color:0x2c0d04,roughness:.03,metalness:.35,envMap:ENV,envMapIntensity:1.4,transparent:true,opacity:0,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}));
 m.position.set(x,y+.02,z);m.rotation.y=Math.random()*6.3;m.receiveShadow=true;scene.add(m);const p={x,y,z,r,t:life,m,g:0};puddles.push(p);return p}
function inPuddle(pos){for(const p of puddles)if(p.t>.4&&p.g>.5&&Math.abs(pos.y-p.y)<.7&&Math.hypot(pos.x-p.x,pos.z-p.z)<p.r*.85)return p;return null}
function floorPuddle(o,d,far,r,life){ray.set(o,d);ray.far=far;const h=ray.intersectObjects(level,false);if(!h.length||!h[0].face)return;
 const n=h[0].face.normal.clone().transformDirection(h[0].object.matrixWorld);if(n.y>.7)addPuddle(h[0].point.x,h[0].point.y,h[0].point.z,r,life)}
function groundY(pos){ray.set(new V3(pos.x,pos.y+.5,pos.z),new V3(0,-1,0));ray.far=40;const h=ray.intersectObjects(level,false);return h.length?h[0].point.y:0}
function startSlip(e){e.slip=e.type==='golem'?1.5:1.15;e.slipCd=3;e.slipDir=Math.random()<.5?1:-1;e.leaping=false;e.wind=0;e.lw=0;e.dashW=0;e.dashT=0;e.spin=0;e.stun=0;
 const hs=Math.hypot(e.vel.x,e.vel.z),dx=hs>1?e.vel.x/hs:Math.sin(e.g.rotation.y),dz=hs>1?e.vel.z/hs:Math.cos(e.g.rotation.y),sp=Math.max(hs*1.4,7);
 e.vel.x=dx*sp;e.vel.z=dz*sp;e.vel.y=3.5;puff(new V3(e.pos.x,e.pos.y+.2,e.pos.z),18,0x4a1a08,5,.6,14);puff(new V3(e.pos.x,e.pos.y+.3,e.pos.z),10,0xf6eee2,3,.5,-4);sfx('throw',.7);addStyle('ПОСКОЛЬЗНУЛСЯ',25)}
function slipUpd(e,dt){e.slip-=dt;e.vel.x*=1-dt*.8;e.vel.z*=1-dt*.8;const k=Math.min(1,e.slip*2);e.g.rotation.y+=dt*11*e.slipDir*Math.min(1,e.slip);e.g.rotation.z=Math.sin(e.slip*9)*.32*k;
 if(Math.random()<dt*8)puff(new V3(e.pos.x,e.pos.y+.1,e.pos.z),2,0x4a1a08,3,.4,14);if(e.slip<=0){e.slip=0;e.g.rotation.z=0;e.g.rotation.x=0;e.cd=Math.max(e.cd,.5)}}
/* ================= гейзер: кола + ментос ================= */
let geysers=[];
const GEY_CYL=new THREE.CylinderGeometry(1,1,1,28,30,true),BLOB_G=new THREE.IcosahedronGeometry(1,1),MENT_G=new THREE.CylinderGeometry(.13,.13,.06,16),SPL_G=new THREE.RingGeometry(.82,1,48).rotateX(-Math.PI/2);
const BLOB_M=new THREE.MeshStandardMaterial({color:0xfbf5ea,roughness:.5,emissive:0x40362c,envMap:ENV,envMapIntensity:.6}),MENT_M=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.35,emissive:0x222222});
const GEY_VS=`uniform float uT,uH,uR0,uR1;varying vec2 vUv;varying vec3 vN;varying vec3 vV;varying float vY;
void main(){vUv=uv;vec3 p=position;float y=p.y+.5;vY=y;float a=atan(p.z,p.x);
 float w=1.+.13*sin(y*19.-uT*15.+a*3.)+.07*sin(a*7.+uT*9.+y*6.);float r=mix(uR0,uR1,y)*w*(1.+.45*smoothstep(.86,1.,y));
 p.xz*=r;p.y=y*uH;vec4 wp=modelMatrix*vec4(p,1.);vN=normalize(mat3(modelMatrix)*vec3(normal.x,0.,normal.z));vV=cameraPosition-wp.xyz;gl_Position=projectionMatrix*viewMatrix*wp;}`;
const GEY_FS=`uniform float uT,uA,uF;uniform vec3 uC0,uC1;varying vec2 vUv;varying vec3 vN;varying vec3 vV;varying float vY;
float hs(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
void main(){float y=vY;vec3 n=normalize(vN),v=normalize(vV);float fr=pow(1.-abs(dot(n,v)),2.2);
 vec3 col=mix(uC0,uC1,clamp(y*.9+.08*sin(y*22.-uT*13.),0.,1.));
 float st=smoothstep(.72,1.,sin(vUv.x*69.1+sin(y*11.-uT*7.)*2.5))*(.55+.45*sin(y*26.-uT*24.));
 vec2 g=vec2(vUv.x*26.,y*34.-uT*16.);vec2 f=fract(g)-.5;float h=hs(floor(g));float b=smoothstep(.24,.1,length(f))*step(.78,h);
 col+=vec3(1.,.86,.62)*st*.55+vec3(1.)*b*.85+vec3(1.,.7,.4)*fr*.55;
 float foam=smoothstep(.8,.99,y)*uF+smoothstep(.13,0.,y)*.9;col=mix(col,vec3(.98,.95,.9),clamp(foam,0.,1.));
 gl_FragColor=vec4(col,clamp(uA*(.5+.5*fr+foam*.5+b*.6+st*.2),0.,1.));}`;
function gMat(a,c0,c1){return new THREE.ShaderMaterial({uniforms:{uT:{value:Math.random()*9},uH:{value:.01},uR0:{value:1},uR1:{value:.6},uA:{value:a},uF:{value:1},uC0:{value:new THREE.Vector3(...c0)},uC1:{value:new THREE.Vector3(...c1)}},
 vertexShader:GEY_VS,fragmentShader:GEY_FS,transparent:true,depthWrite:false,side:THREE.DoubleSide})}
/* брызги гейзера: инстансы-капли, вытянутые по скорости */
const GD_N=600,GD=new THREE.InstancedMesh(new THREE.SphereGeometry(1,8,6),new THREE.MeshStandardMaterial({roughness:.15,metalness:.15,envMap:ENV,envMapIntensity:1.2}),GD_N);
GD.instanceMatrix.setUsage(THREE.DynamicDrawUsage);GD.frustumCulled=false;{const c=new THREE.Color();for(let i=0;i<GD_N;i++)GD.setColorAt(i,c)}GD.count=0;scene.add(GD);
const gdrops=[],_gd=new THREE.Object3D(),_gc=new THREE.Color(),_gv=new V3(),FOAM_C=0xfaf3e6;
const geyLight=new THREE.PointLight(0xffa850,0,16,2);scene.add(geyLight);
function gDrop(x,y,z,vx,vy,vz,s,c,gy){if(gdrops.length>=GD_N)gdrops.shift();gdrops.push({p:new V3(x,y,z),v:new V3(vx,vy,vz),s,c,gy,t:3})}
function geyserFx(x,y,z){const G=new THREE.Group();G.position.set(x,y,z);scene.add(G);
 const inner=new THREE.Mesh(GEY_CYL,gMat(.95,[.07,.02,.008],[.34,.12,.03])),outer=new THREE.Mesh(GEY_CYL,gMat(.72,[.22,.06,.02],[.8,.4,.12]));outer.renderOrder=2;inner.renderOrder=1;G.add(inner,outer);
 const crown=[],skirt=[];for(let i=0;i<10;i++){const m=new THREE.Mesh(BLOB_G,BLOB_M);m.castShadow=true;G.add(m);crown.push(m)}for(let i=0;i<8;i++){const m=new THREE.Mesh(BLOB_G,BLOB_M);G.add(m);skirt.push(m)}
 const spl=[0,1].map(()=>{const m=new THREE.Mesh(SPL_G,new THREE.MeshBasicMaterial({color:0xfff6e8,transparent:true,opacity:0,depthWrite:false}));m.position.y=.06;G.add(m);return m});
 const ments=[];for(let i=0;i<6;i++){const m=new THREE.Mesh(MENT_G,MENT_M);m.position.set(x,y+1,z);scene.add(m);const a=Math.random()*6.3;ments.push({m,v:new V3(Math.cos(a)*rnd(2,5),rnd(15,22),Math.sin(a)*rnd(2,5)),w:new V3(rnd(-12,12),rnd(-12,12),rnd(-12,12)),gy:y})}
 geysers.push({G,inner,outer,crown,skirt,spl,ments,x,y,z,t:0,acc:0,fz:0});
 blast(new V3(x,y+.6,z),2.2,0xfff0d8);ring(new V3(x,y,z),6,0x6b2a12);puff(new V3(x,y+.4,z),40,0xfaf3e6,9,.7,10);
 geyLight.position.set(x,y+3,z);geyLight.intensity=2.4;sfx('jet');sfx('boom',.5);shake=Math.max(shake,Math.min(.4,.55-camera.position.distanceTo(new V3(x,y,z))/40))}
function colaGeyser(e){const x=e.pos.x,z=e.pos.z,y=e.type==='drone'||e.type==='boss'?groundY(e.pos):e.pos.y;
 geyserFx(x,y,z);if(mp())pushFx(['y',0,r1(x),r1(y),r1(z)]);addStyle('ГЕЙЗЕР КОЛЫ',120);e.wet=0;
 for(const o of enemies){if(o.dead)continue;const d=Math.hypot(o.pos.x-x,o.pos.z-z);if(d>4.8)continue;damage(o,o===e?5:2.2,99,'geyser');
  if(!o.remote&&!o.dead&&o.type!=='drone'&&o.type!=='boss'){o.vel.y=Math.max(o.vel.y,18*(1-d/7));o.vel.x+=(o.pos.x-x)*.6;o.vel.z+=(o.pos.z-z)*.6;o.leaping=false;o.lw=0;o.wind=0;if(o.type==='vend')o.stun=Math.max(o.stun||0,1.3)}}
 if(P.alive&&Math.hypot(P.pos.x-x,P.pos.z-z)<3.2&&Math.abs(P.pos.y-y)<3){P.vel.y=Math.max(P.vel.y,21);P.grounded=false;P.slam=false;setTimeout(()=>addStyle('ВЕРХОМ НА ГЕЙЗЕРЕ',40),200)}
 addPuddle(x,y,z,2.6,10)}
function updCola(dt){
 for(const p of puddles){p.t-=dt;p.g=Math.min(1,p.g+dt*2.5);const s=p.r*(.35+.65*(1-Math.pow(1-p.g,3)))*(1+Math.sin(T*2+p.x)*.015);p.m.scale.set(s,1,s);p.m.material.opacity=.82*Math.min(1,p.t/1.5)*Math.min(1,p.g*3);
  if(p.t<=0){scene.remove(p.m);p.m.material.dispose()}}
 puddles=puddles.filter(p=>p.t>0);
 let gl=0;for(const g of geysers){g.t+=dt;const t=g.t,HM_=11;let H,k=0;
  if(t<.2){const x=t/.2-1;H=HM_*(1+2.4*x*x*x+1.4*x*x)}else if(t<1.45)H=HM_*(1+.07*Math.sin(t*13)+.04*Math.sin(t*29));else{k=Math.min(1,(t-1.45)/.6);H=HM_*(1-k*k)}
  H=Math.max(.05,H);const r0=1+.12*Math.sin(t*21);
  for(const [m,rs] of [[g.inner,.58],[g.outer,1]]){const u=m.material.uniforms;u.uT.value+=dt;u.uH.value=H;u.uR0.value=r0*rs*(1-.4*k);u.uR1.value=.58*rs*(1-.3*k);u.uF.value=1-k}
  const cz=t<.2?t/.2:1-k;g.crown.forEach((m,i)=>{const a=i/g.crown.length*6.283+t*1.6,rr=(.55+.45*Math.sin(t*7+i*1.7))*(1+k*1.5);
   m.position.set(Math.cos(a)*rr,H+.25*Math.sin(t*9+i*2)+(i%3)*.25-k*2,Math.sin(a)*rr);m.scale.setScalar(Math.max(.01,(.5+.22*Math.sin(t*11+i))*cz*(i%3===0?1.25:1)));m.rotation.set(t*2+i,t*3,0)});
  g.skirt.forEach((m,i)=>{const a=i/g.skirt.length*6.283+i;m.position.set(Math.cos(a)*1.15,.18+.08*Math.sin(t*10+i),Math.sin(a)*1.15);m.scale.setScalar(Math.max(.01,(.42+.15*Math.sin(t*13+i*2))*(t<.15?t/.15:1-Math.max(0,(t-1.7)/.5))))});
  g.spl.forEach((m,i)=>{const ph=((t+i*.17)%.34)/.34;m.scale.setScalar(1.1+ph*4.5);m.material.opacity=t<1.6?.55*(1-ph):0});
  // брызги: колу и пену разбрасывает зонтиком
  if(t<1.5){g.acc+=dt*(t<.25?420:240);while(g.acc>=1){g.acc--;const a=Math.random()*6.283,rr=Math.random()*.55,foam=Math.random()<.42,sp=rnd(2.5,8.5);
    gDrop(g.x+Math.cos(a)*rr,g.y+H-.2,g.z+Math.sin(a)*rr,Math.cos(a)*sp,rnd(2,9),Math.sin(a)*sp,foam?rnd(.09,.2):rnd(.05,.15),foam?FOAM_C:(Math.random()<.5?0x4a1606:0x8a3510),g.y)}}
  else if(t<2){g.acc+=dt*160;while(g.acc>=1){g.acc--;const a=Math.random()*6.283,rr=rnd(.2,1.6);gDrop(g.x+Math.cos(a)*rr,g.y+H+rnd(0,1),g.z+Math.sin(a)*rr,Math.cos(a)*rnd(.5,3),rnd(-2,2),Math.sin(a)*rnd(.5,3),rnd(.06,.18),Math.random()<.5?FOAM_C:0x5a1f0a,g.y)}}
  if(t<1.5&&(g.fz-=dt)<=0){g.fz=.16;sfx('spray',.35);puff(new V3(g.x,g.y+.3,g.z),6,0xfaf3e6,4,.5,6)}
  for(const mn of g.ments){if(!mn.m.parent)continue;mn.v.y-=20*dt;mn.m.position.addScaledVector(mn.v,dt);mn.m.rotation.x+=mn.w.x*dt;mn.m.rotation.y+=mn.w.y*dt;mn.m.rotation.z+=mn.w.z*dt;
   if(mn.m.position.y<mn.gy){scene.remove(mn.m);puff(mn.m.position,4,0xffffff,3,.4)}}
  gl=Math.max(gl,t<.15?2.4:t<1.45?1.05+.3*Math.sin(t*17):Math.max(0,1.05*(1-k)));
  if(t>2.3){scene.remove(g.G);g.ments.forEach(mn=>scene.remove(mn.m));g.inner.material.dispose();g.outer.material.dispose();g.spl.forEach(m=>m.material.dispose());g.dead=true}}
 geysers=geysers.filter(g=>!g.dead);geyLight.intensity=gl;
 let n=0;for(const d of gdrops){d.t-=dt;d.v.y-=21*dt;d.p.addScaledVector(d.v,dt);
  if(d.p.y<d.gy){d.t=0;if(Math.random()<.25)puff(new V3(d.p.x,d.gy+.05,d.p.z),2,d.c===FOAM_C?0xfaf3e6:0x5a1f0a,2,.3,10);continue}if(d.t<=0)continue;
  const sp=d.v.length();_gd.position.copy(d.p);_gd.quaternion.setFromUnitVectors(UPV,_gv.copy(d.v).divideScalar(sp||1));const st=1+Math.min(1.6,sp*.08);_gd.scale.set(d.s/Math.sqrt(st),d.s*st,d.s/Math.sqrt(st));
  _gd.updateMatrix();GD.setMatrixAt(n,_gd.matrix);GD.setColorAt(n,_gc.setHex(d.c));n++}
 for(let i=gdrops.length-1;i>=0;i--)if(gdrops[i].t<=0)gdrops.splice(i,1);
 GD.count=n;GD.instanceMatrix.needsUpdate=true;if(GD.instanceColor)GD.instanceColor.needsUpdate=true}
function clearCola(){puddles.forEach(p=>{scene.remove(p.m);p.m.material.dispose()});puddles=[];geysers.forEach(g=>{scene.remove(g.G);g.ments.forEach(mn=>scene.remove(mn.m))});geysers=[];gdrops.length=0;GD.count=0;geyLight.intensity=0;if(bossRing){scene.remove(bossRing);bossRing=null}}
/* ================= босс: Генеральный Директор Газ-Ада ================= */
let bossRing=null;const UPV=new V3(0,1,0);
function buildBoss(g,mm,add){const E={envMap:ENV},suit=mm(0x5c0b16,{metalness:.55,roughness:.3,...E}),dark=mm(0x15161b,{metalness:.8,roughness:.34,...E}),chrome=mm(0xdfe4ea,{metalness:1,roughness:.12,...E,envMapIntensity:1.3}),
 gold=mm(0xf2b84b,{metalness:.9,roughness:.2,...E}),cream=mm(0xf6eee2,{roughness:.4}),red=mm(0xc8102e,{metalness:.5,roughness:.26,...E}),goldD=mm(0xf2b84b,{metalness:.9,roughness:.2,side:THREE.DoubleSide,...E}),redD=mm(0xc8102e,{metalness:.5,roughness:.26,side:THREE.DoubleSide,...E});const B={};
 const grp=(par,x,y,z)=>{const o=new THREE.Group();o.position.set(x,y,z);par.add(o);return o};const put=(par,geo,mat,x,y,z,rx=0,ry=0,rz=0)=>{const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.rotation.set(rx,ry,rz);par.add(m);return m};
 // полы пиджака и юбка-корпус (ног нет — парит на пенных двигателях)
 put(g,tbox(1.1,1.55,1.5,.8,1.05),suit,0,1.55,0);put(g,tbox(1.12,1.12,.14,.82,.82),gold,0,2.32,0);
 for(const s of[-1,1])put(g,tbox(.55,.5,1.8,.08,.08),suit,s*.33,.55,-.48,-.22);
 B.eng=[];for(const s of[-1,1]){put(g,new THREE.CylinderGeometry(.24,.36,.5,12),chrome,s*.42,.62,0);B.eng.push(new V3(s*.42,.3,0))}
 // торс-пиджак, лацканы, рубашка, галстук-бутылка
 put(g,tbox(1.25,2.55,1.75,.85,1.1,.06),suit,0,3.2,0);
 for(const s of[-1,1])put(g,tbox(.42,.12,1.35,.05,.05),cream,s*.33,3.32,.56,.08,0,-s*.35);
 put(g,tbox(.55,.72,1.25,.05,.05),cream,0,3.35,.5,.08);put(g,tbox(.36,.12,1.0,.07,.07),red,0,3.22,.56,.08);put(g,new THREE.TorusGeometry(.07,.025,6,12),gold,0,3.78,.6);
 // кнопки-крышки
 for(let i=0;i<3;i++)put(g,crownGeo(.09,13),goldD,.38,2.7+i*.32,.5,Math.PI/2);
 // плечи
 for(const s of[-1,1]){put(g,tbox(.95,.62,.48,.95,.8),suit,s*1.38,3.92,0,0,0,-s*.28);put(g,new THREE.SphereGeometry(.33,14,10),chrome,s*1.4,3.6,0);put(g,tbox(.9,.9,.08,.96,.96),gold,s*1.38,4.12,0,0,0,-s*.28)}
 // голова: горлышко, визор, крышка-цилиндр
 put(g,new THREE.CylinderGeometry(.3,.44,.5,10),dark,0,4.28,0);B.head=grp(g,0,4.5,0);
 put(B.head,new THREE.CylinderGeometry(.42,.62,.95,8).rotateY(Math.PI/8),dark,0,.45,0);B.visor=new THREE.MeshBasicMaterial({color:0xfff0b0});
 put(B.head,new THREE.BoxGeometry(.78,.1,.08),B.visor,0,.5,.58,-.12);put(B.head,new THREE.BoxGeometry(.9,.2,.06),dark,0,.5,.56,-.12);
 put(B.head,new THREE.TorusGeometry(.43,.05,6,20).rotateX(Math.PI/2),chrome,0,.95,0);put(B.head,crownGeo(.62,21),redD,0,1.02,0);
 // левая рука — пушка из банок, правая — лезвие-открывашка
 B.cannonG=grp(g,-1.55,3.05,.2);put(B.cannonG,new THREE.BoxGeometry(.5,.6,.9),suit,0,.25,-.2);
 for(let i=0;i<3;i++){const a=i/3*Math.PI*2;put(B.cannonG,new THREE.CylinderGeometry(.15,.15,1.25,14).rotateX(Math.PI/2),i?red:cream,Math.cos(a)*.2,Math.sin(a)*.2,.55);put(B.cannonG,new THREE.TorusGeometry(.15,.025,6,14),chrome,Math.cos(a)*.2,Math.sin(a)*.2,1.18)}
 B.muzzle=grp(B.cannonG,0,0,1.35);
 B.bladeG=grp(g,1.55,3.05,.15);put(B.bladeG,new THREE.BoxGeometry(.5,.6,.8),suit,0,.25,-.15);put(B.bladeG,new THREE.CylinderGeometry(.16,.16,.5,10).rotateX(Math.PI/2),gold,0,0,.4);
 const bl=grp(B.bladeG,0,0,.6);put(bl,new THREE.BoxGeometry(.09,.55,2.1),chrome,0,0,1.05);put(bl,new THREE.TorusGeometry(.2,.07,8,18).rotateY(Math.PI/2),chrome,0,0,1.85);put(bl,new THREE.BoxGeometry(.1,.2,.5),gold,0,.18,.3);
 // нимб из восьми крышек
 B.halo=grp(g,0,4.9,-.8);put(B.halo,new THREE.TorusGeometry(1.15,.04,6,40),gold,0,0,0);
 for(let i=0;i<8;i++){const a=i/8*Math.PI*2,c=put(B.halo,crownGeo(.2,13),i%2?goldD:redD,Math.cos(a)*1.15,Math.sin(a)*1.15,0,Math.PI/2)}
 g.userData.boss=B;return B.visor}
function bossAnim(e,dt){const B=e.g.userData.boss;if(!B)return;const ph2=e.ph2||e.hp<(e.maxHp||1)*.5;
 B.halo.rotation.z+=dt*(ph2?2.6:.7);B.halo.position.y=4.9+Math.sin(T*2)*.08;B.visor.color.setHex(ph2?0xff3a2a:e.wind?0xffffff:0xfff0b0);
 const wd=e.dashW>0?1-e.dashW/.8:0;B.bladeG.rotation.x+=((e.dashT>0?.5:-1.35*wd)-B.bladeG.rotation.x)*Math.min(1,dt*12);
 B.kickT=Math.max(0,(B.kickT||0)-dt);B.cannonG.position.z=.2-B.kickT*.6;B.cannonG.rotation.z+=dt*(B.kickT>0?14:1);
 B.head.rotation.y=Math.sin(T*.9)*.15;if(e.stagger>0)e.g.rotation.x=Math.sin(e.stagger*8)*.15;else e.g.rotation.x*=.9;
 if(Math.random()<dt*14)for(const p of B.eng){const w=p.clone().applyMatrix4(e.g.matrixWorld);puff(w,1,0xf6eee2,2.5,.45,9)}}
function bossOrb(from,dir,speed,dmg,size,hex){const m=new THREE.Mesh(new THREE.SphereGeometry(size,12,8),new THREE.MeshBasicMaterial({color:hex}));m.position.copy(from);scene.add(m);
 proj.push({m,vel:dir.clone().multiplyScalar(speed),owner:'enemy',dmg,r:size,t:7,kind:'orb',netId:++pnid})}
function bossAI(e,t,to,dist,dt,tg){const B=e.g.userData.boss,ph2=e.hp<e.maxHp*.5;
 if(ph2&&!e.ph2){e.ph2=true;banner('СОВЕТ ДИРЕКТОРОВ СОЗВАН!');sfx('frag');for(let i=0;i<3;i++)toSpawn.push('vend');if(mode==='coop')toSpawn.push('vend');spawnT=.3;addStyle('ДИРЕКТОР В ЯРОСТИ',50)}
 e.hy=e.hy==null?t.pos.y:e.hy+(t.pos.y-e.hy)*Math.min(1,dt*.7);
 if(e.stagger>0){e.stagger-=dt;e.vel.multiplyScalar(1-dt*2);e.vel.y=-1.5;return}
 if(e.slamS){e.slamT+=dt;
  if(e.slamS===1){e.vel.x=(t.pos.x-e.pos.x)*2.2;e.vel.z=(t.pos.z-e.pos.z)*2.2;e.vel.y=(t.pos.y+9-e.pos.y)*3;
   if(e.slamT>.8){e.slamS=2;e.slamT=0;e.wind=1;e.sx=t.pos.x;e.sz=t.pos.z;e.sy=t.pos.y;sfx('charge');
    bossRing=new THREE.Mesh(new THREE.RingGeometry(7.6,8.5,48).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({color:0xff2a3a,transparent:true,opacity:.6,depthWrite:false,side:THREE.DoubleSide}));scene.add(bossRing)}}
  else if(e.slamS===2){e.sx+=(t.pos.x-e.sx)*Math.min(1,dt*1.4);e.sz+=(t.pos.z-e.sz)*Math.min(1,dt*1.4);e.vel.set((e.sx-e.pos.x)*6,(e.sy+9-e.pos.y)*4,(e.sz-e.pos.z)*6);
   if(bossRing){bossRing.position.set(e.sx,e.sy+.06,e.sz);bossRing.material.opacity=.35+.35*Math.sin(e.slamT*25)}if(e.slamT>.7){e.slamS=3;e.slamT=0}}
  else if(e.slamS===3){e.vel.set((e.sx-e.pos.x)*8,-50,(e.sz-e.pos.z)*8);
   if(e.onGround||e.pos.y<=e.sy+.05||e.slamT>1.2){if(e.pos.y<e.sy)e.pos.y=e.sy;e.slamS=4;e.slamT=0;e.wind=0;if(bossRing){scene.remove(bossRing);bossRing=null}
    ring(e.pos,9,0xffe066);ring(e.pos,6,0xc8102e);puff(new V3(e.pos.x,e.pos.y+.3,e.pos.z),80,0xf6eee2,14,.8,6);sfx('slam');sfx('boom');shake=Math.max(shake,.5);
    if(mp())pushFx(['h',0,r1(e.pos.x),r1(e.pos.y),r1(e.pos.z)]);
    for(const c of tg){const d=Math.hypot(c.pos.x-e.pos.x,c.pos.z-e.pos.z),dy=c.pos.y-e.pos.y;if(d<8.5&&dy<1.3&&dy>-2)hitTarget(c,26,new V3(c.pos.x-e.pos.x,0,c.pos.z-e.pos.z).normalize().multiplyScalar(14).setY(11))}}}
  else{e.vel.x*=.8;e.vel.z*=.8;e.vel.y=-6;if(e.slamT>1.2){e.slamS=0;e.cdS=rnd(8,11)}}
  return}
 if(e.dashW>0){e.dashW-=dt;e.vel.multiplyScalar(1-dt*5);e.vel.y=(e.hy+3-e.pos.y)*2;
  if(e.dashW<=0){e.dashT=.5;e.dashHit=false;e.dashDir=new V3(t.pos.x-e.pos.x,t.pos.y+1-(e.pos.y+e.cy),t.pos.z-e.pos.z).normalize();sfx('dash');shake=Math.max(shake,.12)}return}
 if(e.dashT>0){e.dashT-=dt;e.vel.copy(e.dashDir).multiplyScalar(36);puff(center(e,tmpB),3,0xf6eee2,3,.4);
  if(!e.dashHit)for(const c of tg){if(center(e,tmpB).distanceTo(new V3(c.pos.x,c.pos.y+1,c.pos.z))<e.r+1.3){e.dashHit=true;hitTarget(c,28,e.dashDir.clone().multiplyScalar(24).setY(8));shake=Math.max(shake,.35)}}
  if(e.dashT<=0){e.vel.multiplyScalar(.2);e.cdD=rnd(3.5,5.5)*(ph2?.7:1)}return}
 const side=new V3(-to.z,0,to.x).multiplyScalar(e.strafe*(ph2?9:7)),radial=dist<9?-6:dist>15?6:0;
 e.vel.x+=(to.x*radial+side.x-e.vel.x)*Math.min(1,dt*2);e.vel.z+=(to.z*radial+side.z-e.vel.z)*Math.min(1,dt*2);e.vel.y=(e.hy+3+Math.sin(T*1.7)*.5-e.pos.y)*2.5;
 if(Math.random()<dt*.35)e.strafe*=-1;
 e.cdD=(e.cdD??3)-dt;e.cdS=(e.cdS??7)-dt;
 if(ph2&&e.cdS<=0&&dist<24){e.slamS=1;e.slamT=0;banner('ПАДЕНИЕ АКЦИЙ!')}
 else if(e.cdD<=0&&dist<24){e.dashW=.8;ring(new V3(e.pos.x,e.pos.y,e.pos.z),3.5,0xff5a00);sfx('charge',.8)}
 else if(e.cd<=0){const from=B.muzzle.getWorldPosition(new V3()),base=new V3(t.pos.x,t.pos.y+1,t.pos.z).sub(from).normalize();B.kickT=.3;sfx('orb',.9);
  if(ph2&&(e.vol=(e.vol||0)+1)%2===0){const fy=Math.max(e.pos.y+1,t.pos.y+1.1),c=new V3(e.pos.x,fy,e.pos.z);for(let i=0;i<14;i++){const a=i/14*Math.PI*2+T;bossOrb(c,new V3(Math.cos(a),0,Math.sin(a)),12,12,.3,0xff9a4d)}}
  else{const n=ph2?7:5,sp=ph2?.55:.38;for(let i=0;i<n;i++)bossOrb(from,base.clone().applyAxisAngle(UPV,(i/(n-1)-.5)*sp*2),ph2?19:16,12,.3,0xff9a4d)}
  e.cd=ph2?1.6:2.3}}

function foamBlast(e){const c=center(e,new V3());e.wet=0;blast(c,3.6,0xf6eee2);puff(c,70,0xf6eee2,10,1,4);puff(c,30,0x6b2a12,8,.9,6);sfx('jet',.6);addStyle('ПЕННЫЙ ВЗРЫВ',60);
 damage(e,2.5,99,'foam');for(const o of enemies){if(o===e||o.dead)continue;const d=center(o,tmpA).distanceTo(c)-o.r;if(d<3.6){damage(o,1.6,99,'foam');if(!o.remote)o.vel.y+=5}}}
function punchCoin(c){let tgt=null,best=40;const from=c.m.position;
 for(const e of enemies){if(e.dead)continue;const d=center(e,tmpA).distanceTo(from);if(d<best&&los(from,center(e,new V3()))){best=d;tgt=e}}
 if(mode==='pvp')for(const [peer,r] of remotes)if(r.alive){const d=rc(r,tmpA).distanceTo(from);if(d<best){best=d;tgt={peer,r}}}
 c.t=3.5;c.home=tgt;if(!tgt){c.vel.copy(aim).multiplyScalar(18).add(new V3(0,6,0))}sfx('ding',.8);addStyle('ПОДАЧА КРЫШКИ',30);freeze=Math.max(freeze,.04)}
function makeOrb(p){const m=new THREE.Mesh(new THREE.SphereGeometry(.22,10,8),new THREE.MeshBasicMaterial({color:0xff4d5e}));m.position.copy(p);scene.add(m);return{m,vel:new V3(rnd(-4,4),rnd(4,8),rnd(-4,4)),t:12}}
function los(a,b){const d=new V3().subVectors(b,a),L=d.length();ray.set(a,d.normalize());ray.far=L;return ray.intersectObjects(level,false).length===0}
function targets(){const t=[];if(P.alive)t.push({pos:P.pos,vel:P.vel,local:true});
 if(mode==='coop')for(const [peer,r] of remotes)if(r.alive)t.push({pos:r.pos,vel:new V3(),local:false,peer});return t}
function hitTarget(t,dmg,knock){if(t.local){hurt(dmg);if(P.iT<=0)P.vel.add(knock)}else queueDmg(t.peer,dmg,'en',knock)}
function enemyShot(from,t,speed,dmg,size,hex){const dir=new V3(t.pos.x,t.pos.y+1,t.pos.z).sub(from);const lead=t.vel.clone().multiplyScalar(dir.length()/speed*.5);dir.add(lead).normalize();
 const m=new THREE.Mesh(new THREE.SphereGeometry(size,14,10),new THREE.MeshBasicMaterial({color:hex}));m.position.copy(from);scene.add(m);proj.push({m,vel:dir.multiplyScalar(speed),owner:'enemy',dmg,r:size,t:7,kind:'orb',netId:++pnid});sfx('orb',.6)}
function updEnemies(dt){const pc=new V3(),tmp=new V3(),tg=targets();
 for(const e of enemies){if(e.dead||e.remote)continue;
  let t=null,best=1e9;for(const c of tg){const d=Math.hypot(c.pos.x-e.pos.x,c.pos.z-e.pos.z);if(d<best){best=d;t=c}}
  if(!t){e.vel.multiplyScalar(.9);continue}
  const to=tmp.set(t.pos.x-e.pos.x,0,t.pos.z-e.pos.z),dist=to.length();to.divideScalar(dist||1);e.cd-=dt;e.cd2-=dt;
  if(!e.leaping&&!(e.stun>0)&&!(e.slip>0))e.g.rotation.y=Math.atan2(to.x,to.z);
  const ef=e.flash>0;e.flash-=dt;e.wet=(e.wet||0)-dt;const dw=e.dashW>0&&Math.sin(T*30)>0;e.mats.forEach(m=>m.emissive.setHex(ef?0xffffff:dw||e.dashT>0?0xaa3300:e.wind>0||e.lw>0?0x661111:e.wet>0?0x2a1000:0));wetFx(e,dt);
  if(!(e.slip>0)&&e.type!=='drone'&&e.type!=='boss'&&e.onGround&&!e.leaping&&(e.slipCd=(e.slipCd||0)-dt)<=0&&inPuddle(e.pos))startSlip(e);
  if(e.type==='boss'){bossAI(e,t,to,dist,dt,tg);bossAnim(e,dt)}
  else if(e.slip>0)slipUpd(e,dt);
  else if(e.type==='vend'){
   if(e.stun>0){e.stun-=dt;e.g.rotation.x+=(1.3-e.g.rotation.x)*Math.min(1,dt*10);e.vel.x*=.85;e.vel.z*=.85;if(e.stun<=0){e.g.rotation.x=0;e.cd=.4}}
   else if(e.leaping){e.leapT+=dt;e.g.rotation.x+=(1.5-e.g.rotation.x)*Math.min(1,dt*9);e.g.position.y+=0;
    const hd=new V3(Math.sin(e.g.rotation.y),0,Math.cos(e.g.rotation.y)),head=new V3(e.pos.x+hd.x*2.1,e.pos.y+.8,e.pos.z+hd.z*2.1);
    for(const c of tg){if(e.rammed)break;const d=head.distanceTo(new V3(c.pos.x,c.pos.y+.9,c.pos.z));if(d<1.5){e.rammed=true;hitTarget(c,24,hd.clone().multiplyScalar(16).setY(6));shake=Math.max(shake,.25)}}
    if(e.onGround&&e.leapT>.15){e.leaping=false;e.stun=1;ring(e.pos,3.2,0xc8102e);sfx('slam',.5);shake=Math.max(shake,.15);
     if(!e.rammed)for(const c of tg){const d=Math.hypot(c.pos.x-e.pos.x,c.pos.z-e.pos.z);if(d<2.7&&Math.abs(c.pos.y-e.pos.y)<2.4)hitTarget(c,22,to.clone().multiplyScalar(12).setY(6))}}}
   else if(e.lw>0){e.lw-=dt;e.g.scale.y=.82;e.eyes.color.setHex(0xffffff);
    if(e.lw<=0){e.g.scale.y=1;e.eyes.color.setHex(0xffcc33);e.leaping=true;e.rammed=false;e.leapT=0;const fl=.85;e.vel.set(to.x*dist/fl,11,to.z*dist/fl);e.cd2=rnd(3,5);sfx('throw')}}
   else if(e.wind>0){e.wind-=dt;e.eyes.color.setHex(0xffffff);if(e.wind<=0){e.eyes.color.setHex(0xffcc33);for(const c of tg){const d=Math.hypot(c.pos.x-e.pos.x,c.pos.z-e.pos.z);if(d<2.8&&Math.abs(c.pos.y-e.pos.y)<2.2)hitTarget(c,18,to.clone().multiplyScalar(14).setY(5))}e.cd=1.1}}
   else if(dist<2.4&&e.cd<=0)e.wind=.4;
   else if(dist>4.5&&dist<12&&e.cd2<=0&&e.onGround)e.lw=.35;
   if(!e.leaping&&!(e.stun>0)){const want=e.wind>0||e.lw>0?0:e.speed;e.vel.x+=(to.x*want-e.vel.x)*Math.min(1,dt*5);e.vel.z+=(to.z*want-e.vel.z)*Math.min(1,dt*5)}
  }else if(e.type==='golem'){
   if(e.wind>0){e.wind-=dt;if(e.wind<=0){ring(e.pos,7,0xf3efe6);sfx('slam');shake=Math.max(shake,.3);
     for(const c of tg){const d=Math.hypot(c.pos.x-e.pos.x,c.pos.z-e.pos.z);if(d<6.5&&c.pos.y-e.pos.y<1.2)hitTarget(c,28,new V3(c.pos.x-e.pos.x,0,c.pos.z-e.pos.z).normalize().multiplyScalar(16).setY(9))}e.cd=2.4}}
   else if(e.dashW>0){e.dashW-=dt;e.vel.x*=.8;e.vel.z*=.8;if(e.dashW<=0){e.dashT=.6;e.dashHit=false;e.dashDir=to.clone();sfx('dash');shake=Math.max(shake,.1)}}
   else if(e.dashT>0){e.dashT-=dt;e.vel.x=e.dashDir.x*27;e.vel.z=e.dashDir.z*27;puff(new V3(e.pos.x,.3,e.pos.z),3,0xf3efe6,3,.4);
    if(!e.dashHit)for(const c of tg){const d=Math.hypot(c.pos.x-e.pos.x,c.pos.z-e.pos.z);if(d<e.r+.9&&Math.abs(c.pos.y-e.pos.y)<3){e.dashHit=true;hitTarget(c,30,e.dashDir.clone().multiplyScalar(22).setY(7));shake=Math.max(shake,.35)}}
    if(e.dashT<=0){e.cd3=rnd(4,6.5);e.vel.x*=.2;e.vel.z*=.2}}
   else if(dist<4.6&&e.cd<=0)e.wind=.85;
   else if(dist>7&&dist<20&&(e.cd3=(e.cd3??rnd(2,4))-dt)<=0&&los(center(e,pc),new V3(t.pos.x,t.pos.y+1,t.pos.z))){e.dashW=.75;ring(e.pos,3.5,0xff5a00);sfx('charge',.7)}
   else if(dist>8&&e.cd2<=0&&los(center(e,pc),new V3(t.pos.x,t.pos.y+1,t.pos.z))){enemyShot(pc.set(e.pos.x,e.pos.y+4,e.pos.z),t,17,20,.55,0xf3efe6);e.cd2=rnd(3,4.5)}
   if(!(e.dashT>0)){const want=e.wind>0||e.dashW>0?0:e.speed;e.vel.x+=(to.x*want-e.vel.x)*Math.min(1,dt*3);e.vel.z+=(to.z*want-e.vel.z)*Math.min(1,dt*3)}
  }else if(e.type==='banan'){
   const b=e.g.userData.body;b.position.y=Math.abs(Math.sin(T*11))*.45;b.rotation.z=Math.sin(T*11)*.12;
   if(e.spin>0){e.spin-=dt;b.rotation.y=e.spin>0?b.rotation.y+dt*28:0;if(!e.spinHit)for(const c of tg){const d=Math.hypot(c.pos.x-e.pos.x,c.pos.z-e.pos.z);if(d<2.4&&Math.abs(c.pos.y-e.pos.y)<2.5){e.spinHit=true;hitTarget(c,16,new V3(c.pos.x-e.pos.x,0,c.pos.z-e.pos.z).normalize().multiplyScalar(18).setY(7))}}}
   else if(dist<2.6&&e.cd<=0){e.spin=.6;e.spinHit=false;e.cd=1.3;sfx('dash',.6)}
   if(e.cd2<=0&&dist>5&&los(center(e,pc),new V3(t.pos.x,t.pos.y+1,t.pos.z))){enemyShot(pc.set(e.pos.x,e.pos.y+3,e.pos.z),t,19,15,.34,0xffe135);e.cd2=rnd(1.8,2.8)}
   e.peelT=(e.peelT??rnd(1,2))-dt;if(e.peelT<=0){e.peelT=rnd(2.2,3.5);dropPeel(e.pos)}
   const side=new V3(-to.z,0,to.x).multiplyScalar(Math.sin(T*2.3+e.seed)*6);
   e.vel.x+=(to.x*e.speed+side.x-e.vel.x)*Math.min(1,dt*4);e.vel.z+=(to.z*e.speed+side.z-e.vel.z)*Math.min(1,dt*4);
  }else{
   const side=new V3(-to.z,0,to.x).multiplyScalar(e.strafe*4);const radial=dist<10?-5:dist>17?5:0;
   const ty=5+Math.sin(T*1.3+e.seed)*1.2+Math.max(0,t.pos.y-1);
   e.vel.x+=(to.x*radial+side.x-e.vel.x)*Math.min(1,dt*2);e.vel.z+=(to.z*radial+side.z-e.vel.z)*Math.min(1,dt*2);e.vel.y=(ty-e.pos.y)*2;
   if(Math.random()<dt*.3)e.strafe*=-1;
   if(e.cd<=0){if(los(center(e,pc),new V3(t.pos.x,t.pos.y+1.2,t.pos.z)))enemyShot(pc.clone(),t,15,12,.28,0x5fe0c8);e.cd=rnd(1.8,2.8)}
   e.g.children[1].rotation.z+=dt*4;
  }
  for(const o of enemies)if(o!==e&&!o.dead){const dx=e.pos.x-o.pos.x,dz=e.pos.z-o.pos.z,d=Math.hypot(dx,dz),m=e.r+o.r;if(d<m&&d>.01){e.vel.x+=dx/d*(m-d)*80*dt;e.vel.z+=dz/d*(m-d)*80*dt}}
  if(e.type==='boss'){e.onGround=moveBody(e.pos,e.vel,1.3,4.6,dt,false).ground;if(e.pos.y<-10){e.pos.copy(spawns[0]);e.pos.y+=4}}
  else if(e.type==='drone'){e.pos.addScaledVector(e.vel,dt);e.pos.x=THREE.MathUtils.clamp(e.pos.x,-34,34);e.pos.z=THREE.MathUtils.clamp(e.pos.z,-34,34);if(inBox(e.pos))e.pos.y+=dt*8}
  else{e.vel.y-=26*dt;e.onGround=moveBody(e.pos,e.vel,e.r*.8,e.type==='golem'?4.5:2.5,dt,true).ground;if(e.pos.y<-10){e.pos.copy(spawns[0]);e.pos.y+=1;e.vel.set(0,0,0)}}}
 enemies=enemies.filter(e=>!e.dead)}

/* ================= combat ================= */
const ray=new THREE.Raycaster(),aim=new V3(),tmpA=new V3(),tmpB=new V3(),tmpC=new V3();
function raySphere(o,d,c,r){const mx=o.x-c.x,my=o.y-c.y,mz=o.z-c.z,b=mx*d.x+my*d.y+mz*d.z,cc=mx*mx+my*my+mz*mz-r*r;if(cc>0&&b>0)return null;const disc=b*b-cc;if(disc<0)return null;return Math.max(0,-b-Math.sqrt(disc))}
const _mz=new V3();
function muzzle(){const g=guns[cur],u=g.userData;if(!u.glb||tpView||!(state==='play'||state==='pause'))return camera.position.clone().add(new V3(.28,-.22,-.7).applyQuaternion(camera.quaternion));
 g.updateMatrixWorld(true);_mz.copy(u.mz).applyMatrix4(g.matrixWorld);const L=_mz.length();_mz.project(gunCam);
 const d=new V3(_mz.x,_mz.y,.5).unproject(camera).sub(camera.position).normalize();return camera.position.clone().addScaledVector(d,Math.min(1.1,L*1.05))}
const rc=(r,o=new V3())=>o.set(r.pos.x,r.pos.y+.95,r.pos.z);
function hitscan(dir,dmg,pierce,src,hex,quiet){const o=camera.position;ray.set(o,dir);ray.far=220;const h=ray.intersectObjects(level,false);let wallD=h.length?h[0].distance:220;
 for(const p of proj)if(p.kind==='dcorpse'&&!p.dead){const t=raySphere(o,dir,p.m.position,.9);if(t!==null&&t<wallD){p.dead=true;scene.remove(p.m);tracer(muzzle(),p.m.position.clone(),hex);explode(p.m.position.clone(),4.5,5.5,'drone');addStyle('ДРОН СБИТ',40);return}}
 {let hc=null,ht=1e9;for(const c of coins)if(!c.dead){const t=raySphere(o,dir,c.m.position,.6);if(t!==null&&t<wallD&&t<ht){ht=t;hc=c}}
  if(hc){const mz=muzzle();tracer(mz,hc.m.position.clone(),hex);if(mp())pushFx(['t',0,r1(mz.x),r1(mz.y),r1(mz.z),r1(hc.m.position.x),r1(hc.m.position.y),r1(hc.m.position.z),0]);ricochet(hc,quiet?2.4:dmg,1);if(quiet)addStyle('ДРОБОВОЙ РИКОШЕТ',30);return}}
 for(const p of proj)if(p.kind==='grenade'&&!p.dead){const t=raySphere(o,dir,p.m.position,.7);if(t!==null&&t<wallD){p.dead=true;explode(p.m.position.clone(),7.5,9,'combo');addStyle('КОМБО-ВЗРЫВ',100);tracer(muzzle(),p.m.position.clone(),hex);return}}
 let tg=[];for(const e of enemies){const t=raySphere(o,dir,center(e,tmpA),e.r);if(t!==null&&t<wallD)tg.push([t,e])}
 if(mode==='pvp')for(const [peer,r] of remotes)if(r.alive){const t=raySphere(o,dir,rc(r,tmpA),.62);if(t!==null&&t<wallD)tg.push([t,{peer}])}
 tg.sort((a,b)=>a[0]-b[0]);if(!pierce)tg=tg.slice(0,1);const end=!pierce&&tg.length?tg[0][0]:wallD;
 for(const [t,e] of tg){if(e.peer){queueDmg(e.peer,dmg*PVPM,src,dir.clone().multiplyScalar(dmg*1.5));hitMark();puff(o.clone().addScaledVector(dir,t),8,0xc8102e,6,.5)}else damage(e,dmg,t,src)}
 if(pierce&&tg.length>=2)addStyle('НАВЫЛЕТ',60);
 const ep=o.clone().addScaledVector(dir,end),mz=muzzle();tracer(mz,ep,hex);puff(ep,tg.length?4:6,tg.length?0x6b2a12:0xffd27a,5,.3);
 if(mp()&&!quiet)pushFx(['t',0,r1(mz.x),r1(mz.y),r1(mz.z),r1(ep.x),r1(ep.y),r1(ep.z),src==='charge'?1:0])}
function spread(base,s){return base.clone().add(new V3(rnd(-s,s),rnd(-s,s),rnd(-s,s))).normalize()}
function rocketMesh(){const m=new THREE.Group();const b=new THREE.Mesh(new THREE.CylinderGeometry(.12,.12,.6,10),M(0xf6eee2));b.rotation.x=Math.PI/2;m.add(b);const tip=new THREE.Mesh(new THREE.SphereGeometry(.13,10,8),M(0xc8102e));tip.position.z=-.3;m.add(tip);scene.add(m);return m}
function bottleMesh(){const m=new THREE.Group();const b=new THREE.Mesh(new THREE.CylinderGeometry(.12,.14,.5,12),M(0x4a1f12,{roughness:.15,metalness:.2,transparent:true,opacity:.9}));m.add(b);const c=new THREE.Mesh(new THREE.CylinderGeometry(.06,.06,.1,10),M(0xc8102e));c.position.y=.3;m.add(c);scene.add(m);return m}
/* крышка-монетка: кроновая крышка от стеклянной бутылки — плоский верх, скруглённый край, юбка из 21 зубца */
function crownGeo(R,pleats=21){const N=pleats*4,prof=[[.82,0,0],[.93,-.04,0],[.99,-.12,0],[1.02,-.22,.25],[1.08,-.34,.65],[1.14,-.44,1]],pos=[0,0,0],idx=[];
 for(const [rr,yy,pa] of prof)for(let i=0;i<N;i++){const a=2*Math.PI*i/N,r=R*(rr+.075*pa*Math.cos(pleats*a));pos.push(r*Math.cos(a),yy*R,r*Math.sin(a))}
 for(let i=0;i<N;i++)idx.push(0,1+(i+1)%N,1+i);
 for(let k=0;k<prof.length-1;k++)for(let i=0;i<N;i++){const a=1+k*N+i,b=1+k*N+(i+1)%N,c=1+(k+1)*N+i,d=1+(k+1)*N+(i+1)%N;idx.push(a,b,c,b,d,c)}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();return g}
const CROWN=crownGeo(.2),crownM=M(0xc8102e,{metalness:.55,roughness:.28,side:THREE.DoubleSide,emissive:0x1a0000}),linerM=M(0xd9dde2,{metalness:.8,roughness:.3,side:THREE.DoubleSide}),LINER=new THREE.CircleGeometry(.17,28);
function capMesh(){const g=new THREE.Group();const c=new THREE.Mesh(CROWN,crownM);c.castShadow=true;g.add(c);const l=new THREE.Mesh(LINER,linerM);l.rotation.x=Math.PI/2;l.position.y=-.02;g.add(l);scene.add(g);return g}
function throwCoin(){if(coinCh<1){sfx('throw');return false}coinCh--;const m=capMesh();m.position.copy(muzzle());
 const v=aim.clone().multiplyScalar(11).add(new V3(0,9,0)).addScaledVector(P.vel,.5);coins.push({m,vel:v,t:3.2,spin:rnd(14,20)});sfx('flip');kick=.3;
 if(mp())pushFx(['c',0,r1(m.position.x),r1(m.position.y),r1(m.position.z),r1(v.x),r1(v.y),r1(v.z)]);return true}
function ricochet(c,dmg,depth){c.dead=true;scene.remove(c.m);const from=c.m.position.clone();puff(from,24,0xf2b84b,7,.5);puff(from,10,0xc8102e,5,.4);sfx('ding');freeze=Math.max(freeze,.05);
 let next=null,bd=40;for(const o of coins)if(!o.dead){const d=o.m.position.distanceTo(from);if(d<bd){bd=d;next=o}}
 const seg=(a,b)=>{tracer(a,b,0xffd27a);if(mp())pushFx(['t',0,r1(a.x),r1(a.y),r1(a.z),r1(b.x),r1(b.y),r1(b.z),0])};
 if(next){seg(from,next.m.position.clone());addStyle('ЦЕПЬ ×'+(depth+1),40*depth);ricochet(next,dmg*1.5,depth+1);return}
 const cands=[];
 for(const e of enemies){if(e.dead)continue;const c2=center(e,new V3());if(los(from,c2))cands.push({tgt:e,tp:c2,d:c2.distanceTo(from)})}
 if(mode==='pvp')for(const [peer,r] of remotes)if(r.alive){const c2=rc(r,new V3());if(los(from,c2))cands.push({tgt:{peer},tp:c2,d:c2.distanceTo(from)})}
 cands.sort((a,b)=>a.d-b.d);const hitList=cands.length>1&&Math.random()<.5?cands.slice(0,2):cands.slice(0,1);
 if(hitList.length>1)addStyle('ДВОЙНОЙ РИКОШЕТ',60);
 for(const {tgt,tp} of hitList){seg(from,tp);addStyle('РИКОШЕТ',50+20*depth);if(tgt.peer){queueDmg(tgt.peer,dmg*2*PVPM,'coin',tp.clone().sub(from).normalize().multiplyScalar(6));hitMark()}else damage(tgt,dmg*2,99,'coin')}
 if(!hitList.length){const d=new V3(rnd(-1,1),rnd(.2,1),rnd(-1,1)).normalize();seg(from,from.clone().addScaledVector(d,30))}}
function updCoins(dt){coinRegen+=dt;if(coinCh<4&&coinRegen>(nick.trim().toLowerCase()==='torch'?.5:1.6)){coinCh++;coinRegen=0}if(coinCh>=4)coinRegen=0;
 for(const c of coins){if(c.dead)continue;c.t-=dt;
  if(c.home){const h=c.home,tp=h.peer?rc(h.r,new V3()):center(h,new V3());if((h.dead)||(h.peer&&!h.r.alive)){c.home=null}else{const to=tp.sub(c.m.position),L=to.length();c.vel.lerp(to.normalize().multiplyScalar(26),Math.min(1,dt*10));
   if(L<(h.r&&!h.peer?h.r:.7)+.45){if(h.peer){queueDmg(h.peer,22,'coin',new V3(0,4,0));hitMark()}else damage(h,1.5,99,'coinpunch');c.home=null;c.vel.set(rnd(-1.5,1.5),12,rnd(-1.5,1.5));c.t=3;puff(c.m.position,16,0xf2b84b,6,.4);sfx('ding',.6)}}}
  else c.vel.y-=20*dt;
  c.m.position.addScaledVector(c.vel,dt);c.m.rotation.x+=dt*c.spin;c.m.rotation.z+=dt*c.spin*.3;
  if(c.t<=0||(!c.home&&(inBox(c.m.position)||c.m.position.y<.1))){c.dead=true;scene.remove(c.m);puff(c.m.position,6,0xc8102e,3,.3)}}
 coins=coins.filter(c=>!c.dead)}
function fire(alt){if(!P.alive)return;const w=WP[cur];camera.getWorldDirection(aim);
 if(!alt){if(w.t>0)return;w.t=w.cd}else{if(w.at>0)return;w.at=w.acd}
  if(cur===0){if(!alt){hitscan(aim,1.3,false,'rev',0xffe3a3);sfx('rev');kick=.6;vmShot(0,false)}else{if(!throwCoin())w.at=0;else vmShot(0,true)}}
 else if(cur===3){soda(alt);kick=alt?1:.15}
 else if(cur===1){if(!alt){for(let i=0;i<11;i++)hitscan(spread(aim,.075),.55,false,'shot',0xffc070,true);sfx('shot');kick=1.2;shake=Math.max(shake,.1);vmShot(1,false);
   if(mp()){const o=camera.position;pushFx(['s',0,r1(o.x),r1(o.y),r1(o.z),r2(aim.x),r2(aim.y),r2(aim.z)])}}
  else{const m=bottleMesh();m.position.copy(muzzle());const v=aim.clone().multiplyScalar(24).add(new V3(0,5,0)).addScaledVector(P.vel,.5);proj.push({m,vel:v,owner:'player',kind:'grenade',t:2.6,r:.3});sfx('throw');kick=.5;vmShot(1,true);
   if(mp())pushFx(['g',0,r1(m.position.x),r1(m.position.y),r1(m.position.z),r1(v.x),r1(v.y),r1(v.z)])}}
 else{if(!alt){const m=rocketMesh();m.position.copy(muzzle());m.lookAt(m.position.clone().add(aim));m.rotateY(Math.PI);const v=aim.clone().multiplyScalar(46);proj.push({m,vel:v,owner:'player',kind:'rocket',t:4,r:.3});sfx('rocket');kick=1.3;vmShot(2,false);
   if(mp())pushFx(['r',0,r1(m.position.x),r1(m.position.y),r1(m.position.z),r1(v.x),r1(v.y),r1(v.z)])}
  else{let n=0;for(const p of proj)if(p.kind==='rocket'&&!p.dead){p.dead=true;explode(p.m.position.clone(),p.boost?7:5,p.boost?7:4.5,p.boost?'mentos':'rocket');n++}if(n){addStyle('ПОДРЫВ В ВОЗДУХЕ',40*n);vmShot(2,true)}else w.at=0}}}
function soda(alt){if(!alt){if(gas<2){fl0();return}gas-=1.8;gasIdle=.45;vmShot(3,false);const o=camera.position,mz=muzzle(),d=spread(aim,.035);spray(mz,d,4);sprayFx-=1;if(sprayFx<=0){sprayFx=3;sfx('spray')}
  ray.set(o,d);ray.far=32;const h=ray.intersectObjects(level,false);const wallD=h.length?h[0].distance:32;if(h.length&&h[0].face&&(soda.pc=(soda.pc||0)+1)%2===0){const n=h[0].face.normal.clone().transformDirection(h[0].object.matrixWorld);if(n.y>.7)addPuddle(h[0].point.x,h[0].point.y,h[0].point.z,.45,7)}
  for(const p of proj)if(p.kind==='rocket'&&!p.dead&&!p.boost){const t=raySphere(o,d,p.m.position,.8);if(t!==null&&t<wallD){p.boost=true;p.m.children[1].material.color.setHex(0xf6eee2);p.m.scale.setScalar(1.5);addStyle('МЕНТОС + КОЛА',40);puff(p.m.position,30,0xf6eee2,6,.6)}}
  for(const c of coins){if(c.dead)continue;const t=raySphere(o,d,c.m.position,.6);if(t!==null&&t<wallD){ricochet(c,1.1,1);addStyle('КОЛА-РИКОШЕТ',30);return}}
  let best=null,bt=1e9;for(const e of enemies){const t=raySphere(o,d,center(e,tmpA),e.r+.15);if(t!==null&&t<wallD&&t<bt){bt=t;best=e}}
  if(mode==='pvp')for(const [peer,r] of remotes)if(r.alive){const t=raySphere(o,d,rc(r,tmpA),.7);if(t!==null&&t<wallD&&t<bt){bt=t;best={peer}}}
  if(best&&!best.peer){if(!(best.wet>0)){addStyle('ЗАЛИТ',10);puff(center(best,tmpA),10,0x6b2a12,4,.4)}best.wet=3;if(!best.remote)best.vel.addScaledVector(d,1.2)}
  if(mp()&&(fire.wfx=(fire.wfx||0)-1)<=0){fire.wfx=2;pushFx(['w',0,r1(mz.x),r1(mz.y),r1(mz.z),r2(d.x),r2(d.y),r2(d.z)])}}
 else{if(gas<35){fl0();return}gas-=35;gasIdle=.6;vmShot(3,true);P.vel.addScaledVector(aim,-13);if(aim.y<-.3)P.vel.y=Math.max(P.vel.y,-aim.y*12+2);P.grounded=false;P.slam=false;P.slide=false;
  const mz=muzzle();for(let i=0;i<4;i++)spray(mz,spread(aim,.25),10);puff(mz,30,0xf6eee2,8,.6);sfx('jet');shake=Math.max(shake,.12);fovKick=8;addStyle('РЕАКТИВНАЯ ГАЗИРОВКА',15);
  if(mp())pushFx(['j',0,r1(mz.x),r1(mz.y),r1(mz.z),r2(aim.x),r2(aim.y),r2(aim.z)])}}
function fl0(){WP[3].t=.25;sfx('throw');vmDry()}
function explode(pos,r,dmg,src){const wets=enemies.filter(e=>!e.dead&&e.wet>0&&center(e,new V3()).distanceTo(pos)<r+3);
 for(const c of coins)if(!c.dead&&c.m.position.distanceTo(pos)<r*.8){setTimeout(()=>{if(!c.dead)ricochet(c,dmg*.5,1)},60)}
 setTimeout(()=>wets.forEach(e=>{if(!e.dead)(src==='rocket'||src==='mentos'?colaGeyser(e):foamBlast(e))}),90);
if(src==='mentos'){puff(pos,80,0x6b2a12,16,1.2,10);puff(pos,40,0xf6eee2,12,1)}blast(pos,r,src==='combo'||src==='mentos'?0xffe066:src==='parry'?0x5fe0c8:0xff8a3d);sfx('boom');puff(pos,50,0xffa040,12,.7,6);puff(pos,25,0x3a2020,6,1.2,-2);
 if(mp())pushFx(['b',0,r1(pos.x),r1(pos.y),r1(pos.z),r1(r)]);
 shake=Math.max(shake,Math.min(.5,.6-camera.position.distanceTo(pos)/40));
 for(const e of enemies){const d=center(e,tmpA).distanceTo(pos)-e.r;if(d<r){const f=1-Math.max(0,d)/r;damage(e,dmg*(.45+.55*f),99,src);
  if(!e.remote){const push=tmpB.subVectors(e.pos,pos).setY(0).normalize().multiplyScalar(12*f);e.vel.add(push);if(e.type!=='drone')e.vel.y+=6*f}}}
 if(mode==='pvp')for(const [peer,rr] of remotes)if(rr.alive){const c=rc(rr,tmpA),d=c.distanceTo(pos)-.5;if(d<r){const f=1-Math.max(0,d)/r;const k=tmpB.subVectors(c,pos).normalize().multiplyScalar(22*f);k.y+=9*f;queueDmg(peer,dmg*PVPM*(.45+.55*f),src,k);hitMark()}}
 for(const p of proj)if(p.owner==='enemy'&&p.m.position.distanceTo(pos)<r){p.dead=true;if(p.netId&&mode==='coop'&&!isHost)queueDmg('p'+p.netId,1,'x')}
 const pc=tmpA.set(P.pos.x,P.pos.y+.9,P.pos.z),d=pc.distanceTo(pos);
 if(P.alive&&d<r*1.15&&src!=='parry'){const f=1-d/(r*1.15),dir=tmpB.subVectors(pc,pos).normalize();P.vel.addScaledVector(dir,22*f);P.vel.y+=9*f;P.grounded=false;
  if(src!=='combo'||d<2.5){const self=Math.round(9*f);if(self>0){P.hp-=self;$('vig').style.opacity=.5;if(P.hp<=0){lastAtk=myPeer;lastAtkT=T;die()}}}
  if(f>.35)setTimeout(()=>{if(!P.grounded)addStyle('РАКЕТНЫЙ ПРЫЖОК',45)},150)}}
function punch(){if(punchCd>0||!P.alive)return;punchCd=.45;punchT=.28;punchCount++;heroPunch(selfHero);camera.getWorldDirection(aim);const o=camera.position;let did=false;
 for(const c of coins){if(c.dead)continue;const to=tmpA.subVectors(c.m.position,o),L=to.length();if(L<8&&to.normalize().dot(aim)>.3){punchCoin(c);did=true}}
 for(const p of proj){if(p.dead)continue;const to=tmpA.subVectors(p.m.position,o),L=to.length();if(L>4.5||to.normalize().dot(aim)<.45)continue;
  if(p.kind==='dcorpse'){if(p.owner==='enemy'){if(p.netId&&mode==='coop'&&!isHost)queueDmg('p'+p.netId,1,'x');p.owner='player';p.vel.copy(aim).multiplyScalar(38);p.t=4;p.dmg2=true;heal(20);addStyle('ВОЗВРАТ ДРОНА',100);parryOk();did=true}continue}
  if(p.owner==='enemy'){if(p.netId&&mode==='coop'&&!isHost)queueDmg('p'+p.netId,1,'x');p.owner='player';p.kind='parried';p.dmg=14;p.vel.copy(aim).multiplyScalar(55);p.t=4;p.m.material.color.setHex(0xf2b84b);p.m.position.copy(o).addScaledVector(aim,1.2);
   heal(40);addStyle('ПАРИРОВАНИЕ',120);parryOk();did=true}
  else if(p.kind==='grenade'){p.vel.copy(aim).multiplyScalar(42);addStyle('ПОДАЧА',25);did=true}}
 for(const e of enemies){const c=center(e,tmpA),to=tmpB.subVectors(c,o),L=to.length()-e.r;
  if(e.type==='boss'&&e.dashT>0&&!e.remote&&L<4.5&&tmpC.copy(to).normalize().dot(aim)>.15){e.dashT=0;e.stagger=2;e.vel.copy(aim).multiplyScalar(14).setY(3);damage(e,10,1,'parry');heal(40);addStyle('ПАРИРОВАНИЕ ДИРЕКТОРА',220);parryOk();did=true;continue}
  if(e.type==='vend'&&e.leaping&&!e.remote&&L<3.6&&to.normalize().dot(aim)>.2){e.leaping=false;e.stun=1.6;e.vel.copy(aim).multiplyScalar(18).setY(6);damage(e,3.2,1,'punch');heal(30);addStyle('ПАРИРОВАНИЕ ТАРАНА',140);parryOk();did=true;continue}
  if(L<2.4&&to.normalize().dot(aim)>.4){damage(e,1.6,1,'punch');if(!e.remote&&!(e.dashT>0)&&!(e.dashW>0))e.vel.addScaledVector(aim,14);did=true}}
 if(mode==='pvp')for(const [peer,r] of remotes)if(r.alive){const to=tmpB.subVectors(rc(r,tmpA),o),L=to.length();if(L<2.6&&to.normalize().dot(aim)>.4){queueDmg(peer,22,'punch',aim.clone().multiplyScalar(16).setY(5));hitMark();did=true}}
 if(!did)sfx('throw')}
function updProj(dt){const pc=new V3(P.pos.x,P.pos.y+1,P.pos.z);
 for(const p of proj){if(p.dead)continue;p.t-=dt;const pos=p.m.position;
  if(p.kind==='grenade'||p.kind==='ghostg'){p.vel.y-=22*dt;p.m.rotation.x+=dt*8}
  if(p.kind==='ghostc'){p.vel.y-=20*dt;p.m.rotation.x+=dt*16}
  if(p.kind==='dcorpse'){p.m.rotation.x+=dt*p.spin;p.m.rotation.z+=dt*p.spin*.7;puff(pos,1,0x444444,1.5,.6,-2);
   if(p.owner==='enemy'){const to=tmpA.set(P.pos.x,P.pos.y+1,P.pos.z).sub(pos);p.vel.lerp(to.normalize().multiplyScalar(14),Math.min(1,dt*1.6))}else p.vel.y-=6*dt;
   pos.addScaledVector(p.vel,dt);
   if(p.owner==='enemy'&&P.alive&&pos.distanceTo(pc)<p.r+.6){p.dead=true;scene.remove(p.m);enemyBlast(pos.clone());continue}
   if(p.owner==='player'){let hit=null;for(const e of enemies)if(!e.dead&&center(e,tmpA).distanceTo(pos)<e.r+p.r){hit=e;break}if(hit){p.dead=true;scene.remove(p.m);explode(pos.clone(),4.5,11,'drone');continue}}
   if(inBox(pos)||pos.y<.3||p.t<=0){p.dead=true;scene.remove(p.m);if(p.owner==='player')explode(pos.clone(),4.5,11,'drone');else enemyBlast(pos.clone())}continue}
  pos.addScaledVector(p.vel,dt);
  if(p.kind==='rocket'&&!p.redir)for(const c of coins){if(c.dead||c.m.position.distanceTo(pos)>1.1)continue;c.dead=true;scene.remove(c.m);puff(c.m.position,20,0xf2b84b,7,.5);sfx('ding');
   let tg2=null,bd=60;for(const e of enemies){if(e.dead)continue;const d=center(e,tmpA).distanceTo(pos);if(d<bd&&los(pos,center(e,new V3()))){bd=d;tg2=e}}
   if(tg2){p.vel.copy(center(tg2,new V3()).sub(pos).normalize().multiplyScalar(60));p.redir=true;p.m.lookAt(pos.clone().add(p.vel));p.m.rotateY(Math.PI);addStyle('РАКЕТНЫЙ РИКОШЕТ',80)}break}
  if(p.kind==='rocket'||p.kind==='ghost')puff(pos,2,0xffe0b0,1.5,.35,-1);
  if(p.owner==='ghost'){if(inBox(pos)||pos.y<0||p.t<=0)p.dead=true;continue}
  if(p.owner==='enemy'){if(P.alive&&pos.distanceTo(pc)<p.r+.55){if(P.iT<=0)hurt(p.dmg);else addStyle('УВОРОТ',20);p.dead=true;continue}}
  else{let hit=null;for(const e of enemies)if(center(e,tmpA).distanceTo(pos)<e.r+p.r+.1){hit=e;break}
   if(!hit&&mode==='pvp')for(const r of remotes.values())if(r.alive&&rc(r,tmpA).distanceTo(pos)<.7+p.r){hit=r;break}
   if(hit){p.dead=true;if(p.kind==='rocket')explode(pos.clone(),p.boost?7:4.8,p.boost?7:4.5,p.boost?'mentos':'rocket');else if(p.kind==='grenade')explode(pos.clone(),5.5,5,'grenade');else{if(hit.type)damage(hit,p.dmg,99,'parry');explode(pos.clone(),3.5,6,'parry')}continue}}
  if(inBox(pos)||pos.y<0||p.t<=0){p.dead=true;if(p.owner==='player'){if(p.kind==='rocket')explode(pos.clone(),p.boost?7:4.8,p.boost?7:4.5,p.boost?'mentos':'rocket');else if(p.kind==='grenade')explode(pos.clone(),5.5,5,'grenade');else explode(pos.clone(),3.5,6,'parry')}else puff(pos,8,p.m.material.color.getHex(),4,.4)}}
 proj=proj.filter(p=>{if(p.dead)scene.remove(p.m);return!p.dead});
 for(const o of orbs){o.t-=dt;const to=tmpA.subVectors(pc,o.m.position),L=to.length();
  if(L<9&&P.alive){o.vel.lerp(to.normalize().multiplyScalar(18),Math.min(1,dt*6))}else{o.vel.y-=14*dt;o.vel.x*=.98;o.vel.z*=.98}
  o.m.position.addScaledVector(o.vel,dt);if(o.m.position.y<.2){o.m.position.y=.2;o.vel.y=Math.abs(o.vel.y)*.3}
  if(L<1.1&&P.alive){o.t=0;heal(12);sfx('heal')}}
 orbs=orbs.filter(o=>{if(o.t<=0)scene.remove(o.m);return o.t>0})}

/* ================= player ================= */
const k=c=>!!keys[c];
function wishDir(){const fwd=new V3(-Math.sin(P.yaw),0,-Math.cos(P.yaw)),right=new V3(Math.cos(P.yaw),0,-Math.sin(P.yaw)),w=new V3();
 if(k('KeyW'))w.add(fwd);if(k('KeyS'))w.sub(fwd);if(k('KeyD'))w.add(right);if(k('KeyA'))w.sub(right);if(w.lengthSq())w.normalize();return w}
function updPlayer(dt){const wish=wishDir();
 P.stam=Math.min(3,P.stam+dt*.85);P.iT-=dt;P.wallT-=dt;
 if(P.slide&&!k('KeyC'))P.slide=false;
 const hs=Math.hypot(P.vel.x,P.vel.z);
 if(P.dashT>0){P.dashT-=dt;P.vel.x=P.dashDir.x*44;P.vel.z=P.dashDir.z*44;P.vel.y=0;if(P.dashT<=0){P.vel.x=P.dashDir.x*18;P.vel.z=P.dashDir.z*18}}
 else if(P.slam){P.vel.y=-55;P.vel.x*=.9;P.vel.z*=.9}
 else if(P.slide&&P.grounded){P.vel.x=P.slideDir.x*19;P.vel.z=P.slideDir.z*19;if(Math.random()<.5)puff(new V3(P.pos.x,.1,P.pos.z),1,0xffd27a,3,.3)}
 else if(P.grounded){const a=Math.min(1,dt*(hs>14?4:14));P.vel.x+=(wish.x*13-P.vel.x)*a;P.vel.z+=(wish.z*13-P.vel.z)*a}
 else if(wish.lengthSq()){P.vel.x+=wish.x*45*dt;P.vel.z+=wish.z*45*dt;const n=Math.hypot(P.vel.x,P.vel.z),cap=Math.max(13,hs);if(n>cap){P.vel.x*=cap/n;P.vel.z*=cap/n}}
 if(P.dashT<=0&&!P.slam)P.vel.y-=(P.wallT>0&&P.vel.y<0?14:27)*dt;
 const wasAir=!P.grounded,vyBefore=P.vel.y;
 const r=moveBody(P.pos,P.vel,.4,P.slide?.9:1.75,dt,true);P.grounded=r.ground;
 if(r.wall&&!P.grounded){P.wallN.copy(r.wall);P.wallT=.18}
 if(vyBefore<-12)for(const e of enemies){if(e.dead||e.type!=='vend')continue;const d=Math.hypot(e.pos.x-P.pos.x,e.pos.z-P.pos.z),top=e.pos.y+2.5;
  if(d<e.r+.3&&P.pos.y<top+.6&&P.pos.y>top-1.2){damage(e,999,1,'stomp');P.pos.y=Math.max(P.pos.y,top);P.vel.y=13;P.slam=false;P.grounded=false;r.ground=false;shake=Math.max(shake,.3);sfx('slam');ring(e.pos,4,0xc8102e);break}}
 for(const pd of pads)if(Math.hypot(P.pos.x-pd.x,P.pos.z-pd.z)<pd.r&&Math.abs(P.pos.y-pd.y)<.7&&P.vel.y<=.5&&P.dashT<=0){P.vel.set(pd.vx,pd.vy,pd.vz);P.grounded=false;P.slam=false;P.slide=false;r.ground=false;sfx('jet',.7);puff(new V3(pd.x,pd.y+.4,pd.z),30,0xf6eee2,8,.6,4);addStyle('ГЕЙЗЕР',5)}
 if(P.grounded){P.lastG=T;P.wallJ=0;if(wasAir&&vyBefore<-6)vmLand(vyBefore);if(P.slam){P.slam=false;slamLand()}else if(wasAir&&vyBefore<-18)shake=Math.max(shake,.08)}
 if(P.pos.y<-14){const sp=spawns[Math.floor(Math.random()*spawns.length)];P.pos.copy(sp);P.pos.y+=.5;P.vel.set(0,0,0);if(curMap==='plaza'){P.iT=0;banner('УПАЛ С ТЕРРАСЫ');hurt(35)}}
 P.eye+=((P.slide?.75:1.6)-P.eye)*Math.min(1,dt*14)}
function slamLand(){ring(P.pos,6,0xf2b84b);sfx('slam');shake=Math.max(shake,.35);puff(new V3(P.pos.x,.2,P.pos.z),40,0xf2b84b,9,.5);
 if(mp())pushFx(['h',0,r1(P.pos.x),r1(P.pos.y),r1(P.pos.z)]);
 for(const e of enemies){const d=Math.hypot(e.pos.x-P.pos.x,e.pos.z-P.pos.z);if(d<6&&e.type!=='drone'&&Math.abs(e.pos.y-P.pos.y)<2){damage(e,2.2*(1-d/8),1,'slam');if(!e.remote){e.vel.y=e.type==='vend'?10:5;if(e.type==='vend'){e.stun=Math.max(e.stun||0,.9);e.leaping=false;e.lw=0}}}}
 if(mode==='pvp')for(const [peer,r] of remotes)if(r.alive){const d=Math.hypot(r.pos.x-P.pos.x,r.pos.z-P.pos.z);if(d<6&&Math.abs(r.pos.y-P.pos.y)<2){queueDmg(peer,30*(1-d/8),'slam',new V3(0,10,0));hitMark()}}}
function jump(){if(!P.alive)return;if(P.grounded||T-P.lastG<.12){P.vel.y=11;P.grounded=false;P.lastG=-9;if(P.slide){P.slide=false;addStyle('ПРЫЖОК С ПОДКАТА',8)}}
 else if(P.wallT>0&&P.wallJ<3){P.vel.x=P.wallN.x*13+P.vel.x*.3;P.vel.z=P.wallN.z*13+P.vel.z*.3;P.vel.y=10.5;P.wallJ++;P.wallT=0;sfx('dash');addStyle('ОТСКОК',6)}}
function dash(){if(P.stam<1||!P.alive)return;P.stam-=1;const w=wishDir();if(!w.lengthSq())w.set(-Math.sin(P.yaw),0,-Math.cos(P.yaw));P.dashDir.copy(w);
 P.dashT=.16;P.iT=Math.max(P.iT,.22);gas=Math.min(100,gas+12);P.slide=false;P.slam=false;fovKick=10;sfx('dash')}
function slideOrSlam(){if(!P.alive)return;if(P.grounded){if(P.slide)return;P.slide=true;const hs=Math.hypot(P.vel.x,P.vel.z);
 if(hs>3)P.slideDir.set(P.vel.x/hs,0,P.vel.z/hs);else P.slideDir.set(-Math.sin(P.yaw),0,-Math.cos(P.yaw));sfx('dash')}
 else if(P.dashT<=0){P.slam=true;P.slide=false}}
function switchW(i,force){if((i===cur&&!force)||i<0||i>3)return;if(i!==cur)prevW=cur;cur=i;swap=.25;vmDrawStart();guns.forEach((g,j)=>g.visible=j===i);for(let j=0;j<4;j++)$('w'+j).classList.toggle('on',j===i)}

/* ================= waves (solo / coop host) ================= */
function startWave(n){wave=n;toSpawn=[];const pl=mode==='coop'?1+remotes.size:1,s=1+.5*(pl-1);
 const v=Math.round((3+Math.floor(n*1.6))*s),d=Math.round((n>=1?Math.floor(n*.9)+(n>1?1:0):0)*s),g=n>=3?Math.round(Math.floor((n-1)/2)*s):0;
 if(n%5===0){toSpawn=[];for(let i=0;i<Math.round((2+n/5)*s);i++)toSpawn.push('vend');for(let i=0;i<Math.round(2*s);i++)toSpawn.push('drone');toSpawn.push('boss');spawnT=1.2;banner('ВОЛНА '+n+' · СОВЕТ ДИРЕКТОРОВ');$('wave').textContent='ВОЛНА '+n;return}
 for(let i=0;i<v;i++)toSpawn.push('vend');for(let i=0;i<d;i++)toSpawn.push('drone');for(let i=0;i<g;i++)toSpawn.push('golem');toSpawn.sort(()=>Math.random()-.5);if(Math.random()<.1)toSpawn.unshift('banan');
 spawnT=1;banner('ВОЛНА '+n);$('wave').textContent='ВОЛНА '+n}
function updWaves(dt){spawnT-=dt;
 if(toSpawn.length&&enemies.length+telegraphs.length<(mode==='coop'?18:13)&&spawnT<=0){const type=toSpawn.pop();const tp=targets()[0]||{pos:P.pos};const sp=spawns.slice().sort((a,b)=>b.distanceTo(tp.pos)-a.distanceTo(tp.pos))[Math.floor(Math.random()*4)];
  const pos=sp.clone().add(new V3(rnd(-2,2),0,rnd(-2,2)));const m=new THREE.Mesh(new THREE.CylinderGeometry(1.2,1.2,14,16,1,true),new THREE.MeshBasicMaterial({color:0xff2a3a,transparent:true,opacity:.35,side:THREE.DoubleSide,depthWrite:false}));
  m.position.set(pos.x,7,pos.z);scene.add(m);telegraphs.push({m,pos,type,t:.8});spawnT=.55}
 for(const t of telegraphs){t.t-=dt;t.m.scale.x=t.m.scale.z=.3+t.t;if(t.t<=0){scene.remove(t.m);spawnEnemy(t.type,t.pos)}}
 telegraphs=telegraphs.filter(t=>t.t>0);
 const left=toSpawn.length+telegraphs.length+enemies.length;$('wave').textContent='ВОЛНА '+wave;$('left').textContent='врагов: '+left+(mode==='coop'?' · хост: ты':'');
 if(!left){waveT+=dt;if(waveT>.01&&waveT-dt<=.01){banner('ВОЛНА ЗАЧИЩЕНА');heal(30);addStyle('ЗАЧИСТКА',50)}if(waveT>3){waveT=0;startWave(wave+1)}}}

/* ================= flow ================= */
function clearWorld(){clearCola();enemies.forEach(e=>{if(e.puddle)scene.remove(e.puddle)});enemies.forEach(e=>scene.remove(e.g));proj.forEach(p=>scene.remove(p.m));orbs.forEach(o=>scene.remove(o.m));telegraphs.forEach(t=>scene.remove(t.m));coins.forEach(c=>scene.remove(c.m));coins=[];peels.forEach(p=>scene.remove(p.m));peels=[];enemies=[];proj=[];orbs=[];telegraphs=[];toSpawn=[]}
function placePlayer(){const s=mode==='solo'?(curMap==='plaza'?new V3(0,.1,20):new V3(0,1.3,10)):farSpawn().clone();P.pos.copy(s);P.pos.y=Math.max(P.pos.y,.05);P.vel.set(0,0,0);P.yaw=Math.atan2(P.pos.x,P.pos.z);P.pitch=0}
function reset(){clearWorld();Object.assign(P,{hp:100,stam:3,slide:false,slam:false,dashT:0,iT:mode==='solo'?0:1.5,eye:1.6,alive:true,respT:0});placePlayer();
 score=0;kills=0;deaths=0;styleV=0;feed=[];waveT=0;T=0;kb=null;dl.length=0;fxOut.length=0;pending.clear();killedIds.clear();isHost=true;hostPeer=null;
 WP.forEach(w=>w.t=w.at=0);gas=100;coinCh=4;switchW(0,true);$('respawn').textContent='';$('scl').textContent=mode==='pvp'?'Фраги':'Счёт';
 if(mode==='pvp'){wave=0;$('wave').textContent='PvP · '+(mapId==='plaza'?'Площадь':'Завод')+' · «'+code+'»';$('left').textContent=''}else startWave(1)}
function lock(){try{const r=wrap.requestPointerLock&&wrap.requestPointerLock();if(r&&r.catch)r.catch(()=>{noLock=true})}catch(e){noLock=true}}
async function begin(m){initAudio();if(ac&&ac.state==='suspended')ac.resume();menuMusic(false);nick=cleanNick($('nick').value);code=cleanCode($('code').value);$('nick').value=nick;$('code').value=code;save('ug-nick',nick);save('ug-code',code);
 if(m)mode=m;loadMap(mapId);leaveNet();if(mode!=='solo'){const ok=await joinNet();if(!ok)mode='solo'}
 reset();state='play';VM.first=true;deadCam.on=false;camera.fov=90;camera.updateProjectionMatrix();['menu','dead','pause'].forEach(i=>$(i).hidden=true);lobbyPresence();lock()}
function pause(){if(state!=='play')return;state='pause';$('pause').hidden=false;setTimeout(()=>{try{$('resume').focus({preventScroll:true})}catch(e){}},40);fireHeld=altHeld=false;$('pauseNote').textContent=mp()?'Игра по сети продолжается — другие игроки тебя видят.':''}
function resume(){if(state!=='pause')return;state='play';$('pause').hidden=true;lock()}
function toMenu(){save('ug-sp',Math.round(bank));setTimeout(buildHeroUI,0);if(net){try{net.presence({pl:0,al:0}).catch(()=>{})}catch(e){}}leaveNet();clearWorld();state='menu';mode='solo';['pause','dead'].forEach(i=>$(i).hidden=true);$('menu').hidden=false;mmView('main');mmSel(MM.sel,false);musicCheck();guns.forEach(g=>g.visible=false);try{document.exitPointerLock()}catch(e){}lobbyPresence()}
function die(){if(!(state==='play'||(state==='pause'&&mp()))||!P.alive)return;P.hp=0;
 if(mode==='solo'){state='dead';fireHeld=altHeld=false;try{document.exitPointerLock()}catch(e){}
  const nb=score>best;if(nb){best=score;save('ug-best',best)}showBest();
  $('deadInfo').textContent='Волна '+wave+' · убийств: '+kills;$('deadScore').textContent=score;$('deadBest').textContent=nb?'Новый рекорд!':'Рекорд: '+best;
  setTimeout(()=>{if(state==='dead'){$('dead').hidden=false;try{$('again').focus({preventScroll:true})}catch(e){}}},700);return}
 P.alive=false;deaths++;P.respT=mode==='pvp'?3:5;fireHeld=altHeld=false;puff(new V3(P.pos.x,P.pos.y+1,P.pos.z),80,0x5a1f0e,10,1.2);sfx('kill');
 if(mode==='pvp'){const killer=T-lastAtkT<6&&lastAtk?lastAtk:myPeer;kb=[++seqN,killer];banner(killer===myPeer?'САМОПОДРЫВ':'ТЕБЯ ВЗОРВАЛ '+nameOf(killer))}else banner('ТЫ ВЫДОХСЯ')}
function respawn(){P.alive=true;P.hp=100;P.stam=3;P.iT=1.5;P.slide=P.slam=false;placePlayer();$('respawn').textContent='';lastAtk=null}
function setQuality(q){quality=q;save('ug-q',q);document.querySelectorAll('.qb').forEach(b=>b.classList.toggle('sel',b.dataset.q===q));
 renderer.setPixelRatio(Math.min(devicePixelRatio,Q[q].pr));renderer.shadowMap.enabled=Q[q].shadows;const m=curMap;curMap=null;loadMap(m);
 scene.traverse(o=>{if(o.material){const ms=Array.isArray(o.material)?o.material:[o.material];ms.forEach(x=>x.needsUpdate=true)}});setupPost();resize()}
document.querySelectorAll('.qb').forEach(b=>b.onclick=()=>setQuality(b.dataset.q));document.querySelectorAll('.qb').forEach(b=>b.classList.toggle('sel',b.dataset.q===quality));
$('mapZ').onclick=()=>setMap('zavod');$('mapP').onclick=()=>setMap('plaza');setMap(mapId);
$('again').onclick=()=>begin();$('toMenu').onclick=toMenu;$('resume').onclick=resume;$('quit').onclick=toMenu;
document.addEventListener('pointerlockchange',()=>{locked=document.pointerLockElement===wrap;if(!locked&&state==='play'&&!noLock)pause()});
document.addEventListener('pointerlockerror',()=>{noLock=true});
document.addEventListener('mousemove',e=>{if(!(state==='play'&&(locked||noLock)))return;const s=.0022*sens;P.yaw-=e.movementX*s;P.pitch=THREE.MathUtils.clamp(P.pitch-e.movementY*s,-1.55,1.55)});
wrap.addEventListener('mousedown',e=>{if(state!=='play')return;if(!locked&&!noLock){lock();return}if(e.button===0)fireHeld=true;if(e.button===2)altHeld=true;e.preventDefault()});
addEventListener('mouseup',e=>{if(e.button===0)fireHeld=false;if(e.button===2)altHeld=false});
wrap.addEventListener('contextmenu',e=>e.preventDefault());
wrap.addEventListener('wheel',e=>{if(state!=='play')return;e.preventDefault();switchW((cur+(e.deltaY>0?1:3))%4)},{passive:false});
addEventListener('keydown',e=>{if(state==='menu'&&mmKey(e))return;const tag=(e.target&&e.target.tagName)||'';if(tag==='INPUT')return;if(e.code==='KeyM'){setMute(!muted);return}
 if(state==='play'){if(['Space','KeyW','KeyA','KeyS','KeyD','KeyC','ShiftLeft','ShiftRight','KeyF','KeyQ','Digit1','Digit2','Digit3','Digit4','Tab','KeyV','KeyT'].includes(e.code))e.preventDefault();
  if(e.code==='Tab'){showBoard=true;return}
  if(e.repeat)return;keys[e.code]=true;
  if(e.code==='Space')jump();else if(e.code==='ShiftLeft'||e.code==='ShiftRight')dash();else if(e.code==='KeyC')slideOrSlam();else if(e.code==='KeyF')punch();
  else if(e.code.startsWith('Digit'))switchW(+e.code.slice(5)-1);else if(e.code==='KeyQ')switchW(prevW);else if(e.code==='KeyP')pause();else if(e.code==='KeyV')inspect();else if(e.code==='KeyT'){tpView=!tpView;banner(tpView?'ВИД ОТ ТРЕТЬЕГО ЛИЦА':'ВИД ОТ ПЕРВОГО ЛИЦА')}}
 else if((state==='pause'||state==='dead')&&(e.code==='ArrowUp'||e.code==='ArrowDown')){const bs=[...$(state).querySelectorAll('.psb')],i=bs.indexOf(document.activeElement);(i<0?bs[0]:bs[(i+(e.code==='ArrowDown'?1:bs.length-1))%bs.length]).focus();e.preventDefault()}
 else if(e.code==='Enter'&&state==='dead'&&!(e.target&&e.target.closest&&e.target.closest('button')))begin()});
addEventListener('keyup',e=>{keys[e.code]=false;if(e.code==='Tab')showBoard=false});
addEventListener('blur',()=>{for(const c in keys)keys[c]=false;showBoard=false;pause()});

/* ================= hud & loop ================= */
const stamEls=[...document.querySelectorAll('.stam b')];
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let boardT=0;
function hud(dt){bankTick(dt);{const bs=enemies.find(e=>e.type==='boss'&&!e.dead),bb=$('bossBar');if(!!bs===bb.hidden)bb.hidden=!bs;if(bs){bs.maxHp=Math.max(bs.maxHp||1,bs.hp);$('bossF').style.width=Math.max(0,bs.hp/bs.maxHp*100)+'%';bb.classList.toggle('rage',bs.hp<bs.maxHp*.5)}}$('hpf').style.width=Math.max(0,P.hp)+'%';$('hpt').textContent=Math.max(0,Math.ceil(P.hp));$('sc').textContent=mode==='pvp'?kills:score;
 stamEls.forEach((b,i)=>{b.style.transform='scaleX('+THREE.MathUtils.clamp(P.stam-i,0,1)+')';b.style.background=P.stam-i>=1?'#8fd0f5':'#4f7f99'});
 const r=rank(),R=RANKS[r];$('rank').textContent=R[0];$('rank').style.color=R[2];$('rankName').textContent=R[1];$('rankName').style.color=R[2];
 $('gasf').style.width=gas+'%';$('coinsH').textContent='●'.repeat(coinCh)+'○'.repeat(4-coinCh);$('gasf').style.background=gas<35?'#6b3a2a':'#c0662d';$('sbf').style.width=(r===6?Math.min(100,(styleV-600)):styleV%100)+'%';$('sbf').style.background=R[2];
 $('feed').innerHTML=feed.map(f=>'<div style="opacity:'+Math.min(1,f.t)+'">'+esc(f.label)+'</div>').join('');
 boardT-=dt;if(boardT>0)return;boardT=.25;
 if(!mp()){$('board').innerHTML='';return}
 const rows=[{n:nick,c:myColor,k:kills,d:deaths,hp:Math.ceil(P.hp),al:P.alive,me:true,sc:score}];for(const rr of remotes.values())rows.push({n:rr.name,c:rr.color,k:rr.k,d:rr.d,hp:rr.hp,al:rr.alive,sc:rr.score});
 if(mode==='pvp'){rows.sort((a,b)=>b.k-a.k||a.d-b.d);$('left').textContent='игроков: '+rows.length}
 if(net&&net.connected&&!net.connected())$('left').textContent='подключение к серверу…'
 const list=(mode==='pvp'&&!showBoard)?rows.slice(0,5):rows;
 $('board').innerHTML=list.map(x=>'<div class="r'+(x.me?' me':'')+(x.al?'':' dead')+'"><span><i style="background:'+esc(x.c)+'"></i>'+esc(x.n)+'</span><span>'+(mode==='pvp'?x.k+' / '+x.d:(x.al?x.hp+' ♥':'ждёт')+(showBoard?' · '+x.sc:''))+'</span></div>').join('')}
function resize(){const w=wrap.clientWidth,h=wrap.clientHeight;renderer.setSize(w,h,false);if(composer)composer.setSize(w,h);camera.aspect=gunCam.aspect=w/h;camera.updateProjectionMatrix();gunCam.updateProjectionMatrix()}
setupPost();const ro=new ResizeObserver(resize);ro.observe(wrap);resize();
let last=performance.now();
function frame(now){requestAnimationFrame(frame);let dt=Math.min(.033,(now-last)/1000);last=now;
 if(freeze>0){freeze-=dt;dt*=.04}
 const live=state==='play'||(state==='pause'&&mp());
 if(live){T+=dt;
  if(P.alive){if(state==='play')updPlayer(dt);else{P.iT-=dt;P.vel.set(0,0,0)}if(state==='play'){if(swap<=0){if(fireHeld)fire(false);if(altHeld)fire(true)}}}
  else if(!P.alive){P.respT-=dt;$('respawn').textContent='Возрождение через '+Math.max(0,Math.ceil(P.respT));if(P.respT<=0)respawn()}
  WP.forEach(w=>{w.t-=dt;w.at-=dt});punchCd-=dt;gasIdle-=dt;if(gasIdle<=0)gas=Math.min(100,gas+28*dt);
  if(mode==='solo'||(mode==='coop'&&isHost)){updEnemies(dt);updWaves(dt)}else if(mode==='coop')clientEnemyAnim(dt);
  updProj(dt);updCoins(dt);updPeels(dt);updCola(dt);flushDmg();netFrame(dt);
  styleV=Math.max(0,styleV-dt*(7+rank()*8));feed.forEach(f=>f.t-=dt);feed=feed.filter(f=>f.t>0);
  pflashV=Math.max(0,pflashV-dt*4);$('pflash').style.opacity=pflashV;const v=$('vig');v.style.opacity=Math.max(0,(+v.style.opacity||0)-dt*2.5);hud(dt)}
 updFx(dt);for(const f of mapAnims)f(dt);
 let tpOn=false,eyeSave=null;selfHero.root.visible=false;const inMenu=state==='menu';hudShow(!inMenu);
 {const want=inMenu?menuScene:scene;if(selfHero.root.parent!==want){want.add(selfHero.root);setHeroLayer(selfHero,inMenu?0:1)}}
 if(postMenu!==inMenu){postMenu=inMenu;if(gradePass){const u=gradePass.uniforms;u.warm.value.set(...(inMenu?[.95,1,1.06]:[1.03,1,.97]));u.sat.value=inMenu?1.12:1.28;u.vig.value=inMenu?.4:.32}if(bloomPass){bloomPass.strength=inMenu?.55:.42;bloomPass.threshold=inMenu?.88:.93;bloomPass.radius=inMenu?.5:.4}}
 if(inMenu){menuStage(now,dt);guns.forEach(g=>g.visible=false);fist.visible=false;camera.layers.enable(1)}
 else if(!P.alive||state==='dead'){guns.forEach(g=>g.visible=false);fist.visible=false;camera.layers.enable(1);
  selfHero.root.visible=true;selfHero.root.position.copy(P.pos);selfHero.root.rotation.y=P.yaw;animHero(selfHero,selfState(),dt);
  if(!deadCam.on){deadCam.on=true;deadCam.t=0;deadCam.from.copy(camera.position)}deadCam.t+=dt;
  const a=P.yaw+2.3+deadCam.t*.12,k=Math.min(1,deadCam.t/.9),ke=k*k*(3-2*k),piv=tmpV0.set(P.pos.x,P.pos.y+1.1,P.pos.z);
  const to=camClamp(piv,new V3(P.pos.x+Math.sin(a)*4.4,P.pos.y+2.6,P.pos.z+Math.cos(a)*4.4));camera.position.copy(deadCam.from).lerp(to,ke);camera.lookAt(P.pos.x,P.pos.y+.6,P.pos.z);
  if(camera.fov!==80){camera.fov=80;camera.updateProjectionMatrix()}}
 else{deadCam.on=false;const sh=shake;shake=Math.max(0,shake-dt*1.6);camera.position.set(P.pos.x+rnd(-sh,sh)*.6,P.pos.y+P.eye+rnd(-sh,sh)*.6,P.pos.z);camera.rotation.set(P.pitch,P.yaw,P.slide?.05:0);
  fovKick=Math.max(0,fovKick-dt*40);const tf=90+fovKick+(P.slide?6:0);if(Math.abs(camera.fov-tf)>.1){camera.fov+=(tf-camera.fov)*Math.min(1,dt*12);camera.updateProjectionMatrix()}
  kick=Math.max(0,kick-dt*6);swap=Math.max(0,swap-dt);
  selfHero.root.visible=true;selfHero.root.position.copy(P.pos);selfHero.root.rotation.y=P.yaw;animHero(selfHero,selfState(),dt);
  guns.forEach((g,j)=>g.visible=j===cur);vmUpdate(dt);
  punchT=Math.max(0,punchT-dt);fist.visible=punchT>0;if(punchT>0){const k=1-punchT/.28,ext=Math.sin(Math.min(1,k*1.6)*Math.PI);poseFist(Math.min(1,.25+k*4));fist.position.set(-.34+ext*.16,-.33+ext*.08,-.5-ext*.26);fist.rotation.set(.28+ext*.08,-.62+ext*.42,1.15+ext*.15)}
  if(tpView){tpOn=true;eyeSave=camera.position.clone();camera.layers.enable(1);const cp=Math.cos(P.pitch),f=tmpA.set(-Math.sin(P.yaw)*cp,Math.sin(P.pitch),-Math.cos(P.yaw)*cp),rt=tmpB.set(Math.cos(P.yaw),0,-Math.sin(P.yaw));
   const piv=eyeSave.clone().addScaledVector(rt,.62).add(new V3(0,.18,0));camClamp(eyeSave,piv);camera.position.copy(camClamp(piv,piv.clone().addScaledVector(f,-2.35)))}
  else camera.layers.disable(1)}
 renderer.clear();const rs=inMenu?menuScene:scene;if(renderPass)renderPass.scene=rs;if(composer)composer.render();else renderer.render(rs,camera);renderer.clearDepth();if(state!=='menu'&&P.alive&&state!=='dead'&&!tpOn)renderer.render(gunScene,gunCam);
 if(eyeSave)camera.position.copy(eyeSave)}
function selfState(){return{vx:P.vel.x,vz:P.vel.z,vy:P.vel.y,yaw:P.yaw,air:!P.grounded,slide:P.slide,dash:P.dashT>0,slam:P.slam,pitch:P.pitch,hp:state==='dead'?0:P.hp,alive:P.alive&&state!=='dead',w:cur}}
function camClamp(from,to){const d=tmpB.copy(to).sub(from),L=d.length();if(L<1e-3)return to;d.divideScalar(L);ray.set(from,d);ray.far=L+.3;const h=ray.intersectObjects(level,false);if(h.length)to.copy(from).addScaledVector(d,Math.max(.25,h[0].distance-.3));return to}
const deadCam={on:false,t:0,from:new V3()};let tpView=false;
/* ---- главное меню: витрина героя ---- */
const hudEl=document.querySelector('.hud');function hudShow(on){if(hudEl.dataset.on!==String(on)){hudEl.dataset.on=on;hudEl.style.visibility=on?'':'hidden'}}
const SHOW={spot:new V3(),a:0,map:null,drag:0,anim:'demo',seq:0,t:0,w:0,shots:0};
const DEMO=[['idle',2.4],['fire',2.6],['run',2.6],['jump',1.4],['slide',1.8],['punch',1.6],['dash',1.8],['slam',1.5],['fire',2.2],['death',3.4]];
const ANIMS=[['demo','Демо'],['idle','Стойка'],['run','Бег'],['jump','Прыжок'],['slide','Подкат'],['dash','Рывок'],['slam','Удар с неба'],['punch','Удар'],['fire','Стрельба'],['death','Падение']];
function buildHeroUI(){const sw=$('sw');sw.innerHTML='';COLORS.forEach(c=>{const b=document.createElement('button');b.style.background=c;b.setAttribute('role','radio');b.setAttribute('aria-label','Цвет '+c);b.setAttribute('aria-checked',c===myColor);if(c===myColor)b.classList.add('sel');
  b.onclick=()=>{myColor=c;save('ug-color',c);rebuildSelf();buildHeroUI();mmMe();lobbyPresence()};sw.appendChild(b)});
 const ab=$('anB');ab.innerHTML='';ANIMS.forEach(([id,lab])=>{const b=document.createElement('button');b.textContent=lab;b.setAttribute('role','radio');b.setAttribute('aria-checked',id===SHOW.anim);if(id===SHOW.anim)b.classList.add('sel');
  b.onclick=()=>{SHOW.anim=id;SHOW.t=0;SHOW.seq=0;buildHeroUI()};ab.appendChild(b)});
 const cm=$('cosm');cm.innerHTML='';const sp=document.createElement('div');sp.className='sp';sp.innerHTML='Очки стиля: <b>'+Math.floor(bank).toLocaleString('ru')+'</b> — копятся в любом режиме и открывают новые детали';cm.appendChild(sp);
 for(const k in COS){const row=document.createElement('div');row.className='crow';row.setAttribute('role','radiogroup');row.setAttribute('aria-label',COS_N[k]);row.innerHTML='<span>'+COS_N[k]+'</span>';
  COS[k].forEach(([,nm,cost],i)=>{const b=document.createElement('button'),ok=bank>=cost;b.textContent=ok?nm:'🔒 '+cost.toLocaleString('ru');b.title=nm+(ok?'':' — нужно '+cost.toLocaleString('ru')+' очков стиля');b.disabled=!ok;
   b.setAttribute('role','radio');b.setAttribute('aria-checked',myCos[k]===i);if(myCos[k]===i)b.classList.add('sel');
   b.onclick=()=>{myCos[k]=i;save('ug-cos',JSON.stringify(myCos));rebuildSelf();buildHeroUI();lobbyPresence()};row.appendChild(b)});cm.appendChild(row)}}
buildHeroUI();
/* ================= сцена главного меню: зеркальное море колы под луной-крышкой ================= */
const menuScene=new THREE.Scene();menuScene.fog=new THREE.FogExp2(0x071436,.016);
const STG={t:0};
// небо: ночной градиент, дымка у горизонта, мерцающие звёзды
const skyStage=new THREE.Mesh(new THREE.SphereGeometry(240,40,20),new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,fog:false,uniforms:{uT:{value:0}},
 vertexShader:`varying vec3 vP;void main(){vP=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
 fragmentShader:`uniform float uT;varying vec3 vP;float h(vec3 p){return fract(sin(dot(p,vec3(12.9898,78.233,37.719)))*43758.5453);}
 void main(){vec3 d=normalize(vP);float y=d.y;vec3 top=vec3(.01,.018,.06),mid=vec3(.028,.075,.23),hor=vec3(.11,.25,.6);
  vec3 c=mix(hor,mid,smoothstep(0.,.2,y));c=mix(c,top,smoothstep(.2,.8,y));c=mix(c,vec3(.012,.03,.09),smoothstep(0.,-.15,y));
  vec3 g=floor(d*230.);float s=h(g);c+=vec3(.75,.86,1.)*step(.9972,s)*(.55+.45*sin(uT*2.3+s*60.))*smoothstep(.06,.45,y);
  gl_FragColor=vec4(c,1.);}`}));
menuScene.add(skyStage);
// луна-крышка: светящийся диск, перед ним тёмная кронен-крышка — затмение с зубчатой короной
const MOON_POS=new V3(5,12.6,-64);
const moonG=new THREE.Group();moonG.position.copy(MOON_POS);moonG.lookAt(0,1.5,4);moonG.scale.setScalar(.86);menuScene.add(moonG);
const glowTex=(stops)=>{const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d'),r=g.createRadialGradient(128,128,0,128,128,128);stops.forEach(([o,s])=>r.addColorStop(o,s));g.fillStyle=r;g.fillRect(0,0,256,256);const t=new THREE.CanvasTexture(c);t.minFilter=THREE.LinearFilter;return t};
const moonHalo=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex([[0,'rgba(255,244,214,1)'],[.28,'rgba(255,236,200,.9)'],[.36,'rgba(190,220,255,.42)'],[.6,'rgba(90,150,255,.12)'],[1,'rgba(40,80,200,0)']]),blending:THREE.AdditiveBlending,depthWrite:false,fog:false}));
moonHalo.scale.setScalar(50);moonHalo.position.z=-5;moonG.add(moonHalo);
const crimpGeo=(R,n,d)=>{const sh=new THREE.Shape(),N=n*14;for(let i=0;i<N;i++){const a=i/N*Math.PI*2,r=R*(1+d*(.5+.5*Math.cos(a*n)));i?sh.lineTo(Math.cos(a)*r,Math.sin(a)*r):sh.moveTo(Math.cos(a)*r,Math.sin(a)*r)}return new THREE.ShapeGeometry(sh,1)};
const moonCap=new THREE.Group();moonG.add(moonCap);
moonCap.add(new THREE.Mesh(crimpGeo(7.4,21,.07),new THREE.MeshBasicMaterial({color:0xfff2d4,fog:false})));
for(const [r0,r1,c,z] of [[6.05,6.35,0xf3dcae,.02],[5.2,5.32,0xffc2b0,.03],[2.3,2.45,0xf3dcae,.03]]){const m=new THREE.Mesh(new THREE.RingGeometry(r0,r1,90),new THREE.MeshBasicMaterial({color:c,fog:false}));m.position.z=z;moonCap.add(m)}
// облака проплывают мимо луны
const cloudTex=(()=>{const c=document.createElement('canvas');c.width=512;c.height=128;const g=c.getContext('2d');for(let i=0;i<46;i++){const x=40+Math.random()*432,y=64+(Math.random()-.5)*36,r=18+Math.random()*34,gr=g.createRadialGradient(x,y,0,x,y,r);
 gr.addColorStop(0,'rgba(20,40,96,.55)');gr.addColorStop(1,'rgba(20,40,96,0)');g.fillStyle=gr;g.fillRect(x-r,y-r,r*2,r*2)}const t=new THREE.CanvasTexture(c);t.minFilter=THREE.LinearFilter;return t})();
const clouds=[[-40,24,-55,46,.8],[10,13,-50,60,.55],[-70,30,-70,70,.5]].map(([x,y,z,w,o])=>{const s=new THREE.Sprite(new THREE.SpriteMaterial({map:cloudTex,transparent:true,opacity:o,depthWrite:false,fog:false}));s.position.set(x,y,z);s.scale.set(w,w/4,1);menuScene.add(s);return{s,x0:x,sp:.6+Math.random()*.6}});
// силуэт завода на горизонте с мигающими огнями на трубах
const skyline=new THREE.Group();menuScene.add(skyline);const slM=new THREE.MeshBasicMaterial({color:0x030614,fog:false});const blinks=[];
for(let i=0;i<34;i++){const w=5+Math.random()*10,h=3+Math.random()*9,x=-200+i*12+Math.random()*5,z=-160-Math.random()*25;const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,6),slM);b.position.set(x,h/2-.5,z);skyline.add(b);
 if(Math.random()<.45){const ch=new THREE.Mesh(new THREE.CylinderGeometry(1.1,1.6,h+8+Math.random()*12,8),slM);ch.position.set(x+w*.3,(h+10)/2,z+1);skyline.add(ch);
  const l=new THREE.Mesh(new THREE.SphereGeometry(.45,8,6),new THREE.MeshBasicMaterial({color:0xff2d4d,fog:false}));l.position.set(x+w*.3,ch.geometry.parameters.height+.5,z+1);skyline.add(l);blinks.push({l,ph:Math.random()*6})}}
// море колы: отражение с рябью (Reflector), запасной вариант — глянцевая плоскость
let sea=null;
if(THREE.Reflector){const SeaShader={uniforms:{color:{value:null},tDiffuse:{value:null},textureMatrix:{value:null},uT:{value:0}},
 vertexShader:`uniform mat4 textureMatrix;varying vec4 vUv;varying vec3 vW;void main(){vUv=textureMatrix*vec4(position,1.);vW=(modelMatrix*vec4(position,1.)).xyz;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
 fragmentShader:`uniform vec3 color;uniform sampler2D tDiffuse;uniform float uT;varying vec4 vUv;varying vec3 vW;
 void main(){vec2 p=vW.xz;float rr=length(p);
  vec2 dd=vec2(sin(p.x*1.3+uT*1.1)+sin(p.y*2.2-uT*1.4)+.6*sin(rr*3.-uT*2.6),cos(p.y*1.6+uT*.9)+sin((p.x-p.y)*1.2+uT*1.2)+.6*cos(rr*3.-uT*2.6))*.0075;
  vec4 uv=vUv;uv.xy+=dd*uv.w;vec3 r=texture2DProj(tDiffuse,uv).rgb;
  vec3 V=normalize(cameraPosition-vW);float fr=.3+.7*pow(1.-max(V.y,0.),3.);
  vec3 deep=vec3(.028,.012,.012)+vec3(.0,.012,.035);
  vec3 c=mix(deep,r*color,fr);
  float spk=pow(max(0.,sin(p.x*3.1+uT*1.7)*sin(p.y*2.7-uT*1.3)),12.)*.25;c+=vec3(.5,.7,1.)*spk*(1.-smoothstep(4.,30.,rr));
  c=mix(c,vec3(.027,.075,.2),smoothstep(30.,150.,length(vW.xz-cameraPosition.xz)));
  gl_FragColor=vec4(c,1.);}`};
 sea=new THREE.Reflector(new THREE.PlaneGeometry(500,500),{shader:SeaShader,textureWidth:1024,textureHeight:1024,color:0xc0d0ff,clipBias:.002});sea.rotation.x=-Math.PI/2;menuScene.add(sea)}
else{sea=new THREE.Mesh(new THREE.PlaneGeometry(500,500),new THREE.MeshStandardMaterial({color:0x08060c,metalness:.7,roughness:.12,envMap:ENV}));sea.rotation.x=-Math.PI/2;menuScene.add(sea)}
// круги на воде у ног героя
const ripG=new THREE.RingGeometry(.94,1,64).rotateX(-Math.PI/2);
const ripples=[0,1,2].map(()=>{const m=new THREE.Mesh(ripG,new THREE.MeshBasicMaterial({color:0x9fdcff,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,fog:false}));m.position.y=.012;menuScene.add(m);return m});
// пузырьки газировки поднимаются из моря
const BBN=300,bbG=new THREE.BufferGeometry(),bbP=new Float32Array(BBN*3),bbS=new Float32Array(BBN);
for(let i=0;i<BBN;i++){bbP[i*3]=rnd(-16,16);bbP[i*3+1]=rnd(0,13);bbP[i*3+2]=rnd(-42,5);bbS[i]=rnd(.25,1)}
bbG.setAttribute('position',new THREE.BufferAttribute(bbP,3));
const bubbles=new THREE.Points(bbG,new THREE.PointsMaterial({map:BUB_T,size:.2,sizeAttenuation:true,transparent:true,opacity:.75,depthWrite:false,blending:THREE.AdditiveBlending,color:0xa8e4ff}));bubbles.frustumCulled=false;menuScene.add(bubbles);
// бутылки дрейфуют по морю
const botGeo=new THREE.LatheGeometry([[0,0],[.3,0],[.34,.08],[.36,.55],[.29,.85],[.35,1.15],[.33,1.4],[.15,1.9],[.11,2.3],[.125,2.36],[0,2.38]].map(([x,y])=>new THREE.Vector2(x,y)),22);
const botMat=new THREE.MeshStandardMaterial({color:0x1d0b05,metalness:.35,roughness:.07,envMap:ENV,envMapIntensity:1.7});
const capMat=new THREE.MeshStandardMaterial({color:0xc8102e,metalness:.6,roughness:.3,envMap:ENV});
const floaters=[[-9,-10,.8,.9],[8,-16,1.1,-.7],[-15,-30,1.4,.4],[15,-12,.75,2.1],[4,-40,1.6,-1.2],[-24,-20,1.2,.2],[22,-32,1.5,1.4]].map(([x,z,s,r])=>{const g=new THREE.Group(),m=new THREE.Mesh(botGeo,botMat),c=new THREE.Mesh(crownGeo(.13,13),capMat);c.position.y=2.4;g.add(m,c);g.position.set(x,0,z);g.scale.setScalar(s);g.rotation.set(.55+Math.random()*.35,r,0);menuScene.add(g);return{g,ph:Math.random()*6,s}});
// свет: лунный контровой, холодный ключевой, красный и циановый акценты
menuScene.add(new THREE.HemisphereLight(0x3a62d8,0x04060c,.6));
const stMoon=new THREE.DirectionalLight(0xbfd8ff,1.7);stMoon.position.copy(MOON_POS);menuScene.add(stMoon);
const stKey=new THREE.DirectionalLight(0xe2ecff,.95);stKey.position.set(5,6,8);menuScene.add(stKey);
const stRed=new THREE.PointLight(0xff2d4d,1.8,9,2);stRed.position.set(-2.3,.55,1.7);menuScene.add(stRed);
const stCyan=new THREE.PointLight(0x62e3ff,1.3,10,2);stCyan.position.set(2.7,2.5,-1.4);menuScene.add(stCyan);
function stageTick(dt){STG.t+=dt;const t=STG.t;skyStage.material.uniforms.uT.value=t;if(sea&&sea.material.uniforms&&sea.material.uniforms.uT)sea.material.uniforms.uT.value=t;
 moonCap.rotation.z+=dt*.02;moonHalo.material.rotation=Math.sin(t*.1)*.05;
 ripples.forEach((m,i)=>{const ph=(t*.32+i/3)%1;m.scale.setScalar(.35+ph*2.6);m.material.opacity=.32*(1-ph)*Math.min(1,ph*6)});
 for(let i=0;i<BBN;i++){bbP[i*3+1]+=dt*bbS[i]*.9;bbP[i*3]+=Math.sin(t*1.7+i)*dt*.12;if(bbP[i*3+1]>13){bbP[i*3+1]=0;bbP[i*3]=rnd(-16,16);bbP[i*3+2]=rnd(-42,5)}}bbG.attributes.position.needsUpdate=true;
 floaters.forEach(f=>{f.g.position.y=-1.05*f.s+Math.sin(t*.8+f.ph)*.08;f.g.rotation.z=Math.sin(t*.5+f.ph)*.08});
 clouds.forEach(c=>{c.s.position.x+=dt*c.sp;if(c.s.position.x>60)c.s.position.x=-90});
 blinks.forEach(b=>b.l.visible=Math.sin(t*2.2+b.ph)>.2)}
/* ================= ГЛАВНОЕ МЕНЮ: экраны, навигация, звук ================= */
const MM={el:$('menu'),view:'title',page:null,sel:0,items:[...document.querySelectorAll('#mmList .mi')],mode:'solo',mx:0,my:0,musOn:true};
try{const m=localStorage.getItem('ug-mode');if(['solo','coop','pvp'].includes(m))MM.mode=m;MM.musOn=localStorage.getItem('ug-mus')!=='0';muted=localStorage.getItem('ug-mute')==='1'}catch(e){}
function uiSnd(k){if(!ac||muted)return;try{
 if(k==='move')tone(.05,'triangle',1250,1480,.07);
 else if(k==='ok'){tone(.08,'triangle',880,1320,.09);setTimeout(()=>{try{tone(.16,'sine',1760,2350,.07)}catch(e){}},55)}
 else if(k==='back')tone(.12,'triangle',980,520,.08);
 else if(k==='start'){nz(.55,'bandpass',1600,.22,5200);tone(.5,'sine',440,880,.1);tone(.7,'triangle',660,1320,.06)}}catch(e){}}
/* музыка меню: тихие аккорды, бас и «пузырьковые» ноты */
let mus=null;
function menuMusic(on){if(!ac)return;
 if(on&&!mus){const g=ac.createGain(),f=ac.createBiquadFilter(),lfo=ac.createOscillator(),lg=ac.createGain();g.gain.setValueAtTime(0,ac.currentTime);g.gain.linearRampToValueAtTime(.06,ac.currentTime+2.5);
  f.type='lowpass';f.frequency.value=950;f.Q.value=.6;lfo.frequency.value=.06;lg.gain.value=420;lfo.connect(lg);lg.connect(f.frequency);lfo.start();f.connect(g);g.connect(master);
  mus={g,f,lfo,step:0,timer:0};const CH=[[57,60,64,67],[53,57,60,64],[48,52,55,59],[55,59,62,66]],hz=n=>440*Math.pow(2,(n-69)/12);
  const play=()=>{if(!mus||!ac)return;const t=ac.currentTime+.05,ch=CH[mus.step++%4];
   ch.forEach((n,i)=>{const o=ac.createOscillator(),e=ac.createGain();o.type=i%2?'triangle':'sine';o.frequency.value=hz(n)*(1+(i-1.5)*.0025);e.gain.setValueAtTime(0,t);e.gain.linearRampToValueAtTime(.2,t+1.3);e.gain.linearRampToValueAtTime(0,t+4.7);o.connect(e);e.connect(f);o.start(t);o.stop(t+4.8)});
   const b=ac.createOscillator(),be=ac.createGain();b.type='sine';b.frequency.value=hz(ch[0]-12);be.gain.setValueAtTime(0,t);be.gain.linearRampToValueAtTime(.38,t+.5);be.gain.linearRampToValueAtTime(0,t+4.5);b.connect(be);be.connect(f);b.start(t);b.stop(t+4.6);
   for(let k=0;k<6;k++){const tt=t+.3+Math.random()*3.6,o=ac.createOscillator(),e=ac.createGain();o.type='sine';o.frequency.value=hz(ch[k%4]+24);e.gain.setValueAtTime(0,tt);e.gain.linearRampToValueAtTime(.07,tt+.01);e.gain.exponentialRampToValueAtTime(.0005,tt+.7);o.connect(e);e.connect(g);o.start(tt);o.stop(tt+.75)}
   mus.timer=setTimeout(play,4000)};play()}
 else if(!on&&mus){const m=mus;mus=null;clearTimeout(m.timer);try{const t=ac.currentTime;m.g.gain.cancelScheduledValues(t);m.g.gain.setValueAtTime(m.g.gain.value,t);m.g.gain.linearRampToValueAtTime(0,t+.7);setTimeout(()=>{try{m.lfo.stop();m.g.disconnect()}catch(e){}},900)}catch(e){}}}
function musicCheck(){menuMusic(state==='menu'&&MM.musOn&&!muted&&!!ac)}
/* манометр-циферблат на фоне */
(()=>{let s='<g class="r1"><circle cx="100" cy="100" r="97.5" fill="none" stroke="#8fc8ff" stroke-width=".4"/>';
 for(let i=0;i<120;i++){const a=i/120*Math.PI*2,l=i%10===0?9:i%5===0?5:2.5,r=96,w=i%10===0?.8:.35;s+='<line x1="'+(100+Math.cos(a)*r).toFixed(2)+'" y1="'+(100+Math.sin(a)*r).toFixed(2)+'" x2="'+(100+Math.cos(a)*(r-l)).toFixed(2)+'" y2="'+(100+Math.sin(a)*(r-l)).toFixed(2)+'" stroke="#8fc8ff" stroke-width="'+w+'"/>'}
 s+='</g><g class="r2"><circle cx="100" cy="100" r="78" fill="none" stroke="#62e3ff" stroke-width=".35" stroke-dasharray="2 3"/>';
 for(let i=0;i<12;i++){const a=i/12*Math.PI*2-Math.PI/2;s+='<text x="'+(100+Math.cos(a)*70).toFixed(2)+'" y="'+(101.8+Math.sin(a)*70).toFixed(2)+'" fill="#8fc8ff" font-size="5" text-anchor="middle" font-family="Oswald,sans-serif">'+(i*10)+'</text>'}
 s+='<path d="M40 100 a60 60 0 0 1 120 0" fill="none" stroke="#ff2d4d" stroke-width="1.2" stroke-dasharray="34 300"/></g><circle cx="100" cy="100" r="58" fill="none" stroke="#8fc8ff" stroke-width=".25"/>';
 s+='<text x="100" y="128" fill="#8fc8ff" font-size="4" text-anchor="middle" letter-spacing="1.2" font-family="Rubik,sans-serif">ДАВЛЕНИЕ · БАР</text><g class="nd"><line x1="100" y1="100" x2="100" y2="40" stroke="#ff2d4d" stroke-width="1"/><circle cx="100" cy="100" r="3" fill="#ff2d4d"/></g>';
 $('mmGauge').innerHTML=s})();
/* календарь: дата, смена, фаза луны */
const MON=['ЯНВ','ФЕВ','МАР','АПР','МАЙ','ИЮН','ИЮЛ','АВГ','СЕН','ОКТ','НОЯ','ДЕК'],WDN=['ВС','ПН','ВТ','СР','ЧТ','ПТ','СБ'];
function moonPhase(d){return(((d.getTime()/864e5-10962.76)/29.530588853)%1+1)%1}
function phaseName(p){return p<.03||p>.97?'НОВОЛУНИЕ':p<.22?'РАСТУЩИЙ СЕРП':p<.28?'ПЕРВАЯ ЧЕТВЕРТЬ':p<.47?'РАСТУЩАЯ ЛУНА':p<.53?'ПОЛНОЛУНИЕ':p<.72?'УБЫВАЮЩАЯ ЛУНА':p<.78?'ПОСЛЕДНЯЯ ЧЕТВЕРТЬ':'УБЫВАЮЩИЙ СЕРП'}
function drawMoon(p){const c=$('calMoon').getContext('2d'),r=27,x=32,y=32;c.clearRect(0,0,64,64);c.fillStyle='rgba(110,150,220,.28)';c.beginPath();c.arc(x,y,r,0,7);c.fill();
 const k=Math.cos(p*2*Math.PI),rx=Math.abs(k)*r;c.fillStyle='#eef5ff';c.beginPath();
 if(p<.5){c.arc(x,y,r,-Math.PI/2,Math.PI/2,false);c.ellipse(x,y,rx,r,0,Math.PI/2,-Math.PI/2,k>0)}else{c.arc(x,y,r,Math.PI/2,-Math.PI/2,false);c.ellipse(x,y,rx,r,0,-Math.PI/2,Math.PI/2,k>0)}c.fill()}
function calTick(){const d=new Date(),h=d.getHours(),w=d.getDay(),p=moonPhase(d);$('calD').textContent=d.getDate();$('calM').textContent=MON[d.getMonth()];
 const we=$('calW');we.textContent=WDN[w];we.className='w'+(w===6?' sat':w===0?' sun':'');$('calT').textContent=String(h).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');
 $('calS').textContent=h<6?'НОЧНАЯ СМЕНА':h<12?'УТРЕННЯЯ СМЕНА':h<18?'ДНЕВНАЯ СМЕНА':'ВЕЧЕРНЯЯ СМЕНА';$('calPh').textContent=phaseName(p);drawMoon(p)}
calTick();setInterval(()=>{if(state==='menu')calTick()},10000);
/* экраны */
const KH={main:[['↑','↓','выбор'],['Enter','открыть'],['ЛКМ','повернуть героя']],play:[['Esc','назад'],['Enter','начать']],hero:[['Esc','назад'],['ЛКМ','повернуть героя']],manual:[['Esc','назад'],['←','→','раздел']],page:[['Esc','назад']]};
function mmKeys(){const list=MM.view==='main'?KH.main:MM.view==='page'?(KH[MM.page]||KH.page):[];
 $('mmKeys').innerHTML=list.map(a=>'<span>'+a.slice(0,-1).map(k=>'<span class="k">'+k+'</span>').join('')+a[a.length-1]+'</span>').join('');mmMe()}
function mmMe(){$('mmPc').style.background=myColor;$('mmNick').textContent=cleanNick($('nick').value);$('mmSp').textContent='★ '+Math.floor(bank).toLocaleString('ru')+' очков стиля'}
function mmWipe(){const w=$('mmWipe');w.classList.remove('go');void w.offsetWidth;w.classList.add('go')}
function mmView(v,page){MM.view=v;MM.page=page||null;MM.el.dataset.v=v;
 document.querySelectorAll('.pg').forEach(p=>{const on=v==='page'&&p.id==='pg-'+page;if(on){p.hidden=false;p.classList.remove('in');void p.offsetWidth;p.classList.add('in');p.scrollTop=0}else p.hidden=true});
 if(page==='hero')buildHeroUI();if(page==='play')mmSetMode(MM.mode,true);if(page==='settings')mmSettings();mmKeys();
 setTimeout(()=>{try{if(MM.view==='main')MM.items[MM.sel].focus({preventScroll:true});else if(MM.view==='page'){const pg=$('pg-'+MM.page),f=pg.querySelector('.mode.sel,.mtab.sel,.qb.sel,.sw .sel')||pg.querySelector('button:not(:disabled):not(.pg-back)');f&&f.focus({preventScroll:true})}}catch(e){}},40)}
function mmSel(i,snd=true){i=(i+MM.items.length)%MM.items.length;const ch=i!==MM.sel||!MM.items[i].classList.contains('on');MM.sel=i;
 MM.items.forEach((b,j)=>{b.classList.toggle('on',j===i);b.setAttribute('aria-current',j===i?'true':'false')});{const d=$('mmDesc');d.textContent=MM.items[i].querySelector('small').textContent;d.classList.remove('fl');void d.offsetWidth;d.classList.add('fl')}if(MM.view==='main'&&document.activeElement!==MM.items[i])MM.items[i].focus({preventScroll:true});if(ch&&snd)uiSnd('move')}
function mmEnter(){if(MM.view!=='title')return;initAudio();if(ac&&ac.state==='suspended')ac.resume();uiSnd('start');mmWipe();setTimeout(()=>{mmView('main');mmSel(MM.sel,false)},140);musicCheck()}
function mmOpen(i){if(i!=null)MM.sel=i;uiSnd('ok');mmWipe();mmView('page',MM.items[MM.sel].dataset.go)}
function mmBack(){if(MM.view!=='page')return;uiSnd('back');mmView('main');mmSel(MM.sel,false)}
function mmSetMode(m,quiet){const ids={solo:'mSolo',coop:'mCoop',pvp:'mPvp'};if(m!=='solo'&&$(ids[m]).disabled)m='solo';const ch=m!==MM.mode;MM.mode=m;save('ug-mode',m);
 for(const k in ids){$(ids[k]).classList.toggle('sel',k===m);$(ids[k]).setAttribute('aria-checked',k===m)}$('codeL').classList.toggle('off',m==='solo');$('code').disabled=m==='solo';if(ch&&!quiet)uiSnd('move')}
function mmGo(){if(state!=='menu')return;uiSnd('ok');mmWipe();menuMusic(false);begin(MM.mode)}
function mmSettings(){$('sensV').textContent=(+sens).toFixed(1);$('sndOn').classList.toggle('sel',!muted);$('sndOff').classList.toggle('sel',muted);$('musOn').classList.toggle('sel',MM.musOn);$('musOff').classList.toggle('sel',!MM.musOn);
 $('fsBtn').textContent=document.fullscreenElement?'ВЫКЛЮЧИТЬ':'ВКЛЮЧИТЬ';$('fsBtn').classList.toggle('sel',!!document.fullscreenElement)}
function setMute(v){muted=v;save('ug-mute',v?'1':'0');mmSettings();musicCheck()}
MM.items.forEach((b,i)=>{b.addEventListener('mouseenter',()=>{if(MM.view==='main')mmSel(i)});b.onclick=()=>{if(MM.view==='main')mmOpen(i)}});
document.querySelectorAll('[data-back]').forEach(b=>b.onclick=mmBack);
['mSolo','mCoop','mPvp'].forEach(id=>$(id).onclick=()=>mmSetMode($(id).dataset.m));
$('startBtn').onclick=mmGo;$('mmPress').onclick=mmEnter;
['nick','code'].forEach(id=>$(id).addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();mmGo()}else if(e.key==='Escape'){e.target.blur();mmBack()}}));
$('nick').addEventListener('input',mmMe);
document.querySelectorAll('.mtab').forEach(b=>b.onclick=()=>mmTab(b.dataset.t));
function mmTab(t){document.querySelectorAll('.mtab').forEach(x=>{x.classList.toggle('sel',x.dataset.t===t);x.setAttribute('aria-selected',x.dataset.t===t)});document.querySelectorAll('.msec').forEach(s=>s.hidden=s.id!=='ms-'+t);uiSnd('move')}
$('sndOn').onclick=()=>{setMute(false);uiSnd('ok')};$('sndOff').onclick=()=>setMute(true);
$('musOn').onclick=()=>{MM.musOn=true;save('ug-mus','1');mmSettings();musicCheck()};$('musOff').onclick=()=>{MM.musOn=false;save('ug-mus','0');mmSettings();musicCheck()};
$('fsBtn').onclick=()=>{try{if(document.fullscreenElement)document.exitFullscreen();else document.documentElement.requestFullscreen().catch(()=>{})}catch(e){}};document.addEventListener('fullscreenchange',mmSettings);
document.querySelectorAll('.qb,.map,#sw,#anB,#cosm').forEach(el=>el.addEventListener('click',e=>{if(e.target.closest('button'))uiSnd('move')}));
function mmKey(e){const tag=(e.target&&e.target.tagName)||'';
 if(MM.view==='title'){if(/^(Shift|Control|Alt|Meta)/.test(e.code)||e.code==='Tab'||e.code==='KeyM')return false;e.preventDefault();mmEnter();return true}
 if(tag==='INPUT')return false;
 if(MM.view==='main'){if(e.code==='ArrowUp'||e.code==='KeyW'){e.preventDefault();mmSel(MM.sel-1);return true}if(e.code==='ArrowDown'||e.code==='KeyS'){e.preventDefault();mmSel(MM.sel+1);return true}
  if(e.code==='Escape'){uiSnd('back');mmWipe();mmView('title');return true}return false}
 if(MM.view==='page'){if(e.code==='Escape'||e.code==='Backspace'){e.preventDefault();mmBack();return true}
  if(MM.page==='play'&&e.code==='Enter'&&!(e.target&&e.target.closest&&e.target.closest('.pg-back,.cta'))){e.preventDefault();const c=e.target&&e.target.closest&&e.target.closest('.mode,.map');if(c&&!c.disabled)c.click();mmGo();return true}
  if(MM.page==='manual'&&(e.code==='ArrowLeft'||e.code==='ArrowRight')){const ts=[...document.querySelectorAll('.mtab')],i=ts.findIndex(x=>x.classList.contains('sel')),n=ts[(i+(e.code==='ArrowRight'?1:ts.length-1))%ts.length];mmTab(n.dataset.t);n.focus({preventScroll:true});e.preventDefault();return true}
  return false}
 return false}
/* мышь: параллакс и вращение героя */
{let dr=null;const mn=MM.el;mn.addEventListener('pointerdown',e=>{if(MM.view==='title'){mmEnter();return}if(e.target===mn){dr=e.clientX;try{mn.setPointerCapture(e.pointerId)}catch(_){}}});
 mn.addEventListener('pointermove',e=>{const r=mn.getBoundingClientRect();MM.mx=(e.clientX-r.left)/r.width*2-1;MM.my=(e.clientY-r.top)/r.height*2-1;if(dr!==null){MSC.drag+=(e.clientX-dr)*.009;dr=e.clientX}});
 mn.addEventListener('pointerup',()=>dr=null);mn.addEventListener('pointercancel',()=>dr=null)}
/* камера и герой на сцене меню */
const MSC={p:new V3(-.15,.72,5),t:new V3(-1.65,1.5,0),yaw:Math.PI-.5,drag:0,fl:6};
function setHeroLayer(h,l){h.layer=l;h.root.traverse(o=>o.layers.set(l))}
function menuStage(now,dt){const h=selfHero,v=MM.view==='page'?MM.page:MM.view,wide=wrap.clientWidth>900;let P_,T_,Y;
 if(v==='title'){P_=[-.15,.72,5];T_=[-1.65,1.5,0];Y=Math.PI-.5}
 else if(v==='hero'){P_=[-.35,1.22,3.35];T_=wide?[1.02,1.0,0]:[0,1,0];Y=Math.PI+.2}
 else if(v==='main'){P_=[-.5,1.38,4.15];T_=wide?[1.3,1.12,0]:[0,1.05,0];Y=Math.PI+.38}
 else{P_=[-.8,1.55,4.25];T_=wide?[1.6,1.1,0]:[0,1.1,0];Y=Math.PI+.3}
 const k=1-Math.exp(-dt*2.4),dx=MM.mx*.22+Math.sin(now/4300)*.08,dy=-MM.my*.09+Math.sin(now/3100)*.05;
 MSC.p.lerp(tmpA.set(P_[0]+dx,P_[1]+dy,P_[2]),k);MSC.t.lerp(tmpB.set(T_[0],T_[1],T_[2]),k);camera.position.copy(MSC.p);camera.lookAt(MSC.t);
 if(camera.fov!==40){camera.fov=40;camera.updateProjectionMatrix()}
 MSC.yaw+=(Y+MSC.drag-MSC.yaw)*(1-Math.exp(-dt*3));h.root.visible=true;h.root.position.set(0,0,0);h.root.rotation.y=MSC.yaw;const yaw=MSC.yaw;
 SHOW.t+=dt;let an=SHOW.anim,lt=SHOW.t;if(an==='demo'){if(SHOW.t>DEMO[SHOW.seq%DEMO.length][1]){SHOW.t=0;SHOW.seq++;lt=0}an=DEMO[SHOW.seq%DEMO.length][0]}
 MSC.pt=(MSC.pt==null?-.5:MSC.pt)+(((an==='idle'||an==='run'||an==='jump'||an==='slide'||an==='dash'||an==='slam'||an==='death')&&MSC.fl>.6?-.55:-.05)-(MSC.pt==null?-.5:MSC.pt))*(1-Math.exp(-dt*6));
 const fx=-Math.sin(yaw),fz=-Math.cos(yaw),st={vx:0,vz:0,vy:0,yaw,air:false,slide:false,dash:false,slam:false,pitch:MSC.pt,hp:100,alive:true,w:SHOW.w};
 const per=(P2)=>{const prev=lt-dt;return Math.floor(lt/P2)!==Math.floor(prev/P2)||lt<dt};
 if(an==='run'){st.vx=fx*12;st.vz=fz*12}
 else if(an==='jump'){const t=lt%1.4;if(t<1){st.air=true;st.vy=11-22*t;st.vx=fx*4;st.vz=fz*4}else st.vy=0}
 else if(an==='slide'){st.slide=true;st.vx=fx*19;st.vz=fz*19}
 else if(an==='dash'){const t=lt%.9;if(t<.2){st.dash=true;st.vx=fx*40;st.vz=fz*40}else if(t<.45){st.air=true;st.vy=-3}}
 else if(an==='slam'){const t=lt%1.5;if(t<.3){st.air=true;st.vy=8}else if(t<.62){st.slam=true;st.air=true;st.vy=-55}}
 else if(an==='punch'){if(per(.8))heroPunch(h)}
 else if(an==='fire'){if(per(.55)){heroFire(h);if(++SHOW.shots%3===0)SHOW.w=(SHOW.w+1)%4;st.w=SHOW.w}}
 else if(an==='death'){st.alive=(lt%3.4)>2.6;st.hp=st.alive?100:0}
 else if(an==='idle'&&v!=='hero'){MSC.fl-=dt;if(MSC.fl<=0){MSC.fl=7+Math.random()*5;if(Math.random()<.6){heroFire(h);setTimeout(()=>heroFire(h),180)}else heroPunch(h)}}
 animHero(h,st,dt);stageTick(dt)}
initNet();
requestAnimationFrame(frame);
}
