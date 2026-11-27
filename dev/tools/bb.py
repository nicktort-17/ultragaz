import os,sys;sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'));from ugenv import *  # пути окружения
import json,sys,numpy as np,itertools
def q2m(q):
    x,y,z,w=q
    return np.array([[1-2*(y*y+z*z),2*(x*y-z*w),2*(x*z+y*w)],[2*(x*y+z*w),1-2*(x*x+z*z),2*(y*z-x*w)],[2*(x*z-y*w),2*(y*z+x*w),1-2*(x*x+y*y)]])
def local(n):
    M=np.eye(4)
    if 'matrix' in n: return np.array(n['matrix']).reshape(4,4).T
    S=np.diag(n.get('scale',[1,1,1])+[1]);R=np.eye(4);R[:3,:3]=q2m(n.get('rotation',[0,0,0,1]));Tm=np.eye(4);Tm[:3,3]=n.get('translation',[0,0,0])
    return Tm@R@S
LEN=dict(shipuchka=.44,shaker=.6,mentos=.6,gazyava=.52)
OFF=dict(shipuchka=[0,0,-.06],shaker=[0,-.02,-.16],mentos=[.02,-.04,-.16],gazyava=[0,-.02,-.12])
for f in ['shipuchka','shaker','mentos','gazyava']:
    g=json.load(open(MODELS+'/%s.json'%f))
    nodes=g['nodes'];res={}
    def walk(i,P,path):
        n=nodes[i];W=P@local(n);nm=n.get('name','?')
        if 'mesh' in n:
            mn=None
            for pr in g['meshes'][n['mesh']]['primitives']:
                a=g['accessors'][pr['attributes']['POSITION']]
                lo,hi=a['min'],a['max']
                for c in itertools.product(*zip(lo,hi)):
                    p=W@np.array(list(c)+[1]);p=p[:3]
                    p=np.array([-p[0],p[1],-p[2]]) # rot pi Y
                    mn=p.copy() if mn is None else mn; 
                    res.setdefault(nm,[p.copy(),p.copy()]);res[nm][0]=np.minimum(res[nm][0],p);res[nm][1]=np.maximum(res[nm][1],p)
        o=W@np.array([0,0,0,1.]);o=np.array([-o[0],o[1],-o[2]])
        res.setdefault('@'+nm,o)
        for c in n.get('children',[]):walk(c,W,path+[nm])
    for r in g['scenes'][0]['nodes']:walk(r,np.eye(4),[])
    allb=[v for k,v in res.items() if not k.startswith('@') and 'Монетка' not in k]
    lo=np.min([b[0] for b in allb],0);hi=np.max([b[1] for b in allb],0);c=(lo+hi)/2;sz=hi-lo;k=LEN[f]/sz[2]
    print('==',f,'size',sz.round(3),'k',round(k,3))
    for nm,v in res.items():
        if nm.startswith('@'):
            if 'Монетка' in nm: continue
            p=(v-c)*k+OFF[f]; print('  pivot',nm[1:],p.round(3))
        else:
            if 'Монетка' in nm: continue
            a=(v[0]-c)*k+OFF[f];b=(v[1]-c)*k+OFF[f];print('  box',nm,a.round(3),b.round(3))
