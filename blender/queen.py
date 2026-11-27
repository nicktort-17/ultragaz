# Карамельная Царица — новая модель для босса уровня 2.
# Запуск: python3 queen.py out_dir [render]  — сохраняет queen.glb и превью (три ракурса).
# Координаты в коде как в игре (y вверх, лицо в +z); B() переводит в Blender. Суставы совпадают со старым ригом:
# голова (0,10.45,0), плечи (±2.45,8.1,0), локоть −3 по y от плеча, кисть −2.9 от локтя, сердце (0,6.9,1.78).
import bpy, bmesh, math, sys, os, random
from mathutils import Vector
out = sys.argv[1] if len(sys.argv) > 1 else __import__('tempfile').gettempdir()+'/queen'
RENDER = len(sys.argv) > 2
os.makedirs(out, exist_ok=True)
random.seed(5)
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene

def B(x, y, z): return Vector((x, -z, y))
def T(v): return Vector((v.x, v.z, -v.y))
def srgb(h):
    c = [int(h[i:i+2], 16)/255 for i in (1, 3, 5)]
    return tuple(((x+.055)/1.055)**2.4 if x > .04045 else x/12.92 for x in c)
def mat(name, hexc, rough=.3, metal=0., trans=0., emit=None, ei=0.):
    m = bpy.data.materials.new(name); m.use_nodes = True; b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = (*srgb(hexc), 1); b.inputs['Roughness'].default_value = rough; b.inputs['Metallic'].default_value = metal
    if trans:
        b.inputs['Transmission Weight'].default_value = trans; b.inputs['IOR'].default_value = 1.45
    if emit:
        b.inputs['Emission Color'].default_value = (*srgb(emit), 1); b.inputs['Emission Strength'].default_value = ei
    return m
M = {'car': mat('caramel', '#d8801f', .12, 0, .55), 'carD': mat('caramelDark', '#9a4a0c', .16, 0, .35),
     'gold': mat('gold', '#f2c14b', .2, 1.), 'gem': mat('gem', '#ff7ab8', .05, 0, .6, '#ff4f9a', 1.5),
     'heart': mat('heart', '#fff2c8', .1, 0, 0, '#ffd27a', 9.), 'eye': mat('eye', '#fff6c8', .1, 0, 0, '#ffe9a0', 6.),
     'lip': mat('lip', '#6a1c06', .2), 'rock': mat('rockCandy', '#ffd9a0', .08, 0, .7, '#ffb050', .4)}

def link(o): bpy.context.collection.objects.link(o); return o
def act(o):
    bpy.ops.object.select_all(action='DESELECT'); o.select_set(True); bpy.context.view_layer.objects.active = o
def apply(o):
    act(o)
    for md in list(o.modifiers): bpy.ops.object.modifier_apply(modifier=md.name)
def smooth(o):
    for p in o.data.polygons: p.use_smooth = True
def setm(o, m):
    o.data.materials.clear(); o.data.materials.append(m)
def obj(name, verts, faces, m):
    me = bpy.data.meshes.new(name); me.from_pydata(verts, [], faces); me.update(); o = link(bpy.data.objects.new(name, me)); setm(o, m); smooth(o); return o
def subsurf(o, n=2):
    o.modifiers.new('s', 'SUBSURF').levels = n; apply(o); smooth(o)
def skin(name, nodes, edges, m, subd=2):
    me = bpy.data.meshes.new(name); me.from_pydata([B(*p) for p, _ in nodes], edges, []); o = link(bpy.data.objects.new(name, me))
    md = o.modifiers.new('k', 'SKIN'); md.branch_smoothing = .5
    for i, (p, r) in enumerate(nodes): me.skin_vertices[0].data[i].radius = r; me.skin_vertices[0].data[i].use_root = i == 0
    o.modifiers.new('s', 'SUBSURF').levels = subd; apply(o); smooth(o); setm(o, m); return o
def lathe(name, prof, m, seg=64, fold=None):
    V, F = [], []
    for i, (r, y) in enumerate(prof):
        for j in range(seg):
            a = j / seg * 2 * math.pi; rr = r * (fold(a, y) if fold else 1)
            V.append(B(math.sin(a) * rr, y, math.cos(a) * rr))
    for i in range(len(prof) - 1):
        for j in range(seg):
            a, b = i * seg + j, i * seg + (j + 1) % seg
            F.append((a, b, b + seg, a + seg))
    return obj(name, V, F, m)
def drip(x, y, z, L, r, m, name='drip'):
    """капля: вытянутая слеза, висит вниз от точки (x,y,z)"""
    prof = [(r * .55, 0), (r, -L * .25), (r * .8, -L * .55), (r * .55, -L * .8), (r * .75, -L * .92), (r * .4, -L * .99), (0.001, -L)]
    o = lathe(name, prof, m, 12); o.location = B(x, y, z); act(o); bpy.ops.object.transform_apply(location=True); return o
def join(objs, name):
    bpy.ops.object.select_all(action='DESELECT')
    for o in objs: o.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]; bpy.ops.object.join(); o = bpy.context.active_object; o.name = name; return o

# ---------------- платье-волна из сиропа (основание + талия) ----------------
def fold(a, y):
    k = max(0., min(1., (5.0 - y) / 6.))
    return 1 + .11 * k * math.sin(a * 9 + y * .6) + .04 * k * math.sin(a * 17 - y)
gown = lathe('gown', [(6.4, -1.4), (5.7, -.4), (4.8, .8), (3.8, 2.0), (2.8, 3.2), (2.0, 4.3), (1.45, 5.1), (1.25, 5.6)], M['carD'], 72, fold)
subsurf(gown, 1)
parts = {'body': [gown]}
for i in range(22):
    a = i / 22 * 2 * math.pi + random.uniform(-.1, .1); y = random.uniform(1.2, 4.2)
    prof = [(6.4, -1.4), (5.7, -.4), (4.8, .8), (3.8, 2.0), (2.8, 3.2), (2.0, 4.3), (1.45, 5.1)]
    r = next(r0 + (r1 - r0) * (y - y0) / (y1 - y0) for (r0, y0), (r1, y1) in zip(prof, prof[1:]) if y0 <= y <= y1) * fold(a, y) + .05
    parts['body'].append(drip(math.sin(a) * r * 1.02, y, math.cos(a) * r * 1.02, random.uniform(.8, 1.8), random.uniform(.12, .22), M['car']))

# оборки по подолу
for k, (y, r) in enumerate(((-1.0, 6.25), (-.3, 5.75), (.5, 5.15))):
    o = lathe('ruff', [(r + .05, y + .25), (r + .38, y + .05), (r + .42, y - .12), (r + .1, y - .2)], M['car'] if k % 2 else M['carD'], 72, lambda a, yy, k=k: 1 + .05 * math.sin(a * 14 + k))
    parts['body'].append(o)
# мантия: сироп стекает с плеч по спине в платье
cape = lathe('cape', [(2.0, 8.4), (2.3, 7.4), (2.7, 6.0), (3.3, 4.4), (4.2, 2.6), (5.3, .8), (6.1, -.6)], M['carD'], 48, lambda a, y: (1 + .06 * math.sin(a * 11 + y)) if math.cos(a) < -.15 else .3)
parts['body'].append(cape)
# воротник-корона за головой: веер карамельных лепестков с золотой каймой
for i in range(11):
    a = math.pi + (i - 5) * .29
    bpy.ops.mesh.primitive_cone_add(vertices=8, radius1=.42, radius2=.05, depth=3.6, location=B(math.sin(a) * 1.45, 10.6, math.cos(a) * 1.45 - .35))
    c = bpy.context.active_object; c.rotation_euler = (math.radians(-25), 0, 0); c.rotation_euler.rotate_axis('Z', 0); c.rotation_euler = (math.cos(a) * .55 - .25, math.sin(a) * -.55, 0); c.scale = (1, .4, 1); setm(c, M['car']); smooth(c); parts['body'].append(c)
    bpy.ops.mesh.primitive_uv_sphere_add(segments=10, ring_count=6, radius=.09, location=B(math.sin(a) * 2.35, 12.2, math.cos(a) * 2.35 - .9)); g = bpy.context.active_object; setm(g, M['gold']); parts['body'].append(g)
# ---------------- торс ----------------
torso = skin('torso', [((0, 5.2, 0), (1.25, .95)), ((0, 6.0, .05), (1.05, .78)), ((0, 6.8, .12), (1.3, .95)), ((0, 7.5, .18), (1.55, 1.08)),
                       ((0, 8.1, .05), (2.15, 1.0)), ((0, 8.7, -.05), (.9, .75)), ((0, 9.5, 0), (.55, .55))],
               [(0, 1), (1, 2), (2, 3), (3, 4), (4, 5), (5, 6)], M['car'])
# грудь — вырез под сердце-кристалл: кольцо из тёмной карамели
ring = bpy.ops.mesh.primitive_torus_add(major_radius=.82, minor_radius=.22, location=B(0, 6.9, 1.2), rotation=(0, 0, 0))
ring = bpy.context.active_object; ring.rotation_euler = (math.pi / 2 - math.pi / 2, 0, 0); ring.rotation_euler = (0, 0, 0)
ring.rotation_euler = (math.radians(90), 0, 0); act(ring); bpy.ops.object.transform_apply(rotation=True)
for v in ring.data.vertices: pass
setm(ring, M['carD']); smooth(ring)
# эполеты: капающие наплывы на плечах + леденцовые кристаллы
for s in (1, -1):
    ep = skin('ep', [((s * 1.6, 8.35, 0), (.75, .65)), ((s * 2.3, 8.2, 0), (.7, .6))], [(0, 1)], M['carD'], 2)
    parts['body'].append(ep)
    for k in range(4):
        parts['body'].append(drip(s * (1.8 + k * .22), 7.75, random.uniform(-.3, .4), random.uniform(.6, 1.2), .1, M['car']))
    for k in range(3):
        bpy.ops.mesh.primitive_cone_add(vertices=6, radius1=.18, radius2=.02, depth=random.uniform(.8, 1.3), location=B(s * (1.75 + k * .25), 8.75, -.2 + k * .15))
        c = bpy.context.active_object; c.rotation_euler = (random.uniform(-.4, .4), s * random.uniform(.3, .6), 0); setm(c, M['rock']); parts['body'].append(c)
parts['body'] += [torso, ring]

# ---------------- голова ----------------
HC = Vector((0, 10.45, 0))
bpy.ops.mesh.primitive_uv_sphere_add(segments=48, ring_count=32, radius=1.3, location=(0, 0, 0)); hd = bpy.context.active_object
for v in hd.data.vertices:
    p = T(v.co); x, y, z = p.x, p.y, p.z
    if y < 0:
        t = -y / 1.3; x *= 1 - .3 * t * t; z = z * (1 - .1 * t * t) + (.15 * t * t if z > 0 else 0)
    x *= .92; y *= 1.15; z *= 1.0
    if z > 0:
        z += .22 * math.exp(-(x / .14) ** 2 - ((y + .25) / .3) ** 2)          # нос
        z -= .14 * math.exp(-((abs(x) - .45) / .22) ** 2 - ((y - .12) / .18) ** 2)  # глазницы
        z += .08 * math.exp(-((abs(x) - .6) / .25) ** 2 - ((y + .3) / .2) ** 2)   # скулы
    v.co = B(x, y + HC.y, z)
setm(hd, M['car']); smooth(hd)
head = [hd]
for s in (1, -1):  # глаза-миндалины, светятся
    bpy.ops.mesh.primitive_uv_sphere_add(segments=16, ring_count=10, radius=1, location=B(s * .45, HC.y + .12, 1.06))
    e = bpy.context.active_object; e.scale = (.3, .07, .13); e.rotation_euler = (0, s * -.2, s * -.15); setm(e, M['eye']); smooth(e); head.append(e)
    bpy.ops.mesh.primitive_cube_add(size=1, location=B(s * .48, HC.y + .42, 1.02)); br = bpy.context.active_object
    br.scale = (.42, .06, .07); br.rotation_euler = (0, s * .25, 0); br.modifiers.new('s', 'SUBSURF').levels = 2; apply(br); setm(br, M['carD']); smooth(br); head.append(br)
bpy.ops.mesh.primitive_uv_sphere_add(segments=20, ring_count=10, radius=1, location=B(0, HC.y - .62, 1.08)); lp = bpy.context.active_object
lp.scale = (.3, .12, .09); setm(lp, M['lip']); smooth(lp); head.append(lp)
for x in (-.25, .05, .28):  # капли с подбородка
    head.append(drip(x, HC.y - .95, .9, random.uniform(.4, .8), .07, M['car']))
# корона: золотой обруч, зубцы, кристаллы
bpy.ops.mesh.primitive_torus_add(major_radius=1.08, minor_radius=.11, location=B(0, HC.y + 1.15, -.05)); cr = bpy.context.active_object; setm(cr, M['gold']); smooth(cr); head.append(cr)
for i in range(9):
    a = i / 9 * 2 * math.pi; x, z = math.sin(a) * 1.08, math.cos(a) * 1.08 - .05; h = .9 if i % 3 == 0 else .6
    bpy.ops.mesh.primitive_cone_add(vertices=4, radius1=.2, radius2=.0, depth=h, location=B(x, HC.y + 1.2 + h / 2, z)); sp = bpy.context.active_object
    sp.rotation_euler = (math.sin(a) * -.0, 0, 0); setm(sp, M['gold']); head.append(sp)
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1, radius=.13 if i % 3 else .2, location=B(x * 1.02, HC.y + 1.25, z * 1.02)); g = bpy.context.active_object; g.scale = (1, 1, 1.4); setm(g, M['gem']); head.append(g)
# волосы: густые сиропные пряди назад и вниз, на концах капли
for i in range(13):
    a = math.pi + (i - 6) * .2; x0, z0 = math.sin(a) * 1.0, math.cos(a) * 1.0
    pts = [B(x0, HC.y + .6, z0)]
    for k in range(1, 7):
        t = k / 6; pts.append(B(x0 * (1 + t * .6) + math.sin(i + t * 3) * .15, HC.y + .6 - t * 4.5, z0 - .3 - t * 1.2))
    cu = bpy.data.curves.new('h', 'CURVE'); cu.dimensions = '3D'; sp = cu.splines.new('BEZIER'); sp.bezier_points.add(len(pts) - 1)
    for bp, p in zip(sp.bezier_points, pts): bp.co = p; bp.handle_left_type = bp.handle_right_type = 'AUTO'
    for k, bp in enumerate(sp.bezier_points): bp.radius = 1 - k / len(pts) * .75
    cu.bevel_depth = random.uniform(.13, .2); cu.bevel_resolution = 3; cu.resolution_u = 8
    ho = link(bpy.data.objects.new('hair', cu)); act(ho); bpy.ops.object.convert(target='MESH'); ho = bpy.context.active_object; setm(ho, M['car']); smooth(ho); head.append(ho)
    tip = T(pts[-1]); head.append(drip(tip.x, tip.y + .05, tip.z, .7, .12, M['car']))
for o in head: act(o); bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
head = join(head, 'q_head')

# ---------------- руки (плечо — локоть — кисть) ----------------
arms = {}
for s, n in ((1, 'L'), (-1, 'R')):
    up = skin('up' + n, [((s * 2.45, 8.1, 0), (.62, .62)), ((s * 2.45, 6.6, 0), (.5, .5)), ((s * 2.45, 5.1, 0), (.42, .42))], [(0, 1), (1, 2)], M['car'])
    bpy.ops.mesh.primitive_uv_sphere_add(segments=24, ring_count=16, radius=.78, location=B(s * 2.4, 8.12, 0)); sh_ = bpy.context.active_object; setm(sh_, M['car']); smooth(sh_)
    up = join([up, sh_] + [drip(s * 2.45 + random.uniform(-.3, .3), 6.2 - k * .5, random.uniform(-.3, .3), random.uniform(.5, .9), .09, M['car']) for k in range(2)], 'q_up' + n)
    fa = skin('fa' + n, [((s * 2.45, 5.1, 0), (.42, .42)), ((s * 2.45, 3.6, .02), (.4, .38)), ((s * 2.45, 2.25, 0), (.27, .25))], [(0, 1), (1, 2)], M['car'])
    cuff_ = bpy.ops.mesh.primitive_torus_add(major_radius=.32, minor_radius=.08, location=B(s * 2.45, 2.55, 0)); cf = bpy.context.active_object; setm(cf, M['gold']); smooth(cf)
    bpy.ops.mesh.primitive_uv_sphere_add(segments=20, ring_count=12, radius=.5, location=B(s * 2.45, 5.1, 0)); el_ = bpy.context.active_object; setm(el_, M['car']); smooth(el_)
    fa = join([fa, cf, el_], 'q_fa' + n)
    hand = [skin('palm', [((s * 2.45, 2.2, 0), (.32, .16)), ((s * 2.45, 1.75, .02), (.38, .14))], [(0, 1)], M['car'])]
    for k in range(4):  # длинные пальцы-сосульки
        x = s * 2.45 + (k - 1.5) * .17
        hand.append(skin('f', [((x, 1.62, .03), (.075, .075)), ((x + s * .02, 1.1, .12), (.06, .06)), ((x + s * .03, .65, .2), (.025, .025))], [(0, 1), (1, 2)], M['car'], 1))
    hand.append(skin('th', [((s * 2.25, 1.95, .15), (.08, .08)), ((s * 2.1, 1.55, .38), (.05, .05))], [(0, 1)], M['car'], 1))
    hand = join(hand, 'q_hand' + n)
    arms[n] = (up, fa, hand)

# ---------------- сердце-кристалл ----------------
bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1, radius=.55, location=B(0, 6.9, 1.3)); h = bpy.context.active_object; h.scale = (1, 1.25, 1); setm(h, M['heart'])
body = join(parts['body'], 'q_body')

# ---------------- опорные точки для игры: каждая часть — в своём суставе ----------------
piv = {'q_body': (0, 0, 0), 'q_head': (0, 10.45, 0), 'q_upL': (2.45, 8.1, 0), 'q_upR': (-2.45, 8.1, 0), 'q_faL': (2.45, 5.1, 0), 'q_faR': (-2.45, 5.1, 0),
       'q_handL': (2.45, 2.2, 0), 'q_handR': (-2.45, 2.2, 0), h.name: (0, 6.9, 1.78)}
h.name = 'q_heart'; piv['q_heart'] = (0, 6.9, 1.78)
for name, p in piv.items():
    o = bpy.data.objects.get(name)
    if not o: continue
    act(o); bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    scene.cursor.location = B(*p); bpy.ops.object.origin_set(type='ORIGIN_CURSOR')
# руки в игре строятся плавной трубкой между суставами — отрезки плеча и предплечья не экспортируем
for o in [o for o in bpy.data.objects if o.name.startswith(('q_up', 'q_fa'))]: bpy.data.objects.remove(o, do_unlink=True)
tris = sum(sum(len(p.vertices) - 2 for p in o.data.polygons) for o in bpy.data.objects if o.type == 'MESH')
print('tris', tris, [o.name for o in bpy.data.objects if o.type == 'MESH'])
bpy.ops.object.select_all(action='SELECT')
bpy.ops.export_scene.gltf(filepath=os.path.join(out, 'queen.glb'), export_format='GLB', use_selection=True, export_apply=True)

if RENDER:
    # сиропное озеро под ней
    bpy.ops.mesh.primitive_plane_add(size=60, location=(0, 0, -.2)); lake = bpy.context.active_object; setm(lake, mat('lake', '#c06a14', .08, 0, .3))
    w = bpy.data.worlds.new('w'); scene.world = w; w.use_nodes = True; w.node_tree.nodes['Background'].inputs[0].default_value = (.06, .03, .015, 1)
    bpy.ops.object.light_add(type='AREA', location=(6, -10, 14)); l = bpy.context.active_object; l.data.energy = 6000; l.data.size = 8; l.rotation_euler = (math.radians(50), 0, math.radians(30))
    bpy.ops.object.light_add(type='AREA', location=(-8, 6, 10)); l = bpy.context.active_object; l.data.energy = 3500; l.data.color = (1, .6, .3); l.data.size = 6; l.rotation_euler = (math.radians(-50), 0, math.radians(200))
    bpy.ops.object.light_add(type='POINT', location=B(0, 7, 4)); bpy.context.active_object.data.energy = 600; bpy.context.active_object.data.color = (1, .75, .4)
    bpy.ops.object.camera_add(); cam = bpy.context.active_object; scene.camera = cam; cam.data.lens = 50
    scene.render.engine = 'CYCLES'; scene.cycles.samples = 28; scene.cycles.device = 'CPU'; scene.cycles.use_denoising = True
    scene.render.resolution_x, scene.render.resolution_y = 640, 820
    for tag, ang in (('f', 0), ('q', 35), ('s', 90)):
        a = math.radians(ang); d = 26
        cam.location = B(math.sin(a) * d, 6.5, math.cos(a) * d); cam.rotation_euler = (math.radians(90), 0, a)
        scene.render.filepath = os.path.join(out, 'queen_%s.png' % tag); bpy.ops.render.render(write_still=True)
print('done')
