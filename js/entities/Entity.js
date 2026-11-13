/*
 * Entity.js — Base de todo lo que se mueve o ocupa sitio en el mundo.
 * (x, y) = punto de los PIES (centro-abajo). La caja de colisión ocupa solo la franja
 * inferior de w x h píxeles, así el jugador puede pasar "por detrás" de árboles y casas.
 * Esa convención sirve igual aunque cambie la perspectiva visual en el futuro.
 */
(function () {
  'use strict';
  var RPG = window.RPG;

  class Entity {
    constructor(x, y, w, h) {
      this.x = x; this.y = y;
      this.w = w; this.h = h;
    }
    box() { return { x: this.x - this.w / 2, y: this.y - this.h, w: this.w, h: this.h }; }
  }

  RPG.Entity = Entity;
})();
