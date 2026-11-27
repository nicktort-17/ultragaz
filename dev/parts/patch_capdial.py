import os,sys;sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'));from ugenv import *  # пути окружения
# Циферблат перезарядки крышечек на задней крышке «Шипучки».
import re
P=INDEX
s=open(P,encoding='utf-8').read()
JS=r'''/*CAPDIAL*/
const CD={mesh:null,cv:null,g:null,tex:null,key:'',flash:0,fi:-1,prev:4};
function capRegenT(){return nick.trim().toLowerCase()==='torch'?.5:1.6}
function capDialSetup(){const u=guns[0]&&guns[0].userData;if(!u||!u.glb||CD.mesh)return;let back=null;u.model.traverse(o=>{if(!back&&/^Задняя[ _]крышка$/.test(o.name))back=o});if(!back)return;
 const cv=document.createElement('canvas');cv.width=cv.height=256;CD.cv=cv;CD.g=cv.getContext('2d');CD.tex=new THREE.CanvasTexture(cv);CD.tex.anisotropy=8;if('colorSpace' in CD.tex)CD.tex.colorSpace=THREE.SRGBColorSpace;else CD.tex.encoding=THREE.sRGBEncoding;
 const mat=new THREE.MeshStandardMaterial({map:CD.tex,emissiveMap:CD.tex,emissive:0xffffff,emissiveIntensity:.32,roughness:.38,metalness:.05,envMap:ENV,envMapIntensity:.6,polygonOffset:true,polygonOffsetFactor:-2});
 const geo=new THREE.CircleGeometry(.0425,48);geo.rotateZ(CD_ROT);geo.rotateX(Math.PI/2);const m=new THREE.Mesh(geo,mat);m.position.y=-.00615;m.renderOrder=2;back.add(m);CD.mesh=m;CD.key=''}
const CD_ROT=Math.PI;
function crown(g,x,y,r,fill,rim,k){g.beginPath();const n=21;for(let i=0;i<=n*2;i++){const a=i/(n*2)*Math.PI*2,rr=i%2?r*.86:r;g.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr)}g.closePath();
 if(fill){g.fillStyle=fill;g.fill()}if(rim){g.lineWidth=k||2.5;g.strokeStyle=rim;g.stroke()}}
function capDialDraw(ch,p,fl,fi){const g=CD.g,W=256,c=W/2;g.clearRect(0,0,W,W);
 // фон — эмаль корпуса
 let gr=g.createRadialGradient(c,c*.8,10,c,c,c);gr.addColorStop(0,'#fffaf2');gr.addColorStop(.8,'#f1e6d6');gr.addColorStop(1,'#d9c9b3');g.fillStyle=gr;g.fillRect(0,0,W,W);
 // шкала: 4 сегмента по краю, по одному на крышечку
 const R0=104,R1=122,gap=.11;g.lineCap='butt';
 for(let i=0;i<4;i++){const a0=-Math.PI/2+i*Math.PI/2+gap,a1=-Math.PI/2+(i+1)*Math.PI/2-gap;
  g.beginPath();g.arc(c,c,(R0+R1)/2,a0,a1);g.lineWidth=R1-R0;g.strokeStyle='#2b2b30';g.stroke();
  const f=i<ch?1:i===ch?p:0;if(f>0){const ae=a0+(a1-a0)*f;g.beginPath();g.arc(c,c,(R0+R1)/2,a0,ae);g.lineWidth=R1-R0-6;
   const sg=g.createLinearGradient(0,c-R1,0,c+R1);sg.addColorStop(0,i<ch?'#ff4a4a':'#ffb03a');sg.addColorStop(1,i<ch?'#b30c1c':'#e0662a');g.strokeStyle=sg;g.stroke();
   if(i===ch){const tx=c+Math.cos(ae)*(R0+R1)/2,ty=c+Math.sin(ae)*(R0+R1)/2;const tg=g.createRadialGradient(tx,ty,0,tx,ty,14);tg.addColorStop(0,'rgba(255,255,220,1)');tg.addColorStop(1,'rgba(255,200,80,0)');g.fillStyle=tg;g.beginPath();g.arc(tx,ty,14,0,7);g.fill()}}}
 // риски
 g.strokeStyle='rgba(43,43,48,.55)';g.lineWidth=2;for(let i=0;i<24;i++){if(i%6===0)continue;const a=-Math.PI/2+i/24*Math.PI*2;g.beginPath();g.moveTo(c+Math.cos(a)*95,c+Math.sin(a)*95);g.lineTo(c+Math.cos(a)*100,c+Math.sin(a)*100);g.stroke()}
 // крышечки: готовые — красные, заряжающаяся наполняется снизу, пустые — контур
 for(let i=0;i<4;i++){const a=-Math.PI/4+i*Math.PI/2,x=c+Math.cos(a)*60,y=c+Math.sin(a)*60,pop=i===fi?1+fl*.35:1,r=27*pop;
  g.save();g.translate(x,y);g.rotate(a+Math.PI/2);
  if(i<ch){crown(g,2,3,r,'rgba(0,0,0,.25)');crown(g,0,0,r,null,null);const cg=g.createRadialGradient(-r*.3,-r*.35,2,0,0,r);cg.addColorStop(0,'#ff6a5e');cg.addColorStop(.6,'#d0121f');cg.addColorStop(1,'#7a0812');g.fillStyle=cg;g.fill();g.lineWidth=2;g.strokeStyle='#5a0510';g.stroke();
   g.beginPath();g.arc(0,0,r*.6,0,7);g.fillStyle='#f6eee2';g.fill();g.beginPath();g.arc(0,0,r*.6,0,7);g.lineWidth=2;g.strokeStyle='#b30c1c';g.stroke();
   g.fillStyle='#c8102e';for(const [bx,by,br] of[[-.18,.12,.13],[.14,-.1,.09],[.2,.2,.06],[-.05,-.25,.07]]){g.beginPath();g.arc(bx*r,by*r,br*r,0,7);g.fill()}
   g.beginPath();g.ellipse(-r*.38,-r*.42,r*.22,r*.1,-.6,0,7);g.fillStyle='rgba(255,255,255,.55)';g.fill()}
  else{crown(g,0,0,r,'rgba(43,43,48,.10)','rgba(43,43,48,.55)',2.5);g.setLineDash([4,4]);g.beginPath();g.arc(0,0,r*.6,0,7);g.lineWidth=2;g.strokeStyle='rgba(43,43,48,.45)';g.stroke();g.setLineDash([]);
   if(i===ch&&p>0){g.save();g.rotate(-(a+Math.PI/2));crown(g,0,0,r,null,null);g.clip();const h=2*r*p;const lg=g.createLinearGradient(0,r,0,-r);lg.addColorStop(0,'#c8102e');lg.addColorStop(1,'#ff7a4a');g.fillStyle=lg;g.fillRect(-r,r-h,2*r,h);
    g.fillStyle='rgba(255,230,220,.85)';for(let k=0;k<5;k++){const bx=(-.6+k*.3)*r,by=r-h*((k*37%10)/10)*.9;if(by>r-h+3){g.beginPath();g.arc(bx,by,1.8+k%2,0,7);g.fill()}}
    g.fillStyle='rgba(255,255,255,.7)';g.fillRect(-r,r-h,2*r,2);g.restore()}}
  g.restore();
  if(i===fi&&fl>0){g.beginPath();g.arc(x,y,r+6+(1-fl)*16,0,7);g.lineWidth=4*fl;g.strokeStyle='rgba(255,210,90,'+fl+')';g.stroke()}}
 // центр: счётчик
 g.beginPath();g.arc(c,c,24,0,7);const hg=g.createRadialGradient(c-6,c-8,2,c,c,24);hg.addColorStop(0,'#4a4a52');hg.addColorStop(1,'#1c1c20');g.fillStyle=hg;g.fill();g.lineWidth=3;g.strokeStyle='#f2b84b';g.stroke();
 g.fillStyle=ch>0?'#ffffff':'#ff5a5a';g.font='400 30px "Russo One",Arial,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(String(ch),c,c+1);
 CD.tex.needsUpdate=true}
function capDial(dt){if(!CD.mesh){capDialSetup();if(!CD.mesh)return}
 if(coinCh>CD.prev){CD.flash=1;CD.fi=coinCh-1;if(typeof sfx==='function')try{sfx('ding',.12)}catch(e){}}CD.prev=coinCh;CD.flash=Math.max(0,CD.flash-dt*2.6);
 const p=coinCh<4?Math.min(1,coinRegen/capRegenT()):0,key=coinCh+'|'+Math.round(p*60)+'|'+Math.round(CD.flash*20);
 CD.mesh.material.emissiveIntensity=.32+CD.flash*.9;if(key===CD.key||!guns[0].visible&&CD.key)return;CD.key=key;capDialDraw(coinCh,p,CD.flash,CD.fi)}
/*CAPDIAL-END*/
'''
if '/*CAPDIAL*/' in s: s=re.sub(r'/\*CAPDIAL\*/.*?/\*CAPDIAL-END\*/\n',lambda m:JS,s,flags=re.S)
else:
    a='/* ================= hud & loop ================= */';assert s.count(a)==1;s=s.replace(a,a+'\n'+JS)
h="function hud(dt){bankTick(dt);"
if 'capDial(dt);' not in s: assert s.count(h)==1;s=s.replace(h,h+'capDial(dt);')
open(P,'w',encoding='utf-8').write(s);print('capdial ok')
