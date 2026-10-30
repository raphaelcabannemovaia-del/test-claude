// Vidéo 1 – « Le vendeur sans nouvelles »
(function () {
  const SW = wt('h3', 'concurrent');
  const W = { A: [0, S.b1.start - .25], B: [S.b1.start - .25, S.s2.start - .3], C: [S.s2.start - .3, S.r.start - .3], R: [S.r.start - .3, S.c1.start - .35], E: [S.c1.start - .35, TL.total + 1] };
  const HOME = '<svg viewBox="0 0 100 100" width="30" height="30"><path d="M19 83V45L50 21l31 24v38" fill="none" stroke="#2EE6A6" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  // A : le problème
  const sA = mkScene('sA');
  const msg = el('div', 'glass', `<div class="gh"><div class="mini">${HOME}</div>Mme Petit · vendeuse · mandat exclusif</div><div class="mtx"></div><div class="pill r" style="left:34px;top:212px;opacity:0">Dernier contact : il y a 19 jours</div>`, 'left:70px;top:560px;width:940px;height:300px', sA);
  const VIS = [['mar. 14:30', wt('h2', 'trois')], ['jeu. 18:00', wt('h2', 'visites') + .35], ['sam. 10:30', wt('h2', 'lieu')]];
  const rows = VIS.map(([d], i) => el('div', 'row', `<i>✕</i>Visite · ${d}<em style="color:#FF8A8C">Compte rendu : non envoyé</em>`, `top:${930 + i * 100}px`, sA));
  const comp = el('div', 'alert', '<i>!</i>Contactée par une autre agence', 'left:150px;top:1250px', sA);
  const tiltR = mkTilt(sA, ['Mandat exclusif · fin dans 12 jours', 'Vendeuse inquiète, sans retour', 'Risque : le bien part ailleurs'], 'r', 560);
  const tKeys = [S.h4.start - .2, wt('h4', 'votre'), wt('h4', 'danger') - .2];
  function rA(t) {
    const [sx, sy] = shakeAt(t, SW, 12);
    const outA = clamp((t - S.h4.start + .25) / .3);
    ap(msg, t, .05, .45, { y: 50, dx: sx, dy: sy });
    msg.style.opacity *= 1 - outA;
    msg.style.borderColor = t > SW ? 'rgba(255,77,79,.75)' : 'rgba(160,210,235,.28)';
    typeText(msg.querySelector('.mtx'), 'Bonjour, avez-vous des retours sur les visites ?', t, .25, 42, t < S.h2.start, null);
    ap(msg.querySelector('.pill'), t, wt('h1', 'nouvelles'), .35, { x: -20, y: 0, s: .9 });
    rows.forEach((r, i) => { ap(r, t, VIS[i][1], .35, { x: -40, y: 0, dx: sx, dy: sy }); r.style.opacity *= 1 - outA; r.style.borderColor = t > SW ? 'rgba(255,77,79,.6)' : 'rgba(130,175,220,.2)'; });
    ap(comp, t, SW - .1, .4, { x: 60, y: 0, s: .9, blur: 10 });
    comp.style.opacity *= 1 - outA;
    animTilt(t, tiltR, S.h4.start - .3, tKeys, 48);
  }

  // B : pont vers le logo
  const sB = mkScene('sB');
  const BR = mkBridge(sB);
  const rB = t => animBridge(t, BR, S.b1.end + .1, S.s1.start + .2);

  // C : l'agent prépare le compte rendu, vous validez
  const sC = mkScene('sC');
  const click = wt('s3', 'validez') + .25;
  const ag = mkAgent(sC, 'L’agent mova.ia prépare le compte rendu', [
    { tx: 'Visite récupérée dans votre CRM', show: W.C[0] + .3, done: wt('s2', 'visite') + .2 },
    { tx: 'Compte rendu rédigé', show: wt('s2', 'prépare') - .5, done: wt('s2', 'compte') + .3 },
    { tx: 'En attente de votre validation', txDone: 'Compte rendu validé', wait: true, show: S.s3.start - .3, done: click },
    { tx: 'Envoyé à Mme Petit', show: wt('s4', 'envoie') - .5, done: wt('s4', 'vendeur') },
    { tx: 'Prochain point : vendredi 10 h', show: wt('s4', 'programme') - .4, done: wt('s4', 'point') },
  ], 520, 540);
  const vb = mkBtn(sC, 'Valider l’envoi', 'Envoi validé ✓', 1110);
  function rC(t) { animAgent(t, ag, W.C[0] + .05); animBtn(t, vb, S.s3.start - .3, click); }

  // R : avant / avec
  const sR = mkScene('sR');
  const cmp = mkCmp(sR, 'Vendeuse · Mme Petit · mandat exclusif', '19 jours sans nouvelles', 'Compte rendu après chaque visite', 700);
  const kg = S.r.start + .8;
  const rR = t => animCmp(t, cmp, W.R[0] + .1, kg);

  // E : appel à l'action
  const sE = mkScene('sE');
  const CT = mkCta(sE, false);
  const hClick = S.c3.start + 1.0;
  const rE = t => animCta(t, CT, W.E[0] + .1, wt('c1', 'one'), S.c1.end - .3, S.c3.start, hClick);

  const done = ag._tasks.map(k => k.done);
  VIDEO = {
    scenes: [
      { el: sA, from: W.A[0], to: W.A[1], ex: true, render: rA },
      { el: sB, from: W.B[0], to: W.B[1], render: rB },
      { el: sC, from: W.C[0], to: W.C[1], ex: true, render: rC },
      { el: sR, from: W.R[0], to: W.R[1], ex: true, render: rR },
      { el: sE, from: W.E[0], to: W.E[1], render: rE },
    ],
    bg: t => t < W.A[1] + .14 ? { op: 1, view: 'vendeurs', mode: t > SW ? 'B' : 'A', pose: 'in', t0: 0, blur: 2.5, bright: t > S.h4.start - .2 ? .45 : .55, shake: SW }
      : t >= W.C[0] && t < W.E[0] ? { op: Math.min(clamp((t - W.C[0]) / .14), 1 - clamp((t - W.E[0] + .14) / .14)), view: 'vendeurs', mode: 'C', pose: t < W.R[0] ? 'L' : 'R', t0: t < W.R[0] ? W.C[0] : W.R[0], blur: 4.5, bright: .6 } : null,
    red: t => t > SW && t < W.B[0] ? clamp((t - SW) / .35) : 0,
    glowG: t => t < SW ? .9 : .6,
    aurora: t => t < W.B[0] ? null : t < W.C[0] ? { op: .55 * ease((t - S.b1.end - .4) / 1.2), top: 480 } : t < W.E[0] ? { op: .7, top: 760 } : { op: .6, top: 600 },
    flashes: [[SW, .42, .5, '#ff9a9a'], [W.B[0] + .2, .22, .2], [W.C[0], .25, .25], [W.R[0], .18, .2], [W.E[0], .3, .3]],
    clicks: [{ click, to: [560, 1162] }, { click: hClick, to: [620, 990], from: [200, 1500], hold: true }],
    kt: { b1: { top: 860 }, s1: { top: 1150 } },
    music: { red: SW, redEnd: W.B[0], groove: S.b1.end + .4, end: S.c3.end + .6 },
    sfx: [
      ['notif', .12], ['typing', .25, 1.15], ['blip', wt('h1', 'nouvelles'), 520, .08, .1],
      ...VIS.map(v => ['blip', v[1], 600, .07, .1]),
      ['riser', SW, .9, .12], ['impact', SW, .5], ['whoosh', SW, .2, .6], ['alert', SW],
      ['whoosh', S.h4.start - .25, .16, .6], ...tKeys.map(k => ['blip', k, 520, .08, .1]),
      ['whoosh', W.B[0], .16, .6], ['shimmer', S.b1.end + .4],
      ['whoosh', W.C[0], .16, .6], ...done.map(k => ['blip', k, 2000, .08, .06]), ['click', click], ['blip', click + .05, 1400, .1, .1],
      ['whoosh', W.R[0], .16, .6], ['whoosh', kg - .4, .08, .35], ['blip', kg, 1568, .08, .12], ['blip', kg + .08, 2093, .07, .14],
      ['whoosh', W.E[0], .16, .6], ['shimmer', W.E[0] + .1], ['click', hClick],
    ],
  };
})();
