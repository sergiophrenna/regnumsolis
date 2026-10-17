# Regnum Solis · Il Mazzo Siciliano

Web app statica per pescare una carta dal mazzo siciliano di Regnum Solis (40 carte, senza reinserimento).

- Gira con solo HTML, CSS e JavaScript, senza build. Pubblicabile così com'è su GitHub Pages.
- L'accesso (registrazione, login, mailing list) usa un Google Foglio tramite Google Apps Script.

## Struttura

```
index.html        pagina di ingresso: registrazione / accesso (lead generation)
carte.html        il Creatore di Carte, visibile solo dopo l'accesso
style.css         stile comune (font, colori, bottoni, footer) + pagina carte
landing.css       stile della pagina di ingresso
auth.js           logica del form di accesso
gate.js           blocca carte.html senza sessione, gestisce "Esci"
config.js         URL della Web App di Google Apps Script
app.js            logica del mazzo
apps-script/Code.gs  codice da incollare in Google Apps Script
assets/
  cards/   coppe_1.png … denari_10.png, retro.png   (57×89, rifilate al taglio)
  brand/   regnum-solis-bianco.png, mulciber-press.png, pattern.png, favicon.png
```

## Logica

- **Pesca**: ogni estrazione è casuale e uniforme sulle carte rimaste. La carta pescata esce dal mazzo; dopo 40 pescate il mazzo è esaurito.
- **Rimescola**: rimette tutte le 40 carte nel mazzo, gira la carta sul dorso, anima il mazzo e azzera contatore e storico.
- **Comandi**: Spazio o Invio pescano, R rimescola.
- **Storico**: mostra le ultime pescate (3 su mobile, 5 su desktop).

## Accesso e mailing list (Google Fogli)

Il form di `index.html` invia email e password a una Web App di Google Apps Script, che le salva nel foglio **Utenti** di un Google Foglio. Le password non vengono mai salvate in chiaro (solo hash SHA-256 con sale). Chi spunta la casella finisce con `SI` nella colonna **Newsletter**, con la data del consenso.

Configurazione, una volta sola:

1. Crea un nuovo Google Foglio, ad esempio "Regnum Solis · Utenti".
2. Apri **Estensioni → Apps Script**, cancella il codice di esempio e incolla tutto `apps-script/Code.gs`. Salva.
3. Clicca **Esegui il deployment → Nuovo deployment**. Tipo: **App web**. Esegui come: **Me**. Chi ha accesso: **Chiunque**. Clicca **Esegui il deployment** e autorizza l'accesso al tuo account.
4. Copia l'**URL dell'app web** (finisce con `/exec`) e incollalo in `config.js`, nel campo `SHEETS_URL`.
5. Pubblica. Al primo utente registrato lo script crea da solo il foglio **Utenti** con le intestazioni.

Se modifichi `Code.gs`, fai **Gestisci deployment → Modifica → Nuova versione**, altrimenti resta attiva la versione precedente.

Per esportare la mailing list: filtra la colonna **Newsletter** su `SI` e copia le email.

Limiti da conoscere:

- Il blocco di `carte.html` avviene nel browser: tiene fuori i visitatori normali, ma chi conosce il codice può aggirarlo. Va bene per raccogliere iscritti, non per proteggere contenuti riservati.
- Non c'è il recupero password: un utente che la dimentica deve scrivervi.
- Prima di raccogliere email serve un'informativa privacy (GDPR) da collegare nella pagina di ingresso.

## Sostituire le immagini

Esporta da Figma con lo stesso nome file in `assets/cards/`. Il nome segue lo schema `[seme]_[numero].png`, con numero da 1 a 10 (8 = Donna, 9 = Cavallo, 10 = Re). Usa il formato 57:89.

## Pubblicazione su GitHub Pages

1. Crea un repository pubblico, ad esempio `mazzo-siciliano`.
2. Carica il contenuto di questa cartella nella radice del repository, cioè `index.html` al primo livello.
3. Vai in Settings → Pages → Build and deployment. Come source scegli "Deploy from a branch", branch `main`, cartella `/ (root)`, poi Save.
4. Dopo circa un minuto l'app è online su `https://<utente>.github.io/mazzo-siciliano/`.

## Crediti

- Icone Instagram e Discord: [Icons8](https://icons8.it)
- Logo Kickstarter: marchio di Kickstarter, PBC
- Illustrazione della pagina di ingresso, mappa e ornamenti: Mulciber Games
