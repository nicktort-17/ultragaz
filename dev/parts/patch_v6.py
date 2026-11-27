# v6: пороги дверей и окантовка без мерцания
p='/home/claude/ultra/index.html';s=open(p).read()
if '/*v6*/' in s: print('v6 already'); raise SystemExit
def rep(a,b,n=1):
    global s
    c=s.count(a);assert c==n,(c,a[:80]);s=s.replace(a,b)
rep("if(y0>0)addBoxW(o.c,0,z,o.w,y0,1,mat);","if(y0>0)addBoxW(o.c,0,z,o.w,y0-.012,1,mat);")
rep("if(y0>0)addBoxW(x,0,o.c,1,y0,o.w,mat);","if(y0>0)addBoxW(x,0,o.c,1,y0-.012,o.w,mat);")
rep("function trim(x0,x1,z0,z1,y){const t=.22;decoW((x0+x1)/2,y-.02,z0+t/2,x1-x0,.06,t,SM.hz,1);decoW((x0+x1)/2,y-.02,z1-t/2,x1-x0,.06,t,SM.hz,1);decoW(x0+t/2,y-.02,(z0+z1)/2,t,.06,z1-z0,SM.hz,1);decoW(x1-t/2,y-.02,(z0+z1)/2,t,.06,z1-z0,SM.hz,1)}",
    "/*v6*/function trim(x0,x1,z0,z1,y){const t=.22;decoW((x0+x1)/2,y-.02,z0+t/2,x1-x0,.06,t,SM.hz,1);decoW((x0+x1)/2,y-.02,z1-t/2,x1-x0,.06,t,SM.hz,1);decoW(x0+t/2,y-.025,(z0+z1)/2,t,.06,z1-z0-2*t,SM.hz,1);decoW(x1-t/2,y-.025,(z0+z1)/2,t,.06,z1-z0-2*t,SM.hz,1)}")
open(p,'w').write(s);print('v6 ok')
