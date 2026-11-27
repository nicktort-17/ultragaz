import shutil,os
s=open('/home/claude/ultra/index.html').read()
hook="""window.__ug={renderer,P,guns,VM,VP,get selfHero(){return selfHero},SHOW,get enemies(){return enemies},spawnEnemy,kill,switchW,fire,punch,inspect,buildHero,animHero,remotes,scene,camera,gunScene,vmRoot,heroFire,heroPunch,
 get state(){return state},set state(v){state=v},get tp(){return tpView},set tp(v){tpView=v},get cur(){return cur},get gas(){return gas},set gas(v){gas=v},setFire(a,b){fireHeld=a;altHeld=b},die,begin,toMenu,makeAvatar,disposeHero,heroes,get puddles(){return puddles},addPuddle,colaGeyser,startWave,get bank(){return bank},set bank(v){bank=v},myCos,rebuildSelf,buildHeroUI,get toSpawn(){return toSpawn}};
initNet();
requestAnimationFrame(frame);"""
s=s.replace("initNet();\nrequestAnimationFrame(frame);",hook,1)
s=s.replace('let dt=Math.min(.033,(now-last)/1000);last=now;','let dt=Math.min(.033,(now-last)/1000);last=now;if(window.__frz)dt=0;',1)
os.makedirs('/tmp/srv',exist_ok=True)
open('/tmp/srv/index.html','w').write(s)
if os.path.exists('/tmp/srv/models'):shutil.rmtree('/tmp/srv/models')
shutil.copytree('/home/claude/ultra/models','/tmp/srv/models')
print('prepped')
