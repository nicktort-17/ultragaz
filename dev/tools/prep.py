import os,sys;sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'));from ugenv import *  # пути окружения
import shutil,os
s=open(INDEX).read()
hook="""window.__ug={renderer,P,guns,VM,VP,get selfHero(){return selfHero},SHOW,get enemies(){return enemies},spawnEnemy,kill,switchW,fire,punch,inspect,buildHero,animHero,remotes,scene,camera,gunScene,vmRoot,heroFire,heroPunch,
 get state(){return state},set state(v){state=v},get tp(){return tpView},set tp(v){tpView=v},get cur(){return cur},get gas(){return gas},set gas(v){gas=v},setFire(a,b){fireHeld=a;altHeld=b},die,begin,toMenu,makeAvatar,disposeHero,heroes,get puddles(){return puddles},addPuddle,colaGeyser,startWave,get bank(){return bank},set bank(v){bank=v},myCos,rebuildSelf,buildHeroUI,get toSpawn(){return toSpawn}};
initNet();
requestAnimationFrame(frame);"""
s=s.replace("initNet();\nrequestAnimationFrame(frame);",hook,1)
s=s.replace('let dt=Math.min(.033,(now-last)/1000);last=now;','let dt=Math.min(.033,(now-last)/1000);last=now;if(window.__frz)dt=0;',1)
os.makedirs(SRV,exist_ok=True)
open(SRV+'/index.html','w').write(s)
if os.path.exists(SRV+'/models'):shutil.rmtree(SRV+'/models')
shutil.copytree(MODELS,SRV+'/models')
print('prepped')
