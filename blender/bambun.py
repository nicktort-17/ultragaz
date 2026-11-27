# Бамбун — моряк-великан с веслом и бочкой пива на спине.
# Части — отдельные объекты с опорной точкой в суставе: игра собирает их в свой риг и анимирует.
# Запуск: python3 bambun.py out_dir  (bpy как модуль) — сохраняет bambun.glb и preview.png
import bpy, bmesh, math, sys, os, random
from mathutils import Vector, Matrix
out = sys.argv[1] if len(sys.argv) > 1 else __import__('tempfile').gettempdir()+'/bambun'
os.makedirs(out, exist_ok=True)
random.seed(7)
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene

def mat(name, rgb, rough=.6, metal=0.0):
    m = bpy.data.materials.new(name); m.use_nodes = True
    b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = (*rgb, 1); b.inputs['Roughness'].default_value = rough; b.inputs['Metallic'].default_value = metal
    return m
def srgb(h):
    c = [int(h[i:i+2], 16)/255 for i in (1, 3, 5)]
    return tuple(((x+.055)/1.055)**2.4 if x > .04045 else x/12.92 for x in c)
M = {k: mat(k, srgb(v[0]), *v[1:]) for k, v in {
    'skin': ('#d9a07a', .55), 'beard': ('#b8541c', .8), 'shirtW': ('#f1ece2', .7), 'shirtB': ('#1f3a6e', .7),
    'shorts': ('#5a4630', .85), 'boot': ('#e8b21a', .45), 'sole': ('#2a2420', .9), 'hat': ('#b3261e', .8),
    'wood': ('#7a4a22', .7), 'woodD': ('#5a3416', .75), 'iron': ('#3a3d42', .4, 1.0), 'brass': ('#c99a3a', .3, 1.0),
    'eyeW': ('#f6f2ea', .3), 'eyeB': ('#141414', .2), 'oar': ('#c08a4e', .6), 'oarB': ('#e8e0d0', .6), 'strap': ('#3a2414', .8),
}.items()}

def obj_from(op, name, mats, **kw):
    op(**kw); o = bpy.context.active_object; o.name = name
    for m in mats: o.data.materials.append(M[m])
    return o
def smooth(o, lvl=2):
    for p in o.data.polygons: p.use_smooth = True
    md = o.modifiers.new('S', 'SUBSURF'); md.levels = lvl; md.render_levels = lvl
def apply_all(o):
    bpy.context.view_layer.objects.active = o
    for md in list(o.modifiers): bpy.ops.object.modifier_apply(modifier=md.name)
def join(objs, name, pivot):
    bpy.ops.object.select_all(action='DESELECT')
    for o in objs: apply_all(o); o.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]; bpy.ops.object.join()
    o = bpy.context.active_object; o.name = name
    scene.cursor.location = pivot; bpy.ops.object.origin_set(type='ORIGIN_CURSOR')
    return o
def stripes(o, z0, step, a, b):
    """полосы на тельняшке: материал по высоте центра грани (в мировых координатах)"""
    me = o.data; i_a = me.materials.find(a); i_b = me.materials.find(b)
    for p in me.polygons:
        z = (o.matrix_world @ p.center).z
        p.material_index = i_b if int((z - z0) / step) % 2 else i_a

# ---------- торс (опора — таз, z=2.0) ----------
pel = obj_from(bpy.ops.mesh.primitive_uv_sphere_add, 'pel', ['shorts'], segments=24, ring_count=12, radius=.5, location=(0, 0, 2.05))
pel.scale = (1.0, .62, .55); smooth(pel, 1)
tor = obj_from(bpy.ops.mesh.primitive_cylinder_add, 'tor', ['shirtW', 'shirtB'], vertices=24, radius=.5, depth=1.5, location=(0, 0, 2.75))
bpy.context.view_layer.objects.active = tor; bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.select_all(action='SELECT')
bpy.ops.object.mode_set(mode='OBJECT')
bm = bmesh.new(); bm.from_mesh(tor.data)
bmesh.ops.subdivide_edges(bm, edges=[e for e in bm.edges if abs(e.verts[0].co.z - e.verts[1].co.z) > .5], cuts=14, use_grid_fill=True)
for v in bm.verts:  # силуэт: узкая талия, пивной живот, широкая грудь, покатые плечи
    z = v.co.z  # от -.75 до .75
    k = (z + .75) / 1.5
    r = .46 + .08 * math.sin(k * math.pi) - .04 * k
    belly = .16 * math.exp(-((k - .32) / .2) ** 2) if v.co.y < 0 else 0
    v.co.x *= r / .5 * (1 + .25 * k)
    v.co.y *= r / .5 * .78
    v.co.y -= belly
    if k > .9: v.co.x *= 1 - (k - .9) * 2.2; v.co.y *= 1 - (k - .9) * 2.2
bm.to_mesh(tor.data); bm.free()
tor.scale = (1, 1, 1); smooth(tor, 1); apply_all(tor); stripes(tor, 2.0, .11, 'shirtW', 'shirtB')
belt = obj_from(bpy.ops.mesh.primitive_torus_add, 'belt', ['strap'], major_radius=.5, minor_radius=.05, location=(0, 0, 2.08))
belt.scale = (1.0, .66, 1)
straps = []
for s in (-1, 1):  # лямки бочки
    st = obj_from(bpy.ops.mesh.primitive_torus_add, 'strap', ['strap'], major_radius=.5, minor_radius=.035, location=(s * .26, .12, 3.0), rotation=(0, math.pi / 2, 0))
    st.scale = (1, 1, 1.25); st.data.transform(Matrix.Diagonal((1, 1, 1, 1))); straps.append(st)
# бочка на спине
bar = obj_from(bpy.ops.mesh.primitive_cylinder_add, 'barrel', ['wood', 'woodD'], vertices=20, radius=.5, depth=1.15, location=(0, .62, 2.95))
bm = bmesh.new(); bm.from_mesh(bar.data)
bmesh.ops.subdivide_edges(bm, edges=[e for e in bm.edges if abs(e.verts[0].co.z - e.verts[1].co.z) > .5], cuts=6, use_grid_fill=True)
for v in bm.verts:
    k = v.co.z / .575; f = 1 + .14 * (1 - k * k)
    v.co.x *= f; v.co.y *= f
bm.to_mesh(bar.data); bm.free()
for i, p in enumerate(bar.data.polygons):  # клёпки — чередование оттенков
    if abs(p.normal.z) < .5: p.material_index = int((math.atan2(p.center.y, p.center.x) + math.pi) / (2 * math.pi) * 20) % 2
hoops = [obj_from(bpy.ops.mesh.primitive_torus_add, 'hoop', ['iron'], major_radius=.5 * (1 + .14 * (1 - k * k)), minor_radius=.035, location=(0, .62, 2.95 + k * .575)) for k in (-.8, -.3, .3, .8)]
tap = obj_from(bpy.ops.mesh.primitive_cylinder_add, 'tap', ['brass'], vertices=10, radius=.06, depth=.3, location=(.45, .62, 2.6), rotation=(0, math.pi / 2, 0))
hose = obj_from(bpy.ops.mesh.primitive_torus_add, 'hose', ['strap'], major_radius=.42, minor_radius=.035, location=(.55, .25, 3.05), rotation=(math.pi / 2, 0, .3))
torso = join([tor, pel, belt, *straps, bar, *hoops, tap, hose], 'torso', (0, 0, 2.0))

# ---------- голова (опора — шея, z=3.45) ----------
neck = obj_from(bpy.ops.mesh.primitive_cylinder_add, 'neck', ['skin'], vertices=14, radius=.17, depth=.35, location=(0, 0, 3.55))
head = obj_from(bpy.ops.mesh.primitive_uv_sphere_add, 'head', ['skin'], segments=28, ring_count=18, radius=.3, location=(0, -.02, 3.92))
head.scale = (.92, .95, 1.12); smooth(head, 1)
nose = obj_from(bpy.ops.mesh.primitive_uv_sphere_add, 'nose', ['skin'], segments=12, ring_count=8, radius=.09, location=(0, -.29, 3.9))
nose.scale = (.9, 1, 1.15)
beard = obj_from(bpy.ops.mesh.primitive_uv_sphere_add, 'beard', ['beard'], segments=28, ring_count=16, radius=.36, location=(0, -.12, 3.62))
bm = bmesh.new(); bm.from_mesh(beard.data)
for v in bm.verts:
    v.co.z *= 1.15
    if v.co.z > .05: v.co.z = .05 + (v.co.z - .05) * .3
    if v.co.y > .1: v.co.y = .1 + (v.co.y - .1) * .4  # плоская спина бороды
    n = .045 * math.sin(v.co.x * 41 + v.co.z * 17) * math.cos(v.co.y * 33 + v.co.z * 23)
    v.co += v.co.normalized() * n
    if v.co.z < -.25: v.co.y -= .06  # кончик вперёд
bm.to_mesh(beard.data); bm.free(); smooth(beard, 1)
must = []
for s in (-1, 1):
    m_ = obj_from(bpy.ops.mesh.primitive_uv_sphere_add, 'must', ['beard'], segments=12, ring_count=8, radius=.11, location=(s * .1, -.29, 3.79)); m_.scale = (1.5, .6, .45); m_.rotation_euler = (0, s * .35, 0); must.append(m_)
eyes = []
for s in (-1, 1):
    w = obj_from(bpy.ops.mesh.primitive_uv_sphere_add, 'eyeW', ['eyeW'], segments=12, ring_count=8, radius=.055, location=(s * .11, -.25, 4.0)); eyes.append(w)
    b_ = obj_from(bpy.ops.mesh.primitive_uv_sphere_add, 'eyeB', ['eyeB'], segments=10, ring_count=6, radius=.028, location=(s * .11, -.3, 4.0)); eyes.append(b_)
    br = obj_from(bpy.ops.mesh.primitive_cube_add, 'brow', ['beard'], size=1, location=(s * .11, -.27, 4.09)); br.scale = (.13, .04, .035); br.rotation_euler = (0, s * -.25, 0); eyes.append(br)
hat = obj_from(bpy.ops.mesh.primitive_uv_sphere_add, 'hat', ['hat'], segments=24, ring_count=12, radius=.32, location=(0, .01, 4.08))
bm = bmesh.new(); bm.from_mesh(hat.data); bmesh.ops.delete(bm, geom=[v for v in bm.verts if v.co.z < -.02], context='VERTS'); bm.to_mesh(hat.data); bm.free()
hat.scale = (.98, 1.0, 1.05); smooth(hat, 1)
rim = obj_from(bpy.ops.mesh.primitive_torus_add, 'rim', ['hat'], major_radius=.31, minor_radius=.07, location=(0, .01, 4.08))
pom = obj_from(bpy.ops.mesh.primitive_uv_sphere_add, 'pom', ['shirtW'], segments=12, ring_count=8, radius=.09, location=(0, .02, 4.42))
ear = [obj_from(bpy.ops.mesh.primitive_uv_sphere_add, 'ear', ['skin'], segments=10, ring_count=6, radius=.07, location=(s * .28, 0, 3.95)) for s in (-1, 1)]
for e_ in ear: e_.scale = (.4, .8, 1)
headO = join([neck, head, nose, beard, *must, *eyes, hat, rim, pom, *ear], 'head', (0, 0, 3.45))

# ---------- руки (опора — плечо), ноги (опора — бедро) ----------
def limb(name, top, length, r0, r1, matn, end=None):
    c = obj_from(bpy.ops.mesh.primitive_cylinder_add, name + '_c', [matn], vertices=14, radius=1, depth=length, location=(top[0], top[1], top[2] - length / 2))
    bm = bmesh.new(); bm.from_mesh(c.data)
    for v in bm.verts:
        k = (v.co.z + length / 2) / length; r = r1 + (r0 - r1) * k + .03 * math.sin(k * math.pi)
        v.co.x *= r; v.co.y *= r
    bm.to_mesh(c.data); bm.free()
    for pl in c.data.polygons: pl.use_smooth = True
    jt = obj_from(bpy.ops.mesh.primitive_uv_sphere_add, name + '_j', [matn], segments=14, ring_count=10, radius=r0 * 1.02, location=top)
    parts = [c, jt]
    if end: parts += end()
    return join(parts, name, top)
for s, n in ((1, 'L'), (-1, 'R')):
    sh = (s * .66, 0, 3.32)
    limb('uarm_' + n, sh, .85, .16, .13, 'skin', lambda sh=sh: [obj_from(bpy.ops.mesh.primitive_uv_sphere_add, 'del', ['skin'], segments=14, ring_count=10, radius=.18, location=sh)])
    el = (s * .66, 0, 3.32 - .85)
    def hand(el=el):
        f = obj_from(bpy.ops.mesh.primitive_uv_sphere_add, 'fist', ['skin'], segments=14, ring_count=10, radius=.15, location=(el[0], el[1], el[2] - .82)); f.scale = (.9, 1.1, 1.05)
        return [f]
    limb('farm_' + n, el, .78, .13, .11, 'skin', hand)
    hp = (s * .24, 0, 2.0)
    limb('thigh_' + n, hp, 1.0, .2, .15, 'shorts')
    kn = (s * .24, 0, 1.0)
    def boot(kn=kn):
        b1 = obj_from(bpy.ops.mesh.primitive_cylinder_add, 'boot', ['boot'], vertices=16, radius=.17, depth=.6, location=(kn[0], kn[1], .35))
        b2 = obj_from(bpy.ops.mesh.primitive_cube_add, 'foot', ['boot'], size=1, location=(kn[0], kn[1] - .1, .1)); b2.scale = (.3, .5, .2); smooth(b2, 1)
        b3 = obj_from(bpy.ops.mesh.primitive_cube_add, 'sole', ['sole'], size=1, location=(kn[0], kn[1] - .1, .02)); b3.scale = (.32, .52, .05)
        return [b1, b2, b3]
    limb('shin_' + n, kn, .7, .15, .13, 'skin', boot)

# ---------- весло (опора — в кулаке правой руки, вдоль -Z) ----------
sh_ = obj_from(bpy.ops.mesh.primitive_cylinder_add, 'shaft', ['oar'], vertices=10, radius=.055, depth=3.4, location=(0, 0, -1.0))
bl = obj_from(bpy.ops.mesh.primitive_cube_add, 'blade', ['oar'], size=1, location=(0, 0, -3.05)); bl.scale = (.42, .07, 1.1); smooth(bl, 1)
bm2 = obj_from(bpy.ops.mesh.primitive_cube_add, 'band', ['oarB'], size=1, location=(0, 0, -2.45)); bm2.scale = (.36, .075, .08)
gr = obj_from(bpy.ops.mesh.primitive_cylinder_add, 'grip', ['woodD'], vertices=10, radius=.07, depth=.35, location=(0, 0, .55))
oar = join([sh_, bl, bm2, gr], 'oar', (0, 0, 0))

for o in bpy.data.objects:
    for p in o.data.polygons: p.use_smooth = True
# ---------- превью ----------
prev = []
def put(name, loc, rot=(0, 0, 0)):
    o = bpy.data.objects[name]; o.location = loc; o.rotation_euler = rot
bpy.ops.object.select_all(action='SELECT')
bpy.ops.export_scene.gltf(filepath=os.path.join(out, 'bambun.glb'), export_format='GLB', use_selection=True, export_apply=True)
# расставим части по местам и отрендерим
put('torso', (0, 0, 2.0)); put('head', (0, 0, 3.45))
for s, n in ((1, 'L'), (-1, 'R')):
    put('uarm_' + n, (s * .66, 0, 3.32), (0, s * .25, 0)); put('farm_' + n, (s * .66 + s * .2, 0, 2.5), (-.4, 0, 0))
    put('thigh_' + n, (s * .24, 0, 2.0)); put('shin_' + n, (s * .24, 0, 1.0))
put('oar', (-.95, -.35, 1.75), (.3, 0, .2))
bpy.ops.object.camera_add(location=(4.6, -6.2, 3.2)); cam = bpy.context.active_object
cam.rotation_euler = (math.radians(80), 0, math.radians(37)); scene.camera = cam
bpy.ops.object.light_add(type='SUN', location=(4, -4, 8)); bpy.context.active_object.data.energy = 4
bpy.ops.object.light_add(type='AREA', location=(-4, -3, 4)); bpy.context.active_object.data.energy = 400
w = bpy.data.worlds.new('w'); scene.world = w; w.use_nodes = True; w.node_tree.nodes['Background'].inputs[0].default_value = (.5, .35, .4, 1)
scene.render.engine = 'CYCLES'; scene.cycles.samples = 24; scene.cycles.device = 'CPU'
scene.render.resolution_x, scene.render.resolution_y = 800, 900
scene.render.filepath = os.path.join(out, 'preview.png'); bpy.ops.render.render(write_still=True)
print('done', [o.name for o in bpy.data.objects if o.type == 'MESH'])
