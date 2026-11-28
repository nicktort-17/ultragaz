import os,sys;sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'));from ugenv import *  # пути окружения
# Финал Директора в L1-3: шкала полна → голова-пробка летит в игрока → парирование [F] → крушение в карусель розлива →
# «Ликвидация». Проверяет, что обломки не застряли в стенах и не вылетели за карту. -> dev/out/director/finale.jpg
#   python dev/tools/dirfinale.py [noparry]   (noparry — дать голове попасть в игрока и вернуться)
from base import *
from PIL import Image,ImageDraw
E=lambda pg,s:pg.evaluate("(s)=>__eval(s)",s)
def F(pg,n=30):pg.evaluate("()=>new Promise(r=>{let n=0;const f=()=>{if(++n>%d)r();else requestAnimationFrame(f)};f()})"%n)
OD=os.path.join(OUT,'director');os.makedirs(OD,exist_ok=True)
NOPARRY='noparry' in sys.argv
ST="JSON.stringify((()=>{const e=enemies.find(e=>e.type==='boss');const B=e&&e.g.userData.boss;return{fin:e?e.fin||null:null,dead:!e||e.dead,hp:e&&+e.hp.toFixed(2),cork:!!(B&&B.cork),hd:B&&B.cork?+B.cork.m.position.distanceTo(camera.position).toFixed(1):null,car:carousel?!!carousel.broken:null,php:P.hp}})())"
AIM="(()=>{const e=enemies.find(e=>e.type==='boss');if(!e){if(carousel){const o=camera.position;const dx=carousel.x-o.x,dy=4-o.y,dz=carousel.z-o.z;P.yaw=Math.atan2(-dx,-dz);P.pitch=Math.atan2(dy,Math.hypot(dx,dz))}return}const B=e.g.userData.boss;const tg=B&&B.cork?B.cork.m.position:center(e,new V3());const o=camera.position;const dx=tg.x-o.x,dy=tg.y-o.y,dz=tg.z-o.z;P.yaw=Math.atan2(-dx,-dz);P.pitch=Math.atan2(dy,Math.hypot(dx,dz))})()"
with sync_playwright() as p:
    b,pg,errs=open_page(p,960,600)
    J(pg,"()=>__ug.begin('solo','l1')");pg.wait_for_timeout(1500)
    for i in range(60):
        if E(pg,"!!(DIR_T&&DIR_T!=='load')"):break
        pg.wait_for_timeout(500)
    E(pg,"(()=>{window.__dt=1/60;P.iT=1e9;gunScene.visible=false;const S=story;S.room=1;S.phase='clear';const R=S.lv.rooms[2];P.pos.set(R.cp[0],R.cp[1]+.05,(R.trig[2]+R.trig[3])/2+8)})()")
    for k in range(60):
        F(pg,20);E(pg,"(()=>{P.iT=1e9;P.hp=100})()")
        if E(pg,"enemies.some(e=>e.type==='boss')"):break
        E(pg,"(()=>{for(const e of enemies){if(e.type!=='boss'&&!e.inv)__ug.damage(e,e.maxHp+50,99,'x')}})()")
    shots=[]
    def snap(n):E(pg,AIM);F(pg,1);f=os.path.join(OD,'fin_%s.png'%n);pg.screenshot(path=f);shots.append((n,f));print(n,E(pg,ST))
    E(pg,"(()=>{window.__nb0=boxes.length})()")
    E(pg,"(()=>{const e=enemies.find(e=>e.type==='boss');e.hp=1;__ug.damage(e,50,10,'shot')})()")
    F(pg,30);snap('1_full_gauge')
    parried=False;t=0;got_hit=False
    for k in range(400):
        F(pg,2);t+=2
        E(pg,"(()=>{for(const o of enemies.slice())if(o.type!=='boss'){scene.remove(o.g);enemies.splice(enemies.indexOf(o),1)}toSpawn=[];P.iT=0;P.hp=Math.max(P.hp,60)})()")
        E(pg,AIM);s=json.loads(E(pg,ST)) if False else None
        st=E(pg,ST);import json as _j;s=_j.loads(st)
        if s.get('cork') and s.get('hd') is not None and s.get('hd')<9 and not any(n=='2_cork_incoming' for n,_ in shots):snap('2_cork_incoming')
        if NOPARRY:
            if s.get('php',100)<99 and not got_hit:got_hit=True;snap('3_hit_player')
            if got_hit and s.get('fin')=='rest':snap('4_head_back');break
            continue
        if s.get('cork') and s.get('hd') is not None and s.get('hd')<4.0 and not parried:
            E(pg,"punch()");parried=True;F(pg,3);snap('3_parried')
        if s.get('fin')=='crash' and not any(n=='4_crash' for n,_ in shots):F(pg,6);snap('4_crash')
        if s.get('dead',True):break
    if not NOPARRY:
        F(pg,4);snap('5_impact')
        F(pg,40);snap('6_boom')
        F(pg,90);snap('7_debris')
        F(pg,180);snap('8_aftermath')
        bad=E(pg,"JSON.stringify(DIR_DEB.concat(...DIR_DEAD.map(D=>D.parts.concat(D.caps))).filter(p=>p.o.parent).map(p=>p.o.getWorldPosition(new V3())).filter(q=>inBox(q)||q.x<mapB.x0||q.x>mapB.x1||q.z<mapB.z0||q.z>mapB.z1).map(q=>q.toArray().map(v=>+v.toFixed(1))))")
        print('boxes removed:',E(pg,"__nb0-boxes.length"))
        res=[]
        for dx,dz in((0,0),(0,1),(0,-1),(1,0),(-1,0),(0,4),(4,0),(-6,3),(7,-5)):
            E(pg,"(()=>{for(const o of enemies.slice()){scene.remove(o.g);enemies.splice(enemies.indexOf(o),1)}toSpawn=[];P.iT=1e9;P.hp=100;P.pos.set(carousel.x+%f,1.5,carousel.z+%f);P.vel.set(0,0,0)})()"%(dx,dz))
            F(pg,90);res.append((dx,dz,E(pg,"+P.pos.y.toFixed(2)")))
        print('floor check (x,z,y):',res,'FELL' if any(y<.2 for _,_,y in res) else 'ok')
        print('debris pieces:',E(pg,"DIR_DEB.length+DIR_DEAD.reduce((a,D)=>a+D.parts.length+D.caps.length,0)"),'stuck/out:',bad)
    print('errors:',[e for e in errs if 'ReadPixels' not in e and 'ERR_FAILED' not in e and 'CONNECTION_REFUSED' not in e][:6])
    b.close()
w,h=400,250;cols=4;rows=(len(shots)+cols-1)//cols;o=Image.new('RGB',(cols*w,rows*h));d=ImageDraw.Draw(o)
for i,(n,f) in enumerate(shots):o.paste(Image.open(f).convert('RGB').resize((w,h)),(i%cols*w,i//cols*h));d.rectangle([i%cols*w,i//cols*h,i%cols*w+130,i//cols*h+16],fill=(0,0,0));d.text((i%cols*w+4,i//cols*h+3),n,fill=(255,220,0))
out=os.path.join(OD,'finale%s.jpg'%('_noparry' if NOPARRY else ''));o.save(out,quality=90);print(out)
