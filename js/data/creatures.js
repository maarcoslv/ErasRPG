/*
 * creatures.js — Especies de criaturas (datos, no lógica).
 * Para añadir una nueva criatura: define aquí la especie y úsala en el mapa.
 * 'diet' prepara el terreno para comportamientos futuros (herbivore / predator).
 */
(function () {
  'use strict';
  var RPG = window.RPG;

  RPG.SPECIES = {
    herbivoro_valle: {
      name: 'Herbívoro del valle',
      diet: 'herbivore',
      w: 26, h: 12,            // caja de colisión en los pies
      walkSpeed: 26,           // px/s paseando
      runSpeed: 108,           // px/s huyendo
      detectRadius: 120,       // si el jugador entra aquí, huye
      safeRadius: 190,         // deja de huir al superar esta distancia
      wanderRadius: 110,       // radio de paseo alrededor de su punto de origen
      idleMin: 1.5,
      idleMax: 4.5
    }
  };
})();
