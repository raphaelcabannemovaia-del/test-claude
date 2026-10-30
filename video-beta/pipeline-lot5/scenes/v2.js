// Vidéo 2 – « Le fichier acquéreurs qui s'éteint »
(function () {
  const SW = wt('h2', 'personne');
  const W = { A: [0, S.h4.start - .25], D: [S.h4.start - .25, S.b1.start - .25], B: [S.b1.start - .25, S.s2.start - .3], C: [S.s2.start - .3, S.r.start - .3], R: [S.r.start - .3, S.c1.start - .35], E: [S.c1.start - .35, TL.total + 1] };

  // A : le bon bien arrive, les acheteurs ont été oubliés
  const sA = mkScene('sA');
  const mc = el('div', 'glass', `<div class="gh"><div class="mini" style="font-size:34px">+</div>Nouveau mandat · aujourd’hui</div><div class="pill g" style="right:30px;top:22px">Exclusif</div><div style="position:absolute;left:34px;top:104px;font-family:Jakarta;font-weight:800;font-size:50px;letter-spacing:-1px">Maison 5 pièces · jardin</div>`,
    'left:70px;top:540px;width:940px;height:200px;border-color:rgba(46,230,166,.6);transform-origin:50% 50%', sA);
  const ACQ = [['M. Durand', '5 mois'], ['Mme Martin', '7 mois'], ['M. Leroy', '4 mois']];
  const al = el('div', 'glass', `<div class="gh" style="color:#E9EFF6">Acquéreurs correspondants : 3</div>` + ACQ.map(([n, d], i) => `<div class="ar" style="position:absolute;left:34px;top:${104 + i * 86}px;width:872px;display:flex;align-items:center;gap:16px;font-size:30px;opacity:0"><b style="font-weight:600">${n}</b><span style="color:var(--muted)">· maison + jardin</span><em style="margin-left:auto;font-style:normal;font-size:26px">Relance : il y a ${d}</em></div>`).join(''),
    'left:70px;top:780px;width:940px;height:370px', sA);
  const aKeys = [wt('h2', 'acheteurs'), wt('h2', 'cherchaient'), wt('h2', 'cherchaient') + .35];
  const P = [['M. Leroy · a acheté ailleurs', wt('h3', 'acheté'), 70], ['Mme Martin · projet changé', wt('h3', 'changé'), 170], ['Fiche jamais mise à jour', wt('h3', 'ignore'), 110]];
  const pills = P.map(([s, , x], i) => el('div', 'alert', `<i>!</i>${s}`, `left:${x}px;top:${1190 + i * 92}px`, sA));
  function rA(t) {
    const [sx, sy] = shakeAt(t, SW, 12);
    const z = inout((t - .05) / 1.1);
    mc.style.opacity = ease((t - .05) / .4);
    mc.style.transform = `translate(${sx}px,${sy}px) scale(${lerp(1.45, 1, z)})`;
    mc.style.borderColor = t > SW ? 'rgba(255,77,79,.5)' : 'rgba(46,230,166,.6)';
    ap(al, t, S.h2.start - .2, .45, { y: 40, dx: sx, dy: sy });
    al.style.borderColor = t > SW ? 'rgba(255,77,79,.7)' : 'rgba(160,210,235,.28)';
    al.querySelectorAll('.ar').forEach((r, i) => {
      const p = ease((t - aKeys[i]) / .35);
      r.style.opacity = p;
      r.style.transform = `translateX(${(1 - p) * -30}px)`;
      const em = r.querySelector('em');
      const txt = i === 2 && t > P[0][1] ? 'A acheté ailleurs' : i === 1 && t > P[1][1] ? 'Projet changé' : `Relance : il y a ${ACQ[i][1]}`;
      if (em.textContent !== txt) em.textContent = txt;
      em.style.color = t > SW ? '#FF8A8C' : 'var(--muted)';
    });
    pills.forEach((e, i) => ap(e, t, P[i][1] - .1, .4, { x: i % 2 ? 60 : -60, y: 0, s: .9, blur: 10 }));
  }

  // D : la double saisie
  const sD = mkScene('sD');
  const FIELDS = ['Nom : M. Durand', 'Recherche : maison + jardin', 'Budget : 420 k€'];
  const win = ['CRM', 'Tableur'].map((n, i) => el('div', 'glass', `<div class="gh" style="color:#E9EFF6">${n}</div>` + FIELDS.map((f, j) => `<div class="fd" style="position:absolute;left:30px;top:${104 + j * 92}px;width:390px;height:70px;border-radius:14px;background:rgba(255,255,255,.05);border:1.5px solid var(--line);padding:16px 18px;font-size:26px;white-space:nowrap;overflow:hidden"></div>`).join(''),
    `left:${70 + i * 485}px;top:640px;width:455px;height:420px`, sD));
  const tw = [S.h4.start - .1, wt('h4', 'ressaisir') - .1];
  const twice = el('div', 'alert', '<i>×2</i>Deux fois la même saisie', 'left:220px;top:1120px', sD);
  function rD(t) {
    win.forEach((w, i) => {
      ap(w, t, W.D[0] + .05 + i * .15, .4, { y: 40 });
      const fds = w.querySelectorAll('.fd');
      let acc = tw[i];
      FIELDS.forEach((f, j) => {
        typeText(fds[j], f, t, acc, 40, t > acc && t < acc + f.length / 40 + .2, null);
        acc += f.length / 40 + .08;
      });
    });
    ap(twice, t, wt('h4', 'deux') - .1, .4, { y: 20, s: .9, blur: 10 });
  }

  // B : pont vers le logo
  const sB = mkScene('sB');
  const BR = mkBridge(sB);
  const rB = t => animBridge(t, BR, S.b1.end + .1, S.s1.start + .2);

  // C : l'agent relance, met à jour, propose ; vous validez
  const sC = mkScene('sC');
  const click = wt('s3', 'validez') + .25;
  const ag = mkAgent(sC, 'L’agent mova.ia tient vos acquéreurs à jour', [
    { tx: 'Relance envoyée · 3 acquéreurs', show: W.C[0] + .3, done: wt('s2', 'relance') + .3 },
    { tx: 'Projets mis à jour dans le CRM', show: wt('s2', 'projet') - .5, done: wt('s2', 'crm') + .1 },
    { tx: 'Aucune double saisie', show: wt('s2', 'double') - .5, done: wt('s2', 'saisie') + .1 },
    { tx: 'Nouveau mandat : 2 acheteurs correspondants', show: S.s3.start - .2, done: wt('s3', 'propose') + .3 },
    { tx: 'Acheteurs à prévenir : votre validation', txDone: 'Acheteurs prévenus', wait: true, show: wt('s3', 'propose') + .5, done: click + .3 },
  ], 500, 540);
  const vb = mkBtn(sC, 'Prévenir les acheteurs', 'Acheteurs prévenus ✓', 1090);
  function rC(t) { animAgent(t, ag, W.C[0] + .05); animBtn(t, vb, wt('s3', 'propose'), click); }

  // R : avant / avec
  const sR = mkScene('sR');
  const c1 = mkCmp(sR, 'Acquéreur · M. Durand · maison avec jardin', 'Dernière relance il y a 5 mois', 'Projet à jour · prévenu du mandat', 600);
  const c2 = mkCmp(sR, 'Fiche contact', 'Saisie dans 2 outils', 'Mise à jour une seule fois', 910);
  const k1 = wt('r', 'vivant'), k2 = wt('r', 'acheteur') + .1;
  function rR(t) { animCmp(t, c1, W.R[0] + .1, k1); animCmp(t, c2, wt('r', 'bon') - .3, k2); }

  // E : appel à l'action
  const sE = mkScene('sE');
  const CT = mkCta(sE, false);
  const hClick = S.c3.start + 1.0;
  const rE = t => animCta(t, CT, W.E[0] + .1, wt('c1', 'one'), S.c1.end - .3, S.c3.start, hClick);

  VIDEO = {
    scenes: [
      { el: sA, from: W.A[0], to: W.A[1], ex: true, render: rA },
      { el: sD, from: W.D[0], to: W.D[1], ex: true, render: rD },
      { el: sB, from: W.B[0], to: W.B[1], render: rB },
      { el: sC, from: W.C[0], to: W.C[1], ex: true, render: rC },
      { el: sR, from: W.R[0], to: W.R[1], ex: true, render: rR },
      { el: sE, from: W.E[0], to: W.E[1], render: rE },
    ],
    bg: t => t < W.D[1] + .14 ? { op: 1, view: 'acquereurs', mode: t > SW ? 'B' : 'A', pose: 'in', t0: 0, blur: t > W.D[0] ? 5 : 2.5, bright: t > W.D[0] ? .4 : .55, shake: SW }
      : t >= W.C[0] && t < W.E[0] ? { op: Math.min(clamp((t - W.C[0]) / .14), 1 - clamp((t - W.E[0] + .14) / .14)), view: 'acquereurs', mode: 'C', pose: t < W.R[0] ? 'L' : 'R', t0: t < W.R[0] ? W.C[0] : W.R[0], blur: 4.5, bright: .6 } : null,
    red: t => t > SW && t < W.B[0] ? clamp((t - SW) / .35) : 0,
    glowG: t => t < SW ? .9 : .6,
    aurora: t => t < W.B[0] ? null : t < W.C[0] ? { op: .55 * ease((t - S.b1.end - .4) / 1.2), top: 480 } : t < W.E[0] ? { op: .7, top: 760 } : { op: .6, top: 600 },
    flashes: [[SW, .42, .5, '#ff9a9a'], [W.D[0], .2, .2], [W.B[0] + .2, .22, .2], [W.C[0], .25, .25], [W.R[0], .18, .2], [W.E[0], .3, .3]],
    clicks: [{ click, to: [560, 1142] }, { click: hClick, to: [620, 990], from: [200, 1500], hold: true }],
    kt: { b1: { top: 860 }, s1: { top: 1150 } },
    music: { red: SW, redEnd: W.B[0], groove: S.b1.end + .4, end: S.c3.end + .6 },
    sfx: [
      ['shimmer', .1], ...aKeys.map(k => ['blip', k, 900, .07, .08]),
      ['riser', SW, .9, .12], ['impact', SW, .5], ['whoosh', SW, .2, .6], ['alert', SW],
      ...P.map(p => ['blip', p[1], 520, .09, .1]),
      ['whoosh', W.D[0], .16, .6], ["typing", tw[0], 1.8], ["typing", tw[1], 1.8], ['alert', wt('h4', 'deux') - .1],
      ['whoosh', W.B[0], .16, .6], ['shimmer', S.b1.end + .4],
      ['whoosh', W.C[0], .16, .6], ...ag._tasks.map(k => ['blip', k.done, 2000, .08, .06]), ['click', click], ['blip', click + .05, 1400, .1, .1],
      ['whoosh', W.R[0], .16, .6], ...[k1, k2].flatMap(k => [['whoosh', k - .4, .08, .35], ['blip', k, 1568, .08, .12], ['blip', k + .08, 2093, .07, .14]]),
      ['whoosh', W.E[0], .16, .6], ['shimmer', W.E[0] + .1], ['click', hClick],
    ],
  };
})();
