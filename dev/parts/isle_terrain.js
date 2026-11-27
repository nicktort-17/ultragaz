/* ================= ОСТРОВ: рельеф (карта высот), материал с плавным смешиванием, вода с глубиной ================= */
const SEA4_Y=-1.1;
const TG={x0:-104,z0:-214,c:1.25,nx:167,nz:289};   // сетка высот: x -104..104, z -214..146
const ihash=(x,z)=>{const s=Math.sin(x*127.1+z*311.7)*43758.5453;return s-Math.floor(s)};
function inoise(x,z){const ix=Math.floor(x),iz=Math.floor(z),fx=x-ix,fz=z-iz,ux=fx*fx*(3-2*fx),uz=fz*fz*(3-2*fz);
 const a=ihash(ix,iz),b=ihash(ix+1,iz),c=ihash(ix,iz+1),d=ihash(ix+1,iz+1);return a+(b-a)*ux+(c-a)*uz+(a-b-c+d)*ux*uz}
function ifbm(x,z,o=4){let s=0,a=.5,f=1,n=0;for(let i=0;i<o;i++){s+=inoise(x*f,z*f)*a;n+=a;f*=2.03;a*=.5;x+=17.3;z+=9.1}return s/n}
const ss=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t)};
const lerp=(a,b,t)=>a+(b-a)*t;
// прямоугольная маска с мягким краем (1 внутри)
const rmask=(x,z,x0,x1,z0,z1,s)=>ss(x0-s,x0,x)*ss(x1+s,x1,x)*ss(z0-s,z0,z)*ss(z1+s,z1,z);
// береговая линия: залив с причалом спереди (+z), скалистые мысы, холм с храмом сзади
const COAST=[[0,41],[14,40],[28,35],[40,27],[50,12],[55,-12],[57,-45],[59,-80],[56,-115],[50,-148],[38,-174],[18,-190],[0,-195],[-18,-190],[-38,-174],[-50,-148],[-56,-115],[-59,-80],[-57,-45],[-55,-12],[-50,12],[-40,27],[-28,35],[-14,40]];
function coastD(x,z){let inside=false,md=1e9;for(let i=0,j=COAST.length-1;i<COAST.length;j=i++){const [xi,zi]=COAST[i],[xj,zj]=COAST[j];
  if((zi>z)!==(zj>z)&&x<(xj-xi)*(z-zi)/(zj-zi)+xi)inside=!inside;const dx=xj-xi,dz=zj-zi,t=Math.max(0,Math.min(1,((x-xi)*dx+(z-zi)*dz)/(dx*dx+dz*dz))),ex=xi+dx*t-x,ez=zi+dz*t-z;md=Math.min(md,ex*ex+ez*ez)}
 return (inside?1:-1)*Math.sqrt(md)}
// зоны уровня (используются и рельефом, и расстановкой)
const IZ={beach:[-32,32,-1,37],gate:[-3.2,3.2,-9,1],jungle:[-15,15,-46,-8],villa:[-34,34,-102,-50],temple:[-28,28,-158,-110]};
// дорожка в джунглях: от ворот к лестнице на виллу
const jPath=z=>Math.sin((z+8)*.11)*5.5*ss(-8,-16,z)*ss(-46,-38,z);
// ручей: из водопада у левой скалы через долину к правой
const creekX=z=>-15+(z+18)*0*1;
function creekD(x,z){// расстояние до русла (ломаная)
 const C=[[-17.5,-21],[-12,-23.5],[-6,-25],[0,-27.5],[6,-26.5],[11,-28.5],[17.5,-31]];let md=1e9;
 for(let i=1;i<C.length;i++){const [ax,az]=C[i-1],[bx,bz]=C[i],dx=bx-ax,dz=bz-az,t=Math.max(0,Math.min(1,((x-ax)*dx+(z-az)*dz)/(dx*dx+dz*dz))),ex=ax+dx*t-x,ez=az+dz*t-z;md=Math.min(md,Math.hypot(ex,ez))}return md}
function isleHeight(x,z){
 let d=coastD(x,z);const bay=ss(10,22,Math.abs(x))+ss(26,18,z);d+=(ifbm(x*.045,z*.045,3)-.5)*9*Math.min(1,bay);
 // берег и дно
 let h=d<0?-1.6-6.8*(1-Math.exp(d/14)):d<16?-1.6+.115*d:.24+.05*(d-16);
 h+=(ifbm(x*.12,z*.12,3)-.5)*.35*ss(4,14,d);                                    // лёгкие дюны
 // пляжная арена всегда сухая: ровный уклон от хребта к воде
 {const bm=rmask(x,z,-33,33,-3,29,7);const prof=1.25-Math.max(0,z)*.062;h=lerp(h,Math.max(h,prof),bm);}
 const inl=ss(6,16,d);                                                           // насколько далеко от воды
 // хребет между пляжем и джунглями (с проходом-ущельем)
 const ridge=ss(3,-1,z)*ss(-11,-6.5,z)*(7.5+ifbm(x*.09,z*.09)*5)*inl;
 // холмы по бокам джунглей и за храмом, мысы у пляжа
 const sideJ=ss(15.5,19,Math.abs(x))*ss(1,-4,z)*ss(-52,-47,z)*(11+ifbm(x*.05+3,z*.05)*12)*inl;
 const head=ss(31,40,Math.abs(x))*ss(-4,2,z)*ss(30,18,z)*(3+ifbm(x*.08,z*.08)*7)*ss(2,10,d);
 const back=ss(-157,-166,z)*(10+ifbm(x*.04,z*.04+5)*14)*ss(0,22,d);
 const hillW=ss(36,44,Math.abs(x))*ss(-50,-58,z)*ss(-104,-96,z)*0;               // склоны у виллы — обрывы к морю
 const F=v=>v>.02?v:-99;h=Math.max(h,F(ridge),F(sideJ),F(head),F(back));
 // ущелье-проход в хребте
 const gate=rmask(x,z,-3.4,3.4,-9.5,1.5,1.2);h=lerp(h,1.25+(z>0?-.1*z:0),gate*inl);
 // долина джунглей: пол с неровностями, русло ручья, тропа
 const jun=rmask(x,z,-15,15,-46.5,-7.5,2.2);let jf=1+(ifbm(x*.15,z*.15)-.5)*.9;const cd=creekD(x,z);jf-=.9*ss(2.6,.6,cd);
 jf=lerp(jf,1.05,ss(2.6,.8,Math.abs(x-jPath(z)))*.7*(cd>2.8?1:0));h=lerp(h,jf,jun);
 // плато виллы y=4 и холм храма y=9: ровные площадки с обрывами
 const vil=rmask(x,z,-34,34,-102,-50.5,1.1);h=lerp(h,4,vil);
 const tem=rmask(x,z,-28,28,-157,-103,1.1);h=lerp(h,9,tem);
 // бухты у плато: склоны к воде, а не провал
 if(vil<1&&z<-48&&z>-104&&Math.abs(x)>34){const k=ss(34,46,Math.abs(x));h=Math.min(h,lerp(4,h,k))}
 return h}
// веса материалов в вершине: песок, трава, лесная подстилка, тропа (+ подсказка «скала»)
function isleWeights(x,z,h,slope){let sand=0,grass=0,jung=0,path=0,rock=0;const d=coastD(x,z);
 if(h<1.9&&(z>-5||d<10))sand=1;
 if(z<-5&&z>-50&&Math.abs(x)<22)jung=1;
 if(z<=-48)grass=1;
 if(z>-8&&z<4&&h>2.2)rock=.6;
 if(Math.abs(x)>17&&z<-3&&z>-50&&h>2.5){jung=.6;rock=.4}
 if(h>2.2&&z>-8&&!jung)grass=Math.max(grass,.7);
 if(z<-5&&z>-50&&Math.abs(x)<16){const pd=Math.abs(x-jPath(z));path=ss(2.2,.9,pd)*ss(-7,-10,z)*ss(-47,-43,z);if(creekD(x,z)<2.6)path=0}
 if(rmask(x,z,-3.4,3.4,-9.5,1.5,1)>.5)path=Math.max(path,.8);
 const s=sand+grass+jung+path||1;return [sand/s,grass/s,jung/s,path/s,rock]}

/* ---------- текстуры поверхности: процедурные, тайлящиеся, чёткие ---------- */
function tTex(n,f){const c=document.createElement('canvas');c.width=c.height=n;const g=c.getContext('2d');f(g,n);const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=renderer.capabilities.getMaxAnisotropy?Math.min(16,renderer.capabilities.getMaxAnisotropy()):8;return t}
function tWrap(g,n,draw){for(const ox of[-n,0,n])for(const oy of[-n,0,n]){g.save();g.translate(ox,oy);draw();g.restore()}}
function isleTextures(){if(GT.isleTex)return GT.isleTex;let sd=91;const r=()=>(sd=(sd*16807)%2147483647)/2147483647;
 const sand=tTex(1024,(g,n)=>{g.fillStyle='#d9c393';g.fillRect(0,0,n,n);
  for(let i=0;i<60;i++){const x=r()*n,y=r()*n,rr=40+r()*160;const gr=g.createRadialGradient(x,y,0,x,y,rr);const v=r()<.5;gr.addColorStop(0,v?'rgba(255,245,215,.25)':'rgba(190,160,110,.18)');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;tWrap(g,n,()=>{g.fillRect(x-rr,y-rr,rr*2,rr*2)})}
  for(let i=0;i<26;i++){const y=r()*n,a=.05+r()*.05;g.strokeStyle=`rgba(160,128,80,${a})`;g.lineWidth=2+r()*3;tWrap(g,n,()=>{g.beginPath();g.moveTo(-20,y);for(let x=0;x<=n+20;x+=32)g.lineTo(x,y+Math.sin(x*.02+i)*8+Math.sin(x*.07)*2);g.stroke()})}
  for(let i=0;i<70000;i++){const v=r();g.fillStyle=v<.45?`rgba(170,135,85,${.25+r()*.3})`:v<.9?`rgba(255,250,235,${.2+r()*.3})`:`rgba(110,90,70,${.3+r()*.3})`;g.fillRect(r()*n,r()*n,1+r()*1.6,1+r()*1.6)}
  for(let i=0;i<70;i++){const x=r()*n,y=r()*n;g.fillStyle=r()<.5?'rgba(245,235,220,.8)':'rgba(205,170,140,.8)';g.beginPath();g.ellipse(x,y,2+r()*3,1.5+r()*2,r()*3,0,7);g.fill()}});   // ракушки
 const grass=tTex(1024,(g,n)=>{g.fillStyle='#4f8a34';g.fillRect(0,0,n,n);
  for(let i=0;i<40;i++){const x=r()*n,y=r()*n,rr=60+r()*200;const gr=g.createRadialGradient(x,y,0,x,y,rr);gr.addColorStop(0,r()<.5?'rgba(120,170,60,.35)':'rgba(40,90,30,.35)');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;tWrap(g,n,()=>g.fillRect(x-rr,y-rr,rr*2,rr*2))}
  for(let i=0;i<60000;i++){const x=r()*n,y=r()*n,l=4+r()*9,a=r()*6.28;const v=r();g.strokeStyle=v<.4?`rgba(35,85,25,.55)`:v<.85?`rgba(120,180,70,.5)`:`rgba(190,210,120,.5)`;g.lineWidth=1+r();g.beginPath();g.moveTo(x,y);g.lineTo(x+Math.cos(a)*l*.3,y-l);g.stroke()}});
 const jungle=tTex(1024,(g,n)=>{g.fillStyle='#4a3c26';g.fillRect(0,0,n,n);
  for(let i=0;i<50000;i++){g.fillStyle=`rgba(${30+r()*40|0},${25+r()*30|0},${15+r()*20|0},.5)`;g.fillRect(r()*n,r()*n,2,2)}
  const leafC=['#6b5a2e','#8a6a30','#5d4a24','#a07a38','#4f6a2a','#6f7d30','#3f5a26'];
  for(let i=0;i<2600;i++){const x=r()*n,y=r()*n,s=5+r()*14,a=r()*6.28;g.save();tWrap(g,n,()=>{g.translate(x,y);g.rotate(a);g.fillStyle=leafC[i%leafC.length];g.globalAlpha=.75+r()*.25;g.beginPath();g.moveTo(-s,0);g.quadraticCurveTo(0,-s*.45,s,0);g.quadraticCurveTo(0,s*.45,-s,0);g.fill();g.strokeStyle='rgba(30,20,10,.4)';g.lineWidth=1;g.beginPath();g.moveTo(-s,0);g.lineTo(s,0);g.stroke()});g.restore()}
  g.globalAlpha=1;for(let i=0;i<180;i++){const x=r()*n,y=r()*n,l=20+r()*60,a=r()*6.28;g.strokeStyle='rgba(60,40,20,.6)';g.lineWidth=2+r()*3;tWrap(g,n,()=>{g.beginPath();g.moveTo(x,y);g.lineTo(x+Math.cos(a)*l,y+Math.sin(a)*l);g.stroke()})}
  for(let i=0;i<30;i++){const x=r()*n,y=r()*n,rr=40+r()*120;const gr=g.createRadialGradient(x,y,0,x,y,rr);gr.addColorStop(0,'rgba(60,110,40,.35)');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;tWrap(g,n,()=>g.fillRect(x-rr,y-rr,rr*2,rr*2))}});
 const path=tTex(1024,(g,n)=>{g.fillStyle='#8a6e4c';g.fillRect(0,0,n,n);
  for(let i=0;i<60000;i++){g.fillStyle=`rgba(${100+r()*80|0},${80+r()*60|0},${55+r()*40|0},.5)`;g.fillRect(r()*n,r()*n,1+r()*2,1+r()*2)}
  for(let i=0;i<500;i++){const x=r()*n,y=r()*n,s=4+r()*12;const v=150+r()*60|0;g.fillStyle=`rgb(${v},${v*.92|0},${v*.82|0})`;g.strokeStyle='rgba(50,35,20,.6)';g.lineWidth=2;tWrap(g,n,()=>{g.beginPath();g.ellipse(x,y,s,s*(.6+r()*.4),r()*3,0,7);g.fill();g.stroke()})}});
 const rock=tTex(1024,(g,n)=>{g.fillStyle='#8f8576';g.fillRect(0,0,n,n);
  for(let i=0;i<120;i++){const x=r()*n,y=r()*n,rr=30+r()*140;const gr=g.createRadialGradient(x,y,0,x,y,rr);const v=r();gr.addColorStop(0,v<.4?'rgba(70,64,58,.35)':v<.8?'rgba(185,175,160,.3)':'rgba(120,110,80,.3)');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;tWrap(g,n,()=>g.fillRect(x-rr,y-rr,rr*2,rr*2))}
  for(let i=0;i<50000;i++){g.fillStyle=r()<.5?`rgba(50,45,40,${r()*.4})`:`rgba(230,225,215,${r()*.35})`;g.fillRect(r()*n,r()*n,1+r()*2,1+r()*2)}
  for(let i=0;i<90;i++){let x=r()*n,y=r()*n,a=r()*6.28;g.strokeStyle=`rgba(40,36,32,${.35+r()*.4})`;g.lineWidth=1+r()*2.5;tWrap(g,n,()=>{g.beginPath();g.moveTo(x,y);let px=x,py=y,aa=a;for(let k=0;k<8;k++){aa+=r()-.5;px+=Math.cos(aa)*18;py+=Math.sin(aa)*18;g.lineTo(px,py)}g.stroke()})}
  for(let y=0;y<n;y+=24+r()*30){g.strokeStyle='rgba(60,54,48,.25)';g.lineWidth=2;tWrap(g,n,()=>{g.beginPath();g.moveTo(0,y);for(let x=0;x<=n;x+=40)g.lineTo(x,y+(r()-.5)*10);g.stroke()})}});
 return GT.isleTex={sand,grass,jungle,path,rock}}

/* ---------- материал рельефа: смешивание по весам вершин, скала по крутизне (трипланар), мокрый песок, каустика под водой, тени облаков ---------- */
function terrainMat(){const T=isleTextures(),m=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.9,metalness:0});
 const U={uSand:{value:T.sand},uGrass:{value:T.grass},uJung:{value:T.jungle},uPath:{value:T.path},uRock:{value:T.rock},uT:{value:0},uSea:{value:SEA4_Y}};m.userData.U=U;
 m.onBeforeCompile=sh=>{Object.assign(sh.uniforms,U);
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute vec4 aW;attribute vec2 aX;varying vec4 vW4;varying vec2 vX;varying vec3 vWP;varying vec3 vWN;')
   .replace('#include <fog_vertex>','#include <fog_vertex>\nvW4=aW;vX=aX;vWP=(modelMatrix*vec4(transformed,1.)).xyz;vWN=normalize(mat3(modelMatrix)*objectNormal);');
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>',`#include <common>
uniform sampler2D uSand,uGrass,uJung,uPath,uRock;uniform float uT,uSea;varying vec4 vW4;varying vec2 vX;varying vec3 vWP;varying vec3 vWN;
float th(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float tn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(th(i),th(i+vec2(1,0)),f.x),mix(th(i+vec2(0,1)),th(i+vec2(1,1)),f.x),f.y);}
float tf(vec2 p){return tn(p)*.5+tn(p*2.1+3.7)*.3+tn(p*4.3+9.1)*.2;}
vec3 tri(sampler2D t,vec3 p,vec3 n,float s){vec3 b=pow(abs(n),vec3(4.));b/=b.x+b.y+b.z;return texture2D(t,p.yz*s).rgb*b.x+texture2D(t,p.xz*s).rgb*b.y+texture2D(t,p.xy*s).rgb*b.z;}`)
  .replace('#include <map_fragment>',`{vec2 uv=vWP.xz;float nz=tf(uv*.08),nz2=tf(uv*.35);
 vec3 sa=mix(texture2D(uSand,uv*.16).rgb,texture2D(uSand,uv*.045).rgb,.35)*vec3(.9,.86,.8);
 vec3 gr=mix(texture2D(uGrass,uv*.2).rgb,texture2D(uGrass,uv*.05).rgb,.4)*mix(.85,1.12,nz);
 vec3 ju=mix(texture2D(uJung,uv*.22).rgb,texture2D(uJung,uv*.06).rgb,.35);
 vec3 pa=texture2D(uPath,uv*.25).rgb;
 vec4 w=vW4;
 // смешивание с учётом «высоты» текстуры: края не размытые, а рваные
 float e=(nz2-.5)*.6;w.x=clamp(w.x+e*step(.01,w.x)*step(w.x,.99),0.,1.);w.y=clamp(w.y-e*.6*step(.01,w.y)*step(w.y,.99),0.,1.);w.w=clamp(w.w+(nz2-.5)*.8*step(.01,w.w),0.,1.);
 w/=max(w.x+w.y+w.z+w.w,1e-3);
 vec3 c=sa*w.x+gr*w.y+ju*w.z+pa*w.w;
 // мокрый песок у кромки и под водой
 float wet=smoothstep(uSea+.75,uSea+.05,vWP.y);c*=mix(1.,.68,wet*(w.x+w.w*.5));
 // скалы: крутизна + подсказка из вершин
 float sl=1.-vWN.y;float rk=clamp(smoothstep(.32,.55,sl+(nz-.5)*.25)+vX.x*smoothstep(.12,.3,sl),0.,1.);
 vec3 ro=tri(uRock,vWP,vWN,.11)*mix(.85,1.1,nz);ro=mix(ro,ro*vec3(.75,.95,.6),smoothstep(.2,.8,vWN.y)*.5*(w.z+w.y));c=mix(c,ro,rk);
 // запечённая окклюзия
 c*=vX.y;
 // каустика и поглощение под водой
 float dep=uSea-vWP.y;if(dep>0.){vec2 q=uv*.7;float ca=tn(q+vec2(uT*.35,uT*.2))*tn(q*1.3-vec2(uT*.25,-uT*.3));ca=smoothstep(.3,.55,ca);
  c*=mix(vec3(.85,.9,.9),vec3(.35,.62,.7),clamp(dep*.25,0.,1.));c+=vec3(.45,.65,.6)*ca*.3*exp(-dep*.3);}
 // тени облаков
 c*=1.-.2*smoothstep(.55,.75,tf(uv*.012+vec2(uT*.006,uT*.002)));
 diffuseColor.rgb*=c;}`)
  .replace('#include <roughnessmap_fragment>',`float roughnessFactor=roughness;{float wet=smoothstep(uSea+.5,uSea,vWP.y);roughnessFactor=mix(roughness,.25,wet);}`);
  m.userData.sh=sh};
 m.customProgramCacheKey=()=>'isleTerr';return m}

/* ---------- построение рельефа: сетка высот, куски-меши, физика, лучи ---------- */
function buildTerrain(){const {x0,z0,c,nx,nz}=TG,N=nx*nz,H=new Float32Array(N);
 for(let j=0;j<nz;j++)for(let i=0;i<nx;i++)H[j*nx+i]=isleHeight(x0+i*c,z0+j*c);
 const at=(i,j)=>H[Math.min(nz-1,Math.max(0,j))*nx+Math.min(nx-1,Math.max(0,i))];
 const hf=(x,z)=>{const fx=(x-x0)/c,fz=(z-z0)/c;if(fx<0||fz<0||fx>=nx-1||fz>=nz-1)return -9;const i=Math.floor(fx),j=Math.floor(fz),u=fx-i,v=fz-j,k=j*nx+i;
  return (H[k]*(1-u)+H[k+1]*u)*(1-v)+(H[k+nx]*(1-u)+H[k+nx+1]*u)*v};
 let maxH=-99;for(let k=0;k<N;k++)if(H[k]>maxH)maxH=H[k];
 TERR={h:hf,maxH,H,nx,nz};
 // нормали + окклюзия по горизонту + веса материалов
 const nrm=new Float32Array(N*3),AO=new Float32Array(N),W=new Float32Array(N*4),RK=new Float32Array(N);
 for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const k=j*nx+i,dx=(at(i+1,j)-at(i-1,j))/(2*c),dz=(at(i,j+1)-at(i,j-1))/(2*c),L=Math.hypot(dx,1,dz);
  nrm[k*3]=-dx/L;nrm[k*3+1]=1/L;nrm[k*3+2]=-dz/L;const h=H[k];
  let occ=0;for(let a=0;a<8;a++){const ca=Math.cos(a*.785),sa=Math.sin(a*.785);let mx=0;for(const r of[1.5,4,9,16]){const hh=hf(x0+i*c+ca*r,z0+j*c+sa*r);mx=Math.max(mx,(hh-h)/r)}occ+=Math.min(1,Math.max(0,mx))*.9}
  AO[k]=1-Math.min(.55,occ/8);
  const w=isleWeights(x0+i*c,z0+j*c,h,1-1/L);W[k*4]=w[0];W[k*4+1]=w[1];W[k*4+2]=w[2];W[k*4+3]=w[3];RK[k]=w[4]}
 L4.terrAO=(x,z)=>{const i=Math.round((x-x0)/c),j=Math.round((z-z0)/c);return AO[Math.min(nz-1,Math.max(0,j))*nx+Math.min(nx-1,Math.max(0,i))]};
 L4.terrW=W;L4.terrNrm=nrm;
 // меши кусками 32×32 клетки: отсекаются по видимости
 const mat=terrainMat();L4.terrMat=mat;const CH=32;
 for(let cj=0;cj<nz-1;cj+=CH)for(let ci=0;ci<nx-1;ci+=CH){const i1=Math.min(nx-1,ci+CH),j1=Math.min(nz-1,cj+CH),w=i1-ci+1,d=j1-cj+1;
  // куски целиком глубоко под водой не нужны
  let mx=-99;for(let j=cj;j<=j1;j++)for(let i=ci;i<=i1;i++)mx=Math.max(mx,H[j*nx+i]);if(mx<-7.6)continue;
  const pos=new Float32Array(w*d*3),nor=new Float32Array(w*d*3),aw=new Float32Array(w*d*4),ax=new Float32Array(w*d*2),uv=new Float32Array(w*d*2),idx=[];
  for(let j=0;j<d;j++)for(let i=0;i<w;i++){const gi=ci+i,gj=cj+j,k=gj*nx+gi,o=j*w+i;pos[o*3]=x0+gi*c;pos[o*3+1]=H[k];pos[o*3+2]=z0+gj*c;
   nor[o*3]=nrm[k*3];nor[o*3+1]=nrm[k*3+1];nor[o*3+2]=nrm[k*3+2];for(let q=0;q<4;q++)aw[o*4+q]=W[k*4+q];ax[o*2]=RK[k];ax[o*2+1]=AO[k];uv[o*2]=pos[o*3]*.1;uv[o*2+1]=pos[o*3+2]*.1}
  for(let j=0;j<d-1;j++)for(let i=0;i<w-1;i++){const a=j*w+i,b=a+1,cc=a+w,dd=cc+1;
   // диагональ по меньшему перепаду — без «зубцов» на склонах
   if(Math.abs(pos[a*3+1]-pos[dd*3+1])<Math.abs(pos[b*3+1]-pos[cc*3+1]))idx.push(a,cc,dd,a,dd,b);else idx.push(a,cc,b,b,cc,dd)}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('normal',new THREE.BufferAttribute(nor,3));g.setAttribute('uv',new THREE.BufferAttribute(uv,2));
  g.setAttribute('aW',new THREE.BufferAttribute(aw,4));g.setAttribute('aX',new THREE.BufferAttribute(ax,2));g.setIndex(idx);g.computeBoundingSphere();
  const m=new THREE.Mesh(g,mat);m.receiveShadow=true;m.castShadow=true;m.userData.dyn=1;mapGroup.add(m)}
 // лучи (стрельба, видимость, камера): пересечение с картой высот без перебора треугольников
 const proxy=new THREE.Object3D();proxy.userData.terr=1;const _o=new V3(),_p=new V3();
 proxy.raycast=(rc,out)=>{const o=rc.ray.origin,dv=rc.ray.direction,far=Math.min(rc.far,400),near=rc.near||0;
  let t0=near;if(o.y>maxH){if(dv.y>=0)return;t0=Math.max(t0,(o.y-maxH)/-dv.y)}if(t0>far)return;
  const st=.5;let tp=t0,above=o.y+dv.y*t0>hf(o.x+dv.x*t0,o.z+dv.z*t0);if(!above)return;
  for(let t=t0+st;t<=far+st;t+=st){const tt=Math.min(t,far),y=o.y+dv.y*tt,hh=hf(o.x+dv.x*tt,o.z+dv.z*tt);
   if(y<=hh){let a=tp,b=tt;for(let k=0;k<10;k++){const m=(a+b)/2;if(o.y+dv.y*m>hf(o.x+dv.x*m,o.z+dv.z*m))a=m;else b=m}
    const pt=new V3(o.x+dv.x*b,o.y+dv.y*b,o.z+dv.z*b),ex=.3,nx_=hf(pt.x-ex,pt.z)-hf(pt.x+ex,pt.z),nz_=hf(pt.x,pt.z-ex)-hf(pt.x,pt.z+ex),n=new V3(nx_,2*ex,nz_).normalize();
    out.push({distance:b,point:pt,object:proxy,face:{a:0,b:0,c:0,normal:n,materialIndex:0},faceIndex:0});return}
   tp=tt;if(tt>=far)break}};
 mapGroup.add(proxy);level.push(proxy);
 // текстура глубины для воды: 0 = суша выше моря, 1 = глубоко
 // глубина в половинной точности: плавные изолинии наката без «ступенек» (если не поддерживается — 8 бит)
 let tex;const hf16=THREE.DataUtils&&THREE.DataUtils.toHalfFloat&&renderer.capabilities.isWebGL2;
 if(hf16){const dt=new Uint16Array(N*4);for(let k=0;k<N;k++){const dep=Math.max(0,Math.min(1,(SEA4_Y-H[k]+.6)/9));dt[k*4]=THREE.DataUtils.toHalfFloat(dep);dt[k*4+1]=dt[k*4+2]=0;dt[k*4+3]=THREE.DataUtils.toHalfFloat(1)}
  tex=new THREE.DataTexture(dt,nx,nz,THREE.RGBAFormat,THREE.HalfFloatType)}
 else{const dt=new Uint8Array(N*4);for(let k=0;k<N;k++){const dep=Math.max(0,Math.min(1,(SEA4_Y-H[k]+.6)/9));dt[k*4]=dep*255;dt[k*4+3]=255}tex=new THREE.DataTexture(dt,nx,nz,THREE.RGBAFormat)}
 tex.magFilter=tex.minFilter=THREE.LinearFilter;tex.generateMipmaps=false;tex.needsUpdate=true;L4.depthTex=tex;
 return TERR}
const onIsland=(x,z)=>(TERR&&TERR.h(x,z)>SEA4_Y-1.2)||(Math.abs(x)<2.8&&z>36&&z<100);

/* ---------- море: прозрачное у берега, глубина из карты высот, накат пены на песок ---------- */
const SEA4_W=[[.3,1,.12,19,1.0,0],[1,.4,.08,9,1.5,1.2],[-.7,.7,.05,5,2.2,2.1],[.9,-.4,.03,2.6,3.1,4]];
function sea4H(x,z,t){let h=0;for(const [dx,dz,a,l,s,ph] of SEA4_W){const k=6.2832/l;h+=a*Math.sin((dx*x+dz*z)*k+t*s+ph)}return SEA4_Y+h}
const SEA4_VS=`uniform float uT;uniform sampler2D uDep;uniform vec4 uTG;varying vec3 vW;varying vec3 vN;varying float vH;varying vec2 vDep;
void main(){vec3 p=(modelMatrix*vec4(position,1.)).xyz;vec2 tuv=(p.xz-uTG.xy)/uTG.zw;vec2 dd=texture2D(uDep,tuv).rg;float damp=clamp(dd.r*4.,.15,1.);float h=0.,hx=0.,hz=0.;
${SEA4_W.map(([dx,dz,a,l,s,ph])=>{const k=(6.2832/l).toFixed(4);return `{float q=(${dx.toFixed(3)}*p.x+${dz.toFixed(3)}*p.z)*${k}+uT*${s.toFixed(2)}+${ph.toFixed(2)};h+=${a.toFixed(3)}*sin(q);float c=${a.toFixed(3)}*${k}*cos(q);hx+=c*${dx.toFixed(3)};hz+=c*${dz.toFixed(3)};}`}).join('')}
 h*=damp;hx*=damp;hz*=damp;p.y+=h;vH=h;vN=normalize(vec3(-hx,1.,-hz));vW=p;vDep=dd;gl_Position=projectionMatrix*viewMatrix*vec4(p,1.);}`;
const SEA4_FS=`uniform float uT,uFn,uFf;uniform vec3 uSun,uFog;uniform sampler2D uDep;uniform vec4 uTG;varying vec3 vW;varying vec3 vN;varying float vH;varying vec2 vDep;
float h21(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h21(i),h21(i+vec2(1,0)),f.x),mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x),f.y);}
void main(){vec3 V=normalize(cameraPosition-vW);float dist=length(vW-cameraPosition);
 vec2 tuv=(vW.xz-uTG.xy)/uTG.zw;float dep=texture2D(uDep,tuv).r*9.-.6;if(tuv.x<0.||tuv.y<0.||tuv.x>1.||tuv.y>1.)dep=9.;
 vec2 w=vec2(vn(vW.xz*.7+uT*.5),vn(vW.xz*.7-uT*.4+7.))-.5;vec2 w2=vec2(vn(vW.xz*2.3-uT*.9),vn(vW.xz*2.1+uT*.8+3.))-.5;vec3 N=normalize(vN+vec3(w.x*.22+w2.x*.1,0.,w.y*.22+w2.y*.1));
 float sh=1.-smoothstep(0.,6.,dep);
 vec3 deep=vec3(.02,.17,.38),mid=vec3(.02,.38,.56),shal=vec3(.08,.6,.64);
 vec3 c=mix(deep,mid,smoothstep(14.,4.,dep)*.8+.2*N.y);c=mix(c,shal,sh);
 float NV=max(dot(N,V),0.),F=.02+.98*pow(1.-NV,5.);vec3 sky=vec3(.45,.68,.92);c=mix(c,sky,F*.45);
 vec3 Ls=normalize(uSun);vec3 R=reflect(-Ls,N);float sp=max(dot(R,V),0.);c+=vec3(1.,.97,.9)*(pow(sp,300.)*3.5+pow(sp,30.)*.18);
 // накат: полосы пены бегут к берегу и тают на песке
 float edge=smoothstep(.3,0.,dep+vH*1.5);float roll=sin(dep*5.-uT*1.8+vn(vW.xz*.3)*4.);
 float foam=edge*.8+smoothstep(.86,1.,roll)*smoothstep(1.2,.15,dep)*.55;
 foam*=smoothstep(.25,.6,vn(vW.xz*1.6+uT*.4)+.25);foam+=smoothstep(.16,.2,vH+(vn(vW.xz*.23+uT*.5)*.7+vn(vW.xz*1.1-uT*.8)*.3)*.08)*.18*smoothstep(3.,8.,dep);
 c=mix(c,vec3(.97,.99,1.),clamp(foam,0.,1.)*.9);
 float sparkle=step(.995,h21(floor(vW.xz*7.)+floor(uT*9.)))*pow(sp,3.);c+=vec3(1.)*sparkle*1.4;
 float a=mix(.36,.97,smoothstep(.0,3.6,dep));a=max(a,clamp(foam,0.,1.)*.95);a=max(a,F*.55);
 c=mix(c,uFog,smoothstep(uFn,uFf,dist));gl_FragColor=vec4(c,a);}`;
