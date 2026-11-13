/*
 * atlas.js — Recortes (rectángulos) de las texturas de BrowserQuest y el sprite del herbívoro.
 * Datos puros. Coordenadas en píxeles de la hoja assets/images/bq/tilesheet.png (escala x2: casilla = 32 px).
 *   x,y,w,h = zona de la hoja · ax,ay = punto de apoyo en los pies dentro del recorte.
 * Arte de BrowserQuest © Little Workshop, licencia CC-BY-SA 3.0 (ver assets/LICENSE-BrowserQuest.txt).
 * El herbívoro (DINO) es dibujo propio de este proyecto, en cuadrícula de píxeles.
 */
(function () {
  'use strict';
  var RPG = window.RPG;

  RPG.ATLAS = {"oak":{"x":388,"y":326,"w":120,"h":162,"ax":57,"ay":152},"palm":{"x":2,"y":2928,"w":102,"h":144,"ax":45,"ay":142},"rockBig":{"x":544,"y":0,"w":96,"h":110,"ax":61,"ay":104},"rockSmall":{"x":544,"y":128,"w":38,"h":32,"ax":16,"ay":32},"rockTiny":{"x":550,"y":326,"w":20,"h":18,"ax":9,"ay":18},"hutA":{"x":516,"y":2944,"w":96,"h":128,"ax":43,"ay":126},"hutB":{"x":4,"y":620,"w":96,"h":128,"ax":43,"ay":126},"bush":{"x":362,"y":490,"w":34,"h":22,"ax":12,"ay":20},"fern":{"x":554,"y":170,"w":16,"h":18,"ax":7,"ay":14},"tuft":[{"x":554,"y":202,"w":14,"h":14,"ax":6,"ay":12},{"x":586,"y":202,"w":14,"h":14,"ax":7,"ay":12},{"x":616,"y":202,"w":14,"h":14,"ax":6,"ay":12}],"flower":[{"x":538,"y":472,"w":12,"h":10,"ax":5,"ay":10},{"x":526,"y":488,"w":12,"h":10,"ax":5,"ay":10},{"x":550,"y":488,"w":12,"h":10,"ax":5,"ay":10}],"fire":[{"x":2,"y":384,"w":28,"h":38,"ax":12,"ay":36},{"x":34,"y":384,"w":28,"h":38,"ax":12,"ay":36},{"x":66,"y":384,"w":28,"h":38,"ax":12,"ay":36}],"player":{"fw":64,"fh":64,"rows":{"atk_right":[0,5],"walk_right":[1,4],"idle_right":[2,2],"atk_up":[3,5],"walk_up":[4,4],"idle_up":[5,2],"atk_down":[6,5],"walk_down":[7,4],"idle_down":[8,2]},"foot":54,"cx":32},"villager":{"fw":48,"fh":48,"frames":2,"foot":44,"cx":24}};

  // Casillas de relleno de la hoja (ids de BrowserQuest, base 1; 20 casillas por fila)
  RPG.TILE_IDS = {
    grass:  [153, 154, 173, 174, 175, 176, 198, 199],
    grassFlowers: [159, 160],
    path:   [11, 12, 13, 14, 31, 32, 33, 34],
    sand:   [299, 300, 319, 320],
    water:  [706, 707, 708, 709]      // 4 fotogramas de agua animada
  };
  RPG.TILESHEET_COLS = 20;

  // Herbívoro del valle: 2 fotogramas de caminar, mirando a la derecha. Letras = paleta.
  RPG.DINO = {
    palette: { o: '#26331f', g: '#6f9a55', h: '#8fbb6f', d: '#4e6b3f', l: '#b5cf8f', y: '#d9b04b', Y: '#a8802d', e: '#101010', w: '#f0f0e6' },
    frames: [["................................", ".........................oooo...", "........................oggggo..", "............o.....o....oggegggo.", "...........oyo.o.oyo.ooggggggggo", "...........oyooyooyooyoogggggggo", "..........oogggyggggoyoogggggggo", ".........oghhhhhhhhhhhogggggooo.", "........oggggggggggggggggggo....", ".......ogggggggggggggggggggo....", "......ooggggggllllggggggggo.....", "ooooooggggllllllllllllgggo......", "gggggggggllllllllllllllgo.......", "oogggggggllllggglllllgggo.......", "..oogggggglllggglllllgggo.......", "....ooooggodggggllggdgggo.......", "........oooddgggoooddgggo.......", "..........oddgggo.oddgggo.......", "...........oodgdo..oodgdo.......", ".............ooo.....ooo........"], ["................................", ".........................oooo...", "........................oggggo..", "............o.....o....oggegggo.", "...........oyo.o.oyo.ooggggggggo", "...........oyooyooyooyoogggggggo", "..........oogggyggggoyoogggggggo", ".........oghhhhhhhhhhhogggggooo.", "........oggggggggggggggggggo....", ".......ogggggggggggggggggggo....", "......ooggggggllllggggggggo.....", "ooooooggggllllllllllllgggo......", "gggggggggllllllllllllllgo.......", "ooggggggglllggglllllllgggo......", "..ooggggggllggglllllllgggo......", "....ooooggooggglllggdogggo......", "........oo.ogggooodddogggo......", "...........ogggo.odddogggo......", "...........odgdo..oooodgdo......", "............ooo.......ooo......."]]
  };
})();
