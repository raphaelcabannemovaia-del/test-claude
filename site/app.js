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
  var NB = " ";
  var eur = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 });
  var fmtEur = function (n) { return eur.format(n) + NB + "€"; };
  var hasIO = "IntersectionObserver" in window;

  /* ---------- En-tête ---------- */
  var hdr = $("hdr");
  var mcta = $("m-cta");
  var audit = $("audit");
  function onScroll() {
    var y = window.scrollY || 0;
    hdr.classList.toggle("is-scrolled", y > 8);
    if (mcta && audit) {
      var r = audit.getBoundingClientRect();
      var nearForm = r.top < window.innerHeight * 0.9 && r.bottom > 0;
      mcta.classList.toggle("is-on", y > 600 && !nearForm);
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Apparitions au défilement ---------- */
  document.querySelectorAll("[data-stagger]").forEach(function (g) {
    Array.prototype.forEach.call(g.children, function (c, i) { c.style.setProperty("--i", i); });
  });
  if (!reduce && hasIO) {
    document.documentElement.classList.add("motion");
    var rvObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); rvObs.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    document.querySelectorAll(".rv").forEach(function (el) { rvObs.observe(el); });
  }

  /* ---------- Compteurs ---------- */
  function countUp(el) {
    var to = parseFloat(el.dataset.count), pre = el.dataset.prefix || "", suf = (el.dataset.suffix || "").replace(" ", NB);
    var t0 = null, dur = 1300;
    function step(ts) {
      if (t0 === null) t0 = ts;
      var p = Math.min(1, (ts - t0) / dur), k = 1 - Math.pow(1 - p, 3);
      el.textContent = pre + Math.round(to * k) + suf;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if (!reduce && hasIO) {
    var cObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { countUp(e.target); cObs.unobserve(e.target); } });
    }, { threshold: 0.6 });
    document.querySelectorAll("[data-count]").forEach(function (el) { cObs.observe(el); });
  }

  /* ---------- Démo : conversation et dossier en direct ---------- */
  (function demo() {
    var root = $("demo");
    if (!root) return;
    var feed = $("feed");
    var typing = feed.querySelector(".typing");
    var bar = $("demo-bar");
    var btn = $("demo-toggle");
    var total = parseFloat(root.dataset.total) || 23500;
    var items = Array.prototype.map.call(root.querySelectorAll("[data-t]"), function (el) {
      return { el: el, t: parseFloat(el.dataset.t), out: el.classList.contains("msg--out"), toggle: el.hasAttribute("data-on") };
    }).sort(function (a, b) { return a.t - b.t; });
    if (reduce) { typing.classList.add("is-off"); return; }

    var elapsed = 600, last = null, playing = false, visible = false, userPaused = false, ending = false;
    function setOff(i) {
      if (i.toggle) i.el.classList.remove("is-on"); else { i.el.classList.add("is-off"); i.el.classList.remove("is-new"); }
    }
    function setOn(i) {
      if (i.toggle) i.el.classList.add("is-on"); else { i.el.classList.remove("is-off"); i.el.classList.add("is-new"); }
    }
    function isOn(i) { return i.toggle ? i.el.classList.contains("is-on") : !i.el.classList.contains("is-off"); }
    function reset() { items.forEach(setOff); typing.classList.add("is-off"); root.classList.remove("is-ending"); ending = false; }
    function render() {
      items.forEach(function (i) { if (elapsed >= i.t && !isOn(i)) setOn(i); });
      var next = null;
      for (var k = 0; k < items.length; k++) { if (items[k].out && elapsed < items[k].t) { next = items[k]; break; } }
      if (next && elapsed >= next.t - 1150) {
        if (typing.nextElementSibling !== next.el) feed.insertBefore(typing, next.el);
        typing.classList.remove("is-off");
      } else typing.classList.add("is-off");
      if (!ending && elapsed > total - 700) { root.classList.add("is-ending"); ending = true; }
      bar.style.transform = "scaleX(" + Math.min(1, elapsed / total) + ")";
    }
    function frame(ts) {
      if (!playing) { last = null; return; }
      if (last !== null) elapsed += Math.min(100, ts - last);
      last = ts;
      if (elapsed >= total) { elapsed = 0; reset(); }
      render();
      requestAnimationFrame(frame);
    }
    function play() { if (playing) return; playing = true; requestAnimationFrame(frame); }
    function pause() { playing = false; }
    function sync() { if (visible && !userPaused && !document.hidden) play(); else pause(); }
    function label() {
      btn.querySelector("use").setAttribute("href", userPaused ? "#i-play" : "#i-pause");
      btn.querySelector("span").textContent = userPaused ? "Lecture" : "Pause";
    }

    reset();
    render();
    btn.hidden = false;
    btn.addEventListener("click", function () { userPaused = !userPaused; label(); sync(); });
    document.addEventListener("visibilitychange", sync);
    if (hasIO) {
      new IntersectionObserver(function (e) { visible = e[0].isIntersecting; sync(); }, { threshold: 0.25 }).observe(root);
    } else { visible = true; sync(); }
  })();

  /* ---------- Simulateur ---------- */
  (function sim() {
    var leads = $("s-leads"), lost = $("s-lost"), fee = $("s-fee");
    if (!leads) return;
    var CONV = 0.02, RECOVER = 0.5, MIN_PER_LEAD = 8;
    var shown = { lose: 0, win: 0 }, raf = null;
    function fill(r) { r.style.setProperty("--p", ((r.value - r.min) / (r.max - r.min) * 100) + "%"); }
    function tween(target) {
      var from = { lose: shown.lose, win: shown.win }, t0 = null, dur = reduce ? 0 : 450;
      if (raf) cancelAnimationFrame(raf);
      function step(ts) {
        if (t0 === null) t0 = ts;
        var p = dur ? Math.min(1, (ts - t0) / dur) : 1, k = 1 - Math.pow(1 - p, 3);
        shown.lose = from.lose + (target.lose - from.lose) * k;
        shown.win = from.win + (target.win - from.win) * k;
        $("r-lose").textContent = fmtEur(Math.round(shown.lose / 100) * 100);
        $("r-win").textContent = fmtEur(Math.round(shown.win / 100) * 100);
        if (p < 1) raf = requestAnimationFrame(step);
      }
      raf = requestAnimationFrame(step);
    }
    function update() {
      var L = +leads.value, P = +lost.value / 100, F = +fee.value;
      [leads, lost, fee].forEach(fill);
      $("o-leads").textContent = L;
      $("o-lost").textContent = Math.round(P * 100) + NB + "%";
      $("o-fee").textContent = fmtEur(F);
      var lose = L * P * CONV * F * 12;
      var win = lose * RECOVER;
      var hours = Math.round(L * MIN_PER_LEAD / 60);
      $("r-more").textContent = "par an, et " + hours + NB + "h de tri libérées chaque mois.";
      tween({ lose: lose, win: win });
    }
    [leads, lost, fee].forEach(function (r) { r.addEventListener("input", update); });
    shown.lose = 80 * 0.3 * CONV * 5000 * 12; shown.win = shown.lose * RECOVER;
    update();
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
        if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); stop(); select(idx + 1, true); }
        if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); stop(); select(idx - 1, true); }
      });
    });
    if (!auto) list.classList.remove("is-auto");
    if (hasIO && auto) {
      new IntersectionObserver(function (e) { visible = e[0].isIntersecting; run(); }, { threshold: 0.4 }).observe(list);
    }
  })();

  /* ---------- Méthode : ligne de progression ---------- */
  (function steps() {
    var s = $("steps");
    if (!s || reduce) return;
    function upd() {
      var r = s.getBoundingClientRect(), vh = window.innerHeight;
      var p = (vh * 0.6 - r.top) / r.height;
      s.style.setProperty("--prog", Math.max(0, Math.min(1, p)).toFixed(3));
    }
    window.addEventListener("scroll", upd, { passive: true });
    window.addEventListener("resize", upd);
    upd();
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
      done.scrollIntoView({ block: "nearest", behavior: reduce ? "auto" : "smooth" });
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
