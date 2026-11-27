import os,sys;sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'));from ugenv import *  # пути окружения
import json
for f in ['shipuchka','shaker','mentos','gazyava']:
    g=json.load(open(MODELS+'/%s.json'%f));nodes=g['nodes']
    print('==',f, 'nodes',len(nodes),'meshes',len(g['meshes']),'mats',[m['name'] for m in g['materials']])
    def walk(i,d):
        n=nodes[i];print('  '*d+n.get('name','?'),'T' if 'translation' in n else '','R' if 'rotation' in n else '','S' if 'scale' in n else '', 'mesh' if 'mesh' in n else '')
        for c in n.get('children',[]):walk(c,d+1)
    for r in g['scenes'][0]['nodes']:
        if len(nodes[r].get('children',[]))>0 or True: walk(r,1)
