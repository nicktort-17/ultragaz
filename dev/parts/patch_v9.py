import os,sys;sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'));from ugenv import *  # пути окружения
# v9: новая модель Царицы
p=INDEX;s=open(p).read()
if '/*v9*/' in s: print('v9 already'); raise SystemExit
def rep(a,b):
    global s
    assert s.count(a)==1,a[:60];s=s.replace(a,b)
rep("function buildQueen(g,mm){","/*v9*/function buildQueen(g,mm){if(typeof QUEEN_T!=='undefined'&&QUEEN_T&&QUEEN_T!=='load')return buildQueenM(g,mm);")
rep(" q.head.rotation.z=Math.sin(t*.8)*.06;"," if(q.model)queenArms(e,q,t);q.head.rotation.z=Math.sin(t*.8)*.06;")
open(p,'w').write(s);print('v9 ok')
