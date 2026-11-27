import sys
p='/home/claude/ultra/index.html'
s=open(p).read()
def rep(a,b,n=1):
    global s
    c=s.count(a)
    if c!=n:
        print('ANCHOR FAIL',c,repr(a[:90]));sys.exit(1)
    s=s.replace(a,b)
if 'id="pg-story"' in s:
    print('ui already patched');sys.exit(0)
# ---------- CSS ----------
css=r"""
/* сюжет: карточки уровней */
.lvs{display:grid;grid-template-columns:1fr 1fr;gap:1vw}
.lvc{position:relative;display:flex;flex-direction:column;text-align:left;border:1px solid rgba(98,227,255,.22);background:rgba(3,8,22,.62);overflow:hidden;transition:border-color .18s,box-shadow .18s}
.lvc:hover:not(:disabled){border-color:rgba(98,227,255,.6)}
.lvc .art{position:relative;display:block;height:16vh;min-height:86px;overflow:hidden}
.lvc .art::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,transparent 55%,rgba(3,8,22,.85))}
.lvc.l1 .art{background:
 repeating-linear-gradient(135deg,#f2b84b 0 9px,#1a0d0d 9px 18px) 0 100%/100% 12% no-repeat,
 repeating-linear-gradient(90deg,#2a2826 0 14px,#3e3a36 14px 18px) 0 76%/100% 14% no-repeat,
 radial-gradient(circle at 50% 50%,#8a9096 0 34%,transparent 36%) 0 76%/22px 22px repeat-x,
 linear-gradient(180deg,transparent 0 8%,#aab0b6 8% 30%,#f2b84b 30% 34%,transparent 34%) 22% 0/18% 100% no-repeat,
 linear-gradient(180deg,transparent 0 4%,#aab0b6 4% 18%,#f2b84b 18% 22%,transparent 22%) 52% 0/18% 100% no-repeat,
 linear-gradient(180deg,transparent 0 12%,#aab0b6 12% 40%,#f2b84b 40% 44%,transparent 44%) 82% 0/18% 100% no-repeat,
 radial-gradient(ellipse at 50% 120%,rgba(255,120,60,.55),transparent 60%),linear-gradient(180deg,#2a1f19,#4a362a)}
.lvc.l2 .art{background:
 radial-gradient(ellipse 60% 30% at 50% 100%,rgba(255,190,90,.9),transparent 70%),
 repeating-radial-gradient(ellipse at 30% 120%,rgba(255,170,60,.35) 0 6px,transparent 6px 16px),
 linear-gradient(90deg,transparent 0 12%,#6b4a32 12% 16%,transparent 16% 84%,#6b4a32 84% 88%,transparent 88%),
 radial-gradient(circle at 50% 38%,rgba(255,240,200,.95) 0 3%,rgba(255,160,60,.5) 4% 9%,transparent 12%),
 linear-gradient(180deg,#1c0f06 0 55%,#a8520f 55% 100%)}
.lvc .tx{display:block;padding:1.2vh 1vw 1.5vh}
.lvc em{font:600 11px/1 Rubik,sans-serif;letter-spacing:.24em;color:var(--cy);font-style:normal}
.lvc b{display:block;margin:.6vh 0 .5vh;font:700 clamp(18px,3.4vh,36px)/1 Oswald,sans-serif;transform:skewX(var(--sk));transform-origin:0 100%}
.lvc .ds{display:block;font:400 12px/1.4 Rubik,sans-serif;color:var(--mist)}
.lvc .bs{display:block;margin-top:.7vh;font:600 11px/1.2 Rubik,sans-serif;letter-spacing:.14em;color:#ffb36b;text-transform:uppercase}
.lvc .rk{position:absolute;right:.9vw;top:.4vh;font:400 clamp(36px,7.5vh,78px)/1 Anton,sans-serif;color:var(--ice);text-shadow:.05em .05em 0 var(--hot);transform:skewX(var(--sk));z-index:1}
.lvc .st{position:absolute;left:0;top:0;z-index:1;padding:.5em .8em;font:700 10px/1 Rubik,sans-serif;letter-spacing:.18em;background:rgba(3,8,22,.78);color:var(--ice)}
.lvc .lk{display:none;position:absolute;left:0;right:0;top:0;height:16vh;min-height:86px;z-index:2;align-items:center;justify-content:center;flex-direction:column;gap:.6vh;font:700 clamp(15px,2.4vh,22px)/1 Oswald,sans-serif;letter-spacing:.14em;color:var(--ice);background:rgba(3,8,22,.55)}
.lvc .lk small{font:500 11px Rubik,sans-serif;letter-spacing:.16em;color:var(--mist)}
.lvc:disabled{cursor:not-allowed}.lvc:disabled .art{filter:grayscale(1) brightness(.45)}.lvc:disabled .lk{display:flex}.lvc:disabled .tx{opacity:.55}
.lvc.sel{border-color:var(--ice);box-shadow:inset 0 0 0 2px var(--ice)}
.lvc.sel::after{content:"ВЫБРАН";position:absolute;right:0;bottom:0;padding:.45em .8em;font:700 10px/1 Rubik,sans-serif;letter-spacing:.2em;background:var(--hot);color:#fff}
.modes2{display:grid;grid-template-columns:1fr 1fr;gap:1vw}.mode.sm{min-height:11vh;padding-top:4vh}
.hs h3 .prog{margin-left:.8em;color:var(--hot);letter-spacing:.2em}
/* экран итогов и титр уровня */
#res .rs-lv{font:600 clamp(12px,1.8vh,16px)/1 Rubik,sans-serif;letter-spacing:.3em;color:var(--cy);text-transform:uppercase}
#res .rs{display:flex;align-items:center;gap:3vw;margin:1vh 0 .6vh}
#resRows{display:grid;grid-template-columns:auto auto;gap:.5vh 2.4vw;font-family:Rubik,sans-serif}
#resRows div{display:contents}#resRows span{font:500 12px/1.8 Rubik,sans-serif;letter-spacing:.22em;color:var(--mist);text-transform:uppercase}
#resRows b{font:700 clamp(16px,2.6vh,26px)/1.3 Oswald,sans-serif;color:var(--ice)}
#resG{font:400 clamp(110px,26vh,300px)/.8 Anton,sans-serif;color:var(--ice);transform:skewX(var(--sk));text-shadow:.05em .05em 0 var(--blu)}
#resG[data-g=S]{color:#ff9a4d;text-shadow:.05em .05em 0 #6a1404}#resG[data-g=A]{color:#f2b84b}
.ps-list .psb[hidden]{display:none}
#lvCard{position:absolute;left:6vw;top:24vh;pointer-events:none;color:var(--ice);font-family:Oswald,sans-serif;z-index:4}
#lvCard .lc-n{display:inline-block;padding:.35em .9em;font:700 clamp(12px,1.9vh,17px)/1 Rubik,sans-serif;letter-spacing:.32em;background:var(--hot);color:#fff;transform:skewX(var(--sk))}
#lvCard .lc-t{margin:.8vh 0 1vh;font:400 clamp(50px,12vh,140px)/.86 Anton,sans-serif;transform:skewX(var(--sk));text-shadow:.05em .05em 0 var(--blu),0 0 30px rgba(0,0,0,.6)}
#lvCard .lc-s{max-width:44vw;font:500 clamp(13px,2vh,18px)/1.45 Rubik,sans-serif;color:#dbe9ff;text-shadow:0 2px 6px #000}
#lvCard.go>*{animation:lcIn 5s cubic-bezier(.2,.9,.2,1) both}#lvCard.go .lc-t{animation-delay:.08s}#lvCard.go .lc-s{animation-delay:.16s}
@keyframes lcIn{0%{opacity:0;transform:translateX(-6vw) skewX(var(--sk))}12%{opacity:1;transform:translateX(0) skewX(var(--sk))}82%{opacity:1}100%{opacity:0;transform:translateX(2vw) skewX(var(--sk))}}
#syr{position:absolute;inset:0;pointer-events:none;opacity:0;transition:opacity .25s;background:radial-gradient(ellipse at 50% 40%,rgba(255,160,50,.55),rgba(120,50,5,.92));mix-blend-mode:multiply}
@media(max-width:900px){.lvs,.modes2{grid-template-columns:1fr}#lvCard .lc-s{max-width:80vw}}
"""
rep("</style>\n</head>",css+"</style>\n</head>")
# ---------- HUD ----------
rep('<div id="banner"></div><div id="respawn"></div>','<div id="syr"></div><div id="banner"></div><div id="respawn"></div><div id="lvCard" hidden><div class="lc-n" id="lcN"></div><div class="lc-t" id="lcT"></div><div class="lc-s" id="lcS"></div></div>')
# ---------- главное меню ----------
rep('''  <button class="mi" style="--i:0" data-go="play"><i>01</i><b>ИГРАТЬ</b><small>соло · кооп · арена</small></button>
  <button class="mi" style="--i:1" data-go="hero"><i>02</i><b>ГЕРОЙ</b><small>цвет · облик · анимации</small></button>
  <button class="mi" style="--i:2" data-go="manual"><i>03</i><b>УПРАВЛЕНИЕ</b><small>клавиши · оружие · враги</small></button>
  <button class="mi" style="--i:3" data-go="settings"><i>04</i><b>НАСТРОЙКИ</b><small>мышь · графика · звук</small></button>''',
'''  <button class="mi" style="--i:0" data-go="story"><i>01</i><b>СЮЖЕТ</b><small>уровни · боссы · соло и кооп</small></button>
  <button class="mi" style="--i:1" data-go="play"><i>02</i><b>АРКАДА</b><small>бесконечные волны · кооп · арена</small></button>
  <button class="mi" style="--i:2" data-go="hero"><i>03</i><b>ГЕРОЙ</b><small>цвет · облик · анимации</small></button>
  <button class="mi" style="--i:3" data-go="manual"><i>04</i><b>УПРАВЛЕНИЕ</b><small>клавиши · оружие · враги</small></button>
  <button class="mi" style="--i:4" data-go="settings"><i>05</i><b>НАСТРОЙКИ</b><small>мышь · графика · звук</small></button>''')
rep('<header class="pg-h"><span class="n">01</span><div class="ttl"><h2>ИГРАТЬ</h2><p>режим · карта · комната</p>','<header class="pg-h"><span class="n">02</span><div class="ttl"><h2>АРКАДА</h2><p>режим · карта · комната</p>')
rep('<span class="n">02</span><div class="ttl"><h2>ГЕРОЙ</h2>','<span class="n">03</span><div class="ttl"><h2>ГЕРОЙ</h2>')
rep('<span class="n">03</span><div class="ttl"><h2>УПРАВЛЕНИЕ</h2>','<span class="n">04</span><div class="ttl"><h2>УПРАВЛЕНИЕ</h2>')
rep('<span class="n">04</span><div class="ttl"><h2>НАСТРОЙКИ</h2>','<span class="n">05</span><div class="ttl"><h2>НАСТРОЙКИ</h2>')
rep(' <section class="pg" id="pg-play" hidden aria-label="Играть">',''' <section class="pg" id="pg-story" hidden aria-label="Сюжет">
  <header class="pg-h"><span class="n">01</span><div class="ttl"><h2>СЮЖЕТ</h2><p>уровни · механики · боссы</p></div><button class="pg-back" data-back>‹ НАЗАД <span class="k">Esc</span></button></header>
  <div class="hs"><h3>Уровни<span class="prog" id="lvProg"></span></h3><div class="lvs" id="lvList" role="radiogroup" aria-label="Уровень"></div></div>
  <div class="row2">
   <div class="hs"><h3>Как идём</h3><div class="modes2" role="radiogroup" aria-label="Соло или кооп">
    <button class="mode sm" id="sSolo" data-m="solo" role="radio"><em>ОФЛАЙН</em><b>СОЛО</b><span>Чекпоинт в каждом зале.</span></button>
    <button class="mode sm" id="sCoop" data-m="coop" role="radio"><em>ОНЛАЙН</em><b>КООП</b><span>Один уровень на всех — по коду комнаты.</span></button>
   </div></div>
   <div class="hs"><h3>Игрок</h3><div class="fields2">
    <label class="fl" for="nickS">Ник<input id="nickS" maxlength="14" autocomplete="off" spellcheck="false"></label>
    <label class="fl" id="codeSL" for="codeS">Комната для коопа<input id="codeS" maxlength="20" autocomplete="off" spellcheck="false"></label>
   </div></div>
  </div>
  <div class="go"><span id="lvBest"></span><button class="cta" id="storyBtn">НАЧАТЬ УРОВЕНЬ <span class="k">Enter</span></button></div>
 </section>
 <section class="pg" id="pg-play" hidden aria-label="Аркада">''')
# ---------- руководство ----------
rep('''      <div class="wcard boss"><h4>ГЕНЕРАЛЬНЫЙ ДИРЕКТОР <small>босс</small></h4>''','''      <div class="wcard"><h4>ВСТРЯХНУТАЯ БАНКА <small>сюжет</small></h4><p>Катится к тебе, встаёт и трясётся — через миг взорвётся шипучкой. Убей её раньше: взрыв заденет только врагов. Удар кулаком отправит банку туда, куда смотришь.</p></div>
      <div class="wcard"><h4>СИРОПНАЯ МЕДУЗА <small>сюжет · летает</small></h4><p>Кидает по дуге липкие сгустки — их можно отбить. Если стоять под ней, нырнёт и ужалит. Лопается в лужу сиропа.</p></div>
      <div class="wcard boss"><h4>КАРАМЕЛЬНАЯ ЦАРИЦА <small>босс уровня 2</small></h4><p>Град карамельных бомб (смотри на круги), сиропная волна — перепрыгни, сахарные шипы по светящимся трещинам. Сердце в груди — двойной урон. Слей озеро вентилями: на мели она получает +50%.</p></div>
      <div class="wcard boss"><h4>ГЕНЕРАЛЬНЫЙ ДИРЕКТОР <small>босс</small></h4>''')
rep('''     <div class="mrow"><div class="ks">Соло</div><div>Бесконечные волны. Лучший счёт сохраняется.</div></div>''','''     <div class="mrow"><div class="ks">Сюжет</div><div>Уровни из трёх залов: зачисти зал — откроется шлюз дальше. Чекпоинт в каждом зале. Пройденный уровень открывает следующий, и с любого открытого уровня можно начать.</div></div>
     <div class="mrow"><div class="ks">Конвейер · пресс</div><div>Лента везёт всех, кто на ней стоит. Пресс бьёт после красной мигалки и сирены — враги под ним гибнут сразу.</div></div>
     <div class="mrow"><div class="ks">Сироп · вентиль</div><div>В сиропе медленно и больно. Выстрел, взрыв или удар по красному вентилю сливает сироп на 10 секунд.</div></div>
     <div class="mrow"><div class="ks">Аркада · соло</div><div>Бесконечные волны. Лучший счёт сохраняется.</div></div>''')
# ---------- итоги ----------
rep('<div class="ov" id="dead" hidden>','''<div class="ov" id="res" hidden>
 <p class="rs-lv" id="resLv"></p>
 <h2 class="ps-t">УРОВЕНЬ <em>ПРОЙДЕН</em></h2>
 <div class="rs"><div id="resG">S</div><div id="resRows"></div></div>
 <p class="note" id="resBest"></p>
 <div class="ps-list"><button id="resNext" class="psb"><i>01</i>ДАЛЬШЕ</button><button id="resAgain" class="psb"><i>02</i>ПЕРЕИГРАТЬ</button><button id="resMenu" class="psb"><i>03</i>В МЕНЮ</button></div>
</div>
<div class="ov" id="dead" hidden>''')
# ---------- JS меню ----------
rep("const MM={el:$('menu'),view:'title',page:null,sel:0,items:[...document.querySelectorAll('#mmList .mi')],mode:'solo',mx:0,my:0,musOn:true};",
    "const MM={el:$('menu'),view:'title',page:null,sel:0,items:[...document.querySelectorAll('#mmList .mi')],mode:'solo',smode:'solo',lv:'l1',mx:0,my:0,musOn:true};\ntry{const sm=localStorage.getItem('ug-smode');if(sm==='coop')MM.smode=sm;const l=localStorage.getItem('ug-lv');if(lvIdx(l)>=0&&lvUnlocked(lvIdx(l)))MM.lv=l}catch(e){}")
rep("const KH={main:[['↑','↓','выбор'],['Enter','открыть'],['ЛКМ','повернуть героя']],play:",
    "const KH={main:[['↑','↓','выбор'],['Enter','открыть'],['ЛКМ','повернуть героя']],story:[['←','→','уровень'],['Esc','назад'],['Enter','начать']],play:")
rep(" if(page==='hero')buildHeroUI();if(page==='play')mmSetMode(MM.mode,true);",
    " if(page==='hero')buildHeroUI();if(page==='play')mmSetMode(MM.mode,true);if(page==='story'){$('nickS').value=$('nick').value;$('codeS').value=$('code').value;buildLvList();mmSetSMode(MM.smode,true)}")
rep("f=pg.querySelector('.mode.sel,.mtab.sel,.qb.sel,.sw .sel')","f=pg.querySelector('.lvc.sel,.mode.sel,.mtab.sel,.qb.sel,.sw .sel')")
rep("function mmGo(){if(state!=='menu')return;","""function buildLvList(){let done=0;$('lvList').innerHTML=LEVELS.map((lv,i)=>{const ok=lvUnlocked(i),pr=prog[lv.id]||{};if(pr.done)done++;const sel=MM.lv===lv.id;
  return '<button class="lvc '+lv.id+(sel?' sel':'')+'" data-l="'+lv.id+'" role="radio" aria-checked="'+sel+'"'+(ok?'':' disabled')+'><span class="art"></span>'+(pr.done?'<span class="st">ЛУЧШЕЕ '+fmtT(pr.t)+'</span><span class="rk">'+pr.g+'</span>':ok&&i>0?'<span class="st">ОТКРЫТ</span>':'')+
  '<span class="lk">ЗАКРЫТО<small>пройди уровень '+i+'</small></span><span class="tx"><em>УРОВЕНЬ '+lv.n+'</em><b>'+lv.name+'</b><span class="ds">'+lv.desc+'</span><span class="bs">Босс: '+lv.boss+'</span></span></button>'}).join('');
 $('lvProg').textContent=done+' / '+LEVELS.length;document.querySelectorAll('.lvc').forEach(b=>b.onclick=()=>mmPickLv(b.dataset.l));
 const pr=prog[MM.lv];$('lvBest').textContent=pr&&pr.done?'Рекорд: '+fmtT(pr.t)+' · оценка '+pr.g:'Уровень ещё не пройден'}
function mmPickLv(id,quiet){const i=lvIdx(id);if(i<0||!lvUnlocked(i))return;const ch=MM.lv!==id;MM.lv=id;save('ug-lv',id);document.querySelectorAll('.lvc').forEach(b=>{const on=b.dataset.l===id;b.classList.toggle('sel',on);b.setAttribute('aria-checked',on)});
 const pr=prog[id];$('lvBest').textContent=pr&&pr.done?'Рекорд: '+fmtT(pr.t)+' · оценка '+pr.g:'Уровень ещё не пройден';if(ch&&!quiet)uiSnd('move')}
function mmSetSMode(m,quiet){if(m!=='solo'&&$('sCoop').disabled)m='solo';const ch=m!==MM.smode;MM.smode=m;save('ug-smode',m);for(const [k,id] of[['solo','sSolo'],['coop','sCoop']]){$(id).classList.toggle('sel',k===m);$(id).setAttribute('aria-checked',k===m)}
 $('codeSL').classList.toggle('off',m==='solo');$('codeS').disabled=m==='solo';if(ch&&!quiet)uiSnd('move')}
function mmGoStory(){if(state!=='menu')return;$('nick').value=$('nickS').value;if($('codeS').value)$('code').value=$('codeS').value;uiSnd('ok');mmWipe();menuMusic(false);begin(MM.smode,MM.lv)}
function mmGo(){if(state!=='menu')return;""")
rep("$('startBtn').onclick=mmGo;","$('startBtn').onclick=mmGo;$('storyBtn').onclick=mmGoStory;['sSolo','sCoop'].forEach(id=>$(id).onclick=()=>mmSetSMode($(id).dataset.m));\n$('nickS').addEventListener('input',()=>{$('nick').value=$('nickS').value;mmMe()});$('codeS').addEventListener('input',()=>{$('code').value=$('codeS').value});\n['nickS','codeS'].forEach(id=>$(id).addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();mmGoStory()}else if(e.key==='Escape'){e.target.blur();mmBack()}}));\n$('resNext').onclick=()=>{const i=lvIdx(storyId),nx=LEVELS[i+1];if(nx){MM.lv=nx.id;save('ug-lv',nx.id);begin(mode,nx.id)}};$('resAgain').onclick=()=>begin(mode,storyId);$('resMenu').onclick=toMenu;")
rep("  if(MM.page==='play'&&e.code==='Enter'&&!(e.target&&e.target.closest&&e.target.closest('.pg-back,.cta'))){",
    "  if(MM.page==='story'&&(e.code==='ArrowLeft'||e.code==='ArrowRight')&&!(e.target&&e.target.closest&&e.target.closest('.mode'))){const ok=LEVELS.filter((l,i)=>lvUnlocked(i)),i=ok.findIndex(l=>l.id===MM.lv),n=ok[(i+(e.code==='ArrowRight'?1:ok.length-1))%ok.length];mmPickLv(n.id);const b=document.querySelector('.lvc[data-l='+n.id+']');b&&b.focus({preventScroll:true});e.preventDefault();return true}\n  if(MM.page==='story'&&e.code==='Enter'&&!(e.target&&e.target.closest&&e.target.closest('.pg-back,.cta'))){e.preventDefault();const c=e.target&&e.target.closest&&e.target.closest('.mode,.lvc');if(c&&!c.disabled)c.click();mmGoStory();return true}\n  if(MM.page==='play'&&e.code==='Enter'&&!(e.target&&e.target.closest&&e.target.closest('.pg-back,.cta'))){")
open(p,'w').write(s)
print('ok')
