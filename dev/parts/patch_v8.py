import os,sys;sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'));from ugenv import *  # пути окружения
# v8: бой с Царицей — прилив, подпитка, мель, водоворот, сиропные гейзеры
p=INDEX;s=open(p).read()
if '/*v8*/' in s: print('v8 already'); raise SystemExit
def rep(a,b,n=1):
    global s
    c=s.count(a);assert c==n,(c,a[:80]);s=s.replace(a,b)
rep("function queenAI(e,t,to,dist,dt,tg){const ph2=e.hp<e.maxHp*.5,str=drainT>0;e.stT=(e.stT||0)+dt;",
    "/*v8*/function queenAI(e,t,to,dist,dt,tg){const ph2=e.hp<e.maxHp*.5,str=drainT>0;e.stT=(e.stT||0)+dt;queenSyrup(e,dt);")
rep("else{const r=Math.random();let s=r<.36?'hail':r<.7?'spike':'wave';if(s===e.last&&Math.random()<.65)s=s==='wave'?'hail':'wave';e.last=s;",
    "else{let s=queenPick(e);e.last=s;")
rep(" else if(e.st==='hail'){e.ac=1;",
    """ else if(e.st==='stranded'){e.ac=7;e.pos.y+=(-2.4-e.pos.y)*Math.min(1,dt*2.5);if(Math.random()<dt*10)puff(new V3(e.pos.x+rnd(-3,3),Math.max(0,syrupLvl(e.pos.x,e.pos.z))+.2,e.pos.z+rnd(-3,3)),3,0xd8801f,4,.6,10);if(e.stT>3.2){e.st='idle';e.stT=0;e.cd=.9}}
 else if(e.st==='swirl'){e.ac=8;if(e.stT>3.8){e.st='idle';e.cd=rnd(1.4,2);e.stT=0}}
 else if(e.st==='spout'){e.ac=9;if(!e.done&&e.stT>.45){e.done=1;for(const c of tg){const x=c.pos.x+c.vel.x*.6,z=c.pos.z+c.vel.z*.6;spout(x,z,true);qfx(6,x,z)}if(ph2)for(let i=0;i<3;i++){const a=Math.random()*6.28,r=rnd(6,15),x=e.pos.x+Math.sin(a)*r,z=e.pos.z+Math.cos(a)*r;spout(x,z,true);qfx(6,x,z)}sfx('roar',.6)}if(e.stT>1.7){e.st='idle';e.cd=rnd(1.3,2);e.stT=0}}
 else if(e.st==='hail'){e.ac=1;""")
rep("else if(a===5){z=s*2.2;x=0;el=-.3}else if(a===6){z=s*1.6;x=-.3;el=-.6}",
    "else if(a===5){z=s*2.2;x=0;el=-.3}else if(a===6){z=s*1.6;x=-.3;el=-.6}else if(a===7){z=s*(1.9+Math.sin(t*9+s)*.25);x=.4;el=-1.3}else if(a===8){z=s*(1.5+Math.sin(t*5+s*1.5)*.35);x=-.5+Math.sin(t*5)*.4;el=-.35}else if(a===9){z=s*.7;x=-2.3+Math.abs(Math.sin(t*3))*.6;el=-.15}")
rep("function queenAnim(e,dt){const q=e.g.userData.q;if(!q)return;","function queenAnim(e,dt){const q=e.g.userData.q;if(!q)return;queenSyrupFx(e,dt);")
rep("updGoo(dt);updQuakes(dt);updWrings(dt);","updGoo(dt);updQuakes(dt);updWrings(dt);updQS(dt);")
rep("function clearStoryFx(){","function clearStoryFx(){queenSyrupReset();")
rep("else if(s2===5)sfx('roar',.8)}}","else if(s2===5)sfx('roar',.8);else if(s2===6)spout(n[1],n[2],false)}}")
open(p,'w').write(s);print('v8 ok')
