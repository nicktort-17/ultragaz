#!/usr/bin/env python3
"""Вклейка parts/pep.js (/*PEP-BEGIN*/../*PEP-END*/) — финальный босс Пепсштейн — и разовые хуки /*PEP1*/ в index.html."""
import os,sys
H=os.path.join(os.path.dirname(__file__),'..','index.html')
s=open(H).read();mod=open(os.path.join(os.path.dirname(__file__),'pep.js')).read().strip()
if '/*PEP-BEGIN*/' in s:
    a=s.index('/*PEP-BEGIN*/');b=s.index('/*PEP-END*/')+len('/*PEP-END*/');s=s[:a]+mod+s[b:]
else:
    anc="if(/[?&]debug\\b/.test(location.search))"
    assert anc in s;s=s.replace(anc,mod+'\n'+anc,1)
def rep(old,new,cnt=1):
    global s
    if s.count(old)!=cnt:print('!! anchor',s.count(old),old[:90]);sys.exit(1)
    s=s.replace(old,new)
if '/*PEP1*/' not in s:
    # враг: модель, появление, ИИ, физика, клиентская анимация
    rep("else if(type==='alt')eyes=buildAlt(g,mm,mats);","else if(type==='alt')eyes=buildAlt(g,mm,mats);else if(type==='pep')eyes=buildPep(g,mm,mats);")
    rep("if(!ENEMY[type].fly&&type!=='queen'&&type!=='alt'){","if(!ENEMY[type].fly&&type!=='queen'&&type!=='alt'&&type!=='pep'){")
    rep("if((type==='queen'||type==='alt')&&mode==='coop')e.hp*=1+.6*remotes.size;","if((type==='queen'||type==='alt'||type==='pep')&&mode==='coop')e.hp*=1+.6*remotes.size;")
    rep("enemies.push(ne)}","enemies.push(ne);if(type==='pep')pepSpawnInit(ne)}")
    rep("e.type!=='queen'&&e.type!=='alt'&&!(e.shk>0))e.g.rotation.y","e.type!=='queen'&&e.type!=='alt'&&e.type!=='pep'&&!(e.shk>0))e.g.rotation.y")
    rep("else if(e.type==='alt'){altAI(e,t,to,dist,dt,tg);altAnim(e,dt)}","else if(e.type==='alt'){altAI(e,t,to,dist,dt,tg);altAnim(e,dt)}\n  else if(e.type==='pep'){pepAI(e,t,to,dist,dt,tg);pepAnim(e,dt)}")
    rep("if(e.type==='queen'||e.type==='alt'){}","if(e.type==='queen'||e.type==='alt'||e.type==='pep'){}")
    rep("if(e.type==='alt'&&e.pos.distanceTo(e.tgt)>6)e.pos.copy(e.tgt);","if((e.type==='alt'||e.type==='pep')&&e.pos.distanceTo(e.tgt)>6)e.pos.copy(e.tgt);")
    rep("if(e.type==='alt')altAnim(e,dt);","if(e.type==='alt')altAnim(e,dt);if(e.type==='pep')pepAnim(e,dt);")
    # урон и смерть
    rep("dmg*=dbgDmg(e);if(gzDamageGuard(e,dmg))return;e.hp-=dmg;","dmg*=dbgDmg(e);/*PEP1*/if(e.type==='pep'){const r_=pepDmg(e,dmg,src);dmg=r_[0];src=r_[1];if(dmg<=0){hitMark();return}}if(gzDamageGuard(e,dmg))return;e.hp-=dmg;")
    rep("function kill(e,src,quiet){if(gzKillGuard(e))return;","function kill(e,src,quiet){if(gzKillGuard(e))return;if(e.type==='pep'){if(pepKillGuard(e,quiet))return;pepGone(e)}")
    rep("en.hp-=dmg;if(en.type==='alt')en.hp=Math.max(en.hp,altFloor(en));","en.hp-=en.type==='pep'?pepNetDmg(en,dmg,src):dmg;if(en.type==='alt')en.hp=Math.max(en.hp,altFloor(en));")
    rep("for(const e of enemies)if(!ids.has(e.id)&&!e.dead){e.dead=true;if(e.type==='alt')altDeath(e);","for(const e of enemies)if(!ids.has(e.id)&&!e.dead){e.dead=true;if(e.type==='alt')altDeath(e);if(e.type==='pep')pepGone(e);")
    # сеть: ракетный кулак как отдельный вид снаряда
    rep("p.kind==='bullet'?5:0","p.kind==='bullet'?5:p.kind==='pfist'?6:0")
    rep("if(kd===4||kd===5){","if(kd===6){const o=new V3(+a[1]||0,+a[2]||0,+a[3]||0),v=new V3(+a[4]||0,+a[5]||0,+a[6]||0);if(pepFistNet(o,v,nid))continue}if(kd===4||kd===5){")
    # попадания: хит-сферы и слабые места
    rep("let tg=[];for(const e of enemies){const t=raySphere(o,dir,center(e,tmpA),e.r);if(t!==null&&t<wallD)tg.push([t,e])}",
        "let tg=[];for(const e of enemies){const t=e.type==='pep'?pepRay(e,o,dir):raySphere(o,dir,center(e,tmpA),e.r);if(t!==null&&t<wallD)tg.push([t,e])}")
    rep("addStyle(e.type==='alt'?(e.ph===3?'В СОПЛО':'В ПИВНОЙ БАК'):'В САХАРНОЕ СЕРДЦЕ',30)","addStyle(e.type==='pep'?pepWeakLbl(e):e.type==='alt'?(e.ph===3?'В СОПЛО':'В ПИВНОЙ БАК'):'В САХАРНОЕ СЕРДЦЕ',30)")
    # полоса босса: имя фазы, отметки фаз
    rep("const bn=ENEMY[bs.type].name;","const bn=bs.bname||ENEMY[bs.type].name;")
    rep("bb.classList.toggle('rage',bs.hp<bs.maxHp*.5)","bb.classList.toggle('rage',bs.type==='pep'?pepPh(bs.ac||5)>=3:bs.hp<bs.maxHp*.5);bb.classList.toggle('pep',bs.type==='pep')")
    rep("#bossBar.rage b{background:linear-gradient(90deg,#ff2a3a,#ffd23a)}","#bossBar.rage b{background:linear-gradient(90deg,#ff2a3a,#ffd23a)}#bossBar i{position:relative}#bossBar .pt{position:absolute;top:0;bottom:0;width:2px;background:rgba(255,236,190,.9);box-shadow:0 0 3px #000;display:none}#bossBar.pep .pt{display:block}")
    rep('<div id="bossBar" hidden><div class="bn">ГЕНЕРАЛЬНЫЙ ДИРЕКТОР ГАЗ-АДА</div><i><b id="bossF"></b></i></div>','<div id="bossBar" hidden><div class="bn">ГЕНЕРАЛЬНЫЙ ДИРЕКТОР ГАЗ-АДА</div><i><b id="bossF"></b><s class="pt" style="left:33.3%"></s><s class="pt" style="left:66.6%"></s></i></div>')
    # снаряды на острове взрываются о рельеф
    rep("if(inBox(pos)||pos.y<0||p.t<=0){p.dead=true;if(p.owner==='player')","if(inBox(pos)||pos.y<0||p.t<=0||terrH(pos.x,pos.z)>pos.y+.05){p.dead=true;if(p.owner==='player')")
    # кадр, сетевые эффекты, старт уровня, выход в меню
    rep("gzFrame(dt);flushDmg();","gzFrame(dt);pepFrame(dt);flushDmg();")
    rep("else if(k==='D')dlFx(n);","else if(k==='D')dlFx(n);else if(k==='P')pepFx(n);")
    rep("reset();gzBegin();state='play';","reset();gzBegin();pepReset();state='play';")
    rep("function toMenu(){ambStop();","function toMenu(){ambStop();pepReset();")
if "if(en.type==='pep')dmg=pepNetDmg(en,dmg,src);" in s:
    rep("if(en.type==='pep')dmg=pepNetDmg(en,dmg,src);en.hp-=dmg;","en.hp-=en.type==='pep'?pepNetDmg(en,dmg,src):dmg;")
if '/*PEP2*/' not in s:
    rep("const BANNER_ALWAYS=/ПРОТОТИП|","const BANNER_ALWAYS=/*PEP2*//ЯДРО ПЕРЕГРУЖ|ЧЕКПОИНТ|ОБАНКРОЧЕН|ФРАНШИЗА|ПРОТОТИП|")
if '<!--PEP3-->' not in s:
    i=s.index('<div class="wcard boss"><h4>ГЕНЕРАЛЬНЫЙ ДИРЕКТОР');j=s.index('</div>',s.index('</p>',i))+6
    s=s[:j]+'\n      <!--PEP3--><div class="wcard boss"><h4>ПЕПСШТЕЙН <small>финальный босс · 3 фазы</small></h4><p>«Последний акционер». <b>I</b> трон-паук: гатлинги, ракетный пакет (смотри на круги), топот — перепрыгни волну; золотой щит «Привилегии» снимает только кулак или отбитая монета. <b>II</b> гуманоид: ракетный кулак — отбей ударом, прыжок «поглощения», луч из груди — перепрыгни, «Франшиза» — зовёт кетональщиков. <b>III</b> паук-гигант: свечи «обвала рынка», двойной луч, ракетный ливень, удары ногами; раскалённое ядро — сбей выстрелами или прячься за статуей. Старик и ядро — слабые места. Гибель возвращает к началу текущей фазы.</p></div>'+s[j:]
if '/*PEP4*/' not in s:
    rep("const BANNER_ALWAYS=/*PEP2*//","const BANNER_ALWAYS=/*PEP2*//*PEP4*//ПОСЛЕДНИЙ ВЗНОС|БЕГИ|ЯРОСТЬ|ПОГЛОЩЕНИЕ|ДОЧЕРНИЕ|")
if '<!--PEP3-->' in s:
    i=s.index('<!--PEP3-->');j=s.index('<p>',i);k=s.index('</p>',j)+4
    s=s[:j]+'<p>«Последний акционер». <b>I</b> трон-паук: гатлинги, ракетный пакет (смотри на круги), топот — перепрыгни волну, «Капитализация» — таран по оранжевой линии, уходи вбок; золотой щит «Привилегии» снимает только кулак или отбитая монета. <b>II</b> гуманоид: ракетный кулак — отбей ударом, «Скупка» — три волны подряд, прыгай под каждую, прыжок «поглощения», луч из груди — перепрыгни, «Франшиза» — зовёт кетональщиков. <b>III</b> паук-гигант: свечи «обвала рынка», двойной луч, ракетный ливень, удары ногами, «Делистинг» — осколки с экранов, дроны «дочерних компаний», «Враждебное поглощение» — пасть тянет к себе: беги или бей в ядро; раскалённое ядро — сбей выстрелами или прячься за статуей. В ярости (мало HP в фазе) он злее и быстрее. Старик и ядро — слабые места. После краха — «последний взнос»: добей акционера и беги от ядра. Гибель возвращает к началу текущей фазы.</p>'+s[k:]
if '<!--PEP5-->' not in s:
    rep('<p class="note" id="resBest"></p>','<p class="note" id="resBest"></p><!--PEP5--><p class="rs-epi" id="resEpi" hidden></p>')
    rep("#resRows b{","#res .rs-epi{max-width:min(720px,86vw);margin:1.4vh auto 0;font:400 clamp(12px,1.75vh,15px)/1.55 Rubik,sans-serif;color:var(--ice);opacity:.92;text-align:center}#res .rs-epi b{display:block;font:700 clamp(13px,1.9vh,17px)/1.7 Oswald,sans-serif;letter-spacing:.32em;color:var(--cy)}#res .rs-epi i{color:#ffd36a;font-style:normal;font-weight:700}#resRows b{")
if '/*PEP6*/' not in s:
    # старик рассыпается золотом — без общей «колы» при смерти
    rep(" puff(c,e.type==='golem'||e.type==='boss'?120:60,e.type==='golem'?0xf3efe6:0x5a1f0e,e.type==='golem'?14:10,1.1);puff(c,25,0xc8102e,8,.8);",
        " /*PEP6*/if(e.type!=='pep'){puff(c,e.type==='golem'||e.type==='boss'?120:60,e.type==='golem'?0xf3efe6:0x5a1f0e,e.type==='golem'?14:10,1.1);puff(c,25,0xc8102e,8,.8)}")
open(H,'w').write(s);print('pep ok')
