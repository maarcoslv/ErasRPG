/*
 * Renderer.js — Dibuja el mundo en el canvas.
 * - El terreno se dibuja con "tiles" pre-renderizados a la resolución real de la pantalla.
 * - Entidades y objetos se ordenan por la Y de sus pies (los de abajo tapan a los de arriba).
 * - project(wx, wy) es el ÚNICO punto que convierte coordenadas de mundo a pantalla:
 *   para cambiar de perspectiva (p. ej. isométrica) se modifica aquí y en Sprites.js,
 *   sin tocar la lógica del juego.
 */
(function () {
  'use strict';
  var RPG = window.RPG;
  var C = RPG.CONFIG, T = RPG.TILES, TS = C.TILE, TAU = Math.PI * 2;

  var BASE = {};
  BASE[T.GRASS] = '#5a9a45'; BASE[T.DARK_GRASS] = '#4a8638'; BASE[T.PATH] = '#b59b6a';
  BASE[T.WATER] = '#3b7fb5'; BASE[T.SAND] = '#d8c691';
  var VARIANTS = 4;

  function seeded(seed) {
    var s = seed >>> 0;
    return function () { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; };
  }

  class Renderer {
    constructor(game) {
      this.game = game;
      this.canvas = game.canvas;
      this.ctx = game.ctx;
      this.k = 1;               // píxeles reales por píxel lógico
      this.tiles = null;
      this.camX = 0; this.camY = 0;
      this._list = [];
    }

    resize(cssW, cssH) {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var w = Math.max(1, Math.round(cssW * dpr)), h = Math.max(1, Math.round(cssH * dpr));
      this.canvas.width = w; this.canvas.height = h;
      this.k = w / C.VIEW_W;
      this.tiles = null;        // se regenera a la nueva resolución
    }

    /** Mundo -> pantalla (lógica, antes de escalar). */
    project(wx, wy) { return { x: wx - this.camX, y: wy - this.camY }; }

    /* ---------- tiles de terreno ---------- */
    _buildTiles() {
      var size = Math.ceil(TS * this.k), self = this;
      this.tiles = {};
      [T.GRASS, T.DARK_GRASS, T.PATH, T.WATER, T.SAND].forEach(function (type) {
        var arr = [];
        for (var v = 0; v < VARIANTS; v++) arr.push(self._paintTile(type, v, size));
        self.tiles[type] = arr;
      });
    }

    _paintTile(type, v, size) {
      var cv = document.createElement('canvas'); cv.width = size; cv.height = size;
      var g = cv.getContext('2d'), rnd = seeded(type * 97 + v * 31 + 7), i;
      g.scale(size / TS, size / TS);
      g.fillStyle = BASE[type]; g.fillRect(0, 0, TS, TS);
      g.lineCap = 'round';

      if (type === T.GRASS || type === T.DARK_GRASS) {
        for (i = 0; i < 14; i++) {
          g.strokeStyle = rnd() < 0.5 ? 'rgba(255,255,255,.10)' : 'rgba(0,40,0,.14)';
          g.lineWidth = 1;
          var x = rnd() * TS, y = rnd() * TS;
          g.beginPath(); g.moveTo(x, y); g.lineTo(x + (rnd() - 0.5) * 3, y - 2 - rnd() * 3); g.stroke();
        }
      } else if (type === T.PATH) {
        for (i = 0; i < 9; i++) {
          g.fillStyle = rnd() < 0.5 ? '#a38a5b' : '#c8b383';
          g.beginPath(); g.ellipse(rnd() * TS, rnd() * TS, 1 + rnd() * 2, 1 + rnd() * 1.4, 0, 0, TAU); g.fill();
        }
      } else if (type === T.WATER) {
        g.strokeStyle = 'rgba(255,255,255,.10)'; g.lineWidth = 1.2;
        for (i = 0; i < 3; i++) {
          var wx = rnd() * 20, wy = 4 + rnd() * 24;
          g.beginPath(); g.moveTo(wx, wy); g.quadraticCurveTo(wx + 5, wy - 2, wx + 10, wy); g.stroke();
        }
      } else if (type === T.SAND) {
        for (i = 0; i < 10; i++) {
          g.fillStyle = rnd() < 0.5 ? '#c9b67e' : '#e7d8a8';
          g.fillRect(rnd() * TS, rnd() * TS, 1.5, 1.5);
        }
      }
      return cv;
    }

    /* ---------- fotograma ---------- */
    render() {
      var g = this.game, ctx = this.ctx, k = this.k, cam = g.camera, world = g.world;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = '#10161a';
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      if (!world) return;
      if (!this.tiles) this._buildTiles();

      // La cámara se redondea a píxel real para que terreno y entidades coincidan sin costuras
      this.camX = Math.round(cam.x * k) / k;
      this.camY = Math.round(cam.y * k) / k;

      var pack = RPG.TexturePack && RPG.TexturePack.active() ? RPG.TexturePack : null;
      if (pack) {
        pack.drawGround(ctx, world.map, this.camX, this.camY, k, g.time);   // texturas BrowserQuest
      } else {
        this._drawGround(world.map);                                        // respaldo procedural
        ctx.setTransform(k, 0, 0, k, 0, 0);
        this._drawWaterShimmer(world.map, g.time);
      }
      ctx.setTransform(k, 0, 0, k, 0, 0);
      ctx.imageSmoothingEnabled = !pack;   // pixel art nítido (sin suavizado)
      this._drawEntities(world, g);
    }

    _drawGround(map) {
      var ctx = this.ctx, k = this.k, camX = this.camX, camY = this.camY;
      var tx0 = Math.max(0, Math.floor(camX / TS)), tx1 = Math.min(map.cols - 1, Math.floor((camX + C.VIEW_W) / TS));
      var ty0 = Math.max(0, Math.floor(camY / TS)), ty1 = Math.min(map.rows - 1, Math.floor((camY + C.VIEW_H) / TS));
      for (var ty = ty0; ty <= ty1; ty++) {
        var dy0 = Math.round((ty * TS - camY) * k), dy1 = Math.round(((ty + 1) * TS - camY) * k);
        for (var tx = tx0; tx <= tx1; tx++) {
          var dx0 = Math.round((tx * TS - camX) * k), dx1 = Math.round(((tx + 1) * TS - camX) * k);
          var type = map.tileAt(tx, ty);
          var v = ((tx * 7 + ty * 13) ^ (tx * ty)) & (VARIANTS - 1);
          ctx.drawImage(this.tiles[type][v], dx0, dy0, dx1 - dx0, dy1 - dy0);
        }
      }
    }

    _drawWaterShimmer(map, time) {
      var ctx = this.ctx, camX = this.camX, camY = this.camY;
      var tx0 = Math.max(0, Math.floor(camX / TS)), tx1 = Math.min(map.cols - 1, Math.floor((camX + C.VIEW_W) / TS));
      var ty0 = Math.max(0, Math.floor(camY / TS)), ty1 = Math.min(map.rows - 1, Math.floor((camY + C.VIEW_H) / TS));
      ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 1.5; ctx.lineCap = 'round';
      for (var ty = ty0; ty <= ty1; ty++)
        for (var tx = tx0; tx <= tx1; tx++) {
          if (map.tileAt(tx, ty) !== T.WATER || (tx * 5 + ty * 3) % 3 !== 0) continue;
          var ox = tx * TS - camX + 6, oy = ty * TS - camY + 16 + Math.sin(time * 1.6 + tx + ty) * 3;
          ctx.beginPath(); ctx.moveTo(ox, oy); ctx.quadraticCurveTo(ox + 7, oy - 3, ox + 14, oy); ctx.stroke();
        }
    }

    _drawEntities(world, g) {
      var ctx = this.ctx, camX = this.camX, camY = this.camY, time = g.time, i, o, p;
      var minY = camY - 40, maxY = camY + C.VIEW_H + 120;
      var minX = camX - 80, maxX = camX + C.VIEW_W + 80;
      var objs = world.objects, list = this._list;
      list.length = 0;

      // 1) decoración plana (suelo)
      for (i = 0; i < objs.length; i++) {
        o = objs[i];
        if (!o.flat || o.x < minX || o.x > maxX || o.y < minY || o.y > maxY) continue;
        p = this.project(o.x, o.y);
        ctx.save(); ctx.translate(p.x, p.y); RPG.Sprites.drawObject(ctx, o, time); ctx.restore();
      }

      // 2) el resto, ordenado por profundidad
      for (i = 0; i < objs.length; i++) {
        o = objs[i];
        if (o.flat || o.x < minX || o.x > maxX || o.y < minY || o.y > maxY) continue;
        list.push({ y: o.y, kind: 0, ref: o });
      }
      for (i = 0; i < world.npcs.length; i++) list.push({ y: world.npcs[i].y, kind: 1, ref: world.npcs[i] });
      for (i = 0; i < world.creatures.length; i++) {
        var c = world.creatures[i];
        if (c.x >= minX && c.x <= maxX && c.y >= minY && c.y <= maxY) list.push({ y: c.y, kind: 2, ref: c });
      }
      if (g.state !== 'menu' && g.player) list.push({ y: g.player.y, kind: 3, ref: g.player });
      list.sort(function (a, b) { return a.y - b.y; });

      for (i = 0; i < list.length; i++) {
        var e = list[i], r = e.ref;
        p = this.project(r.x, r.y);
        ctx.save(); ctx.translate(p.x, p.y);
        if (e.kind === 0) RPG.Sprites.drawObject(ctx, r, time);
        else if (e.kind === 1) RPG.Sprites.drawNPC(ctx, r);
        else if (e.kind === 2) RPG.Sprites.drawCreature(ctx, r);
        else RPG.Sprites.drawPlayer(ctx, r);
        ctx.restore();
      }
    }
  }

  RPG.Renderer = Renderer;
})();
