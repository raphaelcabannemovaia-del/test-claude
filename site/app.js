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
  document.documentElement.classList.add("js");

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
  document.querySelectorAll(".flow").forEach(function (f) {
    Array.prototype.forEach.call(f.children, function (li, k) { li.style.setProperty("--k", k); });
  });
  if (!reduce && hasIO) {
    document.documentElement.classList.add("motion");
    var rvObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); rvObs.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    document.querySelectorAll(".rv").forEach(function (el) { rvObs.observe(el); });
  }

  /* ---------- Compteurs des chiffres sourcés ---------- */
  if (!reduce && hasIO) {
    var cObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        cObs.unobserve(e.target);
        var el = e.target, to = +el.dataset.count, pre = el.dataset.prefix || "", suf = (el.dataset.suffix || "").replace(" ", NB), t0 = null;
        (function step(ts) {
          if (t0 === null) t0 = ts;
          var p = Math.min(1, (ts - t0) / 1200), k = 1 - Math.pow(1 - p, 3);
          el.textContent = pre + Math.round(to * k) + suf;
          if (p < 1) requestAnimationFrame(step);
        })(performance.now());
      });
    }, { threshold: 0.6 });
    document.querySelectorAll("[data-count]").forEach(function (el) { cObs.observe(el); });
  }

  /* ---------- Déroulé de l'automatisation (ouverture) ---------- */
  (function workflow() {
    var root = $("wf");
    if (!root || reduce) return;
    var steps = root.querySelectorAll(".wstep");
    var i = -1, timer = null, visible = false;
    function paint() {
      Array.prototype.forEach.call(steps, function (s, k) {
        s.classList.toggle("on", k <= i);
        s.classList.toggle("cur", k === i);
      });
    }
    function tick() {
      i = i >= steps.length - 1 ? -1 : i + 1;
      paint();
      clearTimeout(timer);
      timer = setTimeout(tick, i === steps.length - 1 ? 3200 : i === -1 ? 600 : 1300);
    }
    function sync() {
      clearTimeout(timer);
      if (visible && !document.hidden) timer = setTimeout(tick, 700);
    }
    i = 0; paint();
    document.addEventListener("visibilitychange", sync);
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

  /* ---------- Formulaire puis choix du créneau ---------- */
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
        err.textContent = "Complétez les champs obligatoires pour continuer.";
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
