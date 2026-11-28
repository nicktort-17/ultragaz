import os,sys;sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'));from ugenv import *  # пути окружения
# Живой бой с новым Директором (его ИИ включён): 1-я фаза, затем 2-я; ошибки консоли и кадры боя.
#   python dev/tools/dirfight.py -> dev/out/director/fight_*.png
from base import *
E=lambda pg,s:pg.evaluate("(s)=>__eval(s)",s)
def F(pg,n=30):pg.evaluate("()=>new Promise(r=>{let n=0;const f=()=>{if(++n>%d)r();else requestAnimationFrame(f)};f()})"%n)
OD=os.path.join(OUT,'director');os.makedirs(OD,exist_ok=True)
with sync_playwright() as p:
    b,pg,errs=open_page(p,960,600)
    J(pg,"()=>__ug.begin('solo','l1')");pg.wait_for_timeout(1500)
    for i in range(60):
        if E(pg,"!!(DIR_T&&DIR_T!=='load')"):break
        pg.wait_for_timeout(500)
    E(pg,"(()=>{window.__dt=1/30;P.iT=1e9;gunScene.visible=false;const S=story;S.room=1;S.phase='clear';const R=S.lv.rooms[2];P.pos.set(R.cp[0],R.cp[1]+.05,(R.trig[2]+R.trig[3])/2)})()")
    boss=None
    for k in range(40):
        F(pg,30);E(pg,"(()=>{P.iT=1e9;P.hp=100})()")
        boss=E(pg,"(()=>{const e=enemies.find(e=>e.type==='boss');return e?JSON.stringify({hp:Math.round(e.hp),max:Math.round(e.maxHp),dir:!!(e.g.userData.boss&&e.g.userData.boss.dir)}):null})()")
        if boss:break
        E(pg,"(()=>{for(const e of enemies){if(e.type!=='boss'&&!e.inv)__ug.damage(e,e.maxHp+50,99,'x')}})()")
    print('boss:',boss)
    def look(n):
        E(pg,"(()=>{const e=enemies.find(e=>e.type==='boss');if(!e)return;const dx=e.pos.x-P.pos.x,dz=e.pos.z-P.pos.z,dy=e.pos.y+2.8-(P.pos.y+1.6);P.yaw=Math.atan2(-dx,-dz);P.pitch=Math.atan2(dy,Math.hypot(dx,dz))})()")
        F(pg,1);pg.screenshot(path=os.path.join(OD,'fight_%s.png'%n))
    for i in range(4):F(pg,45);E(pg,"(()=>{P.iT=1e9;P.hp=100})()");look('p1_%d'%i)
    E(pg,"(()=>{const e=enemies.find(e=>e.type==='boss');e.hp=e.maxHp*.45})()")
    for i in range(5):F(pg,45);E(pg,"(()=>{P.iT=1e9;P.hp=100})()");look('p2_%d'%i)
    E(pg,"(()=>{const e=enemies.find(e=>e.type==='boss');e.hp=e.maxHp*.1})()")
    for i in range(2):F(pg,45);E(pg,"(()=>{P.iT=1e9;P.hp=100})()");look('p3_%d'%i)
    for k in range(30):
        F(pg,20);E(pg,"(()=>{P.iT=1e9;P.hp=100;for(const e of enemies){if(!e.inv)__ug.damage(e,e.maxHp*.3+50,99,'x')}})()")
        if not E(pg,"enemies.some(e=>e.type==='boss'&&!e.dead)"):break
    print('boss dead:',not E(pg,"enemies.some(e=>e.type==='boss'&&!e.dead)"),'phase',E(pg,"story.phase"))
    print('errors:',[e for e in errs if 'ReadPixels' not in e and 'ERR_FAILED' not in e and 'CONNECTION_REFUSED' not in e][:8])
    b.close()
