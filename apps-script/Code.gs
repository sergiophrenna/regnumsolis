/**
 * Regnum Solis · backend di accesso su Google Fogli
 *
 * Registra gli utenti, gestisce il login e salva il consenso alla mailing list
 * nel foglio "Utenti" del Google Foglio a cui è collegato questo script.
 * Le password non vengono mai salvate in chiaro: solo hash SHA-256 con sale.
 *
 * Installazione: vedi README.md, sezione "Accesso e mailing list".
 */

var FOGLIO = "Utenti";
var INTESTAZIONI = [
  "Data registrazione", "Email", "Newsletter", "Data consenso newsletter",
  "Hash password", "Sale", "Token", "Token creato", "Ultimo accesso"
];
var COL = { data: 1, email: 2, newsletter: 3, consenso: 4, hash: 5, sale: 6, token: 7, tokenCreato: 8, ultimo: 9 };
var SESSIONE_GIORNI = 30;
var PASSWORD_MIN = 8;
var ITERAZIONI = 1000;

function doPost(e) {
  var req;
  try {
    req = JSON.parse(e.postData.contents);
  } catch (err) {
    return risposta_({ ok: false, code: "RICHIESTA_NON_VALIDA" });
  }
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    switch (req.action) {
      case "register": return risposta_(registra_(req));
      case "login":    return risposta_(accedi_(req));
      case "verify":   return risposta_(verifica_(req));
      default:         return risposta_({ ok: false, code: "AZIONE_SCONOSCIUTA" });
    }
  } catch (err) {
    return risposta_({ ok: false, code: "ERRORE_SERVER" });
  } finally {
    try { lock.releaseLock(); } catch (e2) {}
  }
}

/** Controllo rapido dal browser: apri l'URL /exec e devi leggere {"ok":true}. */
function doGet() {
  return risposta_({ ok: true, servizio: "Regnum Solis accesso" });
}

function registra_(req) {
  var email = normalizzaEmail_(req.email);
  if (!emailValida_(email)) return { ok: false, code: "EMAIL_NON_VALIDA" };
  if (!req.password || String(req.password).length < PASSWORD_MIN) return { ok: false, code: "PASSWORD_CORTA" };

  var sh = foglio_();
  if (trovaRiga_(sh, email)) return { ok: false, code: "EMAIL_ESISTENTE" };

  var ora = new Date();
  var sale = Utilities.getUuid();
  var token = nuovoToken_();
  var newsletter = req.newsletter === true;
  sh.appendRow([
    ora, email, newsletter ? "SI" : "NO", newsletter ? ora : "",
    hash_(String(req.password), sale), sale, token, ora, ora
  ]);
  return { ok: true, email: email, token: token };
}

function accedi_(req) {
  var email = normalizzaEmail_(req.email);
  var sh = foglio_();
  var riga = trovaRiga_(sh, email);
  if (!riga) return { ok: false, code: "CREDENZIALI_ERRATE" };
  var valori = sh.getRange(riga, 1, 1, INTESTAZIONI.length).getValues()[0];
  if (hash_(String(req.password || ""), valori[COL.sale - 1]) !== valori[COL.hash - 1]) {
    return { ok: false, code: "CREDENZIALI_ERRATE" };
  }
  var ora = new Date();
  var token = nuovoToken_();
  sh.getRange(riga, COL.token, 1, 3).setValues([[token, ora, ora]]);
  return { ok: true, email: email, token: token };
}

function verifica_(req) {
  var email = normalizzaEmail_(req.email);
  var sh = foglio_();
  var riga = trovaRiga_(sh, email);
  if (!riga || !req.token) return { ok: false, code: "SESSIONE_NON_VALIDA" };
  var valori = sh.getRange(riga, 1, 1, INTESTAZIONI.length).getValues()[0];
  var creato = valori[COL.tokenCreato - 1];
  var scaduto = !(creato instanceof Date) || (Date.now() - creato.getTime()) > SESSIONE_GIORNI * 864e5;
  if (valori[COL.token - 1] !== req.token || scaduto) return { ok: false, code: "SESSIONE_NON_VALIDA" };
  sh.getRange(riga, COL.ultimo).setValue(new Date());
  return { ok: true };
}

/* ---------- utilità ---------- */

function foglio_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(FOGLIO);
  if (!sh) {
    sh = ss.insertSheet(FOGLIO);
    sh.appendRow(INTESTAZIONI);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, INTESTAZIONI.length).setFontWeight("bold");
    sh.hideColumns(COL.hash, 4); // hash, sale, token, token creato
  }
  return sh;
}

function trovaRiga_(sh, email) {
  var ultima = sh.getLastRow();
  if (ultima < 2) return 0;
  var emails = sh.getRange(2, COL.email, ultima - 1, 1).getValues();
  for (var i = 0; i < emails.length; i++) {
    if (String(emails[i][0]).toLowerCase() === email) return i + 2;
  }
  return 0;
}

function hash_(password, sale) {
  var h = sale + ":" + password;
  for (var i = 0; i < ITERAZIONI; i++) {
    h = Utilities.base64Encode(
      Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, h, Utilities.Charset.UTF_8)
    );
  }
  return h;
}

function nuovoToken_() {
  return Utilities.getUuid() + Utilities.getUuid().replace(/-/g, "");
}

function normalizzaEmail_(email) {
  return String(email || "").trim().toLowerCase();
}

function emailValida_(email) {
  // Il primo carattere non può essere = + - @ (evita formule nel foglio)
  return email.length <= 254 && /^[a-z0-9_][a-z0-9._%+'-]*@[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}$/i.test(email);
}

function risposta_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
