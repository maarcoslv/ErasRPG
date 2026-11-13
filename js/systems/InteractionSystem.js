/*
 * InteractionSystem.js — Detecta qué objeto/NPC interactuable está más cerca del jugador
 * y lo activa con la tecla E.
 */
(function () {
  'use strict';
  var RPG = window.RPG;

  class InteractionSystem {
    constructor(game) {
      this.game = game;
      this.current = null;   // interactuable seleccionado (o null)
    }

    reset() { this.current = null; }

    update() {
      var g = this.game, p = g.player, best = null, bestD = Infinity;
      var list = g.world.interactables;
      for (var i = 0; i < list.length; i++) {
        var it = list[i];
        var d = Math.hypot(it.x - p.x, it.y - p.y);
        if (d <= it.range && d < bestD) { best = it; bestD = d; }
      }
      this.current = best;
      if (best && g.input.wasPressed('KeyE')) this.activate(best);
    }

    activate(it) {
      var g = this.game;
      var d = RPG.Dialogues.get(it.dialogue, g.flags);
      g.startDialogue(d.speaker, d.lines, function () {
        if (d.flag && !g.flags[d.flag]) {
          g.flags[d.flag] = true;
          g.hud.toast('Objetivo actualizado');
          RPG.Audio.play('achievement');
        }
      });
    }
  }

  RPG.InteractionSystem = InteractionSystem;
})();
