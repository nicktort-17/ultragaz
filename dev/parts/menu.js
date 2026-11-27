/* ================= ГЛАВНОЕ МЕНЮ: экраны, навигация, звук ================= */
const MM={el:$('menu'),view:'title',page:null,sel:0,items:[...document.querySelectorAll('#mmList .mi')],mode:'solo',mx:0,my:0,musOn:true};
try{const m=localStorage.getItem('ug-mode');if(['solo','coop','pvp'].includes(m))MM.mode=m;MM.musOn=localStorage.getItem('ug-mus')!=='0';muted=localStorage.getItem('ug-mute')==='1'}catch(e){}
function uiSnd(k){if(!ac||muted)return;try{
 if(k==='move')tone(.05,'triangle',1250,1480,.07);
 else if(k==='ok'){tone(.08,'triangle',880,1320,.09);setTimeout(()=>{try{tone(.16,'sine',1760,2350,.07)}catch(e){}},55)}
 else if(k==='back')tone(.12,'triangle',980,520,.08);
 else if(k==='start'){nz(.55,'bandpass',1600,.22,5200);tone(.5,'sine',440,880,.1);tone(.7,'triangle',660,1320,.06)}}catch(e){}}
/* музыка меню: тихие аккорды, бас и «пузырьковые» ноты */
let mus=null;
function menuMusic(on){if(!ac)return;
 if(on&&!mus){const g=ac.createGain(),f=ac.createBiquadFilter(),lfo=ac.createOscillator(),lg=ac.createGain();g.gain.setValueAtTime(0,ac.currentTime);g.gain.linearRampToValueAtTime(.06,ac.currentTime+2.5);
  f.type='lowpass';f.frequency.value=950;f.Q.value=.6;lfo.frequency.value=.06;lg.gain.value=420;lfo.connect(lg);lg.connect(f.frequency);lfo.start();f.connect(g);g.connect(master);
  mus={g,f,lfo,step:0,timer:0};const CH=[[57,60,64,67],[53,57,60,64],[48,52,55,59],[55,59,62,66]],hz=n=>440*Math.pow(2,(n-69)/12);
  const play=()=>{if(!mus||!ac)return;const t=ac.currentTime+.05,ch=CH[mus.step++%4];
   ch.forEach((n,i)=>{const o=ac.createOscillator(),e=ac.createGain();o.type=i%2?'triangle':'sine';o.frequency.value=hz(n)*(1+(i-1.5)*.0025);e.gain.setValueAtTime(0,t);e.gain.linearRampToValueAtTime(.2,t+1.3);e.gain.linearRampToValueAtTime(0,t+4.7);o.connect(e);e.connect(f);o.start(t);o.stop(t+4.8)});
   const b=ac.createOscillator(),be=ac.createGain();b.type='sine';b.frequency.value=hz(ch[0]-12);be.gain.setValueAtTime(0,t);be.gain.linearRampToValueAtTime(.38,t+.5);be.gain.linearRampToValueAtTime(0,t+4.5);b.connect(be);be.connect(f);b.start(t);b.stop(t+4.6);
   for(let k=0;k<6;k++){const tt=t+.3+Math.random()*3.6,o=ac.createOscillator(),e=ac.createGain();o.type='sine';o.frequency.value=hz(ch[k%4]+24);e.gain.setValueAtTime(0,tt);e.gain.linearRampToValueAtTime(.07,tt+.01);e.gain.exponentialRampToValueAtTime(.0005,tt+.7);o.connect(e);e.connect(g);o.start(tt);o.stop(tt+.75)}
   mus.timer=setTimeout(play,4000)};play()}
 else if(!on&&mus){const m=mus;mus=null;clearTimeout(m.timer);try{const t=ac.currentTime;m.g.gain.cancelScheduledValues(t);m.g.gain.setValueAtTime(m.g.gain.value,t);m.g.gain.linearRampToValueAtTime(0,t+.7);setTimeout(()=>{try{m.lfo.stop();m.g.disconnect()}catch(e){}},900)}catch(e){}}}
function musicCheck(){menuMusic(state==='menu'&&MM.musOn&&!muted&&!!ac)}
/* манометр-циферблат на фоне */
(()=>{let s='<g class="r1"><circle cx="100" cy="100" r="97.5" fill="none" stroke="#8fc8ff" stroke-width=".4"/>';
 for(let i=0;i<120;i++){const a=i/120*Math.PI*2,l=i%10===0?9:i%5===0?5:2.5,r=96,w=i%10===0?.8:.35;s+='<line x1="'+(100+Math.cos(a)*r).toFixed(2)+'" y1="'+(100+Math.sin(a)*r).toFixed(2)+'" x2="'+(100+Math.cos(a)*(r-l)).toFixed(2)+'" y2="'+(100+Math.sin(a)*(r-l)).toFixed(2)+'" stroke="#8fc8ff" stroke-width="'+w+'"/>'}
 s+='</g><g class="r2"><circle cx="100" cy="100" r="78" fill="none" stroke="#62e3ff" stroke-width=".35" stroke-dasharray="2 3"/>';
 for(let i=0;i<12;i++){const a=i/12*Math.PI*2-Math.PI/2;s+='<text x="'+(100+Math.cos(a)*70).toFixed(2)+'" y="'+(101.8+Math.sin(a)*70).toFixed(2)+'" fill="#8fc8ff" font-size="5" text-anchor="middle" font-family="Oswald,sans-serif">'+(i*10)+'</text>'}
 s+='<path d="M40 100 a60 60 0 0 1 120 0" fill="none" stroke="#ff2d4d" stroke-width="1.2" stroke-dasharray="34 300"/></g><circle cx="100" cy="100" r="58" fill="none" stroke="#8fc8ff" stroke-width=".25"/>';
 s+='<text x="100" y="128" fill="#8fc8ff" font-size="4" text-anchor="middle" letter-spacing="1.2" font-family="Rubik,sans-serif">ДАВЛЕНИЕ · БАР</text><g class="nd"><line x1="100" y1="100" x2="100" y2="40" stroke="#ff2d4d" stroke-width="1"/><circle cx="100" cy="100" r="3" fill="#ff2d4d"/></g>';
 $('mmGauge').innerHTML=s})();
/* календарь: дата, смена, фаза луны */
const MON=['ЯНВ','ФЕВ','МАР','АПР','МАЙ','ИЮН','ИЮЛ','АВГ','СЕН','ОКТ','НОЯ','ДЕК'],WDN=['ВС','ПН','ВТ','СР','ЧТ','ПТ','СБ'];
function moonPhase(d){return(((d.getTime()/864e5-10962.76)/29.530588853)%1+1)%1}
function phaseName(p){return p<.03||p>.97?'НОВОЛУНИЕ':p<.22?'РАСТУЩИЙ СЕРП':p<.28?'ПЕРВАЯ ЧЕТВЕРТЬ':p<.47?'РАСТУЩАЯ ЛУНА':p<.53?'ПОЛНОЛУНИЕ':p<.72?'УБЫВАЮЩАЯ ЛУНА':p<.78?'ПОСЛЕДНЯЯ ЧЕТВЕРТЬ':'УБЫВАЮЩИЙ СЕРП'}
function drawMoon(p){const c=$('calMoon').getContext('2d'),r=27,x=32,y=32;c.clearRect(0,0,64,64);c.fillStyle='rgba(110,150,220,.28)';c.beginPath();c.arc(x,y,r,0,7);c.fill();
 const k=Math.cos(p*2*Math.PI),rx=Math.abs(k)*r;c.fillStyle='#eef5ff';c.beginPath();
 if(p<.5){c.arc(x,y,r,-Math.PI/2,Math.PI/2,false);c.ellipse(x,y,rx,r,0,Math.PI/2,-Math.PI/2,k>0)}else{c.arc(x,y,r,Math.PI/2,-Math.PI/2,false);c.ellipse(x,y,rx,r,0,-Math.PI/2,Math.PI/2,k>0)}c.fill()}
function calTick(){const d=new Date(),h=d.getHours(),w=d.getDay(),p=moonPhase(d);$('calD').textContent=d.getDate();$('calM').textContent=MON[d.getMonth()];
 const we=$('calW');we.textContent=WDN[w];we.className='w'+(w===6?' sat':w===0?' sun':'');$('calT').textContent=String(h).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');
 $('calS').textContent=h<6?'НОЧНАЯ СМЕНА':h<12?'УТРЕННЯЯ СМЕНА':h<18?'ДНЕВНАЯ СМЕНА':'ВЕЧЕРНЯЯ СМЕНА';$('calPh').textContent=phaseName(p);drawMoon(p)}
calTick();setInterval(()=>{if(state==='menu')calTick()},10000);
/* экраны */
const KH={main:[['↑','↓','выбор'],['Enter','открыть'],['ЛКМ','повернуть героя']],play:[['Esc','назад'],['Enter','начать']],hero:[['Esc','назад'],['ЛКМ','повернуть героя']],manual:[['Esc','назад'],['←','→','раздел']],page:[['Esc','назад']]};
function mmKeys(){const list=MM.view==='main'?KH.main:MM.view==='page'?(KH[MM.page]||KH.page):[];
 $('mmKeys').innerHTML=list.map(a=>'<span>'+a.slice(0,-1).map(k=>'<span class="k">'+k+'</span>').join('')+a[a.length-1]+'</span>').join('');mmMe()}
function mmMe(){$('mmPc').style.background=myColor;$('mmNick').textContent=cleanNick($('nick').value);$('mmSp').textContent='★ '+Math.floor(bank).toLocaleString('ru')+' очков стиля'}
function mmWipe(){const w=$('mmWipe');w.classList.remove('go');void w.offsetWidth;w.classList.add('go')}
function mmView(v,page){MM.view=v;MM.page=page||null;MM.el.dataset.v=v;
 document.querySelectorAll('.pg').forEach(p=>{const on=v==='page'&&p.id==='pg-'+page;if(on){p.hidden=false;p.classList.remove('in');void p.offsetWidth;p.classList.add('in');p.scrollTop=0}else p.hidden=true});
 if(page==='hero')buildHeroUI();if(page==='play')mmSetMode(MM.mode,true);if(page==='settings')mmSettings();mmKeys();
 setTimeout(()=>{try{if(MM.view==='main')MM.items[MM.sel].focus({preventScroll:true});else if(MM.view==='page'){const pg=$('pg-'+MM.page),f=pg.querySelector('.mode.sel,.mtab.sel,.qb.sel,.sw .sel')||pg.querySelector('button:not(:disabled):not(.pg-back)');f&&f.focus({preventScroll:true})}}catch(e){}},40)}
function mmSel(i,snd=true){i=(i+MM.items.length)%MM.items.length;const ch=i!==MM.sel||!MM.items[i].classList.contains('on');MM.sel=i;
 MM.items.forEach((b,j)=>{b.classList.toggle('on',j===i);b.setAttribute('aria-current',j===i?'true':'false')});if(MM.view==='main'&&document.activeElement!==MM.items[i])MM.items[i].focus({preventScroll:true});if(ch&&snd)uiSnd('move')}
function mmEnter(){if(MM.view!=='title')return;initAudio();if(ac&&ac.state==='suspended')ac.resume();uiSnd('start');mmWipe();setTimeout(()=>{mmView('main');mmSel(MM.sel,false)},140);musicCheck()}
function mmOpen(i){if(i!=null)MM.sel=i;uiSnd('ok');mmWipe();mmView('page',MM.items[MM.sel].dataset.go)}
function mmBack(){if(MM.view!=='page')return;uiSnd('back');mmView('main');mmSel(MM.sel,false)}
function mmSetMode(m,quiet){const ids={solo:'mSolo',coop:'mCoop',pvp:'mPvp'};if(m!=='solo'&&$(ids[m]).disabled)m='solo';const ch=m!==MM.mode;MM.mode=m;save('ug-mode',m);
 for(const k in ids){$(ids[k]).classList.toggle('sel',k===m);$(ids[k]).setAttribute('aria-checked',k===m)}$('codeL').classList.toggle('off',m==='solo');$('code').disabled=m==='solo';if(ch&&!quiet)uiSnd('move')}
function mmGo(){if(state!=='menu')return;uiSnd('ok');mmWipe();menuMusic(false);begin(MM.mode)}
function mmSettings(){$('sensV').textContent=(+sens).toFixed(1);$('sndOn').classList.toggle('sel',!muted);$('sndOff').classList.toggle('sel',muted);$('musOn').classList.toggle('sel',MM.musOn);$('musOff').classList.toggle('sel',!MM.musOn);
 $('fsBtn').textContent=document.fullscreenElement?'ВЫКЛЮЧИТЬ':'ВКЛЮЧИТЬ';$('fsBtn').classList.toggle('sel',!!document.fullscreenElement)}
function setMute(v){muted=v;save('ug-mute',v?'1':'0');mmSettings();musicCheck()}
MM.items.forEach((b,i)=>{b.addEventListener('mouseenter',()=>{if(MM.view==='main')mmSel(i)});b.onclick=()=>{if(MM.view==='main')mmOpen(i)}});
document.querySelectorAll('[data-back]').forEach(b=>b.onclick=mmBack);
['mSolo','mCoop','mPvp'].forEach(id=>$(id).onclick=()=>mmSetMode($(id).dataset.m));
$('startBtn').onclick=mmGo;$('mmPress').onclick=mmEnter;
['nick','code'].forEach(id=>$(id).addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();mmGo()}else if(e.key==='Escape'){e.target.blur();mmBack()}}));
$('nick').addEventListener('input',mmMe);
document.querySelectorAll('.mtab').forEach(b=>b.onclick=()=>mmTab(b.dataset.t));
function mmTab(t){document.querySelectorAll('.mtab').forEach(x=>{x.classList.toggle('sel',x.dataset.t===t);x.setAttribute('aria-selected',x.dataset.t===t)});document.querySelectorAll('.msec').forEach(s=>s.hidden=s.id!=='ms-'+t);uiSnd('move')}
$('sndOn').onclick=()=>{setMute(false);uiSnd('ok')};$('sndOff').onclick=()=>setMute(true);
$('musOn').onclick=()=>{MM.musOn=true;save('ug-mus','1');mmSettings();musicCheck()};$('musOff').onclick=()=>{MM.musOn=false;save('ug-mus','0');mmSettings();musicCheck()};
$('fsBtn').onclick=()=>{try{if(document.fullscreenElement)document.exitFullscreen();else document.documentElement.requestFullscreen().catch(()=>{})}catch(e){}};document.addEventListener('fullscreenchange',mmSettings);
document.querySelectorAll('.qb,.map,#sw,#anB,#cosm').forEach(el=>el.addEventListener('click',e=>{if(e.target.closest('button'))uiSnd('move')}));
function mmKey(e){const tag=(e.target&&e.target.tagName)||'';
 if(MM.view==='title'){if(/^(Shift|Control|Alt|Meta)/.test(e.code)||e.code==='Tab'||e.code==='KeyM')return false;e.preventDefault();mmEnter();return true}
 if(tag==='INPUT')return false;
 if(MM.view==='main'){if(e.code==='ArrowUp'||e.code==='KeyW'){e.preventDefault();mmSel(MM.sel-1);return true}if(e.code==='ArrowDown'||e.code==='KeyS'){e.preventDefault();mmSel(MM.sel+1);return true}
  if(e.code==='Escape'){uiSnd('back');mmWipe();mmView('title');return true}return false}
 if(MM.view==='page'){if(e.code==='Escape'||e.code==='Backspace'){e.preventDefault();mmBack();return true}
  if(MM.page==='play'&&e.code==='Enter'&&!(e.target&&e.target.closest&&e.target.closest('.mode,.map,.pg-back'))){e.preventDefault();mmGo();return true}
  if(MM.page==='manual'&&(e.code==='ArrowLeft'||e.code==='ArrowRight')){const ts=[...document.querySelectorAll('.mtab')],i=ts.findIndex(x=>x.classList.contains('sel')),n=ts[(i+(e.code==='ArrowRight'?1:ts.length-1))%ts.length];mmTab(n.dataset.t);n.focus({preventScroll:true});e.preventDefault();return true}
  return false}
 return false}
/* мышь: параллакс и вращение героя */
{let dr=null;const mn=MM.el;mn.addEventListener('pointerdown',e=>{if(MM.view==='title'){mmEnter();return}if(e.target===mn){dr=e.clientX;try{mn.setPointerCapture(e.pointerId)}catch(_){}}});
 mn.addEventListener('pointermove',e=>{const r=mn.getBoundingClientRect();MM.mx=(e.clientX-r.left)/r.width*2-1;MM.my=(e.clientY-r.top)/r.height*2-1;if(dr!==null){MSC.drag+=(e.clientX-dr)*.009;dr=e.clientX}});
 mn.addEventListener('pointerup',()=>dr=null);mn.addEventListener('pointercancel',()=>dr=null)}
/* камера и герой на сцене меню */
const MSC={p:new V3(2.1,.62,4.9),t:new V3(-1.05,1.5,0),yaw:Math.PI-.55,drag:0,fl:6};
function setHeroLayer(h,l){h.layer=l;h.root.traverse(o=>o.layers.set(l))}
function menuStage(now,dt){const h=selfHero,v=MM.view==='page'?MM.page:MM.view,wide=wrap.clientWidth>900;let P_,T_,Y;
 if(v==='title'){P_=[2.1,.62,4.9];T_=[-1.05,1.5,0];Y=Math.PI-.55}
 else if(v==='hero'){P_=[-.3,1.28,2.75];T_=wide?[.85,1.0,0]:[0,1,0];Y=Math.PI+.12}
 else if(v==='main'){P_=[-.45,1.42,3.75];T_=wide?[1.22,1.06,0]:[0,1.05,0];Y=Math.PI+.38}
 else{P_=[-.8,1.55,4.25];T_=wide?[1.6,1.1,0]:[0,1.1,0];Y=Math.PI+.3}
 const k=1-Math.exp(-dt*2.4),dx=MM.mx*.22+Math.sin(now/4300)*.08,dy=-MM.my*.09+Math.sin(now/3100)*.05;
 MSC.p.lerp(tmpA.set(P_[0]+dx,P_[1]+dy,P_[2]),k);MSC.t.lerp(tmpB.set(T_[0],T_[1],T_[2]),k);camera.position.copy(MSC.p);camera.lookAt(MSC.t);
 if(camera.fov!==40){camera.fov=40;camera.updateProjectionMatrix()}
 MSC.yaw+=(Y+MSC.drag-MSC.yaw)*(1-Math.exp(-dt*3));h.root.visible=true;h.root.position.set(0,0,0);h.root.rotation.y=MSC.yaw;const yaw=MSC.yaw;
 SHOW.t+=dt;let an=SHOW.anim,lt=SHOW.t;if(an==='demo'){if(SHOW.t>DEMO[SHOW.seq%DEMO.length][1]){SHOW.t=0;SHOW.seq++;lt=0}an=DEMO[SHOW.seq%DEMO.length][0]}
 const fx=-Math.sin(yaw),fz=-Math.cos(yaw),st={vx:0,vz:0,vy:0,yaw,air:false,slide:false,dash:false,slam:false,pitch:-.05,hp:100,alive:true,w:SHOW.w};
 const per=(P2)=>{const prev=lt-dt;return Math.floor(lt/P2)!==Math.floor(prev/P2)||lt<dt};
 if(an==='run'){st.vx=fx*12;st.vz=fz*12}
 else if(an==='jump'){const t=lt%1.4;if(t<1){st.air=true;st.vy=11-22*t;st.vx=fx*4;st.vz=fz*4}else st.vy=0}
 else if(an==='slide'){st.slide=true;st.vx=fx*19;st.vz=fz*19}
 else if(an==='dash'){const t=lt%.9;if(t<.2){st.dash=true;st.vx=fx*40;st.vz=fz*40}else if(t<.45){st.air=true;st.vy=-3}}
 else if(an==='slam'){const t=lt%1.5;if(t<.3){st.air=true;st.vy=8}else if(t<.62){st.slam=true;st.air=true;st.vy=-55}}
 else if(an==='punch'){if(per(.8))heroPunch(h)}
 else if(an==='fire'){if(per(.55)){heroFire(h);if(++SHOW.shots%3===0)SHOW.w=(SHOW.w+1)%4;st.w=SHOW.w}}
 else if(an==='death'){st.alive=(lt%3.4)>2.6;st.hp=st.alive?100:0}
 else if(an==='idle'&&v!=='hero'){MSC.fl-=dt;if(MSC.fl<=0){MSC.fl=7+Math.random()*5;if(Math.random()<.6){heroFire(h);setTimeout(()=>heroFire(h),180)}else heroPunch(h)}}
 animHero(h,st,dt);stageTick(dt)}
