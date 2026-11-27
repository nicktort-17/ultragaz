import sys,json,time,math;sys.path.insert(0,'/tmp/an')
from base import *
def F(pg,n=30):pg.evaluate("()=>new Promise(r=>{let n=0;const f=()=>{if(++n>%d)r();else requestAnimationFrame(f)};f()})"%n)
qs="()=>{const q=__eval('L3.q');return {st:q.st,held:q.held,ring:q.ring?q.ring.st:null,rp:q.ring?q.ring.m.position.toArray().map(v=>+v.toFixed(1)):null,gp:q.G.g.position.toArray().map(v=>+v.toFixed(1)),bank:Math.round(__ug.bank),has:__eval('L3.rings.map(r=>r.has?1:0).join(\"\")')}}"
with sync_playwright() as p:
    b,pg,errs=open_page(p,960,540)
    J(pg,"()=>__ug.begin('solo','l3')");pg.wait_for_timeout(1200)
    J(pg,"()=>{__ug.P.iT=1e9;const P=__ug.P;P.pos.set(11.6,0,-15.5);P.vel.set(0,0,0)}")
    F(pg,10)
    J(pg,"()=>__eval('l3Interact()')");F(pg,3)
    print('take',J(pg,qs),J(pg,"()=>document.getElementById('l3hint').textContent"))
    ok=False
    for pitch in [0.05,0.15,-0.05,0.25,0.0,0.1]:
        J(pg,"()=>{const q=__eval('L3.q'),P=__ug.P,c=__ug.camera.position;const dx=q.pos.x-c.x,dz=q.pos.z-c.z;P.yaw=Math.atan2(-dx,-dz);P.pitch=%f}"%pitch);F(pg,2)
        if J(pg,"()=>__eval('L3.q.held')")is None:
            J(pg,"()=>__eval('l3Interact()')");F(pg,2)
        J(pg,"()=>__eval('throwRing()')")
        for k in range(12):
            F(pg,8);s=J(pg,qs)
            if s['ring'] in('float','held','back') or s['st']>0:break
        print('pitch',pitch,s,flush=True)
        if s['st']>0:ok=True;break
        for k in range(10):
            F(pg,10);s=J(pg,qs)
            if s['ring'] is None:break
    if not ok:
        print('no grab by throw -> force');J(pg,"()=>__eval('questGrab(0)')")
    for k in range(30):
        F(pg,20);s=J(pg,qs)
        if k%3==0:print(k,s,flush=True)
        if s['st']>=4:break
    J(pg,"()=>{const P=__ug.P;P.pos.set(8,0,-18);P.yaw=-1.9;P.pitch=-.05}");F(pg,8)
    pg.screenshot(path='/tmp/an/quest_saved.png')
    print('final',J(pg,qs),'prog',J(pg,"()=>JSON.stringify(__ug.prog)"))
    print('err',[e for e in errs if 'ReadPixels' not in e and 'ERR_FAILED' not in e][:8])
    b.close()
