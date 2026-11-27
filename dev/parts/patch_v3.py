import sys
p='/home/claude/ultra/index.html';s=open(p).read()
def rep(a,b,n=1):
    global s
    c=s.count(a)
    if c!=n:print('ANCHOR FAIL',c,repr(a[:100]));sys.exit(1)
    s=s.replace(a,b)
if 'function colaBurst' in s:print('v3 already');sys.exit(0)
# 1. ментос+газява в воздухе — взрыв вместо гейзера
rep("function colaGeyser(e){const x=e.pos.x,z=e.pos.z,y=e.type==='drone'||e.type==='boss'?groundY(e.pos):e.pos.y;",
"""function colaBurst(x,y,z,net){const p=new V3(x,y,z);blast(p,3.6,0xfff0d8);blast(p,2.3,0x8a3510);ring(p,6.5,0x6b2a12);puff(p,80,0xfaf3e6,13,.9,5);puff(p,60,0x6b2a12,11,1,9);
 const gy=groundY(p);for(let i=0;i<70;i++){const a=Math.random()*6.283,b=rnd(-1.2,1.4),sp=rnd(5,13),foam=Math.random()<.4;gDrop(x,y,z,Math.cos(a)*Math.cos(b)*sp,Math.sin(b)*sp+3,Math.sin(a)*Math.cos(b)*sp,foam?rnd(.09,.2):rnd(.05,.15),foam?FOAM_C:(Math.random()<.5?0x4a1606:0x8a3510),gy)}
 geyLight.position.set(x,y,z);geyLight.intensity=2.6;sfx('jet');sfx('boom',.7);shake=Math.max(shake,Math.min(.45,.6-camera.position.distanceTo(p)/40));if(net&&mp())pushFx(['y',0,r1(x),r1(y),r1(z),1])}
function colaGeyser(e){const air=ENEMY[e.type].fly||e.type==='boss'||(e.type==='alt'&&e.ph===3)||(e.pos.y-groundY(e.pos)>2.2)||(story&&!floorAt(e.pos.x,groundY(e.pos),e.pos.z));
 if(air){const c=center(e,new V3());colaBurst(c.x,c.y,c.z,true);addStyle('КОЛА-ВЗРЫВ',120);e.wet=0;
  for(const o of enemies){if(o.dead)continue;const d=center(o,tmpA).distanceTo(c);if(d>5.2)continue;damage(o,o===e?5:2.4,99,'geyser');if(!o.remote&&!o.dead&&!ENEMY[o.type].boss){o.vel.add(tmpB.subVectors(o.pos,c).normalize().multiplyScalar(12*(1-d/6))).y+=6}}
  const pc=tmpA.set(P.pos.x,P.pos.y+.9,P.pos.z),dp=pc.distanceTo(c);if(P.alive&&dp<4){P.vel.add(tmpB.subVectors(pc,c).normalize().multiplyScalar(16*(1-dp/5)));P.vel.y+=7;P.grounded=false}return}
 const x=e.pos.x,z=e.pos.z,y=e.pos.y;""")
rep(" else if(k==='y'){geyserFx(n[0],n[1],n[2]);addPuddle(n[0],n[1],n[2],2.6,10)}"," else if(k==='y'){if(n[3])colaBurst(n[0],n[1],n[2],false);else{geyserFx(n[0],n[1],n[2]);addPuddle(n[0],n[1],n[2],2.6,10)}}")
# 2. жидкости — только на полу
rep("function addPuddle(x,y,z,r,life){","function addPuddle(x,y,z,r,life){if(!floorAt(x,y,z))return;")
rep("function addGoo(x,y,z,r,life){","function addGoo(x,y,z,r,life){if(!floorAt(x,y,z))return;")
# 3. уведомления: события — только в первый раз
rep("function banner(txt){const b=$('banner');","""const SEEN=(()=>{try{return new Set(JSON.parse(localStorage.getItem('ug-seen')||'[]'))}catch(e){return new Set()}})();
const BANNER_ALWAYS=/^\\d+-\\d+ · |^\\d+ · |^УРОВЕНЬ ПРОЙДЕН|^ЕЩЁ РАЗ|^ФРАГ|^ВОЛНА \\d+$|ВЫШЕЛ НА СВЯЗЬ|ПРОБУЖДАЕТСЯ|^АЛЬТУШКА 10\\/10 НА|ПОВЕРЖЕН|РАСТАЯЛА|УВОЛЕН|^Не удалось|^ОТКРЫТО|★|СПАСЕНА|^ВЫХОД|^ПРЫГАЙ|ПРИБЫЛ/;
function banner(txt){if(!BANNER_ALWAYS.test(txt)){const k=txt.replace(/\\d+/g,'#');if(SEEN.has(k))return;SEEN.add(k);try{localStorage.setItem('ug-seen',JSON.stringify([...SEEN]))}catch(e){}}const b=$('banner');""")
open(p,'w').write(s);print('v3 ok')
