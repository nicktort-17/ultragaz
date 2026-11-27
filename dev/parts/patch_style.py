# Метр стиля «бутылка»: панель в правом верхнем углу HUD.
# Идемпотентен: заменяет старый блок или ранее вставленный регион SMETER.
import re,sys
P='/home/claude/ultra/index.html'
s=open(P,encoding='utf-8').read()

CSS=r'''/*SMETER-CSS*/
.style{position:absolute;right:14px;top:40px;width:340px;text-align:right;transform-origin:top right;transform:scale(var(--smk,1));--rc:#3fc4f0;--rc2:#9ae6ff}
@media (max-width:1100px){.style{--smk:.82}}@media (max-width:760px){.style{--smk:.64}}
.smp{position:relative;display:flex;align-items:center;gap:4px;height:118px;padding:0 10px 0 0;transition:opacity .4s,filter .4s}
.smbg{position:absolute;inset:0;pointer-events:none;background:linear-gradient(100deg,rgba(14,4,5,0) 0%,rgba(18,5,7,.82) 24%,rgba(26,6,9,.86) 100%);
 clip-path:polygon(18% 0,100% 0,100% 82%,94% 100%,0 100%,9% 0)}
.smbg::before{content:"";position:absolute;inset:0;pointer-events:none;
 background:linear-gradient(90deg,transparent 12%,rgba(255,60,60,.55) 40%,rgba(255,60,60,.9)) top/100% 1.5px no-repeat,
 linear-gradient(90deg,transparent 8%,rgba(255,60,60,.35) 50%,rgba(255,60,60,.6)) bottom/100% 1.5px no-repeat,
 repeating-linear-gradient(115deg,rgba(255,40,50,.55) 0 4px,transparent 4px 9px) right 8px top 8px/34px 9px no-repeat}
.smp::after{content:"";position:absolute;right:5px;bottom:5px;width:14px;height:14px;border-right:2px solid rgba(255,255,255,.55);border-bottom:2px solid rgba(255,255,255,.55);pointer-events:none}
.style.idle .smp{opacity:.6;filter:saturate(.4)}
.smb{width:84px;height:118px;flex:none;position:relative;overflow:visible}
.smb svg{position:absolute;left:-14px;top:-30px;width:112px;height:180px;overflow:visible;transform:rotate(-13deg);filter:drop-shadow(0 3px 4px rgba(0,0,0,.7))}
.style.r5 .smb svg{animation:smShake .09s linear infinite}
.style.r6 .smb svg{animation:smShake .07s linear infinite;filter:drop-shadow(0 0 10px rgba(255,40,50,.85)) drop-shadow(0 3px 4px #000)}
@keyframes smShake{0%{transform:rotate(-13deg) translate(0,0)}25%{transform:rotate(-15deg) translate(-1px,.5px)}50%{transform:rotate(-11deg) translate(1px,-.5px)}75%{transform:rotate(-14deg) translate(.5px,1px)}100%{transform:rotate(-13deg) translate(0,0)}}
.smb .bub{animation:smRise var(--d,1.6s) linear infinite;animation-delay:var(--dl,0s);opacity:var(--bo,.2)}
@keyframes smRise{0%{transform:translateY(0);}100%{transform:translateY(-104px)}}
.smb .wave{animation:smWave 1.4s linear infinite}
@keyframes smWave{to{transform:translateX(-24px)}}
.smb .foam{opacity:var(--fo,0);transition:opacity .4s}
.smb .burst{display:none}.style.r6 .smb .burst{display:inline}.style.r6 .smb .cap0{display:none}
.smb .capf{animation:smCap .9s cubic-bezier(.2,.7,.4,1) infinite;transform-box:fill-box;transform-origin:center}
@keyframes smCap{0%{transform:translate(0,0) rotate(0)}100%{transform:translate(14px,-30px) rotate(200deg);opacity:0}}
.smb .shard{animation:smShard 1.1s ease-out infinite;animation-delay:var(--dl,0s);transform-box:fill-box}
@keyframes smShard{0%{transform:translate(0,0) rotate(0);opacity:1}100%{transform:translate(var(--sx),var(--sy)) rotate(var(--sr));opacity:0}}
.smb .star{transform-box:fill-box;transform-origin:center;animation:smStar .5s ease-in-out infinite alternate;mix-blend-mode:screen}
@keyframes smStar{from{transform:scale(.85) rotate(0)}to{transform:scale(1.12) rotate(8deg)}}
.smb .jet{animation:smJet .35s ease-in-out infinite alternate;transform-box:fill-box;transform-origin:50% 100%}
@keyframes smJet{from{transform:scaleY(.8)}to{transform:scaleY(1.15)}}
.smr{flex:1;min-width:0;position:relative;padding-right:6px;display:flex;flex-direction:column;align-items:stretch;gap:5px;padding-top:4px}
.style.r5{--rf:60px}.style.r6{--rf:54px}
.smh{display:flex;align-items:flex-end;justify-content:space-between;height:64px;transform:skewX(-11deg)}
.smst{font:400 34px/1 Anton,"Russo One",Arial,sans-serif;letter-spacing:.02em;padding-bottom:6px;
 background:linear-gradient(180deg,#ffffff 0%,#e6e6e6 45%,#8f8f8f 55%,#d9d9d9 100%);-webkit-background-clip:text;background-clip:text;color:transparent;
 filter:drop-shadow(0 2px 0 rgba(0,0,0,.85))}
#rank{font:400 var(--rf,66px)/.9 Anton,"Russo One",Arial,sans-serif;letter-spacing:-.01em;padding:0 4px 0 6px;
 background:linear-gradient(180deg,var(--rc2) 0%,var(--rc) 55%,color-mix(in srgb,var(--rc) 60%,#000) 100%);-webkit-background-clip:text;background-clip:text;color:transparent!important;
 filter:drop-shadow(0 0 1px #000) drop-shadow(0 2px 0 #000) drop-shadow(0 0 12px color-mix(in srgb,var(--rc) 70%,transparent))}
.style.up #rank{animation:smPop .45s cubic-bezier(.2,1.6,.4,1)}
.style.dn #rank{animation:smDrop .4s linear}
@keyframes smPop{0%{transform:scale(1.9) rotate(-8deg);filter:brightness(3) drop-shadow(0 0 20px #fff)}100%{transform:none}}
@keyframes smDrop{0%,100%{transform:none}20%{transform:translateX(-6px)}40%{transform:translateX(5px)}60%{transform:translateX(-3px)}80%{transform:translateX(2px)}}
.style.up .smbg{animation:smFlash .35s ease-out}
@keyframes smFlash{0%{box-shadow:inset 0 0 0 200px rgba(255,255,255,.22)}100%{box-shadow:inset 0 0 0 200px rgba(255,255,255,0)}}
.smln{height:2px;margin:-6px 30px 0 4px;background:linear-gradient(90deg,rgba(255,255,255,.9),rgba(255,255,255,.35) 70%,transparent)}
.smbar{display:flex;gap:4px;height:20px;padding:3px 5px;margin-right:4px;transform:skewX(-24deg);border:1.5px solid rgba(255,255,255,.82);border-radius:2px;background:rgba(0,0,0,.55);box-shadow:0 0 0 1px rgba(0,0,0,.8),inset 0 0 6px rgba(0,0,0,.9)}
.smbar i{flex:1;position:relative;background:linear-gradient(180deg,#241012,#160709);border-radius:1px;overflow:hidden}
.smbar b{position:absolute;inset:0 auto 0 0;width:0;
 background:radial-gradient(circle at 30% 40%,rgba(255,220,220,.75) 0 1.3px,transparent 1.8px) 0 0/9px 8px,
 radial-gradient(circle at 70% 70%,rgba(255,200,200,.55) 0 1px,transparent 1.5px) 3px 2px/11px 9px,
 linear-gradient(180deg,#ff5a5a 0%,#e01e2a 45%,#8e0b14 100%);
 box-shadow:inset 0 1px 0 rgba(255,255,255,.45);animation:smFizz 1.2s linear infinite}
@keyframes smFizz{to{background-position:0 -16px,3px -16px,0 0}}
.style.r6 .smbar{border-color:#fff;box-shadow:0 0 10px rgba(255,40,50,.9),inset 0 0 6px rgba(0,0,0,.9)}
#rankName{align-self:flex-end;position:relative;margin:3px 10px 0 0;padding:3px 14px 3px 18px;transform:skewX(-20deg);
 font:700 16px/1 Oswald,"Russo One",Arial,sans-serif;letter-spacing:.14em;color:#fff!important;
 text-shadow:0 1px 0 rgba(0,0,0,.9),0 0 6px rgba(0,0,0,.6);
 background:linear-gradient(90deg,transparent 0,color-mix(in srgb,var(--rc) 55%,transparent) 22%,color-mix(in srgb,var(--rc) 85%,#000) 100%);
 box-shadow:inset 0 1px 0 rgba(255,255,255,.45),inset 0 -2px 0 rgba(0,0,0,.35);overflow:hidden}
#rankName::before{content:"";position:absolute;right:4px;top:3px;bottom:3px;width:3px;background:#fff;opacity:.85;box-shadow:-5px 0 0 rgba(255,255,255,.5),-10px 0 0 rgba(255,255,255,.25)}
#rankName::after{content:"";position:absolute;inset:0;background:linear-gradient(100deg,transparent 30%,rgba(255,255,255,.55) 45%,transparent 60%);transform:translateX(-120%)}
.style.up #rankName::after{animation:smShine .6s ease-out}
.style.r5 #rankName::after,.style.r6 #rankName::after{animation:smShine 1.6s ease-in-out infinite}
@keyframes smShine{to{transform:translateX(120%)}}
#rankName{padding-right:22px}
#feed{margin-top:6px;font:400 14px/1.45 "Russo One",Arial,sans-serif;font-style:italic;text-shadow:0 1px 2px #000;padding-right:10px}
#feed div{display:inline-block;clear:both;float:right;padding:1px 10px 1px 14px;margin-top:2px;background:linear-gradient(90deg,transparent,rgba(30,6,8,.72) 22%);border-right:3px solid #e0242e;color:#f6eee2}
@media (prefers-reduced-motion:reduce){.smb *,.smbar b,.style .smb svg,#rank{animation:none!important}}
/*SMETER-CSS-END*/'''

def bub():
    import random
    random.seed(7);o=[]
    for i in range(22):
        x=14+random.random()*32;r=.8+random.random()*1.6;d=1.1+random.random()*1.5;dl=-random.random()*2.5
        o.append('<circle class="bub" cx="%.1f" cy="%.1f" r="%.1f" fill="rgba(255,190,180,.14)" stroke="rgba(255,236,230,.9)" stroke-width=".55" style="--d:%.2fs;--dl:%.2fs"/>'%(x,118+random.random()*6,r,d,dl))
    return ''.join(o)
SH=''.join('<polygon class="shard" points="0,0 %d,%d %d,%d" transform="translate(%d %d)" fill="rgba(235,245,255,.9)" stroke="rgba(255,255,255,.9)" stroke-width=".4" style="--sx:%dpx;--sy:%dpx;--sr:%ddeg;--dl:%.2fs"/>'%(a,b,c,d,x,y,sx,sy,sr,dl)
   for (a,b,c,d,x,y,sx,sy,sr,dl) in [(4,-2,2,5,48,60,26,-6,220,0),(-3,-4,3,-5,12,70,-26,-10,-200,-.3),(5,3,-1,6,46,92,24,14,160,-.6),(-4,2,-2,6,10,98,-22,16,-180,-.2),(3,-5,6,-1,40,40,16,-24,240,-.8),(-5,-1,-2,-6,18,42,-18,-22,-210,-.5),(3,4,-3,4,30,104,4,26,120,-.4)])
SVG=('<svg viewBox="0 0 60 130" aria-hidden="true"><defs>'
 '<clipPath id="smGl"><path d="M24.5,15 L35.5,15 L35.5,31 C35.5,38 48.5,42 48.5,54 L48.5,108 C48.5,113.5 45,116 40,116 L20,116 C15,116 11.5,113.5 11.5,108 L11.5,54 C11.5,42 24.5,38 24.5,31 Z"/></clipPath>'
 '<clipPath id="smLq"><rect id="smLqR" x="0" y="110" width="60" height="40"/></clipPath>'
 '<linearGradient id="smLg" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#4a040a"/><stop offset=".3" stop-color="#c4101c"/><stop offset=".55" stop-color="#e8222c"/><stop offset=".8" stop-color="#9c0c16"/><stop offset="1" stop-color="#3e0308"/></linearGradient>'
 '<linearGradient id="smCp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff5a52"/><stop offset=".6" stop-color="#c3121c"/><stop offset="1" stop-color="#6e0810"/></linearGradient></defs>'
 # сзади: струи пены (SSS)
 '<g class="burst"><polygon class="star" points="64.0,26.0 42.6,29.7 59.4,44.7 39.2,36.1 47.0,58.4 33.4,39.8 30.0,63.4 26.6,39.8 13.0,58.4 20.8,36.1 0.6,44.7 17.4,29.7 -4.0,26.0 17.4,22.3 0.6,7.3 20.8,15.9 13.0,-6.4 26.6,12.2 30.0,-11.4 33.4,12.2 47.0,-6.4 39.2,15.9 59.4,7.3 42.6,22.3" fill="rgba(255,120,60,.5)"/><path class="jet" d="M26,14 C22,2 14,-6 8,-14 C16,-8 24,-2 30,8 C33,-4 34,-12 40,-20 C38,-10 36,0 34,14 Z" fill="rgba(255,236,226,.92)"/>'
 '<circle cx="10" cy="-10" r="3" fill="#ffe8df"/><circle cx="4" cy="2" r="2.2" fill="#ffe8df"/><circle cx="52" cy="6" r="2.6" fill="#ffe8df"/><circle cx="56" cy="-8" r="1.5" fill="#ffd2c6"/><circle cx="0" cy="-4" r="1.4" fill="#ffd2c6"/><circle cx="40" cy="-16" r="2.4" fill="#ffe8df"/><circle cx="20" cy="-18" r="1.8" fill="#ffd2c6"/><circle cx="46" cy="-4" r="1.6" fill="#ffd2c6"/></g>'
 # жидкость
 '<g clip-path="url(#smGl)"><rect x="0" y="0" width="60" height="130" fill="rgba(40,10,12,.35)"/>'
 '<g id="smLiq" transform="translate(0 110)"><path class="wave" d="M0,2 q6,-3 12,0 t12,0 t12,0 t12,0 t12,0 t12,0 t12,0 V110 H0 Z" fill="url(#smLg)"/>'
 '<path class="wave foam" d="M0,1 q6,-4 12,0 t12,0 t12,0 t12,0 t12,0 t12,0 t12,0 V5 q-6,3 -12,0 t-12,0 t-12,0 t-12,0 t-12,0 t-12,0 t-12,0 Z" fill="#ffd9cf"/></g>'
 '<g clip-path="url(#smLq)">'+bub()+'</g></g>'
 # стекло
 '<path d="M24.5,15 L35.5,15 L35.5,31 C35.5,38 48.5,42 48.5,54 L48.5,108 C48.5,113.5 45,116 40,116 L20,116 C15,116 11.5,113.5 11.5,108 L11.5,54 C11.5,42 24.5,38 24.5,31 Z" fill="rgba(255,255,255,.05)" stroke="rgba(255,240,240,.75)" stroke-width="1.6"/>'
 '<path d="M15.5,58 C15.5,50 20,46 25,43" fill="none" stroke="rgba(255,255,255,.55)" stroke-width="2.2" stroke-linecap="round"/><path d="M15.5,64 L15.5,104" stroke="rgba(255,255,255,.32)" stroke-width="2.6" stroke-linecap="round"/>'
 '<path d="M26.5,18 L26.5,30" stroke="rgba(255,255,255,.4)" stroke-width="1.4" stroke-linecap="round"/><path d="M44.5,60 L44.5,100" stroke="rgba(255,255,255,.12)" stroke-width="1.6" stroke-linecap="round"/>'
 '<path d="M11.5,110 C14,116 46,116 48.5,110" fill="none" stroke="rgba(0,0,0,.35)" stroke-width="1"/>'
 # трещины (SSS)
 '<g class="burst" stroke="rgba(255,255,255,.85)" stroke-width=".7" fill="none"><path d="M40,48 L35,58 L39,64 L33,76"/><path d="M18,70 L23,78 L19,86"/><path d="M35,58 L44,60"/></g>'
 # крышка
 '<g class="cap0"><rect x="22.5" y="6" width="15" height="10" rx="1.6" fill="url(#smCp)" stroke="#3a0408" stroke-width=".6"/>'
 '<path d="M24.5,7 V15 M27,7 V15 M29.5,7 V15 M32,7 V15 M34.5,7 V15" stroke="rgba(0,0,0,.35)" stroke-width=".8"/><rect x="23.5" y="6.8" width="13" height="1.6" rx=".8" fill="rgba(255,255,255,.45)"/></g>'
 '<g class="burst"><g class="capf"><rect x="22.5" y="-2" width="15" height="10" rx="1.6" fill="url(#smCp)" stroke="#3a0408" stroke-width=".6"/><rect x="23.5" y="-1.2" width="13" height="1.6" rx=".8" fill="rgba(255,255,255,.45)"/></g>'+SH+'</g>'
 '</svg>')

HTML=('<div class="style idle" id="smBox"><div class="smp"><div class="smbg"></div><div class="smb">'+SVG+'</div><div class="smr">'
 '<div class="smh"><span class="smst">STYLE</span><span id="rank">D</span></div><div class="smln"></div>'
 '<div class="smbar"><i><b></b></i><i><b></b></i><i><b></b></i><i><b></b></i><i><b></b></i></div>'
 '<div id="rankName">ТЁПЛЕНЬКО</div></div></div><div id="feed"></div></div>')

# CSS
if '/*SMETER-CSS*/' in s:
    s=re.sub(r'/\*SMETER-CSS\*/.*?/\*SMETER-CSS-END\*/',lambda m:CSS,s,flags=re.S)
else:
    old1='.style{position:absolute;right:16px;top:14px;width:min(270px,34%);text-align:right;text-shadow:0 2px 4px #000}\n#rank{font-size:58px;line-height:1}#rankName{font-size:18px}\n.sbar{height:6px;background:rgba(0,0,0,.5);border-radius:3px;margin-top:6px;overflow:hidden}#sbf{height:100%;width:0;background:var(--gold)}\n#feed{margin-top:10px;font-size:15px;line-height:1.5}'
    assert s.count(old1)==1,'css anchor';s=s.replace(old1,CSS)
# HTML
m=re.search(r'<div class="style[^"]*"( id="smBox")?>.*?<div id="feed"></div></div>',s,flags=re.S)
assert m,'html anchor';s=s[:m.start()]+HTML+s[m.end():]
# цвета рангов как в концепте
s=re.sub(r"const RANKS=\[.*?\];","const RANKS=[['D','ТЁПЛЕНЬКО','#3fc4f0','#b4ecff'],['C','ШИПИТ','#2fe6d2','#b8fff4'],['B','БУРЛИТ','#9be23a','#e6ffb0'],['A','ГАЗИРОВАННО','#ffd21f','#fff3a8'],['S','СВЕРХГАЗ','#ff7a1a','#ffd0a0'],['SS','S-ГАЗ','#ff2f3f','#ffb0b0'],['SSS','ULTRAGAS','#ff1a34','#ffffff']];",s,count=1)
# HUD
oldj="const r=rank(),R=RANKS[r];$('rank').textContent=R[0];$('rank').style.color=R[2];$('rankName').textContent=R[1];$('rankName').style.color=R[2];"
newj="const r=rank(),R=RANKS[r];smHud(r,R);"
if oldj in s: s=s.replace(oldj,newj)
olds="$('sbf').style.width=Math.min(100,(styleV-RANK_T[r])/((r<6?RANK_T[r+1]:STYLE_MAX)-RANK_T[r])*100)+'%';$('sbf').style.background=R[2];"
if olds in s: s=s.replace(olds,'')
FN=r'''/*SMETER-JS*/
const SMT={r:-1,lv:-1,seg:[],box:null,liq:null,lqr:null,t:0,idle:null};
function smHud(r,R){if(!SMT.box){SMT.box=$('smBox');SMT.liq=$('smLiq');SMT.lqr=$('smLqR');SMT.seg=[...SMT.box.querySelectorAll('.smbar b')]}
 const B=SMT.box,top=r<6?RANK_T[r+1]:STYLE_MAX,f=Math.max(0,Math.min(1,(styleV-RANK_T[r])/(top-RANK_T[r])));
 if(r!==SMT.r){if(SMT.r>=0){B.classList.remove('up','dn');void B.offsetWidth;B.classList.add(r>SMT.r?'up':'dn');clearTimeout(SMT.t);SMT.t=setTimeout(()=>B.classList.remove('up','dn'),480)}
  for(let i=0;i<7;i++)B.classList.toggle('r'+i,i===r);$('rank').textContent=R[0];$('rankName').textContent=R[1];B.style.setProperty('--rc',R[2]);B.style.setProperty('--rc2',R[3]||'#fff');
  B.style.setProperty('--bo',[.12,.3,.5,.7,.85,1,1][r]);B.style.setProperty('--fo',[0,0,0,.25,.7,1,1][r]);SMT.r=r}
 const idle=styleV<1;if(idle!==SMT.idle){B.classList.toggle('idle',idle);SMT.idle=idle}
 // уровень в бутылке: общий прогресс по рангам; SS почти под горлышко, SSS — переливается
 const g=Math.min(1,(r+f)/6.4),y=Math.round(112-g*80);if(y!==SMT.lv){SMT.lv=y;SMT.liq.setAttribute('transform','translate(0 '+y+')');SMT.lqr.setAttribute('y',y+1)}
 // 5 делений: прогресс до следующего ранга
 const k=f*5;for(let i=0;i<5;i++){const w=Math.round(Math.max(0,Math.min(1,k-i))*100);const e=SMT.seg[i];if(e._w!==w){e._w=w;e.style.width=w+'%'}}}
/*SMETER-JS-END*/
'''
if '/*SMETER-JS*/' in s:
    s=re.sub(r'/\*SMETER-JS\*/.*?/\*SMETER-JS-END\*/\n',lambda m:FN,s,flags=re.S)
else:
    a='/* ================= hud & loop ================= */'
    assert s.count(a)==1;s=s.replace(a,a+'\n'+FN)
assert "smHud(r,R)" in s and 'sbf' not in s.split('/*SMETER-JS-END*/')[1].split('/* ================= audio')[0]
open(P,'w',encoding='utf-8').write(s);print('style ok')
