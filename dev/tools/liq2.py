import os,sys;sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'));from ugenv import *  # пути окружения
import sys;sys.path.insert(0,TOOLS)
from base import *
with sync_playwright() as p:
    b,pg,errs=open_page(p,800,450)
    J(pg,"()=>__ug.begin('solo','l2')");pg.wait_for_timeout(3000)
    J(pg,"()=>{__ug.switchW(3)}");pg.wait_for_timeout(800)
    print(J(pg,"()=>__eval(`(()=>{const u=guns[3].userData,r=[];u.model.traverse(o=>{if(o.isMesh&&/Кола|стекло|Бутыл/i.test(o.name+(o.material.name||'')))r.push([o.name,o.material.name,o.visible,o.material.transparent,+o.material.opacity.toFixed(2),o.material.depthWrite,o.renderOrder,o.scale.toArray().map(v=>+v.toFixed(2)),o.material.side])});return [r,!!u.parts.liquid,u.parts.liquid&&u.parts.liquid.name]})()`)"))
    b.close()
