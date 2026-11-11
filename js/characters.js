'use strict';
/* Personajes en pixel art estilo RPG clásico.
   Cuadrícula de diseño: x 0..15, y -5..24 (pies en y 22). Contorno automático alrededor de todo el sprite. */

const GW = 22, GH = 30, OXP = 3, OYP = 5;
const OUTLINE = '#1b1626';
const SPRITES = new Map();

// Conjuntos: qué ropa y extras usa cada uno
const OUTFIT_SPECS = {
  suit:      { top: { kind: 'suit', col: '#1f2430', tie: '#c62828' }, pants: { kind: 'long', col: '#1f2430' }, shoes: { kind: 'plain', col: '#141218' } },
  doctor:    { top: { kind: 'labcoat', col: '#3ba3c4' }, pants: { kind: 'long', col: '#3ba3c4' }, shoes: { kind: 'sneaker', col: '#f4f4f4', col2: '#c9ccd2' } },
  fire:      { top: { kind: 'reflect', col: '#b3261e', col2: '#ffd43b' }, pants: { kind: 'long', col: '#2e3440', band: '#ffd43b' }, shoes: { kind: 'boots', col: '#141218' }, hat: 'fireHelmet', gloves: '#2e3440' },
  police:    { top: { kind: 'police', col: '#2a4a9a' }, pants: { kind: 'long', col: '#14213d', belt: '#141218' }, shoes: { kind: 'plain', col: '#141218' }, hat: 'policeCap' },
  military:  { top: { kind: 'camo', col: '#556b2f', col2: '#3b4a22', col3: '#7a6a42' }, pants: { kind: 'long', col: '#556b2f', pat: 'camo', col2: '#3b4a22', col3: '#7a6a42' }, shoes: { kind: 'boots', col: '#2b2a22' }, hat: 'beret' },
  priest:    { top: { kind: 'robe', col: '#1c1a22' }, shoes: { kind: 'plain', col: '#141218' }, hatF: 'veil' },
  busHelper: { top: { kind: 'tee', col: '#f08c00' }, pants: { kind: 'long', col: '#2d4a8a', jean: true }, shoes: { kind: 'sneaker', col: '#f4f4f4', col2: '#c9ccd2' }, hat: 'capBack', hatCol: '#d62828', extra: 'cashTowel' },
  trash:     { top: { kind: 'reflect', col: '#f08c00', col2: '#d9dde3' }, pants: { kind: 'long', col: '#f08c00', band: '#d9dde3' }, shoes: { kind: 'boots', col: '#2b2a22' }, hat: 'cap', hatCol: '#f08c00', gloves: '#ffd43b', extra: 'trashBag' },
  thief:     { top: { kind: 'stripes', col: '#1c1a22', col2: '#f4f4f4' }, pants: { kind: 'long', col: '#1c1a22' }, shoes: { kind: 'plain', col: '#141218' }, hat: 'beanie', hatCol: '#1c1a22', mask: true, extra: 'moneyBag' },
  pirate:    { top: { kind: 'pirate', col: '#f4f4f4', col2: '#b02a2a' }, pants: { kind: 'long', col: '#3a2a1a' }, shoes: { kind: 'boots', col: '#141218' }, hat: 'pirateHat', patch: true },
  zombie:    { skin: '#8fbf7a', top: { kind: 'tee', col: '#5f7a8c', pat: 'torn' }, pants: { kind: 'long', col: '#6b5a3a', pat: 'torn' }, shoes: { kind: 'plain', col: '#3a3530' }, zombie: true },
  baleada:   { baleada: true, shoes: { kind: 'sandals', col: '#2f9e44' } },
  astro:     { top: { kind: 'astro', col: '#f2f4f7' }, pants: { kind: 'long', col: '#f2f4f7' }, shoes: { kind: 'boots', col: '#9aa3ad' }, helmet: true, gloves: '#c9ccd2', back: 'astroPack' },
  farmer:    { top: { kind: 'overalls', col: '#c0392b', col2: '#7b1f16', pat: 'check', bib: '#3d5f9e' }, pants: { kind: 'long', col: '#3d5f9e', jean: true }, shoes: { kind: 'boots', col: '#6b3e26' }, hat: 'hat', hatCol: '#e8c872' },
  ballet:    { top: { kind: 'sweater', col: '#fafafa' }, pants: { kind: 'long', col: '#1c1a22' }, shoes: { kind: 'plain', col: '#f4f4f4' },
               topF: { kind: 'ballet', col: '#f8a5c2', col2: '#ffd1e3' }, shoesF: { kind: 'plain', col: '#f8a5c2' }, legsF: '#ffd1e3', hatF: 'tiara' },
  medieval:  { top: { kind: 'armor', col: '#b8c0cc', col2: '#b02a2a' }, pants: { kind: 'long', col: '#8a929e' }, shoes: { kind: 'boots', col: '#5b6370' }, hat: 'knightHelmet', gloves: '#8a929e',
               topF: { kind: 'royalDress', col: '#2e7d32', col2: '#d4a017', noFur: true }, shoesF: { kind: 'plain', col: '#6b3e26' }, hatF: 'hennin' },
  hero:      { top: { kind: 'hero', col: '#1f4fd1', col2: '#ffd43b' }, pants: { kind: 'long', col: '#1f4fd1', belt: '#d62828' }, shoes: { kind: 'boots', col: '#d62828' }, cape: '#d62828', heroMask: '#d62828' },
  gold:      { top: { kind: 'suit', col: '#d4a017', tie: '#1c1a22' }, pants: { kind: 'long', col: '#d4a017' }, shoes: { kind: 'plain', col: '#f2c200' } },
  royal:     { top: { kind: 'royal', col: '#6a1b9a', col2: '#ffd43b' }, topF: { kind: 'royalDress', col: '#7b1fa2', col2: '#ffd43b' },
               pants: { kind: 'long', col: '#4a148c' }, shoes: { kind: 'plain', col: '#d4a017' }, shoesF: { kind: 'heels', col: '#d4a017' }, hat: 'crown', cape: '#c62828' },
};

const FLOWER_SPOTS = { '5,12': 0, '9,13': 1, '6,15': 1, '10,11': 0, '8,14': 0, '4,14': 1, '6,18': 0, '10,17': 1, '4,18': 1, '9,19': 0, '11,19': 0, '7,17': 1 };

function getSprite(g, eqIn) {
  const eq = Object.assign(defaultEq(g), eqIn || {});
  const key = g + '|' + JSON.stringify(eq);
  let spr = SPRITES.get(key);
  if (!spr) {
    if (SPRITES.size > 400) SPRITES.clear();
    spr = buildSprite(g, eq);
    SPRITES.set(key, spr);
  }
  return spr;
}

function buildSprite(g, eq) {
  const f = g === 'm';
  const px = new Array(GW * GH).fill(null);
  const P = (x, y, c) => { x += OXP; y += OYP; if (x >= 0 && y >= 0 && x < GW && y < GH) px[y * GW + x] = c; };
  const R = (x, y, w, h, c) => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) P(x + i, y + j, c); };
  const pts = (list, c) => list.forEach(([x, y]) => P(x, y, c));

  const def = defaultEq(g);
  const get = (slot, fb) => { const i = eq[slot] && ITEM_BY_ID[eq[slot]]; return i && i.slot === slot ? i : (fb ? ITEM_BY_ID[fb] : null); };
  const outfitI = get('outfit');
  const O = outfitI ? OUTFIT_SPECS[outfitI.kind] : null;
  const skin = (O && O.skin) || get('skin', def.skin).col;
  const hairI = get('hair', def.hair), HC = hairI.kind === 'pompadour' ? '#e0b030' : get('hcol', def.hcol).col;
  const eyeI = get('eyes', def.eyes), mouthI = get('mouth', def.mouth);
  const topI = O ? ((f && O.topF) || O.top) : get('shirt', def.shirt);
  const pantsI = O ? O.pants : get('pants', def.pants);
  const shoesI = O ? ((f && O.shoesF) || O.shoes) : get('shoes', def.shoes);
  const headI = get('head'), glI = get('glasses'), bagI = get('bag');
  const outfitHat = O && ((f && O.hatF) || O.hat);
  const hideHair = !!(O && (O.helmet || (f && O.hatF === 'veil') || (!f && O.hat === 'knightHelmet')));
  const gloves = (O && O.gloves) || skin;
  const HD = shade(HC, 0.72), HL = shade(HC, 1.3);

  // ----- Disfraces que cubren todo el cuerpo -----
  if (outfitI && outfitI.cover) {
    if (outfitI.kind === 'ghost') drawGhost(R, P);
    else drawChicken(R, P);
    return finish(px);
  }

  // ----- Capa trasera -----
  if (!hideHair) hairBack(hairI.kind);
  if (O && O.cape) { R(2, 11, 12, 10, O.cape); R(1, 12, 1, 9, shade(O.cape, 0.8)); R(14, 12, 1, 9, shade(O.cape, 0.8)); }
  if (O && O.back === 'astroPack') { R(1, 11, 1, 6, '#9aa3ad'); R(14, 11, 1, 6, '#9aa3ad'); }
  if (O && f && O.hatF === 'veil') { R(2, 0, 12, 14, '#1c1a22'); }
  if (bagI && bagI.kind === 'pack') { R(1, 12, 1, 4, shade(bagI.col, 0.8)); R(14, 12, 1, 4, shade(bagI.col, 0.8)); }

  // ----- Piernas, pantalón y zapatos -----
  const fullLegCover = topI && ['dress', 'robe', 'royalDress', 'ballet'].includes(topI.kind);
  if (O && O.baleada) { R(5, 18, 3, 3, skin); R(8, 18, 3, 3, skin); }
  else if (!fullLegCover && pantsI) drawPants(pantsI);
  else if (fullLegCover && topI.kind !== 'robe') { const lg = (f && O && O.legsF) || skin; R(5, 19, 2, 2, lg); R(9, 19, 2, 2, lg); }
  drawShoes(shoesI);

  // ----- Torso -----
  if (O && O.baleada) drawBaleada();
  else drawTop(topI);

  // ----- Cabeza -----
  R(3, 1, 10, 10, skin);
  pts([[3, 1], [12, 1], [3, 10], [12, 10]], null);
  P(2, 6, skin); P(13, 6, skin);
  P(8, 7, shade(skin, 0.86));                                     // nariz
  drawFace();
  if (!hideHair) hairFront(hairI.kind);

  // ----- Sombreros -----
  if (outfitHat) drawHat(outfitHat, (O && O.hatCol) || null);
  else if (headI && !hideHair) drawHat(headI.kind, headI.col);

  if (glI) drawGlasses(glI);
  if (bagI && bagI.kind !== 'pack') drawBag(bagI);
  else if (bagI) { R(5, 11, 1, 5, bagI.col); R(10, 11, 1, 5, bagI.col); }
  if (O && O.extra) drawExtra(O.extra);
  if (O && O.helmet) drawHelmet();
  return finish(px);

  // ================= Partes =================
  function hairBack(k) {
    if (k === 'long') R(2, 2, 12, 12, HC);
    else if (k === 'pony') { R(13, 3, 2, 9, HC); R(13, 4, 2, 1, '#f06292'); P(14, 12, HC); }
    else if (k === 'afro') { R(2, -3, 12, 1, HC); R(1, -2, 14, 10, HC); R(2, 8, 12, 1, HC); }
    else if (k === 'curly') { R(2, 0, 12, 10, HC); R(1, 1, 1, 8, HC); R(14, 1, 1, 8, HC); }
    else if (k === 'pigtails') { R(0, 3, 3, 6, HC); R(13, 3, 3, 6, HC); P(2, 4, '#f06292'); P(13, 4, '#f06292'); P(0, 9, HC); P(15, 9, HC); }
    else if (k === 'bun') { R(6, -3, 4, 3, HC); P(6, -3, null); P(9, -3, null); R(6, -1, 4, 1, HD); }
  }
  function cap() { R(3, 0, 10, 4, HC); P(3, 0, null); P(12, 0, null); P(5, 1, HL); P(6, 1, HL); }
  function hairFront(k) {
    switch (k) {
      case 'short': cap(); pts([[3, 4], [4, 4], [11, 4], [12, 4]], HC); break;
      case 'long': cap(); R(2, 3, 2, 10, HC); R(12, 3, 2, 10, HC); P(2, 12, HD); P(13, 12, HD); P(8, 1, HD); break;
      case 'pony': case 'bun': case 'pigtails': cap(); P(3, 4, HC); P(12, 4, HC); break;
      case 'braids':
        cap();
        for (let y = 3; y < 15; y++) { const c = y % 2 ? HD : HC; R(2, y, 2, 1, c); R(12, y, 2, 1, c); }
        R(2, 15, 2, 1, '#f06292'); R(12, 15, 2, 1, '#f06292'); P(2, 16, HC); P(13, 16, HC);
        break;
      case 'afro': R(3, 0, 10, 3, HC); R(3, 3, 1, 3, HC); R(12, 3, 1, 3, HC); P(5, -1, HL); break;
      case 'curly': cap(); R(2, 3, 2, 7, HC); R(12, 3, 2, 7, HC); pts([[2, 4], [13, 6], [2, 8]], HD); break;
      case 'emo': cap(); R(7, 3, 6, 4, HC); R(3, 4, 1, 4, HC); P(12, 7, HC); P(9, 4, HD); break;
      case 'punk': R(6, -4, 4, 6, HC); P(6, -4, null); P(9, -4, null); P(7, -5, HC); P(8, -5, HC); R(3, 1, 3, 2, HD); R(10, 1, 3, 2, HD); P(7, -3, HL); break;
      case 'buzz': R(4, 1, 8, 1, HD); R(3, 2, 10, 1, HD); break;
      case 'bald': P(5, 2, shade(skin, 1.25)); P(6, 2, shade(skin, 1.25)); break;
      case 'pompadour': R(3, -1, 10, 5, HC); P(3, -1, null); P(12, -1, null); R(4, -3, 8, 2, HC); P(4, -3, null); R(11, -2, 2, 2, HC); P(6, -2, HL); P(7, -2, HL); P(5, 0, HL); P(3, 4, null); P(12, 4, HC); break;
      case 'spiky':
        cap(); R(4, -2, 2, 2, HC); R(7, -3, 2, 3, HC); R(10, -2, 2, 2, HC);
        pts([[2, 1], [2, 2], [13, 1], [13, 2], [3, 4], [12, 4]], HC); P(7, -2, HL); P(4, -1, HL);
        break;
    }
  }

  function drawFace() {
    const zombie = O && O.zombie, iris = eyeI.col;
    if (O && O.mask) R(3, 4, 10, 3, '#1c1a22');
    [5, 9].forEach(x => {
      if (zombie) { P(x, 5, '#f4f4f4'); P(x + 1, 5, '#f4f4f4'); P(x, 6, '#d62828'); P(x + 1, 6, '#f4f4f4'); P(x, 7, shade(skin, 0.7)); P(x + 1, 7, shade(skin, 0.7)); return; }
      P(x, 5, iris); P(x + 1, 5, '#ffffff'); P(x, 6, shade(iris, 0.55)); P(x + 1, 6, iris);
      if (O && O.mask) return;
      if (f) { R(x, 4, 2, 1, OUTLINE); P(x === 5 ? 4 : 11, 4, OUTLINE); }
      else R(x, 4, 2, 1, shade(HC, 0.8));
    });
    if (O && O.heroMask) { R(3, 4, 10, 1, O.heroMask); [3, 4, 7, 8, 11, 12].forEach(x => { P(x, 5, O.heroMask); P(x, 6, O.heroMask); }); }
    if (O && O.patch) { R(9, 5, 2, 2, '#1c1a22'); pts([[8, 4], [11, 4], [12, 3]], '#1c1a22'); }
    if (f && !zombie) { P(4, 7, '#f4a3b5'); P(11, 7, '#f4a3b5'); }
    if (zombie) { R(6, 8, 4, 1, '#3a2a2a'); P(7, 9, '#3a2a2a'); pts([[10, 2], [11, 3], [10, 3]], '#6b3a3a'); return; }
    const m = mouthI.kind, dark = f ? '#c2506a' : '#7a2e1a';
    if (m === 'lip') { R(7, 8, 2, 1, mouthI.col); P(6, 8, shade(mouthI.col, 0.8)); P(9, 8, shade(mouthI.col, 0.8)); }
    else if (m === 'teeth') { R(6, 8, 4, 1, '#ffffff'); R(7, 9, 2, 1, '#7a2e1a'); }
    else if (m === 'tongue') { R(7, 8, 2, 1, '#7a2e1a'); R(7, 9, 2, 1, '#f06292'); }
    else if (m === 'mustache') { R(5, 7, 6, 1, HC); R(7, 8, 2, 1, '#7a2e1a'); }
    else if (m === 'beard') { R(3, 6, 1, 4, HC); R(12, 6, 1, 4, HC); R(4, 8, 3, 3, HC); R(9, 8, 3, 3, HC); R(7, 9, 2, 2, HC); R(5, 7, 6, 1, HC); R(7, 8, 2, 1, '#7a2e1a'); }
    else if (m === 'gold') { R(6, 8, 4, 1, '#f2c200'); P(7, 8, '#fff3a0'); R(7, 9, 2, 1, '#7a2e1a'); }
    else R(7, 8, 2, 1, dark);
  }

  // Pinta el torso con el patrón indicado (cintura más angosta en la mujer)
  function torso(colorAt) {
    for (let y = 11; y <= 15; y++) {
      const x0 = f && y >= 14 ? 5 : 4, x1 = f && y >= 14 ? 10 : 11;
      for (let x = x0; x <= x1; x++) P(x, y, colorAt(x, y));
    }
  }
  function arms(colorAt, rows) {
    for (let y = 11; y <= 15; y++) {
      const cloth = y - 11 < rows;
      [2, 3, 12, 13].forEach(x => P(x, y, cloth ? colorAt(x, y) : skin));
    }
    R(2, 16, 2, 1, gloves); R(12, 16, 2, 1, gloves);
  }
  function patColor(t) {
    const c = t.col, c2 = t.col2, c3 = t.col3 || c2;
    return (x, y) => {
      switch (t.pat) {
        case 'hband': return y === 13 ? c2 : c;
        case 'shine': return x === 5 && y >= 12 && y <= 14 ? shade(c, 1.4) : c;
        case 'vstripe': return ((x - 4) >> 1) % 2 ? c2 : c;
        case 'olimpia': return y === 13 ? c2 : y === 14 ? c3 : c;
        case 'check': return (x % 3 === 0 || y % 3 === 0) ? c2 : c;
        case 'flowers': { const s = FLOWER_SPOTS[x + ',' + y]; return s == null ? c : s ? c3 : c2; }
        case 'zigzag': return y === 13 ? c3 : (y === 12 || y === 14) && (x + y) % 2 === 0 ? c2 : c;
        case 'camo': return [c, c2, c3, c, c2][(x * 7 + y * 13) % 5];
        case 'torn': return (x * 5 + y * 3) % 7 === 0 ? skin : (x + y) % 4 === 0 ? shade(c, 0.8) : c;
        default: return c;
      }
    };
  }

  function drawTop(t) {
    const k = t.kind, c = t.col, c2 = t.col2;
    const pc = patColor(t);
    let rows = { tee: 2, jersey: 2, short: 2, dress: 0, royalDress: 1, ballet: 0, overalls: 2 }[k];
    if (rows == null) rows = 5;
    let sleeve = pc;
    if (t.pat === 'blackSleeves') sleeve = () => c2;
    else if (k === 'labcoat') sleeve = () => '#fafafa';
    else if (k === 'stripes') sleeve = (x, y) => (y % 2 ? c2 : c);
    else if (k === 'vstripe' || t.pat === 'vstripe' || t.pat === 'flowers' || t.pat === 'check') sleeve = () => c;
    arms(sleeve, rows);
    if (k === 'stripes') torso((x, y) => (y % 2 ? c2 : c));
    else torso(pc);
    const neck = () => { P(7, 11, skin); P(8, 11, skin); };
    switch (k) {
      case 'tee': neck(); break;
      case 'jersey':
        neck(); pts([[6, 11], [9, 11], [7, 12], [8, 12]], t.pat === 'blackSleeves' ? c2 : c2);
        if (t.pat !== 'blackSleeves') { R(2, 12, 2, 1, t.pat === 'olimpia' ? t.col3 : c2); R(12, 12, 2, 1, c2); }
        P(10, 12, t.crest); if (t.pat === 'vstripe') P(10, 12, t.crest);
        break;
      case 'short':
        neck(); P(6, 11, shade(c, 1.3)); P(9, 11, shade(c, 1.3)); P(8, 13, shade(c, 0.65)); P(8, 15, shade(c, 0.65));
        if (t.pat === 'flowers' || t.pat === 'check') { R(2, 11, 2, 2, pc(2, 11)); R(12, 11, 2, 2, pc(12, 11)); }
        break;
      case 'formal': {
        const col = c === '#fafafa' ? '#e3e3e3' : '#ffffff';
        neck(); P(6, 11, col); P(9, 11, col);
        if (t.tie) { R(7, 11, 2, 1, shade(t.tie, 0.8)); R(7, 12, 2, 3, t.tie); P(7, 15, t.tie); }
        else { P(8, 13, shade(c, 0.7)); P(8, 15, shade(c, 0.7)); }
        R(2, 15, 2, 1, col); R(12, 15, 2, 1, col);
        break;
      }
      case 'sweater':
        neck(); P(6, 11, shade(c, 0.8)); P(9, 11, shade(c, 0.8));
        torsoRow(15, shade(c, 0.8)); R(2, 15, 2, 1, shade(c, 0.8)); R(12, 15, 2, 1, shade(c, 0.8));
        break;
      case 'hoodie':
        R(4, 11, 8, 1, shade(c, 0.75)); neck();
        pts([[6, 12], [6, 13], [9, 12], [9, 13]], '#f4f4f4'); R(5, 14, 6, 1, shade(c, 0.85));
        break;
      case 'dress':
        R(6, 11, 4, 1, skin); torsoRow(14, shade(c, 0.8));
        skirt(t, pc, 20);
        break;
      case 'royalDress':
        if (t.noFur) R(6, 11, 4, 1, skin); else { R(4, 11, 8, 1, '#fafafa'); pts([[5, 11], [9, 11]], '#1c1a22'); }
        for (let y = 12; y <= 15; y++) { P(7, y, c2); P(8, y, c2); }
        skirt(t, () => c, 20); R(2, 20, 12, 1, c2);
        break;
      case 'suit':
        R(6, 11, 4, 1, '#fafafa'); R(7, 11, 2, 1, shade(t.tie, 0.8)); R(7, 12, 2, 3, t.tie); P(7, 15, t.tie);
        P(6, 12, shade(c, 0.6)); P(9, 12, shade(c, 0.6)); P(10, 12, '#fafafa');
        R(2, 15, 2, 1, '#fafafa'); R(12, 15, 2, 1, '#fafafa');
        break;
      case 'labcoat':
        neck();
        for (let y = 11; y <= 15; y++) [4, 5, 10, 11].forEach(x => { if (!(f && y >= 14 && (x === 4 || x === 11))) P(x, y, '#fafafa'); });
        R(4, 16, 2, 3, '#fafafa'); R(10, 16, 2, 3, '#fafafa');
        pts([[6, 12], [6, 13], [7, 14], [8, 14], [9, 13], [9, 12]], '#555a63'); P(8, 15, '#9aa3ad'); P(10, 12, '#2f6fe0');
        break;
      case 'reflect':
        P(7, 11, shade(c, 0.6)); P(8, 11, shade(c, 0.6));
        torsoRow(13, c2); torsoRow(15, c2); R(2, 13, 2, 1, c2); R(12, 13, 2, 1, c2);
        for (let y = 12; y <= 15; y++) if (y !== 13 && y !== 15) P(8, y, shade(c, 0.7));
        break;
      case 'police':
        neck(); P(6, 11, shade(c, 1.3)); P(9, 11, shade(c, 1.3));
        P(10, 12, '#d4a017'); P(5, 12, shade(c, 0.8)); P(13, 11, '#d4a017'); P(2, 11, '#d4a017');
        break;
      case 'camo': neck(); arms(pc, 5); break;
      case 'robe':
        R(4, 16, 8, 5, c); R(3, 19, 10, 2, c); R(4, 20, 8, 1, shade(c, 0.8));
        if (f) R(5, 11, 6, 1, '#fafafa'); else R(7, 11, 2, 1, '#fafafa');
        pts([[8, 12], [7, 13], [8, 13], [9, 13], [8, 14]], '#d4a017');
        break;
      case 'stripes': neck(); break;
      case 'pirate':
        R(7, 11, 2, 2, skin); torsoRow(15, c2); R(2, 15, 2, 1, shade(c, 0.85)); R(12, 15, 2, 1, shade(c, 0.85));
        break;
      case 'astro':
        R(5, 11, 6, 1, '#9aa3ad'); R(6, 12, 4, 2, '#c9ccd2');
        P(6, 12, '#d62828'); P(7, 12, '#2f6fe0'); P(8, 12, '#ffd43b');
        P(12, 12, '#0073cf'); P(13, 12, '#0073cf'); P(12, 13, '#f4f4f4'); P(13, 13, '#f4f4f4'); P(12, 14, '#0073cf'); P(13, 14, '#0073cf');
        break;
      case 'ballet':   // malla y tutú
        R(6, 11, 4, 1, skin); torsoRow(14, shade(c, 0.85));
        for (let x = 1; x <= 14; x++) { P(x, 16, c2); P(x, 17, x % 2 ? c2 : '#ffffff'); }
        for (let x = 2; x <= 13; x++) P(x, 18, shade(c2, 0.9));
        R(5, 18, 2, 1, (O && O.legsF) || skin); R(9, 18, 2, 1, (O && O.legsF) || skin);
        break;
      case 'armor':    // armadura con túnica
        P(7, 11, shade(c, 0.6)); P(8, 11, shade(c, 0.6));
        for (let y = 12; y <= 15; y++) for (let x = 6; x <= 9; x++) P(x, y, c2);
        P(7, 13, '#ffd43b'); P(8, 13, '#ffd43b'); P(7, 12, '#ffd43b'); P(7, 14, '#ffd43b');
        R(2, 11, 2, 1, shade(c, 1.2)); R(12, 11, 2, 1, shade(c, 1.2)); torsoRow(15, shade(c, 0.7));
        break;
      case 'hero':
        neck(); pts([[6, 12], [7, 12], [8, 12], [9, 12], [7, 13], [8, 13]], c2);   // escudo
        P(7, 12, '#d62828'); P(8, 12, '#d62828');
        torsoRow(15, '#d62828'); R(2, 15, 2, 1, '#d62828'); R(12, 15, 2, 1, '#d62828');
        break;
      case 'overalls': // camisa a cuadros con overol de mezclilla
        neck();
        for (let y = 13; y <= 15; y++) { const x0 = f && y >= 14 ? 5 : 5, x1 = f && y >= 14 ? 10 : 10; for (let x = x0; x <= x1; x++) P(x, y, t.bib); }
        P(5, 11, t.bib); P(5, 12, t.bib); P(10, 11, t.bib); P(10, 12, t.bib); P(6, 13, '#d4a017'); P(9, 13, '#d4a017');
        break;
      case 'royal':
        R(4, 11, 8, 1, '#fafafa'); pts([[5, 11], [9, 11]], '#1c1a22');
        for (let y = 12; y <= 15; y++) { P(7, y, c2); P(8, y, c2); }
        R(2, 15, 2, 1, c2); R(12, 15, 2, 1, c2);
        break;
    }
  }
  function torsoRow(y, c) { const x0 = f && y >= 14 ? 5 : 4, x1 = f && y >= 14 ? 10 : 11; for (let x = x0; x <= x1; x++) P(x, y, c); }
  function skirt(t, pc, bottom) {
    R(4, 16, 8, 1, pc(4, 16)); for (let y = 17; y < bottom - 1; y++) for (let x = 3; x <= 12; x++) P(x, y, pc(x, y));
    for (let x = 2; x <= 13; x++) P(x, bottom - 1, shade(t.col, 0.82));
  }

  function drawPants(p) {
    const c = p.col, pc = patColor(p);
    const belt = p.belt || (p.jean ? '#5a3a22' : shade(c, 0.78));
    if (p.kind === 'skirt') {
      R(4, 16, 8, 1, belt); for (let y = 17; y <= 18; y++) for (let x = 3; x <= 12; x++) P(x, y, pc(x, y));
      for (let x = 3; x <= 12; x++) P(x, 18, shade(c, 0.85));
      if (f) { R(5, 19, 2, 2, skin); R(9, 19, 2, 2, skin); } else { R(5, 19, 3, 2, skin); R(8, 19, 3, 2, skin); }
      return;
    }
    R(4, 16, 8, 1, belt); if (p.jean || p.belt) P(7, 16, '#c9ccd2');
    const len = { long: 4, shorts: 2, bermuda: 3, beach: 3 }[p.kind] || 4;
    for (let y = 17; y <= 20; y++) {
      const cloth = y - 17 < len;
      for (let x = 5; x <= 10; x++) P(x, y, cloth ? pc(x, y) : skin);
    }
    if (p.jean) for (let y = 17; y < 17 + len; y++) { P(7, y, shade(c, 0.82)); P(8, y, shade(c, 0.82)); }
    else for (let y = 17; y < 17 + len; y++) P(8, y, shade(c, 0.85));
    if (p.kind === 'shorts') { R(5, 17, 1, 2, p.col2); R(10, 17, 1, 2, p.col2); }
    if (p.kind === 'beach') pts([[6, 17], [9, 18], [5, 19], [10, 17], [7, 19]], p.col2), pts([[9, 17], [6, 19]], p.col3);
    if (p.band) { R(5, 19, 6, 1, p.band); }
    if (p.pat === 'torn') { P(5, 20, null); P(10, 20, null); P(6, 19, skin); }
  }

  function drawShoes(z) {
    const c = z.col, c2 = z.col2 || shade(c, 0.7);
    const both = (fn) => { fn(4); fn(8); };
    switch (z.kind) {
      case 'sneaker': both(x => { R(x, 21, 4, 1, c); R(x, 22, 4, 1, c2); }); P(5, 21, shade(c, 0.8)); P(10, 21, shade(c, 0.8)); break;
      case 'chuck': both(x => { R(x, 21, 4, 1, c); R(x, 22, 4, 1, '#f4f4f4'); }); P(4, 21, '#f4f4f4'); P(11, 21, '#f4f4f4'); break;
      case 'jordan': both(x => { R(x, 21, 4, 1, c); R(x, 22, 4, 1, '#f4f4f4'); }); pts([[6, 21], [9, 21]], '#1c1a22'); pts([[4, 21], [11, 21]], '#f4f4f4'); break;
      case 'crocs': both(x => R(x, 21, 4, 2, c)); pts([[5, 21], [10, 21], [6, 22], [9, 22]], shade(c, 0.7)); break;
      case 'sandals': both(x => { R(x, 21, 4, 1, skin); R(x, 22, 4, 1, c); }); pts([[5, 21], [6, 21], [9, 21], [10, 21]], c); break;
      case 'vans': both(x => { R(x, 21, 4, 1, c); R(x, 22, 4, 1, '#f4f4f4'); }); pts([[5, 21], [10, 21]], '#f4f4f4'); break;
      case 'heels': both(x => R(x, 21, 4, 1, c)); pts([[4, 22], [7, 22], [8, 22], [11, 22]], c); break;
      case 'boots': R(5, 19, 3, 2, c); R(8, 19, 3, 2, c); both(x => R(x, 21, 4, 2, c)); P(6, 19, shade(c, 1.35)); P(9, 19, shade(c, 1.35)); R(4, 22, 4, 1, shade(c, 0.7)); R(8, 22, 4, 1, shade(c, 0.7)); break;
      default: both(x => { R(x, 21, 4, 1, c); R(x, 22, 4, 1, shade(c, 0.7)); }); P(5, 21, shade(c, 1.6)); P(9, 21, shade(c, 1.6));
    }
  }

  function drawHat(k, col) {
    switch (k) {
      case 'cap': case 'capH':
        R(3, -1, 10, 4, col); P(3, -1, null); P(12, -1, null); R(2, 3, 12, 1, shade(col, 0.68)); P(5, 0, shade(col, 1.35));
        if (k === 'capH') { R(3, 1, 10, 1, '#ffffff'); P(8, 0, '#ffffff'); }
        break;
      case 'capBack':
        R(3, -1, 10, 4, col); P(3, -1, null); P(12, -1, null); R(6, 2, 4, 1, shade(col, 0.6)); P(7, -2, col); P(8, -2, col); P(5, 0, shade(col, 1.35));
        break;
      case 'beanie':
        R(3, -2, 10, 5, col); P(3, -2, null); P(12, -2, null); R(3, 2, 10, 2, shade(col, 0.78));
        if (col !== '#1c1a22') R(7, -4, 2, 2, '#ffffff');
        break;
      case 'hat':
        R(0, 2, 16, 2, shade(col, 0.85)); R(4, -2, 8, 4, col); P(4, -2, null); P(11, -2, null); R(4, 1, 8, 1, '#6b3e26');
        break;
      case 'crown':
        R(4, 0, 8, 2, '#f2c200'); pts([[4, -1], [4, -2], [7, -1], [8, -1], [7, -2], [8, -2], [7, -3], [8, -3], [11, -1], [11, -2]], '#f2c200');
        P(6, 0, '#d62828'); P(9, 0, '#2f6fe0'); P(7, 1, shade('#f2c200', 0.75)); P(8, 1, shade('#f2c200', 0.75));
        break;
      case 'fireHelmet':
        R(3, -1, 10, 4, '#c62828'); P(3, -1, null); P(12, -1, null); R(1, 3, 14, 1, '#8f1515'); R(7, 0, 2, 2, '#ffd43b'); P(5, 0, '#e85a5a');
        break;
      case 'policeCap':
        R(2, -2, 12, 2, '#14213d'); R(3, 0, 10, 2, '#14213d'); R(3, 2, 10, 1, '#0b1226'); R(4, 3, 8, 1, '#0b1226'); P(7, -1, '#d4a017'); P(8, -1, '#d4a017');
        break;
      case 'beret':
        R(2, -1, 11, 2, '#3b4a22'); R(3, 1, 10, 1, '#2b361a'); P(13, 0, '#3b4a22'); P(5, 0, '#d4a017');
        break;
      case 'pirateHat':
        R(1, -1, 14, 2, '#1c1a22'); R(3, -3, 10, 2, '#1c1a22'); P(3, -3, null); P(12, -3, null); R(1, 1, 14, 1, '#d4a017');
        P(7, -2, '#fafafa'); P(8, -2, '#fafafa'); P(7, 0, '#fafafa'); P(8, 0, '#fafafa');
        break;
      case 'knightHelmet':
        R(3, -1, 10, 6, '#9aa3ad'); P(3, -1, null); P(12, -1, null); R(3, 4, 1, 4, '#9aa3ad'); R(12, 4, 1, 4, '#9aa3ad');
        R(7, 4, 2, 4, '#9aa3ad'); R(5, 0, 6, 1, '#c9ccd2'); R(7, -3, 2, 2, '#b02a2a'); P(8, -4, '#b02a2a');
        break;
      case 'hennin':
        R(5, -1, 6, 2, '#2e7d32'); R(6, -3, 4, 2, '#2e7d32'); R(7, -5, 2, 2, '#2e7d32'); R(3, 1, 10, 2, '#d4a017');
        P(9, -5, '#fafafa'); P(10, -4, '#fafafa'); P(11, -2, '#fafafa'); P(12, 0, '#fafafa'); P(13, 2, '#fafafa'); P(13, 3, '#fafafa');
        break;
      case 'tiara':
        R(5, 0, 6, 1, '#d9dde3'); P(7, -1, '#d9dde3'); P(8, -1, '#d9dde3'); P(8, -2, '#f8a5c2'); P(5, -1, '#d9dde3'); P(10, -1, '#d9dde3');
        break;
      case 'veil':
        R(3, 0, 10, 3, '#1c1a22'); R(3, 3, 10, 1, '#fafafa'); R(2, 3, 1, 10, '#1c1a22'); R(13, 3, 1, 10, '#1c1a22');
        break;
    }
  }

  function drawGlasses(gl) {
    const c = gl.col, ring = (x) => { R(x - 1, 5, 1, 2, c); R(x + 2, 5, 1, 2, c); R(x, 4, 2, 1, c); R(x, 7, 2, 1, c); };
    switch (gl.kind) {
      case 'round': ring(5); ring(9); break;
      case 'nerd': ring(5); ring(9); R(4, 4, 8, 1, c); P(3, 5, c); P(12, 5, c); break;
      case 'sun': R(4, 5, 4, 2, c); R(8, 5, 4, 2, c); P(5, 5, shade(c, 1.8)); P(9, 5, shade(c, 1.8)); P(3, 5, c); P(12, 5, c); break;
      case 'aviator': R(4, 4, 8, 1, gl.col2); R(4, 5, 3, 2, c); R(9, 5, 3, 2, c); P(5, 7, c); P(10, 7, c); P(4, 5, shade(c, 1.6)); P(9, 5, shade(c, 1.6)); break;
      case 'cat': ring(5); ring(9); P(3, 4, c); P(12, 4, c); P(3, 3, c); P(12, 3, c); break;
      case '3d': R(3, 4, 10, 1, c); R(4, 5, 3, 2, '#e03131'); R(9, 5, 3, 2, '#22b8cf'); R(7, 5, 2, 1, c); P(3, 5, c); P(12, 5, c); break;
      case 'heart': [4, 9].forEach(x => { P(x, 4, c); P(x + 2, 4, c); R(x, 5, 3, 1, c); P(x + 1, 6, c); }); P(7, 5, c); P(8, 5, c); break;
      case 'star': [4, 9].forEach(x => { P(x + 1, 4, c); R(x, 5, 3, 1, c); P(x, 6, c); P(x + 2, 6, c); }); R(7, 5, 2, 1, c); break;
      case 'monocle': R(8, 5, 1, 2, c); R(11, 5, 1, 2, c); R(9, 4, 2, 1, c); R(9, 7, 2, 1, c); pts([[12, 8], [12, 9], [13, 10], [13, 11]], c); break;
      case 'ski': R(2, 5, 12, 2, gl.col2); R(4, 5, 8, 2, c); R(5, 5, 2, 1, '#fff3a0'); break;
      case 'visor': R(3, 5, 10, 2, c); R(4, 5, 3, 1, shade(c, 1.5)); break;
    }
  }

  function drawBag(b) {
    const c = b.col;
    if (b.kind === 'purse') { pts([[5, 11], [6, 12], [7, 13], [8, 14], [9, 15], [10, 16]], shade(c, 0.75)); R(11, 16, 4, 3, c); P(12, 16, '#ffd43b'); R(11, 18, 4, 1, shade(c, 0.75)); }
    else if (b.kind === 'fanny') { R(4, 16, 8, 2, c); R(5, 16, 6, 1, shade(c, 1.5)); P(10, 17, '#c9ccd2'); }
    else if (b.kind === 'market') { P(13, 14, shade(c, 0.7)); P(15, 14, shade(c, 0.7)); R(13, 15, 3, 4, c); P(14, 16, shade(c, 0.7)); P(13, 17, shade(c, 0.7)); P(15, 17, shade(c, 0.7)); P(14, 15, '#2f9e44'); }
  }

  function drawExtra(k) {
    if (k === 'cashTowel') {
      R(11, 11, 3, 2, '#fafafa'); P(12, 13, '#fafafa'); P(13, 13, '#fafafa'); P(13, 14, '#fafafa'); P(12, 11, '#4dabf7');
      R(0, 16, 3, 2, '#69a84f'); P(1, 16, '#3d7a2f'); P(0, 17, '#3d7a2f');
    } else if (k === 'trashBag') {
      P(14, 14, '#2a2a30'); R(13, 15, 3, 4, '#2a2a30'); P(13, 16, '#4a4a55');
    } else if (k === 'moneyBag') {
      P(14, 13, '#8b5a2b'); R(13, 14, 3, 4, '#c9b38a'); R(12, 15, 1, 2, '#c9b38a'); P(14, 15, '#2f9e44'); P(14, 16, '#2f9e44');
    }
  }

  function drawHelmet() {
    for (let y = -3; y <= 12; y++) for (let x = -1; x <= 16; x++) {
      const d = Math.hypot(x - 7.5, y - 5);
      if (d >= 6.6 && d < 7.7) P(x, y, '#d9dde3');
    }
    pts([[3, 0], [2, 1], [2, 2]], '#ffffff'); R(5, 11, 6, 1, '#9aa3ad');
  }

  function drawBaleada() {
    R(1, 14, 1, 2, skin); R(14, 14, 1, 2, skin);                         // manos agarrando la tortilla
    for (let x = 2; x <= 13; x++) P(x, 11, x % 3 === 0 ? '#5a3418' : '#6b3e26');   // frijoles
    for (let x = 2; x <= 13; x++) P(x, 12, x % 4 === 1 ? '#ffd43b' : x % 4 === 3 ? '#7bb661' : '#fffbe6');  // mantequilla, queso
    const rows = [[2, 13], [2, 13], [2, 13], [2, 13], [3, 12], [3, 12], [4, 11], [6, 9]];
    rows.forEach(([a, b], i) => { for (let x = a; x <= b; x++) P(x, 13 + i, (x * 3 + i * 5) % 11 === 0 ? '#d9b46a' : '#f1d9a0'); });
  }

  // ----- Contorno y lienzo -----
  function finish(arr) {
    const c = document.createElement('canvas'); c.width = GW; c.height = GH;
    const x2 = c.getContext('2d');
    for (let y = 0; y < GH; y++) for (let x = 0; x < GW; x++) {
      let col = arr[y * GW + x];
      if (!col) {
        const n = (dx, dy) => { const xx = x + dx, yy = y + dy; return xx >= 0 && yy >= 0 && xx < GW && yy < GH && arr[yy * GW + xx]; };
        if (n(1, 0) || n(-1, 0) || n(0, 1) || n(0, -1)) col = OUTLINE;
      }
      if (col) { x2.fillStyle = col; x2.fillRect(x, y, 1, 1); }
    }
    return c;
  }
}

// Fantasma clásico de sábana: cabeza redonda, brazos cortos y borde ondulado
function drawGhost(R, P) {
  const c = '#f5f7fb', s = '#d5dbe6';
  R(6, -1, 4, 1, c); R(4, 0, 8, 1, c); R(3, 1, 10, 2, c); R(2, 3, 12, 17, c);
  R(1, 10, 1, 4, c); R(14, 10, 1, 4, c); R(0, 11, 1, 2, c); R(15, 11, 1, 2, c);   // brazos
  [2, 3, 6, 7, 10, 11].forEach(x => P(x, 20, c)); [2, 6, 10].forEach(x => P(x, 21, c)); P(13, 20, c);   // borde ondulado
  for (let y = 3; y < 20; y++) P(13, y, s);
  R(4, 1, 2, 1, '#ffffff');
  R(5, 5, 2, 3, '#1c1a22'); R(9, 5, 2, 3, '#1c1a22'); P(5, 5, '#5a5f6b'); P(9, 5, '#5a5f6b');
  R(7, 10, 2, 2, '#1c1a22');
  P(4, 9, '#f4c6d0'); P(11, 9, '#f4c6d0');
}

// Disfraz de pollo completo
function drawChicken(R, P) {
  const y = '#ffd43b', d = '#f2b705', o = '#f08c00';
  R(6, -2, 1, 2, '#d62828'); R(7, -3, 2, 3, '#d62828'); R(9, -2, 1, 2, '#d62828');   // cresta
  R(4, 0, 8, 1, y); R(3, 1, 10, 9, y);
  R(4, 3, 2, 2, '#ffffff'); R(10, 3, 2, 2, '#ffffff'); P(5, 4, '#1c1a22'); P(10, 4, '#1c1a22');
  R(6, 5, 4, 2, o); R(7, 7, 2, 1, o); R(7, 8, 2, 2, '#d62828');                     // pico y barbilla
  R(3, 10, 10, 1, y); R(2, 11, 12, 8, y); R(3, 19, 10, 1, y);
  R(5, 12, 6, 6, '#fff0a0');
  R(0, 12, 2, 5, d); R(14, 12, 2, 5, d); P(1, 17, d); P(14, 17, d);                 // alas
  R(6, 20, 1, 1, o); R(9, 20, 1, 1, o); R(5, 21, 3, 1, o); R(8, 21, 3, 1, o);       // patas
}

// Dibuja un personaje con los pies en (x, y). s = altura de referencia (48 = una casilla)
function drawPerson(c, x, y, s, g, o = {}) {
  const spr = getSprite(g, o.eq), sc = s / 24;
  c.save();
  c.translate(x, y);
  if (o.alpha != null) c.globalAlpha *= o.alpha;
  c.fillStyle = 'rgba(0,0,0,.28)'; c.beginPath(); c.ellipse(0, -sc, 7 * sc, 2 * sc, 0, 0, 7); c.fill();
  if (o.rot) c.rotate(o.rot);
  if (o.squash) c.scale(1 + o.squash * 0.55, 1 - o.squash * 0.88);
  c.imageSmoothingEnabled = false;
  c.drawImage(spr, -11 * sc, -29 * sc, GW * sc, GH * sc);
  c.restore();
}

// Recortes para las vistas previas de la tienda (coordenadas del lienzo del sprite)
const CROPS = {
  full: [0, 0, GW, GH], head: [0, 0, GW, 18], face: [5, 7, 12, 9],
  shoes: [5, 23, 12, 6], pants: [4, 20, 14, 9],
};
const SLOT_CROP = { hair: 'head', hcol: 'head', head: 'head', glasses: 'face', eyes: 'face', mouth: 'face', shoes: 'shoes', pants: 'pants' };
function drawSpriteCrop(c, g, eq, crop, cw, ch) {
  const spr = getSprite(g, eq), [sx, sy, sw, sh] = CROPS[crop] || CROPS.full;
  const sc = Math.min(cw / sw, ch / sh);
  c.imageSmoothingEnabled = false;
  c.drawImage(spr, sx, sy, sw, sh, (cw - sw * sc) / 2, (ch - sh * sc) / 2, sw * sc, sh * sc);
}
