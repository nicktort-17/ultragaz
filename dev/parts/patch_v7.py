# v7: Газява стреляет струёй по дуге (капли с физикой + лента), сиропные враги не промокают
p='/home/claude/ultra/index.html';s=open(p).read()
if '/*v7*/' in s: print('v7 already'); raise SystemExit
def rep(a,b,n=1):
    global s
    c=s.count(a);assert c==n,(c,a[:80]);s=s.replace(a,b)
i=s.index("function soda(alt){if(!alt){");j=s.index(" else{if(gas<35){fl0();return}gas-=35;",i)
s=s[:i]+"""/*v7*/function soda(alt){if(!alt){if(gas<2){fl0();return}gas-=1.8;gasIdle=.45;vmShot(3,false);const mz=muzzle(),d=spread(aim,.025);sodaEmit(mz,d,true);spray(mz,d,1);sprayFx-=1;if(sprayFx<=0){sprayFx=3;sfx('spray')}
  if(mp()&&(fire.wfx=(fire.wfx||0)-1)<=0){fire.wfx=1;pushFx(['w',0,r1(mz.x),r1(mz.y),r1(mz.z),r2(d.x),r2(d.y),r2(d.z)])}}
"""+s[j:]
rep("else if(k==='w'){const o=new V3(n[0],n[1],n[2]),d=new V3(n[3],n[4],n[5]).normalize();spray(o,d,6);floorPuddle(o,d,32,.55,7)}",
    "else if(k==='w'){const o=new V3(n[0],n[1],n[2]),d=new V3(n[3],n[4],n[5]).normalize();sodaEmit(o,d,false);spray(o,d,2)}")
rep(" updFx(dt);"," updFx(dt);if(typeof updSoda==='function')updSoda(dt);")
open(p,'w').write(s);print('v7 ok')
