'use strict';
/* Utilidades, canvas principal y guardado */

const $ = id => document.getElementById(id);
const cv = $('c'); cv.width = W; cv.height = H;
const ctx = cv.getContext('2d');
const rand = (a, b) => a + Math.random() * (b - a);
const pick = a => a[Math.floor(Math.random() * a.length)];
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const fmt = t => t.toFixed(1) + 's';
const money = n => `L ${n}`;

function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  return e;
}
function rr(c, x, y, w, h, r) {
  c.beginPath();
  if (c.roundRect) c.roundRect(x, y, w, h, r); else c.rect(x, y, w, h);
  c.fill();
}
function easeOutBack(t) { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); }
function easeOutBounce(t) {
  const n = 7.5625, d = 2.75;
  if (t < 1 / d) return n * t * t;
  if (t < 2 / d) return n * (t -= 1.5 / d) * t + 0.75;
  if (t < 2.5 / d) return n * (t -= 2.25 / d) * t + 0.9375;
  return n * (t -= 2.625 / d) * t + 0.984375;
}
// Oscurece (<1) o aclara (>1) un color hex
function shade(hex, f) {
  const n = parseInt(hex.slice(1), 16);
  const ch = s => clamp(Math.round(((n >> s) & 255) * f + (f > 1 ? (f - 1) * 40 : 0)), 0, 255);
  return '#' + [16, 8, 0].map(s => ch(s).toString(16).padStart(2, '0')).join('');
}

// Pixel art a partir de un mapa de texto, con contorno automático
const PIX_CACHE = new Map();
function pixmap(key, rows, pal, outline = '#1b1626') {
  if (PIX_CACHE.has(key)) return PIX_CACHE.get(key);
  const h = rows.length + 2, w = rows[0].length + 2;
  const g = Array.from({ length: h }, () => new Array(w).fill(null));
  rows.forEach((r, y) => [...r].forEach((ch, x) => { if (pal[ch]) g[y + 1][x + 1] = pal[ch]; }));
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const x2 = c.getContext('2d');
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    let col = g[y][x];
    if (!col && outline && [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => g[y + dy] && g[y + dy][x + dx])) col = outline;
    if (col) { x2.fillStyle = col; x2.fillRect(x, y, 1, 1); }
  }
  PIX_CACHE.set(key, c);
  return c;
}

// ---------- Guardado ----------
function store(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* sin almacenamiento */ } }
function load(k, d) { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } }
