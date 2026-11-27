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

