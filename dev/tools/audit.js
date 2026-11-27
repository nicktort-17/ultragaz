(id)=>{
 curMap=null;loadMap(id);
 const out={map:id,boxes:boxes.length,meshes:level.length,visualNoSolid:[],spawnBad:[],tunnel:{},escapes:{}};
 // 1. стены, которые видно и в которые бьют пули, но нет столкновения
 const bb=new THREE.Box3(),c=new THREE.Vector3(),sz=new THREE.Vector3();
 const inSolid=(x,y,z)=>boxes.some(b=>x>b.min.x-.05&&x<b.max.x+.05&&z>b.min.z-.05&&z<b.max.z+.05&&y>b.min.y-.05&&y<b.max.y+.05);
 mapGroup.updateMatrixWorld(true);
 for(const m of level){if(!m.geometry)continue;const mt=Array.isArray(m.material)?m.material[0]:m.material;if(mt&&mt.side===THREE.BackSide)continue;
  if(m.geometry.type==='CylinderGeometry'&&m.geometry.parameters.openEnded)continue;
  bb.setFromObject(m);bb.getSize(sz);if(Math.max(sz.x,sz.z)<.9||sz.y<1.2)continue;bb.getCenter(c);
  // берём несколько точек на высоте игрока внутри меша
  let miss=0,tot=0;for(const fx of[.25,.5,.75])for(const fz of[.25,.5,.75]){const x=bb.min.x+sz.x*fx,z=bb.min.z+sz.z*fz,y=Math.min(bb.max.y-.1,Math.max(bb.min.y+.1,1));
   if(m.geometry.type==='CylinderGeometry'||m.geometry.type==='SphereGeometry'){const rr=Math.hypot(x-c.x,z-c.z);if(rr>Math.min(sz.x,sz.z)/2*.6)continue}tot++;if(!inSolid(x,y,z))miss++}
  if(tot&&miss/tot>.5)out.visualNoSolid.push(m.geometry.type+' @'+[c.x,c.y,c.z].map(v=>v.toFixed(1))+' size '+[sz.x,sz.y,sz.z].map(v=>v.toFixed(1))+' miss '+miss+'/'+tot)}
 // 2. точки спавна/чекпоинты внутри геометрии
 const pts=[];if(id==='l1'||id==='l2'||id==='l3'){const L=LEVELS.find(l=>l.id===id);pts.push(['start',L.start]);L.rooms.forEach((R,i)=>{pts.push(['cp'+i,R.cp]);R.sp.forEach((s,k)=>pts.push(['sp'+i+'.'+k,s]));if(R.bossAt)pts.push(['boss'+i,R.bossAt]);(R.qspots||[]).forEach(q=>pts.push(['q'+i,[q[0],0,q[1]]]))})}
 else spawns.forEach((s,k)=>pts.push(['spawn'+k,[s.x,s.y,s.z]]));
 for(const [n,a] of pts){const p=new THREE.Vector3(a[0],a[1]+.02,a[2]);for(const [kind,r,h] of [['player',.4,1.75],['vend',.8,2.5],['boss',1.3,4.6]])if(boxes.some(b=>ov(p,r,h,b))){out.spawnBad.push(n+':'+kind+' '+a.join(','));}}
 // 3. динамика: быстрые тела, ищем пролёт сквозь коробку и выход за карту
 const ext={x0:1e9,x1:-1e9,z0:1e9,z1:-1e9};for(const b of boxes){if(b.max.y-b.min.y<2)continue;ext.x0=Math.min(ext.x0,b.min.x);ext.x1=Math.max(ext.x1,b.max.x);ext.z0=Math.min(ext.z0,b.min.z);ext.z1=Math.max(ext.z1,b.max.z)}
 const segHit=(a,b2,B,r,h)=>{// отрезок пути тела (средняя высота) против коробки, ужатой на 0.08
  const lo=[B.min.x-r+.22,B.min.y-h+.65,B.min.z-r+.22],hi=[B.max.x+r-.22,B.max.y-.65,B.max.z+r-.22];if(hi[1]<lo[1])return false;
  const o=[a.x,a.y,a.z],d=[b2.x-a.x,b2.y-a.y,b2.z-a.z];let t0=0,t1=1;
  for(let i=0;i<3;i++){if(Math.abs(d[i])<1e-9){if(o[i]<lo[i]||o[i]>hi[i])return false}else{let u=(lo[i]-o[i])/d[i],w=(hi[i]-o[i])/d[i];if(u>w)[u,w]=[w,u];t0=Math.max(t0,u);t1=Math.min(t1,w);if(t0>t1)return false}}return true};
 const bodies=[['player',.4,1.75,true],['vend',.64,2.5,true],['golem',1.1,4.5,true],['boss',1.3,4.6,false]];
 const floors=boxes.filter(b=>b.max.y<=.6&&b.max.y>=-.2&&(b.max.x-b.min.x)*(b.max.z-b.min.z)>20);
 for(const [kind,r,h,step] of bodies){let tun=0,esc=0,ex='',ex2='';const p=new THREE.Vector3(),v=new THREE.Vector3(),prev=new THREE.Vector3();
  for(let trial=0;trial<700;trial++){
   // старт: случайно на полу
   let ok=false;for(let k=0;k<40&&!ok;k++){const f=floors[Math.floor(Math.random()*floors.length)];p.set(f.min.x+Math.random()*(f.max.x-f.min.x),f.max.y+.01,f.min.z+Math.random()*(f.max.z-f.min.z));ok=!boxes.some(b=>ov(p,r,h,b))}
   if(!ok)continue;
   for(let s=0;s<60;s++){const sp=[13,30,44,60][s%4];if(s%6===0){const a=Math.random()*6.28;v.set(Math.sin(a)*sp,Math.random()<.3?rnd(-30,25):v.y,Math.cos(a)*sp)}
    v.y-=27*.033;prev.copy(p);window.__v0=[v.x,v.y,v.z];moveBody(p,v,r,h,.033,step);
    if(boxes.some(B=>!ov(prev,r,h,B)&&!ov(p,r,h,B)&&segHit(prev,p,B,r,h))){tun++;if(!ex)ex=[prev.x,prev.y,prev.z,'->',p.x,p.y,p.z,'v',v.x,v.y,v.z,'v0',...window.__v0].map(q=>typeof q==='number'?q.toFixed(2):q).join(' ')}
    if(p.y<-12)break;
    if(id!=='plaza'&&(p.x<ext.x0-.5||p.x>ext.x1+.5||p.z<ext.z0-.5||p.z>ext.z1+.5)){esc++;if(!ex2)ex2=[prev.x,prev.y,prev.z,'->',p.x,p.y,p.z].map(q=>typeof q==='number'?q.toFixed(1):q).join(' ');break}}}
  out.tunnel[kind]=tun+(ex?' e.g. '+ex:'');out.escapes[kind]=esc+(ex2?' e.g. '+ex2:'')}
 out.ext=ext;out.farZ=boxes.filter(b=>b.max.z>34&&b.max.y-b.min.y>.3).map(b=>[b.min.x,b.min.y,b.min.z,b.max.x,b.max.y,b.max.z].map(v=>+v.toFixed(1)).join(','));return out}
