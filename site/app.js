/* Configuration : à compléter avant la mise en ligne (voir README.md) */
const CONFIG = {
  // Adresse qui reçoit les demandes de diagnostic (le bouton ouvre la messagerie du visiteur)
  contactEmail: "raphaelcabanne.mova.ia@gmail.com",
  // true : le bandeau cookies s'affiche à chaque nouveau visiteur (son choix est gardé 6 mois)
  consentBanner: true
};

(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasIO = "IntersectionObserver" in window;
  var NB = " ";
  document.documentElement.classList.add("js");
  var root_ = document.documentElement;
  var isPaused = function () { return root_.classList.contains("anim-off"); };

  /* ---------- Progression, en-tête, menu mobile ---------- */
  var hdr = $("hdr"), prog = $("progress");
  function onScroll() {
    var y = window.scrollY || 0, max = document.documentElement.scrollHeight - window.innerHeight;
    prog.style.setProperty("--p", max > 0 ? Math.min(1, y / max).toFixed(4) : 0);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();

  var menuBtn = $("menu-btn"), menu = $("menu"), bd = $("menu-bd"), isOpen = false;
  Array.prototype.forEach.call(menu.querySelectorAll("a"), function (a, i) { a.style.setProperty("--i", i); });
  function setMenu(open) {
    isOpen = open;
    hdr.classList.toggle("menu-open", open);
    bd.classList.toggle("on", open);
    menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    menuBtn.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
  }
  menuBtn.addEventListener("click", function () { setMenu(!isOpen); });
  bd.addEventListener("click", function () { setMenu(false); });
  menu.addEventListener("click", function (e) { if (e.target.closest("a")) setMenu(false); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && isOpen) { setMenu(false); menuBtn.focus(); } });
  window.addEventListener("resize", function () { if (isOpen && window.innerWidth > 900) setMenu(false); });

  /* ---------- Apparitions au défilement ---------- */
  document.querySelectorAll("[data-stagger]").forEach(function (g) {
    Array.prototype.forEach.call(g.children, function (c, i) { c.style.setProperty("--i", i); });
  });
  var countUp = function () {};
  if (!reduce && hasIO) {
    document.documentElement.classList.add("motion");
    // Les chiffres repartent de zéro à chaque apparition
    var runs = new WeakMap();
    countUp = function (el, start) {
      var to = +el.dataset.count, pre = el.dataset.prefix || "", suf = (el.dataset.suffix || "").replace(" ", NB), token = {};
      runs.set(el, token);
      if (!start) { el.textContent = pre + "0" + suf; return; }
      var t0 = null;
      (function step(ts) {
        if (runs.get(el) !== token) return;
        if (t0 === null) t0 = ts;
        var p = Math.min(1, (ts - t0) / 1200), k = 1 - Math.pow(1 - p, 3);
        el.textContent = pre + Math.round(to * k) + suf;
        if (p < 1) requestAnimationFrame(step);
      })(performance.now());
    };
    function enter(el) {
      if (el.classList.contains("in")) return;
      var i = +el.style.getPropertyValue("--i") || 0;
      el.classList.add("in");
      el.querySelectorAll("[data-count]").forEach(function (c) { countUp(c, true); });
      // une fois l'apparition finie, les survols retrouvent des transitions courtes
      clearTimeout(el._rvT);
      el._rvT = setTimeout(function () { el.classList.add("rv-done"); }, 1500 + i * 90);
    }
    function leave(el) {
      if (!el.classList.contains("in")) return;
      clearTimeout(el._rvT);
      el.classList.remove("in", "rv-done");
      el.querySelectorAll("[data-count]").forEach(function (c) { countUp(c, false); });
    }
    // Entrée dès que l'élément dépasse un peu le bas de l'écran ; sortie une fois entièrement hors de l'écran :
    // l'écart évite les clignotements, et l'animation se rejoue en montant comme en descendant.
    var inObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) enter(e.target); });
    }, { rootMargin: "0px 0px -8% 0px" });
    var outObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (!e.isIntersecting) leave(e.target); });
    }, { rootMargin: "0px" });
    document.querySelectorAll(".rv").forEach(function (el) { inObs.observe(el); outObs.observe(el); });
  }

  /* ---------- Mouvement : titres mot à mot, halo, inclinaison, aimant, parallaxe ---------- */
  if (!reduce && hasIO) (function craft() {
    var fine = window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    // Titres : chaque mot monte depuis un masque, la ponctuation reste collée au mot
    var WJ = "\u2060";
    function split(h) {
      var label = h.textContent.replace(/\s+/g, " ").trim(), k = 0;
      (function walk(node) {
        Array.prototype.slice.call(node.childNodes).forEach(function (n) {
          if (n.nodeType === 1) return walk(n);
          if (n.nodeType !== 3 || !n.nodeValue.trim()) return;
          var frag = document.createDocumentFragment();
          n.nodeValue.replace(/[\t\n\r]+/g, " ").split(/( +)/).forEach(function (part, p) {
            if (!part) return;
            if (/^ +$/.test(part)) { frag.appendChild(document.createTextNode(" ")); return; }
            if (p === 0 && k > 0 && /^[\u00a0.,;:!?»)]/.test(part)) frag.appendChild(document.createTextNode(WJ));
            var w = document.createElement("span"), i = document.createElement("span");
            w.className = "wd";
            w.setAttribute("aria-hidden", "true");
            i.textContent = part;
            i.style.setProperty("--w", k++);
            w.appendChild(i);
            frag.appendChild(w);
          });
          node.replaceChild(frag, n);
        });
      })(h);
      h.setAttribute("aria-label", label);
      h.classList.add("split");
    }
    document.querySelectorAll(".hero h1, .rv h2, .pact-h h3").forEach(split);

    // Listes : les lignes arrivent l'une après l'autre
    document.querySelectorAll(".pact-c ul, .vs-list, .svc ul, .info-list").forEach(function (l) {
      Array.prototype.forEach.call(l.children, function (li, k) { li.style.setProperty("--k", k); });
    });

    // Parallaxe de l'ouverture
    var hero = document.querySelector(".hero"), hText = hero && hero.querySelector(".hero-grid > div:first-child"),
        hCard = hero && hero.querySelector(".wf-wrap"), ticking = false;
    function para() {
      ticking = false;
      var y = window.scrollY || 0, h = hero.offsetHeight;
      if (y > h) return;
      hero.style.setProperty("--hy", (y * 0.3).toFixed(1));
      hText.style.translate = "0 " + (y * 0.16).toFixed(1) + "px";
      hText.style.opacity = Math.max(0, 1 - y / (h * 0.85)).toFixed(3);
      if (hCard) hCard.style.translate = "0 " + (y * 0.07).toFixed(1) + "px";
    }
    if (hero && hText) window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; requestAnimationFrame(para); }
    }, { passive: true });

    if (!fine) return;

    // Lumière d'ambiance qui suit le pointeur dans le fond de chaque section
    var ambs = [], active = null, rafA = null;
    document.querySelectorAll(".hero, .sec").forEach(function (sec) {
      var box = document.createElement("span"), l = document.createElement("span");
      box.className = "amb";
      box.setAttribute("aria-hidden", "true");
      l.className = "amb-l";
      box.appendChild(l);
      sec.insertBefore(box, sec.firstChild);
      sec.classList.add("has-amb");
      ambs.push({ sec: sec, l: l, x: 0, y: 0, tx: 0, ty: 0 });
    });
    function ambLoop() {
      rafA = null;
      if (!active) return;
      active.x += (active.tx - active.x) * 0.08;
      active.y += (active.ty - active.y) * 0.08;
      active.l.style.translate = active.x.toFixed(1) + "px " + active.y.toFixed(1) + "px";
      if (Math.abs(active.tx - active.x) + Math.abs(active.ty - active.y) > 0.5) rafA = requestAnimationFrame(ambLoop);
    }
    document.addEventListener("pointermove", function (e) {
      var sec = e.target.closest ? e.target.closest(".has-amb") : null, item = null;
      for (var k = 0; k < ambs.length; k++) if (ambs[k].sec === sec) item = ambs[k];
      var r = item ? item.sec.getBoundingClientRect() : null;
      if (item !== active) {
        if (active) active.sec.classList.remove("amb-on");
        active = item;
        if (active) {
          active.x = active.tx = e.clientX - r.left;
          active.y = active.ty = e.clientY - r.top;
          active.l.style.translate = active.x + "px " + active.y + "px";
          active.sec.classList.add("amb-on");
        }
      }
      if (!active) return;
      active.tx = e.clientX - r.left;
      active.ty = e.clientY - r.top;
      if (!rafA) rafA = requestAnimationFrame(ambLoop);
    }, { passive: true });
    document.documentElement.addEventListener("pointerleave", function () {
      if (active) active.sec.classList.remove("amb-on");
      active = null;
    });

    // Halo lumineux qui suit le pointeur sur les cartes
    document.querySelectorAll(".pc, .svc, .ben, .fit-c, .pact-c, .vs-c, .pain li, .g-card").forEach(function (el) {
      var glow = document.createElement("span");
      glow.className = "spot-l";
      glow.setAttribute("aria-hidden", "true");
      el.classList.add("spot");
      el.insertBefore(glow, el.firstChild);
      el.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect();
        el.style.setProperty("--mx", (e.clientX - r.left).toFixed(0) + "px");
        el.style.setProperty("--my", (e.clientY - r.top).toFixed(0) + "px");
      });
    });

    // Inclinaison 3D amortie
    function tilt(el, max) {
      var tx = 0, ty = 0, cx = 0, cy = 0, raf = null;
      function loop() {
        cx += (tx - cx) * 0.12;
        cy += (ty - cy) * 0.12;
        var a = Math.sqrt(cx * cx + cy * cy);
        el.style.rotate = a < 0.02 ? "" : (-cy).toFixed(3) + " " + cx.toFixed(3) + " 0 " + a.toFixed(2) + "deg";
        raf = Math.abs(tx - cx) + Math.abs(ty - cy) > 0.02 ? requestAnimationFrame(loop) : null;
      }
      el.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect();
        tx = ((e.clientX - r.left) / r.width - 0.5) * 2 * max;
        ty = ((e.clientY - r.top) / r.height - 0.5) * 2 * max;
        if (!raf) raf = requestAnimationFrame(loop);
      });
      el.addEventListener("pointerleave", function () {
        tx = ty = 0;
        if (!raf) raf = requestAnimationFrame(loop);
      });
    }
    document.querySelectorAll(".wf, .vs-c--us").forEach(function (el) { tilt(el, 5); });

    // Boutons d'appel à l'action aimantés
    document.querySelectorAll(".cta-row .btn, .deal .btn, .vs-c--us .btn, .nav .btn, #send-btn").forEach(function (b) {
      b.classList.add("magnet");
      b.addEventListener("pointermove", function (e) {
        var r = b.getBoundingClientRect();
        b.style.translate = ((e.clientX - r.left - r.width / 2) * 0.2).toFixed(1) + "px " + ((e.clientY - r.top - r.height / 2) * 0.3).toFixed(1) + "px";
      });
      b.addEventListener("pointerleave", function () { b.style.translate = ""; });
    });
  })();

  /* ---------- Déroulé de l'automatisation (ouverture) ---------- */
  (function workflow() {
    var root = $("wf");
    if (!root || reduce) return;
    var steps = root.querySelectorAll(".wstep");
    var i = -1, timer = null, visible = false;
    // Les étiquettes flottantes suivent le déroulé : réponse envoyée, puis 24h/24
    var fa = document.querySelector(".float--a"), fb = document.querySelector(".float--b");
    root.parentNode.classList.add("sync");
    function paint() {
      Array.prototype.forEach.call(steps, function (s, k) {
        s.classList.toggle("on", k <= i);
        s.classList.toggle("cur", k === i);
      });
      if (fa) fa.classList.toggle("show", i >= 2);
      if (fb) fb.classList.toggle("show", i >= 4);
    }
    function tick() {
      if (isPaused()) return;
      i = i >= steps.length - 1 ? -1 : i + 1;
      paint();
      clearTimeout(timer);
      timer = setTimeout(tick, i === steps.length - 1 ? 3200 : i === -1 ? 600 : 1300);
    }
    function sync() {
      clearTimeout(timer);
      if (isPaused()) { i = steps.length - 1; paint(); return; }
      if (visible && !document.hidden) timer = setTimeout(tick, 700);
    }
    i = 0; paint();
    document.addEventListener("visibilitychange", sync);
    document.addEventListener("motionchange", sync);
    if (hasIO) new IntersectionObserver(function (e) { visible = e[0].isIntersecting; sync(); }, { threshold: 0.3 }).observe(root);
    else { visible = true; sync(); }
  })();

  /* ---------- Simulateur de temps ---------- */
  (function sim() {
    var leads = $("s-leads"), min = $("s-min"), admin = $("s-admin");
    if (!leads) return;
    var WEEKS = 52 / 12, DAY = 7, rate = 35;
    var shown = 0, raf = null;
    document.querySelectorAll(".rate button").forEach(function (b) {
      b.addEventListener("click", function () {
        rate = +b.dataset.rate;
        document.querySelectorAll(".rate button").forEach(function (o) { o.setAttribute("aria-pressed", o === b ? "true" : "false"); });
        update();
      });
    });
    function fill(r) { r.style.setProperty("--p", ((r.value - r.min) / (r.max - r.min) * 100) + "%"); }
    function tween(target) {
      var from = shown, t0 = null, dur = reduce ? 0 : 400;
      if (raf) cancelAnimationFrame(raf);
      (function step(ts) {
        if (t0 === null) t0 = ts;
        var p = dur ? Math.min(1, (ts - t0) / dur) : 1, k = 1 - Math.pow(1 - p, 3);
        shown = from + (target - from) * k;
        $("r-total").textContent = Math.round(shown) + NB + "h";
        if (p < 1) raf = requestAnimationFrame(step);
      })(performance.now());
    }
    function update() {
      var L = +leads.value, M = +min.value, A = +admin.value;
      [leads, min, admin].forEach(fill);
      $("o-leads").textContent = L;
      $("o-min").textContent = M + NB + "min";
      $("o-admin").textContent = A + NB + "h";
      var hLeads = L * M / 60, hAdmin = A * WEEKS, total = hLeads + hAdmin;
      $("r-leads").textContent = Math.round(hLeads) + NB + "h";
      $("r-admin").textContent = Math.round(hAdmin) + NB + "h";
      $("b-leads").style.setProperty("--w", (total ? hLeads / total * 100 : 0) + "%");
      $("b-admin").style.setProperty("--w", (total ? hAdmin / total * 100 : 0) + "%");
      var days = Math.round(total / DAY * 10) / 10;
      $("r-days").textContent = "Soit environ " + String(days).replace(".", ",") + " jour" + (days >= 2 ? "s" : "") + " de travail par mois.";
      $("r-value").textContent = String(Math.round(total * rate / 10) * 10).replace(/\B(?=(\d{3})+(?!\d))/g, NB) + NB + "€ / mois";
      tween(total);
    }
    [leads, min, admin].forEach(function (r) { r.addEventListener("input", update); });
    shown = 80 * 12 / 60 + 6 * WEEKS;
    update();
  })();

  /* ---------- Bouton de demande de diagnostic : ouvre un e-mail prérempli ---------- */
  (function send() {
    var btn = $("send-btn");
    if (!btn) return;
    var mail = CONFIG.contactEmail, sub = $("send-sub"), subHtml = sub.textContent, cp = $("send-copy");
    var subject = "Demande de diagnostic offert";
    var body = [
      "Bonjour,", "",
      "Je souhaite réserver un diagnostic offert de 30 minutes.", "",
      "Nom et prénom :", "Agence :", "Ville :", "Téléphone :",
      "Nombre de collaborateurs :", "Logiciel de transaction :", "",
      "Ce qui prend le plus de temps à mon équipe :", "", "Merci."
    ].join("\r\n");
    var q = encodeURIComponent;
    var mailto = "mailto:" + mail + "?subject=" + q(subject) + "&body=" + q(body);
    btn.href = mailto;
    $("send-gmail").href = "https://mail.google.com/mail/?view=cm&fs=1&to=" + q(mail) + "&su=" + q(subject) + "&body=" + q(body);
    $("send-outlook").href = "https://outlook.live.com/mail/0/deeplink/compose?to=" + q(mail) + "&subject=" + q(subject) + "&body=" + q(body);
    $("send-addr").textContent = mail;
    var framed = false;
    try { framed = window.self !== window.top; } catch (e) { framed = true; }

    btn.addEventListener("click", function (e) {
      // Dans un cadre (aperçu), naviguer vers mailto: remplace tout le site par une page d'erreur :
      // on l'ouvre dans une nouvelle fenêtre, et on bascule sur le webmail si le navigateur la bloque.
      if (framed) {
        e.preventDefault();
        var w = null;
        try { w = window.open(mailto, "_blank"); } catch (x) { w = null; }
        if (!w) {
          var g = window.open($("send-gmail").href, "_blank");
          if (!g) { cp.textContent = "Copier : " + mail; }
        }
      }
      btn.classList.add("is-sent");
      sub.textContent = "Ouverture de votre messagerie…";
      setTimeout(function () { btn.classList.remove("is-sent"); sub.textContent = subHtml; }, 2200);
    });
    cp.addEventListener("click", function () {
      var ok = function () { cp.textContent = "Adresse copiée"; };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(mail).then(ok, function () { cp.textContent = mail; });
      else cp.textContent = mail;
    });
  })();

  /* ---------- Globe terrestre en points (procédé, étape 05) ----------
     Masque des terres : Natural Earth 1:50m (domaine public), 1 bit par degré. */
  (function globe() {
    var cv = document.querySelector(".globe");
    if (!cv || !cv.getContext || !window.atob) return;
    var LAND = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAb/8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD///+DG////4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAN////7////////AAAAAAAAAAAeAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAB////9////////4AAAAA7gAAD7/0AAAAfwAAAAAAAAAAAAAAAAAAAAAAAAAGA////A////////AAAAB//wAAAAAAACAAP9gAAAAAAAAAAAAAAAAAAAAAAAeH/v//9////////4AAAAB/+AAAAAAAAAAAAH6AAAAAAAAAAAAAAAAAAAAAAdcIh5P/A/////////AAAAAPHAAAAAAAAAABAA8AAAAAAAAAAAAAAAAAAAAAH/jH9///AP////////AAAAACAAAAAAAX4AAAB//+AAAAAAAAAAAAAAAAAAAAAf///3/+AAAf//////AAAAAAAAAAAAH+AAAD////AAAF/uAAAAAAAAAAAAAAfI8AA7/8AAAH/////+AAAAAAAAAAAAfAAAAP///+AAAAYAAAAAAAAAAAAAAAf/A4++f/gAAD/////8AAAAAAAAAAAB8ADCP/////+H4APAAAAAAAAAAAAAAA///5/8//4AAD/////wAAAAAAAAAAADwAHt////////8Af+AAAAAwAABAAAAAPf/8P4///gAD/////wAAAAAAAAAAAHwAf/////////8///wAAABAAAf/wAACAP//h8f//8AB/////4AAAAAAH/gAAA9A/v/////////////8AAAAAD////P//n//n/D//+AB/////gAAAAAB///AAwB+f//////////////////4Af//////////H/z4f/AAf///8AAAAAAf///4MP/////////////////////+AD/////////////4Z/4A///4AAAAAAAP///+M////v//////////////////8P/////////////wD/+A///wAQYAAAAf////////////////////////////4//////////////g/+4Af/+AA/+AAAA/+/+D///////////////////////BwP/////////////4//gAP/wAAf8AAAD/8//f//////////////////////+AOB////////////HMg/wAP/gAAHgAAAP///////////////////////////+AAP///////////8Ay+fwAH/AAAAABAB//H//////////////////////////AAP///////////4AA/gAAB/AAAAABAB//H//////////////////////3//AAAf///////////wAA/4QAA+AAAAAACB//n//////////////////////C/8AAAA/7AH///////gAA/44AAAAAAAAAAB//h/////////////////////+D4AAAAAv8AA///////4AB//8AAAAAAAABYA9+D///////////////////8AAPgAAAAAD8AAP//////8AAf/+AAAAAAAAD8AH+m///////////////////wAAfgAAAAAOQAAH///////wCf/+AAAAAAAAB8AO+H///////////////////AAA/wAAAAB4AAAD////////g///gAAAAAAAD+AP4H///////////////////AAB/AAAAAHAAAABf///////z///4AAAAAAAP/APz////////////////////SAB/AAAABwAAAAB////////x///8AAAAAAAPPB//////////////////////+AA8AAABAAAAAAAn///////5///+AAAAAAAPfz///////////////////////AA4ABAMAAAAAAAD///////////+AAAAAAAMf3///////////////////////AAwAABAAAAAAAAD///////////sAAAAAAAAef//////////////////////7ABgAAAAAAAAAAAB/////////+sPAAAAAAAAD///////////////////////7gAAAAAAAAAAAAAAf/////////wfgAAAAAAAf///////////////////////yAAAAAAAAAAAAAAAf/////////wfwAAAAAAAP///////////////////////iAAAAAAAAAAAAAAAP/////////9AgAAAAAAAD//////v/h//////////////jAAAAAAAAAAAAAAAP//////////AAAAAAAAAB/////H//D//////////////ECAAAAAAAAAAAAAAP/////////4AAAAAAAAAB//v/+Gf+H/////////////+HcAAAAAAAAAAAAAAf////////wgAAAAAAAAH//zz/+AH+H/////////////4HwAAAAAAAAAAAAAAf////////wAAAAAAAAAH/4P4/8AB/B////////////+APAAAAAAAAAAAAAAAP////////wAAAAAAAAAH/4M+f+fh/g////////////8AMAAAAAAAAAAAAAAAf///////+AAAAAAAAAAH/gMPf////x////////////8AMAAAAAAAAAAAAAAAP///////8AAAAAAAAAAP/MMCPP///g///////////fwAMAAAAAAAAAAAAAAAP///////4AAAAAAAQAAH/AAGPv///g//////////8B4AcAAAAAAAAAAAAAAAH///////4AAAAAAACAAH+AEcH////g///////////44A4AAAAAAAAAAAAAAAD///////wAAAAAAAAAAB8/+ICXv//////////////w8D4AAAAAAAAAAAAAAAB///////4AAAAAAAAAAAr/+ABwE//////////////A8/4AAAAAAAAAAAAAAAB///////wAAAAAAAAAAB//+AAAM//////////////Ax/gAAAAAAAAAAAAAAAAf/////+AAAAAAAAAAAH///AAAB//////////////gn8AAAAAAAAAAAAAAAAAH/////8AAAAAAAAAAAH///4PAB//////////////gHAAAAAAAAAAAAAAAAAAH/////4AAAAAAAAAAAP///8P47//////////////wDAAAAAAAAAAAAAAAAAADf////4AAAAAAAAAAAP/////////////////////wAAAAAAAAAAAAAAAAAAAD///3g4AAAAAAAAAAAP/////////v///////////wAAAAAAAAAAAAAAAAAAABv//AAcAAAAAAAAAAw//////////n///////////wEAAAAAAAAAAAAAAAAAAB3/+AAcAAAAAAAAAAD///////9//z///////////gAAAAAAAAAAAAAAAAAAAA7/+AAMgAAAAAAAAAD///////8//w///////////AAAAAAAAAAAAAAAAAAAAAJ/+AAMQAAAAAAAAAH///////+f/8b//////////AAAAAAAAAAAAAAAAAAAAAM/+AABgAAAAAAAAAH////////f/94Af///////+wAAAAAAAAAAAAAAAAAAAAGf+AAAIAAAAAAAAAP////////P//+AP///////4wAAAAAAAAAAAAAAAAAAAAAP8AB/EAAAAAAAAAf////////n///AH///////wgAAAAAAAAAAAAAAAAAAAAAP+A4DwAAAAAAAAAf////////n///AH///P//+AAAAAAAAAAAAAABAAAAAAAAP+B4A8AAAAAAAAAf////////n//+AAf/4P/+IAAAAAAAAAAAAAAAgAAAAAAAH/B4AB4AAAAAAAAf////////x//8AA//wH/8YAAAAAAAAAAAAAAAAAAAAAAAD//4Aj9gAAAAAAAP////////x//4AAf/gD/8YAwAAAAAAAAAAAAAAAAAAAAAA//wAAAAAAAAAAAP////////4//wAAf+AD/+AA4AAAAAAAAAAAAAAAAAAAAAAP/wAAACAAAAAAAf////////4//AAAf8AD//AAwAAAAAAAAAAAAAAAAAAAAAABP/gAACAAAAAAgf////////8/8AAAf4AAf/gAwAAAAAAAAAAAAAAAAAAAAAAAD/gAAAAAAAAAA/////////+fwAAAPwAAP/gA4AAAAAAAAAAAAAAAAAAAAAAAA/gAAAAAAAAAAf//////////AAAAP4AAP/wA8AAAAAAAAAAAAAAAAAAAAAAAAHgAgAAAAAAAAf/////////4BAAAHwAIN/wAfAAAAAAAAAAAAAAAAAAAAAAAADgD4AAAAAAAAP/////////w4AAAHwAAMfgBPAAAAAAAAAAAAAAAAAAAAAAAADgP/+AAAAAAAH//////////4AAADwAAMfABPAAAAAAAAAAAAAAAAAAAAAAAABzP/+AAAAAAAD//////////4AAAD4AAMGACPAAAAAAAAAAAAAAAAAAAAAAAAA////gAAAAAAD//////////4AAABcAAMAAEHgAAAAAAAAAAAAAAAAAAAAAAAAM///wAAAAAAB//////////wAAAAMAAGAAAPgAAAAAAAAAAAAAAAAAAAAAAAAA///4AAAAAAAf/////////gAAAAMAADAAMDAAAAAAAAAAAAAAAAAAAAAAAAAA////gAAAAAAP/B///////gAAAAAABjgAeAAAAAAAAAAAAAAAAAAAAAAAAAAA////4AAAAAACAB///////AAAAAAABzwA+AAAAAAAAAAAAAAAAAAAAAAAAAAA////4AAAAAAAAAP/////+AAAAAAAAdwB8AAAAAAAAAAAAAAAAAAAAAAAAAAB////8AAAAAAAAAD/////8AAAAAAAAfwH8AIAAAAAAAAAAAAAAAAAAAAAAAAB////8AAAAAAAAAH/////4AAAAAAAAf4f+SYAAAAAAAAAAAAAAAAAAAAAAAAD////8AAAAAAAAAH/////wAAAAAAAAHwf8+YAAAAAAAAAAAAAAAAAAAAAADAH/////gAAAAAAAAH/////gAAAAAAAAL4f9QT0AAAAAAAAAAAAAAAAAAAAAAAH/////4AAAAAAAAH/////AAAAAAAAAD8f5+T7AAAAAAAAAAAAAAAAAAAAAAAH//////AAAAAAAAH////+AAAAAAAAAB+P5wA74AgAAAAAAAAAAAAAAAAAAAAH//////8AAAAAAAD////8AAAAAAAAAA8C54+f/AAAAAAAAAAAAAAAAAAAAAAP//////+AAAAAAAB////8AAAAAAAAAAcAB4AH/wYAAAAAAAAAAAAAAAAAAAAH///////gAAAAAAA////8AAAAAAAAAAMABoAI//yAAAAAAAAAAAAAAAAAAAAH///////gAAAAAAA////8AAAAAAAAAAHsAAAI/9hAAAAAAAAAAAAAAAAAAAAD///////gAAAAAAAf///8AAAAAAAAAAD/AAhA/8AQAAAAAAAAAAAAAAAAAAAB///////gAAAAAAAf///8AAAAAAAAAAAH//gAvOAWAAAAAAAAAAAAAAAAAAAB///////gAAAAAAAf///8AAAAAAAAAAAABjAAAHgHAAAAAAAAAAAAAAAAAAAA///////AAAAAAAAf///+AAAAAAAAAAAAAEAACBgBAAAAAAAAAAAAAAAAAAAA//////+AAAAAAAAP///+AAAAAAAAAAAAAADyCAEAAAAAAAAAAAAAAAAAAAAAf/////8AAAAAAAAf///+AQAAAAAAAAAAAAD+HAAAAAAAQAAAAAAAAAAAAAAAf/////4AAAAAAAA////+AwAAAAAAAAAAAAD+HAAAAAAAAAAAAAAAAAAAAAAAP/////4AAAAAAAA////+BwAAAAAAAAAAAB38HgAAAAAAAAAAAAAAAAAAAAAAH/////4AAAAAAAA////+D4AAAAAAAAAAAD/+HwAADAAAAAAAAAAAAAAAAAAAD/////4AAAAAAAA////8PwAAAAAAAAAAAH//XwAABgDAAAAAgAAAAAAAAAAAA/////4AAAAAAAB////wPwAAAAAAAAAAAP///wAAAAGAAAAAAAAAAAAAAAAAAf////4AAAAAAAA////gPwAAAAAAAAAAAP///4AAAAAAAAAAAAAAAAAAAAAAAf////wAAAAAAAA////APgAAAAAAAAAAAf///8AAAAAAAAAAAAAAAAAAAAAAAP////wAAAAAAAAf//+APgEAAAAAAAAAH////+AAIAAAAAAAAAAAAAAAAAAAAP////gAAAAAAAAP///AfgQAAAAAAAAAf/////AAGAAAAAAAAAAAAAAAAAAAAf////gAAAAAAAAP///AfAAAAAAAAAAA//////gACAAAAAAAAAAAAAAAAAAAAf///8AAAAAAAAAP///AfAAAAAAAAAAB//////gAAAAAAAAAAAAAAAAAAAAAAf///gAAAAAAAAAP//+AfAAAAAAAAAAB//////4AAAAAAAAAAAAAAAAAAAAAAf///AAAAAAAAAAH//8AMAAAAAAAAAAB//////4AAAAAAAAAAAAAAAAAAAAAAf///AAAAAAAAAAH//4AAAAAAAAAAAAB//////4AAAAAAAAAAAAAAAAAAAAAAf///AAAAAAAAAAH//4AAAAAAAAAAAAA//////8AAAAAAAAAAAAAAAAAAAAAA///+AAAAAAAAAAD//4AAAAAAAAAAAAA//////8AAAAAAAAAAAAAAAAAAAAAA///+AAAAAAAAAAB//wAAAAAAAAAAAAAf/////8AAAAAAAAAAAAAAAAAAAAAA///8AAAAAAAAAAB//gAAAAAAAAAAAAAf/////4AAAAAAAAAAAAAAAAAAAAAA///4AAAAAAAAAAA//AAAAAAAAAAAAAAf/////4AAAAAAAAAAAAAAAAAAAAAA///wAAAAAAAAAAA/+AAAAAAAAAAAAAAf/wP//4AAAAAAAAAAAAAAAAAAAAAA///gAAAAAAAAAAA/8AAAAAAAAAAAAAAf8AP//wAAAAAAAAAAAAAAAAAAAAAA///AAAAAAAAAAAAcAAAAAAAAAAAAAAAeAAF//gAAAAAAAAAAAAAAAAAAAAAB//4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD//gAABgAAAAAAAAAAAAAAAAAB//8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf/AAAAwAAAAAAAAAAAAAAAAAD//4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/AAAA+AAAAAAAAAAAAAAAAAD//wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH4AAAA+AAAAAAAAAAAAAAAAAD/8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA8AAAAAAAAAAAAAAAAAD/8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAiAAACYAAAAAAAAAAAAAAAAAD/gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAeAAADwAAAAAAAAAAAAAAAAAD/4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAcAAAHAEAAAAAAAAAAAAAAAAH/gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMAAAeAAAAAAAAAAAAAAAAAAH/gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB8AAAAAAAAAAAAAAAAAAH+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD4AAAAAAAAAAAAAAAAAAP+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABwAAAAAAAAAAAAAAAAAAH/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP+AAAAAAAAAAAAAAAAAAAAAAGAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH4BwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH8AgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/wAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABeAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAeAAAAAAAAAAAAAAAAAAAAAAAAAADQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD+AAAAAAAAAAAAAAAAAAv4AAAAY///PwHn/wAAAAAAAAAAAAAAAAAAAAAAAAHgAAAAAAAAAAAAAAAAAH///AAD//////////wAAAAAAAAAAAAAAAAAAAAAAAB4AAAAAAAAAAAAAAAED////8A////////////+AAAAAAAAAAAAAAAAAAAAAJ/8AAAAAAAAAAAACAAP3////8D/////////////8AAAAAAAAAAAAAAAAAAAAM/+AAAAAAAABMH//3r//////5///////////////+AAAAAAAAAAAAAAAAAAAP/+AAAAAAAA/////////////5////////////////4AAAAAAAAAAAAAB/iQAF7/AAAAAAAB//////////////////////////////wAAAAAAAAABmAAB///v///AAAAAAAf//////////////////////////////QAAAAAAAAJz//sA//////+AAAAAAA//////////////////////////////4AAAAAAAC/////////////4AAAAAAf//////////////////////////////gAAAAAAB/////////////4AAAAAA////////////////////////////////gAAAAAH/////////////+AAAAAAf////////////////////////////////zgAAADB/////////////gOAAD8A/////////////////////////////////+AAAAD4T////////////w/AAH+B3///////////////////////////////+AAAAAAAB////////////4x/g/wA////////////////////////////////+AAAAAAB///////////////wAAA//////////////////////////////////AAAAAAAP//////////////+H////////////////////////////////////+AAAH////////////////////////////////////////////////////////+A//H/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////";
    var bin = atob(LAND), ctx = cv.getContext("2d"), W = cv.width, R = W * 0.47, D = Math.PI / 180;
    var FR = [[-4.8, 48.5], [-1.8, 49.7], [1.6, 51.1], [2.6, 51.1], [4.2, 49.9], [8.2, 49], [7.6, 47.6], [6, 46.2], [7.6, 43.8], [3.2, 42.4], [-1.8, 43.3], [-1.2, 46.2]];
    function isLand(lat, lon) {
      var i = Math.min(179, Math.floor(90 - lat)) * 360 + (Math.floor(lon + 180) % 360);
      return bin.charCodeAt(i >> 3) & (128 >> (i & 7));
    }
    function inFrance(lon, lat) {
      for (var i = 0, j = FR.length - 1, c = false; i < FR.length; j = i++) {
        if ((FR[i][1] > lat) !== (FR[j][1] > lat) && lon < (FR[j][0] - FR[i][0]) * (lat - FR[i][1]) / (FR[j][1] - FR[i][1]) + FR[i][0]) c = !c;
      }
      return c;
    }
    var pts = [], STEP = 1.6;
    for (var lat = -82; lat <= 82; lat += STEP) {
      var n = Math.max(1, Math.round(360 / STEP * Math.cos(lat * D)));
      for (var k = 0; k < n; k++) {
        var lon = -180 + (k + 0.5) * 360 / n;
        if (isLand(lat, lon)) pts.push([lat * D, lon * D, inFrance(lon, lat)]);
      }
    }
    var TILT = 24 * D, ct = Math.cos(TILT), st = Math.sin(TILT), LYON = [45.76 * D, 4.84 * D];
    var lon0 = 2 * D, t = 0, visible = false, raf = null;
    function project(p) {
      var dl = p[1] - lon0, cp = Math.cos(p[0]);
      var x = cp * Math.sin(dl), y = Math.sin(p[0]), z = cp * Math.cos(dl);
      return [W / 2 + x * R, W / 2 - (y * ct - z * st) * R, y * st + z * ct];
    }
    function draw() {
      ctx.clearRect(0, 0, W, W);
      for (var k = 0; k < pts.length; k++) {
        var q = project(pts[k]);
        if (q[2] <= 0) continue;
        ctx.globalAlpha = 0.2 + 0.8 * q[2];
        ctx.fillStyle = pts[k][2] ? "#5fe0bc" : "#d7f7ec";
        var r = pts[k][2] ? 3.4 : 1.2 + q[2] * 1.1;
        ctx.fillRect(q[0] - r / 2, q[1] - r / 2, r, r);
      }
      var l = project(LYON);
      if (l[2] > 0) {
        var ph = (t % 120) / 120;
        ctx.globalAlpha = (1 - ph) * l[2];
        ctx.strokeStyle = "#5fe0bc"; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(l[0], l[1], 5 + ph * 22, 0, 6.2832); ctx.stroke();
        ctx.globalAlpha = l[2]; ctx.fillStyle = "#fff";
        ctx.beginPath(); ctx.arc(l[0], l[1], 4.5, 0, 6.2832); ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
    function frame() {
      t++; lon0 -= 0.0016; draw();
      raf = visible && !document.hidden && !isPaused() ? requestAnimationFrame(frame) : null;
    }
    function sync() { if (visible && !document.hidden && !isPaused() && !raf) raf = requestAnimationFrame(frame); }
    draw();
    if (reduce || !hasIO) return;
    document.addEventListener("visibilitychange", sync);
    document.addEventListener("motionchange", sync);
    new IntersectionObserver(function (e) { visible = e[0].isIntersecting; sync(); }).observe(cv);
  })();

  /* ---------- Pause des animations (WCAG 2.2.2) ---------- */
  (function motionControl() {
    var b = $("anim-ctl");
    if (!b) return;
    if (reduce) { b.hidden = true; return; }
    b.addEventListener("click", function () {
      var off = root_.classList.toggle("anim-off");
      b.setAttribute("aria-pressed", off ? "true" : "false");
      b.setAttribute("aria-label", off ? "Reprendre les animations" : "Mettre en pause les animations");
      b.lastChild.textContent = off ? "Reprendre" : "Animations";
      document.dispatchEvent(new Event("motionchange"));
    });
  })();

  /* ---------- Consentement : le bandeau n'apparaît que si des traceurs sont ajoutés ----------
     Mode d'emploi : placer le script du traceur avec type="text/plain" et data-consent="mesure"
     (audience) ou data-consent="publicite" (pixels publicitaires). Il ne s'exécute qu'après accord. */
  (function consent() {
    var pending = document.querySelectorAll('script[type="text/plain"][data-consent]');
    // Le bandeau s'affiche à chaque nouveau visiteur, même sans traceur actif (CONFIG.consentBanner)
    if (!pending.length && !CONFIG.consentBanner) return;
    var KEY = "mova_consent", MAXAGE = 182 * 864e5;
    // Signature des traceurs présents : si elle change, l'ancien accord ne vaut plus et on redemande
    var sig = Array.prototype.map.call(pending, function (s) { return (s.getAttribute("data-consent") || "") + ":" + (s.getAttribute("src") || s.text.length); }).sort().join("|") || "aucun";
    var CATS = { mesure: ["Mesure d'audience", "Comprendre comment le site est utilisé, de façon statistique."], publicite: ["Publicité", "Mesurer l'efficacité de nos campagnes sur Instagram, LinkedIn et Meta."] };
    var used = {};
    Array.prototype.forEach.call(pending, function (s) { used[s.getAttribute("data-consent")] = true; });
    if (!pending.length) { used.mesure = true; used.publicite = true; }
    function read() {
      try {
        var v = JSON.parse(localStorage.getItem(KEY) || "null");
        if (v && v.t && Date.now() - v.t < MAXAGE && v.c && v.s === sig) return v.c;
      } catch (e) {}
      return null;
    }
    function write(c) { try { localStorage.setItem(KEY, JSON.stringify({ t: Date.now(), c: c, s: sig })); } catch (e) {} }
    function run(c) {
      Array.prototype.forEach.call(document.querySelectorAll('script[type="text/plain"][data-consent]'), function (old) {
        if (!c[old.getAttribute("data-consent")]) return;
        var s = document.createElement("script");
        Array.prototype.forEach.call(old.attributes, function (a) { if (a.name !== "type" && a.name !== "data-consent") s.setAttribute(a.name, a.value); });
        s.text = old.text;
        old.parentNode.replaceChild(s, old);
      });
    }
    var bar = null, previous = read();
    function close() { if (bar) { bar.remove(); bar = null; } }
    function decide(c) {
      var wasOn = previous && Object.keys(c).some(function (k) { return previous[k] && !c[k]; });
      write(c); previous = c; close();
      if (wasOn) { location.reload(); return; }   // retire les traceurs déjà chargés
      run(c);
    }
    function all(v) { var c = {}; Object.keys(used).forEach(function (k) { c[k] = v; }); return c; }
    function open(custom) {
      close();
      bar = document.createElement("div");
      bar.className = "cmp-bar";
      bar.setAttribute("role", "dialog");
      bar.setAttribute("aria-labelledby", "cmp-t");
      var opts = Object.keys(used).map(function (k) {
        return '<label class="cmp-opt"><b>' + CATS[k][0] + '</b><small>' + CATS[k][1] + '</small><input type="checkbox" data-k="' + k + '"' + (previous && previous[k] ? " checked" : "") + '></label>';
      }).join("");
      bar.innerHTML = '<h2 id="cmp-t">Vos choix sur les cookies</h2>' +
        '<p>' + (pending.length ? 'Nous aimerions mesurer l\'audience et l\'efficacité de nos publicités. Rien n\'est déposé sans votre accord, et le site fonctionne de la même façon si vous refusez.' : 'Aucun cookie de mesure ni de publicité n\'est actif aujourd\'hui sur ce site. Si nous en ajoutons un, il ne s\'activera qu\'avec votre accord, que nous vous redemanderons alors.') + ' <a href="cookies.html">En savoir plus</a>.</p>' +
        (custom ? '<div class="cmp-opts">' + opts + '</div><button type="button" class="cmp-save" data-act="save">Enregistrer mes choix</button>' :
          '<div class="cmp-act"><button type="button" data-act="none">Tout refuser</button><button type="button" data-act="all">Tout accepter</button><button type="button" data-act="custom">Personnaliser</button></div>');
      document.body.appendChild(bar);
      bar.addEventListener("click", function (e) {
        var a = e.target.getAttribute && e.target.getAttribute("data-act");
        if (a === "all") decide(all(true));
        else if (a === "none") decide(all(false));
        else if (a === "custom") open(true);
        else if (a === "save") {
          var c = all(false);
          Array.prototype.forEach.call(bar.querySelectorAll("input[data-k]"), function (i) { c[i.getAttribute("data-k")] = i.checked; });
          decide(c);
        }
      });
      var first = bar.querySelector("button, input");
      if (first && custom) first.focus();
    }
    // Lien permanent pour modifier ou retirer son choix
    var list = $("legal-links");
    if (list && !list.querySelector(".link-btn")) {
      var li = document.createElement("li"), btn = document.createElement("button");
      btn.type = "button"; btn.className = "link-btn"; btn.textContent = "Gérer mes cookies";
      btn.addEventListener("click", function () { open(true); });
      li.appendChild(btn); list.appendChild(li);
    }
    if (previous) run(previous); else open(false);
  })();

  var y = $("year");
  if (y) y.textContent = new Date().getFullYear();
})();
