# Импорт GLB в игру: models/<имя>.json (glTF с данными внутри, как остальные модели) + models/js/<имя>.js.
#   python dev/tools/glb_import.py clean.glb <имя>
# Перезаписывает models/<имя>.json, если такой уже есть (спросит подтверждение без --yes).
import os, sys, json, struct, base64
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')); from ugenv import *
import models_js

def glb2json(src):
    b = open(src, 'rb').read(); assert b[:4] == b'glTF', 'не GLB'
    o = 12; J = BIN = None
    while o < len(b):
        L, T = struct.unpack('<I4s', b[o:o + 8]); d = b[o + 8:o + 8 + L]; o += 8 + L
        if T == b'JSON': J = json.loads(d)
        elif T == b'BIN\x00': BIN = d
    if BIN is not None: J['buffers'][0]['uri'] = 'data:application/octet-stream;base64,' + base64.b64encode(BIN).decode()
    return json.dumps(J, ensure_ascii=False, separators=(',', ':'))

if __name__ == '__main__':
    if len(sys.argv) < 3: sys.exit('usage: glb_import.py model.glb <имя>')
    src, name = sys.argv[1], sys.argv[2]
    dst = os.path.join(MODELS, name + '.json')
    if os.path.exists(dst) and '--yes' not in sys.argv and input('%s уже есть — перезаписать? [y/N] ' % dst).lower() != 'y': sys.exit('отменено')
    open(dst, 'w').write(glb2json(src))
    print('models/%s.json  %.1f МБ' % (name, os.path.getsize(dst) / 1e6))
    models_js.main()
