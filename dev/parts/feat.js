/* ================= лужи колы: ловушка для врагов ================= */
const PUD_GS=[0,1,2].map(s=>{const sh=new THREE.Shape(),N=26;for(let i=0;i<=N;i++){const a=i/N*Math.PI*2,r=1+.13*Math.sin(a*3+s*2)+.08*Math.sin(a*5+s*4)+.05*Math.cos(a*7+s);const x=Math.cos(a)*r,y=Math.sin(a)*r;i?sh.lineTo(x,y):sh.moveTo(x,y)}
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
let geysers=[];const GEY_G=new THREE.CylinderGeometry(.5,.95,1,16,1,true).translate(0,.5,0),FOAM_G=new THREE.SphereGeometry(1,14,10);
function geyserFx(x,y,z){const col=new THREE.Mesh(GEY_G,new THREE.MeshStandardMaterial({color:0x5a1f0a,roughness:.15,metalness:.2,transparent:true,opacity:.9,side:THREE.DoubleSide,emissive:0x1a0600}));
 const foam=new THREE.Mesh(FOAM_G,new THREE.MeshStandardMaterial({color:0xf6eee2,roughness:.6,emissive:0x332a20}));col.position.set(x,y,z);foam.position.set(x,y,z);scene.add(col,foam);
 geysers.push({col,foam,x,y,z,t:0});blast(new V3(x,y+.5,z),3,0xf6eee2);ring(new V3(x,y,z),5,0x6b2a12);sfx('jet');sfx('boom',.5);shake=Math.max(shake,Math.min(.35,.5-camera.position.distanceTo(new V3(x,y,z))/40))}
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
 for(const g of geysers){g.t+=dt;const t=g.t,up=t<.22?t/.22:t<1.1?1:Math.max(0,1-(t-1.1)/.5),h=10*up*(1+Math.sin(t*30)*.03),w=.8+.25*Math.sin(t*18);
  g.col.scale.set(w,Math.max(.01,h),w);g.foam.position.set(g.x,g.y+h,g.z);g.foam.scale.setScalar(Math.max(.01,(1.1+Math.sin(t*25)*.15)*up));
  if(up>.2){const top=new V3(g.x,g.y+h,g.z);puff(top,5,Math.random()<.5?0x6b2a12:0xf6eee2,7,.9,16);if(Math.random()<.5)puff(new V3(g.x,g.y+.3,g.z),3,0xf6eee2,5,.5,8)}
  if(t>1.65){scene.remove(g.col,g.foam);g.col.material.dispose();g.foam.material.dispose();g.dead=true}}
 geysers=geysers.filter(g=>!g.dead)}
function clearCola(){puddles.forEach(p=>{scene.remove(p.m);p.m.material.dispose()});puddles=[];geysers.forEach(g=>scene.remove(g.col,g.foam));geysers=[];if(bossRing){scene.remove(bossRing);bossRing=null}}
/* ================= босс: Генеральный Директор Газ-Ада ================= */
let bossRing=null;const UPV=new V3(0,1,0);
function buildBoss(g,mm,add){const suit=mm(0x5c0b16,{metalness:.55,roughness:.3}),dark=mm(0x15161b,{metalness:.8,roughness:.34}),chrome=mm(0xdfe4ea,{metalness:1,roughness:.12}),
 gold=mm(0xf2b84b,{metalness:.9,roughness:.2}),cream=mm(0xf6eee2,{roughness:.4}),red=mm(0xc8102e,{metalness:.5,roughness:.26}),goldD=mm(0xf2b84b,{metalness:.9,roughness:.2,side:THREE.DoubleSide}),redD=mm(0xc8102e,{metalness:.5,roughness:.26,side:THREE.DoubleSide});const B={};
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
