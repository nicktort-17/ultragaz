import os,sys;sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'));from ugenv import *  # пути окружения
import shutil,os
s=open(INDEX).read()
hook="""window.__eval=s=>eval(s);window.__audit="""+open(TOOLS+'/audit.js').read()+""";
window.__ug={renderer,P,guns,VM,VP,get selfHero(){return selfHero},SHOW,get enemies(){return enemies},spawnEnemy,kill,switchW,fire,punch,inspect,buildHero,animHero,remotes,scene,camera,gunScene,vmRoot,heroFire,heroPunch,
 get state(){return state},set state(v){state=v},get tp(){return tpView},set tp(v){tpView=v},get cur(){return cur},get gas(){return gas},set gas(v){gas=v},setFire(a,b){fireHeld=a;altHeld=b},die,begin,toMenu,makeAvatar,disposeHero,heroes,get puddles(){return puddles},addPuddle,colaGeyser,startWave,get bank(){return bank},set bank(v){bank=v},myCos,rebuildSelf,buildHeroUI,get toSpawn(){return toSpawn},
 get story(){return story},get lvT(){return lvT},set lvT(v){lvT=v},get drainT(){return drainT},LEVELS,doors,presses,pools,valves,openValve,roomStart,get carousel(){return carousel},spikeLine,waveRing,lobShot,get proj(){return proj},damage,ENEMY,get prog(){return prog},showResults,levelDone,get T(){return T},boxes,mapB:()=>mapB,syrupLvl,get tideK(){return tideK},valveHit,mmView,MM,get mode(){return mode},canPass,weakHit,hitscan,get wave(){return wave}};
initNet();
requestAnimationFrame(frame);"""
assert "initNet();\nrequestAnimationFrame(frame);" in s
s=s.replace("initNet();\nrequestAnimationFrame(frame);",hook,1)
s=s.replace('let dt=Math.min(.033,(now-last)/1000);last=now;','let dt=Math.min(.033,(now-last)/1000);last=now;if(window.__frz)dt=0;if(window.__dt)dt=window.__dt;',1)
os.makedirs(SRV,exist_ok=True)
open(SRV+'/index.html','w').write(s)
if os.path.exists(SRV+'/models'):shutil.rmtree(SRV+'/models')
shutil.copytree(MODELS,SRV+'/models')
a=open(SRV+'/index.html').read();k=" renderer.clear();if(typeof uwFx==='function')uwFx(inMenu);const rs=inMenu?menuScene:scene;";assert k in a;a=a.replace(k," window.__fts=(window.__fts||0)+(performance.now()-window.__ft0);window.__ftn=(window.__ftn||0)+1;if(window.__norender)return;"+k,1);a=a.replace("if(window.__dt)dt=window.__dt;","if(window.__dt)dt=window.__dt;window.__ft0=performance.now();",1);open(SRV+'/index.html','w').write(a)
print('prepped')
