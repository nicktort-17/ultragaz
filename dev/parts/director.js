/*DIR-BEGIN*/
/* ===== Генеральный директор Газ-Ада: модель Tripo (models/director.json ← blender/director_prep.py) =====
 Части модели: CEO_body (корпус), CEO_head (голова-горлышко, шарнир у основания шеи),
 CEO_armL (левая рука — пушка из банок, +X), CEO_armR (правая — открывашка, −X), шарниры в плечах.
 Поверх модели: визор-лицо (эмоции светом), пламя и пена двигателей, нимб из 12 крышек (в ярости распадается),
 бурлящий резервуар на груди — чем меньше HP, тем сильнее кипит. Пока модель грузится — старый Директор из примитивов,
 после загрузки он подменяется на лету (dirSwap). Механика боя (bossAI) не меняется: B.muzzle, B.kickT — как раньше. */
let DIR_T=null;const DIR_S=5.9,DIR_Y=.12;   // масштаб (высота .92 → ~5.4 м) и подъём модели над e.pos
function dirLoad(){if(DIR_T||typeof ugModel!=='function'||!THREE.GLTFLoader)return;DIR_T='load';
 ugModel('models/director.json',gl=>{const s=gl.scene;s.updateMatrixWorld(true);const an=renderer.capabilities.getMaxAnisotropy();
  // игра рендерит в линейном цвете (outputEncoding Linear) — цветовую текстуру берём как есть, иначе sRGB-декод затемняет и «рыжит» белое;
  // металл из карты Tripo ×.4 — иначе всё отражает тёплый завод и сталь буреет
  s.traverse(o=>{if(!o.isMesh)return;o.castShadow=true;const m=o.material;if(m.map)m.map.encoding=THREE.LinearEncoding;
   for(const k of['map','normalMap','roughnessMap','metalnessMap'])if(m[k]){m[k].anisotropy=an;m[k].needsUpdate=true}m.metalness=.4;m.envMap=ENV;m.envMapIntensity=1;m.needsUpdate=true});
  dirMeasure(s);DIR_T=s;for(const e of enemies)if(e.type==='boss'&&!e.dead&&!(e.g.userData.boss&&e.g.userData.boss.dir))dirSwap(e)},undefined,()=>{DIR_T=null})}
// замеры по геометрии один раз: где поверхность головы у визора и груди у резервуара, где дуло пушки
function dirMeasure(s){const P={};s.traverse(o=>{if(/^CEO_/.test(o.name))P[o.name]=o});const U=s.userData,rc=new THREE.Raycaster();
 const front=(mesh,x,y,def)=>{rc.set(new V3(x,y,2),new V3(0,0,-1));const h=rc.intersectObject(mesh,false);return h.length?h[0].point:new V3(x,y,def)};
 U.visor=P.CEO_head.worldToLocal(front(P.CEO_head,0,.79,.07).add(new V3(0,0,.004)));
 U.chest=P.CEO_body.worldToLocal(front(P.CEO_body,0,.447,.14).add(new V3(0,0,.003)));
 const g=P.CEO_armL.geometry,p=g.attributes.position;g.computeBoundingBox();const y0=g.boundingBox.min.y,tip=new V3();let n=0;
 for(let i=0;i<p.count;i++)if(p.getY(i)<y0+.035){tip.x+=p.getX(i);tip.y+=p.getY(i);tip.z+=p.getZ(i);n++}
 U.muzzle=n?tip.divideScalar(n):new V3(.2,-.42,.05)}

const DIR_FLAME=(()=>{let m=null;return()=>m||(m={core:new THREE.MeshBasicMaterial({color:0xfff6e8,transparent:true,opacity:.85,blending:THREE.AdditiveBlending,depthWrite:false}),
 out:new THREE.MeshBasicMaterial({color:0xff7a4a,transparent:true,opacity:.55,blending:THREE.AdditiveBlending,depthWrite:false}),
 gc:new THREE.ConeGeometry(.032,.16,10,1,true).rotateX(Math.PI).translate(0,-.08,0),go:new THREE.ConeGeometry(.05,.24,12,1,true).rotateX(Math.PI).translate(0,-.12,0)})})();

function dirBuild(g,mats){if(!DIR_T||DIR_T==='load')return null;const U=DIR_T.userData;
 const hold=new THREE.Group();hold.scale.setScalar(DIR_S);hold.position.y=DIR_Y;g.add(hold);
 const m=DIR_T.clone(true);hold.add(m);const P={};
 m.traverse(o=>{if(o.isMesh){o.material=o.material.clone();mats.push(o.material);o.castShadow=true}if(/^CEO_/.test(o.name))P[o.name]=o});
 const B={dir:1,hold,body:P.CEO_body,head:P.CEO_head,armL:P.CEO_armL,armR:P.CEO_armR,kickT:0,eng:[],fl:[],sm:0,lean:0,roll:0,tw:0,twA:0};
 B.muzzle=new THREE.Object3D();B.muzzle.position.copy(U.muzzle);B.armL.add(B.muzzle);
 // визор-лицо: canvas-текстура, перерисовывается при смене эмоции
 B.fc=document.createElement('canvas');B.fc.width=256;B.fc.height=96;B.fg=B.fc.getContext('2d');B.ft=new THREE.CanvasTexture(B.fc);
 B.visor=new THREE.MeshBasicMaterial({map:B.ft,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false});
 const vz=new THREE.Mesh(new THREE.PlaneGeometry(.15,.056),B.visor);vz.position.copy(U.visor);vz.renderOrder=3;B.head.add(vz);B.vz=vz;dirFace(B,'calm');
 // резервуар-«сердце»: шейдер с газировкой поверх стекла
 B.core=new THREE.ShaderMaterial({uniforms:{uT:{value:0},uK:{value:0}},transparent:true,depthWrite:false,toneMapped:false,polygonOffset:true,polygonOffsetFactor:-2,
  vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:DIR_CORE_FS});
 const cr=new THREE.Mesh(new THREE.PlaneGeometry(.152,.15),B.core);cr.position.copy(U.chest);cr.renderOrder=2;B.body.add(cr);
 // двигатели: сопла внизу корпуса (модельные координаты ±.11, .035)
 const F=DIR_FLAME();for(const s of[-1,1]){const n=new THREE.Group();n.position.set(s*.108,.036,0);B.body.add(n);
  const o=new THREE.Mesh(F.go,F.out.clone()),c=new THREE.Mesh(F.gc,F.core);n.add(o);n.add(c);B.fl.push({n,o,c});B.eng.push(n)}
 // нимб «Совет акционеров»: 12 крышек на кольце за головой (в мировых метрах, вне масштаба модели)
 const gold=new THREE.MeshStandardMaterial({color:0xf2b84b,metalness:.9,roughness:.2,envMap:ENV,side:THREE.DoubleSide}),red=new THREE.MeshStandardMaterial({color:0xc8102e,metalness:.5,roughness:.26,envMap:ENV,side:THREE.DoubleSide});
 B.halo=new THREE.Group();B.halo.position.set(0,DIR_Y+.80*DIR_S,-.17*DIR_S);g.add(B.halo);
 B.ring=new THREE.Mesh(new THREE.TorusGeometry(1.38,.035,6,48),gold);B.halo.add(B.ring);B.caps=[];
 for(let i=0;i<12;i++){const a=i/12*Math.PI*2,c=new THREE.Mesh(crownGeo(.21,13),i%2?red:gold);c.rotation.x=Math.PI/2;c.position.set(Math.cos(a)*1.38,Math.sin(a)*1.38,0);B.halo.add(c);B.caps.push({m:c,a,ph:Math.random()*6.28})}
 g.userData.boss=B;return B.visor}
function dirSwap(e){const g=e.g;for(const c of g.children.slice())g.remove(c);e.mats.length=0;const ey=dirBuild(g,e.mats);if(ey)e.eyes=ey}

// эмоции визора: calm — ровная тонкая линия, irk — короче и ярче, atk — две острые полосы, hurt — белая вспышка, rage — раскалённые полосы
function dirFace(B,st){if(B.st===st)return;B.st=st;const c=B.fc,g=B.fg,W=c.width,H=c.height;g.clearRect(0,0,W,H);
 const col={calm:'#ff3344',irk:'#ff5a3a',atk:'#ff2a22',hurt:'#ffffff',rage:'#ff7a2a'}[st];g.shadowColor=col;g.shadowBlur=st==='rage'?22:12;g.fillStyle=col;
 const bar=(x0,y0,x1,y1,th)=>{g.beginPath();g.moveTo(x0,y0-th);g.lineTo(x1,y1-th);g.lineTo(x1,y1+th);g.lineTo(x0,y0+th);g.closePath();g.fill()};
 if(st==='calm')bar(W*.1,H/2,W*.9,H/2,H*.07);
 else if(st==='irk')bar(W*.22,H/2,W*.78,H/2,H*.11);
 else if(st==='hurt')bar(W*.06,H/2,W*.94,H/2,H*.2);
 else{const th=st==='rage'?H*.15:H*.1;bar(W*.1,H*.34,W*.44,H*.58,th);bar(W*.9,H*.34,W*.56,H*.58,th);if(st==='rage'){g.globalAlpha=.55;bar(W*.08,H*.8,W*.92,H*.8,H*.05);g.globalAlpha=1}}
 B.ft.needsUpdate=true}

const DIR_CORE_FS=`varying vec2 vUv;uniform float uT,uK;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
void main(){vec2 uv=vUv;float k=uK;
 vec2 q=abs(uv-.5)-vec2(.42);float rr=length(max(q,0.))-.08;float mask=1.-smoothstep(-.012,0.,rr);
 float lvl=.6+.28*k+(.025+.06*k)*sin(uT*(2.+6.*k)+uv.x*9.)+.025*k*sin(uT*14.+uv.x*27.);
 vec3 col;float a=mask;
 if(uv.y>lvl){col=vec3(.07,.03,.04);float st=smoothstep(.06,0.,abs(uv.x-.22))*.35+smoothstep(.03,0.,abs(uv.x-.3))*.2;col+=vec3(st);a*=.92;}
 else{vec3 deep=vec3(.36,.01,.04),hot=vec3(1.,.15,.1);col=mix(deep,hot,clamp(uv.y/lvl,0.,1.)*.75+.25*k);
  float b=0.;for(int L=0;L<3;L++){float fl=float(L),sc=6.+fl*4.,sp=(.1+.55*k)*(1.+fl*.35);vec2 gg=vec2(uv.x*sc,uv.y*sc*1.2-uT*sp*sc);vec2 id=floor(gg),f=fract(gg)-.5;
   if(h(id+fl*7.)<.22+.6*k){vec2 o=vec2(h(id+3.)-.5,h(id+5.)-.5)*.45;float r=.1+.17*h(id+9.),d=length(f-o);b=max(b,smoothstep(r,r-.05,d)-smoothstep(r-.06,r-.12,d)*.55);}}
  col=mix(col,vec3(1.,.78,.74),b*.85);
  float fm=smoothstep(lvl-.035-.08*k,lvl,uv.y);float n=h(floor(vec2(uv.x*36.,uT*9.)));col=mix(col,vec3(1.,.94,.9),fm*(.55+.45*n));
  col*=1.+(.25+1.2*k)*(.55+.45*sin(uT*(3.+10.*k)));}
 gl_FragColor=vec4(col,a);}`;

function dirAnim(e,dt){const B=e.g.userData.boss;if(!B)return false;
 if(!B.dir){if(DIR_T&&DIR_T!=='load'){dirSwap(e);return true}return false}
 const ph2=e.ph2||e.hp<(e.maxHp||1)*.5,k=Math.max(0,Math.min(1,1-e.hp/(e.maxHp||1))),L=x=>Math.min(1,dt*x),yaw=e.g.rotation.y;
 B.sm+=(k-B.sm)*L(2);const kk=B.sm;
 const fwd=e.vel.x*Math.sin(yaw)+e.vel.z*Math.cos(yaw),side=e.vel.x*Math.cos(yaw)-e.vel.z*Math.sin(yaw),spd=Math.hypot(e.vel.x,e.vel.z);
 const wind=e.dashW>0,dash=e.dashT>0,slamUp=e.slamS===1||e.slamS===2,slamDn=e.slamS===3||e.slamS===4,lz=e.lzT>0;
 // корпус: парение, наклон по ходу, замах назад перед рывком, дрожь от кипения
 let lean=Math.max(-.22,Math.min(.3,fwd*.012));if(wind)lean=-.16;if(dash)lean=.42;if(slamDn)lean=.25;
 B.lean+=(lean-B.lean)*L(6);B.roll+=(Math.max(-.2,Math.min(.2,-side*.011))-B.roll)*L(4);
 const jit=kk>.55?(kk-.55)*.05:0,nerv=ph2?.012:0;
 B.hold.rotation.set(B.lean+(Math.random()-.5)*jit,0,B.roll+Math.sin(T*1.1)*.03+(Math.random()-.5)*(jit+nerv));
 B.hold.position.set((Math.random()-.5)*jit*.6,DIR_Y+Math.sin(T*2.2)*.07,0);
 if(e.stagger>0)e.g.rotation.x=Math.sin(e.stagger*8)*.15;else e.g.rotation.x*=.9;
 // голова: спокойно осматривается сверху вниз; в ярости — резкие рывки
 if(ph2){B.tw-=dt;if(B.tw<=0){B.tw=rnd(.25,.9);B.twA=rnd(-.45,.45)}B.head.rotation.y+=(B.twA-B.head.rotation.y)*L(18)}
 else B.head.rotation.y+=(Math.sin(T*.9)*.18-B.head.rotation.y)*L(4);
 B.head.rotation.x+=((e.flash>0?-.22:wind||dash?.12:-.05)-B.head.rotation.x)*L(10);B.head.rotation.z=ph2?Math.sin(T*23)*.03*kk:0;
 // левая рука-пушка: поднимается перед залпом, отдача; правая-открывашка: замах и выпад
 B.kickT=Math.max(0,(B.kickT||0)-dt);
 let lx=-.08,lzr=0,rx=-.12,rzr=0;
 if(e.cd<.55||B.kickT>0){lx=-1.2;lzr=-.18}
 lx-=B.kickT*1.6;
 if(wind){const w=1-e.dashW/.8;rx=.95*w;rzr=-.25*w}if(dash){rx=-1.55;rzr=.1}
 if(slamUp){lx=rx=-2.7}if(slamDn){lx=rx=-.5}
 if(lz){lzr=.95;rzr=-.95;lx=rx=-.35}
 if(e.stagger>0){rx=Math.sin(e.stagger*11)*.6;lx=Math.cos(e.stagger*9)*.5}
 B.armL.rotation.x+=(lx-B.armL.rotation.x)*L(B.kickT>0?25:9);B.armL.rotation.z+=(lzr-B.armL.rotation.z)*L(8);
 B.armR.rotation.x+=(rx-B.armR.rotation.x)*L(dash?22:9);B.armR.rotation.z+=(rzr-B.armR.rotation.z)*L(8);
 // визор
 const atk=wind||dash||slamUp||lz||e.cd<.35;dirFace(B,e.flash>0?'hurt':ph2?(atk||Math.sin(T*7)>.6?'rage':'atk'):atk?'atk':kk>.3?'irk':'calm');
 B.vz.scale.setScalar(ph2?1+.08*Math.sin(T*18):1);
 // двигатели: длина пламени от скорости, рывок — форсаж; в ярости пламя краснее
 const thr=1+spd*.06+(dash?2.2:0)+(slamUp?1:0);
 for(const f of B.fl){const fl=1+Math.sin(T*40+f.n.position.x*30)*.12+Math.random()*.1;f.o.scale.set(1,thr*fl,1);f.c.scale.set(1,thr*.8*fl,1);f.o.material.color.setHex(ph2?0xff3a2a:0xff8a4a)}
 if(Math.random()<dt*(10+spd*1.2+(dash?30:0)))for(const n of B.eng){const w=n.getWorldPosition(new V3());w.y-=.4;puff(w,1,ph2&&Math.random()<.5?0xff9a90:0xf6eee2,2.5,.45,9)}
 // резервуар кипит сильнее при малом HP; при низком — пена вырывается наружу
 B.core.uniforms.uT.value=T;B.core.uniforms.uK.value=kk;
 if(kk>.5&&Math.random()<dt*(kk-.5)*24){const w=B.body.localToWorld(_dirV.set(0,.53,.12));puff(w,2,Math.random()<.5?0xffd0c8:0xff6a5a,3,.5,4)}
 // нимб: спокойно вращается; в ярости кольцо гаснет, 12 крышек летают поодиночке
 B.halo.position.y=DIR_Y+.80*DIR_S+Math.sin(T*2)*.08;
 if(!ph2){B.halo.rotation.z+=dt*.6;B.ring.scale.setScalar(1);for(const c of B.caps){c.m.position.set(Math.cos(c.a)*1.38,Math.sin(c.a)*1.38,0)}}
 else{B.ring.scale.setScalar(Math.max(.001,B.ring.scale.x-dt*2));B.halo.rotation.z+=dt*(lz?3:1.4);
  for(const c of B.caps){const r=1.6+.45*Math.sin(T*1.3+c.ph),a=c.a+Math.sin(T*.7+c.ph)*.25;c.m.position.set(Math.cos(a)*r,Math.sin(a)*r,Math.sin(T*2+c.ph)*.45);c.m.rotation.z+=dt*(2+c.ph)}}
 return true}
const _dirV=new V3();
/*DIR-END*/
