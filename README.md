# Regnum Solis · Il Mazzo Siciliano

Web app statica per pescare una carta dal mazzo siciliano di Regnum Solis (40 carte, con reinserimento).

- Gira con solo HTML, CSS e JavaScript: nessun backend, nessuna build.
- Pubblicabile così com'è su GitHub Pages.

## Struttura

```
index.html
style.css
app.js
assets/
  cards/   coppe_1.png … denari_10.png, retro.png   (57×89, rifilate al taglio)
  brand/   regnum-solis-bianco.png, mulciber-press.png, pattern.png, favicon.png
```

## Logica

- **Pesca**: ogni estrazione è casuale e uniforme sulle 40 carte. La carta torna sempre nel mazzo, quindi la stessa carta può uscire due volte di fila.
- **Rimescola**: gira la carta sul dorso, anima il mazzo e azzera contatore e storico.
- **Comandi**: Spazio o Invio pescano, R rimescola.
- **Storico**: mostra le ultime pescate (3 su mobile, 5 su desktop).

## Sostituire le immagini

Esporta da Figma con lo stesso nome file in `assets/cards/`. Il nome segue lo schema `[seme]_[numero].png`, con numero da 1 a 10 (8 = Donna, 9 = Cavallo, 10 = Re). Usa il formato 57:89.

## Pubblicazione su GitHub Pages

1. Crea un repository pubblico, ad esempio `mazzo-siciliano`.
2. Carica il contenuto di questa cartella nella radice del repository, cioè `index.html` al primo livello.
3. Vai in Settings → Pages → Build and deployment. Come source scegli "Deploy from a branch", branch `main`, cartella `/ (root)`, poi Save.
4. Dopo circa un minuto l'app è online su `https://<utente>.github.io/mazzo-siciliano/`.
