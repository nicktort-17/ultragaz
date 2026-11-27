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
function heroMats(col){if(HMC[col])return HMC[col];const c=new THREE.Color(col);
 return HMC[col]={armor:M(c,{metalness:.55,roughness:.3,envMap:ENV}),armorD:M(c.clone().multiplyScalar(.42),{metalness:.7,roughness:.34,envMap:ENV})}}
const WING_T=(()=>{const c=document.createElement('canvas');c.width=64;c.height=256;const g=c.getContext('2d');
 const h=g.createLinearGradient(0,0,64,0);h.addColorStop(0,'rgba(255,255,255,0)');h.addColorStop(.38,'rgba(255,255,255,.45)');h.addColorStop(.5,'#fff');h.addColorStop(.62,'rgba(255,255,255,.45)');h.addColorStop(1,'rgba(255,255,255,0)');
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
 bladeA:bladeGeo(.64,.09),bladeB:bladeGeo(.54,.075),bladeC:bladeGeo(.42,.06),wingRoot:new THREE.BoxGeometry(.05,.05,.06)}})();
const heroes=new Set();
function buildHero(color,opt={}){
 const mt=heroMats(color),root=new THREE.Group(),J={},layer=opt.layer||0;
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
  [[HG.bladeA,.42],[HG.bladeB,.85],[HG.bladeC,1.25]].forEach(([geo,a],i)=>{const p=grp(J.wingG,s*.05,0,i*.012);const b=add(p,geo,wingM);p.userData.base=-s*a;p.rotation.z=-s*a;J.blades.push(p)})}
 // голова: горлышко бутылки из тёмного стекла, визор, крышка-гребень
 J.neck=grp(C,0,.42,.01);add(J.neck,HG.neck,HM.chrome);J.head=grp(J.neck,0,.075,0);const Hd=J.head;
 add(Hd,HG.helm,HM.glass);add(Hd,HG.helmBand,mt.armor);add(Hd,HG.jaw,mt.armor);add(Hd,HG.lip,HM.chrome,0,.19,0);add(Hd,HG.crown,HM.crest,0,.222,0);
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
 const h={root,J,layer,color,glow,glowC,wingM,t:Math.random()*9,ph:0,wRun:0,wAir:0,wSlide:0,wDash:0,wSlam:0,hipYaw:0,fireT:0,punchT:0,landT:0,dead:false,deadT:0,wasAir:false,vyPrev:0,lastW:-1,flashT:0};
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
 J.body.rotation.x=-1.32*wFe;J.body.position.set(0,-.08*wFe,-.25*wFe);
 // крылья, визор, ядро
 const hpK=clamp(s.hp/100,0,1),wo=(s.alive?.38+.62*hpK:0)+h.wDash*.6;h.wingM.opacity+=(wo-h.wingM.opacity)*e(9);
 J.blades.forEach((b,i)=>{b.rotation.z=b.userData.base*(1+.3*h.wDash+.14*h.wAir-.3*h.wSlide)+Math.sin(h.t*1.6+i)*.035});
 J.wingG.rotation.x=.42+.35*h.wDash-.2*h.wSlide;
 h.glow.color.copy(h.glowC).multiplyScalar(dead?Math.max(.08,1-h.deadT*1.6):(.85+.15*Math.sin(h.t*3)));
 // оружие
 if(s.w!==h.lastW){h.lastW=s.w;J.tp.forEach((g,i)=>{if(g)g.visible=i===s.w});const u=guns[s.w]&&guns[s.w].userData;if(u&&u.mz)J.flash.position.copy(u.mz).multiplyScalar(1.15).add(new V3(0,0,-.05))}
 h.flashT=Math.max(0,h.flashT-dt);J.flash.visible=h.flashT>0&&s.w!==3;}
function heroFire(h){h.fireT=1;h.flashT=.06;h.J.flash.material.rotation=Math.random()*6.3}
function heroPunch(h){h.punchT=.3}
