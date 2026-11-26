# Старик Пепсштейн (хост), сидячая поза — исполняется из pepsstein.py (exec), переопределяет build_host().
# Голова, шея, кисти и стопы — метаболы с прореживанием (гранёный «скульпт» как на референсе),
# мантия — лофт-кольца и листы ткани с полосами (крем, синий, красный, золотой кант).

ROBE_BANDS = [(25, 'cream'), (27, 'gold'), (37, 'red'), (39, 'gold'), (82, 'navy'), (84, 'gold'), (146, 'cream'), (148, 'gold'),
              (166, 'navy'), (168, 'gold'), (180, 'red')]


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
        HM.ell((sd * .06, .03, .045), (.026, .058, .055))
        HM.ell((sd * .052, .075, .035), (.034, .045, .06))
        HM.ell((sd * .064, -.005, .03), (.018, .03, .04))
    HM.ell((0, .102, .035), (.058, .034, .06)); HM.ell((0, .088, -.015), (.05, .036, .042)); HM.ell((0, .07, .085), (.05, .04, .03))
    parts.append(('head', HM.mesh(.1), 'hair'))
    def lock(b, d, L, w):
        """Плоская прядь-клин: широкое основание, кончик загнут к затылку."""
        d = V(d).normalized(); up = V((0, 0, 1)) if abs(d.z) < .9 else V((1, 0, 0)); u = d.cross(up).normalized(); v = u.cross(d).normalized()
        b = V(b); mid = b + d * L * .55 + v * L * .06; tip = b + d * L + v * L * .14
        P_ = [b + u * w, b + v * w * .45, b - u * w, b - v * w * .45, mid + u * w * .45, mid - u * w * .45]
        vv = [tuple(p) for p in P_] + [tuple(tip)]
        return vv, [(3, 2, 1, 0), (0, 1, 4), (1, 2, 5, 4), (2, 3, 5), (3, 0, 4, 5), (4, 6, 5), (1, 6, 4), (1, 5, 6)]
    for k in range(84):
        sd = -1 if k % 2 else 1; t = random.random(); tier = k % 3
        az = math.radians(78 + t * 100) * sd
        z = (.0, .042, .08)[tier] + random.uniform(-.014, .014)
        rr = (.066, .072, .062)[tier]
        base = V((math.sin(az) * rr, math.cos(az) * (rr + .025) + .035, z))
        side = abs(math.sin(az))
        d = V((sd * (.35 + .5 * side) * random.uniform(.7, 1.1), 1.0, (-.28, .06, .32)[tier] + random.uniform(-.12, .12)))
        L = random.uniform(.06, .11) * (1.2 if tier == 1 else 1) * (1.15 if .3 < t < .8 else 1)
        parts.append(('head', lock(base, d, L, random.uniform(.016, .026)), 'hair'))
    for k in range(52):
        x = random.uniform(-.056, .056); z = random.uniform(-.025, .095); q = 1 - (x / .06) ** 2 - ((z - .035) / .064) ** 2
        y = .1 + .036 * math.sqrt(max(0.0, q)) - .004
        d = V((x * 6 + random.uniform(-.2, .2), 1.0, (z - .035) * 5 - .15 + random.uniform(-.2, .2)))
        parts.append(('head', lock((x, y, z), d, random.uniform(.05, .1), random.uniform(.016, .024)), 'hair'))
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
    tor.add(box(.105, .062, .1), 'metal', TRS((0, -.162, .5)), bev=.01)
    tor.add(box(.074, .014, .07), 'dark', TRS((0, -.196, .5)))
    for x in (-.048, .048): tor.add(box(.012, .07, .11), 'gun', TRS((x, -.165, .5)))
    tor.add(box(.12, .07, .012), 'gun', TRS((0, -.165, .553)))
    tor.add(hull([(0, 0, .028), (0, 0, -.028), (.026, 0, 0), (-.026, 0, 0), (0, -.018, 0), (0, .01, 0)]), 'gem', TRS((0, -.205, .5)))
    tor.add(torus(.054, .015, 18, 6), 'metal', TRS((0, -.095, .64), (.35, 0, 0)))
    for k in range(10):
        a = k * 2 * PI / 10; tor.add(box(.026, .03, .036), 'gun', TRS((0, -.095, .64), (.35, 0, 0)) @ TRS((.067 * math.cos(a), .067 * math.sin(a), 0), (0, 0, a)))
    tor.add(box(.03, .03, .1), 'gun', TRS((0, -.15, .575), (.3, 0, 0)))
    for s, m, o, r in ((-1, 'cableR', 0, .017), (1, 'cableR', 0, .017), (-1, 'cableB', .03, .014), (1, 'cableB', .03, .014), (-1, 'cableR', .058, .011), (1, 'cableR', .058, .011)):
        tor.add(tube([(s * .035, -.17, .53), (s * (.075 + o), -.16, .62), (s * (.11 + o), -.11, .73), (s * (.125 + o), -.01, .77), (s * (.1 + o), .09, .71),
                      (s * (.06 + o * .5), .15, .6), (s * (.045 + o * .5), .165, .42), (s * (.05 + o * .5), .16, .2)], r, 6, 4), m)
    for i in range(9):
        z = .62 - i * .058; y = .14 + .02 * math.sin(min(1, i / 4) * PI / 2)
        tor.add(box(.074, .056, .044), 'metal', TRS((0, y, z)), bev=.006)
        tor.add(box(.05, .02, .026), 'gun', TRS((0, y + .03, z)))
        tor.add(box(.022, .016, .018), 'glow', TRS((0, y + .042, z)))
        if i < 8: tor.add(cyl(.016, .016, .03, 6), 'dark', TRS((0, y, z - .035)))
        for sx in (-1, 1): tor.add(box(.012, .03, .03), 'gun', TRS((sx * .045, y, z)))
    # позвонки на загривке (поверх шеи) и обруч-фиксатор
    for i in range(5):
        u = i / 4; pz = .6 + .15 * u; py = -.03 - .095 * u + .04
        neck.add(box(.04, .03, .03), 'metal', TRS((0, py, pz), (-.45, 0, 0)), bev=.004)
        neck.add(box(.014, .012, .012), 'glow', TRS((0, py + .018, pz), (-.45, 0, 0)))
    neck.add(torus(.04, .008, 14, 5), 'gun', TRS((0, -.12, .69), (.45, 0, 0)))
    # --- руки: рукава (верхний синий, нижний — широкий кремовый колокол), кисти с перстнями
    for s, L in ((1, 'L'), (-1, 'R')):
        sh = (s * .18, -.01, .52); el = (s * .245, .02, .26); wr = (s * .29, -.27, .2)
        arm = Acc('H_arm' + L, 'H_torso', loc=sh); fore = Acc('H_fore' + L, 'H_arm' + L, loc=el); hand = Acc('H_hand' + L, 'H_fore' + L, loc=wr)
        v, f, fm = tube_loft([(s * .18, -.01, .55), (s * .222, 0, .41), (s * .245, .02, .25)], [.066, .074, .084], ['cream', 'cream', 'navy', 'navy', 'red', 'gold'], n=12)
        arm.addm(v, f, fm)
        v, f, fm = tube_loft([(s * .245, .035, .27), (s * .258, -.04, .248), (s * .272, -.12, .232), (s * .284, -.2, .224)], [.082, .088, .094, .1],
                             ['cream', 'cream', 'cream', 'cream', 'cream', 'navy', 'red', 'gold'], n=14, droop=[0, .015, .03, .04])
        fore.addm(v, f, fm)
        # широкое полотнище рукава свисает из-под предплечья до колен (как на референсе)
        G3 = []
        for j in range(6):
            u = j / 5; row = []
            for i in range(8):
                w_ = i / 7; y = .03 - .245 * w_; ztop = .2 - .02 * w_
                z = ztop + (-.16 - .12 * w_ * w_ - ztop) * u
                x = s * (.3 + .035 * u + .008 * math.sin(i * 1.7 + j))
                row.append((x, y + .02 * u * math.sin(i * 2.1), z))
            G3.append(row)
        v, f, fm = sheet(G3, .012, lambda i, j: 'gold' if j == 4 else 'red' if j == 3 else 'navy' if j == 2 else 'cream')
        fore.addm(v, f, fm)
        Fm = MB(res=.0028); Fm.cap((s * .282, -.14, .222), (s * .29, -.268, .2), .019); fore.add(Fm.mesh(.2), 'skin')
        fore.add(torus(.024, .006, 12, 4), 'gold', TRS((s * .287, -.225, .212), (PI / 2, 0, 0)))
        (hv, hf), rings_ = host_hand(s, wr, 1.4); hand.add((hv, hf), 'skin')
        for c, d, gem in rings_:
            q = V((0, 0, 1)).rotation_difference(d).to_matrix().to_4x4()
            hand.add(torus(.0078 * 1.4, .0028 * 1.4, 10, 4), 'gold', Matrix.Translation(c) @ q)
            if gem: hand.add(hull([(0, 0, .0045), (.004, 0, 0), (-.004, 0, 0), (0, .004, 0), (0, -.004, 0), (0, 0, -.001)]), 'gem', Matrix.Translation(c + V((0, 0, .009))))
    # --- колени и спадающий перед мантии, боковые полы, босые стопы
    path = [(.05, .12), (-.1, .165), (-.27, .17), (-.41, .14), (-.49, .04), (-.52, -.14), (-.54, -.31), (-.548, -.43), (-.55, -.46)]
    ws = [.232, .24, .245, .25, .254, .258, .262, .266, .27]
    xb = [0, .035, .065, .072, .1, .107, .14, .178, .186, .22]
    def mat_x(ax):
        return 'cream' if ax < .065 else 'gold' if ax < .072 else 'red' if ax < .1 else 'gold' if ax < .107 else 'navy' if ax < .178 else 'gold' if ax < .186 else 'cream'
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
                z = jz + (-.46 - jz) * k / 4; x = s * (.23 + .035 * k / 4 + .01 * math.sin(y / .05 + k))
                row.append((x, y, z))
            G2.append(row)
        v, f, fm = sheet(G2, .014, lambda i, j: 'gold' if j == 3 else 'cream'); hips.addm(v, f, fm)
    for s in (-1, 1):
        Ft = MB(res=.0028); c = V((s * .09, -.6, -.455))
        Ft.ell(tuple(c), (.026, .055, .016)); Ft.cap(tuple(c + V((0, .05, .005))), tuple(c + V((0, .07, .05))), .014)
        for t in range(5): Ft.ball(tuple(c + V(((t - 2) * .0105 * s, -.058, -.004))), .0068)
        hips.add(Ft.mesh(.2), 'skin')
