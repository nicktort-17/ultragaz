import os,sys;sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'));from ugenv import *  # пути окружения
import sys;sys.path.insert(0,TOOLS)
from base import *
from PIL import Image
BB="""()=>{const u=__ug,b=new THREE.Box3().setFromObject(u.selfHero.root),c=u.camera,el=document.querySelector('#screen'),r=el.getBoundingClientRect();
 const pts=[];for(const x of[b.min.x,b.max.x])for(const y of[b.min.y,b.max.y])for(const z of[b.min.z,b.max.z]){const v=new THREE.Vector3(x,y,z).project(c);pts.push([(v.x+1)/2*r.width,(1-v.y)/2*r.height])}
 return [Math.min(...pts.map(p=>p[0])),Math.min(...pts.map(p=>p[1])),Math.max(...pts.map(p=>p[0])),Math.max(...pts.map(p=>p[1]))]}"""
def hero_crop(pg,path,pad=20):
    pg.locator('#screen').screenshot(path=OUT+'/_full.png');im=Image.open(OUT+'/_full.png')
    x0,y0,x1,y1=J(pg,BB);x0=max(0,int(x0)-pad);y0=max(0,int(y0)-pad);x1=min(im.width,int(x1)+pad);y1=min(im.height,int(y1)+pad)
    im.crop((x0,y0,x1,y1)).save(path);return path
def sheet(paths,out,h=420):
    ims=[Image.open(x) for x in paths];ims=[im.resize((max(1,int(im.width*h/im.height)),h)) for im in ims]
    W=sum(i.width for i in ims);S=Image.new('RGB',(W,h));x=0
    for im in ims:S.paste(im,(x,0));x+=im.width
    S.save(out)
