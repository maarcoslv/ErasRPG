/*
 * NPC.js — Personaje no jugable estático. Se gira hacia el jugador cuando está cerca.
 */
(function () {
  'use strict';
  var RPG = window.RPG;

  class NPC extends RPG.Entity {
    constructor(data) {
      super(data.x, data.y, 16, 10);
      this.id = data.id;
      this.name = data.name;
      this.dialogue = data.dialogue;
      this.label = data.label;
      this.range = data.range || 56;
      this.dir = 'down';
    }

    update(dt, world, player) {
      var dx = player.x - this.x, dy = player.y - this.y;
      if (Math.hypot(dx, dy) < 120) {
        this.dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'left' : 'right') : (dy < 0 ? 'up' : 'down');
      }
    }
  }

  RPG.NPC = NPC;
})();
