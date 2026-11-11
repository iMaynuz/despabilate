'use strict';
/* Lógica del juego, interfaz (menú, tienda, personalización) y dibujo */

// ---------- Guardado del jugador ----------
try { localStorage.removeItem('desp_dev'); } catch (e) { /* sin almacenamiento */ }
function isOwned(it) { return it.price === 0 || SAVE.owned.includes(it.id); }
let SAVE = load(SAVE_KEY, null) || load('sps_save', null) || {};
SAVE.coins = Math.max(0, SAVE.coins || 0);
SAVE.owned = Array.isArray(SAVE.owned) ? SAVE.owned.filter(id => ITEM_BY_ID[id]) : [];
SAVE.eq = SAVE.eq || {};
// Quita del equipo lo que no exista o no se haya comprado
function sanitizeEq() {
  ['h', 'm'].forEach(g => {
    const d = defaultEq(g), e = Object.assign({}, d, SAVE.eq[g] || {});
    Object.keys(d).forEach(slot => {
      const id = e[slot];
      if (id == null) { if (!OPTIONAL_SLOTS.includes(slot)) e[slot] = d[slot]; return; }
      const it = ITEM_BY_ID[id];
      if (!it || it.slot !== slot || !isOwned(it)) e[slot] = d[slot];
    });
    SAVE.eq[g] = e;
  });
}
sanitizeEq();
const persist = () => store(SAVE_KEY, SAVE);
persist();

// ---------- Estado ----------
let S = 'menu';           // menu | intro | playing | dying | win | champion | levelEnd | lose | end | paused
let prevS = 'menu';
let G = null;
let charSel = load('desp_char', 'h') === 'm' ? 'm' : 'h';
let T0 = 0, shake = 0;
let particles = [], toasts = [];

const THIEF_EQ = { outfit: 'of_thief', skin: 'sk_4', hair: 'hs_short', mouth: 'mo_mustache' };

function newGame() {
  return { lvl: 0, lives: 3, score: 0, times: [], char: charSel, saved: false, reached: 0, runCoins: 0, lvlCoins: 0,
    levelTime: 0, fx: { stop: 0, invis: 0, double: false, cafe: 0, drunk: 0, angel: false }, lanes: [], pickups: [], coins: [],
    blocked: new Set(), sp: null, spT: 10, shoutT: 3, thief: null, thiefT: 99, autoT: 0, lastDir: [0, -1],
    bg: null, p: null, best: START_ROW, invulT: 0, deadT: 0, animT: 0, introT: 0, bonus: null };
}

// ---------- Construcción del nivel ----------
function pickType(L) {
  let r = Math.random();
  for (const t of Object.keys(L.mix)) { if ((r -= L.mix[t]) <= 0) return t; }
  return 'rap';
}
function buildLanes(L) {
  const lanes = [], loop = (COLS + 8) * T;
  let dir = Math.random() < 0.5 ? 1 : -1;
  ROAD_ROWS.forEach(r => {
    dir = -dir;
    const lane = { r, dir, speed: L.speed * rand(0.85, 1.25), veh: [], loop };
    let x = rand(0, 2 * T);
    for (;;) {
      const type = pickType(L), w = TYPES[type].w * T;
      if (x + w > loop - L.gapMin * T) break;
      lane.veh.push(makeVehicle(type, x, dir));
      x += w + (L.gapMin + Math.random() * L.gapRand) * T;
    }
    lanes.push(lane);
  });
  return lanes;
}
// Barandales y canal: solo 3 espacios libres. Árboles y puestos: 3 casillas bloqueadas.
function chooseBlocked(L) {
  const set = new Set(), cols = [...Array(COLS).keys()];
  if (L.blocker === 'rail' || L.blocker === 'canal') {
    const gaps = new Set(L.zebra ? [pick(L.zebra)] : []);
    for (let guard = 0; gaps.size < 3 && guard < 200; guard++) {
      const c = Math.floor(rand(0, COLS));
      if ([...gaps].every(g => Math.abs(g - c) >= 2)) gaps.add(c);
    }
    cols.forEach(c => { if (!gaps.has(c)) set.add(c + ',' + MEDIAN); });
  } else cols.sort(() => Math.random() - 0.5).slice(0, 3).forEach(c => set.add(c + ',' + MEDIAN));
  return set;
}
function resetPlayer() { G.p = { gx: START_COL, gy: START_ROW, tx: START_COL, ty: START_ROW, t: 0, moving: false }; }

function loadLevel(i) {
  const L = LEVELS[i];
  G.lvl = i; G.reached = Math.max(G.reached, i + 1);
  G.levelTime = 0; G.lvlCoins = 0; G.fx = { stop: 0, invis: 0, double: false, cafe: 0, drunk: 0, angel: false };
  G.lanes = buildLanes(L);
  G.blocked = chooseBlocked(L);
  G.bg = makeBg(L, G.blocked);
  G.pickups = []; G.coins = []; G.sp = null; G.spT = rand(L.sirenMin, L.sirenMin + 5); G.shoutT = 2.5;
  G.thief = null; G.thiefT = i === 0 ? Infinity : rand(L.thiefEvery * 0.5, L.thiefEvery);
  const used = new Set(), spots = [...ROAD_ROWS, MEDIAN];
  const free = () => {
    for (let g = 0; g < 400; g++) {
      const r = pick(spots), c = Math.floor(rand(0, COLS)), k = c + ',' + r;
      if (!used.has(k) && !G.blocked.has(k)) { used.add(k); return { c, r }; }
    }
    return { c: 0, r: 3 };
  };
  for (let k = 0; k < 3; k++) {
    let x = Math.random(), type = 'stop';
    for (const t of Object.keys(PICKS)) { if ((x -= PICKS[t].w) <= 0) { type = t; break; } }
    G.pickups.push(Object.assign(free(), { type, got: false }));
  }
  for (let k = 0; k < L.debuffs; k++) G.pickups.push(Object.assign(free(), { type: k % 2 ? 'pachita' : 'cafe', bad: true, got: false }));
  if (Math.random() < ANGEL.chance) G.pickups.push(Object.assign(free(), { type: 'angel', got: false }));   // muy raro
  for (let k = 0; k < COINS_PER_LEVEL(i); k++) G.coins.push(Object.assign(free(), { got: false }));
  G.best = START_ROW; G.invulT = 0; G.deadT = 0; G.animT = 0; G.introT = 0;
  G.startScore = G.score; G.startLives = G.lives;
  resetPlayer();
  particles = []; toasts = [];
}

const OVERLAYS = ['menu', 'worlds', 'scores', 'settings', 'pauseMenu', 'shop', 'custom', 'levelEnd', 'endGame', 'modal'];
function hideOverlays() { OVERLAYS.forEach(id => $(id).classList.add('hidden')); }
function startGame(lvl = 0) { G = newGame(); G.world = 'sps'; loadLevel(lvl); S = 'intro'; hideOverlays(); setAmbience(true); }
function showMenu() {
  G = newGame(); loadLevel(0); S = 'menu';
  hideOverlays(); $('menu').classList.remove('hidden');
  $('menuCoins').textContent = money(SAVE.coins);
  setAmbience(false); drawCards();
}

// ---------- Movimiento ----------
function canStep(nx, ny) { return nx >= 0 && nx < COLS && ny >= GOAL_ROW && ny <= START_ROW && !G.blocked.has(nx + ',' + ny); }
function stepTo(dx, dy) {
  const p = G.p;
  if (p.moving || !canStep(p.gx + dx, p.gy + dy)) return false;
  p.tx = p.gx + dx; p.ty = p.gy + dy; p.t = 0; p.moving = true; G.lastDir = [dx, dy];
  sHop(); return true;
}
function tryMove(dx, dy) {
  if (S !== 'playing') return;
  if (G.fx.drunk > 0) { dx = -dx; dy = -dy; }             // pachita: controles al revés
  stepTo(dx, dy);
}

const KEYS = { ArrowUp: [0, -1], w: [0, -1], W: [0, -1], ArrowDown: [0, 1], s: [0, 1], S: [0, 1],
  ArrowLeft: [-1, 0], a: [-1, 0], A: [-1, 0], ArrowRight: [1, 0], d: [1, 0], D: [1, 0] };
window.addEventListener('keydown', e => {
  if (e.target && e.target.tagName === 'INPUT') return;
  if (KEYS[e.key]) {
    if (S === 'playing') { e.preventDefault(); tryMove(...KEYS[e.key]); }
    else if (S === 'intro' || S === 'dying') e.preventDefault();
    return;
  }
  if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') togglePause();
  else if (e.key === 'm' || e.key === 'M') { muted = !muted; applyMute(); }
});

function togglePause() {
  if (S === 'playing' || S === 'intro') pauseGame();
  else if (S === 'paused') resumeGame();
}
function pauseGame() {
  prevS = S; S = 'paused';
  $('pauseInfo').textContent = `Nivel ${G.lvl + 1}: ${LEVELS[G.lvl].name}`;
  $('pauseMenu').classList.remove('hidden'); $('pResume').focus();
}
function resumeGame() { $('pauseMenu').classList.add('hidden'); S = prevS; }
// Reinicia el nivel actual: devuelve vidas, puntos y lempiras a como estaban al empezarlo
function restartLevel() {
  $('pauseMenu').classList.add('hidden');
  SAVE.coins = Math.max(0, SAVE.coins - G.lvlCoins); G.runCoins -= G.lvlCoins; persist();
  G.score = G.startScore; G.lives = G.startLives;
  loadLevel(G.lvl); S = 'intro';
}
$('pResume').addEventListener('click', resumeGame);
$('pRestart').addEventListener('click', restartLevel);
$('pMenu').addEventListener('click', showMenu);
$('pauseFloat').addEventListener('click', e => { e.currentTarget.blur(); if (S === 'playing' || S === 'intro') pauseGame(); });
document.querySelectorAll('#dpad button').forEach(b => {
  const map = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
  b.addEventListener('pointerdown', e => { e.preventDefault(); tryMove(...map[b.dataset.dir]); });
});
let touch = null;
cv.addEventListener('touchstart', e => { const t = e.changedTouches[0]; touch = { x: t.clientX, y: t.clientY }; }, { passive: true });
cv.addEventListener('touchend', e => {
  if (!touch) return;
  const t = e.changedTouches[0], dx = t.clientX - touch.x, dy = t.clientY - touch.y; touch = null;
  if (Math.abs(dx) < 15 && Math.abs(dy) < 15) tryMove(0, -1);
  else if (Math.abs(dx) > Math.abs(dy)) tryMove(dx > 0 ? 1 : -1, 0);
  else tryMove(0, dy > 0 ? 1 : -1);
}, { passive: true });

// ---------- Menú, mundos, tienda y personalización ----------
function drawCards() {
  document.querySelectorAll('.char').forEach(b => {
    const c = b.querySelector('canvas').getContext('2d');
    c.clearRect(0, 0, 96, 110);
    drawPerson(c, 48, 104, 72, b.dataset.char, { eq: SAVE.eq[b.dataset.char] });
  });
}
function setChar(g) {
  charSel = g; store('desp_char', g);
  document.querySelectorAll('.char').forEach(o => { const on = o.dataset.char === g; o.classList.toggle('selected', on); o.setAttribute('aria-pressed', on); });
  if (G && S === 'menu') G.char = g;
}
document.querySelectorAll('.char').forEach(b => b.addEventListener('click', () => setChar(b.dataset.char)));

function showWorlds() {
  hideOverlays(); $('worlds').classList.remove('hidden');
  const box = $('worldList'); box.textContent = '';
  WORLDS.forEach((w, i) => {
    const b = el('button', 'world' + (w.available ? '' : ' locked'));
    b.disabled = !w.available;
    b.appendChild(el('span', 'wi', w.available ? w.icon : '🔒'));
    const t = el('span', 'wt');
    t.appendChild(el('b', '', `Mundo ${i + 1}: ${w.name}`)); t.appendChild(el('small', '', w.desc));
    b.appendChild(t);
    if (w.available) b.addEventListener('click', () => startGame(0));
    box.appendChild(b);
  });
}
$('btnPlay').addEventListener('click', showWorlds);
$('worldsBack').addEventListener('click', showMenu);
$('btnNext').addEventListener('click', () => { $('levelEnd').classList.add('hidden'); loadLevel(G.lvl + 1); S = 'intro'; });
$('btnAgain').addEventListener('click', () => { saveScore(); startGame(); });
$('btnMenu').addEventListener('click', () => { saveScore(); showMenu(); });

// Vista previa del artículo puesto en el personaje (con acercamiento según la categoría)
const CLOTHES = ['shirt', 'pants', 'shoes'];
function previewEq(slot, id) {
  const eq = Object.assign({}, SAVE.eq[charSel]); eq[slot] = id;
  if (CLOTHES.includes(slot)) eq.outfit = null;
  if (slot === 'pants' && eq.shirt && ITEM_BY_ID[eq.shirt].kind === 'dress') eq.shirt = 'sh_white';
  return eq;
}
function itemCanvas(slot, id) {
  const cvi = document.createElement('canvas'); cvi.width = 72; cvi.height = 84;
  drawSpriteCrop(cvi.getContext('2d'), charSel, previewEq(slot, id), SLOT_CROP[slot] || 'full', 72, 84);
  return cvi;
}
function equip(slot, id) {
  const eq = SAVE.eq[charSel];
  eq[slot] = id;
  if (CLOTHES.includes(slot)) eq.outfit = null;            // la ropa suelta reemplaza al conjunto
  if (slot === 'pants' && ITEM_BY_ID[eq.shirt] && ITEM_BY_ID[eq.shirt].kind === 'dress') eq.shirt = 'sh_white';
  persist(); drawCards();
}
function renderTabs(id, current, cats, cb) {
  const box = $(id); box.textContent = '';
  cats.forEach(([slot, label]) => {
    const t = el('button', 'tab' + (slot === current ? ' sel' : ''), label);
    t.setAttribute('role', 'tab'); t.setAttribute('aria-selected', slot === current);
    t.addEventListener('click', () => cb(slot)); box.appendChild(t);
  });
}

let shopCat = 'outfit', custCat = 'skin', modalCb = null;
function showModal(text, yes, no, onYes) {
  $('modalTxt').textContent = text; $('modalYes').textContent = yes; $('modalNo').textContent = no;
  modalCb = onYes; $('modal').classList.remove('hidden'); $('modalYes').focus();
}
$('modalYes').addEventListener('click', () => { $('modal').classList.add('hidden'); const f = modalCb; modalCb = null; if (f) f(); });
$('modalNo').addEventListener('click', () => { $('modal').classList.add('hidden'); modalCb = null; });

function openShop() { hideOverlays(); $('shop').classList.remove('hidden'); renderShop(); }
function renderShop() {
  $('shopCoins').textContent = money(SAVE.coins);
  renderTabs('shopTabs', shopCat, CATS_SHOP, c => { shopCat = c; renderShop(); });
  const grid = $('shopGrid'); grid.textContent = '';
  ITEMS.filter(i => i.slot === shopCat && i.price > 0).forEach(it => {
    const owned = isOwned(it), d = el('div', 'item' + (owned ? ' owned' : '') + (it.gold ? ' gold' : ''));
    d.appendChild(itemCanvas(it.slot, it.id));
    d.appendChild(el('div', 'nm', (it.gold ? '★ ' : '') + itemName(it, charSel)));
    d.appendChild(el('div', 'pr', '🪙 ' + money(it.price)));
    const btn = el('button', '', owned ? 'Comprado' : SAVE.coins >= it.price ? 'Comprar' : `Faltan ${money(it.price - SAVE.coins)}`);
    btn.disabled = owned || SAVE.coins < it.price;
    btn.addEventListener('click', () => buyItem(it));
    d.appendChild(btn); grid.appendChild(d);
  });
}
function buyItem(it) {
  if (isOwned(it) || SAVE.coins < it.price) return;
  SAVE.coins -= it.price; SAVE.owned.push(it.id); persist(); renderShop(); sPick();
  showModal(`¡Compraste "${itemName(it, charSel)}"! ¿Quieres equiparlo ahora?`, 'Sí, equipar', 'No, gracias', () => { equip(it.slot, it.id); renderShop(); });
}
$('btnShop').addEventListener('click', openShop);
$('shopBack').addEventListener('click', showMenu);

function openCustom() { hideOverlays(); $('custom').classList.remove('hidden'); renderCustom(); }
function renderCustom() {
  const pc = $('custPrev').getContext('2d'); pc.clearRect(0, 0, 160, 210);
  drawPerson(pc, 80, 202, 144, charSel, { eq: SAVE.eq[charSel] });
  $('custH').classList.toggle('sel', charSel === 'h'); $('custM').classList.toggle('sel', charSel === 'm');
  renderTabs('custTabs', custCat, CATS_CUST, c => { custCat = c; renderCustom(); });
  const grid = $('custGrid'); grid.textContent = '';
  const list = ITEMS.filter(i => i.slot === custCat && isOwned(i));
  const opts = OPTIONAL_SLOTS.includes(custCat) ? [{ id: null, slot: custCat, name: 'Ninguno' }, ...list] : list;
  opts.forEach(it => {
    const on = SAVE.eq[charSel][custCat] === it.id, d = el('div', 'item' + (on ? ' equipped' : ''));
    d.appendChild(itemCanvas(custCat, it.id));
    d.appendChild(el('div', 'nm', itemName(it, charSel)));
    const btn = el('button', '', on ? 'Equipado' : 'Equipar'); btn.disabled = on;
    btn.addEventListener('click', () => { equip(custCat, it.id); renderCustom(); });
    d.appendChild(btn); grid.appendChild(d);
  });
  if (list.length <= 1 && custCat !== 'skin') grid.appendChild(el('p', 'empty-note', 'Compra más artículos en la tienda para verlos aquí.'));
}
$('btnCust').addEventListener('click', openCustom);
$('custBack').addEventListener('click', showMenu);
$('custH').addEventListener('click', () => { setChar('h'); renderCustom(); });
$('custM').addEventListener('click', () => { setChar('m'); renderCustom(); });

// ---------- Puntajes por mundo ----------
function loadScores() {
  const a = load('desp_scores', load('sps_scores', []));
  a.forEach(s => { if (!s.world) s.world = 'sps'; });
  return a;
}
function saveScore() {
  if (!G || G.saved || G.score <= 0) return;
  G.saved = true;
  const name = ($('nameIn').value.trim() || 'Jugador').slice(0, 14);
  store('desp_name', name);
  const a = loadScores();
  a.push({ name, score: G.score, lvl: G.reached, char: G.char, world: G.world || 'sps' });
  a.sort((x, y) => y.score - x.score);
  const keep = [];
  WORLDS.forEach(w => keep.push(...a.filter(s => s.world === w.id).slice(0, 10)));
  store('desp_scores', keep);
}
function showScores() {
  hideOverlays(); $('scores').classList.remove('hidden');
  const box = $('scoreBox'); box.textContent = '';
  const a = loadScores();
  WORLDS.forEach((w, i) => {
    const sec = el('section', 'score-world');
    sec.appendChild(el('h3', '', `${w.available ? w.icon : '🔒'} Mundo ${i + 1}: ${w.name}`));
    const list = a.filter(s => s.world === w.id).slice(0, 5);
    if (!w.available) sec.appendChild(el('p', 'empty-note', 'Próximamente'));
    else if (!list.length) sec.appendChild(el('p', 'empty-note', 'Aún no hay puntajes'));
    else {
      const ol = el('ol', 'scorelist');
      list.forEach(s => {
        const li = el('li');
        li.appendChild(el('span', 'sn', s.name));
        li.appendChild(el('span', 'sl', `Nivel ${s.lvl}`));
        li.appendChild(el('b', '', String(s.score)));
        ol.appendChild(li);
      });
      sec.appendChild(ol);
    }
    box.appendChild(sec);
  });
}
$('btnScores').addEventListener('click', showScores);
$('scoresBack').addEventListener('click', showMenu);

// ---------- Configuración: sonido, controles, cómo jugar y créditos ----------
function paintRange(el) { el.style.setProperty('--p', el.value + '%'); }
function showSection(id) {
  document.querySelectorAll('.seg-btn').forEach(b => { const on = b.dataset.sec === id; b.classList.toggle('sel', on); b.setAttribute('aria-selected', on); });
  document.querySelectorAll('#settings .sec').forEach(s => s.classList.toggle('hidden', s.id !== id));
}
function showSettings() {
  hideOverlays(); $('settings').classList.remove('hidden');
  $('volSfx').value = Math.round(SETTINGS.sfx * 100); $('volMusic').value = Math.round(SETTINGS.music * 100);
  ['volSfx', 'volMusic'].forEach(id => { paintRange($(id)); $(id + 'Val').textContent = $(id).value + '%'; });
  $('muteSwitch').setAttribute('aria-checked', String(!muted));
  $('gameVersion').textContent = `Versión ${GAME_VERSION}`;
  $('aiModel').textContent = AI_CREDIT;
}
document.querySelectorAll('.seg-btn').forEach(b => b.addEventListener('click', () => showSection(b.dataset.sec)));
$('btnSettings').addEventListener('click', () => { showSettings(); showSection('secSound'); });
$('settingsBack').addEventListener('click', showMenu);
[['volSfx', 'sfx'], ['volMusic', 'music']].forEach(([id, kind]) => {
  $(id).addEventListener('input', e => { initAudio(); setVolume(kind, e.target.value / 100); paintRange(e.target); $(id + 'Val').textContent = e.target.value + '%'; if (kind === 'sfx') sCoin(); });
});
$('muteSwitch').addEventListener('click', () => { initAudio(); muted = !muted; applyMute(); });

document.querySelectorAll('[data-mute]').forEach(b => b.addEventListener('click', () => { initAudio(); muted = !muted; applyMute(); b.blur(); }));

// ---------- Lógica ----------
function burst(x, y, n, colors, spd = 140, g = 300) {
  for (let i = 0; i < n; i++) {
    const a = rand(0, Math.PI * 2), s = rand(spd * .3, spd);
    particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 40, g, life: rand(.5, 1), color: pick(colors), size: rand(3, 6), rot: 0 });
  }
}
function toast(text, color = '#fff', big = false) { toasts.push({ text, color, big, t: 0, life: big ? 1.6 : 1.2 }); }

function playerPos() {
  const p = G.p, k = p.moving ? p.t : 0;
  return { x: lerp(p.gx, p.tx, k) * T, y: OY + lerp(p.gy, p.ty, k) * T, hop: p.moving ? Math.sin(Math.PI * k) * 10 : 0 };
}

function onArrive() {
  const p = G.p;
  if (p.gy < G.best) { G.best = p.gy; G.score += 10; }
  for (const pk of G.pickups) if (!pk.got && pk.c === p.gx && pk.r === p.gy) { pk.got = true; applyPickup(pk); }
  for (const co of G.coins) if (!co.got && co.c === p.gx && co.r === p.gy) {
    co.got = true; G.lvlCoins++; G.runCoins++; SAVE.coins++; persist(); sCoin();
    burst(co.c * T + T / 2, OY + co.r * T + T / 2, 8, ['#ffd43b', '#fff6c9'], 90, 0);
    toast('+L 1', '#ffd43b');
  }
  if (p.gy === GOAL_ROW) winLevel();
}

function applyPickup(pk) {
  const cx = pk.c * T + T / 2, cy = OY + pk.r * T + T / 2;
  if (pk.bad) {
    const d = DEBUFFS[pk.type];
    if (pk.type === 'cafe') { G.fx.cafe = FX_TIME; G.autoT = 0; sGurgle(); }
    else { G.fx.drunk = FX_TIME; sHic(); }
    toast(d.name, '#ff9f43'); toast(d.sub, '#fff');
    burst(cx, cy, 12, [d.color, '#fff'], 100, 0);
    return;
  }
  if (pk.type === 'angel') {   // protege el resto del nivel
    G.fx.angel = true; sChampion(); G.score += 100;
    toast(ANGEL.name, '#fff3b0', true); toast('Nada te toca en este nivel', '#fff');
    burst(cx, cy, 24, ['#fff3b0', '#ffffff', '#ffd43b'], 160, 0);
    return;
  }
  sPick(); G.score += 50;
  if (pk.type === 'life') G.lives = Math.min(MAX_LIVES, G.lives + 1);
  else if (pk.type === 'stop') { G.fx.stop = FX_TIME; G.fx.invis = 0; }     // un poder reemplaza al otro
  else if (pk.type === 'invis') { G.fx.invis = FX_TIME; G.fx.stop = 0; }
  else G.fx.double = true;                                                  // vida y x2 son independientes
  toast(PICKS[pk.type].name, PICKS[pk.type].color);
  burst(cx, cy, 14, [PICKS[pk.type].color, '#fff'], 120, 0);
}

function winLevel() {
  G.animT = 0;
  const base = 500, timeBonus = Math.max(0, 60 - Math.floor(G.levelTime)) * 10, mult = G.fx.double ? 2 : 1;
  const total = (base + timeBonus) * mult, coinBonus = COIN_BONUS(G.lvl);
  G.score += total; G.runCoins += coinBonus; SAVE.coins += coinBonus; persist();
  G.times[G.lvl] = G.levelTime;
  const best = load('desp_best', []);
  const record = best[G.lvl] == null || G.levelTime < best[G.lvl];
  if (record) { best[G.lvl] = G.levelTime; store('desp_best', best); }
  G.bonus = { base, timeBonus, mult, total, record, best: best[G.lvl], coinBonus };
  if (G.lvl >= LEVELS_N - 1) { S = 'champion'; sChampion(); speak(LINES.champion(G.char), { rate: 1.15, pitch: 0.7 }); }
  else { S = 'win'; sWin(); speak(LINES.levelWin, { rate: 1.2, pitch: 0.6 }); }
}

function loseLife() {
  G.lives--; S = 'dying'; G.deadT = 0; shake = 0.4; sHit();
  G.fx.cafe = 0; G.fx.drunk = 0;
  const p = playerPos(); burst(p.x + T / 2, p.y + T / 2, 18, ['#ff6b6b', '#ffd43b', '#fff'], 180, 400);
  if (G.lives > 0) speak(LINES.lifeLost, { rate: 1.2, pitch: 0.55 });
}
function respawn() { resetPlayer(); G.invulT = 2; S = 'playing'; }
function beginLose() { S = 'lose'; G.animT = 0; sLose(); speak(LINES.gameOver, { rate: 1.1, pitch: 0.5 }); }

function moveVehicles(dt) {
  if (G.fx.stop > 0 && S !== 'menu') return;
  G.lanes.forEach(l => l.veh.forEach(v => { v.x = (v.x + l.dir * l.speed * T * dt + l.loop) % l.loop; }));
  const s = G.sp;
  if (s && s.warn <= 0) {
    s.x += s.dir * s.speed * T * dt;
    if ((s.dir > 0 && s.x > W + 30) || (s.dir < 0 && s.x < -s.w - 30)) { G.sp = null; const L = LEVELS[G.lvl]; G.spT = rand(L.sirenMin, L.sirenMin + 6); }
  }
}
function updateSpecial(dt) {
  if (G.fx.stop > 0) return;
  const s = G.sp;
  if (!s) {
    G.spT -= dt;
    if (G.spT <= 0) {   // vehículo sorpresa: ambulancia, bomberos o policía
      const type = pick(['amb', 'fire', 'pol']), dir = Math.random() < 0.5 ? 1 : -1, w = TYPES[type].w * T;
      G.sp = { type, w, h: TYPES[type].h, dir, r: pick(ROAD_ROWS), x: dir > 0 ? -w - 10 : W + 10, speed: 6.5 + G.lvl * 0.4, warn: 1.4, color: '#fff', label: '' };
      sSiren();
    }
  } else if (s.warn > 0) s.warn -= dt;
}

// Ayudantes de bus que gritan
function updateShout(dt) {
  G.lanes.forEach(l => l.veh.forEach(v => { if (v.shout > 0) v.shout -= dt; }));
  G.shoutT -= dt;
  if (G.shoutT > 0) return;
  G.shoutT = rand(5, 9);
  const cands = [];
  G.lanes.forEach(l => l.veh.forEach(v => {
    const sx = v.x - 4 * T;
    if ((v.type === 'bus' || v.type === 'esc' || v.type === 'mic') && sx > 10 && sx + v.w < W - 10) cands.push(v);
  }));
  if (cands.length) { const v = pick(cands); v.word = pick(SHOUTS); v.shout = 2.4; speak(`¡${v.word}!`, { rate: rand(1.2, 1.4), pitch: rand(0.45, 0.7), repeat: 3 }); }
}

// Ladrón en la mediana: roba las lempiras del nivel; si no tienes, se lleva un Pollo Chuco
function updateThief(dt) {
  const th = G.thief;
  if (!th) {
    G.thiefT -= dt;
    if (G.thiefT <= 0) spawnThief();
    return;
  }
  th.t += dt;
  if (th.state === 'flee') {
    th.x += th.dir * 7 * T * dt;
    if (th.x < -T * 2 || th.x > W + T) { G.thief = null; G.thiefT = rand(LEVELS[G.lvl].thiefEvery * 0.7, LEVELS[G.lvl].thiefEvery); }
    return;
  }
  th.life -= dt;
  if (th.life <= 0) { th.state = 'flee'; th.dir = th.x < W / 2 ? -1 : 1; return; }
  if (th.moving) {
    th.k += dt / 0.35;
    if (th.k >= 1) { th.c = th.tc; th.k = 0; th.moving = false; th.wait = rand(0.15, 0.5); }
  } else if ((th.wait -= dt) <= 0) {
    const ok = c => c >= 0 && c < COLS && !G.blocked.has(c + ',' + MEDIAN);
    if (!ok(th.c + th.dir)) th.dir = -th.dir;
    if (ok(th.c + th.dir)) { th.tc = th.c + th.dir; th.moving = true; } else th.wait = 0.5;
  }
  th.x = lerp(th.c, th.moving ? th.tc : th.c, th.moving ? th.k : 0) * T;
  if (S !== 'playing' || G.fx.invis > 0 || G.fx.angel || G.invulT > 0 || th.t < 0.6) return;
  const p = playerPos();
  if (Math.abs(p.y - (OY + MEDIAN * T)) < T * 0.5 && Math.abs(p.x - th.x) < T * 0.6) rob();
}
function spawnThief() {
  const free = [];
  for (let c = 0; c < COLS; c++) if (!G.blocked.has(c + ',' + MEDIAN) && Math.abs(c - G.p.gx) >= 2) free.push(c);
  if (!free.length) { G.thiefT = 3; return; }
  const c = pick(free);
  G.thief = { c, tc: c, k: 0, x: c * T, moving: false, wait: 0.6, dir: Math.random() < 0.5 ? 1 : -1, t: 0, life: rand(6, 9), state: 'walk' };
  sWhistle(); toast('¡Cuidado, un ladrón!', '#ff9f43');
  speak(THIEF_LINES[0], { rate: 1.3, pitch: 0.5 });
}
function rob() {
  const th = G.thief, p = playerPos();
  th.state = 'flee'; th.dir = th.x < p.x ? -1 : 1;
  sSteal(); speak(THIEF_LINES[1], { rate: 1.3, pitch: 0.5 });
  if (G.lvlCoins > 0) {
    const n = G.lvlCoins;
    G.lvlCoins = 0; G.runCoins -= n; SAVE.coins = Math.max(0, SAVE.coins - n); persist();
    toast(`¡Te robó ${money(n)}!`, '#ff6b6b', true); shake = 0.3; G.invulT = 1;
  } else {
    toast('¡Te robó un Pollo Chuco!', '#ff6b6b', true);
    loseLife();
  }
}

function collides() {
  const p = playerPos();
  const px = p.x + T * 0.22, py = p.y + T * 0.22, pw = T * 0.56, ph = T * 0.56;
  const test = (v, sx, rowY) => {
    const vx = sx + 3, vw = v.w - 6, vy = rowY + T / 2 - v.h / 2 + 4, vh = v.h - 6;
    return px < vx + vw && px + pw > vx && py < vy + vh && py + ph > vy;
  };
  for (const l of G.lanes) {
    const rowY = OY + l.r * T;
    if (Math.abs(rowY - p.y) >= T) continue;
    for (const v of l.veh) if (test(v, v.x - 4 * T, rowY)) return true;
  }
  const s = G.sp;
  if (s && s.warn <= 0) { const rowY = OY + s.r * T; if (Math.abs(rowY - p.y) < T && test(s, s.x, rowY)) return true; }
  return false;
}

function update(dt) {
  T0 += dt;
  if (S === 'paused') return;
  if (G) moveVehicles(dt);
  if (shake > 0) shake -= dt;
  particles.forEach(q => { q.x += q.vx * dt; q.y += q.vy * dt; q.vy += q.g * dt; q.life -= dt; q.rot += dt * 8; });
  particles = particles.filter(q => q.life > 0 && q.y < H + 20 && q.y > -40);
  toasts.forEach(t => { t.t += dt; }); toasts = toasts.filter(t => t.t < t.life);
  if (S === 'menu' || !G) return;
  if (S !== 'end' && S !== 'levelEnd') cityTick(dt);

  if (S === 'intro') { G.introT += dt; if (G.introT > 1.8) S = 'playing'; }
  else if (S === 'playing') {
    G.levelTime += dt;
    ['stop', 'invis', 'cafe', 'drunk'].forEach(k => { G.fx[k] = Math.max(0, G.fx[k] - dt); });
    G.invulT = Math.max(0, G.invulT - dt);
    updateSpecial(dt); updateShout(dt); updateThief(dt);
    const p = G.p;
    if (p.moving) {
      p.t += dt / (G.fx.cafe > 0 ? HOP * 0.55 : HOP);
      if (p.t >= 1) { p.moving = false; p.gx = p.tx; p.gy = p.ty; p.t = 0; onArrive(); }
    }
    if (S === 'playing' && G.fx.invis <= 0 && !G.fx.angel && G.invulT <= 0 && collides()) { toast(LINES.lifeLost, '#ff6b6b', true); loseLife(); }
    if (S === 'playing' && G.fx.cafe > 0 && Math.random() < 0.5) {   // nubecitas de la diarrea
      const pp = playerPos();
      particles.push({ x: pp.x + T / 2 + rand(-8, 8), y: pp.y + T - 18, vx: rand(-25, 25), vy: rand(-20, -5), g: -10, life: 0.7, color: pick(['#9bbf4a', '#7a5a2a', '#b5c96a']), size: rand(5, 9), rot: 0, puff: true });
    }
  }
  else if (S === 'dying') {
    if (G.thief && G.thief.state === 'flee') updateThief(dt);
    G.deadT += dt; if (G.deadT > 1.1) { G.lives <= 0 ? beginLose() : respawn(); }
  }
  else if (S === 'win' || S === 'champion') {
    G.animT += dt;
    if (Math.random() < (S === 'champion' ? 1 : 0.7)) particles.push({ x: rand(0, W), y: -10, vx: rand(-30, 30), vy: rand(80, 200), g: 20, life: 4,
      color: pick(['#0073cf', '#fff', '#ffd43b', '#ff4d6d', '#69db7c']), size: rand(4, 8), rot: 0, conf: true });
    if (S === 'win' && G.animT > 3.2) showLevelEnd();
    if (S === 'champion' && G.animT > 4) showEnd(true);
  }
  else if (S === 'lose') { G.animT += dt; if (G.animT > 3.4) showEnd(false); }
}

function addLine(parent, a, b, cls) {
  const d = el('div', 'line' + (cls ? ' ' + cls : ''));
  d.append(el('span', '', a), el('span', '', b)); parent.appendChild(d);
}
function showLevelEnd() {
  S = 'levelEnd';
  $('leTitle').textContent = LINES.levelWin;
  const b = G.bonus, info = $('leInfo'); info.textContent = '';
  addLine(info, `Nivel ${G.lvl + 1}`, LEVELS[G.lvl].name);
  addLine(info, 'Tiempo del nivel', fmt(G.times[G.lvl]));
  addLine(info, 'Bonus por cruzar', '+' + b.base);
  addLine(info, 'Bonus por rapidez', '+' + b.timeBonus);
  if (b.mult > 1) addLine(info, 'Premio x2 activo', 'x2', 'good');
  if (b.record) addLine(info, 'Nuevo récord de tiempo', 'Sí', 'good'); else addLine(info, 'Mejor tiempo', fmt(b.best));
  addLine(info, 'Puntos del nivel', '+' + b.total, 'total');
  addLine(info, 'Puntaje total', String(G.score), 'total');
  addLine(info, 'Lempiras del nivel', `${money(G.lvlCoins)} + ${money(b.coinBonus)} de bono`);
  addLine(info, 'Tus lempiras', money(SAVE.coins));
  // Imagen del lugar principal del nivel que acabas de superar
  const ic = LEVELS[G.lvl].icon, img = $('leImg'), ix = img.getContext('2d');
  img.width = 300; img.height = Math.round(300 * (2 * T) / ic.w); if (img.height > 140) { img.height = 140; img.width = Math.round(140 * ic.w / (2 * T)); }
  ix.drawImage(G.bg, ic.x, OY, ic.w, 2 * T, 0, 0, img.width, img.height);
  $('leImgLabel').textContent = ic.label === LEVELS[G.lvl].name ? ic.label : `${LEVELS[G.lvl].name} · ${ic.label}`;
  $('btnNext').textContent = `Nivel ${G.lvl + 2}: ${LEVELS[G.lvl + 1].name}`;
  $('levelEnd').classList.remove('hidden'); $('btnNext').focus();
}
function showEnd(won) {
  S = 'end'; setAmbience(false);
  $('egTitle').textContent = won ? `🏆 ${LINES.champion(G.char)}` : `💀 ${LINES.gameOver}`;
  const info = $('egInfo'); info.textContent = '';
  addLine(info, 'Nivel alcanzado', `${G.reached} de ${LEVELS_N}`);
  G.times.forEach((t, i) => { if (t != null) addLine(info, `Tiempo nivel ${i + 1}`, fmt(t)); });
  const sum = G.times.reduce((a, t) => a + (t || 0), 0);
  if (G.times.length) addLine(info, 'Tiempo total', fmt(sum));
  addLine(info, 'Lempiras ganadas', money(Math.max(0, G.runCoins)));
  addLine(info, 'Puntaje final', String(G.score), 'total');
  $('nameIn').value = load('desp_name', load('sps_name', ''));
  $('endGame').classList.remove('hidden'); $('nameIn').focus();
}

// ---------- Íconos en pixel art ----------
const ICON_CAFE = ['....R...', '....R...', '.WWWWWW.', 'WWWWWWWW', '.CCCCCC.', '.CDCCCC.', '..CCCC..', '..CCCC..'];
const ICON_PACHITA = ['..KK..', '..KK..', '.GGGG.', 'GGGGGG', 'GLLLLG', 'GLRRLG', 'GLLLLG', 'GGGGGG', 'GGGGGG'];
const ICON_SKULL = ['..XXXXXXX..', '.XXXXXXXXX.', 'XXXXXXXXXXX', 'XXXXXXXXXXX', 'XX..XXX..XX', 'XX..XXX..XX', 'XXXXX.XXXXX', '.XXXX.XXXX.', '..XXXXXXX..', '..X.X.X.X..', '..XXXXXXX..'];
const ICON_TROPHY = ['..YYYYYYYYY..', 'YYYHYYYYYYYYY', 'Y.YHYYYYYYY.Y', 'Y.YHYYYYYYY.Y', '.YYHYYYYYYYY.', '..YYYYYYYYY..', '...YYYYYYY...', '.....YYY.....', '.....YYY.....', '....YYYYY....', '...BBBBBBB...', '...BGGGGGB...', '...BBBBBBB...'];
const PAL_CAFE = { R: '#d62828', W: '#fff6e0', C: '#8b5a2b', D: '#6b3e26' };
const PAL_PACHITA = { K: '#1c1a22', G: '#4f8a3a', L: '#f1e6c8', R: '#d62828' };
const PAL_SKULL = { X: '#f2efe6' };
const PAL_TROPHY = { Y: '#f2c200', H: '#fff3a0', B: '#6b3e26', G: '#d4a017' };

// ---------- Dibujo ----------
function drawCoin(cx, cy, spin) {
  const sc = Math.abs(Math.cos(spin)) * 0.8 + 0.2;
  ctx.save(); ctx.translate(cx, cy); ctx.scale(sc, 1);
  ctx.fillStyle = '#e0a800'; ctx.beginPath(); ctx.arc(0, 0, 11, 0, 7); ctx.fill();
  ctx.fillStyle = '#ffd43b'; ctx.beginPath(); ctx.arc(0, 0, 9, 0, 7); ctx.fill();
  ctx.fillStyle = '#a87400'; ctx.font = 'bold 12px "Trebuchet MS", sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('L', 0, 1);
  ctx.restore();
}
function drawIcon(img, cx, cy, s) {
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(img, cx - img.width * s / 2, cy - img.height * s / 2, img.width * s, img.height * s);
}

function draw() {
  ctx.clearRect(0, 0, W, H);
  ctx.save();
  if (shake > 0) ctx.translate(rand(-4, 4), rand(-4, 4));
  if (G.fx.drunk > 0 && S === 'playing') { ctx.translate(W / 2, H / 2); ctx.rotate(Math.sin(T0 * 3) * 0.025); ctx.translate(-W / 2, -H / 2); }
  ctx.drawImage(G.bg, 0, 0);

  G.coins.forEach(co => {
    if (co.got) return;
    const cx = co.c * T + T / 2, cy = OY + co.r * T + T / 2 + Math.sin(T0 * 4 + co.c + co.r) * 2;
    ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.beginPath(); ctx.ellipse(cx, OY + co.r * T + T - 8, 9, 3, 0, 0, 7); ctx.fill();
    drawCoin(cx, cy, T0 * 4 + co.c);
  });
  G.pickups.forEach(pk => {
    if (pk.got) return;
    const cx = pk.c * T + T / 2, cy = OY + pk.r * T + T / 2 + Math.sin(T0 * 4 + pk.c) * 2;
    ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.ellipse(cx, OY + pk.r * T + T - 8, 11, 4, 0, 0, 7); ctx.fill();
    if (pk.type === 'angel') {
      ctx.fillStyle = 'rgba(255,243,176,' + (0.35 + 0.25 * Math.sin(T0 * 6)) + ')'; ctx.beginPath(); ctx.arc(cx, cy, 20, 0, 7); ctx.fill();
      ctx.fillStyle = '#fff3b0'; ctx.beginPath(); ctx.arc(cx, cy, 14, 0, 7); ctx.fill(); ctx.strokeStyle = '#ffd43b'; ctx.lineWidth = 2.5; ctx.stroke();
      ctx.font = '17px "Segoe UI Emoji", sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(ANGEL.icon, cx, cy + 1);
      return;
    }
    if (pk.bad) {
      ctx.fillStyle = '#fff3e0'; ctx.beginPath(); ctx.arc(cx, cy, 14, 0, 7); ctx.fill();
      ctx.strokeStyle = '#d62828'; ctx.lineWidth = 2.5; ctx.setLineDash([4, 3]); ctx.stroke(); ctx.setLineDash([]);
      drawIcon(pk.type === 'cafe' ? pixmap('cafe', ICON_CAFE, PAL_CAFE) : pixmap('pachita', ICON_PACHITA, PAL_PACHITA), cx, cy, 2);
      return;
    }
    ctx.fillStyle = PICKS[pk.type].color; ctx.beginPath(); ctx.arc(cx, cy, 14, 0, 7); ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2.5; ctx.stroke();
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#10294d';
    ctx.font = pk.type === 'double' ? 'bold 14px "Trebuchet MS", sans-serif' : '16px "Segoe UI Emoji", sans-serif';
    ctx.fillText(PICKS[pk.type].icon, cx, cy + 1);
  });

  // Ladrón
  const th = G.thief;
  if (th && S !== 'menu') {
    const bob = th.moving ? Math.abs(Math.sin(th.k * Math.PI)) * 4 : 0;
    drawPerson(ctx, th.x + T / 2, OY + MEDIAN * T + T - 4 - bob, T, 'h', { eq: THIEF_EQ, alpha: th.state === 'walk' ? Math.min(1, th.t / 0.4) : 1 });
    if (th.state === 'walk' && th.t < 1.2 && Math.floor(T0 * 8) % 2) {
      ctx.fillStyle = '#d62828'; rr(ctx, th.x + T / 2 - 9, OY + MEDIAN * T - 34, 18, 18, 5);
      ctx.fillStyle = '#fff'; ctx.font = 'bold 14px "Trebuchet MS", sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('!', th.x + T / 2, OY + MEDIAN * T - 25);
    }
  }

  G.lanes.forEach(l => l.veh.forEach(v => {
    const sx = v.x - 4 * T;
    if (sx > W + 5 || sx + v.w < -5) return;
    drawVeh(ctx, v, sx, OY + l.r * T);
  }));
  G.lanes.forEach(l => l.veh.forEach(v => { if (v.shout > 0) drawShout(v, v.x - 4 * T, OY + l.r * T); }));

  const s = G.sp;
  if (s && S !== 'menu') {
    const rowY = OY + s.r * T;
    if (s.warn > 0) {
      if (Math.floor(T0 * 8) % 2) {
        const ax = s.dir > 0 ? 4 : W - 44;
        ctx.fillStyle = '#d62828'; rr(ctx, ax, rowY + 6, 40, T - 12, 6);
        ctx.fillStyle = '#fff'; ctx.font = 'bold 22px "Trebuchet MS", sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(s.dir > 0 ? '!▶' : '◀!', ax + 20, rowY + T / 2 + 1);
      }
    } else drawVeh(ctx, s, s.x, rowY);
  }

  if (S !== 'menu') drawPlayer();

  particles.forEach(q => {
    ctx.globalAlpha = Math.max(0, Math.min(1, q.life / 0.4)) * (q.puff ? 0.7 : 1);
    ctx.fillStyle = q.color;
    if (q.conf) { ctx.save(); ctx.translate(q.x, q.y); ctx.rotate(q.rot); ctx.fillRect(-q.size / 2, -q.size / 4, q.size, q.size / 2); ctx.restore(); }
    else if (q.puff) { ctx.beginPath(); ctx.arc(q.x, q.y, q.size * (1.4 - q.life), 0, 7); ctx.fill(); }
    else ctx.fillRect(q.x - q.size / 2, q.y - q.size / 2, q.size, q.size);
  });
  ctx.globalAlpha = 1;

  if (G.fx.stop > 0 && S !== 'menu') { ctx.fillStyle = 'rgba(80,160,255,.16)'; ctx.fillRect(0, OY, W, H - OY); }
  if (G.fx.drunk > 0 && S === 'playing') { ctx.fillStyle = 'rgba(120,200,80,.12)'; ctx.fillRect(0, OY, W, H - OY); }
  ctx.restore();

  drawToasts();
  if (S !== 'menu') hud();
  overlays();
}

function drawPlayer() {
  const p = playerPos();
  let fx = p.x + T / 2, fy = p.y + T - 6 - p.hop;
  const o = { eq: SAVE.eq[G.char] };
  if (S === 'dying') { o.squash = Math.min(1, G.deadT * 5); o.alpha = G.deadT > 0.8 ? 1 - (G.deadT - 0.8) / 0.3 : 1; }
  else if (S === 'lose') o.squash = 1;
  else {
    if (G.fx.invis > 0) o.alpha = 0.35;
    if (G.invulT > 0 && Math.floor(T0 * 14) % 2) o.alpha = 0.35;
    if (G.fx.cafe > 0) fx += rand(-1.5, 1.5);
    if (G.fx.drunk > 0) o.rot = Math.sin(T0 * 7) * 0.25;
  }
  const jy = (S === 'win' || S === 'champion') ? Math.abs(Math.sin(G.animT * 8)) * 22 : 0;
  const headY = fy - jy - 62;
  const angel = G.fx.angel && S !== 'dying' && S !== 'lose';
  if (angel) {   // alas detrás del personaje
    const flap = Math.sin(T0 * 10) * 4;
    ctx.fillStyle = 'rgba(255,255,255,.92)'; ctx.strokeStyle = '#d9dde3'; ctx.lineWidth = 1.5;
    [-1, 1].forEach(sd => { ctx.beginPath(); ctx.ellipse(fx + sd * 17, fy - jy - 30 - flap * 0.3, 11, 7 + flap * 0.5, sd * -0.6, 0, 7); ctx.fill(); ctx.stroke(); });
  }
  drawPerson(ctx, fx, fy - jy, T, G.char, o);
  if (angel) { ctx.strokeStyle = '#ffd43b'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(fx, headY + 2 + Math.sin(T0 * 4) * 1.5, 11, 3.5, 0, 0, 7); ctx.stroke(); }
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  if (S === 'dying') {
    ctx.font = '18px "Segoe UI Emoji", sans-serif';
    for (let i = 0; i < 3; i++) { const a = T0 * 6 + i * 2.1; ctx.fillText('⭐', fx + Math.cos(a) * 18, fy - 40 + Math.sin(a) * 6); }
  } else if (S === 'playing' && G.fx.cafe > 0) {
    ctx.font = '16px "Segoe UI Emoji", sans-serif';
    if (Math.floor(T0 * 6) % 2) ctx.fillText('💩', fx + 14, headY + 4);
    ctx.fillStyle = '#7fd0ff'; ctx.beginPath(); ctx.ellipse(fx - 12, headY + 14 + (T0 * 30 % 10), 2, 3, 0, 0, 7); ctx.fill();
  } else if (S === 'playing' && G.fx.drunk > 0) {
    for (let i = 0; i < 3; i++) {
      const a = T0 * 8 + i * 2.1;
      ctx.fillStyle = ['#ffd43b', '#b197fc', '#69db7c'][i];
      ctx.beginPath(); ctx.arc(fx + Math.cos(a) * 14, headY + 6 + Math.sin(a) * 4, 3, 0, 7); ctx.fill();
    }
    ctx.font = '14px "Segoe UI Emoji", sans-serif'; ctx.fillText('🌀', fx, headY - 4);
  }
}

function drawShout(v, sx, rowY) {
  const t = 2.4 - v.shout, txt = `¡${v.word}!`;
  const sc = easeOutBack(Math.min(1, t / 0.25)), fade = Math.min(1, v.shout / 0.3);
  ctx.save();
  ctx.font = 'bold 12px "Trebuchet MS", sans-serif';
  const bw = ctx.measureText(txt).width + 16, bh = 22;
  const cx = Math.max(bw / 2 + 2, Math.min(W - bw / 2 - 2, sx + v.w / 2));
  const by = rowY + T / 2 - v.h / 2 - 8 + Math.sin(T0 * 14) * 1.5;
  ctx.globalAlpha = fade; ctx.translate(cx, by); ctx.scale(sc, sc);
  ctx.fillStyle = '#fff'; rr(ctx, -bw / 2, -bh, bw, bh, 8);
  ctx.beginPath(); ctx.moveTo(-5, 0); ctx.lineTo(5, 0); ctx.lineTo(0, 7); ctx.fill();
  ctx.fillStyle = '#10294d'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(txt, 0, -bh / 2 + 1);
  ctx.restore();
}

const ARCADE = '"Press Start 2P", "Courier New", monospace';
function textOutline(txt, x, y, size, fill, stroke = '#10294d', maxW = W - 24) {
  size = Math.round(size * 0.62);                                   // la fuente arcade es más ancha
  ctx.font = `${size}px ${ARCADE}`;
  const w = ctx.measureText(txt).width;
  if (w > maxW) { size = Math.max(8, Math.floor(size * maxW / w)); ctx.font = `${size}px ${ARCADE}`; }
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.lineWidth = Math.max(3, size / 3); ctx.lineJoin = 'round'; ctx.strokeStyle = stroke; ctx.strokeText(txt, x, y);
  ctx.fillStyle = fill; ctx.fillText(txt, x, y);
}

function drawToasts() {
  if (!G || S === 'menu') return;
  const p = playerPos();
  let small = 0;
  toasts.forEach(t => {
    const a = Math.min(1, (t.life - t.t) / 0.3), rise = t.t * 30;
    ctx.save(); ctx.globalAlpha = Math.max(0, a);
    if (t.big) { const s = easeOutBack(Math.min(1, t.t / 0.3)); ctx.translate(W / 2, OY + 120 - rise * 0.3); ctx.scale(s, s); textOutline(t.text, 0, 0, 30, t.color); }
    else { textOutline(t.text, clamp(p.x + T / 2, 90, W - 90), p.y - 30 - rise - small * 20, 16, t.color); small++; }
    ctx.restore();
  });
}

function hud() {
  ctx.fillStyle = '#10294d'; ctx.fillRect(0, 0, W, OY);
  ctx.fillStyle = '#0073cf'; ctx.fillRect(0, OY - 4, W, 4);
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left'; ctx.font = '15px "Segoe UI Emoji", sans-serif'; ctx.fillStyle = '#fff';
  ctx.fillText('🍗'.repeat(Math.max(0, G.lives)) || '🦴', 8, 15);
  ctx.font = 'bold 12px "Trebuchet MS", "Segoe UI Emoji", sans-serif'; ctx.fillStyle = '#ffd43b';
  ctx.fillText(`🪙 ${money(Math.max(0, G.runCoins))}`, 8, 34);
  let fxTxt = '';
  if (G.fx.stop > 0) fxTxt += '⏱️ ';
  if (G.fx.invis > 0) fxTxt += '👻 ';
  if (G.fx.double) fxTxt += 'x2 ';
  if (G.fx.cafe > 0) fxTxt += '☕ ';
  if (G.fx.drunk > 0) fxTxt += '🍾 ';
  if (G.fx.angel) fxTxt += '😇 ';
  ctx.font = 'bold 12px "Segoe UI Emoji", sans-serif';
  ctx.fillText(fxTxt, 72, 34);
  ctx.textAlign = 'center'; ctx.fillStyle = '#fff'; ctx.font = 'bold 14px "Trebuchet MS", sans-serif';
  ctx.fillText(`Nivel ${G.lvl + 1}/${LEVELS_N}`, W / 2, 15);
  ctx.font = '11px "Trebuchet MS", sans-serif'; ctx.fillStyle = '#9cc7ff';
  ctx.fillText(LEVELS[G.lvl].name, W / 2, 33);
  ctx.textAlign = 'right'; ctx.fillStyle = '#ffd43b'; ctx.font = 'bold 14px "Trebuchet MS", sans-serif';
  ctx.fillText(`Puntos ${G.score}`, W - 8, 15);
  ctx.fillStyle = '#fff'; ctx.font = '12px "Trebuchet MS", sans-serif';
  ctx.fillText(`Tiempo ${fmt(G.levelTime)}`, W - 8, 33);
}

// Tarjeta del nivel superado con el lugar principal del diseño
function drawLevelCard(scale) {
  const ic = LEVELS[G.lvl].icon, maxW = 300, maxH = 120;
  const k = Math.min(maxW / ic.w, maxH / (2 * T)), dw = ic.w * k, dh = 2 * T * k;
  ctx.save(); ctx.translate(W / 2, 300); ctx.scale(scale, scale); ctx.rotate(Math.sin(G.animT * 4) * 0.02);
  ctx.fillStyle = '#10294d'; rr(ctx, -dw / 2 - 14, -dh / 2 - 44, dw + 28, dh + 120, 14);
  ctx.fillStyle = '#ffd43b'; rr(ctx, -dw / 2 - 6, -dh / 2 - 6, dw + 12, dh + 12, 8);
  ctx.drawImage(G.bg, ic.x, OY, ic.w, 2 * T, -dw / 2, -dh / 2, dw, dh);
  textOutline(LEVELS[G.lvl].name, 0, -dh / 2 - 24, 22, '#fff');
  textOutline(LINES.levelWin, 0, dh / 2 + 30, 24, '#ffd43b');
  textOutline(`Tiempo: ${fmt(G.levelTime)}`, 0, dh / 2 + 60, 18, '#fff');
  ctx.restore();
}

function overlays() {
  if (S === 'intro') {
    const t = G.introT, a = t > 1.5 ? 1 - (t - 1.5) / 0.3 : Math.min(1, t / 0.2);
    ctx.save(); ctx.globalAlpha = Math.max(0, a);
    ctx.fillStyle = 'rgba(10,25,55,.85)'; ctx.fillRect(0, H / 2 - 80, W, 160);
    ctx.fillStyle = '#ffd43b'; ctx.fillRect(0, H / 2 - 80, W, 4); ctx.fillRect(0, H / 2 + 76, W, 4);
    textOutline(`Nivel ${G.lvl + 1}`, W / 2, H / 2 - 42, 38, '#fff');
    textOutline(LEVELS[G.lvl].name, W / 2, H / 2 + 2, 24, '#ffd43b');
    ctx.font = '12px "Trebuchet MS", sans-serif'; ctx.fillStyle = '#cfe0fb'; ctx.textAlign = 'center';
    ctx.fillText(LEVELS[G.lvl].sub, W / 2, H / 2 + 34);
    ctx.fillText('Mundo 1 · San Pedro Sula, Honduras', W / 2, H / 2 + 54);
    ctx.restore();
  } else if (S === 'win') {
    ctx.fillStyle = 'rgba(0,30,70,.35)'; ctx.fillRect(0, OY, W, H - OY);
    drawLevelCard(easeOutBack(Math.min(1, G.animT / 0.6)));
  } else if (S === 'champion' || (S === 'end' && G.lives > 0 && G.reached >= LEVELS_N)) {
    const t = S === 'champion' ? G.animT : 4;
    ctx.fillStyle = 'rgba(0,30,70,.45)'; ctx.fillRect(0, OY, W, H - OY);
    const s = easeOutBack(Math.min(1, t / 0.7));
    ctx.save(); ctx.translate(W / 2, 270); ctx.scale(s, s); ctx.rotate(Math.sin(t * 3) * 0.05);
    ctx.fillStyle = 'rgba(255,212,59,.25)';
    for (let i = 0; i < 12; i++) { ctx.rotate(Math.PI / 6); ctx.fillRect(-4, 40, 8, 90); }
    ctx.restore();
    ctx.save(); ctx.translate(W / 2, 270 + Math.sin(t * 4) * 6); ctx.scale(s, s);
    drawIcon(pixmap('trophy', ICON_TROPHY, PAL_TROPHY), 0, 0, 10);
    ctx.restore();
    textOutline(LINES.champion(G.char), W / 2, 430, 28, '#ffd43b');
    textOutline('Cruzaste todo San Pedro Sula', W / 2, 468, 16, '#fff');
  } else if (S === 'lose' || (S === 'end' && G.lives <= 0)) {
    const t = S === 'lose' ? G.animT : 3;
    const a = Math.min(1, t / 0.8);
    ctx.fillStyle = `rgba(110,10,10,${0.5 * a})`; ctx.fillRect(0, OY, W, H - OY);
    const b = easeOutBounce(Math.min(1, t / 1.0));
    ctx.save(); ctx.translate(W / 2, lerp(-60, 260, b)); ctx.rotate(Math.sin(t * 6) * 0.06 * (1 - Math.min(1, t / 2)));
    drawIcon(pixmap('skull', ICON_SKULL, PAL_SKULL), 0, 0, 11);
    ctx.restore();
    textOutline('¡Ya te llevó', W / 2, lerp(-40, 380, b), 34, '#ff6b6b');
    textOutline('la gran puerca!', W / 2, lerp(-40, 420, b), 34, '#ff6b6b');
  }
}

// ---------- Bucle principal ----------
let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  update(dt); draw();
  requestAnimationFrame(frame);
}
setChar(charSel);
applyMute();
if (document.fonts) document.fonts.load('16px "Press Start 2P"');
showMenu();
requestAnimationFrame(frame);
