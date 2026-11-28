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

// пенная тяга (как в концепте): из сопел вываливаются клубы пузырей пены; бурлят и вытягиваются с тягой
const DIR_FOAM=(()=>{let m=null;return()=>m||(m={geo:new THREE.IcosahedronGeometry(1,0),
 mat:new THREE.MeshStandardMaterial({color:0xf8f4ec,roughness:.35,metalness:0,flatShading:true,emissive:0x2a2622}),
 matR:new THREE.MeshStandardMaterial({color:0xffc2bb,roughness:.35,metalness:0,flatShading:true,emissive:0x3a1210})})})();
const DIR_BUB=[[0,-0.015,0,0.0527],[-0.0308,-0.0375,0.0168,0.0372],[0.0308,-0.0425,-0.014,0.0403],[0.0056,-0.0625,0.028,0.0341],[-0.0168,-0.08,-0.0196,0.031],[0.0224,-0.0975,0.0084,0.02635],[-0.0056,-0.1175,0,0.0217],[0.014,-0.1375,-0.0168,0.01705],[-.026,-.02,-.02,.03],[.028,-.016,.018,.028]];
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
 const F=DIR_FOAM();for(const s of[-1,1]){const n=new THREE.Group();n.position.set(s*.108,.036,0);B.body.add(n);const bub=[];
  for(const [x,y,z,r] of DIR_BUB){const b=new THREE.Mesh(F.geo,F.mat);b.position.set(x,y,z);b.scale.setScalar(r);b.userData.b=[x,y,z,r,Math.random()*6.28];n.add(b);bub.push(b)}
  B.fl.push({n,bub});B.eng.push(n)}
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
 float kc=min(k,1.),ov=clamp(k-1.,0.,1.);
 float lvl=.55+.47*kc+(.02+.07*kc)*sin(uT*(2.+9.*kc)+uv.x*9.)+.04*kc*kc*sin(uT*17.+uv.x*31.);
 vec3 col;float a=mask;
 if(uv.y>lvl){col=vec3(.07,.03,.04);float st=smoothstep(.06,0.,abs(uv.x-.22))*.35+smoothstep(.03,0.,abs(uv.x-.3))*.2;col+=vec3(st);a*=.92;}
 else{vec3 deep=vec3(.36,.01,.04),hot=vec3(1.,.15,.1);col=mix(deep,hot,clamp(uv.y/lvl,0.,1.)*.75+.25*k);
  float b=0.;for(int L=0;L<3;L++){float fl=float(L),sc=6.+fl*4.,sp=(.08+.95*kc+ov)*(1.+fl*.35);vec2 gg=vec2(uv.x*sc,uv.y*sc*1.2-uT*sp*sc);vec2 id=floor(gg),f=fract(gg)-.5;
   if(h(id+fl*7.)<.15+.85*kc){vec2 o=vec2(h(id+3.)-.5,h(id+5.)-.5)*.45;float r=.1+.17*h(id+9.),d=length(f-o);b=max(b,smoothstep(r,r-.05,d)-smoothstep(r-.06,r-.12,d)*.55);}}
  col=mix(col,vec3(1.,.78,.74),b*.85);
  float fm=smoothstep(lvl-.03-.14*kc,lvl,uv.y);float n=h(floor(vec2(uv.x*36.,uT*(9.+12.*kc))));col=mix(col,vec3(1.,.94,.9),fm*(.55+.45*n));
  col*=1.+(.2+1.7*kc+2.*ov)*(.55+.45*sin(uT*(2.+15.*kc+20.*ov)));col=mix(col,vec3(1.,.97,.92),ov*.85);}
 gl_FragColor=vec4(col,a);}`;

function dirAnim(e,dt){const B=e.g.userData.boss;if(!B)return false;
 if(!B.dir){if(DIR_T&&DIR_T!=='load'){dirSwap(e);return true}return false}
 const ph2=e.ph2||e.hp<(e.maxHp||1)*.5,k=Math.max(0,Math.min(1,1-e.hp/(e.maxHp||1))),L=x=>Math.min(1,dt*x),yaw=e.g.rotation.y;
 B.sm+=(k-B.sm)*L(4);const kk=B.sm;
 const fwd=e.vel.x*Math.sin(yaw)+e.vel.z*Math.cos(yaw),side=e.vel.x*Math.cos(yaw)-e.vel.z*Math.sin(yaw),spd=Math.hypot(e.vel.x,e.vel.z);
 const wind=e.dashW>0,dash=e.dashT>0,slamUp=e.slamS===1||e.slamS===2,slamDn=e.slamS===3||e.slamS===4,lz=e.lzT>0;
 // корпус: парение, наклон по ходу, замах назад перед рывком, дрожь от кипения
 let lean=Math.max(-.22,Math.min(.3,fwd*.012));if(wind)lean=-.16;if(dash)lean=.42;if(slamDn)lean=.25;
 B.lean+=(lean-B.lean)*L(6);B.roll+=(Math.max(-.2,Math.min(.2,-side*.011))-B.roll)*L(4);
 const jit=kk>.45?Math.pow((kk-.45)/.55,1.5)*.09:0,nerv=ph2?.012:0;
 if(e.fin==='crash')B.spinA=(B.spinA||0)+dt*10;
 B.hold.rotation.set(B.lean+(Math.random()-.5)*jit,e.fin==='crash'?B.spinA:0,B.roll+Math.sin(T*1.1)*.03+(Math.random()-.5)*(jit+nerv));
 B.hold.position.set((Math.random()-.5)*jit*.6,DIR_Y+Math.sin(T*2.2)*.07,0);
 if(e.stagger>0)e.g.rotation.x=Math.sin(e.stagger*8)*.15;else e.g.rotation.x*=.9;
 // голова: спокойно осматривается сверху вниз; в ярости — резкие рывки
 if(B.cork){}else if(e.fin==='wind'){B.head.rotation.set(rnd(-.12,.12),rnd(-.2,.2),rnd(-.12,.12))}
 else if(ph2){B.tw-=dt;if(B.tw<=0){B.tw=rnd(.25,.9);B.twA=rnd(-.45,.45)}B.head.rotation.y+=(B.twA-B.head.rotation.y)*L(18)}
 else B.head.rotation.y+=(Math.sin(T*.9)*.18-B.head.rotation.y)*L(4);
 if(!B.cork&&e.fin!=='wind'){B.head.rotation.x+=((e.flash>0?-.22:wind||dash?.12:-.05)-B.head.rotation.x)*L(10);B.head.rotation.z=ph2?Math.sin(T*23)*.03*kk:0}
 // левая рука-пушка: поднимается перед залпом, отдача; правая-открывашка: замах и выпад
 B.kickT=Math.max(0,(B.kickT||0)-dt);
 let lx=-.08,lzr=0,rx=-.12,rzr=0;
 if(e.cd<.55||B.kickT>0){lx=-1.2;lzr=-.18}
 lx-=B.kickT*1.6;
 if(wind){const w=1-e.dashW/.8;rx=.95*w;rzr=-.25*w}if(dash){rx=-1.55;rzr=.1}
 if(slamUp){lx=rx=-2.7}if(slamDn){lx=rx=-.5}
 if(lz){lzr=.95;rzr=-.95;lx=rx=-.35}
 if(e.stagger>0){rx=Math.sin(e.stagger*11)*.6;lx=Math.cos(e.stagger*9)*.5}
 if(e.fin==='wind'||e.fin==='away'||e.fin==='rest'){lx=rx=-.45;lzr=.35;rzr=-.35}
 if(e.fin==='crash'){lx=Math.sin(T*17)*1.6;rx=Math.cos(T*15)*1.6;lzr=.8;rzr=-.8}
 B.armL.rotation.x+=(lx-B.armL.rotation.x)*L(B.kickT>0?25:9);B.armL.rotation.z+=(lzr-B.armL.rotation.z)*L(8);
 B.armR.rotation.x+=(rx-B.armR.rotation.x)*L(dash?22:9);B.armR.rotation.z+=(rzr-B.armR.rotation.z)*L(8);
 // визор
 const atk=wind||dash||slamUp||lz||e.cd<.35;dirFace(B,e.flash>0||(kk>.88&&Math.sin(T*31)>.75)?'hurt':ph2?(atk||Math.sin(T*7)>.6?'rage':'atk'):atk?'atk':kk>.3?'irk':'calm');
 B.vz.scale.setScalar(ph2?1+.08*Math.sin(T*18):1);
 // двигатели: длина пламени от скорости, рывок — форсаж; в ярости пламя краснее
 const thr=1+spd*.06+(dash?2.2:0)+(slamUp?1:0);
 const F=DIR_FOAM(),stretch=Math.min(3.2,.7+thr*.35);
 for(const f of B.fl)for(const b of f.bub){const [x,y,z,r,ph]=b.userData.b,w=1+Math.sin(T*(11+r*90)+ph)*.22;b.position.set(x*(1+stretch*.15),y*stretch,z);b.scale.setScalar(r*w*(1+(stretch-1)*.25));b.material=ph2&&r<.036?F.matR:F.mat}
 if(Math.random()<dt*(10+spd*1.2+(dash?30:0)))for(const n of B.eng){const w=n.getWorldPosition(new V3());w.y-=.5+Math.random()*.4;puff(w,2,ph2&&Math.random()<.4?0xffb8b0:0xf8f4ec,2.2,.7,7)}
 // резервуар кипит сильнее при малом HP; при низком — пена вырывается наружу
 B.core.uniforms.uT.value=T;B.core.uniforms.uK.value=kk;
 if(kk>.35&&Math.random()<dt*(kk-.35)*60){const w=B.body.localToWorld(_dirV.set(rnd(-.06,.06),.53,.13));puff(w,1+Math.round(kk*3),Math.random()<.5?0xffd0c8:0xff6a5a,2+kk*4,.5,4)}
 if(kk>.8&&Math.random()<dt*(kk-.8)*30){const w=B.body.localToWorld(_dirV.set(rnd(-.2,.2),rnd(.2,.6),rnd(-.1,.15)));puff(w,4,0xf6eee2,5,.4,6)}
 // нимб: спокойно вращается; в ярости кольцо гаснет, 12 крышек летают поодиночке
 B.halo.position.y=DIR_Y+.80*DIR_S+Math.sin(T*2)*.08;
 if(!ph2){B.halo.rotation.z+=dt*.6;B.ring.scale.setScalar(1);for(const c of B.caps){c.m.position.set(Math.cos(c.a)*1.38,Math.sin(c.a)*1.38,0)}}
 else{B.ring.scale.setScalar(Math.max(.001,B.ring.scale.x-dt*2));B.halo.rotation.z+=dt*(lz?3:1.4);
  for(const c of B.caps){const r=1.6+.45*Math.sin(T*1.3+c.ph),a=c.a+Math.sin(T*.7+c.ph)*.25;c.m.position.set(Math.cos(a)*r,Math.sin(a)*r,Math.sin(T*2+c.ph)*.45);c.m.rotation.z+=dt*(2+c.ph)}}
 return true}
const _dirV=new V3();

/* --- «ЛИКВИДАЦИЯ»: смерть Директора. 1.8 с перегрузки (ядро белеет, тряска, пена из швов) → взрыв газировки:
   вспышки, ударные волны, гейзер; голова вылетает пробкой, руки/корпус разлетаются и падают, крышки нимба веером,
   дождь колы; корпус дымится на полу ещё ~20 с. Чисто визуально (урона нет, только отброс игрока). --- */
const DIR_DEAD=[];
function dirDeath(e){const B=e.g.userData.boss;if(!B||!B.dir||e.dirDeath)return false;e.dirDeath=1;
 const w=new THREE.Group();w.position.copy(e.g.position);w.quaternion.copy(e.g.quaternion);(typeof mapGroup!=='undefined'&&mapGroup?mapGroup:scene).add(w);
 for(const c of e.g.children.slice())w.add(c);
 const D={w,B,t:0,boom:false,parts:[],caps:[],y0:e.pos.y,ph2:true};DIR_DEAD.push(D);
 if(e.crash){D.t=1.8;dirBoom(D)}else{banner('ЛИКВИДАЦИЯ АКТИВОВ…');sfx('charge',1);sfx('siren',.5)}return true}
function dirBoom(D){const B=D.B,w=D.w,c=B.body.localToWorld(new V3(0,.45,.1));D.boom=true;
 freeze=Math.max(freeze||0,.12);shake=Math.max(shake,1.3);sfx('boom',1);sfx('frag',1);sfx('slam',.9);setTimeout(()=>sfx('boom',.7),140);setTimeout(()=>sfx('gloop',.8),380);
 blast(c,15,0xffffff);blast(c,10,0xff3a2a);blast(c.clone().setY(c.y+2),7,0xffe066);
 const g0=new V3(c.x,Math.max(D.y0-2.5,c.y-4),c.z);ring(g0,16,0xffe066);ring(g0,10,0xc8102e);ring(g0,6,0xffffff);
 puff(c,320,0x5a1f0e,18,1.6,6);puff(c,260,0xf6eee2,22,1.4,5);puff(c,90,0xff3a2a,14,1,8);puff(c,60,0xf2b84b,16,1.2,10);
 // гейзер пены вверх
 for(let i=0;i<8;i++)setTimeout(()=>puff(new V3(c.x+rnd(-.6,.6),c.y+1+i*.8,c.z+rnd(-.6,.6)),26,i%2?0xf6eee2:0xffd0c8,7,1.3,-2),i*45);
 // части модели — в мир с физикой
 const fling=(o,v,spin,trail)=>{const p=o.getWorldPosition(new V3()),q=o.getWorldQuaternion(new THREE.Quaternion()),s=o.getWorldScale(new V3());
  w.parent.add(o);o.position.copy(p);o.quaternion.copy(q);o.scale.copy(s);D.parts.push({o,v,spin,trail,rest:0})};
 const yaw=new V3(0,0,1).applyQuaternion(w.quaternion),side=new V3(yaw.z,0,-yaw.x);
 fling(B.head,new V3(rnd(-2,2),26,rnd(-2,2)).addScaledVector(yaw,-3),new V3(rnd(-6,6),rnd(-9,9),rnd(-6,6)),1);
 fling(B.armL,side.clone().multiplyScalar(-15).add(new V3(0,11,0)).addScaledVector(yaw,rnd(-3,3)),new V3(rnd(-8,8),rnd(-6,6),rnd(-8,8)),0);
 fling(B.armR,side.clone().multiplyScalar(15).add(new V3(0,12,0)).addScaledVector(yaw,rnd(-3,3)),new V3(rnd(-8,8),rnd(-6,6),rnd(-8,8)),0);
 fling(B.body,new V3(0,6,0).addScaledVector(yaw,-4),new V3(rnd(-2,2),rnd(-3,3),rnd(-2,2)),2);
 for(const f of B.fl)f.n.visible=false;B.core.uniforms.uK.value=1;
 // крышки нимба веером
 for(const cp of B.caps){const p=cp.m.getWorldPosition(new V3()),dir=p.clone().sub(c).setY(0).normalize();w.parent.add(cp.m);cp.m.position.copy(p);cp.m.scale.setScalar(1);
  D.caps.push({o:cp.m,v:dir.multiplyScalar(rnd(10,18)).add(new V3(0,rnd(8,15),0)),spin:new V3(rnd(-12,12),rnd(-12,12),rnd(-12,12)),rest:0,nocol:1})}
 w.remove(B.halo);
 // отброс игрока волной
 const d=P.pos.clone().sub(c).setY(0),L=d.length();if(L<16){P.vel.addScaledVector(d.normalize(),(16-L)*1.4).setY(Math.max(P.vel.y,9))}
 addStyle('ЛИКВИДАЦИЯ',150)}
function dirDeathUpd(dt){dirDebUpd(dt);for(const D of DIR_DEAD){D.t+=dt;const B=D.B;
  if(!D.boom){const k=Math.min(1,D.t/1.8),a=.03+k*k*.35;
   B.hold.position.set((Math.random()-.5)*a,DIR_Y+(Math.random()-.5)*a*.6,(Math.random()-.5)*a);B.hold.rotation.set((Math.random()-.5)*a*.5,(Math.random()-.5)*a*.4,(Math.random()-.5)*a*.5);
   B.core.uniforms.uT.value=T;B.core.uniforms.uK.value=1+k;dirFace(B,Math.sin(T*(30+k*40))>0?'hurt':'rage');B.vz.scale.setScalar(1+k*.6);
   for(const f of B.fl){const on=Math.random()<.6-k*.4;f.n.visible=on;f.n.scale.set(1,rnd(.5,2.5),1)}
   B.halo.rotation.z+=dt*(3+k*12);for(const cp of B.caps){const r=1.6+k*1.8;cp.m.position.set(Math.cos(cp.a+T*k*4)*r,Math.sin(cp.a+T*k*4)*r,Math.sin(T*9+cp.ph)*k)}
   if(Math.random()<dt*(20+k*80)){const p=B.body.localToWorld(_dirV.set(rnd(-.25,.25),rnd(.1,.7),rnd(-.12,.16)));puff(p,3,Math.random()<.6?0xf6eee2:0xff6a5a,4+k*6,.5,4)}
   if(Math.random()<dt*6)puff(B.head.localToWorld(_dirV.set(0,.2,0)),4,0xf6eee2,6,.5,-3);
   shake=Math.max(shake,k*.35);if(D.t>=1.8)dirBoom(D);continue}
  const tb=D.t-1.8;
  if(tb>1.5&&tb<2.6&&Math.random()<dt*40){const r=rnd(0,9),a=rnd(0,6.28);puff(new V3(D.w.position.x+Math.cos(a)*r,D.y0+9,D.w.position.z+Math.sin(a)*r),2,0x6b2a12,1,1.4,22)}
  for(const p of D.parts.concat(D.caps)){if(p.rest>1)continue;dirDebStep(p,dt,p.trail===2?.35:.15);
   if(p.trail===1&&p.v.y>0)puff(p.o.position.clone(),3,0xf6eee2,2,.9,-1);
   if(p.trail===2&&Math.random()<dt*30)puff(p.o.position.clone().setY(p.o.position.y+1),2,0x5a1f0e,3,.8,-2)}
  if(tb>2&&tb<20&&Math.random()<dt*7){const b=B.body.getWorldPosition(new V3());puff(b.setY(b.y+1.2),2,Math.random()<.5?0x3a3438:0x5a1f0e,1.5,1.6,-3)}
  if(tb>20){const all=D.parts.concat(D.caps);for(const p of all){dirUnbox(p);p.o.parent&&p.o.parent.remove(p.o)}D.w.parent&&D.w.parent.remove(D.w);D.done=1}}
 for(let i=DIR_DEAD.length-1;i>=0;i--)if(DIR_DEAD[i].done)DIR_DEAD.splice(i,1)}

/* --- ФИНАЛ «ПРОБКА»: шкала на груди полна (HP ≤ 0) — Директор не умирает, а выстреливает головой в игрока.
   Добить можно только парированием [F]: отбитая голова летит в его же корпус → его швыряет в карусель розлива,
   бак лопается, карусель рушится, затем «Ликвидация». Не отбил — голова бьёт игрока и возвращается на шею.
   В коопе (синхрон пробки сложен) при нуле HP — сразу крушение в карусель. --- */
function dirKillGuard(e){const B=e.g.userData.boss;if(!B||!B.dir||e.finDone)return false;
 if(!e.fin){e.fin='wind';e.finT=1.6;e.inv=true;e.hp=Math.max(.01,e.maxHp*.001);e.dashW=e.dashT=0;e.slamS=0;e.lzT=0;e.stagger=0;
  if(typeof bossRing!=='undefined'&&bossRing){scene.remove(bossRing);bossRing=null}if(typeof DL!=='undefined')DL.lz=null;
  banner('ШКАЛА ПОЛНА! ОТБЕЙ ЕГО ГОЛОВУ ОБРАТНО В НЕГО — [F]');sfx('siren',.8);sfx('charge',1);
  if(mode!=='solo')dirFinish(e,null)}
 return true}
function dirFinalAI(e,t,to,dist,dt){const B=e.g.userData.boss;if(e.fin==='crash'){dirCrashUpd(e,dt);return}
 e.vel.x*=1-Math.min(1,dt*3);e.vel.z*=1-Math.min(1,dt*3);e.vel.y=((e.hy??e.pos.y)+3.2-e.pos.y)*2.5;
 if(e.fin==='wind'){e.finT-=dt;if(Math.random()<dt*30)puff(B.body.localToWorld(_dirV.set(rnd(-.04,.04),.72,0)),3,0xf6eee2,5,.4,-3);if(e.finT<=0)dirCork(e,t)}
 else if(e.fin==='away'){if(Math.random()<dt*45)puff(B.body.localToWorld(_dirV.set(0,.72,0)),3,Math.random()<.5?0xf6eee2:0xff6a5a,7,.6,-5)}
 else if(e.fin==='rest'){e.finT-=dt;if(e.finT<=0){e.fin='wind';e.finT=1.2}}}
function dirCork(e,t){const B=e.g.userData.boss,h=B.head,p=h.getWorldPosition(new V3()),q=h.getWorldQuaternion(new THREE.Quaternion()),sc=h.getWorldScale(new V3());
 B.headHome={pos:h.position.clone(),q:h.quaternion.clone()};scene.add(h);h.position.copy(p);h.quaternion.copy(q);h.scale.copy(sc);
 const v=new V3(t.pos.x,t.pos.y+1.2,t.pos.z).sub(p).normalize().multiplyScalar(19);
 const pr={m:h,vel:v,owner:'enemy',kind:'orb',dmg:30,r:1.1,t:7,dhead:1,e};proj.push(pr);B.cork=pr;e.fin='away';e.corkN=(e.corkN||0)+1;
 sfx('boom',.7);sfx('jet',.9);puff(p,60,0xf6eee2,12,.8,4);ring(p,3,0xffe066);shake=Math.max(shake,.3)}
function dirHeadBack(p){p.ret=1;p.owner='enemy'}
function dirHeadAttach(e){const B=e.g.userData.boss,h=B.head;B.body.add(h);h.position.copy(B.headHome.pos);h.quaternion.copy(B.headHome.q);h.scale.setScalar(1);if(h.material&&h.material.color)h.material.color.set(0xffffff);
 B.cork=null;e.fin='rest';e.finT=2.4;puff(B.body.localToWorld(_dirV.set(0,.75,0)),30,0xf6eee2,6,.5);sfx('slam',.5)}
function dirHeadUpd(p,dt){const e=p.e,B=e&&e.g.userData.boss,pos=p.m.position;
 if(!B||e.dead||e.fin==='crash'){p.dead=true;return}
 p.m.rotation.x+=dt*9;p.m.rotation.z+=dt*5;
 if(p.owner==='player'){if(!p.par){p.par=1;p.ret=0;p.t=4;if(p.m.material&&p.m.material.color)p.m.material.color.set(0xffffff);
   const to=center(e,new V3()).sub(pos).normalize();if(to.dot(_dirV.copy(p.vel).normalize())>.55)p.vel.copy(to).multiplyScalar(55);banner('ПРЯМО В ПРАВЛЕНИЕ!')}
  pos.addScaledVector(p.vel,dt);puff(pos,2,0xf2b84b,3,.5,-1);
  if(pos.distanceTo(center(e,new V3()))<e.r+1.8){p.dead=true;dirFinish(e,p);return}
  if(inBox(pos)||p.t<=0){p.par=0;dirHeadBack(p)}return}
 if(p.ret){const home=B.body.localToWorld(new V3(0,.715,0)),d=home.sub(pos),L=d.length();if(L<.8){p.dead=true;dirHeadAttach(e);return}
  pos.addScaledVector(d.normalize(),Math.min(L,26*dt));puff(pos,1,0xf6eee2,2,.4,-1);return}
 const pc=new V3(P.pos.x,P.pos.y+1.2,P.pos.z);p.vel.lerp(pc.clone().sub(pos).normalize().multiplyScalar(20),Math.min(1,dt*2.2));pos.addScaledVector(p.vel,dt);puff(pos,1,0xf6eee2,2,.5,-1);
 if(P.alive&&pos.distanceTo(pc)<p.r+1){if(P.iT<=0){hurt(p.dmg);P.vel.addScaledVector(p.vel.clone().normalize(),14).setY(7);shake=Math.max(shake,.4)}else addStyle('УВОРОТ',20);dirHeadBack(p);return}
 if(inBox(pos)||p.t<=0)dirHeadBack(p)}
function dirFinish(e,p){const B=e.g.userData.boss;e.finDone=true;e.fin='crash';e.inv=true;e.crashT=0;
 if(B.cork||p){const h=B.head;if(h.parent!==B.body){B.body.add(h);h.position.copy(B.headHome?B.headHome.pos:new V3(0,.715,0));h.quaternion.copy(B.headHome?B.headHome.q:new THREE.Quaternion())}
  h.scale.setScalar(1);h.rotation.set(.5,.3,-.4);if(h.material&&h.material.color)h.material.color.set(0xffffff);B.cork=null}
 const c=center(e,new V3());if(p){freeze=Math.max(freeze||0,.16);shake=Math.max(shake,.7);blast(c,6,0xffe066);puff(c,90,0xf6eee2,14,.8,4);sfx('parry',1);sfx('boom',.8);addStyle('ПРОБКОЙ В ЛОБ',250);banner('ДИРЕКТОРА ШВЫРНУЛО В КАРУСЕЛЬ!')}
 const C=typeof carousel!=='undefined'?carousel:null;let tgt=null;
 if(C&&!C.broken&&Math.hypot(C.x-e.pos.x,C.z-e.pos.z)<70)tgt=new V3(C.x,e.pos.y,C.z);
 const dir=tgt?tgt.clone().sub(e.pos).setY(0).normalize():new V3(e.pos.x-P.pos.x,0,e.pos.z-P.pos.z).normalize();
 e.crashTgt=tgt;e.crashV=dir.multiplyScalar(34);e.crashLast=e.pos.clone()}
function dirCrashUpd(e,dt){const B=e.g.userData.boss;e.crashT+=dt;e.vel.set(e.crashV.x,(e.crashTgt?Math.max(2,e.crashTgt.y)-e.pos.y:0)*1.5,e.crashV.z);
 if(Math.random()<dt*50)puff(B.body.localToWorld(_dirV.set(rnd(-.1,.1),rnd(.2,.7),.1)),3,Math.random()<.5?0xf6eee2:0xff6a5a,6,.5,2);
 const moved=e.pos.distanceTo(e.crashLast)/Math.max(dt,1e-3);e.crashLast.copy(e.pos);
 const C=e.crashTgt?carousel:null,near=C&&Math.hypot(C.x-e.pos.x,C.z-e.pos.z)<2.8+e.r+1.2;
 if(near||(e.crashT>.25&&moved<8)||e.crashT>2.4){if(C)dirSmashCarousel(C,true);e.inv=false;e.crash=1;kill(e,'parry')}}
function dirSmashCarousel(C,host){if(!C||C.broken)return;C.broken=true;const hub=C.liq.parent,hp=hub.position.clone(),mid=hp.clone().setY(5);
 for(let i=boxes.length-1;i>=0;i--){const b=boxes[i],cx=(b.min.x+b.max.x)/2,cz=(b.min.z+b.max.z)/2;if(Math.abs(cx-hp.x)<.3&&Math.abs(cz-hp.z)<.3&&b.max.x-b.min.x>5&&b.max.z-b.min.z>5&&b.max.y-b.min.y>10)boxes.splice(i,1)}  // только бак (16 м); полосы пола-диска (h .5) не трогаем
 const unlevel=o=>o.traverse(m=>{const i=level.indexOf(m);if(i>=0)level.splice(i,1)});
 const out=(w,k)=>w.clone().sub(hp).setY(0).normalize().multiplyScalar(k);
 // бак: стекло и кола исчезают (осколки и волна), железо — на куски
 for(const m of hub.children.slice()){unlevel(m);if(m===C.liq||(m.material&&m.material.transparent)){m.visible=false;continue}
  for(const s of dirShatter(m)){const w=s.position;dirDebris(s,out(w,rnd(5,10)).setY(rnd(5,12)),new V3(rnd(-3,3),rnd(-3,3),rnd(-3,3)),s.userData.rest)}}
 // колонны-дозаторы: корпус пополам, пояс, верхушка, бутылка — каждая часть отдельно
 for(const k of C.cols){k.box.min.set(0,-99,0);k.box.max.set(0,-98,0)}
 for(const cg of C.rot.children.slice()){if(!cg.isGroup)continue;unlevel(cg);const wp=cg.getWorldPosition(new V3());
  for(const s of dirShatter(cg)){dirDebris(s,out(wp,rnd(8,15)).add(new V3(rnd(-3,3),rnd(5,11),rnd(-3,3))),new V3(rnd(-6,6),rnd(-3,3),rnd(-6,6)),s.userData.rest)}
  cg.parent&&cg.parent.remove(cg)}
 // кольцо форсунок (на 10 м): тор — 8 дуг, балки — куски по ~7 м, форсунки отдельно
 for(const n of C.noz)n.st.visible=false;
 for(const s of dirShatter(C.ring)){dirDebris(s,out(s.position,rnd(1,4)).setY(rnd(0,3)),new V3(rnd(-.6,.6),rnd(-.4,.4),rnd(-.6,.6)),s.userData.rest)}
 C.ring.parent&&C.ring.parent.remove(C.ring);
 blast(mid,11,0xff3a2a);blast(mid,7,0xffffff);ring(hp.clone().setY(.6),18,0x5a1a06);ring(hp.clone().setY(.6),11,0xd8f4ff);
 puff(mid,420,0x5a1a06,18,1.6,7);puff(mid,160,0xd8f4ff,15,1,9);puff(mid,120,0xf6eee2,12,1.2,5);
 for(let i=0;i<10;i++)setTimeout(()=>puff(new V3(hp.x+rnd(-1,1),2+i*1.4,hp.z+rnd(-1,1)),30,i%2?0x5a1a06:0xf6eee2,8,1.2,4),i*50);
 addPuddle(hp.x,.5,hp.z,8,45);for(let i=0;i<8;i++){const a=i/8*6.28;addPuddle(hp.x+Math.cos(a)*8,.5,hp.z+Math.sin(a)*8,3.5,40)}
 sfx('crack',1);sfx('boom',1);sfx('gloop',1);sfx('frag',.9);shake=Math.max(shake,1);
 if(host&&mp())pushFx(['X',0,1])}
function dirFx(n){if(n[0]===1&&typeof carousel!=='undefined'&&carousel)dirSmashCarousel(carousel,false)}

// раскол объекта на куски по типу геометрии: высокий цилиндр — секции по высоте, широкое кольцо — четвертинки,
// тор — 8 дуг, длинный брус — куски ~7 м, мелочь — целиком. Возвращает новые меши в мировых координатах (userData.rest: как лечь)
const _dM=new THREE.Matrix4(),_dM2=new THREE.Matrix4();
function dirShatter(obj){obj.updateMatrixWorld(true);const res=[];
 const put=(geo,mat,local,rest,src)=>{geo=geo.clone();geo.computeBoundingBox();const c=geo.boundingBox.getCenter(new V3());geo.translate(-c.x,-c.y,-c.z);  // центр куска — в его геометрии, а не в центре карусели
  const m=new THREE.Mesh(geo,mat);_dM.copy(src.matrixWorld).multiply(local).multiply(new THREE.Matrix4().makeTranslation(c.x,c.y,c.z));_dM.decompose(m.position,m.quaternion,m.scale);m.castShadow=true;m.userData.rest=rest;res.push(m)};
 obj.traverse(src=>{if(!src.isMesh||!src.visible)return;const g=src.geometry,pa=g.parameters||{},mat=src.material;
  if(g.type==='CylinderGeometry'){const rt=pa.radiusTop,rb=pa.radiusBottom,h=pa.height,rs=pa.radialSegments||12,R=Math.max(rt,rb);
   const nq=R>2.4?4:1,nh=Math.max(1,Math.round(h/2.2));
   for(let j=0;j<nh;j++){const y0=-h/2+j*h/nh,y1=y0+h/nh,r0=rb+(rt-rb)*(y0+h/2)/h,r1=rb+(rt-rb)*(y1+h/2)/h;
    for(let q=0;q<nq;q++)put(new THREE.CylinderGeometry(r1,r0,h/nh,Math.max(6,Math.round(rs/nq)),1,pa.openEnded,q*Math.PI*2/nq,Math.PI*2/nq),mat,_dM2.makeTranslation(0,(y0+y1)/2,0),R>2.4?'flat':'lie',src)}}
  else if(g.type==='TorusGeometry'&&(pa.arc||Math.PI*2)>Math.PI&&pa.radius>3){for(let q=0;q<8;q++)put(new THREE.TorusGeometry(pa.radius,pa.tube,6,10,Math.PI/4),mat,_dM2.makeRotationZ(q*Math.PI/4),'flat',src)}
  else if(g.type==='BoxGeometry'){const d=[pa.width,pa.height,pa.depth],ax=d.indexOf(Math.max(...d)),L=d[ax];
   if(L>8){const n=Math.ceil(L/7);for(let j=0;j<n;j++){const dd=d.slice();dd[ax]=L/n;const off=[0,0,0];off[ax]=-L/2+(j+.5)*L/n;
     put(new THREE.BoxGeometry(dd[0],dd[1],dd[2]),mat,_dM2.makeTranslation(off[0],off[1],off[2]),'flat',src)}}
   else put(g,mat,_dM2.identity(),null,src)}
  else put(g,mat,_dM2.identity(),null,src)});
 return res}

// обломки: гравитация, пол (с учётом уже лёгших обломков), стены по осям с отскоком; улёгшись — получают коллизию
const DIR_DEB=[],DIR_PEND=[];const _dirW=new V3(),_dB=new THREE.Box3();
function dirDebris(o,v,spin,rest){const p=o.getWorldPosition(new V3()),q=o.getWorldQuaternion(new THREE.Quaternion()),s=o.getWorldScale(new V3());
 const par=typeof mapGroup!=='undefined'&&mapGroup?mapGroup:scene;par.add(o);o.position.copy(p);o.quaternion.copy(q);o.scale.copy(s);
 const e={o,v,spin,rest:0,lay:rest||null};DIR_DEB.push(e);return e}
function dirOut(p){return typeof mapB!=='undefined'&&mapB&&(p.x<mapB.x0||p.x>mapB.x1||p.z<mapB.z0||p.z>mapB.z1)}
function dirDebStep(p,dt,gOff){const o=p.o,pos=o.position;p.v.y-=25*dt;gOff=gOff||.2;
 _dirW.set(pos.x+p.v.x*dt,pos.y,pos.z);if(inBox(_dirW)||dirOut(_dirW))p.v.x*=-.35;else pos.x=_dirW.x;
 _dirW.set(pos.x,pos.y,pos.z+p.v.z*dt);if(inBox(_dirW)||dirOut(_dirW))p.v.z*=-.35;else pos.z=_dirW.z;
 const ny=pos.y+p.v.y*dt,gy=groundAt(pos.x,pos.z,pos.y+.5)+gOff;_dirW.set(pos.x,ny,pos.z);
 if(p.v.y>0&&inBox(_dirW))p.v.y*=-.3;
 else if(ny<gy){pos.y=Math.max(gy,Math.min(pos.y,gy+.5));if(Math.abs(p.v.y)>3){p.v.y*=-.32;p.v.x*=.6;p.v.z*=.6;p.spin.multiplyScalar(.5);puff(pos.clone(),8,0xf6eee2,5,.5,8);sfx('slam',Math.max(.15,sndV(pos.x,pos.y,pos.z)*.6))}
  else{p.v.set(0,0,0);p.spin.set(0,0,0);p.rest=2;dirSettle(p)}}
 else pos.y=ny;
 o.rotation.x+=p.spin.x*dt;o.rotation.y+=p.spin.y*dt;o.rotation.z+=p.spin.z*dt}
// улёгся: цилиндр — набок, дуга/брус — плашмя; ровно на пол; коллизия (короткий — один бокс, длинный — цепочка вдоль)
function dirSettle(p){const o=p.o;
 if(p.lay==='lie')o.rotation.set(Math.PI/2,rnd(0,6.28),0,'YXZ');
 else if(p.lay==='flat'){const e=new THREE.Euler().setFromQuaternion(o.quaternion,'YXZ');const up=new V3(0,1,0).applyQuaternion(o.quaternion);
  // плоскость дуги/бруса — горизонтально: оставляем только поворот вокруг вертикали
  o.quaternion.setFromEuler(new THREE.Euler(Math.abs(up.y)<.5?Math.PI/2:0,e.y,0,'YXZ'))}
 o.updateMatrixWorld(true);_dB.setFromObject(o);const gy=groundAt(o.position.x,o.position.z,_dB.max.y);o.position.y+=gy-_dB.min.y;o.updateMatrixWorld(true);
 if(p.nocol)return;_dB.setFromObject(o);const sz=_dB.getSize(new V3());if(sz.y<.08)return;
 const bx=[];
 if(Math.max(sz.x,sz.z)<=3.2)bx.push([_dB.min.clone(),_dB.max.clone()]);
 else{const m=o.isMesh?o:null,g=m&&m.geometry;if(!g){bx.push([_dB.min.clone(),_dB.max.clone()])}else{g.computeBoundingBox();const lb=g.boundingBox,ls=lb.getSize(new V3()).toArray(),ax=ls.indexOf(Math.max(...ls));
   const a0=new V3().copy(lb.min),a1=new V3().copy(lb.max);const c=lb.getCenter(new V3());const pa=c.clone(),pb=c.clone();pa.setComponent(ax,a0.getComponent(ax));pb.setComponent(ax,a1.getComponent(ax));
   const wa=o.localToWorld(pa.clone()),wb=o.localToWorld(pb.clone()),L=wa.distanceTo(wb),n=Math.max(2,Math.ceil(L/2.2));
   const sc=o.getWorldScale(new V3()),th=Math.min(2.2,Math.max(.5,[ls[0]*sc.x,ls[1]*sc.y,ls[2]*sc.z].sort((a,b)=>b-a)[1]));
   for(let i=0;i<n;i++){const q=wa.clone().lerp(wb,(i+.5)/n);bx.push([new V3(q.x-th/2,_dB.min.y,q.z-th/2),new V3(q.x+th/2,_dB.max.y,q.z+th/2)])}}}
 p.boxes=[];for(const [mn,mx] of bx)DIR_PEND.push({p,mn,mx})}
// коллизия встаёт, только когда игрок не внутри (иначе запрёт)
function dirPendUpd(){for(let i=DIR_PEND.length-1;i>=0;i--){const b=DIR_PEND[i],pp=P.pos;
  if(pp.x>b.mn.x-.45&&pp.x<b.mx.x+.45&&pp.z>b.mn.z-.45&&pp.z<b.mx.z+.45&&pp.y<b.mx.y&&pp.y+1.8>b.mn.y)continue;
  const box={min:b.mn,max:b.mx};boxes.push(box);b.p.boxes&&b.p.boxes.push(box);DIR_PEND.splice(i,1)}}
function dirUnbox(p){if(!p.boxes)return;for(const b of p.boxes){const i=boxes.indexOf(b);if(i>=0)boxes.splice(i,1)}p.boxes=null;for(let i=DIR_PEND.length-1;i>=0;i--)if(DIR_PEND[i].p===p)DIR_PEND.splice(i,1)}
function dirDebUpd(dt){dirPendUpd();for(const p of DIR_DEB){if(p.rest>1)continue;dirDebStep(p,dt,.05)}}
function dirDeathClear(){for(const D of DIR_DEAD){for(const p of D.parts.concat(D.caps)){dirUnbox(p);p.o.parent&&p.o.parent.remove(p.o)}D.w.parent&&D.w.parent.remove(D.w)}DIR_DEAD.length=0}
/*DIR-END*/
