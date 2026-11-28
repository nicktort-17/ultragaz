import os,sys;sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'));from ugenv import *  # пути окружения
"""Вклейка parts/director.js (/*DIR-BEGIN*/../*DIR-END*/) — модель Генерального директора из Tripo — и разовые хуки:
   /*DIR1*/ makeEnemy: босс строится из модели, если она загружена (иначе старый buildBoss);
   /*DIR2*/ bossAnim: анимация модели (dirAnim), подмена старого вида на модель после загрузки;
   /*DIR3*/ begin: ленивая загрузка models/director.json при старте игры."""
import re
s=open(INDEX).read();mod=open(os.path.join(PARTS,'director.js')).read().strip()
def rep(a,b,cnt=1):
    global s
    if b in s: return
    if s.count(a)!=cnt: print('ANCHOR FAIL',s.count(a),repr(a[:90]));sys.exit(1)
    s=s.replace(a,b)
if '/*DIR-BEGIN*/' in s:
    a=s.index('/*DIR-BEGIN*/');b=s.index('/*DIR-END*/')+len('/*DIR-END*/');s=s[:a]+mod+s[b:]
else:
    anc='function bossOrb(from,dir,speed,dmg,size,hex){'
    if s.count(anc)!=1: print('ANCHOR FAIL bossOrb');sys.exit(1)
    s=s.replace(anc,mod+'\n'+anc,1)
rep("else if(type==='boss'){eyes=buildBoss(g,mm,add)}",
    "else if(type==='boss'){eyes=/*DIR1*/(typeof dirBuild==='function'&&dirBuild(g,mats))||buildBoss(g,mm,add)}")
rep("function bossAnim(e,dt){const B=e.g.userData.boss;if(!B)return;",
    "function bossAnim(e,dt){/*DIR2*/if(typeof dirAnim==='function'&&dirAnim(e,dt))return;const B=e.g.userData.boss;if(!B)return;")
rep("function begin(m,lv){initAudio();",
    "function begin(m,lv){/*DIR3*/if(typeof dirLoad==='function')dirLoad();initAudio();")
# «Ликвидация»: смерть Директора с моделью — своя сцена взрыва вместо стандартной вспышки
rep("function kill(e,src,quiet){if(gzKillGuard(e))return;",
    "function kill(e,src,quiet){if(gzKillGuard(e))return;/*DIR4*/if(e.type==='boss'&&src!=='x'&&src!=='self'&&typeof dirDeath==='function')dirDeath(e);")
rep("banner('ДИРЕКТОР УВОЛЕН!');for(let i=0;i<12;i++)orbs.push(makeOrb(c));blast(c,9,0xffe066);puff(c,160,0xf6eee2,16,1.4);",
    "banner('ДИРЕКТОР УВОЛЕН!');for(let i=0;i<12;i++)orbs.push(makeOrb(c));/*DIR5*/if(!e.dirDeath){blast(c,9,0xffe066);puff(c,160,0xf6eee2,16,1.4)}")
rep("if(mode==='solo'||(mode==='coop'&&isHost)){updEnemies(dt);if(story)updStoryHost(dt);else updWaves(dt)}else if(mode==='coop')clientEnemyAnim(dt);",
    "if(mode==='solo'||(mode==='coop'&&isHost)){updEnemies(dt);if(story)updStoryHost(dt);else updWaves(dt)}else if(mode==='coop')clientEnemyAnim(dt);/*DIR6*/if(typeof dirDeathUpd==='function')dirDeathUpd(dt);")
open(INDEX,'w').write(s);print('director ok')
