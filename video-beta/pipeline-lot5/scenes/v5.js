// Vidéo 5 – « Samedi 21 h 47 » (version courte)
(function () {
  const SW = S.h4.start;
  const tAg = wt('s1', 'agent') - .2;
  const W = { A: [0, S.h6.start - .25], T: [S.h6.start - .25, S.s1.start - .25], L: [S.s1.start - .25, tAg], C: [tAg, S.c1.start - .35], E: [S.c1.start - .35, TL.total + 1] };

  // A : la demande du samedi soir, rappelée le lundi
  const sA = mkScene('sA');
  const lead = el('div', 'glass', `<div class="gh"><div class="mini">@</div>Nouvelle demande · Portail</div><div class="clk">Sam. 21:47</div><div class="mtx"></div><div class="pill n st" style="left:34px;top:236px">Non lue</div><div class="pill r late" style="right:30px;top:236px;opacity:0">+35 h sans réponse</div>`,
    'left:70px;top:600px;width:940px;height:330px', sA);
  const ff0 = S.h3.start, tRap = Math.max(wt('h3', 'rappelez'), ff0 + .9);
  const pad2 = x => String(x).padStart(2, '0');
  function rA(t) {
    const [sx, sy] = shakeAt(t, SW, 12);
    ap(lead, t, .05, .45, { y: 60, dx: sx, dy: sy });
    lead.style.opacity *= 1 - clamp((t - W.A[1] + .2) / .25);
    lead.style.borderColor = t > SW ? 'rgba(255,77,79,.75)' : 'rgba(160,210,235,.28)';
    lead.style.boxShadow = t > SW ? '0 0 80px rgba(255,40,50,.35)' : '0 40px 110px rgba(0,0,0,.6)';
    typeText(lead.querySelector('.mtx'), 'Bonjour, le T3 du centre est-il toujours disponible ? Je peux le visiter cette semaine.', t, .3, 45, t < ff0, null);
    const m = Math.round(lerp(21 * 60 + 47, 2 * 1440 + 9 * 60 + 12, inout((t - ff0) / .9)));
    const ck = lead.querySelector('.clk');
    ck.textContent = `${['Sam.', 'Dim.', 'Lun.'][Math.floor(m / 1440)]} ${pad2(Math.floor(m % 1440 / 60))}:${pad2(m % 60)}`;
    ck.style.color = t > SW ? '#FF8A8C' : t > ff0 ? '#FFC266' : '#F2F6FA';
    const st = lead.querySelector('.st');
    const [txt, cls] = t < tRap ? ['Non lue', 'n'] : t < SW ? ['Rappel · lundi 09:12', 'a'] : ['✕  Déjà visité ailleurs', 'r'];
    if (st.textContent !== txt) st.textContent = txt;
    st.className = 'pill st ' + cls;
    ap(lead.querySelector('.late'), t, ff0 + .85, .35, { x: 30, y: 0, s: .9 });
  }

  // T : le chiffre
  const sT = mkScene('sT');
  const stat = mkStat(sT);
  const rT = t => animStat(t, stat, W.T[0] + .1, W.T[1] + .2, wt('h6', '68'));

  // L : logo éclair
  const sL = mkScene('sL');
  const LG = mkLogo(sL, 820);
  const rL = t => animLogo(t, LG, W.L[0] + .05, .55);

  // C : l'agent répond aussitôt, qualifie, propose ; vous validez
  const sC = mkScene('sC');
  const inC = el('div', 'glass', `<div class="gh"><div class="mini" style="background:#3B2A08;color:#FFC266">!</div>Nouvelle demande · Portail<span style="margin-left:150px;color:#C9D6E3">21:47</span></div><div class="mtx" style="top:100px;font-size:34px"></div>`,
    'left:70px;top:520px;width:940px;height:230px;transform-origin:50% 50%', sC);
  const click = wt('s2', 'validez') + .25;
  const ag = mkAgent(sC, 'L’agent mova.ia traite la demande', [
    { tx: 'Réponse envoyée · 21:47', show: wt('s1', 'répond') - .6, done: wt('s1', 'répond') + .1 },
    { tx: 'Projet qualifié : budget, secteur, délai', show: wt('s1', 'qualifie') - .5, done: wt('s1', 'qualifie') + .1 },
    { tx: 'Visite proposée : jeudi 18 h', show: wt('s1', 'propose') - .5, done: wt('s1', 'propose') + .3 },
  ], 780, 400);
  const vb = mkBtn(sC, 'Valider la visite', 'Visite validée ✓', 1230);
  function rC(t) {
    const z = inout((t - W.C[0]) / .9);
    inC.style.opacity = ease((t - W.C[0]) / .25);
    inC.style.transform = `scale(${lerp(1.6, 1, z)}) translateY(${lerp(120, 0, z)}px)`;
    typeText(inC.querySelector('.mtx'), 'Bonjour, le T3 du centre est-il disponible ? Je souhaite le visiter.', t, W.C[0] + .05, 70, true, 'visiter');
    animAgent(t, ag, wt('s1', 'répond') - .7);
    animBtn(t, vb, S.s2.start - .4, click);
  }

  // E : appel à l'action (la promesse est affichée, la voix ne la dit pas)
  const sE = mkScene('sE');
  const CT = mkCta(sE, true);
  const hClick = S.c3.start + .9;
  const rE = t => animCta(t, CT, W.E[0] + .1, wt('c1', 'one'), S.c1.end - .3, S.c3.start, hClick);

  VIDEO = {
    scenes: [
      { el: sA, from: W.A[0], to: W.A[1], ex: true, render: rA },
      { el: sT, from: W.T[0], to: W.T[1], render: rT },
      { el: sL, from: W.L[0], to: W.L[1], render: rL },
      { el: sC, from: W.C[0], to: W.C[1], ex: true, render: rC },
      { el: sE, from: W.E[0], to: W.E[1], render: rE },
    ],
    bg: t => t < W.T[1] + .14 ? { op: 1, view: 'leads', mode: t > SW ? 'B' : 'A', pose: 'in', t0: 0, blur: t > W.T[0] ? 3.5 : 2.5, bright: t > W.T[0] ? .45 : .55, shake: SW }
      : t >= W.C[0] && t < W.E[0] ? { op: Math.min(clamp((t - W.C[0]) / .14), 1 - clamp((t - W.E[0] + .14) / .14)), view: 'leads', mode: 'C', pose: 'L', t0: W.C[0], blur: 4.5, bright: .6 } : null,
    red: t => t > SW && t < W.L[0] ? clamp((t - SW) / .35) : 0,
    glowG: t => t < SW ? .9 : .6,
    aurora: t => t < W.L[0] ? null : t < W.C[0] ? { op: .55, top: 600 } : t < W.E[0] ? { op: .7, top: 760 } : { op: .6, top: 600 },
    flashes: [[SW, .42, .5, '#ff9a9a'], [W.T[0], .15, .2], [W.L[0], .35, .25], [W.C[0], .25, .25], [W.E[0], .3, .3]],
    clicks: [{ click, to: [560, 1282] }, { click: hClick, to: [620, 990], from: [200, 1500], hold: true }],
    kt: {},
    music: { red: SW, redEnd: W.L[0], groove: W.L[0] + .1, end: S.c3.end + .6 },
    sfx: [
      ['notif', .1], ['typing', .3, 1.8], ['ticks', ff0, .9, 14], ['whoosh', ff0 + .45, .12, .9], ['blip', ff0 + .9, 880, .08, .12],
      ['riser', SW, .9, .12], ['impact', SW, .5], ['whoosh', SW, .2, .6], ['alert', SW],
      ['whoosh', W.T[0], .16, .6], ['blip', wt('h6', '68'), 520, .09, .14],
      ['whoosh', W.L[0], .2, .5], ['shimmer', W.L[0] + .3],
      ['whoosh', W.C[0], .16, .6], ['typing', W.C[0] + .05, 1.0], ...ag._tasks.map(k => ['blip', k.done, 2000, .08, .06]), ['click', click], ['blip', click + .05, 1400, .1, .1],
      ['whoosh', W.E[0], .16, .6], ['shimmer', W.E[0] + .1], ['click', hClick],
    ],
  };
})();
