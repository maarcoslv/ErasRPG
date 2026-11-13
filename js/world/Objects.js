/*
 * Objects.js — Objetos estáticos del mundo (árboles, rocas, casas, fogata...).
 * Cada objeto tiene tipo, posición (pies), una caja de colisión opcional y,
 * opcionalmente, una interacción. El dibujo se decide por 'type' en render/Sprites.js.
 */
(function () {
  'use strict';
  var RPG = window.RPG;

  // Tipos que se dibujan "en el suelo", siempre debajo del resto (no necesitan orden por profundidad)
  var FLAT_TYPES = { flower: true, tuft: true, fern: true };

  class WorldObject {
    constructor(d) {
      this.id = d.id;
      this.type = d.type;
      this.x = d.x; this.y = d.y;
      this.variant = d.variant || 0;
      this.collider = d.collider || null;   // {x, y, w, h} en coordenadas de mundo
      this.interact = d.interact || null;   // {dialogue, label, range, dy, bubble}
      this.flat = !!FLAT_TYPES[d.type];
    }
  }

  RPG.createObjects = function (list) {
    return list.map(function (d) { return new WorldObject(d); });
  };
})();
