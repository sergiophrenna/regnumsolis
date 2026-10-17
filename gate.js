/* Blocca la pagina delle carte se l'utente non ha una sessione.
   Va caricato nel <head>, dopo config.js, prima di tutto il resto. */
(function () {
  "use strict";
  var KEY = "rs_sessione";
  function leggi() {
    try { return JSON.parse(localStorage.getItem(KEY) || sessionStorage.getItem(KEY) || "null"); }
    catch (e) { return null; }
  }
  function esci() {
    try { localStorage.removeItem(KEY); } catch (e) {}
    try { sessionStorage.removeItem(KEY); } catch (e) {}
    location.replace("./");
  }
  var s = leggi();
  var giorni = (window.RS_CONFIG && RS_CONFIG.SESSIONE_GIORNI) || 30;
  if (!s || !s.token || !s.email || (Date.now() - (s.at || 0)) > giorni * 864e5) { esci(); return; }
  window.RS_ESCI = esci;

  // Verifica il token sul foglio Google, senza bloccare la pagina se la rete non risponde
  var url = window.RS_CONFIG && RS_CONFIG.SHEETS_URL;
  if (url && window.fetch) {
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ action: "verify", email: s.email, token: s.token })
    }).then(function (r) { return r.json(); })
      .then(function (r) { if (r && r.ok === false && r.code === "SESSIONE_NON_VALIDA") esci(); })
      .catch(function () {});
  }
  document.addEventListener("DOMContentLoaded", function () {
    var b = document.getElementById("logoutBtn");
    if (b) b.addEventListener("click", esci);
  });
})();
