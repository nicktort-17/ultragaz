import sys;sys.path.insert(0,'/tmp/an')
from base import *
with sync_playwright() as p:
    b,pg,errs=open_page(p,800,500)
    print(J(pg,"()=>__eval(`(()=>{const r=[LEVELS.map((l,i)=>lvUnlocked(i)).join()];const n=document.getElementById('nick');n.value='Torch';n.onchange();r.push(LEVELS.map((l,i)=>lvUnlocked(i)).join(),document.querySelectorAll('#lvList .locked').length);return r})()`)"))
    print(errs[:3]);b.close()
