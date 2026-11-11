'use strict';
/* Catálogo de la tienda. Precios en lempiras. Todo se compra excepto el color de piel y lo inicial. */

const ITEMS = [];
const add = (slot, list) => list.forEach(it => ITEMS.push(Object.assign({ slot }, it)));

// ---------- Piel (gratis) ----------
add('skin', [
  { id: 'sk_1', name: 'Piel clara', price: 0, col: '#ffdbb4' },
  { id: 'sk_2', name: 'Piel trigueña', price: 0, col: '#f1c27d' },
  { id: 'sk_3', name: 'Piel canela', price: 0, col: '#e0a574' },
  { id: 'sk_4', name: 'Piel morena', price: 0, col: '#c68642' },
  { id: 'sk_5', name: 'Piel morena oscura', price: 0, col: '#8d5524' },
  { id: 'sk_6', name: 'Piel oscura', price: 0, col: '#5c3a21' },
]);

// ---------- Peinados (solo estilos) ----------
add('hair', [
  { id: 'hs_short', name: 'Corto', price: 0, kind: 'short' },
  { id: 'hs_long', name: 'Largo', price: 0, kind: 'long' },
  { id: 'hs_buzz', name: 'Rapado', price: 40, kind: 'buzz' },
  { id: 'hs_bald', name: 'Calvo', price: 50, kind: 'bald' },
  { id: 'hs_pony', name: 'Cola de caballo', price: 60, kind: 'pony' },
  { id: 'hs_bun', name: 'Moño alto', price: 70, kind: 'bun' },
  { id: 'hs_pigtails', name: 'Coletas', price: 80, kind: 'pigtails' },
  { id: 'hs_curly', name: 'Rizado', price: 80, kind: 'curly' },
  { id: 'hs_afro', name: 'Afro', price: 90, kind: 'afro' },
  { id: 'hs_braids', name: 'Trenzas', price: 90, kind: 'braids' },
  { id: 'hs_emo', name: 'Flequillo emo', price: 100, kind: 'emo' },
  { id: 'hs_punk', name: 'Cresta punk', price: 120, kind: 'punk' },
  { id: 'hs_spiky', name: 'Puntas de anime', price: 140, kind: 'spiky' },
  { id: 'hs_gold', name: 'Tupé dorado', price: 250, kind: 'pompadour', gold: true },
]);

// ---------- Color de pelo ----------
add('hcol', [
  { id: 'hc_black', name: 'Negro', price: 0, col: '#1c1a22' },
  { id: 'hc_dbrown', name: 'Castaño oscuro', price: 40, col: '#4a2e1f' },
  { id: 'hc_lbrown', name: 'Castaño claro', price: 40, col: '#8b5a2b' },
  { id: 'hc_blond', name: 'Rubio', price: 60, col: '#e6c35c' },
  { id: 'hc_red', name: 'Pelirrojo', price: 60, col: '#b5472a' },
  { id: 'hc_gray', name: 'Canoso', price: 70, col: '#c8ccd2' },
  { id: 'hc_pink', name: 'Rosado', price: 90, col: '#f06292' },
  { id: 'hc_blue', name: 'Azul', price: 90, col: '#2f6fe0' },
  { id: 'hc_green', name: 'Verde', price: 90, col: '#2fbf5f' },
  { id: 'hc_purple', name: 'Morado', price: 90, col: '#8e44ad' },
  { id: 'hc_plat', name: 'Platinado', price: 110, col: '#eef0f4' },
  { id: 'hc_gold', name: 'Dorado', price: 200, col: '#e0b030', gold: true },
]);

// ---------- Ojos ----------
add('eyes', [
  { id: 'ey_brown', name: 'Ojos café', price: 0, col: '#5a3418' },
  { id: 'ey_black', name: 'Ojos negros', price: 30, col: '#1c1a22' },
  { id: 'ey_honey', name: 'Ojos miel', price: 40, col: '#b07a2a' },
  { id: 'ey_green', name: 'Ojos verdes', price: 50, col: '#2e8b57' },
  { id: 'ey_blue', name: 'Ojos azules', price: 50, col: '#3a7bd5' },
  { id: 'ey_sky', name: 'Ojos celestes', price: 60, col: '#6ec3e6' },
  { id: 'ey_gray', name: 'Ojos grises', price: 60, col: '#8a949e' },
  { id: 'ey_violet', name: 'Ojos violeta', price: 80, col: '#9b59b6' },
  { id: 'ey_gold', name: 'Ojos dorados', price: 150, col: '#e0b030', gold: true },
]);

// ---------- Boca ----------
add('mouth', [
  { id: 'mo_smile', name: 'Sonrisa', price: 0, kind: 'smile' },
  { id: 'mo_red', name: 'Labios rojos', price: 40, kind: 'lip', col: '#d62828' },
  { id: 'mo_pink', name: 'Labios rosados', price: 40, kind: 'lip', col: '#f06292' },
  { id: 'mo_purple', name: 'Labios morados', price: 50, kind: 'lip', col: '#8e44ad' },
  { id: 'mo_teeth', name: 'Sonrisa con dientes', price: 60, kind: 'teeth' },
  { id: 'mo_tongue', name: 'Lengua afuera', price: 70, kind: 'tongue' },
  { id: 'mo_mustache', name: 'Bigote', price: 80, kind: 'mustache' },
  { id: 'mo_beard', name: 'Barba', price: 100, kind: 'beard' },
  { id: 'mo_gold', name: 'Dientes de oro', price: 180, kind: 'gold', gold: true },
]);

// ---------- Conjuntos y disfraces (reemplazan la ropa) ----------
add('outfit', [
  { id: 'of_suit', name: 'Traje de saco', price: 250, kind: 'suit' },
  { id: 'of_doctor', name: 'Traje de doctor', nameF: 'Traje de doctora', price: 220, kind: 'doctor' },
  { id: 'of_fire', name: 'Traje de bombero', nameF: 'Traje de bombera', price: 300, kind: 'fire' },
  { id: 'of_police', name: 'Traje de policía', price: 300, kind: 'police' },
  { id: 'of_military', name: 'Traje militar', price: 320, kind: 'military' },
  { id: 'of_priest', name: 'Traje de sacerdote', nameF: 'Traje de monja', price: 280, kind: 'priest' },
  { id: 'of_bus', name: 'Ayudante de bus', price: 200, kind: 'busHelper' },
  { id: 'of_trash', name: 'Recolector de basura', nameF: 'Recolectora de basura', price: 220, kind: 'trash' },
  { id: 'of_thief', name: 'Disfraz de ladrón', nameF: 'Disfraz de ladrona', price: 260, kind: 'thief' },
  { id: 'of_pirate', name: 'Disfraz de pirata', price: 350, kind: 'pirate' },
  { id: 'of_zombie', name: 'Disfraz de zombi', price: 340, kind: 'zombie' },
  { id: 'of_ghost', name: 'Disfraz de fantasma', price: 320, kind: 'ghost', cover: true },
  { id: 'of_chicken', name: 'Disfraz de pollo', price: 380, kind: 'chicken', cover: true },
  { id: 'of_baleada', name: 'Disfraz de baleada', price: 450, kind: 'baleada' },
  { id: 'of_astro', name: 'Traje de astronauta', price: 480, kind: 'astro' },
  { id: 'of_farmer', name: 'Traje de granjero', nameF: 'Traje de granjera', price: 240, kind: 'farmer' },
  { id: 'of_ballet', name: 'Bailarín de ballet', nameF: 'Bailarina de ballet', price: 360, kind: 'ballet' },
  { id: 'of_medieval', name: 'Caballero medieval', nameF: 'Dama medieval', price: 520, kind: 'medieval' },
  { id: 'of_hero', name: 'Superhéroe', nameF: 'Superheroína', price: 550, kind: 'hero' },
  { id: 'of_royal', name: 'Traje de rey', nameF: 'Traje de reina', price: 600, kind: 'royal' },
  { id: 'of_gold', name: 'Traje dorado', price: 900, kind: 'gold', gold: true },
]);

// ---------- Camisas ----------
// kind: tee (manga corta), short (manga corta con cuello), formal, sweater, hoodie, dress, jersey
add('shirt', [
  { id: 'sh_white', name: 'Camiseta blanca', price: 0, kind: 'tee', col: '#f4f4f4' },
  { id: 'sh_red', name: 'Camiseta roja', price: 40, kind: 'tee', col: '#d93a3a' },
  { id: 'sh_sky', name: 'Camiseta celeste', price: 40, kind: 'tee', col: '#6ab7f5' },
  { id: 'sh_green', name: 'Camiseta verde', price: 40, kind: 'tee', col: '#3aa655' },
  { id: 'sh_pink', name: 'Camiseta rosada', price: 45, kind: 'tee', col: '#f48fb1' },
  { id: 'sh_yellow', name: 'Camiseta amarilla', price: 50, kind: 'tee', col: '#f2c200' },
  { id: 'sh_black', name: 'Camiseta negra', price: 60, kind: 'tee', col: '#2a2a30' },
  { id: 'sh_h', name: 'Camiseta de la H', price: 110, kind: 'tee', col: '#0073cf', pat: 'hband', col2: '#ffffff' },
  { id: 'sh_gold', name: 'Camiseta dorada', price: 300, kind: 'tee', col: '#e0b030', pat: 'shine', gold: true },
  // Manga corta con cuello
  { id: 'sc_sky', name: 'Manga corta celeste', price: 70, kind: 'short', col: '#8ecae6' },
  { id: 'sc_check', name: 'Manga corta a cuadros', price: 90, kind: 'short', col: '#c0392b', pat: 'check', col2: '#7b1f16' },
  { id: 'sc_hawaii', name: 'Manga corta hawaiana', price: 110, kind: 'short', col: '#1e88a8', pat: 'flowers', col2: '#ffd43b', col3: '#f06292' },
  { id: 'sc_polo', name: 'Polo azul marino', price: 80, kind: 'short', col: '#1c2f5e' },
  // Formales
  { id: 'sf_white', name: 'Camisa formal con corbata', price: 120, kind: 'formal', col: '#fafafa', tie: '#c62828' },
  { id: 'sf_sky', name: 'Camisa formal celeste', price: 100, kind: 'formal', col: '#bfe0f7', tie: '#1c2f5e' },
  { id: 'sf_pink', name: 'Camisa formal rosada', price: 100, kind: 'formal', col: '#f8c8d8' },
  // Suéteres
  { id: 'sw_red', name: 'Suéter rojo', price: 90, kind: 'sweater', col: '#b52a2a' },
  { id: 'sw_gray', name: 'Suéter gris', price: 90, kind: 'sweater', col: '#8a8f99' },
  { id: 'sw_xmas', name: 'Suéter navideño', price: 150, kind: 'sweater', col: '#2e7d32', pat: 'zigzag', col2: '#ffffff', col3: '#d62828' },
  { id: 'sw_hood', name: 'Sudadera con capucha', price: 130, kind: 'hoodie', col: '#2a2a30' },
  // Vestidos (reemplazan el pantalón)
  { id: 'dr_red', name: 'Vestido rojo', price: 120, kind: 'dress', col: '#d62839' },
  { id: 'dr_flower', name: 'Vestido floreado', price: 150, kind: 'dress', col: '#fff3c4', pat: 'flowers', col2: '#f06292', col3: '#4dabf7' },
  { id: 'dr_blue', name: 'Vestido azul de fiesta', price: 180, kind: 'dress', col: '#2f54c9', pat: 'shine' },
  { id: 'dr_yellow', name: 'Vestido amarillo', price: 130, kind: 'dress', col: '#ffd43b' },
  // Camisetas de fútbol (colores de la camiseta local)
  { id: 'jr_hon', name: 'Selección de Honduras', price: 160, kind: 'jersey', col: '#f7f7f7', col2: '#0073cf', pat: 'trim', crest: '#0073cf' },
  { id: 'jr_oli', name: 'Olimpia', price: 160, kind: 'jersey', col: '#f7f7f7', col2: '#d62828', col3: '#1f4fa3', pat: 'olimpia', crest: '#d62828' },
  { id: 'jr_mar', name: 'Marathón', price: 160, kind: 'jersey', col: '#0b8a4b', col2: '#ffffff', col3: '#d62828', pat: 'trim', crest: '#ffffff' },
  { id: 'jr_mot', name: 'Motagua', price: 160, kind: 'jersey', col: '#1b4f9c', col2: '#ffffff', pat: 'trim', crest: '#ffffff' },
  { id: 'jr_res', name: 'Real España', price: 160, kind: 'jersey', col: '#ffd200', col2: '#1c1a22', pat: 'blackSleeves', crest: '#1c1a22' },
  { id: 'jr_esp', name: 'España', price: 200, kind: 'jersey', col: '#c60b1e', col2: '#ffc400', pat: 'trim', crest: '#ffc400' },
  { id: 'jr_bar', name: 'Barcelona', price: 220, kind: 'jersey', col: '#004d98', col2: '#a50044', pat: 'vstripe', crest: '#ffc400' },
  { id: 'jr_rma', name: 'Real Madrid', price: 220, kind: 'jersey', col: '#fafafa', col2: '#febe10', pat: 'trim', crest: '#febe10' },
]);

// ---------- Pantalones ----------
// kind: long, shorts, bermuda, beach, skirt
add('pants', [
  { id: 'pn_blue', name: 'Jean azul', price: 0, kind: 'long', col: '#2d4a8a', jean: true },
  { id: 'pn_light', name: 'Jean claro', price: 50, kind: 'long', col: '#5b86c9', jean: true },
  { id: 'pn_black', name: 'Jean negro', price: 55, kind: 'long', col: '#26282f', jean: true },
  { id: 'pn_gray', name: 'Jean gris', price: 60, kind: 'long', col: '#6c757d', jean: true },
  { id: 'pn_pink', name: 'Jean rosado', price: 80, kind: 'long', col: '#f39ab8', jean: true },
  { id: 'pn_green', name: 'Jean verde', price: 90, kind: 'long', col: '#4b6b3a', jean: true },
  { id: 'pn_red', name: 'Jean rojo', price: 100, kind: 'long', col: '#a83232', jean: true },
  { id: 'pn_white', name: 'Jean blanco', price: 130, kind: 'long', col: '#e8e8e8', jean: true },
  { id: 'pn_brown', name: 'Pantalón café', price: 70, kind: 'long', col: '#7a5230' },
  { id: 'pn_khaki', name: 'Pantalón caqui', price: 70, kind: 'long', col: '#c3a978' },
  { id: 'pn_gold', name: 'Jean dorado', price: 250, kind: 'long', col: '#e0b030', jean: true, gold: true },
  // Shorts de equipos de fútbol
  { id: 'so_hon', name: 'Short de Honduras', price: 70, kind: 'shorts', col: '#0073cf', col2: '#ffffff' },
  { id: 'so_oli', name: 'Short del Olimpia', price: 70, kind: 'shorts', col: '#1f4fa3', col2: '#d62828' },
  { id: 'so_mar', name: 'Short del Marathón', price: 70, kind: 'shorts', col: '#0b8a4b', col2: '#ffffff' },
  { id: 'so_mot', name: 'Short del Motagua', price: 70, kind: 'shorts', col: '#1b4f9c', col2: '#ffffff' },
  { id: 'so_res', name: 'Short del Real España', price: 70, kind: 'shorts', col: '#1c1a22', col2: '#ffd200' },
  { id: 'so_esp', name: 'Short de España', price: 80, kind: 'shorts', col: '#1b2a5c', col2: '#ffc400' },
  { id: 'so_bar', name: 'Short del Barcelona', price: 90, kind: 'shorts', col: '#004d98', col2: '#a50044' },
  { id: 'so_rma', name: 'Short del Real Madrid', price: 90, kind: 'shorts', col: '#fafafa', col2: '#febe10' },
  // Bermudas
  { id: 'bm_khaki', name: 'Bermuda caqui', price: 60, kind: 'bermuda', col: '#c3a978' },
  { id: 'bm_jean', name: 'Bermuda de mezclilla', price: 60, kind: 'bermuda', col: '#4a6fae', jean: true },
  { id: 'bm_beach_b', name: 'Bermuda de playa azul', price: 90, kind: 'beach', col: '#2aa3c9', col2: '#ffd43b', col3: '#ffffff' },
  { id: 'bm_beach_o', name: 'Bermuda de playa naranja', price: 90, kind: 'beach', col: '#f08c00', col2: '#2f9e44', col3: '#ffffff' },
  // Faldas
  { id: 'sk_black', name: 'Falda negra', price: 70, kind: 'skirt', col: '#26282f' },
  { id: 'sk_pink', name: 'Falda rosada', price: 70, kind: 'skirt', col: '#f48fb1' },
  { id: 'sk_jean', name: 'Falda de mezclilla', price: 80, kind: 'skirt', col: '#4a6fae', jean: true },
  { id: 'sk_plaid', name: 'Falda escocesa', price: 110, kind: 'skirt', col: '#b52a2a', pat: 'check', col2: '#1c2f5e' },
]);

// ---------- Zapatos ----------
add('shoes', [
  { id: 'zp_black', name: 'Zapatos negros', price: 0, kind: 'plain', col: '#26232c' },
  { id: 'zp_white', name: 'Tenis blancos', price: 0, kind: 'sneaker', col: '#f4f4f4', col2: '#c9ccd2' },
  { id: 'zp_sandals', name: 'Chancletas', price: 40, kind: 'sandals', col: '#2f6fe0' },
  { id: 'zp_chuck_r', name: 'Tenis tipo Converse rojos', price: 80, kind: 'chuck', col: '#d62828' },
  { id: 'zp_chuck_k', name: 'Tenis tipo Converse negros', price: 80, kind: 'chuck', col: '#26232c' },
  { id: 'zp_crocs_g', name: 'Sandalias tipo Crocs verdes', price: 90, kind: 'crocs', col: '#4caf50' },
  { id: 'zp_crocs_p', name: 'Sandalias tipo Crocs rosadas', price: 90, kind: 'crocs', col: '#f48fb1' },
  { id: 'zp_run', name: 'Tenis deportivos azules', price: 100, kind: 'sneaker', col: '#2f6fe0', col2: '#ffffff' },
  { id: 'zp_vans', name: 'Tenis tipo Vans', price: 110, kind: 'vans', col: '#26232c' },
  { id: 'zp_formal', name: 'Zapatos formales café', price: 120, kind: 'plain', col: '#6b3e26' },
  { id: 'zp_heels', name: 'Tacones rojos', price: 140, kind: 'heels', col: '#d62828' },
  { id: 'zp_cowboy', name: 'Botas vaqueras', price: 150, kind: 'boots', col: '#8b5a2b' },
  { id: 'zp_mil', name: 'Botas militares', price: 160, kind: 'boots', col: '#3d4a2a' },
  { id: 'zp_jordan', name: 'Tenis tipo Jordan', price: 220, kind: 'jordan', col: '#d62828' },
  { id: 'zp_gold', name: 'Tenis dorados', price: 350, kind: 'sneaker', col: '#e0b030', col2: '#fff3b0', gold: true },
]);

// ---------- Gorras y sombreros ----------
add('head', [
  { id: 'hd_red', name: 'Gorra roja', price: 60, kind: 'cap', col: '#d93a3a' },
  { id: 'hd_blue', name: 'Gorra azul', price: 60, kind: 'cap', col: '#1c5fd1' },
  { id: 'hd_black', name: 'Gorra negra', price: 60, kind: 'cap', col: '#2a2a30' },
  { id: 'hd_back', name: 'Gorra hacia atrás', price: 70, kind: 'capBack', col: '#2f9e44' },
  { id: 'hd_beanie', name: 'Gorro de lana', price: 80, kind: 'beanie', col: '#f08c00' },
  { id: 'hd_h', name: 'Gorra de Honduras', price: 120, kind: 'capH', col: '#0073cf' },
  { id: 'hd_hat', name: 'Sombrero', price: 150, kind: 'hat', col: '#d8b36a' },
  { id: 'hd_crown', name: 'Corona dorada', price: 400, kind: 'crown', col: '#f2c200', gold: true },
]);

// ---------- Lentes ----------
add('glasses', [
  { id: 'gl_round', name: 'Lentes redondos', price: 80, kind: 'round', col: '#2a2a30' },
  { id: 'gl_nerd', name: 'Lentes gruesos', price: 80, kind: 'nerd', col: '#1c1a22' },
  { id: 'gl_sun', name: 'Lentes de sol', price: 100, kind: 'sun', col: '#1c1a22' },
  { id: 'gl_aviator', name: 'Lentes de aviador', price: 130, kind: 'aviator', col: '#3d5a40', col2: '#d4a017' },
  { id: 'gl_red', name: 'Lentes rojos', price: 140, kind: 'sun', col: '#d93a3a' },
  { id: 'gl_cat', name: 'Lentes de gatita', price: 140, kind: 'cat', col: '#1c1a22' },
  { id: 'gl_3d', name: 'Lentes 3D', price: 150, kind: '3d', col: '#f4f4f4' },
  { id: 'gl_heart', name: 'Lentes de corazón', price: 160, kind: 'heart', col: '#f06292' },
  { id: 'gl_star', name: 'Lentes de estrella', price: 160, kind: 'star', col: '#ffd43b' },
  { id: 'gl_monocle', name: 'Monóculo', price: 180, kind: 'monocle', col: '#d4a017' },
  { id: 'gl_ski', name: 'Gafas de esquí', price: 200, kind: 'ski', col: '#f08c00', col2: '#2a2a30' },
  { id: 'gl_fut', name: 'Visor futurista', price: 220, kind: 'visor', col: '#00e5ff' },
  { id: 'gl_gold', name: 'Lentes dorados', price: 300, kind: 'sun', col: '#d4a017', gold: true },
]);

// ---------- Carteras y mochilas ----------
add('bag', [
  { id: 'bg_market', name: 'Bolsa de mercado', price: 60, kind: 'market', col: '#d8b36a' },
  { id: 'bg_fanny', name: 'Riñonera', price: 80, kind: 'fanny', col: '#2a2a30' },
  { id: 'bg_purse', name: 'Cartera café', price: 90, kind: 'purse', col: '#8b5a2b' },
  { id: 'bg_pack_b', name: 'Mochila azul', price: 110, kind: 'pack', col: '#1c5fd1' },
  { id: 'bg_purse_p', name: 'Cartera rosada', price: 110, kind: 'purse', col: '#f06292' },
  { id: 'bg_pack_k', name: 'Mochila negra', price: 130, kind: 'pack', col: '#2a2a30' },
  { id: 'bg_purse_g', name: 'Cartera dorada', price: 300, kind: 'purse', col: '#e0b030', gold: true },
]);

const ITEM_BY_ID = Object.fromEntries(ITEMS.map(i => [i.id, i]));
const CATS_SHOP = [['outfit', 'Conjuntos'], ['shirt', 'Camisas'], ['pants', 'Pantalones'], ['shoes', 'Zapatos'],
  ['hair', 'Peinados'], ['hcol', 'Color de pelo'], ['eyes', 'Ojos'], ['mouth', 'Boca'],
  ['head', 'Gorras'], ['glasses', 'Lentes'], ['bag', 'Carteras']];
const CATS_CUST = [['skin', 'Piel'], ...CATS_SHOP];
const OPTIONAL_SLOTS = ['outfit', 'head', 'glasses', 'bag'];

const defaultEq = g => ({
  skin: g === 'm' ? 'sk_3' : 'sk_4', hair: g === 'm' ? 'hs_long' : 'hs_short', hcol: 'hc_black',
  eyes: 'ey_brown', mouth: 'mo_smile', shirt: 'sh_white', pants: 'pn_blue', shoes: g === 'm' ? 'zp_white' : 'zp_black',
  outfit: null, head: null, glasses: null, bag: null,
});
const itemName = (it, g) => (g === 'm' && it.nameF) || it.name;
