import sys
p='/home/claude/ultra/index.html';s=open(p).read()
def rep(a,b,n=1):
    global s
    c=s.count(a)
    if c!=n:print('ANCHOR FAIL',c,repr(a[:90]));sys.exit(1)
    s=s.replace(a,b)
if 'ambStart(story?' in s:print('amb already');sys.exit(0)
rep("reset();state='play';VM.first=true;","reset();state='play';ambStart(story?story.lv.id:null);if(!story)ambStop();VM.first=true;")
rep("function toMenu(){save('ug-sp',Math.round(bank));","function toMenu(){ambStop();save('ug-sp',Math.round(bank));")
rep("function setMute(v){muted=v;save('ug-mute',v?'1':'0');","function setMute(v){muted=v;save('ug-mute',v?'1':'0');if(v)ambStop();else if(story&&state!=='menu')ambStart(story.lv.id);")
# прогрев шейдеров босса при загрузке уровня 3
open(p,'w').write(s);print('amb patched')
