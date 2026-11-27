/*STORY-BEGIN*/
/* ================= СЮЖЕТ: состояние уровня ================= */
let story=null,storyId=null,lvT=0,drainT=0,surgeT=0,tideK=0,wetK=1,carousel=null;
const doors=[],belts=[],presses=[],pools=[],valves=[],beacons=[];
let goo=[],quakes=[],wrings=[],mapB={x0:-34,x1:34,z0:-34,z1:34};
let prog={};try{prog=JSON.parse(localStorage.getItem('ug-story')||'{}')||{}}catch(e){prog={}}
const saveProg=()=>save('ug-story',JSON.stringify(prog));
function resetMapExtras(){for(const a of[doors,belts,presses,pools,valves,beacons])a.length=0;vLights=[];carousel=null;mapB={x0:-34,x1:34,z0:-34,z1:34};if(L3)clearL3();L3=null;if(typeof L4!=='undefined'&&L4)clearL4();L4=null}
const inR=(p,r)=>p.x>r[0]&&p.x<r[1]&&p.z>r[2]&&p.z<r[3];
const smk=k=>k*k*(3-2*k);
/*TERR*/let TERR=null;const terrH=(x,z)=>TERR?TERR.h(x,z):-1e9;
function groundAt(x,z,maxY=8){let y=0;if(TERR){const t=TERR.h(x,z);y=t<=maxY?t:-60}for(const b of boxes)if(x>b.min.x&&x<b.max.x&&z>b.min.z&&z<b.max.z&&b.max.y<=maxY&&b.max.y>y)y=b.max.y;return y}
function syrupLvl(x,z){for(const p of pools)if(x>p.x0&&x<p.x1&&z>p.z0&&z<p.z1)return p.y;return -99}
function syrupDepth(p){const l=syrupLvl(p.x,p.z);return l>p.y?l-p.y:0}
function floorAt(x,y,z){if(!story)return true;if(TERR){const t=TERR.h(x,z);if(t<=y+.45&&t>=y-.9)return true}for(const b of boxes)if(x>b.min.x&&x<b.max.x&&z>b.min.z&&z<b.max.z&&b.max.y<=y+.45&&b.max.y>=y-.9)return true;const sl=syrupLvl(x,z);return sl>-50&&Math.abs(sl-y)<1}
const surfY=(x,z)=>Math.max(groundAt(x,z,7.5),syrupLvl(x,z));
const sndV=(x,y,z)=>Math.max(0,1-Math.hypot(camera.position.x-x,camera.position.y-y,camera.position.z-z)/46);
const fmtT=s=>{s=Math.max(0,Math.floor(s));return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0')};

/* ---------- материалы и геометрия с мировыми UV (текстура не тянется) ---------- */
let SM=null;
function wbox(w,h,d,s=4){const g=new THREE.BoxGeometry(w,h,d),uv=g.attributes.uv,dims=[[d,h],[d,h],[w,d],[w,d],[w,h],[w,h]];
 for(let f=0;f<6;f++)for(let i=0;i<4;i++){const k=f*4+i;uv.setXY(k,uv.getX(k)*dims[f][0]/s,uv.getY(k)*dims[f][1]/s)}return g}
function addBoxW(x,y,z,w,h,d,mat,s=4){const m=new THREE.Mesh(wbox(w,h,d,s),mat);m.position.set(x,y+h/2,z);mapGroup.add(m);level.push(m);solid(x,y,z,w,h,d);return m}
function decoW(x,y,z,w,h,d,mat,s=4){const m=new THREE.Mesh(wbox(w,h,d,s),mat);m.position.set(x,y+h/2,z);mapGroup.add(m);return m}
/* ---------- оптимизация: пул ламп и слияние статики ----------
   Лампы уровня — «виртуальные»: настоящих точечных источников всегда LPOOL штук,
   они переезжают к лампам рядом с камерой. Число источников постоянно, шейдеры не пересобираются. */
let vLights=[];const LPOOL=4;
function plight(x,y,z,c,i,d){vLights.push({p:new V3(x,y,z),c,i,d})}
function setupLightPool(){const pool=[];for(let k=0;k<LPOOL;k++){const l=new THREE.PointLight(0xffffff,0,10);mapGroup.add(l);pool.push({l,v:null,k:0})}
 let t=0;mapAnims.push(dt=>{t-=dt;if(t<=0){t=.25;const cp=camera.position,sc=v=>v.p.distanceToSquared(cp)/(v.d*v.d),best=vLights.slice().sort((a,b)=>sc(a)-sc(b)).slice(0,LPOOL);
   for(const s of pool)if(s.v&&!best.includes(s.v))s.v=null;for(const v of best)if(!pool.some(s=>s.v===v)){const s=pool.find(s=>!s.v);if(!s)break;s.v=v;s.k=0;s.l.position.copy(v.p);s.l.color.setHex(v.c);s.l.distance=v.d}}
  for(const s of pool){s.k=Math.min(1,s.k+dt*4);s.l.intensity=s.v?s.v.i*s.k:0}})}
function mergeStatic(){mapGroup.updateMatrixWorld(true);const groups=new Map(),nm=new THREE.Matrix3(),v=new V3();const okM=mt=>mt&&(!mt.transparent||mt.userData.mergeOK);
 for(const m of mapGroup.children){if(!m.isMesh||m.isInstancedMesh||m.userData.dyn||m.userData.merged||!m.visible)continue;const arr=Array.isArray(m.material);
  if(arr?!m.material.every(okM):!okM(m.material))continue;const g=m.geometry;if(!g.attributes.position||!g.attributes.normal||!g.attributes.uv)continue;
  const gi=g.index?g.toNonIndexed():g,parts=arr?(gi.groups.length?gi.groups:[]).map(q=>[m.material[q.materialIndex],q.start,q.count]):[[m.material,0,gi.attributes.position.count]];if(!parts.length)continue;
  for(const [mt,st,cn] of parts){const key=mt.uuid+'|'+(m.userData.noCast?1:0)+'|'+Math.floor(m.position.x/36)+'|'+Math.floor(m.position.z/36);if(!groups.has(key))groups.set(key,{mt,noCast:m.userData.noCast,list:[]});groups.get(key).list.push([m,gi,st,cn])}}
 let merged=0;const done=new Set();for(const G of groups.values()){if(G.list.length<2)continue;let n=0;for(const e of G.list)n+=e[3];
  const pos=new Float32Array(n*3),nor=new Float32Array(n*3),uv=new Float32Array(n*2);let o=0;
  for(const [m,g,st,cn] of G.list){const P_=g.attributes.position,N=g.attributes.normal,U=g.attributes.uv;nm.getNormalMatrix(m.matrixWorld);
   for(let i=st;i<st+cn;i++,o++){v.fromBufferAttribute(P_,i).applyMatrix4(m.matrixWorld);pos[o*3]=v.x;pos[o*3+1]=v.y;pos[o*3+2]=v.z;v.fromBufferAttribute(N,i).applyMatrix3(nm).normalize();nor[o*3]=v.x;nor[o*3+1]=v.y;nor[o*3+2]=v.z;uv[o*2]=U.getX(i);uv[o*2+1]=U.getY(i)}
   done.add(m)}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));geo.setAttribute('normal',new THREE.BufferAttribute(nor,3));geo.setAttribute('uv',new THREE.BufferAttribute(uv,2));geo.computeBoundingSphere();
  const mm=new THREE.Mesh(geo,G.mt);mm.userData.noCast=G.noCast;mm.userData.merged=1;if(G.mt.transparent)mm.renderOrder=1;mapGroup.add(mm);merged+=G.list.length}
 // меш прячем, только если все его части ушли в слитые (иначе — оставляем как есть)
 for(const m of done){const arr=Array.isArray(m.material);let all=true;if(arr){const gi=m.geometry.index?m.geometry.toNonIndexed():m.geometry;for(const q of gi.groups){const mt=m.material[q.materialIndex];const key=mt.uuid+'|'+(m.userData.noCast?1:0)+'|'+Math.floor(m.position.x/36)+'|'+Math.floor(m.position.z/36);if(groups.get(key).list.length<2){all=false;break}}}
  else{const key=m.material.uuid+'|'+(m.userData.noCast?1:0)+'|'+Math.floor(m.position.x/36)+'|'+Math.floor(m.position.z/36);all=groups.get(key).list.length>=2}if(all)m.visible=false}
 return merged}
/* для любой карты: найти анимированное, лампы — в пул, статику — слить */
function optimizeMap(){mapGroup.updateMatrixWorld(true);const kids=mapGroup.children.filter(o=>o.isMesh),snap=kids.map(o=>[o.matrix.clone(),o.visible]),ls=mapGroup.children.filter(o=>o.isPointLight&&!o.castShadow),lsn=ls.map(l=>[l.intensity,l.position.clone()]);
 let T0=0,tok=true;try{T0=T}catch(e){tok=false}for(let i=0;i<4;i++){if(tok)T=T0+.37+i*.61;for(const f of mapAnims)try{f(.05)}catch(e){}}if(tok)T=T0;
 kids.forEach((o,i)=>{o.updateMatrix();if(!o.matrix.equals(snap[i][0])||o.visible!==snap[i][1])o.userData.dyn=1});
 const still=ls.filter((l,i)=>l.intensity===lsn[i][0]&&l.position.equals(lsn[i][1]));
 if(still.length+vLights.length>LPOOL){for(const l of still){vLights.push({p:l.position.clone(),c:l.color.getHex(),i:l.intensity,d:l.distance||30});mapGroup.remove(l)}setupLightPool()}
 return mergeStatic()}
function storyMats(){if(SM)return SM;const E={envMap:ENV};const T1=(n,f)=>tex(n,n,f,1,1);
 const speck=(g,w,h,n,a,dk=.6)=>{for(let i=0;i<n;i++){g.fillStyle=(Math.random()<dk?'rgba(30,22,16,':'rgba(255,248,235,')+(Math.random()*a)+')';g.fillRect(Math.random()*w,Math.random()*h,1+Math.random()*4,1+Math.random()*4)}};
 const streak=(g,w,h,n,c,a)=>{for(let i=0;i<n;i++){const x=Math.random()*w,l=h*(.3+Math.random()*.7),gr=g.createLinearGradient(0,0,0,l);gr.addColorStop(0,'rgba('+c+','+a+')');gr.addColorStop(1,'rgba('+c+',0)');g.fillStyle=gr;g.fillRect(x,0,3+Math.random()*6,l)}};
 const conc=T1(256,(g,w,h)=>{g.fillStyle='#7a746d';g.fillRect(0,0,w,h);speck(g,w,h,900,.12);g.fillStyle='rgba(70,48,26,.14)';for(let i=0;i<4;i++){g.beginPath();g.ellipse(Math.random()*w,Math.random()*h,18+Math.random()*50,8+Math.random()*26,Math.random()*3,0,7);g.fill()}
  g.strokeStyle='rgba(45,40,36,.6)';g.lineWidth=3;g.strokeRect(1.5,1.5,w-3,h-3);g.strokeStyle='rgba(255,255,255,.07)';g.strokeRect(4.5,4.5,w-9,h-9)});
 const ribs=T1(256,(g,w,h)=>{for(let x=0;x<w;x+=32){const gr=g.createLinearGradient(x,0,x+32,0);gr.addColorStop(0,'#86817a');gr.addColorStop(.45,'#bcb6ac');gr.addColorStop(.55,'#a29c93');gr.addColorStop(1,'#75706a');g.fillStyle=gr;g.fillRect(x,0,32,h)}
  speck(g,w,h,500,.1);streak(g,w,h,5,'120,60,20',.2);g.fillStyle='rgba(40,36,32,.5)';for(let y=12;y<h;y+=64)for(let x=8;x<w;x+=32){g.beginPath();g.arc(x,y,2,0,7);g.fill()}});
 const ceil=T1(256,(g,w,h)=>{g.fillStyle='#3d3935';g.fillRect(0,0,w,h);speck(g,w,h,400,.12);g.fillStyle='#2a2724';g.fillRect(0,0,w,14);g.fillRect(0,0,14,h);g.fillStyle='#57524b';g.fillRect(0,14,w,3);g.fillRect(14,0,3,h)});
 const grate=T1(128,(g,w,h)=>{g.fillStyle='#3a3e43';g.fillRect(0,0,w,h);g.strokeStyle='#848a92';g.lineWidth=3;for(let i=-w;i<w*2;i+=16){g.beginPath();g.moveTo(i,0);g.lineTo(i+h,h);g.stroke();g.beginPath();g.moveTo(i,h);g.lineTo(i+h,0);g.stroke()}g.strokeStyle='#202327';g.lineWidth=6;g.strokeRect(0,0,w,h)});
 const beltX=tex(128,128,(g,w,h)=>{g.fillStyle='#262422';g.fillRect(0,0,w,h);speck(g,w,h,300,.12,.3);g.fillStyle='#45413c';for(let x=0;x<w;x+=16)g.fillRect(x,0,5,h);g.fillStyle='rgba(255,255,255,.06)';for(let x=1;x<w;x+=16)g.fillRect(x,0,1,h)},1,1);
 const beltZ=tex(128,128,(g,w,h)=>{g.fillStyle='#262422';g.fillRect(0,0,w,h);speck(g,w,h,300,.12,.3);g.fillStyle='#45413c';for(let y=0;y<h;y+=16)g.fillRect(0,y,w,5);g.fillStyle='rgba(255,255,255,.06)';for(let y=1;y<h;y+=16)g.fillRect(0,y,w,1)},1,1);
 const hz=T1(64,(g,w,h)=>{g.fillStyle='#f2b84b';g.fillRect(0,0,w,h);g.fillStyle='#1d1b1a';for(let i=-2;i<4;i++){g.beginPath();g.moveTo(i*32,0);g.lineTo(i*32+16,0);g.lineTo(i*32+16+h,h);g.lineTo(i*32+h,h);g.fill()}});
 const dc=document.createElement('canvas');dc.width=dc.height=256;{const g=dc.getContext('2d');g.fillStyle='#8d9298';g.fillRect(0,0,256,256);speck(g,256,256,500,.12);
  const band=y=>{g.save();g.beginPath();g.rect(0,y,256,34);g.clip();g.fillStyle='#f2b84b';g.fillRect(0,y,256,34);g.fillStyle='#1d1b1a';for(let x=-40;x<300;x+=36){g.beginPath();g.moveTo(x,y);g.lineTo(x+18,y);g.lineTo(x+52,y+34);g.lineTo(x+34,y+34);g.fill()}g.restore()};band(8);band(214);
  g.strokeStyle='#5d6268';g.lineWidth=4;g.beginPath();g.moveTo(128,46);g.lineTo(128,210);g.stroke();g.fillStyle='#4a4f55';for(const x of[16,240])for(let y=58;y<206;y+=26){g.beginPath();g.arc(x,y,3,0,7);g.fill()}
  g.font='bold 38px "Russo One",Arial';g.textAlign='center';g.fillStyle='#c8102e';g.fillText('ШЛЮЗ',128,142)}
 const doorT=new THREE.CanvasTexture(dc);doorT.anisotropy=4;
 const tile=T1(256,(g,w,h)=>{g.fillStyle='#8f8472';g.fillRect(0,0,w,h);for(let y=0;y<h;y+=32)for(let x=0;x<w;x+=32){const v=196+Math.random()*26|0;g.fillStyle='rgb('+v+','+(v-9)+','+(v-28)+')';g.fillRect(x+2,y+2,28,28)}
  streak(g,w,h,8,'150,70,10',.55);speck(g,w,h,300,.08)});
 const pit=T1(256,(g,w,h)=>{g.fillStyle='#3a2414';g.fillRect(0,0,w,h);speck(g,w,h,800,.18,.5);g.strokeStyle='rgba(20,10,4,.6)';g.lineWidth=3;g.strokeRect(1.5,1.5,w-3,h-3)});
 const plat=T1(256,(g,w,h)=>{g.fillStyle='#6e6a63';g.fillRect(0,0,w,h);speck(g,w,h,700,.12);g.strokeStyle='rgba(40,36,30,.7)';g.lineWidth=3;for(let i=0;i<=w;i+=64){g.beginPath();g.moveTo(i,0);g.lineTo(i,h);g.stroke();g.beginPath();g.moveTo(0,i);g.lineTo(w,i);g.stroke()}g.fillStyle='rgba(140,70,15,.2)';g.fillRect(0,h-40,w,40)});
 const tank=T1(256,(g,w,h)=>{g.fillStyle='#6b4a32';g.fillRect(0,0,w,h);speck(g,w,h,900,.16);g.fillStyle='#4a301e';g.fillRect(0,0,w,8);g.fillRect(0,0,8,h);g.fillStyle='#8f6a4b';for(let x=16;x<w;x+=24){g.beginPath();g.arc(x,4,2.5,0,7);g.fill()}for(let y=16;y<h;y+=24){g.beginPath();g.arc(4,y,2.5,0,7);g.fill()}streak(g,w,h,6,'210,120,30',.35)});
 const syr=tex(256,256,(g,w,h)=>{g.fillStyle='#5c2c09';g.fillRect(0,0,w,h);for(let i=0;i<150;i++){const x=Math.random()*w,y=Math.random()*h,r=6+Math.random()*32,c=Math.random()<.5?'214,140,60':'40,14,2';
   for(const dx of[-w,0,w])for(const dy of[-h,0,h]){const gr=g.createRadialGradient(x+dx,y+dy,0,x+dx,y+dy,r);gr.addColorStop(0,'rgba('+c+',.2)');gr.addColorStop(1,'rgba('+c+',0)');g.fillStyle=gr;g.fillRect(x+dx-r,y+dy-r,r*2,r*2)}}},1,1,true);syr.magFilter=THREE.LinearFilter;
 SM={conc:M(0xffffff,{map:conc,roughness:.88}),ribs:M(0xffffff,{map:ribs,roughness:.5,metalness:.35,...E,envMapIntensity:.35}),ceilL:M(0xffffff,{map:ceil,roughness:.9}),
  grate:M(0xffffff,{map:grate,roughness:.5,metalness:.55,...E,envMapIntensity:.5}),beltX,beltZ,frame:M(0x34363b,{metalness:.6,roughness:.4,...E}),
  hz:M(0xffffff,{map:hz,roughness:.6}),door:M(0xffffff,{map:doorT,metalness:.5,roughness:.35,...E,envMapIntensity:.6}),
  steel:M(0xaab0b6,{metalness:.75,roughness:.28,...E}),dark:M(0x2b2d32,{metalness:.5,roughness:.45}),red:M(0xc8102e,{roughness:.38,metalness:.2}),yel:M(0xf2b84b,{metalness:.35,roughness:.4}),
  cab:M(0x3c5a4a,{roughness:.5,metalness:.3}),glass:M(0xcfeaff,{roughness:.04,metalness:.1,transparent:true,opacity:.2,...E,depthWrite:false}),cola:M(0x5a1a06,{roughness:.1,transparent:true,opacity:.9,emissive:0x3a0c00,...E}),
  tile:M(0xffffff,{map:tile,roughness:.35,metalness:.05,...E,envMapIntensity:.3}),pit:M(0xffffff,{map:pit,roughness:.9}),plat:M(0xffffff,{map:plat,roughness:.8}),
  tank:M(0xffffff,{map:tank,roughness:.42,metalness:.55,...E,envMapIntensity:.5}),ceilD:M(0x2a1d14,{roughness:.9}),rust:M(0x6e3f22,{roughness:.5,metalness:.6,...E,envMapIntensity:.5}),pipe:M(0x8f969d,{metalness:.7,roughness:.3,...E}),
  crust:M(0xa0561a,{roughness:.3,metalness:.05,...E,envMapIntensity:.5}),bottle:M(0x4a1f12,{roughness:.1,metalness:.1,transparent:true,opacity:.88,...E}),syrT:syr};
 SM.syr=new THREE.MeshStandardMaterial({color:0xa07a58,map:syr,roughness:.04,metalness:.25,envMap:ENV,envMapIntensity:1.3,transparent:true,opacity:.93,emissive:0xffffff,emissiveMap:syr,emissiveIntensity:.05,depthWrite:false});
 return SM}

/* ---------- стены с проёмами, комнаты, коридоры ---------- */
function wallX(z,x0,x1,H,mat,ops=[]){let c=x0;for(const o of ops.slice().sort((a,b)=>a.c-b.c)){const a=o.c-o.w/2,b=o.c+o.w/2,y0=o.y0||0;
  if(a>c+.01)addBoxW((c+a)/2,0,z,a-c,H,1,mat);if(y0>0)addBoxW(o.c,0,z,o.w,y0,1,mat);if(y0+o.h<H)addBoxW(o.c,y0+o.h,z,o.w,H-y0-o.h,1,mat);c=b}
 if(x1>c+.01)addBoxW((c+x1)/2,0,z,x1-c,H,1,mat)}
function wallZ(x,z0,z1,H,mat,ops=[]){let c=z0;for(const o of ops.slice().sort((a,b)=>a.c-b.c)){const a=o.c-o.w/2,b=o.c+o.w/2,y0=o.y0||0;
  if(a>c+.01)addBoxW(x,0,(c+a)/2,1,H,a-c,mat);if(y0>0)addBoxW(x,0,o.c,1,y0,o.w,mat);if(y0+o.h<H)addBoxW(x,y0+o.h,o.c,1,H-y0-o.h,o.w,mat);c=b}
 if(z1>c+.01)addBoxW(x,0,(c+z1)/2,1,H,z1-c,mat)}
function roomBox(x0,x1,z0,z1,H,R,ops={}){const cx=(x0+x1)/2,cz=(z0+z1)/2,W=x1-x0,D=z1-z0;
 addBoxW(cx,-1,cz,W+2,1,D+2,R.floor);const c=addBoxW(cx,H,cz,W+2,1,D+2,R.ceil,6);c.userData.noCast=true;
 wallX(z1+.5,x0-1,x1+1,H,R.wall,ops.s);wallX(z0-.5,x0-1,x1+1,H,R.wall,ops.n);wallZ(x0-.5,z0,z1,H,R.wall,ops.w);wallZ(x1+.5,z0,z1,H,R.wall,ops.e)}
function corridorZ(x,z0,z1,w,y0,H,R,cap){const cz=(z0+z1)/2,L=z1-z0;
 if(y0>0)addBoxW(x,0,cz,w,y0,L,R.floor);else addBoxW(x,-1,cz,w,1,L,R.floor);
 const c=addBoxW(x,y0+H,cz,w+2,1,L,R.ceil,6);c.userData.noCast=true;
 wallZ(x-w/2-.5,z0,z1,y0+H+1,R.wall);wallZ(x+w/2+.5,z0,z1,y0+H+1,R.wall);
 if(cap==='s')addBoxW(x,0,z1+.5,w+2,y0+H+1,1,R.wall);if(cap==='n')addBoxW(x,0,z0-.5,w+2,y0+H+1,1,R.wall);
 plight(x,y0+H-.8,cz,0xffd6a0,.5,L+6)}
function discSolid(cx,cz,R,y0,h,step=1){for(let z=-R;z<R-1e-3;z+=step){const zm=z+step/2,hw=Math.sqrt(Math.max(0,R*R-zm*zm));if(hw>.2)solid(cx,y0,cz+zm,hw*2,h,step)}}
function wsign(text,x,y,z,ry,w,h,fg='#c8102e',bg='#2b0a0e'){const p=deco(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:signTex(text,fg,bg,1024,Math.round(1024*h/w),'bold '+Math.round(1024*h/w*.55)+'px "Russo One",Arial')}),x,y,z);p.rotation.y=ry;return p}
function rails(x,y,z,len,alongX){const r=SM.yel;if(alongX){decoW(x,y+1,z,len,.08,.08,r);decoW(x,y+.5,z,len,.06,.06,r);for(let i=-len/2;i<=len/2+.01;i+=2)decoW(x+i,y,z,.07,1.05,.07,r)}
 else{decoW(x,y+1,z,.08,.08,len,r);decoW(x,y+.5,z,.06,.06,len,r);for(let i=-len/2;i<=len/2+.01;i+=2)decoW(x,y,z+i,.07,1.05,.07,r)}}
function trim(x0,x1,z0,z1,y){const t=.22;decoW((x0+x1)/2,y-.02,z0+t/2,x1-x0,.06,t,SM.hz,1);decoW((x0+x1)/2,y-.02,z1-t/2,x1-x0,.06,t,SM.hz,1);decoW(x0+t/2,y-.02,(z0+z1)/2,t,.06,z1-z0,SM.hz,1);decoW(x1-t/2,y-.02,(z0+z1)/2,t,.06,z1-z0,SM.hz,1)}
function stairs(x,z,dx,dz,w,n,top){const rise=top/n,run=.8;for(let k=1;k<=n;k++){const o=(n-k)*run+run/2,px=x+dx*o,pz=z+dz*o;addBoxW(px,0,pz,dx?run:w,k*rise,dz?run:w,SM.plat)}}
function followSun(sun,ox,oy,oz){mapGroup.add(sun.target);mapAnims.push(()=>{sun.position.set(P.pos.x+ox,P.pos.y+oy,P.pos.z+oz);sun.target.position.set(P.pos.x,P.pos.y,P.pos.z)})}


/* ---------- обстановка цехов: фермы под потолком, лампы со световыми конусами, трубы, плакаты, пыль ---------- */
let DM=null;
function dressMats(){if(DM)return DM;const E={envMap:ENV};const g=document.createElement('canvas');g.width=4;g.height=128;const x=g.getContext('2d'),gr=x.createLinearGradient(0,0,0,128);gr.addColorStop(0,'#fff');gr.addColorStop(.35,'#9a9a9a');gr.addColorStop(1,'#000');x.fillStyle=gr;x.fillRect(0,0,4,128);
 const ct=new THREE.CanvasTexture(g);
 DM={beam:M(0x30333a,{metalness:.65,roughness:.42,...E,envMapIntensity:.4}),yel:M(0xd8a21e,{metalness:.25,roughness:.5}),shade:M(0x23262b,{metalness:.55,roughness:.35,side:THREE.DoubleSide,...E}),
  bulb:new THREE.MeshBasicMaterial({color:0xfff0c8}),cone:new THREE.MeshBasicMaterial({map:ct,color:0xffd8a0,transparent:true,opacity:.16,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}),
  pipeR:M(0xa3281e,{metalness:.35,roughness:.4,...E,envMapIntensity:.4}),pipeS:M(0x8d949c,{metalness:.8,roughness:.3,...E}),cable:M(0x141518,{roughness:.8})};return DM}
/* фермы поперёк зала + прогоны вдоль + трубы по стенам */
function trusses(x0,x1,z0,z1,H,step=6){const d=dressMats(),cx=(x0+x1)/2,W=x1-x0,L=z1-z0;
 for(let z=z0+step/2;z<z1-1;z+=step){decoW(cx,H-1.15,z,W,.08,.55,d.beam);decoW(cx,H-1.1,z,W,.75,.12,d.beam);decoW(cx,H-.4,z,W,.08,.55,d.beam)}
 for(const f of[.25,.75])decoW(x0+W*f,H-.38,(z0+z1)/2,.35,.3,L,d.beam);
 for(const [x,s] of[[x0+.55,1],[x1-.55,-1]]){deco(new THREE.CylinderGeometry(.2,.2,L,12),d.pipeR,x,H-2.4,(z0+z1)/2).rotation.x=Math.PI/2;deco(new THREE.CylinderGeometry(.13,.13,L,10),d.pipeS,x+s*.05,H-3,(z0+z1)/2).rotation.x=Math.PI/2;
  for(let z=z0+2;z<z1-1;z+=4)decoW(x-s*.15,H-3.25,z,.4,1.1,.12,d.beam)}}
/* световые фонари в крыше (для цехов) */
let SKY_T=null;function skylights(x0,x1,z0,z1,H){if(!SKY_T){SKY_T=tex(128,256,(g,w,h)=>{const gr=g.createLinearGradient(0,0,w,0);gr.addColorStop(0,'#cfe6ff');gr.addColorStop(.5,'#fff6e6');gr.addColorStop(1,'#cfe6ff');g.fillStyle=gr;g.fillRect(0,0,w,h);
  g.fillStyle='#2a2c30';for(let y=0;y<h;y+=32)g.fillRect(0,y,w,5);g.fillRect(0,0,6,h);g.fillRect(w-6,0,6,h);g.fillRect(w/2-3,0,6,h)},1,1,true);SKY_T.wrapT=THREE.RepeatWrapping}
 const W=x1-x0,L=z1-z0-4,t=SKY_T.clone();t.needsUpdate=true;t.repeat.set(1,L/8);const mt=new THREE.MeshBasicMaterial({map:t,color:0xfff2dc});
 for(const f of[.3,.7]){const p=deco(new THREE.PlaneGeometry(W*.12,L),mt,x0+W*f,H-.02,(z0+z1)/2);p.rotation.x=Math.PI/2;p.castShadow=false}}
/* подвесная лампа со световым конусом до пола */
let _coneG={};
function hangLamp(x,z,H,y0,warm){const d=dressMats(),ly=H-2.2,h=ly-y0-.2;deco(new THREE.CylinderGeometry(.025,.025,H-ly,4),d.cable,x,(H+ly)/2,z);
 deco(new THREE.ConeGeometry(.62,.42,16,1,true),d.shade,x,ly+.12,z);const b=deco(new THREE.SphereGeometry(.15,10,8),d.bulb,x,ly-.05,z);
 const k=Math.round(h*2)/2,key=k;if(!_coneG[key]){_coneG[key]=new THREE.CylinderGeometry(.42,Math.max(2.2,k*.34),k,20,1,true);_coneG[key].translate(0,-k/2,0)}
 const c=deco(_coneG[key],d.cone,x,ly-.1,z);c.renderOrder=4;c.castShadow=false;plight(x,ly-.6,z,warm||0xffd6a0,.42,Math.max(16,h*2.2))}
/* плакаты по технике безопасности (сатира) */
const POSTERS=[['НЕ СТОЙ','ПОД ПРЕССОМ!','#c8102e','#f6eee2','press'],['ВСТРЯХНУЛ —','ОТОЙДИ!','#1d4e89','#f6eee2','can'],['ГАЗ-АД','ПЛАН 300%','#f2b84b','#2b0a0e','chart'],['ПАРИРУЙ','С УЛЫБКОЙ','#2a7a4a','#f6eee2','fist'],
 ['СИРОП','НЕ ПИТЬ!','#6b2a06','#ffd27a','drop'],['ВЕНТИЛЬ —','ВЫСТРЕЛОМ','#c8102e','#f6eee2','valve'],['САХАР —','ЭТО СИЛА','#f6eee2','#6b2a06','cube'],['ОСТОРОЖНО','ПРИЛИВ!','#ffcf1a','#111','wave']];
let POST_T={};
function posterTex(i){if(POST_T[i])return POST_T[i];const [a,b,bg,fg,ic]=POSTERS[i];return POST_T[i]=tex(256,360,(g,w,h)=>{g.fillStyle=bg;g.fillRect(0,0,w,h);g.strokeStyle=fg;g.lineWidth=8;g.strokeRect(10,10,w-20,h-20);
  g.fillStyle=fg;g.textAlign='center';g.font='900 34px "Russo One",Arial';g.fillText(a,w/2,60);g.font='900 30px "Russo One",Arial';g.fillText(b,w/2,h-34);
  g.save();g.translate(w/2,h/2+8);g.fillStyle=fg;g.strokeStyle=fg;g.lineWidth=10;g.lineCap='round';
  if(ic==='press'){g.fillRect(-60,-90,120,30);g.fillRect(-10,-60,20,40);g.fillRect(-70,-20,140,24);g.beginPath();g.arc(0,60,16,0,7);g.fill();g.beginPath();g.moveTo(0,76);g.lineTo(0,110);g.moveTo(-24,90);g.lineTo(24,90);g.stroke()}
  else if(ic==='can'){g.fillRect(-34,-70,68,120);g.clearRect(-26,-50,52,30);for(const a of[-.6,0,.6]){g.save();g.rotate(a);g.fillRect(-4,-120,8,36);g.restore()}}
  else if(ic==='chart'){for(let k=0;k<4;k++)g.fillRect(-80+k*42,40-k*34,30,30+k*34+20);g.beginPath();g.moveTo(-90,30);g.lineTo(90,-90);g.stroke()}
  else if(ic==='fist'){g.beginPath();g.arc(0,0,50,0,7);g.fill();g.fillStyle=bg;for(let k=0;k<4;k++)g.fillRect(-44+k*24,-46,4,40)}
  else if(ic==='drop'){g.beginPath();g.moveTo(0,-90);g.bezierCurveTo(60,-10,60,60,0,70);g.bezierCurveTo(-60,60,-60,-10,0,-90);g.fill();g.strokeStyle=bg;g.beginPath();g.moveTo(-60,-60);g.lineTo(60,60);g.stroke()}
  else if(ic==='valve'){g.beginPath();g.arc(0,0,60,0,7);g.stroke();for(let k=0;k<4;k++){g.save();g.rotate(k*Math.PI/2);g.fillRect(-5,-60,10,60);g.restore()}g.beginPath();g.arc(0,0,14,0,7);g.fill()}
  else if(ic==='cube'){g.fillRect(-50,-50,100,100);g.fillStyle=bg;g.fillRect(-36,-36,30,30)}
  else{g.beginPath();for(let x=-100;x<=100;x+=5)g.lineTo(x,Math.sin(x/18)*20);g.stroke();g.beginPath();for(let x=-100;x<=100;x+=5)g.lineTo(x,40+Math.sin(x/18+1)*20);g.stroke()}
  g.restore()},1,1)}
function poster(i,x,y,z,ry){const p=deco(new THREE.PlaneGeometry(1.5,2.1),new THREE.MeshStandardMaterial({map:posterTex(i),roughness:.8}),x,y,z);p.rotation.y=ry;p.castShadow=false;return p}
/* пылинки в лучах ламп */
function dust(boxes2,n,hex){const N=n||500,pos=new Float32Array(N*3),seed=new Float32Array(N);const B=boxes2;
 for(let i=0;i<N;i++){const b=B[i%B.length];pos[i*3]=b[0]+Math.random()*(b[1]-b[0]);pos[i*3+1]=b[4]+Math.random()*(b[5]-b[4]);pos[i*3+2]=b[2]+Math.random()*(b[3]-b[2]);seed[i]=Math.random()*9}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));const m=new THREE.Points(g,new THREE.PointsMaterial({size:.05,color:hex||0xffe2b8,transparent:true,opacity:.55,blending:THREE.AdditiveBlending,depthWrite:false,map:softTex('rgba(255,255,255,1)','rgba(255,255,255,0)')}));
 m.frustumCulled=false;m.userData.dyn=1;mapGroup.add(m);
 mapAnims.push(dt=>{for(let i=0;i<N;i++){const s=seed[i];pos[i*3]+=Math.sin(lvT*.3+s)*dt*.12;pos[i*3+1]+=(Math.sin(lvT*.21+s*1.7)*.08-.02)*dt;pos[i*3+2]+=Math.cos(lvT*.27+s)*dt*.12;const b=B[i%B.length];if(pos[i*3+1]<b[4])pos[i*3+1]=b[5]}g.attributes.position.needsUpdate=true})}

/* ---------- двери-шлюзы и маяки выхода ---------- */
function addDoor(x,y,z,w,h,open,mat,mode){const t=.5,g=new THREE.Group();g.position.set(x,y,z);mapGroup.add(g);
 let slab,slabs=null;if(mode==='slide'){slabs=[-1,1].map(s=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w/2,h,.12),mat||SM.door);m.position.y=h/2;g.add(m);level.push(m);
   const fr=new THREE.Mesh(new THREE.BoxGeometry(.1,h,.16),beerMats().gold);fr.position.x=-s*(w/4-.05);m.add(fr);return m});slab=slabs[0]}
 else{slab=new THREE.Mesh(new THREE.BoxGeometry(w,h,t),mat||SM.door);g.add(slab);level.push(slab)}
 const lm=new THREE.MeshBasicMaterial({color:open?0x5fe0c8:0xff2a3a});for(const s of[-1,1]){const l=new THREE.Mesh(new THREE.BoxGeometry(w*.5,.16,.12),lm);l.position.set(0,h+.35,s*.56);g.add(l)}
 const box={min:new V3(x-w/2,y,z-t/2),max:new V3(x+w/2,y+h,z+t/2)};
 const d={g,slab,slabs,box,lm,open:!!open,k:open?1:0,h,w,x,y,z,mode};if(!open)boxes.push(box);doorPose(d);doors.push(d);return d}
function doorPose(d){if(d.slabs){const o=d.w/4+d.k*(d.w/2-.12);d.slabs[0].position.x=-o;d.slabs[1].position.x=o}else if(d.mode==='sink')d.slab.position.y=d.h/2-d.k*(d.h+.12);else d.slab.position.y=d.h/2+d.k*(d.h-.15)}
function setDoor(d,open,quiet){if(!d||d.open===open)return;d.open=open;const i=boxes.indexOf(d.box);if(open){if(i>=0)boxes.splice(i,1)}else if(i<0)boxes.push(d.box);
 d.lm.color.setHex(open?0x5fe0c8:0xff2a3a);if(!quiet){const v=sndV(d.x,d.y+2,d.z);if(v>.05)sfx('door',Math.max(.3,v))}}
/* маркеры-цилиндры: световой столб, гаснущий кверху, бегущие вверх полосы, яркое кольцо у пола.
   Высота подрезается по ближайшему потолку/платформе — столб не протыкает геометрию. */
let CYT=null;
function cylTex(){if(CYT)return CYT;const mk=(w,h,f,rep)=>{const c=document.createElement('canvas');c.width=w;c.height=h;f(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;if(rep)t.repeat.set(rep[0],rep[1]);return t};
 CYT={fade:mk(8,256,(g,w,h)=>{const gr=g.createLinearGradient(0,h,0,0);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.12,'rgba(255,255,255,.55)');gr.addColorStop(.6,'rgba(255,255,255,.12)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,w,h)}),
  bands:mk(8,128,(g,w,h)=>{g.clearRect(0,0,w,h);for(let y=0;y<h;y+=32){const gr=g.createLinearGradient(0,y,0,y+32);gr.addColorStop(0,'rgba(255,255,255,0)');gr.addColorStop(.75,'rgba(255,255,255,.9)');gr.addColorStop(.82,'rgba(255,255,255,1)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,y,w,32)}},[1,2]),
  base:mk(128,128,(g,w,h)=>{const gr=g.createRadialGradient(64,64,0,64,64,64);gr.addColorStop(0,'rgba(255,255,255,.0)');gr.addColorStop(.62,'rgba(255,255,255,.15)');gr.addColorStop(.86,'rgba(255,255,255,1)');gr.addColorStop(.93,'rgba(255,255,255,.5)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,w,h)})};return CYT}
function headroom(x,y,z,r,max){let top=max;for(const b of boxes){if(b.min.y<y+.3||x+r<b.min.x||x-r>b.max.x||z+r<b.min.z||z-r>b.max.z)continue;top=Math.min(top,b.min.y-y-.15)}return Math.max(1,top)}
function makeCyl(x,y,z,r,h,hex){const t=cylTex(),g=new THREE.Group();g.position.set(x,y+.03,z);
 const add=(geo,map,op,ry)=>{const m=new THREE.MeshBasicMaterial({color:hex,map,transparent:true,opacity:op,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide});const me=new THREE.Mesh(geo,m);me.position.y=ry;g.add(me);return me};
 const shell=add(new THREE.CylinderGeometry(r,r,h,40,1,true),t.fade,.55,h/2);
 const bt=t.bands.clone();bt.needsUpdate=true;const bands=add(new THREE.CylinderGeometry(r*1.01,r*1.01,h,40,1,true),bt,.35,h/2);bands.material.alphaMap=t.fade;
 const core=add(new THREE.CylinderGeometry(r*.55,r*.55,h*.7,24,1,true),t.fade,.3,h*.35);
 const base=add(new THREE.PlaneGeometry(r*2.7,r*2.7).rotateX(-Math.PI/2),t.base,.95,.02);base.renderOrder=3;
 g.userData={shell,bands,bt,core,base,r,h};return g}
function cylAnim(g,dt,k,pulse){const u=g.userData;u.bt.offset.y-=dt*(.6+k*1.6);const p=pulse==null?1:pulse;u.shell.material.opacity=.42*p+.12;u.bands.material.opacity=.3*p+.08;u.core.material.opacity=.22*p;u.base.material.opacity=.6+.4*p;u.base.rotation.y+=dt}
function addBeacon(di){const d=doors[di],w=d.box.max.x-d.box.min.x,g=makeCyl(d.x,d.y,d.z,Math.min(1.7,w/2-.4),Math.min(d.h-.15,headroom(d.x,d.y,d.z,1.7,5)),0x62e3ff);g.visible=false;mapGroup.add(g);beacons.push({d:di,g})}
function updBeacons(dt,S,R){for(const b of beacons){const on=((S.phase==='clear'||S.phase==='exit')&&R&&R.exit===b.d)||(S.room<0&&b.d===S.lv.open[0]);b.g.visible=on;if(on)cylAnim(b.g,dt,.2,.75+.25*Math.sin(lvT*3.5))}}
/* метка появления врага — красный цилиндр, сжимается к моменту появления */
function makeTele(pos,big){const r=big?2:1.2,h=headroom(pos.x,pos.y,pos.z,r,big?8:5),g=makeCyl(pos.x,pos.y,pos.z,r,h,big?0xff6a2a:0xff2a3a);scene.add(g);return g}
function teleAnim(t,dt){const u=t.m.userData;if(!u.shell){t.m.scale.x=t.m.scale.z=.3+t.t;return}if(!u.dur)u.dur=t.t+dt;const k=1-Math.max(0,t.t)/u.dur;
 const sc=1.15-.45*k;t.m.scale.set(sc,Math.min(1,.25+k*2.5),sc);cylAnim(t.m,dt,k,Math.min(1,k*3)*(.85+.15*Math.sin(T*28)));if(Math.random()<dt*14)puff(new V3(t.pos.x+rnd(-1,1)*u.r,t.pos.y+.2,t.pos.z+rnd(-1,1)*u.r),1,0xff6a6a,1.5,.5,-5)}

/* ---------- конвейеры ---------- */
function addBelt(x,z,w,d,vx,vz,bottles){const top=.5,ax=Math.abs(vx)>0,t=(ax?SM.beltX:SM.beltZ).clone();t.needsUpdate=true;
 const bm=new THREE.MeshStandardMaterial({map:t,roughness:.75,metalness:.1});const m=new THREE.Mesh(wbox(w,top,d,2),[SM.frame,SM.frame,bm,SM.frame,SM.frame,SM.frame]);
 m.position.set(x,top/2,z);mapGroup.add(m);level.push(m);solid(x,0,z,w,top,d);
 if(ax)for(const s of[-1,1])decoW(x,top-.06,z+s*(d/2+.07),w,.16,.14,SM.yel);else for(const s of[-1,1])decoW(x+s*(w/2+.07),top-.06,z,.14,.16,d,SM.yel);
 const rg=new THREE.CylinderGeometry(.3,.3,(ax?d:w)+.3,14);for(const s of[-1,1]){const r=deco(rg,SM.steel,ax?x+s*w/2:x,.28,ax?z:z+s*d/2);if(ax)r.rotation.x=Math.PI/2;else r.rotation.z=Math.PI/2}
 const sp=Math.hypot(vx,vz),dir=ax?Math.sign(vx):Math.sign(vz),L=ax?w:d;belts.push({min:new V3(x-w/2,0,z-d/2),max:new V3(x+w/2,top,z+d/2),vx,vz,t});
 let off=0;mapAnims.push(dt=>{off=(off+dt*sp/2)%1000;if(ax)t.offset.x=-off*dir;else t.offset.y=off*dir});
 if(bottles){const n=Math.floor(L/1.4),im=new THREE.InstancedMesh(bottleGeo,SM.bottle,n),o=new THREE.Object3D();im.castShadow=true;mapGroup.add(im);let ph=0;const lane=[];for(let i=0;i<n;i++)lane.push(((i*7)%3-1)*.75);
  mapAnims.push(dt=>{ph+=dt*sp;for(let i=0;i<n;i++){const u=((i*L/n+ph*dir)%L+L)%L-L/2;o.position.set(ax?x+u:x+lane[i],top,ax?z+lane[i]:z+u);o.scale.setScalar(1.8);o.rotation.set(0,i*1.3,0);o.updateMatrix();im.setMatrixAt(i,o.matrix)}im.instanceMatrix.needsUpdate=true})}}

/* ---------- гидропрессы ---------- */
const PPER=4.4;
function addPress(x,z,w,d,top,bot,off){const g=new THREE.Group();g.position.set(x,top,z);mapGroup.add(g);
 const head=new THREE.Mesh(wbox(w,1.6,d,2),SM.steel);head.position.y=.8;g.add(head);level.push(head);
 const sk=new THREE.Mesh(wbox(w+.12,.4,d+.12,1),SM.hz);sk.position.y=.2;g.add(sk);
 for(let i=0;i<4;i++){const rib=new THREE.Mesh(new THREE.BoxGeometry(w*.92,.18,.22),SM.dark);rib.position.set(0,1.62,-d/2+.6+i*(d-1.2)/3);g.add(rib)}
 const ram=new THREE.Mesh(new THREE.CylinderGeometry(.5,.5,1,16),SM.steel);g.add(ram);
 deco(new THREE.CylinderGeometry(1.05,1.05,3,20),SM.dark,x,12.2,z);
 for(const s of[-1,1]){addBoxW(x+s*(w/2+1),0,z,1,13,1.4,SM.yel,2);decoW(x+s*(w/2+.42),.5,z,.16,.08,d,SM.hz,1)}
 decoW(x,12.6,z,w+3.2,1,1.6,SM.dark);
 const lm=new THREE.MeshBasicMaterial({color:0x550a0a});for(const s of[-1,1])deco(new THREE.SphereGeometry(.3,12,8),lm,x+s*(w/2+1),13.4,z);
 const fl=new THREE.Mesh(new THREE.PlaneGeometry(w,d).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({color:0xff2a3a,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false}));fl.position.set(x,bot+.03,z);mapGroup.add(fl);
 presses.push({x,z,w,d,top,bot,off,g,ram,lm,fl,st:0,hit:new Set()})}
function pressF(c){if(c<2.3)return[0,0];if(c<3.1)return[0,1];if(c<3.24){const k=(c-3.1)/.14;return[k*k,2]}if(c<3.75)return[1,3];const k=Math.min(1,(c-3.75)/.65);return[1-smk(k),4]}
function updPresses(){for(const pr of presses){const c=((lvT+pr.off)%PPER+PPER)%PPER,[f,st]=pressF(c),hb=pr.top+(pr.bot-pr.top)*f;pr.g.position.y=hb;
  const L=10.7-(hb+1.6);pr.ram.scale.y=Math.max(.05,L);pr.ram.position.y=1.6+L/2;
  const fl=st===1&&Math.sin(lvT*26)>0;pr.lm.color.setHex(fl||st===2||st===3?0xff2a3a:0x550a0a);pr.fl.material.opacity=st===1?(fl?.32:.12):0;
  if(st===1&&pr.st!==1){pr.hit.clear();const v=sndV(pr.x,2,pr.z);if(v>.05)sfx('siren',v)}
  if(st===3&&pr.st===2){const v=sndV(pr.x,1,pr.z);if(v>.02)sfx('press',v);shake=Math.max(shake,.45*v*v);puff(new V3(pr.x,pr.bot+.3,pr.z),34,0xd8d0c4,9,.5,4)}
  if(st===2||st===3)crushCheck(pr,hb);pr.st=st}}
function crushCheck(pr,hb){const inF=p=>Math.abs(p.x-pr.x)<pr.w/2+.15&&Math.abs(p.z-pr.z)<pr.d/2+.15;
 if(P.alive&&!pr.hit.has('me')&&inF(P.pos)&&P.pos.y<hb+.05&&hb<P.pos.y+1.6){pr.hit.add('me');const s=Math.sign(P.pos.x-pr.x)||1;P.iT=0;hurt(42);P.iT=.5;
  P.pos.x=pr.x+s*(pr.w/2+.75);P.vel.set(s*15,8,P.vel.z*.2);P.grounded=false;banner('ПОД ПРЕССОМ!');feed.unshift({label:'− ПОД ПРЕСС',t:2.4})}
 if(mode==='solo'||isHost)for(const e of enemies){if(e.dead||e.remote||ENEMY[e.type].fly||pr.hit.has(e.id))continue;
  if(inF(e.pos)&&e.pos.y<hb+.05&&hb<e.pos.y+(e.type==='golem'?4:2.2)){pr.hit.add(e.id);if(ENEMY[e.type].boss){damage(e,18,99,'press');e.vel.x+=(Math.sign(e.pos.x-pr.x)||1)*22}else damage(e,9999,99,'press')}}}

/* ---------- карусель розлива ---------- */
function buildCarousel(cx,cz,R){const m=SM;discSolid(cx,cz,R,0,.5,1.1);
 const rot=new THREE.Group();rot.position.set(cx,0,cz);mapGroup.add(rot);
 const tc=document.createElement('canvas');tc.width=tc.height=512;{const g=tc.getContext('2d');g.fillStyle='#4a4d53';g.fillRect(0,0,512,512);g.translate(256,256);
  for(let i=0;i<16;i++){g.rotate(Math.PI/8);g.fillStyle=i%2?'#5b5f66':'#43464c';g.beginPath();g.moveTo(0,0);g.arc(0,0,256,0,Math.PI/8);g.fill()}
  g.strokeStyle='#f2b84b';g.lineWidth=14;g.beginPath();g.arc(0,0,240,0,7);g.stroke();g.strokeStyle='#1d1b1a';g.setLineDash([22,22]);g.lineWidth=14;g.beginPath();g.arc(0,0,240,0,7);g.stroke();
  g.setLineDash([]);g.strokeStyle='rgba(255,255,255,.15)';g.lineWidth=3;for(const r of[120,180])g.beginPath(),g.arc(0,0,r,0,7),g.stroke()}
 const dt2=new THREE.CanvasTexture(tc);dt2.anisotropy=8;
 const disc=new THREE.Mesh(new THREE.CylinderGeometry(R,R,.5,64),[m.frame,new THREE.MeshStandardMaterial({map:dt2,roughness:.5,metalness:.4,envMap:ENV,envMapIntensity:.4}),m.frame]);disc.position.y=.25;rot.add(disc);level.push(disc);
 const edge=new THREE.Mesh(new THREE.TorusGeometry(R,.06,6,96),new THREE.MeshBasicMaterial({color:0x62e3ff}));edge.rotation.x=Math.PI/2;edge.position.y=.52;rot.add(edge);
 const cols=[],N=8,rc=R-2.6;
 for(let k=0;k<N;k++){const a=k/N*Math.PI*2,lx=Math.sin(a)*rc,lz=Math.cos(a)*rc,cg=new THREE.Group();cg.position.set(lx,.5,lz);rot.add(cg);
  const body=new THREE.Mesh(new THREE.CylinderGeometry(.6,.7,4,16),m.steel);body.position.y=2;cg.add(body);level.push(body);
  const band=new THREE.Mesh(new THREE.CylinderGeometry(.64,.64,.5,16),m.red);band.position.y=3.1;cg.add(band);
  const cap=new THREE.Mesh(new THREE.CylinderGeometry(.35,.6,.6,16),m.dark);cap.position.y=4.3;cg.add(cap);
  const b=new THREE.Mesh(bottleGeo,m.bottle);b.scale.setScalar(2.4);b.position.set(0,0,.95);cg.add(b);
  const box={min:new V3(),max:new V3()};boxes.push(box);cols.push({lx,lz,box})}
 // центральный стеклянный бак с колой
 const hub=new THREE.Group();hub.position.set(cx,0,cz);mapGroup.add(hub);solid(cx,0,cz,5.6,16,5.6);
 const gl=new THREE.Mesh(new THREE.CylinderGeometry(2.8,2.8,8,40,1,true),m.glass);gl.position.y=5;hub.add(gl);level.push(gl);
 const liq=new THREE.Mesh(new THREE.CylinderGeometry(2.6,2.6,6.4,40),m.cola);liq.position.y=4.2;hub.add(liq);
 for(const y of[.5,9.3]){const r=new THREE.Mesh(new THREE.CylinderGeometry(3.1,3.1,1,40),m.steel);r.position.y=y;hub.add(r)}
 const top=new THREE.Mesh(new THREE.CylinderGeometry(1.4,2.2,6,24),m.dark);top.position.y=12.8;hub.add(top);
 // вращающееся кольцо дозаторов над полом
 const ring=new THREE.Group();ring.position.set(cx,10,cz);mapGroup.add(ring);const RR=R+3;
 const tor=new THREE.Mesh(new THREE.TorusGeometry(RR,.35,10,96),m.steel);tor.rotation.x=Math.PI/2;ring.add(tor);
 for(let k=0;k<4;k++){const arm=new THREE.Mesh(new THREE.BoxGeometry(RR*2,.4,.5),m.dark);arm.rotation.y=k*Math.PI/4;ring.add(arm)}
 const noz=[];for(let k=0;k<6;k++){const a=k/6*Math.PI*2+.26,lx=Math.sin(a)*RR,lz=Math.cos(a)*RR;
  const n=new THREE.Mesh(new THREE.CylinderGeometry(.22,.5,1.4,12),m.red);n.position.set(lx,-.8,lz);ring.add(n);
  const st=new THREE.Mesh(new THREE.CylinderGeometry(.14,.3,9.6,10,1,true),new THREE.MeshBasicMaterial({color:0x5a1a06,transparent:true,opacity:.8}));st.position.set(lx,-6.3,lz);st.visible=false;ring.add(st);
  noz.push({lx,lz,st,ph:k*1.1,on:false})}
 carousel={x:cx,z:cz,R,top:.5,w:.32,rot,ring,cols,noz,liq}}
function updCarousel(dt){const C=carousel;if(!C)return;const th=lvT*C.w,c=Math.cos(th),s=Math.sin(th);C.rot.rotation.y=th;C.ring.rotation.y=th;
 for(const k of C.cols){const x=C.x+k.lx*c+k.lz*s,z=C.z-k.lx*s+k.lz*c;k.box.min.set(x-.7,.5,z-.7);k.box.max.set(x+.7,5,z+.7)}
 for(const n of C.noz){const ph=((lvT+n.ph)%6.6+6.6)%6.6,on=ph<.9;n.st.visible=on;
  if(on&&!n.on){const x=C.x+n.lx*c+n.lz*s,z=C.z-n.lx*s+n.lz*c;addPuddle(x,0,z,1.8,9);const v=sndV(x,1,z);if(v>.05)sfx('spray',v*2)}
  if(on&&Math.random()<dt*20){const x=C.x+n.lx*c+n.lz*s,z=C.z-n.lx*s+n.lz*c;puff(new V3(x,.3,z),3,0x5a1a06,3,.5,8)}n.on=on}
 if(Math.random()<dt*6)puff(new V3(C.x+rnd(-2,2),rnd(1,7),C.z+rnd(-2,2)),1,0xf6eee2,.6,1.2,-2)}
const _cv=new V3();
function carryBody(p,r,h,dt){
 for(const b of belts)if(p.x>b.min.x&&p.x<b.max.x&&p.z>b.min.z&&p.z<b.max.z&&Math.abs(p.y-b.max.y)<.08){_cv.set(b.vx,0,b.vz);moveBody(p,_cv,r,h,dt,true);return 0}
 const C=carousel;if(C){const dx=p.x-C.x,dz=p.z-C.z;if(dx*dx+dz*dz<C.R*C.R&&Math.abs(p.y-C.top)<.08){const a=C.w*dt,ca=Math.cos(a),sa=Math.sin(a),nx=dx*ca+dz*sa,nz=-dx*sa+dz*ca;
  _cv.set((nx-dx)/dt,0,(nz-dz)/dt);moveBody(p,_cv,r,h,dt,true);return a}}return 0}

/* ---------- сироп: прилив и вентили ---------- */
function addPool(x0,x1,z0,z1,lo,hi){const w=x1-x0,d=z1-z0,geo=new THREE.PlaneGeometry(w,d).rotateX(-Math.PI/2),uv=geo.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*w/7,uv.getY(i)*d/7);
 const m=new THREE.Mesh(geo,SM.syr);m.position.set((x0+x1)/2,lo,(z0+z1)/2);m.renderOrder=2;mapGroup.add(m);pools.push({x0,x1,z0,z1,lo,hi,dry:-.7,y:lo,m})}
function tideTarget(){const c=lvT%22;if(c<9)return 0;if(c<12)return smk((c-9)/3);if(c<17)return 1;if(c<20)return 1-smk((c-17)/3);return 0}
let surgeK=0;
function updTide(dt){if(!pools.length)return;const fight=story&&story.phase==='fight',R=story&&story.room>=0?story.lv.rooms[story.room]:null,B=R&&(R.bounds||R.trig),t0=tideK;
 surgeK+=((surgeT>0?.42:0)-surgeK)*Math.min(1,dt*3);let act=null;
 // сироп поднимается только в зале, где идёт бой (двери закрыты), и сам не уходит — только вентилем
 for(const p of pools){if(p.tk==null){p.tk=0;p.wk=1}const cx=(p.x0+p.x1)/2,cz=(p.z0+p.z1)/2,here=B&&cx>=B[0]-1&&cx<=B[1]+1&&cz>=B[2]-1&&cz<=B[3]+1;
  if(here&&drainT>0){p.wk=Math.max(0,p.wk-dt*1.1);p.tk=Math.max(0,p.tk-dt*.9)}else if(here&&fight){p.wk=Math.min(1,p.wk+dt*.15);p.tk=Math.min(1,p.tk+dt/26)}
  if(here)act=p;const wet=p.lo+(p.hi-p.lo)*(p.tk+(here?surgeK:0));p.y=p.dry+(wet-p.dry)*p.wk+(p.fl||0);p.m.position.y=p.y;p.m.visible=p.y>-.55}
 if(act){tideK=act.tk;wetK=act.wk}
 if(!L3&&fight&&drainT<=0&&t0<.12&&tideK>=.12){sfx('siren',.8);banner('СИРОП ПОДНИМАЕТСЯ — КРУТИ ВЕНТИЛЬ!')}
 if(Math.random()<dt*7){const p=pools[Math.floor(Math.random()*pools.length)],x=rnd(p.x0,p.x1),z=rnd(p.z0,p.z1);if(p.y>groundAt(x,z,p.y)+.05)puff(new V3(x,p.y+.05,z),3,0xffb050,1.3,.6,-1)}}
function addValve(x,y,z,ry){const g=new THREE.Group();g.position.set(x,y,z);g.rotation.y=ry;mapGroup.add(g);
 const pipe=new THREE.Mesh(new THREE.CylinderGeometry(.26,.26,1.1,14),SM.pipe);pipe.rotation.x=Math.PI/2;pipe.position.z=.15;g.add(pipe);
 const fla=new THREE.Mesh(new THREE.CylinderGeometry(.55,.55,.14,18),SM.dark);fla.rotation.x=Math.PI/2;fla.position.z=-.36;g.add(fla);
 for(const s of[-1,1]){const p2=new THREE.Mesh(new THREE.CylinderGeometry(.2,.2,3,12),SM.pipe);p2.position.set(s*.9,0,-.3);g.add(p2)}
 const wheel=new THREE.Group();wheel.position.z=.78;g.add(wheel);
 const wm=new THREE.MeshStandardMaterial({color:0xd0142a,roughness:.35,metalness:.3,emissive:0x550000});
 const rim=new THREE.Mesh(new THREE.TorusGeometry(.62,.085,10,28),wm);wheel.add(rim);for(let i=0;i<4;i++){const s=new THREE.Mesh(new THREE.BoxGeometry(1.22,.09,.09),wm);s.rotation.z=i*Math.PI/4;wheel.add(s)}
 wheel.add(new THREE.Mesh(new THREE.SphereGeometry(.17,10,8),SM.steel));
 const glowM=new THREE.MeshBasicMaterial({color:0xff2a3a,transparent:true,opacity:.5,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide});const glow=new THREE.Mesh(new THREE.RingGeometry(.74,1,32),glowM);glow.position.z=.8;g.add(glow);
 const sg=new THREE.Mesh(new THREE.PlaneGeometry(1.7,.46),new THREE.MeshBasicMaterial({map:signTex('СЛИВ','#f6eee2','#8a0f1f',512,140,'bold 96px "Russo One",Arial')}));sg.position.set(0,1.2,-.28);g.add(sg);
 g.updateMatrixWorld(true);const wp=new V3();wheel.getWorldPosition(wp);valves.push({g,wheel,wm,glowM,pos:wp,spin:0})}
function valveHit(v){if(!story||drainT>0)return;v.spin=2.5;if(mode==='coop'&&!isHost&&mp()){pushFx(['v',0,valves.indexOf(v)]);sfx('ding',.6);return}openValve(valves.indexOf(v),true)}
function openValve(i,mine){if(drainT>0||!valves[i])return;drainT=10;valves[i].spin=2.5;banner('СЛИВ СИРОПА — 10 СЕКУНД');sfx('drain');if(mine)addStyle('СЛИВ',40);if(enemies.some(e=>e.type==='queen'&&!e.dead))feed.unshift({label:'ЦАРИЦА НА МЕЛИ: +50% УРОНА',t:3})}

/* ---------- лужи сиропа, снаряды по дуге, шипы, волна ---------- */
const GOO_G=new THREE.CircleGeometry(1,24).rotateX(-Math.PI/2),MARK_G=new THREE.RingGeometry(.82,1,40).rotateX(-Math.PI/2);let gooMat=null;
function addGoo(x,y,z,r,life){if(!gooMat)gooMat=new THREE.MeshStandardMaterial({color:0xc8661a,roughness:.06,metalness:.1,transparent:true,opacity:.85,envMap:ENV,emissive:0x3a1400,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2});
 const m=new THREE.Mesh(GOO_G,gooMat.clone());m.position.set(x,y+.035,z);m.scale.setScalar(.2);scene.add(m);goo.push({x,y,z,r,t:life,life,m});if(goo.length>18){scene.remove(goo[0].m);goo.shift()}}
function updGoo(dt){for(const g of goo){g.t-=dt;const k=Math.min(1,(g.life-g.t)*5);g.m.scale.setScalar(g.r*(.3+.7*k));g.m.material.opacity=.85*Math.min(1,g.t)}goo=goo.filter(g=>{if(g.t<=0)scene.remove(g.m);return g.t>0})}
function gooAt(p){for(const g of goo)if(g.t>.3&&Math.abs(p.y-g.y)<.6&&Math.hypot(p.x-g.x,p.z-g.z)<g.r)return g;return null}
function lobShot(from,to,tf,dmg,size,hex,kind){const g=18,v=new V3((to.x-from.x)/tf,(to.y-from.y+.5*g*tf*tf)/tf,(to.z-from.z)/tf);
 const m=new THREE.Mesh(new THREE.SphereGeometry(size,14,10),new THREE.MeshBasicMaterial({color:hex}));m.position.copy(from);scene.add(m);
 const p={m,vel:v,owner:'enemy',dmg,r:size,t:tf+2.5,kind,g,landY:to.y,netId:++pnid};proj.push(p);if(kind==='bomb')markLanding(p);sfx('orb',.5);return p}
function markLanding(p){const g=p.g,vy=p.vel.y,dy=p.m.position.y-p.landY,ds=vy*vy+2*g*dy;if(ds<0)return;const t=(vy+Math.sqrt(ds))/g;
 const mk=new THREE.Mesh(MARK_G,new THREE.MeshBasicMaterial({color:0xff5a1a,transparent:true,opacity:.7,depthWrite:false,side:THREE.DoubleSide}));mk.position.set(p.m.position.x+p.vel.x*t,p.landY+.09,p.m.position.z+p.vel.z*t);mk.scale.setScalar(3.4);scene.add(mk);p.mark=mk}
function lobLand(p){const pos=p.m.position;if(p.mark){scene.remove(p.mark);p.mark=null}const y=Math.min(pos.y,Math.max(p.landY,pos.y-.6)),pc=tmpA.set(P.pos.x,P.pos.y+.9,P.pos.z),d=pc.distanceTo(pos);
 if(p.kind==='bomb'){blast(pos,3.4,0xffa030);sfx('boom',.6*Math.max(.2,sndV(pos.x,pos.y,pos.z)));puff(pos,50,0xc8661a,10,.8,8);addGoo(pos.x,y,pos.z,2.5,7);
  if(P.alive&&d<3.7){const f=1-d/3.7;hurt(Math.round(8+14*f));if(P.iT<=0){P.vel.add(tmpB.subVectors(pc,pos).normalize().multiplyScalar(10*f));P.vel.y+=6*f}}}
 else{puff(pos,30,0xffa030,6,.7,8);addGoo(pos.x,y,pos.z,2.1,7);sfx('gloop',.6*Math.max(.2,sndV(pos.x,pos.y,pos.z)));if(P.alive&&d<1.9)hurt(9)}}
let crackTx=null,spikeGeo=null,spikeMat=null;const CRACK_G=new THREE.PlaneGeometry(1,1).rotateX(-Math.PI/2);
function crackT(){if(crackTx)return crackTx;const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d');g.strokeStyle='#fff';g.lineCap='round';
 for(let i=0;i<7;i++){let x=64,y=64,a=i/7*Math.PI*2+Math.random()*.4;g.lineWidth=5;g.beginPath();g.moveTo(x,y);for(let s=0;s<5;s++){a+=rnd(-.5,.5);x+=Math.cos(a)*11;y+=Math.sin(a)*11;g.lineTo(x,y);g.lineWidth=5-s}g.stroke()}
 const gr=g.createRadialGradient(64,64,0,64,64,30);gr.addColorStop(0,'rgba(255,255,255,.9)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,128,128);crackTx=new THREE.CanvasTexture(c);return crackTx}
function spikeMesh(){if(!spikeMat){spikeGeo=new THREE.ConeGeometry(.4,2.7,5);spikeGeo.translate(0,1.35,0);spikeMat=new THREE.MeshStandardMaterial({color:0xeef9ff,roughness:.04,metalness:.1,transparent:true,opacity:.86,envMap:ENV,emissive:0x264866})}
 const g=new THREE.Group();for(const [x,z,s,rx,rz] of [[0,0,1,0,0],[.36,.1,.7,.28,-.3],[-.32,-.2,.62,-.3,.26],[.05,-.36,.5,.36,.2]]){const m=new THREE.Mesh(spikeGeo,spikeMat);m.position.set(x,0,z);m.scale.setScalar(s);m.rotation.set(rx,0,rz);g.add(m)}return g}
function spikeAt(x,z,delay,dmg,grp){quakes.push({x,z,y:surfY(x,z),t:-delay-.8,dmg,grp,m:null,c:null})}
function spikeLine(x0,z0,a,n,dmg){const grp=new Set();for(let i=0;i<n;i++){const d=3.8+i*2.3,x=x0+Math.sin(a)*d,z=z0+Math.cos(a)*d;if(x<mapB.x0+.5||x>mapB.x1-.5||z<mapB.z0+.5||z>mapB.z1-.5)break;spikeAt(x,z,i*.07,dmg,grp)}}
function spikeRing(x0,z0,r,dmg){const grp=new Set();for(let i=0;i<10;i++){const a=i/10*Math.PI*2;spikeAt(x0+Math.sin(a)*r,z0+Math.cos(a)*r,0,dmg,grp)}}
function updQuakes(dt){for(const q of quakes){const pt=q.t;q.t+=dt;
  if(!q.c&&q.t>-.8){q.c=new THREE.Mesh(CRACK_G,new THREE.MeshBasicMaterial({map:crackT(),color:0xffa040,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));q.c.position.set(q.x,q.y+.07,q.z);q.c.rotation.y=Math.random()*6;q.c.scale.setScalar(2.7);scene.add(q.c)}
  if(q.c)q.c.material.opacity=q.t<0?.35+.65*Math.abs(Math.sin(q.t*20)):Math.max(0,1-q.t*2);
  if(pt<0&&q.t>=0){q.m=spikeMesh();q.m.position.set(q.x,q.y,q.z);q.m.rotation.y=Math.random()*6;scene.add(q.m);puff(new V3(q.x,q.y+.3,q.z),10,0xeaf8ff,6,.5,8);
   if(q.dmg)for(const c of targets()){const key=c.local?'me':c.peer;if(q.grp.has(key))continue;if(Math.hypot(c.pos.x-q.x,c.pos.z-q.z)<1.5&&c.pos.y>q.y-1.2&&c.pos.y<q.y+2.6){q.grp.add(key);hitTarget(c,20,new V3(0,13,0))}}
   const v=sndV(q.x,q.y,q.z);if(v>.1&&Math.random()<.35)sfx('crack',v)}
  if(q.m){const k=q.t<.12?q.t/.12:q.t>1.3?Math.max(.01,1-(q.t-1.3)/.3):1;q.m.scale.set(1,k,1)}}
 quakes=quakes.filter(q=>{const end=q.t>1.6;if(end){if(q.m)scene.remove(q.m);if(q.c)scene.remove(q.c)}return!end})}
const WR_G=new THREE.CylinderGeometry(.97,1,1,96,1,true);WR_G.translate(0,.5,0);
function waveRing(x,y,z,dmg){const m=new THREE.Mesh(WR_G,new THREE.MeshStandardMaterial({color:0xd8801f,roughness:.08,metalness:.1,transparent:true,opacity:.85,envMap:ENV,emissive:0x5a2000,side:THREE.DoubleSide,depthWrite:false}));
 m.position.set(x,y,z);scene.add(m);wrings.push({x,y,z,R:3,m,dmg,hit:new Set()})}
function updWrings(dt){for(const w of wrings){w.R+=14*dt;const yl=syrupLvl(w.x,w.z);if(yl>-50)w.y=Math.max(yl,0);w.m.position.y=w.y-.1;w.m.scale.set(w.R,1.5,w.R);w.m.material.opacity=Math.max(0,.85-Math.pow(w.R/36,3));
  if(Math.random()<dt*36){const a=Math.random()*6.28;puff(new V3(w.x+Math.sin(a)*w.R,w.y+1.2,w.z+Math.cos(a)*w.R),2,0xffd08a,3,.5,8)}
  if(w.dmg)for(const c of targets()){const key=c.local?'me':c.peer;if(w.hit.has(key))continue;const d=Math.hypot(c.pos.x-w.x,c.pos.z-w.z);
   if(Math.abs(d-w.R)<1.1&&c.pos.y<w.y+1.3){w.hit.add(key);hitTarget(c,26,new V3(c.pos.x-w.x,0,c.pos.z-w.z).normalize().multiplyScalar(15).setY(9))}}}
 wrings=wrings.filter(w=>{const end=w.R>36;if(end)scene.remove(w.m);return!end})}
function qfx(sub,...a){if(mp()&&isHost)pushFx(['q',0,sub,...a.map(r1)])}
function clearStoryFx(){queenSyrupReset();for(const k of kmarks){scene.remove(k.m);scene.remove(k.f)}kmarks=[];goo.forEach(g=>scene.remove(g.m));goo=[];quakes.forEach(q=>{if(q.m)scene.remove(q.m);if(q.c)scene.remove(q.c)});quakes=[];wrings.forEach(w=>scene.remove(w.m));wrings=[];
 for(const p of proj)if(p.mark){scene.remove(p.mark);p.mark=null}$('syr').style.opacity=0}

/* ================= новые враги ================= */
/* Встряхнутая банка: катится, встаёт, трясётся, взрывается шипучкой */
function buildCan(g,mm){const lc=document.createElement('canvas');lc.width=512;lc.height=256;const c=lc.getContext('2d');
 c.fillStyle='#c8102e';c.fillRect(0,0,512,256);const gr=c.createLinearGradient(0,0,0,256);gr.addColorStop(0,'rgba(255,255,255,.18)');gr.addColorStop(.5,'rgba(0,0,0,0)');gr.addColorStop(1,'rgba(0,0,0,.25)');c.fillStyle=gr;c.fillRect(0,0,512,256);
 c.fillStyle='#eef1f5';c.beginPath();c.moveTo(0,176);for(let x=0;x<=512;x+=8)c.lineTo(x,176+Math.sin(x/512*Math.PI*4)*14);for(let x=512;x>=0;x-=8)c.lineTo(x,204+Math.sin(x/512*Math.PI*4+1)*10);c.fill();
 c.fillStyle='#fff';for(const x of[212,300]){c.beginPath();c.ellipse(x,96,30,34,0,0,7);c.fill()}c.fillStyle='#1a0505';for(const x of[220,292]){c.beginPath();c.arc(x,104,13,0,7);c.fill()}
 c.strokeStyle='#1a0505';c.lineWidth=14;c.lineCap='round';c.beginPath();c.moveTo(172,52);c.lineTo(236,76);c.moveTo(340,52);c.lineTo(276,76);c.stroke();
 c.fillStyle='#1a0505';c.beginPath();c.moveTo(206,140);c.lineTo(306,140);c.lineTo(292,160);c.lineTo(220,160);c.fill();c.fillStyle='#fff';for(let x=214;x<300;x+=16){c.beginPath();c.moveTo(x,140);c.lineTo(x+8,152);c.lineTo(x+16,140);c.fill()}
 c.font='italic 900 54px "Russo One",Arial';c.textAlign='center';c.fillStyle='#fff';c.fillText('ГАЗ!',70,120);c.fillText('ГАЗ!',442,120);
 c.fillStyle='rgba(0,0,0,.25)';for(const [x,y,r] of[[120,60,22],[380,150,18],[40,190,14]]){c.beginPath();c.ellipse(x,y,r,r*.6,.4,0,7);c.fill()}
 const tx=new THREE.CanvasTexture(lc);tx.anisotropy=4;const body=mm(0xffffff,{map:tx,metalness:.5,roughness:.28,envMap:ENV}),sil=mm(0xdfe4ea,{metalness:.95,roughness:.18,envMap:ENV});
 const roll=new THREE.Group();roll.position.y=.62;g.add(roll);const can=new THREE.Group();can.rotation.z=Math.PI/2;roll.add(can);
 can.add(new THREE.Mesh(new THREE.CylinderGeometry(.6,.6,1.3,28,1,true,-Math.PI,Math.PI*2),body));
 for(const s of[-1,1]){const l=new THREE.Mesh(new THREE.CylinderGeometry(s>0?.5:.56,s>0?.6:.5,.14,28),sil);l.position.y=s*.72;can.add(l);const r=new THREE.Mesh(new THREE.TorusGeometry(.53,.045,8,28),sil);r.rotation.x=Math.PI/2;r.position.y=s*.79;can.add(r)}
 const tab=new THREE.Mesh(new THREE.TorusGeometry(.12,.035,6,14),sil);tab.rotation.x=Math.PI/2;tab.position.set(.14,.8,0);can.add(tab);
 g.userData.roll=roll;g.userData.can=can;return new THREE.MeshBasicMaterial({color:0xffffff})}
function canAI(e,t,to,dist,dt){if(e.shk>0){e.shk-=dt;e.ac=1;e.vel.x*=.8;e.vel.z*=.8;if(Math.random()<dt*30)puff(new V3(e.pos.x,e.pos.y+1.4,e.pos.z),2,0xf6eee2,4,.4,-4);if(e.shk<=0)canBurst(e,true);return}
 e.ac=0;const sp=e.speed*(e.wet>0?.75:1),side=Math.sin(T*3+e.seed)*3;e.vel.x+=(to.x*sp-to.z*side-e.vel.x)*Math.min(1,dt*3);e.vel.z+=(to.z*sp+to.x*side-e.vel.z)*Math.min(1,dt*3);
 if(dist<3.4&&Math.abs(t.pos.y-e.pos.y)<2.4&&e.onGround){e.shk=.75;sfx('hiss',Math.max(.3,sndV(e.pos.x,e.pos.y,e.pos.z)))}
 if(Math.random()<dt*5){const s=e.g.userData.can;puff(new V3(e.pos.x,e.pos.y+.6,e.pos.z),2,0xf6eee2,3,.4,-3)}}
function canAnim(e,dt){const u=e.g.userData,roll=u.roll,can=u.can;if(!roll)return;const k=Math.min(1,dt*10);
 if(e.ac===1){can.rotation.z+=(0-can.rotation.z)*k;const tw=Math.round(roll.rotation.x/(Math.PI*2))*Math.PI*2;roll.rotation.x+=(tw-roll.rotation.x)*k;roll.position.y+=(.74-roll.position.y)*k;
  can.position.set(rnd(-.07,.07),0,rnd(-.07,.07));const b=1+(.75-Math.max(0,e.shk||0))*.35;can.scale.set(b,1+(b-1)*.4,b);e.mats.forEach(m=>m.emissive.setHex(Math.sin(T*40)>0?0x883322:0x331111))}
 else{can.rotation.z+=(Math.PI/2-can.rotation.z)*k;roll.position.y+=(.62-roll.position.y)*k;can.position.set(0,0,0);can.scale.set(1,1,1);
  const sp=e.remote?(e.lp?Math.hypot(e.pos.x-e.lp.x,e.pos.z-e.lp.z)/Math.max(dt,1e-3):0):Math.hypot(e.vel.x,e.vel.z);roll.rotation.x+=sp/.6*dt}
 if(e.remote){e.lp=e.lp||new V3();e.lp.copy(e.pos)}}
function canBurst(e,hostile){if(e.burst)return;e.burst=1;const p=center(e,new V3()),gy=groundAt(e.pos.x,e.pos.z,e.pos.y+.6);
 blast(p,4.6,0xfff1dc);puff(p,70,0xf6eee2,13,.9,5);puff(p,40,0x6b2a12,10,1,8);sfx('boom',.8*Math.max(.3,sndV(p.x,p.y,p.z)));sfx('hiss',.5);addPuddle(e.pos.x,gy,e.pos.z,2.3,9);shake=Math.max(shake,.25*sndV(p.x,p.y,p.z));
 if(e.remote)return;if(mp())pushFx(['k',0,r1(p.x),r1(p.y),r1(p.z),r1(gy)]);
 if(hostile){for(const c of targets()){const d=Math.hypot(c.pos.x-p.x,c.pos.z-p.z);if(d<4.8&&Math.abs(c.pos.y-e.pos.y)<3){const f=1-d/4.8;hitTarget(c,Math.round(10+18*f),new V3(c.pos.x-p.x,0,c.pos.z-p.z).normalize().multiplyScalar(15*f).setY(6+4*f))}}
  for(const o of enemies)if(o!==e&&!o.dead&&center(o,tmpA).distanceTo(p)-o.r<3.5)damage(o,1.2,99,'x');kill(e,'self',true)}
 else for(const o of enemies)if(o!==e&&!o.dead){const d=center(o,tmpA).distanceTo(p)-o.r;if(d<5){const f=1-Math.max(0,d)/5;damage(o,7*(.5+.5*f),99,'canbomb');if(!o.remote&&!ENEMY[o.type].boss){o.vel.add(tmpB.subVectors(o.pos,p).setY(0).normalize().multiplyScalar(12*f));o.vel.y+=5*f}}}}
function canPass(e,aim){e.dead=true;e.shk=0;kills++;addStyle('ПАС БАНКОЙ',100);sfx('parry');const m=e.g;m.position.copy(camera.position).addScaledVector(aim,1.6);
 proj.push({m,vel:aim.clone().multiplyScalar(42),owner:'player',kind:'canball',dmg:0,r:.75,t:3})}

/* Сиропная медуза: парит, кидает липкие сгустки, ныряет и жалит */
let jellyGlow=null;
function buildJelly(g,mm){const amber=mm(0xff8a1a,{transparent:true,opacity:.36,roughness:.06,metalness:0,envMap:ENV,side:THREE.DoubleSide,depthWrite:false}),deep=mm(0xb84a0a,{transparent:true,opacity:.5,roughness:.1,envMap:ENV,depthWrite:false});
 const body=new THREE.Group();g.add(body);
 const bell=new THREE.Mesh(new THREE.SphereGeometry(1.15,28,16,0,Math.PI*2,0,Math.PI*.54),amber);bell.position.y=.1;body.add(bell);
 const inner=new THREE.Mesh(new THREE.SphereGeometry(.78,20,12,0,Math.PI*2,0,Math.PI*.6),deep);inner.position.y=.05;body.add(inner);
 const rim=new THREE.Mesh(new THREE.TorusGeometry(1.08,.1,8,36),deep);rim.rotation.x=Math.PI/2;rim.position.y=-.02;body.add(rim);
 for(let i=0;i<12;i++){const a=i/12*Math.PI*2,s=new THREE.Mesh(new THREE.SphereGeometry(.17,8,6),amber);s.position.set(Math.sin(a)*1.1,-.08,Math.cos(a)*1.1);s.scale.y=.6;body.add(s)}
 const coreM=new THREE.MeshBasicMaterial({color:0xfff1c0});const core=new THREE.Mesh(new THREE.BoxGeometry(.42,.42,.42),coreM);core.position.y=.42;body.add(core);
 if(!jellyGlow)jellyGlow=new THREE.SpriteMaterial({map:softTex('rgba(255,190,90,1)','rgba(255,120,20,0)'),blending:THREE.AdditiveBlending,depthWrite:false,transparent:true,opacity:.55});
 const gl=new THREE.Sprite(jellyGlow);gl.scale.set(1.25,1.25,1);gl.position.y=.42;body.add(gl);
 const eyeB=new THREE.MeshStandardMaterial({color:0x120404,roughness:.05,metalness:.3,envMap:ENV}),hi=new THREE.MeshBasicMaterial({color:0xffffff});
 for(const s of[-1,1]){const e=new THREE.Mesh(new THREE.SphereGeometry(.15,12,8),eyeB);e.position.set(s*.34,.48,.98);body.add(e);const h=new THREE.Mesh(new THREE.SphereGeometry(.045,6,4),hi);h.position.set(s*.34+.05,.53,1.12);body.add(h)}
 const lic=[mm(0x1a0a0a,{roughness:.3,metalness:.1}),mm(0xb0122a,{roughness:.3,metalness:.1})],seg=new THREE.CylinderGeometry(.065,.06,.46,8);seg.translate(0,-.23,0);
 const tents=[];for(let i=0;i<7;i++){const a=i/7*Math.PI*2+.2;let par=new THREE.Group();par.position.set(Math.sin(a)*.72,-.05,Math.cos(a)*.72);body.add(par);const ch=[par];
  for(let k=0;k<5;k++){const m=new THREE.Mesh(seg,lic[(k+i)%2]);par.add(m);const nx=new THREE.Group();nx.position.y=-.46;par.add(nx);par=nx;ch.push(nx)}tents.push({ch,a})}
 const rib=new THREE.MeshStandardMaterial({color:0xffb050,transparent:true,opacity:.45,side:THREE.DoubleSide,depthWrite:false,roughness:.2});
 const arms=[];for(let i=0;i<3;i++){const p=new THREE.Mesh(new THREE.PlaneGeometry(.32,1.8,1,6),rib);p.geometry.translate(0,-.9,0);p.position.set(Math.sin(i*2.1)*.2,-.05,Math.cos(i*2.1)*.2);p.rotation.y=i*2.1;body.add(p);arms.push(p)}
 g.userData.j={body,bell,core,tents,arms};return coreM}
function jellyAI(e,t,to,dist,dt){const u=e.g.userData.j;e.cd2-=0;
 if(e.dive>0){e.dive-=dt;e.ac=1;if(e.dive>.85){e.vel.multiplyScalar(.85);e.mats.forEach(m=>m.emissive.setHex(Math.sin(T*40)>0?0x881100:0))}
  else if(e.dive>.35){e.vel.set(to.x*2,-17,to.z*2);if(e.pos.y<t.pos.y+1.4){e.dive=.35;e.pos.y=Math.max(e.pos.y,t.pos.y+1.2)}
   if(!e.stung)for(const c of targets()){if(Math.hypot(c.pos.x-e.pos.x,c.pos.z-e.pos.z)<2.2&&Math.abs(c.pos.y+1-e.pos.y)<2.2){e.stung=1;hitTarget(c,16,new V3(c.pos.x-e.pos.x,0,c.pos.z-e.pos.z).normalize().multiplyScalar(10).setY(5));puff(e.pos,20,0xffa53a,7,.5)}}}
  else e.vel.set(0,9,0);return}
 e.ac=0;const gy=Math.max(t.pos.y,surfY(e.pos.x,e.pos.z)),ty=gy+5+Math.sin(T*1.1+e.seed)*1.1,rad=dist<8?-3:dist>15?3.5:0,sd=e.strafe*2.6;
 e.vel.x+=(to.x*rad-to.z*sd-e.vel.x)*Math.min(1,dt*1.5);e.vel.z+=(to.z*rad+to.x*sd-e.vel.z)*Math.min(1,dt*1.5);e.vel.y=(ty-e.pos.y)*1.6;if(Math.random()<dt*.25)e.strafe*=-1;
 if(e.cd<=0&&dist<30){const tf=1.05,px=t.pos.x+t.vel.x*tf*.7,pz=t.pos.z+t.vel.z*tf*.7;if(los(center(e,tmpC),new V3(t.pos.x,t.pos.y+1,t.pos.z)))lobShot(new V3(e.pos.x,e.pos.y-.4,e.pos.z),new V3(px,Math.max(groundAt(px,pz,t.pos.y+.6),syrupLvl(px,pz)),pz),tf,10,.38,0xffa030,'blob');e.cd=rnd(2.2,3.4)}
 if(e.cd2<=0&&dist<3&&e.pos.y-t.pos.y>2.4){e.dive=1.25;e.stung=0;e.cd2=rnd(4,6);sfx('charge',.4)}}
function jellyAnim(e,dt){const u=e.g.userData.j;if(!u)return;const t=T*3.2+e.seed,p=Math.sin(t);u.bell.scale.set(1-.1*p,1+.14*p,1-.1*p);u.body.position.y=Math.sin(t-1)*.08;u.core.rotation.set(t*.4,t*.6,0);
 const spread=e.ac===1?.9:.18;for(const tn of u.tents)tn.ch.forEach((c,k)=>{c.rotation.x=Math.sin(t-k*.8+tn.a)*.32+(k===0?spread*Math.cos(tn.a):0);c.rotation.z=(k===0?-spread*Math.sin(tn.a):0)+Math.cos(t*.7-k*.6+tn.a)*.15});
 u.arms.forEach((a,i)=>a.rotation.x=Math.sin(t*.8+i*2)*.25)}

/* Карамельная Царица: босс второго уровня */
/*v9*/function buildQueen(g,mm){if(typeof QUEEN_T!=='undefined'&&QUEEN_T&&QUEEN_T!=='load')return buildQueenM(g,mm);const E={envMap:ENV,envMapIntensity:1.1},car=mm(0xd8801f,{roughness:.1,metalness:.05,transparent:true,opacity:.86,...E}),car2=mm(0xa8500e,{roughness:.14,metalness:.05,transparent:true,opacity:.92,...E}),gold=mm(0xf2c14b,{metalness:1,roughness:.2,...E});
 const lathe=(pts,mat,par=g)=>{const m=new THREE.Mesh(new THREE.LatheGeometry(pts.map(([r,y])=>new THREE.Vector2(r,y)),40),mat);par.add(m);return m};
 lathe([[5.6,-1.2],[4.9,.3],[3.9,1.5],[2.9,2.7],[2.05,3.9],[1.62,4.6]],car2);
 lathe([[1.62,4.45],[1.44,5.1],[1.82,6.1],[2.36,7.2],[2.56,7.9],[2.12,8.6],[1.02,9.1],[.62,9.32],[.001,9.34]],car);
 const dg=new THREE.SphereGeometry(.22,10,8);for(let i=0;i<18;i++){const a=i/18*Math.PI*2+rnd(-.1,.1),r=rnd(2.4,3.9),d=new THREE.Mesh(dg,car2);d.position.set(Math.sin(a)*r,rnd(1.4,3.2),Math.cos(a)*r);d.scale.set(1,rnd(2,3.6),1);g.add(d)}
 for(let i=0;i<8;i++){const a=i/8*Math.PI*2,d=new THREE.Mesh(dg,car);d.position.set(Math.sin(a)*2.2,rnd(6.6,7.6),Math.cos(a)*2.2);d.scale.set(.8,rnd(2.4,3.4),.8);g.add(d)}
 const hg=new THREE.Group();hg.position.set(0,6.9,1.78);g.add(hg);const cav=new THREE.Mesh(new THREE.TorusGeometry(.8,.17,10,28),car2);hg.add(cav);
 const heartM=new THREE.MeshBasicMaterial({color:0xfff2c8}),heart=new THREE.Mesh(new THREE.BoxGeometry(.82,.82,.82),heartM);heart.rotation.set(.6,.7,0);hg.add(heart);
 const glow=new THREE.Sprite(new THREE.SpriteMaterial({map:softTex('rgba(255,210,130,1)','rgba(255,120,30,0)'),blending:THREE.AdditiveBlending,depthWrite:false,transparent:true}));glow.scale.set(3.6,3.6,1);hg.add(glow);
 const head=new THREE.Group();head.position.set(0,10.45,0);g.add(head);const sk=new THREE.Mesh(new THREE.SphereGeometry(1.38,30,20),car);sk.scale.set(1,1.12,.96);head.add(sk);
 const eyeM=new THREE.MeshBasicMaterial({color:0xfff6c8});for(const s of[-1,1]){const e=new THREE.Mesh(new THREE.BoxGeometry(.34,.34,.34),eyeM);e.rotation.z=Math.PI/4;e.position.set(s*.52,.2,1.2);head.add(e);
  const b=new THREE.Mesh(new THREE.BoxGeometry(.72,.15,.22),car2);b.position.set(s*.52,.58,1.16);b.rotation.z=-s*.38;head.add(b)}
 const mo=new THREE.Mesh(new THREE.BoxGeometry(.95,.2,.22),mm(0x2a0c02,{roughness:.2}));mo.position.set(0,-.42,1.26);head.add(mo);
 for(const x of[-.3,.05,.32]){const d=new THREE.Mesh(new THREE.CylinderGeometry(.05,.02,rnd(.4,.8),6),car2);d.position.set(x,-.75,1.25);head.add(d)}
 const band=new THREE.Mesh(new THREE.TorusGeometry(1.08,.1,8,32),gold);band.rotation.x=Math.PI/2;band.position.y=1.32;head.add(band);
 const cg=crownGeo(.34);for(let i=0;i<9;i++){const a=i/9*Math.PI*2,cp=new THREE.Mesh(cg,gold);cp.position.set(Math.sin(a)*1.08,1.72,Math.cos(a)*1.08);cp.lookAt(head.position.x+Math.sin(a)*9,1.72+3,Math.cos(a)*9);cp.rotateX(Math.PI/2);head.add(cp);
  const sp=new THREE.Mesh(new THREE.ConeGeometry(.1,.55,6),gold);const b2=a+Math.PI/9;sp.position.set(Math.sin(b2)*1.08,1.62,Math.cos(b2)*1.08);head.add(sp)}
 const hair=mm(0xffe9b8,{transparent:true,opacity:.5,roughness:.1,...E,depthWrite:false}),hairs=[];for(let i=0;i<14;i++){const L=rnd(3,5.2),h=new THREE.Mesh(new THREE.CylinderGeometry(.05,.015,L,5),hair);h.geometry.translate(0,-L/2,0);const a=Math.PI+rnd(-1.2,1.2);h.position.set(Math.sin(a)*1.1,.6,Math.cos(a)*1.1);h.rotation.set(rnd(-.5,-.2),0,Math.sin(a)*.25);head.add(h);hairs.push(h)}
 const arms=[];for(const s of[-1,1]){const sh=new THREE.Group();sh.position.set(s*2.45,8.1,0);g.add(sh);sh.add(new THREE.Mesh(new THREE.SphereGeometry(.72,16,12),car));
  const up=new THREE.Mesh(new THREE.CylinderGeometry(.56,.44,3,16),car);up.position.y=-1.5;sh.add(up);const el=new THREE.Group();el.position.y=-3;sh.add(el);el.add(new THREE.Mesh(new THREE.SphereGeometry(.5,14,10),car));
  const fa=new THREE.Mesh(new THREE.CylinderGeometry(.44,.34,2.8,16),car);fa.position.y=-1.4;el.add(fa);const hand=new THREE.Group();hand.position.y=-2.9;el.add(hand);
  const bowl=new THREE.Mesh(new THREE.SphereGeometry(.9,18,10,0,Math.PI*2,Math.PI/2,Math.PI/2),car2);bowl.material.side=THREE.DoubleSide;hand.add(bowl);const rr=new THREE.Mesh(new THREE.TorusGeometry(.9,.08,8,28),gold);rr.rotation.x=Math.PI/2;hand.add(rr);
  arms.push({sh,el,hand,s})}
 g.userData.q={arms,head,hg,heart,glow,heartM,hairs};return eyeM}
const QB={x0:-19,x1:19,z0:-125,z1:-87};
const qScale=e=>e.type==='queen'?(e.st==='sugar'||e.ac===10?.16:.42+1.18*Math.max(0,Math.min(1,e.hp/(e.maxHp||1)))):1;
const qBase=s=>{const p=qPool();return(p?p.y:2.2)-.3};
function qSpot(e,tg){const pk=tg&&tg.length?tg[Math.floor(Math.random()*tg.length)]:null;let best=null,bd=-1;
 for(let i=0;i<14;i++){let x,z;if(pk&&i<9){const a=Math.random()*6.28,r=rnd(6,11);x=pk.pos.x+Math.sin(a)*r;z=pk.pos.z+Math.cos(a)*r}else{x=rnd(QB.x0,QB.x1);z=rnd(QB.z0,QB.z1)}
  x=clamp(x,QB.x0,QB.x1);z=clamp(z,QB.z0,QB.z1);const d=Math.hypot(x-e.pos.x,z-e.pos.z);if(d>12)return[x,z];if(d>bd){bd=d;best=[x,z]}}return best}
function queenAI(e,t,to,dist,dt,tg){const ph2=e.hp<e.maxHp*.5,str=drainT>0;e.stT=(e.stT||0)+dt;queenSyrup(e,dt);
 const hk=Math.max(0,e.hp/e.maxHp),s=qScale(e),base=qBase(s),fast=1+.6*(1-hk);
 if(!e.st){e.st='rise';e.stT=0;e.lastDive=T;e.ph=1;sfx('roar');e.wx=e.pos.x;e.wz=e.pos.z}
 if(ph2&&e.ph===1){e.ph=2;sfx('roar');qfx(5,0,0);shake=Math.max(shake,.4);e.lastDive=T-30}
 e.vel.set(0,0,0);
 if(e.st==='sugar'){e.ac=10;e.inv=true;
  if(!e.land){const t=tg&&tg[0]?tg[0].pos:e.pos,c=[[-27.5,clamp(t.z,-129,-83)],[27.5,clamp(t.z,-129,-83)],[clamp(t.x,-23,23),-78.5],[clamp(t.x,-23,23),-133.5]];let b=c[0],bd=1e9;for(const q of c){const d=Math.hypot(q[0]-t.x,q[1]-t.z);if(d<bd){bd=d;b=q}}
   // не прямо на игрока: сдвиг вдоль берега
   const along=Math.abs(b[0])>25?[0,1]:[1,0],sg=(along[0]?t.x<=b[0]:t.z<=b[1])?1:-1;if(bd<4){b=[b[0]+along[0]*sg*4.5,b[1]+along[1]*sg*4.5]}
   e.land=new V3(b[0],2.8,b[1]);e.from=e.pos.clone();sfx('roar',1)}
  const k=Math.min(1,e.stT/1.2);e.pos.lerpVectors(e.from,e.land,k);if(k>=1&&tg&&tg[0]){const w=Math.atan2(tg[0].pos.x-e.pos.x,tg[0].pos.z-e.pos.z);let d=w-e.g.rotation.y;d=Math.atan2(Math.sin(d),Math.cos(d));e.g.rotation.y+=d*Math.min(1,dt*4)}e.pos.y+=Math.sin(k*Math.PI)*9;e.g.rotation.z=k<1?Math.sin(k*9)*.5:0;
  if(k>=1&&!e.landed){e.landed=1;shake=Math.max(shake,.45);sfx('slam');puff(e.pos.clone().setY(3.2),60,0xd8801f,9,.8,8)}
  if(e.stT>GZ_CUT_T+GZ_T0+.2&&!e.sugarDone){e.sugarDone=1;e.inv=false;kill(e,'water')}return}
 const want=Math.atan2(t.pos.x-e.pos.x,t.pos.z-e.pos.z);let dy=want-e.g.rotation.y;dy=Math.atan2(Math.sin(dy),Math.cos(dy));e.g.rotation.y+=dy*Math.min(1,dt*(e.st==='idle'?2.2:1.2)*fast);
 // скольжение по резервуару: чем меньше здоровья, тем быстрее и меньше
 if(e.st==='idle'||e.st==='hail'||e.st==='spike'||e.st==='spout'){const sp=(1.4+5.2*(1-hk))*(ph2?1.3:1)*(str?.35:1),dx=e.wx-e.pos.x,dz=e.wz-e.pos.z,d=Math.hypot(dx,dz);
  if(d<1.2||e.wx==null){const a=Math.random()*6.28,r=rnd(5,13);e.wx=clamp(e.pos.x+Math.sin(a)*r,QB.x0,QB.x1);e.wz=clamp(e.pos.z+Math.cos(a)*r,QB.z0,QB.z1)}
  else{const k=Math.min(d,sp*dt)/d;e.pos.x+=dx*k;e.pos.z+=dz*k;if(Math.random()<dt*14){const p=qPool();if(p)puff(new V3(e.pos.x+rnd(-2.5,2.5)*s,Math.max(p.y,-6)+.1,e.pos.z+rnd(-2.5,2.5)*s),2,0xd8801f,3,.6,8)}}}
 if(e.st==='rise'){e.inv=true;e.ac=6;const k=Math.min(1,e.stT/2.4);e.pos.y=-17+(17+base)*(1-Math.pow(1-k,3));if(Math.random()<dt*30){const p=qPool();puff(new V3(e.pos.x+rnd(-3,3),p?Math.max(p.y,-6):0,e.pos.z+rnd(-3,3)),3,0xd8801f,6,.7,10)}
  if(k>=1){e.st='idle';e.stT=0;e.cd=1.1/fast;e.inv=false}}
 else if(e.st==='idle'){e.ac=0;e.pos.y+=(base-e.pos.y)*Math.min(1,dt*2);e.cd-=dt*(ph2?1.45:1)*fast*(str?.6:1);
  if(e.cd<=0){if(ph2&&T-e.lastDive>11&&!str){e.st='dive';e.stT=0;sfx('gloop',1);qfx(5,0,0)}else{let s2=queenPick(e);e.last=s2;e.st=s2;e.stT=0;e.done=0;if(s2==='wave'){sfx('roar',.8);qfx(5,0,0)}}}}
 else if(e.st==='stranded'){e.ac=7;e.pos.y+=(base-1.4-e.pos.y)*Math.min(1,dt*2.5);if(Math.random()<dt*10){const p=qPool();puff(new V3(e.pos.x+rnd(-3,3),(p?Math.max(p.y,-6):0)+.2,e.pos.z+rnd(-3,3)),3,0xd8801f,4,.6,10)}if(e.stT>3.4){e.st='idle';e.stT=0;e.cd=.9}}
 else if(e.st==='swirl'){e.ac=8;if(e.stT>3.8){e.st='idle';e.cd=rnd(1.4,2)/fast;e.stT=0}}
 else if(e.st==='spout'){e.ac=9;if(!e.done&&e.stT>.45){e.done=1;for(const c of tg){const x=c.pos.x+c.vel.x*.6,z=c.pos.z+c.vel.z*.6;spout(x,z,true);qfx(6,x,z)}if(ph2)for(let i=0;i<4;i++){const a=Math.random()*6.28,r=rnd(6,15),x=e.pos.x+Math.sin(a)*r,z=e.pos.z+Math.cos(a)*r;spout(x,z,true);qfx(6,x,z)}sfx('roar',.6)}if(e.stT>1.7){e.st='idle';e.cd=rnd(1.3,2)/fast;e.stT=0}}
 else if(e.st==='hail'){e.ac=1;if(!e.done&&e.stT>.75){e.done=1;queenHail(e,tg,ph2)}if(e.stT>1.5){e.st='idle';e.cd=rnd(1.5,2.3)/fast;e.stT=0}}
 else if(e.st==='wave'){e.ac=e.stT<1.15?2:3;if(!e.done&&e.stT>1.15){e.done=1;const y=Math.max(0,syrupLvl(e.pos.x,e.pos.z));waveRing(e.pos.x,y,e.pos.z,true);qfx(1,e.pos.x,e.pos.z);surgeT=3.4;shake=Math.max(shake,.45);sfx('slam');puff(new V3(e.pos.x,y+.5,e.pos.z),80,0xd8801f,14,.9,10)}if(e.stT>2.1){e.st='idle';e.cd=rnd(1.8,2.6)/fast;e.stT=0}}
 else if(e.st==='spike'){e.ac=4;if(!e.done&&e.stT>.55){e.done=1;for(const c of tg){const a=Math.atan2(c.pos.x-e.pos.x,c.pos.z-e.pos.z);spikeLine(e.pos.x,e.pos.z,a,12,true);qfx(2,e.pos.x,e.pos.z,a)}if(ph2){spikeRing(e.pos.x,e.pos.z,6.5,true);qfx(3,e.pos.x,e.pos.z,6.5)}sfx('crack',1)}if(e.stT>1.5){e.st='idle';e.cd=rnd(1.4,2.2)/fast;e.stT=0}}
 else if(e.st==='dive'){e.ac=5;e.inv=e.stT>.4;e.pos.y-=dt*(4+e.stT*8);if(e.stT>1.5){e.st='under';e.stT=0;e.pos.y=-17;e.spawnT=1;const sp=qSpot(e,tg);e.nx=sp[0];e.nz=sp[1];banner('ЦАРИЦА УШЛА В СИРОП — ЗАЛ ЗАТАПЛИВАЕТ!');sfx('siren',.8)}}
 // фаза 2: долго под сиропом, зал заполняется втрое быстрее, медузы лезут из глубины
 else if(e.st==='under'){e.ac=5;e.inv=true;e.pos.y=-17;const U=6.5;QS.under=1;e.spawnT-=dt;
  if(e.spawnT<=0){e.spawnT=2.3;if(enemies.filter(o=>o.type==='jelly'&&!o.dead).length<5){toSpawn.push('jelly');spawnT=.2}}
  const p=qPool(),sy=p?Math.max(p.y,-6):0;if(Math.random()<dt*(e.stT>U-1.8?40:6)){const a=Math.random()*6.28,r=e.stT>U-1.8?rnd(0,3.5):rnd(0,20);puff(new V3((e.stT>U-1.8?e.nx:0)+Math.sin(a)*r,sy+.1,(e.stT>U-1.8?e.nz:-106)+Math.cos(a)*r),2,0xffc060,e.stT>U-1.8?5:2,.7,8)}
  if((e.sirT=(e.sirT||0)-dt)<=0){e.sirT=1.6;sfx('siren',.7);shake=Math.max(shake,.18)}
  if(e.stT>U-1.8&&!e.tel){e.tel=1;spout(e.nx,e.nz,false);qfx(6,e.nx,e.nz);sfx('gloop',1)}
  if(e.stT>U){e.tel=0;QS.under=0;e.pos.x=e.nx;e.pos.z=e.nz;e.wx=e.nx;e.wz=e.nz;e.st='rise';e.stT=.9;e.lastDive=T;const y=Math.max(0,syrupLvl(e.pos.x,e.pos.z));waveRing(e.pos.x,y,e.pos.z,true);qfx(1,e.pos.x,e.pos.z);shake=Math.max(shake,.4);sfx('roar')}}}
function queenHail(e,tg,ph2){const from=new V3();e.g.userData.q.arms[1].hand.getWorldPosition(from);const n=ph2?3:2;
 for(const c of tg)for(let i=0;i<n;i++){const tf=rnd(1.25,1.7),lead=i===0?.85:rnd(0,.5),a=Math.random()*6.28,rr=i===0?rnd(0,1):rnd(2,4.5),x=c.pos.x+c.vel.x*tf*lead+Math.sin(a)*rr,z=c.pos.z+c.vel.z*tf*lead+Math.cos(a)*rr;lobShot(from,new V3(x,surfY(x,z),z),tf,16,.55,0xc8661a,'bomb')}
 for(let i=0;i<(ph2?3:1);i++){const a=Math.random()*6.28,r=rnd(6,16),x=e.pos.x+Math.sin(a)*r,z=e.pos.z+Math.cos(a)*r;lobShot(from,new V3(x,surfY(x,z),z),rnd(1.3,1.8),16,.55,0xc8661a,'bomb')}sfx('throw')}
function queenAnim(e,dt){const q=e.g.userData.q;if(!q)return;queenSyrupFx(e,dt);const t=T+e.seed,k=Math.min(1,dt*7),a=e.ac||0;const qs=qScale(e);e.qs=(e.qs||qs)+(qs-(e.qs||qs))*Math.min(1,dt*(a===10?5:3));e.g.scale.setScalar(e.qs);e.r=3.3*e.qs;e.cy=6.2*e.qs;gzQueenAnim(e,q,a);
 for(const A of q.arms){const s=A.s;let z=s*(.55+Math.sin(t*1.1+s)*.08),x=Math.sin(t*.9+s)*.15,el=-.55;
  if(a===1&&s>0){x=-2.5;z=s*.4;el=-.9}else if(a===2){z=s*2.65;x=-.2;el=-.25}else if(a===3){z=s*.4;x=-1.25;el=-.2}else if(a===4&&s>0){x=-1.45;z=s*.25;el=-.05}else if(a===5){z=s*2.2;x=0;el=-.3}else if(a===6){z=s*1.6;x=-.3;el=-.6}else if(a===7){z=s*(1.9+Math.sin(t*9+s)*.25);x=.4;el=-1.3}else if(a===8){z=s*(1.5+Math.sin(t*5+s*1.5)*.35);x=-.5+Math.sin(t*5)*.4;el=-.35}else if(a===9){z=s*.7;x=-2.3+Math.abs(Math.sin(t*3))*.6;el=-.15}else if(a===10){z=s*(.14+Math.sin(t*1.7+s)*.03);x=.3+(e.gzColl||0)*.7;el=-.3-(e.gzColl||0)*.4}
  A.sh.rotation.z+=(z-A.sh.rotation.z)*k;A.sh.rotation.x+=(x-A.sh.rotation.x)*k;A.el.rotation.x+=(el-A.el.rotation.x)*k}
 if(q.model)queenArms(e,q,t);q.head.rotation.z=Math.sin(t*.8)*.06;q.head.rotation.x=(a===2?-.25:a===3?.2:a===10?.45:0)+Math.sin(t*.6)*.04;const hp=1+.14*Math.sin(t*5);q.heart.scale.setScalar(hp);q.heart.rotation.y+=dt;q.glow.material.opacity=.7+.3*Math.sin(t*5);if(a===10)gzQueenPost(e,q);
 q.heartM.color.setHex(drainT>0?0xffffff:0xfff2c8);q.hairs.forEach((h,i)=>h.rotation.z=Math.sin(t*1.3+i)*.12);
 if(Math.random()<dt*8){const an=Math.random()*6.28,r=rnd(2,3.5);puff(new V3(e.pos.x+Math.sin(an)*r,e.pos.y+rnd(2,6),e.pos.z+Math.cos(an)*r),1,0xd8801f,.5,1,10)}}
const _wh=new V3();
function weakHit(e,o,dir){if(e.type==='pep')return pepWeak(e);if(e.type!=='queen'||!e.g.userData.q)return false;e.g.userData.q.heart.getWorldPosition(_wh);const t=raySphere(o,dir,_wh,1.05*(e.qs||1));return t!==null}

/* ================= уровни ================= */
const LEVELS=[
 {id:'l1',n:1,name:'ЛИНИЯ РОЗЛИВА',sub:'Конвейеры везут всех. Прессы бьют по ритму — заманивай врагов под удар.',desc:'Конвейеры и гидропрессы. Финал — на карусели розлива.',boss:'Генеральный директор',diff:3,par:330,build:buildL1,start:[0,0,30],open:[0],exitTrig:[-3.4,3.4,-146.5,-139,0],
  rooms:[{name:'ПРИЁМКА',trig:[-20,20,-18,15.5],bounds:[-20.5,20.5,-18.5,22.5],cp:[0,0,19],entry:0,exit:1,
    sp:[[-16.5,4.5,-10],[16.5,4.5,-10],[-16.5,4.5,6],[16.5,4.5,6],[-12,0,-9.5],[12,0,-14],[0,0,-14],[-14,0,1],[14,0,1]],waves:[{vend:5},{vend:3,drone:3}]},
   {name:'ПРЕСС-ЦЕХ',trig:[-14,14,-76,-36],bounds:[-14.5,14.5,-76.5,-29.5],cp:[-8,0,-33],entry:1,exit:2,
    sp:[[-12,4.5,-68],[12,4.5,-68],[-12,4.5,-56],[12,4.5,-56],[-9,0,-72],[9,0,-72],[0,.5,-73],[-9,0,-61],[9,0,-61]],waves:[{golem:1,vend:3,drone:1},{golem:2,vend:3,drone:2},{golem:3,vend:2,drone:3}]},
   {name:'КАРУСЕЛЬ РОЗЛИВА',trig:[-24,24,-136,-93],bounds:[-24.5,24.5,-136.5,-87.5],cp:[0,0,-91],entry:2,exit:3,bossAt:[0,0,-128],
    sp:[[-21.5,6,-120],[21.5,6,-120],[-21.5,6,-104],[21.5,6,-104],[-14,0,-131],[14,0,-131],[0,0,-132],[-15,0,-97],[15,0,-97]],waves:[{boss:1,vend:2,drone:2}],
    rein:[{at:.6,w:{vend:3,drone:2}},{at:.3,w:{golem:1,vend:2,drone:2}}]}]},
 {id:'l2',n:2,name:'СИРОПНЫЕ ЦИСТЕРНЫ',sub:'Сироп поднимается и опускается. Стреляй в красные вентили, чтобы слить его.',desc:'Прилив сиропа и вентили слива. Финал — в сиропном озере.',boss:'Карамельная Царица',diff:5,par:420,build:buildL2,start:[0,3.2,29],open:[0,3],exitTrig:[-3.4,3.4,-146.5,-139,2.8],
  rooms:[{name:'НАСОСНАЯ',trig:[-18,18,-16,14.2],bounds:[-18.5,18.5,-16.5,22.5],cp:[0,3.2,19.5],entry:0,exit:1,
    sp:[[-14,3.2,-4],[14,3.2,-4],[-14,3.2,8],[14,3.2,8],[-5,3.2,-13],[5,3.2,-13],[0,3.2,2],[0,0,-6],[-7,0,12]],waves:[{vend:3,can:3},{can:4,vend:2,drone:2}]},
   {name:'РЕЗЕРВУАР',trig:[-20,20,-68,-32.6],bounds:[-20.5,20.5,-68.5,-27.5],zone:[0,-48,19.3],cp:[0,3.2,-30.6],entry:3,exit:2,
    sp:[[-10,0,-50],[10,0,-50],[0,6.5,-52],[0,0,-61],[-13,0,-40],[13,0,-40],[-15.3,7.5,-57],[15.3,7.5,-57],[0,9.7,-62]],waves:[{jelly:2,vend:3,can:2},{golem:1,jelly:3,can:2},{jelly:4,vend:3,can:3}]},
   {name:'СЕРДЦЕ СИРОПА',trig:[-30,30,-136,-80.8],bounds:[-30.5,30.5,-136.5,-75.5],cp:[8,2.8,-78.5],entry:2,exit:4,bossAt:[0,0,-106],
    sp:[[5.9,2.8,-91.7],[14.3,2.8,-100.1],[14.3,2.8,-111.9],[5.9,2.8,-120.3],[-5.9,2.8,-120.3],[-14.3,2.8,-111.9],[-14.3,2.8,-100.1],[-5.9,2.8,-91.7]],waves:[{queen:1}],
    rein:[{at:.7,w:{jelly:2}},{at:.35,w:{jelly:3}}]}]}];
const lvIdx=id=>LEVELS.findIndex(l=>l.id===id);
const lvUnlocked=i=>i===0||String(nick||'').trim().toLowerCase()==='torch'||!!(prog[LEVELS[i-1].id]&&prog[LEVELS[i-1].id].done);

/* ---------- Уровень 1: ЛИНИЯ РОЗЛИВА ---------- */
function buildL1(){const m=storyMats();scene.background=new THREE.Color(0x1d1714);scene.fog=new THREE.Fog(0x2c231c,30,120);
 const hemi=new THREE.HemisphereLight(0xffe6cc,0x3a2c22,.66),sun=shadowLight(new THREE.DirectionalLight(0xffe2c4,.5),38,90);addLights([hemi,sun]);followSun(sun,9,40,7);
 mapB={x0:-24,x1:24,z0:-148,z1:34};const R={floor:m.conc,wall:m.ribs,ceil:m.ceilL},D={c:0,w:6,h:5};
 corridorZ(0,23,34,8,0,7,R,'s');wsign('ЛИНИЯ РОЗЛИВА',0,6.05,23.04,0,5.6,1.05,'#f6eee2','#8a0f1f');
 roomBox(-20,20,-18,22,13,R,{s:[D],n:[D]});addDoor(0,0,22.5,6,5,true);addDoor(0,0,-18.5,6,5,false);
 corridorZ(0,-29,-19,7,0,7,R);
 roomBox(-14,14,-76,-30,14,R,{s:[D],n:[D]});addDoor(0,0,-76.5,6,5,false);
 corridorZ(0,-87,-77,7,0,7,R);
 roomBox(-24,24,-136,-88,16,R,{s:[D],n:[D]});addDoor(0,0,-136.5,6,5,false);corridorZ(0,-147,-137,7,0,7,R,'n');wsign('ВЫХОД',0,5.4,-136.95,Math.PI,3.6,.8,'#f6eee2','#2a7a4a');
 for(let i=0;i<4;i++)addBeacon(i);
 for(const [x0,x1,z0,z1] of[[-20,20,-18,22],[-14,14,-76,-30],[-24,24,-136,-88]]){decoW(x0+.06,1,(z0+z1)/2,.1,.5,z1-z0,m.red);decoW(x1-.06,1,(z0+z1)/2,.1,.5,z1-z0,m.red)}
 // --- ПРИЁМКА ---
 wsign('ПРИЁМКА',0,8.6,-17.95,0,7,1.3);wsign('ЦЕХ №2 · ПРЕССЫ →',0,6,-17.94,0,5,.6,'#2b0a0e','#f2b84b');
 addBelt(0,9,30,3.4,4,0,true);addBelt(0,-5,30,3.4,-4,0,true);
 for(const s of[-1,1]){addBoxW(s*16.5,4.1,2,5,.4,32,m.grate,2);for(const z of[-12,-4,4,12])addBoxW(s*14.4,0,z,.5,4.1,.5,m.dark);rails(s*14.15,4.5,2,32,false);
  addPad(s*10.5,0,16.5,s*4.4,17.5,0);addPad(s*10.5,0,-12.5,s*4.4,17.5,0)}
 for(const [x,y,z] of[[-7,0,17.5],[-4.8,0,17.8],[-6,2,17.6],[8,0,-14],[10.2,0,-14.3],[9,2,-14.1],[-9,0,1.6],[9,0,1.6],[9,2,1.6],[-8.5,0,-15.6]])addBox(x,y,z,2,2,2,mats.crate);
 for(const [x,z] of[[3.5,16.5],[-12,-14]]){addBoxW(x,0,z,2.4,1,1.6,m.red,2);const bl=[];for(let i=0;i<12;i++)bl.push([x-.9+(i%4)*.6,1,z-.5+Math.floor(i/4)*.5,0,0,0,1.6]);inst(bottleGeo,m.bottle,bl)}
 decoW(0,11,2,40,.7,.9,m.yel);decoW(-4,10.3,2,2.2,.7,1.6,m.dark);deco(new THREE.CylinderGeometry(.04,.04,5,4),m.steel,-4,7.8,2);
 {const hk=deco(new THREE.TorusGeometry(.4,.1,8,16,Math.PI*1.4),m.steel,-4,5.1,2);hk.rotation.z=2}
 plight(-16,8,2,0xffb070,.35,22);plight(16,8,2,0xffb070,.35,22);trusses(-20,20,-18,22,13);skylights(-20,20,-18,22,13);for(const [x,z] of[[-8,14],[8,14],[-8,-10],[8,-10],[0,2]])hangLamp(x,z,13,0);
 poster(0,-19.94,2.8,-12,Math.PI/2);poster(1,19.94,2.8,10,-Math.PI/2);poster(2,-19.94,2.8,12,Math.PI/2);poster(3,19.94,2.8,-8,-Math.PI/2);
 // --- ПРЕСС-ЦЕХ ---
 wsign('ПРЕСС-ЦЕХ',0,8.8,-75.95,0,7,1.3);wsign('ПРЕСС-ЦЕХ',0,8.8,-30.05,Math.PI,7,1.3);
 addBelt(0,-53,7.2,42,0,-3.2,false);
 addPress(0,-42,6.8,5.2,8.6,.5,0);addPress(0,-54,6.8,5.2,8.6,.5,1.45);addPress(0,-66,6.8,5.2,8.6,.5,2.9);
 for(const [x,z] of[[-8,-40],[8,-46],[-8,-52],[8,-58],[-8,-64],[8,-70]]){addBoxW(x,0,z,1.6,2.4,1.2,m.cab,2);deco(new THREE.BoxGeometry(1,.5,.05),new THREE.MeshBasicMaterial({color:0x7ee08a}),x,1.7,z+(z%12?.62:-.62))}
 for(const s of[-1,1]){addBoxW(s*12,4.1,-53,4,.4,40,m.grate,2);for(const z of[-38,-48,-58,-68])addBoxW(s*10.2,0,z,.5,4.1,.5,m.dark);rails(s*9.95,4.5,-53,40,false);addPad(s*8.5,0,-34.5,s*4.4,17.5,0)}
 for(const x of[-10,10])decoW(x,12.4,-53,.5,.5,44,m.pipe);
 trusses(-14,14,-76,-30,14);skylights(-14,14,-76,-30,14);for(const z of[-36,-48,-60,-72])hangLamp(z%24?-6:6,z,14,0);poster(0,-13.94,2.8,-44,Math.PI/2);poster(0,13.94,2.8,-62,-Math.PI/2);poster(2,13.94,2.8,-40,-Math.PI/2);
 // --- КАРУСЕЛЬ ---
 wsign('КАРУСЕЛЬ РОЗЛИВА',0,9.5,-135.95,0,10,1.4);
 buildCarousel(0,-112,11);
 for(const [sx,sz] of[[-1,-1],[1,-1],[-1,1],[1,1]]){const x=sx*20.5,z=-112+sz*20.5;solid(x,0,z,6,10,6);const t=deco(new THREE.CylinderGeometry(3,3,10,32),m.steel,x,5,z);level.push(t);
  for(const y of[2,8])deco(new THREE.CylinderGeometry(3.08,3.08,.4,32),m.red,x,y,z);deco(new THREE.SphereGeometry(3,24,12,0,Math.PI*2,0,Math.PI/2),m.steel,x,10,z)}
 for(const s of[-1,1]){addBoxW(s*21.5,5.6,-112,5,.4,30,m.grate,2);rails(s*19.15,6,-112,30,false);addPad(s*15,0,-112,s*4.6,20,0)}
 plight(-14,9,-124,0xff9a60,.35,26);plight(14,9,-100,0xff9a60,.35,26);trusses(-24,24,-136,-88,16,8);skylights(-24,24,-136,-88,16);for(const [x,z] of[[-13,-98],[13,-98],[-13,-126],[13,-126],[0,-112]])hangLamp(x,z,16,x?0:.5);
 poster(3,-23.94,2.8,-104,Math.PI/2);poster(1,23.94,2.8,-120,-Math.PI/2);poster(2,-23.94,2.8,-124,Math.PI/2);dust([[-18,18,-16,20,1,10],[-12,12,-74,-32,1,11],[-22,22,-134,-90,1,12]],700)}

/* ---------- Уровень 2: СИРОПНЫЕ ЦИСТЕРНЫ ---------- */
function tankRoom(cx,cz,R,H,gaps){const mt=SM.tank.clone();mt.side=THREE.BackSide;
 const seg=(t0,t1,y0,y1)=>{if(y1-y0<.05||t1-t0<.01)return;const geo=new THREE.CylinderGeometry(R,R,y1-y0,Math.max(3,Math.ceil((t1-t0)*14)),1,true,t0,t1-t0),uv=geo.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*(t1-t0)*R/4,uv.getY(i)*(y1-y0)/4);
  const m=new THREE.Mesh(geo,mt);m.position.set(cx,(y0+y1)/2,cz);mapGroup.add(m);level.push(m)};
 // проём в стене цистерны — ровно по ширине двери, с откосами до стены зала (без щелей)
 const DW=6.2,hw=DW/2/R,G=gaps.slice().sort((a,b)=>a.th-b.th);
 let t=G.length?G[0].th+hw:0;for(const g of G.slice(1).concat(G.length?[{th:G[0].th+Math.PI*2}]:[])){if(g.th-hw>t)seg(t,g.th-hw,0,H);t=g.th+hw}
 if(!G.length)seg(0,Math.PI*2,0,H);
 for(const g of gaps){const c=g.th;seg(c-hw,c+hw,0,g.y0);seg(c-hw,c+hw,g.y1,H);
  const sx=Math.sin(c),sz=Math.cos(c),ex=cx+sx*R,ez=cz+sz*R,d=1.6;
  for(const s of[-1,1]){const px=ex+sz*s*(DW/2+.25)+sx*(d/2-.6),pz=ez-sx*s*(DW/2+.25)+sz*(d/2-.6);addBoxW(px,g.y0,pz,Math.abs(sz)>.5?.5:d,g.y1-g.y0,Math.abs(sz)>.5?d:.5,SM.steel||SM.plat,2)}
  addBoxW(ex+sx*(d/2-.6),g.y1,ez+sz*(d/2-.6),Math.abs(sz)>.5?DW+1:d,.5,Math.abs(sz)>.5?d:DW+1,SM.steel||SM.plat,2)}
 // ржавые обручи — с разрывами над проёмами
 for(const y of[4,10,16,22]){const cut=gaps.filter(g=>y>g.y0-.3&&y<g.y1+.3).map(g=>Math.PI/2-g.th).map(a=>((a%(Math.PI*2))+Math.PI*2)%(Math.PI*2)).sort((a,b)=>a-b);
  const arcs=[];if(!cut.length)arcs.push([0,Math.PI*2]);else{const w=hw+.04;for(let i=0;i<cut.length;i++){const a0=cut[i]+w,a1=(i+1<cut.length?cut[i+1]:cut[0]+Math.PI*2)-w;if(a1>a0)arcs.push([a0,a1])}}
  for(const [a0,a1] of arcs){const geo=new THREE.TorusGeometry(R-.05,.12,6,Math.max(8,Math.ceil((a1-a0)*16)),a1-a0);geo.rotateZ(a0);geo.rotateX(Math.PI/2);const r=new THREE.Mesh(geo,SM.rust);r.position.set(cx,y,cz);mapGroup.add(r)}}
 const half=R+.4,st=.8,lim=R*.72;for(let a=-lim;a<lim;a+=st){const am=a+st/2,h=Math.sqrt(R*R-am*am),dd=half-h;if(dd<.6)continue;
  if(Math.abs(am)>4.3){solid(cx+am,0,cz+h+dd/2,st,H,dd);solid(cx+am,0,cz-h-dd/2,st,H,dd)}solid(cx+h+dd/2,0,cz+am,dd,H,st);solid(cx-h-dd/2,0,cz+am,dd,H,st)}
 const cw=half-lim;for(const [sx,sz] of[[-1,-1],[1,-1],[-1,1],[1,1]])solid(cx+sx*(lim+cw/2),0,cz+sz*(lim+cw/2),cw,H,cw)}
function island(x,z,r,top){discSolid(x,z,r,0,top,.9);const c=deco(new THREE.CylinderGeometry(r,r*1.08,top,32),SM.crust,x,top/2,z);level.push(c);
 const t=deco(new THREE.CylinderGeometry(r-.05,r-.05,.06,32),SM.plat,x,top+.01,z);const tr=deco(new THREE.TorusGeometry(r-.1,.08,6,40),SM.yel,x,top+.04,z);tr.rotation.x=Math.PI/2}
function buildL2(){const m=storyMats();scene.background=new THREE.Color(0x140b05);scene.fog=new THREE.Fog(0x2a1606,26,100);
 const hemi=new THREE.HemisphereLight(0xffdcb0,0x2a1404,.6),sun=shadowLight(new THREE.DirectionalLight(0xffd6a8,.45),38,90);addLights([hemi,sun]);followSun(sun,8,40,6);
 mapB={x0:-31,x1:31,z0:-148,z1:32};const R={floor:m.pit,wall:m.tile,ceil:m.ceilD},Rc={floor:m.plat,wall:m.tile,ceil:m.ceilD};
 mapAnims.push(dt=>{m.syrT.offset.x+=dt*.012;m.syrT.offset.y+=dt*.008});
 corridorZ(0,23,32,8,3.2,7,Rc,'s');wsign('СИРОПНЫЕ ЦИСТЕРНЫ',0,8.95,23.04,0,6.4,1.05,'#f6eee2','#6b2a06');
 // --- НАСОСНАЯ ---
 roomBox(-18,18,-16,22,14,R,{s:[{c:0,w:6,y0:3.2,h:4.5}],n:[{c:0,w:6,y0:3.2,h:4.5}]});addDoor(0,3.2,22.5,6,4.5,true);addDoor(0,3.2,-16.5,6,4.5,false);
 addPool(-18,18,-16,22,-.3,2.6);wsign('НАСОСНАЯ',0,10.5,-15.95,0,6,1.1,'#f6eee2','#6b2a06');
 addBoxW(0,0,18.25,16,3.2,7.5,m.plat);trim(-8,8,14.5,22,3.2);
 for(const s of[-1,1]){addBoxW(s*14.25,0,3.5,7.5,3.2,23,m.plat);trim(s>0?10.5:-18,s>0?18:-10.5,-8,15,3.2);
  addBoxW(s*9.25,2.9,14,2.5,.3,2,m.grate,2);addBoxW(s*9.25,2.9,-9,2.5,.3,2,m.grate,2);stairs(s*10.5,3,-s,0,3,6,3.2);
  for(const [x,z] of[[s*7,8],[s*7.5,-2.5]]){solid(x,0,z,3.4,4.6,3.4);const pm=deco(new THREE.CylinderGeometry(1.7,1.9,4.6,24),m.pipe,x,2.3,z);level.push(pm);deco(new THREE.CylinderGeometry(1.75,1.75,.3,24),m.red,x,4.5,z);
   const fw=deco(new THREE.TorusGeometry(1.1,.14,8,24),m.dark,x,5.2,z);fw.rotation.x=Math.PI/2;fw.userData.dyn=1;mapAnims.push(dt=>fw.rotation.z+=dt*2.4);deco(new THREE.CylinderGeometry(.3,.3,14,10),m.pipe,x,7,z+(z>0?-1.4:1.4))}}
 addBoxW(0,0,2,6,3.2,6,m.plat);trim(-3,3,-1,5,3.2);addBoxW(0,0,-12.5,16,3.2,7,m.plat);trim(-8,8,-16,-9,3.2);
 addBoxW(0,2.9,13,2.4,.3,3,m.grate,2);addBoxW(0,2.9,6.5,2.4,.3,3,m.grate,2);addBoxW(0,2.9,-2.25,2.4,.3,2.5,m.grate,2);addBoxW(0,2.9,-7.5,2.4,.3,3,m.grate,2);
 stairs(-4.5,14.5,0,-1,3,6,3.2);stairs(4.5,-9,0,1,3,6,3.2);
 addValve(-17.55,5.6,3,Math.PI/2);addValve(17.55,5.6,3,-Math.PI/2);
 for(const z of[-10,6])for(const s of[-1,1])decoW(s*17.7,9,z,.5,.5,10,m.pipe);
 plight(0,2,4,0xffc080,.4,24);trusses(-18,18,-16,22,14);for(const [x,z] of[[-9,12],[9,12],[-9,-6],[9,-6]])hangLamp(x,z,14,3.2,0xffc070);poster(4,-17.94,6,12,Math.PI/2);poster(5,17.94,6,-10,-Math.PI/2);poster(7,-17.94,6,-12,Math.PI/2);
 // --- РЕЗЕРВУАР ---
 corridorZ(0,-28,-17,7,3.2,7,Rc);
 roomBox(-20,20,-68,-28,26,R,{s:[{c:0,w:6,y0:3.2,h:4.5}],n:[{c:0,w:6,y0:9.7,h:4.5}]});addDoor(0,9.7,-68.5,6,4.5,false);
 addDoor(0,3.2,-27.5,6,4.5,true);tankRoom(0,-48,19.6,26,[{th:0,y0:3.2,y1:7.7},{th:Math.PI,y0:9.7,y1:14.2}]);addPool(-20,20,-68,-28,-.3,5);
 addBoxW(0,0,-30.25,8,3.2,4.5,m.plat);trim(-4,4,-32.5,-28,3.2);
 for(const s of[-1,1])for(let k=0;k<10;k++){const a=s*(.55+k*.245),x=Math.sin(a)*16.5,z=-48+Math.cos(a)*16.5,h=4.2+k*.55;addBoxW(x,h-.5,z,3.6,.5,3.6,m.grate,2);decoW(x,h-.62,z,3.7,.12,3.7,m.hz,1);deco(new THREE.CylinderGeometry(.12,.12,h-.5,6),m.pipe,x,(h-.5)/2,z)}
 addBoxW(0,9.3,-63,10,.4,10,m.grate,2);trim(-5,5,-68,-58,9.7);for(const [x,z] of[[-4.5,-58.5],[4.5,-58.5]])addBoxW(x,0,z,.6,9.3,.6,m.pipe);
 solid(0,0,-48,5,26,5);{const col=deco(new THREE.CylinderGeometry(2.5,2.5,26,28),m.pipe,0,13,-48);level.push(col);for(const y of[3,9,15,21])deco(new THREE.CylinderGeometry(2.62,2.62,.5,28),m.red,0,y,-48)}
 addBoxW(0,6.1,-48,9,.4,9,m.grate,2);trim(-4.5,4.5,-52.5,-43.5,6.5);addPad(0,0,-41,0,19.5,-4,0xffa040);addPad(0,6.5,-51.6,0,15,-10,0xffa040);
 addValve(0,8.2,-45.4,0);addValve(-19.45,6,-48,Math.PI/2);wsign('РЕЗЕРВУАР №3',0,17,-67.95,0,8,1.4,'#f6eee2','#6b2a06');
 plight(0,20,-48,0xffb060,.8,50);plight(-12,6,-48,0xff8020,.45,28);plight(12,6,-48,0xff8020,.45,28);
 // --- СЕРДЦЕ СИРОПА: большой зал, в центре глубокий резервуар (дно −6), по стенам — бортики на 2.8 ---
 corridorZ(0,-76,-69,7,9.7,6,Rc);
 {const X0=-30,X1=30,Z0=-136,Z1=-76,H=24,cx=0,cz=-106,W=X1-X0,D=Z1-Z0,PD=-18,RW=5;
  addBoxW(cx,PD-1,cz,W+2,1,D+2,m.pit);const c=addBoxW(cx,H,cz,W+2,1,D+2,m.ceilD,6);c.userData.noCast=true;
  wallX(Z1+.5,X0-1,X1+1,H,m.tile,[{c:0,w:6,y0:9.7,h:4.5}]);wallX(Z0-.5,X0-1,X1+1,H,m.tile,[{c:0,w:6,y0:2.8,h:4.5}]);wallZ(X0-.5,Z0,Z1,H,m.tile);wallZ(X1+.5,Z0,Z1,H,m.tile);
  addBoxW(0,9.1,Z1-2.25,10,.6,4.5,m.grate,2);rails(0,9.7,Z1-4.45,10,true);
  addBoxW(cx,PD,Z1-RW/2,W,2.8-PD,RW,m.plat);addBoxW(cx,PD,Z0+RW/2,W,2.8-PD,RW,m.plat);addBoxW(X0+RW/2,PD,cz,RW,2.8-PD,D-2*RW,m.plat);addBoxW(X1-RW/2,PD,cz,RW,2.8-PD,D-2*RW,m.plat);
  trim(X0,X1,Z1-RW,Z1,2.8);trim(X0,X1,Z0,Z0+RW,2.8);trim(X0,X0+RW,Z0+RW,Z1-RW,2.8);trim(X1-RW,X1,Z0+RW,Z1-RW,2.8);
  // стенки резервуара: тёмная корка сиропа и жёлто-чёрная кромка
  for(const [x,z,w,d] of[[cx,Z1-RW-.03,W-2*RW,.06],[cx,Z0+RW+.03,W-2*RW,.06],[X0+RW+.03,cz,.06,D-2*RW],[X1-RW-.03,cz,.06,D-2*RW]])decoW(x,PD+.2,z,w,2.8-PD-.6,d,m.pipe,2);
  addPool(X0,X1,Z0,Z1,2.2,2.45);{const pl=pools[pools.length-1];pl.dry=2.2;pl.deep=1}
  addDoor(0,2.8,Z0-.5,6,4.5,false);corridorZ(0,-147,Z0-1,7,2.8,6,Rc,'n');wsign('ВЫХОД',0,8,Z0-.45,Math.PI,3.6,.8,'#f6eee2','#2a7a4a');
  for(let k=0;k<8;k++){const a=(k+.5)/8*Math.PI*2,x=Math.sin(a)*15.5,z=cz+Math.cos(a)*15.5;discSolid(x,z,3.2,PD,2.8-PD,.9);const col=deco(new THREE.CylinderGeometry(3.2,3.5,2.8-PD,32),SM.crust,x,(2.8+PD)/2,z);level.push(col);
   deco(new THREE.CylinderGeometry(3.15,3.15,.06,32),SM.plat,x,2.81,z);const tr=deco(new THREE.TorusGeometry(3.1,.08,6,40),SM.yel,x,2.84,z);tr.rotation.x=Math.PI/2}
  // ступени-выступы у бортиков: из сиропа на них можно выпрыгнуть
  for(const [x,z,w,d] of[[-12,Z1-RW-.9,5,1.8],[12,Z1-RW-.9,5,1.8],[-12,Z0+RW+.9,5,1.8],[12,Z0+RW+.9,5,1.8],[X0+RW+.9,-94,1.8,5],[X0+RW+.9,-118,1.8,5],[X1-RW-.9,-94,1.8,5],[X1-RW-.9,-118,1.8,5]]){addBoxW(x,PD,z,w,2.4-PD,d,m.plat);trim(x-w/2,x+w/2,z-d/2,z+d/2,2.4)}
  for(const [x,z,ry] of[[X0+.55,-94,Math.PI/2],[X1-.55,-94,-Math.PI/2],[X0+.55,-118,Math.PI/2],[X1-.55,-118,-Math.PI/2]])addValve(x,5,z,ry);
  wsign('СЕРДЦЕ СИРОПА',0,16,Z0+.05,0,10,1.6,'#f6eee2','#6b2a06');
  for(let i=0;i<12;i++){const a=i/12*Math.PI*2;deco(new THREE.CylinderGeometry(.35,.35,H,10),m.pipe,Math.sin(a)*28.6,H/2,cz+Math.cos(a)*28.6)}
  plight(-18,7,-92,0xff8020,.5,30);plight(18,7,-120,0xff8020,.5,30);plight(0,3,-106,0xffa040,.6,34);trusses(X0,X1,Z0,Z1,H,8);
  for(const [x,z] of[[-15,-90],[15,-90],[-15,-122],[15,-122],[0,-106],[-22,-106],[22,-106]])hangLamp(x,z,H,2.4,0xffb860);
  poster(6,X0+.06,6.5,-100,Math.PI/2);poster(4,X1-.06,6.5,-110,-Math.PI/2);poster(2,X0+.06,6.5,-124,Math.PI/2);
  dust([[-16,16,-14,20,3.5,12],[-17,17,-64,-32,3,20],[-28,28,-134,-78,0,20]],800,0xffd090)}
 for(let i=0;i<3;i++)addBeacon(i);addBeacon(4)}

/* ================= ход уровня ================= */
function newStory(id){const lv=LEVELS[Math.max(0,lvIdx(id))];return{lv,room:-1,phase:'idle',wi:0,wt:0,cp:new V3(...lv.start),cpYaw:0,t0:0,endT:0,maxR:0,doneT:0,rein:new Set(),wipe:false,tries:0}}
function storyReset(){const S=story,LV=S.lv;wave=LV.diff;lvT=0;drainT=0;surgeT=0;tideK=0;wetK=1;surgeK=0;S.room=-1;S.phase='idle';S.wi=0;S.cp=new V3(...LV.start);S.cpYaw=0;S.t0=T;S.maxR=0;S.doneT=0;S.endT=0;S.rein=new Set();S.tries=0;
 doors.forEach((d,i)=>{setDoor(d,LV.open.includes(i),true);d.k=d.open?1:0;doorPose(d)});if(L3)resetL3();spawns=LV.rooms[0].sp.map(a=>new V3(...a));placePlayer();$('wave').textContent=LV.name;$('left').textContent='▶ ВПЕРЁД'}
function expandWave(spec){const out=[],s=mode==='coop'?1+.5*remotes.size:1;for(const [t,n] of Object.entries(spec)){if(t==='boss'||t==='queen'||t==='alt'||t==='pep')continue;for(let i=0;i<Math.max(1,Math.round(n*s));i++)out.push(t==='vend'&&story&&story.lv.id==='l3'&&Math.random()<.3?'keto':t)}return out.sort(()=>Math.random()-.5)}
function pullIn(R){if(P.alive&&!inR(P.pos,R.bounds)){P.pos.set(R.cp[0]+rnd(-1.2,1.2),R.cp[1]+.05,R.cp[2]+rnd(-.8,.8));P.vel.set(0,0,0);P.yaw=R.yaw||0;banner('ПОДТЯНУЛСЯ К КОМАНДЕ')}}
function roomStart(i){const S=story,R=S.lv.rooms[i];S.room=i;S.phase='fight';S.wt=0;S.rein=new Set();S.wipe=false;S.tries=0;
 if(R.entry!=null)setDoor(doors[R.entry],false);S.cp=new V3(...R.cp);S.cpYaw=R.yaw||0;spawns=R.sp.map(a=>new V3(...a));
 banner(S.lv.n+'-'+(i+1)+' · '+R.name);sfx('frag',.6);pullIn(R);startRoomWave(0)}
function startRoomWave(w){const S=story,R=S.lv.rooms[S.room],spec=R.waves[w];S.wi=w;toSpawn=expandWave(spec);spawnT=.5;
 if(spec.boss){const p=new V3(...R.bossAt);telegraphs.push({m:makeTele(p,true),pos:p,type:'boss',t:1.8})}
 if(spec.queen)spawnEnemy('queen',new V3(...R.bossAt));if(spec.alt)spawnEnemy('alt',new V3(...R.bossAt));if(spec.pep)spawnEnemy('pep',new V3(...R.bossAt));if(w>0)banner('ВОЛНА '+(w+1)+' / '+R.waves.length)}
function roomReset(){const S=story,R=S.lv.rooms[S.room];if(typeof pepReset==='function')pepReset();enemies.forEach(e=>{if(e.puddle)scene.remove(e.puddle);scene.remove(e.g)});enemies=[];telegraphs.forEach(t=>scene.remove(t.m));telegraphs=[];toSpawn=[];
 proj=proj.filter(p=>{if(p.owner==='enemy'){scene.remove(p.m);if(p.mark)scene.remove(p.mark);return false}return true});quakes.forEach(q=>{if(q.m)scene.remove(q.m);if(q.c)scene.remove(q.c)});quakes=[];wrings.forEach(w=>scene.remove(w.m));wrings=[];for(const k of kmarks){scene.remove(k.m);scene.remove(k.f)}kmarks=[];
 S.rein=new Set();S.tries++;drainT=0;banner('ЕЩЁ РАЗ · '+R.name);startRoomWave(0)}
function roomClear(){const S=story,R=S.lv.rooms[S.room];S.phase='clear';if(R.exit!=null)setDoor(doors[R.exit],true);heal(40);addStyle('ЗАЛ ЗАЧИЩЕН',150);
 if(S.room>=S.lv.rooms.length-1){S.phase='exit';exitBanner()}else{banner('ПРОХОД ОТКРЫТ');sfx('ding')}}
function exitBanner(){banner(story.lv.id==='l3'?'ПРЫГАЙ ЗА НЕЙ В ПИВО!':'ВЫХОД ОТКРЫТ — ИДИ К ДВЕРИ');sfx('ding')}
function exitHit(p){const LV=story.lv;if(LV.id==='l3')return !onHull(p.x,p.z)&&p.y<SEA_Y+1.6;const e=LV.exitTrig;return e&&inR(p,e)&&p.y>e[4]-1&&p.y<e[4]+4}
function levelDone(){const S=story;S.phase='done';S.doneT=T;S.endT=T;banner('УРОВЕНЬ ПРОЙДЕН');sfx('frag');freeze=Math.max(freeze,.5)}
function roomOf(){const S=story;return S&&S.room>=0?S.lv.rooms[S.room]:null}
function spawnOk(p,type){const R=roomOf(),r=(ENEMY[type]?ENEMY[type].r:1)*.8;
 if(R){const b=R.bounds;if(p.x<b[0]+r+.6||p.x>b[1]-r-.6||p.z<b[2]+r+.6||p.z>b[3]-r-.6)return false;if(R.zone&&Math.hypot(p.x-R.zone[0],p.z-R.zone[1])>R.zone[2]-r-.8)return false}
 const q=new V3(p.x,p.y+.35,p.z);for(const b of boxes)if(b.max.y-b.min.y>1.2&&ov(q,r,1.6,b))return false;return true}
function safeSpawnPos(sp,type){const fly=ENEMY[type]&&ENEMY[type].fly;for(let k=0;k<10;k++){const j=k<9?2*(1-k/9):0,p=sp.clone().add(new V3(rnd(-j,j),0,rnd(-j,j)));if(!fly)p.y=groundAt(p.x,p.z,sp.y+.6);if(k===9||spawnOk(p,type))return p}return sp.clone()}
function containEnemies(){const R=roomOf();if(!R||story.phase!=='fight')return;const b=R.bounds,topY=Math.max(...R.sp.map(s=>s[1]))+9;
 for(const e of enemies){if(e.dead||e.remote)continue;const p=e.pos;if(ENEMY[e.type].boss){if(e.type==='alt'||e.type==='pep'||L3)continue;const m=(ENEMY[e.type].r||1.5)*.6;const ox=p.x,oz=p.z;p.x=Math.min(b[1]-m,Math.max(b[0]+m,p.x));p.z=Math.min(b[3]-m,Math.max(b[2]+m,p.z));if(R.zone){const dx=p.x-R.zone[0],dz=p.z-R.zone[1],d=Math.hypot(dx,dz),lim=R.zone[2]-m;if(d>lim){p.x=R.zone[0]+dx/d*lim;p.z=R.zone[1]+dz/d*lim}}if(ox!==p.x||oz!==p.z){e.vel.x=0;e.vel.z=0;story.escN=(story.escN||0)+1}continue}if(L3&&!onHull(p.x,p.z))continue;
  let bad=p.x<b[0]-.3||p.x>b[1]+.3||p.z<b[2]-.3||p.z>b[3]+.3||p.y>topY||p.y<-6;if(!bad&&R.zone)bad=Math.hypot(p.x-R.zone[0],p.z-R.zone[1])>R.zone[2]+.3;
  if(bad){(story.escLog=story.escLog||[]).push(e.type+'@'+[p.x,p.y,p.z].map(v=>v.toFixed(1))+(e.sp0?' sp '+e.sp0:''));if(story.escLog.length>30)story.escLog.shift();const sp=R.sp[Math.floor(Math.random()*R.sp.length)];p.copy(safeSpawnPos(new V3(...sp),e.type));if(ENEMY[e.type].fly)p.y=Math.max(p.y,sp[1]+3);e.vel.set(0,0,0);story.escN=(story.escN||0)+1}}}
function updStoryHost(dt){const S=story,LV=S.lv;spawnTick(dt);containEnemies();const tg=targets();
 if(S.phase==='exit'){if(tg.some(c=>exitHit(c.pos))&&gzExitOk())levelDone();return}
 if(S.phase==='idle'||S.phase==='clear'){for(let j=LV.rooms.length-1;j>S.room;j--){const R=LV.rooms[j];if(tg.some(c=>inR(c.pos,R.trig))){roomStart(j);break}}return}
 if(S.phase!=='fight')return;const R=LV.rooms[S.room];
 if(!tg.length)S.wipe=true;else if(S.wipe){S.wipe=false;roomReset();return}
 if(R.rein){const b=enemies.find(e=>ENEMY[e.type].boss&&!e.dead);if(b)R.rein.forEach((r,i)=>{if(!S.rein.has(i)&&b.hp<b.maxHp*r.at){S.rein.add(i);toSpawn.push(...expandWave(r.w));spawnT=.3;banner('ПОДКРЕПЛЕНИЕ!')}})}
 const left=toSpawn.length+telegraphs.length+enemies.length,last=S.wi>=R.waves.length-1;
 if(left<=(last?0:1)){S.wt+=dt;if(S.wt>.9){S.wt=0;if(last)roomClear();else startRoomWave(S.wi+1)}}else S.wt=0}
const PHS=['idle','fight','clear','done','exit'];
function storyNet(){const S=story;let m=0;doors.forEach((d,i)=>{if(d.open)m|=1<<i});return[lvIdx(S.lv.id),S.room,PHS.indexOf(S.phase),m,r2(lvT),r1(drainT),S.wi,r1(surgeT),r1(T-S.t0),L3&&L3.q?L3.q.st:0]}
function syncStory(h){const a=h&&h.lv;if(!story||!Array.isArray(a))return;const S=story;
 if(Math.abs((+a[4]||0)-lvT)>.3)lvT=+a[4]||0;drainT=+a[5]||0;surgeT=+a[7]||0;const m=+a[3]||0;doors.forEach((d,i)=>setDoor(d,!!(m&(1<<i))));
 const room=+a[1],ph=PHS[+a[2]]||'idle';
 if(room!==S.room&&room>=-1){S.room=room;if(room>=0){const R=S.lv.rooms[room];S.cp=new V3(...R.cp);S.cpYaw=R.yaw||0;spawns=R.sp.map(v=>new V3(...v));if(ph==='fight'){banner(S.lv.n+'-'+(room+1)+' · '+R.name);pullIn(R)}}}
 if(ph!==S.phase){if(ph==='clear'&&S.room<S.lv.rooms.length-1){banner('ПРОХОД ОТКРЫТ');sfx('ding')}if(ph==='exit')exitBanner();if(ph==='done'){S.doneT=T;S.endT=T;banner('УРОВЕНЬ ПРОЙДЕН');sfx('frag')}S.phase=ph}
 S.wi=+a[6]||0;if(S.phase!=='done')S.t0=T-(+a[8]||0);if(L3&&L3.q)questSync(+a[9]||0)}
function updLevel(dt){const S=story;if(!S)return;lvT+=dt;drainT=Math.max(0,drainT-dt);surgeT=Math.max(0,surgeT-dt);
 for(const d of doors){d.k+=((d.open?1:0)-d.k)*Math.min(1,dt*(d.open?2.4:6));doorPose(d)}
 updPresses();updCarousel(dt);updTide(dt);
 for(const v of valves){v.wheel.rotation.z+=v.spin*dt*5;v.spin=Math.max(0,v.spin-dt*.5);const on=drainT<=0;v.glowM.color.setHex(on?0xff2a3a:0x5fe0c8);v.glowM.opacity=on?.35+.3*Math.sin(lvT*5):.55;v.wm.emissive.setHex(on?0x550000:0x003322)}
 const R=S.room>=0?S.lv.rooms[S.room]:null;
 updBeacons(dt,S,R);objMark(S,R);if(L3)updL3(dt);if(typeof L4!=='undefined'&&L4)updL4(dt);
 for(const p of proj)if(p.mark){p.mark.material.opacity=.45+.4*Math.abs(Math.sin(T*14));p.mark.rotation.y+=dt*2}
 updGoo(dt);updQuakes(dt);updWrings(dt);updQS(dt);
 if(P.alive&&P.syr>.45&&state==='play'&&!(poolAt(P.pos)||{}).safe){P.hp-=6*dt;if((S.syrT=(S.syrT||0)-dt)<=0){S.syrT=1.2;sfx('gloop',.5);feed.unshift({label:'− ВЯЗНЕШЬ В СИРОПЕ',t:1.4})}if(P.hp<=0)die()}
 {const cy=syrupLvl(camera.position.x,camera.position.z);$('syr').style.opacity=cy>camera.position.y?.62:0}
 S.maxR=Math.max(S.maxR,rank());ambTick(dt);
 const el=S.phase==='done'?S.endT-S.t0:T-S.t0;$('wave').textContent=R?S.lv.n+'-'+(S.room+1)+' · '+R.name:S.lv.n+' · '+S.lv.name;
 const host=mode==='solo'||isHost,lf=host?toSpawn.length+telegraphs.length+enemies.length:(+((hostSnap&&hostSnap.lf)||0));
 $('left').textContent=(S.phase==='exit'?(S.lv.id==='l3'?'▶ ПРЫГАЙ ЗА АЛЬТУШКОЙ':'▶ К ВЫХОДУ'):S.phase==='fight'?'волна '+(S.wi+1)+'/'+R.waves.length+' · врагов: '+lf:S.phase==='clear'?'▶ ПРОХОД ОТКРЫТ':S.phase==='done'?'УРОВЕНЬ ПРОЙДЕН':'▶ ВПЕРЁД')+' · '+fmtT(el)+(mode==='coop'?' · хост: '+(isHost?'ты':nameOf(hostPeer)):'');
 if(S.phase==='done'&&state==='play'&&T-S.doneT>3)showResults()}

/* ---------- фон уровня: гул цеха, бульканье сиропа, шум моря ---------- */
let AMB=null,ambNoise=null;
function ambStop(){if(!AMB||!ac)return;const a=AMB;AMB=null;try{a.g.gain.setTargetAtTime(0,ac.currentTime,.35);setTimeout(()=>{for(const s of a.src)try{s.stop()}catch(e){}try{a.g.disconnect()}catch(e){}},1600)}catch(e){}}
function ambStart(kind){ambStop();if(!ac||muted||!kind)return;if(!ambNoise){ambNoise=ac.createBuffer(1,ac.sampleRate*4,ac.sampleRate);const d=ambNoise.getChannelData(0);let b=0;for(let i=0;i<d.length;i++){b=b*.97+(Math.random()*2-1)*.03;d[i]=(Math.random()*2-1)*.6+b*4}}
 const t=ac.currentTime,g=ac.createGain();g.gain.value=0;g.connect(master);g.gain.setTargetAtTime(1,t,1.5);const src=[];
 const bed=(type,f,q,vol,lf,la)=>{const s=ac.createBufferSource();s.buffer=ambNoise;s.loop=true;s.loopStart=Math.random();const fl=ac.createBiquadFilter();fl.type=type;fl.frequency.value=f;fl.Q.value=q;const gg=ac.createGain();gg.gain.value=vol;s.connect(fl);fl.connect(gg);gg.connect(g);
  if(lf){const o=ac.createOscillator(),og=ac.createGain();o.frequency.value=lf;og.gain.value=la;o.connect(og);og.connect(gg.gain);o.start();src.push(o)}s.start(t,Math.random()*3);src.push(s)};
 const hum=(f,vol)=>{const o=ac.createOscillator();o.frequency.value=f;const gg=ac.createGain();gg.gain.value=vol;o.connect(gg);gg.connect(g);o.start();src.push(o)};
 if(kind==='l1'){bed('lowpass',170,.7,.2,.13,.07);bed('bandpass',900,2,.03,.4,.018);hum(50,.035);hum(100,.012)}
 else if(kind==='l2'){bed('lowpass',130,1,.22,.09,.09);bed('bandpass',380,5,.035,.7,.03);hum(41,.03)}
 else if(kind==='l3'){bed('lowpass',380,.5,.2,.11,.15);bed('highpass',2400,.6,.04,.17,.035);bed('lowpass',80,1,.14,.05,.07)}
 AMB={g,src,kind}}
function ambTick(dt){if(!AMB||!ac||muted||state!=='play')return;AMB.t=(AMB.t??rnd(3,6))-dt;if(AMB.t>0)return;
 if(AMB.kind==='l3'){AMB.t=rnd(5,11);const f=rnd(1300,1800),v=rnd(.02,.04);tone(.16,'sine',f,f*1.55,v);setTimeout(()=>{if(ac)tone(.22,'sine',f*1.5,f*.9,v*.8)},170)}
 else if(AMB.kind==='l1'){AMB.t=rnd(6,13);nz(.5,'bandpass',rnd(500,1400),.05,rnd(200,500));tone(.4,'triangle',rnd(180,320),rnd(90,160),.025)}
 else{AMB.t=rnd(2.5,6);tone(.25,'sine',rnd(180,300),rnd(500,700),.035)}}

/* ---------- метка цели на экране ---------- */
const _om=new V3();
function objMark(S,R){let el=document.getElementById('objm');if(!el){el=document.createElement('div');el.id='objm';el.innerHTML='<i></i><b></b>';(document.querySelector('.hud')||document.body).appendChild(el)}
 let tgt=null,lbl='';if(state==='play'&&P.alive){if(S.phase==='exit'&&S.lv.id==='l1'&&GZ.ped&&GZ.mode<1){tgt=_om.copy(GZ.ped.pos);tgt.y+=2.4;lbl='ПРОТОТИП'}else if(S.phase==='exit'&&S.lv.id==='l3'&&L3&&L3.car){tgt=_om.copy(L3.car.position);tgt.y+=2;lbl='ЗА НЕЙ'}
  else if((S.phase==='clear'||S.phase==='exit')&&R&&R.exit!=null&&doors[R.exit]){const d=doors[R.exit];tgt=_om.set(d.x,d.y+2.2,d.z);lbl=S.phase==='exit'?'ВЫХОД':'ДАЛЬШЕ'}
  else if(S.room<0&&doors[S.lv.open[0]]){const d=doors[S.lv.open[0]];tgt=_om.set(d.x,d.y+2.2,d.z);lbl='ВПЕРЁД'}}
 if(!tgt){el.hidden=true;return}const dist=Math.hypot(tgt.x-P.pos.x,tgt.z-P.pos.z);if(dist<4&&S.phase!=='exit'){el.hidden=true;return}
 const v=tgt.clone().project(camera),w=innerWidth,h=innerHeight;let x=(v.x*.5+.5)*w,y=(-v.y*.5+.5)*h;const behind=v.z>1;if(behind){x=w-x;y=h-y}
 const m=48,off=behind||x<m||x>w-m||y<m||y>h-m;if(off){const cx=w/2,cy=h/2;let dx=x-cx,dy=y-cy;if(behind&&Math.abs(dy)<1)dy=1;const k=Math.min((cx-m)/Math.abs(dx||1e-3),(cy-m)/Math.abs(dy||1e-3));x=cx+dx*Math.min(k,1e9);y=cy+dy*Math.min(k,1e9)}
 el.hidden=false;el.style.transform='translate('+Math.round(x)+'px,'+Math.round(y)+'px)';el.querySelector('b').textContent=lbl+' · '+Math.round(dist)+' м';el.classList.toggle('off',off)}

/* ---------- итоги уровня, титры, меню сюжета ---------- */
const GRADES='DCBAS';
function showResults(){const S=story,LV=S.lv;state='res';fireHeld=altHeld=false;try{document.exitPointerLock()}catch(e){}
 const tm=S.endT-S.t0,pts=100-deaths*12-Math.max(0,tm/LV.par-1)*60+S.maxR*4,g=pts>=100?'S':pts>=85?'A':pts>=70?'B':pts>=55?'C':'D';
 const old=prog[LV.id]||{},nb=!old.done||tm<old.t;prog[LV.id]={done:1,t:old.done?Math.min(old.t,tm):tm,g:(!old.g||GRADES.indexOf(g)>GRADES.indexOf(old.g))?g:old.g,s:Math.max(old.s||0,score)};saveProg();
 save('ug-sp',Math.round(bank));const i=lvIdx(LV.id),nx=LEVELS[i+1];
 $('resLv').textContent='УРОВЕНЬ '+LV.n+' · '+LV.name;$('resG').textContent=g;$('resG').dataset.g=g;
 $('resRows').innerHTML=[['Время',fmtT(tm)+(tm<=LV.par?' · в норме':' · норма '+fmtT(LV.par))],['Убийств',kills],['Смертей',deaths],['Высший ранг',RANKS[S.maxR][0]+' · '+RANKS[S.maxR][1]],['Счёт',score.toLocaleString('ru')]].concat(LV.id==='l3'?[['Грязнулька',L3&&L3.q&&(L3.q.st===3||L3.q.st===4)?'спасена ✓':'не спасена']]:[]).map(r=>'<div><span>'+r[0]+'</span><b>'+esc(String(r[1]))+'</b></div>').join('');
 $('resBest').textContent=nb?'Новый рекорд времени!':'Рекорд: '+fmtT(prog[LV.id].t)+' · оценка '+prog[LV.id].g;
 {const ep=$('resEpi');if(ep){const on=LV.id==='l4'&&!!S.pepWin&&typeof PEP_EPI!=='undefined';ep.hidden=!on;if(on)ep.innerHTML=PEP_EPI}}
 $('resNext').hidden=!nx;if(nx)$('resNext').innerHTML='<i>01</i>ДАЛЬШЕ: '+nx.name;$('resAgain').innerHTML='<i>'+(nx?'02':'01')+'</i>ПЕРЕИГРАТЬ';$('resMenu').innerHTML='<i>'+(nx?'03':'02')+'</i>В МЕНЮ';
 $('res').hidden=false;setTimeout(()=>{try{(nx?$('resNext'):$('resAgain')).focus({preventScroll:true})}catch(e){}},60)}
function lvCard(){const LV=story.lv,c=$('lvCard');$('lcN').textContent='УРОВЕНЬ '+LV.n;$('lcT').textContent=LV.name;$('lcS').textContent=LV.sub;c.hidden=false;c.classList.remove('lcgo');void c.offsetWidth;c.classList.add('lcgo');clearTimeout(lvCard.h);lvCard.h=setTimeout(()=>c.hidden=true,5200)}
/* ---------- Царица и сироп: зал наполняется, в сиропе она лечится, слив выбрасывает её на мель ---------- */
const QS={flood:0,fill:0,feedT:0,told:false,spouts:[],vortex:null,wasDrain:false,vt:0};
function qPool(){for(const p of pools)if(p.z0<=-127&&p.z1>=-81)return p;return null}
function queenAlive(){return enemies.find(e=>e.type==='queen'&&!e.dead)}
function updQS(dt){const p=qPool();if(!p)return;if(p.hi0==null)p.hi0=p.hi;const q=queenAlive();
 if(q&&q.st==='sugar')QS.fill=Math.max(0,QS.fill-dt/6);else if(q&&drainT<=0)QS.fill=Math.min(1,QS.fill+dt/(q.hp<q.maxHp*.5?20:45));
else if(drainT>0)QS.fill=Math.max(0,QS.fill-dt/5);
 // «растворение»: пока Царица под сиропом, резервуар выходит из берегов на несколько метров
 if(q&&q.st==='under')QS.flood=Math.min(4.4,QS.flood+dt*(QS.flood<1?1.6:1.05));else if(drainT>0||(q&&q.st==='sugar'))QS.flood=Math.max(0,QS.flood-dt*2.4);p.fl=QS.flood;

 p.hi=p.hi0+QS.fill*1.9;updSpouts(dt)}
function queenSyrup(e,dt){const p=qPool();if(!p)return;const ph2=e.hp<e.maxHp*.5;
 if(drainT<=0&&p.y>(p.deep?2.75:1.9)&&e.st!=='dive'&&e.st!=='rise'&&e.st!=='stranded'&&e.st!=='under'&&e.st!=='sugar'){QS.feedT+=dt;if(QS.feedT>2.5&&e.hp<e.maxHp){e.hp=Math.min(e.maxHp,e.hp+e.maxHp*(ph2?.012:.011)*dt);if(!QS.told){QS.told=true;banner('ЦАРИЦА ПЬЁТ СИРОП И ЛЕЧИТСЯ — СЛЕЙ ЕГО ВЕНТИЛЯМИ!')}}}else QS.feedT=0;
 if(drainT>0&&!QS.wasDrain&&e.st!=='dive'&&e.st!=='rise'&&e.st!=='under'&&e.st!=='sugar'){e.st='stranded';e.stT=0;e.done=0;banner('ЦАРИЦА НА МЕЛИ!');sfx('roar',.7);qfx(5,0,0)}QS.wasDrain=drainT>0}
function queenPick(e){const p=qPool(),fl=p&&p.y>(p.deep?2:2.55),r=Math.random();let s=r<.26?'hail':r<.5?'spike':r<.72?'spout':fl&&r<.9?'swirl':'wave';
 if(s===e.last&&Math.random()<.7)s=s==='spout'?'hail':'spout';return s}
function queenSyrupFx(e,dt){const p=qPool(),a=e.ac||0;if(!p)return;
 const feeding=drainT<=0&&p.y>(p.deep?2.75:1.9)&&a!==5&&a!==6&&a!==7&&a!==10;e.feedV=(e.feedV||0)+((feeding?1:0)-(e.feedV||0))*Math.min(1,dt*2);
 if(e.feedV>.05&&!(e.flash>0)){const k=e.feedV*(.45+.35*Math.sin(T*6));for(const m of e.mats)m.emissive.setRGB(.6*k,.34*k,.03*k);
  if(Math.random()<dt*24*e.feedV){const ang=Math.random()*6.28,r=rnd(4,10),f=new V3(e.pos.x+Math.sin(ang)*r,p.y+.1,e.pos.z+Math.cos(ang)*r);puff(f,2,0xffc040,1.5,.8,-3)}}
 if(a===8){if(!QS.vortex){const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d');g.translate(128,128);for(let i=0;i<5;i++){g.rotate(Math.PI*2/5);g.beginPath();for(let k=0;k<60;k++){const t=k/60,r=8+t*118,an=t*4.2;g.lineTo(Math.cos(an)*r,Math.sin(an)*r)}g.strokeStyle='rgba(255,220,140,.75)';g.lineWidth=10;g.stroke()}
   QS.vortex=new THREE.Mesh(new THREE.CircleGeometry(16,48).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c),transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,opacity:.85}));scene.add(QS.vortex)}
  const V=QS.vortex;V.visible=true;V.position.set(e.pos.x,p.y+.07,e.pos.z);V.rotation.y-=dt*3.2;
  if(Math.random()<dt*40){const an=Math.random()*6.28,r=rnd(2,15);puff(new V3(e.pos.x+Math.sin(an)*r,p.y+.15,e.pos.z+Math.cos(an)*r),2,0xffd08a,2,.5,6)}
  if(P.alive&&state==='play'){const dx=e.pos.x-P.pos.x,dz=e.pos.z-P.pos.z,d=Math.hypot(dx,dz)||1;if(d<18&&P.pos.y<p.y+.45){const f=1-d/18;P.vel.x+=(dx/d*10-dz/d*7)*f*dt*3.2;P.vel.z+=(dz/d*10+dx/d*7)*f*dt*3.2;
   if(d<5){QS.vt-=dt;if(QS.vt<=0){QS.vt=.45;hurt(9);sfx('gloop',.6)}}if(!QS.toldV){QS.toldV=true;banner('ВОДОВОРОТ! ВЫБИРАЙСЯ ИЗ СИРОПА')}}}}
 else if(QS.vortex)QS.vortex.visible=false}
const SPOUT_G=new THREE.CylinderGeometry(1,1.35,1,24,1,true).translate(0,.5,0);
function spout(x,z,dmg){const y=Math.max(syrupLvl(x,z),groundAt(x,z,9),0);const r=new THREE.Mesh(MARK_G,new THREE.MeshBasicMaterial({color:0xffa030,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));r.position.set(x,y+.08,z);r.scale.setScalar(2.4);scene.add(r);QS.spouts.push({x,z,y,t:-1.1,dmg,r,c:null,hit:new Set()})}
function updSpouts(dt){for(const s of QS.spouts){const pt=s.t;s.t+=dt;if(s.r)s.r.material.opacity=s.t<0?.4+.5*Math.abs(Math.sin(s.t*16)):Math.max(0,1-s.t*3);
  if(pt<0&&s.t>=0){s.c=new THREE.Mesh(SPOUT_G,new THREE.MeshStandardMaterial({color:0xd8801f,roughness:.1,transparent:true,opacity:.88,envMap:ENV,emissive:0x5a2000,side:THREE.DoubleSide,depthWrite:false}));s.c.position.set(s.x,s.y,s.z);scene.add(s.c);
   puff(new V3(s.x,s.y+.5,s.z),40,0xffb050,9,.9,10);puff(new V3(s.x,s.y+.5,s.z),15,0xfff0c8,7,.7,10);const v=sndV(s.x,s.y,s.z);if(v>.1)sfx('gloop',v);
   if(s.dmg)for(const c of targets()){const key=c.local?'me':c.peer;if(s.hit.has(key))continue;if(Math.hypot(c.pos.x-s.x,c.pos.z-s.z)<2.3&&c.pos.y<s.y+6&&c.pos.y>s.y-1.5){s.hit.add(key);hitTarget(c,18,new V3(0,16,0))}}}
  if(s.c){const k=s.t<.2?s.t/.2:s.t>.75?Math.max(.01,1-(s.t-.75)/.4):1;s.c.scale.set(1.6*(.7+.3*k),7*k,1.6*(.7+.3*k));s.c.material.opacity=.88*k;if(Math.random()<dt*30)puff(new V3(s.x+rnd(-1,1),s.y+7*k,s.z+rnd(-1,1)),2,0xffc060,3,.5,10)}}
 QS.spouts=QS.spouts.filter(s=>{const end=s.t>1.2;if(end){if(s.r)scene.remove(s.r);if(s.c)scene.remove(s.c)}return!end})}
function queenSyrupReset(){QS.fill=0;QS.flood=0;{const p=qPool();if(p)p.fl=0}QS.feedT=0;QS.wasDrain=false;QS.told=false;for(const s of QS.spouts){if(s.r)scene.remove(s.r);if(s.c)scene.remove(s.c)}QS.spouts=[];if(QS.vortex){scene.remove(QS.vortex);QS.vortex=null}const p=qPool();if(p&&p.hi0!=null)p.hi=p.hi0}
/* ---------- Карамельная Царица из Blender (queen.py): тело, голова с короной, кисти; руки — текучие трубки сиропа ---------- */
let QUEEN_T=null;
function loadQueen(){if(QUEEN_T||!THREE.GLTFLoader)return;QUEEN_T='load';new THREE.GLTFLoader().load('models/queen.json',gl=>{gl.scene.updateMatrixWorld(true);QUEEN_T=gl.scene},undefined,()=>{QUEEN_T=null})}
function buildQueenM(g,mm){const E={envMap:ENV,envMapIntensity:1.1};
 const MT={caramel:mm(0xd8801f,{roughness:.1,metalness:.05,transparent:true,opacity:.88,...E}),caramelDark:mm(0xa8500e,{roughness:.14,metalness:.05,transparent:true,opacity:.93,...E}),gold:mm(0xf2c14b,{metalness:1,roughness:.2,...E}),
  gem:mm(0xff7ab8,{roughness:.05,emissive:0xff2a80,emissiveIntensity:.6,...E}),lip:mm(0x5a1604,{roughness:.2}),rockCandy:mm(0xffd9a0,{roughness:.05,transparent:true,opacity:.8,emissive:0x6a3000,...E})};
 const eyeM=new THREE.MeshBasicMaterial({color:0xfff6c8}),heartM=new THREE.MeshBasicMaterial({color:0xfff2c8});MT.eye=eyeM;MT.heart=heartM;
 const node=n=>QUEEN_T.getObjectByName(n),clone=(o,par,pv)=>{o.updateMatrixWorld(true);o.traverse(m=>{if(!m.isMesh)return;const c=new THREE.Mesh(m.geometry,MT[m.material.name]||MT.caramel);c.castShadow=true;m.updateMatrixWorld(true);c.applyMatrix4(m.matrixWorld);if(pv)c.position.sub(pv);par.add(c)})};
 clone(node('q_body'),g);
 const head=new THREE.Group();head.position.set(0,10.45,0);g.add(head);clone(node('q_head'),head,head.position);
 const hg=new THREE.Group();hg.position.set(0,6.9,1.3);g.add(hg);
 const hgeo=node('q_heart').isMesh?node('q_heart').geometry.clone():null;let heart;if(hgeo){hgeo.computeBoundingBox();const c=new V3();hgeo.boundingBox.getCenter(c);hgeo.translate(-c.x,-c.y,-c.z);heart=new THREE.Mesh(hgeo,heartM)}else heart=new THREE.Mesh(new THREE.IcosahedronGeometry(.55,1),heartM);hg.add(heart);
 const glow=new THREE.Sprite(new THREE.SpriteMaterial({map:softTex('rgba(255,210,130,1)','rgba(255,120,30,0)'),blending:THREE.AdditiveBlending,depthWrite:false,transparent:true}));glow.scale.set(3.6,3.6,1);hg.add(glow);
 const arms=[];for(const s of[-1,1]){const sh=new THREE.Group();sh.position.set(s*2.45,8.1,0);g.add(sh);const el=new THREE.Group();el.position.y=-3;sh.add(el);const hand=new THREE.Group();hand.position.y=-2.9;el.add(hand);
  clone(node(s>0?'q_handL':'q_handR'),hand,new V3(s*2.45,2.2,0));
  // трубка руки: кольца вдоль кривой плечо→локоть→кисть, перестраивается каждый кадр
  const NS=26,NR=12,geo=new THREE.BufferGeometry(),pos=new Float32Array(NS*NR*3),idx=[];for(let i=0;i<NS-1;i++)for(let j=0;j<NR;j++){const a=i*NR+j,b=i*NR+(j+1)%NR;idx.push(a,b,a+NR,b,b+NR,a+NR)}
  geo.setAttribute('position',new THREE.BufferAttribute(pos,3));geo.setIndex(idx);const tube=new THREE.Mesh(geo,MT.caramel);tube.frustumCulled=false;tube.castShadow=true;g.add(tube);
  const drips=[];for(let k=0;k<3;k++){const d=new THREE.Mesh(new THREE.SphereGeometry(.16,10,8),MT.caramel);g.add(d);drips.push({m:d,u:.25+k*.25,ph:Math.random()*6})}
  arms.push({sh,el,hand,s,tube,NS,NR,drips})}
 g.userData.q={arms,head,hg,heart,glow,heartM,hairs:[],model:1};return eyeM}
const _qa=new V3(),_qb=new V3(),_qc=new V3(),_qd=new V3(),_qe=new V3(),_qt=new V3(),_qn=new V3(),_qm=new V3();
function queenArms(e,q,t){const g=e.g;g.updateMatrixWorld(true);
 for(const A of q.arms){if(!A.tube)continue;const s=A.s;
  // точки в координатах королевы: корень в плече (чуть внутрь торса), локоть, кисть
  const p0=_qa.set(s*1.75,8.25,0),p1=g.worldToLocal(A.sh.getWorldPosition(_qb)),p2=g.worldToLocal(A.el.getWorldPosition(_qc)),p3=g.worldToLocal(A.hand.getWorldPosition(_qd));
  const curve=new THREE.CatmullRomCurve3([p0.clone(),p1.clone(),p2.clone(),p3.clone().add(_qe.set(0,.15,0))],false,'centripetal');
  const pos=A.tube.geometry.attributes.position,NS=A.NS,NR=A.NR;let prevN=null;
  for(let i=0;i<NS;i++){const u=i/(NS-1),c=curve.getPointAt(u);curve.getTangentAt(u,_qt);
   // плавная толщина: толстое плечо → тонкое запястье, по руке бегут «волны» сиропа
   const r=(.78-.46*u)*(1+.07*Math.sin(u*14-t*4.2+s))*(u<.08?1+.4*(1-u/.08):1);
   let n=prevN?_qn.copy(prevN).sub(_qm.copy(_qt).multiplyScalar(prevN.dot(_qt))).normalize():_qn.set(0,0,1).cross(_qt).normalize();if(n.lengthSq()<.1)n.set(1,0,0);prevN=n.clone();const b=_qm.copy(_qt).cross(n).normalize();
   for(let j=0;j<NR;j++){const a=j/NR*Math.PI*2,cs=Math.cos(a),sn=Math.sin(a),k=(i*NR+j)*3;pos.array[k]=c.x+(n.x*cs+b.x*sn)*r;pos.array[k+1]=c.y+(n.y*cs+b.y*sn)*r-(sn<0?0:0);pos.array[k+2]=c.z+(n.z*cs+b.z*sn)*r}}
  pos.needsUpdate=true;A.tube.geometry.computeVertexNormals();
  // капли висят под рукой и тянутся вниз
  for(const d of A.drips){const c=curve.getPointAt(d.u),r=(.78-.46*d.u),st=1.6+.8*Math.sin(t*2+d.ph);d.m.position.set(c.x,c.y-r*.9-.16*st,c.z);d.m.scale.set(1,st,1)}}}
/*STORY-END*/
