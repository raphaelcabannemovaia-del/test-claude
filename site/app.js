/* Configuration : à compléter avant la mise en ligne (voir README.md) */
const CONFIG = {
  // URL de votre page de réservation Google Agenda (Planning des rendez-vous > Partager)
  bookingUrl: "",
  // URL d'un service de formulaire (ex. Formspree : https://formspree.io/f/xxxxxxx)
  formEndpoint: ""
};

(function () {
  "use strict";
  var eur = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
  var num = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 });
  var $ = function (id) { return document.getElementById(id); };

  /* Calculateur de pertes */
  var inputs = ["leads", "lost", "conv", "fee", "rec", "min"];
  function read(id) { return parseFloat($("c-" + id).value); }
  function compute() {
    var leads = read("leads"), lost = read("lost") / 100, conv = read("conv") / 100;
    var fee = read("fee"), rec = read("rec") / 100, min = read("min");

    $("o-leads").textContent = num.format(leads);
    $("o-lost").textContent = Math.round(lost * 100) + " %";
    $("o-conv").textContent = "1 sur " + num.format(1 / conv);
    $("o-fee").textContent = eur.format(fee);
    $("o-rec").textContent = Math.round(rec * 100) + " %";
    $("o-min").textContent = min + " min";

    var lostPerMonth = leads * lost;
    var salesPerYear = lostPerMonth * rec * conv * 12;
    var yearly = salesPerYear * fee;
    var hours = leads * min / 60;

    $("r-year").textContent = eur.format(Math.round(yearly / 100) * 100);
    $("r-sub").textContent = "Soit environ " + num.format(Math.round(salesPerYear * 10) / 10) + " vente(s) ou mandat(s) en plus par an.";
    $("r-lost").textContent = num.format(Math.round(lostPerMonth * 10) / 10);
    $("r-hours").textContent = Math.round(hours) + " h";
  }
  inputs.forEach(function (id) { $("c-" + id).addEventListener("input", compute); });
  compute();

  /* Formulaire d'audit puis choix du créneau */
  var form = $("audit-form");
  var errBox = $("f-msg-err");
  var done = $("audit-done");

  function showDone() {
    form.hidden = true;
    done.hidden = false;
    var link = $("book-link");
    var note = $("preview-note");
    var notes = [];
    if (CONFIG.bookingUrl) {
      link.href = CONFIG.bookingUrl;
    } else {
      link.setAttribute("aria-disabled", "true");
      link.addEventListener("click", function (e) { e.preventDefault(); });
      notes.push("Aperçu : le lien de réservation Google Agenda n'est pas encore renseigné.");
    }
    if (!CONFIG.formEndpoint) {
      notes.push("Aperçu : le formulaire n'est pas encore relié à votre email, rien n'a été envoyé.");
    }
    if (notes.length) { note.hidden = false; note.textContent = notes.join(" "); }
    done.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    errBox.textContent = "";
    if (!form.checkValidity()) {
      var bad = form.querySelector(":invalid");
      errBox.textContent = "Complétez les champs obligatoires et cochez la case d'accord.";
      if (bad) bad.focus();
      return;
    }
    var btn = $("f-submit");
    if (!CONFIG.formEndpoint) { showDone(); return; }
    btn.disabled = true;
    var data = {};
    new FormData(form).forEach(function (v, k) { data[k] = v; });
    fetch(CONFIG.formEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(data)
    }).then(function (r) {
      if (!r.ok) throw new Error("http " + r.status);
      showDone();
    }).catch(function () {
      btn.disabled = false;
      errBox.textContent = "L'envoi a échoué. Réessayez dans un instant.";
    });
  });

  var y = $("year");
  if (y) y.textContent = new Date().getFullYear();
})();
