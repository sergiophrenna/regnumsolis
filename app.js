"use strict";

/* Regnum Solis · Il Mazzo Siciliano
   Pescata casuale con reinserimento: ogni estrazione è uniforme sulle 40 carte. */

const ASSETS = "./assets/cards/";
const RETRO = ASSETS + "retro.png";

const MAZZO = [
  { seme: "coppe",   numero: 1,  nome: "Asso di Coppe",       img: ASSETS + "coppe_1.png" },
  { seme: "coppe",   numero: 2,  nome: "Due di Coppe",        img: ASSETS + "coppe_2.png" },
  { seme: "coppe",   numero: 3,  nome: "Tre di Coppe",        img: ASSETS + "coppe_3.png" },
  { seme: "coppe",   numero: 4,  nome: "Quattro di Coppe",    img: ASSETS + "coppe_4.png" },
  { seme: "coppe",   numero: 5,  nome: "Cinque di Coppe",     img: ASSETS + "coppe_5.png" },
  { seme: "coppe",   numero: 6,  nome: "Sei di Coppe",        img: ASSETS + "coppe_6.png" },
  { seme: "coppe",   numero: 7,  nome: "Sette di Coppe",      img: ASSETS + "coppe_7.png" },
  { seme: "coppe",   numero: 8,  nome: "Donna di Coppe",      img: ASSETS + "coppe_8.png" },
  { seme: "coppe",   numero: 9,  nome: "Cavallo di Coppe",    img: ASSETS + "coppe_9.png" },
  { seme: "coppe",   numero: 10, nome: "Re di Coppe",         img: ASSETS + "coppe_10.png" },
  { seme: "bastoni", numero: 1,  nome: "Asso di Bastoni",     img: ASSETS + "bastoni_1.png" },
  { seme: "bastoni", numero: 2,  nome: "Due di Bastoni",      img: ASSETS + "bastoni_2.png" },
  { seme: "bastoni", numero: 3,  nome: "Tre di Bastoni",      img: ASSETS + "bastoni_3.png" },
  { seme: "bastoni", numero: 4,  nome: "Quattro di Bastoni",  img: ASSETS + "bastoni_4.png" },
  { seme: "bastoni", numero: 5,  nome: "Cinque di Bastoni",   img: ASSETS + "bastoni_5.png" },
  { seme: "bastoni", numero: 6,  nome: "Sei di Bastoni",      img: ASSETS + "bastoni_6.png" },
  { seme: "bastoni", numero: 7,  nome: "Sette di Bastoni",    img: ASSETS + "bastoni_7.png" },
  { seme: "bastoni", numero: 8,  nome: "Donna di Bastoni",    img: ASSETS + "bastoni_8.png" },
  { seme: "bastoni", numero: 9,  nome: "Cavallo di Bastoni",  img: ASSETS + "bastoni_9.png" },
  { seme: "bastoni", numero: 10, nome: "Re di Bastoni",       img: ASSETS + "bastoni_10.png" },
  { seme: "spade",   numero: 1,  nome: "Asso di Spade",       img: ASSETS + "spade_1.png" },
  { seme: "spade",   numero: 2,  nome: "Due di Spade",        img: ASSETS + "spade_2.png" },
  { seme: "spade",   numero: 3,  nome: "Tre di Spade",        img: ASSETS + "spade_3.png" },
  { seme: "spade",   numero: 4,  nome: "Quattro di Spade",    img: ASSETS + "spade_4.png" },
  { seme: "spade",   numero: 5,  nome: "Cinque di Spade",     img: ASSETS + "spade_5.png" },
  { seme: "spade",   numero: 6,  nome: "Sei di Spade",        img: ASSETS + "spade_6.png" },
  { seme: "spade",   numero: 7,  nome: "Sette di Spade",      img: ASSETS + "spade_7.png" },
  { seme: "spade",   numero: 8,  nome: "Donna di Spade",      img: ASSETS + "spade_8.png" },
  { seme: "spade",   numero: 9,  nome: "Cavallo di Spade",    img: ASSETS + "spade_9.png" },
  { seme: "spade",   numero: 10, nome: "Re di Spade",         img: ASSETS + "spade_10.png" },
  { seme: "denari",  numero: 1,  nome: "Asso di Denari",      img: ASSETS + "denari_1.png" },
  { seme: "denari",  numero: 2,  nome: "Due di Denari",       img: ASSETS + "denari_2.png" },
  { seme: "denari",  numero: 3,  nome: "Tre di Denari",       img: ASSETS + "denari_3.png" },
  { seme: "denari",  numero: 4,  nome: "Quattro di Denari",   img: ASSETS + "denari_4.png" },
  { seme: "denari",  numero: 5,  nome: "Cinque di Denari",    img: ASSETS + "denari_5.png" },
  { seme: "denari",  numero: 6,  nome: "Sei di Denari",       img: ASSETS + "denari_6.png" },
  { seme: "denari",  numero: 7,  nome: "Sette di Denari",     img: ASSETS + "denari_7.png" },
  { seme: "denari",  numero: 8,  nome: "Donna di Denari",     img: ASSETS + "denari_8.png" },
  { seme: "denari",  numero: 9,  nome: "Cavallo di Denari",   img: ASSETS + "denari_9.png" },
  { seme: "denari",  numero: 10, nome: "Re di Denari",        img: ASSETS + "denari_10.png" },
];

const VALORI = ["Asso", "2", "3", "4", "5", "6", "7", "Donna", "Cavallo", "Re"];
const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

const $ = (id) => document.getElementById(id);
const els = {
  flip: $("flip"),
  front: $("frontImg"),
  name: $("cardName"),
  history: $("history"),
  draw: $("drawBtn"),
  shuffle: $("shuffleBtn"),
  deck: $("deckBtn"),
};

const state = { count: 0, history: [], busy: false };

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const FLIP_MS = reduceMotion ? 1 : 700;
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/* Uniform random index in [0, n) without modulo bias. */
function randomIndex(n) {
  if (window.crypto && crypto.getRandomValues) {
    const buf = new Uint32Array(1);
    const limit = Math.floor(0x100000000 / n) * n;
    do { crypto.getRandomValues(buf); } while (buf[0] >= limit);
    return buf[0] % n;
  }
  return Math.floor(Math.random() * n);
}

function preload(src) {
  const img = new Image();
  img.src = src;
  return (img.decode ? img.decode() : Promise.resolve()).catch(() => {});
}

function retrigger(el, cls) {
  el.classList.remove(cls);
  void el.offsetWidth;
  el.classList.add(cls);
}

function renderHistory() {
  els.history.innerHTML = "";
  if (!state.history.length) {
    const li = document.createElement("li");
    li.className = "chips-empty";
    li.textContent = "Nessuna pescata, per ora";
    els.history.appendChild(li);
    return;
  }
  for (const c of state.history) {
    const li = document.createElement("li");
    li.className = "chip chip--" + c.seme;
    li.innerHTML = `<b>${VALORI[c.numero - 1]}</b><em>${capitalize(c.seme)}</em>`;
    els.history.appendChild(li);
  }
}

function setBusy(on) {
  state.busy = on;
  els.draw.disabled = on;
  els.shuffle.disabled = on;
}

async function draw() {
  if (state.busy) return;
  setBusy(true);

  const card = MAZZO[randomIndex(MAZZO.length)]; // con reinserimento
  const ready = preload(card.img);

  // Se una carta è già scoperta, la si rigira prima sul dorso
  if (els.flip.classList.contains("is-flipped")) {
    els.flip.classList.remove("is-flipped");
    await wait(FLIP_MS);
  }

  await ready;
  els.front.src = card.img;
  els.front.alt = card.nome;

  retrigger(els.flip, "is-lifting");
  els.flip.classList.add("is-flipped");
  if (navigator.vibrate) navigator.vibrate(12);

  state.count += 1;
  state.history.unshift(card);
  state.history = state.history.slice(0, 5);

  await wait(FLIP_MS * 0.45);
  els.name.textContent = card.nome;
  retrigger(els.name, "is-new");
  renderHistory();

  els.flip.setAttribute("aria-label", `Carta pescata: ${card.nome}. Tocca per pescarne un'altra`);
  await wait(FLIP_MS * 0.55);
  setBusy(false);
}

async function shuffle() {
  if (state.busy) return;
  setBusy(true);

  if (els.flip.classList.contains("is-flipped")) {
    els.flip.classList.remove("is-flipped");
    await wait(FLIP_MS);
  }
  retrigger(els.flip, "is-shuffling");
  retrigger(els.deck, "is-shuffling");
  if (navigator.vibrate) navigator.vibrate([10, 40, 10, 40, 10]);

  state.count = 0;
  state.history = [];
  els.front.src = RETRO;
  els.front.alt = "";
  els.name.textContent = "Mazzo rimescolato";
  retrigger(els.name, "is-new");
  renderHistory();
  els.flip.setAttribute("aria-label", "Pesca una carta");

  await wait(reduceMotion ? 1 : 640);
  setBusy(false);
}

els.draw.addEventListener("click", draw);
els.flip.addEventListener("click", draw);
els.deck.addEventListener("click", draw);
els.shuffle.addEventListener("click", shuffle);

document.addEventListener("keydown", (e) => {
  if (e.target.closest("button")) return; // i pulsanti gestiscono già Invio/Spazio
  if (e.key === " " || e.key === "Enter") { e.preventDefault(); draw(); }
  else if (e.key === "r" || e.key === "R") shuffle();
});

// Precarica le immagini delle carte quando il browser è inattivo
const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 1500));
idle(() => MAZZO.forEach((c) => { const i = new Image(); i.src = c.img; }));
