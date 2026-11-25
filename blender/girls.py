# Альтушка и пляжная красотка: гладкое тело на скелете + одежда + волосы прядями.
# Запуск: python3 girls.py out_dir alt|beach [preview]
# Координаты в коде — как в игре (three.js: y вверх, лицо смотрит в +z); B() переводит в Blender.
# Кости названы так же, как суставы рига в игре (hips, spine, neck, head, lSh, lEl, lWr, lHip, lKn, …),
# поэтому старые позы из игры подходят без изменений. Жёсткие детали (голова, кисти) — объекты R_<сустав>_*.
import bpy, bmesh, math, sys, os, random
from mathutils import Vector

out = sys.argv[1] if len(sys.argv) > 1 else '/tmp/girls'
KIND = sys.argv[2] if len(sys.argv) > 2 else 'alt'
PREVIEW = len(sys.argv) > 3
ALT = KIND == 'alt'
os.makedirs(out, exist_ok=True)
random.seed(11 if ALT else 23)
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene

def B(x, y, z): return Vector((x, -z, y))
def T(v): return Vector((v.x, v.z, -v.y))
def sstep(a, b, x):
    t = max(0.0, min(1.0, (x - a) / (b - a))) if b != a else (1.0 if x >= a else 0.0)
    return t * t * (3 - 2 * t)
def clamp(x, a=0.0, b=1.0): return max(a, min(b, x))

def srgb(h):
    c = [int(h[i:i+2], 16)/255 for i in (1, 3, 5)]
    return tuple(((x+.055)/1.055)**2.4 if x > .04045 else x/12.92 for x in c)
MATS = {}
def mat(name, hexc, rough=.6, metal=0.0, vcol=False):
    if name in MATS: return MATS[name]
    m = bpy.data.materials.new(name); m.use_nodes = True
    nt = m.node_tree; b = nt.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = (*srgb(hexc), 1); b.inputs['Roughness'].default_value = rough; b.inputs['Metallic'].default_value = metal
    if vcol:
        a = nt.nodes.new('ShaderNodeVertexColor'); a.layer_name = 'Color'
        nt.links.new(a.outputs['Color'], b.inputs['Base Color'])
    MATS[name] = m; return m

SKIN = '#f3d8cb' if ALT else '#f2c8a6'

# ---------------- суставы (как в игре) ----------------
JP = {'hips': (0, .93, 0), 'spine': (0, 1.02, 0), 'neck': (0, 1.415, 0), 'head': (0, 1.485, 0), 'hairC': (0, 1.58, 0)}
for s, n in ((1, 'l'), (-1, 'r')):
    JP[n+'Hip'] = (s*.09, .90, 0); JP[n+'Kn'] = (s*.09, .49, 0)
    JP[n+'Sh'] = (s*.165, 1.36, 0); JP[n+'El'] = (s*.165, 1.08, 0); JP[n+'Wr'] = (s*.165, .825, 0)
JP['back'] = (0, 1.56, -.10); JP['back2'] = (0, 1.40 if ALT else 1.33, -.13)
JP['lockL'] = (.095, 1.56, .03); JP['lockR'] = (-.095, 1.56, .03)
PARENT = {'hips': None, 'spine': 'hips', 'neck': 'spine', 'head': 'neck', 'hairC': 'head', 'back': 'hairC', 'back2': 'back',
          'lockL': 'hairC', 'lockR': 'hairC'}
for n in 'lr':
    PARENT.update({n+'Hip': 'hips', n+'Kn': n+'Hip', n+'Sh': 'spine', n+'El': n+'Sh', n+'Wr': n+'El'})
BONES = list(PARENT)

def link(o): bpy.context.collection.objects.link(o); return o
def activate(o):
    bpy.ops.object.select_all(action='DESELECT'); o.select_set(True); bpy.context.view_layer.objects.active = o
def apply_mods(o):
    activate(o)
    for md in list(o.modifiers): bpy.ops.object.modifier_apply(modifier=md.name)
def smooth_all(o):
    for p in o.data.polygons: p.use_smooth = True
def set_mat(o, m):
    o.data.materials.clear(); o.data.materials.append(m)
    for p in o.data.polygons: p.material_index = 0

def skin_mesh(name, nodes, edges, subd=2):
    me = bpy.data.meshes.new(name); me.from_pydata([B(*p) for p, _ in nodes], edges, []); me.update()
    o = link(bpy.data.objects.new(name, me))
    md = o.modifiers.new('skin', 'SKIN'); md.branch_smoothing = .4; md.use_smooth_shade = True
    sv = me.skin_vertices[0].data
    for i, (p, r) in enumerate(nodes): sv[i].radius = r; sv[i].use_root = (i == 0)
    if subd: o.modifiers.new('sub', 'SUBSURF').levels = subd
    apply_mods(o); smooth_all(o); return o

def weigh(o, fn):
    vg = {b: o.vertex_groups.get(b) or o.vertex_groups.new(name=b) for b in BONES}
    for v in o.data.vertices:
        w = fn(T(v.co)); s = sum(w.values()) or 1
        for k, x in w.items():
            if x > 1e-4: vg[k].add([v.index], x / s, 'REPLACE')

# ---------------- веса тела ----------------
def w_body(p):
    x, y, z = p
    w = {}
    leg = sstep(.95, .83, y) if abs(x) > .012 or y < .83 else sstep(.95, .83, y) * .5
    if y < .97 and leg > 0:
        side = 'l' if x > 0 else 'r'
        kn = sstep(.54, .44, y)
        w[side+'Hip'] = leg * (1 - kn); w[side+'Kn'] = leg * kn
        rest = 1 - leg
    else: rest = 1
    if rest > 0:
        sp = sstep(.99, 1.07, y); nk = sstep(1.40, 1.45, y)
        w['hips'] = rest * (1 - sp); w['spine'] = rest * sp * (1 - nk); w['neck'] = rest * sp * nk
    return w
def w_arm(side):
    def f(p):
        x, y, z = p
        el = sstep(1.12, 1.04, y); wr = sstep(.848, .818, y); top = sstep(1.37, 1.42, y) * .5
        w = {side+'Sh': (1 - el) * (1 - top), side+'El': el * (1 - wr), side+'Wr': el * wr, 'spine': (1 - el) * top}
        return w
    return f

# ---------------- тело ----------------
def body_nodes():
    N = [((0, .935, -.004), (.142 if ALT else .148, .102)),       # 0 таз
         ((0, 1.075, 0), (.098, .074)),                            # 1 талия
         ((0, 1.18, .004), (.112, .08)),                           # 2 рёбра
         ((0, 1.265, .012), (.124, .094)),                         # 3 грудь
         ((0, 1.33, .0), (.116, .07)),                             # 4 плечевой пояс
         ((0, 1.40, -.006), (.05, .046)),                          # 5 основание шеи
         ((0, 1.53, .0), (.041, .041))]                            # 6 шея
    E = [(0, 1), (1, 2), (2, 3), (3, 4), (4, 5), (5, 6)]
    for s in (1, -1):
        b = len(N)
        N += [((s*.083, .865, 0), (.083, .084)), ((s*.088, .70, .006), (.07, .074)), ((s*.09, .49, .01), (.047, .05)),
              ((s*.09, .37, -.004), (.051, .056)), ((s*.09, .22, .0), (.037, .04)), ((s*.09, .095, 0), (.028, .03)),
              ((s*.09, .045, -.005), (.03, .036)), ((s*.09, .022, .115), (.03, .014))]
        E += [(0, b), (b, b+1), (b+1, b+2), (b+2, b+3), (b+3, b+4), (b+4, b+5), (b+5, b+6), (b+6, b+7)]
    return N, E
body = skin_mesh('body', *body_nodes())
weigh(body, w_body)

arms = {}
for s, n in ((1, 'l'), (-1, 'r')):
    a = skin_mesh('arm_'+n, [((s*.128, 1.355, 0), (.044, .044)), ((s*.16, 1.31, 0), (.04, .041)), ((s*.165, 1.20, 0), (.035, .036)),
                             ((s*.165, 1.08, 0), (.029, .03)), ((s*.165, .98, .004), (.032, .03)), ((s*.165, .85, 0), (.022, .018)), ((s*.165, .805, .002), (.024, .015))],
                  [(0, 1), (1, 2), (2, 3), (3, 4), (4, 5), (5, 6)])
    weigh(a, w_arm(n)); arms[n] = a

# ---------------- оболочки одежды из копии тела ----------------
def shell(src, name, keep, off, m, solid=0.0, wave=None):
    o = src.copy(); o.data = src.data.copy(); o.name = name; link(o)
    bm = bmesh.new(); bm.from_mesh(o.data)
    dead = [f for f in bm.faces if not keep(T(f.calc_center_median()))]
    bmesh.ops.delete(bm, geom=dead, context='FACES')
    bmesh.ops.delete(bm, geom=[v for v in bm.verts if not v.link_faces], context='VERTS')
    bm.normal_update()
    for v in bm.verts:
        d = off(T(v.co)) if callable(off) else off
        if wave: d += wave(T(v.co))
        v.co += v.normal * d
    bm.to_mesh(o.data); bm.free(); set_mat(o, m)
    if solid:
        md = o.modifiers.new('sol', 'SOLIDIFY'); md.thickness = solid; md.offset = -1; md.use_rim = True
        apply_mods(o)
    smooth_all(o); return o

def torus_skinned(name, center, rx, rz, tube, m, wfn, seg=40, tseg=8, tilt=0.0):
    me = bpy.data.meshes.new(name); bm = bmesh.new(); rings = []
    for i in range(seg):
        a = i / seg * 2 * math.pi; c = Vector((math.cos(a) * rx, 0, math.sin(a) * rz)); dirv = Vector((math.cos(a), 0, math.sin(a)))
        ring = []
        for j in range(tseg):
            b = j / tseg * 2 * math.pi
            p = Vector(center) + c + dirv * math.cos(b) * tube + Vector((0, math.sin(b) * tube, 0))
            p.y += tilt * c.z
            ring.append(bm.verts.new(B(*p)))
        rings.append(ring)
    for i in range(seg):
        for j in range(tseg):
            a, b2 = rings[i], rings[(i+1) % seg]
            bm.faces.new((a[j], b2[j], b2[(j+1) % tseg], a[(j+1) % tseg]))
    bm.to_mesh(me); o = link(bpy.data.objects.new(name, me)); set_mat(o, m); smooth_all(o); weigh(o, wfn); return o

def prim(op, name, m, loc, scale=(1, 1, 1), rot=(0, 0, 0), subd=0, **kw):
    op(location=B(*loc), **kw); o = bpy.context.active_object; o.name = name
    o.scale = (scale[0], scale[2], scale[1]); o.rotation_euler = (rot[0], -rot[2], rot[1])
    if subd: o.modifiers.new('sub', 'SUBSURF').levels = subd
    activate(o); bpy.ops.object.transform_apply(location=True, rotation=True, scale=True); apply_mods(o)
    set_mat(o, m); smooth_all(o); return o
def fixed(o, bone): weigh(o, lambda p: {bone: 1.0}); return o

skinM = mat('skin', SKIN, .5)
skinned = [body, arms['l'], arms['r']]

if ALT:
    leather = mat('leather', '#141217', .32, .15); tee = mat('tee', '#17151b', .85); plaid = mat('plaid', '#8a0f22', .75)
    silver = mat('silver', '#d8dee6', .2, 1.0); tights = mat('tights', SKIN, .55); boot = mat('boot', '#141216', .35); sole = mat('sole', '#0a0a0c', .8)
    pinkM = mat('pinkGlow', '#ff3fa4', .4)
    # колготки-сетка — материал на ногах самого тела
    body.data.materials.clear(); body.data.materials.append(skinM); body.data.materials.append(tights)
    for p in body.data.polygons:
        c = T(p.center); p.material_index = 1 if c.y < .97 and abs(c.x) > .01 or c.y < .9 else 0
    # футболка с принтом: торс + короткие рукава
    t1 = shell(body, 'tee', lambda c: .97 < c.y < 1.415 and not (c.y > 1.385 and c.z > .02), .006, tee)
    tees = [t1] + [shell(arms[n], 'teeS_'+n, lambda c: c.y > 1.2, .006, tee) for n in 'lr']
    # кожаная косуха: открытый перед с лацканами, рукава до запястья
    def jk_keep(c):
        if not (1.11 < c.y < 1.43): return False
        if c.z > 0 and abs(c.x) < .016 + (c.y - 1.11) * .15: return False
        return True
    def jk_off(c): return .02 + sstep(1.36, 1.43, c.y) * .012
    jk = shell(body, 'jacket', jk_keep, jk_off, leather, solid=.004)
    slv = [shell(arms[n], 'sleeve_'+n, lambda c: .86 < c.y < 1.40, lambda c: .008 + sstep(.92, .87, c.y) * .005, leather, solid=.003) for n in 'lr']
    # плиссированная юбка в клетку
    me = bpy.data.meshes.new('skirt'); bm = bmesh.new(); SEG, RING = 64, 9; rows = []
    for r in range(RING):
        k = r / (RING - 1); y = 1.0 - k * .27
        rx = .111 + k * .1; rz = .086 + k * .075
        row = []
        for i in range(SEG):
            a = i / SEG * 2 * math.pi; pl = (1 if i % 2 else -1) * .012 * k ** .8
            row.append(bm.verts.new(B(math.sin(a) * (rx + pl), y, math.cos(a) * (rz + pl * .8))))
        rows.append(row)
    for r in range(RING - 1):
        for i in range(SEG):
            bm.faces.new((rows[r][i], rows[r][(i+1) % SEG], rows[r+1][(i+1) % SEG], rows[r+1][i]))
    bm.to_mesh(me); sk = link(bpy.data.objects.new('skirt', me)); set_mat(sk, plaid)
    md = sk.modifiers.new('sol', 'SOLIDIFY'); md.thickness = .004; apply_mods(sk); smooth_all(sk)
    def w_skirt(p):
        x, y, z = p; k = clamp((1.0 - y) / .27); lg = k ** 1.3 * .8; s = .5 + .5 * clamp(x / .1, -1, 1)
        return {'hips': 1 - lg, 'lHip': lg * s, 'rHip': lg * (1 - s)}
    weigh(sk, w_skirt)
    belt = torus_skinned('belt', (0, .995, .0), .121, .093, .013, leather, lambda p: {'hips': 1})
    buckle = fixed(prim(bpy.ops.mesh.primitive_cube_add, 'buckle', silver, (0, .995, .108), (.026, .02, .008), subd=1, size=1), 'hips')
    chain = torus_skinned('chain', (.06, .93, .05), .085, .07, .004, silver, lambda p: {'hips': 1}, seg=28, tseg=5, tilt=.9)
    choker = torus_skinned('choker', (0, 1.455, .002), .046, .045, .011, leather, lambda p: {'neck': 1})
    oring = fixed(prim(bpy.ops.mesh.primitive_torus_add, 'oring', silver, (0, 1.437, .05), rot=(math.pi/2 - .25, 0, 0), major_radius=.013, minor_radius=.0035), 'neck')
    studs = []
    for s in (1, -1):
        for i in range(4):
            studs.append(prim(bpy.ops.mesh.primitive_cone_add, 'stud', silver, (s*(.08 + i*.022), 1.435 - i*.006, -.01), rot=(0, 0, -s*.25), radius1=.006, depth=.012, vertices=6))
    for st in studs: fixed(st, 'spine')
    # массивные ботинки на платформе
    boots = []
    for s, n in ((1, 'l'), (-1, 'r')):
        bt = skin_mesh('boot_'+n, [((s*.09, .30, .0), (.054, .058)), ((s*.09, .16, .0), (.05, .055)), ((s*.09, .07, .01), (.052, .066)),
                                   ((s*.09, .07, .13), (.05, .04))], [(0, 1), (1, 2), (2, 3)])
        set_mat(bt, boot)
        so = prim(bpy.ops.mesh.primitive_cube_add, 'sole_'+n, sole, (s*.09, .03, .05), (.12, .065, .30), subd=2, size=1)
        bts = [bt, so]
        for y in (.24, .15):
            bts.append(torus_skinned('bk_'+n, (s*.09, y, .0), .057, .06, .006, silver, lambda p: {}, seg=20, tseg=5))
        for o in bts: weigh(o, lambda p, n=n: {n+'Kn': 1})
        boots += bts
    skinned += tees + [jk] + slv + [sk, belt, buckle, chain, choker, oring] + studs + boots
else:
    bando = mat('bando', '#ff4f9a', .35); denim = mat('denim', '#4a6fa5', .85); gold = mat('gold', '#f2c45a', .22, 1.0)
    white = mat('white', '#f4f1ea', .5); strap = mat('strap', '#e8d2b0', .6)
    bd = shell(body, 'bandeau', lambda c: 1.215 < c.y < 1.318, .007, bando, solid=.004,
               wave=lambda c: .0025 * math.sin(c.y * 260))
    sh = shell(body, 'shorts', lambda c: .8 < c.y < 1.0, lambda c: .009 + sstep(.86, .8, c.y) * .006, denim, solid=.004)
    cuffs = [torus_skinned('cuff', (s*.087, .805, .006), .081, .083, .011, denim, lambda p, n=n: {n+'Hip': 1}, seg=28, tseg=6) for s, n in ((1, 'l'), (-1, 'r'))]
    wband = torus_skinned('waist', (0, .995, -.002), .112, .086, .009, denim, lambda p: {'hips': 1}, seg=40, tseg=6)
    btn = fixed(prim(bpy.ops.mesh.primitive_cylinder_add, 'button', gold, (0, .995, .094), rot=(math.pi/2, 0, 0), radius=.009, depth=.006, vertices=12), 'hips')
    neck1 = torus_skinned('necklace', (0, 1.405, .02), .062, .058, .0028, gold, lambda p: {'spine': .6, 'neck': .4}, seg=36, tseg=5, tilt=-.55)
    pend = fixed(prim(bpy.ops.mesh.primitive_ico_sphere_add, 'pendant', gold, (0, 1.37, .085), (1, 1.4, .6), radius=.009, subdivisions=1), 'spine')
    jew = []
    for s, n in ((1, 'l'), (-1, 'r')):
        for y in (.855, .87):
            jew.append(torus_skinned('bangle', (s*.165, y, 0), .03, .028, .003, gold, lambda p, n=n: {n+'El': 1}, seg=20, tseg=5, tilt=.3*(y-.86)*30))
        jew.append(torus_skinned('anklet', (s*.09, .115, 0), .036, .037, .0025, gold, lambda p, n=n: {n+'Kn': 1}, seg=20, tseg=5, tilt=.15))
        # шлёпанцы
        so = prim(bpy.ops.mesh.primitive_cube_add, 'flip_'+n, white, (s*.09, .009, .05), (.085, .016, .25), subd=2, size=1)
        st = torus_skinned('fstrap', (s*.09, .03, .1), .03, .045, .005, bando, lambda p: {}, seg=16, tseg=5, tilt=-.5)
        for o in (so, st): weigh(o, lambda p, n=n: {n+'Kn': 1})
        jew += [so, st]
    skinned += [bd, sh, wband, btn, neck1, pend] + cuffs + jew

# ---------------- голова (жёсткая, сустав head) ----------------
HC = Vector((0, 1.58, 0)); HR = .126
bpy.ops.mesh.primitive_uv_sphere_add(segments=56, ring_count=36, radius=HR, location=(0, 0, 0))
head = bpy.context.active_object; head.name = 'R_head_head'
for v in head.data.vertices:
    p = T(v.co); x, y, z = p.x, p.y, p.z
    if y < 0:
        t = -y / HR; x *= 1 - .27 * t * t; z = z * (1 - .12 * t * t) + (.012 * t if z > 0 else 0)
    x *= .9; y *= 1.06; z *= .97
    if z > 0:
        z += .013 * math.exp(-(x/.016)**2 - ((y+.043)/.022)**2) + .004 * math.exp(-(x/.011)**2 - ((y+.012)/.03)**2)   # нос
        z += .0035 * math.exp(-(x/.022)**2 - ((y+.083)/.008)**2)                                                       # губы
        z += .006 * math.exp(-((abs(x)-.06)/.03)**2 - ((y+.04)/.03)**2)                                                 # скулы
        z -= .004 * math.exp(-((abs(x)-.05)/.022)**2 - ((y+.012)/.016)**2)                                              # глазницы
    v.co = B(x + HC.x, y + HC.y, z + HC.z)
earL = []
for s in (1, -1):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=16, ring_count=10, radius=1, location=B(s*.106, 1.57, -.004))
    e = bpy.context.active_object; e.scale = (.014, .02, .028); e.rotation_euler = (0, 0, -s*.3); earL.append(e)
    activate(e); bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
faceM = mat('face', SKIN, .55)
for o in [head] + earL: set_mat(o, faceM)
bpy.ops.object.select_all(action='DESELECT')
for o in [head] + earL: o.select_set(True)
bpy.context.view_layer.objects.active = head; bpy.ops.object.join(); smooth_all(head)
rigid = [head]
if ALT:
    for s in (1, -1):
        rigid.append(prim(bpy.ops.mesh.primitive_torus_add, 'R_head_ring', silver, (s*.11, 1.548, .004), rot=(0, math.pi/2, 0), major_radius=.011, minor_radius=.0025))
        rigid.append(prim(bpy.ops.mesh.primitive_uv_sphere_add, 'R_head_stud', silver, (s*.112, 1.562, .012), (.004, .004, .004), segments=8, ring_count=6, radius=1))
else:
    for s in (1, -1):
        rigid.append(prim(bpy.ops.mesh.primitive_torus_add, 'R_head_hoop', gold, (s*.108, 1.535, .004), rot=(0, math.pi/2, 0), major_radius=.02, minor_radius=.0022))
    # очки на макушке
    lens = mat('lens', '#1a1a22', .05, .6)
    for s in (1, -1):
        rigid.append(prim(bpy.ops.mesh.primitive_uv_sphere_add, 'R_hairC_lens', lens, (s*.045, 1.71, .055), (.036, .026, .012), rot=(-.75, 0, 0), segments=16, ring_count=10, radius=1))
    for s in (1, -1):
        rigid.append(prim(bpy.ops.mesh.primitive_torus_add, 'R_hairC_frame', gold, (s*.045, 1.71, .055), (1.0, .72, 1.0), rot=(-.75 + math.pi/2, 0, 0), major_radius=.037, minor_radius=.0028))
    rigid.append(prim(bpy.ops.mesh.primitive_cylinder_add, 'R_hairC_bridge', gold, (0, 1.718, .062), rot=(0, 0, math.pi/2), radius=.003, depth=.024))

# ---------------- кисти: ладонь + шаблоны пальцев ----------------
for s, n in ((1, 'l'), (-1, 'r')):
    rigid.append(prim(bpy.ops.mesh.primitive_cube_add, 'R_%sWr_palm' % n, skinM, (s*.165, .783, .002), (.084, .112, .036), subd=2, size=1))
def finger(name, L, r0, r1):
    me = bpy.data.meshes.new(name); bm = bmesh.new(); N = 8; rows = []
    for i in range(7):
        k = i / 6; y = -k * L; r = r0 + (r1 - r0) * k
        if i == 6: r *= .55; y = -L - r1 * .4
        rows.append([bm.verts.new(B(math.cos(a/N*2*math.pi)*r, y, math.sin(a/N*2*math.pi)*r*.85)) for a in range(N)])
    for i in range(6):
        for a in range(N): bm.faces.new((rows[i][a], rows[i][(a+1) % N], rows[i+1][(a+1) % N], rows[i+1][a]))
    bm.faces.new(rows[-1][::-1]); bm.faces.new(rows[0])
    bm.to_mesh(me); o = link(bpy.data.objects.new(name, me)); set_mat(o, skinM); smooth_all(o)
    o.modifiers.new('sub', 'SUBSURF').levels = 1; apply_mods(o); smooth_all(o); return o
fing = [finger('T_finger', .078, .0092, .0076), finger('T_thumb', .06, .0102, .0085)]
if ALT:
    nail = mat('nail', '#0c0a10', .2)
    for f in fing:
        f.data.materials.append(nail)
        for p in f.data.polygons:
            if T(p.center).y < -(.06 if 'thumb' in f.name else .078) + .006 and T(p.center).z > 0: p.material_index = 1

# ---------------- волосы: пряди ----------------
HAIR = ('#16141c' if ALT else '#f2d68e')
hairM = mat('hair', HAIR, .45, vcol=True)
ER = Vector((.113, .134, .122))
def in_head(p, k=1.0):
    q = Vector(((p.x-HC.x)/(ER.x*k), (p.y-HC.y)/(ER.y*k), (p.z-HC.z)/(ER.z*k))); return q
def push_out(p, k=1.07):
    k = max(k, 1.03)
    q = in_head(p, k)
    if q.length < 1:
        q.normalize(); p = Vector((HC.x+q.x*ER.x*k, HC.y+q.y*ER.y*k, HC.z+q.z*ER.z*k))
    # лицо: пряди обходят его сбоку (у альтушки чёлка выше бровей допустима)
    fy = 1.60 if ALT else 1.64
    if p.z > HC.z - .01 and abs(p.x) < .088 and 1.44 < p.y < fy:
        p = Vector((math.copysign(.088, p.x if p.x else 1), p.y, p.z))
    # шея, плечи и спина в позе покоя
    for c, r in (((0, 1.25, -.005), (.17, .19, .125)), ((0, 1.40, -.01), (.07, .1, .07)), ((.15, 1.36, 0), (.07, .07, .07)), ((-.15, 1.36, 0), (.07, .07, .07))):
        c = Vector(c); q = Vector(((p.x-c.x)/r[0], (p.y-c.y)/r[1], (p.z-c.z)/r[2]))
        if q.length < 1:
            q.normalize(); p = Vector((c.x+q.x*r[0], c.y+q.y*r[1], c.z+q.z*r[2]))
    return p
def hcol(h, k=1.0):
    c = srgb(h); return Vector(c) * k

def cap_ok(q):
    """граница роста волос на голове (q — направление из центра головы)"""
    if q.z > .25: return q.y > (.30 if ALT else .40)
    if q.z > -.3: return q.y > -.05 + max(0, q.z) * .5
    return q.y > -.55

hbm = bmesh.new(); col_l = hbm.loops.layers.color.new('Color'); uv_l = hbm.loops.layers.uv.new('UVMap')
CLUMPS = []  # (верш. индексы, тип) для весов
def add_strip(pts, w, th, col_root, col_tip, kind_tag, u0):
    N = 6; rows = []; L = len(pts)
    for i, p in enumerate(pts):
        t = (pts[min(i+1, L-1)] - pts[max(i-1, 0)]).normalized()
        rad = (p - HC); rad.normalize()
        side = t.cross(rad); side = side.normalized() if side.length > 1e-6 else Vector((1, 0, 0))
        nrm = side.cross(t).normalized()
        k = i / (L - 1); ww = w * (1 - .82 * k ** 1.6); tt = th * (1 - .7 * k)
        if i == L - 1: ww *= .2; tt *= .3
        rows.append([hbm.verts.new(B(*(p + side * math.cos(a/N*2*math.pi) * ww + nrm * math.sin(a/N*2*math.pi) * tt))) for a in range(N)])
    vs = []
    for i in range(L - 1):
        for a in range(N):
            f = hbm.faces.new((rows[i][a], rows[i][(a+1) % N], rows[i+1][(a+1) % N], rows[i+1][a]))
            for lp in f.loops:
                ii = i + (1 if lp.vert in rows[i+1] else 0); aa = a + (1 if lp.vert in (rows[i][(a+1) % N], rows[i+1][(a+1) % N]) else 0)
                kk = ii / (L - 1); c = col_root.lerp(col_tip, kk ** .7)
                lp[col_l] = (*c, 1); lp[uv_l].uv = (u0 + aa / N * .25, kk)
    for r in rows: vs += r
    CLUMPS.append((vs, kind_tag))

CONV = .35 if ALT else .55
def head_n(p):
    g = Vector(((p.x-HC.x)/ER.x**2, (p.y-HC.y)/ER.y**2, (p.z-HC.z)/ER.z**2)); return g.normalized()
def tangent(d, n): return (d - n * d.dot(n)).normalized()
def grow(root, d0, tip_y, max_len, grav, wave_amp=0.0, wave_f=0.0, wave_dir=None, sweep=None, steps=16, lift=1.06):
    n0 = head_n(root); pts = [root]; d = tangent(d0, n0); p = root.copy(); seg = max_len / steps; ph = random.random() * 6
    for i in range(steps):
        d = d + Vector((0, -grav, 0)) + (sweep * (1 - i / steps) if sweep else Vector())
        if p.y < 1.47: d += Vector((-p.x * CONV, 0, -(p.z + .02) * CONV * .5 if ALT else -(p.z + .09) * .9))
        q = in_head(p, lift)
        if q.length < 1.18 and p.y > HC.y - .07:      # по голове прядь лежит на поверхности
            n = head_n(p); d = tangent(d, n) + n * .04
        d.normalize()
        np_ = push_out(p + d * seg, lift)
        d = (np_ - p).normalized(); p = np_
        q = p.copy()
        if wave_amp:
            k = i / steps; q = push_out(q + (wave_dir or Vector((1, 0, 0))) * math.sin(ph + k * wave_f) * wave_amp * min(1, k * 2), lift)
        pts.append(q)
        if p.y < tip_y: break
    return pts if len(pts) > 3 else None

# корни прядей — точки Фибоначчи на черепе
roots = []
NR = 420
for i in range(NR):
    yv = 1 - (i + .5) / NR * 2; r = math.sqrt(max(0, 1 - yv * yv)); a = i * 2.39996
    q = Vector((math.cos(a) * r, yv, math.sin(a) * r))
    if cap_ok(q) and q.y > -.6: roots.append(q)
random.shuffle(roots)
base = hcol(HAIR); dark = base * .55; light = Vector([min(1, c * 1.6 + .05) for c in base])
pink = hcol('#ff3fa4'); pinkL = hcol('#ff7cc4')
for qi, q in enumerate(roots):
    root = Vector((HC.x + q.x*ER.x*1.02, HC.y + q.y*ER.y*1.02, HC.z + q.z*ER.z*1.02))
    out_ = Vector((q.x, q.y * .3, q.z)).normalized() if abs(q.x) + abs(q.z) > .05 else Vector((0, 0, -1))
    tag = 'back'; jitter = random.uniform(-1, 1)
    front = q.z > .35 and q.y > .25
    lift = random.uniform(1.04, 1.1)
    if ALT:
        if front:   # косая чёлка до бровей, зачёсана на левую сторону
            d = Vector((.75, -.35, .5)); pts = grow(root, d, 1.60 + .02 * random.random(), .2, .12, steps=10, lift=lift)
            w, th = .022, .0045; tag = 'front'
        elif q.z > -.1 and abs(q.x) > .45 and q.y < .55:   # боковые пряди до подбородка
            d = Vector((q.x * .2, -1, .25)); pts = grow(root, d, 1.45 + .04 * jitter, .34, .5, steps=14, lift=lift)
            w, th = .024, .005; tag = 'lockL' if q.x > 0 else 'lockR'
        else:       # макушка и затылок: рваные концы до плеч
            d = Vector((q.x * .4, -1, -.35)); pts = grow(root, d, 1.37 + .07 * jitter, .5, .4, steps=18, lift=lift)
            w, th = .04, .0055
        streak = (q.x > .3 and q.z > -.3) or (q.x < -.55 and q.z < -.2) or (abs(q.x) < .15 and q.z < -.55)
        cr, ct = (pink * .7, pinkL) if streak else (dark, base * 1.6 + Vector((.02, .02, .03)))
    else:
        if q.z > -.05 and q.y > -.2:   # прямой пробор: пряди от пробора в стороны и вниз, обрамляют лицо
            sx = 1 if q.x >= 0 else -1; fr = q.z > .3
            d = Vector((sx * .8, .1 if fr else -.2, -.6 if fr else -.3))
            pts = grow(root, d, 1.13 + .05 * jitter, .7, .3, .012, 9, Vector((sx * .25, 0, 1)).normalized(), steps=24, lift=lift,
                       sweep=Vector((sx * .04, 0, -.14)))
            w, th = .046, .0055; tag = 'lockL' if sx > 0 else 'lockR'
        else:
            d = Vector((q.x * .3, -1, -.3)); pts = grow(root, d, 1.08 + .06 * jitter, .76, .3, .016, 8, Vector((q.x, 0, q.z)).normalized() if abs(q.x)+abs(q.z) > .1 else None, steps=24, lift=lift)
            w, th = .06, .0065
        k = random.uniform(.85, 1.15); cr, ct = (base * .62 * k, light * k)
    if pts: add_strip(pts, w * random.uniform(.85, 1.2), th, cr, ct, tag, random.randint(0, 3) * .25)
# шапка под прядями
cap_bm = bmesh.new(); bmesh.ops.create_uvsphere(cap_bm, u_segments=40, v_segments=24, radius=1)
cvs = []
for v in cap_bm.verts:
    q = T(v.co).normalized(); v.co = B(HC.x + q.x*ER.x*1.035, HC.y + q.y*ER.y*1.035, HC.z + q.z*ER.z*1.035)
bmesh.ops.delete(cap_bm, geom=[f for f in cap_bm.faces if not cap_ok((T(f.calc_center_median()) - HC).normalized() * 1)], context='FACES')
capme = bpy.data.meshes.new('cap'); cap_bm.to_mesh(capme); capo = link(bpy.data.objects.new('hairCap', capme))
ccl = capme.color_attributes.new('Color', 'FLOAT_COLOR', 'CORNER')
for i in range(len(ccl.data)): ccl.data[i].color = (*(dark * 1.1), 1)
capme.uv_layers.new(name='UVMap')
hme = bpy.data.meshes.new('hair'); hbm.to_mesh(hme); hair = link(bpy.data.objects.new('hair', hme))
for o in (hair, capo): set_mat(o, hairM); smooth_all(o)
# веса волос: макушка — hairC, ниже — цепочка back/back2 или передние пряди
tagv = {}
for vs, tg in CLUMPS:
    for v in vs: tagv[v.index] = tg
def w_hair(i, p):
    tg = tagv.get(i, 'back'); y = p.y
    top = sstep(1.47, 1.56, y)
    if tg in ('lockL', 'lockR'): return {'hairC': top, tg: 1 - top}
    if tg == 'front': return {'hairC': 1}
    b2 = sstep(JP['back2'][1] + .05, JP['back2'][1] - .05, y)
    return {'hairC': top, 'back': (1 - top) * (1 - b2), 'back2': (1 - top) * b2}
vg = {b: hair.vertex_groups.new(name=b) for b in BONES}
for v in hair.data.vertices:
    w = w_hair(v.index, T(v.co)); s = sum(w.values()) or 1
    for k, x in w.items():
        if x > 1e-4: vg[k].add([v.index], x / s, 'REPLACE')
weigh(capo, lambda p: {'hairC': 1})
skinned += [hair, capo]

# ---------------- объединяем по материалам: меньше вызовов отрисовки ----------------
groups = {}
for o in skinned:
    groups.setdefault(tuple(m.name for m in o.data.materials), []).append(o)
skinned = []
for key, objs in groups.items():
    if len(objs) > 1:
        bpy.ops.object.select_all(action='DESELECT')
        for o in objs: o.select_set(True)
        bpy.context.view_layer.objects.active = objs[0]; bpy.ops.object.join()
    objs[0].name = 'S_' + '_'.join(key); skinned.append(objs[0])

# ---------------- скелет ----------------
arm_d = bpy.data.armatures.new('rig'); rig = link(bpy.data.objects.new('rig', arm_d))
activate(rig); bpy.ops.object.mode_set(mode='EDIT')
for n in BONES:
    b = arm_d.edit_bones.new(n); b.head = B(*JP[n]); b.tail = B(JP[n][0], JP[n][1] + .06, JP[n][2])
for n in BONES:
    if PARENT[n]: arm_d.edit_bones[n].parent = arm_d.edit_bones[PARENT[n]]
bpy.ops.object.mode_set(mode='OBJECT')
for o in skinned:
    o.parent = rig; md = o.modifiers.new('arm', 'ARMATURE'); md.object = rig

for o in bpy.data.objects:
    if o.type == 'MESH': smooth_all(o)
tris = sum(sum(len(p.vertices) - 2 for p in o.data.polygons) for o in bpy.data.objects if o.type == 'MESH')
print('tris', tris, 'objects', len([o for o in bpy.data.objects if o.type == 'MESH']))
bpy.ops.object.select_all(action='SELECT')
bpy.ops.export_scene.gltf(filepath=os.path.join(out, 'girl_%s.glb' % KIND), export_format='GLB', use_selection=True,
                          export_apply=False, export_skins=True, export_animations=False, export_vertex_color='ACTIVE')
if PREVIEW:
    bpy.ops.object.light_add(type='SUN', location=(4, -4, 8)); sun = bpy.context.active_object; sun.data.energy = 3.5; sun.rotation_euler = (.7, .2, .6)
    bpy.ops.object.light_add(type='AREA', location=(-2, -3, 2.5)); bpy.context.active_object.data.energy = 220
    w = bpy.data.worlds.new('w'); scene.world = w; w.use_nodes = True; w.node_tree.nodes['Background'].inputs[0].default_value = (.55, .4, .45, 1)
    scene.render.engine = 'CYCLES'; scene.cycles.samples = 10; scene.cycles.device = 'CPU'
    bpy.ops.object.camera_add(); cam = bpy.context.active_object; scene.camera = cam; cam.data.lens = 70
    views = [('f', 0), ('s', 65), ('b', 180)] + ([('h', 25)] if len(sys.argv) > 4 else [])
    for tag, ang in views:
        a = math.radians(ang); full = tag != 'h'
        dist = 3.6 if full else 1.1; ty = .9 if full else 1.52
        cam.location = B(math.sin(a) * dist, ty + (.05 if full else .03), math.cos(a) * dist)
        cam.rotation_euler = (math.radians(90), 0, a)
        scene.render.resolution_x, scene.render.resolution_y = (380, 760) if full else (500, 500)
        scene.render.filepath = os.path.join(out, 'prev_%s_%s.png' % (KIND, tag)); bpy.ops.render.render(write_still=True)
print('done')
