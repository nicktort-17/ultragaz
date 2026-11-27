# Копии моделей для запуска игры с диска (file://).
# При открытии index.html двойным кликом Chrome запрещает XHR к models/*.json (CORS),
# а <script> — разрешает. Поэтому для каждой models/<имя>.json делаем models/js/<имя>.js:
#   (window.__UGM=window.__UGM||{})["<имя>"]="<текст glTF-JSON>";
# ugModel() в index.html при file:// подключает этот скрипт и разбирает модель GLTFLoader.parse.
# Запускать после любого изменения models/*.json (pep2json.py и glb2json.py делают это сами).
#   python dev/tools/models_js.py          — пересобрать
#   python dev/tools/models_js.py --check  — только проверить, что копии свежие (код выхода 1, если нет)
import os,sys,json,glob
sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'));from ugenv import *
JSD=os.path.join(MODELS,'js')
def build(name):
    txt=open(os.path.join(MODELS,name+'.json')).read()
    return '(window.__UGM=window.__UGM||{})[%s]=%s;\n'%(json.dumps(name),json.dumps(txt,ensure_ascii=False))
def main(check=False):
    os.makedirs(JSD,exist_ok=True);bad=[]
    names=sorted(os.path.basename(f)[:-5] for f in glob.glob(os.path.join(MODELS,'*.json')))
    for n in names:
        p=os.path.join(JSD,n+'.js');want=build(n)
        have=open(p).read() if os.path.exists(p) else None
        if have!=want:
            bad.append(n)
            if not check:open(p,'w').write(want)
    for p in glob.glob(os.path.join(JSD,'*.js')):
        n=os.path.basename(p)[:-3]
        if n not in names:
            bad.append(n+' (лишний)')
            if not check:os.remove(p)
    if check:
        print('models/js: устарели '+', '.join(bad) if bad else 'models/js: всё свежее');return 1 if bad else 0
    print('models/js: обновлено',len(bad),'из',len(names));return 0
if __name__=='__main__':sys.exit(main('--check' in sys.argv))
