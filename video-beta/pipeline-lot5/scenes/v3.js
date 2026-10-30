// Vidéo 3 – « Une IA va-t-elle remplacer mes négociateurs ? »
(function () {
  const W = { Q: [0, S.l2.start - .3], K: [S.l2.start - .3, S.v1.start - .3], V: [S.v1.start - .3, S.st.start - .3], T: [S.st.start - .3, S.s1.start - .3], L: [S.s1.start - .3, S.c1.start - .35], E: [S.c1.start - .35, TL.total + 1] };

  // Q : la question, « Non. », puis ce que l'agent prend (chaque pastille rouge s'éteint)
  const sQ = mkScene('sQ');
  const non = el('div', '', 'Non.', 'position:absolute;left:0;top:740px;width:1080px;text-align:center;font-family:Jakarta;font-weight:800;font-size:230px;letter-spacing:-6px;color:#2EE6A6;text-shadow:0 0 80px rgba(46,230,166,.45);opacity:0', sQ);
  const PB = ['12 messages non lus', '8 relances en retard', '4 fiches à saisir', '2 comptes rendus en retard'];
  const ev = el('div', 'glass', `<div class="gh"><div class="mini" style="background:#3B2A08;color:#FFC266">!</div>Votre négociateur · 21:40</div>` + PB.map((s, i) => `<div class="pill r pb" style="left:${34 + (i % 2) * 448}px;top:${104 + Math.floor(i / 2) * 84}px">${s}</div>`).join(''),
    'left:70px;top:1180px;width:940px;height:290px', sQ);
  const keys = [wt('l1', 'répondre'), wt('l1', 'relancer'), wt('l1', 'saisir'), wt('l1', 'envoyer')];
  const tg = mkTilt(sQ, ['Répondre aux demandes, même à 22 h', 'Relancer acquéreurs et vendeurs', 'Saisir dans le CRM', 'Envoyer les comptes rendus'], 'g', 520, 'Ce que l’agent prend en charge');
  function rQ(t) {
    pop(non, t, S.h2.start - .05, .45);
    non.style.opacity *= 1 - clamp((t - S.h3.start - .05) / .25);
    const sharp = ease((t - S.h3.start + .2) / .5);
    ev.style.opacity = ease((t - .2) / .5) * lerp(.55, 1, sharp);
    ev.style.filter = `blur(${lerp(4, 0, sharp)}px)`;
    ev.style.transform = `scale(${lerp(.94, 1, sharp)})`;
    ev.querySelectorAll('.pb').forEach((p, i) => {
      const ok = t > keys[i] + .3;
      const txt = ok ? '✓ Pris en charge' : PB[i];
      if (p.textContent !== txt) p.textContent = txt;
      p.className = 'pill pb ' + (ok ? 'g' : 'r');
    });
    animTilt(t, tg, S.l1.start - .3, keys, 40);
  }

  // K : ce que les négociateurs gardent
  const sK = mkScene('sK');
  const kk = [wt('l2', 'relation'), wt('l2', 'visite'), wt('l2', 'négociation'), wt('l2', 'décision')];
  const tw = mkTilt(sK, ['La relation', 'La visite', 'La négociation', 'La décision'], 'w', 560, 'Ce que vos négociateurs gardent', true);
  const rK = t => animTilt(t, tw, W.K[0] + .05, kk, 30);

  // V : l'agent prépare, vous validez ; il se présente comme une IA
  const sV = mkScene('sV');
  const click = wt('v1', 'validez') + .25;
  const tIA = wt('v2', 'présente');
  const msg = el('div', 'glass', `<div class="gh"><div class="mini">✉</div>Réponse préparée par l’agent</div><div class="pill a st" style="right:30px;top:22px">À valider</div><div class="mtx" style="font-size:34px"></div><div class="sig" style="position:absolute;left:34px;top:300px;display:flex;align-items:center;gap:16px;font-size:28px;color:var(--muted);opacity:0">— Assistant IA de l’agence<span class="pill g" style="position:relative">Se présente comme une IA</span></div>`,
    'left:70px;top:540px;width:940px;height:380px;border-color:rgba(46,230,166,.45)', sV);
  const vb = mkBtn(sV, 'Valider l’envoi', 'Envoyé ✓', 980);
  function rV(t) {
    ap(msg, t, W.V[0] + .05, .45, { y: 40 });
    typeText(msg.querySelector('.mtx'), 'Bonjour M. Durand, le T3 est toujours disponible. Je vous propose une visite jeudi à 18 h.', t, W.V[0] + .2, 60, false, null);
    const st = msg.querySelector('.st');
    const s = t > click ? 'Validée' : 'À valider';
    if (st.textContent !== s) st.textContent = s;
    st.className = 'pill st ' + (t > click ? 'g' : 'a');
    ap(msg.querySelector('.sig'), t, tIA - .1, .4, { x: -30, y: 0 });
    animBtn(t, vb, S.v1.start, click);
  }

  // T : le chiffre français
  const sT = mkScene('sT');
  el('div', 'ctaTx', 'TPE et PME en France utilisant une solution d’IA', 'top:640px;font-size:34px;color:#B9C8D8;opacity:1', sT);
  const BARS = [['Maintenant', 40, '#00B87F', wt('st', '40')], ['Un an plus tôt', 26, 'rgba(143,163,188,.55)', wt('st', '26')]];
  const bars = BARS.map(([l, v, c], i) => el('div', '', `<div style="font-size:30px;color:var(--muted);margin-bottom:14px">${l}</div><div class="bar" style="height:84px;width:0;border-radius:18px;background:${c}"></div><div class="num" style="position:absolute;right:0;top:40px;font-family:Jakarta;font-weight:800;font-size:96px;letter-spacing:-2px;color:${i ? '#B9C8D8' : '#2EE6A6'}"></div>`,
    `position:absolute;left:70px;top:${760 + i * 230}px;width:940px;opacity:0`, sT));
  function rT(t) {
    bars.forEach((b, i) => {
      const [, v, , k] = BARS[i];
      ap(b, t, W.T[0] + .1 + i * .15, .4, { y: 30 });
      const p = ease((t - k + .1) / .9);
      b.querySelector('.bar').style.width = (v / 40 * 600 * p) + 'px';
      b.querySelector('.num').textContent = p > 0 ? Math.round(v * p) + NB + '%' : '';
    });
  }

  // L : logo
  const sL = mkScene('sL');
  const LG = mkLogo(sL, 780);
  const tagL = el('div', 'tagl', '', 'top:975px', sL);
  const rL = t => { animLogo(t, LG, S.s1.start - .1); typeLine(tagL, TAGLINE, t, S.s1.start + 1.0); };

  // E : appel à l'action
  const sE = mkScene('sE');
  const CT = mkCta(sE, false);
  const hClick = S.c3.start + 1.0;
  const rE = t => animCta(t, CT, W.E[0] + .1, wt('c1', 'one'), S.c1.end - .3, S.c3.start, hClick);

  VIDEO = {
    scenes: [
      { el: sQ, from: W.Q[0], to: W.Q[1], ex: true, render: rQ },
      { el: sK, from: W.K[0], to: W.K[1], render: rK },
      { el: sV, from: W.V[0], to: W.V[1], ex: true, render: rV },
      { el: sT, from: W.T[0], to: W.T[1], render: rT },
      { el: sL, from: W.L[0], to: W.L[1], render: rL },
      { el: sE, from: W.E[0], to: W.E[1], render: rE },
    ],
    bg: t => t >= W.V[0] && t < W.V[1] + .14 ? { op: Math.min(clamp((t - W.V[0]) / .14), 1 - clamp((t - W.V[1]) / .14)), view: 'leads', mode: 'C', pose: 'L', t0: W.V[0], blur: 4.5, bright: .6 } : null,
    glowG: t => .7,
    aurora: t => t < S.l1.start - .3 ? null : t < W.L[0] ? { op: .45, top: 860 } : t < W.E[0] ? { op: .55 * ease((t - W.L[0]) / 1.2), top: 480 } : { op: .6, top: 600 },
    flashes: [[S.h2.start - .05, .25, .2], [W.K[0], .2, .2], [W.V[0], .22, .22], [W.T[0], .2, .2], [W.L[0], .22, .2], [W.E[0], .3, .3]],
    clicks: [{ click, to: [560, 1032] }, { click: hClick, to: [620, 990], from: [200, 1500], hold: true }],
    kt: { h1: { top: 540, size: 58 }, h2: { hide: true }, s1: { top: 1150 } },
    music: { groove: S.l1.start - .1, end: S.c3.end + .6 },
    sfx: [
      ['impact', S.h2.start - .05, .55], ['whoosh', S.h3.start - .1, .14, .6],
      ...keys.flatMap(k => [['blip', k, 1800, .08, .06], ['blip', k + .3, 1568, .06, .1]]),
      ['whoosh', W.K[0], .16, .6], ...kk.map(k => ['blip', k, 880, .08, .1]),
      ['whoosh', W.V[0], .16, .6], ['typing', W.V[0] + .2, 1.4], ['click', click], ['blip', click + .05, 1400, .1, .1], ['shimmer', tIA],
      ['whoosh', W.T[0], .16, .6], ['riser', BARS[0][3] + .8, .9, .08], ['blip', BARS[0][3] + .8, 1568, .08, .12], ['blip', BARS[1][3] + .8, 880, .07, .1],
      ['whoosh', W.L[0], .16, .6], ['shimmer', S.s1.start + .4],
      ['whoosh', W.E[0], .16, .6], ['shimmer', W.E[0] + .1], ['click', hClick],
    ],
  };
})();
