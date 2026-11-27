p='/home/claude/ultra/parts/story.js';s=open(p).read()
i=s.index("function addBeacon(di){");j=s.index("beacons.push({d:di,g,ar,bm,h:d.h})}")+len("beacons.push({d:di,g,ar,bm,h:d.h})}")
new=r"""/* маркер выхода: неоновая рамка шлюза, бегущие шевроны на полу, голо-табличка и метка на экране */
let MKT=null;
function markTex(){if(MKT)return MKT;const mk=(w,h,f)=>{const c=document.createElement('canvas');c.width=w;c.height=h;f(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.anisotropy=4;return t};
 MKT={chev:mk(128,128,(g,w,h)=>{g.shadowColor='#62e3ff';g.shadowBlur=14;g.strokeStyle='#eaffff';g.lineWidth=16;g.lineCap='round';g.lineJoin='round';g.beginPath();g.moveTo(22,92);g.lineTo(64,46);g.lineTo(106,92);g.stroke()}),
  sign:mk(512,160,(g,w,h)=>{g.shadowColor='#62e3ff';g.shadowBlur=18;g.strokeStyle='#bff6ff';g.lineWidth=5;g.beginPath();g.moveTo(40,20);g.lineTo(w-40,20);g.lineTo(w-14,80);g.lineTo(w-40,140);g.lineTo(40,140);g.lineTo(14,80);g.closePath();g.stroke();
   g.fillStyle='#eaffff';g.font='italic 900 78px "Russo One",Arial';g.textAlign='center';g.textBaseline='middle';g.fillText('ВЫХОД',w/2,84)}),
  ring:mk(256,256,(g,w,h)=>{const c=w/2;g.translate(c,c);g.shadowColor='#ff2a3a';g.shadowBlur=16;g.strokeStyle='#ffd0d6';g.lineWidth=7;g.beginPath();g.arc(0,0,100,0,7);g.stroke();
   g.lineWidth=4;g.setLineDash([16,12]);g.beginPath();g.arc(0,0,78,0,7);g.stroke();g.setLineDash([]);g.lineWidth=5;const n=21;g.beginPath();for(let i=0;i<=n*2;i++){const a=i/(n*2)*Math.PI*2,r=i%2?44:56;g.lineTo(Math.cos(a)*r,Math.sin(a)*r)}g.stroke()}),
  beam:mk(16,128,(g,w,h)=>{const gr=g.createLinearGradient(0,h,0,0);gr.addColorStop(0,'rgba(255,255,255,.95)');gr.addColorStop(.25,'rgba(255,255,255,.35)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,w,h)})};return MKT}
function addBeacon(di){const d=doors[di],t=markTex(),g=new THREE.Group();g.visible=false;mapGroup.add(g);const zf=d.z+.58,w=d.box.max.x-d.box.min.x,add=(m,x,y,z)=>{m.position.set(x,y,z);g.add(m);return m};
 const fm=new THREE.MeshBasicMaterial({color:0x62e3ff});const bar=(x,y,bw,bh)=>add(new THREE.Mesh(new THREE.BoxGeometry(bw,bh,.1),fm),x,y,zf);
 bar(d.x-w/2-.12,d.y+d.h/2,.14,d.h+.24);bar(d.x+w/2+.12,d.y+d.h/2,.14,d.h+.24);bar(d.x,d.y+d.h+.12,w+.38,.14);
 const glowM=new THREE.MeshBasicMaterial({color:0x62e3ff,map:t.beam,transparent:true,opacity:.35,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide});
 add(new THREE.Mesh(new THREE.PlaneGeometry(w+.6,d.h*.7),glowM),d.x,d.y+d.h*.35,zf+.02);
 const chev=[];for(let k=0;k<6;k++){const z=zf+1.4+k*1.5,y=groundAt(d.x,z,d.y+1.2)+.04,m=new THREE.MeshBasicMaterial({map:t.chev,color:0x62e3ff,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false});
  const c=add(new THREE.Mesh(new THREE.PlaneGeometry(1.7,1.7).rotateX(-Math.PI/2),m),d.x,y,z);c.renderOrder=3;chev.push(m)}
 const sm=new THREE.MeshBasicMaterial({map:t.sign,color:0x9ff0ff,transparent:true,opacity:.9,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide});
 const sg=add(new THREE.Mesh(new THREE.PlaneGeometry(2.6,.82),sm),d.x,d.y+d.h+1.05,zf+.25);
 beacons.push({d:di,g,fm,glowM,chev,sg,sm,h:d.h,x:d.x,y:d.y,z:zf})}
const _wp=new V3();
function updBeacons(dt,S,R){let tgt=null;for(const b of beacons){const on=(S.phase==='clear'&&R&&R.exit===b.d)||(S.room<0&&b.d===S.lv.open[0]);b.g.visible=on;if(!on)continue;tgt=b;
  const p=.5+.5*Math.sin(lvT*4);b.fm.color.setRGB(.38+.62*p,.89+.11*p,1);b.glowM.opacity=.18+.2*p;b.sg.position.y=b.y+b.h+1.05+Math.sin(lvT*2.2)*.12;b.sm.opacity=.7+.3*p;
  b.chev.forEach((m,k)=>{const ph=((lvT*1.6-(b.chev.length-k)*.18)%1+1)%1;m.opacity=Math.pow(Math.max(0,1-ph*2.2),1.5)*.95+.08})}
 const el=$('wp');if(!tgt||state!=='play'||!P.alive){el.hidden=true;return}
 _wp.set(tgt.x,tgt.y+tgt.h*.55,tgt.z);const dist=Math.round(_wp.distanceTo(P.pos));_wp.project(camera);let x=_wp.x,y=_wp.y;const behind=_wp.z>1;if(behind){x=-x;y=-y}
 const off=behind||Math.abs(x)>.92||Math.abs(y)>.86;if(off){const k=Math.max(Math.abs(x)/.92,Math.abs(y)/.86,1e-3);x/=k;y/=k;if(behind&&Math.abs(y)<.86&&Math.abs(x)<.92){x=x<0?-.92:.92}}
 el.hidden=dist<4&&!off;el.classList.toggle('off',off);el.style.transform='translate('+((x*.5+.5)*el.parentElement.clientWidth)+'px,'+((-y*.5+.5)*el.parentElement.clientHeight)+'px)';el.querySelector('b').textContent=dist+' м'}
/* метка появления врага: круг-крышка на полу и короткий столб света, гаснущий вверх */
function makeTele(pos,big){const t=markTex(),g=new THREE.Group(),s=big?2.2:1;g.position.set(pos.x,pos.y+.05,pos.z);
 const rm=new THREE.MeshBasicMaterial({map:t.ring,color:big?0xff5a1a:0xff2a3a,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false});
 const ring=new THREE.Mesh(new THREE.PlaneGeometry(3*s,3*s).rotateX(-Math.PI/2),rm);ring.renderOrder=3;g.add(ring);
 const bm=new THREE.MeshBasicMaterial({map:t.beam,color:big?0xff7a3a:0xff3a4a,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide});
 const beam=new THREE.Mesh(new THREE.CylinderGeometry(.95*s,1.15*s,3.4*s,24,1,true),bm);beam.position.y=1.7*s;g.add(beam);
 g.userData={ring,rm,beam,bm,s,dur:0};scene.add(g);return g}
function teleAnim(t,dt){const u=t.m.userData;if(!u.ring){t.m.scale.x=t.m.scale.z=.3+t.t;return}if(!u.dur)u.dur=t.t+dt;const k=1-Math.max(0,t.t)/u.dur;
 u.ring.rotation.y+=dt*(2+k*6);const sc=1.25-.35*k;u.ring.scale.set(sc,1,sc);u.rm.opacity=Math.min(1,k*4)*(.75+.25*Math.sin(T*30));
 u.beam.scale.set(1-.5*k,.4+.9*Math.min(1,k*2),1-.5*k);u.bm.opacity=Math.min(.75,k*1.6);if(Math.random()<dt*25)puff(new V3(t.pos.x+rnd(-1,1)*u.s,t.pos.y+.2,t.pos.z+rnd(-1,1)*u.s),1,0xff5a5a,2,.5,-4)}"""
s=s[:i]+new+s[j:]
a="for(const b of beacons){const on=(S.phase==='clear'&&R&&R.exit===b.d)||(S.room<0&&b.d===S.lv.open[0]);b.g.visible=on;if(on){b.ar.position.y=b.h+1.5+Math.sin(lvT*4)*.35;b.ar.rotation.y+=dt*2;b.bm.opacity=.12+.07*Math.sin(lvT*4)}}"
assert s.count(a)==1;s=s.replace(a,"updBeacons(dt,S,R);")
a="if(spec.boss){const p=new V3(...R.bossAt),mm=new THREE.Mesh(new THREE.CylinderGeometry(2.2,2.2,16,20,1,true),new THREE.MeshBasicMaterial({color:0xff2a3a,transparent:true,opacity:.35,side:THREE.DoubleSide,depthWrite:false}));mm.position.set(p.x,p.y+8,p.z);scene.add(mm);telegraphs.push({m:mm,pos:p,type:'boss',t:1.8})}"
assert s.count(a)==1;s=s.replace(a,"if(spec.boss){const p=new V3(...R.bossAt);telegraphs.push({m:makeTele(p,true),pos:p,type:'boss',t:1.8})}")
a="for(const p of proj)if(p.mark){scene.remove(p.mark);p.mark=null}$('syr').style.opacity=0}"
assert s.count(a)==1;s=s.replace(a,"for(const p of proj)if(p.mark){scene.remove(p.mark);p.mark=null}$('syr').style.opacity=0;$('wp').hidden=true}")
open(p,'w').write(s)
p='/home/claude/ultra/index.html';t=open(p).read()
rep=[("  const pos=sp.clone().add(new V3(rnd(-2,2),0,rnd(-2,2)));const m=new THREE.Mesh(new THREE.CylinderGeometry(1.2,1.2,14,16,1,true),new THREE.MeshBasicMaterial({color:0xff2a3a,transparent:true,opacity:.35,side:THREE.DoubleSide,depthWrite:false}));\n  m.position.set(pos.x,pos.y+7,pos.z);scene.add(m);telegraphs.push({m,pos,type,t:.8});spawnT=.55}",
"  const pos=sp.clone().add(new V3(rnd(-2,2),0,rnd(-2,2)));if(!ENEMY[type].fly)pos.y=groundAt(pos.x,pos.z,pos.y+.6);telegraphs.push({m:makeTele(pos,type==='boss'||type==='golem'),pos,type,t:.8});spawnT=.55}"),
(" for(const t of telegraphs){t.t-=dt;t.m.scale.x=t.m.scale.z=.3+t.t;if(t.t<=0)"," for(const t of telegraphs){t.t-=dt;teleAnim(t,dt);if(t.t<=0)"),
('<div id="syr"></div>','<div id="syr"></div><div id="wp" hidden><i></i><b></b></div>'),
("</style>\n</head>","#wp{position:absolute;left:0;top:0;margin:-14px 0 0 -14px;pointer-events:none;display:flex;flex-direction:column;align-items:center;gap:4px;z-index:3}\n#wp[hidden]{display:none}\n#wp i{width:20px;height:20px;border:3px solid #62e3ff;transform:rotate(45deg);box-shadow:0 0 12px #62e3ff,inset 0 0 8px #62e3ff;animation:wpP 1s ease-in-out infinite}\n#wp b{font:700 11px/1 Rubik,sans-serif;letter-spacing:.14em;color:#dff9ff;text-shadow:0 0 6px #000,0 0 10px #2a63e6}\n#wp.off i{border-color:#fff;opacity:.85}\n@keyframes wpP{50%{transform:rotate(45deg) scale(1.2)}}\n</style>\n</head>"),
]
for a,b in rep:
    assert t.count(a)==1,a[:60];t=t.replace(a,b)
open(p,'w').write(t)
print('ok')
