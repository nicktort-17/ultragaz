/* ================= УРОВЕНЬ 4: ОСТРОВ ПЕПСШТЕЙНА — летний полдень, сборка ================= */
let L4=null;
function isleSky(sun){const sky=new THREE.Mesh(new THREE.SphereGeometry(300,32,16),new THREE.ShaderMaterial({uniforms:{uSun:{value:sun},uT:{value:0}},side:THREE.BackSide,depthWrite:false,
  vertexShader:'varying vec3 vD;void main(){vD=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);gl_Position.z=gl_Position.w*.9999;}',
  fragmentShader:`uniform vec3 uSun;uniform float uT;varying vec3 vD;float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
   float fb(vec2 p){float s=0.,a=.5;for(int i=0;i<6;i++){s+=n(p)*a;p*=2.03;a*=.5;}return s;}
   void main(){vec3 d=normalize(vD);float el=max(d.y,0.);vec3 c=mix(vec3(.72,.86,.98),vec3(.2,.48,.9),pow(el,.5));float sd=max(dot(d,normalize(uSun)),0.);c+=vec3(1.,.95,.82)*pow(sd,500.)*4.+vec3(1.,.92,.75)*pow(sd,10.)*.22;
    if(d.y>0.){vec2 uv=d.xz/(d.y+.1)*1.3+vec2(uT*.006,uT*.002);float f=fb(uv);float cl=smoothstep(.52,.75,f);float sh=smoothstep(.55,.9,fb(uv+vec2(.03,.05)));
     vec3 cc=mix(vec3(1.),vec3(.78,.83,.9),sh*.6);c=mix(c,cc,cl*.9*smoothstep(0.,.12,d.y));}
    c=mix(c,vec3(.82,.92,.99),smoothstep(.14,-.02,d.y));gl_FragColor=vec4(c,1.);}`}));sky.renderOrder=-10;sky.frustumCulled=false;sky.userData.dyn=1;mapGroup.add(sky);return sky}
/* ---------- растительность и камни: расстановка ---------- */
function plantIsland(){const VM=vegMats(),st=L4.terrW;let sd=5;const r=()=>(sd=(sd*16807)%2147483647)/2147483647;
 const H=tY,dep=(x,z)=>H(x,z)-SEA4_Y;const slope=(x,z)=>{const e=.8;return Math.hypot(H(x+e,z)-H(x-e,z),H(x,z+e)-H(x,z-e))/(2*e)};
 // зоны, куда нельзя сажать (постройки, тропы, двери, арены-центры)
 const NO=[[-3.6,3.6,-12,44],[-6,6,-52,-42],[ -8,8,-110,-94],[14,27,-3,14],[-25,-15,18,27],[-12,-3,24,32],[-28,-24,26,34],[-20,-8,4,16],[24,32,18,32],
  [-34,34,-102,-50.5],[-28,28,-158,-103],[-19,-15,-23,-19],[-3,3,-30,-25]];
 const free=(x,z,pad=0)=>{for(const [a,b,c,d] of NO)if(x>a-pad&&x<b+pad&&z>c-pad&&z<d+pad)return false;return true};
 const lists={palm:[[],[],[]],tree:[[],[]],banana:[],fern:[],monstera:[],bush:[],hib:[],bou:[],grass:[],dune:[],rock:[[],[],[],[]]};
 const addPalm=(x,z,toward,sc=1)=>{const v=Math.floor(r()*3),y=H(x,z)-.1;lists.palm[v].push([x,y,z,toward!=null?toward+(r()-.5)*.9:r()*6.28,(.85+r()*.3)*sc]);if(y>SEA4_Y)solid(x,y,z,.5,8,.5)};
 // пальмы: кромка пляжа и у хребта наклонены к морю
 for(const [x,z] of scatter(-31,31,1,17,4.2,22,(x,z)=>free(x,z,1)&&dep(x,z)>.6,3))addPalm(x,z,-Math.PI/2+Math.atan2(-x*.02,1));
 for(const [x,z] of scatter(-48,48,-4,30,6,26,(x,z)=>Math.abs(x)>30&&dep(x,z)>.5&&slope(x,z)<.7,4))addPalm(x,z,-Math.PI/2+Math.sign(x)*-.5);
 for(const [x,z] of[[-22,-56],[22,-58],[-30,-66],[30,-72],[-30,-96],[30,-98],[13,-64],[-2,-86],[18,-100],[-16,-100]])addPalm(x,z,r()*6.28,1.1);
 for(const [x,z] of[[-25,-111],[25,-111],[-25,-154],[25,-154],[-19,-156],[19,-156],[-25,-130],[25,-130]])addPalm(x,z,r()*6.28,1.05);
 // склоны острова: густой лес (пальмы, деревья, кусты, папоротники)
 for(const [x,z] of scatter(-58,58,-190,0,5.5,320,(x,z)=>{const h=H(x,z);return free(x,z,3)&&h>SEA4_Y+1&&slope(x,z)<1.1&&!(Math.abs(x)<16&&z<-6&&z>-47)},5)){const k=r();if(k<.45)addPalm(x,z,r()*6.28);else{const v=Math.floor(r()*2),y=H(x,z)-.2,sc=.8+r()*.4;lists.tree[v].push([x,y,z,r()*6.28,sc]);solid(x,y,z,1.1*sc,12*sc,1.1*sc)}}
 // джунгли: деревья по краям долины, банан, монстера, папоротники
 for(const [x,z,s] of[[-13,-11,1],[12.5,-18,1.1],[-12.8,-31,1.2],[13,-40,1],[-6,-43.5,.9],[10,-9.5,.9],[-13.5,-44,1.1],[4.5,-33,.8]]){const v=Math.floor(r()*2),y=H(x,z)-.2;lists.tree[v].push([x,y,z,r()*6.28,s]);solid(x,y,z,1.3,10,1.3)}
 for(const [x,z] of scatter(-15,15,-46,-8,4.5,14,(x,z)=>free(x,z,.5)&&Math.abs(x-jPath(z))>2.4&&creekD(x,z)>2.2,6)){lists.banana.push([x,H(x,z),z,r()*6.28,.5+r()*.25]);solid(x,H(x,z),z,.3,1.2,.3)}
 for(const [x,z] of scatter(-16,16,-47,-7,2.2,90,(x,z)=>free(x,z,0)&&Math.abs(x-jPath(z))>2.2&&creekD(x,z)>1.6&&(Math.abs(x)>8||r()<.35),7))lists.fern.push([x,H(x,z),z,r()*6.28,.55+r()*.35]);
 for(const [x,z] of scatter(-16,16,-47,-7,3.2,26,(x,z)=>free(x,z,0)&&Math.abs(x-jPath(z))>2.4&&creekD(x,z)>1.6&&Math.abs(x)>6,8))lists.monstera.push([x,H(x,z),z,r()*6.28,.6+r()*.3]);
 for(const [x,z] of scatter(-58,58,-180,0,3.4,300,(x,z)=>{const h=H(x,z);return free(x,z,2)&&h>SEA4_Y+1.2&&slope(x,z)<1.3&&!(Math.abs(x)<15&&z<-8&&z>-46)},9))(r()<.6?lists.fern:lists.bush).push([x,H(x,z),z,r()*6.28,.9+r()*.7]);
 for(const [x,z] of scatter(-16,16,-47,-7,4,16,(x,z)=>free(x,z,0)&&Math.abs(x-jPath(z))>2.2&&creekD(x,z)>2&&Math.abs(x)>9,10))lists.bush.push([x,H(x,z),z,r()*6.28,.6+r()*.3]);
 // пляж: кусты у кромки леса, трава на дюнах
 for(const [x,z] of scatter(-31,31,0,9,2.6,40,(x,z)=>free(x,z,.5),11))lists.hib.push([x,H(x,z),z,r()*6.28,.8+r()*.5]);
 for(const [x,z] of scatter(-34,34,0,22,1.5,320,(x,z)=>free(x,z,0)&&dep(x,z)>1.1,12))lists.dune.push([x,H(x,z),z,r()*6.28,.7+r()*.6]);
 // вилла и храм: цветущие кусты вдоль ограды, трава по газону
 for(let x=-32;x<=32;x+=2.4)if(Math.abs(x)>4)lists.bou.push([x,4,-52.1,r()*6.28,1+r()*.3]);
 for(const [x,z] of[[-30,-80],[-30,-86],[30,-60],[30,-66],[-10,-56],[10,-96],[-26,-112],[26,-112],[-26,-150],[26,-150],[-10,-152],[10,-152]])lists.hib.push([x,H(x,z),z,r()*6.28,1.2]);
 for(const [x,z] of scatter(-33,33,-101,-52,1.2,520,(x,z)=>!(x>-30&&x<-12&&z<-64&&z>-88)&&!(x>-1&&x<27&&z<-68&&z>-86)&&!(Math.abs(x)<3&&z>-68)&&!(x>15&&z<-85),13))lists.grass.push([x,4,z,r()*6.28,.6+r()*.5]);
 for(const [x,z] of scatter(-27,27,-157,-104,1.4,300,(x,z)=>(Math.abs(x)>20.5||z<-139||z>-109)&&!(Math.abs(x)<9&&z<-138),14))lists.grass.push([x,9,z,r()*6.28,.6+r()*.5]);
 // камни: мысы, кромка воды, джунгли, ущелье
 const rk=(x,z,s,col)=>{const v=Math.floor(r()*4),y=H(x,z);lists.rock[v].push([x,y-s*.25,z,r()*6.28,s,(r()-.5)*.4,(r()-.5)*.4,1])};
 for(const [x,z] of scatter(-52,52,-6,40,3.5,40,(x,z)=>Math.abs(x)>28&&dep(x,z)>-2.5,15))rk(x,z,1+r()*2.2,true);
 for(const [x,z] of scatter(-40,40,30,46,5,14,(x,z)=>Math.abs(x)>8&&dep(x,z)<.4&&dep(x,z)>-2,16))rk(x,z,.8+r()*1.4,true);
 for(const [x,z] of scatter(-15,15,-46,-8,4.5,12,(x,z)=>free(x,z,1)&&Math.abs(x-jPath(z))>2.5&&creekD(x,z)>1.2,17))rk(x,z,.6+r()*.9,true);
 for(const [x,z] of[[-5.5,-3],[5.5,-3],[-5,-7],[5.2,-6.5],[-18,-21.5],[-17.6,-18.5],[-16.5,-24]])rk(x,z,1.6+r(),false);
 for(const [x,z] of scatter(-58,58,-190,-4,7,80,(x,z)=>slope(x,z)>.6&&free(x,z,3),18))rk(x,z,1.5+r()*2.5,false);
 for(const [x,z] of scatter(-58,58,-195,-100,8,30,(x,z)=>dep(x,z)<.6&&dep(x,z)>-1.5,19))rk(x,z,1.5+r()*2,false);
 // ---- создание инстанс-мешей ----
 for(let v=0;v<3;v++){if(!lists.palm[v].length)continue;const G=palmGeo([7.5,9.5,11.5][v],[1.2,2,2.8][v],31+v*7);vegInst(G.trunk,VM.bark,lists.palm[v]);vegInst(G.fronds,VM.frond,lists.palm[v]);vegInst(G.dead,VM.dead,lists.palm[v]);vegInst(G.nuts,VM.nut,lists.palm[v])}
 for(let v=0;v<2;v++){if(!lists.tree[v].length)continue;const G=treeGeo(101+v*13);vegInst(G.trunk,VM.tbark,lists.tree[v]);vegInst(G.canopy,VM.canopy,lists.tree[v])}
 vegInst(bananaGeo(),VM.banana,lists.banana);vegInst(fernGeo(1.3),VM.fern,lists.fern,false);vegInst(monsteraGeo(),VM.monstera,lists.monstera,false);
 vegInst(bushGeo(1.5),VM.bush,lists.bush);vegInst(bushGeo(1.3),VM.hibiscus,lists.hib);vegInst(bushGeo(1.2,10),VM.bougain,lists.bou);
 vegInst(grassGeo(.9,.55),VM.grass,lists.grass,false);vegInst(grassGeo(.9,.8),VM.dune,lists.dune,false);
 const rm=rockMat(),ob=new THREE.Object3D();for(let v=0;v<4;v++){const rg=rockGeo(71+v*19,4),px=rockGeo(71+v*19,1);px.scale(.94,.94,.94);vegInst(rg,rm,lists.rock[v]);
  for(const t of lists.rock[v]){if(t[1]<SEA4_Y-3)continue;ob.position.set(t[0],t[1],t[2]);ob.rotation.set(t[5]||0,t[3]||0,t[6]||0);ob.scale.set(t[4]*(t[7]||1),t[4],t[4]*(t[7]||1));ob.updateMatrix();rockCollide(rg,ob.matrix,px)}}
 // лианы со скал и деревьев джунглей
 const lm=leafMat(vegTextures().fern,.6);for(let i=0;i<24;i++){const s=i%2?1:-1,x=s*(13+r()*3),z=-9-r()*36,top=H(x,z)+r()*5+3;if(top<5)continue;const pts=[];for(let k=0;k<=6;k++){const t=k/6;pts.push(new V3(x-s*t*1.2+Math.sin(t*5+i)*.3,top-t*(top-1.2-r()*1.5),z+Math.cos(t*4+i)*.3))}
  const vine=deco(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),16,.04,5,false),new THREE.MeshStandardMaterial({color:0x2f5a24,roughness:.9}),0,0,0);vine.castShadow=true}
 return lists}
/* ---------- сборка уровня ---------- */
function buildL4(){L4={t:0,intro:{t:0},M:null,birds:[],flames:[],smokes:[],flags:[],boats:[]};L4.M=isleMats();const M=L4.M;
 scene.background=new THREE.Color(0xa8d6f6);scene.fog=new THREE.Fog(0xc2e4fa,90,330);mapB={x0:-80,x1:80,z0:-200,z1:170};
 const sun=new V3(.3,.88,-.36).normalize();L4.sun=sun;
 const hemi=new THREE.HemisphereLight(0xd2e8ff,0xb8a078,.5),dl=shadowLight(new THREE.DirectionalLight(0xfff2dc,.9),46,150);addLights([hemi,dl]);followSun(dl,sun.x*80,sun.y*80,sun.z*80);
 L4.sky=isleSky(sun);
 buildTerrain();
 // море
 const seaM=new THREE.ShaderMaterial({uniforms:{uT:{value:0},uSun:{value:sun},uFog:{value:new THREE.Color(0xc2e4fa)},uFn:{value:90},uFf:{value:330},uDep:{value:L4.depthTex},uTG:{value:new THREE.Vector4(TG.x0,TG.z0,(TG.nx-1)*TG.c,(TG.nz-1)*TG.c)}},
  vertexShader:SEA4_VS,fragmentShader:SEA4_FS,transparent:true,depthWrite:false,side:THREE.DoubleSide});
 const sea=new THREE.Mesh(new THREE.PlaneGeometry(700,700,280,280).rotateX(-Math.PI/2),seaM);sea.position.set(0,SEA4_Y,-20);sea.frustumCulled=false;sea.renderOrder=1;sea.userData.dyn=1;mapGroup.add(sea);L4.seaM=seaM;
 buildPier();
 // пляж
 tikiBar(21,7,-.25);cabana(-20,22.5,.3);cabana(-8.5,27.5,-.1);lifeguard(-26,29.5,.4);volleyball(-14,10);surfRack(28,22,-.6);kayak(29.5,29,.4,0xff6a3a);kayak(31.5,27.5,.6,0xf2c14b);firePit(4,11);sandcastle(10,30);cooler(-4,22,.3);cooler(15,24,-.5);
 for(let i=0;i<5;i++){lounger(-2+i*2.3,22,Math.PI,i);if(i%2===0)parasol(-1+i*2.3,24.2,i)}for(let i=0;i<4;i++){lounger(9+i*2.3,19,Math.PI,i+1);if(i%2)parasol(10+i*2.3,21.2,i)}strawUmbrella(-15,18);strawUmbrella(16,15);
 for(const [x,z] of[[-3.4,13],[3.4,13],[-3.4,4],[3.4,4],[-10,20],[12,12],[24,13],[-22,14]])torch(x,z);
 // дощатая дорожка от причала к воротам
 for(let z=26;z>1.6;z-=.9){const y=Math.max(tY(-1.2,z),tY(1.2,z));decoW(0,y-.02,z,2.4,.08,.75,M.plank,1).receiveShadow=true}
 jungleGate();isleGate(addDoor(0,1.25,-1,6,3.4,false,M.plank,'sink'),{posts:false,lt:1.25,pd:.9,lm:M.plank,lx:3.1,lz:.66,sill:4});
 buildJungleProps();
 buildVilla();isleGate(addDoor(0,4,-50.9,6,2.6,false,M.dwood,'slide'),{pw:.8,pd:.9,lt:.8,pm:M.stucco,cap:1,sign:'ВИЛЛА',sw:3,signBack:1});
 buildTemple();
 // невидимые стены по краям арен (через скалы не перелезть)
 // стены только на суше: к воде можно подойти и заплыть (глубина выносит обратно на берег)
 const land=(x,z0,z1)=>{let m=-99;for(let z=z0;z<=z1;z+=1)m=Math.max(m,tY(x,z));return m>SEA4_Y+.3};
 for(let z=-46;z<-6;z+=2)for(const s of[-1,1])solid(s*16.4,0,z,1.2,14,2);for(let x=-70;x<=70;x+=2)if(Math.abs(x)>3.6&&land(x,-7,-1))solid(x,-4,-4,2,16,6);
 for(let x=-70;x<=70;x+=2)if(Math.abs(x)>5.2&&land(x,-50,-48))solid(x,-4,-49,2,Math.abs(x)<36?8.1:16,2.4);for(let x=-70;x<=70;x+=2)if(Math.abs(x)>28&&land(x,-104,-102))solid(x,-4,-103,2,18,2);
 // края пляжной арены: гряды валунов (видимые, с коллизией) — из боя просто так не выйти
 {const rm=rockMat(),rg=rockGeo(233,3);for(const sx of[-1,1])for(let z=1;z<=27;z+=2.6){const x=sx*(35+Math.sin(z*1.7)*.8),y=tY(x,z),sc=1.5+Math.abs(Math.sin(z*2.3))*.7;const m=deco(rg,rm,x,y-.3,z,z*1.3);m.scale.set(sc*1.1,sc*1.3,sc);m.castShadow=m.receiveShadow=true;m.userData.dyn=1;solid(x,y-1,z,2.6,sc*1.1+1.4,2.8);m.updateMatrix();rockCollide(rg,m.matrix,rg)}}
 plantIsland();rockTerrain();buildSeaLife();buildLife();
 // машина Альтушки для заставки
 L4.car=buildMoneyCar();mapGroup.add(L4.car);L4.car.userData.dynamic=1;
 {const G=buildGirl(ALT_O);L4.car.userData.seat.add(G.g);G.g.position.set(0,-.93*1.3+.15,0);L4.girl=G}
 resetL4();
 mapAnims.push(dt=>{const t=lvT;if(typeof bloomPass!=='undefined'&&bloomPass){bloomPass.threshold=.975;bloomPass.strength=.3}seaM.uniforms.uT.value=t;L4.sky.material.uniforms.uT.value=t;L4.sky.position.copy(camera.position);WIND.uWT.value=t;if(L4.terrMat.userData.U)L4.terrMat.userData.U.uT.value=t;
  if(L4.rotor)L4.rotor.rotation.y+=dt*.5;if(L4.fall){L4.fall.t.offset.y=-t*1.6;}if(L4.fcur)L4.fcur.offset.y=-t*1.3;if(L4.creek)L4.creek.offset.y=-t*.5;
  for(const f of L4.flames){const k=1+Math.sin(t*17+f.ph)*.18+Math.sin(t*9.3+f.ph*2)*.1;f.f.scale.set(1/k,k,1/k)}
  for(const b of L4.boats){b.g.position.y=sea4H(b.x,b.z,t)-.15;b.g.rotation.set(Math.sin(t*1.3+b.x)*.04,b.ry,Math.sin(t*1.1+b.z)*.05)}
  if(L4.flamingo){L4.flamingo.position.x=8+3+Math.sin(t*.13)*4;L4.flamingo.position.z=-77+Math.cos(t*.11)*3;L4.flamingo.rotation.y=t*.1;L4.flamingo.position.y=5-.35+Math.sin(t*1.4)*.03}
  if(L4.pool){const p=L4.pool.geometry.attributes.position,b=L4.poolBase;for(let i=0;i<p.count;i++)p.setY(i,b[i*3+1]+Math.sin(t*1.6+b[i*3]*1.3)*.025+Math.cos(t*1.2+b[i*3+2]*1.1)*.02);p.needsUpdate=true}
  for(const f of L4.flags){if(f.cloth){const p=f.m.geometry.attributes.position,b=f.cloth;for(let i=0;i<p.count;i++){const x=b[i*3]+1.2;p.setZ(i,Math.sin(t*5-x*2.4)*.18*x/2.4)}p.needsUpdate=true}else f.m.rotation.y=Math.sin(t*3)*.4}
  for(const c of L4.curtains||[]){const p=c.geometry.attributes.position,b=c.userData.base;for(let i=0;i<p.count;i++){const y=b[i*3+1];p.setZ(i,Math.sin(t*1.7+b[i*3]*1.3)*.12*(1.2-y/2.4))}p.needsUpdate=true}
  if(L4.yacht){L4.yacht.position.y=SEA4_Y+Math.sin(t*.35)*.15;L4.yacht.rotation.z=Math.sin(t*.4)*.012}
  if(L4.speed){const s=L4.speed,a=t*.09;s.g.position.set(70+Math.cos(a)*45,sea4H(0,0,t)-.1,30+Math.sin(a)*35);s.g.rotation.y=-a+Math.PI;s.g.rotation.x=-.06;if(Math.random()<dt*25)puff(new V3(s.g.position.x-Math.sin(s.g.rotation.y)*-3.4,SEA4_Y+.1,s.g.position.z-Math.cos(s.g.rotation.y)*-3.4),2,0xffffff,2.5,.9,6)}
  if(state==='play'){for(const s of L4.smokes)if(Math.random()<dt*(s.f?8:5))puff(s.p.clone().add(new V3(rnd(-s.r,s.r)*.5,0,rnd(-s.r,s.r)*.5)),1,s.c,.8,2.4,-1.6);
   if(L4.mist&&Math.random()<dt*9)puff(L4.mist.p.clone().add(new V3(rnd(-1.2,1.2),0,rnd(-1.6,1.6))),1,0xf4fbff,1.2,1.1,-.8);
   if(L4.fountain&&Math.random()<dt*30){const a=rnd(0,6.28);puff(L4.fountain.p.clone().add(new V3(Math.cos(a)*.1,0,Math.sin(a)*.1)),1,0xe8f8ff,2.4,.9,9)}}
  updLife(dt,t)});
 plight(21,4,7,0xffc070,.45,14);
 for(let i=0;i<5;i++)addBeacon(i)}
/* ---------- заставка: Альтушка довозит героя и уплывает (каждый запуск уровня) ---------- */
function resetL4(){if(!L4||!L4.car)return;L4.intro={t:0};const car=L4.car;car.visible=true;car.position.set(4.9,SEA4_Y-.2,150);car.rotation.set(0,0,0);car.userData.v=30;
 if(L4.girl){girlPose(L4.girl,'ride',1);setFace(L4.girl,'smirk')}}
function updL4(dt){if(!L4)return;if(typeof updKmarks==='function')updKmarks(dt);const I=L4.intro,car=L4.car,G=L4.girl;if(!car)return;I.t+=dt;const t=I.t;const S=story;
 if(G)girlPose(G,t<4.4||t>6?'ride':'rideTaunt',dt,{wind:new V3(0,0,car.userData.v||0)});
 if(t<4.2){const k=Math.min(1,t/4.2),e=1-Math.pow(1-k,3),z=150-(150-101.5)*e;car.position.set(4.9,sea4H(4.9,z,lvT)-.25,z);car.rotation.set(Math.sin(lvT*2)*.03,0,Math.sin(lvT*1.6)*.03);car.userData.v=(1-k)*30;
  if(Math.random()<dt*40){car.userData.inner.localToWorld(_hgv.set(rnd(-1,1),.2,-2.6));puff(_hgv,3,0xffffff,4,.7,8)}
  if(P.alive&&state==='play'&&S&&S.room<0&&!I.hop){car.updateMatrixWorld(true);car.userData.inner.localToWorld(_hgv.set(-.45,.25,-.35));P.pos.copy(_hgv);P.vel.set(0,0,0);P.grounded=true}
  if(t>.6&&!I.s1){I.s1=1;say(G,'ПРИЕХАЛИ. ОСТРОВ ПЕПСШТЕЙНА!',2.6)}}
 else if(!I.hop){I.hop=1;if(P.alive&&state==='play'&&S&&S.room<0){P.pos.set(.4,.7,95);P.vel.set(-1.5,5,-3)}say(G,'ДАЛЬШЕ САМ, НЕУДАЧНИК! ЦМОК!',3);setFace(G,'wink');sfx('throw');banner('ОСТРОВ ПЕПСШТЕЙНА')}
 else if(t>5.2&&car.visible){const k=t-5.2;car.rotation.y=-Math.min(Math.PI*.95,k*.9);const sp=Math.min(26,k*7);car.userData.v=sp;const fx=-Math.sin(car.rotation.y),fz=-Math.cos(car.rotation.y);car.position.x+=fx*sp*dt;car.position.z+=fz*sp*dt;car.position.y=sea4H(car.position.x,car.position.z,lvT)-.25;
  if(Math.random()<dt*60){car.userData.inner.localToWorld(_hgv.set(rnd(-1,1),.2,-2.6));puff(_hgv,3,0xffffff,5,.8,8)}if(k>12)car.visible=false}
 // глубокая вода: подводный вид, выносит обратно на берег
 const deep=TERR&&TERR.h(P.pos.x,P.pos.z)<SEA4_Y-1.4&&!(Math.abs(P.pos.x)<2.8&&P.pos.z>27&&P.pos.z<100&&P.pos.y>-.5);
 if(P.alive&&state==='play'&&deep&&P.pos.y<SEA4_Y-.2){L4.wetT=(L4.wetT||0)+dt;P.vel.y+=(sea4H(P.pos.x,P.pos.z,lvT)-1.3-P.pos.y)*14*dt;P.vel.multiplyScalar(1-Math.min(1,dt*3));if(L4.wetT>2.5){L4.wetT=0;P.pos.copy(S.cp).setY(S.cp.y+.05);P.vel.set(0,0,0);banner('ВЫНЕСЛО НА БЕРЕГ')}}else L4.wetT=0}
function clearL4(){if(typeof bloomPass!=='undefined'&&bloomPass){bloomPass.threshold=.93;bloomPass.strength=.42}L4=null;TERR=null}
LEVELS.push({id:'l4',n:4,name:'ОСТРОВ ПЕПСШТЕЙНА',sub:'Частный остров магната синей газировки. Пляж, джунгли с водопадом, вилла с бассейном и полосатый храм на холме.',
 desc:'Альтушка высаживает тебя на причале. Пробейся через пляж, джунгли и виллу к храму с золотым куполом — там дремлет Пепсштейн, последний акционер.',boss:'Пепсштейн',diff:7,par:540,build:buildL4,start:[.4,.6,93],open:[0],exitTrig:[-3,3,-138.4,-135.6,9],
 rooms:[{name:'ПЛЯЖ',trig:[-28,28,3,34],bounds:[-34,34,-.6,38],cp:[0,.25,40],entry:0,exit:1,
   sp:[[-24,2,10],[24,2,16],[-18,2,26],[18,2,28],[0,2,30],[-8,2,8],[8,2,6],[-28,2,20],[28,2,26],[0,2,16]],waves:[{vend:4,can:3},{vend:3,can:3,drone:3},{golem:1,vend:3,keto:2}]},
  {name:'ДЖУНГЛИ',trig:[-14,14,-44,-9],bounds:[-15.5,15.5,-47.5,-6.5],cp:[0,1.3,-4],entry:1,exit:2,
   sp:[[-10,3,-12],[10,3,-12],[-9,3,-34],[9,3,-36],[0,3,-18],[-6,3,-40],[6,3,-21],[0,3,-38]],waves:[{can:5,drone:2},{golem:1,keto:2,drone:3},{golem:2,vend:3,can:3}]},
  {name:'ВИЛЛА',trig:[-30,30,-98,-54],bounds:[-33,33,-101,-51.4],cp:[0,4,-53],entry:2,exit:3,
   sp:[[-28,4.5,-56],[28,4.5,-58],[0,4.5,-64],[-26,4.5,-96],[26,4.5,-80],[2,4.5,-96],[-6,4.5,-72],[30,4.5,-70],[-21,13.5,-78],[-23,13.5,-72]],waves:[{vend:5,drone:3,keto:2},{golem:2,can:4,drone:3},{golem:2,keto:3,vend:3,drone:2}]},
  {name:'ХРАМ',trig:[-24,24,-136,-110],bounds:[-26,26,-139,-104.2],cp:[0,9,-105.5],entry:3,exit:4,bossAt:[0,9,-129],
   sp:[[-20,9.5,-114],[20,9.5,-114],[-20,9.5,-132],[20,9.5,-132],[-8,9.5,-118],[8,9.5,-128],[-8,9.5,-130],[8,9.5,-116]],waves:[{pep:1}]}]});
