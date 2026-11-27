/*BEER-BEGIN*/
/* ================= УРОВЕНЬ 3: ПИВНОЕ МОРЕ — мир ================= */
const SEA_Y=-4;let L3=null;const camRock={r:0,p:0,y:0};
const SEA_W=[[.21,1,.62,23,1.1,0],[1,.32,.32,11.5,1.7,1.3],[-.62,.79,.2,6.3,2.3,2.1],[.92,-.39,.11,3.4,3.1,4.2]];
function seaH(x,z,t){z+=t*3;let h=0;for(const [dx,dz,a,l,s,ph] of SEA_W){const k=6.2832/l;h+=a*Math.sin((dx*x+dz*z)*k+t*s+ph)}return SEA_Y+h}
function hullHW(z){if(z>57.6||z<-96)return -1;if(z<=30)return 13;return Math.max(.04,13-(z-30)*.42-Math.pow((z-30)/28,3)*1.4)}
function onHull(x,z){const h=hullHW(z);return h>0&&Math.abs(x)<h+.1}
function poolAt(p){for(const q of pools)if(p.x>q.x0&&p.x<q.x1&&p.z>q.z0&&p.z<q.z1)return q;return null}

/* ---------- слияние мешей внутри групп: меньше вызовов отрисовки ---------- */
function mergeKids(root){const nodes=[];root.traverse(o=>{if(!o.isMesh)nodes.push(o)});const m4=new THREE.Matrix4(),nm=new THREE.Matrix3(),v=new V3();let saved=0;
 for(const node of nodes){const bk=new Map();for(const c of node.children){if(!c.isMesh||c.isInstancedMesh||c.children.length||c.userData.keep||Array.isArray(c.material))continue;const g=c.geometry;if(!g.attributes.position||!g.attributes.normal)continue;
   const k=c.material.uuid+'|'+(c.castShadow?1:0)+(c.receiveShadow?1:0)+'|'+c.renderOrder;if(!bk.has(k))bk.set(k,[]);bk.get(k).push(c)}
  for(const list of bk.values()){if(list.length<2)continue;let n=0;const gs=list.map(c=>{const g=c.geometry.index?c.geometry.toNonIndexed():c.geometry;n+=g.attributes.position.count;return g});
   const pos=new Float32Array(n*3),nor=new Float32Array(n*3),uv=new Float32Array(n*2);let o=0;
   list.forEach((c,j)=>{const g=gs[j],P_=g.attributes.position,N=g.attributes.normal,U=g.attributes.uv;c.updateMatrix();m4.copy(c.matrix);nm.getNormalMatrix(m4);
    for(let i=0;i<P_.count;i++,o++){v.fromBufferAttribute(P_,i).applyMatrix4(m4);pos[o*3]=v.x;pos[o*3+1]=v.y;pos[o*3+2]=v.z;v.fromBufferAttribute(N,i).applyMatrix3(nm).normalize();nor[o*3]=v.x;nor[o*3+1]=v.y;nor[o*3+2]=v.z;if(U){uv[o*2]=U.getX(i);uv[o*2+1]=U.getY(i)}}
    node.remove(c)});
   const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));geo.setAttribute('normal',new THREE.BufferAttribute(nor,3));geo.setAttribute('uv',new THREE.BufferAttribute(uv,2));geo.computeBoundingSphere();
   const mm=new THREE.Mesh(geo,list[0].material);mm.castShadow=list[0].castShadow;mm.receiveShadow=list[0].receiveShadow;mm.renderOrder=list[0].renderOrder;node.add(mm);saved+=list.length-1}}
 return saved}

/* ---------- небо: закат с облаками ---------- */
const SKY_VS='varying vec3 vD;void main(){vec4 w=modelMatrix*vec4(position,1.);vD=w.xyz-cameraPosition;gl_Position=projectionMatrix*viewMatrix*w;gl_Position.z=gl_Position.w*.9999;}';
const NOISE_GL='float h21(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h21(i),h21(i+vec2(1,0)),f.x),mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x),f.y);}float fbm(vec2 p){float s=0.,a=.5;for(int i=0;i<5;i++){s+=a*vn(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return s;}';
const SKY_FS='uniform vec3 uSun,uHor;uniform float uT;varying vec3 vD;'+NOISE_GL+`
void main(){vec3 d=normalize(vD);float el=d.y,sd=max(dot(d,uSun),0.);
 vec3 zen=vec3(.13,.08,.27),mid=vec3(.58,.3,.5),hor=vec3(1.,.58,.36);
 vec3 c=mix(hor,mid,smoothstep(0.,.2,el));c=mix(c,zen,smoothstep(.18,.7,el));
 c=mix(c,vec3(1.,.72,.42),pow(sd,5.)*.65);c+=vec3(1.,.6,.25)*pow(sd,22.)*.6;
 c=mix(c,vec3(1.,.96,.84)*1.7,smoothstep(.99935,.99965,sd));
 if(el>-.02){vec2 uv=d.xz/(max(el,0.)+.1)*.9+vec2(uT*.005,uT*.0025);float n=fbm(uv*1.3),n2=fbm(uv*3.1+7.);
  float cov=smoothstep(.47,.74,n*.85+n2*.25),th=smoothstep(.55,1.,n);
  vec3 lit=mix(vec3(.42,.24,.42),vec3(1.,.68,.46),pow(sd,2.2)*.9+.12);
  vec3 cl=mix(lit,vec3(1.,.84,.66),smoothstep(.62,.5,n)*.55*(.4+pow(sd,1.5)));cl*=mix(1.,.62,th*(1.-pow(sd,1.6)*.7));
  c=mix(c,cl,cov*smoothstep(-.02,.1,el)*.94);}
 c=mix(c,uHor,smoothstep(.04,-.04,el));gl_FragColor=vec4(c,1.);}`;

/* ---------- море пива ---------- */
const SEA_VS=`uniform float uT;varying vec3 vW;varying vec3 vN;varying float vH;
void main(){vec3 p=(modelMatrix*vec4(position,1.)).xyz;float z=p.z+uT*3.;float h=0.,hx=0.,hz=0.;
${SEA_W.map(([dx,dz,a,l,s,ph])=>{const k=(6.2832/l).toFixed(4);return `{float q=(${dx.toFixed(3)}*p.x+${dz.toFixed(3)}*z)*${k}+uT*${s.toFixed(2)}+${ph.toFixed(2)};h+=${a.toFixed(3)}*sin(q);float c=${a.toFixed(3)}*${k}*cos(q);hx+=c*${dx.toFixed(3)};hz+=c*${dz.toFixed(3)};}`}).join('')}
p.y+=h;vH=h;vW=p;vN=normalize(vec3(-hx,1.,-hz));gl_Position=projectionMatrix*viewMatrix*vec4(p,1.);}`;
const SEA_FS='uniform float uT,uFn,uFf;uniform vec3 uSun,uFog;varying vec3 vW;varying vec3 vN;varying float vH;'+NOISE_GL+`
float hullD(vec2 p){float hw=p.y<=30.?13.:max(.04,13.-(p.y-30.)*.42-pow((p.y-30.)/28.,3.)*1.4);float dx=abs(p.x)-hw;float dz=max(p.y-57.6,-96.-p.y);return max(dx,dz);}
float cell(vec2 p){vec2 i=floor(p),f=fract(p);float d=1.;for(int y=-1;y<=1;y++)for(int x=-1;x<=1;x++){vec2 g=vec2(float(x),float(y));vec2 o=vec2(h21(i+g),h21(i+g+7.3));d=min(d,length(g+o-f));}return d;}
void main(){vec3 V=normalize(cameraPosition-vW);float dist=length(vW-cameraPosition);float lod=smoothstep(140.,20.,dist);
 vec2 w1=vec2(fbm(vW.xz*.9+uT*.6),fbm(vW.xz*.9-uT*.5+3.))-.5;vec2 w2=vec2(vn(vW.xz*3.1+uT*1.3),vn(vW.xz*3.1-uT*1.1+5.))-.5;
 vec3 N=normalize(vN+vec3(w1.x*.2+w2.x*.08*lod,0.,w1.y*.2+w2.y*.08*lod));
 float NV=max(dot(N,V),0.),F=.02+.98*pow(1.-NV,5.);
 // тело пива: от тёмного янтаря во впадинах к светлому золоту на гребнях
 float crest=clamp(vH*.7+.5,0.,1.);
 vec3 deep=vec3(.3,.1,.01),amber=vec3(.72,.34,.04),gold=vec3(.95,.62,.16);
 vec3 c=mix(deep,amber,smoothstep(0.,.6,crest));c=mix(c,gold,smoothstep(.6,1.,crest)*.6);
 // просвет: солнце светит сквозь тонкий гребень
 vec3 Ls=normalize(uSun);float back=pow(max(dot(-V,Ls)*.5+.5,0.),3.)*smoothstep(.35,1.,crest);
 c+=vec3(1.,.6,.12)*back*.5;
 float sss=pow(clamp(1.-NV,0.,1.),2.)*.35;c+=vec3(.9,.45,.05)*sss*crest;
 // отражение тёплого неба
 vec3 sky=mix(vec3(1.,.7,.42),vec3(.62,.45,.6),clamp(reflect(-V,N).y*1.6,0.,1.));
 c=mix(c,sky,F*.6);
 vec3 R=reflect(-Ls,N);float sp=max(dot(R,V),0.);c+=vec3(1.,.86,.6)*(pow(sp,300.)*4.+pow(sp,30.)*.3);
 // пена: сливочная шапка с пузырями
 vec2 fp=vW.xz+vec2(0.,uT*3.);float n=fbm(fp*.3+uT*.12);
 float foam=smoothstep(.7,.95,vH+n*.5-.1);
 float hd=hullD(vW.xz);foam=max(foam,smoothstep(3.6,0.,hd)*smoothstep(.2,.55,n+.1));
 float wz=-96.-vW.z;if(wz>0.){float wake=smoothstep(4.+wz*.32,1.5+wz*.2,abs(vW.x))*smoothstep(110.,0.,wz);foam=max(foam,wake*smoothstep(.25,.6,fbm(fp*1.1)+.1));}
 float lace=smoothstep(.62,.74,fbm(fp*.8-uT*.07))*smoothstep(.3,.8,crest)*.3;foam=max(foam,lace);
 float holes=1.;if(lod>.01){float b1=cell(fp*2.2),b2=cell(fp*5.3+3.1);holes=mix(1.,mix(.55,1.,smoothstep(.06,.22,b1))*(.75+.25*smoothstep(.05,.2,b2)),lod);}
 foam=clamp(foam,0.,1.);float fa=foam*mix(.6,1.,holes);
 vec3 foamC=mix(vec3(.93,.8,.56),vec3(1.,.97,.88),holes)*(.85+.15*max(dot(N,Ls),0.));
 c=mix(c,foamC,fa*.9);
 // пузырьки газа: мерцающие искорки
 if(lod>.01){vec2 gp=vW.xz*4.;vec2 gi=floor(gp);float r=h21(gi);vec2 o=fract(gp)-vec2(h21(gi+1.7),h21(gi+3.9));float tw=fract(r*17.+uT*(.6+r));
  float bub=smoothstep(.07,.0,length(o))*step(.9,r)*sin(tw*3.1416)*(1.-fa);c+=vec3(1.,.93,.7)*bub*.8*lod;}
 c=mix(c,uFog,smoothstep(uFn,uFf,dist));gl_FragColor=vec4(c,1.);}`;

/* ---------- текстуры яхты ---------- */
let BM=null,_flM=null;
function beerMats(){if(BM)return BM;const E={envMap:ENV};const C=(w,h,f)=>{const c=document.createElement('canvas');c.width=w;c.height=h;f(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=8;return t};
 const rr=(()=>{let s=11;return()=>(s=(s*16807)%2147483647)/2147483647})();
 const teak=C(512,512,(g,w,h)=>{const n=16,pw=w/n;for(let i=0;i<n;i++){let y=0;while(y<h){const L=120+rr()*260,v=150+rr()*40|0;g.fillStyle='rgb('+v+','+(v*.62|0)+','+(v*.36|0)+')';g.fillRect(i*pw,y,pw,L);
   g.strokeStyle='rgba(60,30,10,.18)';g.lineWidth=1;for(let k=0;k<5;k++){g.beginPath();const x0=i*pw+2+rr()*(pw-4);g.moveTo(x0,y);g.bezierCurveTo(x0+rr()*6-3,y+L*.3,x0+rr()*6-3,y+L*.6,x0+rr()*4-2,y+L);g.stroke()}
   g.fillStyle='#2a1a10';g.fillRect(i*pw,y,pw,2);y+=L}g.fillStyle='#1d130c';g.fillRect(i*pw,0,3,h)}});teak.repeat.set(1/4.5,1/4.5);
 const hull=C(1024,256,(g,w,h)=>{const gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,'#fbfaf6');gr.addColorStop(.62,'#eceae4');g.fillStyle=gr;g.fillRect(0,0,w,h);
   g.fillStyle='#14213d';g.fillRect(0,h*.78,w,h*.22);g.fillStyle='#d4a640';g.fillRect(0,h*.74,w,7);g.fillStyle='#e2c06a';g.fillRect(0,h*.06,w,4);
   for(let x=40;x<w;x+=128){g.fillStyle='#9aa3ad';g.beginPath();g.arc(x,h*.42,17,0,7);g.fill();const pg=g.createRadialGradient(x-5,h*.42-5,2,x,h*.42,14);pg.addColorStop(0,'#5b7da0');pg.addColorStop(1,'#101826');g.fillStyle=pg;g.beginPath();g.arc(x,h*.42,13,0,7);g.fill()}
   g.strokeStyle='rgba(0,0,0,.05)';for(let x=0;x<w;x+=256){g.beginPath();g.moveTo(x,0);g.lineTo(x,h*.74);g.stroke()}});
 const panel=C(512,512,(g,w,h)=>{g.fillStyle='#5a3218';g.fillRect(0,0,w,h);for(let i=0;i<60;i++){g.strokeStyle='rgba('+(30+rr()*40|0)+',14,4,.35)';g.lineWidth=1+rr()*2;g.beginPath();const y=rr()*h;g.moveTo(0,y);g.bezierCurveTo(w*.3,y+rr()*20-10,w*.6,y+rr()*20-10,w,y+rr()*10-5);g.stroke()}
   g.strokeStyle='#c9a24a';g.lineWidth=6;g.strokeRect(24,24,w-48,h-48);g.strokeStyle='rgba(0,0,0,.4)';g.lineWidth=2;g.strokeRect(30,30,w-60,h-60)});
 const cream=C(256,256,(g,w,h)=>{g.fillStyle='#efe4cf';g.fillRect(0,0,w,h);for(let i=0;i<500;i++){g.fillStyle='rgba(120,90,50,'+rr()*.05+')';g.fillRect(rr()*w,rr()*h,2,2)}g.fillStyle='#c9a24a';g.fillRect(0,h-6,w,6)});
 const rug=C(512,512,(g,w,h)=>{g.fillStyle='#7a1022';g.fillRect(0,0,w,h);g.strokeStyle='#d8b05a';g.lineWidth=10;g.strokeRect(14,14,w-28,h-28);g.lineWidth=3;g.strokeRect(34,34,w-68,h-68);
   g.translate(w/2,h/2);for(let k=0;k<16;k++){g.rotate(Math.PI/8);g.fillStyle=k%2?'#1f2a5a':'#d8b05a';g.beginPath();g.ellipse(0,110,22,70,0,0,7);g.fill()}g.fillStyle='#1f2a5a';g.beginPath();g.arc(0,0,60,0,7);g.fill();g.fillStyle='#d8b05a';g.beginPath();g.arc(0,0,26,0,7);g.fill()});
 const parq=C(256,256,(g,w,h)=>{for(let y=0;y<h;y+=32)for(let x=0;x<w;x+=64){const v=120+rr()*50|0;g.fillStyle='rgb('+v+','+(v*.66|0)+','+(v*.4|0)+')';const o=(y/32)%2?32:0;g.fillRect((x+o)%w,y,62,30);g.fillRect((x+o)%w-w,y,62,30)}});
 const money=C(512,512,(g,w,h)=>{g.fillStyle='#3b5a36';g.fillRect(0,0,w,h);for(let i=0;i<46;i++){g.save();g.translate(rr()*w,rr()*h);g.rotate((rr()-.5)*1.1);const bw=150,bh=66;
   for(const [dx,dy] of[[0,0],[-w,0],[w,0],[0,-h],[0,h]]){g.save();g.translate(dx,dy);g.fillStyle='#cfe0c0';g.fillRect(-bw/2,-bh/2,bw,bh);g.strokeStyle='#4c7a46';g.lineWidth=4;g.strokeRect(-bw/2+5,-bh/2+5,bw-10,bh-10);
    g.fillStyle='#6a9a62';g.beginPath();g.ellipse(0,0,19,24,0,0,7);g.fill();g.fillStyle='#2f5030';g.fillRect(-4,-16,8,26);g.fillRect(-8,6,16,8);
    g.font='bold 16px Arial';g.fillStyle='#2f5030';g.fillText('100',-bw/2+10,-bh/2+22);g.fillText('100',bw/2-40,bh/2-10);g.font='bold 10px Arial';g.fillText('ГАЗБАКС',bw/2-62,-bh/2+20);g.restore()}g.restore()}});
 const ringT=C(256,64,(g,w,h)=>{for(let i=0;i<8;i++){g.fillStyle=i%2?'#f6f2ea':'#e8461e';g.fillRect(i*w/8,0,w/8,h)}g.fillStyle='rgba(0,0,0,.18)';g.fillRect(0,h*.45,w,3)});
 const keg=C(256,256,(g,w,h)=>{const gr=g.createLinearGradient(0,0,w,0);gr.addColorStop(0,'#8e9399');gr.addColorStop(.5,'#e6e9ec');gr.addColorStop(1,'#8e9399');g.fillStyle=gr;g.fillRect(0,0,w,h);
   g.fillStyle='#d8a020';g.fillRect(0,h*.34,w,h*.32);g.fillStyle='#1b1208';g.font='900 46px "Russo One",Arial';g.textAlign='center';g.fillText('ПИВО',w*.25,h*.56);g.fillText('ПИВО',w*.75,h*.56);
   g.fillStyle='#c8102e';g.beginPath();g.moveTo(w*.5,h*.38);g.lineTo(w*.56,h*.62);g.lineTo(w*.44,h*.62);g.fill();g.fillStyle='#fff';g.font='bold 18px Arial';g.fillText('!',w*.5,h*.6)});
 BM={teak:M(0xffffff,{map:teak,roughness:.62}),hull:M(0xffffff,{map:hull,roughness:.22,metalness:.05,...E,envMapIntensity:.6,side:THREE.DoubleSide}),white:M(0xf4f2ec,{roughness:.3,...E,envMapIntensity:.4}),
  chrome:M(0xe6e9ee,{metalness:1,roughness:.12,...E}),panel:M(0xffffff,{map:panel,roughness:.45,...E,envMapIntensity:.3}),cream:M(0xffffff,{map:cream,roughness:.7}),rug:M(0xffffff,{map:rug,roughness:.95}),
  parq:M(0xffffff,{map:parq,roughness:.4,...E,envMapIntensity:.25}),gold:M(0xd8b05a,{metalness:1,roughness:.25,...E}),leather:M(0xf1ece2,{roughness:.42,...E,envMapIntensity:.3}),
  tint:M(0x1a2430,{roughness:.05,metalness:.6,...E,envMapIntensity:1.2}),glass:Object.assign(M(0xbfe4ff,{roughness:.02,metalness:.2,transparent:true,opacity:.18,...E,depthWrite:false}),{userData:{mergeOK:1}}),
  beer:M(0xe09a18,{roughness:.08,transparent:true,opacity:.82,...E,emissive:0x4a2200}),foam:M(0xfff6e2,{roughness:.8}),money:M(0xffffff,{map:money,roughness:.75}),ring:M(0xffffff,{map:ringT,roughness:.5}),
  keg:M(0xffffff,{map:keg,metalness:.6,roughness:.3,...E}),navy:M(0x14213d,{roughness:.4,metalness:.2,...E}),orange:M(0xf0641e,{roughness:.45}),dark:M(0x22252b,{roughness:.5,metalness:.4,...E}),
  palm:M(0x2f7a3a,{roughness:.7,side:THREE.DoubleSide}),bark:M(0x6a4a2a,{roughness:.9}),moneyT:money};
 return BM}

/* ---------- контур яхты, борта, палуба ---------- */
function hullOutline(){const pts=[],R=2.5;for(let z=-96+R;z<=29.6;z+=3)pts.push([-13,z]);for(let z=30;z<57;z+=1)pts.push([-hullHW(z),z]);pts.push([-.25,57.3],[0,57.6],[.25,57.3]);for(let z=57;z>=30;z-=1)pts.push([hullHW(z),z]);
 for(let z=29.6-((29.6-(-96+R))%3);z>=-96+R;z-=3)pts.push([13,z]);for(let a=1;a<=6;a++){const t=a/6*Math.PI/2;pts.push([13-R+R*Math.cos(t),-96+R-R*Math.sin(t)])}
 for(let x=13-R-2;x>-13+R;x-=2)pts.push([x,-96]);for(let a=0;a<=6;a++){const t=a/6*Math.PI/2;pts.push([-13+R-R*Math.sin(t),-96+R-R*Math.cos(t)])}return pts}
function ribbon(pts,y0,y1,mat,uLen,closed){const P=[],UV=[],I=[];let u=0;for(let i=0;i<pts.length;i++){if(i>0)u+=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);P.push(pts[i][0],y0,pts[i][1],pts[i][0],y1,pts[i][1]);UV.push(u/uLen,0,u/uLen,1);
  if(i>0){const a=(i-1)*2;I.push(a,a+2,a+1,a+1,a+2,a+3)}}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(UV,2));g.setIndex(I);g.computeVertexNormals();
 const m=new THREE.Mesh(g,mat);mapGroup.add(m);return m}
function offsetPts(pts,d){return pts.map((p,i)=>{const a=pts[Math.max(0,i-1)],b=pts[Math.min(pts.length-1,i+1)],tx=b[0]-a[0],tz=b[1]-a[1],L=Math.hypot(tx,tz)||1;return[p[0]-tz/L*d,p[1]+tx/L*d]})}

/* ---------- сборка уровня ---------- */
function buildL3(){const m=storyMats(),b=beerMats();L3={kegs:[],rings:[],chairs:[],waveT:-1,waveHit:new Set(),inSeaT:0,flag:null,cars:[],chand:null,fish:[],sil:null,obbs:[],orph:[],altFx:{},ghostR:[],hb:[],lastWarn:-1};
 scene.background=new THREE.Color(0xe89a78);scene.fog=new THREE.Fog(0xe89a78,70,285);mapB={x0:-60,x1:60,z0:-150,z1:90};
 const sun=new V3(.32,.13,-.94).normalize();L3.sun=sun;
 const hemi=new THREE.HemisphereLight(0xc9a0d8,0x6a3e22,.5),dl=shadowLight(new THREE.DirectionalLight(0xffb878,.88),40,110);addLights([hemi,dl]);followSun(dl,sun.x*60,sun.y*60+12,sun.z*60);
 // небо
 const sky=new THREE.Mesh(new THREE.SphereGeometry(270,32,16),new THREE.ShaderMaterial({uniforms:{uSun:{value:sun},uHor:{value:new THREE.Color(0xe89a78)},uT:{value:0}},vertexShader:SKY_VS,fragmentShader:SKY_FS,side:THREE.BackSide,depthWrite:false}));
 sky.renderOrder=-10;sky.frustumCulled=false;sky.userData.dyn=1;mapGroup.add(sky);L3.sky=sky;
 // море
 const seaM=new THREE.ShaderMaterial({uniforms:{uT:{value:0},uSun:{value:sun},uFog:{value:new THREE.Color(0xe89a78)},uFn:{value:70},uFf:{value:285}},vertexShader:SEA_VS,fragmentShader:SEA_FS});
 const sea=new THREE.Mesh(new THREE.PlaneGeometry(620,620,220,220).rotateX(-Math.PI/2),seaM);sea.position.set(0,SEA_Y,-20);sea.frustumCulled=false;sea.userData.dyn=1;mapGroup.add(sea);L3.seaM=seaM;L3.sea=sea;
 seaM.side=THREE.DoubleSide;mapAnims.push(dt=>{const t=lvT;if(typeof bloomPass!=='undefined'&&bloomPass){bloomPass.threshold=.985;bloomPass.strength=.26}seaM.uniforms.uT.value=t;sky.material.uniforms.uT.value=t;sky.position.copy(camera.position)});
 // корпус
 const out=hullOutline();ribbon(out,-6,0,b.hull,16);
 const sh=new THREE.Shape(out.map(p=>new THREE.Vector2(p[0],-p[1])));{const hp=new THREE.Path();hp.moveTo(-3.6,70);hp.lineTo(-3.6,80);hp.lineTo(3.6,80);hp.lineTo(3.6,70);hp.lineTo(-3.6,70);sh.holes.push(hp)}const dg=new THREE.ShapeGeometry(sh,24).rotateX(-Math.PI/2);dg.translate(0,.005,0);
 const deck=new THREE.Mesh(dg,b.teak);deck.receiveShadow=true;mapGroup.add(deck);level.push(deck);
 // твёрдый пол и фальшборт (коллизия по ступенькам)
 solid(0,-1,-88,26.4,1,16);solid(0,-1,-20,26.4,1,100);solid(-8.4,-1,-75,9.6,1,10);solid(8.4,-1,-75,9.6,1,10);
 solid(0,-1,-75,7.2,1,10);L3.hatchBox=boxes[boxes.length-1];L3.hatchY=[-1,0];
 // стенки и дно ракетной шахты (проём x±3.6, z −80..−70)
 solid(-3.85,-9.5,-75,.5,8.5,10.5);solid(3.85,-9.5,-75,.5,8.5,10.5);solid(0,-9.5,-80.25,7.2,8.5,.5);solid(0,-9.5,-69.75,7.2,8.5,.5);solid(0,-10.5,-75,7.2,1,10);
 for(let z=30;z<58;z+=.5){const hw=hullHW(z);if(hw>0)solid(0,-1,z+.25,hw*2,1,.5)}
 const bulw=(x0,x1,z0,z1)=>solid((x0+x1)/2,0,(z0+z1)/2,x1-x0,1.65,z1-z0);
 bulw(12.8,13.3,-96,30);bulw(-13.3,-12.8,-96,30);bulw(-13,13,-96.4,-95.9);for(let z=29.5;z<58;z+=.5){const a=hullHW(z),b2=hullHW(Math.min(58,z+.5));if(a<0)continue;const lo=Math.max(0,(b2>0?b2:0)-.35),hi=a+.3;bulw(lo,hi,z,z+.5);bulw(-hi,-lo,z,z+.5)}solid(0,0,57.9,1.6,1.65,.8)
 const rail=offsetPts(out,-.12);ribbon(rail.concat([rail[0]]),0,1.02,b.white,6).material.side=THREE.DoubleSide;
 // корпус ниже палубы тоже твёрдый: из воды под яхту не заплыть
 solid(-13.05,-7,-33,.5,6,126.5);solid(13.05,-7,-33,.5,6,126.5);solid(0,-7,-96.05,26.6,6,.5);for(let z=30;z<58.5;z+=.5){const hw=hullHW(Math.min(58,z+.25));if(hw<0)continue;for(const s of[-1,1])solid(s*(hw-.2),-7,z+.25,.6,6,.5)}
 // фальшборт: планширь сверху + леерное ограждение из нержавейки на стойках (высота = коллизии 1.65)
 {const capOut=offsetPts(out,.02),capIn=offsetPts(out,-.26),P_=[],I=[];for(let i=0;i<out.length;i++){P_.push(capOut[i][0],1.02,capOut[i][1],capIn[i][0],1.02,capIn[i][1])}
  for(let i=0;i<out.length;i++){const a=i*2,b2=((i+1)%out.length)*2;I.push(a,b2,a+1,b2,b2+1,a+1)}const cg=new THREE.BufferGeometry();cg.setAttribute('position',new THREE.Float32BufferAttribute(P_,3));cg.setIndex(I);cg.computeVertexNormals();
  const cap=new THREE.Mesh(cg,b.teak);cap.material=b.teak.clone();cap.material.side=THREE.DoubleSide;cap.receiveShadow=true;mapGroup.add(cap)
  const loop=rail.concat([rail[0]]),st=[];let acc=0;for(let i=1;i<loop.length;i++){const a=loop[i-1],c=loop[i],L=Math.hypot(c[0]-a[0],c[1]-a[1]);let t=acc>0?1.8-acc:0;while(t<=L){const k=t/L;st.push([a[0]+(c[0]-a[0])*k,a[1]+(c[1]-a[1])*k]);t+=1.8}acc=(acc+L)%1.8}
  const im=new THREE.InstancedMesh(new THREE.CylinderGeometry(.03,.035,.62,8),b.chrome,st.length),o=new THREE.Object3D();st.forEach(([x,z],i)=>{o.position.set(x,1.33,z);o.updateMatrix();im.setMatrixAt(i,o.matrix)});im.castShadow=true;mapGroup.add(im);
  for(const [y,r] of[[1.64,.045],[1.33,.014]]){const rc=new THREE.CatmullRomCurve3(rail.map(p=>new V3(p[0],y,p[1])),true,'centripetal');deco(new THREE.TubeGeometry(rc,900,r,6,true),b.chrome,0,0,0)}}
 // --- нос: стартовая площадка ---
 const salonH=5.4,winH=[1,3.7];
 // --- КАЮТ-КОМПАНИЯ x[-10.5,10.5] z[2,28] ---
 const W={floor:b.parq,wall:b.panel,ceil:b.cream};
 const yw=(x,y,z,w,h,d,face)=>{const mt=[b.white,b.white,b.white,b.white,b.white,b.white];mt[{px:0,nx:1,py:2,ny:3,pz:4,nz:5}[face]]=face==='ny'?b.cream:b.panel;return addBoxW(x,y,z,w,h,d,mt,2.4)};
 yw(0,salonH,15,23,.5,28,'ny').userData.noCast=true;
 for(const [z,f] of[[28.5,'nz'],[1.5,'pz']]){yw(-6.8,0,z,9.4,salonH,1,f);yw(6.8,0,z,9.4,salonH,1,f);yw(0,3.4,z,4.2,salonH-3.4,1,f)}
 for(const s of[-1,1]){const x=s*11,f=s>0?'nx':'px';let cz=1;for(const [z0,z1] of[[3,9],[10,16],[17,23],[24,27]]){yw(x,0,(cz+z0)/2,1,salonH,z0-cz,f);yw(x,0,(z0+z1)/2,1,winH[0],z1-z0,f);yw(x,winH[1],(z0+z1)/2,1,salonH-winH[1],z1-z0,f);
   solid(x,winH[0],(z0+z1)/2,1,winH[1]-winH[0],z1-z0);const gp=deco(new THREE.PlaneGeometry(z1-z0,winH[1]-winH[0]),b.glass,x-s*.2,(winH[0]+winH[1])/2,(z0+z1)/2);gp.rotation.y=Math.PI/2;level.push(gp);cz=z1}
  yw(x,0,(cz+29)/2,1,salonH,29-cz,f)}
 // фасад со стороны носа
 for(const s of[-1,1]){const t=deco(new THREE.PlaneGeometry(6.6,2.5),b.tint,s*6.5,2.4,29.03);for(const x of[s*3.4,s*9.7])decoW(x,.4,29.05,.12,4,.1,b.gold)}decoW(0,4.05,29.08,23,.14,.12,b.gold);
 {const nm=deco(new THREE.PlaneGeometry(7,1.05),new THREE.MeshBasicMaterial({map:signTex('ПЕННАЯ ЛЕДИ','#d4a640','rgba(0,0,0,0)',1024,154,'italic bold 118px "Russo One",Arial'),transparent:true}),0,4.7,29.06)}
 for(const x of[-2.6,2.6]){plight(x,3.2,30.5,0xffd7a0,.5,9)}
 // внешний облик надстройки
 decoW(0,salonH+.5,15,23.6,.12,29,b.teak);
 addBoxW(0,salonH+.5,16,18,4.2,18,b.white);for(const s of[-1,1]){const t=deco(new THREE.PlaneGeometry(16,1.3),b.tint,s*9.02,salonH+2.9,16);t.rotation.y=s*Math.PI/2}deco(new THREE.PlaneGeometry(16,1.4),b.tint,0,salonH+2.9,25.02);
 decoW(0,salonH+4.7,13,14,.3,14,b.navy);{const ar=deco(new THREE.TorusGeometry(4.6,.35,10,40,Math.PI),b.white,0,salonH+4.8,10);ar.rotation.y=Math.PI/2}
 for(const [x,y,z,r] of[[-1.6,salonH+9.2,10,.7],[1.6,salonH+9.1,10,.55]])deco(new THREE.SphereGeometry(r,16,12),b.white,x,y,z);
 deco(new THREE.CylinderGeometry(.12,.16,8,8),b.chrome,0,salonH+8,10);
 // интерьер салона
 decoW(0,.012,15,21,.02,25.5,b.parq,2);{const rg=deco(new THREE.PlaneGeometry(9,12).rotateX(-Math.PI/2),b.rug,1.5,.03,14);rg.receiveShadow=true}
 // бар
 addBoxW(-8.2,0,14,1.6,1.12,12,b.panel,2);decoW(-8.2,1.12,14,1.9,.08,12.4,b.gold);decoW(-10.1,0,14,1.2,1.12,12,b.panel,2);decoW(-10.1,1.12,14,1.3,.06,12.2,b.gold);solid(-9.6,0,14,2.4,1.2,12);for(const z of[7.9,20.1])addBoxW(-9.6,0,z,2.4,1.12,.2,b.panel,2);
 for(let i=0;i<5;i++){const z=9.5+i*2.2;deco(new THREE.CylinderGeometry(.05,.05,.5,8),b.chrome,-8.6,1.42,z);const hd=deco(new THREE.CylinderGeometry(.07,.05,.34,8),new THREE.MeshBasicMaterial({color:[0xffc040,0xff7a2a,0x5fe0c8,0xffc040,0xff5a8a][i]}),-8.6,1.84,z)}
 {const bl=[];for(let i=0;i<24;i++)bl.push([-10.25-(i%2)*.25,1.18,8.6+(i>>1)*.95,i,0,0,1.25]);inst(bottleGeo,m.bottle,bl)}
 for(let i=0;i<5;i++){const z=9.5+i*2.2;deco(new THREE.CylinderGeometry(.24,.24,.08,16),b.leather,-6.9,.82,z);solid(-6.9,0,z,.5,.86,.5);deco(new THREE.CylinderGeometry(.04,.06,.8,8),b.chrome,-6.9,.4,z)}
 // диваны и столик
 for(const [x,z,w,d] of[[7.6,10,1.2,6],[7.6,17.5,1.2,6],[4.2,7.4,5.6,1.2]]){addBoxW(x,0,z,w,.48,d,b.leather,2);decoW(x+(w<2?.45:0),.48,z+(w<2?0:-.45),w<2?.3:w,.5,w<2?d:.3,b.leather,2);solid(x+(w<2?.45:0),.48,z+(w<2?0:-.45),w<2?.3:w,.5,w<2?d:.3)}
 addBoxW(4.2,0,13.5,2.6,.42,3.4,b.tint);
 // аквариум с пивом и рыбками
 addBoxW(0,0,21.8,4.6,.6,1.6,b.navy);{const aq=deco(new THREE.BoxGeometry(4.4,2,1.4),b.glass,0,1.62,21.8);level.push(aq);solid(0,.6,21.8,4.4,2,1.4);const bq=deco(new THREE.BoxGeometry(4.3,1.7,1.3),new THREE.MeshStandardMaterial({color:0xf0a830,roughness:.05,transparent:true,opacity:.42,envMap:ENV,emissive:0x5a2a00,depthWrite:false}),0,1.48,21.8);
  const fg=new THREE.ConeGeometry(.09,.26,6);fg.rotateZ(Math.PI/2);for(let i=0;i<7;i++){const f=deco(fg,new THREE.MeshBasicMaterial({color:0xff8a1a}),0,1.5,21.8);f.userData.dyn=1;L3.fish.push({f,ph:i*1.7,y:.9+Math.random()*1.2})}
  mapAnims.push(dt=>{for(const k of L3.fish){const t=lvT*.6+k.ph;k.f.position.set(Math.sin(t)*1.8,k.y+Math.sin(t*2.3)*.15,21.8+Math.cos(t*1.3)*.4);k.f.rotation.y=Math.cos(t)>0?0:Math.PI}
   if(Math.random()<dt*4)puff(new V3(rnd(-2,2),1,21.8+rnd(-.5,.5)),1,0xfff6e2,.4,1.2,-3)})}
 // колонны
 for(const [x,z] of[[-4.5,6],[4.5,6],[-4.5,24],[4.5,24]]){addBoxW(x,0,z,.7,salonH,.7,b.white,2);decoW(x,0,z,.82,.3,.82,b.gold);decoW(x,salonH-.3,z,.82,.3,.82,b.gold)}
 // люстра
 {const ch=new THREE.Group();ch.position.set(0,salonH-.05,14);mapGroup.add(ch);const arm=new THREE.Group();ch.add(arm);arm.add(new THREE.Mesh(new THREE.CylinderGeometry(.03,.03,1.2,6),b.gold)).position.y=-.6;
  const cr=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.02,metalness:.1,envMap:ENV,transparent:true,opacity:.8}),og=new THREE.OctahedronGeometry(.07);
  for(const [r,y,n] of[[1.1,-1.3,18],[.8,-1.55,14],[.45,-1.8,9]]){const t=new THREE.Mesh(new THREE.TorusGeometry(r,.03,6,40),b.gold);t.rotation.x=Math.PI/2;t.position.y=y;arm.add(t);for(let i=0;i<n;i++){const a=i/n*6.283,c=new THREE.Mesh(og,cr);c.position.set(Math.sin(a)*r,y-.16,Math.cos(a)*r);c.scale.y=1.8;arm.add(c);
   if(i%3===0){const fl=new THREE.Mesh(new THREE.SphereGeometry(.05,8,6),_flM||(_flM=new THREE.MeshBasicMaterial({color:0xfff0c0})));fl.position.set(Math.sin(a)*r,y+.12,Math.cos(a)*r);arm.add(fl)}}}
  for(const o of arm.children)o.castShadow=false;mergeKids(ch);L3.chand=arm}
 for(const z of[8,14,20])plight(0,4.2,z,0xffd7a0,.55,14);plight(-8,2.6,14,0xff9a50,.4,8);
 wsign('КАЮТ-КОМПАНИЯ',0,4.35,27.96,Math.PI,6,.8,'#d8b05a','#1a1008');wsign('ПРОМЕНАД ▸',0,4.35,2.04,0,4.2,.6,'#d8b05a','#1a1008');
 const doorM=new THREE.MeshStandardMaterial({color:0x9fd0e8,roughness:.05,metalness:.3,envMap:ENV,transparent:true,opacity:.55});
 addDoor(0,0,28.5,4.2,3.4,true,doorM,'slide');addDoor(0,0,1.5,4.2,3.4,false,doorM,'slide');
 // --- ПРОМЕНАД z[-44,1] ---
 // джакузи с пивом
 discSolid(0,-22,3.1,0,.62,.9);
 {const jr=deco(new THREE.CylinderGeometry(3.1,3.2,.62,40,1,true),b.white,0,.31,-22);jr.material=b.white;level.push(jr);const lip=deco(new THREE.TorusGeometry(3,.12,8,48),b.teak,0,.62,-22);lip.rotation.x=Math.PI/2;
  deco(new THREE.CylinderGeometry(2.85,2.85,.02,40),b.beer,0,.5,-22);mapAnims.push(dt=>{if(Math.random()<dt*14)puff(new V3(rnd(-2,2),.5,-22+rnd(-2,2)),2,0xfff6e2,1,.8,-4)})}
 // шезлонги
 for(const s of[-1,1])for(let i=0;i<4;i++){const x=s*9.6,z=-6-i*3.2;addChair(x,z,s)}
 // шлюпки на шлюпбалках
 {const hull=new THREE.SphereGeometry(1,20,10,0,Math.PI*2,Math.PI/2,Math.PI/2);for(const s of[-1,1])for(const z of[-12,-36]){const bt=new THREE.Group();bt.position.set(s*14.25,2.7,z);mapGroup.add(bt);
  const h=new THREE.Mesh(hull,b.white);h.scale.set(1.05,.75,2.7);bt.add(h);const st=new THREE.Mesh(new THREE.TorusGeometry(1,.05,6,32),b.navy);st.rotation.x=Math.PI/2;st.scale.set(1.06,2.72,1);st.position.y=-.12;bt.add(st);
  const dk=new THREE.Mesh(new THREE.CylinderGeometry(1.02,1.02,.08,24),b.teak);dk.scale.set(1,1,2.62);dk.position.y=.02;bt.add(dk);
  const cv=new THREE.Mesh(new THREE.CylinderGeometry(.85,.85,3.2,16,1,true,-Math.PI/2,Math.PI),b.orange);cv.rotation.x=Math.PI/2;cv.position.set(0,.05,-.2);bt.add(cv);cv.material.side=THREE.DoubleSide;
  const ws=new THREE.Mesh(new THREE.BoxGeometry(1.4,.45,.06),b.tint);ws.position.set(0,.3,1.5);ws.rotation.x=-.35;bt.add(ws);bt.traverse(o=>{if(o.isMesh)o.castShadow=true});mergeKids(bt);
  for(const dz of[-2.1,2.1]){deco(new THREE.CylinderGeometry(.07,.09,3.6,8),b.chrome,s*12.95,1.8,z+dz);const arm=deco(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new V3(s*12.95,3.55,z+dz),new V3(s*13.5,4.05,z+dz),new V3(s*14.15,3.85,z+dz)]),10,.065,6,false),b.chrome,0,0,0);
   deco(new THREE.CylinderGeometry(.015,.015,.95,4),b.dark,s*14.15,3.35,z+dz)}}}
 // ящики пива и кеги
 for(const [x,z] of[[-9,-30],[-9,-32.2],[9.6,-40],[-3,-41]])addBox(x,0,z,2,1.1,1.6,mats.crate);
 // спасательные круги
 for(const [z,s] of[[-14,1],[-32,1],[-22,-1]])addRingStation(s*12.85,1.15,z,s);
 // мачта с гирляндами
 for(const z of[-2,-42]){deco(new THREE.CylinderGeometry(.08,.1,7,8),b.chrome,0,3.5,z);solid(0,0,z,.3,7,.3)}
 {const bulbs=[];for(let i=0;i<=40;i++){const t=i/40,z=-2-t*40,y=6.6-Math.sin(t*Math.PI)*1.3;for(const s of[-1,1])bulbs.push([s*(4+Math.sin(t*Math.PI)*4),y,z])}
  const bg=new THREE.SphereGeometry(.09,8,6),im=new THREE.InstancedMesh(bg,new THREE.MeshBasicMaterial({color:0xffd98a}),bulbs.length),o=new THREE.Object3D();bulbs.forEach((p,i)=>{o.position.set(p[0],p[1],p[2]);o.updateMatrix();im.setMatrixAt(i,o.matrix)});mapGroup.add(im)}
 plight(0,5,-12,0xffc070,.45,22);plight(0,5,-32,0xffc070,.45,22);
 // --- рубка на корме z[-56,-44] ---
 wallX(-44.5,-13.3,13.3,3.6,b.white,[{c:0,w:4.2,h:3.4}]);addDoor(0,0,-44.5,4.2,3.4,false,doorM,'slide');
 for(const s of[-1,1]){addBoxW(s*8.4,0,-50,9.8,3.6,11,b.white);addBoxW(s*8.4,3.6,-50,9.8,3.9,11,b.white)}addBoxW(0,3.9,-50.25,26.6,.3,12.5,b.white);addBoxW(0,4.2,-50,7,3.3,11,b.white);
 addBoxW(0,3.6,-50,4.6,.3,11,b.cream).userData.noCast=true;for(const s of[-1,1])addBoxW(s*2.9,0,-50,.8,3.6,11,b.panel);decoW(0,.012,-50,5,.02,11,b.parq,2);
 for(const s of[-1,1]){const t=deco(new THREE.PlaneGeometry(10,1.3),b.tint,s*13.32,5.2,-50);t.rotation.y=s*Math.PI/2}{const t=deco(new THREE.PlaneGeometry(22,1.2),b.tint,0,5.4,-44.24)}{const t=deco(new THREE.PlaneGeometry(22,1.2),b.tint,0,5.4,-55.76);t.rotation.y=Math.PI}
 wsign('КОРМА · ВЕРТОЛЁТНАЯ ▸',0,3.95,-44.22,0,5.2,.6,'#d8b05a','#1a1008');plight(0,3,-50,0xffd7a0,.5,10);
 // пиратский флаг
 deco(new THREE.CylinderGeometry(.09,.12,9,8),b.chrome,0,12,-50);{const fg=new THREE.PlaneGeometry(4.2,2.7,20,12);fg.translate(2.1,0,0);const fc=document.createElement('canvas');fc.width=512;fc.height=330;const g=fc.getContext('2d');
  g.fillStyle='#111';g.fillRect(0,0,512,330);g.fillStyle='#f4f0e6';g.save();g.translate(256,150);g.beginPath();g.ellipse(0,-20,62,58,0,0,7);g.fill();g.fillRect(-36,20,72,36);g.fillStyle='#111';for(const x of[-24,24]){g.beginPath();g.ellipse(x,-18,17,20,0,0,7);g.fill()}
  g.beginPath();g.moveTo(0,4);g.lineTo(-8,20);g.lineTo(8,20);g.fill();for(let x=-28;x<=28;x+=14)g.fillRect(x-2,40,4,16);g.fillStyle='#f4f0e6';g.lineWidth=0;for(const a of[.7,-.7]){g.save();g.rotate(a);g.fillRect(-120,88,240,18);for(const sx of[-120,120]){g.beginPath();g.arc(sx,90,14,0,7);g.arc(sx,104,14,0,7);g.fill()}g.restore()}
  g.fillStyle='#ff6fae';g.beginPath();g.moveTo(-20,-84);g.lineTo(-52,-104);g.lineTo(-52,-64);g.fill();g.beginPath();g.moveTo(-20,-84);g.lineTo(12,-104);g.lineTo(12,-64);g.fill();g.beginPath();g.arc(-20,-84,9,0,7);g.fill();g.restore();
  const ft=new THREE.CanvasTexture(fc);const fl=new THREE.Mesh(fg,new THREE.MeshStandardMaterial({map:ft,side:THREE.DoubleSide,roughness:.85}));fl.position.set(0,15,-50);fl.rotation.y=Math.PI/2;fl.castShadow=true;fl.userData.dyn=1;mapGroup.add(fl);
  const base=fg.attributes.position.array.slice();L3.flag={fl,base}}
 // --- КОРМОВАЯ ПАЛУБА z[-96,-56] ---
 wsign('ВЕРТОЛЁТНАЯ ПЛОЩАДКА',0,4.6,-55.78,Math.PI,6.4,.7,'#f6eee2','#14213d');
 // люк ракетной шахты: открывается, когда Альтушка вызывает ракету
 {const hz=storyMats().hz,dm=new THREE.MeshStandardMaterial({color:0x2b2f36,metalness:.65,roughness:.38,envMap:ENV}),g=new THREE.Group();g.position.set(0,0,-75);mapGroup.add(g);
  for(const [x,z,w,d] of[[0,-5.25,7.9,.5],[0,5.25,7.9,.5],[-3.85,0,.5,10],[3.85,0,.5,10]]){const m=new THREE.Mesh(new THREE.BoxGeometry(w,.05,d),hz);m.position.set(x,.025,z);g.add(m)}
  const tc=document.createElement('canvas');tc.width=tc.height=256;const c2=tc.getContext('2d');c2.fillStyle='#ffcf1a';c2.beginPath();c2.arc(128,128,118,0,7);c2.fill();c2.fillStyle='#111';for(let k=0;k<3;k++){c2.beginPath();c2.moveTo(128,128);c2.arc(128,128,104,-Math.PI/2+k*2.094-.52,-Math.PI/2+k*2.094+.52);c2.closePath();c2.fill()}c2.fillStyle='#ffcf1a';c2.beginPath();c2.arc(128,128,30,0,7);c2.fill();c2.fillStyle='#111';c2.beginPath();c2.arc(128,128,18,0,7);c2.fill();
  const tm=new THREE.MeshStandardMaterial({map:new THREE.CanvasTexture(tc),transparent:true,roughness:.6});const doors=[];
  for(const s of[-1,1]){const d=new THREE.Group();d.position.x=s*1.8;g.add(d);const pl=new THREE.Mesh(new THREE.BoxGeometry(3.6,.14,10),dm);pl.position.y=-.07;d.add(pl);pl.receiveShadow=true;
   const st=new THREE.Mesh(new THREE.BoxGeometry(.18,.02,10),hz);st.position.set(-s*1.71,.005,0);d.add(st);const tf=new THREE.Mesh(new THREE.PlaneGeometry(2.6,2.6),tm);tf.rotation.x=-Math.PI/2;tf.position.set(-s*.5,.008,0);tf.scale.x=s;d.add(tf);doors.push(d)}
  const sh2=new THREE.Mesh(new THREE.BoxGeometry(7.2,9,10),new THREE.MeshStandardMaterial({color:0x0e0f12,side:THREE.BackSide,roughness:.9}));sh2.position.y=-4.55;g.add(sh2);
  const gl=new THREE.Mesh(new THREE.PlaneGeometry(6.8,9.6),new THREE.MeshBasicMaterial({color:0xff5a1a,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false}));gl.rotation.x=-Math.PI/2;gl.position.y=-7;g.add(gl);
  wsign('ШАХТА · НЕ СТОЯТЬ',0,.03,-69.2,0,4,.5,'#111','#ffcf1a').rotation.x=-Math.PI/2;
  L3.hatch={g,doors,glow:gl,k:0,want:0}}
 // вертолётная площадка и шахта ракеты
 {const hc=document.createElement('canvas');hc.width=hc.height=512;const g=hc.getContext('2d');g.strokeStyle='#f4f2ec';g.lineWidth=18;g.beginPath();g.arc(256,256,226,0,7);g.stroke();g.strokeStyle='#d8b05a';g.lineWidth=8;g.beginPath();g.arc(256,256,196,0,7);g.stroke();
  g.fillStyle='#f4f2ec';g.font='900 260px Arial';g.textAlign='center';g.textBaseline='middle';g.fillText('H',256,262);const hp=deco(new THREE.PlaneGeometry(13,13).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(hc),transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2}),0,.02,-88)}

 // бар-киоск, пальмы, шезлонги
 addBoxW(-10.8,0,-58.7,4,1.15,2.4,b.panel,2);decoW(-10.8,1.15,-58.7,4.3,.08,2.7,b.gold);deco(new THREE.CylinderGeometry(.06,.06,2.6,8),b.chrome,-10.8,2.45,-58.7);{const um=deco(new THREE.ConeGeometry(2.6,.8,16,1,true),new THREE.MeshStandardMaterial({color:0xf0641e,side:THREE.DoubleSide,roughness:.6}),-10.8,3.8,-58.7)}
 for(const [x,z] of[[11.6,-58],[-11.8,-76],[11.6,-93.5],[11.6,-74]])addPalm(x,z);
 for(const s of[-1,1])for(let i=0;i<3;i++)addChair(s*9.8,-67-i*3,s);
 for(const [x,z] of[[11.6,-66],[-11.6,-82],[11.6,-84]])addBox(x,0,z,1.4,1,1.8,mats.crate);
 for(const [x,z] of[[-5,-10],[6,-27],[-6,-36],[10.5,-20],[-7.4,-57.6],[5.5,-60],[11.2,-91.2],[-6.4,3.4],[8.6,3.6],[-8.8,25.6],[8.9,25.6]])addKeg(x,z);
 // денежная тачка на цепи за кормой
 L3.car=buildMoneyCar();L3.car.position.set(0,SEA_Y,-108);mapGroup.add(L3.car);deco(new THREE.CylinderGeometry(.22,.28,.7,12),b.chrome,0,.35,-94.9);solid(0,0,-94.9,.6,.7,.6);deco(new THREE.TorusGeometry(.32,.08,8,16),b.chrome,0,.55,-95.95);
 {const im=new THREE.InstancedMesh(new THREE.TorusGeometry(.12,.035,6,10),b.chrome,70);im.userData.dyn=1;im.frustumCulled=false;mapGroup.add(im);L3.chain=im}
 L3.misL=new THREE.PointLight(0xff8a3a,0,14);mapGroup.add(L3.misL);plight(0,6,-62,0xffc070,.45,24);plight(0,6,-86,0xffc070,.45,24);plight(0,-1,-75,0xffb040,.6,10);
 for(let i=0;i<3;i++)addBeacon(i);questInit();
 dressL3(b);
 // прогрев шейдеров и текстур босса, чтобы его появление не подвисало
 {const w=new THREE.Group(),T_=buildTank(),M_=buildMissile(),G_=buildGirl(ALT_O);w.add(T_.g,M_.g,G_.g);w.position.set(0,-60,0);scene.add(w);
  for(const ex of['wink','smirk','laugh','angry','dizzy','blink'])faceTex('alt',ex);for(const ex of['scared','happy','wink','blink'])faceTex('beach',ex);
  try{renderer.compile(scene,camera);if(renderer.initTexture)for(const k in GT)renderer.initTexture(GT[k])}catch(e){}scene.remove(w)}}

/* ---------- реквизит ---------- */
function addChair(x,z,s){const g=new THREE.Group();g.position.set(x,0,z);mapGroup.add(g);const b=beerMats();
 const fr=new THREE.Mesh(new THREE.BoxGeometry(.9,.12,2),b.chrome);fr.position.y=.32;g.add(fr);const cu=new THREE.Mesh(new THREE.BoxGeometry(.84,.12,1.4),b.leather);cu.position.set(0,.44,.25);g.add(cu);
 const bk=new THREE.Mesh(new THREE.BoxGeometry(.84,.1,.75),b.leather);bk.position.set(0,.62,-.72);bk.rotation.x=-.75;g.add(bk);for(const dz of[-.85,.85])for(const dx of[-.38,.38]){const l=new THREE.Mesh(new THREE.CylinderGeometry(.03,.03,.32,6),b.chrome);l.position.set(dx,.16,dz);g.add(l)}
 g.rotation.y=s>0?.08:-.08;mergeKids(g);const box={min:new V3(x-.45,0,z-1),max:new V3(x+.45,.5,z+1)};boxes.push(box);L3.chairs.push({g,box,x,z,alive:true})}
function breakChair(c){if(!c.alive)return;c.alive=false;const i=boxes.indexOf(c.box);if(i>=0)boxes.splice(i,1);c.g.visible=false;puff(new V3(c.x,.5,c.z),24,0xf1ece2,7,.7);puff(new V3(c.x,.5,c.z),10,0xc0c4ca,6,.6);sfx('hit',.5)}
function addPalm(x,z){const b=beerMats();addBoxW(x,0,z,1.3,.9,1.3,b.white,2);solid(x,.9,z,.45,6,.45);decoW(x,.9,z,1.1,.05,1.1,m3dirt());const tr=new THREE.Group();tr.position.set(x,.9,z);mapGroup.add(tr);tr.userData.dyn=1;
 let y=0;for(let i=0;i<6;i++){const s=new THREE.Mesh(new THREE.CylinderGeometry(.12-i*.01,.14-i*.01,.55,8),b.bark);s.position.set(Math.sin(i*.3)*.15,y+.27,0);tr.add(s);y+=.52}
 for(let i=0;i<7;i++){const lf=new THREE.Mesh(new THREE.PlaneGeometry(.5,2.2,1,4),b.palm);lf.geometry.translate(0,1.1,0);const p=lf.geometry.attributes.position;for(let k=0;k<p.count;k++){const yy=p.getY(k);p.setZ(k,-yy*yy*.18)}lf.geometry.computeVertexNormals();
  lf.position.set(Math.sin(1.8)*.15,y,0);lf.rotation.set(1.1,i/7*6.283,0,'YXZ');tr.add(lf)}mergeKids(tr)}
let _m3d=null;const m3dirt=()=>_m3d||(_m3d=M(0x4a3020,{roughness:1}));
function addKeg(x,z){const b=beerMats(),g=new THREE.Group();g.position.set(x,0,z);mapGroup.add(g);const bd=new THREE.Mesh(new THREE.CylinderGeometry(.42,.42,1.05,20),b.keg);bd.position.y=.53;g.add(bd);
 for(const y of[.06,.53,1]){const r=new THREE.Mesh(new THREE.TorusGeometry(.43,.035,6,24),b.chrome);r.rotation.x=Math.PI/2;r.position.y=y;g.add(r)}
 const v=new THREE.Mesh(new THREE.CylinderGeometry(.08,.1,.14,10),b.dark);v.position.y=1.12;g.add(v);g.traverse(o=>{if(o.isMesh)o.castShadow=true});mergeKids(g);g.traverse(o=>{if(o.isMesh)level.push(o)});
 const box={min:new V3(x-.45,0,z-.45),max:new V3(x+.45,1.1,z+.45)};boxes.push(box);L3.kegs.push({g,box,pos:new V3(x,.6,z),alive:true})}
function kegBoom(i,mine){const k=L3&&L3.kegs[i];if(!k||!k.alive)return;k.alive=false;k.g.visible=false;const bi=boxes.indexOf(k.box);if(bi>=0)boxes.splice(bi,1);k.g.traverse(o=>{const j=level.indexOf(o);if(j>=0)level.splice(j,1)});const p=k.pos;
 blast(p,5,0xffc040);puff(p,90,0xfff6e2,14,1,6);puff(p,40,0xe09a18,10,.9,8);addPuddle(p.x,0,p.z,2.4,10);sfx('boom',.9*Math.max(.3,sndV(p.x,p.y,p.z)));shake=Math.max(shake,.35*sndV(p.x,p.y,p.z));
 if(mine&&mp())pushFx(['K',0,i]);const pc=tmpA.set(P.pos.x,P.pos.y+.9,P.pos.z),d=pc.distanceTo(p);if(P.alive&&d<5){const f=1-d/5;hurt(Math.round(26*f));if(P.iT<=0)P.vel.add(tmpB.subVectors(pc,p).normalize().multiplyScalar(14*f)).y+=5*f}
 if(mode==='solo'||isHost)for(const e of enemies)if(!e.dead){const d2=center(e,tmpC).distanceTo(p)-e.r;if(d2<5.4){const f=1-Math.max(0,d2)/5.4;damage(e,(ENEMY[e.type].boss?4:9)*(.5+.5*f),99,'keg');if(!e.remote&&!ENEMY[e.type].boss&&!ENEMY[e.type].fly){e.vel.add(tmpB.subVectors(e.pos,p).setY(0).normalize().multiplyScalar(15*f));e.vel.y+=7*f}}}
 L3.kegs.forEach((o,j)=>{if(o.alive&&o.pos.distanceTo(p)<3.2)setTimeout(()=>kegBoom(j,mine),140)})}
function addRingStation(x,y,z,s){const b=beerMats(),g=new THREE.Group();g.position.set(x,y,z);g.rotation.y=s>0?-Math.PI/2:Math.PI/2;mapGroup.add(g);
 const bk=new THREE.Mesh(new THREE.BoxGeometry(1.1,1.1,.06),b.white);bk.position.z=-.05;g.add(bk);const rg=new THREE.Mesh(new THREE.TorusGeometry(.4,.1,10,28),b.ring);rg.position.z=.08;g.add(rg);
 const rope=new THREE.Mesh(new THREE.TorusGeometry(.3,.025,6,20),b.foam);rope.position.set(0,-.05,.1);g.add(rope);L3.rings.push({g,rg,pos:new V3(x-s*.2,y,z),s,has:true,t:0})}
function buildMoneyCar(){const b=beerMats(),G=new THREE.Group(),g=new THREE.Group(),mm=b.money;g.rotation.y=Math.PI;G.add(g);const bx=(w,h,d,x,y,z,mat,par)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat||mm);m.position.set(x,y,z);(par||g).add(m);m.castShadow=true;return m};
 // кабриолет, обшитый купюрами: кузов, капот, багажник, лобовое стекло, сиденья, руль
 bx(2.1,.55,4.8,0,.48,0);bx(2.1,.22,1.7,0,.86,1.55);bx(2.1,.22,1.3,0,.86,-1.75);bx(.12,.35,1.9,-1,.92,-.2);
 const ws=bx(1.9,.55,.06,0,1.22,.66,b.glass);ws.rotation.x=-.4;bx(1.95,.06,.1,0,1.47,.56,b.chrome);
 for(const x of[-.45,.45]){bx(.6,.14,.6,x,.84,-.35,b.leather);bx(.6,.6,.14,x,1.12,-.68,b.leather)}
 const sw=new THREE.Mesh(new THREE.TorusGeometry(.17,.03,6,18),b.dark);sw.position.set(.45,1.08,.28);sw.rotation.x=-.5;g.add(sw);
 bx(1.9,.08,.3,0,.85,2.35,b.chrome);bx(1.9,.08,.3,0,.85,-2.35,b.chrome);
 for(const sx of[-1,1])for(const sz of[-1.5,1.5]){const w=new THREE.Mesh(new THREE.CylinderGeometry(.38,.38,.3,16),b.dark);w.rotation.z=Math.PI/2;w.position.set(sx*1.02,.3,sz);g.add(w);const h=new THREE.Mesh(new THREE.CylinderGeometry(.2,.2,.32,12),b.chrome);h.rotation.z=Math.PI/2;h.position.copy(w.position);g.add(h)}
 for(const sx of[-.6,.6])bx(.35,.18,.05,sx,.72,2.42,new THREE.MeshBasicMaterial({color:0xfff2c0}));
 // дверь водителя на петле
 const door=new THREE.Group();door.position.set(1.05,.48,.55);g.add(door);bx(.1,.62,1.45,0,.36,-.72,mm,door);bx(.12,.06,1.45,0,.68,-.72,b.chrome,door);bx(.04,.05,.2,.07,.45,-1.2,b.chrome,door);
 const seat=new THREE.Group();seat.position.set(.45,.78,-.35);g.add(seat);mergeKids(g);G.userData={door,seat,inner:g};return G}

/* ---------- живой уровень: качка, пенный вал, за бортом ---------- */
const WAVE_PER=22,WAVE_T0=14,_cl=new THREE.Object3D();
function updL3(dt){const S=story;if(!L3||!S)return;const t=lvT;
 camRock.r=Math.sin(t*.55)*.013+Math.sin(t*.23+1)*.006;camRock.p=Math.sin(t*.41)*.006;camRock.y=Math.sin(t*.7)*.05;if(L3.sea){L3.sea.rotation.set(camRock.p,0,camRock.r);L3.sky.rotation.set(camRock.p,0,camRock.r)}
 updQuest(dt);updHelperBottles(dt);updKmarks(dt);updAltEnd(dt);updObbs(dt);l3Hint();if(L3.wreck&&Math.random()<dt*14){const w=L3.wreck.ob;puff(new V3(w.x+rnd(-1,1),1.8,w.z+rnd(-1.5,1.5)),2,Math.random()<.3?0xff8a3a:0x2a2626,2.2,1.4,-3)}
 if(L3.chand)L3.chand.rotation.set(Math.sin(t*.41)*.06,0,Math.sin(t*.55)*.09);
 if(L3.flag){const p=L3.flag.fl.geometry.attributes.position,a=p.array,bs=L3.flag.base;for(let i=0;i<p.count;i++){const x=bs[i*3],y=bs[i*3+1],w=x/4.2;a[i*3+2]=Math.sin(t*6-x*1.6+y*.6)*.32*w+Math.sin(t*3.3-x*.8)*.18*w;a[i*3+1]=y-w*w*.25+Math.sin(t*4-x)*.05*w}p.needsUpdate=true;L3.flag.fl.geometry.computeVertexNormals()}
 if(L3.car&&!L3.carFree){const c=L3.car,cz=-108+Math.sin(t*.37)*.5,cx=Math.sin(t*.29)*.7;c.position.set(cx,seaH(cx,cz,t)-.4,cz);c.rotation.z=Math.sin(t*1.1)*.06;c.rotation.x=Math.sin(t*.9)*.05}
 if(L3.car&&!L3.chainBroken){const c=L3.car;c.updateMatrixWorld(true);const a=new V3(0,.55,-96),bb=c.localToWorld(new V3(0,.75,2.45)),sag=Math.max(0,.45-(a.distanceTo(bb)-12.2)*.3),im=L3.chain,n=im.count,o=_cl;for(let i=0;i<n;i++){const k=i/(n-1);o.position.set(a.x+(bb.x-a.x)*k,a.y+(bb.y-a.y)*k-Math.sin(k*Math.PI)*sag,a.z+(bb.z-a.z)*k);o.lookAt(bb);if(i%2)o.rotateZ(Math.PI/2);o.updateMatrix();im.setMatrixAt(i,o.matrix)}im.instanceMatrix.needsUpdate=true}
 if(L3.chainBroken&&L3.chain){const a=new V3(0,.55,-96),im=L3.chain,n=im.count,o=_cl;for(let i=0;i<n;i++){const k=i/(n-1),L=k*12;o.position.set(Math.sin(t*1.3+k*3)*.15*k,a.y-Math.min(L,a.y-SEA_Y+1.5),a.z-.25-Math.max(0,L-(a.y-SEA_Y+1.5))*.05);o.rotation.set(0,i%2?Math.PI/2:0,0);o.updateMatrix();im.setMatrixAt(i,o.matrix)}im.instanceMatrix.needsUpdate=true}
 if(L3.misL)L3.misL.intensity*=Math.max(0,1-dt*8);
 if(L3.hatch){const H=L3.hatch,inS=P.alive&&Math.abs(P.pos.x)<3.6&&P.pos.z>-80&&P.pos.z<-70&&P.pos.y<-.3;
  // пока в шахте кто-то есть, створки не закрываются
  H.k+=((inS&&H.k>.3?1:H.want)-H.k)*Math.min(1,dt*3);H.doors.forEach((d,i)=>{d.position.x=(i?1:-1)*(1.8+H.k*3.5);d.position.y=-H.k*.16});H.glow.material.opacity=H.k*.5;
  // коллизия створок: открыты больше чем на треть — в шахту можно провалиться
  const B=L3.hatchBox;if(B){const open=H.k>.35;B.min.y=open?-999:L3.hatchY[0];B.max.y=open?-998:L3.hatchY[1]}
  if(inS){H.inT=(H.inT||0)+dt;if(H.k>.1&&Math.random()<dt*6)puff(new V3(P.pos.x,P.pos.y+.4,P.pos.z),3,0xffa040,3,.4,-3);
   if(H.inT>.15&&(H.burnT=(H.burnT||0)-dt)<=0){H.burnT=.5;P.iT=Math.min(P.iT,0);hurt(8);banner('ТЫ В РАКЕТНОЙ ШАХТЕ — ВЫХЛОП ВЫБРОСИТ НАВЕРХ!')}
   if(H.inT>1.3||H.want===0){H.inT=0;const sx=P.pos.x<0?-1:1;P.vel.set(sx*7,24,0);P.grounded=false;P.slam=false;sfx('jet',.9);shake=Math.max(shake,.4);puff(new V3(P.pos.x,P.pos.y,P.pos.z),40,0xffc070,8,.6,-4);addStyle('ВЫБРОСИЛО ИЗ ШАХТЫ',40)}}
  else H.inT=0}
 // пенный вал
 const wc=t-WAVE_T0,wi=Math.floor(wc/WAVE_PER),wp=wc-wi*WAVE_PER;
 if(wc>0&&!(S.phase==='exit'||S.phase==='done'||L3.end)){if(wp<dt&&wi!==L3.lastWarn){L3.lastWarn=wi;if(S.room>=1){sfx('horn');banner('ПЕННЫЙ ВАЛ! ДЕРЖИСЬ!')}}
  // сторона волны — случайная, но одинаковая у всех игроков; парированная волна катится обратно
  if(wp>=2.6){const dir=waveDir(wi);let W=L3.wv;if(!W||W.wi!==wi)W=L3.wv={wi,rev:false};L3.wvWp=wp;
   let x,m;if(!W.rev){x=dir*(-46+(wp-2.6)*16);m=dir}else{x=W.xr-dir*(wp-W.tr)*18;m=-dir}
   if(Math.abs(x)<=47&&wp<WAVE_PER-1)updFoamWave(x,dt,wi,m,W.rev);else if(L3.wave)L3.wave.visible=false}else if(L3.wave)L3.wave.visible=false}else if(L3.wave)L3.wave.visible=false;
 // за бортом
 const fin=S.phase==='exit'||S.phase==='done';if(P.alive&&state==='play'&&!onHull(P.pos.x,P.pos.z)&&P.pos.y<SEA_Y+.4){if(!L3.inSeaT){splash(P.pos.x,P.pos.z,1.4);if(!fin)banner('ЗА БОРТОМ! СЕЙЧАС ВЫЛОВИМ…')}L3.inSeaT+=dt;if(fin)L3.inSeaT=Math.min(L3.inSeaT,1);
  const tgt=seaH(P.pos.x,P.pos.z,t)-1.35;P.vel.y+=(tgt-P.pos.y)*16*dt;P.vel.y*=1-Math.min(1,dt*4);const h2=Math.hypot(P.vel.x,P.vel.z);if(h2>4.5){P.vel.x*=4.5/h2;P.vel.z*=4.5/h2}
  if(L3.inSeaT>2.4){L3.inSeaT=0;P.pos.copy(S.cp).setY(S.cp.y+.05);P.vel.set(0,0,0);P.iT=0;hurt(12);banner('ВЫЛОВИЛИ ИЗ ПИВА')}}else L3.inSeaT=0;
 if(mode==='solo'||isHost)for(const e of enemies){if(e.dead||e.remote||ENEMY[e.type].fly||ENEMY[e.type].boss)continue;if(!onHull(e.pos.x,e.pos.z)&&e.pos.y<-.6){splash(e.pos.x,e.pos.z,1.6);if(mp())pushFx(['W',0,r1(e.pos.x),r1(e.pos.z)]);addStyle('ЗА БОРТ!',120);damage(e,9999,99,'overboard')}}
}
function splash(x,z,s){const y=SEA_Y+.2;puff(new V3(x,y,z),Math.round(40*s),0xfff6e2,9*s,.9,9);puff(new V3(x,y,z),Math.round(20*s),0xe09a18,7*s,.8,9);ring(new V3(x,y,z),3*s,0xfff6e2);const v=sndV(x,y,z);if(v>.05)sfx('gloop',Math.min(1,v*1.4))}
let FOAM_T=null;
function foamTex(){if(FOAM_T)return FOAM_T;const c=document.createElement('canvas');c.width=c.height=512;const g=c.getContext('2d');g.fillStyle='#fff3d6';g.fillRect(0,0,512,512);
 let r=7;const rr=()=>(r=(r*16807)%2147483647)/2147483647;
 for(let i=0;i<1400;i++){const x=rr()*512,y=rr()*512,R=2+Math.pow(rr(),3)*26;for(const[dx,dy]of[[0,0],[512,0],[-512,0],[0,512],[0,-512]]){const gr=g.createRadialGradient(x+dx-R*.3,y+dy-R*.3,R*.1,x+dx,y+dy,R);gr.addColorStop(0,'rgba(255,255,250,.9)');gr.addColorStop(.7,'rgba(240,214,160,.35)');gr.addColorStop(.92,'rgba(190,140,60,.5)');gr.addColorStop(1,'rgba(255,248,230,0)');g.fillStyle=gr;g.beginPath();g.arc(x+dx,y+dy,R,0,7);g.fill()}}
 FOAM_T=new THREE.CanvasTexture(c);FOAM_T.wrapS=FOAM_T.wrapT=THREE.RepeatWrapping;FOAM_T.anisotropy=8;FOAM_T.repeat.set(.25,.25);return FOAM_T}
function waveDir(wi){const h=Math.sin(wi*12.9898+78.233)*43758.5453;return h-Math.floor(h)<.5?1:-1}
function updFoamWave(x,dt,wi,m=1,rev=false){L3.waveX=x;L3.waveWi=wi;L3.waveM=m;if(!L3.wave){const g=new THREE.Group(),sh=new THREE.Shape();
  // профиль вала: пологий тыл, высокий гребень, загнутая губа впереди
  sh.moveTo(-4.2,0);sh.bezierCurveTo(-2.8,.3,-1.4,2.2,.2,2.9);sh.bezierCurveTo(1.3,3.15,2.3,2.6,2.1,1.85);sh.bezierCurveTo(1.9,1.35,1.3,1.5,1.45,1.05);sh.bezierCurveTo(1.6,.6,2.4,.25,3.2,0);sh.lineTo(-4.2,0);
  const ft=foamTex(),fm=new THREE.MeshStandardMaterial({color:0xffffff,vertexColors:true,map:ft,roughness:.55,transparent:true,opacity:.96,emissive:0x5a3a10,emissiveMap:ft,emissiveIntensity:.35,side:THREE.DoubleSide});
  const bm=new THREE.MeshPhysicalMaterial?new THREE.MeshPhysicalMaterial({color:0xf0a020,roughness:.05,transparent:true,opacity:.62,envMap:ENV,emissive:0x6a3000,emissiveIntensity:.6,side:THREE.DoubleSide}):new THREE.MeshStandardMaterial({color:0xf0a020,transparent:true,opacity:.62});
  const lip=new THREE.MeshBasicMaterial({color:0xfffbee,transparent:true,opacity:.9});
  g.userData.lips=[];
  for(const [z0,z1] of[[-96,-56],[-44,1],[28.6,52]]){const ge=new THREE.ExtrudeGeometry(sh,{depth:z1-z0,bevelEnabled:false,curveSegments:14});ge.translate(0,0,z0);
   const w2=new THREE.Mesh(ge,bm);w2.scale.set(1.15,.8,1);w2.position.x=-.9;g.add(w2);const w=new THREE.Mesh(ge,fm);g.add(w);
   {const pa=ge.attributes.position,col=new Float32Array(pa.count*3);for(let i=0;i<pa.count;i++){const y=pa.getY(i),x=pa.getX(i),z=pa.getZ(i);const k=Math.min(1,Math.max(0,(y-.5)/1.9)),st=.5+.5*Math.sin(z*1.7+x*2.3)*Math.sin(z*.53);
     const a=[.92,.55,.16],b=[1,.97,.9],m=Math.min(1,k*k*(1.15+st*.3));for(let q=0;q<3;q++)col[i*3+q]=a[q]+(b[q]-a[q])*m}ge.setAttribute('color',new THREE.BufferAttribute(col,3))}}
  mapGroup.add(g);L3.wave=g}
 const g=L3.wave;g.visible=true;const onDeck=Math.abs(x)<13.6;g.position.set(x,onDeck?0:SEA_Y+.3+Math.max(0,1-(Math.abs(x)-13)/12)*3,0);
 const tt=lvT;g.scale.y=1+Math.sin(tt*7)*.04;g.scale.x=m;
 const zs=()=>[rnd(-96,-56),rnd(-44,1),rnd(28.6,50)][Math.floor(Math.random()*3)];
 for(let q=0;q<Math.round(dt*120+Math.random());q++){const z=zs(),y=(onDeck?2.9:SEA_Y+3);puff(new V3(x+1.5*m,y,z),3,0xfffaf0,6,.75,7);if(Math.random()<.4)puff(new V3(x+2.4*m,onDeck?.4:SEA_Y+.5,z),3,0xe8a228,5,.7,4)}
 // удар о борт: брызги, когда вал перехлёстывает через фальшборт
 const side=x<-13.6?0:x>13.6?2:1,sk=wi*6+side+(rev?3:0);if(L3.waveSide!==sk){L3.waveSide=sk;if(side===1){const bx=m>0?-13.4:13.4;for(let k=0;k<6;k++){const z=zs();puff(new V3(bx,2,z),24,0xfff6e2,11,.9,10);puff(new V3(bx,1.6,z),10,0xe09a18,8,.8,8)}sfx('gloop',.9);if(typeof shake!=='undefined')shake=Math.max(shake||0,.35)}}
 const outdoor=p=>(p.z<-55.5&&p.z>-96)||(p.z<.5&&p.z>-44)||(p.z>28.8);
 const hit=(key,p)=>{const k=wi+(rev?'r':'')+':'+key;if(L3.waveHit.has(k))return false;const u=(p.x-x)*m;if(u<2.2&&u>-1.2&&outdoor(p)&&p.y<2.7&&onHull(p.x,p.z)){L3.waveHit.add(k);return true}return false};
 if(P.alive&&!(rev&&L3.wv&&L3.wv.by==='me')&&hit('me',P.pos)){P.vel.x+=19*m;P.vel.y=Math.max(P.vel.y,6.5);hurt(6);banner('СМЫВАЕТ!');puff(new V3(P.pos.x,1.4,P.pos.z),46,0xfff6e2,9,.8,8);puff(new V3(P.pos.x,1,P.pos.z),18,0xe09a18,7,.7,6);sfx('gloop',1);if(typeof shake!=='undefined')shake=Math.max(shake||0,.6)}
 if(mode==='solo'||isHost)for(const e of enemies){if(e.dead||e.remote||ENEMY[e.type].fly||ENEMY[e.type].boss)continue;if(hit(e.id,e.pos)){e.vel.x+=25*m;if(rev)addStyle('ОБРАТНЫЙ ВАЛ',40);e.vel.y=Math.max(e.vel.y,12);e.stun=Math.max(e.stun||0,1.3);puff(new V3(e.pos.x,1.4,e.pos.z),16,0xfff6e2,7,.7,6)}}}
/* непарируемые снаряды: красный ореол */
function npMark(p,r){if(!p)return p;p.np=1;const h=new THREE.Mesh(new THREE.SphereGeometry(r||.4,12,8),new THREE.MeshBasicMaterial({color:0xff1a2a,transparent:true,opacity:.38,depthWrite:false,blending:THREE.AdditiveBlending}));p.m.add(h);h.scale.setScalar(1/Math.max(.001,p.m.scale.x||1));return p}
/* парирование пенного вала — только на стиле S и выше */
function waveParry(){if(!L3||!L3.wave||!L3.wave.visible||L3.waveX==null||!P.alive)return false;const x=L3.waveX,m=L3.waveM||1,p=P.pos,W=L3.wv;
 const outdoor=(p.z<-55.5&&p.z>-96)||(p.z<.5&&p.z>-44)||(p.z>28.8),u=(p.x-x)*m;if(!(u<4.5&&u>-1.5&&outdoor&&p.y<3.2&&onHull(p.x,p.z)))return false;
 if(!W||W.rev)return false;const k=L3.waveWi+':me';if(L3.waveHit.has(k))return false;
 if(rank()<4){banner('ПЕННЫЙ ВАЛ ОТБИВАЕТСЯ ТОЛЬКО НА СТИЛЕ S');return false}
 L3.waveHit.add(k);waveReverse(L3.waveWi,x,L3.wvWp,true);heal(25);addStyle('ПАРИРОВАНИЕ ВОЛНЫ',260);parryOk();banner('ВОЛНА ОТБИТА — ПОШЛА НАЗАД!');shake=Math.max(shake,.5);
 const fp=new V3(p.x-1.2*m,1.6,p.z);puff(fp,80,0xfff6e2,13,.9,6);puff(fp,30,0xe09a18,10,.8,6);blast(fp,2.5,0xffe6a0);
 if(mp())pushFx(['A',0,10,L3.waveWi,r1(x),Math.round(L3.wvWp*100)/100]);return true}
function waveReverse(wi,x,wp,mine){const W=L3.wv;if(!W||W.wi!==wi||W.rev)return;W.rev=true;W.xr=x;W.tr=wp;W.by=mine?'me':'peer';sfx('gloop',1);sfx('slam',.6)}
/* под жидкостью: пиво в море и сироп во втором уровне */
let UW=null;
function uwFx(inMenu){const c=camera.position;let lq=null;
 if(!inMenu&&(state==='play'||state==='pause')){
  if(L3&&!onHull(c.x,c.z)){if(c.y<seaH(c.x,c.z,lvT)-.03)lq='beer'}
  else if(typeof L4!=='undefined'&&L4&&(TERR?terrH(c.x,c.z)<c.y:!onIsland(c.x,c.z))){if(c.y<sea4H(c.x,c.z,lvT)-.03)lq='water'}
  else if(pools.length){const q=poolAt(c);if(q&&q.m.visible&&c.y<q.y-.03)lq='syrup'}}
 if(!UW){const d=document.createElement('div');d.id='uwfx';d.style.cssText='position:absolute;inset:0;pointer-events:none;opacity:0;transition:opacity .15s';const cv=document.getElementById('c');if(cv)cv.after(d);else document.body.appendChild(d);UW={el:d,lq:null}}
 if(lq!==UW.lq){
  if(UW.lq&&scene.fog&&scene.fog===UW.fo){scene.fog.color.copy(UW.fc);scene.fog.near=UW.fn;scene.fog.far=UW.ff;scene.background=UW.bg;if(L3&&L3.seaM){const u=L3.seaM.uniforms;u.uFog.value.copy(UW.sf);u.uFn.value=UW.sn;u.uFf.value=UW.sff}if(L3&&L3.sky)L3.sky.visible=true;if(typeof L4!=='undefined'&&L4){if(L4.sky)L4.sky.visible=true;if(L4.seaM&&UW.sf4){const u=L4.seaM.uniforms;u.uFog.value.copy(UW.sf4);u.uFn.value=UW.sn4;u.uFf.value=UW.sff4}}}
  if(lq&&scene.fog){const beer=lq==='beer',wat=lq==='water',col=new THREE.Color(beer?0xa85a0a:wat?0x1a7aa8:0x6e2e06);UW.fo=scene.fog;UW.fc=scene.fog.color.clone();UW.fn=scene.fog.near;UW.ff=scene.fog.far;UW.bg=scene.background;
   scene.fog.color.copy(col);scene.fog.near=.2;scene.fog.far=beer?18:wat?26:5.5;scene.background=col;
   if(L3&&L3.seaM){const u=L3.seaM.uniforms;UW.sf=u.uFog.value.clone();UW.sn=u.uFn.value;UW.sff=u.uFf.value;u.uFog.value.copy(col);u.uFn.value=.2;u.uFf.value=18}if(L3&&L3.sky)L3.sky.visible=false;if(typeof L4!=='undefined'&&L4&&L4.sky){L4.sky.visible=false;UW.l4=1}if(typeof L4!=='undefined'&&L4&&L4.seaM){const u=L4.seaM.uniforms;UW.sf4=u.uFog.value.clone();UW.sn4=u.uFn.value;UW.sff4=u.uFf.value;u.uFog.value.copy(col);u.uFn.value=.2;u.uFf.value=26}
   UW.el.style.background=wat?'radial-gradient(ellipse at 50% -10%,rgba(160,240,255,.3),rgba(20,120,170,.25) 45%,rgba(0,40,70,.65) 100%)':beer?'radial-gradient(ellipse at 50% -10%,rgba(255,214,120,.32),rgba(190,100,15,.28) 45%,rgba(70,28,2,.72) 100%)':'radial-gradient(ellipse at 50% -10%,rgba(255,170,70,.3),rgba(140,60,8,.55) 45%,rgba(45,16,0,.88) 100%)';
   sfx('gloop',.7)}
  UW.el.style.opacity=lq?1:0;UW.lq=lq}
 if(lq){const t=performance.now()/1000;UW.el.style.backdropFilter='blur('+(lq==='beer'?1.2:2.5)+'px)';
  if(Math.random()<(lq==='beer'?.5:.2)){camera.getWorldDirection(_uwd);const p=new V3(c.x+_uwd.x*1.6+rnd(-1,1),c.y-.6+rnd(-.4,.4),c.z+_uwd.z*1.6+rnd(-1,1));puff(p,1,lq==='beer'?0xfff0c0:lq==='water'?0xe8fbff:0xffc070,.4,1.2,-3)}}}
const _uwd=new V3();
/* ---------- струя Газявы: капли летят по баллистической дуге, между ними — сплошная лента жидкости ---------- */
const SODA={d:[],seq:0,sid:0,lastT:-9,mesh:null,N:220};
function sodaInit(){if(SODA.mesh)return;const N=SODA.N,g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(N*18),3));g.setAttribute('uv',new THREE.BufferAttribute(new Float32Array(N*12),2));g.setAttribute('aA',new THREE.BufferAttribute(new Float32Array(N*6),1));
 const m=new THREE.ShaderMaterial({uniforms:{uT:{value:0},uW:{value:0}},transparent:true,depthWrite:false,side:THREE.DoubleSide,
  vertexShader:'attribute float aA;varying vec2 vU;varying float vA;void main(){vU=uv;vA=aA;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader:`uniform float uT;uniform float uW;varying vec2 vU;varying float vA;
   float h(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
   void main(){float x=abs(vU.y-.5)*2.;if(x>1.)discard;float core=1.-x*x;
    vec3 c=mix(vec3(.16,.05,.015),vec3(.5,.2,.05),core);c+=vec3(1.,.82,.55)*(1.-smoothstep(0.,.22,abs(vU.y-.36)))*.55;
    vec2 cell=floor(vec2(vU.x*9.-uT*14.,vU.y*4.));float b=step(.78,h(cell))*smoothstep(.2,.9,1.-vA);c=mix(c,vec3(.97,.92,.84),b*.8*(1.-uW));
    vec3 cw=mix(vec3(.16,.42,.78),vec3(.55,.8,.98),core)+vec3(.9,.97,1.)*(1.-smoothstep(0.,.14,abs(vU.y-.36)))*.35;c=mix(c,cw,uW);
    float a=vA*(.75+.25*core)*(1.-.35*uW);gl_FragColor=vec4(c,a*(1.-smoothstep(.75,1.,x)));}`});
 const mesh=new THREE.Mesh(g,m);mesh.frustumCulled=false;mesh.renderOrder=6;scene.add(mesh);SODA.mesh=mesh}
function sodaEmit(o,d,mine,key){sodaInit();key=mine?'me':(key||'peer');const S_=SODA.src||(SODA.src={}),st=S_[key]||(S_[key]={sid:0,lastT:-9});if(T-st.lastT>.2)st.sid=++SODA.sid;st.lastT=T;const sid=st.sid;if(mine){SODA.lastT=T;SODA.msid=sid}
 for(let k=2;k>=0;k--){const v=d.clone().multiplyScalar(42+rnd(-1.5,1.5));if(mine)v.addScaledVector(P.vel,.4);v.x+=rnd(-.22,.22);v.y+=rnd(-.15,.25);v.z+=rnd(-.22,.22);
  const p=o.clone().addScaledVector(v,k*.027);SODA.d.push({p,v,t:0,life:1.4,sid,seq:++SODA.seq,mine,hitC:null});}
 if(SODA.d.length>SODA.N)SODA.d.splice(0,SODA.d.length-SODA.N)}
function sodaHitEnemy(e,dr){if(GZ.mode===1)return gzWaterHit(e,dr);const c=center(e,tmpA);puff(c,6,0x6b2a12,4,.4);puff(c,3,0xf6eee2,3,.35);
 if(e.type==='jelly'||e.type==='queen'){puff(c,4,0xffb050,2,.4,-2);if(!sodaHitEnemy.syr){sodaHitEnemy.syr=1;banner('СИРОПНЫХ ГАЗЯВОЙ НЕ ПРОМОЧИТЬ')}return}
 if(!(e.wet>0)){addStyle('ЗАЛИТ',10)}e.wet=3;if(!e.remote)e.vel.addScaledVector(_sv.copy(dr.v).normalize(),.9)}
const _sv=new V3(),_sa=new V3(),_sb=new V3(),_sc=new V3();
function updSoda(dt){if(!SODA.mesh&&!SODA.d.length)return;sodaInit();const D=SODA.d,G=8.5;let land=0;
 for(const dr of D){if(dr.dead)continue;dr.t+=dt;dr.v.y-=G*dt;dr.v.multiplyScalar(1-dt*.25);const op=_sa.copy(dr.p);dr.p.addScaledVector(dr.v,dt);
  if(dr.t>dr.life){dr.dead=true;continue}
  if(dr.mine&&(state==='play')){
   for(const e of enemies){if(e.dead)continue;if(center(e,tmpB).distanceTo(dr.p)<e.r+.35){sodaHitEnemy(e,dr);dr.dead=true;break}}
   if(dr.dead)continue;
   for(const c of coins){if(c.dead)continue;if(c.m.position.distanceTo(dr.p)<.6){ricochet(c,1.1,1);addStyle('КОЛА-РИКОШЕТ',30);dr.dead=true;break}}
   if(dr.dead)continue;
   for(const pr of proj)if(pr.kind==='rocket'&&!pr.dead&&!pr.boost&&pr.m.position.distanceTo(dr.p)<.9){pr.boost=true;pr.m.children[1].material.color.setHex(0xf6eee2);pr.m.scale.setScalar(1.5);addStyle('МЕНТОС + КОЛА',40);puff(pr.m.position,30,0xf6eee2,6,.6)}}
  const g=groundAt(dr.p.x,dr.p.z,op.y+.3);
  if(dr.p.y<=g&&op.y>=g-.05){dr.dead=true;dr.p.y=g;puff(_sb.set(dr.p.x,g+.05,dr.p.z),4,Math.random()<.4?0xf6eee2:GZ.mode===1?0xbfe6ff:0x6b2a12,2.6,.35,10);if(GZ.mode!==1&&dr.mine&&(++land)%2===0&&Math.random()<.6)addPuddle(dr.p.x,g,dr.p.z,.42,7);continue}
  if(inBox(dr.p)||dr.p.y<-30){dr.dead=true;puff(op,4,GZ.mode===1?0xbfe6ff:0x6b2a12,2.5,.3,10);continue}
  if(Math.random()<dt*6)puff(dr.p,1,Math.random()<.5?0xf6eee2:GZ.mode===1?0x9fd8ff:0x8a3a14,1.2,.35,9)}
 // лента: соседние живые капли одной струи
 const L=D.filter(d=>!d.dead).sort((a,b)=>a.seq-b.seq),pos=SODA.mesh.geometry.attributes.position,uv=SODA.mesh.geometry.attributes.uv,aa=SODA.mesh.geometry.attributes.aA,cam=camera.position;let n=0;
 const quad=(a,b,wa,wb,ua,ub,fa,fb)=>{if(n>=SODA.N)return;_sc.subVectors(b,a);const mid=_sb.addVectors(a,b).multiplyScalar(.5).sub(cam);const side=_sv.crossVectors(_sc,mid).normalize();
  const P4=[[a,wa,0],[b,wb,0],[b,wb,1],[a,wa,0],[b,wb,1],[a,wa,1]];for(let k=0;k<6;k++){const [pt,w,v]=P4[k],i=n*6+k,sg=v?1:-1;pos.setXYZ(i,pt.x+side.x*w*sg,pt.y+side.y*w*sg,pt.z+side.z*w*sg);uv.setXY(i,pt===a?ua:ub,v);aa.setX(i,pt===a?fa:fb)}n++};
 const W=d=>.06+Math.min(.16,d.t*.2),F=d=>Math.pow(Math.max(0,1-d.t/d.life),.6);
 const last={};for(const b of L){const a=last[b.sid];last[b.sid]=b;if(!a||b.seq-a.seq>8||a.p.distanceTo(b.p)>6.5)continue;quad(a.p,b.p,W(a),W(b),a.seq*.15,b.seq*.15,F(a),F(b))}
 // от дула до самой свежей капли, пока стреляем
 if(T-SODA.lastT<.12&&L.length&&state==='play'){let nw=null;for(let i=L.length-1;i>=0;i--)if(L[i].sid===SODA.msid){nw=L[i];break}if(nw&&nw.t<.15){quad(muzzle(),nw.p,.035,W(nw)*.9,nw.seq*.15+.3,nw.seq*.15,.9,F(nw))}}
 SODA.mesh.geometry.setDrawRange(0,n*6);pos.needsUpdate=true;uv.needsUpdate=true;aa.needsUpdate=true;SODA.mesh.material.uniforms.uT.value=T;
 if(D.length>40&&D[0].dead)SODA.d=D.filter(d=>!d.dead)}
/* ---------- обжитость уровня 3: поручни, имя яхты, мачта с радаром, трубы, чайки, острова, буи, мелочи на палубе ---------- */
function txtPlane(txt,w,h,font,fg,glow){const c=document.createElement('canvas');c.width=1024;c.height=Math.round(1024*h/w);const g=c.getContext('2d');g.font=font;g.textAlign='center';g.textBaseline='middle';if(glow){g.shadowColor=glow;g.shadowBlur=18}g.fillStyle=fg;g.fillText(txt,c.width/2,c.height/2);
 const t=new THREE.CanvasTexture(c);t.anisotropy=8;return new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:t,transparent:true,depthWrite:false}))}
function dressL3(b){const M=(c,o)=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.6},o||{}));
 // имя яхты на бортах
 for(const s of[-1,1]){const t=txtPlane('ПЕННАЯ ЛЕДИ',11,1.5,'italic 900 150px "Russo One",Arial','#d8b05a','rgba(0,0,0,.4)');t.position.set(s*13.07,-1.55,14);t.rotation.y=s*Math.PI/2;mapGroup.add(t);
  const t2=txtPlane('☆ ГАЗ-ЯХТ-КЛУБ ☆',7,.8,'700 110px "Russo One",Arial','#f6eee2');t2.position.set(s*13.07,-2.5,14);t2.rotation.y=s*Math.PI/2;mapGroup.add(t2)}
 // мачта с радаром и трубы на верхней палубе
 deco(new THREE.CylinderGeometry(.14,.2,6,10),b.white,0,13.1,12);deco(new THREE.BoxGeometry(2.2,.12,.12),b.chrome,0,14.4,12);deco(new THREE.SphereGeometry(.55,16,12),b.white,0,16.4,12);
 const rad=new THREE.Group();rad.position.set(0,15.3,12);mapGroup.add(rad);{const bar=new THREE.Mesh(new THREE.BoxGeometry(3.2,.22,.28),M(0x22252a,{metalness:.6}));bar.position.y=.15;rad.add(bar);rad.add(new THREE.Mesh(new THREE.CylinderGeometry(.12,.12,.3,8),b.chrome))}
 rad.userData.dyn=1;const lamp=deco(new THREE.SphereGeometry(.12,8,6),new THREE.MeshBasicMaterial({color:0xff3040}),0,17.05,12);lamp.userData.dyn=1;
 const funnels=[];for(const s of[-1,1]){const f=deco(new THREE.CylinderGeometry(.95,1.15,3.4,20),b.white,s*4.6,11.8,9.5);f.rotation.x=-.18;deco(new THREE.CylinderGeometry(.97,.97,.5,20),M(0x1f3a6e),s*4.6,13.2,9.2).rotation.x=-.18;deco(new THREE.CylinderGeometry(.98,.98,.22,20),b.gold,s*4.6,12.8,9.3).rotation.x=-.18;funnels.push(new V3(s*4.6,13.6,9.1))}
 // гирлянда флажков от мачты к носу и корме
 const flagC=[0xff3fa4,0xf2b84b,0x5fe0c8,0xfff0e0,0xe04040];for(const [a,c] of[[new V3(0,16,12),new V3(0,1.7,56.5)],[new V3(0,16,12),new V3(-11.5,2.2,-40)],[new V3(0,16,12),new V3(11.5,2.2,-40)]]){
  const n=Math.floor(a.distanceTo(c)/.9),im=new THREE.InstancedMesh(new THREE.ConeGeometry(.22,.5,3).rotateX(Math.PI),new THREE.MeshStandardMaterial({roughness:.7,side:THREE.DoubleSide}),n),o=new THREE.Object3D();
  for(let i=0;i<n;i++){const k=(i+.5)/n;o.position.lerpVectors(a,c,k);o.position.y-=Math.sin(k*Math.PI)*1.6+.25;o.rotation.set(0,i*.7,0);o.updateMatrix();im.setMatrixAt(i,o.matrix);im.setColorAt(i,new THREE.Color(flagC[i%5]))}mapGroup.add(im);
  const ln=[];for(let i=0;i<=16;i++){const k=i/16,q=new V3().lerpVectors(a,c,k);q.y-=Math.sin(k*Math.PI)*1.6;ln.push(q)}const l=new THREE.Line(new THREE.BufferGeometry().setFromPoints(ln),new THREE.LineBasicMaterial({color:0x333333}));mapGroup.add(l)}
 // кнехты, бухты каната, зонтики, столики с коктейлями, растения
 const rope=M(0xc9a26a,{roughness:.9}),iron=M(0x2a2d33,{metalness:.5,roughness:.4});
 for(const [x,z] of[[12,-12],[-12,-22],[12,-38],[-12,-62],[12,-89],[-12,-90],[4.6,45],[-4.6,45]]){deco(new THREE.CylinderGeometry(.2,.26,.55,10),iron,x,.27,z);solid(x,0,z,.56,.62,.56);deco(new THREE.CylinderGeometry(.28,.28,.08,10),iron,x,.58,z);const t=deco(new THREE.TorusGeometry(.42,.11,6,18),rope,x+(x>0?-.9:.9),.12,z+(z>40?-.9:.6));t.rotation.x=Math.PI/2}
 const umC=[0xff3fa4,0x5fe0c8,0xf2b84b,0xf0641e];[[-9.5,-8],[9.5,-30],[-5.2,40],[5.2,40]].forEach(([x,z],i)=>{deco(new THREE.CylinderGeometry(.05,.05,2.6,8),b.chrome,x,1.3,z);solid(x,0,z,.2,2.6,.2);const u=deco(new THREE.ConeGeometry(2.1,.7,12,1,true),M(umC[i],{side:THREE.DoubleSide}),x,2.75,z);u.userData.dyn=1});
 const glassM=new THREE.MeshPhysicalMaterial?new THREE.MeshPhysicalMaterial({color:0xffffff,transparent:true,opacity:.35,roughness:.05}):M(0xffffff,{transparent:true,opacity:.35}),cockM=M(0xff8a3a,{emissive:0x501800});
 for(const [x,z] of[[-8.6,-6],[8.6,-28],[-5.6,37.4],[5.6,37.4],[-10.4,-60.5]]){deco(new THREE.CylinderGeometry(.42,.42,.05,14),b.white,x,.62,z);solid(x,0,z,.8,.66,.8);deco(new THREE.CylinderGeometry(.04,.04,.6,6),b.chrome,x,.31,z);for(const d of[-.15,.15]){deco(new THREE.CylinderGeometry(.06,.035,.18,8),glassM,x+d,.74,z);deco(new THREE.CylinderGeometry(.05,.03,.1,8),cockM,x+d,.71,z)}}
 const pot=M(0xd8c8b0,{roughness:.8}),leaf=M(0x2f8a3a,{roughness:.7});for(const [x,z] of[[-12.2,0],[12.2,0],[-12.2,-43],[12.2,-43],[-6,30],[6,30]]){deco(new THREE.CylinderGeometry(.45,.35,.7,12),pot,x,.35,z);solid(x,0,z,.9,1.4,.9);for(let i=0;i<6;i++){const l=deco(new THREE.ConeGeometry(.12,1.2,4),leaf,x+Math.sin(i)*.15,1.1,z+Math.cos(i)*.15);l.rotation.set(Math.cos(i*1.3)*.5,0,Math.sin(i*1.3)*.5)}}
 // диджей-пульт с колонками и диско-шаром у бара на корме
 addBoxW(10.6,0,-61,2.6,1.1,1.2,M(0x1a1a20,{metalness:.3}),2);decoW(10.6,1.12,-61,2.4,.05,1,M(0x2d2f36,{emissive:0x101830}));for(const s of[-1,1]){deco(new THREE.CylinderGeometry(.36,.36,.06,18),M(0x111111),10.6+s*.6,1.16,-61);decoW(10.6+s*1.75,0,-61,.8,1.9,.8,M(0x15151a),1);solid(10.6+s*1.75,0,-61,.8,1.9,.8);deco(new THREE.CylinderGeometry(.28,.28,.05,16),M(0x333333),10.6+s*1.75,1.35,-60.58).rotation.x=Math.PI/2}
 const disco=deco(new THREE.IcosahedronGeometry(.45,2),M(0xdddddd,{metalness:1,roughness:.12,envMap:ENV,flatShading:true}),10.6,3.6,-61);disco.userData.dyn=1;deco(new THREE.CylinderGeometry(.015,.015,1.3,4),b.chrome,10.6,4.45,-61);
 // чайки
 const gullM=M(0xfafafa,{side:THREE.DoubleSide,roughness:.8}),gulls=[];for(let i=0;i<8;i++){const g=new THREE.Group(),wg=new THREE.BufferGeometry();wg.setAttribute('position',new THREE.Float32BufferAttribute([0,0,-.25,0,0,.25,1.1,.1,0],3));wg.computeVertexNormals();
  const L=new THREE.Mesh(wg,gullM),R=new THREE.Mesh(wg,gullM);R.scale.x=-1;g.add(L,R);const bd=new THREE.Mesh(new THREE.ConeGeometry(.12,.8,6).rotateX(Math.PI/2),gullM);g.add(bd);g.userData={L,R,r:rnd(18,40),h:rnd(14,26),sp:rnd(.15,.3)*(Math.random()<.5?1:-1),ph:Math.random()*6,cz:rnd(-60,30)};g.userData.dyn=1;mapGroup.add(g);gulls.push(g)}
 // острова, маяк, корабли на горизонте, плавучие бутылки-буи и надувные игрушки
 const sand=M(0xe8d39a,{roughness:.95}),hill=M(0x6f8a3c,{roughness:.9}),rock=M(0x7a6a5a,{roughness:.9});
 for(const [x,z,r] of[[-190,-60,34],[210,40,40],[-160,170,26],[150,-210,30]]){deco(new THREE.CylinderGeometry(r*1.15,r*1.3,2,32),sand,x,SEA_Y-.4,z);const h=deco(new THREE.ConeGeometry(r,r*.55,24),hill,x,SEA_Y+r*.27,z);h.scale.z=.8;
  deco(new THREE.DodecahedronGeometry(r*.18,0),rock,x+r*.6,SEA_Y+1,z+r*.2);for(let i=0;i<5;i++){const a=i*1.3,px=x+Math.cos(a)*r*.75,pz=z+Math.sin(a)*r*.6;deco(new THREE.CylinderGeometry(.5,.8,10,6),M(0x8a6a40),px,SEA_Y+5,pz);deco(new THREE.ConeGeometry(4,3,7),M(0x3f8f3a),px,SEA_Y+10.5,pz)}}
 {const x=-190,z=-60;for(let i=0;i<6;i++)deco(new THREE.CylinderGeometry(2.1-i*.12,2.2-i*.12,3,16),M(i%2?0xffffff:0xd03030),x+12,SEA_Y+12+i*3,z);deco(new THREE.CylinderGeometry(1.5,1.5,2,12),M(0xfff4c0,{emissive:0xffe080,emissiveIntensity:.8}),x+12,SEA_Y+31,z);
  const beam=deco(new THREE.ConeGeometry(2.2,40,12,1,true).translate(0,20,0).rotateZ(Math.PI/2),new THREE.MeshBasicMaterial({color:0xfff0b0,transparent:true,opacity:.12,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide}),x+12,SEA_Y+31,z);beam.userData.dyn=1;L3.beam=beam}
 const ships=[];for(const [x,z,ry] of[[120,-120,.4],[-120,110,-2.4]]){const g=new THREE.Group();g.position.set(x,SEA_Y,z);g.rotation.y=ry;const hm=new THREE.Mesh(new THREE.BoxGeometry(7,3,26),M(0x34404e));hm.position.y=.5;g.add(hm);const sm=new THREE.Mesh(new THREE.BoxGeometry(5,4,7),M(0xe8e4dc));sm.position.set(0,4,-6);g.add(sm);
  const st=new THREE.Mesh(new THREE.CylinderGeometry(.9,1,3,10),M(0xc03030));st.position.set(0,7,-6);g.add(st);g.userData.dyn=1;mapGroup.add(g);ships.push(g)}
 const bottleM=new THREE.MeshPhysicalMaterial?new THREE.MeshPhysicalMaterial({color:0x2f7a3a,roughness:.1,transparent:true,opacity:.85}):M(0x2f7a3a),capM=M(0xd8b05a,{metalness:.8,roughness:.3}),floats=[];
 for(const [x,z] of[[-34,-20],[36,-48],[-40,30],[42,20],[-30,-80],[30,-100]]){const g=new THREE.Group();const bt=new THREE.Mesh(latheG([[.0,-1.6],[.9,-1.6],[1,-1.4],[1,.6],[.45,1.3],[.32,2.2],[.36,2.5],[0,2.55]],16),bottleM);g.add(bt);const c=new THREE.Mesh(new THREE.CylinderGeometry(.4,.4,.25,12),capM);c.position.y=2.55;g.add(c);g.userData.k='b';floats.push({g,x,z});mapGroup.add(g)}
 const toyM=[M(0xff6fb0),M(0xfff07a)];for(const [x,z,k] of[[18,-30,0],[-17,6,1],[17,-70,1]]){const g=new THREE.Group();if(k){const d=new THREE.Mesh(new THREE.TorusGeometry(.9,.38,10,24),toyM[1]);d.rotation.x=Math.PI/2;g.add(d)}else{const d=new THREE.Mesh(new THREE.TorusGeometry(.9,.38,10,24),toyM[0]);d.rotation.x=Math.PI/2;g.add(d);const n=new THREE.Mesh(new THREE.CylinderGeometry(.18,.22,1.6,8),toyM[0]);n.position.set(0,.8,.7);n.rotation.x=-.3;g.add(n);const h=new THREE.Mesh(new THREE.SphereGeometry(.3,10,8),toyM[0]);h.position.set(0,1.6,.95);g.add(h)}
  floats.push({g,x,z});mapGroup.add(g)}
 for(const f of floats)f.g.userData.dyn=1;
 mapAnims.push(dt=>{const t=lvT;rad.rotation.y+=dt*1.6;lamp.material.color.setHex(Math.sin(t*4)>0?0xff3040:0x401010);disco.rotation.y+=dt*.9;
  if(Math.random()<dt*5)for(const f of funnels)puff(f.clone().add(new V3(rnd(-.4,.4),0,rnd(-.4,.4))),1,0xfff4e0,1.2,2.2,-2.5);
  for(const g of gulls){const u=g.userData,a=t*u.sp+u.ph;g.position.set(Math.cos(a)*u.r,u.h+Math.sin(t*.7+u.ph)*1.5,u.cz+Math.sin(a)*u.r*.8);g.rotation.y=-a+(u.sp>0?0:Math.PI);const fl=Math.sin(t*9+u.ph)*.5;u.L.rotation.z=fl;u.R.rotation.z=-fl}
  for(const f of floats){const y=seaH(f.x,f.z,t);f.g.position.set(f.x,y-(f.g.userData.k==='b'?.6:.1),f.z);f.g.rotation.set(Math.sin(t*1.1+f.x)*.18,t*.1,Math.cos(t*.9+f.z)*.18)}
  for(const s of ships)s.position.y=SEA_Y+Math.sin(t*.4+s.position.x)*.3;if(L3.beam)L3.beam.rotation.y+=dt*.5})}
/*BEER-WORLD-END*/
