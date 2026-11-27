import os,sys;sys.path.insert(0,os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'));from ugenv import *  # пути окружения
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
    cyl("Хомут бутылки", .0345, .014, (0, -.02, BZ), M["gray"], p, (X, 0, 0), v=40, bevel=.002)
    # --- механизм: серый корпус с поперечным барабаном-карбонатором ---
    box("Корпус механизма", (.056, .1, .088), (0, .012, .004), M["gray"], p, bevel=.012)
    box("Верхняя планка", (.024, .13, .012), (0, .0, .056), M["gray2"], p, bevel=.003)
    box("Красная вставка планки", (.008, .07, .003), (0, .0, .0625), M["red"], p, bevel=.001)
    box("Мушка", (.006, .01, .01), (0, -.06, .064), M["gray2"], p, bevel=.002)
    box("Целик", (.022, .008, .012), (0, .075, .066), M["gray2"], p, bevel=.002)
    cyl("Ось барабана", .006, .084, (0, .012, .002), M["gray2"], p, (0, X, 0), v=16, bevel=0)
    cyl("Барабан", .041, .068, (0, .012, .002), M["gray"], p, (0, X, 0), v=48, bevel=.004)
    for s in (-1, 1):
        sd = "Л" if s < 0 else "П"
        tor(f"Обод барабана {sd}", .036, .0025, (s * .035, .012, .002), M["gray2"], p, (0, X, 0))
        for k in range(6):
            a = 2 * math.pi * k / 6
            cyl(f"Барабан · заклёпка {sd}{k+1}", .0042, .004, (s * .0355, .012 + .026 * math.cos(a), .002 + .026 * math.sin(a)), M["gray2"], p, (0, X, 0), v=12, bevel=.001)
        box(f"Красная вставка {sd}", (.004, .046, .016), (s * .0335, .006, -.004), M["red"], p, bevel=.004)
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
    arc_shell("Красная обечайка", .0498, .07, .145, 25, 155, M["red"], p, cz=.008)
    for s in (-1, 1):
        sd = "Л" if s < 0 else "П"
        cyl(f"Порт бака {sd}", .0115, .004, (s * .049, .118, -.012), M["face"], p, (0, X, 0), v=32, bevel=.0015)
        tor(f"Кольцо порта {sd}", .0115, .0018, (s * .0505, .118, -.012), M["gray2"], p, (0, X, 0))
    cyl("Задняя крышка", .046, .012, (0, .174, .008), M["white"], p, (X, 0, 0), v=48, bevel=.005)
    tor("Обод задней крышки", .047, .003, (0, .169, .008), M["gray2"], p, (X, 0, 0))
    # --- курок сзади сверху ---
    box("Курок", (.012, .012, .03), (0, .17, .056), M["gray2"], p, rot=(math.radians(25), 0, 0), bevel=.003)
    box("Курок · спица", (.016, .008, .006), (0, .176, .07), M["red"], p, bevel=.002)
    # --- нижний белый короб под бутылкой и сопло ---
    box("Нижний короб", (.05, .15, .036), (0, -.075, -.04), M["white"], p, bevel=.006)
    cyl("Нижнее сопло", .0095, .022, (0, -.158, -.042), M["white"], p, (X, 0, 0), v=28, bevel=.002)
    tor("Кольцо нижнего сопла", .0095, .0022, (0, -.169, -.042), M["gray2"], p, (X, 0, 0))
    cyl("Канал нижнего сопла", .0055, .004, (0, -.17, -.042), M["bore"], p, (X, 0, 0), v=16, bevel=0)
    # --- рама, спуск, скоба ---
    box("Рама", (.04, .25, .016), (0, -.03, -.066), M["gray2"], p, bevel=.004)
    box("Рама · стойка", (.036, .03, .03), (0, .07, -.052), M["gray2"], p, bevel=.004)
    cu = [(0, .015, -.074), (0, .015, -.098), (0, .03, -.112), (0, .07, -.11), (0, .088, -.09)]
    hose("Спусковая скоба", cu, .0045, M["gray2"], p)
    box("Спусковой крючок", (.008, .008, .026), (0, .045, -.083), M["gray"], p, rot=(math.radians(-18), 0, 0), bevel=.003)
    # --- прозрачный магазин с крышками ---
    box("Магазин", (.046, .085, .046), (0, -.075, -.098), M["pet"], p, bevel=.005)
    box("Магазин · крышка", (.048, .087, .005), (0, -.075, -.0755), M["gray2"], p, bevel=.002)
    for i in range(4):
        cap(f"Запасная крышка {i+1}", (-.012 + (i % 2) * .022, -.105 + i * .019, -.116 + (i % 2) * .004), (math.radians(8 * i - 10), math.radians(6 * i), 0), p, .85)
    # --- рукоять: кожаная, с пальцевыми выемками, наклон назад ---
    secs = []
    top = Vector((0, .1, -.06)); bot = Vector((0, .135, -.178)); N = 14
    for k in range(N):
        t = k / (N - 1); c = top.lerp(bot, t)
        groove = .0045 * (.5 - .5 * math.cos(t * 2 * math.pi * 3)) if .08 < t < .9 else 0
        secs.append(rrect(c.x, c.y, c.z, .0175, .027 + .003 * math.sin(t * math.pi), 3.2, 28, front=-groove))
    loft("Рукоять", secs, M["leather"], p)
    for k, t in enumerate((.25, .58)):
        c = top.lerp(bot, t); box(f"Насечка рукояти {k+1}", (.037, .03, .02), (0, c.y + .006, c.z), M["leather"], p, bevel=.004).scale = (1, 1, .35)
    box("Затыльник рукояти", (.04, .062, .016), (0, .138, -.186), M["gray2"], p, rot=(math.radians(-14), 0, 0), bevel=.005)
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

def export(out, render=True):
    os.makedirs(out, exist_ok=True)
    bpy.ops.wm.save_as_mainfile(filepath=os.path.join(out, "shipuchka_v4.blend"))
    bpy.ops.object.select_all(action='DESELECT'); gun.select_set(True)
    for c in gun.children_recursive: c.select_set(True)
    bpy.ops.export_scene.gltf(filepath=os.path.join(out, "shipuchka.gltf"), export_format='GLTF_EMBEDDED', use_selection=True, export_apply=True)
    if render:
        scene.render.engine = 'CYCLES'; scene.cycles.device = 'CPU'; scene.cycles.samples = 24
        scene.render.resolution_x, scene.render.resolution_y = 700, 520; scene.render.film_transparent = False
        views = {"left": ((-1, 0, 0)), "right": ((1, 0, 0)), "top": ((0, 0, 1)), "bottom": ((0, 0, -1)), "front": ((0, -1, 0)), "back": ((0, 1, 0)), "persp": ((-.7, -.6, .45))}
        for name, d in views.items():
            dv = Vector(d).normalized(); c = Vector((0, -.01, -.04))
            cam.location = c + dv * 1.0; up = 'Y' if abs(dv.z) > .9 else 'Y'
            cam.rotation_euler = (c - cam.location).to_track_quat('-Z', 'Z' if abs(dv.z) < .9 else 'Y').to_euler()
            cd.ortho_scale = .5 if name not in ("front", "back") else .32
            scene.render.filepath = os.path.join(out, f"v_{name}.png"); bpy.ops.render.render(write_still=True)

out = sys.argv[sys.argv.index("--") + 1] if "--" in sys.argv else TMP+"/ship4"
export(out); print("Готово:", out)
