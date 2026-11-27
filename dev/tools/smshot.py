import sys,json;sys.path.insert(0,'/tmp/an')
from base import *
def F(pg,n=30):pg.evaluate("()=>new Promise(r=>{let n=0;const f=()=>{if(++n>%d)r();else requestAnimationFrame(f)};f()})"%n)
E=lambda pg,s:pg.evaluate("()=>__eval(%s)"%json.dumps(s))
W=int(sys.argv[1]) if len(sys.argv)>1 else 1280
with sync_playwright() as p:
    b,pg,errs=open_page(p,W,W*9//16)
    J(pg,"()=>__ug.begin('solo','l1')");pg.wait_for_timeout(2500);F(pg,10)
    vals=[0,60,200,450,700,1100,1500,2150]
    for i,v in enumerate(vals):
        E(pg,"(()=>{P.iT=1e9;styleV=%d;feed.length=0;if(%d>0){addStyle('УБИЙСТВО',1);addStyle('ПАРИРОВАНИЕ',1);styleV=%d}})()"%(v,v,v));F(pg,3)
        pg.wait_for_timeout(int(sys.argv[2]) if len(sys.argv)>2 else 600);E(pg,"(()=>{styleV=%d})()"%v);F(pg,2)
        bx=pg.evaluate("()=>{const r=document.getElementById('smBox').getBoundingClientRect();return [r.left,r.top,r.width,r.height]}")
        pg.screenshot(path='/tmp/tour/sm%d.png'%i,clip={'x':max(0,bx[0]-30),'y':0,'width':min(W-max(0,bx[0]-30),bx[2]+30),'height':bx[3]+bx[1]+20})
    pg.screenshot(path='/tmp/tour/smfull.png')
    print([e for e in errs if 'ReadPixels' not in e and 'ERR_FAILED' not in e][:5])
    b.close()
from PIL import Image
ims=[Image.open('/tmp/tour/sm%d.png'%i) for i in range(8)]
w=max(i.width for i in ims);h=max(i.height for i in ims)
o=Image.new('RGB',(w*2,h*4))
for k,im in enumerate(ims):o.paste(im,((k%2)*w,(k//2)*h))
o.save('/tmp/tour/smsheet.png');print(o.size)
