/* ================= ОСТРОВ: растительность и камни (процедурные модели, инстансинг, ветер) ================= */
const WIND={uWT:{value:0},uWA:{value:1}};
function windify(mat,amp=1){mat.onBeforeCompile=sh=>{sh.uniforms.uWT=WIND.uWT;sh.uniforms.uWA={value:amp};
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute float aWind;uniform float uWT,uWA;')
   .replace('#include <begin_vertex>',`#include <begin_vertex>
 {
 #ifdef USE_INSTANCING
 vec3 ip=instanceMatrix[3].xyz;
 #else
 vec3 ip=modelMatrix[3].xyz;
 #endif
 float ph=dot(ip.xz,vec2(.21,.17));float w=aWind*uWA;
 transformed.x+=(sin(uWT*1.4+ph)*.55+sin(uWT*3.9+ph*2.+position.y*1.3+position.x)*.18)*w;
 transformed.z+=(cos(uWT*1.1+ph*1.3)*.45+cos(uWT*4.3+ph+position.z*1.7)*.15)*w;
 transformed.y-=abs(sin(uWT*1.7+ph))*w*.12;}`)};
 mat.customProgramCacheKey=()=>'wind'+amp;return mat}
// накопитель геометрии: несколько частей → один буфер (позиции, нормали, uv, сила ветра)
function GBuf(){const P=[],N=[],U=[],Wd=[],I=[];let base=0;
 return{add(g,m,wf){const gi=g.index?g:g;const p=g.attributes.position,n=g.attributes.normal,u=g.attributes.uv,nm=new THREE.Matrix3().getNormalMatrix(m),v=new V3();
   for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i);const lx=v.x,ly=v.y,lz=v.z;v.applyMatrix4(m);P.push(v.x,v.y,v.z);const uu=u?u.getX(i):0,vv=u?u.getY(i):0;Wd.push(wf?wf(v,lx,ly,lz,uu,vv):0);
    if(n){v.fromBufferAttribute(n,i).applyMatrix3(nm).normalize();N.push(v.x,v.y,v.z)}else N.push(0,1,0);U.push(uu,vv)}
   if(g.index)for(let i=0;i<g.index.count;i++)I.push(base+g.index.getX(i));else for(let i=0;i<p.count;i++)I.push(base+i);base+=p.count},
  raw(pos,nor,uv,wd,idx){const b=base;for(let i=0;i<pos.length/3;i++){P.push(pos[i*3],pos[i*3+1],pos[i*3+2]);N.push(nor[i*3],nor[i*3+1],nor[i*3+2]);U.push(uv[i*2],uv[i*2+1]);Wd.push(wd[i])}for(const k of idx)I.push(b+k);base+=pos.length/3},
  build(){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(N,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(U,2));g.setAttribute('aWind',new THREE.Float32BufferAttribute(Wd,1));g.setIndex(I);g.computeBoundingSphere();return g},get n(){return base}}}
// лента вдоль кривой (лист, вайя): s∈[0,1] по длине, ширина wf(s), прогиб V
function ribbon3(pts,widthF,side,fold,segs,wind,vfl){const n=pts.length,pos=[],nor=[],uv=[],wd=[],idx=[];
 for(let k=0;k<n;k++){const p=pts[k],s=k/(n-1),t=pts[Math.min(n-1,k+1)].clone().sub(pts[Math.max(0,k-1)]).normalize(),sd=side.clone().sub(t.clone().multiplyScalar(side.dot(t))).normalize(),up=new V3().crossVectors(sd,t).normalize(),w=widthF(s);
  for(const q of[-1,0,1]){const v=p.clone().addScaledVector(sd,q*w).addScaledVector(up,-Math.abs(q)*w*fold);pos.push(v.x,v.y,v.z);nor.push(up.x,up.y,up.z);uv.push((q+1)/2,vfl?1-s:s);wd.push(wind(s))}}
 for(let k=0;k<n-1;k++)for(let q=0;q<2;q++){const a=k*3+q,b=a+1,c=a+3,d=c+1;idx.push(a,c,b,b,c,d)}
 // нормали по соседям
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();const nn=g.attributes.normal.array;
 return{pos,nor:Array.from(nn),uv,wd,idx}}
/* ---------- текстуры листвы (альфа) ---------- */
function leafTex(w,h,f){const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');f(g,w,h);const t=new THREE.CanvasTexture(c);t.anisotropy=8;return t}
function vegTextures(){if(GT.vegTex)return GT.vegTex;let sd=7;const r=()=>(sd=(sd*16807)%2147483647)/2147483647;
 const frond=(dead)=>leafTex(256,1024,(g,w,h)=>{const cx=w/2;
  for(let i=0;i<64;i++){const y=h*(.04+i/64*.93),s=i/64,len=w*.5*Math.pow(Math.sin(Math.min(1,s*1.05+.06)*Math.PI),.55)*(.85+r()*.2);
   for(const sx of[-1,1]){const ang=.55+s*.35,ex=cx+sx*len*Math.cos(ang*.35),ey=y+len*Math.sin(ang)*.55;const gr=g.createLinearGradient(cx,y,ex,ey);
    if(dead){gr.addColorStop(0,'#8a6a3a');gr.addColorStop(1,'#b8925a')}else{gr.addColorStop(0,r()<.5?'#2f7a2c':'#3c8a32');gr.addColorStop(.7,'#5aa63c');gr.addColorStop(1,'#8cc45a')}
    g.fillStyle=gr;g.beginPath();g.moveTo(cx,y-3);g.quadraticCurveTo(cx+sx*len*.5,y-5+len*.12,ex,ey);g.quadraticCurveTo(cx+sx*len*.5,y+6+len*.2,cx,y+5);g.fill();
    g.strokeStyle=dead?'rgba(90,60,30,.6)':'rgba(25,70,20,.5)';g.lineWidth=1;g.beginPath();g.moveTo(cx,y);g.quadraticCurveTo(cx+sx*len*.5,y+len*.15,ex,ey);g.stroke()}}
  g.fillStyle=dead?'#7a5a30':'#a8b860';g.fillRect(cx-4,0,8,h)});
 const banana=leafTex(512,1024,(g,w,h)=>{const cx=w/2;g.save();g.beginPath();g.moveTo(cx,0);g.bezierCurveTo(w*.98,h*.12,w*.98,h*.8,cx,h);g.bezierCurveTo(w*.02,h*.8,w*.02,h*.12,cx,0);g.clip();
  const gr=g.createLinearGradient(0,0,w,0);gr.addColorStop(0,'#3f8a2e');gr.addColorStop(.5,'#5fae3e');gr.addColorStop(1,'#3a8030');g.fillStyle=gr;g.fillRect(0,0,w,h);
  for(let y=8;y<h;y+=7){g.strokeStyle=`rgba(${r()<.5?'40,90,30':'120,190,80'},.35)`;g.lineWidth=1.5;for(const sx of[-1,1]){g.beginPath();g.moveTo(cx,y);g.quadraticCurveTo(cx+sx*w*.25,y+10,cx+sx*w*.5,y+24);g.stroke()}}
  g.globalCompositeOperation='destination-out';for(let i=0;i<9;i++){const y=h*(.15+r()*.75),sx=r()<.5?-1:1;g.beginPath();g.moveTo(cx+sx*w*(.08+r()*.1),y);g.lineTo(cx+sx*w*.6,y+8+r()*30);g.lineTo(cx+sx*w*.6,y+16+r()*30);g.closePath();g.fill()}
  g.restore();g.fillStyle='#c8d890';g.fillRect(cx-5,0,10,h)});
 const fern=leafTex(256,512,(g,w,h)=>{const cx=w/2;for(let i=0;i<40;i++){const y=h*(.03+i/40*.95),s=i/40,len=w*.48*Math.sin(Math.min(1,s*1.1+.08)*Math.PI*.95);
   for(const sx of[-1,1]){g.fillStyle=r()<.5?'#3d8a34':'#4f9e3a';g.beginPath();g.moveTo(cx,y);g.quadraticCurveTo(cx+sx*len*.6,y-6,cx+sx*len,y+6);g.quadraticCurveTo(cx+sx*len*.5,y+9,cx,y+5);g.fill()}}g.fillStyle='#5a7a2a';g.fillRect(cx-2,0,4,h)});
 const cluster=(flowers)=>leafTex(512,512,(g,w,h)=>{const C=['#2e7a2a','#3d8f32','#4ea53c','#2a6a26','#5cb446'];
  for(let i=0;i<150;i++){const a=r()*6.28,rr=Math.sqrt(r())*w*.42,x=w/2+Math.cos(a)*rr,y=h/2+Math.sin(a)*rr,s=18+r()*26,ang=a+r()-.5;g.save();g.translate(x,y);g.rotate(ang);
   g.fillStyle=C[i%5];g.beginPath();g.moveTo(-s,0);g.quadraticCurveTo(0,-s*.55,s,0);g.quadraticCurveTo(0,s*.55,-s,0);g.fill();g.strokeStyle='rgba(20,60,15,.5)';g.lineWidth=1.2;g.beginPath();g.moveTo(-s,0);g.lineTo(s,0);g.stroke();g.restore()}
  if(flowers)for(let i=0;i<16;i++){const a=r()*6.28,rr=Math.sqrt(r())*w*.38,x=w/2+Math.cos(a)*rr,y=h/2+Math.sin(a)*rr,s=10+r()*7,col=flowers[i%flowers.length];
   for(let k=0;k<5;k++){g.fillStyle=col;g.beginPath();g.ellipse(x+Math.cos(k*1.256)*s*.6,y+Math.sin(k*1.256)*s*.6,s*.55,s*.4,k*1.256,0,7);g.fill()}g.fillStyle='#ffe066';g.beginPath();g.arc(x,y,s*.22,0,7);g.fill()}});
 const monstera=leafTex(512,512,(g,w,h)=>{const cx=w/2;g.fillStyle='#2f7d34';g.beginPath();g.moveTo(cx,h*.98);g.bezierCurveTo(w*.02,h*.75,w*.02,h*.1,cx,h*.18);g.bezierCurveTo(w*.98,h*.1,w*.98,h*.75,cx,h*.98);g.fill();
  g.strokeStyle='#5ea84a';g.lineWidth=5;g.beginPath();g.moveTo(cx,h*.18);g.lineTo(cx,h*.98);g.stroke();g.globalCompositeOperation='destination-out';
  for(let i=0;i<6;i++){const y=h*(.3+i*.11);for(const sx of[-1,1]){g.beginPath();g.moveTo(cx+sx*w*.12,y);g.lineTo(cx+sx*w*.5,y-14);g.lineTo(cx+sx*w*.5,y+8);g.closePath();g.fill();g.beginPath();g.ellipse(cx+sx*w*.2,y+18,9,5,0,0,7);g.fill()}}});
 const grass=leafTex(256,256,(g,w,h)=>{for(let i=0;i<46;i++){const x=w*(.08+r()*.84),lh=h*(.45+r()*.55),bend=(r()-.5)*60,gr=g.createLinearGradient(0,h,0,h-lh);gr.addColorStop(0,'#3b6e26');gr.addColorStop(.6,'#6ea842');gr.addColorStop(1,'#b8d070');g.fillStyle=gr;
   g.beginPath();g.moveTo(x-4,h);g.quadraticCurveTo(x+bend*.4,h-lh*.6,x+bend,h-lh);g.quadraticCurveTo(x+bend*.4+2,h-lh*.6,x+4,h);g.fill()}});
 const dune=leafTex(256,256,(g,w,h)=>{for(let i=0;i<40;i++){const x=w*(.1+r()*.8),lh=h*(.5+r()*.5),bend=(r()-.5)*90,gr=g.createLinearGradient(0,h,0,h-lh);gr.addColorStop(0,'#7a8a4a');gr.addColorStop(1,'#d8cf8a');g.fillStyle=gr;
   g.beginPath();g.moveTo(x-3,h);g.quadraticCurveTo(x+bend*.4,h-lh*.6,x+bend,h-lh);g.quadraticCurveTo(x+bend*.4+2,h-lh*.6,x+3,h);g.fill()}});
 const bark=leafTex(256,512,(g,w,h)=>{g.fillStyle='#8c7656';g.fillRect(0,0,w,h);for(let y=0;y<h;y+=18+r()*10){const gr=g.createLinearGradient(0,y,0,y+16);gr.addColorStop(0,'#5e4a34');gr.addColorStop(.4,'#9c8664');gr.addColorStop(1,'#7a6448');g.fillStyle=gr;g.fillRect(0,y,w,16);
   g.strokeStyle='rgba(50,38,26,.7)';g.lineWidth=2;g.beginPath();g.moveTo(0,y);for(let x=0;x<=w;x+=16)g.lineTo(x,y+(r()-.5)*5);g.stroke()}
  for(let i=0;i<3000;i++){g.fillStyle=r()<.5?'rgba(40,30,20,.3)':'rgba(200,180,150,.25)';g.fillRect(r()*w,r()*h,2,1+r()*3)}});
 const tbark=leafTex(256,512,(g,w,h)=>{g.fillStyle='#6a5f52';g.fillRect(0,0,w,h);for(let i=0;i<120;i++){const x=r()*w;g.strokeStyle=`rgba(${r()<.5?'40,36,30':'150,140,120'},.5)`;g.lineWidth=2+r()*5;g.beginPath();g.moveTo(x,0);for(let y=0;y<=h;y+=32)g.lineTo(x+(r()-.5)*12,y);g.stroke()}
  for(let i=0;i<40;i++){const x=r()*w,y=r()*h,rr=10+r()*40;g.fillStyle='rgba(80,120,50,.35)';g.beginPath();g.ellipse(x,y,rr,rr*.6,0,0,7);g.fill()}});
 const wing=leafTex(128,128,(g,w,h)=>{});
 for(const t of[bark,tbark]){t.wrapS=t.wrapT=THREE.RepeatWrapping}
 return GT.vegTex={frond:frond(false),dead:frond(true),banana,fern,bush:cluster(null),hibiscus:cluster(['#ff3b6b','#ff7ab0','#fff0f4']),bougain:cluster(['#e0359a','#ff5fbf','#c4207e']),monstera,grass,dune,bark,tbark}}
function leafMat(tex,amp,col){const m=new THREE.MeshStandardMaterial({map:tex,alphaTest:.42,side:THREE.DoubleSide,roughness:.62,metalness:0,color:col||0xffffff});windify(m,amp);
 m.userData.depth=new THREE.MeshDepthMaterial({depthPacking:THREE.RGBADepthPacking,map:tex,alphaTest:.42});return m}
function vegMats(){if(L4.VM)return L4.VM;const T=vegTextures();
 const bark=new THREE.MeshStandardMaterial({map:T.bark,roughness:.92});windify(bark,1);const tbark=new THREE.MeshStandardMaterial({map:T.tbark,roughness:.95});windify(tbark,1);
 return L4.VM={frond:leafMat(T.frond,1),dead:leafMat(T.dead,1),banana:leafMat(T.banana,1),fern:leafMat(T.fern,1),bush:leafMat(T.bush,1),hibiscus:leafMat(T.hibiscus,1),bougain:leafMat(T.bougain,1),monstera:leafMat(T.monstera,1),grass:leafMat(T.grass,1),dune:leafMat(T.dune,1),
  canopy:leafMat(T.bush,1,0xd8f0c8),bark,tbark,nut:new THREE.MeshStandardMaterial({color:0x6a4a22,roughness:.7})}}
/* ---------- модели ---------- */
function palmGeo(H,lean,seed){let sd=seed;const r=()=>(sd=(sd*16807)%2147483647)/2147483647;const tr=GBuf(),fr=GBuf(),dd=GBuf(),nu=GBuf();
 const P=t=>new V3(lean*Math.pow(t,1.7)*H*.32,t*H,0),R=t=>.27-.1*t+.16*Math.pow(1-t,8);const RS=12,LS=26;
 {const pos=[],nor=[],uv=[],wd=[],idx=[];for(let k=0;k<=LS;k++){const t=k/LS,c=P(t),tn=P(Math.min(1,t+.02)).sub(P(Math.max(0,t-.02))).normalize(),sd_=new V3(0,0,1),b=new V3().crossVectors(tn,sd_).normalize(),rr=R(t)*(1+.04*Math.sin(t*H*6.3));
   for(let i=0;i<=RS;i++){const a=i/RS*6.283,n=b.clone().multiplyScalar(Math.cos(a)).addScaledVector(sd_,Math.sin(a));pos.push(c.x+n.x*rr,c.y+n.y*rr,c.z+n.z*rr);nor.push(n.x,n.y,n.z);uv.push(i/RS,t*H*.5);wd.push(t*t*.08)}}
  for(let k=0;k<LS;k++)for(let i=0;i<RS;i++){const a=k*(RS+1)+i,b=a+1,c=a+RS+1,d=c+1;idx.push(a,c,b,b,c,d)}tr.raw(pos,nor,uv,wd,idx)}
 const C=P(1);C.y+=.15;const n=14;
 for(let i=0;i<n+4;i++){const dead=i>=n,yaw=i*2.399+r()*.3,len=dead?2.6+r():3.4+r()*1.2+(i%3)*.3,pitch=dead?-1.2-r()*.3:(i<3?1.05:.35+r()*.55),droop=dead?0:.16+r()*.08;
  const dir=new V3(Math.sin(yaw),0,Math.cos(yaw)),pts=[];for(let k=0;k<=10;k++){const s=k/10*len,p=C.clone().addScaledVector(dir,Math.cos(pitch)*s).add(new V3(0,Math.sin(pitch)*s-droop*s*s,0));pts.push(p)}
  const side=new V3(Math.cos(yaw),0,-Math.sin(yaw)),rb=ribbon3(pts,s=>(dead?.32:.62)*Math.pow(Math.sin(Math.min(1,s*1.05+.05)*Math.PI),.5),side,.18,10,s=>dead?.15*s:Math.pow(s,1.4)*.55+.05);
  (dead?dd:fr).raw(rb.pos,rb.nor,rb.uv,rb.wd,rb.idx)}
 const sg=new THREE.SphereGeometry(.17,8,6);for(let i=0;i<6;i++){const a=i*1.1;nu.add(sg,new THREE.Matrix4().makeTranslation(C.x+Math.cos(a)*.24,C.y-.32-(i%2)*.12,C.z+Math.sin(a)*.24),()=>.08)}
 return{trunk:tr.build(),fronds:fr.build(),dead:dd.build(),nuts:nu.build(),top:C}}
function bushGeo(sz,cards=13){const b=GBuf();const pg=new THREE.PlaneGeometry(1,1);let sd=11+cards;const r=()=>(sd=(sd*16807)%2147483647)/2147483647;
 for(let i=0;i<cards;i++){const a=i*2.399,el=r()*.9,m=new THREE.Matrix4().compose(new V3(Math.cos(a)*sz*.35*(1-el*.5),sz*(.35+el*.4),Math.sin(a)*sz*.35*(1-el*.5)),new THREE.Quaternion().setFromEuler(new THREE.Euler(-.4+r()*.8-el*.6,a+r(),0,'YXZ')),new V3(sz*(1.1+r()*.3),sz*(1+r()*.3),1));
  b.add(pg,m,v=>Math.max(0,v.y)/sz*.12)}return b.build()}
function fernGeo(len){const b=GBuf();for(let i=0;i<9;i++){const yaw=i*.7+(i%2)*.3,pitch=.9-(i%3)*.25,dir=new V3(Math.sin(yaw),0,Math.cos(yaw)),pts=[];for(let k=0;k<=8;k++){const s=k/8*len;pts.push(dir.clone().multiplyScalar(Math.cos(pitch)*s).add(new V3(0,Math.sin(pitch)*s-.55*s*s/len,0)))}
  const rb=ribbon3(pts,s=>.2*Math.sin(Math.min(1,s+.08)*Math.PI*.95),new V3(Math.cos(yaw),0,-Math.sin(yaw)),.1,8,s=>s*s*.12);b.raw(rb.pos,rb.nor,rb.uv,rb.wd,rb.idx)}return b.build()}
function bananaGeo(){const b=GBuf(),stem=new THREE.CylinderGeometry(.11,.16,2.2,8,1,true);b.add(stem,new THREE.Matrix4().makeTranslation(0,1.1,0),v=>v.y*.02);
 for(let i=0;i<7;i++){const yaw=i*2.3,pitch=.95-(i%3)*.3,len=2.1+(i%2)*.4,dir=new V3(Math.sin(yaw),0,Math.cos(yaw)),pts=[];for(let k=0;k<=8;k++){const s=k/8*len;pts.push(new V3(0,2.1,0).addScaledVector(dir,Math.cos(pitch)*s+.05).add(new V3(0,Math.sin(pitch)*s-.32*s*s,0)))}
  const rb=ribbon3(pts,s=>.34*Math.pow(Math.sin(Math.min(1,s*1.02+.02)*Math.PI),.6),new V3(Math.cos(yaw),0,-Math.sin(yaw)),.12,8,s=>.05+s*s*.3);b.raw(rb.pos,rb.nor,rb.uv,rb.wd,rb.idx)}return b.build()}
function monsteraGeo(){const b=GBuf(),pg=new THREE.PlaneGeometry(.9,.9).translate(0,.45,0);for(let i=0;i<8;i++){const a=i*2.4,h=.4+(i%3)*.25;b.add(pg,new THREE.Matrix4().compose(new V3(Math.sin(a)*.35,h,Math.cos(a)*.35),new THREE.Quaternion().setFromEuler(new THREE.Euler(-1.1+(i%2)*.3,a,0,'YXZ')),new V3(1,1,1)),v=>Math.max(0,v.y-.3)*.08)}return b.build()}
function grassGeo(w,h,mat){const b=GBuf(),pg=new THREE.PlaneGeometry(w,h).translate(0,h/2,0);for(let i=0;i<3;i++)b.add(pg,new THREE.Matrix4().makeRotationY(i*1.047),v=>Math.max(0,v.y)/h*.09);return b.build()}
function treeGeo(seed){let sd=seed;const r=()=>(sd=(sd*16807)%2147483647)/2147483647;const tr=GBuf(),cn=GBuf();const H=12+r()*4;
 const tube=(pts,r0,r1,w0)=>{const cv=new THREE.CatmullRomCurve3(pts),tg=new THREE.TubeGeometry(cv,12,1,8,false),p=tg.attributes.position,n=tg.attributes.normal;
  for(let i=0;i<p.count;i++){const seg=Math.floor(i/9),t=seg/12,c=cv.getPoint(t),rr=r0+(r1-r0)*t;p.setXYZ(i,c.x+n.getX(i)*rr,c.y+n.getY(i)*rr,c.z+n.getZ(i)*rr)}
  const uv=tg.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*6,uv.getY(i));tr.add(tg,new THREE.Matrix4(),v=>Math.max(0,v.y-4)*w0)};
 tube([new V3(0,0,0),new V3(.3,H*.4,.1),new V3(-.2,H*.75,.2),new V3(.1,H,0)],.62,.26,.006);
 for(let i=0;i<5;i++){const a=i*1.4+r(),L=1.6+r();tube([new V3(Math.cos(a)*.2,1.6,Math.sin(a)*.2),new V3(Math.cos(a)*.7,.6,Math.sin(a)*.7),new V3(Math.cos(a)*L,0,Math.sin(a)*L)],.32,.08,0)}   // корни-подпорки
 const ends=[];for(let i=0;i<5;i++){const a=i*1.25+r()*.5,h0=H*(.55+i*.08),L=3+r()*2.5,e=new V3(Math.cos(a)*L,h0+2+r()*1.5,Math.sin(a)*L);tube([new V3(0,h0,0),new V3(Math.cos(a)*L*.5,h0+1.4,Math.sin(a)*L*.5),e],.24,.08,.006);ends.push(e)}ends.push(new V3(0,H+.6,0));
 const pg=new THREE.PlaneGeometry(1,1);for(const e of ends)for(let k=0;k<9;k++){const o=new V3((r()-.5)*3.4,(r()-.3)*1.6,(r()-.5)*3.4),s=2.4+r()*1.6;cn.add(pg,new THREE.Matrix4().compose(e.clone().add(o),new THREE.Quaternion().setFromEuler(new THREE.Euler(r()*3,r()*6.28,r()*3)),new V3(s,s,1)),v=>.06+Math.max(0,v.y-H*.5)*.012)}
 return{trunk:tr.build(),canopy:cn.build(),H}}
function rockGeo(seed,det=4){let sd=seed;const r=()=>(sd=(sd*16807)%2147483647)/2147483647;const g=new THREE.IcosahedronGeometry(1,det),p=g.attributes.position,v=new V3(),ox=r()*50,oz=r()*50,sq=.55+r()*.35,stretch=1+r()*.6;
 for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i);const n1=ifbm(v.x*1.3+ox,v.z*1.3+v.y*.7+oz,4),n2=ifbm(v.y*2.6+oz,v.x*2.6-v.z+ox,3),k=.72+n1*.5+n2*.18;v.multiplyScalar(k);v.y*=sq;v.x*=stretch;if(v.y<-.25*sq)v.y=-.25*sq+(v.y+.25*sq)*.3;p.setXYZ(i,v.x,v.y,v.z)}
 g.computeVertexNormals();return g}
function rockMat(){if(L4.rockM)return L4.rockM;const T=isleTextures(),m=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.92});
 m.onBeforeCompile=sh=>{sh.uniforms.uRock={value:T.rock};sh.uniforms.uJung={value:T.grass};
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vRP;varying vec3 vRN;').replace('#include <fog_vertex>',`#include <fog_vertex>
 #ifdef USE_INSTANCING
 vec4 rw=modelMatrix*instanceMatrix*vec4(transformed,1.);vRN=normalize(mat3(modelMatrix)*mat3(instanceMatrix)*objectNormal);
 #else
 vec4 rw=modelMatrix*vec4(transformed,1.);vRN=normalize(mat3(modelMatrix)*objectNormal);
 #endif
 vRP=rw.xyz;`);
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform sampler2D uRock,uJung;varying vec3 vRP;varying vec3 vRN;')
   .replace('#include <map_fragment>',`{vec3 b=pow(abs(vRN),vec3(4.));b/=b.x+b.y+b.z;vec3 c=texture2D(uRock,vRP.yz*.18).rgb*b.x+texture2D(uRock,vRP.xz*.18).rgb*b.y+texture2D(uRock,vRP.xy*.18).rgb*b.z;
 float moss=smoothstep(.55,.85,vRN.y)*smoothstep(-.6,1.,vRP.y)*(vRP.z<0.?1.:.35);c=mix(c,texture2D(uJung,vRP.xz*.3).rgb*.8,moss*.75);
 float wet=smoothstep(-.4,-1.3,vRP.y);c*=mix(1.,.62,wet);diffuseColor.rgb*=c;}`)};
 m.customProgramCacheKey=()=>'isleRock';return L4.rockM=m}
/* ---------- коллизия камней: верх каждого валуна растеризуется в сетку 0.5 м и вливается в TERR.h —
   по камням можно ходить, сквозь них не пройти (крутой бок = стена); для пуль — невидимые грубые прокси ---------- */
function rockField(){if(L4.rockF)return L4.rockF;const c=.5,x0=TG.x0,z0=TG.z0,nx=Math.ceil((TG.nx-1)*TG.c/c)+1,nz=Math.ceil((TG.nz-1)*TG.c/c)+1,H=new Float32Array(nx*nz).fill(-1e9);
 const a=new V3(),b=new V3(),d=new V3();
 const F={c,x0,z0,nx,nz,H,add(geo,mat){const p=geo.attributes.position,ix=geo.index,n=ix?ix.count:p.count;
   for(let t=0;t<n;t+=3){a.fromBufferAttribute(p,ix?ix.getX(t):t).applyMatrix4(mat);b.fromBufferAttribute(p,ix?ix.getX(t+1):t+1).applyMatrix4(mat);d.fromBufferAttribute(p,ix?ix.getX(t+2):t+2).applyMatrix4(mat);
    const det=(b.z-d.z)*(a.x-d.x)+(d.x-b.x)*(a.z-d.z);if(Math.abs(det)<1e-7)continue;
    const i0=Math.max(0,Math.floor((Math.min(a.x,b.x,d.x)-x0)/c)),i1=Math.min(nx-1,Math.ceil((Math.max(a.x,b.x,d.x)-x0)/c)),j0=Math.max(0,Math.floor((Math.min(a.z,b.z,d.z)-z0)/c)),j1=Math.min(nz-1,Math.ceil((Math.max(a.z,b.z,d.z)-z0)/c));
    for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){const px=x0+i*c,pz=z0+j*c,l1=((b.z-d.z)*(px-d.x)+(d.x-b.x)*(pz-d.z))/det,l2=((d.z-a.z)*(px-d.x)+(a.x-d.x)*(pz-d.z))/det,l3=1-l1-l2;
     if(l1<-.03||l2<-.03||l3<-.03)continue;const y=l1*a.y+l2*b.y+l3*d.y,k=j*nx+i;if(y>H[k])H[k]=y}}},
  h(x,z){const i=Math.round((x-x0)/c),j=Math.round((z-z0)/c);return i<0||j<0||i>=nx||j>=nz?-1e9:H[j*nx+i]}};
 return L4.rockF=F}
function rockCollide(geo,mat,proxyGeo){rockField().add(geo,mat);const m=new THREE.Mesh(proxyGeo,new THREE.MeshBasicMaterial());m.visible=false;m.matrixAutoUpdate=false;m.matrix.copy(mat);m.matrixWorld.copy(mat);
 proxyGeo.computeBoundingSphere();level.push(m)}
function rockTerrain(){const F=L4.rockF;if(!F||!TERR||TERR.base)return;const base=TERR.h;TERR.base=base;TERR.h=(x,z)=>{const t=base(x,z),r=F.h(x,z);return r>t?r:t}}
/* ---------- расстановка: инстансинг с поворотом и масштабом ---------- */
function vegInst(geo,mat,list,shadow=true,recv=true){if(!list.length)return null;const im=new THREE.InstancedMesh(geo,mat,list.length),o=new THREE.Object3D();
 list.forEach((t,i)=>{o.position.set(t[0],t[1],t[2]);o.rotation.set(t[5]||0,t[3]||0,t[6]||0);const s=t[4]||1;o.scale.set(s*(t[7]||1),s,s*(t[7]||1));o.updateMatrix();im.setMatrixAt(i,o.matrix)});
 im.castShadow=shadow;im.receiveShadow=recv;if(mat.userData.depth)im.customDepthMaterial=mat.userData.depth;im.userData.dyn=1;im.frustumCulled=true;im.computeBoundingSphere&&im.computeBoundingSphere();
 // InstancedMesh в r128 не пересчитывает сферу по инстансам: ставим свою
 {const bs=new THREE.Sphere();const pts=list.map(t=>new V3(t[0],t[1],t[2]));bs.setFromPoints(pts);bs.radius+=14;im.geometry=im.geometry.clone();im.geometry.boundingSphere=bs}
 mapGroup.add(im);return im}
// разброс точек: пуассон по сетке, с фильтром
function scatter(x0,x1,z0,z1,minD,n,ok,seed=1){let sd=seed*9973+7;const r=()=>(sd=(sd*16807)%2147483647)/2147483647;const out=[],cs=minD/1.42,grid=new Map();const key=(x,z)=>Math.floor(x/cs)+','+Math.floor(z/cs);
 for(let k=0;k<n*30&&out.length<n;k++){const x=x0+r()*(x1-x0),z=z0+r()*(z1-z0);if(!ok(x,z,r))continue;let bad=false;const gx=Math.floor(x/cs),gz=Math.floor(z/cs);
  for(let i=-2;i<=2&&!bad;i++)for(let j=-2;j<=2&&!bad;j++){const c=grid.get((gx+i)+','+(gz+j));if(c&&Math.hypot(c[0]-x,c[1]-z)<minD)bad=true}if(bad)continue;grid.set(key(x,z),[x,z]);out.push([x,z,r()])}return out}
