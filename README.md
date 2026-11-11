# DESPABILATE · v1.5.0

Juego 2D arcade estilo Crossy Road ambientado en Honduras: cruza las calles sin que te atropelle un taxi, un microbús o un bus.

| | |
|---|---|
| **Jugar** | https://imaynuz.github.io/despabilate/ |
| **Repositorio** | https://github.com/iMaynuz/despabilate |
| **Idea, diseño y dirección** | Maynor Morales |
| **Programación con IA** | Kiro |
| **Tecnología** | HTML5 Canvas, CSS y JavaScript, sin dependencias ni servidor |
| **Peso total** | Unos 300 KB, incluida la fuente |
| **Costo de hosting** | Gratis (GitHub Pages, repositorio público) |
| **Estado** | En pruebas |

---

## Mundos

| Mundo | Lugar | Estado |
|---|---|---|
| 1 | San Pedro Sula | Disponible (10 niveles) |
| 2 | Villanueva | Pendiente |
| 3 | Tegucigalpa | Pendiente |
| 4 | Choloma | Pendiente |
| 5 | Internacional | Pendiente (último mundo) |

## Niveles de San Pedro Sula

La dificultad sube en cada nivel: hay más velocidad, menos espacio entre vehículos y más desventajas en la calle.

| # | Lugar | Referencias | Velocidad base* | Desventajas |
|---|---|---|---|---|
| 1 | Parque Central | Municipalidad, Catedral, Banco Atlántida, Pizza Hut, fuente | 1.5 | 1 |
| 2 | Maheco | Maheco, Metrocentro, puestos de mercado | 1.8 | 1 |
| 3 | Viveros | Coca-Cola, vivero, Expreso Americano, paso de cebra, barandales | 2.1 | 2 |
| 4 | Boulevard del Este | Megamall, Power Chicken, La Mundial, Colonial, BAC, puente peatonal | 2.4 | 2 |
| 5 | Boulevard de la UNAH | UNAH-VS, McDonald's, PriceSmart, Galerías del Valle | 2.7 | 2 |
| 6 | Boulevard del Sur | Terminal de buses, Puma, Pizza Hut, Hondutel, puente peatonal | 3.0 | 2 |
| 7 | 27 Calle | Central de Abastos, gasolinera UNO, casas, canal con puentes | 3.3 | 3 |
| 8 | Boulevard del Norte | Seguro Social, Power Chicken, Hospital del Valle, puente peatonal | 3.6 | 3 |
| 9 | 33 Calle | Estadio Olímpico, feria de juegos mecánicos, Wonderland | 3.9 | 3 |
| 10 | 7 Calle · Mercado Dandy | Mercado Dandy, Banpaís, Despensa Familiar | 4.2 | 3 |

\* En casillas por segundo. Cada carril varía entre −15% y +25%.

## Vehículos

- **Taxis:** blancos, con franja negra y el número en amarillo.
- **Microbuses estilo Nissan Urvan:** grises, azul oscuro o blancos. Rutas 1, 2, 4, 7 y Terminal.
- **Buses grandes blancos:** Impala, San Carlos y Caribe.
- **Buses amarillos tipo escolar:** Rutas 1, 2 y 7.
- **Motos:** el 35% son repartidores, de rojo y con mochila térmica.
- **Vehículos sorpresa:** ambulancia, bomberos o policía. Avisan con una alerta y pasan muy rápido.
- **Ayudantes de bus que gritan:** "Maheco", "Terminal", "Vacío", "Buzo" y "Vaya vaya".

## Premios y desventajas

| Tipo | Ícono | Efecto | Duración |
|---|---|---|---|
| Bueno | 🍗 Pollo Chuco | Vida extra (máximo 5) | — |
| Bueno | 🪙 Lempira | Moneda para la tienda | — |
| Bueno | ⏱️ Tiempo detenido | Los vehículos se paran | 1 s |
| Bueno | 👻 Invisible | No te pueden atropellar | 1 s |
| Bueno | x2 | Duplica el bonus al terminar el nivel | Todo el nivel |
| Bueno | 😇 Ángel de la guarda | Nada te toca. Sale en el 7% de los niveles | Todo el nivel |
| Malo | ☕ Granita de café | Diarrea: corres más rápido | 1 s |
| Malo | 🍾 Pachita | Mareo: los controles se invierten | 1 s |
| Malo | 🦹 Ladrón en la mediana | Roba las lempiras del nivel; si no tienes, te quita un Pollo Chuco | — |
| Malo | 🚨 Sirenas | Vehículos de emergencia muy rápidos | — |

El tiempo detenido y la invisibilidad se reemplazan entre sí. El Pollo Chuco, el x2 y el ángel funcionan aparte.

## Mensajes del juego

| Momento | Mensaje |
|---|---|
| Pierdes una vida | ¡Por la gran pucha! |
| Superas un nivel | ¡Sos otro rollo, mi dog! + imagen del lugar |
| Ganas los 10 niveles | 🏆 ¡Sos grande, mi chele / mi chela! |
| Pierdes la partida | 💀 ¡Ya te llevó la gran puerca! |
| El ladrón aparece | ¡Pilas con el phone, allí mi dog! |
| El ladrón te roba | ¡Ya te la sabés! |

## Economía y tienda

- **Monedas por nivel:** de 3 a 4 lempiras en la calle, más un bono por nivel (de L 2 a L 11).
- **Partida perfecta:** unos L 100.
- **Catálogo:** 173 artículos. 158 se compran, con precios de L 30 a L 900. Los demás son gratis desde el inicio, incluidos los 6 tonos de piel.
- **Dorados:** cada categoría tiene un artículo dorado, y siempre es el más caro de su categoría.
- **Comprar y equipar:** al comprar, el juego pregunta si quieres equiparlo.

| Categoría | Artículos | Ejemplos |
|---|---|---|
| Conjuntos | 21 | Bombero, policía, doctor, militar, astronauta, rey o reina, superhéroe, pollo, baleada, traje dorado |
| Camisas | 32 | Honduras, Olimpia, Marathón, Motagua, Real España, España, Barcelona, Real Madrid, vestidos, suéteres |
| Pantalones | 27 | Jeans, shorts de equipos, faldas, bermudas de playa |
| Zapatos | 15 | Tipo Converse, Jordan, Vans, Crocs, botas, tacones |
| Peinados | 14 | Afro, trenzas, cresta punk, puntas de anime, tupé dorado |
| Color de pelo | 12 | Natural, fantasía, dorado |
| Ojos | 9 | Café, verdes, azules, violeta, dorados |
| Boca | 9 | Labios, bigote, barba, dientes de oro |
| Gorras | 8 | Gorra de Honduras, sombrero, corona dorada |
| Lentes | 13 | Aviador, corazón, 3D, monóculo, dorados |
| Carteras | 7 | Mochilas, riñonera, cartera dorada |
| Piel | 6 | Gratis |

## Personajes

- **Estilo:** pixel art RPG clásico, con contorno automático. La ropa de la tienda usa el mismo sistema.
- **Hombre y mujer:** tienen diseños distintos. La mujer tiene pestañas, rubor, cintura marcada y pelo largo.
- **Personalizar:** se cambian la piel, el peinado, el color de pelo, los ojos, la boca, la ropa y los accesorios.

## Sonido

- **Música:** chiptune arcade generada en el navegador.
- **Ciudad:** tráfico, autos y motos que pasan de un lado a otro, pitos, pasos y murmullo de gente.
- **Voces:** usan la voz del sistema en español.
- **Volumen:** hay controles separados para el sonido del juego y la música, más un interruptor general.

## Interfaz

- **Menú:** Jugar, Tienda, Personalizar, Puntajes y Configuración.
- **Configuración:** pestañas de Sonido, Controles, Cómo jugar y Créditos.
- **Puntajes:** se separan por mundo y muestran el nivel alcanzado.
- **Pausa:** Continuar, Reiniciar nivel y Salir al menú.
- **Controles:** teclado (flechas o WASD, P para pausar, M para silenciar), deslizar el dedo o botones en pantalla.
- **Pantalla:** sin barras de desplazamiento. El título usa la fuente arcade Press Start 2P (licencia SIL OFL).

---

## Estructura del proyecto

```
despabilate/
├── index.html          Pantallas y menús
├── style.css           Estilos
├── fonts/              Press Start 2P + licencia OFL
└── js/
    ├── config.js       Mundos, niveles, dificultad, premios, frases, versión
    ├── core.js         Utilidades y guardado
    ├── audio.js        Efectos, ambiente de ciudad, música y voces
    ├── catalog.js      Catálogo de la tienda
    ├── characters.js   Sprites en pixel art
    ├── vehicles.js     Vehículos
    ├── scenes.js       Fachadas y fondos de cada nivel
    └── game.js         Lógica, interfaz y dibujo
```

## Cómo publicar una actualización

Desde la carpeta del proyecto (o después de `git clone https://github.com/iMaynuz/despabilate.git`):

```powershell
git add index.html style.css js fonts
git commit -m "Descripción del cambio"
git push
```

GitHub Pages se actualiza solo en uno o dos minutos. Cambia `GAME_VERSION` en `js/config.js` para que se vea en Créditos.

## Pendientes

- [ ] Mundo 2: Villanueva
- [ ] Mundo 3: Tegucigalpa
- [ ] Mundo 4: Choloma
- [ ] Mundo 5: Internacional (último mundo)
