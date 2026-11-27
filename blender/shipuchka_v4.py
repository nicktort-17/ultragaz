# УЛЬТРАГАЗ — Шипучка v4 по развёртке (Blender 4.x / 5.x)
# Запуск: Blender → Scripting → Open → Run Script, или: blender --background --python ultragaz_guns_v2.py -- <папка>
import bpy, bmesh, math, os, sys
from mathutils import Vector, Euler

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene

def srgb(h):
    h = h.lstrip('#'); c = [int(h[i:i+2], 16) / 255 for i in (0, 2, 4)]
    return tuple(x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in c)

def mat(name, hexc, metal=0.0, rough=0.5, trans=0.0, emit=0.0, coat=0.0):
    m = bpy.data.materials.new(name); m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]; c = srgb(hexc)
    b.inputs["Base Color"].default_value = (*c, 1); b.inputs["Metallic"].default_value = metal
    b.inputs["Roughness"].default_value = rough
    if trans: b.inputs["Transmission Weight"].default_value = trans; b.inputs["IOR"].default_value = 1.45
    if emit: b.inputs["Emission Color"].default_value = (*c, 1); b.inputs["Emission Strength"].default_value = emit
    if coat: b.inputs["Coat Weight"].default_value = coat
    return m

M = dict(
    red=mat("Кола-красный", "#c8102e", .1, .3, coat=.6), cream=mat("Крем", "#f6eee2", 0, .45),
    chrome=mat("Хром", "#e6e8ec", 1, .16), steel=mat("Сталь", "#c9ced4", 1, .32), dark=mat("Тёмный металл", "#2b2b30", .9, .3),
    gold=mat("Золото", "#f2b84b", 1, .22), rubber=mat("Резина", "#1a1012", 0, .7), wood=mat("Дерево", "#8a4b25", 0, .55),
    glass=mat("Бутылочное стекло", "#6b2a14", 0, .03, trans=.92), pet=mat("ПЭТ-пластик", "#d9efe6", 0, .05, trans=.95),
    cola=mat("Кола", "#2a0c05", 0, .1, trans=.5), ice=mat("Лёд", "#cfeefa", 0, .08, trans=.9),
    foam=mat("Пена", "#f3e7d2", 0, .9), mint=mat("Ментос", "#f7fbf8", 0, .3), mintpaper=mat("Обёртка ментоса", "#1f5fd1", 0, .45),
    tape=mat("Изолента", "#f2b84b", 0, .6), glow=mat("Свечение", "#ffcc55", 0, .4, emit=3),
    b_green=mat("Кнопка зелёная", "#7ee08a", 0, .35), b_blue=mat("Кнопка синяя", "#5fb7f0", 0, .35), b_orange=mat("Кнопка оранжевая", "#ff9a4d", 0, .35),
)

def shade(o, m, bevel=0.0, parent=None):
    o.data.materials.append(m)
    if bevel:
        md = o.modifiers.new("Фаска", 'BEVEL'); md.width = bevel; md.segments = 3; md.limit_method = 'ANGLE'
    if hasattr(o.data, "polygons"):
        for p in o.data.polygons: p.use_smooth = True
    if parent: o.parent = parent
    return o

def box(n, size, loc, m, par, rot=(0, 0, 0), bevel=.006):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc, rotation=rot); o = bpy.context.object; o.name = n; o.scale = size
    bpy.ops.object.transform_apply(scale=True); return shade(o, m, bevel, par)

def cyl(n, r, d, loc, m, par, rot=(0, 0, 0), v=32, bevel=.003, r2=None):
    if r2 is None: bpy.ops.mesh.primitive_cylinder_add(vertices=v, radius=r, depth=d, location=loc, rotation=rot)
    else: bpy.ops.mesh.primitive_cone_add(vertices=v, radius1=r, radius2=r2, depth=d, location=loc, rotation=rot)
    o = bpy.context.object; o.name = n; return shade(o, m, bevel, par)

def sph(n, r, loc, m, par, sc=(1, 1, 1)):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=r, location=loc, segments=24, ring_count=12); o = bpy.context.object; o.name = n
    o.scale = sc; bpy.ops.object.transform_apply(scale=True); return shade(o, m, 0, par)

def tor(n, R, r, loc, m, par, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_torus_add(major_radius=R, minor_radius=r, location=loc, rotation=rot, major_segments=40, minor_segments=12)
    o = bpy.context.object; o.name = n; return shade(o, m, 0, par)

def lathe(n, prof, m, par, loc=(0, 0, 0), segs=48):
    """Тело вращения вокруг оси Y. prof = [(радиус, y), ...] от задней части к передней."""
    me = bpy.data.meshes.new(n); bm = bmesh.new(); rings = []
    for r, y in prof:
        ring = [bm.verts.new((loc[0] + r * math.cos(2 * math.pi * i / segs), loc[1] + y, loc[2] + r * math.sin(2 * math.pi * i / segs))) for i in range(segs)]
        rings.append(ring)
    for a, b in zip(rings, rings[1:]):
        for i in range(segs): bm.faces.new((a[i], a[(i + 1) % segs], b[(i + 1) % segs], b[i]))
    for ring, (r, y), flip in ((rings[0], prof[0], True), (rings[-1], prof[-1], False)):
        if r > 1e-4:
            f = bm.faces.new(ring[::-1] if flip else ring)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces); bm.to_mesh(me); bm.free()
    o = bpy.data.objects.new(n, me); bpy.context.collection.objects.link(o); return shade(o, m, 0, par)

def hose(n, pts, r, m, par):
    cu = bpy.data.curves.new(n, 'CURVE'); cu.dimensions = '3D'; cu.bevel_depth = r; cu.bevel_resolution = 4
    sp = cu.splines.new('POLY'); sp.points.add(len(pts) - 1)
    for p, c in zip(sp.points, pts): p.co = (*c, 1)
    o = bpy.data.objects.new(n, cu); bpy.context.collection.objects.link(o); o.data.materials.append(m); o.parent = par; return o

def crown_mesh(n, R=.032, pleats=21):
    """Кроновая крышка от стеклянной бутылки: плоский верх, скруглённый край и расходящаяся юбка с зубцами."""
    me = bpy.data.meshes.new(n); bm = bmesh.new(); N = pleats * 4; rings = []
    prof = [(0, .0, 0), (.82, .0, 0), (.93, -.04, 0), (.99, -.12, 0), (1.02, -.22, .25), (1.08, -.34, .65), (1.14, -.44, 1.0)]
    top = bm.verts.new((0, 0, 0))
    for rr, zz, pa in prof[1:]:
        ring = []
        for i in range(N):
            a = 2 * math.pi * i / N; r = R * (rr + .075 * pa * math.cos(pleats * a))
            ring.append(bm.verts.new((r * math.cos(a), r * math.sin(a), zz * R)))
        rings.append(ring)
    for i in range(N): bm.faces.new((top, rings[0][i], rings[0][(i + 1) % N]))
    for a_, b_ in zip(rings, rings[1:]):
        for i in range(N): bm.faces.new((a_[i], b_[i], b_[(i + 1) % N], a_[(i + 1) % N]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces); bm.to_mesh(me); bm.free()
    for poly in me.polygons: poly.use_smooth = True
    return me

def cap(n, loc, rot, par, s=1.0):
    """Крышка от колы в стекле: красная крона с 21 зубцом и серебристой подкладкой внутри, без логотипов."""
    o = bpy.data.objects.new(n, crown_mesh(n, .032 * s)); bpy.context.collection.objects.link(o)
    o.location = loc; o.rotation_euler = rot; o.data.materials.append(M["red"]); o.parent = par
    sol = o.modifiers.new("Толщина", 'SOLIDIFY'); sol.thickness = .0012 * s
    bpy.ops.mesh.primitive_circle_add(vertices=48, radius=.027 * s, fill_type='NGON', location=(0, 0, 0)); l = bpy.context.object
    l.name = n + " · подкладка"; l.data.materials.append(M["steel"]); l.parent = o; l.location = (0, 0, -.0035 * s)
    return o

def root(name):
    col = bpy.data.collections.new(name); scene.collection.children.link(col)
    lc = bpy.context.view_layer.layer_collection.children[col.name]; bpy.context.view_layer.active_layer_collection = lc
    bpy.ops.object.empty_add(type='PLAIN_AXES', location=(0, 0, 0)); e = bpy.context.object; e.name = name; return e

X = math.radians(90)
M.update(dict(
    gray=mat("Сталь корпуса", "#8d8f95", .75, .34), gray2=mat("Тёмная сталь", "#55575d", .8, .3),
    white=mat("Белый корпус", "#f3f1ec", 0, .32, coat=.5), dglass=mat("Тёмное бутылочное стекло", "#3a3c42", 0, .04, trans=.9),
    leather=mat("Кожа рукояти", "#6e3a26", 0, .62), hose=mat("Шланг", "#2a2a2e", 0, .55), face=mat("Циферблат", "#f6f3ea", 0, .4),
    needle=mat("Стрелка", "#c8102e", 0, .4), bore=mat("Канал ствола", "#141416", .2, .6)))

def loft(n, secs, m, par, cap_ends=True):
    """Лофт по замкнутым сечениям одинаковой длины: secs = [[(x,y,z),...], ...]."""
    me = bpy.data.meshes.new(n); bm = bmesh.new(); rings = [[bm.verts.new(p) for p in s] for s in secs]; N = len(secs[0])
    for a, b in zip(rings, rings[1:]):
        for i in range(N): bm.faces.new((a[i], a[(i + 1) % N], b[(i + 1) % N], b[i]))
    if cap_ends: bm.faces.new(rings[0][::-1]); bm.faces.new(rings[-1])
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces); bm.to_mesh(me); bm.free()
    o = bpy.data.objects.new(n, me); bpy.context.collection.objects.link(o); return shade(o, m, 0, par)

def rrect(cx, cy, z, a, b, n=4.0, N=28, front=None):
    pts = []
    for i in range(N):
        t = 2 * math.pi * i / N; c, s = math.cos(t), math.sin(t)
        x = a * math.copysign(abs(c) ** (2 / n), c); y = b * math.copysign(abs(s) ** (2 / n), s)
        if front and y < 0: y -= front * (-s) ** 2
        pts.append((cx + x, cy + y, z))
    return pts

def arc_shell(n, r, y0, y1, a0, a1, m, par, cz=0, segs=24, th=.0015):
    """Кусок цилиндрической обечайки вокруг оси Y (углы в градусах, 0 — справа, 90 — сверху)."""
    secs = []
    for y in (y0, y1):
        ring = []
        for i in range(segs + 1):
            a = math.radians(a0 + (a1 - a0) * i / segs); ring.append((r * math.cos(a), y, cz + r * math.sin(a)))
        for i in range(segs, -1, -1):
            a = math.radians(a0 + (a1 - a0) * i / segs); ring.append(((r - th) * math.cos(a), y, cz + (r - th) * math.sin(a)))
        secs.append(ring)
    return loft(n, secs, m, par)

def shipuchka():
    p = root("1 Шипучка — газировочный пистолет")
    BZ = .012  # ось бутылки-ствола
    # --- ствол: тёмная стеклянная бутылка горлышком вперёд, внутри кола ---
    prof = [(0, -.012), (.031, -.012), (.033, -.03), (.033, -.1), (.031, -.118), (.024, -.14), (.015, -.16), (.0115, -.175), (.0105, -.198), (.0125, -.2), (.0128, -.214), (.0105, -.216), (.0, -.216)]
    lathe("Бутылка-ствол", [(r, y) for r, y in prof], M["dglass"], p, loc=(0, 0, BZ))
    lathe("Кола в стволе", [(0, -.016), (.028, -.016), (.029, -.1), (.022, -.135), (.0, -.135)], M["cola"], p, loc=(0, 0, BZ))
    for i, y in enumerate((-.04, -.06, -.08, -.1)): tor(f"Ребро бутылки {i+1}", .0332, .0011, (0, y, BZ), M["dglass"], p, (X, 0, 0))
    tor("Горлышко", .0118, .0024, (0, -.212, BZ), M["dglass"], p, (X, 0, 0))
    cyl("Канал ствола", .0062, .006, (0, -.214, BZ), M["bore"], p, (X, 0, 0), v=20, bevel=0)
    cyl("Хомут бутылки", .0345, .014, (0, -.026, BZ), M["gray"], p, (X, 0, 0), v=40, bevel=.002)
    # --- механизм: барабан револьвера вдоль ствола (крутится с каждым выстрелом) ---
    DY, DZ, DR = .012, .006, .04
    box("Верхняя планка", (.024, .13, .012), (0, .0, .056), M["gray2"], p, bevel=.003)
    box("Красная вставка планки", (.008, .07, .003), (0, .0, .0625), M["red"], p, bevel=.001)
    box("Мушка", (.006, .01, .01), (0, -.06, .064), M["gray2"], p, bevel=.002)
    box("Целик", (.022, .008, .012), (0, .075, .066), M["gray2"], p, bevel=.002)
    cyl("Ось барабана", .0055, .09, (0, DY, DZ), M["gray2"], p, (X, 0, 0), v=16, bevel=0)
    cyl("Барабан", DR, .062, (0, DY, DZ), M["gray"], p, (X, 0, 0), v=48, bevel=.005)
    for k in range(6):
        a_ = 2 * math.pi * k / 6 + math.pi / 6; ca, sa = math.cos(a_), math.sin(a_)
        cyl(f"Барабан · камора {k+1}", .0105, .0635, (.025 * ca, DY, DZ + .025 * sa), M["red"], p, (X, 0, 0), v=20, bevel=.001)
        tor(f"Барабан · кольцо каморы {k+1}", .0105, .0013, (.025 * ca, DY - .0318, DZ + .025 * sa), M["chrome"], p, (X, 0, 0))
        b_ = a_ + math.pi / 6; cb, sb = math.cos(b_), math.sin(b_)
        box(f"Барабан · проточка {k+1}", (.011, .044, .005), (DR * cb, DY, DZ + DR * sb), M["gray2"], p, rot=(0, math.pi / 2 - b_, 0), bevel=.002)
    cyl("Щит барабана", .043, .014, (0, .052, DZ), M["gray2"], p, (X, 0, 0), v=48, bevel=.003)
    box("Рамка барабана", (.03, .08, .014), (0, .012, -.04), M["gray2"], p, bevel=.004)
    for s in (-1, 1):
        sd = "Л" if s < 0 else "П"
        # манометр и шланг к соплу
        cyl(f"Манометр {sd}", .0115, .008, (s * .036, -.035, .02), M["gray2"], p, (0, X, 0), v=32, bevel=.0015)
        cyl(f"Циферблат {sd}", .0095, .0015, (s * .0405, -.035, .02), M["face"], p, (0, X, 0), v=32, bevel=0)
        box(f"Стрелка манометра {sd}", (.0012, .0012, .008), (s * .0415, -.035, .0225), M["needle"], p, bevel=0)
        hose(f"Шланг манометра {sd}", [(s * .034, -.038, .008), (s * .036, -.045, -.02), (s * .034, -.06, -.036), (s * .032, -.085, -.04)], .0028, M["hose"], p)
        lathe(f"Сопло шланга {sd}", [(0, -.098), (.004, -.098), (.0055, -.092), (.0055, -.082), (.0, -.082)], M["gray2"], p, loc=(s * .032, 0, -.04))
        # трубки подачи газа от планки к бутылке
        hose(f"Трубка подачи {sd}", [(s * .012, -.01, .056), (s * .03, -.02, .055), (s * .042, -.035, .04), (s * .036, -.05, .03)], .0024, M["hose"], p)
    # --- задний бак: белый цилиндр с красной обечайкой ---
    cyl("Задний бак", .049, .11, (0, .115, .008), M["white"], p, (X, 0, 0), v=48, bevel=.006)
    # красная «волна» как на скетче: спереди сверху спускается на бока, к корме поднимается
    lo = lambda t: -38 + 92 * t ** 1.25 + 9 * math.sin(t * math.pi * 2.2)
    def band(n, r, y0, y1, f0, f1, m, th=.0016, ny=22, segs=36):
        secs = []
        for j in range(ny + 1):
            t = j / ny; y = y0 + (y1 - y0) * t; a0, a1 = f0(t), f1(t); ring = []
            for i in range(segs + 1):
                a = math.radians(a0 + (a1 - a0) * i / segs); ring.append((r * math.cos(a), y, .008 + r * math.sin(a)))
            for i in range(segs, -1, -1):
                a = math.radians(a0 + (a1 - a0) * i / segs); ring.append(((r - th) * math.cos(a), y, .008 + (r - th) * math.sin(a)))
            secs.append(ring)
        return loft(n, secs, m, p)
    band("Красная обечайка", .0498, .062, .158, lambda t: lo(t), lambda t: 180 - lo(t), M["red"])
    for s_, nm in ((1, "П"), (-1, "Л")):
        if s_ > 0: band(f"Белая волна {nm}", .0503, .07, .15, lambda t: lo(t) + 13 + 4 * math.sin(t * 6), lambda t: lo(t) + 19 + 4 * math.sin(t * 6), M["white"], th=.0008)
        else: band(f"Белая волна {nm}", .0503, .07, .15, lambda t: 180 - lo(t) - 19 - 4 * math.sin(t * 6), lambda t: 180 - lo(t) - 13 - 4 * math.sin(t * 6), M["white"], th=.0008)
    tor("Обод бака спереди", .0495, .0025, (0, .061, .008), M["gray2"], p, (X, 0, 0))
    for s in (-1, 1):
        sd = "Л" if s < 0 else "П"
        cyl(f"Порт бака {sd}", .0115, .004, (s * .049, .118, -.012), M["face"], p, (0, X, 0), v=32, bevel=.0015)
        tor(f"Кольцо порта {sd}", .0115, .0018, (s * .0505, .118, -.012), M["gray2"], p, (0, X, 0))
    cyl("Задняя крышка", .046, .012, (0, .174, .008), M["white"], p, (X, 0, 0), v=48, bevel=.005)
    tor("Обод задней крышки", .047, .003, (0, .169, .008), M["gray2"], p, (X, 0, 0))
    # --- нижний белый короб под бутылкой и сопло ---
    box("Нижний короб", (.05, .15, .036), (0, -.075, -.04), M["white"], p, bevel=.006)
    cyl("Нижнее сопло", .0105, .03, (0, -.175, -.068), M["white"], p, (X, 0, 0), v=28, bevel=.002)
    tor("Кольцо нижнего сопла", .0105, .0024, (0, -.19, -.068), M["gray2"], p, (X, 0, 0))
    cyl("Канал нижнего сопла", .006, .004, (0, -.1905, -.068), M["bore"], p, (X, 0, 0), v=16, bevel=0)
    # --- рама, спуск, скоба ---
    box("Рама", (.042, .27, .018), (0, -.03, -.067), M["gray2"], p, bevel=.004)
    box("Рама · стойка", (.036, .03, .03), (0, .07, -.052), M["gray2"], p, bevel=.004)
    cu = [(0, .012, -.074), (0, .012, -.092), (0, .018, -.104), (0, .032, -.112), (0, .052, -.113), (0, .07, -.108), (0, .084, -.096), (0, .092, -.08)]
    hose("Спусковая скоба", cu, .0045, M["gray2"], p)
    box("Спусковой крючок", (.008, .008, .026), (0, .045, -.083), M["gray"], p, rot=(math.radians(-18), 0, 0), bevel=.003)
    # --- прозрачный магазин с крышками ---
    box("Магазин", (.046, .09, .062), (0, -.075, -.107), M["pet"], p, bevel=.005)
    for i in range(4):
        cap(f"Запасная крышка {i+1}", (-.006 + (i % 2) * .012, -.102 + i * .018, -.128 + (i % 2) * .003), (math.radians(4 * i - 6), math.radians(5 * i - 8), 0), p, .42)
    # --- рукоять: кожаная, с пальцевыми выемками, наклон назад ---
    secs = []
    top = Vector((0, .098, -.062)); bot = Vector((0, .132, -.192)); N = 16
    for k in range(N):
        t = k / (N - 1); c = top.lerp(bot, t)
        groove = .0045 * (.5 - .5 * math.cos(t * 2 * math.pi * 3)) if .08 < t < .9 else 0
        secs.append(rrect(c.x, c.y, c.z, .019, .033 + .004 * math.sin(t * math.pi), 3.0, 32, front=-groove))
    loft("Рукоять", secs, M["leather"], p)
    for k, t in enumerate((.25, .58)):
        c = top.lerp(bot, t); box(f"Насечка рукояти {k+1}", (.04, .036, .007), (0, c.y + .008, c.z), M["leather"], p, bevel=.002)
    ps = []
    for t, k_ in ((.965, 1.0), (1.0, 1.06), (1.07, 1.06), (1.09, .98)):
        c = top + (bot - top) * t; ps.append(rrect(c.x, c.y, c.z, .019 * k_, .033 * k_, 3.0, 32))
    loft("Затыльник рукояти", ps, M["gray2"], p)
    return p

gun = shipuchka()

bpy.context.view_layer.active_layer_collection = bpy.context.view_layer.layer_collection
world = bpy.data.worlds.new("Мир"); scene.world = world; world.use_nodes = True
bg = world.node_tree.nodes["Background"]; bg.inputs["Color"].default_value = (*srgb("#f2f0ec"), 1); bg.inputs["Strength"].default_value = .9
def light(n, loc, e, col, size):
    d = bpy.data.lights.new(n, 'AREA'); d.energy = e; d.color = col; d.size = size
    o = bpy.data.objects.new(n, d); scene.collection.objects.link(o); o.location = loc
    o.rotation_euler = (Vector((0, 0, 0)) - Vector(loc)).to_track_quat('-Z', 'Y').to_euler()
light("Ключевой", (.8, -1.0, 1.2), 60, (1, .97, .92), 1.2)
light("Заполняющий", (-1.0, .6, .5), 30, (1, 1, 1), 1.5)
light("Снизу", (0, 0, -1.2), 12, (1, 1, 1), 1.5)
cd = bpy.data.cameras.new("Камера"); cd.type = 'ORTHO'; cd.ortho_scale = .48
cam = bpy.data.objects.new("Камера", cd); scene.collection.objects.link(cam); scene.camera = cam
scene.view_settings.view_transform = 'Standard'

def glb2json(src, dst):
    """GLB → glTF JSON со встроенным буфером (формат models/*.json игры)."""
    import json, struct, base64
    b = open(src, 'rb').read(); off = 12; js = None; bin_ = b''
    while off < len(b):
        ln, ty = struct.unpack_from('<II', b, off); ch = b[off + 8: off + 8 + ln]; off += 8 + ln
        if ty == 0x4E4F534A: js = json.loads(ch.decode('utf8'))
        elif ty == 0x004E4942: bin_ = ch
    js['buffers'][0]['uri'] = 'data:application/octet-stream;base64,' + base64.b64encode(bin_).decode()
    open(dst, 'w').write(json.dumps(js, ensure_ascii=False, separators=(',', ':')))

def export(out, render=True):
    os.makedirs(out, exist_ok=True)
    bpy.ops.wm.save_as_mainfile(filepath=os.path.join(out, "shipuchka_v4.blend"))
    bpy.ops.object.select_all(action='DESELECT'); gun.select_set(True)
    for c in gun.children_recursive: c.select_set(True)
    bpy.ops.export_scene.gltf(filepath=os.path.join(out, "shipuchka.glb"), export_format='GLB', use_selection=True, export_apply=True)
    glb2json(os.path.join(out, "shipuchka.glb"), os.path.join(out, "shipuchka.json"))
    if render:
        scene.render.engine = 'CYCLES'; scene.cycles.device = 'CPU'; scene.cycles.samples = 24
        scene.render.resolution_x, scene.render.resolution_y = 700, 520; scene.render.film_transparent = False
        views = {"left": ((1, 0, 0)), "right": ((-1, 0, 0)), "top": ((0, 0, 1)), "bottom": ((0, 0, -1)), "front": ((0, -1, 0)), "back": ((0, 1, 0)), "persp": ((-.7, -.6, .45))}
        for name, d in views.items():
            dv = Vector(d).normalized(); c = Vector((0, -.01, -.04))
            cam.location = c + dv * 1.0; up = 'Y' if abs(dv.z) > .9 else 'Y'
            if abs(dv.z) > .9: cam.rotation_euler = (0 if dv.z > 0 else math.pi, 0, -math.pi / 2)
            else: cam.rotation_euler = (c - cam.location).to_track_quat('-Z', 'Y').to_euler()
            cd.ortho_scale = .5 if name not in ("front", "back") else .32
            scene.render.filepath = os.path.join(out, f"v_{name}.png"); bpy.ops.render.render(write_still=True)

out = sys.argv[sys.argv.index("--") + 1] if "--" in sys.argv else __import__('tempfile').gettempdir()+'/ship4'
export(out); print("Готово:", out)
