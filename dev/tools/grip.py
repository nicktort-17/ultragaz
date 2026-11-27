import os,sys;sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'));from ugenv import *  # пути окружения
import json,base64,numpy as np,struct
for f,nm in [('shipuchka','Рукоять'),('shaker','Рукоять.001'),('mentos','Рукоять.002'),('gazyava','Рукоять.003')]:
    g=json.load(open(OUT+'/out4/%s.json'%f))
    buf=base64.b64decode(g['buffers'][0]['uri'].split(',')[1])
    n=[x for x in g['nodes'] if x.get('name')==nm][0]
    pr=g['meshes'][n['mesh']]['primitives'][0];a=g['accessors'][pr['attributes']['POSITION']];bv=g['bufferViews'][a['bufferView']]
    off=bv.get('byteOffset',0)+a.get('byteOffset',0);arr=np.frombuffer(buf,dtype=np.float32,count=a['count']*3,offset=off).reshape(-1,3)
    t=n.get('translation',[0,0,0]);arr=arr+t
    # blender: glTF y up; game z = -glTF z after rot pi? (rot pi about Y: x->-x, z->-z)
    y=arr[:,1];z=-arr[:,2]
    top=arr[y>y.max()-(y.max()-y.min())*.18];bot=arr[y<y.min()+(y.max()-y.min())*.18]
    print(f,'top z(game)',round(float(-top[:,2].mean()),3),'bot z(game)',round(float(-bot[:,2].mean()),3),'ytop',round(float(top[:,1].mean()),3),'ybot',round(float(bot[:,1].mean()),3), 'rot' ,n.get('rotation'))
