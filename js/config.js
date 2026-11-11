'use strict';
/* DESPABÍLATE - configuración general, niveles, vehículos y premios */

// ---------- Tablero ----------
const T = 48, COLS = 10, ROWS = 15, OY = 48;
const W = COLS * T, H = ROWS * T + OY;
const FB = OY + 2 * T;                     // base de la fachada (filas 0 y 1 son decorado)
const GOAL_ROW = 2, MEDIAN = 8, START_ROW = 14, START_COL = 4;
const ROAD_ROWS = [3, 4, 5, 6, 7, 9, 10, 11, 12, 13];
const MAX_LIVES = 5;
const HOP = 0.11;                          // segundos por salto
const FX_TIME = 1;                         // duración de poderes y desventajas (segundos)
const SAVE_KEY = 'desp_save';

// ---------- Mundos ----------
const WORLDS = [
  { id: 'sps', name: 'San Pedro Sula', desc: '10 niveles', icon: '🏙️', available: true, levels: 10 },
  { id: 'vil', name: 'Villanueva', desc: 'Próximamente', icon: '🏭', available: false },
  { id: 'teg', name: 'Tegucigalpa', desc: 'Próximamente', icon: '🏛️', available: false },
  { id: 'com', name: 'Comayagua', desc: 'Próximamente', icon: '⛪', available: false },
  { id: 'cho', name: 'Choloma', desc: 'Próximamente', icon: '🌆', available: false },
];

// ---------- Niveles de San Pedro Sula (de fácil a difícil) ----------
// blocker: obstáculo de la mediana. icon: zona de la fachada que se muestra al superar el nivel.
const LEVELS = [
  { id: 'parque', name: 'Parque Central', sub: 'Municipalidad · Catedral · Banco Atlántida · Pizza Hut · Parque',
    blocker: 'greenTree', sidewalk: '#d8cba3', road: '#3b3e46', grass: '#5ea84a', sky: ['#8fd0f0', '#d6f0fb'],
    icon: { x: 168, w: 136, label: 'Catedral' } },
  { id: 'maheco', name: 'Maheco', sub: 'Maheco · Metrocentro · puestos de mercado',
    blocker: 'stall', sidewalk: '#cdbf9a', road: '#40434b', grass: '#58a046', sky: ['#9bd5f2', '#e1f4fb'],
    icon: { x: 130, w: 260, label: 'Maheco' } },
  { id: 'viveros', name: 'Viveros', sub: 'Coca-Cola · viveros de plantas · Expreso Americano · paso de cebra',
    blocker: 'rail', sidewalk: '#d1c9b4', road: '#3a3d44', grass: '#9a9a9a', sky: ['#8fd0f0', '#dcf2fb'], zebra: [4, 5],
    icon: { x: 0, w: 150, label: 'Coca-Cola' } },
  { id: 'este', name: 'Boulevard del Este', sub: 'Megamall · Power Chicken · La Mundial · Colonial · BAC · puente peatonal',
    blocker: 'palm', sidewalk: '#c9c9c9', road: '#34373e', grass: '#4f9a42', sky: ['#86c8ea', '#d8eefa'],
    icon: { x: 0, w: 112, label: 'Megamall' } },
  { id: 'unah', name: 'Boulevard de la UNAH', sub: 'UNAH-VS · McDonald\'s · PriceSmart · Galerías del Valle',
    blocker: 'palm', sidewalk: '#cfcabd', road: '#383b42', grass: '#55a047', sky: ['#90d2f2', '#def3fb'],
    icon: { x: 0, w: 140, label: 'UNAH-VS' } },
  { id: 'sur', name: 'Boulevard del Sur', sub: 'Terminal de buses · Puma · Pizza Hut · Hondutel · puente peatonal',
    blocker: 'palm', sidewalk: '#d4d0c6', road: '#3a3d44', grass: '#5ba54b', sky: ['#8ccdf0', '#dcf1fb'],
    icon: { x: 0, w: 150, label: 'Terminal de buses' } },
  { id: 'c27', name: '27 Calle', sub: 'Central de Abastos · gasolinera UNO · casas · puente pequeño',
    blocker: 'canal', sidewalk: '#cfc4ab', road: '#3b3d44', grass: '#3d7fb0', sky: ['#9fd6f2', '#e4f5fb'],
    icon: { x: 0, w: 170, label: 'Central de Abastos' } },
  { id: 'norte', name: 'Boulevard del Norte', sub: 'Seguro Social · Power Chicken · Hospital del Valle · puente peatonal',
    blocker: 'palm', sidewalk: '#cdcdcd', road: '#33363d', grass: '#4f9a42', sky: ['#84c6ea', '#d6edfa'],
    icon: { x: 330, w: 150, label: 'Hospital del Valle' } },
  { id: 'c33', name: '33 Calle', sub: 'Estadio Olímpico · feria de juegos mecánicos · Wonderland',
    blocker: 'palm', sidewalk: '#cfc3a8', road: '#383a42', grass: '#559e45', sky: ['#ff9a56', '#ffe0b0'],
    icon: { x: 0, w: 192, label: 'Estadio Olímpico' } },
  { id: 'dandy', name: '7 Calle · Mercado Dandy', sub: 'Mercado Dandy · Banpaís · Despensa Familiar',
    blocker: 'stall', sidewalk: '#cbb995', road: '#3a3c43', grass: '#589f47', sky: ['#94d2f2', '#e2f4fb'],
    icon: { x: 96, w: 160, label: 'Mercado Dandy' } },
];
const LEVELS_N = LEVELS.length;

// Dificultad escalable a lo largo de los 10 niveles (k va de 0 a 1)
LEVELS.forEach((L, i) => {
  const k = i / (LEVELS_N - 1);
  L.speed = 1.5 + 2.7 * k;                 // casillas por segundo: 1.5 -> 4.2
  L.gapMin = 2.6 - 1.0 * k;                // hueco mínimo entre vehículos: 2.6 -> 1.6
  L.gapRand = 3.6 - 2.3 * k;               // hueco aleatorio extra: 3.6 -> 1.3
  L.mix = { rap: .38 - .16 * k, moto: .12 + .10 * k, mic: .25 - .09 * k, bus: .10 + .14 * k, esc: .15 };
  L.sirenMin = 9 - 4 * k;                  // segundos mínimos entre vehículos de emergencia
  L.thiefEvery = 16 - 8 * k;               // cada cuánto puede salir el ladrón
  L.debuffs = i < 2 ? 1 : i < 6 ? 2 : 3;   // granitas de café y pachitas en la calle
});

// ---------- Vehículos ----------
const TYPES = {
  rap:  { w: 1.40, h: 30 },   // taxi
  moto: { w: 0.95, h: 28 },   // moto
  mic:  { w: 2.10, h: 38 },   // minibús estilo Toyota Hiace
  bus:  { w: 3.20, h: 42 },   // bus grande blanco
  esc:  { w: 3.10, h: 42 },   // bus amarillo tipo escolar
  amb:  { w: 2.30, h: 38 },   // ambulancia
  fire: { w: 3.40, h: 44 },   // camión de bomberos
  pol:  { w: 1.60, h: 30 },   // patrulla
};
const COMPANIES = [{ n: 'Impala', c: '#d62828' }, { n: 'San Carlos', c: '#1d4ed8' }, { n: 'Caribe', c: '#0f9d8a' }];
const MIC_LABELS = ['Ruta 2', 'Ruta 7', 'Ruta 1', 'Terminal', 'Ruta 4'];
const MIC_COLORS = ['#8e969e', '#1c3d6e', '#f2f2f2'];
const ESC_LABELS = ['Ruta 7', 'Ruta 2', 'Ruta 1'];

// ---------- Premios ----------
// Poderes: el tiempo detenido y la invisibilidad se reemplazan entre sí; Pollo Chuco y x2 son independientes.
const PICKS = {
  life:   { icon: '🍗', color: '#e8a33d', name: '¡Pollo Chuco!', w: 0.12 },
  stop:   { icon: '⏱️', color: '#4dabf7', name: '¡Tiempo detenido!', w: 0.34 },
  invis:  { icon: '👻', color: '#b197fc', name: '¡Invisible!', w: 0.30 },
  double: { icon: 'x2', color: '#ffd43b', name: '¡Puntos x2!', w: 0.24 },
};
// Ángel: protege todo el nivel. Es muy raro: sale en pocos niveles y nunca más de uno.
const ANGEL = { icon: '😇', color: '#fff3b0', name: '¡Ángel de la guarda!', chance: 0.07 };
// Desventajas
const DEBUFFS = {
  cafe:    { color: '#6b3e26', name: '¡Granita de café!', sub: '¡Ay, la panza! Corres más rápido' },
  pachita: { color: '#4f8a3a', name: '¡Pachita!', sub: 'Controles al revés' },
};

// ---------- Economía (lempiras) ----------
// Pocas monedas por nivel + bono pequeño: una partida perfecta de 10 niveles da unos L 100.
const COIN_BONUS = lvl => 2 + lvl;
const COINS_PER_LEVEL = lvl => 3 + (lvl >= 5 ? 1 : 0);

// ---------- Frases ----------
const SHOUTS = ['Maheco', 'Terminal', 'Vacío', 'Buzo', 'Vaya vaya'];
const THIEF_LINES = ['¡Pilas con el phone, allí mi dog!', '¡Ya te la sabés!'];

// ---------- Créditos ----------
const GAME_VERSION = 'v1.5.0';
const AI_CREDIT = 'Modelo: Auto (seleccionado automáticamente por Kiro)';
const LINES = {
  lifeLost: '¡Por la gran pucha!',
  gameOver: '¡Ya te llevó la gran puerca!',
  levelWin: '¡Sos otro rollo, mi dog!',
  champion: g => `¡Sos grande, mi ${g === 'm' ? 'chela' : 'chele'}!`,
};
