# Старик Пепсштейн (хост), сидячая поза — исполняется из pepsstein.py (exec), переопределяет build_host().
# Голова, шея, кисти и стопы — метаболы с прореживанием (гранёный «скульпт» как на референсе),
# мантия — лофт-кольца и листы ткани с полосами (крем, синий, красный, золотой кант).

ROBE_BANDS = [(21, 'cream'), (23, 'gold'), (31, 'red'), (33, 'gold'), (68, 'navy'), (70, 'gold'), (108, 'cream'), (110, 'gold'),
              (160, 'navy'), (162, 'gold'), (180, 'red')]


def host_head_geo():
    """Голова в своих координатах (лицо к −Y): череп, челюсть отдельно, зубы, глаза, очки, космы."""
    random.seed(5); parts = []
    H = MB(res=.003)
    H.ell((0, .02, .062), (.066, .09, .072))
    H.ball((0, .058, .04), .05)
    H.ell((0, -.028, .055), (.06, .066, .066))
    H.ell((0, -.042, .0), (.052, .05, .062))
    H.cap((-.028, -.077, .061), (.028, -.077, .061), .015)
    for s in (-1, 1):
        H.ball((s * .052, -.05, .018), .024)
        H.cap((s * .052, -.05, .018), (s * .066, -.006, .02), .011)
        H.cap((s * .058, -.012, .006), (s * .046, -.042, -.06), .013)
        H.ball((s * .03, -.075, .04), .021, neg=True)
        H.ball((s * .042, -.066, -.03), .024, neg=True, st=1.4)
        H.ball((s * .064, -.026, .056), .02, neg=True)
        H.ell((s * .071, .004, .02), (.012, .027, .04))
        H.ball((s * .013, -.088, -.008), .009)
    H.ell((0, -.06, -.02), (.036, .04, .03))
    H.cap((0, -.08, .05), (0, -.1, .0), .0102)
    H.ball((0, -.099, -.004), .0122)
    H.cap((-.02, -.085, -.031), (.02, -.085, -.031), .0072)
    H.ell((0, -.084, -.05), (.03, .036, .019), neg=True)
    H.cap((0, .03, -.03), (0, .03, -.07), .026)
    parts.append(('head', H.mesh(.055), 'skin'))
    J = MB(res=.0028)
    J.ball((0, -.074, -.09), .017)
    for s in (-1, 1): J.cap((s * .012, -.077, -.086), (s * .043, -.045, -.068), .0115)
    J.cap((-.018, -.082, -.072), (.018, -.082, -.072), .0068)
    J.ell((0, -.056, -.074), (.032, .03, .011))
    parts.append(('jaw', J.mesh(.13), 'skin'))
    v, f = sphere(8, 6)
    parts.append(('head', ([(x * .028, y * .022 - .06, z * .02 - .05) for x, y, z in v], f), 'mouth'))
    for i in range(8):
        t = (i - 3.5) / 3.5; vv, ff = box(.0058, .006, .012 + random.uniform(-.002, .002)); M_ = TRS((t * .021, -.081 + abs(t) * .013, -.039), (0, 0, t * .6))
        parts.append(('head', ([tuple(M_ @ V(p)) for p in vv], ff), 'gold'))
    for i in range(7):
        t = (i - 3) / 3; vv, ff = box(.0058, .006, .0095); M_ = TRS((t * .019, -.078 + abs(t) * .012, -.064), (0, 0, t * .6))
        parts.append(('jaw', ([tuple(M_ @ V(p)) for p in vv], ff), 'gold'))
    for s in (-1, 1):
        vv, ff = sphere(8, 6); parts.append(('head', ([(x * .0088 + s * .03, y * .0088 - .074, z * .0088 + .041) for x, y, z in vv], ff), 'eye'))
        cx = s * .031; y = -.095; z = .042
        for (dx, dz, w, h) in ((0, .0105, .032, .0019), (0, -.0105, .032, .0019), (-.016, 0, .0019, .022), (.016, 0, .0019, .022)):
            vv, ff = box(w, .0019, h); parts.append(('head', ([(x + cx + dx, y_ + y, z_ + z + dz) for x, y_, z_ in vv], ff), 'gold'))
        parts.append(('head', tube([(s * .047, -.094, .046), (s * .064, -.068, .05), (s * .07, -.02, .036)], .0012, 4, 2), 'gold'))
    vv, ff = box(.03, .0019, .0019); parts.append(('head', ([(x, y - .096, z + .046) for x, y, z in vv], ff), 'gold'))

    # космы: объёмная шапка волос на висках и затылке (лысая макушка открыта) + гранёные пряди-«шипы» назад и в стороны
    HM = MB(res=.003)
    for sd in (-1, 1):
        HM.ell((sd * .058, .03, .036), (.024, .05, .048))
        HM.ell((sd * .05, .072, .03), (.03, .04, .05))
    HM.ell((0, .1, .02), (.05, .03, .05)); HM.ell((0, .085, -.02), (.045, .035, .04))
    parts.append(('head', HM.mesh(.08), 'hair'))
    def spike(b, d, L, w):
        d = V(d).normalized(); up = V((0, 0, 1)) if abs(d.z) < .9 else V((1, 0, 0)); u = d.cross(up).normalized(); v = u.cross(d).normalized()
        b = V(b); tip = b + d * L + v * L * .18
        P_ = [b + u * w, b + v * w * .6, b - u * w, b - v * w * .6]
        return [tuple(p) for p in P_] + [tuple(tip)], [(3, 2, 1, 0), (0, 1, 4), (1, 2, 4), (2, 3, 4), (3, 0, 4)]
    for k in range(64):
        sd = -1 if k % 2 else 1; t = random.random()
        az = math.radians(60 + t * 115) * sd; z = random.uniform(-.03, .075) - (.02 if t > .8 else 0)
        base = V((math.sin(az) * .062, math.cos(az) * .078 + .03, z))
        out = V((math.sin(az), math.cos(az) * .9 + .55, random.uniform(-.2, .55))).normalized()
        L = random.uniform(.05, .11) * (1.2 if .2 < t < .7 else 1)
        parts.append(('head', spike(base, out, L, random.uniform(.013, .022)), 'hair'))
    return parts


def host_hand(s, wrist, scale=1.0):
    """Костлявая кисть, лежащая на подлокотнике; пальцы свисают через край. Возвращает (меш кожи, перстни)."""
    W = V(wrist); Hm = MB(res=.0026); rings = []; K_ = scale
    Hm.ell(tuple(W + V((0, -.035, -.005)) * 1), (.028 * K_, .036 * K_, .011 * K_))
    for k in range(4):
        x = (k - 1.5) * .0145 * s * K_; b = W + V((x, -.068 * K_, -.006)); p1 = b + V((x * .12, -.036 * K_, -.004 * K_)); p2 = p1 + V((0, -.026 * K_, -.022 * K_)); p3 = p2 + V((0, -.006 * K_, -.026 * K_))
        Hm.ball(tuple(b), .0082 * K_); Hm.cap(tuple(b), tuple(p1), .0062 * K_); Hm.ball(tuple(p1), .0062 * K_); Hm.cap(tuple(p1), tuple(p2), .0055 * K_); Hm.cap(tuple(p2), tuple(p3), .0048 * K_)
        if k in (0, 1, 3): rings.append((b * .45 + p1 * .55, (p1 - b).normalized(), k == 1))
    t0 = W + V((-s * .026 * K_, -.03 * K_, -.008)); t1 = t0 + V((-s * .014 * K_, -.03 * K_, -.006 * K_)); t2 = t1 + V((-s * .004 * K_, -.022 * K_, -.014 * K_))
    Hm.cap(tuple(t0), tuple(t1), .0075 * K_); Hm.cap(tuple(t1), tuple(t2), .006 * K_)
    Hm.cap(tuple(W + V((0, .03, .004))), tuple(W), .019 * K_)
    return Hm.mesh(.2), rings


def build_host():
    Acc('HOST')
    hips = Acc('H_hips', 'HOST', loc=(0, 0, .1))
    tor = Acc('H_torso', 'HOST', loc=(0, .02, .12))
    HT = TRS((0, -.19, .835), (-.1, 0, 0)) @ Matrix.Translation(V((0, .02, -.05))) @ Matrix.Scale(1.15, 4) @ Matrix.Translation(V((0, -.02, .05)))
    att = HT @ V((0, .02, -.05)); hinge = HT @ V((0, -.02, -.035))
    neck = Acc('H_neck', 'H_torso', loc=(0, -.075, .585))
    head = Acc('H_head', 'H_neck', loc=tuple(att))
    jaw = Acc('H_jaw', 'H_head', loc=tuple(hinge))
    for who, (vv, ff), m in host_head_geo():
        (head if who == 'head' else jaw).add((vv, ff), m, HT)
    # --- шея: длинная, жилистая, с кадыком
    Nk = MB(res=.003)
    Nk.cap((0, -.07, .56), (0, -.17, .775), .033)
    for s in (-1, 1): Nk.cap((s * .038, -.158, .77), (s * .014, -.1, .6), .0098)
    Nk.ball((0, -.14, .675), .013); Nk.cap((0, -.11, .6), (0, -.155, .74), .016)
    neck.add(Nk.mesh(.12), 'skin')
    # --- торс в мантии
    rings = [(.05, .03, .165, .12, .12, 2.6), (.2, .025, .168, .125, .12, 2.6), (.34, .01, .176, .125, .13, 2.6), (.45, -.005, .19, .115, .14, 2.4),
             (.52, -.02, .19, .105, .135, 2.2), (.575, -.035, .15, .09, .11, 2.0), (.61, -.05, .08, .065, .07, 2.0)]
    v, f, fm = ring_loft(rings, ROBE_BANDS, cap_bottom=True, cap_top=True)
    tor.addm(v, f, fm)
    # широкий кремовый воротник-шаль с золотым кантом: стоит сзади, спускается лацканами на грудь
    G = []
    phis = [28 + i * (304 / 30) for i in range(31)]
    for rr in (.072, .08, .16, .225, .238):
        row = []
        for p in phis:
            s_ = 1 - abs(p - 180) / 152; t = math.radians(p)
            if rr < .1: z = .5 + .23 * s_ ** .55
            elif rr < .17: z = .545 + .16 * s_ ** .7
            else: z = .5 + .05 * s_ - .1 * (1 - s_) ** 2
            r_ = rr - (.09 * (1 - s_) ** 2 if rr > .17 else 0)
            row.append((r_ * math.sin(t), -.05 - r_ * math.cos(t) * (.95 if math.cos(t) < 0 else 1), z))
        G.append(row)
    G = [list(x) for x in zip(*G)]
    v, f, fm = sheet(G, .014, lambda i, j: 'gold' if i in (0, 3) else 'cream')
    tor.addm(v, f, fm)
    # ящик с камнем на груди, кольцо на шее, кабели, позвоночник
    tor.add(box(.07, .05, .07), 'metal', TRS((0, -.158, .5)), bev=.007)
    tor.add(box(.05, .012, .05), 'dark', TRS((0, -.184, .5)))
    tor.add(hull([(0, 0, .02), (0, 0, -.02), (.02, 0, 0), (-.02, 0, 0), (0, -.014, 0), (0, .01, 0)]), 'gem', TRS((0, -.19, .5)))
    tor.add(torus(.047, .009, 14, 5), 'metal', TRS((0, -.095, .645), (.35, 0, 0)))
    for s, m, o in ((-1, 'cableR', 0), (1, 'cableR', 0), (-1, 'cableB', .016), (1, 'cableB', .016)):
        tor.add(tube([(s * .03, -.16, .52), (s * (.075 + o), -.13, .6), (s * (.095 + o), -.05, .68), (s * (.07 + o), .07, .69), (s * (.04 + o), .15, .6), (s * (.055 + o), .16, .38), (s * (.06 + o), .15, .16)], .0105, 5, 3), m)
    for i in range(8):
        z = .6 - i * .06; y = .13 + .018 * math.sin(min(1, i / 4) * PI / 2)
        tor.add(box(.056, .045, .042), 'metal', TRS((0, y, z)), bev=.005)
        tor.add(box(.015, .012, .015), 'glow', TRS((0, y + .025, z)))
        if i < 7: tor.add(cyl(.012, .012, .03, 6), 'dark', TRS((0, y, z - .035)))
    # --- руки: рукава (верхний синий, нижний — широкий кремовый колокол), кисти с перстнями
    for s, L in ((1, 'L'), (-1, 'R')):
        sh = (s * .18, -.01, .52); el = (s * .245, .02, .26); wr = (s * .29, -.27, .2)
        arm = Acc('H_arm' + L, 'H_torso', loc=sh); fore = Acc('H_fore' + L, 'H_arm' + L, loc=el); hand = Acc('H_hand' + L, 'H_fore' + L, loc=wr)
        v, f, fm = tube_loft([(s * .18, -.01, .55), (s * .222, 0, .41), (s * .245, .02, .25)], [.062, .07, .08], ['navy', 'navy', 'navy', 'red', 'gold'], n=10)
        arm.addm(v, f, fm)
        v, f, fm = tube_loft([(s * .245, .03, .27), (s * .265, -.07, .25), (s * .28, -.14, .17), (s * .285, -.165, .04)], [.08, .108, .138, .16], ['cream', 'cream', 'cream', 'cream', 'cream', 'navy', 'red', 'gold'], n=12)
        fore.addm(v, f, fm)
        Fm = MB(res=.0028); Fm.cap((s * .282, -.12, .225), (s * .29, -.268, .2), .021); fore.add(Fm.mesh(.2), 'skin')
        (hv, hf), rings_ = host_hand(s, wr, 1.4); hand.add((hv, hf), 'skin')
        for c, d, gem in rings_:
            q = V((0, 0, 1)).rotation_difference(d).to_matrix().to_4x4()
            hand.add(torus(.0078 * 1.4, .0028 * 1.4, 10, 4), 'gold', Matrix.Translation(c) @ q)
            if gem: hand.add(hull([(0, 0, .0045), (.004, 0, 0), (-.004, 0, 0), (0, .004, 0), (0, -.004, 0), (0, 0, -.001)]), 'gem', Matrix.Translation(c + V((0, 0, .009))))
    # --- колени и спадающий перед мантии, боковые полы, босые стопы
    path = [(.05, .12), (-.1, .165), (-.27, .17), (-.41, .14), (-.49, .04), (-.52, -.14), (-.54, -.31), (-.548, -.43), (-.55, -.46)]
    ws = [.17, .19, .2, .21, .215, .222, .232, .238, .24]
    xb = [0, .03, .06, .067, .09, .097, .13, .16]
    def mat_x(ax):
        return 'cream' if ax < .06 else 'gold' if ax < .067 else 'red' if ax < .09 else 'gold' if ax < .097 else 'navy'
    G = []; cols = None
    for j, ((y, z), w) in enumerate(zip(path, ws)):
        xs = sorted(set([-w] + [-b for b in xb[1:]] + xb + [w]))
        cols = xs; row = []
        for x in xs:
            u = x / w; yy, zz = y, z
            if j <= 3: zz -= .1 * u * u
            else:
                yy += .11 * u * u; A = .006 * (j - 3); yy -= A * math.sin(x / .035 + j * .9)
            row.append((x, yy, zz))
        G.append(row)
    def mat_lap(i, j):
        if j == len(path) - 2: return 'gold'
        return mat_x(abs((cols[i] + cols[i + 1]) / 2))
    v, f, fm = sheet(G, .016, mat_lap); hips.addm(v, f, fm)
    for s in (-1, 1):
        G2 = []
        for k in range(5):
            row = []
            for t in range(7):
                y = .06 - t * .08; jz = .13 - .1 - (.03 if y < -.3 else 0)
                z = jz + (-.46 - jz) * k / 4; x = s * (.18 + .03 * k / 4 + .01 * math.sin(y / .05 + k))
                row.append((x, y, z))
            G2.append(row)
        v, f, fm = sheet(G2, .014, lambda i, j: 'gold' if j == 3 else 'navy'); hips.addm(v, f, fm)
    for s in (-1, 1):
        Ft = MB(res=.0028); c = V((s * .09, -.6, -.455))
        Ft.ell(tuple(c), (.026, .055, .016)); Ft.cap(tuple(c + V((0, .05, .005))), tuple(c + V((0, .07, .05))), .014)
        for t in range(5): Ft.ball(tuple(c + V(((t - 2) * .0105 * s, -.058, -.004))), .0068)
        hips.add(Ft.mesh(.2), 'skin')
