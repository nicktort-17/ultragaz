# Выполняется ВНУТРИ Blender (запускает glb_check.py):
#   blender -b --factory-startup -P bpy_glb_check.py -- <in.glb> <report.json> [--tris N] [--out clean.glb] [--render dir] [--minpart 0.004]
import bpy, bmesh, sys, json, os, math
from mathutils import Vector

argv = sys.argv[sys.argv.index('--') + 1:]
src, rep = argv[0], argv[1]
def opt(name, default=None, cast=str):
    return cast(argv[argv.index(name) + 1]) if name in argv else default
TRIS = opt('--tris', 0, int); OUT = opt('--out'); RDIR = opt('--render'); MINPART = opt('--minpart', .004, float)

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=src)
meshes = [o for o in bpy.context.scene.objects if o.type == 'MESH']

def tri_count(o):
    return sum(len(p.vertices) - 2 for p in o.data.polygons)

def analyze(o):
    bm = bmesh.new(); bm.from_mesh(o.data); bm.edges.ensure_lookup_table()
    nonman = sum(1 for e in bm.edges if len(e.link_faces) != 2)
    boundary = sum(1 for e in bm.edges if len(e.link_faces) == 1)
    # связные куски
    seen = set(); parts = []
    for f in bm.faces:
        if f.index in seen: continue
        stack = [f]; seen.add(f.index); n = 0
        while stack:
            c = stack.pop(); n += 1
            for e in c.edges:
                for g in e.link_faces:
                    if g.index not in seen: seen.add(g.index); stack.append(g)
        parts.append(n)
    bm.free()
    return dict(nonmanifold=nonman, boundary=boundary, parts=len(parts), part_faces=sorted(parts, reverse=True)[:8])

def bbox():
    mn = Vector((1e9,) * 3); mx = Vector((-1e9,) * 3)
    for o in meshes:
        for c in o.bound_box:
            w = o.matrix_world @ Vector(c); mn = Vector(map(min, mn, w)); mx = Vector(map(max, mx, w))
    return mn, mx

def report(stage):
    mn, mx = bbox()
    return dict(stage=stage, tris=sum(tri_count(o) for o in meshes), meshes=len(meshes),
                materials=len({m.name for o in meshes for m in o.data.materials if m}),
                images=[dict(name=i.name, size=list(i.size)) for i in bpy.data.images if i.size[0]],
                size=[round(v, 3) for v in (mx - mn)],
                objects=[dict(name=o.name, tris=tri_count(o), **analyze(o)) for o in meshes])

R = {'before': report('before')}

if OUT:
    for o in meshes:
        bm = bmesh.new(); bm.from_mesh(o.data)
        bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-5)
        # мусор: мелкие отдельные куски (< MINPART от граней объекта)
        total = len(bm.faces); seen = set(); kill = []
        for f in list(bm.faces):
            if f in seen: continue
            comp = []; stack = [f]; seen.add(f)
            while stack:
                c = stack.pop(); comp.append(c)
                for e in c.edges:
                    for g in e.link_faces:
                        if g not in seen: seen.add(g); stack.append(g)
            if len(comp) < max(4, total * MINPART): kill += comp
        if kill: bmesh.ops.delete(bm, geom=kill, context='FACES')
        bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
        bm.to_mesh(o.data); bm.free(); o.data.update()
    cur = sum(tri_count(o) for o in meshes)
    if TRIS and cur > TRIS:
        ratio = TRIS / cur
        for o in meshes:
            m = o.modifiers.new('dec', 'DECIMATE'); m.ratio = ratio; m.use_collapse_triangulate = True
            bpy.context.view_layer.objects.active = o
            with bpy.context.temp_override(object=o, active_object=o):
                bpy.ops.object.modifier_apply(modifier=m.name)
    for o in meshes:  # плоские грани — стиль low-poly
        for p in o.data.polygons: p.use_smooth = False
    R['after'] = report('after')
    bpy.ops.export_scene.gltf(filepath=OUT, export_format='GLB', export_image_format='AUTO', export_apply=True)

if RDIR:
    os.makedirs(RDIR, exist_ok=True)
    sc = bpy.context.scene; sc.render.engine = 'BLENDER_WORKBENCH'
    sh = sc.display.shading; sh.light = 'STUDIO'; sh.color_type = 'TEXTURE'; sh.show_cavity = False
    sc.render.resolution_x = sc.render.resolution_y = 768; sc.render.film_transparent = False
    w = bpy.data.worlds.new('bg'); w.color = (.42, .42, .42); sc.world = w
    try: sc.display_settings.display_device = 'sRGB'; sc.view_settings.view_transform = 'Standard'
    except Exception: pass
    mn, mx = bbox(); ctr = (mn + mx) / 2; ext = max(mx - mn)
    cam_d = bpy.data.cameras.new('cam'); cam_d.type = 'ORTHO'; cam_d.ortho_scale = ext * 1.15
    cam = bpy.data.objects.new('cam', cam_d); sc.collection.objects.link(cam); sc.camera = cam
    # glTF: +Y вверх → в Blender +Z вверх, «перед» модели смотрит в -Y
    for name, ang in (('front', 0), ('left', 90), ('back', 180), ('right', -90)):  # left = камера с левого бока модели (+X)
        a = math.radians(ang); d = Vector((math.sin(a), -math.cos(a), 0)) * ext * 3
        cam.location = ctr + d
        cam.rotation_euler = (ctr - cam.location).to_track_quat('-Z', 'Y').to_euler()
        sc.render.filepath = os.path.join(RDIR, name + '.png')
        bpy.ops.render.render(write_still=True)
    R['renders'] = RDIR

json.dump(R, open(rep, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
