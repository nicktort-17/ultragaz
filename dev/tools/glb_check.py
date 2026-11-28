# Проверка/чистка GLB (например, из Tripo) в Blender без интерфейса.
#   python dev/tools/glb_check.py model.glb                       — только отчёт
#   python dev/tools/glb_check.py model.glb --tris 40000 --out clean.glb   — чистка + децимация до бюджета
#   ... --render views.png                                        — лист 4 ракурсов (front/left/back/right)
#   --minpart 0.004 — куски меньше этой доли граней объекта считаются мусором и удаляются (только с --out)
# Отчёт: треугольники, меши, материалы, текстуры, размеры, дыры (non-manifold/boundary рёбра), число кусков.
import os, sys, json, subprocess, tempfile
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')); from ugenv import *

if len(sys.argv) < 2 or not sys.argv[1].lower().endswith(('.glb', '.gltf')):
    sys.exit(__doc__ or 'usage: glb_check.py model.glb [--tris N] [--out clean.glb] [--render views.png]')
if not BLENDER: sys.exit('Blender не найден — задай UG_BLENDER')
src = os.path.abspath(sys.argv[1]); rest = sys.argv[2:]
sheet = None
if '--render' in rest:
    i = rest.index('--render'); sheet = os.path.abspath(rest[i + 1]); rdir = tempfile.mkdtemp(prefix='ugr_'); rest[i + 1] = rdir
if '--out' in rest:
    i = rest.index('--out'); rest[i + 1] = os.path.abspath(rest[i + 1])
rep = os.path.join(tempfile.gettempdir(), 'ug_glb_report.json')
cmd = [BLENDER, '-b', '--factory-startup', '-P', os.path.join(TOOLS, 'bpy_glb_check.py'), '--', src, rep] + rest
r = subprocess.run(cmd, capture_output=True, text=True, encoding='utf-8', errors='replace')
if r.returncode or not os.path.exists(rep):
    print(r.stdout[-3000:], r.stderr[-3000:]); sys.exit('Blender: ошибка')
R = json.load(open(rep)); os.remove(rep)

def show(s):
    print('== %s: %d треуг., мешей %d, материалов %d, размер %s м' % (s['stage'], s['tris'], s['meshes'], s['materials'], s['size']))
    for im in s['images']: print('   текстура %-28s %dx%d%s' % (im['name'][:28], im['size'][0], im['size'][1], '  <-- мелкая, будет мыло' if max(im['size']) < 1024 else ''))
    objs=sorted(s['objects'],key=lambda o:-o['tris'])
    if len(objs)>12:print('   (показаны 12 крупнейших из %d объектов; дыры всего: %d открытых рёбер)'%(len(objs),sum(o['boundary'] for o in objs)))
    for o in objs[:12]:
        warn = []
        if o['boundary']: warn.append('дыры: %d открытых рёбер' % o['boundary'])
        if o['nonmanifold'] - o['boundary'] > 0: warn.append('non-manifold: %d' % (o['nonmanifold'] - o['boundary']))
        if o['parts'] > 1: warn.append('кусков %d (граней: %s)' % (o['parts'], o['part_faces']))
        print('   %-24s %7d треуг.  %s' % (o['name'][:24], o['tris'], '; '.join(warn) or 'ок'))
show(R['before'])
if 'after' in R: show(R['after']); print('записано:', rest[rest.index('--out') + 1])
if sheet:
    from PIL import Image, ImageDraw
    ims = [Image.open(os.path.join(rdir, n + '.png')).convert('RGB') for n in ('front', 'left', 'back', 'right')]
    w, h = ims[0].size; o = Image.new('RGB', (w * 4, h), (40, 40, 40)); d = ImageDraw.Draw(o)
    for k, (im, n) in enumerate(zip(ims, ('FRONT', 'LEFT', 'BACK', 'RIGHT'))):
        o.paste(im, (k * w, 0)); d.text((k * w + 10, 10), n, fill=(255, 60, 60))
    os.makedirs(os.path.dirname(sheet) or '.', exist_ok=True); o.save(sheet); print('рендер:', sheet)
