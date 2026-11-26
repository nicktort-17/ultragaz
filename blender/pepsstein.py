# ПЕПСШТЕЙН — «Последний акционер»: старик-хост и три фазы его меха в гранёном low-poly стиле референсов.
# Запуск: python3 pepsstein.py <out_dir> [превью: строка из h,1,2,3]
# Blender: вперёд = −Y, вверх = +Z, метры. Каждая подвижная деталь — свой объект с началом в точке шарнира;
# имена узлов (H_*, P1_*, P2_*, P3_*) читает игра (parts/pep.js). Ноги — канонические: бедро вдоль +X,
# голень вдоль −Z от колена, поэтому одну и ту же 2-звенную IK можно применять к любой ноге.
import bpy, bmesh, math, os, sys, random
from mathutils import Vector as V, Matrix, Euler, Quaternion

OUT = sys.argv[1] if len(sys.argv) > 1 else '/tmp/pep'
VIEWS = sys.argv[2] if len(sys.argv) > 2 else ''
os.makedirs(OUT, exist_ok=True)
random.seed(134)
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
PI = math.pi
D2R = PI / 180


# ---------------------------------------------------------------- материалы
def srgb(h):
    h = h.lstrip('#'); c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple(x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in c)

MATS = {}
NOJIT = {'gold', 'glow', 'eye', 'gem', 'glass', 'screen', 'mouth'}

def _sock(coll, ident):
    for s in coll:
        if s.identifier == ident: return s
    return None

def mat(name, hexc, metal=0.0, rough=.6, emit=0.0, alpha=1.0):
    m = bpy.data.materials.new(name); m.use_nodes = True
    nt = m.node_tree; b = nt.nodes['Principled BSDF']; c = srgb(hexc)
    b.inputs['Base Color'].default_value = (*c, 1)
    b.inputs['Metallic'].default_value = metal; b.inputs['Roughness'].default_value = rough
    if emit:
        b.inputs['Emission Color'].default_value = (*c, 1); b.inputs['Emission Strength'].default_value = emit
    if alpha < 1:
        b.inputs['Alpha'].default_value = alpha
        try: m.surface_render_method = 'BLENDED'
        except Exception: pass
    if name not in NOJIT:
        vc = nt.nodes.new('ShaderNodeVertexColor'); vc.layer_name = 'Color'
        mx = nt.nodes.new('ShaderNodeMix'); mx.data_type = 'RGBA'; mx.blend_type = 'MULTIPLY'
        _sock(mx.inputs, 'Factor_Float').default_value = 1
        _sock(mx.inputs, 'A_Color').default_value = (*c, 1)
        nt.links.new(vc.outputs['Color'], _sock(mx.inputs, 'B_Color'))
        nt.links.new(_sock(mx.outputs, 'Result_Color'), b.inputs['Base Color'])
    MATS[name] = m; return m

mat('navy', '#2b2f72', .1, .55); mat('red', '#b8162d', .05, .5); mat('cream', '#dcc6ae', 0, .62)
mat('gold', '#d9a53b', .95, .3); mat('metal', '#9a9ca6', .8, .35); mat('gun', '#55545f', .75, .4)
mat('dark', '#2c2b36', .5, .55); mat('skin', '#c79c86', 0, .7); mat('hair', '#c8c2d2', 0, .8)
mat('velvet', '#7a1223', 0, .85); mat('banner', '#8e1628', 0, .8); mat('glow', '#ff2a1c', 0, .4, emit=7)
mat('eye', '#ff3a22', 0, .3, emit=3); mat('gem', '#ff1636', .2, .15, emit=3); mat('glass', '#ff3434', 0, .05, alpha=.32)
mat('screen', '#ff2a1c', 0, .5, emit=4); mat('mouth', '#2a0909', 0, .9); mat('cableR', '#c41a2c', .1, .45)
mat('cableB', '#2a4cc0', .1, .45)


# ---------------------------------------------------------------- примитивы (вершины, грани) в своих координатах
def TRS(loc=(0, 0, 0), rot=(0, 0, 0), sc=None):
    M = Matrix.Translation(V(loc)) @ Euler(rot, 'XYZ').to_matrix().to_4x4()
    if sc is not None:
        if isinstance(sc, (int, float)): sc = (sc, sc, sc)
        M = M @ Matrix.Diagonal((sc[0], sc[1], sc[2], 1))
    return M

def box(sx, sy, sz, tx=1, ty=1, ox=0, oy=0, bx=1, by=1):
    """Коробка по центру; низ масштабирован (bx,by), верх (tx,ty) и сдвинут на (ox,oy)."""
    hx, hy, hz = sx / 2, sy / 2, sz / 2
    v = [(-hx * bx, -hy * by, -hz), (hx * bx, -hy * by, -hz), (hx * bx, hy * by, -hz), (-hx * bx, hy * by, -hz),
         (-hx * tx + ox, -hy * ty + oy, hz), (hx * tx + ox, -hy * ty + oy, hz), (hx * tx + ox, hy * ty + oy, hz), (-hx * tx + ox, hy * ty + oy, hz)]
    return v, [(0, 3, 2, 1), (4, 5, 6, 7), (0, 1, 5, 4), (1, 2, 6, 5), (2, 3, 7, 6), (3, 0, 4, 7)]

def prism(pts, d, back=None):
    """Плоский многоугольник (x,z) толщиной d по Y (перед на −d/2). back — масштаб задней грани."""
    n = len(pts); bs = back or 1
    v = [(x, -d / 2, z) for x, z in pts] + [(x * bs, d / 2, z * bs) for x, z in pts]
    f = [tuple(range(n)), tuple(range(2 * n - 1, n - 1, -1))]
    for i in range(n):
        j = (i + 1) % n; f.append((i, n + i, n + j, j))
    return v, f

def cyl(r1, r2, h, n=8, a0=None):
    """Цилиндр/усечённый конус вдоль Z, от −h/2 (r1) до h/2 (r2)."""
    a0 = PI / n if a0 is None else a0
    if r2 <= 1e-5:
        v = [(r1 * math.cos(a0 + 2 * PI * i / n), r1 * math.sin(a0 + 2 * PI * i / n), -h / 2) for i in range(n)] + [(0, 0, h / 2)]
        f = [tuple(range(n - 1, -1, -1))] + [(i, (i + 1) % n, n) for i in range(n)]
        return v, f
    v = [(r1 * math.cos(a0 + 2 * PI * i / n), r1 * math.sin(a0 + 2 * PI * i / n), -h / 2) for i in range(n)]
    v += [(r2 * math.cos(a0 + 2 * PI * i / n), r2 * math.sin(a0 + 2 * PI * i / n), h / 2) for i in range(n)]
    f = [tuple(range(n - 1, -1, -1)), tuple(range(n, 2 * n))] + [(i, (i + 1) % n, n + (i + 1) % n, n + i) for i in range(n)]
    return v, f

def sphere(nu=8, nv=6):
    v = [(0, 0, -1)]
    for j in range(1, nv):
        t = -PI / 2 + PI * j / nv
        for i in range(nu):
            a = 2 * PI * i / nu; v.append((math.cos(t) * math.cos(a), math.cos(t) * math.sin(a), math.sin(t)))
    v.append((0, 0, 1)); top = len(v) - 1; f = []
    for i in range(nu): f.append((0, 1 + (i + 1) % nu, 1 + i))
    for j in range(nv - 2):
        a, b = 1 + j * nu, 1 + (j + 1) * nu
        for i in range(nu): f.append((a + i, a + (i + 1) % nu, b + (i + 1) % nu, b + i))
    a = 1 + (nv - 2) * nu
    for i in range(nu): f.append((a + i, a + (i + 1) % nu, top))
    return v, f

def lathe(prof, n=10, a0=0):
    """Тело вращения вокруг Z; prof = [(r, z)] снизу вверх."""
    rings = []; v = []; f = []
    for r, z in prof:
        if r < 1e-5: rings.append([len(v)]); v.append((0, 0, z)); continue
        rings.append(list(range(len(v), len(v) + n)))
        for i in range(n):
            a = a0 + 2 * PI * i / n; v.append((r * math.cos(a), r * math.sin(a), z))
    for A, B in zip(rings, rings[1:]):
        if len(A) == 1 and len(B) == 1: continue
        if len(A) == 1:
            for i in range(n): f.append((A[0], B[i], B[(i + 1) % n]))
        elif len(B) == 1:
            for i in range(n): f.append((A[i], A[(i + 1) % n], B[0]))
        else:
            for i in range(n): f.append((A[i], A[(i + 1) % n], B[(i + 1) % n], B[i]))
    if len(rings[0]) > 1: f.append(tuple(reversed(rings[0])))
    if len(rings[-1]) > 1: f.append(tuple(rings[-1]))
    return v, f

def torus(R, r, n1=16, n2=6, arc=2 * PI, a0=0):
    v = []; f = []; full = arc >= 2 * PI - 1e-6; m1 = n1 if full else n1 + 1
    for i in range(m1):
        a = a0 + arc * i / n1
        for j in range(n2):
            b = 2 * PI * j / n2; rr = R + r * math.cos(b)
            v.append((rr * math.cos(a), rr * math.sin(a), r * math.sin(b)))
    for i in range(n1 if full else n1):
        i2 = (i + 1) % m1
        for j in range(n2):
            j2 = (j + 1) % n2; f.append((i * n2 + j, i2 * n2 + j, i2 * n2 + j2, i * n2 + j2))
    if not full:
        f.append(tuple(range(n2))[::-1]); f.append(tuple((m1 - 1) * n2 + j for j in range(n2)))
    return v, f

def hull(pts):
    bm = bmesh.new(); vs = [bm.verts.new(p) for p in pts]
    bmesh.ops.convex_hull(bm, input=vs)
    for x in [x for x in bm.verts if not x.link_faces]: bm.verts.remove(x)
    bm.verts.index_update()
    v = [tuple(x.co) for x in bm.verts]; f = [tuple(x.index for x in fc.verts) for fc in bm.faces]; bm.free(); return v, f

def catmull(pts, k=4):
    P = [V(p) for p in pts]
    if len(P) < 3: return P
    out = []
    for i in range(len(P) - 1):
        p0 = P[i - 1] if i > 0 else P[i] * 2 - P[i + 1]; p1, p2 = P[i], P[i + 1]
        p3 = P[i + 2] if i + 2 < len(P) else P[i + 1] * 2 - P[i]
        for s in range(k):
            t = s / k; t2, t3 = t * t, t * t * t
            out.append(0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3))
    out.append(P[-1]); return out

def tube(pts, r, n=6, k=4, r2=None):
    P = catmull(pts, k); v = []; f = []; N = len(P); prev = None
    for i, p in enumerate(P):
        t = (P[min(i + 1, N - 1)] - P[max(i - 1, 0)]).normalized()
        if prev is None:
            ref = V((0, 0, 1)) if abs(t.z) < .9 else V((1, 0, 0)); nn = t.cross(ref).normalized()
        else:
            nn = (prev - t * prev.dot(t)).normalized()
        prev = nn; bb = t.cross(nn); rr = r if r2 is None else r + (r2 - r) * i / (N - 1)
        for j in range(n):
            a = 2 * PI * j / n; v.append(tuple(p + (nn * math.cos(a) + bb * math.sin(a)) * rr))
    for i in range(N - 1):
        for j in range(n): f.append((i * n + j, i * n + (j + 1) % n, (i + 1) * n + (j + 1) % n, (i + 1) * n + j))
    f.append(tuple(range(n))[::-1]); f.append(tuple((N - 1) * n + j for j in range(n)))
    return v, f

def bevel(vf, w):
    v, f = vf; bm = bmesh.new(); bv = [bm.verts.new(p) for p in v]
    for fc in f:
        try: bm.faces.new([bv[i] for i in fc])
        except ValueError: pass
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    try:
        bmesh.ops.bevel(bm, geom=bm.edges[:], offset=w, offset_type='OFFSET', segments=1, profile=.5, affect='EDGES', clamp_overlap=True)
    except TypeError:
        bmesh.ops.bevel(bm, geom=bm.edges[:], offset=w, segments=1, profile=.5, affect='EDGES', clamp_overlap=True)
    bm.verts.index_update()
    v = [tuple(x.co) for x in bm.verts]; f = [tuple(x.index for x in fc.verts) for fc in bm.faces]; bm.free(); return v, f


# ---------------------------------------------------------------- метаболы → гранёный «скульпт» (как на референсах)
MBK = 1 / 0.575
_mbn = [0]
class MB:
    def __init__(s, res=.004, thr=.6):
        _mbn[0] += 1; s.name = 'mbx%d' % _mbn[0]; s.mb = bpy.data.metaballs.new(s.name); s.mb.resolution = res; s.mb.render_resolution = res; s.mb.threshold = thr
        s.ob = bpy.data.objects.new(s.name, s.mb); bpy.context.scene.collection.objects.link(s.ob)
    def ball(s, c, R, neg=False, st=2.0):
        e = s.mb.elements.new(type='BALL'); e.co = c; e.radius = R * MBK; e.stiffness = st; e.use_negative = neg; return e
    def ell(s, c, R3, neg=False, st=2.0, rot=None):
        e = s.mb.elements.new(type='ELLIPSOID'); e.co = c; m = max(R3); e.radius = m * MBK; e.size_x = R3[0] / m; e.size_y = R3[1] / m; e.size_z = R3[2] / m; e.stiffness = st; e.use_negative = neg
        if rot is not None: e.rotation = rot
        return e
    def cap(s, a, b, R, neg=False, st=2.0):
        a = V(a); b = V(b); d = b - a; L = d.length; e = s.mb.elements.new(type='CAPSULE'); e.co = (a + b) / 2; e.radius = R * MBK; e.size_x = max(1e-4, L / 2); e.stiffness = st; e.use_negative = neg
        e.rotation = V((1, 0, 0)).rotation_difference(d.normalized()) if L > 1e-6 else Quaternion(); return e
    def mesh(s, ratio=.08):
        dg = bpy.context.evaluated_depsgraph_get(); me = bpy.data.meshes.new_from_object(s.ob.evaluated_get(dg))
        bpy.data.objects.remove(s.ob); bpy.data.metaballs.remove(s.mb)
        if ratio < 1:
            o = bpy.data.objects.new('tmpdec', me); bpy.context.scene.collection.objects.link(o)
            md = o.modifiers.new('d', 'DECIMATE'); md.decimate_type = 'COLLAPSE'; md.ratio = ratio; md.use_collapse_triangulate = True
            dg = bpy.context.evaluated_depsgraph_get(); me2 = bpy.data.meshes.new_from_object(o.evaluated_get(dg))
            bpy.data.objects.remove(o); bpy.data.meshes.remove(me); me = me2
        v = [tuple(x.co) for x in me.vertices]; f = [tuple(p.vertices) for p in me.polygons]; bpy.data.meshes.remove(me); return v, f

def decimate(vf, ratio):
    v, f = vf; me = bpy.data.meshes.new('dec'); me.from_pydata(v, [], f); me.update()
    o = bpy.data.objects.new('tmpdec', me); bpy.context.scene.collection.objects.link(o)
    md = o.modifiers.new('d', 'DECIMATE'); md.decimate_type = 'COLLAPSE'; md.ratio = ratio; md.use_collapse_triangulate = True
    dg = bpy.context.evaluated_depsgraph_get(); me2 = bpy.data.meshes.new_from_object(o.evaluated_get(dg))
    bpy.data.objects.remove(o); bpy.data.meshes.remove(me)
    v = [tuple(x.co) for x in me2.vertices]; f = [tuple(p.vertices) for p in me2.polygons]; bpy.data.meshes.remove(me2); return v, f

def band_mat(bands, a):
    for edge, m in bands:
        if a <= edge + 1e-6: return m
    return bands[-1][1]

def band_angles(bands, step=11.0):
    pos = [0.0]
    for edge, _ in bands:
        prev = pos[-1]; n = max(1, int(math.ceil((edge - prev) / step)))
        for i in range(1, n + 1): pos.append(prev + (edge - prev) * i / n)
    return pos

def ring_loft(rings, bands, cap_bottom=True, cap_top=False, step=11.0):
    """Мантия-лофт: rings=[(z, cy, rx, ryf, ryb, ex)], углы φ от переда (−Y) к спине (+Y) по обе стороны; материал по |φ|."""
    pos = band_angles(bands, step)
    full = [-a for a in reversed(pos) if 0 < a < 180] + [a for a in pos if a < 180]
    full = [-180.0] + full if full[0] != -180 else full
    N = len(full); v = []; f = []; fm = []
    for (z, cy, rx, ryf, ryb, ex) in rings:
        for p in full:
            t = math.radians(p); sx = math.sin(t); cz = math.cos(t)
            ax = math.copysign(abs(sx) ** (2 / ex), sx); ay = math.copysign(abs(cz) ** (2 / ex), cz)
            ry = ryf if ay > 0 else ryb
            v.append((rx * ax, cy - ry * ay, z))
    for r in range(len(rings) - 1):
        for i in range(N):
            j = (i + 1) % N; mid = full[i] + ((full[j] if j else 180.0) - full[i]) / 2
            f.append((r * N + i, r * N + j, (r + 1) * N + j, (r + 1) * N + i)); fm.append(band_mat(bands, abs(mid)))
    if cap_bottom: f.append(tuple(range(N))[::-1]); fm.append(bands[0][1])
    if cap_top: b = (len(rings) - 1) * N; f.append(tuple(b + i for i in range(N))); fm.append(bands[0][1])
    return v, f, fm

def sheet(G, t, matf):
    """Лист ткани с толщиной: G[j][i] — точки (j вдоль, i поперёк); matf(i,j) — материал квада."""
    nj, ni = len(G), len(G[0]); P = [[V(p) for p in row] for row in G]; Nn = []
    for j in range(nj):
        row = []
        for i in range(ni):
            du = P[j][min(i + 1, ni - 1)] - P[j][max(i - 1, 0)]; dv = P[min(j + 1, nj - 1)][i] - P[max(j - 1, 0)][i]
            n = du.cross(dv); row.append(n.normalized() if n.length > 1e-9 else V((0, 0, 1)))
        Nn.append(row)
    v = []; f = []; fm = []
    for j in range(nj):
        for i in range(ni): v.append(tuple(P[j][i] + Nn[j][i] * t / 2))
    for j in range(nj):
        for i in range(ni): v.append(tuple(P[j][i] - Nn[j][i] * t / 2))
    off = nj * ni; idx = lambda j, i: j * ni + i
    for j in range(nj - 1):
        for i in range(ni - 1):
            m = matf(i, j); f.append((idx(j, i), idx(j, i + 1), idx(j + 1, i + 1), idx(j + 1, i))); fm.append(m)
            f.append((off + idx(j, i), off + idx(j + 1, i), off + idx(j + 1, i + 1), off + idx(j, i + 1))); fm.append(m)
    for j in range(nj - 1):
        for i in (0, ni - 1):
            a, b = idx(j, i), idx(j + 1, i); f.append((a, b, off + b, off + a) if i == 0 else (a, off + a, off + b, b)); fm.append(matf(min(i, ni - 2), j))
    for i in range(ni - 1):
        for j in (0, nj - 1):
            a, b = idx(j, i), idx(j, i + 1); f.append((a, off + a, off + b, b) if j == 0 else (a, b, off + b, off + a)); fm.append(matf(i, min(j, nj - 2)))
    return v, f, fm

def tube_loft(path, radii, mats, n=10, droop=None, k=3):
    """Рукав: кольца вдоль пути, радиусы, провисание нижней половины (droop) и материал по кольцу."""
    P = catmull(path, k) if len(path) > 2 else [V(p) for p in path]; m = len(P)
    rr = [radii[0] + (radii[-1] - radii[0]) * 0 for _ in range(m)]
    def lerp_list(L, u):
        x = u * (len(L) - 1); i = min(int(x), len(L) - 2); t = x - i; return L[i] * (1 - t) + L[i + 1] * t
    v = []; f = []; fm = []; prev = None
    for i, p in enumerate(P):
        u = i / (m - 1); t = (P[min(i + 1, m - 1)] - P[max(i - 1, 0)]).normalized()
        if prev is None:
            ref = V((0, 0, 1)) if abs(t.z) < .9 else V((1, 0, 0)); nn = t.cross(ref).normalized()
        else: nn = (prev - t * prev.dot(t)).normalized()
        prev = nn; bb = t.cross(nn); r = lerp_list(radii, u); dr = lerp_list(droop, u) if droop else 0
        for j in range(n):
            a = 2 * PI * j / n; q = p + (nn * math.cos(a) + bb * math.sin(a)) * r
            if dr and q.z < p.z: q = q + V((0, 0, -dr * (p.z - q.z) / max(r, 1e-6)))
            v.append(tuple(q))
    for i in range(m - 1):
        u = (i + .5) / (m - 1); mt = mats[min(len(mats) - 1, int(u * len(mats)))]
        for j in range(n): f.append((i * n + j, i * n + (j + 1) % n, (i + 1) * n + (j + 1) % n, (i + 1) * n + j)); fm.append(mt)
    f.append(tuple(range(n))[::-1]); fm.append(mats[0])
    # тёмная подкладка, утопленная внутрь рукава
    c = P[-1] - (P[-1] - P[-2]).normalized() * .035; base = len(v); last = v[(m - 1) * n:(m) * n]
    for q in last: v.append(tuple(c + (V(q) - P[-1]) * .82))
    f.append(tuple(base + j for j in range(n))); fm.append('dark')
    for j in range(n): f.append(((m - 1) * n + j, (m - 1) * n + (j + 1) % n, base + (j + 1) % n, base + j)); fm.append('navy')
    return v, f, fm

# ---------------------------------------------------------------- детали-объекты (накопители геометрии)
ACC = {}; ORDER = []

class Acc:
    def __init__(s, name, parent=None, loc=(0, 0, 0), rot=(0, 0, 0), W=None):
        s.name = name; s.parent = parent
        s.W = W if W is not None else TRS(loc, rot)
        s.V = []; s.F = []; s.FM = []; s.mats = []; s.UV = []; s.obj = None; s.norecalc = False
        ACC[name] = s; ORDER.append(s)

    def mi(s, m):
        if m not in s.mats: s.mats.append(m)
        return s.mats.index(m)

    def add(s, vf, m, M=None, local=False, bev=0, uv=None):
        v, f = vf
        if bev: v, f = bevel((v, f), bev)
        M = M if M is not None else Matrix()
        Mw = M if local else s.W.inverted() @ M
        base = len(s.V); mi = s.mi(m)
        for p in v: s.V.append(tuple(Mw @ V(p)))
        for i, fc in enumerate(f):
            s.F.append(tuple(base + k for k in fc)); s.FM.append(mi); s.UV.append(uv[i] if uv else None)
        return s

    def addm(s, v, f, fm, M=None, local=False, uv=None):
        M = M if M is not None else Matrix()
        Mw = M if local else s.W.inverted() @ M
        base = len(s.V)
        for p in v: s.V.append(tuple(Mw @ V(p)))
        for i, fc in enumerate(f):
            s.F.append(tuple(base + k for k in fc)); s.FM.append(s.mi(fm[i])); s.UV.append(uv[i] if uv else None)
        return s

    def world(s, p):
        return s.W @ V(p)

def A(name): return ACC[name]


# ---------------------------------------------------------------- общие узоры
def emblem(a, O, u, vv, n, sc, mt='gold', d=None):
    """Герб: золотой силуэт небоскрёбов-столбиков в лавровом венке (без чужих логотипов)."""
    O, u, vv, n = V(O), V(u).normalized(), V(vv).normalized(), V(n).normalized(); d = d or .045 * sc

    def flat(pts, z0=0.0, dd=None):
        dd = dd or d; P = [O + u * x * sc + vv * y * sc + n * z0 for x, y in pts]; m = len(P)
        vs = [tuple(p) for p in P] + [tuple(p + n * dd) for p in P]
        fs = [tuple(range(m))[::-1], tuple(range(m, 2 * m))] + [(i, (i + 1) % m, m + (i + 1) % m, m + i) for i in range(m)]
        a.add((vs, fs), mt)

    for x, h in ((-.24, .34), (-.12, .5), (0, .62), (.12, .5), (.24, .34)):
        flat([(x - .045, -.16), (x + .045, -.16), (x + .045, -.16 + h), (x - .045, -.16 + h)], 0, d * 1.3)
        for wy in range(int(h / .11)):
            y0 = -.12 + wy * .11
            flat([(x - .022, y0), (x + .022, y0), (x + .022, y0 + .05), (x - .022, y0 + .05)], d * 1.3, d * .25)
    flat([(-.012, .46), (.012, .46), (0, .64)], 0, d * 1.3)
    flat([(-.34, -.2), (.34, -.2), (.34, -.16), (-.34, -.16)], 0, d)
    for sg in (-1, 1):
        for i in range(7):
            ph = (-75 + i * 20) * D2R
            cx, cy = sg * .45 * math.cos(ph), .18 + .45 * math.sin(ph)
            t = V((-sg * math.sin(ph), math.cos(ph))); nr = V((sg * math.cos(ph), math.sin(ph)))
            dd = (t + nr * .45).normalized(); pp = V((-dd.y, dd.x)); L, W = .085, .03
            flat([(cx - dd.x * L, cy - dd.y * L), (cx + pp.x * W, cy + pp.y * W), (cx + dd.x * L, cy + dd.y * L), (cx - pp.x * W, cy - pp.y * W)], 0, d)


def chunk(sz, cut=.2, jit=.03, top=(1, 1), seed=None, taper_y=1.0):
    """Гранёная плита-«скол» как на референсах: выпуклая оболочка коробки со срезанными углами и лёгким разбросом вершин."""
    if seed is not None: random.seed(seed)
    hx, hy, hz = sz[0] / 2, sz[1] / 2, sz[2] / 2; P = []
    for sx in (-1, 1):
        for sy in (-1, 1):
            for sz_ in (-1, 1):
                kx, ky = (top[0], top[1]) if sz_ > 0 else (1, 1)
                cx, cy_, cz = sx * hx * kx, sy * hy * ky * (taper_y if sy < 0 else 1), sz_ * hz
                for ax in range(3):
                    q = [cx, cy_, cz]; q[ax] -= [sx, sy, sz_][ax] * [hx, hy, hz][ax] * cut
                    q = [q[0] + random.uniform(-1, 1) * jit * hx, q[1] + random.uniform(-1, 1) * jit * hy, q[2] + random.uniform(-1, 1) * jit * hz]
                    P.append(tuple(q))
    return hull(P)


def wedge(pts, d, front_k=1.0, chamfer=.0):
    """Плита по 2D-контуру (x,z) толщиной d по Y; лицевая сторона уменьшена front_k (скос к краям)."""
    P = []
    cx = sum(x for x, z in pts) / len(pts); cz = sum(z for x, z in pts) / len(pts)
    for x, z in pts:
        P.append((x, d / 2, z)); P.append((cx + (x - cx) * front_k, -d / 2, cz + (z - cz) * front_k))
    return hull(P)


def hexpts(r, a0=0):
    return [(r * math.cos(a0 + i * PI / 3), r * math.sin(a0 + i * PI / 3)) for i in range(6)]


def ik2(h, dy, Lu, Ll):
    """2-звенная IK в плоскости ноги: колено вверх. Возвращает (pitch, knee) для Blender (как в игре)."""
    D = math.hypot(h, dy); D = max(abs(Lu - Ll) + 1e-3, min(Lu + Ll - 1e-3, D))
    a = (Lu * Lu - Ll * Ll + D * D) / (2 * D); hh = math.sqrt(max(0, Lu * Lu - a * a))
    fu, fv = h / max(1e-6, math.hypot(h, dy)) * D, dy / max(1e-6, math.hypot(h, dy)) * D
    px, py = a * fu / D, a * fv / D; nx, ny = -fv / D, fu / D
    if ny < 0: nx, ny = -nx, -ny
    kx, ky = px + hh * nx, py + hh * ny
    p = math.atan2(ky, kx); phi = math.atan2(fv - ky, fu - kx)
    return p, p - phi - PI / 2


def leg_pivots(prefix, i, parent, hip, yaw, Lu, Ll, foot_h, foot_dy):
    p, k = ik2(foot_h, foot_dy, Lu, Ll)
    Wh = Matrix.Translation(V(hip)) @ Matrix.Rotation(yaw, 4, 'Z') @ Matrix.Rotation(-p, 4, 'Y')
    hipA = Acc('%s_hip%d' % (prefix, i), parent, W=Wh)
    Wk = Wh @ Matrix.Translation(V((Lu, 0, 0))) @ Matrix.Rotation(k, 4, 'Y')
    kneeA = Acc('%s_knee%d' % (prefix, i), hipA.name, W=Wk)
    return hipA, kneeA


# ================================================================= ХОСТ — старик Пепсштейн (сидячая поза)
def build_host():
    Acc('HOST')
    hips = Acc('H_hips', 'HOST', loc=(0, 0, .1))
    tor = Acc('H_torso', 'HOST', loc=(0, .02, .12))
    neck = Acc('H_neck', 'H_torso', loc=(0, -.03, .6))
    head = Acc('H_head', 'H_neck', loc=(0, -.1, .76))
    jaw = Acc('H_jaw', 'H_head', loc=(0, -.13, .8))

    # --- мантия на коленях: два бедра под тканью, плиссированный спадающий перед, босые стопы
    for s in (-1, 1):
        hips.add(box(.18, .52, .17, tx=.85), 'navy', TRS((s * .1, -.21, .07)), bev=.035)
        hips.add(box(.07, .45, .5, tx=.7), 'navy', TRS((s * .25, -.22, -.1)), bev=.015)
        hips.add(box(.075, .45, .03), 'gold', TRS((s * .25, -.22, -.345)))
    hips.add(box(.4, .44, .05), 'navy', TRS((0, -.22, .135)))
    for x, w, m, dz in ((0, .14, 'cream', .0), (-.093, .045, 'red', .001), (.093, .045, 'red', .001), (-.12, .012, 'gold', .002), (.12, .012, 'gold', .002)):
        hips.add(box(w, .46, .012), m, TRS((x, -.22, .165 + dz)))
    pleats = ['navy', 'navy', 'gold', 'red', 'cream', 'cream', 'cream', 'red', 'gold', 'navy', 'navy']
    n_ = len(pleats); xs = [(-.27 + .54 * (i + .5) / n_) for i in range(n_)]
    for i, (x, m) in enumerate(zip(xs, pleats)):
        w = .54 / n_ * (.5 if m == 'gold' else 1.08)
        hips.add(box(w * 1.2, .03, .62, tx=.92), m, TRS((x, -.5 + (.01 if i % 2 else -.01), -.16), (.1, 0, (.2 if i % 2 else -.2))))
    hips.add(box(.54, .03, .6), 'navy', TRS((0, -.47, -.16), (.1, 0, 0)))
    hips.add(box(.56, .05, .03), 'gold', TRS((0, -.53, -.47), (.1, 0, 0)))
    for s in (-1, 1):
        hips.add(box(.075, .16, .05, tx=.8, ty=.9), 'skin', TRS((s * .1, -.6, -.45)), bev=.01)
        for t in range(4):
            hips.add(box(.014, .04, .02), 'skin', TRS((s * .1 + (t - 1.5) * .018, -.69, -.462)))

    # --- торс в мантии
    tor.add(box(.34, .22, .5, tx=1.15, ty=.95), 'navy', TRS((0, .02, .36)), bev=.03)
    for x, w, m, dy in ((0, .13, 'cream', 0), (-.085, .035, 'red', .001), (.085, .035, 'red', .001), (-.107, .012, 'gold', .002), (.107, .012, 'gold', .002),
                        (-.066, .01, 'gold', .002), (.066, .01, 'gold', .002)):
        tor.add(box(w, .012, .46), m, TRS((x, -.098 - dy, .35)))
    for s in (-1, 1):
        tor.add(box(.15, .22, .08, tx=.75, ty=.9), 'navy', TRS((s * .17, .02, .6)), bev=.02)
        tor.add(box(.03, .22, .085, tx=.75), 'gold', TRS((s * .235, .02, .6)))
        tor.add(box(.09, .2, .3, tx=1.2), 'cream', TRS((s * .2, .03, .4)), bev=.012)
        tor.add(box(.012, .2, .3), 'gold', TRS((s * .246, .03, .4)))
    # высокий кремовый воротник-стойка за шеей
    for i in range(7):
        a = (-20 + i * 36.6) * D2R; x, y = .1 * math.cos(a), .1 * math.sin(a)
        tor.add(box(.06, .025, .14, tx=1.1), 'cream', TRS((x, -.03 + y + .03, .66), (0, 0, a + PI / 2)))
        tor.add(box(.064, .028, .015), 'gold', TRS((x, -.03 + y + .03, .735), (0, 0, a + PI / 2)))
    # ящик на груди с красным камнем, кольцо на шее, кабели
    tor.add(box(.075, .05, .07), 'metal', TRS((0, -.115, .5)), bev=.008)
    tor.add(hull([(0, 0, .022), (0, 0, -.022), (.022, 0, 0), (-.022, 0, 0), (0, -.016, 0), (0, .012, 0)]), 'gem', TRS((0, -.142, .5)))
    tor.add(torus(.052, .011, 12, 5), 'metal', TRS((0, -.035, .62)))
    for s, m in ((-1, 'cableR'), (1, 'cableR'), (-1, 'cableB'), (1, 'cableB')):
        o = .012 if m == 'cableB' else 0
        tor.add(tube([(s * .035, -.12, .52), (s * (.07 + o), -.1, .6), (s * (.08 + o), -.02, .68), (s * (.05 + o), .08, .69), (s * (.03 + o), .14, .6), (s * (.05 + o), .15, .35), (s * (.06 + o), .14, .16)], .011, 5, 3), m)
    # механический позвоночник
    for i in range(7):
        z = .66 - i * .075; y = .125 + .01 * math.sin(i / 6 * PI)
        tor.add(box(.06, .05, .05), 'metal', TRS((0, y, z)), bev=.006)
        tor.add(box(.016, .012, .016), 'glow', TRS((0, y + .027, z)))

    # --- шея с жилами
    neck.add(cyl(.038, .032, .21, 7), 'skin', TRS((0, -.065, .68), (.35, 0, 0)))
    for s in (-1, 1):
        neck.add(tube([(s * .03, -.07, .77), (s * .018, -.065, .68), (s * .012, -.05, .6)], .008, 4, 2), 'skin')
    neck.add(box(.022, .018, .025), 'skin', TRS((0, -.1, .7)))

    # --- голова: деформированная сфера (череп, впалые щёки, глазницы, надбровья)
    C = V((0, -.14, .88)); RX, RY, RZ = .086, .105, .118
    sv, sf = sphere(14, 11); out = []
    eye_pos = {}
    for x, y, z in sv:
        g = lambda d2: math.exp(-d2)
        k = 1.0
        front = max(0.0, -y)
        k -= .2 * g(((abs(x) - .72) / .22) ** 2 + ((z + .22) / .3) ** 2) * front          # впалые щёки
        k += .07 * g(((z - .2) / .1) ** 2) * max(0.0, front - .55) / .45                  # надбровные дуги
        for sx in (-1, 1):
            k -= .24 * g(((x - sx * .4) / .2) ** 2 + ((z - .06) / .14) ** 2) * front       # глазницы
        k -= .08 * g(((abs(x) - .95) / .18) ** 2 + ((z - .3) / .25) ** 2)                  # виски
        k += .05 * g(((z - .55) / .3) ** 2) * max(0.0, y)                                   # затылок
        zz = z
        if z < -.42 and y < -.1: zz = -.42 + (z + .42) * .25                               # срез для рта
        xx = x * (1 - .25 * max(0.0, -.2 - z))                                              # узкий низ лица
        out.append((C.x + xx * RX * k, C.y + y * RY * k, C.z + zz * RZ * (k if z > 0 else 1)))
    head.add((out, sf), 'skin')
    for sx in (-1, 1):
        ep = V((C.x + sx * .4 * RX * .78, C.y - .93 * RY * .8, C.z + .06 * RZ)); eye_pos[sx] = ep
        head.add(sphere(6, 4), 'eye', TRS(tuple(ep), sc=.019))
    head.add(hull([(0, -.232, .905), (0, -.266, .835), (.022, -.238, .828), (-.022, -.238, .828), (0, -.21, .83), (.012, -.225, .9), (-.012, -.225, .9)]), 'skin')
    for s in (-1, 1):
        head.add(sphere(6, 4), 'skin', TRS((s * .09, -.13, .875), (0, 0, s * .25), sc=(.014, .036, .052)))
    # дикие седые космы
    random.seed(55)
    for i in range(18):
        az = (12 + (i // 2) * 13.5) * D2R * (1 if i % 2 else -1)
        zz = .83 + random.uniform(0, .11)
        bx_, by_ = math.sin(az) * RX * .95, math.cos(az) * RY * .9
        base = V((C.x + bx_, C.y + by_, zz)); dirv = V((math.sin(az) * 1.2, math.cos(az) * .9 + .25, random.uniform(.15, .7))).normalized()
        L = random.uniform(.06, .12); r = random.uniform(.016, .024)
        q = dirv.to_track_quat('Z', 'Y').to_matrix().to_4x4()
        head.add(cyl(r, 0, L, 4), 'hair', Matrix.Translation(base + dirv * L * .4) @ q)
    # золотые очки
    for sx in (-1, 1):
        cx = sx * .037; y = -.255; z = .893
        for (dx, dz, w, h) in ((0, .016, .05, .005), (0, -.016, .05, .005), (-.024, 0, .005, .035), (.024, 0, .005, .035)):
            head.add(box(w, .005, h), 'gold', TRS((cx + dx, y, z + dz)))
        head.add(tube([(sx * .062, -.252, .897), (sx * .085, -.2, .9), (sx * .09, -.14, .89)], .0035, 4, 2), 'gold')
    head.add(box(.026, .005, .005), 'gold', TRS((0, -.257, .899)))
    # рот: тёмная полость и верхний ряд золотых зубов
    head.add(box(.062, .055, .03), 'mouth', TRS((0, -.19, .797)))
    for i in range(7):
        t = (i - 3) / 3; head.add(box(.0095, .008, .016), 'gold', TRS((t * .03, -.224 + abs(t) * .012, .801), (0, 0, t * .5)))

    # --- челюсть с нижними золотыми зубами
    jaw.add(hull([(0, -.226, .742), (.034, -.216, .746), (-.034, -.216, .746), (.062, -.155, .77), (-.062, -.155, .77),
                  (.03, -.22, .786), (-.03, -.22, .786), (.058, -.15, .795), (-.058, -.15, .795), (0, -.2, .73)]), 'skin')
    for i in range(6):
        t = (i - 2.5) / 2.5; jaw.add(box(.0095, .008, .013), 'gold', TRS((t * .026, -.219 + abs(t) * .01, .789), (0, 0, t * .5)))

    # голова крупнее (как на референсе): масштаб вокруг шарнира головы
    K = 1.28
    head.V = [tuple(V(p) * K) for p in head.V]; jaw.V = [tuple(V(p) * K) for p in jaw.V]
    hp = head.W.translation.copy(); jaw.W = Matrix.Translation(hp + (jaw.W.translation - hp) * K)

    # --- руки: широкие рукава, костлявые предплечья, кисти с перстнями
    for s, L in ((1, 'L'), (-1, 'R')):
        arm = Acc('H_arm' + L, 'H_torso', loc=(s * .19, 0, .55))
        fore = Acc('H_fore' + L, 'H_arm' + L, loc=(s * .225, .03, .31))
        hand = Acc('H_hand' + L, 'H_fore' + L, loc=(s * .215, -.28, .29))
        arm.add(tube([(s * .19, 0, .57), (s * .215, .02, .44), (s * .225, .03, .31)], .062, 7, 2, r2=.075), 'navy')
        arm.add(torus(.074, .012, 10, 4), 'gold', TRS((s * .225, .03, .325)))
        fore.add(tube([(s * .225, .03, .31), (s * .22, -.12, .3), (s * .215, -.28, .29)], .024, 6, 2), 'skin')
        dr = [(0, 0), (.2, 0), (.17, -.16), (.02, -.2)]
        R = TRS((s * .222, .03, .33), (0, 0, -PI / 2)) @ TRS((0, 0, 0))
        fore.add(hull([(s * .2, .045, .335), (s * .25, .045, .335), (s * .2, -.15, .325), (s * .25, -.15, .325),
                       (s * .19, .02, .15), (s * .26, .02, .15), (s * .19, -.12, .17), (s * .26, -.12, .17)]), 'cream')
        fore.add(box(.075, .2, .012), 'gold', TRS((s * .225, -.05, .158), (-.1, 0, 0)))
        fore.add(box(.074, .012, .17), 'gold', TRS((s * .225, -.155, .25), (.08, 0, 0)))
        fore.add(box(.06, .01, .15), 'navy', TRS((s * .225, -.148, .25), (.08, 0, 0)))
        hand.add(box(.065, .075, .022, tx=.95), 'skin', TRS((s * .215, -.318, .283), (-.15, 0, 0)), bev=.005)
        for fi in range(4):
            fx = s * .215 + (fi - 1.5) * .016 * s
            hand.add(box(.012, .05, .013), 'skin', TRS((fx, -.375, .276), (-.25, 0, 0)))
            hand.add(box(.011, .045, .012), 'skin', TRS((fx, -.408, .246), (-1.05, 0, 0)))
            if fi in (0, 1, 3):
                hand.add(box(.017, .014, .018), 'gold', TRS((fx, -.37, .277), (-.25, 0, 0)))
            if fi == 1:
                hand.add(box(.016, .016, .01), 'gem', TRS((fx, -.37, .289), (-.25, 0, 0)))
        hand.add(box(.013, .045, .013), 'skin', TRS((s * .215 - s * .038, -.33, .275), (0, 0, s * .6)))


exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'pep_host.py')).read())
PH2_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'pep_ph2.py')
PH3_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'pep_ph3.py')


# ================================================================= ФАЗА I — трон-паук «ПРИВИЛЕГИЯ» (~5.5 м)
def build_ph1():
    Acc('PH1')
    B = Acc('P1_body', 'PH1', loc=(0, .1, 2.6))
    B.add(box(2.3, 2.5, 1.25, tx=.92, ty=.9), 'navy', TRS((0, .15, 2.55)), bev=.16)
    B.add(box(1.7, 1.9, .5, tx=1.25, ty=1.2), 'gun', TRS((0, .15, 1.78)), bev=.07)
    for s in (-1, 1):
        B.add(box(.44, 2.2, .16, tx=.9), 'cream', TRS((s * .93, .15, 3.22)), bev=.04)
        B.add(box(.07, 2.2, .03), 'red', TRS((s * .93, .15, 3.31)))
        B.add(box(.1, 1.5, .62, ty=.8), 'cream', TRS((s * 1.19, .35, 2.72)), bev=.03)
        B.add(box(.11, 1.6, .07), 'red', TRS((s * 1.2, .35, 2.72), (.35, 0, 0)))
        B.add(box(.11, .9, .05), 'red', TRS((s * 1.2, .55, 2.5), (.35, 0, 0)))
        B.add(box(.06, .5, .07), 'glow', TRS((s * 1.2, -.35, 2.18)))
        B.add(box(.06, .5, .07), 'glow', TRS((s * 1.2, -.35, 2.06)))
    # нос: кремовый клин с красной решёткой, штанга для знамени
    B.add(box(1.3, .5, 1.3, tx=1.1, ty=.7, oy=-.1), 'cream', TRS((0, -1.05, 2.5)), bev=.06)
    B.add(box(.82, .06, .55), 'dark', TRS((0, -1.33, 2.65)))
    for x in (-.27, -.09, .09, .27): B.add(box(.11, .05, .46), 'glow', TRS((x, -1.355, 2.65)))
    for (x, z, w, h) in ((0, 2.95, .9, .05), (0, 2.35, .9, .05), (-.44, 2.65, .05, .62), (.44, 2.65, .05, .62)):
        B.add(box(w, .07, h), 'gold', TRS((x, -1.36, z)))
    B.add(cyl(.035, .035, 1.0, 6), 'gold', TRS((0, -1.36, 2.12), (0, PI / 2, 0)))
    for s in (-1, 1): B.add(sphere(6, 4), 'gold', TRS((s * .52, -1.36, 2.12), sc=.06))
    ban = Acc('P1_banner', 'P1_body', loc=(0, -1.38, 2.12))
    pen = [(-.42, 0), (.42, 0), (.42, -1.15), (0, -1.45), (-.42, -1.15)]
    ban.add(prism([(x * 1.07, z * 1.04 + .02) for x, z in pen], .03), 'gold', TRS((0, -1.37, 2.1)))
    ban.add(prism(pen, .05), 'banner', TRS((0, -1.4, 2.1)))
    emblem(ban, (0, -1.43, 1.48), (1, 0, 0), (0, 0, 1), (0, -1, 0), .62)
    for i in range(9): ban.add(box(.02, .02, .08), 'gold', TRS((-.4 + i * .1, -1.4, 2.02)))
    # трон: сиденье, подлокотники, спинка-щит, гребень, шипы
    B.add(box(1.1, 1.1, .25), 'cream', TRS((0, -.2, 3.25)), bev=.04)
    B.add(box(.74, .95, .14), 'velvet', TRS((0, -.22, 3.43)), bev=.04)
    for ix in range(3):
        for iy in range(3): B.add(box(.04, .04, .03), 'gold', TRS(((ix - 1) * .2, -.22 + (iy - 1) * .28, 3.5)))
    for s in (-1, 1):
        B.add(box(.18, 1.0, .35), 'cream', TRS((s * .46, -.25, 3.55)), bev=.04)
        B.add(box(.2, .08, .4), 'gold', TRS((s * .46, -.78, 3.56)))
        B.add(box(.14, .9, .05), 'velvet', TRS((s * .46, -.25, 3.745)))
    shield = [(-.7, 0), (.7, 0), (.8, 1.3), (.56, 2.0), (0, 2.28), (-.56, 2.0), (-.8, 1.3)]
    Rb = TRS((0, .5, 3.35), (-.12, 0, 0))
    B.add(prism(shield, .2), 'gold', Rb)
    B.add(prism([(x * .84, z * .86 + .12) for x, z in shield], .1), 'velvet', Rb @ TRS((0, -.12, 0)))
    for r_ in range(5):
        for c_ in range(4 - (r_ % 2)):
            x = (c_ - (3 - (r_ % 2)) / 2) * .26; z = .35 + r_ * .32
            if abs(x) < .58 - (r_ > 3) * .2:
                B.add(sphere(5, 3), 'gold', Rb @ TRS((x, -.18, z), sc=.035))
    B.add(prism([(x * 1.04, z * 1.02) for x, z in shield], .1, back=1), 'navy', Rb @ TRS((0, .14, 0)))
    emblem(B, (0, .62, 6.0), (1, 0, 0), (0, 0, 1), (0, -1, 0), .55)
    B.add(prism([(-.3, 0), (.3, 0), (.38, .15), (0, .32), (-.38, .15)], .12), 'gold', TRS((0, .66, 5.6)))
    for s in (-1, 1):
        B.add(cyl(.075, 0, .75, 6), 'gold', TRS((s * .58, .72, 5.55), (-.1, s * .12, 0)))
        B.add(cyl(.11, 0, 1.4, 6), 'gold', TRS((s * 1.02, .95, 3.85), (.15, s * .15, 0)))
        B.add(cyl(.13, .13, .1, 6), 'gold', TRS((s * 1.02, .95, 3.18)))
    # кабели от спинки в корпус
    for s in (-1, 1):
        B.add(tube([(s * .25, .62, 4.3), (s * .5, .9, 4.0), (s * .62, 1.15, 3.5), (s * .45, 1.2, 3.1)], .06, 6, 3), 'cableR')
        B.add(tube([(s * .12, .62, 4.0), (s * .3, .95, 3.7), (s * .3, 1.2, 3.2)], .045, 6, 3), 'cableB')
    # корма: панель с гербом, красные решётки
    B.add(box(1.3, .1, .9), 'cream', TRS((0, 1.43, 2.65)), bev=.03)
    emblem(B, (0, 1.49, 2.5), (-1, 0, 0), (0, 0, 1), (0, 1, 0), .6)
    for s in (-1, 1):
        B.add(box(.38, .08, .52), 'gold', TRS((s * .78, 1.42, 2.15)))
        B.add(box(.28, .09, .42), 'glow', TRS((s * .78, 1.43, 2.15)))
        for k in range(3): B.add(box(.3, .1, .03), 'dark', TRS((s * .78, 1.44, 2.02 + k * .13)))
    Acc('P1_seat', 'P1_body', loc=(0, -.2, 3.5))
    # гатлинги по бокам
    for s, L in ((1, 'L'), (-1, 'R')):
        g = Acc('P1_gun' + L, 'P1_body', loc=(s * 1.5, -.35, 2.62))
        g.add(box(.62, 1.1, .62), 'navy', TRS((s * 1.5, -.3, 2.62)), bev=.06)
        g.add(box(.64, .9, .12), 'cream', TRS((s * 1.5, -.25, 2.98)), bev=.02)
        g.add(box(.07, .9, .04), 'red', TRS((s * 1.5, -.25, 3.05)))
        g.add(box(.08, .5, .3), 'glow', TRS((s * 1.82, -.2, 2.6)))
        b = Acc('P1_bar' + L, 'P1_gun' + L, loc=(s * 1.5, -.9, 2.62))
        R = TRS((s * 1.5, 0, 2.62), (PI / 2, 0, 0))
        b.add(cyl(.3, .3, .3, 8), 'gun', R @ TRS((0, 0, .98)))
        b.add(cyl(.12, .12, 1.4, 6), 'dark', R @ TRS((0, 0, 1.6)))
        for k in range(6):
            a = k * PI / 3; b.add(cyl(.072, .072, 1.35, 6), 'gun', R @ TRS((.19 * math.cos(a), .19 * math.sin(a), 1.62)))
            b.add(cyl(.05, .05, .02, 6), 'dark', R @ TRS((.19 * math.cos(a), .19 * math.sin(a), 2.3)))
        b.add(torus(.2, .045, 12, 4), 'gun', R @ TRS((0, 0, 2.2)))
        b.add(torus(.2, .04, 12, 4), 'cream', R @ TRS((0, 0, 1.55)))
        Acc('P1_mz' + L, 'P1_bar' + L, loc=(s * 1.5, -2.38, 2.62))
        # шестигранные ракетные кассеты
        p = Acc('P1_pod' + L, 'P1_body', loc=(s * 1.42, .12, 3.72))
        B.add(box(.5, .6, .5), 'navy', TRS((s * 1.2, .2, 3.4)), bev=.04)
        Rp = TRS((s * 1.42, .12, 3.72), (0, 0, 0))
        p.add(prism(hexpts(.5, PI / 6), .8), 'cream', Rp)
        p.add(prism(hexpts(.44, PI / 6), .06), 'gun', Rp @ TRS((0, -.42, 0)))
        p.add(prism(hexpts(.52, PI / 6), .08), 'navy', Rp @ TRS((0, .1, 0)))
        for (hx, hz) in [(0, 0)] + hexpts(.27, 0):
            p.add(cyl(.085, .085, .1, 6), 'dark', Rp @ TRS((hx, -.47, hz), (PI / 2, 0, 0)))
            p.add(lathe([(.075, 0), (.075, .05), (.06, .1), (0, .14)], 6), 'red', Rp @ TRS((hx, -.5, hz), (PI / 2, 0, 0)))
        Acc('P1_pm' + L, 'P1_pod' + L, loc=(s * 1.42, -.42, 3.72))
    # ноги: 4 шт., бедро — кремовая броня, голень — синяя со светящейся щелью, копыто-шип
    Lu, Ll = 1.75, 2.95
    hipsP = [((1.1, -.72, 2.12), -42), ((1.1, 1.02, 2.12), 42), ((-1.1, -.72, 2.12), 180 + 42), ((-1.1, 1.02, 2.12), 180 - 42)]
    for i, (hp, yawd) in enumerate(hipsP):
        hip, knee = leg_pivots('P1', i, 'P1_body', hp, yawd * D2R, Lu, Ll, 2.35, -2.12)
        hip.add(cyl(.24, .24, .52, 8), 'dark', TRS((0, 0, 0), (PI / 2, 0, 0)), local=True)
        hip.add(box(Lu - .15, .44, .5, tx=.85), 'cream', TRS((Lu / 2, 0, .06)), local=True, bev=.06)
        hip.add(box(Lu - .4, .36, .22), 'navy', TRS((Lu / 2 - .05, 0, -.26)), local=True, bev=.03)
        hip.add(box(Lu - .5, .07, .035), 'red', TRS((Lu / 2, 0, .325)), local=True)
        hip.add(box(.5, .46, .04), 'red', TRS((Lu * .78, 0, .31), (0, -.2, 0)), local=True)
        knee.add(cyl(.21, .21, .5, 8), 'dark', TRS((0, 0, 0), (PI / 2, 0, 0)), local=True)
        knee.add(box(.5, .46, .44), 'cream', TRS((.06, 0, .14)), local=True, bev=.06)
        knee.add(box(.42, .4, Ll - .75, bx=.8, by=.85), 'navy', TRS((0, 0, -(Ll - .75) / 2 - .22)), local=True, bev=.04)
        knee.add(box(.08, .42, .9), 'cream', TRS((.2, 0, -.6)), local=True, bev=.015)
        knee.add(box(.05, .1, 1.1), 'glow', TRS((.2, 0, -1.55)), local=True)
        knee.add(box(.36, .36, .14), 'dark', TRS((0, 0, -(Ll - .52))), local=True)
        knee.add(hull([(.2, .2, -(Ll - .45)), (-.2, .2, -(Ll - .45)), (.2, -.2, -(Ll - .45)), (-.2, -.2, -(Ll - .45)),
                       (.24, 0, -(Ll - .3)), (.06, 0, -Ll), (-.12, 0, -(Ll - .15))]), 'cream', local=True)


# ================================================================= ФАЗА II — гуманоид «МОНОПОЛИЯ» (~7.8 м)
def build_ph2():
    Acc('PH2')
    pel = Acc('P2_pelvis', 'PH2', loc=(0, .05, 3.75))
    pel.add(box(1.7, 1.2, .75, tx=1.05), 'navy', TRS((0, .05, 3.75)), bev=.08)
    pel.add(box(1.2, 1.0, .3), 'gun', TRS((0, .05, 3.3)), bev=.04)
    for s in (-1, 1):
        pel.add(box(.25, 1.0, .8, tx=.8), 'cream', TRS((s * .95, .05, 3.7)), bev=.05)
        pel.add(box(.26, .1, .8), 'red', TRS((s * .95, -.4, 3.7)))
    pel.add(cyl(.55, .5, .4, 8), 'dark', TRS((0, .05, 4.2)))
    for nm, y, rot in (('P2_skirtF', -.62, 0), ('P2_skirtB', .72, PI)):
        sk = Acc(nm, 'P2_pelvis', loc=(0, y, 3.98))
        pen = [(-.48, 0), (.48, 0), (.48, -1.75), (0, -2.25), (-.48, -1.75)]
        R = TRS((0, y, 3.98), (0, 0, rot))
        sk.add(prism([(x * 1.08, z * 1.04 + .03) for x, z in pen], .04), 'gold', R @ TRS((0, .02, 0)))
        sk.add(prism(pen, .07), 'red', R)
        sk.add(box(1.04, .1, .14), 'gold', R @ TRS((0, -.01, -.02)))
        if y < 0: emblem(sk, (0, y - .045, 2.9), (1, 0, 0), (0, 0, 1), (0, -1, 0), .7)
        else: sk.add(box(.12, .08, 1.6), 'gold', R @ TRS((0, -.02, -1.0)))
    ch = Acc('P2_chest', 'P2_pelvis', loc=(0, .05, 4.3))
    ch.add(box(1.5, 1.1, .6), 'dark', TRS((0, .05, 4.55)), bev=.05)
    ch.add(box(2.6, 1.8, 1.0, bx=.86, by=.9), 'navy', TRS((0, .1, 5.3)), bev=.12)
    ch.add(box(2.6, .9, .95), 'navy', TRS((0, .55, 6.25)), bev=.1)
    for s in (-1, 1):
        ch.add(box(.75, .95, .95), 'navy', TRS((s * .92, -.33, 6.25)), bev=.08)
        ch.add(box(.85, 1.05, .22, tx=.6), 'cream', TRS((s * .9, -.25, 6.82), (0, s * .32, 0)), bev=.04)
        ch.add(box(.09, .12, 1.0), 'gold', TRS((s * .56, -.82, 6.25)))
        ch.add(box(.7, .3, .75, tx=.7), 'cream', TRS((s * .6, -.78, 5.25), (0, s * -.5, 0)), bev=.04)
    ch.add(box(1.1, .1, 1.0), 'velvet', TRS((0, .12, 6.3)), bev=.02)
    ch.add(box(1.0, .8, .12), 'velvet', TRS((0, -.35, 5.83)), bev=.02)
    for x in (-.3, 0, .3):
        for z in (6.0, 6.35, 6.65): ch.add(sphere(5, 3), 'gold', TRS((x, .06, z), sc=.035))
    ch.add(box(.92, .06, .62), 'dark', TRS((0, -.82, 5.25)))
    for x in (-.27, 0, .27): ch.add(box(.15, .05, .52), 'glow', TRS((x, -.845, 5.25)))
    ch.add(box(1.0, .09, .06), 'gold', TRS((0, -.85, 5.58))); ch.add(box(1.0, .09, .06), 'gold', TRS((0, -.85, 4.92)))
    Acc('P2_seat', 'P2_chest', loc=(0, -.34, 5.9))
    # спинной хребет с красными огнями и кабели
    for i in range(8):
        z = 6.55 - i * .32
        ch.add(box(.5, .3, .24), 'metal', TRS((0, 1.05, z)), bev=.03)
        ch.add(box(.14, .05, .09), 'glow', TRS((0, 1.21, z)))
    for s in (-1, 1):
        ch.add(tube([(s * 1.2, .8, 6.6), (s * .7, 1.2, 6.2), (s * .35, 1.15, 5.4), (s * .3, 1.0, 4.6)], .08, 6, 3), 'cableR')
        ch.add(tube([(s * .2, .4, 6.75), (s * .45, .2, 7.05), (s * .2, -.05, 7.0)], .06, 6, 3), 'cableR')
    # наплечники: синие с кремом, красные решётки спереди, гербовые шестиугольники снаружи, золотые шипы
    for s in (-1, 1):
        cx = s * 1.78
        ch.add(box(1.35, 1.65, 1.1, tx=.85, ty=.85), 'navy', TRS((cx, .05, 6.75)), bev=.12)
        ch.add(box(1.25, 1.45, .18, tx=.9), 'cream', TRS((cx, .05, 7.33)), bev=.04)
        ch.add(box(1.38, .14, .3), 'cream', TRS((cx, -.8, 6.3)), bev=.03)
        ch.add(box(.9, .06, .42), 'dark', TRS((cx, -.79, 6.82)))
        for k in range(3): ch.add(box(.75, .05, .07), 'glow', TRS((cx, -.81, 6.68 + k * .14)))
        R = TRS((s * 2.48, .05, 6.72), (0, 0, s * PI / 2))
        ch.add(prism(hexpts(.62, 0), .1), 'gold', R)
        ch.add(prism(hexpts(.52, 0), .12), 'navy', R @ TRS((0, -.02, 0)))
        emblem(ch, (s * 2.56, .05, 6.62), (0, -s, 0), (0, 0, 1), (s, 0, 0), .62)
        for (dx, dy, h) in ((-.3, .35, .7), (.25, -.15, .55)):
            ch.add(cyl(.09, 0, h, 6), 'gold', TRS((cx + s * dx, dy, 7.42 + h / 2)))
    # руки: плечо, локоть, кулак с перстнями (кулак — отдельный узел, «ракетный кулак» отстреливается)
    for s, L in ((1, 'L'), (-1, 'R')):
        arm = Acc('P2_arm' + L, 'P2_chest', loc=(s * 1.78, .05, 6.2))
        arm.add(sphere(8, 6), 'dark', TRS((s * 1.78, .05, 6.2), sc=.45))
        arm.add(box(.62, .62, 1.4, bx=.85, by=.85), 'navy', TRS((s * 1.85, .05, 5.45)), bev=.06)
        arm.add(box(.12, .56, 1.05), 'cream', TRS((s * 2.17, .05, 5.45)), bev=.02)
        arm.add(box(.13, .1, .9), 'red', TRS((s * 2.18, -.2, 5.45)))
        elb = Acc('P2_elb' + L, 'P2_arm' + L, loc=(s * 1.9, .05, 4.72))
        elb.add(cyl(.33, .33, .55, 8), 'dark', TRS((s * 1.9, .05, 4.72), (0, PI / 2, 0)))
        elb.add(box(.88, .88, 1.5, bx=.82, by=.82), 'cream', TRS((s * 1.95, 0, 3.86)), bev=.1)
        elb.add(box(.06, .14, .85), 'glow', TRS((s * 2.4, 0, 3.92)))
        elb.add(box(.96, .96, .22), 'navy', TRS((s * 1.95, 0, 3.12)), bev=.03)
        elb.add(box(.9, .12, .5), 'red', TRS((s * 1.95, -.45, 4.4)))
        fist = Acc('P2_fist' + L, 'P2_elb' + L, loc=(s * 1.95, -.05, 3.0))
        fist.add(box(.84, .74, .68), 'gun', TRS((s * 1.95, -.08, 2.62)), bev=.06)
        fist.add(box(.86, .72, .12), 'cream', TRS((s * 1.95, -.12, 2.98)), bev=.02)
        for k in range(4):
            fx = s * 1.95 + (k - 1.5) * .205
            fist.add(box(.19, .32, .27), 'gun', TRS((fx, -.56, 2.6)), bev=.025)
            fist.add(box(.18, .26, .2), 'gun', TRS((fx, -.48, 2.3)), bev=.02)
            fist.add(box(.205, .1, .285), 'gold', TRS((fx, -.62, 2.6)))
            if k == 1 + (s < 0): fist.add(box(.1, .06, .1), 'gem', TRS((fx, -.67, 2.62)))
        fist.add(box(.25, .45, .3), 'gun', TRS((s * 1.95 - s * .5, -.3, 2.55)), bev=.03)
        fist.add(box(.26, .1, .32), 'gold', TRS((s * 1.95 - s * .52, -.48, 2.55)))
        fist.V = [tuple(V(p) * 1.25) for p in fist.V]
    # ноги
    for s, L in ((1, 'L'), (-1, 'R')):
        th = Acc('P2_thigh' + L, 'P2_pelvis', loc=(s * .66, .05, 3.5))
        th.add(sphere(8, 6), 'dark', TRS((s * .66, .05, 3.5), sc=.42))
        th.add(box(.82, .88, 1.45, tx=1.08, ty=1.05), 'navy', TRS((s * .68, 0, 2.82)), bev=.08)
        th.add(box(.08, .05, .85), 'glow', TRS((s * .68, -.46, 2.86)))
        th.add(box(.12, .7, 1.1), 'cream', TRS((s * 1.1, 0, 2.95)), bev=.03)
        kn = Acc('P2_knee' + L, 'P2_thigh' + L, loc=(s * .7, -.05, 2.1))
        kn.add(cyl(.36, .36, .7, 8), 'dark', TRS((s * .7, -.05, 2.1), (0, PI / 2, 0)))
        kn.add(box(.62, .38, .62), 'cream', TRS((s * .7, -.42, 2.1)), bev=.07)
        kn.add(box(.76, .82, 1.3, bx=1.1, by=1.05), 'navy', TRS((s * .7, 0, 1.33)), bev=.08)
        kn.add(box(.56, .16, 1.1, bx=.8), 'cream', TRS((s * .7, -.45, 1.4)), bev=.03)
        kn.add(box(.07, .04, .45), 'glow', TRS((s * .7, -.54, 1.4)))
        ft = Acc('P2_foot' + L, 'P2_knee' + L, loc=(s * .72, 0, .62))
        ft.add(sphere(8, 5), 'dark', TRS((s * .72, 0, .62), sc=.32))
        ft.add(box(.98, 1.65, .5, tx=.85, ty=.8), 'navy', TRS((s * .72, -.22, .25)), bev=.06)
        ft.add(box(.95, .5, .38, tx=.8), 'cream', TRS((s * .72, -.88, .22)), bev=.05)
        ft.add(box(.62, .42, .42), 'cream', TRS((s * .72, .52, .26)), bev=.04)
        ft.add(box(.96, .08, .12), 'red', TRS((s * .72, -1.12, .2)))


# ================================================================= ФАЗА III — паук «ВРАЖДЕБНОЕ ПОГЛОЩЕНИЕ»
def build_ph3():
    Acc('PH3')
    B = Acc('P3_body', 'PH3', loc=(0, 0, 5.6))
    B.add(box(4.0, 4.6, 2.2, tx=.82, ty=.85), 'navy', TRS((0, .2, 5.5)), bev=.25)
    B.add(box(3.0, 3.6, .8, tx=1.25, ty=1.2), 'gun', TRS((0, .2, 4.15)), bev=.1)
    B.add(box(2.7, 3.5, .35, tx=.9), 'cream', TRS((0, .75, 6.72)), bev=.07)
    B.add(box(.16, 3.4, .06), 'red', TRS((-.75, .75, 6.92))); B.add(box(.16, 3.4, .06), 'red', TRS((.75, .75, 6.92)))
    for s in (-1, 1):
        B.add(box(.5, 3.7, 1.3, tx=.6), 'cream', TRS((s * 1.95, .25, 5.55), (0, s * .25, 0)), bev=.06)
        B.add(box(.52, 3.0, .12), 'red', TRS((s * 2.08, .25, 5.85), (0, s * .25, 0)))
        B.add(box(.3, .9, .12), 'glow', TRS((s * 2.15, -.9, 5.35), (0, s * .25, 0)))
        B.add(box(.3, .9, .12), 'glow', TRS((s * 2.15, .4, 5.35), (0, s * .25, 0)))
    # реактор спереди: кремовое кольцо, решётка, ядро (отдельно), «жвала»
    Rf = TRS((0, -2.25, 5.05), (PI / 2, 0, 0))
    B.add(cyl(1.32, 1.32, .55, 10), 'cream', Rf, bev=.05)
    B.add(cyl(1.08, 1.08, .62, 10), 'dark', Rf)
    for x in (-.5, -.17, .17, .5): B.add(box(.09, .1, 2.0 - abs(x) * 1.1), 'gun', TRS((x, -2.58, 5.05)))
    B.add(box(2.2, .1, .1), 'gun', TRS((0, -2.58, 5.05)))
    for s in (-1, 1):
        B.add(box(.22, .5, .5), 'gold', TRS((s * 1.32, -2.25, 5.05)), bev=.03)
        B.add(box(.5, .9, .3), 'cream', TRS((s * .9, -2.4, 4.0), (0, s * .5, s * .3)), bev=.04)
    core = Acc('P3_core', 'P3_body', loc=(0, -2.3, 5.05))
    core.add(sphere(10, 8), 'glow', TRS((0, -2.3, 5.05), sc=(.98, .7, .98)))
    jaw = [(-.62, 0), (.62, 0), (.46, -1.25), (0, -1.8), (-.46, -1.25)]
    B.add(prism([(x * 1.12, z * 1.08 + .05) for x, z in jaw], .26), 'red', TRS((0, -2.42, 3.92)))
    B.add(prism(jaw, .34), 'cream', TRS((0, -2.5, 3.92)))
    B.add(box(.12, .1, .9), 'glow', TRS((0, -2.69, 3.4)))
    # купол: база, трон внутри, стекло
    B.add(cyl(1.2, 1.32, .4, 12), 'cream', TRS((0, -.9, 6.95)), bev=.04)
    B.add(torus(1.24, .06, 20, 4), 'gold', TRS((0, -.9, 7.16)))
    B.add(box(1.1, .28, 1.45), 'velvet', TRS((0, -.32, 7.85)), bev=.04)
    B.add(box(1.2, .32, .14), 'gold', TRS((0, -.32, 8.6)))
    B.add(box(1.0, .9, .3), 'cream', TRS((0, -.85, 7.25)), bev=.04)
    for s in (-1, 1): B.add(box(.16, .8, .42), 'cream', TRS((s * .5, -.85, 7.45)), bev=.03)
    Acc('P3_seat', 'P3_body', loc=(0, -.9, 7.4))
    dome = Acc('P3_dome', 'P3_body', loc=(0, -.9, 7.15))
    dome.add(lathe([(1.18, 0), (1.22, .6), (1.14, 1.45), (.92, 2.05), (.5, 2.45), (0, 2.58)], 14), 'glass', TRS((0, -.9, 7.15), sc=(1, .92, 1)))
    dome.add(torus(1.2, .05, 14, 4, PI, 0), 'gold', TRS((0, -.9, 7.15), (PI / 2, 0, 0), sc=(1, 2.12, 1)))
    # нимб из красных кабелей
    HZ, HR = 10.9, 2.5
    halo = Acc('P3_halo', 'P3_body', loc=(0, .85, HZ))
    Rh = TRS((0, .85, HZ), (PI / 2, 0, 0))
    halo.add(torus(HR, .2, 32, 6), 'cableR', Rh)
    halo.add(torus(HR, .08, 32, 4), 'glow', Rh @ TRS((0, 0, -.14), (0, 0, .1)))
    halo.add(torus(HR - .26, .09, 32, 4), 'cableR', Rh @ TRS((0, 0, .12)))
    for k in range(12):
        a = k * PI / 6; halo.add(box(.26, .36, .46), 'metal', Rh @ TRS((HR * math.cos(a), HR * math.sin(a), 0), (0, 0, a)), bev=.03)
    halo.add(box(.6, .5, .55), 'metal', TRS((0, .85, HZ + HR + .1)), bev=.05)
    halo.add(box(.16, .05, .16), 'glow', TRS((0, .58, HZ + HR + .1)))
    for s in (-1, 1):
        B.add(tube([(s * .4, .3, 8.0), (s * 1.1, .6, 8.2), (s * 1.75, .85, 8.6)], .12, 6, 3), 'cableR')
        B.add(tube([(s * .2, .4, 8.3), (s * .5, .75, 8.2), (s * .9, .9, 8.5)], .09, 6, 3), 'cableB')
    # крылья-лопасти с экранами котировок (6 шт.)
    WS = 1.4
    blade = [(x * WS, z * WS) for x, z in [(0, -.38), (3.7, -.58), (4.8, 0), (3.7, .78), (0, .46)]]
    scr = [(x * WS, z * WS) for x, z in [(.55, -.2), (3.45, -.36), (3.45, .56), (.55, .3)]]
    wi = 0
    for s in (-1, 1):
        for th, yb, zr in ((28, .1, 0), (50, .3, .3), (74, .5, .6)):
            root = (s * 1.25, 1.2 + yb, 7.1 + zr)
            W = Matrix.Translation(V(root)) @ Matrix.Rotation(s * .16, 4, 'Z') @ Matrix.Rotation(-s * th * D2R, 4, 'Y')
            w = Acc('P3_wing%d' % wi, 'P3_body', W=W)
            bl = [(s * x, z) for x, z in blade]
            w.add(prism([(s * x * 1.03 - s * .02, z * 1.1) for x, z in blade], .1), 'cream', TRS((0, .06, 0)), local=True)
            w.add(prism(bl, .18), 'navy', local=True)
            w.add(box(.5, .3, .5), 'dark', TRS((s * .1, 0, 0)), local=True, bev=.04)
            sc_ = Acc('P3_scr%d' % wi, w.name, W=W)
            pts = [(s * x, z) for x, z in scr]
            if s < 0: pts = pts[::-1]
            vs = [(x, -.1, z) for x, z in pts]
            uvx = [abs(x) for x, z in pts]; u0, u1 = min(uvx), max(uvx)
            zs = [z for x, z in pts]; z0, z1 = min(zs), max(zs)
            uv = [tuple(((abs(x) - u0) / (u1 - u0), (z - z0) / (z1 - z0)) for x, z in pts)]
            if s < 0: uv = [tuple((1 - u, v) for u, v in uv[0])]
            sc_.add((vs, [(0, 1, 2, 3)]), 'screen', local=True, uv=uv); sc_.norecalc = True
            wi += 1
    # ракетные блоки и длинные пушки
    for s, L in ((1, 'L'), (-1, 'R')):
        pod = Acc('P3_pod' + L, 'P3_body', loc=(s * 2.55, -.45, 7.15))
        B.add(box(.95, 1.4, .75), 'navy', TRS((s * 1.95, -.35, 6.7)), bev=.06)
        Rp = TRS((s * 2.55, -.45, 7.15), (PI / 2, 0, 0))
        pod.add(cyl(1.0, 1.0, 2.2, 8), 'cream', Rp, bev=.04)
        for zz in (-.55, .45): pod.add(cyl(1.04, 1.04, .22, 8), 'navy', Rp @ TRS((0, 0, zz)))
        pod.add(cyl(.9, .9, .08, 8), 'dark', Rp @ TRS((0, 0, 1.12)))
        for (hx, hz) in [(0, 0)] + hexpts(.52, PI / 6):
            pod.add(cyl(.17, .17, .12, 8), 'gun', Rp @ TRS((hx, hz, 1.16)))
            pod.add(lathe([(.15, 0), (.15, .08), (.11, .18), (0, .26)], 8), 'glow', Rp @ TRS((hx, hz, 1.2)))
        Acc('P3_pm' + L, 'P3_pod' + L, loc=(s * 2.55, -1.75, 7.15))
        can = Acc('P3_can' + L, 'P3_body', loc=(s * 2.5, -1.3, 5.55))
        can.add(box(.95, 1.7, .85), 'cream', TRS((s * 2.5, -1.3, 5.55)), bev=.07)
        can.add(box(.97, .9, .2), 'navy', TRS((s * 2.5, -1.05, 6.02)))
        can.add(box(.12, 1.2, .1), 'glow', TRS((s * 2.98, -1.25, 5.55)))
        for dx in (-.22, .22):
            Rc = TRS((s * 2.5 + dx, -.05, 5.55), (PI / 2, 0, 0))
            can.add(cyl(.17, .17, 5.0, 8), 'gun', Rc @ TRS((0, 0, 4.0)))
            can.add(cyl(.26, .26, .55, 8), 'gun', Rc @ TRS((0, 0, 6.3)))
            can.add(cyl(.2, .2, .08, 8), 'glow', Rc @ TRS((0, 0, 6.6)))
            for zz in (2.2, 3.4, 4.6): can.add(cyl(.22, .22, .12, 8), 'cream', Rc @ TRS((0, 0, zz)))
        Acc('P3_cm' + L, 'P3_can' + L, loc=(s * 2.5, -6.9, 5.55))
    # хребет со светящейся колонной, свисающие кабели
    B.add(box(.55, .3, 2.0), 'navy', TRS((0, 2.62, 5.55)), bev=.05)
    B.add(box(.2, .1, 1.7), 'glow', TRS((0, 2.79, 5.55)))
    for k in range(5): B.add(box(.7, .35, .16), 'metal', TRS((0, 2.62, 4.75 + k * .42)), bev=.02)
    cab = Acc('P3_cables', 'P3_body', loc=(0, 0, 3.9))
    random.seed(9)
    for k in range(9):
        x1, y1 = random.uniform(-1.3, 1.3), random.uniform(-1.2, 1.6); x2, y2 = x1 + random.uniform(-.9, .9), y1 + random.uniform(-.9, .9)
        low = random.uniform(1.7, 2.9)
        cab.add(tube([(x1, y1, 3.85), ((x1 * 2 + x2) / 3, (y1 * 2 + y2) / 3, low + .3), ((x1 + x2 * 2) / 3, (y1 + y2 * 2) / 3, low), (x2, y2, 3.85)], .08, 5, 4), 'cableR' if k % 3 else 'cableB')
    # 8 ног
    Lu, Ll = 4.4, 7.6
    az = [35, 72, 108, 145]
    i = 0
    for s in (1, -1):
        for a in az:
            ar = a * D2R; hp = (s * 2.0 * math.sin(ar), -2.3 * math.cos(ar), 4.9)
            yaw = math.atan2(-math.cos(ar), s * math.sin(ar))
            hip, knee = leg_pivots('P3', i, 'P3_body', hp, yaw, Lu, Ll, 6.6, -4.9)
            hip.add(cyl(.46, .46, .95, 8), 'dark', TRS((0, 0, 0), (PI / 2, 0, 0)), local=True)
            hip.add(box(Lu - .35, .76, .82, tx=.78, ty=.9), 'cream', TRS((Lu / 2, 0, .1)), local=True, bev=.1)
            hip.add(box(Lu - .9, .62, .34), 'navy', TRS((Lu / 2 - .1, 0, -.42)), local=True, bev=.05)
            hip.add(box(Lu - 1.1, .1, .05), 'red', TRS((Lu / 2, 0, .53)), local=True)
            hip.add(box(.6, .78, .06), 'red', TRS((Lu * .8, 0, .5), (0, -.25, 0)), local=True)
            knee.add(cyl(.44, .44, .9, 8), 'dark', TRS((0, 0, 0), (PI / 2, 0, 0)), local=True)
            knee.add(box(.9, .82, .9), 'cream', TRS((.12, 0, .26)), local=True, bev=.1)
            knee.add(box(.74, .68, Ll - 1.4, bx=.62, by=.66), 'navy', TRS((0, 0, -(Ll - 1.4) / 2 - .35)), local=True, bev=.07)
            knee.add(box(.12, .6, 2.6, bx=.8), 'cream', TRS((.36, 0, -1.9)), local=True, bev=.03)
            knee.add(box(.07, .16, 2.2), 'glow', TRS((.33, 0, -4.3)), local=True)
            knee.add(box(.5, .5, .24), 'dark', TRS((0, 0, -(Ll - 1.0))), local=True)
            knee.add(hull([(.3, .3, -(Ll - .9)), (-.3, .3, -(Ll - .9)), (.3, -.3, -(Ll - .9)), (-.3, -.3, -(Ll - .9)),
                           (.36, 0, -(Ll - .55)), (.08, 0, -Ll), (-.2, 0, -(Ll - .3))]), 'cream', local=True)
            i += 1


if os.path.exists(PH2_FILE): exec(open(PH2_FILE).read())
if os.path.exists(PH3_FILE): exec(open(PH3_FILE).read())
build_host(); build_ph1(); build_ph2(); build_ph3()


# ---------------------------------------------------------------- сборка объектов Blender
def finalize():
    for a in ORDER:
        if a.V:
            me = bpy.data.meshes.new(a.name); me.from_pydata(a.V, [], a.F); me.update()
            for m in a.mats: me.materials.append(MATS[m])
            for p, mi in zip(me.polygons, a.FM): p.material_index = mi
            if any(u is not None for u in a.UV):
                uvl = me.uv_layers.new(name='UVMap')
                for p, u in zip(me.polygons, a.UV):
                    for k, li in enumerate(p.loop_indices): uvl.data[li].uv = u[k] if u is not None else (0, 0)
            if not a.norecalc:
                bm = bmesh.new(); bm.from_mesh(me); bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
                bm.to_mesh(me); bm.free()
            ca = me.color_attributes.new('Color', 'BYTE_COLOR', 'CORNER')
            for p in me.polygons:
                mname = a.mats[p.material_index]
                b = 1.0 if mname in NOJIT else random.uniform(.9, 1.0)
                for li in p.loop_indices: ca.data[li].color = (b, b, b, 1)
            try: me.color_attributes.active_color = ca
            except Exception: pass
            for p in me.polygons: p.use_smooth = False
            ob = bpy.data.objects.new(a.name, me)
        else:
            ob = bpy.data.objects.new(a.name, None); ob.empty_display_size = .2
        scene.collection.objects.link(ob); a.obj = ob
    for a in ORDER:
        ob = a.obj
        if a.parent:
            P = ACC[a.parent]; ob.parent = P.obj; ob.matrix_parent_inverse = Matrix()
            ob.matrix_basis = P.W.inverted() @ a.W
        else:
            ob.matrix_basis = a.W
    bpy.context.view_layer.update()

finalize()
tris = {}
for root in ('HOST', 'PH1', 'PH2', 'PH3'):
    n = 0
    for a in ORDER:
        r = a
        while r.parent: r = ACC[r.parent]
        if r.name == root: n += sum(len(f) - 2 for f in a.F)
    tris[root] = n
print('tris', tris)

bpy.ops.object.select_all(action='SELECT')
bpy.ops.export_scene.gltf(filepath=os.path.join(OUT, 'pep.glb'), export_format='GLB', use_selection=True, export_apply=False,
                          export_vertex_color='NONE', export_texcoords=True, export_normals=False, export_animations=False, export_yup=True)
print('exported')


# ---------------------------------------------------------------- превью
if VIEWS:
    HIDDEN = set()

    def host_copy(seat, hide_hips=False, sc=1.0):
        cp = {}
        for a in ORDER:
            r = a
            while r.parent: r = ACC[r.parent]
            if r.name != 'HOST': continue
            o = a.obj.copy(); scene.collection.objects.link(o); cp[a.name] = o
        for nm, o in cp.items():
            a = ACC[nm]
            if a.parent and a.parent in cp: o.parent = cp[a.parent]; o.matrix_parent_inverse = Matrix()
        root = cp['HOST']; root.parent = ACC[seat].obj; root.matrix_parent_inverse = Matrix(); root.matrix_basis = Matrix.Scale(sc, 4)
        if hide_hips: HIDDEN.add(cp['H_hips'])
        cp['H_jaw'].rotation_euler = (.25, 0, 0)
        return list(cp.values())

    def head_copy(seat, sc, tilt=-.35):
        """Фаза II: на длинную шею фазы садится только голова хоста (с челюстью)."""
        hd = ACC['H_head'].obj.copy(); jw = ACC['H_jaw'].obj.copy()
        for o in (hd, jw): scene.collection.objects.link(o)
        hd.parent = ACC[seat].obj; hd.matrix_parent_inverse = Matrix(); hd.matrix_basis = Euler((tilt, 0, 0)).to_matrix().to_4x4() @ Matrix.Scale(sc, 4)
        jw.parent = hd; jw.matrix_parent_inverse = Matrix(); jw.matrix_basis = ACC['H_head'].W.inverted() @ ACC['H_jaw'].W; jw.rotation_euler = (.3, 0, 0)
        return [hd, jw]

    extra = {'1': host_copy('P1_seat', sc=1.5), '2': head_copy('P2_seat', 4.0, 0.0), '3': host_copy('P3_seat', sc=1.9)}
    ACC['H_jaw'].obj.rotation_euler = (.25, 0, 0)

    def roots_of(tag):
        name = {'h': 'HOST', '1': 'PH1', '2': 'PH2', '3': 'PH3'}[tag]; objs = []
        for a in ORDER:
            r = a
            while r.parent: r = ACC[r.parent]
            if r.name == name: objs.append(a.obj)
        return objs + extra.get(tag, [])

    allobj = [a.obj for a in ORDER] + sum(extra.values(), [])
    w = bpy.data.worlds.new('w'); scene.world = w; w.use_nodes = True
    w.node_tree.nodes['Background'].inputs[0].default_value = (.035, .03, .04, 1)
    bpy.ops.object.light_add(type='SUN'); sun = bpy.context.active_object; sun.data.energy = 3.2; sun.rotation_euler = (.9, .2, -.6)
    bpy.ops.object.light_add(type='SUN'); rim = bpy.context.active_object; rim.data.energy = 2.0; rim.rotation_euler = (1.1, 0, 2.6)
    bpy.ops.object.light_add(type='SUN'); fil = bpy.context.active_object; fil.data.energy = .8; fil.rotation_euler = (1.2, 0, .9)
    scene.render.engine = 'CYCLES'; scene.cycles.samples = 16; scene.cycles.device = 'CPU'
    try: scene.cycles.use_denoising = True
    except Exception: pass
    scene.render.film_transparent = False
    bpy.ops.object.camera_add(); cam = bpy.context.active_object; scene.camera = cam; cam.data.lens = 50
    SPEC = {'h': (V((0, -.2, .28)), 3.0, 1.65), '1': (V((0, 0, 3.0)), 11.5, 8.0), '2': (V((0, 0, 4.05)), 16.0, 8.7), '3': (V((0, -.5, 7.4)), 30.0, 25.0)}
    from PIL import Image
    for tag in VIEWS:
        vis = set(roots_of(tag))
        for o in allobj: o.hide_render = (o not in vis) or (o in HIDDEN)
        ctr, dist, size = SPEC[tag]; shots = []
        for k, (azd, el) in enumerate(((0, 8), (35, 14), (90, 6), (180, 10))):
            a = azd * D2R; e = el * D2R
            p = ctr + V((math.sin(a) * math.cos(e), -math.cos(a) * math.cos(e), math.sin(e))) * dist
            cam.location = p; cam.rotation_euler = (ctr - p).to_track_quat('-Z', 'Y').to_euler()
            cam.data.type = 'ORTHO'; cam.data.ortho_scale = size
            scene.render.resolution_x, scene.render.resolution_y = (520, 640) if tag in 'h2' else (640, 520)
            fp = os.path.join(OUT, 'prev_%s_%d.png' % (tag, k)); scene.render.filepath = fp
            bpy.ops.render.render(write_still=True); shots.append(fp)
        ims = [Image.open(f) for f in shots]; W_, H_ = ims[0].size
        sheet = Image.new('RGB', (W_ * 4, H_))
        for k, im in enumerate(ims): sheet.paste(im, (k * W_, 0))
        sheet.save(os.path.join(OUT, 'sheet_%s.png' % tag))
print('done')
