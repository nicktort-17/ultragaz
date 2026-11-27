# остров (уровень 4): модули рельефа, растительности, построек и сборки между /*ISLE-BEGIN*/ и /*ISLE-END*/ + разовые крючки
import re,sys
p='/home/claude/ultra/index.html';s=open(p).read()
src=''.join(open('/home/claude/ultra/parts/'+f).read()+'\n' for f in ['isle_terrain.js','isle_veg.js','isle_props.js','island.js'])
isle='/*ISLE-BEGIN*/\n'+src+'\n/*ISLE-END*/'
def rep(a,b,n=1):
    global s
    c=s.count(a)
    if c!=n: print('ANCHOR FAIL',c,repr(a[:90]));sys.exit(1)
    s=s.replace(a,b)
if '/*ISLE-BEGIN*/' in s:
    s=re.sub(r'/\*ISLE-BEGIN\*/.*?/\*ISLE-END\*/',lambda m:isle,s,flags=re.S)
else:
    rep("/*BEER-END*/","/*BEER-END*/\n"+isle)
    rep("else if(id==='l3')buildL3();else buildFactory();","else if(id==='l3')buildL3();else if(id==='l4')buildL4();else buildFactory();")
    rep("if(L3)updL3(dt);","if(L3)updL3(dt);if(L4)updL4(dt);")
    rep("if(L3)clearL3();L3=null}","if(L3)clearL3();L3=null;if(typeof L4!=='undefined'&&L4)clearL4();L4=null}")
# v2: заставка при каждом старте, звук острова
if '/*ISLE2*/' not in s:
    rep("function reset(){clearWorld();","function reset(){/*ISLE2*/clearWorld();if(typeof L4!=='undefined'&&L4)resetL4();")
    rep(" else if(kind==='l3'){bed('lowpass',380,.5,.2,.11,.15);",
        " else if(kind==='l4'){bed('lowpass',420,.6,.17,.09,.12);bed('lowpass',160,.8,.12,.06,.08);bed('bandpass',3200,.7,.018,.23,.012)}\n else if(kind==='l3'){bed('lowpass',380,.5,.2,.11,.15);")
    rep(" else if(AMB.kind==='l1'){AMB.t=rnd(6,13);",
        " else if(AMB.kind==='l4'){AMB.t=rnd(1.6,4.5);const f=rnd(1800,3200),v=rnd(.012,.026),n=1+Math.floor(Math.random()*3);for(let i=0;i<n;i++)setTimeout(()=>{if(ac)tone(.09,'sine',f,f*rnd(1.2,1.6),v)},i*rnd(110,170));if(Math.random()<.25)setTimeout(()=>{if(ac)nz(.25,'bandpass',rnd(900,1500),.03,rnd(300,700))},600)}\n else if(AMB.kind==='l1'){AMB.t=rnd(6,13);")
    rep("else if(typeof L4!=='undefined'&&L4&&!onIsland(c.x,c.z)){if(c.y<sea4H(c.x,c.z,lvT)-.03)lq='water'}",
        "else if(typeof L4!=='undefined'&&L4&&(TERR?terrH(c.x,c.z)<c.y:!onIsland(c.x,c.z))){if(c.y<sea4H(c.x,c.z,lvT)-.03)lq='water'}")
open(p,'w').write(s);print('isle ok')
