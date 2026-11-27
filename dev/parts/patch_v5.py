# v5: стиль сложнее, непарируемые атаки боссов, парирование вала, эффект «под жидкостью»
p='/home/claude/ultra/index.html';s=open(p).read()
if 'RANK_T=' in s: print('v5 already'); raise SystemExit
def rep(a,b,n=1):
    global s
    c=s.count(a);assert c==n,(c,a[:80]);s=s.replace(a,b)
rep("const rank=()=>Math.min(6,Math.floor(styleV/100));\nfunction addStyle(label,pts){styleV=Math.min(699,styleV+pts);bankAdd(pts);if(mode!=='pvp')score+=Math.round(pts*(1+rank()*.3));feed.unshift({label:'+ '+label,t:2.4});if(feed.length>6)feed.length=6}",
"""// стиль: пороги рангов растут, повторы одного приёма приносят всё меньше (свежесть восстанавливается со временем)
const RANK_T=[0,150,350,620,950,1350,1800],STYLE_MAX=2200,FRESH={};
const rank=()=>{let r=0;for(let i=1;i<7;i++)if(styleV>=RANK_T[i])r=i;return r};
function addStyle(label,pts){const k=label.replace(/[\\d×+]+/g,'').trim(),f=FRESH[k]??1;FRESH[k]=Math.max(.2,f*.7);const v=Math.max(1,Math.round(pts*f*.8));
 styleV=Math.min(STYLE_MAX,styleV+v);bankAdd(v);if(mode!=='pvp')score+=Math.round(v*(1+rank()*.3));feed.unshift({label:'+ '+label+(f<.9?' · '+Math.round(f*100)+'%':''),t:2.4});if(feed.length>6)feed.length=6}""")
rep("styleV=Math.max(0,styleV-60)","styleV=Math.max(0,styleV*.75-90)")
rep("styleV=Math.max(0,styleV-dt*(7+rank()*8));","styleV=Math.max(0,styleV-dt*(12+rank()*15));for(const k in FRESH)FRESH[k]=Math.min(1,FRESH[k]+dt*.25);")
rep("$('sbf').style.width=(r===6?Math.min(100,(styleV-600)):styleV%100)+'%';","$('sbf').style.width=Math.min(100,(styleV-RANK_T[r])/((r<6?RANK_T[r+1]:STYLE_MAX)-RANK_T[r])*100)+'%';")
# непарируемые снаряды
rep("  if(p.owner==='enemy'){if(p.netId&&mode==='coop'&&!isHost)queueDmg('p'+p.netId,1,'x');p.owner='player';p.kind='parried';",
    "  if(p.owner==='enemy'&&p.np){banner('ЭТО НЕ ОТБИТЬ — УХОДИ!');continue}\n  if(p.owner==='enemy'){if(p.netId&&mode==='coop'&&!isHost)queueDmg('p'+p.netId,1,'x');p.owner='player';p.kind='parried';")
rep(" if(!did)sfx('throw')}"," if(typeof waveParry==='function'&&waveParry())did=true;\n if(!did)sfx('throw')}")
# парированные атаки бьют босса слабее
rep("if(e.type==='queen'&&drainT>0)dmg*=1.5;","if(src==='parry'&&ENEMY[e.type].boss)dmg*=.7;if(e.type==='queen'&&drainT>0)dmg*=1.5;")
# град карамели Царицы — расплавленная карамель, не отбить
rep("lobShot(from,new V3(x,surfY(x,z),z),tf,16,.55,0xc8661a,'bomb')}","npMark(lobShot(from,new V3(x,surfY(x,z),z),tf,16,.55,0xc8661a,'bomb'),.9)}")
rep("lobShot(from,new V3(x,surfY(x,z),z),rnd(1.3,1.8),16,.55,0xc8661a,'bomb')}sfx('throw')}","npMark(lobShot(from,new V3(x,surfY(x,z),z),rnd(1.3,1.8),16,.55,0xc8661a,'bomb'),.9)}sfx('throw')}")
# под жидкостью
rep("const rs=inMenu?menuScene:scene;","if(typeof uwFx==='function')uwFx(inMenu);const rs=inMenu?menuScene:scene;")
open(p,'w').write(s);print('v5 ok')
