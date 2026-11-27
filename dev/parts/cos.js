/* ================= кастомизация героя за очки стиля ================= */
const COS={crest:[['cap','Крышка',0],['straws','Ирокез из трубочек',1500],['crown','Корона из крышек',4000],['horns','Рога-открывашки',8000],['halo','Нимб-колечко',15000]],
 wings:[['blades','Лезвия',0],['bubbles','Пузыри',2500],['jets','Струи',6000],['ribbon','Ленты',12000]],
 pattern:[['solid','Сплошная',0],['wave','Волна',1000],['checker','Клетка',3000],['dots','Пузырьки',7000],['tiger','Тигр',12000]]};
const COS_N={crest:'Гребень',wings:'Крылья',pattern:'Броня'};
let bank=0,bankDirty=false,bankSaveT=0;try{bank=Math.max(0,+localStorage.getItem('ug-sp')||0)}catch(e){}
const cosOk=(k,i)=>COS[k][i]&&bank>=COS[k][i][2];
let myCos={crest:0,wings:0,pattern:0};try{const c=JSON.parse(localStorage.getItem('ug-cos')||'{}');for(const k in myCos)if(Number.isInteger(c[k])&&cosOk(k,c[k]))myCos[k]=c[k]}catch(e){}
const cosStr=c=>c.crest+'.'+c.wings+'.'+c.pattern;
function parseCos(s){const a=String(s||'').split('.').map(x=>Math.max(0,Math.floor(+x)||0));return{crest:Math.min(a[0]||0,COS.crest.length-1),wings:Math.min(a[1]||0,COS.wings.length-1),pattern:Math.min(a[2]||0,COS.pattern.length-1)}}
function bankAdd(pts){const prev=bank;bank+=pts;bankDirty=true;
 for(const k in COS)for(const [,nm,cost] of COS[k])if(cost>prev&&cost<=bank){banner('ОТКРЫТО: '+nm.toUpperCase());feed.unshift({label:'★ '+COS_N[k]+': '+nm,t:3.5});sfx('ding')}}
function bankTick(dt){bankSaveT-=dt;if(bankDirty&&bankSaveT<=0){bankSaveT=2;bankDirty=false;save('ug-sp',Math.round(bank))}}
const PAT_T={};
function patTex(id){if(!id||id==='solid')return null;if(PAT_T[id])return PAT_T[id];const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d');let sd=7;const rn=()=>(sd=(sd*16807)%2147483647)/2147483647;
 g.fillStyle='#fff';g.fillRect(0,0,128,128);g.fillStyle='#6e6e6e';
 if(id==='wave'){g.beginPath();g.moveTo(0,128);for(let x=0;x<=128;x+=4)g.lineTo(x,62+Math.sin(x/128*Math.PI*2)*20);g.lineTo(128,128);g.fill();g.strokeStyle='#ffffff';g.lineWidth=7;g.beginPath();for(let x=0;x<=128;x+=4)g.lineTo(x,50+Math.sin(x/128*Math.PI*2)*20);g.stroke()}
 else if(id==='checker'){for(let i=0;i<4;i++)for(let j=0;j<4;j++)if((i+j)%2)g.fillRect(i*32,j*32,32,32)}
 else if(id==='dots'){for(let k=0;k<26;k++){const r=3+rn()*11;g.beginPath();g.arc(rn()*128,rn()*128,r,0,7);g.fill()}g.fillStyle='#fff';for(let k=0;k<14;k++){g.beginPath();g.arc(rn()*128,rn()*128,1.5+rn()*2,0,7);g.fill()}}
 else if(id==='tiger'){g.fillStyle='#3e3e3e';for(let k=0;k<6;k++){const y=k*22+rn()*8;g.beginPath();g.moveTo(-4,y);g.lineTo(40+rn()*30,y+6+rn()*6);g.lineTo(70+rn()*40,y+2);g.lineTo(132,y+10);g.lineTo(132,y+14);g.lineTo(60+rn()*30,y+12);g.lineTo(-4,y+9);g.fill()}}
 const t=new THREE.CanvasTexture(c);t.anisotropy=MAXA;t.wrapS=t.wrapT=THREE.RepeatWrapping;return PAT_T[id]=t}
const BUB_T=(()=>{const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d'),r=g.createRadialGradient(64,64,30,64,64,62);
 r.addColorStop(0,'rgba(255,255,255,.08)');r.addColorStop(.75,'rgba(255,255,255,.35)');r.addColorStop(.92,'#fff');r.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=r;g.beginPath();g.arc(64,64,62,0,7);g.fill();
 g.fillStyle='rgba(255,255,255,.9)';g.beginPath();g.ellipse(44,42,12,7,-.7,0,7);g.fill();const t=new THREE.CanvasTexture(c);t.minFilter=THREE.LinearFilter;return t})();
const STRAW_T=(()=>{const c=document.createElement('canvas');c.width=8;c.height=64;const g=c.getContext('2d');for(let i=0;i<8;i++){g.fillStyle=i%2?'#f6eee2':'#d0122c';g.fillRect(0,i*8,8,8)}const t=new THREE.CanvasTexture(c);t.magFilter=THREE.NearestFilter;return t})();
const CG={straw:new THREE.CylinderGeometry(.011,.011,1,8).translate(0,.5,0),capS:crownGeo(.036,13),hornBar:new THREE.BoxGeometry(.028,.17,.012).translate(0,.085,0),hornRing:new THREE.TorusGeometry(.032,.01,6,16),
 halo:new THREE.TorusGeometry(.12,.012,8,28).rotateX(Math.PI/2),tab:new THREE.BoxGeometry(.05,.008,.03),band:new THREE.TorusGeometry(.078,.012,6,18).rotateX(Math.PI/2),
 jetA:bladeGeo(1.08,.065),jetB:bladeGeo(.95,.06),jetC:bladeGeo(.78,.05),ribA:bladeGeo(.74,.36),ribB:bladeGeo(.6,.3),bub:new THREE.CircleGeometry(1,22)};
const strawM=M(0xffffff,{map:STRAW_T,roughness:.4});
function buildCrest(h,Hd,add,id){const grp=(x,y,z)=>{const g=new THREE.Group();g.position.set(x,y,z);Hd.add(g);return g};
 if(id!=='straws'&&id!=='crown')add(Hd,HG.crown,HM.crest,0,.222,0);
 if(id==='straws'){add(Hd,HG.crown,HM.crest,0,.205,0).scale.set(1,.6,1);for(let i=-2;i<=2;i++){const m=add(Hd,CG.straw,strawM,0,.21,i*.022,i*.34);m.scale.y=.28-.045*Math.abs(i)}}
 else if(id==='crown'){add(Hd,CG.band,HM.gold,0,.2,0);for(let k=0;k<6;k++){const a=k/6*Math.PI*2,g=grp(Math.sin(a)*.064,.23,Math.cos(a)*.064);g.rotation.y=a;add(g,CG.capS,k%2?HM.gold:HM.crest,0,0,0,Math.PI/2-.35)}}
 else if(id==='horns'){for(const s of[-1,1]){const g=grp(s*.075,.18,.01);g.rotation.z=-s*.55;g.rotation.x=.25;add(g,CG.hornBar,HM.chrome);add(g,CG.hornRing,HM.chrome,0,.19,0,0,Math.PI/2);add(g,new THREE.BoxGeometry(.03,.03,.014),HM.gold,0,.02,0)}}
 else if(id==='halo'){const g=grp(0,.34,0);add(g,CG.halo,h.glow);add(g,CG.tab,h.glow,.13,0,0);h.J.halo=g}}
const WINGS={blades:[[HG.bladeA,.42],[HG.bladeB,.85],[HG.bladeC,1.25]],jets:[[CG.jetA,.2],[CG.jetB,.45],[CG.jetC,.72]],ribbon:[[CG.ribA,.55],[CG.ribB,1.05]],bubbles:[[null,.35],[null,.8],[null,1.25]]};
