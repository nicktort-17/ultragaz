# УЛЬТРАГАЗ — стилизованное оружие, версия 2 (Blender 4.x / 5.x)
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

# ======================================================================
# 1. ШИПУЧКА — «Сифонный револьвер»
#    Барабан — шесть мини-баночек, ствол — полосатая гнущаяся трубочка,
#    курок — рычаг крана газировочного фонтана, рукоять — открывашка,
#    сбоку — прозрачная туба с запасом крышек-монеток.
# ======================================================================
def revolver():
    p = root("1 Шипучка — сифонный револьвер")
    box("Корпус-кран", (.05, .13, .075), (0, .01, 0), M["red"], p, bevel=.015)
    box("Хромовая накладка", (.054, .1, .02), (0, .0, .03), M["chrome"], p, bevel=.006)
    # трубочка-ствол: гармошка у основания + чередование красных и белых полос
    for i in range(5): tor(f"Гармошка трубочки {i+1}", .0135, .0035, (0, -.065 - i * .009, .022), M["cream"], p, (X, 0, 0))
    for i in range(9):
        cyl(f"Трубочка {i+1}", .012, .026, (0, -.12 - i * .026, .022), M["red"] if i % 2 == 0 else M["cream"], p, (X, 0, 0), v=24, bevel=0)
    tor("Срез трубочки", .012, .0025, (0, -.34, .022), M["cream"], p, (X, 0, 0))
    # барабан из 6 мини-баночек
    cyl("Ось барабана", .008, .085, (0, -.035, -.005), M["gold"], p, (X, 0, 0), v=16)
    for i in range(6):
        a = math.radians(60 * i + 30); x, z = math.cos(a) * .032, -.005 + math.sin(a) * .032
        cyl(f"Баночка {i+1}", .015, .062, (x, -.035, z), M["red"], p, (X, 0, 0), v=24, bevel=.002)
        cyl(f"Баночка {i+1} · крышка", .0135, .004, (x, -.067, z), M["chrome"], p, (X, 0, 0), v=24, bevel=0)
        cyl(f"Баночка {i+1} · дно", .0135, .004, (x, -.003, z), M["chrome"], p, (X, 0, 0), v=24, bevel=0)
        cyl(f"Баночка {i+1} · полоска", .0152, .008, (x, -.035, z), M["cream"], p, (X, 0, 0), v=24, bevel=0)
    # рычаг крана вместо курка
    box("Рычаг крана", (.012, .012, .09), (0, .075, .07), M["chrome"], p, rot=(math.radians(-30), 0, 0))
    sph("Набалдашник рычага", .018, (0, .1, .11), M["cream"], p)
    # рукоять-открывашка
    box("Рукоять", (.04, .05, .12), (0, .075, -.08), M["rubber"], p, rot=(math.radians(-15), 0, 0), bevel=.012)
    tor("Кольцо открывашки", .022, .006, (0, .1, -.155), M["chrome"], p, (0, X, 0))
    tor("Спусковая скоба", .024, .004, (0, .015, -.05), M["chrome"], p, (0, X, 0))
    # туба с запасом крышек
    cyl("Туба крышек", .036, .14, (.06, .07, -.075), M["pet"], p, (0, 0, 0), v=32, bevel=0)
    for i in range(7): cap(f"Запасная крышка {i+1}", (.06, .07, -.135 + i * .018), (0, 0, 0), p, 1.0)
    for i, (dx, dz, a) in enumerate([(0.0, .09, 25), (.04, .13, 70), (-.03, .16, 120)]):
        cap(f"Монетка в полёте {i+1}", (dx, -.38, dz), (math.radians(a), math.radians(a / 2), 0), p, 1.1)
    return p

# ======================================================================
# 2. ШЕЙКЕР — «Коктейльный обрез»
#    Ствольная коробка — барный шейкер, стволы — две стеклянные бутылки,
#    смотанные жёлтой изолентой, цевьё — кубик льда, приклад — деревянный
#    мадлер, патронташ — кубики льда.
# ======================================================================
BOTTLE = [(.0, .11), (.03, .11), (.032, .1), (.032, .0), (.03, -.03), (.016, -.07), (.012, -.1), (.012, -.13), (.015, -.135), (.015, -.145), (.0, -.145)]
def shotgun():
    p = root("2 Шейкер — коктейльный обрез")
    lathe("Шейкер", [(.0, .14), (.03, .14), (.036, .13), (.045, .1), (.05, .02), (.052, -.02), (.044, -.04), (.04, -.05), (.0, -.05)], M["chrome"], p)
    lathe("Крышка шейкера", [(.0, .2), (.012, .2), (.016, .185), (.03, .16), (.032, .14), (.0, .14)], M["chrome"], p)
    tor("Кольцо шейкера", .052, .004, (0, .0, 0), M["red"], p, (X, 0, 0))
    for s in (-1, 1):
        lathe(f"Бутылка-ствол {'Л' if s < 0 else 'П'}", [(r, y - .16) for r, y in BOTTLE], M["glass"], p, loc=(s * .034, 0, .018))
        lathe(f"Кола внутри {'Л' if s < 0 else 'П'}", [(r * .85, y - .16) for r, y in BOTTLE[1:6]], M["cola"], p, loc=(s * .034, 0, .018))
        cyl(f"Этикетка {'Л' if s < 0 else 'П'}", .0325, .06, (s * .034, -.17, .018), M["red"], p, (X, 0, 0), v=40, bevel=0)
        tor(f"Дуло {'Л' if s < 0 else 'П'}", .014, .004, (s * .034, -.305, .018), M["gold"], p, (X, 0, 0))
    for i, yy in enumerate((-.14, -.2)):
        box(f"Изолента {i+1}", (.14, .022, .072), (0, yy, .018), M["tape"], p, bevel=.02)
    box("Цевьё-кубик льда", (.06, .07, .05), (0, -.17, -.035), M["ice"], p, bevel=.008)
    # мадлер-приклад
    lathe("Мадлер-приклад", [(.0, .42), (.03, .42), (.034, .4), (.026, .36), (.018, .3), (.016, .2), (.022, .16), (.0, .16)], M["wood"], p, loc=(0, 0, -.02))
    for i in range(4): tor(f"Насечка мадлера {i+1}", .031, .003, (0, .41 - i * .006, -.02), M["dark"], p, (X, 0, 0))
    box("Рукоять", (.04, .05, .1), (0, .1, -.08), M["red"], p, rot=(math.radians(-20), 0, 0), bevel=.012)
    tor("Спусковая скоба", .026, .004, (0, .04, -.06), M["chrome"], p, (0, X, 0))
    for i in range(3): box(f"Патрон-льдинка {i+1}", (.024, .024, .024), (.06, .05 + i * .032, .0), M["ice"], p, rot=(.3 * i, .5, .2), bevel=.004)
    cap("Эмблема", (-.054, .05, .0), (0, -X, 0), p, .9)
    return p

# ======================================================================
# 3. МЕНТОС-ПУШКА — «Гейзер»
#    Ствол — двухлитровая ПЭТ-бутылка колы с «лепестковым» дном,
#    сверху магазин — рулончик ментоса, на дуле крышка-распылитель
#    и шапка пены, снизу — ручка велосипедного насоса.
# ======================================================================
def launcher():
    p = root("3 Ментос-пушка — гейзер")
    prof = [(.0, .3), (.05, .3), (.075, .28), (.085, .24), (.085, -.05), (.08, -.12), (.05, -.2), (.03, -.24), (.026, -.27), (.0, -.27)]
    lathe("ПЭТ-бутылка 2 л", prof, M["pet"], p)
    lathe("Кола внутри", [(.0, .27), (.075, .27), (.078, .24), (.078, -.05), (.07, -.1), (.0, -.1)], M["cola"], p)
    for i in range(5):  # лепестковое дно
        a = math.radians(72 * i + 36); sph(f"Лепесток дна {i+1}", .035, (math.cos(a) * .045, .3, math.sin(a) * .045), M["pet"], p, (1, .8, 1))
    for i in range(6): tor(f"Ребро бутылки {i+1}", .086, .003, (0, .2 - i * .045, 0), M["pet"], p, (X, 0, 0))
    cyl("Этикетка", .0865, .1, (0, .07, 0), M["red"], p, (X, 0, 0), v=48, bevel=0)
    cyl("Волна на этикетке", .087, .014, (0, .09, 0), M["cream"], p, (X, 0, 0), v=48, bevel=0)
    # крышка-распылитель и пена
    cyl("Крышка-распылитель", .032, .035, (0, -.285, 0), M["red"], p, (X, 0, 0), v=21, bevel=.002)
    for i in range(6):
        a = math.radians(60 * i); cyl(f"Отверстие {i+1}", .004, .004, (math.cos(a) * .015, -.303, math.sin(a) * .015), M["rubber"], p, (X, 0, 0), v=12, bevel=0)
    import random; random.seed(7)
    for i in range(14):
        a = random.uniform(0, 2 * math.pi); rr = random.uniform(.02, .045)
        sph(f"Пена {i+1}", random.uniform(.012, .022), (math.cos(a) * rr, -.3 + random.uniform(-.01, .02), math.sin(a) * rr), M["foam"], p)
    # магазин — рулон ментоса
    cyl("Обёртка ментоса", .022, .2, (0, .05, .11), M["mintpaper"], p, (X, 0, 0), v=32, bevel=.002)
    cyl("Полоса обёртки", .0225, .05, (0, .05, .11), M["cream"], p, (X, 0, 0), v=32, bevel=0)
    for i in range(4): sph(f"Ментос {i+1}", .02, (0, -.06 - i * .022, .11 - i * .012), M["mint"], p, (1, .45, 1))
    box("Скоба магазина", (.03, .03, .03), (0, .12, .09), M["dark"], p)
    box("Скоба магазина 2", (.03, .03, .03), (0, -.02, .09), M["dark"], p)
    sph("Прицел", .016, (0, .17, .145), M["glow"], p)
    # ручка насоса
    cyl("Шток насоса", .01, .1, (0, -.08, -.13), M["chrome"], p, v=16)
    cyl("Ручка насоса", .016, .12, (0, -.08, -.18), M["rubber"], p, (0, X, 0), v=20, bevel=.004)
    box("Рукоять", (.04, .05, .12), (0, .17, -.14), M["rubber"], p, rot=(math.radians(-15), 0, 0), bevel=.012)
    box("Хомут", (.18, .04, .02), (0, .17, -.085), M["dark"], p, bevel=.004)
    tor("Спусковая скоба", .026, .004, (0, .12, -.115), M["chrome"], p, (0, X, 0))
    return p

# ======================================================================
# 4. ГАЗЯВА — «Боевой сифон»
#    Старинный сифон для газировки, положенный набок: стеклянная бутылка с колой
#    в хромовой сетке служит баком, хромовая голова с рычагом — спусковым механизмом,
#    изогнутый носик — стволом, сзади вкручен золотой баллончик CO2.
# ======================================================================
def soda():
    p = root("4 Газява — боевой сифон")
    # бутылка-бак
    prof = [(.0, .27), (.045, .27), (.06, .26), (.066, .23), (.066, .02), (.06, -.01), (.045, -.03), (.03, -.04), (.0, -.04)]
    lathe("Бутылка сифона", prof, M["glass"], p)
    lathe("Кола внутри", [(.0, .255), (.058, .255), (.06, .23), (.06, .03), (.05, .0), (.0, .0)], M["cola"], p)
    import random; random.seed(3)
    for i in range(18):
        a = random.uniform(0, 2 * math.pi); rr = random.uniform(0, .045)
        sph(f"Пузырёк {i+1}", random.uniform(.004, .009), (math.cos(a) * rr, random.uniform(.03, .24), math.sin(a) * rr), M["ice"], p)
    # хромовая сетка вокруг бутылки
    for i in range(5): tor(f"Обруч сетки {i+1}", .068, .0025, (0, .23 - i * .05, 0), M["chrome"], p, (X, 0, 0))
    for i in range(10):
        a = math.radians(36 * i); cyl(f"Пруток сетки {i+1}", .0022, .22, (math.cos(a) * .068, .125, math.sin(a) * .068), M["chrome"], p, (X, 0, 0), v=8, bevel=0)
    cyl("Красный пояс", .069, .05, (0, .125, 0), M["red"], p, (X, 0, 0), v=48, bevel=0)
    cyl("Волна на поясе", .0695, .01, (0, .14, 0), M["cream"], p, (X, 0, 0), v=48, bevel=0)
    # задняя хромовая заглушка и баллончик CO2
    lathe("Задняя заглушка", [(.0, .31), (.03, .31), (.055, .295), (.068, .275), (.068, .26), (.0, .26)], M["chrome"], p)
    lathe("Баллончик CO₂", [(.0, .43), (.008, .43), (.016, .41), (.018, .38), (.018, .33), (.012, .31), (.0, .31)], M["gold"], p)
    tor("Резьба баллончика", .019, .003, (0, .32, 0), M["chrome"], p, (X, 0, 0))
    # хромовая голова
    lathe("Голова сифона", [(.0, -.03), (.038, -.03), (.044, -.06), (.042, -.1), (.034, -.13), (.0, -.13)], M["chrome"], p)
    tor("Кольцо головы", .045, .006, (0, -.045, 0), M["red"], p, (X, 0, 0))
    # изогнутый носик-ствол
    cyl("Носик", .014, .13, (0, -.18, -.012), M["chrome"], p, (math.radians(84), 0, 0), v=24, r2=.01)
    cyl("Дульце", .012, .02, (0, -.25, -.019), M["red"], p, (math.radians(84), 0, 0), v=24)
    for i in range(7):
        a = random.uniform(0, 2 * math.pi); rr = random.uniform(.0, .018)
        sph(f"Пена на носике {i+1}", random.uniform(.008, .014), (math.cos(a) * rr, -.265 + random.uniform(-.006, .006), -.02 + math.sin(a) * rr), M["foam"], p)
    # манометр сверху
    cyl("Шток манометра", .006, .03, (0, -.08, .05), M["chrome"], p, v=12)
    cyl("Манометр", .026, .016, (0, -.08, .072), M["gold"], p, (X, 0, 0), v=32)
    cyl("Шкала", .021, .017, (0, -.081, .072), M["cream"], p, (X, 0, 0), v=32, bevel=0)
    box("Стрелка", (.003, .002, .016), (0, -.09, .076), M["red"], p, rot=(0, math.radians(35), 0))
    # рычаг сифона — спуск, и рукоять
    box("Рычаг сифона", (.022, .012, .09), (0, -.085, -.07), M["chrome"], p, rot=(math.radians(18), 0, 0), bevel=.004)
    sph("Наконечник рычага", .011, (0, -.1, -.115), M["red"], p)
    box("Рукоять", (.045, .055, .13), (0, -.02, -.1), M["rubber"], p, rot=(math.radians(-12), 0, 0), bevel=.015)
    box("Крепление рукояти", (.05, .07, .02), (0, -.03, -.04), M["chrome"], p, bevel=.005)
    cap("Эмблема", (-.07, .125, .0), (0, -X, 0), p, .9)
    return p

guns = [revolver(), shotgun(), launcher(), soda()]
LAYOUT = [((-.45, 0, .95), 1.6), ((.5, 0, .95), 1.25), ((-.48, 0, .25), 1.05), ((.5, 0, .27), 1.45)]
for g, (loc, s) in zip(guns, LAYOUT):
    g.location = loc; g.rotation_euler = (0, 0, math.radians(68)); g.scale = (s, s, s)

# ---------- свет и камера ----------
bpy.context.view_layer.active_layer_collection = bpy.context.view_layer.layer_collection
world = bpy.data.worlds.new("Мир"); scene.world = world; world.use_nodes = True
bg = world.node_tree.nodes["Background"]; bg.inputs["Color"].default_value = (*srgb("#1b0608"), 1); bg.inputs["Strength"].default_value = .7
def light(n, loc, e, col, size):
    d = bpy.data.lights.new(n, 'AREA'); d.energy = e; d.color = col; d.size = size
    o = bpy.data.objects.new(n, d); scene.collection.objects.link(o); o.location = loc
    o.rotation_euler = (Vector((0, 0, .6)) - Vector(loc)).to_track_quat('-Z', 'Y').to_euler()
light("Ключевой", (1.3, -2.0, 2.0), 260, (1, .95, .9), 1.6)
light("Контровой красный", (-1.4, 1.6, 1.2), 320, (1, .25, .3), 1.4)
light("Заполняющий", (-1.2, -2.2, .3), 80, (1, .85, .7), 2.0)
for n, loc, col in (("Отражатель верх", (0, -.6, 2.4), "#fff4ea"), ("Отражатель фронт", (0, -2.4, 1.6), "#ffe2d6")):
    bpy.ops.mesh.primitive_plane_add(size=3.5, location=loc); o = bpy.context.object; o.name = n
    o.rotation_euler = (Vector((0, 0, .6)) - Vector(loc)).to_track_quat('Z', 'Y').to_euler()
    em = mat(n, col, 0, 1, emit=.9); o.data.materials.append(em); o.visible_camera = False
cd = bpy.data.cameras.new("Камера"); cd.lens = 40
cam = bpy.data.objects.new("Камера", cd); scene.collection.objects.link(cam); scene.camera = cam
cam.location = (.15, -3.0, .85); cam.rotation_euler = (Vector((0, 0, .6)) - cam.location).to_track_quat('-Z', 'Y').to_euler()
scene.view_settings.view_transform = 'Standard'

GAME_NAMES = ["shipuchka", "shaker", "mentos", "gazyava"]
def export(out, render=True, samples=64):
    os.makedirs(out, exist_ok=True)
    bpy.ops.wm.save_as_mainfile(filepath=os.path.join(out, "ultragaz_guns_v3.blend"))
    for g, gname in zip(guns, GAME_NAMES):
        keep = (g.location.copy(), g.rotation_euler.copy(), g.scale.copy())
        g.location = (0, 0, 0); g.rotation_euler = (0, 0, 0); g.scale = (1, 1, 1); bpy.context.view_layer.update()
        bpy.ops.object.select_all(action='DESELECT'); g.select_set(True)
        for c in g.children_recursive: c.select_set(True)
        bpy.ops.export_scene.gltf(filepath=os.path.join(out, gname + ".glb"), use_selection=True, export_apply=True)
        g.location, g.rotation_euler, g.scale = keep
    if render:
        scene.render.engine = 'CYCLES'; scene.cycles.device = 'CPU'; scene.cycles.samples = samples
        scene.render.resolution_x, scene.render.resolution_y = 1600, 900
        scene.render.filepath = os.path.join(out, "preview_v3.png"); bpy.ops.render.render(write_still=True)

if __name__ == "__main__":
    out = sys.argv[sys.argv.index("--") + 1] if "--" in sys.argv else os.path.join(os.path.expanduser("~"), "ultragaz_guns")
    export(out); print("Готово:", out)
