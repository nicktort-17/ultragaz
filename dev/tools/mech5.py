import sys;sys.path.insert(0,'/tmp/an')
from base import *
with sync_playwright() as p:
    b,pg,errs=open_page(p,640,360)
    J(pg,"()=>__ug.begin('solo','l3')");pg.wait_for_timeout(3000)
    print('style',J(pg,"""()=>__eval(`(()=>{styleV=0;const r=[];for(let i=0;i<6;i++){addStyle('УБИЙСТВО',60);r.push(Math.round(styleV))}return r.join(',')+' rank '+rank()})()`)"""))
    print('np',J(pg,"""()=>__eval(`(()=>{const P=__ug.P;P.pos.set(0,0,-20);camera.position.set(0,1.6,-20);camera.lookAt(0,1.6,-30);camera.updateMatrixWorld();
      altBullet(new V3(0,1.6,-22),new V3(0,0,1),1,5);const pb=proj[proj.length-1];punchCd=0;punch();return [pb.owner,pb.np]})()`)"""))
    print('wave lowS',J(pg,"""()=>__eval(`(()=>{styleV=100;L3.wave=L3.wave||new THREE.Group();L3.wave.visible=true;L3.waveX=-8;L3.waveWi=77;const P=__ug.P;P.pos.set(-6,0,-20);return waveParry()})()`)"""))
    print('wave S',J(pg,"""()=>__eval(`(()=>{styleV=1000;return [waveParry(),L3.waveHit.has('77:me'),Math.round(styleV)]})()`)"""))
    print('boss parry dmg',J(pg,"""()=>__eval(`(()=>{const e={type:'boss',hp:100,maxHp:100,dead:false,pos:new V3(),r:1,cy:1,g:new THREE.Group(),mats:[]};try{damage(e,10,1,'parry')}catch(x){}return e.hp})()`)"""))
    print([e for e in errs if 'ReadPixels' not in e and 'ERR_FAILED' not in e][:5])
    b.close()
