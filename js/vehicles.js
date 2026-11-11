'use strict';

// ---------- Vehículos ----------
function vtext(c, v, txt, x0, y, size, col, outline) {
  c.save(); c.translate(x0, y); c.scale(v.dir, 1);
  c.font = `bold ${size}px "Trebuchet MS", sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle';
  if (outline) { c.lineWidth = 2; c.strokeStyle = outline; c.lineJoin = 'round'; c.strokeText(txt, 0, 0); }
  c.fillStyle = col; c.fillText(txt, 0, 0);
  c.restore();
}

function makeVehicle(type, x, dir) {
  const sp = TYPES[type], v = { type, w: sp.w * T, h: sp.h, x, dir, color: '#fff', label: '', stripe: '#999', shout: 0 };
  if (type === 'rap') { v.color = '#f7f7f7'; v.label = String(100 + Math.floor(Math.random() * 900)); }
  else if (type === 'moto') { v.delivery = Math.random() < 0.35; v.color = v.delivery ? '#d62828' : pick(['#d93a3a', '#1c5fd1', '#2f9e44', '#f08c00', '#333']); }
  else if (type === 'mic') { v.color = pick(MIC_COLORS); v.label = pick(MIC_LABELS); }
  else if (type === 'bus') { const co = pick(COMPANIES); v.color = '#f4f4f4'; v.label = co.n; v.stripe = co.c; }
  else if (type === 'esc') { v.color = '#f5c400'; v.label = pick(ESC_LABELS); }
  return v;
}

function drawVeh(c, v, sx, rowY) {
  const w = v.w, h = v.h;
  c.save();
  c.translate(sx + w / 2, rowY + T / 2 + 3);
  c.scale(v.dir, 1);
  const top = -h / 2, bb = h / 2 - 5;
  const flash = Math.floor(T0 * 8) % 2;
  c.fillStyle = 'rgba(0,0,0,.3)'; c.fillRect(-w / 2 + 3, bb + 2, w - 4, 5);
  let wheels = [-w * .30, w * .30];

  switch (v.type) {
    case 'rap': {   // taxi blanco con número amarillo
      wheels = [-w * .28, w * .28];
      c.fillStyle = v.color; rr(c, -w / 2, -2, w, bb + 2, 6);
      c.beginPath(); c.moveTo(-w * .30, -2); c.lineTo(-w * .20, top + 2); c.lineTo(w * .14, top + 2); c.lineTo(w * .30, -2); c.fill();
      c.fillStyle = '#bfe6ff';
      c.beginPath(); c.moveTo(-w * .25, -4); c.lineTo(-w * .17, top + 5); c.lineTo(w * .12, top + 5); c.lineTo(w * .25, -4); c.fill();
      c.fillStyle = v.color; c.fillRect(-1, top + 4, 2, 10);
      c.fillStyle = '#f2c200'; c.fillRect(-4, top - 2, 9, 4);
      c.fillStyle = '#111'; c.fillRect(-w / 2 + 1, -1, w - 2, 3);                  // franja negra de diseño
      vtext(c, v, v.label, 0, 6, 9, '#f2c200', '#4a3b00');
      break;
    }
    case 'moto': {
      wheels = [];
      [-14, 14].forEach(x => { c.strokeStyle = '#0d0d0d'; c.lineWidth = 3.5; c.beginPath(); c.arc(x, bb - 1, 6, 0, 7); c.stroke(); c.fillStyle = '#9a9a9a'; c.beginPath(); c.arc(x, bb - 1, 1.8, 0, 7); c.fill(); });
      c.fillStyle = '#333'; c.fillRect(-12, 0, 24, 3);
      c.fillStyle = v.color; rr(c, -10, -5, 16, 7, 3);                                 // tanque
      c.strokeStyle = '#555'; c.lineWidth = 2; c.beginPath(); c.moveTo(14, bb - 1); c.lineTo(9, -8); c.stroke();  // horquilla
      c.fillStyle = v.delivery ? '#d62828' : v.color; c.fillRect(-9, -15, 9, 12);        // torso del conductor
      c.fillStyle = '#c68642'; c.beginPath(); c.arc(-3, -19, 4.5, 0, 7); c.fill();
      c.fillStyle = v.delivery ? '#d62828' : '#222'; c.beginPath(); c.arc(-3, -20, 5, Math.PI, 0); c.fill();   // casco
      c.strokeStyle = '#c68642'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(-1, -12); c.lineTo(9, -8); c.stroke();
      if (v.delivery) {   // repartidor con mochila térmica roja
        c.fillStyle = '#b71c1c'; c.fillRect(-21, -24, 13, 14);
        c.fillStyle = '#d62828'; c.fillRect(-20, -23, 11, 12);
        c.fillStyle = '#fff'; c.fillRect(-20, -18, 11, 2);
        c.fillStyle = '#7a1010'; c.fillRect(-9, -20, 2, 8);                             // tirantes
      }
      c.fillStyle = '#fff3a0'; c.fillRect(14, -6, 3, 4);
      c.fillStyle = '#e03131'; c.fillRect(-14, -3, 3, 3);
      break;
    }
    case 'mic': {   // microbús estilo Nissan Urvan: trompa corta, parabrisas grande y techo redondeado
      const dark = v.color !== '#f2f2f2', x0 = -w / 2, x1 = w / 2;
      wheels = [-w * .31, w * .26];
      c.fillStyle = v.color;
      c.beginPath();
      c.moveTo(x0 + 6, top + 1);
      c.lineTo(x1 - 24, top + 1);
      c.quadraticCurveTo(x1 - 16, top + 1, x1 - 11, top + 9);                 // techo que baja al parabrisas
      c.lineTo(x1 - 5, top + 19);                                             // parabrisas inclinado
      c.quadraticCurveTo(x1 - 1, top + 20, x1, top + 24);                     // trompa corta
      c.lineTo(x1, bb - 1); c.lineTo(x0, bb - 1); c.lineTo(x0, top + 6);
      c.quadraticCurveTo(x0, top + 1, x0 + 6, top + 1); c.fill();
      c.fillStyle = shade(v.color, 0.78); c.fillRect(x0, bb - 5, w, 4);       // faldón
      c.fillStyle = shade(v.color, 1.15); c.fillRect(x0 + 2, top + 20, w - 10, 2);   // moldura lateral
      c.fillStyle = '#2b3846';                                               // ventanas separadas
      [[x0 + 4, 15], [x0 + 22, 15], [x0 + 40, 15], [x0 + 58, 12]].forEach(([wx, ww]) => { if (wx + ww < x1 - 22) rr(c, wx, top + 5, ww, 11, 2); });
      c.beginPath(); c.moveTo(x1 - 21, top + 5); c.lineTo(x1 - 13, top + 5); c.lineTo(x1 - 7, top + 17); c.lineTo(x1 - 21, top + 17); c.closePath(); c.fill();
      c.fillStyle = 'rgba(255,255,255,.22)'; c.fillRect(x0 + 5, top + 6, 8, 2); c.fillRect(x1 - 19, top + 6, 5, 2);
      c.strokeStyle = shade(v.color, 0.55); c.lineWidth = 1;                 // puerta corrediza
      c.beginPath(); c.moveTo(x1 - 24, top + 4); c.lineTo(x1 - 24, bb - 5); c.moveTo(x1 - 44, top + 4); c.lineTo(x1 - 44, bb - 5); c.stroke();
      c.fillStyle = '#222'; c.fillRect(x1 - 28, top + 22, 3, 2);
      c.fillStyle = '#d9dde3'; c.fillRect(x1 - 4, top + 24, 4, 4);            // parrilla cromada
      c.fillStyle = '#fff3a0'; c.fillRect(x1 - 3, top + 22, 3, 3);            // faro
      c.fillStyle = '#333'; c.fillRect(x1 - 9, top + 12, 3, 4);               // retrovisor
      c.fillStyle = '#2b2b2b'; c.fillRect(x1 - 4, bb - 6, 5, 5); c.fillRect(x0 - 1, bb - 6, 3, 5);
      vtext(c, v, v.label, -12, top + 27, 9, dark ? '#fff' : '#10294d');
      break;
    }
    case 'bus': {   // bus grande blanco con nombre de la empresa
      c.fillStyle = v.color; rr(c, -w / 2, top, w, bb - top, 6);
      c.fillStyle = v.stripe; c.fillRect(-w / 2, top + 20, w, 4);
      c.fillStyle = '#9ad7ff';
      for (let x = -w / 2 + 6; x < w / 2 - 34; x += 21) c.fillRect(x, top + 5, 16, 13);
      c.fillStyle = '#123'; c.fillRect(w / 2 - 32, top + 5, 11, 28);
      c.fillStyle = '#9ad7ff'; c.fillRect(w / 2 - 18, top + 4, 14, 17);
      c.fillStyle = 'rgba(0,0,0,.18)'; c.fillRect(-w / 2 + 14, top - 3, 36, 4);
      vtext(c, v, v.label, -12, bb - 6, 10, v.stripe);
      break;
    }
    case 'esc': {   // bus amarillo estilo escolar de EE. UU.
      c.fillStyle = v.color; rr(c, -w / 2, top, w - 12, bb - top, 5);
      c.fillRect(w / 2 - 20, -4, 20, bb + 4);                                       // capó
      c.fillStyle = '#111'; c.fillRect(-w / 2, top + 19, w - 12, 2); c.fillRect(-w / 2, bb - 4, w, 2);
      c.fillStyle = '#9ad7ff';
      for (let x = -w / 2 + 6; x < w / 2 - 36; x += 20) c.fillRect(x, top + 4, 15, 12);
      c.fillRect(w / 2 - 30, top + 4, 9, 14);
      c.fillStyle = '#111'; c.fillRect(w / 2 - 32 + 12, top + 3, 0, 0);
      c.fillStyle = '#9ad7ff'; c.fillRect(w / 2 - 17, top + 5, 7, 10);                // parabrisas
      c.fillStyle = '#d62828'; c.fillRect(-w / 2 + 3, top + 1, 4, 3);                 // luz de stop
      vtext(c, v, v.label, -10, top + 28, 9, '#111');
      break;
    }
    case 'amb': {
      c.fillStyle = '#fafafa'; rr(c, -w / 2, top, w - 14, bb - top, 5);
      c.fillStyle = '#fafafa'; rr(c, w / 2 - 22, -6, 22, bb + 6, 5);
      c.fillStyle = '#d62828'; c.fillRect(-w / 2, 4, w - 14, 3);
      c.fillRect(-14, top + 6, 5, 15); c.fillRect(-19, top + 11, 15, 5);              // cruz
      c.fillStyle = '#9ad7ff'; c.fillRect(w / 2 - 18, -3, 11, 10);
      c.fillStyle = flash ? '#ff2d2d' : '#2d6bff'; c.fillRect(-4, top - 3, 8, 4);
      c.fillStyle = flash ? '#2d6bff' : '#ff2d2d'; c.fillRect(w / 2 - 16, -9, 8, 3);
      break;
    }
    case 'fire': {
      wheels = [-w * .32, -w * .10, w * .32];
      c.fillStyle = '#c1272d'; rr(c, -w / 2, top + 4, w - 20, bb - top - 4, 4);
      c.fillStyle = '#c1272d'; rr(c, w / 2 - 28, top + 8, 28, bb - top - 8, 5);
      c.fillStyle = '#fff'; c.fillRect(-w / 2, bb - 12, w - 20, 3);
      c.fillStyle = '#9ad7ff'; c.fillRect(w / 2 - 20, top + 12, 13, 12);
      c.strokeStyle = '#c9ccd1'; c.lineWidth = 2;                                     // escalera
      c.beginPath(); c.moveTo(-w / 2 + 6, top + 1); c.lineTo(w / 2 - 34, top + 1); c.moveTo(-w / 2 + 6, top + 5); c.lineTo(w / 2 - 34, top + 5); c.stroke();
      for (let x = -w / 2 + 10; x < w / 2 - 34; x += 8) { c.beginPath(); c.moveTo(x, top + 1); c.lineTo(x, top + 5); c.stroke(); }
      c.fillStyle = flash ? '#ff2d2d' : '#ffd43b'; c.fillRect(w / 2 - 22, top + 5, 10, 3);
      vtext(c, v, 'BOMBEROS', -14, bb - 20, 8, '#fff');
      break;
    }
    case 'pol': {
      wheels = [-w * .28, w * .28];
      c.fillStyle = '#f4f6fa'; rr(c, -w / 2, -2, w, bb + 2, 6);
      c.beginPath(); c.moveTo(-w * .30, -2); c.lineTo(-w * .20, top + 2); c.lineTo(w * .14, top + 2); c.lineTo(w * .30, -2); c.fill();
      c.fillStyle = '#1c3d8f'; c.fillRect(-w / 2, 3, w, 4);
      c.fillStyle = '#9ad7ff';
      c.beginPath(); c.moveTo(-w * .25, -4); c.lineTo(-w * .17, top + 5); c.lineTo(w * .12, top + 5); c.lineTo(w * .25, -4); c.fill();
      c.fillStyle = flash ? '#ff2d2d' : '#2d6bff'; c.fillRect(-5, top - 3, 5, 4);
      c.fillStyle = flash ? '#2d6bff' : '#ff2d2d'; c.fillRect(1, top - 3, 5, 4);
      vtext(c, v, 'POLICÍA', 0, 5, 6, '#fff');
      break;
    }
  }
  wheels.forEach(x => {
    c.fillStyle = '#0d0d0d'; c.beginPath(); c.arc(x, bb, 6, 0, 7); c.fill();
    c.fillStyle = '#9a9a9a'; c.beginPath(); c.arc(x, bb, 2.5, 0, 7); c.fill();
  });
  if (v.type !== 'moto') {
    c.fillStyle = '#fff3a0'; c.fillRect(w / 2 - 3, bb - 10, 3, 5);
    c.fillStyle = '#e03131'; c.fillRect(-w / 2, bb - 10, 3, 5);
  }
  c.restore();
}

