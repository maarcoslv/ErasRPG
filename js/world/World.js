/*
 * World.js — Contenedor del mundo: mapa, objetos, NPC y criaturas.
 * Responde a "¿esta zona está bloqueada?" y "¿qué se puede interactuar?".
 */
(function () {
  'use strict';
  var RPG = window.RPG;
  var CELL = 64;   // tamaño de celda del índice espacial de colisiones

  class World {
    constructor(data) {
      this.id = data.id;
      this.map = new RPG.GameMap(data);
      this.objects = RPG.createObjects(data.objects);
      this.npcs = data.npcs.map(function (n) { return new RPG.NPC(n); });
      this.creatures = data.creatures.map(function (c) { return new RPG.Creature(c); });
      this.spawn = data.spawn;
      this.player = null;
      this._buildIndex();
      this._buildInteractables();
    }

    _buildIndex() {
      var self = this;
      this.colliders = [];
      this._grid = {};
      this.objects.forEach(function (o) { if (o.collider) self._addCollider(o.collider); });
      this.npcs.forEach(function (n) { self._addCollider(n.box()); });
    }

    _addCollider(r) {
      this.colliders.push(r);
      var x0 = Math.floor(r.x / CELL), x1 = Math.floor((r.x + r.w) / CELL);
      var y0 = Math.floor(r.y / CELL), y1 = Math.floor((r.y + r.h) / CELL);
      for (var cy = y0; cy <= y1; cy++)
        for (var cx = x0; cx <= x1; cx++) {
          var k = cy * 4096 + cx;
          (this._grid[k] || (this._grid[k] = [])).push(r);
        }
    }

    _buildInteractables() {
      var list = [];
      this.objects.forEach(function (o) {
        if (!o.interact) return;
        list.push({
          kind: 'object', id: o.id, ref: o,
          x: o.x, y: o.y + (o.interact.dy || 0),
          range: o.interact.range, label: o.interact.label,
          dialogue: o.interact.dialogue, bubble: o.interact.bubble || -50
        });
      });
      this.npcs.forEach(function (n) {
        list.push({
          kind: 'npc', id: n.id, ref: n,
          x: n.x, y: n.y, range: n.range, label: n.label,
          dialogue: n.dialogue, bubble: -62
        });
      });
      this.interactables = list;
    }

    /** ¿El rectángulo choca con el límite del mapa, el terreno sólido o algún objeto sólido? */
    isBlocked(r) {
      if (!this.map.rectInside(r)) return true;
      if (this.map.rectHitsSolidTile(r)) return true;
      var x0 = Math.floor(r.x / CELL), x1 = Math.floor((r.x + r.w) / CELL);
      var y0 = Math.floor(r.y / CELL), y1 = Math.floor((r.y + r.h) / CELL);
      for (var cy = y0; cy <= y1; cy++)
        for (var cx = x0; cx <= x1; cx++) {
          var bucket = this._grid[cy * 4096 + cx];
          if (!bucket) continue;
          for (var i = 0; i < bucket.length; i++)
            if (RPG.CollisionSystem.overlap(r, bucket[i])) return true;
        }
      return false;
    }

    update(dt) {
      var p = this.player;
      for (var i = 0; i < this.creatures.length; i++) this.creatures[i].update(dt, this, p);
      for (var j = 0; j < this.npcs.length; j++) this.npcs[j].update(dt, this, p);
    }
  }

  RPG.World = World;
})();
