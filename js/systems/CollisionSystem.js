/*
 * CollisionSystem.js — Movimiento con colisiones (ejes separados, para deslizarse por las paredes).
 */
(function () {
  'use strict';
  var RPG = window.RPG;

  RPG.CollisionSystem = {
    overlap: function (a, b) {
      return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
    },

    /** Mueve la entidad (dx, dy) si no choca. Devuelve true si se movió en algún eje. */
    move: function (ent, dx, dy, world) {
      var moved = false;
      if (dx !== 0) {
        ent.x += dx;
        if (world.isBlocked(ent.box())) ent.x -= dx; else moved = true;
      }
      if (dy !== 0) {
        ent.y += dy;
        if (world.isBlocked(ent.box())) ent.y -= dy; else moved = true;
      }
      return moved;
    }
  };
})();
