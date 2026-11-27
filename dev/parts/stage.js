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
const MOON_POS=new V3(-6,18,-62);
const moonG=new THREE.Group();moonG.position.copy(MOON_POS);moonG.lookAt(0,1.5,4);menuScene.add(moonG);
const glowTex=(stops)=>{const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d'),r=g.createRadialGradient(128,128,0,128,128,128);stops.forEach(([o,s])=>r.addColorStop(o,s));g.fillStyle=r;g.fillRect(0,0,256,256);const t=new THREE.CanvasTexture(c);t.minFilter=THREE.LinearFilter;return t};
const moonHalo=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex([[0,'rgba(255,244,214,1)'],[.28,'rgba(255,236,200,.9)'],[.36,'rgba(190,220,255,.42)'],[.6,'rgba(90,150,255,.12)'],[1,'rgba(40,80,200,0)']]),blending:THREE.AdditiveBlending,depthWrite:false,fog:false}));
moonHalo.scale.setScalar(52);moonG.add(moonHalo);
const moonDisk=new THREE.Mesh(new THREE.CircleGeometry(8,64),new THREE.MeshBasicMaterial({color:0xfff3d6,fog:false}));moonDisk.position.z=-.3;moonG.add(moonDisk);
const moonCap=new THREE.Mesh(crownGeo(7.25,21),new THREE.MeshStandardMaterial({color:0x3a0a10,metalness:.65,roughness:.32,emissive:0x0c0206,envMap:ENV,envMapIntensity:.7,fog:false,side:THREE.DoubleSide}));
moonCap.rotation.x=Math.PI/2;moonCap.position.z=.6;moonG.add(moonCap);
// облака проплывают мимо луны
const cloudTex=(()=>{const c=document.createElement('canvas');c.width=512;c.height=128;const g=c.getContext('2d');for(let i=0;i<46;i++){const x=40+Math.random()*432,y=64+(Math.random()-.5)*36,r=18+Math.random()*34,gr=g.createRadialGradient(x,y,0,x,y,r);
 gr.addColorStop(0,'rgba(20,40,96,.55)');gr.addColorStop(1,'rgba(20,40,96,0)');g.fillStyle=gr;g.fillRect(x-r,y-r,r*2,r*2)}const t=new THREE.CanvasTexture(c);t.minFilter=THREE.LinearFilter;return t})();
const clouds=[[-40,24,-55,46,.8],[10,13,-50,60,.55],[-70,30,-70,70,.5]].map(([x,y,z,w,o])=>{const s=new THREE.Sprite(new THREE.SpriteMaterial({map:cloudTex,transparent:true,opacity:o,depthWrite:false,fog:false}));s.position.set(x,y,z);s.scale.set(w,w/4,1);menuScene.add(s);return{s,x0:x,sp:.6+Math.random()*.6}});
// силуэт завода на горизонте с мигающими огнями на трубах
const skyline=new THREE.Group();menuScene.add(skyline);const slM=new THREE.MeshBasicMaterial({color:0x040a1c});const blinks=[];
for(let i=0;i<26;i++){const w=4+Math.random()*9,h=4+Math.random()*16,x=-130+i*10+Math.random()*4,z=-105-Math.random()*20;const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,6),slM);b.position.set(x,h/2-.5,z);skyline.add(b);
 if(Math.random()<.45){const ch=new THREE.Mesh(new THREE.CylinderGeometry(.9,1.3,h+10+Math.random()*12,8),slM);ch.position.set(x+w*.3,(h+10)/2,z+1);skyline.add(ch);
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
const floaters=[[-9,-9,.8,.9],[8,-16,1.1,-.7],[-15,-30,1.4,.4],[15,-11,.75,2.1],[4,-40,1.6,-1.2],[-24,-20,1.2,.2],[22,-32,1.5,1.4]].map(([x,z,s,r])=>{const g=new THREE.Group(),m=new THREE.Mesh(botGeo,botMat),c=new THREE.Mesh(crownGeo(.13,13),capMat);c.position.y=2.4;g.add(m,c);g.position.set(x,0,z);g.scale.setScalar(s);g.rotation.set(1.25+Math.random()*.25,r,0);menuScene.add(g);return{g,ph:Math.random()*6,s}});
// свет: лунный контровой, холодный ключевой, красный и циановый акценты
menuScene.add(new THREE.HemisphereLight(0x3a62d8,0x04060c,.6));
const stMoon=new THREE.DirectionalLight(0xbfd8ff,1.7);stMoon.position.copy(MOON_POS);menuScene.add(stMoon);
const stKey=new THREE.DirectionalLight(0xe2ecff,.95);stKey.position.set(5,6,8);menuScene.add(stKey);
const stRed=new THREE.PointLight(0xff2d4d,1.8,9,2);stRed.position.set(-2.3,.55,1.7);menuScene.add(stRed);
const stCyan=new THREE.PointLight(0x62e3ff,1.3,10,2);stCyan.position.set(2.7,2.5,-1.4);menuScene.add(stCyan);
function stageTick(dt){STG.t+=dt;const t=STG.t;skyStage.material.uniforms.uT.value=t;if(sea&&sea.material.uniforms&&sea.material.uniforms.uT)sea.material.uniforms.uT.value=t;
 moonCap.rotation.y+=dt*.025;moonHalo.material.rotation=Math.sin(t*.1)*.05;
 ripples.forEach((m,i)=>{const ph=(t*.32+i/3)%1;m.scale.setScalar(.35+ph*2.6);m.material.opacity=.32*(1-ph)*Math.min(1,ph*6)});
 for(let i=0;i<BBN;i++){bbP[i*3+1]+=dt*bbS[i]*.9;bbP[i*3]+=Math.sin(t*1.7+i)*dt*.12;if(bbP[i*3+1]>13){bbP[i*3+1]=0;bbP[i*3]=rnd(-16,16);bbP[i*3+2]=rnd(-42,5)}}bbG.attributes.position.needsUpdate=true;
 floaters.forEach(f=>{f.g.position.y=-.32*f.s+Math.sin(t*.8+f.ph)*.07;f.g.rotation.z=Math.sin(t*.5+f.ph)*.08});
 clouds.forEach(c=>{c.s.position.x+=dt*c.sp;if(c.s.position.x>60)c.s.position.x=-90});
 blinks.forEach(b=>b.l.visible=Math.sin(t*2.2+b.ph)>.2)}
