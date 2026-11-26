# Качок — второй базовый скин игрока: рельефное тело из метаболов, синие плавки, вены, короткая стрижка.
# Плащ делается в игре (ткань на частицах), здесь его нет.
# Запуск: python3 muscle.py out_dir [preview]
# Координаты в коде — «как у девушек»: y вверх, лицо в +z, левая сторона персонажа в +x.
# B() поворачивает на 180° вокруг y (герой в игре смотрит в -z) и переводит в оси Blender.
# Кости названы как суставы героя: hips, spine, chest, neck, head, lSh/lEl/lWr, lHip/lKn/lAn/lToe (+ правые).
import bpy, bmesh, math, sys, os, random
from mathutils import Vector, Matrix, Euler
from mathutils.bvhtree import BVHTree

out = sys.argv[1] if len(sys.argv) > 1 else '/tmp/mus'
PREVIEW = len(sys.argv) > 2
os.makedirs(out, exist_ok=True)
random.seed(7)
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene

M3 = Matrix(((-1, 0, 0), (0, 0, 1), (0, 1, 0)))
def B(x, y, z): return Vector((-x, z, y))
def T(v): return Vector((-v.x, v.z, v.y))
def sstep(a, b, x):
    t = max(0.0, min(1.0, (x - a) / (b - a))) if b != a else (1.0 if x >= a else 0.0)
    return t * t * (3 - 2 * t)
def clamp(x, a=0.0, b=1.0): return max(a, min(b, x))
def link(o): bpy.context.collection.objects.link(o); return o
def activate(o):
    bpy.ops.object.select_all(action='DESELECT'); o.select_set(True); bpy.context.view_layer.objects.active = o
def apply_mods(o):
    activate(o)
    for md in list(o.modifiers): bpy.ops.object.modifier_apply(modifier=md.name)
def smooth_all(o):
    for p in o.data.polygons: p.use_smooth = True
def srgb(h):
    c = [int(h[i:i+2], 16)/255 for i in (1, 3, 5)]
    return Vector([((x+.055)/1.055)**2.4 if x > .04045 else x/12.92 for x in c])

MATS = {}
def mat(name, hexc, rough=.6, metal=0.0):
    if name in MATS: return MATS[name]
    m = bpy.data.materials.new(name); m.use_nodes = True
    nt = m.node_tree; b = nt.nodes['Principled BSDF']
    b.inputs['Roughness'].default_value = rough; b.inputs['Metallic'].default_value = metal
    a = nt.nodes.new('ShaderNodeVertexColor'); a.layer_name = 'Color'
    nt.links.new(a.outputs['Color'], b.inputs['Base Color'])
    MATS[name] = m; return m
def set_mat(o, m):
    o.data.materials.clear(); o.data.materials.append(m)
    for p in o.data.polygons: p.material_index = 0

# ---------------- суставы ----------------
JP = {'hips': (0, .97, 0), 'spine': (0, 1.05, 0), 'chest': (0, 1.23, 0), 'neck': (0, 1.53, -.01), 'head': (0, 1.62, 0)}
for s, n in ((1, 'l'), (-1, 'r')):
    JP[n+'Hip'] = (s*.10, .92, 0); JP[n+'Kn'] = (s*.105, .51, .01); JP[n+'An'] = (s*.11, .095, -.01); JP[n+'Toe'] = (s*.11, .03, .12)
    JP[n+'Sh'] = (s*.245, 1.455, 0); JP[n+'El'] = (s*.27, 1.185, -.01); JP[n+'Wr'] = (s*.272, .925, 0)
PARENT = {'hips': None, 'spine': 'hips', 'chest': 'spine', 'neck': 'chest', 'head': 'neck'}
for n in 'lr':
    PARENT.update({n+'Hip': 'hips', n+'Kn': n+'Hip', n+'An': n+'Kn', n+'Toe': n+'An', n+'Sh': 'chest', n+'El': n+'Sh', n+'Wr': n+'El'})
BONES = list(PARENT)

# ---------------- метаболы ----------------
DEC = .2
def blob(name, els, res=.0052, thr=.6, dec=None):
    mb = bpy.data.metaballs.new(name); mb.resolution = res; mb.render_resolution = res; mb.threshold = thr
    o = link(bpy.data.objects.new(name, mb))
    for e in els:
        c, ax = e[0], e[1]; rot = e[2] if len(e) > 2 else (0, 0, 0); st = e[3] if len(e) > 3 else 2.0; neg = e[4] if len(e) > 4 else False
        el = mb.elements.new(type='ELLIPSOID'); el.co = B(*c); el.radius = 1/.573
        el.size_x, el.size_y, el.size_z = ax[0], ax[2], ax[1]
        el.rotation = (M3 @ Euler(rot, 'XYZ').to_matrix() @ M3.transposed()).to_quaternion()
        el.stiffness = st; el.use_negative = neg
    activate(o); bpy.ops.object.convert(target='MESH'); o = bpy.context.active_object; o.name = name
    # сглаживаем ступеньки полигонизации и прореживаем
    md = o.modifiers.new('sm', 'SMOOTH'); md.factor = .5; md.iterations = 3
    md = o.modifiers.new('dec', 'DECIMATE'); md.ratio = dec or DEC
    apply_mods(o); smooth_all(o); return o
def mir(els):
    outl = []
    for e in els:
        c, ax = e[0], e[1]; rot = e[2] if len(e) > 2 else (0, 0, 0); rest = list(e[3:])
        outl.append(e)
        outl.append(((-c[0], c[1], c[2]), ax, (rot[0], -rot[1], -rot[2]), *rest))
    return outl

# торс: таз, талия, грудная клетка, широчайшие, грудные, пресс, трапеции, шея
torso_c = [((0, .965, -.015), (.145, .10, .1)), ((0, 1.085, -.005), (.112, .1, .085)), ((0, 1.27, -.012), (.14, .16, .095)),
           ((0, 1.41, -.015), (.18, .085, .095)), ((0, 1.55, -.01), (.066, .1, .064)),
           ((0, 1.17, -.075), (.07, .25, .045)), ((0, 1.2, -.115), (.012, .26, .02), (0, 0, 0), 2.0, True), ((0, 1.325, .14), (.006, .05, .016), (0, 0, 0), 1.5, True)]
torso_m = [((.075, .905, -.07), (.085, .095, .07)),                 # ягодицы
           ((.128, 1.335, -.04), (.068, .11, .052), (0, 0, .55)),    # широчайшие
           ((.08, 1.345, .088), (.1, .072, .05), (0, 0, .12)),     # грудные
           ((.07, 1.312, .098), (.08, .03, .035), (0, 0, .2)),     # нижний край груди
           ((.12, 1.39, .055), (.06, .05, .04), (0, 0, .5)),        # грудь к дельте
           ((.08, 1.485, -.03), (.085, .045, .058), (0, 0, .5)),    # трапеции
           ((.115, 1.07, .025), (.038, .085, .05)),                 # косые
           ((.042, 1.10, -.085), (.038, .13, .035)),                # разгибатели спины
           ((.07, 1.36, -.07), (.07, .075, .04), (0, 0, -.2)),    # ромбовидные/лопатки
           ((.03, 1.545, .02), (.018, .055, .02), (-.35, 0, -.25))] # грудино-ключичная
for y in (1.185, 1.11, 1.035):
    torso_m.append(((.038, y, .072), (.033, .031, .024)))       # кубики пресса

legs = {}
for s, n in ((1, 'l'), (-1, 'r')):
    L = [((s*.098, .875, -.02), (.078, .07, .06)),               # верх бедра (под плавками)
         ((s*.132, .70, .005), (.076, .17, .076)),                  # латеральная широкая
         ((s*.098, .72, .05), (.064, .19, .062)),                 # прямая
         ((s*.065, .575, .04), (.05, .07, .048)),                  # капля над коленом
         ((s*.098, .72, -.05), (.07, .17, .062)),                  # бицепс бедра
         ((s*.065, .80, -.005), (.06, .1, .065)),                  # приводящие
         ((s*.105, .51, .015), (.048, .05, .048)),                 # колено
         ((s*.09, .385, -.04), (.043, .1, .048)),                  # икра медиальная
         ((s*.133, .385, -.032), (.038, .09, .042)),               # икра латеральная
         ((s*.11, .29, .012), (.04, .18, .04)),                    # голень
         ((s*.11, .14, -.01), (.033, .06, .033)),
         ((s*.11, .085, -.008), (.034, .035, .035)),               # лодыжка
         ((s*.11, .045, -.035), (.033, .035, .04)),                # пятка
         ((s*.112, .04, .055), (.043, .028, .085)),                # стопа
         ((s*.11, .028, .13), (.045, .018, .035))]                 # пальцы
    for k in range(5):
        L.append(((s*(.08 + k*.0145), .022, .16 - k*k*.0018), (.009, .011, .014)))
    legs[n] = blob('leg'+n, L)

arms = {}
for s, n in ((1, 'l'), (-1, 'r')):
    A = [((s*.236, 1.445, .042), (.062, .085, .052), (-.15, 0, 0)), # передняя дельта
         ((s*.272, 1.42, 0), (.058, .1, .062), (0, 0, s*-.12)),     # средняя дельта
         ((s*.238, 1.45, -.045), (.06, .075, .055)),               # задняя дельта
         ((s*.243, 1.49, 0), (.055, .04, .058)),
         ((s*.268, 1.29, .04), (.05, .085, .055)),                # бицепс
         ((s*.272, 1.29, -.042), (.05, .11, .05)),                 # трицепс длинная
         ((s*.296, 1.33, -.025), (.036, .08, .04)),                # трицепс латеральная
         ((s*.292, 1.22, .005), (.042, .06, .046)),                # плечевая
         ((s*.27, 1.185, -.022), (.038, .04, .038)),               # локоть
         ((s*.287, 1.10, .018), (.048, .09, .046)),                # плечелучевая
         ((s*.258, 1.08, -.008), (.043, .1, .043)),                # сгибатели
         ((s*.272, .985, .002), (.034, .07, .03)),
         ((s*.272, .93, 0), (.03, .026, .022))]                    # запястье
    arms[n] = blob('arm'+n, A)

hands = {}
for s, n in ((1, 'l'), (-1, 'r')):
    H = [((s*.272, .868, .004), (.026, .045, .04)),                # ладонь (кулак висит, ладонь к бедру)
         ((s*.262, .885, .0), (.022, .03, .036))]
    for k, z in enumerate((.03, .01, -.01, -.028)):
        H.append(((s*.268, .83 + abs(k-1.5)*.003, z), (.027, .016, .0105)))   # согнутые пальцы
        H.append(((s*.25, .842, z), (.012, .02, .01)))
    H.append(((s*.258, .855, .043), (.014, .03, .013), (0, 0, s*.2)))          # большой палец
    W = Vector((s*.272, .925, 0)); H2 = []
    for e in H:
        c = W + (Vector(e[0]) - W) * 1.15; H2.append(((c.x, c.y, c.z), tuple(a * 1.15 for a in e[1]), *e[2:]))
    hands[n] = blob('hand'+n, H2, res=.0035)

head_els = [((0, 1.735, -.008), (.088, .102, .104)), ((0, 1.65, .03), (.072, .062, .075)),
            ((0, 1.587, .066), (.036, .03, .03)), ((0, 1.735, .083), (.056, .017, .025)),
            ((0, 1.69, .1), (.015, .028, .02), (-.25, 0, 0)), ((0, 1.666, .111), (.017, .013, .016)),
            ((0, 1.633, .093), (.025, .008, .012)), ((0, 1.62, .09), (.023, .009, .012)),
            ((0, 1.6, .0), (.056, .045, .054)), ((0, 1.6265, .104), (.02, .0022, .006), (0, 0, 0), 2.0, True)]
head_m = [((.047, 1.628, .005), (.03, .038, .048)), ((.046, 1.684, .074), (.022, .014, .018)),
          ((.088, 1.70, -.005), (.012, .03, .02)),
          ((.031, 1.705, .1), (.016, .011, .01), (0, 0, 0), 2.0, True)]        # глазницы
torso = blob('torso', torso_c + mir(torso_m) + head_els + mir(head_m), res=.0042, dec=.22)
headO = torso

# ---------------- плавки: оболочка с таза и верха бёдер ----------------
def shell(src, name, keep, off, m):
    o = src.copy(); o.data = src.data.copy(); o.name = name; link(o)
    bm = bmesh.new(); bm.from_mesh(o.data)
    bmesh.ops.delete(bm, geom=[f for f in bm.faces if not keep(T(f.calc_center_median()))], context='FACES')
    bmesh.ops.delete(bm, geom=[v for v in bm.verts if not v.link_faces], context='VERTS')
    bm.normal_update()
    for v in bm.verts: v.co += v.normal * (off(T(v.co)) if callable(off) else off)
    # край выреза ровной линией: сглаживаем вдоль границы
    bnd = [v for v in bm.verts if v.is_boundary]
    for it in range(14):
        nw = {}
        for v in bnd:
            nb = [e.other_vert(v) for e in v.link_edges if e.is_boundary]
            if len(nb) == 2: nw[v] = v.co * .4 + (nb[0].co + nb[1].co) * .3
        for v, c in nw.items(): v.co = c
    bm.to_mesh(o.data); bm.free(); set_mat(o, m)
    md = o.modifiers.new('sm', 'SMOOTH'); md.factor = .5; md.iterations = 5; apply_mods(o)
    smooth_all(o); return o
def waist_y(c): return 1.0 - .02 * clamp(-c.z / .1, 0, 1)
def leg_cut(c, s):
    side = sstep(.0, .09, s * c.x - .08)        # с внешней стороны вырез высокий
    return .855 + .095 * side - .03 * sstep(.0, .06, -c.z) * (1 - side)
# ---------------- материалы ----------------
skinM = mat('mskin', '#e3ac86', .45); hairM = mat('mhair', '#2a1d15', .7); eyeM = mat('meye', '#f2efe8', .15)
irisM = mat('miris', '#3b2616', .1); briefM = mat('briefs', '#1f4fd8', .42)
for o in [torso, headO] + list(legs.values()) + list(arms.values()) + list(hands.values()): set_mat(o, skinM)
br = [shell(torso, 'briefT', lambda c: c.y < waist_y(c) and c.y > .8 and not (c.y > .9 and abs(c.x) > .145), .0055, briefM)]
for s, n in ((1, 'l'), (-1, 'r')):
    br.append(shell(legs[n], 'briefL'+n, lambda c, s=s: c.y > leg_cut(c, s), .0062, briefM))

# ---------------- глаза, брови, волосы ----------------
def prim_sphere(name, m, loc, scale, segs=16):
    bm = bmesh.new(); bmesh.ops.create_uvsphere(bm, u_segments=segs, v_segments=max(8, segs//2), radius=1)
    for v in bm.verts: v.co = B(loc[0] + v.co.x*scale[0], loc[1] + v.co.y*scale[1], loc[2] + v.co.z*scale[2])
    me = bpy.data.meshes.new(name); bm.to_mesh(me); o = link(bpy.data.objects.new(name, me)); set_mat(o, m); smooth_all(o); return o
eyes = []
for s in (1, -1):
    eyes.append(prim_sphere('eye', eyeM, (s*.031, 1.705, .086), (.0115, .0105, .0105)))
    eyes.append(prim_sphere('iris', irisM, (s*.0305, 1.7045, .0952), (.0052, .0052, .002), 12))
    lid = prim_sphere('lid', skinM, (s*.031, 1.7062, .0862), (.0128, .0118, .0118), 20)
    bm_ = bmesh.new(); bm_.from_mesh(lid.data)
    bmesh.ops.delete(bm_, geom=[f for f in bm_.faces if T(f.calc_center_median()).y < 1.7052 + .003 * (T(f.calc_center_median()).x * s - .031) / .012], context='FACES')
    bm_.to_mesh(lid.data); bm_.free(); eyes.append(lid)
    eyes.append(prim_sphere('brow', hairM, (s*.035, 1.734, .1035), (.025, .0068, .0075), 14))
    eyes[-1].rotation_euler = (0, 0, 0)
# брови чуть нахмурены: внутренний край ниже
for o in eyes:
    if o.name.startswith('brow'):
        for v in o.data.vertices:
            p = T(v.co); s = 1 if p.x > 0 else -1; p.y -= .006 * clamp(1 - (abs(p.x) - .015) / .04); v.co = B(*p)
HC = Vector((0, 1.725, -.005))
def hair_keep(c):
    d = c - HC
    if c.y < 1.6: return False
    if c.z > .02:      # спереди: лоб, линия роста волос с залысинами у висков
        return d.y > .055 + .012 * sstep(.02, .06, abs(c.x)) - .02 * sstep(.06, .085, abs(c.x))
    if abs(c.x) > .07:  # виски и над ушами
        return d.y > -.01 and not (abs(c.x) > .08 and d.y < .015 and c.z > -.035)
    return d.y > -.075 + .03 * sstep(.04, .08, abs(c.x))   # затылок до шеи
hair = shell(headO, 'hair', hair_keep, lambda c: .0075 + .006 * sstep(.0, .1, c.y - HC.y), hairM)

# вены: трубки по поверхности, наполовину утоплены
def catmull(pts, n=7):
    P = [Vector(p) for p in pts]; P = [P[0] * 2 - P[1]] + P + [P[-1] * 2 - P[-2]]; res = []
    for i in range(1, len(P) - 2):
        p0, p1, p2, p3 = P[i-1], P[i], P[i+1], P[i+2]
        for k in range(n):
            t = k / n
            res.append(.5 * ((2*p1) + (-p0 + p2)*t + (2*p0 - 5*p1 + 4*p2 - p3)*t*t + (-p0 + 3*p1 - 3*p2 + p3)*t*t*t))
    res.append(P[-2]); return res
def bvh_of(o):
    bm = bmesh.new(); bm.from_mesh(o.data)
    for v in bm.verts: v.co = T(v.co)
    t = BVHTree.FromBMesh(bm); bm.free(); return t
VEINS = []
def vein(target_bvh, pts, r0, r1=None, sink=.25):
    r1 = r1 if r1 is not None else r0 * .6
    P = catmull(pts); Q = []
    for p in P:
        loc, nrm, _, _ = target_bvh.find_nearest(p)
        if loc is None: continue
        Q.append((loc, nrm))
    if len(Q) < 3: return
    bm = bmesh.new(); rings = []; NS = 8
    for i, (p, nrm) in enumerate(Q):
        k = i / (len(Q) - 1); r = r0 + (r1 - r0) * k; r *= min(1, .35 + 4 * min(k, 1 - k))
        tng = (Q[min(i+1, len(Q)-1)][0] - Q[max(i-1, 0)][0]).normalized()
        u = (nrm - tng * nrm.dot(tng)).normalized(); w = tng.cross(u)
        c = p + u * (r * (1 - sink * 2))
        rings.append([bm.verts.new(B(*(c + u * math.cos(a) * r * .6 + w * math.sin(a) * r * 1.8)))
                      for a in [j / NS * 2 * math.pi for j in range(NS)]])
    for i in range(len(rings) - 1):
        for j in range(NS):
            a, b = rings[i], rings[i+1]
            bm.faces.new((a[j], b[j], b[(j+1) % NS], a[(j+1) % NS]))
    bm.normal_update()
    bm.faces.ensure_lookup_table(); f0 = bm.faces[0]
    rc = sum((v.co for v in rings[0] + rings[1]), Vector()) / (2 * NS)
    if f0.normal.dot(f0.calc_center_median() - rc) < 0:
        for f in bm.faces: f.normal_flip()
    # торцы — маленькие шапочки, чтобы не было дыр
    me = bpy.data.meshes.new('vein'); bm.to_mesh(me); o = link(bpy.data.objects.new('vein', me)); set_mat(o, skinM); smooth_all(o)
    VEINS.append(o); return o
for s, n in ((1, 'l'), (-1, 'r')):
    ab = bvh_of(arms[n]); lb = bvh_of(legs[n]); hb = bvh_of(hands[n])
    vein(ab, [(s*.302, 1.37, .03), (s*.31, 1.29, .045), (s*.305, 1.21, .04), (s*.312, 1.13, .04), (s*.298, 1.04, .03), (s*.285, .955, .025)], .0042, .0032)  # головная
    vein(ab, [(s*.24, 1.36, .045), (s*.25, 1.28, .07), (s*.262, 1.21, .055), (s*.255, 1.16, .045)], .0036, .003)     # по бицепсу
    vein(ab, [(s*.25, 1.28, .07), (s*.278, 1.245, .07), (s*.304, 1.205, .042)], .003, .0025)                          # перемычка
    vein(ab, [(s*.255, 1.16, .045), (s*.265, 1.10, .05), (s*.262, 1.02, .036), (s*.266, .95, .028)], .0036, .0028)    # предплечье
    vein(ab, [(s*.265, 1.10, .05), (s*.288, 1.065, .05), (s*.298, 1.03, .035)], .0028, .0022)
    vein(ab, [(s*.24, 1.12, .0), (s*.245, 1.05, .015), (s*.26, .98, .02)], .0026, .0022)
    vein(ab, [(s*.282, 1.16, -.06), (s*.29, 1.27, -.075), (s*.285, 1.36, -.06)], .0026, .002)                        # по трицепсу
    vein(lb, [(s*.075, .44, -.03), (s*.08, .33, -.005), (s*.09, .22, .005), (s*.095, .13, .01)], .0034, .0026)        # икра
    vein(lb, [(s*.06, .66, .03), (s*.062, .58, .05), (s*.075, .52, .045)], .0028, .0022)
    vein(hb, [(s*.29, .9, .02), (s*.297, .87, .0), (s*.296, .845, -.018)], .0024, .0018)                              # тыл кисти
tb = bvh_of(torso)
for s in (1, -1):
    vein(tb, [(s*.06, 1.035, .075), (s*.075, .995, .065), (s*.07, .95, .06)], .003, .0024)                              # низ живота

# ---------------- веса ----------------
def wspine(y):
    a = sstep(1.0, 1.09, y); b = sstep(1.15, 1.28, y); c = sstep(1.49, 1.56, y); hd = sstep(1.585, 1.64, y)
    return {'hips': 1 - a, 'spine': a * (1 - b), 'chest': a * b * (1 - c), 'neck': a * b * c * (1 - hd), 'head': a * b * c * hd}
def w_torso(p): return wspine(p.y)
def w_leg(n):
    def f(p):
        kn = sstep(.56, .46, p.y); an = sstep(.15, .085, p.y); toe = sstep(.085, .125, p.z) * an
        w = {n+'Hip': 1 - kn, n+'Kn': kn * (1 - an), n+'An': an * (1 - toe), n+'Toe': toe}
        top = sstep(.88, 1.0, p.y) * .55
        w = {k: v * (1 - top) for k, v in w.items()}; w['hips'] = top; return w
    return f
def w_arm(n):
    def f(p):
        el = sstep(1.23, 1.15, p.y); wr = sstep(.96, .91, p.y); top = sstep(1.47, 1.54, p.y) * .45
        w = {n+'Sh': (1 - el) * (1 - top), n+'El': el * (1 - wr), n+'Wr': el * wr, 'chest': (1 - el) * top}
        return w
    return f
def w_head(p):
    nk = sstep(1.62, 1.57, p.y); return {'head': 1 - nk * .8, 'neck': nk * .8}
def weigh(o, fn):
    vg = {b: o.vertex_groups.get(b) or o.vertex_groups.new(name=b) for b in BONES}
    for v in o.data.vertices:
        w = fn(T(v.co)); s = sum(w.values()) or 1
        for k, x in w.items():
            if x > 1e-4: vg[k].add([v.index], x / s, 'REPLACE')
weigh(torso, w_torso); weigh(br[0], w_torso)
for n in 'lr':
    weigh(legs[n], w_leg(n)); weigh(br[1 if n == 'l' else 2], w_leg(n))
    weigh(arms[n], w_arm(n)); weigh(hands[n], lambda p, n=n: {n+'Wr': 1})
for o in [hair] + eyes: weigh(o, w_head)
def vein_w(o):
    c = T(sum((v.co for v in o.data.vertices), Vector()) / len(o.data.vertices))
    n = 'l' if c.x > 0 else 'r'
    if c.y < .95 and abs(c.x) > .2: return lambda p: {n+'Wr': 1}
    if abs(c.x) > .2: return w_arm(n)
    if c.y < .8: return w_leg(n)
    return w_torso
for o in VEINS: weigh(o, vein_w(o))

# ---------------- цвет вершин: загар + запечённая окклюзия ----------------
allm = [torso, hair] + list(legs.values()) + list(arms.values()) + list(hands.values()) + br + eyes
bm = bmesh.new()
for o in allm:
    t = bmesh.new(); t.from_mesh(o.data)
    for v in t.verts: v.co = T(v.co)
    me = bpy.data.meshes.new('tmp'); t.to_mesh(me); t.free(); bm.from_mesh(me); bpy.data.meshes.remove(me)
OCC = BVHTree.FromBMesh(bm); bm.free()
DIRS = []
for i in range(26):
    yv = 1 - (i + .5) / 26; r = math.sqrt(1 - yv * yv); a = i * 2.39996
    DIRS.append(Vector((math.cos(a) * r, yv, math.sin(a) * r)))
def ao(p, nrm, dist=.09):
    t = nrm.orthogonal().normalized(); bt = nrm.cross(t); occ = 0; tot = 0
    for d in DIRS:
        w = t * d.x + nrm * d.y + bt * d.z; wt = d.y
        hit = OCC.ray_cast(p + nrm * .0015, w, dist)
        if hit[0] is not None: occ += wt * (1 - hit[3] / dist) ** .7
        tot += wt
    return 1 - occ / tot
SK = srgb('#efc2a0'); TAN = srgb('#d9a582'); PALE = srgb('#f6d5bd')
def skin_col(p, nrm):
    up = clamp(nrm.y * .5 + .5)                       # загар сверху и снаружи плотнее
    outer = clamp((abs(p.x) - .2) / .1) * clamp(nrm.x * (1 if p.x > 0 else -1))
    c = SK.lerp(TAN, clamp(.25 * up + .3 * outer + .2 * sstep(1.3, 1.6, p.y)))
    c = c.lerp(PALE, .35 * clamp(-nrm.y) + .25 * clamp(1 - abs(p.x) / .06) * sstep(1.25, 1.0, p.y) * clamp(nrm.z))
    return c
LIP = srgb('#b8705e')
def colorize(o, fn, occ_k=.85):
    me = o.data
    ca = me.color_attributes.new('Color', 'FLOAT_COLOR', 'POINT')
    me.calc_normals() if hasattr(me, 'calc_normals') else None
    for v in me.vertices:
        p = T(v.co); nrm = T(v.normal).normalized()
        c = fn(p, nrm); a = ao(p, nrm); k = 1 - occ_k * (1 - a)
        ca.data[v.index].color = (c.x * k, c.y * k, c.z * k, 1)
    me.color_attributes.active_color = ca
def face_col(p, nrm):
    c = skin_col(p, nrm)
    if p.z > .07 and 1.612 < p.y < 1.64 and abs(p.x) < .028: c = c.lerp(LIP, .7 * clamp(1 - abs(p.x) / .028))
    if p.z > .07 and p.y < 1.62: c = c * (1 - .1 * sstep(1.62, 1.58, p.y))   # лёгкая щетина
    return c
for o in list(legs.values()) + list(arms.values()) + list(hands.values()): colorize(o, skin_col)
colorize(torso, face_col, .82)
for o in VEINS: colorize(o, lambda p, nrm: skin_col(p, nrm) * Vector((.93, .94, .99)), .0)
HAIR = srgb('#2a1d15')
colorize(hair, lambda p, nrm: HAIR * (.85 + .3 * sstep(1.65, 1.84, p.y)), .35)
BL = srgb('#2058e0'); BLD = srgb('#163a9e')
def brief_col(p, nrm):
    band = sstep(waist_y(p) - .03, waist_y(p) - .02, p.y)
    return BL.lerp(BLD, .6 * band)
for o in br: colorize(o, brief_col, .45)
for o in eyes:
    nm = o.name; colorize(o, (lambda p, n: srgb('#f2efe8')) if nm.startswith('eye') else (lambda p, n: srgb('#3b2616')) if nm.startswith('iris') else skin_col if nm.startswith('lid') else (lambda p, n: HAIR), .3)

# ---------------- объединяем по материалам ----------------
skinned = [o for o in bpy.data.objects if o.type == 'MESH']
groups = {}
for o in skinned: groups.setdefault(o.data.materials[0].name, []).append(o)
skinned = []
for key, objs in groups.items():
    if len(objs) > 1:
        bpy.ops.object.select_all(action='DESELECT')
        for o in objs: o.select_set(True)
        bpy.context.view_layer.objects.active = objs[0]; bpy.ops.object.join()
    objs[0].name = 'S_' + key; skinned.append(objs[0])

arm_d = bpy.data.armatures.new('rig'); rig = link(bpy.data.objects.new('rig', arm_d))
activate(rig); bpy.ops.object.mode_set(mode='EDIT')
for n in BONES:
    b = arm_d.edit_bones.new(n); b.head = B(*JP[n]); b.tail = B(JP[n][0], JP[n][1] + .06, JP[n][2])
for n in BONES:
    if PARENT[n]: arm_d.edit_bones[n].parent = arm_d.edit_bones[PARENT[n]]
bpy.ops.object.mode_set(mode='OBJECT')
for o in skinned:
    o.parent = rig; md = o.modifiers.new('arm', 'ARMATURE'); md.object = rig
tris = sum(sum(len(p.vertices) - 2 for p in o.data.polygons) for o in skinned)
print('tris', tris, {o.name: len(o.data.polygons) for o in skinned})
bpy.ops.object.select_all(action='SELECT')
bpy.ops.export_scene.gltf(filepath=os.path.join(out, 'muscle.glb'), export_format='GLB', use_selection=True,
                          export_apply=False, export_skins=True, export_animations=False, export_vertex_color='ACTIVE', export_texcoords=False)
VIEWS = [('f', 0, 1), ('s', 60, 1), ('b', 180, 1), ('h', 20, 0), ('a', 35, 2)]
if os.environ.get('VIEWS'): VIEWS = [v for v in VIEWS if v[0] in os.environ['VIEWS']]
if PREVIEW:
    bpy.ops.object.light_add(type='SUN', location=(4, -4, 8)); sun = bpy.context.active_object; sun.data.energy = 3.5; sun.rotation_euler = (.75, .15, 2.6)
    bpy.ops.object.light_add(type='AREA', location=(2, 3, 2.5)); bpy.context.active_object.data.energy = 200
    w = bpy.data.worlds.new('w'); scene.world = w; w.use_nodes = True; w.node_tree.nodes['Background'].inputs[0].default_value = (.35, .42, .55, 1)
    scene.render.engine = 'CYCLES'; scene.cycles.samples = 12; scene.cycles.device = 'CPU'
    bpy.ops.object.camera_add(); cam = bpy.context.active_object; scene.camera = cam; cam.data.lens = 70
    for tag, ang, full in VIEWS:
        a = math.radians(ang); dist = 3.8 if full == 1 else 1.1 if full == 0 else 1.6; ty = .93 if full == 1 else 1.68 if full == 0 else 1.25
        # камера смотрит на лицо персонажа (+z в наших осях → -y Blender после поворота)
        p = B(math.sin(a) * dist, ty, math.cos(a) * dist); cam.location = p
        d = B(0, ty, 0) - p; cam.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()
        scene.render.resolution_x, scene.render.resolution_y = (400, 800) if full == 1 else (520, 520)
        scene.render.filepath = os.path.join(out, 'prev_%s.png' % tag); bpy.ops.render.render(write_still=True)
print('done')
