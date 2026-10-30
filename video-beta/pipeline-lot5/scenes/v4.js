// Vidéo 4 – « Comment ça se passe avec mova.ia »
(function () {
  const W = { A: [0, S.b1.start - .25], S: [S.b1.start - .25, S.r.start - .3], R: [S.r.start - .3, S.c1.start - .35], E: [S.c1.start - .35, TL.total + 1] };
  const tAb = wt('h2', 'abandonné');

  // A : l'outil installé puis abandonné
  const sA = mkScene('sA');
  const PTS = [[60, 40], [200, 60], [330, 120], [460, 170], [590, 230], [720, 280], [830, 296]];
  const pts = PTS.map(([x, y]) => `${x},${y}`).join(' ');
  const card = el('div', 'glass', `<div class="gh"><div class="mini" style="background:#16304F;color:#C9D6E3">⚙</div>Nouvel outil · utilisation</div>
    <svg style="position:absolute;left:35px;top:110px" width="870" height="330" viewBox="0 0 870 330">
      <line x1="40" y1="300" x2="850" y2="300" stroke="rgba(143,163,188,.35)" stroke-width="2"/>
      ${[0, 1, 2, 3].map(i => `<text x="${70 + i * 230}" y="326" fill="#8FA3BC" font-size="22" font-family="Inter">Sem. ${i + 1}</text>`).join('')}
      <polyline class="ln" points="${pts}" fill="none" stroke="#2EE6A6" stroke-width="7" stroke-linejoin="round" stroke-linecap="round" stroke-dasharray="1200" stroke-dashoffset="1200"/>
    </svg>
    <div class="pill r" style="left:34px;top:470px;opacity:0">Plus utilisé depuis 3 semaines</div>`,
    'left:70px;top:600px;width:940px;height:560px', sA);
  function rA(t) {
    ap(card, t, .1, .5, { y: 40 });
    const p = clamp((t - S.h2.start + .2) / (tAb - S.h2.start + .6));
    const ln = card.querySelector('.ln');
    ln.style.strokeDashoffset = 1200 * (1 - p);
    ln.setAttribute('stroke', p < .55 ? '#2EE6A6' : p < .8 ? '#FFC266' : '#FF5A5F');
    ap(card.querySelector('.pill'), t, tAb + .2, .4, { x: -20, y: 0, s: .9 });
    card.style.borderColor = t > tAb + .2 ? 'rgba(255,77,79,.6)' : 'rgba(160,210,235,.28)';
  }

  // S : la méthode en 5 étapes
  const sS = mkScene('sS');
  const LG = mkLogo(sS, 460, 80, 64);
  const STEPS = [['One-to-one · 30 min · visio', 'On repère où votre agence perd des affaires'], ['Audit de vos outils', 'Votre CRM, vos logiciels, votre façon de travailler'], ['Agents conçus sur mesure', 'Branchés aux outils que vous utilisez déjà'], ['Test · mise en service', 'Mise en place sur devis'], ['Suivi mensuel · évolutions', 'Abonnement sans engagement']];
  const Y0 = 620, DY = 180;
  const line = el('div', '', '', `position:absolute;left:148px;top:${Y0 + 32}px;width:4px;height:0;background:linear-gradient(#2EE6A6,#00B87F);border-radius:2px`, sS);
  const nodes = STEPS.map(([a, b], i) => {
    const n = el('div', '', String(i + 1), `position:absolute;left:118px;top:${Y0 + i * DY}px;width:64px;height:64px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:Jakarta;font-weight:800;font-size:30px;border:3px solid rgba(143,163,188,.5);color:#8FA3BC;background:#06182a;opacity:0`, sS);
    const c = el('div', 'glass', `<div style="position:absolute;left:30px;top:26px;font-family:Jakarta;font-weight:800;font-size:34px;letter-spacing:-.5px;white-space:nowrap">${a}</div><div style="position:absolute;left:30px;top:80px;font-size:25px;color:var(--muted);white-space:nowrap">${b}</div>`,
      `left:220px;top:${Y0 + i * DY - 38}px;width:800px;height:140px;border-radius:24px`, sS);
    return [n, c];
  });
  const sk = [1, 2, 3, 4, 5].map(i => S['p' + i].start);
  function rS(t) {
    animLogo(t, LG, S.b1.start + .1, .8);
    LG.style.opacity = ease((t - S.b1.start) / .3);
    let reach = 0;
    nodes.forEach(([n, c], i) => {
      n.style.opacity = ease((t - W.S[0] - .2 - i * .08) / .4);
      const on = t > sk[i] - .05;
      n.style.borderColor = on ? '#2EE6A6' : 'rgba(143,163,188,.5)';
      n.style.background = on ? '#00B87F' : '#06182a';
      n.style.color = on ? '#03231A' : '#8FA3BC';
      n.style.transform = `scale(${on && t < sk[i] + .3 ? 1 + .15 * Math.sin((t - sk[i]) / .3 * Math.PI) : 1})`;
      ap(c, t, sk[i] - .15, .4, { x: 40, y: 0 });
      c.style.borderColor = on ? 'rgba(46,230,166,.5)' : 'rgba(160,210,235,.28)';
      if (on) reach = i;
    });
    const p = t < sk[0] ? 0 : reach * DY + ease((t - sk[reach]) / .4) * Math.min(DY, (sk[reach + 1] ? DY : 0));
    line.style.height = Math.min(p, 4 * DY) + 'px';
  }

  // R : avant / avec
  const sR = mkScene('sR');
  const cmp = mkCmp(sR, 'Votre accompagnement', 'Un outil de plus, puis plus rien', 'Un interlocuteur, du début au suivi', 700);
  const kg = S.r.start + .9;
  const rR = t => animCmp(t, cmp, W.R[0] + .1, kg);

  // E : appel à l'action (la promesse est affichée, la voix ne la dit pas)
  const sE = mkScene('sE');
  const CT = mkCta(sE, true);
  const hClick = S.c3.start + 1.0;
  const rE = t => animCta(t, CT, W.E[0] + .1, wt('c1', 'one'), S.c1.end - .3, S.c3.start, hClick);

  VIDEO = {
    scenes: [
      { el: sA, from: W.A[0], to: W.A[1], ex: true, render: rA },
      { el: sS, from: W.S[0], to: W.S[1], render: rS },
      { el: sR, from: W.R[0], to: W.R[1], render: rR },
      { el: sE, from: W.E[0], to: W.E[1], render: rE },
    ],
    red: t => t > tAb && t < W.A[1] ? .55 * clamp((t - tAb) / .4) : 0,
    glowG: t => .7,
    aurora: t => t < W.S[0] ? null : t < W.E[0] ? { op: .45, top: 900 } : { op: .6, top: 600 },
    flashes: [[W.S[0], .25, .25], [W.R[0], .18, .2], [W.E[0], .3, .3]],
    clicks: [{ click: hClick, to: [620, 990], from: [200, 1500], hold: true }],
    kt: { p1: { hide: true }, p2: { hide: true }, p3: { hide: true }, p4: { hide: true }, p5: { hide: true } },
    music: { groove: S.b1.start + .1, end: S.c3.end + .6 },
    sfx: [
      ['whoosh', .1, .1, .5], ['ticks', S.h2.start, tAb - S.h2.start + .4, 10], ['alert', tAb + .2],
      ['whoosh', W.S[0], .16, .6], ['shimmer', S.b1.start + .5],
      ...sk.map((k, i) => ['blip', k, 659.25 * Math.pow(2, [0, 2, 4, 5, 7][i] / 12), .09, .14]),
      ['whoosh', W.R[0], .16, .6], ['whoosh', kg - .4, .08, .35], ['blip', kg, 1568, .08, .12], ['blip', kg + .08, 2093, .07, .14],
      ['whoosh', W.E[0], .16, .6], ['shimmer', W.E[0] + .1], ['click', hClick],
    ],
  };
})();
