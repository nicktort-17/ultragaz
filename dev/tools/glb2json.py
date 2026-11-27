import os,sys;sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'));from ugenv import *  # пути окружения
import struct,json,base64,sys
def conv(src,dst):
    b=open(src,'rb').read();assert b[:4]==b'glTF'
    o=12;J=None;BIN=None
    while o<len(b):
        L,T=struct.unpack('<I4s',b[o:o+8]);d=b[o+8:o+8+L];o+=8+L
        if T==b'JSON':J=json.loads(d)
        elif T==b'BIN\x00':BIN=d
    J['buffers'][0]['uri']='data:application/octet-stream;base64,'+base64.b64encode(BIN).decode()
    open(dst,'w').write(json.dumps(J,ensure_ascii=False,separators=(',',':')))
for n in ['shipuchka','shaker','mentos','gazyava']:conv(OUT+'/out4/%s.glb'%n,OUT+'/out4/%s.json'%n)
print('ok')
