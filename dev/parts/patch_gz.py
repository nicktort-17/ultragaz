#!/usr/bin/env python3
import os,sys;sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'));from ugenv import *  # пути окружения
"""Вклейка parts/gz.js (/*GZ-BEGIN*/../*GZ-END*/) и разовые хуки /*GZ1*/ в index.html."""
import os,re,sys
H=INDEX
s=open(H).read();mod=open(os.path.join(os.path.dirname(__file__),'gz.js')).read().strip()
if '/*GZ-BEGIN*/' in s:
    a=s.index('/*GZ-BEGIN*/');b=s.index('/*GZ-END*/')+len('/*GZ-END*/');s=s[:a]+mod+s[b:]
else:
    anc="if(/[?&]debug\\b/.test(location.search))"
    assert anc in s;s=s.replace(anc,mod+'\n'+anc,1)
def rep(old,new,cnt=1):
    global s
    if old not in s:print('!! not found:',old[:90]);sys.exit(1)
    s=s.replace(old,new,cnt)
if '/*GZ1*/' not in s:
    # кадр: катсцена блокирует управление и стрельбу; общий апдейт; вьюмодель
    rep("if(P.alive){if(state==='play')updPlayer(dt);else{P.iT-=dt;P.vel.set(0,0,0)}if(state==='play'){if(swap<=0){if(fireHeld)fire(false);if(altHeld)fire(true)}}}",
        "/*GZ1*/if(P.alive){if(state==='play'&&!GZ.cut)updPlayer(dt);else{if(!GZ.cut)P.iT-=dt;P.vel.set(0,0,0)}if(state==='play'&&!GZ.cut){if(swap<=0){if(fireHeld)fire(false);if(altHeld)fire(true)}}}")
    rep("updProj(dt);updCoins(dt);updPeels(dt);updCola(dt);flushDmg();netFrame(dt);","updProj(dt);updCoins(dt);updPeels(dt);updCola(dt);gzFrame(dt);flushDmg();netFrame(dt);")
    rep("guns.forEach((g,j)=>g.visible=j===cur&&!(L3&&ringHeld()));vmUpdate(dt);","guns.forEach((g,j)=>g.visible=j===cur&&!(L3&&ringHeld()));vmUpdate(dt);gzVm(dt);")
    # старт уровня, выход в меню
    rep("story=storyId?newStory(storyId):null;reset();state='play';","story=storyId?newStory(storyId):null;reset();gzBegin();state='play';")
    rep("function toMenu(){ambStop();","function toMenu(){ambStop();GZ.cut=null;gzBars(false);")
    # переключение оружия
    rep("function switchW(i,force){if((i===cur&&!force)||i<0||i>3)return;","function switchW(i,force){if((i===cur&&!force)||i<0||i>3)return;if(GZ.cut&&i!==3)return;if(i===3&&GZ.mode===0){if(!force)banner('4-Й СЛОТ ПУСТ — ОРУЖИЕ ЕЩЁ НЕ НАЙДЕНО');return}")
    rep("switchW((cur+(e.deltaY>0?1:3))%4)},{passive:false});","{const n=GZ.mode===0?3:4;switchW((cur+(e.deltaY>0?1:n-1))%n)}},{passive:false});")
    # вода вместо колы
    rep("/*v7*/function soda(alt){","/*v7*/function soda(alt){if(GZ.mode===1)return gzWater(alt);")
    rep("function sodaHitEnemy(e,dr){","function sodaHitEnemy(e,dr){if(GZ.mode===1)return gzWaterHit(e,dr);")
    rep("puff(_sb.set(dr.p.x,g+.05,dr.p.z),4,Math.random()<.4?0xf6eee2:0x6b2a12,2.6,.35,10);if(dr.mine&&(++land)%2===0",
        "puff(_sb.set(dr.p.x,g+.05,dr.p.z),4,Math.random()<.4?0xf6eee2:GZ.mode===1?0xbfe6ff:0x6b2a12,2.6,.35,10);if(GZ.mode!==1&&dr.mine&&(++land)%2===0")
    rep("if(inBox(dr.p)||dr.p.y<-30){dr.dead=true;puff(op,4,0x6b2a12,2.5,.3,10);continue}\n  if(Math.random()<dt*6)puff(dr.p,1,Math.random()<.5?0xf6eee2:0x8a3a14,1.2,.35,9)}",
        "if(inBox(dr.p)||dr.p.y<-30){dr.dead=true;puff(op,4,GZ.mode===1?0xbfe6ff:0x6b2a12,2.5,.3,10);continue}\n  if(Math.random()<dt*6)puff(dr.p,1,Math.random()<.5?0xf6eee2:GZ.mode===1?0x9fd8ff:0x8a3a14,1.2,.35,9)}")
    rep("const foam=Math.random()<.35;col.setHex(foam?0xf6eee2:0x6b2a12);","const foam=Math.random()<.35;col.setHex(foam?0xf6eee2:GZ.mode===1?0x9fd8ff:0x6b2a12);")
    rep("const m=new THREE.ShaderMaterial({uniforms:{uT:{value:0}},transparent:true,depthWrite:false,side:THREE.DoubleSide,\n  vertexShader:'attribute float aA;",
        "const m=new THREE.ShaderMaterial({uniforms:{uT:{value:0},uW:{value:0}},transparent:true,depthWrite:false,side:THREE.DoubleSide,\n  vertexShader:'attribute float aA;")
    rep("fragmentShader:`uniform float uT;varying vec2 vU;varying float vA;","fragmentShader:`uniform float uT;uniform float uW;varying vec2 vU;varying float vA;")
    rep("c=mix(c,vec3(.97,.92,.84),b*.8);\n    float a=vA*(.75+.25*core);",
        "c=mix(c,vec3(.97,.92,.84),b*.8*(1.-uW));\n    vec3 cw=mix(vec3(.16,.42,.78),vec3(.55,.8,.98),core)+vec3(.9,.97,1.)*(1.-smoothstep(0.,.14,abs(vU.y-.36)))*.35;c=mix(c,cw,uW);\n    float a=vA*(.75+.25*core)*(1.-.35*uW);")
    # урон: перехват смерти Царицы ради катсцены
    rep("function damage(e,dmg,dist,src){if(e.dead)return;","function damage(e,dmg,dist,src){if(e.dead)return;if(gzDamageGuard(e,dmg))return;")
    rep("if(src==='soda')addStyle('ЗАХЛЕБНУЛСЯ',50);","if(src==='soda')addStyle('ЗАХЛЕБНУЛСЯ',50);if(src==='water')addStyle('РАСТВОРЁН',50);")
    # сетевые эффекты директора
    rep("else if(k==='K'){if(L3)kegBoom(n[0],false)}","else if(k==='D')dlFx(n);else if(k==='K'){if(L3)kegBoom(n[0],false)}")
    # подсказки, которые показываются каждый раз
    rep("const BANNER_ALWAYS=/^\\d+-\\d+ · |","const BANNER_ALWAYS=/ПРОТОТИП|ГРАФИК ПАДАЕТ|ЦАРИЦА УШЛА|^\\d+-\\d+ · |")
    # оружие: стекло/пластик заметнее, полая этикетка
    rep("if(/стекло/i.test(n)){mt.transparent=true;mt.opacity=.78}if(/ПЭТ/.test(n)){mt.transparent=true;mt.opacity=.38;mt.depthWrite=false}if(/Лёд/.test(n)){mt.transparent=true;mt.opacity=.6}\n  if(/Свечение/.test(n)){mt.emissiveIntensity=2}mt.envMap=ENV;mt.envMapIntensity=1.1})}});",
        "if(/Свечение/.test(n)){mt.emissiveIntensity=2}mt.envMap=ENV;mt.envMapIntensity=1.1;\n  if(/стекло/i.test(n)){mt.color.lerp(new THREE.Color(0xffffff),.16);gzGlass(mt,.5);mt.envMapIntensity=1.9}if(/ПЭТ/.test(n)){gzGlass(mt,.46);mt.depthWrite=false;mt.envMapIntensity=1.8}if(/Лёд/.test(n)){gzGlass(mt,.7);mt.envMapIntensity=1.8}})}});")
    rep(" m.traverse(o=>{if(o.isMesh)o.renderOrder=0});\n heroes.forEach(h=>attachTPGun(h,i))}"," m.traverse(o=>{if(o.isMesh)o.renderOrder=0});gzSetupGun(i,m);\n heroes.forEach(h=>attachTPGun(h,i))}")
    # директор: фаза 2 — двойной рывок и новые приёмы, без старого баннера
    rep("if(ph2&&!e.ph2){e.ph2=true;banner('СОВЕТ ДИРЕКТОРОВ СОЗВАН!');sfx('frag');","if(ph2&&!e.ph2){e.ph2=true;e.cdL=3;e.cdR=6;sfx('frag');")
    rep("if(e.dashT<=0){e.vel.multiplyScalar(.2);e.cdD=rnd(3.5,5.5)*(ph2?.7:1)}return}",
        "if(e.dashT<=0){e.vel.multiplyScalar(.2);if(ph2&&!e.dd&&Math.random()<.65){e.dd=1;e.dashW=.42;ring(new V3(e.pos.x,e.pos.y,e.pos.z),3.5,0xff5a00);sfx('charge',.8)}else{e.dd=0;e.cdD=rnd(3.5,5.5)*(ph2?.65:1)}}return}")
    rep(" const side=new V3(-to.z,0,to.x).multiplyScalar(e.strafe*(ph2?9:7)),radial=dist<9?-6:dist>15?6:0;",
        " if(ph2&&dirExtra(e,t,dist,dt,tg))return;\n const side=new V3(-to.z,0,to.x).multiplyScalar(e.strafe*(ph2?9:7)),radial=dist<9?-6:dist>15?6:0;")
    rep("bossOrb(from,base.clone().applyAxisAngle(UPV,(i/(n-1)-.5)*sp*2),ph2?19:16,12,.3,0xff9a4d)}\n  e.cd=ph2?1.6:2.3}}",
        "bossOrb(from,base.clone().applyAxisAngle(UPV,(i/(n-1)-.5)*sp*2),ph2?21:16,ph2?14:12,.3,0xff9a4d)}\n  e.cd=ph2?1.45:2.3}}")
if '/*DBG1*/' not in s:
    rep("let dt=Math.min(.033,(now-last)/1000);last=now;","let dt=Math.min(.033,(now-last)/1000);last=now;/*DBG1*/dt*=dbgSpeed();")
    rep("if(gzDamageGuard(e,dmg))return;e.hp-=dmg;","dmg*=dbgDmg(e);if(gzDamageGuard(e,dmg))return;e.hp-=dmg;")
    rep(" if(P.dashT<=0&&!P.slam)P.vel.y-=(P.wallT>0&&P.vel.y<0?14:27)*dt;"," if(dbgFly()){P.vel.y=(k('Space')?9:0)-(k('KeyC')?9:0)}else if(P.dashT<=0&&!P.slam)P.vel.y-=(P.wallT>0&&P.vel.y<0?14:27)*dt;")
open(H,'w').write(s);print('ok')
