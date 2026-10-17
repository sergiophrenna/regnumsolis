"use strict";

/* Regnum Solis · registrazione e accesso
   Il form parla con una Web App di Google Apps Script collegata a un Google Foglio
   (vedi apps-script/Code.gs). Ad accesso riuscito salva la sessione e apre le carte. */

const CFG = window.RS_CONFIG || {};
const KEY = "rs_sessione";
const DESTINAZIONE = "./carte.html";
const PASSWORD_MIN = 8;
const EMAIL_RE = /^[a-z0-9_][a-z0-9._%+'-]*@[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}$/i;

const $ = (id) => document.getElementById(id);
const el = {
  form: $("authForm"), email: $("email"), password: $("password"),
  emailErr: $("emailErr"), pwErr: $("pwErr"), pwHint: $("pwHint"), pwToggle: $("pwToggle"),
  newsletter: $("newsletter"), newsletterRow: $("newsletterRow"),
  msg: $("formMsg"), submit: $("submitBtn"), submitLabel: $("submitLabel"),
  tabReg: $("tabReg"), tabLog: $("tabLog"), sub: $("lpSub"),
  switchText: $("switchText"), switchBtn: $("switchBtn"),
};

const TESTI = {
  register: {
    sub: "Crea il tuo account per pescare dal mazzo.",
    switchText: "Hai già un account?", switchBtn: "Accedi", autocomplete: "new-password", submit: "Registrati",
  },
  login: {
    sub: "Bentornato nel Regno.",
    switchText: "Non hai ancora un account?", switchBtn: "Registrati", autocomplete: "current-password", submit: "Accedi",
  },
};

const ERRORI = {
  EMAIL_ESISTENTE: "Questa email è già registrata: accedi con la tua password.",
  CREDENZIALI_ERRATE: "Email o password non corretti.",
  EMAIL_NON_VALIDA: "Controlla l'indirizzo email.",
  PASSWORD_CORTA: `La password deve avere almeno ${PASSWORD_MIN} caratteri.`,
  RETE: "Connessione non riuscita. Controlla la rete e riprova.",
  CONFIG: "L'accesso non è ancora attivo: manca il collegamento al foglio Google.",
  GENERICO: "Qualcosa è andato storto. Riprova tra poco.",
};

const subito = new URLSearchParams(location.search).has("accedi");
let mode = subito ? "login" : "register";
let tentato = false;

function setMode(m) {
  mode = m;
  const t = TESTI[m];
  const reg = m === "register";
  el.tabReg.setAttribute("aria-selected", String(reg));
  el.tabLog.setAttribute("aria-selected", String(!reg));
  el.form.setAttribute("aria-labelledby", reg ? "tabReg" : "tabLog");
  el.newsletterRow.hidden = !reg;
  el.pwHint.hidden = !reg;
  el.password.setAttribute("autocomplete", t.autocomplete);
  el.sub.textContent = t.sub;
  el.switchText.textContent = t.switchText;
  el.switchBtn.textContent = t.switchBtn;
  if (!el.submit.disabled) el.submitLabel.textContent = t.submit;
  tentato = false;
  mostraErrore(el.email, el.emailErr, "");
  mostraErrore(el.password, el.pwErr, "");
  messaggio("");
}

function mostraErrore(input, out, testo) {
  out.textContent = testo;
  input.setAttribute("aria-invalid", testo ? "true" : "false");
  input.closest(".field").classList.toggle("has-error", Boolean(testo));
}

function messaggio(testo, tipo = "errore") {
  el.msg.textContent = testo;
  el.msg.dataset.tipo = testo ? tipo : "";
}

function valida() {
  const email = el.email.value.trim();
  const pw = el.password.value;
  let ok = true;
  if (!email) { mostraErrore(el.email, el.emailErr, "Inserisci la tua email."); ok = false; }
  else if (!EMAIL_RE.test(email) || email.length > 254) { mostraErrore(el.email, el.emailErr, "Questa email non sembra valida."); ok = false; }
  else mostraErrore(el.email, el.emailErr, "");

  if (!pw) { mostraErrore(el.password, el.pwErr, "Inserisci la password."); ok = false; }
  else if (pw.length < PASSWORD_MIN) { mostraErrore(el.password, el.pwErr, `Servono almeno ${PASSWORD_MIN} caratteri.`); ok = false; }
  else mostraErrore(el.password, el.pwErr, "");
  return ok;
}

function salvaSessione(s) {
  const v = JSON.stringify({ email: s.email, token: s.token, at: Date.now() });
  try { localStorage.setItem(KEY, v); return; } catch (e) { /* navigazione privata */ }
  try { sessionStorage.setItem(KEY, v); } catch (e) { /* nessuna memoria: la sessione dura la pagina */ }
}

function occupato(on) {
  el.submit.disabled = on;
  el.submitLabel.textContent = on ? "Un momento…" : TESTI[mode].submit;
}

async function invia(e) {
  e.preventDefault();
  tentato = true;
  messaggio("");
  if (!valida()) {
    (el.form.querySelector("[aria-invalid='true']") || el.email).focus();
    return;
  }
  if (!CFG.SHEETS_URL) { messaggio(ERRORI.CONFIG); return; }

  occupato(true);
  const body = {
    action: mode === "register" ? "register" : "login",
    email: el.email.value.trim().toLowerCase(),
    password: el.password.value,
  };
  if (mode === "register") body.newsletter = el.newsletter.checked;

  let res;
  try {
    const r = await fetch(CFG.SHEETS_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" }, // evita il preflight CORS di Apps Script
      body: JSON.stringify(body),
    });
    res = await r.json();
  } catch (err) {
    occupato(false);
    messaggio(ERRORI.RETE);
    return;
  }

  if (res && res.ok && res.token) {
    salvaSessione(res);
    el.submitLabel.textContent = "Benvenuto nel Regno";
    messaggio(mode === "register" ? "Account creato. Apriamo il mazzo…" : "Accesso riuscito. Apriamo il mazzo…", "ok");
    setTimeout(() => location.assign(DESTINAZIONE), 450);
    return;
  }

  occupato(false);
  const code = res && res.code;
  if (code === "EMAIL_ESISTENTE") {
    setMode("login");
    messaggio(ERRORI.EMAIL_ESISTENTE);
    el.password.focus();
    return;
  }
  messaggio(ERRORI[code] || ERRORI.GENERICO);
}

el.tabReg.addEventListener("click", () => setMode("register"));
el.tabLog.addEventListener("click", () => setMode("login"));
el.switchBtn.addEventListener("click", () => setMode(mode === "register" ? "login" : "register"));
el.form.addEventListener("submit", invia);
for (const input of [el.email, el.password]) {
  input.addEventListener("input", () => { if (tentato) valida(); });
}
el.email.addEventListener("blur", () => {
  const v = el.email.value.trim();
  if (v && !EMAIL_RE.test(v)) mostraErrore(el.email, el.emailErr, "Questa email non sembra valida.");
});
el.pwToggle.addEventListener("click", () => {
  const show = el.password.type === "password";
  el.password.type = show ? "text" : "password";
  el.pwToggle.textContent = show ? "Nascondi" : "Mostra";
  el.pwToggle.setAttribute("aria-pressed", String(show));
});

// Frecce sinistra/destra tra le due schede
document.querySelector(".tabs").addEventListener("keydown", (e) => {
  if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
  const next = mode === "register" ? el.tabLog : el.tabReg;
  next.click();
  next.focus();
});

// La scheda compare solo dopo "Entra e gioca"
const intro = $("intro"), sheet = $("sheet"), playBtn = $("playBtn");
function apriScheda(m) {
  setMode(m);
  intro.hidden = true;
  sheet.hidden = false;
  playBtn.setAttribute("aria-expanded", "true");
  sheet.classList.remove("is-in"); void sheet.offsetWidth; sheet.classList.add("is-in");
  el.email.focus({ preventScroll: true });
  window.scrollTo({ top: 0 });
}
function chiudiScheda() {
  sheet.hidden = true;
  intro.hidden = false;
  playBtn.setAttribute("aria-expanded", "false");
  playBtn.focus();
}
playBtn.addEventListener("click", () => apriScheda("register"));
$("introLogin").addEventListener("click", () => apriScheda("login"));
$("backBtn").addEventListener("click", chiudiScheda);
document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !sheet.hidden && !el.submit.disabled) chiudiScheda(); });

setMode(mode);
if (subito) apriScheda("login");
