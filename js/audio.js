'use strict';
/* Sonido: efectos, ambiente de ciudad (tráfico, pitos, gente caminando) y voces */

// Ajustes de sonido guardados: volumen de efectos, volumen de música y silencio general
const SETTINGS = Object.assign({ sfx: 0.8, music: 0.5, muted: false }, load('desp_settings', {}));
const saveSettings = () => store('desp_settings', SETTINGS);
let AC = null, muted = SETTINGS.muted;
let master = null, sfxBus = null, ambBus = null, musicBus = null, noiseBuf = null;
const AMB_VOL = 0.5;

function audioReady() { return AC && !muted; }

function initAudio() {
  try {
    AC = AC || new (window.AudioContext || window.webkitAudioContext)();
    if (AC.state === 'suspended') AC.resume();
    if (master) return;
    master = AC.createGain(); master.gain.value = muted ? 0 : 1; master.connect(AC.destination);
    sfxBus = AC.createGain(); sfxBus.gain.value = SETTINGS.sfx; sfxBus.connect(master);
    musicBus = AC.createGain(); musicBus.gain.value = SETTINGS.music * 0.6; musicBus.connect(master);
    ambBus = AC.createGain(); ambBus.gain.value = 0; ambBus.connect(sfxBus);
    // Ruido base reutilizable (2 s)
    const len = AC.sampleRate * 2;
    noiseBuf = AC.createBuffer(1, len, AC.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    startRumble(); startMurmur(); startMusic();
  } catch (e) { /* sin audio */ }
}

function noiseSrc(loop = false) { const s = AC.createBufferSource(); s.buffer = noiseBuf; s.loop = loop; return s; }

// Zumbido grave del tráfico lejano
function startRumble() {
  const s = noiseSrc(true), lp = AC.createBiquadFilter(), g = AC.createGain();
  lp.type = 'lowpass'; lp.frequency.value = 180; g.gain.value = 0.18;
  s.connect(lp); lp.connect(g); g.connect(ambBus); s.start();
}
// Murmullo de gente en la calle: ruido filtrado en la banda de la voz, con vaivén
function startMurmur() {
  const s = noiseSrc(true), bp = AC.createBiquadFilter(), g = AC.createGain();
  bp.type = 'bandpass'; bp.frequency.value = 700; bp.Q.value = 1.4; g.gain.value = 0.035;
  const lfo = AC.createOscillator(), lg = AC.createGain();
  lfo.frequency.value = 0.35; lg.gain.value = 0.02; lfo.connect(lg); lg.connect(g.gain); lfo.start();
  const lfo2 = AC.createOscillator(), lg2 = AC.createGain();
  lfo2.frequency.value = 2.3; lg2.gain.value = 260; lfo2.connect(lg2); lg2.connect(bp.frequency); lfo2.start();
  s.connect(bp); bp.connect(g); g.connect(ambBus); s.start();
}
function setAmbience(on) {
  if (!ambBus) return;
  ambBus.gain.cancelScheduledValues(AC.currentTime);
  ambBus.gain.linearRampToValueAtTime(on ? AMB_VOL : 0, AC.currentTime + 0.8);
}

function snd(f, d = 0.1, type = 'square', v = 0.04, slide = 0, delay = 0) {
  if (!audioReady()) return;
  try {
    const t0 = AC.currentTime + delay / 1000;
    const o = AC.createOscillator(), g = AC.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t0);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(40, f + slide), t0 + d);
    g.gain.setValueAtTime(0.0001, t0); g.gain.linearRampToValueAtTime(v, t0 + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t0 + d);
    o.connect(g); g.connect(sfxBus); o.start(t0); o.stop(t0 + d + 0.02);
  } catch (e) { /* sin audio */ }
}

// Auto o moto que pasa de un lado al otro (paneo estéreo)
function carPass(kind = 'car') {
  if (!audioReady()) return;
  const t0 = AC.currentTime, dur = kind === 'bus' ? 2.2 : kind === 'moto' ? 1.1 : 1.5;
  const dir = Math.random() < 0.5 ? -1 : 1;
  const g = AC.createGain(), pan = AC.createStereoPanner ? AC.createStereoPanner() : null;
  g.gain.setValueAtTime(0.0001, t0); g.gain.linearRampToValueAtTime(kind === 'bus' ? 0.16 : 0.11, t0 + dur * 0.5); g.gain.linearRampToValueAtTime(0.0001, t0 + dur);
  if (pan) { pan.pan.setValueAtTime(-dir, t0); pan.pan.linearRampToValueAtTime(dir, t0 + dur); g.connect(pan); pan.connect(ambBus); } else g.connect(ambBus);
  const s = noiseSrc(), bp = AC.createBiquadFilter();
  bp.type = 'bandpass'; bp.Q.value = 0.8;
  bp.frequency.setValueAtTime(kind === 'bus' ? 260 : 420, t0); bp.frequency.linearRampToValueAtTime(kind === 'bus' ? 380 : 900, t0 + dur * 0.5); bp.frequency.linearRampToValueAtTime(kind === 'bus' ? 220 : 380, t0 + dur);
  s.connect(bp); bp.connect(g); s.start(t0); s.stop(t0 + dur);
  // motor
  const o = AC.createOscillator(), og = AC.createGain();
  o.type = 'sawtooth'; const f0 = kind === 'moto' ? 130 : kind === 'bus' ? 48 : 72;
  o.frequency.setValueAtTime(f0, t0); o.frequency.linearRampToValueAtTime(f0 * 1.25, t0 + dur * 0.5); o.frequency.linearRampToValueAtTime(f0 * 0.85, t0 + dur);
  og.gain.value = kind === 'moto' ? 0.05 : 0.035;
  const lp = AC.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = kind === 'moto' ? 900 : 500;
  o.connect(lp); lp.connect(og); og.connect(g); o.start(t0); o.stop(t0 + dur);
}
// Pasos de gente caminando por la acera
function footsteps() {
  if (!audioReady()) return;
  const n = 5 + Math.floor(Math.random() * 6), gap = rand(0.38, 0.52), pan = rand(-0.8, 0.8);
  for (let i = 0; i < n; i++) {
    const t0 = AC.currentTime + i * gap + rand(-0.02, 0.02);
    const s = noiseSrc(), bp = AC.createBiquadFilter(), g = AC.createGain();
    bp.type = 'bandpass'; bp.frequency.value = i % 2 ? 1500 : 1200; bp.Q.value = 2;
    g.gain.setValueAtTime(0.0001, t0); g.gain.linearRampToValueAtTime(0.09, t0 + 0.005); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.07);
    s.connect(bp); bp.connect(g);
    if (AC.createStereoPanner) { const p = AC.createStereoPanner(); p.pan.value = pan; g.connect(p); p.connect(ambBus); } else g.connect(ambBus);
    s.start(t0, rand(0, 1.5)); s.stop(t0 + 0.08);
  }
}
function honk(kind) {
  if (kind === 'moto') { snd(900, 0.1, 'square', 0.02); snd(900, 0.1, 'square', 0.02, 0, 170); }
  else if (kind === 'bus') { snd(190, 0.7, 'sawtooth', 0.035); snd(238, 0.7, 'sawtooth', 0.03); }
  else { snd(470, 0.16, 'square', 0.022); snd(470, 0.16, 'square', 0.022, 0, 230); }
}

// Programador del ambiente de ciudad (se llama desde el bucle del juego)
const city = { pass: 1.5, step: 3, honk: 4 };
function cityTick(dt) {
  if (!audioReady()) return;
  city.pass -= dt; city.step -= dt; city.honk -= dt;
  if (city.pass <= 0) { city.pass = rand(1.2, 3.2); carPass(pick(['car', 'car', 'moto', 'bus'])); }
  if (city.step <= 0) { city.step = rand(4, 9); footsteps(); }
  if (city.honk <= 0) { city.honk = rand(3, 8); honk(pick(['taxi', 'taxi', 'moto', 'bus'])); }
}

// Efectos
const sHop = () => snd(420, 0.07, 'square', 0.03, 260);
const sPick = () => { snd(660, 0.1, 'triangle', 0.06); snd(990, 0.14, 'triangle', 0.06, 0, 90); };
const sCoin = () => { snd(988, 0.06, 'square', 0.03); snd(1319, 0.12, 'square', 0.03, 0, 60); };
const sHit = () => { snd(180, 0.4, 'sawtooth', 0.08, -120); snd(90, 0.3, 'square', 0.06, 0, 60); };
const sWin = () => [523, 659, 784, 1047].forEach((f, i) => snd(f, 0.2, 'triangle', 0.07, 0, i * 130));
const sChampion = () => [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) => snd(f, 0.25, 'triangle', 0.07, 0, i * 140));
const sLose = () => [392, 330, 262, 196].forEach((f, i) => snd(f, 0.3, 'sawtooth', 0.05, 0, i * 220));
const sSiren = () => [0, 1, 2, 3].forEach(i => snd(i % 2 ? 700 : 950, 0.22, 'sawtooth', 0.04, 0, i * 230));
const sGurgle = () => [0, 1, 2, 3, 4].forEach(i => snd(rand(70, 120), 0.12, 'square', 0.05, rand(-30, 30), i * 90));
const sHic = () => { snd(500, 0.08, 'triangle', 0.07, 400); snd(300, 0.25, 'sine', 0.04, -100, 300); };
const sSteal = () => { snd(1200, 0.08, 'square', 0.04, -600); snd(800, 0.08, 'square', 0.04, -400, 100); snd(500, 0.2, 'square', 0.04, -300, 200); };
const sWhistle = () => { snd(1800, 0.12, 'sine', 0.05, 600); snd(1500, 0.2, 'sine', 0.05, -700, 160); };

function applyMute() {
  SETTINGS.muted = muted; saveSettings();
  if (master) master.gain.value = muted ? 0 : 1;
  if (muted && typeof speechSynthesis !== 'undefined') speechSynthesis.cancel();
  const sw = document.getElementById('muteSwitch'); if (sw) sw.setAttribute('aria-checked', String(!muted));
  document.querySelectorAll('[data-mute]').forEach(b => { b.textContent = muted ? '🔇' : '🔊'; b.setAttribute('aria-label', muted ? 'Activar sonido' : 'Silenciar'); b.setAttribute('aria-pressed', muted); });
}
function setVolume(kind, v) {
  SETTINGS[kind] = v; saveSettings();
  if (kind === 'sfx' && sfxBus) sfxBus.gain.value = v;
  if (kind === 'music' && musicBus) musicBus.gain.value = v * 0.6;
}

// ---------- Música de fondo tipo arcade (chiptune generado en el momento) ----------
const EIGHTH = 60 / 150 / 2;
const MELODY = ('E5 - G5 E5 D5 C5 D5 E5 | G5 - A5 G5 E5 - D5 - | C5 - E5 C5 A4 C5 D5 E5 | D5 - - B4 C5 - - - | ' +
  'A5 - A5 G5 E5 - G5 A5 | C6 - B5 A5 G5 - E5 - | F5 - A5 F5 E5 - G5 E5 | D5 E5 D5 B4 C5 - - -').replace(/\|/g, '').trim().split(/\s+/);
const BASS = ['C3', 'A2', 'F2', 'G2', 'A2', 'F2', 'D3', 'G2'];
function noteFreq(n) {
  const m = /^([A-G])(#?)(\d)$/.exec(n); if (!m) return 0;
  const idx = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }[m[1]] + (m[2] ? 1 : 0);
  return 440 * Math.pow(2, (12 * (+m[3] + 1) + idx - 69) / 12);
}
let musicTimer = null, musicStep = 0, musicNext = 0;
function tone(f, t, d, type, v) {
  const o = AC.createOscillator(), g = AC.createGain();
  o.type = type; o.frequency.setValueAtTime(f, t);
  g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v, t + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
  o.connect(g); g.connect(musicBus); o.start(t); o.stop(t + d + 0.02);
}
function drum(t, kind) {
  const s = noiseSrc(), f = AC.createBiquadFilter(), g = AC.createGain();
  f.type = kind === 'hat' ? 'highpass' : 'bandpass'; f.frequency.value = kind === 'hat' ? 7000 : 1800;
  const d = kind === 'hat' ? 0.04 : 0.12, v = kind === 'hat' ? 0.05 : 0.12;
  g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
  s.connect(f); f.connect(g); g.connect(musicBus); s.start(t, Math.random()); s.stop(t + d);
}
function playStep(i, t) {
  const bar = Math.floor(i / 8), k = i % 8, n = MELODY[i];
  if (n !== '-') tone(noteFreq(n), t, EIGHTH * 0.9, 'square', 0.045);
  tone(noteFreq(BASS[bar]) * (k % 2 ? 2 : 1), t, EIGHTH * 0.85, 'triangle', 0.11);
  if (k === 0 || k === 4) { const o = AC.createOscillator(), g = AC.createGain(); o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(45, t + 0.12); g.gain.setValueAtTime(0.18, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.14); o.connect(g); g.connect(musicBus); o.start(t); o.stop(t + 0.15); }
  if (k === 2 || k === 6) drum(t, 'snare');
  if (k % 2) drum(t, 'hat');
}
function startMusic() {
  if (!AC || musicTimer) return;
  musicStep = 0; musicNext = AC.currentTime + 0.1;
  musicTimer = setInterval(() => {
    while (musicNext < AC.currentTime + 0.15) { playStep(musicStep, musicNext); musicNext += EIGHTH; musicStep = (musicStep + 1) % MELODY.length; }
  }, 30);
}

// ---------- Voz ----------
// Voz "de barrio": grave y rápida, con acento latino si el navegador lo tiene
let esVoice = null;
function pickVoice() {
  if (typeof speechSynthesis === 'undefined') return;
  const vs = speechSynthesis.getVoices().filter(v => /^es/i.test(v.lang));
  esVoice = vs.find(v => /es[-_]HN/i.test(v.lang)) || vs.find(v => /es[-_](MX|US|419|CO|GT|SV|NI|CR|PA)/i.test(v.lang)) || vs[0] || null;
}
if (typeof speechSynthesis !== 'undefined') { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; }

function speak(text, { rate = 1.25, pitch = 0.6, repeat = 1 } = {}) {
  if (muted || typeof speechSynthesis === 'undefined' || typeof SpeechSynthesisUtterance === 'undefined') return;
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(Array(repeat).fill(text).join(' '));
    if (esVoice) { u.voice = esVoice; u.lang = esVoice.lang; } else u.lang = 'es-MX';
    u.rate = rate; u.pitch = pitch; u.volume = clamp(SETTINGS.sfx, 0, 1);
    speechSynthesis.speak(u);
  } catch (e) { /* sin voz */ }
}

window.addEventListener('pointerdown', initAudio);
window.addEventListener('keydown', initAudio);
