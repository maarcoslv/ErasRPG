/*
 * Map.js — Rejilla de terreno (casillas) y consultas de colisión contra el terreno.
 * Solo lógica: no sabe nada de cómo se dibuja.
 */
(function () {
  'use strict';
  var RPG = window.RPG;
  var T = RPG.TILES;

  class GameMap {
    constructor(data) {
      this.id = data.id;
      this.name = data.name;
      this.cols = data.width;
      this.rows = data.height;
      this.tile = data.tile;
      this.ground = data.ground;
      this.pxW = this.cols * this.tile;
      this.pxH = this.rows * this.tile;
    }

    tileAt(tx, ty) {
      if (tx < 0 || ty < 0 || tx >= this.cols || ty >= this.rows) return -1;
      return this.ground[ty * this.cols + tx];
    }

    isSolidTile(t) { return t === T.WATER || t === -1; }

    rectInside(r) {
      return r.x >= 0 && r.y >= 0 && r.x + r.w <= this.pxW && r.y + r.h <= this.pxH;
    }

    rectHitsSolidTile(r) {
      var ts = this.tile;
      var x0 = Math.floor(r.x / ts), x1 = Math.floor((r.x + r.w - 0.001) / ts);
      var y0 = Math.floor(r.y / ts), y1 = Math.floor((r.y + r.h - 0.001) / ts);
      for (var ty = y0; ty <= y1; ty++)
        for (var tx = x0; tx <= x1; tx++)
          if (this.isSolidTile(this.tileAt(tx, ty))) return true;
      return false;
    }
  }

  RPG.GameMap = GameMap;
})();
