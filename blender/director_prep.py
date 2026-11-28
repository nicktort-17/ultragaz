# Подготовка модели Генерального директора (Tripo GLB) для игры.
#   blender -b --factory-startup -P blender/director_prep.py -- <in.glb> <out.glb> [--tris 70000] [--render dir]
# 1) слияние швов развёртки, 2) децимация до бюджета, 3) нарезка на части с шарнирами:
#    CEO_body (корпус), CEO_head (горлышко-голова, шарнир у основания шеи),
#    CEO_armL (левая рука — пушка из банок, +X), CEO_armR (правая — открывашка, -X), шарниры в плечах,
# 4) текстуры: цвет ≤ 4096, нормали/металл ≤ 2048 (чётко, но без 16-МБ файла), 5) экспорт GLB.
# Координаты Blender (Z вверх, перед смотрит в -Y) — после экспорта в glTF: Y вверх, перед +Z.
import bpy, bmesh, sys, os, math
from mathutils import Vector

argv = sys.argv[sys.argv.index('--') + 1:]
SRC, OUT = argv[0], argv[1]
def opt(n, d=None, c=str): return c(argv[argv.index(n) + 1]) if n in argv else d
TRIS = opt('--tris', 70000, int); RDIR = opt('--render')

# границы нарезки (в метрах исходной модели: ширина 1.0, высота 0.92)
NECK_Z = 0.715          # выше — голова
SHOULDER_Z = 0.50       # ниже и снаружи корпуса — руки
ARM_X = 0.235           # |x| больше — рука
PIV = {'CEO_head': (0, 0, NECK_Z), 'CEO_armL': (0.275, 0, SHOULDER_Z), 'CEO_armR': (-0.275, 0, SHOULDER_Z), 'CEO_body': (0, 0, 0)}

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=SRC)
src = [o for o in bpy.context.scene.objects if o.type == 'MESH'][0]
bpy.ops.object.select_all(action='DESELECT'); src.select_set(True); bpy.context.view_layer.objects.active = src
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
for o in list(bpy.context.scene.objects):
    if o is not src and o.type != 'MESH': bpy.data.objects.remove(o)
src.parent = None

# 1. швы
bm = bmesh.new(); bm.from_mesh(src.data)
bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-4)
bm.to_mesh(src.data); bm.free()
tri0 = sum(len(p.vertices) - 2 for p in src.data.polygons)

# 2. децимация (collapse, швы UV сохраняются — Blender не схлопывает их через разрыв UV без нужды)
if TRIS and tri0 > TRIS:
    m = src.modifiers.new('dec', 'DECIMATE'); m.ratio = TRIS / tri0; m.use_collapse_triangulate = True
    with bpy.context.temp_override(object=src, active_object=src):
        bpy.ops.object.modifier_apply(modifier=m.name)
for p in src.data.polygons: p.use_smooth = False
tri1 = sum(len(p.vertices) - 2 for p in src.data.polygons)

# 3. нарезка по центрам граней
def part_of(c):
    if c.z > NECK_Z and abs(c.x) < 0.16: return 'CEO_head'
    if c.z < SHOULDER_Z and abs(c.x) > ARM_X: return 'CEO_armL' if c.x > 0 else 'CEO_armR'
    return 'CEO_body'
groups = {}
for p in src.data.polygons: groups.setdefault(part_of(p.center), []).append(p.index)
parts = {}
for name, idx in groups.items():
    o = src.copy(); o.data = src.data.copy(); o.name = o.data.name = name; bpy.context.scene.collection.objects.link(o)
    keep = set(idx); bm = bmesh.new(); bm.from_mesh(o.data); bm.faces.ensure_lookup_table()
    bmesh.ops.delete(bm, geom=[f for f in bm.faces if f.index not in keep], context='FACES')
    bm.to_mesh(o.data); bm.free()
    # шарнир: сдвигаем вершины так, чтобы начало координат объекта было в точке шарнира
    pv = Vector(PIV[name]); o.data.transform(__import__('mathutils').Matrix.Translation(-pv)); o.location = pv
    parts[name] = o
bpy.data.objects.remove(src)
# иерархия: всё — дети корпуса (руки/голова двигаются относительно него)
body = parts['CEO_body']
body.location = (0, 0, 0)
for n, o in parts.items():
    if o is not body:  # корпус стоит в начале координат без поворота — локальные координаты = мировые
        o.parent = body; o.matrix_parent_inverse.identity(); o.location = Vector(PIV[n])
bpy.context.view_layer.update()

# 4. текстуры
for img in bpy.data.images:
    if not img.size[0]: continue
    lim = 4096 if 'basecolor' in img.name.lower() or 'base' in img.name.lower() and 'normal' not in img.name.lower() else 2048
    if max(img.size) > lim:
        img.scale(lim, lim)
    img.pack()

# 5. экспорт
bpy.ops.object.select_all(action='SELECT')
bpy.ops.export_scene.gltf(filepath=OUT, export_format='GLB', use_selection=True, export_image_format='JPEG', export_jpeg_quality=90, export_apply=True)
print('RESULT tris %d -> %d; parts: %s' % (tri0, tri1, {n: sum(len(p.vertices) - 2 for p in o.data.polygons) for n, o in parts.items()}))

# контрольный рендер частей разными цветами
if RDIR:
    os.makedirs(RDIR, exist_ok=True)
    sc = bpy.context.scene; sc.render.engine = 'BLENDER_WORKBENCH'; sh = sc.display.shading
    sh.light = 'STUDIO'; sh.color_type = 'OBJECT'; sc.render.resolution_x = sc.render.resolution_y = 640
    cols = {'CEO_body': (.25, .25, .3, 1), 'CEO_head': (.9, .7, .1, 1), 'CEO_armL': (.9, .2, .2, 1), 'CEO_armR': (.2, .5, .9, 1)}
    for n, o in parts.items(): o.color = cols[n]
    # «разнесённый» вид: части чуть раздвинуты от шарниров
    for n, o in parts.items():
        if n == 'CEO_head': o.location.z += .04
        if n == 'CEO_armL': o.location.x += .05
        if n == 'CEO_armR': o.location.x -= .05
    w = bpy.data.worlds.new('bg'); w.color = (.42, .42, .42); sc.world = w
    cd = bpy.data.cameras.new('c'); cd.type = 'ORTHO'; cd.ortho_scale = 1.3
    cam = bpy.data.objects.new('c', cd); sc.collection.objects.link(cam); sc.camera = cam
    for nm, ang in (('front', 0), ('side', 90)):
        a = math.radians(ang); cam.location = Vector((math.sin(a) * 3, -math.cos(a) * 3, .46))
        cam.rotation_euler = (Vector((0, 0, .46)) - cam.location).to_track_quat('-Z', 'Y').to_euler()
        sc.render.filepath = os.path.join(RDIR, 'split_' + nm + '.png'); bpy.ops.render.render(write_still=True)
