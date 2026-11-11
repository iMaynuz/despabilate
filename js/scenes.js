'use strict';
/* Escenarios: fachadas de cada nivel y fondo prerenderizado */

// ---------- Obstáculos de la mediana ----------
function macuelizo(b, cx, baseY) {   // árbol en flor, rosado o amarillo
  const fl = Math.random() < 0.5 ? ['#f48fb1', '#ffc2d6', '#e0679a'] : ['#ffd43b', '#ffe680', '#f2b705'];
  b.fillStyle = 'rgba(0,0,0,.2)'; b.beginPath(); b.ellipse(cx, baseY, 15, 5, 0, 0, 7); b.fill();
  b.fillStyle = fl[0]; b.globalAlpha = 0.7;
  [[-14, 1], [10, 2], [-6, 3], [16, 0]].forEach(([dx, dy]) => { b.beginPath(); b.ellipse(cx + dx, baseY + dy, 3, 1.5, 0, 0, 7); b.fill(); });
  b.globalAlpha = 1;
  b.strokeStyle = '#6b4a2b'; b.lineWidth = 6; b.beginPath(); b.moveTo(cx, baseY); b.quadraticCurveTo(cx + 2, baseY - 10, cx, baseY - 20); b.stroke();
  b.lineWidth = 3; b.beginPath(); b.moveTo(cx, baseY - 16); b.lineTo(cx - 9, baseY - 26); b.moveTo(cx, baseY - 17); b.lineTo(cx + 9, baseY - 26); b.stroke();
  b.fillStyle = fl[0];
  [[0, -34, 14], [-12, -27, 10], [12, -27, 10], [-6, -41, 9], [7, -40, 9]].forEach(([dx, dy, r]) => { b.beginPath(); b.arc(cx + dx, baseY + dy, r, 0, 7); b.fill(); });
  for (let i = 0; i < 22; i++) {
    const a = rand(0, 7), d = rand(0, 18);
    b.fillStyle = fl[1 + (i % 2)]; b.beginPath(); b.arc(cx + Math.cos(a) * d, baseY - 33 + Math.sin(a) * d * 0.7, rand(1.2, 2.4), 0, 7); b.fill();
  }
}
function greenTree(b, cx, baseY, r = 1) {   // árbol verde frondoso
  b.fillStyle = 'rgba(0,0,0,.2)'; b.beginPath(); b.ellipse(cx, baseY, 15 * r, 5 * r, 0, 0, 7); b.fill();
  b.fillStyle = '#6b4a2b'; b.fillRect(cx - 3 * r, baseY - 20 * r, 6 * r, 20 * r);
  [['#2b7a34', 0, -32, 15], ['#2b7a34', -11, -25, 11], ['#2b7a34', 11, -25, 11], ['#3a9a45', -5, -37, 10], ['#3a9a45', 6, -34, 9], ['#57b860', -6, -40, 4]]
    .forEach(([col, dx, dy, rad]) => { b.fillStyle = col; b.beginPath(); b.arc(cx + dx * r, baseY + dy * r, rad * r, 0, 7); b.fill(); });
}
function stall(b, x, y, awn) {   // puesto de mercado
  b.fillStyle = 'rgba(0,0,0,.2)'; b.fillRect(x + 3, y + T - 8, T - 6, 5);
  b.strokeStyle = '#6b4a2b'; b.lineWidth = 2; b.beginPath(); b.moveTo(x + 5, y + 8); b.lineTo(x + 5, y + 40); b.moveTo(x + T - 5, y + 8); b.lineTo(x + T - 5, y + 40); b.stroke();
  b.fillStyle = '#8b5a2b'; b.fillRect(x + 4, y + 28, T - 8, 12);
  ['#d93a3a', '#f08c00', '#2f9e44', '#ffd43b', '#d93a3a', '#2f9e44'].forEach((col, i) => { b.fillStyle = col; b.beginPath(); b.arc(x + 9 + i * 6, y + 26, 3.2, 0, 7); b.fill(); });
  for (let i = 0; i < 6; i++) { b.fillStyle = i % 2 ? '#fff' : awn; b.beginPath(); b.moveTo(x + 2 + i * 7.3, y + 6); b.lineTo(x + 9.3 + i * 7.3, y + 6); b.lineTo(x + 9.3 + i * 7.3 + (i < 3 ? -1 : 1), y + 17); b.lineTo(x + 2 + i * 7.3 + (i < 3 ? -1 : 1), y + 17); b.fill(); }
}
function railBlock(b, x, y) {   // barandal de cemento
  b.fillStyle = 'rgba(0,0,0,.25)'; b.fillRect(x, y + T - 8, T, 5);
  b.fillStyle = '#b9b5ac'; b.fillRect(x, y + 30, T, 12);
  b.fillStyle = '#d6d2c8'; b.fillRect(x, y + 14, T, 6);
  b.fillStyle = '#a8a49b'; [4, 20, 36].forEach(dx => b.fillRect(x + dx, y + 18, 8, 14));
  b.fillStyle = '#8f8b83'; b.fillRect(x, y + 40, T, 2); b.fillRect(x, y + 19, T, 1);
}
function canalTile(b, x, y) {   // agua del canal
  b.fillStyle = '#3d7fb0'; b.fillRect(x, y + 4, T, T - 8);
  b.fillStyle = '#5b9bd0'; for (let i = 0; i < 3; i++) b.fillRect(x + 6 + i * 14, y + 14 + (i % 2) * 12, 9, 2);
  b.fillStyle = '#8f8b83'; b.fillRect(x, y, T, 4); b.fillRect(x, y + T - 4, T, 4);
}
function smallBridge(b, x, y) {   // puente pequeño sobre el canal
  canalTile(b, x, y);
  b.fillStyle = '#a0784a'; b.fillRect(x + 2, y + 2, T - 4, T - 4);
  b.fillStyle = '#7f5a33'; for (let yy = y + 6; yy < y + T - 4; yy += 7) b.fillRect(x + 2, yy, T - 4, 1);
  b.fillStyle = '#5c4126'; b.fillRect(x + 2, y + 2, 4, T - 4); b.fillRect(x + T - 6, y + 2, 4, T - 4);
}

// ---------- Utilidades de fachada ----------
function sign(b, txt, cx, cy, maxW, bg, fg, size = 9, font = '"Trebuchet MS", sans-serif') {
  b.font = `bold ${size}px ${font}`;
  let w = b.measureText(txt).width;
  if (w > maxW - 6) { size = Math.max(5, Math.floor(size * (maxW - 6) / w)); b.font = `bold ${size}px ${font}`; w = b.measureText(txt).width; }
  if (bg) { b.fillStyle = bg; rr(b, cx - w / 2 - 3, cy - size / 2 - 2, w + 6, size + 4, 3); }
  b.fillStyle = fg; b.textAlign = 'center'; b.textBaseline = 'middle'; b.fillText(txt, cx, cy + 0.5);
}
function bld(b, x, w, h, col) {
  b.fillStyle = col; b.fillRect(x, FB - h, w, h);
  b.fillStyle = 'rgba(0,0,0,.14)'; b.fillRect(x + w - 3, FB - h, 3, h); b.fillStyle = 'rgba(255,255,255,.18)'; b.fillRect(x, FB - h, 2, h);
}
function wins(b, x, y, w, h, nc, nr, col, ww = 5, wh = 6) {
  b.fillStyle = col;
  for (let i = 0; i < nc; i++) for (let j = 0; j < nr; j++) b.fillRect(x + (i + .5) * w / nc - ww / 2, y + (j + .5) * h / nr - wh / 2, ww, wh);
}
function stalls(b, labels) {
  const awn = ['#d93a3a', '#2f9e44', '#f08c00', '#1c5fd1', '#e0407a', '#f2c200'];
  for (let i = 0, x = 0; x < W; i++, x += 40) {
    const col = awn[i % awn.length];
    b.fillStyle = '#6b4a2b'; b.fillRect(x + 2, FB - 13, 36, 13);
    ['#d93a3a', '#f08c00', '#2f9e44', '#ffd43b', '#9b59b6'].forEach((cc, k) => { b.fillStyle = cc; b.beginPath(); b.arc(x + 7 + k * 6.5, FB - 13, 3, 0, 7); b.fill(); });
    for (let k = 0; k < 5; k++) { b.fillStyle = k % 2 ? '#fff' : col; b.fillRect(x + 1 + k * 7.6, FB - 26, 7.6, 9); }
    sign(b, labels[i % labels.length], x + 20, FB - 6, 38, 'rgba(0,0,0,.55)', '#fff', 6);
  }
}
function canopy(b, x0, x1, c1, c2, txt, roof = '#e8e8e8') {   // gasolinera
  b.fillStyle = roof; b.fillRect(x0 + 10, FB - 34, x1 - x0 - 20, 7);
  b.fillStyle = c1; b.fillRect(x0 + 10, FB - 32, x1 - x0 - 20, 2);
  b.fillStyle = c2; b.fillRect(x0 + 10, FB - 29, x1 - x0 - 20, 2);
  b.fillStyle = '#9aa0a6'; b.fillRect(x0 + 18, FB - 28, 4, 28); b.fillRect(x1 - 22, FB - 28, 4, 28);
  b.fillStyle = c1; b.fillRect(x0 + 40, FB - 14, 8, 14); b.fillRect(x0 + 66, FB - 14, 8, 14);
  b.fillStyle = '#222'; b.fillRect(x0 + 41, FB - 11, 6, 4); b.fillRect(x0 + 67, FB - 11, 6, 4);
  sign(b, txt, (x0 + x1) / 2, FB - 45, x1 - x0 - 20, c1, '#fff', 11);
}
function bridge(b) {   // puente peatonal
  b.fillStyle = '#6f757e'; b.fillRect(14, FB - 82, 7, 82); b.fillRect(W - 21, FB - 82, 7, 82);
  b.fillRect(W / 2 - 3, FB - 78, 6, 12);
  b.fillStyle = '#8f959e'; b.fillRect(0, FB - 84, W, 7);
  b.fillStyle = '#4b5159'; b.fillRect(0, FB - 77, W, 2);
  b.strokeStyle = '#4b5159'; b.lineWidth = 1.5;
  b.beginPath(); b.moveTo(0, FB - 96); b.lineTo(W, FB - 96); b.stroke();
  for (let x = 4; x < W; x += 14) { b.beginPath(); b.moveTo(x, FB - 96); b.lineTo(x, FB - 84); b.stroke(); }
  b.strokeStyle = '#6f757e'; b.lineWidth = 3;
  b.beginPath(); b.moveTo(0, FB - 70); b.lineTo(14, FB - 84); b.moveTo(W, FB - 70); b.lineTo(W - 14, FB - 84); b.stroke();
}
function pizzaHut(b, x) {
  bld(b, x, 86, 52, '#f1ebdd');
  b.fillStyle = '#c8102e'; b.beginPath(); b.moveTo(x, FB - 52); b.lineTo(x + 86, FB - 52); b.lineTo(x + 76, FB - 66); b.lineTo(x + 10, FB - 66); b.fill();
  wins(b, x + 4, FB - 50, 78, 18, 5, 1, '#6a7b8c'); sign(b, 'PIZZA HUT', x + 43, FB - 14, 80, '#c8102e', '#fff', 9);
}
function powerChicken(b, x, w) {   // Power Chicken: amarillo con verde
  bld(b, x, w, 50, '#ffd200');
  b.fillStyle = '#1e8c3a'; b.fillRect(x, FB - 50, w, 10); b.fillRect(x, FB - 6, w, 6);
  b.fillStyle = '#1e8c3a'; b.beginPath(); b.arc(x + 15, FB - 25, 10, 0, 7); b.fill();
  b.fillStyle = '#ffd200'; b.beginPath(); b.ellipse(x + 15, FB - 24, 4, 5, 0, 0, 7); b.fill(); b.fillStyle = '#d62828'; b.fillRect(x + 13, FB - 33, 4, 3);
  wins(b, x + 28, FB - 36, w - 32, 26, 2, 1, '#fff3c4', (w - 40) / 2, 18);
  sign(b, 'POWER CHICKEN', x + w / 2, FB - 45, w - 6, null, '#ffd200', 9);
}
function house(b, x, w, h, wall, roof) {
  bld(b, x, w, h, wall);
  b.fillStyle = roof; b.beginPath(); b.moveTo(x - 3, FB - h); b.lineTo(x + w + 3, FB - h); b.lineTo(x + w / 2, FB - h - 14); b.fill();
  b.fillStyle = 'rgba(0,0,0,.15)'; for (let k = 0; k < 4; k++) b.fillRect(x + 2 + k * (w / 4), FB - h - 4 + (k % 2), w / 5, 1);
  b.fillStyle = '#6b3e26'; b.fillRect(x + w / 2 - 5, FB - 18, 10, 18);
  b.fillStyle = '#9ad7ff'; b.fillRect(x + 5, FB - h + 8, 9, 8); b.fillRect(x + w - 14, FB - h + 8, 9, 8);
  b.fillStyle = '#5a4030'; b.fillRect(x + 4, FB - h + 16, 11, 2); b.fillRect(x + w - 15, FB - h + 16, 11, 2);
}
function fountain(b, cx) {   // fuente del Parque Central
  b.fillStyle = 'rgba(0,0,0,.2)'; b.beginPath(); b.ellipse(cx, FB - 2, 34, 6, 0, 0, 7); b.fill();
  b.fillStyle = '#cfc8b8'; b.beginPath(); b.ellipse(cx, FB - 8, 32, 8, 0, 0, 7); b.fill();
  b.fillStyle = '#5bb2e6'; b.beginPath(); b.ellipse(cx, FB - 10, 26, 5, 0, 0, 7); b.fill();
  b.fillStyle = '#bdb6a6'; b.fillRect(cx - 4, FB - 30, 8, 22);
  b.fillStyle = '#cfc8b8'; b.beginPath(); b.ellipse(cx, FB - 30, 14, 4, 0, 0, 7); b.fill();
  b.fillStyle = '#5bb2e6'; b.beginPath(); b.ellipse(cx, FB - 31, 10, 2.5, 0, 0, 7); b.fill();
  b.strokeStyle = 'rgba(160,215,255,.95)'; b.lineWidth = 2;
  [[-1, -12], [1, 12], [-1, -6], [1, 6]].forEach(([s, dx]) => { b.beginPath(); b.moveTo(cx, FB - 40); b.quadraticCurveTo(cx + dx * 1.3, FB - 50, cx + dx * 2, FB - 12); b.stroke(); });
  b.fillStyle = '#bfe6ff'; b.beginPath(); b.arc(cx, FB - 42, 3, 0, 7); b.fill();
}

// ---------- Fachadas por nivel ----------
const FACADES = {
  parque(b) {
    pizzaHut(b, 0);
    bld(b, 86, 84, 92, '#c62828');                                                     // Banco Atlántida
    wins(b, 90, FB - 86, 76, 60, 5, 6, '#f6d4d4', 6, 6);
    b.fillStyle = '#8f1515'; b.fillRect(86, FB - 92, 84, 4); sign(b, 'BANCO ATLÁNTIDA', 128, FB - 12, 84, '#fff', '#c62828', 8);
    bld(b, 205, 60, 60, '#f3e9c6');                                                    // Catedral
    bld(b, 172, 34, 92, '#f3e9c6'); bld(b, 264, 34, 92, '#f3e9c6');
    b.fillStyle = '#7d8a96'; [[172, 206], [264, 298]].forEach(([a, c]) => { b.beginPath(); b.moveTo(a, FB - 92); b.lineTo(c, FB - 92); b.lineTo((a + c) / 2, FB - 96); b.fill(); });
    b.fillStyle = '#5b6b7a'; b.fillRect(182, FB - 80, 14, 22); b.fillRect(274, FB - 80, 14, 22);
    b.fillStyle = '#6aa0c8'; b.beginPath(); b.arc(235, FB - 44, 7, 0, 7); b.fill();
    b.fillStyle = '#6b4a2b'; b.fillRect(229, FB - 20, 12, 20);
    sign(b, 'CATEDRAL', 235, FB - 31, 60, 'rgba(16,41,77,.85)', '#fff', 8);
    bld(b, 300, 92, 58, '#f6f1e3');                                                    // Municipalidad
    b.fillStyle = '#b5543a'; b.fillRect(300, FB - 62, 92, 5);
    bld(b, 336, 20, 76, '#f6f1e3'); b.fillStyle = '#b5543a'; b.fillRect(334, FB - 80, 24, 4);
    b.fillStyle = '#fff'; b.beginPath(); b.arc(346, FB - 64, 4, 0, 7); b.fill();
    b.fillStyle = '#0073cf'; b.fillRect(344, FB - 90, 12, 3); b.fillStyle = '#fff'; b.fillRect(344, FB - 87, 12, 3); b.fillStyle = '#0073cf'; b.fillRect(344, FB - 84, 12, 3);
    b.fillStyle = '#dcd5c0'; for (let x = 304; x < 392; x += 14) b.fillRect(x, FB - 46, 6, 36);
    sign(b, 'MUNICIPALIDAD', 346, FB - 10, 92, '#10294d', '#fff', 8);
    b.fillStyle = '#7cc46a'; b.fillRect(392, FB - 6, 88, 6);                           // Parque: grama, árboles verdes y fuente
    greenTree(b, 404, FB - 2, 0.85); greenTree(b, 470, FB - 2, 0.85);
    fountain(b, 437);
    sign(b, 'PARQUE', 437, FB - 66, 60, '#2f8f3a', '#fff', 8);
  },
  maheco(b) {
    bld(b, 0, 130, 64, '#9db4d2'); wins(b, 4, FB - 60, 122, 40, 8, 3, '#dbe9f7', 9, 8);
    b.fillStyle = '#5f7ea3'; b.fillRect(0, FB - 66, 130, 4); sign(b, 'METROCENTRO', 65, FB - 64, 126, '#10294d', '#fff', 10);
    bld(b, 130, 260, 84, '#f2c200');
    b.fillStyle = '#2e8b3d'; b.fillRect(130, FB - 84, 260, 14); b.fillRect(130, FB - 30, 260, 8);
    for (let x = 142; x < 390; x += 38) { b.fillStyle = '#2e8b3d'; b.fillRect(x, FB - 70, 8, 40); }
    wins(b, 150, FB - 68, 230, 36, 6, 2, '#6a8f6a', 18, 10);
    sign(b, 'MAHECO', 260, FB - 52, 200, '#2e8b3d', '#fff', 20);
    bld(b, 390, 90, 42, '#e8a87c'); wins(b, 394, FB - 38, 82, 14, 4, 1, '#6a7b8c', 8, 8);
    stalls(b, ['VERDURAS', 'ROPA', 'COMIDA', 'FRUTAS', 'CALZADO', 'BAÑO', 'PUPUSAS']);
  },
  viveros(b) {
    bld(b, 0, 150, 70, '#e41e2b');                                                     // Coca-Cola
    b.fillStyle = '#fff'; b.beginPath(); b.moveTo(0, FB - 26); b.bezierCurveTo(50, FB - 40, 90, FB - 12, 150, FB - 30); b.lineTo(150, FB - 24); b.bezierCurveTo(90, FB - 6, 50, FB - 34, 0, FB - 20); b.fill();
    wins(b, 6, FB - 64, 138, 14, 7, 1, '#f6c6c9', 10, 8);
    sign(b, 'Coca-Cola', 75, FB - 44, 140, null, '#fff', 20, 'Georgia, "Times New Roman", serif');
    b.fillStyle = '#b5151f'; b.fillRect(0, FB - 70, 150, 4);
    // Vivero de plantas: invernadero y macetas
    b.fillStyle = 'rgba(210,240,220,.85)'; b.fillRect(156, FB - 50, 138, 50);
    b.fillStyle = 'rgba(210,240,220,.85)'; b.beginPath(); b.moveTo(156, FB - 50); b.lineTo(225, FB - 66); b.lineTo(294, FB - 50); b.fill();
    b.strokeStyle = '#7a8a7a'; b.lineWidth = 1.5;
    for (let x = 156; x <= 294; x += 23) { b.beginPath(); b.moveTo(x, FB); b.lineTo(x, FB - 50); b.stroke(); }
    b.beginPath(); b.moveTo(156, FB - 50); b.lineTo(225, FB - 66); b.lineTo(294, FB - 50); b.stroke();
    for (let x = 160; x < 292; x += 13) {
      b.fillStyle = '#b5543a'; b.fillRect(x, FB - 9, 10, 9);
      b.fillStyle = ['#2b7a34', '#3a9a45', '#57b860'][(x / 13 | 0) % 3]; b.beginPath(); b.arc(x + 5, FB - 13, 6, 0, 7); b.fill();
      if ((x / 13 | 0) % 2) { b.fillStyle = '#f06292'; b.beginPath(); b.arc(x + 4, FB - 16, 2, 0, 7); b.fill(); }
    }
    sign(b, 'VIVERO', 225, FB - 38, 80, '#2f8f3a', '#fff', 11);
    bld(b, 300, 180, 62, '#5b3a24');                                                   // Expreso Americano
    b.fillStyle = '#6b7a3a'; b.fillRect(300, FB - 62, 180, 14); b.fillRect(300, FB - 10, 180, 10);
    wins(b, 306, FB - 44, 168, 26, 5, 1, '#d8c9a8', 24, 18);
    b.fillStyle = '#fff'; b.beginPath(); b.arc(318, FB - 55, 5, 0, 7); b.fill(); b.fillStyle = '#5b3a24'; b.fillRect(315, FB - 56, 6, 3);
    sign(b, 'EXPRESO AMERICANO', 398, FB - 55, 150, null, '#f1e6c8', 11);
  },
  este(b) {
    bld(b, 0, 110, 70, '#d8d0bf'); b.fillStyle = '#7fb4d6'; b.fillRect(6, FB - 50, 98, 30);
    sign(b, 'MEGAMALL', 55, FB - 60, 104, '#c8102e', '#fff', 11);
    powerChicken(b, 110, 75);
    bld(b, 185, 95, 54, '#f28c1c'); b.fillStyle = '#b8620a'; b.fillRect(185, FB - 54, 95, 14);
    wins(b, 190, FB - 36, 85, 30, 3, 1, '#ffe3bd', 18, 14); sign(b, 'LA MUNDIAL', 232, FB - 47, 90, '#fff', '#b8620a', 9);
    bld(b, 280, 100, 58, '#f2c200'); b.fillStyle = '#10294d'; b.fillRect(280, FB - 58, 100, 10);
    wins(b, 284, FB - 30, 92, 26, 4, 1, '#10294d', 16, 14); sign(b, 'COLONIAL', 330, FB - 44, 94, '#10294d', '#ffd43b', 10);
    bld(b, 380, 100, 64, '#c8102e'); wins(b, 384, FB - 36, 92, 30, 4, 1, '#f1c6cb', 14, 14); sign(b, 'BAC CREDOMATIC', 430, FB - 52, 96, '#fff', '#c8102e', 9);
    bridge(b);
  },
  unah(b) {
    bld(b, 0, 140, 66, '#eef0f4');                                                     // UNAH-VS
    b.fillStyle = '#003da5'; b.fillRect(0, FB - 66, 140, 10); b.fillStyle = '#ffc72c'; b.fillRect(0, FB - 56, 140, 3);
    b.fillStyle = '#d6dae2'; for (let x = 10; x < 136; x += 18) b.fillRect(x, FB - 50, 6, 50);
    wins(b, 4, FB - 48, 132, 30, 7, 2, '#7fa6d6', 8, 9);
    b.fillStyle = '#7a7f88'; b.fillRect(126, FB - 92, 2, 26); b.fillStyle = '#0073cf'; b.fillRect(128, FB - 92, 12, 3); b.fillStyle = '#fff'; b.fillRect(128, FB - 89, 12, 3); b.fillStyle = '#0073cf'; b.fillRect(128, FB - 86, 12, 3);
    sign(b, 'UNAH-VS', 60, FB - 61, 110, null, '#ffc72c', 11);
    bld(b, 140, 90, 54, '#d62828');                                                    // McDonald's
    b.strokeStyle = '#ffc72c'; b.lineWidth = 4;
    b.beginPath(); b.moveTo(167, FB - 26); b.quadraticCurveTo(167, FB - 50, 176, FB - 50); b.quadraticCurveTo(185, FB - 50, 185, FB - 30);
    b.quadraticCurveTo(185, FB - 50, 194, FB - 50); b.quadraticCurveTo(203, FB - 50, 203, FB - 26); b.stroke();
    b.fillStyle = '#9ad7ff'; b.fillRect(146, FB - 18, 78, 14);
    sign(b, "McDonald's", 185, FB - 13, 80, '#ffc72c', '#d62828', 9);
    bld(b, 230, 132, 60, '#0057b8');                                                   // PriceSmart
    b.fillStyle = '#00439a'; b.fillRect(230, FB - 60, 132, 6);
    b.fillStyle = '#c9d6ea'; b.fillRect(276, FB - 22, 40, 22);
    sign(b, 'PRICESMART', 296, FB - 40, 120, null, '#ffffff', 14);
    bld(b, 362, 118, 74, '#e9dfc7');                                                   // Galerías del Valle
    b.fillStyle = '#8ecae6'; b.fillRect(392, FB - 50, 58, 50); b.strokeStyle = '#6f8fa8'; b.lineWidth = 1;
    for (let x = 392; x <= 450; x += 14.5) { b.beginPath(); b.moveTo(x, FB); b.lineTo(x, FB - 50); b.stroke(); }
    b.fillStyle = '#b5543a'; b.fillRect(362, FB - 74, 118, 5);
    sign(b, 'GALERÍAS DEL VALLE', 421, FB - 62, 112, '#10294d', '#fff', 8);
  },
  sur(b) {
    bld(b, 0, 150, 54, '#a8b0b8');
    [['#f4f4f4', 6], ['#f5c400', 50], ['#2f9e44', 94]].forEach(([col, x]) => { b.fillStyle = col; b.fillRect(x, FB - 22, 40, 20); b.fillStyle = '#9ad7ff'; b.fillRect(x + 4, FB - 19, 32, 7); b.fillStyle = '#111'; b.beginPath(); b.arc(x + 8, FB - 2, 3, 0, 7); b.arc(x + 32, FB - 2, 3, 0, 7); b.fill(); });
    sign(b, 'TERMINAL DE BUSES', 75, FB - 40, 140, '#10294d', '#fff', 9);
    bld(b, 150, 140, 36, '#e7e2d6'); canopy(b, 150, 290, '#d62828', '#2e9e44', 'PUMA');
    pizzaHut(b, 290);
    bld(b, 380, 100, 60, '#f6f6f6'); b.fillStyle = '#f28c1c'; b.fillRect(380, FB - 60, 100, 8);
    wins(b, 384, FB - 24, 92, 20, 4, 1, '#f28c1c', 14, 10);
    b.fillStyle = '#f28c1c'; b.beginPath(); b.arc(404, FB - 40, 9, 0, 7); b.fill();
    b.strokeStyle = '#fff'; b.lineWidth = 2; b.beginPath(); b.arc(404, FB - 40, 5, -1.2, 1.2); b.stroke(); b.beginPath(); b.arc(404, FB - 40, 2, -1.2, 1.2); b.stroke();
    sign(b, 'HONDUTEL', 440, FB - 40, 70, '#f28c1c', '#fff', 10);
    bridge(b);
  },
  c27(b) {
    bld(b, 0, 170, 56, '#c9c2b0');                                                     // Central de Abastos
    b.fillStyle = '#8f959e'; b.beginPath(); b.moveTo(-4, FB - 56); b.lineTo(174, FB - 56); b.lineTo(160, FB - 70); b.lineTo(10, FB - 70); b.fill();
    b.fillStyle = 'rgba(0,0,0,.15)'; for (let x = 12; x < 160; x += 8) b.fillRect(x, FB - 69, 2, 13);
    [14, 62, 110].forEach(x => { b.fillStyle = '#5b6168'; b.fillRect(x, FB - 34, 40, 34); b.fillStyle = '#7a8088'; for (let y = FB - 32; y < FB; y += 4) b.fillRect(x + 2, y, 36, 2); });
    ['#d93a3a', '#f08c00', '#2f9e44', '#ffd43b'].forEach((col, i) => { b.fillStyle = '#8b5a2b'; b.fillRect(20 + i * 36, FB - 8, 14, 8); b.fillStyle = col; b.beginPath(); b.arc(27 + i * 36, FB - 9, 5, Math.PI, 0); b.fill(); });
    sign(b, 'CENTRAL DE ABASTOS', 85, FB - 46, 160, '#10294d', '#ffd43b', 10);
    bld(b, 170, 130, 30, '#eef2f8'); canopy(b, 170, 300, '#0033a0', '#ffffff', 'UNO', '#0033a0');   // Gasolinera UNO
    house(b, 304, 54, 40, '#f4d58d', '#b5543a'); house(b, 362, 56, 46, '#9fd3c7', '#8b3a2a'); house(b, 422, 56, 38, '#f2b5d4', '#b5543a');
    b.fillStyle = '#6aa0c8'; b.fillRect(300, FB - 3, 180, 3);
  },
  norte(b) {
    bld(b, 0, 140, 78, '#f4f6fa');                                                     // Seguro Social
    b.fillStyle = '#0b4ea2'; b.fillRect(0, FB - 78, 140, 10); for (let y = FB - 60; y < FB - 10; y += 16) b.fillRect(0, y, 140, 3);
    wins(b, 6, FB - 66, 128, 54, 8, 3, '#a9c7ea', 8, 9);
    b.fillStyle = '#d62828'; b.fillRect(12, FB - 76, 4, 6); b.fillRect(11, FB - 74, 6, 2);
    sign(b, 'SEGURO SOCIAL', 76, FB - 73, 116, null, '#ffffff', 9);
    powerChicken(b, 140, 106);
    bld(b, 246, 84, 40, '#e9efe6'); b.fillStyle = '#2f9e44'; b.fillRect(282, FB - 34, 12, 4); b.fillRect(286, FB - 38, 4, 12);   // farmacia
    sign(b, 'FARMACIA', 288, FB - 12, 76, '#2f9e44', '#fff', 8);
    bld(b, 330, 150, 92, '#2a6fdb');                                                   // Hospital del Valle (vidrio azul y rojo)
    for (let x = 334; x < 476; x += 12) for (let y = FB - 86; y < FB - 8; y += 10) { b.fillStyle = (x + y) % 3 ? '#4f8ff0' : '#7fb0f5'; b.fillRect(x, y, 10, 8); }
    b.fillStyle = '#d62828'; b.fillRect(330, FB - 92, 150, 6); b.fillRect(398, FB - 86, 14, 78);
    b.fillStyle = '#fff'; b.fillRect(402, FB - 70, 6, 16); b.fillRect(397, FB - 65, 16, 6);
    sign(b, 'HOSPITAL DEL VALLE', 405, FB - 4, 146, '#d62828', '#fff', 8);
    bridge(b);
  },
  c33(b) {
    b.fillStyle = '#b9bac4'; rr(b, 2, FB - 56, 188, 56, 14);
    b.fillStyle = '#9fa1ad'; rr(b, 10, FB - 46, 172, 46, 10);
    b.fillStyle = '#6fae52'; b.fillRect(24, FB - 22, 144, 20);
    b.strokeStyle = '#8c8e9a'; b.lineWidth = 2; for (let x = 20; x < 180; x += 14) { b.beginPath(); b.moveTo(x, FB - 46); b.lineTo(x, FB - 24); b.stroke(); }
    [14, 176].forEach(x => { b.fillStyle = '#6b6f78'; b.fillRect(x, FB - 90, 4, 40); b.fillStyle = '#fff6c9'; b.fillRect(x - 6, FB - 96, 16, 8); });
    sign(b, 'ESTADIO OLÍMPICO', 96, FB - 54, 170, '#10294d', '#fff', 10);
    ['#f06292', '#ffd43b', '#4dabf7', '#69db7c'].forEach((col, i) => { b.fillStyle = col; b.fillRect(194 + i * 26, FB - 26, 26, 26); b.fillStyle = 'rgba(255,255,255,.35)'; b.fillRect(194 + i * 26, FB - 26, 13, 26); });
    b.fillStyle = '#d62828'; b.beginPath(); b.moveTo(190, FB - 26); b.lineTo(300, FB - 26); b.lineTo(280, FB - 38); b.lineTo(210, FB - 38); b.fill();
    b.strokeStyle = '#555'; b.lineWidth = 3; b.beginPath(); b.moveTo(222, FB); b.lineTo(245, FB - 52); b.lineTo(268, FB); b.stroke();
    b.lineWidth = 2; b.beginPath(); b.arc(245, FB - 52, 24, 0, 7); b.stroke();
    for (let k = 0; k < 8; k++) {
      const a = k * Math.PI / 4;
      b.beginPath(); b.moveTo(245, FB - 52); b.lineTo(245 + Math.cos(a) * 24, FB - 52 + Math.sin(a) * 24); b.stroke();
      b.fillStyle = ['#f06292', '#ffd43b', '#4dabf7', '#69db7c'][k % 4]; b.fillRect(245 + Math.cos(a) * 24 - 3, FB - 52 + Math.sin(a) * 24 - 3, 6, 6);
    }
    sign(b, 'JUEGOS MECÁNICOS', 245, FB - 13, 106, '#10294d', '#ffd43b', 8);
    bld(b, 300, 180, 44, '#cfd8e3');
    bld(b, 320, 30, 74, '#d8c7d2');
    b.strokeStyle = '#d58aa5'; b.lineWidth = 6; b.beginPath(); b.moveTo(350, FB - 70); b.bezierCurveTo(400, FB - 70, 380, FB - 30, 440, FB - 34); b.stroke();
    b.fillStyle = '#7fb4d6'; b.fillRect(430, FB - 14, 46, 10);
    b.strokeStyle = '#777'; b.lineWidth = 1.5; for (let x = 304; x < 478; x += 10) { b.beginPath(); b.moveTo(x, FB - 12); b.lineTo(x, FB); b.stroke(); }
    sign(b, 'WONDERLAND', 392, FB - 56, 170, '#6a7a8a', '#e0e4ea', 10);
  },
  dandy(b) {
    bld(b, 0, 100, 62, '#1f7fa8'); wins(b, 4, FB - 36, 92, 22, 4, 1, '#d7eef8', 14, 12); sign(b, 'BANPAÍS', 50, FB - 50, 92, '#fff', '#1f7fa8', 11);
    bld(b, 100, 150, 70, '#d9c28f'); b.fillStyle = '#2e8b3d'; b.fillRect(100, FB - 70, 150, 8);
    b.fillStyle = '#b5543a'; b.beginPath(); b.moveTo(96, FB - 70); b.lineTo(254, FB - 70); b.lineTo(240, FB - 80); b.lineTo(110, FB - 80); b.fill();
    wins(b, 106, FB - 58, 138, 14, 6, 1, '#7a6a4a', 14, 8);
    sign(b, 'MERCADO DANDY', 175, FB - 40, 140, '#10294d', '#ffd43b', 12);
    bld(b, 250, 130, 58, '#f4f0e8'); b.fillStyle = '#e8531f'; b.fillRect(250, FB - 58, 130, 14);
    wins(b, 254, FB - 40, 122, 30, 5, 1, '#8aa0b5', 16, 14); sign(b, 'DESPENSA FAMILIAR', 315, FB - 51, 126, '#b8370f', '#fff', 8);
    bld(b, 380, 100, 38, '#d6b88a'); wins(b, 384, FB - 34, 92, 12, 5, 1, '#7a6a4a', 10, 8);
    stalls(b, ['VERDURAS', 'LÁCTEOS', 'FRUTAS', 'QUESOS', 'CARNES', 'GRANOS', 'ROPA']);
  },
};

// ---------- Fondo completo del nivel ----------
function makeBg(L, blocked) {
  const cvb = document.createElement('canvas'); cvb.width = W; cvb.height = H;
  const b = cvb.getContext('2d');
  b.fillStyle = '#0b1b33'; b.fillRect(0, 0, W, H);
  const g = b.createLinearGradient(0, OY, 0, FB); g.addColorStop(0, L.sky[0]); g.addColorStop(1, L.sky[1]);
  b.fillStyle = g; b.fillRect(0, OY, W, 2 * T);
  b.fillStyle = 'rgba(255,255,255,.7)'; [[60, 12, 22], [300, 8, 28], [420, 20, 18]].forEach(([x, y, r]) => { b.beginPath(); b.ellipse(x, OY + y, r * 1.6, r * .5, 0, 0, 7); b.fill(); });
  FACADES[L.id](b);
  const rowY = r => OY + r * T;
  // Meta
  b.fillStyle = L.sidewalk; b.fillRect(0, rowY(GOAL_ROW), W, T);
  for (let i = 0; i < W / 8; i++) { b.fillStyle = i % 2 ? '#111' : '#fff'; b.fillRect(i * 8, rowY(GOAL_ROW), 8, 8); }
  b.fillStyle = 'rgba(0,0,0,.08)'; for (let x = 0; x < W; x += T) b.fillRect(x, rowY(GOAL_ROW) + 8, 2, T - 8);
  b.fillStyle = 'rgba(0,0,0,.35)'; b.font = 'bold 12px "Trebuchet MS", sans-serif'; b.textAlign = 'center'; b.textBaseline = 'middle';
  b.fillText('META', W / 2, rowY(GOAL_ROW) + T / 2 + 6);
  // Calles
  ROAD_ROWS.forEach(r => {
    b.fillStyle = L.road; b.fillRect(0, rowY(r), W, T);
    b.fillStyle = 'rgba(255,255,255,.04)';
    for (let i = 0; i < 40; i++) b.fillRect(rand(0, W), rowY(r) + rand(0, T), 3, 2);
    if (ROAD_ROWS.includes(r + 1)) { b.fillStyle = '#eaeaea'; for (let x = 6; x < W; x += 40) b.fillRect(x, rowY(r) + T - 2, 22, 3); }
  });
  [3, 9].forEach(r => { b.fillStyle = '#9a9a9a'; b.fillRect(0, rowY(r), W, 3); });
  [7, 13].forEach(r => { b.fillStyle = '#9a9a9a'; b.fillRect(0, rowY(r) + T - 3, W, 3); });
  // Paso de cebra (franjas paralelas al tráfico, a lo ancho del cruce)
  if (L.zebra) {
    const x0 = L.zebra[0] * T + 4, zw = L.zebra.length * T - 8;
    ROAD_ROWS.forEach(r => { b.fillStyle = '#f2f2f2'; for (let k = 0; k < 3; k++) b.fillRect(x0, rowY(r) + 5 + k * 15, zw, 8); });
  }
  // Mediana
  const my = rowY(MEDIAN);
  if (L.blocker === 'canal') {
    for (let c = 0; c < COLS; c++) (blocked.has(c + ',' + MEDIAN) ? canalTile : smallBridge)(b, c * T, my);
  } else {
    b.fillStyle = L.blocker === 'rail' ? '#a9a59c' : L.grass; b.fillRect(0, my, W, T);
    if (L.blocker !== 'rail') { b.fillStyle = 'rgba(255,255,255,.08)'; for (let x = 0; x < W; x += 24) b.fillRect(x + 6, my + 10 + (x / 24 % 2) * 14, 6, 3); }
    else {   // espacios libres entre barandales: acera clara con flechas para que se note el paso
      for (let c = 0; c < COLS; c++) if (!blocked.has(c + ',' + MEDIAN)) {
        b.fillStyle = L.sidewalk; b.fillRect(c * T, my, T, T);
        b.fillStyle = '#f2c200'; b.fillRect(c * T, my, 3, T); b.fillRect(c * T + T - 3, my, 3, T);
        b.fillStyle = 'rgba(0,0,0,.25)'; b.beginPath(); b.moveTo(c * T + T / 2, my + 12); b.lineTo(c * T + T / 2 + 8, my + 22); b.lineTo(c * T + T / 2 - 8, my + 22); b.fill();
        b.fillRect(c * T + T / 2 - 3, my + 22, 6, 14);
      }
    }
    const awn = ['#d93a3a', '#2f9e44', '#f08c00', '#1c5fd1', '#e0407a'];
    let k = 0;
    blocked.forEach(key => {
      const c = +key.split(',')[0], x = c * T;
      if (L.blocker === 'stall') stall(b, x, my, awn[k++ % awn.length]);
      else if (L.blocker === 'rail') railBlock(b, x, my);
      else if (L.blocker === 'greenTree') greenTree(b, x + T / 2, my + T - 6);
      else macuelizo(b, x + T / 2, my + T - 6);
    });
  }
  // Salida
  b.fillStyle = L.sidewalk; b.fillRect(0, rowY(START_ROW), W, T);
  b.fillStyle = 'rgba(0,0,0,.08)'; for (let x = 0; x < W; x += T) b.fillRect(x, rowY(START_ROW), 2, T);
  b.fillStyle = 'rgba(0,0,0,.35)'; b.font = 'bold 12px "Trebuchet MS", sans-serif'; b.textAlign = 'center'; b.textBaseline = 'middle';
  b.fillText('SALIDA', 2.5 * T, rowY(START_ROW) + T / 2 + 14); b.fillText('SALIDA', 7.5 * T, rowY(START_ROW) + T / 2 + 14);
  return cvb;
}
