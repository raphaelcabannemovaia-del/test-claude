/* Configuration : à compléter avant la mise en ligne (voir README.md) */
const CONFIG = {
  // URL de votre page de réservation Google Agenda (Planning des rendez-vous > Partager)
  bookingUrl: "",
  // URL d'un service de formulaire (ex. Formspree : https://formspree.io/f/xxxxxxx)
  formEndpoint: ""
};

(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasIO = "IntersectionObserver" in window;
  var NB = " ";
  var nf = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 });
  var eur = function (n) { return nf.format(n) + NB + "€"; };
  document.documentElement.classList.add("js");

  /* ---------- Progression, en-tête, menu mobile ---------- */
  var hdr = $("hdr"), prog = $("progress");
  function onScroll() {
    var y = window.scrollY || 0, max = document.documentElement.scrollHeight - window.innerHeight;
    hdr.classList.toggle("is-scrolled", y > 10);
    prog.style.setProperty("--p", max > 0 ? Math.min(1, y / max).toFixed(4) : 0);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();

  var menuBtn = $("menu-btn"), menu = $("menu");
  function setMenu(open) {
    menu.hidden = !open;
    hdr.classList.toggle("menu-open", open);
    menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    menuBtn.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
  }
  menuBtn.addEventListener("click", function () { setMenu(menu.hidden); });
  menu.addEventListener("click", function (e) { if (e.target.closest("a")) setMenu(false); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !menu.hidden) { setMenu(false); menuBtn.focus(); } });

  /* ---------- Apparitions au défilement ---------- */
  document.querySelectorAll("[data-stagger]").forEach(function (g) {
    Array.prototype.forEach.call(g.children, function (c, i) { c.style.setProperty("--i", i); });
  });
  if (!reduce && hasIO) {
    document.documentElement.classList.add("motion");
    var rvObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); rvObs.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    document.querySelectorAll(".rv").forEach(function (el) { rvObs.observe(el); });
  }

  /* ---------- Compteurs ---------- */
  if (!reduce && hasIO) {
    var cObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        cObs.unobserve(e.target);
        var el = e.target, to = +el.dataset.count, pre = el.dataset.prefix || "", suf = (el.dataset.suffix || "").replace(" ", NB), t0 = null;
        (function step(ts) {
          if (t0 === null) t0 = ts;
          var p = Math.min(1, (ts - t0) / 1300), k = 1 - Math.pow(1 - p, 3);
          el.textContent = pre + Math.round(to * k) + suf;
          if (p < 1) requestAnimationFrame(step);
        })(performance.now());
      });
    }, { threshold: 0.6 });
    document.querySelectorAll("[data-count]").forEach(function (el) { cObs.observe(el); });
  }

  /* ---------- Démo : conversation en direct ---------- */
  (function demo() {
    var root = $("demo");
    if (!root) return;
    var feed = $("feed"), typing = feed.querySelector(".typing"), timer = $("timer");
    var total = +root.dataset.total || 23500;
    var items = Array.prototype.map.call(root.querySelectorAll("[data-t]"), function (el) {
      return { el: el, t: +el.dataset.t, out: el.classList.contains("bub-out") };
    }).sort(function (a, b) { return a.t - b.t; });
    if (reduce) { timer.textContent = "00:42"; return; }
    var elapsed = 600, last = null, playing = false, visible = false, ending = false;
    function reset() {
      items.forEach(function (i) { i.el.classList.add("is-off"); i.el.classList.remove("is-new"); });
      typing.classList.add("is-off"); root.classList.remove("is-ending"); ending = false;
    }
    function render() {
      items.forEach(function (i) {
        if (elapsed >= i.t && i.el.classList.contains("is-off")) { i.el.classList.remove("is-off"); i.el.classList.add("is-new"); }
      });
      var next = null;
      for (var k = 0; k < items.length; k++) { if (items[k].out && elapsed < items[k].t) { next = items[k]; break; } }
      if (next && elapsed >= next.t - 1150) {
        if (typing.nextElementSibling !== next.el) feed.insertBefore(typing, next.el);
        typing.classList.remove("is-off");
      } else typing.classList.add("is-off");
      var s = Math.floor(Math.min(elapsed, 17000) / 400);
      timer.textContent = String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0");
      if (!ending && elapsed > total - 700) { root.classList.add("is-ending"); ending = true; }
    }
    function frame(ts) {
      if (!playing) { last = null; return; }
      if (last !== null) elapsed += Math.min(100, ts - last);
      last = ts;
      if (elapsed >= total) { elapsed = 0; reset(); }
      render();
      requestAnimationFrame(frame);
    }
    function sync() {
      var want = visible && !document.hidden;
      if (want && !playing) { playing = true; requestAnimationFrame(frame); }
      else if (!want) playing = false;
    }
    reset(); render();
    document.addEventListener("visibilitychange", sync);
    if (hasIO) new IntersectionObserver(function (e) { visible = e[0].isIntersecting; sync(); }, { threshold: 0.2 }).observe(root);
    else { visible = true; sync(); }
  })();

  /* ---------- Le constat : texte qui s'allume au défilement ---------- */
  (function revealText() {
    var el = $("reveal-text");
    if (!el || reduce) return;
    var words = el.textContent.trim().split(" ");
    var from = words.indexOf("concurrent,");
    el.innerHTML = words.map(function (w, i) {
      var hl = from > -1 && i >= from && w !== "et";
      return '<span class="w' + (hl ? " hl" : "") + '">' + w + "</span>";
    }).join(" ");
    var spans = el.querySelectorAll(".w");
    function upd() {
      var r = el.getBoundingClientRect(), vh = window.innerHeight;
      var p = (vh * 0.85 - r.top) / (r.height + vh * 0.35);
      var n = Math.round(Math.max(0, Math.min(1, p)) * spans.length);
      for (var i = 0; i < spans.length; i++) spans[i].classList.toggle("on", i < n);
    }
    window.addEventListener("scroll", upd, { passive: true });
    window.addEventListener("resize", upd);
    upd();
  })();

  /* ---------- Simulateur ---------- */
  (function sim() {
    var leads = $("s-leads"), lost = $("s-lost"), fee = $("s-fee");
    if (!leads) return;
    var CONV = 0.02, RECOVER = 0.5, MIN_PER_LEAD = 8;
    var shown = { lose: 0, win: 0 }, raf = null;
    function fill(r) { r.style.setProperty("--p", ((r.value - r.min) / (r.max - r.min) * 100) + "%"); }
    function paint() {
      var l = Math.round(shown.lose / 100) * 100, w = Math.round(shown.win / 100) * 100;
      $("r-lose").textContent = eur(l);
      $("r-lose2").textContent = eur(l);
      $("r-win").textContent = eur(w);
    }
    function tween(target) {
      var from = { lose: shown.lose, win: shown.win }, t0 = null, dur = reduce ? 0 : 450;
      if (raf) cancelAnimationFrame(raf);
      (function step(ts) {
        if (t0 === null) t0 = ts;
        var p = dur ? Math.min(1, (ts - t0) / dur) : 1, k = 1 - Math.pow(1 - p, 3);
        shown.lose = from.lose + (target.lose - from.lose) * k;
        shown.win = from.win + (target.win - from.win) * k;
        paint();
        if (p < 1) raf = requestAnimationFrame(step);
      })(performance.now());
    }
    function update() {
      var L = +leads.value, P = +lost.value / 100, F = +fee.value;
      [leads, lost, fee].forEach(fill);
      $("o-leads").textContent = L;
      $("o-lost").textContent = Math.round(P * 100) + NB + "%";
      $("o-fee").textContent = eur(F);
      var lose = L * P * CONV * F * 12;
      $("r-more").textContent = "Et environ " + Math.round(L * MIN_PER_LEAD / 60) + NB + "h de tri libérées chaque mois.";
      $("bar-win").style.setProperty("--w", (RECOVER * 100) + "%");
      tween({ lose: lose, win: lose * RECOVER });
    }
    [leads, lost, fee].forEach(function (r) { r.addEventListener("input", update); });
    shown.lose = 80 * 0.3 * CONV * 5000 * 12; shown.win = shown.lose * RECOVER;
    update();
  })();

  /* ---------- Fonctionnement : étapes + écran du téléphone ---------- */
  (function how() {
    var steps = Array.prototype.slice.call(document.querySelectorAll(".hstep"));
    var screens = document.querySelectorAll(".scr");
    if (!steps.length) return;
    function activate(n) {
      steps.forEach(function (s) { s.classList.toggle("on", s.dataset.step === n); });
      Array.prototype.forEach.call(screens, function (s) { s.classList.toggle("on", s.dataset.scr === n); });
    }
    steps.forEach(function (s) { s.addEventListener("click", function () { activate(s.dataset.step); }); });
    if (hasIO) {
      var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) activate(e.target.dataset.step); });
      }, { rootMargin: "-45% 0px -45% 0px" });
      steps.forEach(function (s) { obs.observe(s); });
    }
  })();

  /* ---------- Une journée : onglets ---------- */
  (function day() {
    var list = $("day-tabs");
    if (!list) return;
    var tabs = Array.prototype.slice.call(list.querySelectorAll('[role="tab"]'));
    var idx = 0, timer = null, auto = !reduce, visible = false;
    function select(n, focus) {
      idx = (n + tabs.length) % tabs.length;
      tabs.forEach(function (t, i) {
        var on = i === idx, panel = $(t.getAttribute("aria-controls"));
        t.setAttribute("aria-selected", on ? "true" : "false");
        t.tabIndex = on ? 0 : -1;
        panel.hidden = !on;
        panel.classList.toggle("is-in", on && !reduce);
      });
      if (focus) tabs[idx].focus();
      if (auto) { list.classList.remove("is-auto"); void list.offsetWidth; list.classList.add("is-auto"); }
    }
    function stop() { auto = false; list.classList.remove("is-auto"); clearInterval(timer); timer = null; }
    function run() {
      clearInterval(timer); timer = null;
      if (auto && visible) { select(idx); timer = setInterval(function () { select(idx + 1); }, 7000); }
    }
    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () { stop(); select(i); });
      t.addEventListener("keydown", function (e) {
        if (e.key === "ArrowRight") { e.preventDefault(); stop(); select(idx + 1, true); }
        if (e.key === "ArrowLeft") { e.preventDefault(); stop(); select(idx - 1, true); }
      });
    });
    if (!auto) list.classList.remove("is-auto");
    if (hasIO && auto) new IntersectionObserver(function (e) { visible = e[0].isIntersecting; run(); }, { threshold: 0.4 }).observe(list);
  })();

  /* ---------- Formulaire d'audit puis choix du créneau ---------- */
  (function form() {
    var f = $("audit-form");
    if (!f) return;
    var err = $("f-err"), done = $("audit-done");
    function showDone() {
      f.hidden = true;
      done.hidden = false;
      done.classList.add("is-in");
      var link = $("book-link"), note = $("preview-note"), notes = [];
      if (CONFIG.bookingUrl) link.href = CONFIG.bookingUrl;
      else {
        link.setAttribute("aria-disabled", "true");
        link.addEventListener("click", function (e) { e.preventDefault(); });
        notes.push("Aperçu : le lien de réservation Google Agenda n'est pas encore renseigné.");
      }
      if (!CONFIG.formEndpoint) notes.push("Aperçu : le formulaire n'est pas encore relié à votre email, rien n'a été envoyé.");
      if (notes.length) { note.hidden = false; note.textContent = notes.join(" "); }
    }
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      err.textContent = "";
      if (!f.checkValidity()) {
        err.textContent = "Complétez les champs obligatoires et cochez la case d'accord.";
        var bad = f.querySelector(":invalid");
        if (bad) bad.focus();
        return;
      }
      if (!CONFIG.formEndpoint) { showDone(); return; }
      var btn = $("f-submit");
      btn.disabled = true;
      var data = {};
      new FormData(f).forEach(function (v, k) { data[k] = v; });
      fetch(CONFIG.formEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(data)
      }).then(function (r) {
        if (!r.ok) throw new Error("http " + r.status);
        showDone();
      }).catch(function () {
        btn.disabled = false;
        err.textContent = "L'envoi a échoué. Réessayez dans un instant.";
      });
    });
  })();

  var y = $("year");
  if (y) y.textContent = new Date().getFullYear();
})();
